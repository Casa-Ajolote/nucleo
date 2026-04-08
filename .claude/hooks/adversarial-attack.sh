#!/usr/bin/env bash
# ============================================================
# Forge — Adversarial Attack Engine
# ============================================================
# Lanza Codex multi-agente con 4 agentes atacantes que intentan
# ROMPER el código activamente. Genera un Attack Report.
#
# Uso: .claude/hooks/adversarial-attack.sh <ATTACK_ID> <OUTPUT_FILE> [SCOPE]
#
# Env vars:
#   REVIEW_LOOP_CODEX_FLAGS  Override de flags de codex
# ============================================================

set -euo pipefail

ATTACK_ID="${1:?Error: ATTACK_ID requerido}"
OUTPUT_FILE="${2:?Error: OUTPUT_FILE requerido}"
SCOPE="${3:-}"

LOG_FILE=".claude/adversarial.log"

log() {
  mkdir -p "$(dirname "$LOG_FILE")"
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $*" >> "$LOG_FILE"
}

trap 'log "ERROR: script abortó en línea $LINENO"; exit 1' ERR

# ============================================================
# Validaciones
# ============================================================
if ! command -v codex &> /dev/null; then
  echo "ERROR: Codex CLI no instalado. Ejecuta: npm install -g @openai/codex" >&2
  exit 1
fi

CODEX_CONFIG="${HOME}/.codex/config.toml"
if [ ! -f "$CODEX_CONFIG" ] || ! grep -qE '^\s*multi_agent\s*=\s*true' "$CODEX_CONFIG"; then
  echo "ERROR: multi_agent no habilitado en ~/.codex/config.toml" >&2
  exit 1
fi

# ============================================================
# Detección de stack
# ============================================================
IS_NEXTJS=false
HAS_UI=false
HAS_SUPABASE=false

detect_nextjs() {
  [ -f "next.config.js" ] || [ -f "next.config.mjs" ] || [ -f "next.config.ts" ] || \
    ([ -f "package.json" ] && grep -q '"next"' package.json 2>/dev/null)
}

detect_browser_ui() {
  [ -d "app" ] || [ -d "pages" ] || [ -d "src/app" ] || [ -d "src/pages" ] || \
    [ -d "public" ] || [ -f "index.html" ]
}

detect_supabase() {
  [ -f "package.json" ] && grep -q '"@supabase' package.json 2>/dev/null
}

detect_nextjs && IS_NEXTJS=true
detect_browser_ui && HAS_UI=true
detect_supabase && HAS_SUPABASE=true

log "Stack: nextjs=$IS_NEXTJS, ui=$HAS_UI, supabase=$HAS_SUPABASE"

