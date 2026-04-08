#!/usr/bin/env bash
# ============================================================
# Forge — Review Loop Stop Hook
# ============================================================
# Lifecycle de dos fases:
#   Fase 1 (task):       Claude termina → hook lanza Codex multi-agent → bloquea salida
#   Fase 2 (addressing): Claude aborda el review → hook permite salida
#
# Fail-open: en cualquier error, aprueba la salida (nunca atrapa al usuario).
#
# Env vars:
#   REVIEW_LOOP_CODEX_FLAGS  Override de flags de codex (default: --dangerously-bypass-approvals-and-sandbox)
# ============================================================

LOG_FILE=".claude/review-loop.log"

log() {
  mkdir -p "$(dirname "$LOG_FILE")"
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $*" >> "$LOG_FILE"
}

# Fail-open: en cualquier error inesperado, aprobar salida
trap 'log "ERROR: hook abortó en línea $LINENO"; printf "{\"decision\":\"approve\"}\n"; exit 0' ERR

HOOK_INPUT=$(cat)
STATE_FILE=".claude/review-loop.local.md"

# Sin state file → aprobar salida
if [ ! -f "$STATE_FILE" ]; then
  printf '{"decision":"approve"}\n'
  exit 0
fi

# Parser de campos del frontmatter YAML
parse_field() {
  sed -n "s/^${1}: *//p" "$STATE_FILE" | head -1
}

ACTIVE=$(parse_field "active")
PHASE=$(parse_field "phase")
REVIEW_ID=$(parse_field "review_id")

# Si no está activo → limpiar y aprobar
if [ "$ACTIVE" != "true" ]; then
  rm -f "$STATE_FILE"
  printf '{"decision":"approve"}\n'
  exit 0
fi

# Validar formato del Review ID (prevenir path traversal)
if ! echo "$REVIEW_ID" | grep -qE '^[0-9]{8}-[0-9]{6}-[0-9a-f]{6}$'; then
  log "ERROR: review_id con formato inválido: $REVIEW_ID"
  rm -f "$STATE_FILE"
  printf '{"decision":"approve"}\n'
  exit 0
fi

# Prevenir loop infinito si stop_hook_active=true en fase task
STOP_HOOK_ACTIVE=$(echo "$HOOK_INPUT" | jq -r '.stop_hook_active // false' 2>/dev/null || echo "false")
if [ "$STOP_HOOK_ACTIVE" = "true" ] && [ "$PHASE" = "task" ]; then
  log "WARN: stop_hook_active=true en fase task — abortando para evitar loop"
  rm -f "$STATE_FILE"
  printf '{"decision":"approve"}\n'
  exit 0
fi

# ============================================================
# Detección de stack (Forge siempre es Next.js, pero por robustez)
# ============================================================
detect_nextjs() {
  [ -f "next.config.js" ] || [ -f "next.config.mjs" ] || [ -f "next.config.ts" ] || \
    ([ -f "package.json" ] && grep -q '"next"' package.json 2>/dev/null)
}

detect_browser_ui() {
  [ -d "app" ] || [ -d "pages" ] || [ -d "src/app" ] || [ -d "src/pages" ] || \
    [ -d "public" ] || [ -f "index.html" ]
}

