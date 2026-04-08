# Template: Script de Setup (setup.sh)

El script se genera dinámicamente basándose en el número de agentes y si usa Supabase.

---

## Template Base

```bash
#!/bin/bash
set -e

# ═══════════════════════════════════════════════════════════
# LA FORJA — Setup de Sandboxes
# Proyecto: {{project_name}}
# Agentes: {{num_agents}}
# Supabase: {{uses_supabase}}
# ═══════════════════════════════════════════════════════════

REPO_DIR=$(cd "$(dirname "$0")/.." && pwd)
CREATED_WORKTREES=()
echo ""
echo "🔨 LA FORJA — Configurando {{num_agents}} sandboxes"
echo "📁 Repo: $REPO_DIR"
echo ""

# ─── Helpers ────────────────────────────────────────────

# Cross-platform sed in-place (macOS usa -i '', Linux usa -i)
sed_inplace() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "$@"
    else
        sed -i "$@"
    fi
}

# Cleanup automático si el script falla a mitad
cleanup_on_error() {
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        echo ""
        echo "❌ Setup falló (exit code: $exit_code). Limpiando worktrees creados..."
        for wt in "${CREATED_WORKTREES[@]}"; do
            if [ -d "$wt" ]; then
                git worktree remove "$wt" --force 2>/dev/null || true
                echo "   🧹 Eliminado: $wt"
            fi
        done
        echo "   Limpieza de emergencia completa."
    fi
}
trap cleanup_on_error EXIT

# ─── Detectar cmux ──────────────────────────────────────

HAS_CMUX=false
if command -v cmux &> /dev/null; then
    HAS_CMUX=true
    echo "✅ cmux detectado — se generarán launch-cmux.sh y monitor-cmux.sh"
fi

# ─── Verificaciones ──────────────────────────────────────

# Verificar git
if ! command -v git &> /dev/null; then
    echo "❌ Git no encontrado. Instálalo primero."
    exit 1
fi

# Verificar Claude CLI
if ! command -v claude &> /dev/null; then
    echo "❌ Claude CLI no encontrado. Instala con: npm install -g @anthropic-ai/claude-code"
    exit 1
fi

{{#if uses_supabase}}
# Verificar Docker
if ! docker info &> /dev/null 2>&1; then
    echo "❌ Docker no está corriendo. Abre Docker Desktop primero."
    exit 1
fi

# Verificar Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI no encontrado. Instala con: brew install supabase/tap/supabase"
    exit 1
fi
{{/if}}

# Verificar que estamos en un repo git
if ! git rev-parse --is-inside-work-tree &> /dev/null 2>&1; then
    echo "❌ No estás dentro de un repositorio git."
    exit 1
fi

# ─── Verificar Recursos ─────────────────────────────────

REQUIRED_RAM_GB=$(({{num_agents}} * 3))
echo "📊 Recursos estimados: ~${REQUIRED_RAM_GB}GB RAM para {{num_agents}} agente(s)"

if [[ "$OSTYPE" == "darwin"* ]]; then
    TOTAL_RAM_GB=$(( $(sysctl -n hw.memsize) / 1073741824 ))
else
    TOTAL_RAM_GB=$(( $(grep MemTotal /proc/meminfo | awk '{print $2}') / 1048576 ))
fi

if [ "$REQUIRED_RAM_GB" -gt "$((TOTAL_RAM_GB * 3 / 4))" ]; then
    echo ""
    echo "⚠️  ADVERTENCIA: Tu sistema tiene ${TOTAL_RAM_GB}GB RAM."
    echo "   ${REQUIRED_RAM_GB}GB estimados para {{num_agents}} agentes puede causar problemas."
    echo "   Considera cerrar aplicaciones pesadas o reducir el número de agentes."
    echo ""
    read -p "¿Continuar de todos modos? (s/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
        echo "Cancelado."
        exit 0
    fi
fi

# ─── Verificar Espacio en Disco ──────────────────────────

echo ""
echo "💾 Verificando espacio en disco..."

# Espacio libre en disco (en GB)
if [[ "$OSTYPE" == "darwin"* ]]; then
    FREE_DISK_GB=$(df -g "$REPO_DIR" | tail -1 | awk '{print $4}')
else
    FREE_DISK_GB=$(df -BG "$REPO_DIR" | tail -1 | awk '{print $4}' | tr -d 'G')
fi

# Tamaño del proyecto (en MB)
PROJECT_SIZE_MB=$(du -sm "$REPO_DIR" 2>/dev/null | awk '{print $1}')
# Estimación conservadora: cada worktree pesa ~20% del proyecto (sin node_modules via symlink)
# + 500MB margen por builds temporales y datos de sesión Claude
ESTIMATED_DISK_MB=$(( (PROJECT_SIZE_MB / 5) * {{num_agents}} + 500 * {{num_agents}} ))
ESTIMATED_DISK_GB=$(( ESTIMATED_DISK_MB / 1024 + 1 ))

echo "   Espacio libre: ${FREE_DISK_GB}GB"
echo "   Estimado necesario: ~${ESTIMATED_DISK_GB}GB (${{{num_agents}}} sandboxes)"

if [ "$ESTIMATED_DISK_GB" -gt "$((FREE_DISK_GB * 3 / 4))" ]; then
    echo ""
    echo "❌ ESPACIO INSUFICIENTE: Necesitas ~${ESTIMATED_DISK_GB}GB pero solo hay ${FREE_DISK_GB}GB libres."
    echo "   Libera espacio o reduce el número de agentes."
    exit 1
fi

# Verificar /tmp de Claude Code (macOS)
CLAUDE_TMP="/private/tmp/claude-$(id -u)"
if [ -d "$CLAUDE_TMP" ]; then
    CLAUDE_TMP_SIZE_MB=$(du -sm "$CLAUDE_TMP" 2>/dev/null | awk '{print $1}')
    CLAUDE_TMP_SIZE_GB=$(( CLAUDE_TMP_SIZE_MB / 1024 ))
    if [ "$CLAUDE_TMP_SIZE_GB" -gt 5 ]; then
        echo ""
        echo "⚠️  ADVERTENCIA: $CLAUDE_TMP ocupa ${CLAUDE_TMP_SIZE_GB}GB."
        echo "   Claude Code acumula datos de sesión aquí. Esto puede llenar el disco."
        echo "   Para limpiar sesiones antiguas: rm -rf $CLAUDE_TMP/*"
        echo ""
        read -p "¿Continuar de todos modos? (s/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
            echo "Cancelado."
            exit 0
        fi
    fi
fi
echo ""

# ─── Crear Worktrees ─────────────────────────────────────

echo "🌿 Creando worktrees..."

{{#each agents}}
if [ -d "$REPO_DIR/../sandbox-{{index}}" ]; then
    echo "   sandbox-{{index}} ya existe, saltando..."
else
    git worktree add "$REPO_DIR/../sandbox-{{index}}" -b {{branch_name}}
    CREATED_WORKTREES+=("$REPO_DIR/../sandbox-{{index}}")
    echo "   ✅ sandbox-{{index}} (branch: {{branch_name}})"
fi
{{/each}}

# ─── Symlink node_modules (evita duplicar ~500MB por sandbox) ──

echo ""
echo "🔗 Enlazando node_modules desde el repo principal..."

if [ -d "$REPO_DIR/node_modules" ]; then
    {{#each agents}}
    SANDBOX_DIR="$REPO_DIR/../sandbox-{{index}}"
    if [ -d "$SANDBOX_DIR/node_modules" ] && [ ! -L "$SANDBOX_DIR/node_modules" ]; then
        echo "   ⚠️  sandbox-{{index}}: node_modules existente (no es symlink), eliminando..."
        rm -rf "$SANDBOX_DIR/node_modules"
    fi
    if [ ! -L "$SANDBOX_DIR/node_modules" ]; then
        ln -s "$REPO_DIR/node_modules" "$SANDBOX_DIR/node_modules"
        echo "   ✅ sandbox-{{index}} → symlink a node_modules principal"
    else
        echo "   sandbox-{{index}} → symlink ya existe, saltando..."
    fi
    {{/each}}
else
    echo "   ⚠️  No se encontró node_modules en el repo principal."
    echo "   Los agentes ejecutarán npm install individualmente (mayor uso de disco)."
fi

{{#if uses_supabase}}
# ─── Configurar Supabase por Sandbox ─────────────────────

echo ""
echo "⚙️  Configurando Supabase por sandbox..."

{{#each agents}}
echo "   Configurando sandbox-{{index}} (puertos {{port_base}}+)..."
cd "$REPO_DIR/../sandbox-{{index}}"

# Cambiar project_id
sed_inplace 's/project_id = ".*"/project_id = "sandbox-{{index}}"/' supabase/config.toml

{{#if (not_first)}}
# Cambiar puertos (sumando {{port_offset}} a los defaults)
sed_inplace 's/port = 54321/port = {{api_port}}/' supabase/config.toml
sed_inplace 's/port = 54322/port = {{db_port}}/' supabase/config.toml
sed_inplace 's/port = 54323/port = {{studio_port}}/' supabase/config.toml
sed_inplace 's/port = 54324/port = {{inbucket_port}}/' supabase/config.toml
sed_inplace 's/shadow_port = 54320/shadow_port = {{shadow_port}}/' supabase/config.toml
sed_inplace 's/port = 54329/port = {{pooler_port}}/' supabase/config.toml
sed_inplace 's/port = 54327/port = {{analytics_port}}/' supabase/config.toml
sed_inplace 's/inspector_port = 8083/inspector_port = {{inspector_port}}/' supabase/config.toml
sed_inplace 's|site_url = "http://localhost:3000"|site_url = "http://localhost:{{dev_port}}"|' supabase/config.toml
{{/if}}

{{/each}}

# ─── Levantar Supabase ───────────────────────────────────

echo ""
echo "🚀 Levantando instancias de Supabase..."
echo "   (Primera vez puede tardar 2-3 min por instancia)"
echo ""

{{#each agents}}
echo "   Levantando sandbox-{{index}}..."
cd "$REPO_DIR/../sandbox-{{index}}"
supabase start > /tmp/supabase-sandbox-{{index}}.log 2>&1

# Extraer keys del output
ANON_KEY_{{index}}=$(supabase status -o env | grep ANON_KEY | cut -d '=' -f2)
SERVICE_KEY_{{index}}=$(supabase status -o env | grep SERVICE_ROLE_KEY | cut -d '=' -f2)

# Crear .env.local
cat > .env.local << ENVEOF
NEXT_PUBLIC_SUPABASE_URL=http://localhost:{{api_port}}
NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY_{{index}}
SUPABASE_SERVICE_ROLE_KEY=$SERVICE_KEY_{{index}}
ENVEOF

echo "   ✅ sandbox-{{index}} corriendo en puerto {{api_port}}"
{{/each}}

# ─── Aplicar migraciones ─────────────────────────────────

echo ""
echo "📦 Aplicando migraciones..."

{{#each agents}}
cd "$REPO_DIR/../sandbox-{{index}}" && supabase db reset > /dev/null 2>&1
echo "   ✅ sandbox-{{index}} migraciones aplicadas"
{{/each}}

{{/if}}

# ─── Resumen ──────────────────────────────────────────────

echo ""
echo "═══════════════════════════════════════════════════════"
echo "🔨 LA FORJA — Setup Completo"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "Worktrees:"
git worktree list
echo ""

{{#if uses_supabase}}
echo "Supabase Dashboards:"
{{#each agents}}
echo "  Sandbox {{index}}: http://localhost:{{studio_port}}"
{{/each}}
echo ""
echo "Inbucket (emails de auth):"
{{#each agents}}
echo "  Sandbox {{index}}: http://localhost:{{inbucket_port}}"
{{/each}}
echo ""
{{/if}}

echo ""
echo "💡 TIP: Para comandos más cortos, puedes crear un alias:"
echo "  alias c='claude --dangerously-skip-permissions'"
echo ""
echo "⚠️  NOTA: --dangerously-skip-permissions permite al agente ejecutar"
echo "   comandos del sistema sin pedir confirmación. Solo usar en sandboxes aislados."
echo ""

if [ "$HAS_CMUX" = true ]; then
    echo "🚀 Siguiente paso: Lanza todos los agentes con cmux"
    echo ""
    echo "  chmod +x \"$REPO_DIR/forja/launch-cmux.sh\" && \"$REPO_DIR/forja/launch-cmux.sh\""
    echo ""
    echo "📊 Monitor con cmux (status + notificaciones):"
    echo "  chmod +x \"$REPO_DIR/forja/monitor-cmux.sh\" && \"$REPO_DIR/forja/monitor-cmux.sh\""
    echo ""
    echo "⌨️  Atajos cmux:"
    echo "  ⌘1-{{num_agents}} → Navegar entre agentes"
    echo "  ⌘I       → Panel de notificaciones"
    echo "  ⌘⇧U      → Saltar a última notificación"
else
    echo "🚀 Siguiente paso: Lanza cada agente en su tab de terminal"
    echo ""
    {{#each agents}}
    echo "Tab {{index}} ({{personality}}):"
    echo "  cd \"$REPO_DIR/../sandbox-{{index}}\""
    echo "  claude --dangerously-skip-permissions \"\$(cat \\\"$REPO_DIR/forja/prompts/sandbox-{{index}}-{{personality_slug}}.md\\\")\""
    echo ""
    {{/each}}
    echo "📊 Monitor de progreso:"
    echo "  chmod +x \"$REPO_DIR/forja/monitor.sh\" && \"$REPO_DIR/forja/monitor.sh\""
fi
echo ""

echo "VS Code (sesión manual):"
echo "  Abre \"$REPO_DIR\" en VS Code"
echo "  Ejecuta Claude Code y usa el prompt de review cuando los sandboxes terminen"
echo ""
echo "═══════════════════════════════════════════════════════"
```

