# /review-loop — Loop Automático de Revisión de Código

Implementa una tarea, lanza una revisión independiente con Codex (OpenAI) multi-agente,
y luego aborda el feedback — todo automáticamente vía Stop hook.

**Requiere:** `codex` CLI instalado + `OPENAI_API_KEY` configurada.
Ver README sección "Review Loop" para setup.

---

## Protocolo de Ejecución

Al recibir `/review-loop <tarea>`, ejecutar este setup primero:

```bash
set -e

# 1. Verificar dependencias
command -v jq >/dev/null 2>&1 || { echo "Error: jq requerido. brew install jq"; exit 1; }
command -v codex >/dev/null 2>&1 || { echo "Error: Codex CLI no instalado. Ejecuta: npm install -g @openai/codex"; exit 1; }

# 2. Prevenir loops duplicados
if [ -f .claude/review-loop.local.md ]; then
  echo "Error: Ya hay un review loop activo. Usa /cancel-review primero."
  exit 1
fi

# 3. Generar Review ID único
REVIEW_ID="$(date +%Y%m%d-%H%M%S)-$(openssl rand -hex 3 2>/dev/null || head -c 3 /dev/urandom | od -An -tx1 | tr -d ' \n')"

# 4. Habilitar multi-agent en Codex
CODEX_CONFIG="${HOME}/.codex/config.toml"
if [ ! -f "$CODEX_CONFIG" ]; then
  mkdir -p "${HOME}/.codex"
  printf '[features]\nmulti_agent = true\n' > "$CODEX_CONFIG"
  echo "Creado ~/.codex/config.toml con multi_agent habilitado"
elif ! grep -qE '^\s*multi_agent\s*=\s*true' "$CODEX_CONFIG"; then
  if grep -qE '^\[features\]' "$CODEX_CONFIG"; then
    if [ "$(uname)" = "Darwin" ]; then
      sed -i '' '/^\[features\]/a\'$'\n''multi_agent = true' "$CODEX_CONFIG"
    else
      sed -i '/^\[features\]/a multi_agent = true' "$CODEX_CONFIG"
    fi
  else
    printf '\n[features]\nmulti_agent = true\n' >> "$CODEX_CONFIG"
  fi
  echo "multi_agent habilitado en ~/.codex/config.toml"
else
  echo "Codex multi-agent: ya habilitado"
fi

# 5. Registrar Stop hook en .claude/settings.json
mkdir -p .claude
SETTINGS_FILE=".claude/settings.json"
HOOK_CMD=".claude/hooks/stop-hook.sh"

if [ ! -f "$SETTINGS_FILE" ]; then
  echo '{}' > "$SETTINGS_FILE"
fi

# Agregar Stop hook si no existe ya
if ! jq -e '.hooks.Stop' "$SETTINGS_FILE" > /dev/null 2>&1; then
  jq '. + {"hooks": {"Stop": [{"hooks": [{"type": "command", "command": ".claude/hooks/stop-hook.sh", "timeout": 900, "statusMessage": "Review loop: verificando fase..."}]}]}}' \
    "$SETTINGS_FILE" > "${SETTINGS_FILE}.tmp" && mv "${SETTINGS_FILE}.tmp" "$SETTINGS_FILE"
  echo "Stop hook registrado en .claude/settings.json"
else
  echo "Stop hook: ya registrado"
fi

# 6. Crear directorio de reviews
mkdir -p .claude reviews

# 7. Crear state file
cat > .claude/review-loop.local.md << STATE_EOF
---
active: true
phase: task
review_id: ${REVIEW_ID}
started_at: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
---

$ARGUMENTS
STATE_EOF

echo ""
echo "Review Loop activado"
echo "  ID:    ${REVIEW_ID}"
echo "  Fase:  1/2 (implementar)"
echo "  Review: reviews/review-${REVIEW_ID}.md (se genera al terminar)"
echo ""
echo "Implementa la tarea. Al terminar, Codex revisará automáticamente."
```

Después de que el setup complete sin errores, **implementa la tarea descrita en los argumentos**.
Trabaja de forma completa y rigurosa. Escribe código limpio, bien estructurado.

Cuando creas que la tarea está terminada, para. El Stop hook tomará control automáticamente:
1. Lanzará Codex multi-agente para una revisión independiente
2. Te presentará el reporte para que lo abordes

**REGLAS:**
- Completa la tarea al máximo antes de parar
- No pares prematuramente
- No tienes que gestionar el review — el hook lo hace