# ============================================================
# Prompt multi-agente para Codex
# ============================================================
build_review_prompt() {
  local REVIEW_FILE="$1"
  local IS_NEXTJS=false
  local HAS_UI=false
  detect_nextjs && IS_NEXTJS=true
  detect_browser_ui && HAS_UI=true

  log "Detección de stack: nextjs=$IS_NEXTJS, browser_ui=$HAS_UI"

  cat << PREAMBLE_EOF
Eres el orquestador de una revisión de código independiente y exhaustiva.

Usa multi-agent para lanzar los siguientes agentes de revisión EN PARALELO.
Cada agente debe retornar sus hallazgos como texto estructurado (no escribir archivos).
Después de que TODOS los agentes terminen, consolida los hallazgos eliminando duplicados
y escribe la revisión consolidada en: ${REVIEW_FILE}

IMPORTANTE: Lanza un agente por cada revisión. Espera a que todos terminen.
Luego deduplica hallazgos solapados y escribe el reporte final.

PREAMBLE_EOF

  cat << 'DIFF_EOF'
---
AGENTE 1: Revisión de Diff (enfocarse SOLO en cambios recientes/no-commiteados)

Evaluar:
- Correctitud de lógica y edge cases no manejados
- Cobertura de tests (¿faltan tests para los cambios?)
- Seguridad OWASP: SQL injection, XSS, CSRF, exposición de secrets, inputs no validados
- Manejo de errores (¿se propagan correctamente?)
- TypeScript: ¿uso de `any`? ¿tipos correctos?
- Performance: queries N+1, assets sin optimizar, re-renders innecesarios

Formato de hallazgo:
[SEVERIDAD] Descripción breve
Archivo: ruta/al/archivo.ts línea X
Problema: descripción técnica
Fix recomendado: solución concreta
DIFF_EOF

  cat << 'HOLISTIC_EOF'
---
AGENTE 2: Revisión Holística (arquitectura, organización, deuda técnica)

Evaluar:
- Arquitectura feature-first: ¿está correctamente colocado el código?
- CLAUDE.md / GEMINI.md: ¿el código sigue el Golden Path del proyecto?
- Nomenclatura: camelCase vars, PascalCase components, UPPER_SNAKE constants, kebab-case files
- DRY: ¿hay duplicación evitable?
- SOLID: ¿componentes con responsabilidad única?
- Archivos >500 líneas o funciones >50 líneas
- Dependencias circulares
- Documentación: ¿funciones complejas sin comentarios?

Formato: igual que Agente 1
HOLISTIC_EOF

  if [ "$IS_NEXTJS" = "true" ]; then
    cat << 'NEXTJS_EOF'
---
AGENTE 3: Revisión Next.js / React (best practices del stack Forge)

Evaluar:
- App Router: ¿Server Components donde corresponde? ¿`use client` solo cuando necesario?
- Data fetching: ¿Server Actions correctamente definidas con `use server`?
- Supabase SSR: ¿usa `@supabase/ssr` con `getAll()`/`setAll()`? ¿`getUser()` en server (nunca `getSession()`)?
- RLS: ¿tablas nuevas tienen Row Level Security habilitado?
- Zod: ¿inputs de usuario validados con esquemas Zod?
- Zustand: ¿estado global justificado o es innecesario?
- Imágenes: ¿usando `next/image` con `alt` text?
- Bundle: ¿imports pesados que deberían ser dynamic imports?
- Hydration: ¿errores potenciales de server/client mismatch?

Formato: igual que Agente 1
NEXTJS_EOF
  fi

  if [ "$HAS_UI" = "true" ]; then
    cat << 'UX_EOF'
---
AGENTE 4: Revisión de UI / UX

Evaluar:
- Estados definidos: ¿cada elemento interactivo tiene hover, active, focus-visible, disabled?
- Loading states: ¿listas y formularios tienen estado de carga?
- Empty states: ¿qué muestra cuando no hay datos?
- Error states: ¿errores presentados al usuario de forma útil?
- Accesibilidad: ¿imágenes con alt? ¿botones con aria-label? ¿contraste suficiente?
- Responsividad: ¿mobile-first? ¿`min-h-[100dvh]` no `min-h-screen`?
- AI Slop: ¿Inter como única fuente? ¿AI-purple/blue como acento? ¿3 cards idénticas?
- Animaciones: ¿solo `transform`/`opacity`? ¿`prefers-reduced-motion` respetado?

Formato: igual que Agente 1
UX_EOF
  fi

  cat << CONSOLIDATION_EOF
---
INSTRUCCIONES DE CONSOLIDACIÓN (después de que todos los agentes terminen):

1. Eliminar hallazgos duplicados entre agentes
2. Ordenar por severidad: CRÍTICO → ALTO → MEDIO → BAJO
3. Escribir reporte consolidado en: ${REVIEW_FILE}

Formato del reporte:
# Code Review — $(date -u +"%Y-%m-%d %H:%M UTC")

## Resumen Ejecutivo
- Hallazgos críticos: N
- Hallazgos altos: N
- Hallazgos medios: N
- Hallazgos bajos: N
- Recomendación: [PROCEDER / PROCEDER CON AJUSTES / PAUSAR Y ARREGLAR CRÍTICOS]

## Hallazgos por Severidad

### 🔴 CRÍTICOS (arreglar antes de continuar)
...

### 🟠 ALTOS (arreglar en esta sesión)
...

### 🟡 MEDIOS (arreglar pronto)
...

### 🟢 BAJOS (polish / mejoras opcionales)
...
CONSOLIDATION_EOF
}