---

## Tabla de Puertos

| Sandbox | API | DB | Studio | Inbucket | Shadow | Pooler | Analytics | Inspector | Dev Server |
|---------|-----|-----|--------|----------|--------|--------|-----------|-----------|------------|
| 1 | 54321 | 54322 | 54323 | 54324 | 54320 | 54329 | 54327 | 8083 | 3000 |
| 2 | 55321 | 55322 | 55323 | 55324 | 55320 | 55329 | 55327 | 8084 | 3001 |
| 3 | 56321 | 56322 | 56323 | 56324 | 56320 | 56329 | 56327 | 8085 | 3002 |
| 4 | 57321 | 57322 | 57323 | 57324 | 57320 | 57329 | 57327 | 8086 | 3003 |
| 5 | 58321 | 58322 | 58323 | 58324 | 58320 | 58329 | 58327 | 8087 | 3004 |

---

## Reglas del Script

1. **Idempotente.** Si un worktree ya existe, lo salta sin error.
2. **Verificaciones primero.** Verifica git, claude CLI, docker, supabase CLI antes de hacer cualquier cosa.
3. **Keys automáticas.** Extrae las API keys de `supabase status` y las escribe en .env.local.
4. **Resumen al final.** Muestra todos los URLs, puertos, y los comandos exactos para lanzar.
5. **El script vive en `forja/setup.sh`** dentro del repo, se commitea.
6. **Cross-platform.** Usa `sed_inplace` en vez de `sed -i ''` para compatibilidad macOS/Linux.
7. **Paths seguros.** Todas las rutas van entrecomilladas para soportar espacios en paths.
8. **Protección de disco.** Verifica espacio libre y tamaño de `/tmp/claude-*` antes de crear worktrees. Aborta si no hay espacio suficiente.
9. **Symlink de node_modules.** Los worktrees comparten `node_modules` del repo principal via symlink. Esto evita duplicar ~500MB por sandbox.
10. **Trap de cleanup.** Si el script falla a mitad, limpia automáticamente los worktrees que ya creó.
11. **Cleanup de /tmp.** El script `cleanup.sh` ofrece limpiar sesiones de Claude Code en `/private/tmp/claude-*/` relacionadas con el proyecto.