# ============================================================
# Prompt adversarial multi-agente
# ============================================================
build_adversarial_prompt() {
  local SCOPE_CONTEXT=""
  if [ -n "$SCOPE" ]; then
    SCOPE_CONTEXT="ALCANCE DEL ATAQUE: Enfócate principalmente en: ${SCOPE}"
  fi

  cat << PREAMBLE_EOF
Eres el orquestador de un equipo de penetration testing y chaos engineering.
Tu objetivo es ROMPER este código. No busques calidad — busca VULNERABILIDADES.

${SCOPE_CONTEXT}

Usa multi-agent para lanzar los siguientes agentes atacantes EN PARALELO.
Cada agente debe retornar hallazgos como texto estructurado (no escribir archivos intermedios).
Después de que TODOS terminen, consolida y escribe el Attack Report en: ${OUTPUT_FILE}

IMPORTANTE: Cada agente INTENTA explotar activamente. Si un vector NO funciona,
reportarlo como "Vector probado — resistido" (esto demuestra cobertura).

PREAMBLE_EOF

  cat << 'INTRUSO_EOF'
---
AGENTE 1: El Intruso (Seguridad Ofensiva)

Tu rol: penetration tester senior. Intenta comprometer la aplicación.

Vectores de ataque:
1. INYECCIÓN: SQL injection en queries, XSS en inputs renderizados, command injection en exec/spawn,
   template injection, path traversal (../../etc/passwd), header injection
2. AUTENTICACIÓN: Bypass de auth middleware, session fixation, JWT manipulation, privilege escalation,
   IDOR (acceder recursos de otro usuario cambiando IDs), forced browsing a rutas protegidas
3. CSRF/SSRF: Formularios sin token CSRF, Server-Side Request Forgery via URL inputs,
   open redirect (redirect=https://evil.com)
4. EXPOSICIÓN: Secrets en código/logs/error messages, API keys hardcoded, .env en público,
   stack traces en producción, source maps en prod
5. UPLOAD: File upload sin validación de tipo, zip bombs, SVG con JavaScript, path traversal en filenames
6. API ABUSE: Rate limiting ausente, mass assignment (enviar campos extra en POST),
   GraphQL introspection habilitada

Para cada hallazgo:
[SEVERIDAD] Título
Vector: Descripción técnica del ataque
Archivo: ruta/archivo.ts línea X
Impacto: Qué podría lograr un atacante
Reproducción: Pasos exactos para explotar
Fix: Solución concreta
INTRUSO_EOF

  cat << 'CAOS_EOF'
---
AGENTE 2: El Caos (Chaos Engineering)

Tu rol: chaos engineer. Identifica cómo el sistema falla bajo condiciones adversas.

Vectores de ataque:
1. RACE CONDITIONS: Doble submit de formularios, compra simultánea del último item,
   TOCTOU (Time-of-check-to-time-of-use), concurrent writes al mismo registro
2. CASCADAS: Qué pasa si Supabase responde en 30s? Si la API de pagos está caída?
   Si el proveedor de AI tiene timeout? Retry storms, timeout propagation
3. RECURSOS: Memory leaks en subscriptions/listeners no limpiados, connection pool exhaustion,
   queries sin LIMIT que traen 100K rows, archivos grandes que crashean el browser
4. CONSISTENCIA: Datos huérfanos si un paso intermedio falla,
   estado stale en Zustand, cache invalidation incorrecta, optimistic updates que divergen
5. CONCURRENCIA: Múltiples tabs con la misma sesión, websocket reconnection,
   service worker sirviendo datos stale

Para cada hallazgo:
[SEVERIDAD] Título
Escenario: Condiciones adversas que lo provocan
Archivo: ruta/archivo.ts línea X
Impacto: Consecuencia para usuario/datos
Probabilidad: ALTA/MEDIA/BAJA en producción
Fix: Solución concreta (retry, circuit breaker, transaction, lock, etc.)
CAOS_EOF

  cat << 'DESTRUCTOR_EOF'
---
AGENTE 3: El Destructor (Edge Cases Extremos)

Tu rol: QA adversarial. Encuentra los inputs que hacen crashear todo.

Vectores de ataque:
1. BOUNDARIES: 0, -1, -0, NaN, Infinity, MAX_SAFE_INTEGER+1, cadena vacía "",
   null, undefined, [], {}, false vs falsy, "0" vs 0, "null" vs null
2. STRINGS: Unicode astral plane, RTL characters, zero-width joiners,
   emoji combinados, strings de 1MB, solo whitespace, NULL bytes (\x00)
3. DATES: 29 de febrero, DST transitions, epoch 0, año 2038,
   "Invalid Date", formatos mixtos
4. ARRAYS/OBJECTS: Array con 1M elementos, anidamiento profundo (100 niveles),
   prototype pollution (__proto__, constructor.prototype), arrays sparse, mixed-type
5. FORMATOS: Email con + y subdomain, URLs con punycode,
   nombres con apóstrofes (O'Brien), SQL en nombres (Robert'; DROP TABLE--)
6. ARCHIVOS: 0 bytes, 5GB, nombre con ../../../, extensión doble (.jpg.exe),
   MIME vs extensión mismatch

Para cada hallazgo:
[SEVERIDAD] Título
Input: Valor exacto que causa el problema
Archivo: ruta/archivo.ts línea X
Comportamiento actual: Qué pasa
Comportamiento esperado: Qué debería pasar
Fix: Validación o manejo correcto
DESTRUCTOR_EOF

  if [ "$HAS_UI" = "true" ]; then
    cat << 'SABOTEADOR_EOF'
---
AGENTE 4: El Saboteador (UX Maliciosa)

Tu rol: usuario malicioso que intenta romper la interfaz.

Vectores de ataque:
1. CLICKS: Doble-click en botón de pago/submit, click rápido en toggle,
   click durante animación, spam refresh
2. NAVEGACIÓN: Back button durante checkout multi-paso, refresh en form wizard,
   deep link a ruta que requiere setup previo, abrir misma página en 5 tabs
3. SESIÓN: Token expirado durante form submit, logout en otra tab,
   manipular localStorage/cookies via DevTools, borrar session storage
4. FORMULARIOS: Paste de HTML en campo de texto, autocomplete con datos viejos,
   submit con JS deshabilitado, modificar hidden inputs via DevTools
5. VIEWPORT: Rotar dispositivo durante modal, zoom 500%, pantalla 320px con tabla,
   print mode con datos sensibles
6. NETWORK: 3G lento con imágenes pesadas, offline durante submit,
   100 items en lista infinita sin virtualización

Para cada hallazgo:
[SEVERIDAD] Título
Acción: Secuencia exacta del usuario
Archivo: ruta/componente.tsx línea X
Resultado actual: Qué pasa (crash, doble cobro, datos perdidos)
Resultado esperado: Comportamiento correcto
Fix: Solución (debounce, guard, loading state, etc.)
SABOTEADOR_EOF
  fi

  if [ "$IS_NEXTJS" = "true" ]; then
    cat << 'NEXTJS_EOF'

CONTEXTO ADICIONAL PARA TODOS LOS AGENTES (Next.js stack):
- Server Actions: verificar validación Zod, que no expongan data sensible en errores, mass assignment
- Middleware: verificar bypass con encoded paths o rutas alternativas
- API Routes: rate limiting, CORS, método HTTP correcto
- Client Components: que no importen secrets o server-only code
- ISR/Cache: que datos sensibles no se cacheen públicamente
NEXTJS_EOF
  fi

  if [ "$HAS_SUPABASE" = "true" ]; then
    cat << 'SUPA_EOF'

VECTORES SUPABASE ADICIONALES:
- RLS: tablas sin RLS? Policies con security definer que exponen data?
- Direct API: acceder /rest/v1/tabla con anon key?
- Storage: buckets públicos con data sensible?
- Realtime: subscripciones que filtran data cross-tenant?
- Auth: email enumeration? OAuth redirect manipulation?
SUPA_EOF
  fi

  cat << CONSOLIDATION_EOF
---
INSTRUCCIONES DE CONSOLIDACIÓN (después de que todos los agentes terminen):

1. Eliminar hallazgos duplicados entre agentes
2. Clasificar por severidad: CRÍTICO > ALTO > MEDIO > BAJO
3. Contar vectores probados vs vulnerabilidades encontradas
4. Calcular Resilience Score (0-100): 100 - (criticos*25 + altos*10 + medios*3 + bajos*1), min 0
5. Escribir Attack Report en: ${OUTPUT_FILE}

Formato del reporte:

\`\`\`
# Adversarial Attack Report — $(date -u +"%Y-%m-%d %H:%M UTC")

## Resilience Score: X/100

## Attack Surface Summary

| Categoría | Vectores Probados | Vulnerabilidades | Críticas |
|-----------|-------------------|------------------|----------|
| El Intruso (Seguridad) | N | N | N |
| El Caos (Resilience) | N | N | N |
| El Destructor (Edge Cases) | N | N | N |
| El Saboteador (UX) | N | N | N |
| **TOTAL** | **N** | **N** | **N** |

## CRÍTICOS (explotar = impacto inmediato)
[hallazgos]

## ALTOS (explotar = impacto significativo)
[hallazgos]

## MEDIOS (explotar con esfuerzo = impacto moderado)
[hallazgos]

## BAJOS (hardening recomendado)
[hallazgos]

## Vectores Resistidos
[Lista de ataques que el código manejó correctamente]
\`\`\`
CONSOLIDATION_EOF
}

# ============================================================
# Ejecución
# ============================================================
CODEX_FLAGS="${REVIEW_LOOP_CODEX_FLAGS:---dangerously-bypass-approvals-and-sandbox}"
ADVERSARIAL_PROMPT=$(build_adversarial_prompt)

AGENT_COUNT=3
[ "$HAS_UI" = "true" ] && AGENT_COUNT=4

echo "" >&2
echo "╔══════════════════════════════════════════════════════════╗" >&2
echo "║           ADVERSARIAL REVIEW — Attack Mode               ║" >&2
echo "╠══════════════════════════════════════════════════════════╣" >&2
echo "║  Attack ID: ${ATTACK_ID}                         ║" >&2
echo "║                                                          ║" >&2
echo "║  Agente 1: El Intruso (seguridad ofensiva)               ║" >&2
echo "║  Agente 2: El Caos (chaos engineering)                   ║" >&2
echo "║  Agente 3: El Destructor (edge cases extremos)           ║" >&2
[ "$HAS_UI" = "true" ] && \
echo "║  Agente 4: El Saboteador (UX maliciosa)                  ║" >&2
echo "║                                                          ║" >&2
echo "║  ${AGENT_COUNT} agentes atacando...                                ║" >&2
echo "╚══════════════════════════════════════════════════════════╝" >&2
echo "" >&2

START_TIME=$(date +%s)
CODEX_EXIT=0

log "Iniciando adversarial attack (id=$ATTACK_ID, agents=$AGENT_COUNT, flags=$CODEX_FLAGS)"

codex $CODEX_FLAGS exec "$ADVERSARIAL_PROMPT" >/dev/null 2>&1 || CODEX_EXIT=$?

ELAPSED=$(( $(date +%s) - START_TIME ))
log "Adversarial attack completado (exit=$CODEX_EXIT, elapsed=${ELAPSED}s)"

echo "" >&2
echo "╔══════════════════════════════════════════════════════════╗" >&2
echo "║           ATAQUE COMPLETADO                              ║" >&2
echo "╠══════════════════════════════════════════════════════════╣" >&2
echo "║  Attack ID:  ${ATTACK_ID}                        ║" >&2
echo "║  Duración:   ${ELAPSED}s                                     ║" >&2
echo "║  Agentes:    ${AGENT_COUNT} completados                              ║" >&2
echo "║  Reporte:    ${OUTPUT_FILE}             ║" >&2
echo "╚══════════════════════════════════════════════════════════╝" >&2
echo "" >&2

if [ ! -f "$OUTPUT_FILE" ]; then
  log "ERROR: report file no encontrado: $OUTPUT_FILE"
  echo "ERROR: Codex corrió pero no generó el reporte. Revisa .claude/adversarial.log" >&2
  exit 1
fi

echo "$OUTPUT_FILE"