# ============================================================
# Máquina de estados principal
# ============================================================
case "$PHASE" in

  task)
    REVIEW_FILE="reviews/review-${REVIEW_ID}.md"
    mkdir -p reviews
    CODEX_PROMPT=$(build_review_prompt "$REVIEW_FILE")
    CODEX_FLAGS="${REVIEW_LOOP_CODEX_FLAGS:---dangerously-bypass-approvals-and-sandbox}"
    CODEX_EXIT=0
    START_TIME=$(date +%s)

    # Verificar codex disponible
    if ! command -v codex &> /dev/null; then
      log "ERROR: codex no encontrado en PATH"
      rm -f "$STATE_FILE"
      jq -n --arg r "ERROR: Codex CLI no instalado. Ejecuta: npm install -g @openai/codex" \
        '{decision:"block", reason:$r}'
      exit 0
    fi

    # Verificar multi_agent habilitado
    CODEX_CONFIG="${HOME}/.codex/config.toml"
    if [ ! -f "$CODEX_CONFIG" ] || ! grep -qE '^\s*multi_agent\s*=\s*true' "$CODEX_CONFIG"; then
      log "ERROR: multi_agent no habilitado en config.toml"
      rm -f "$STATE_FILE"
      jq -n --arg r "ERROR: Habilita multi_agent en ~/.codex/config.toml:\n[features]\nmulti_agent = true" \
        '{decision:"block", reason:$r}'
      exit 0
    fi

    log "Iniciando Codex multi-agent review (flags: $CODEX_FLAGS)"

    # Visual feedback para el usuario
    echo "" >&2
    echo "╔══════════════════════════════════════════════════════════╗" >&2
    echo "║          🔍 REVIEW LOOP — Codex Multi-Agent             ║" >&2
    echo "╠══════════════════════════════════════════════════════════╣" >&2
    echo "║  Review ID: ${REVIEW_ID}                        ║" >&2
    echo "║  Estado:    Lanzando agentes de revisión...              ║" >&2
    echo "╠══════════════════════════════════════════════════════════╣" >&2
    echo "║                                                          ║" >&2
    [ "$IS_NEXTJS" = "true" ] && AGENT_COUNT=4 || AGENT_COUNT=2
    [ "$HAS_UI" = "true" ] && [ "$IS_NEXTJS" != "true" ] && AGENT_COUNT=3
    [ "$HAS_UI" = "true" ] && [ "$IS_NEXTJS" = "true" ] && AGENT_COUNT=4
    echo "║  🤖 Agente 1: Revisión de Diff (seguridad, lógica)      ║" >&2
    echo "║  🤖 Agente 2: Revisión Holística (arquitectura, DRY)     ║" >&2
    [ "$IS_NEXTJS" = "true" ] && \
    echo "║  🤖 Agente 3: Revisión Next.js/React (SSR, RLS, Zod)    ║" >&2
    [ "$HAS_UI" = "true" ] && \
    echo "║  🤖 Agente ${AGENT_COUNT}: Revisión UI/UX (estados, a11y, slop)    ║" >&2
    echo "║                                                          ║" >&2
    echo "║  ⏳ Esperando que ${AGENT_COUNT} agentes completen...              ║" >&2
    echo "╚══════════════════════════════════════════════════════════╝" >&2
    echo "" >&2

    codex $CODEX_FLAGS exec "$CODEX_PROMPT" >/dev/null 2>&1 || CODEX_EXIT=$?
    ELAPSED=$(( $(date +%s) - START_TIME ))
    log "Codex terminó (exit=$CODEX_EXIT, elapsed=${ELAPSED}s)"

    # Visual feedback de completado
    echo "" >&2
    echo "╔══════════════════════════════════════════════════════════╗" >&2
    echo "║          ✅ REVIEW COMPLETADO                            ║" >&2
    echo "╠══════════════════════════════════════════════════════════╣" >&2
    echo "║  Review ID:  ${REVIEW_ID}                       ║" >&2
    echo "║  Duración:   ${ELAPSED}s                                     ║" >&2
    echo "║  Agentes:    ${AGENT_COUNT} completados                              ║" >&2
    echo "║  Reporte:    ${REVIEW_FILE}              ║" >&2
    echo "╚══════════════════════════════════════════════════════════╝" >&2
    echo "" >&2

    # Transicionar a fase addressing
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' 's/^phase: task$/phase: addressing/' "$STATE_FILE"
    else
      sed -i 's/^phase: task$/phase: addressing/' "$STATE_FILE"
    fi

    # Verificar que el review file fue generado
    if [ ! -f "$REVIEW_FILE" ]; then
      log "ERROR: review file no encontrado: $REVIEW_FILE"
      rm -f "$STATE_FILE"
      jq -n --arg r "ERROR: Codex corrió pero no generó el review file. Revisa .claude/review-loop.log" \
        '{decision:"block", reason:$r}'
      exit 0
    fi

    REASON="Una revisión multi-agente independiente de Codex fue escrita en ${REVIEW_FILE}.

Por favor:
1. Lee el reporte completo
2. Para cada hallazgo, decide de forma independiente si estás de acuerdo
3. Items con los que AGREES: implementa el fix
4. Items con los que DISAGREES: anota brevemente por qué los omites
5. Prioriza los hallazgos CRÍTICOS y ALTOS
6. Cuando hayas abordado todos los items relevantes, puedes parar

Usa tu propio juicio. No aceptes ciegamente cada sugerencia."

    SYS_MSG="Review Loop [${REVIEW_ID}] — Fase 2/2: Aborda el feedback de Codex"
    jq -n --arg r "$REASON" --arg s "$SYS_MSG" \
      '{decision:"block", reason:$r, systemMessage:$s}'
    ;;

  addressing)
    log "Review loop completado (review_id=$REVIEW_ID)"
    rm -f "$STATE_FILE"
    printf '{"decision":"approve"}\n'
    ;;

  *)
    log "WARN: fase desconocida '$PHASE' — limpiando"
    rm -f "$STATE_FILE"
    printf '{"decision":"approve"}\n'
    ;;
esac