---

## Script de Limpieza (cleanup.sh)

También generar un script de limpieza:

```bash
#!/bin/bash
set -e

REPO_DIR=$(cd "$(dirname "$0")/.." && pwd)

echo "🧹 Limpiando sandboxes de La Forja..."

# ─── Limpiar worktrees huérfanos ─────────────────────────
echo "   Podando worktrees huérfanos..."
git worktree prune 2>/dev/null || true

{{#if uses_supabase}}
# Parar Supabase por sandbox (no afecta otros proyectos)
{{#each agents}}
echo "   Parando Supabase de sandbox-{{index}}..."
cd "$REPO_DIR/../sandbox-{{index}}" 2>/dev/null && supabase stop 2>/dev/null || true
{{/each}}
{{/if}}

# Eliminar worktrees
{{#each agents}}
if [ -d "$REPO_DIR/../sandbox-{{index}}" ]; then
    # Eliminar symlink de node_modules primero (evita borrar el original)
    [ -L "$REPO_DIR/../sandbox-{{index}}/node_modules" ] && rm "$REPO_DIR/../sandbox-{{index}}/node_modules"
    git worktree remove "$REPO_DIR/../sandbox-{{index}}" --force 2>/dev/null || true
    echo "   ✅ sandbox-{{index}} eliminado"
fi
{{/each}}

# Eliminar branches
{{#each agents}}
git branch -D {{branch_name}} 2>/dev/null || true
{{/each}}

# ─── Limpiar sesiones de Claude Code en /tmp ─────────────
CLAUDE_TMP="/private/tmp/claude-$(id -u)"
if [ -d "$CLAUDE_TMP" ]; then
    # Buscar directorios de sesión relacionados con este proyecto
    PROJECT_NAME=$(basename "$REPO_DIR")
    CLAUDE_TMP_SIZE_MB=$(du -sm "$CLAUDE_TMP" 2>/dev/null | awk '{print $1}')
    echo ""
    echo "📁 Sesiones de Claude Code en $CLAUDE_TMP: ${CLAUDE_TMP_SIZE_MB}MB total"

    # Buscar sesiones que contengan el nombre del proyecto o sandboxes
    RELATED_DIRS=$(find "$CLAUDE_TMP" -maxdepth 1 -type d -name "*${PROJECT_NAME}*" -o -name "*sandbox*" 2>/dev/null)
    if [ -n "$RELATED_DIRS" ]; then
        RELATED_SIZE_MB=$(echo "$RELATED_DIRS" | xargs du -sm 2>/dev/null | awk '{sum+=$1} END {print sum}')
        echo "   Sesiones relacionadas con '$PROJECT_NAME': ${RELATED_SIZE_MB:-0}MB"
        echo ""
        read -p "   ¿Eliminar sesiones de Claude Code relacionadas? (s/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[SsYy]$ ]]; then
            echo "$RELATED_DIRS" | xargs rm -rf 2>/dev/null || true
            echo "   ✅ Sesiones eliminadas"
        fi
    fi
fi

echo ""
echo "✅ Limpieza completa."
echo ""
echo "Para limpiar TODAS las sesiones de Claude Code (recupera más espacio):"
echo "  rm -rf /private/tmp/claude-$(id -u)/*"
echo ""
echo "Para limpiar imágenes Docker (recupera espacio):"
echo "  docker system prune -a --volumes"
```

---

## Script de Monitoreo (monitor.sh)

También generar un script de monitoreo ligero:

```bash
#!/bin/bash

# LA FORJA — Monitor de Sandboxes
# Muestra el progreso de cada agente autónomo cada 30 segundos.

REPO_DIR=$(cd "$(dirname "$0")/.." && pwd)

while true; do
    clear
    echo "═══════════════════════════════════════════════════════"
    echo "🔨 LA FORJA — Estado de Sandboxes ($(date '+%H:%M:%S'))"
    echo "═══════════════════════════════════════════════════════"
    echo ""

    {{#each agents}}
    SANDBOX_DIR="$REPO_DIR/../sandbox-{{index}}"
    if [ -d "$SANDBOX_DIR" ]; then
        LAST_COMMIT=$(cd "$SANDBOX_DIR" && git log --oneline -1 2>/dev/null || echo "sin commits")
        COMMIT_COUNT=$(cd "$SANDBOX_DIR" && git rev-list --count {{branch_name}} ^main 2>/dev/null || echo "0")
        SANDBOX_SIZE_MB=$(du -sm "$SANDBOX_DIR" 2>/dev/null | awk '{print $1}')

        STATUS="⏳ en progreso"
        [ -f "$SANDBOX_DIR/RESUMEN.md" ] && STATUS="✅ TERMINADO"
        PROBLEMAS=""
        [ -f "$SANDBOX_DIR/PROBLEMAS.md" ] && PROBLEMAS=" ⚠️  hay problemas"
        DISK_WARN=""
        [ "$SANDBOX_SIZE_MB" -gt 2048 ] 2>/dev/null && DISK_WARN=" 🔴 DISCO: ${SANDBOX_SIZE_MB}MB"

        echo "  Sandbox {{index}} ({{personality}}):"
        echo "    Commits: $COMMIT_COUNT | Disco: ${SANDBOX_SIZE_MB}MB | Estado: $STATUS$PROBLEMAS$DISK_WARN"
        echo "    Último: $LAST_COMMIT"
    else
        echo "  Sandbox {{index}}: ❌ worktree no encontrado"
    fi
    echo ""
    {{/each}}

    # ─── Check de disco global ────────────────────────────
    CLAUDE_TMP="/private/tmp/claude-$(id -u)"
    if [ -d "$CLAUDE_TMP" ]; then
        CLAUDE_TMP_SIZE_MB=$(du -sm "$CLAUDE_TMP" 2>/dev/null | awk '{print $1}')
        CLAUDE_TMP_SIZE_GB=$(( CLAUDE_TMP_SIZE_MB / 1024 ))
        echo "  💾 Claude /tmp: ${CLAUDE_TMP_SIZE_MB}MB"
        if [ "$CLAUDE_TMP_SIZE_GB" -gt 5 ]; then
            echo "  🔴 ALERTA: /tmp de Claude supera 5GB (${CLAUDE_TMP_SIZE_GB}GB)"
            echo "     Considera limpiar: rm -rf $CLAUDE_TMP/*"
        fi
        echo ""
    fi

    echo "───────────────────────────────────────────────────────"
    echo "  Ctrl+C para salir | Actualiza cada 30s"
    echo "═══════════════════════════════════════════════════════"
    sleep 30
done
```

---

## Script de Lanzamiento cmux (launch-cmux.sh)

Se genera **solo si el usuario eligió cmux** como terminal. Usa la API de cmux
para crear workspaces, lanzar agentes, y configurar status indicators.

Requiere: `cmux` instalado, `jq` para parsear JSON.

```bash
#!/bin/bash
set -e

# ═══════════════════════════════════════════════════════════
# LA FORJA — Lanzamiento en cmux
# Proyecto: {{project_name}}
# Agentes: {{num_agents}}
# ═══════════════════════════════════════════════════════════

REPO_DIR=$(cd "$(dirname "$0")/.." && pwd)

echo ""
echo "🔨 LA FORJA — Lanzando {{num_agents}} agentes en cmux"
echo ""

# Verificar cmux
if ! command -v cmux &> /dev/null; then
    echo "❌ cmux no encontrado. Instala con: brew install --cask cmux"
    echo "   O usa el flujo manual con tabs de terminal."
    exit 1
fi

# Verificar jq (para parsear JSON de cmux)
if ! command -v jq &> /dev/null; then
    echo "❌ jq no encontrado. Instala con: brew install jq"
    exit 1
fi

# ─── Crear Workspaces ─────────────────────────────────────

{{#each agents}}
echo "  Lanzando sandbox-{{index}} ({{personality}})..."

WS_ID_{{index}}=$(cmux new-workspace \
    --cwd "$REPO_DIR/../sandbox-{{index}}" \
    --command "claude --dangerously-skip-permissions \"\$(cat \\\"$REPO_DIR/forja/prompts/sandbox-{{index}}-{{personality_slug}}.md\\\")\"" \
    --json | jq -r '.id // .workspace_id // .')

cmux rename-workspace --workspace "$WS_ID_{{index}}" "S{{index}}-{{personality}}"
cmux set-status --workspace "$WS_ID_{{index}}" --icon "⏳" --color "yellow" "forja" "Iniciando..."

echo "  ✅ Sandbox {{index}} ({{personality}}) — workspace: $WS_ID_{{index}}"
{{/each}}

# ─── Resumen ──────────────────────────────────────────────

echo ""
echo "═══════════════════════════════════════════════════════"
echo "🔨 Todos los agentes lanzados en cmux"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "⌨️  Navega entre agentes:"
echo "  ⌘1-{{num_agents}} → Saltar al workspace de cada agente"
echo "  ⌘I       → Panel de notificaciones"
echo "  ⌘⇧U      → Saltar a última notificación no leída"
echo ""
echo "📊 Para monitoreo con status en sidebar:"
echo "  chmod +x \"$REPO_DIR/forja/monitor-cmux.sh\" && \"$REPO_DIR/forja/monitor-cmux.sh\""
echo ""
echo "═══════════════════════════════════════════════════════"
```

### Reglas del launch-cmux.sh

1. **Un workspace por agente.** Cada sandbox se lanza en su propio workspace de cmux.
2. **El comando incluye el prompt completo.** Se usa `--command` con el prompt del agente.
3. **Status inicial.** Cada workspace arranca con status "Iniciando..." en amarillo.
4. **Nombres descriptivos.** Los workspaces se renombran a "S[N]-[Personalidad]" para
   identificación rápida en el sidebar de cmux.
5. **Parseo con jq.** Se usa `--json` + `jq` para capturar el workspace ID de forma confiable.
