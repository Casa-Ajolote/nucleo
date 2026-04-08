# Template: Monitor cmux (monitor-cmux.sh)

El script se genera **solo si el usuario eligió cmux** como terminal.
Usa la API de cmux para actualizar status, progress bars, y enviar
notificaciones en el sidebar — reemplazando el polling CLI de `monitor.sh`.

Requiere: `cmux` instalado, `jq` para parsear JSON.

---

## Template

```bash
#!/bin/bash

# ═══════════════════════════════════════════════════════════
# LA FORJA — Monitor cmux
# Proyecto: {{project_name}}
# Agentes: {{num_agents}}
#
# Actualiza status indicators y progress bars en el sidebar
# de cmux cada 30 segundos. Envía notificaciones cuando un
# agente termina o reporta problemas.
# ═══════════════════════════════════════════════════════════

REPO_DIR=$(cd "$(dirname "$0")/.." && pwd)

# Verificar cmux
if ! command -v cmux &> /dev/null; then
    echo "❌ cmux no encontrado. Usa monitor.sh para monitoreo sin cmux."
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo "❌ jq no encontrado. Instala con: brew install jq"
    exit 1
fi

# ─── Tracking de notificaciones ya enviadas ───────────────
# Evita enviar la misma notificación en cada ciclo de polling

{{#each agents}}
NOTIFIED_DONE_{{index}}=false
NOTIFIED_PROBLEMS_{{index}}=false
{{/each}}

# ─── Función de actualización ─────────────────────────────

update_sandbox() {
    local ws_id=$1
    local sandbox_dir=$2
    local personality=$3
    local index=$4
    local notified_done_var="NOTIFIED_DONE_${index}"
    local notified_problems_var="NOTIFIED_PROBLEMS_${index}"

    if [ -z "$ws_id" ]; then
        return
    fi

    if [ ! -d "$sandbox_dir" ]; then
        cmux set-status --workspace "$ws_id" --icon "❌" --color "red" "forja" "Worktree no encontrado"
        return
    fi

    local commit_count=$(cd "$sandbox_dir" && git rev-list --count HEAD ^main 2>/dev/null || echo "0")
    local last_commit=$(cd "$sandbox_dir" && git log --oneline -1 2>/dev/null || echo "sin commits")

    # Estado: TERMINADO
    if [ -f "$sandbox_dir/RESUMEN.md" ]; then
        cmux set-status --workspace "$ws_id" --icon "✅" --color "green" "forja" "Terminado ($commit_count commits)"
        cmux set-progress --workspace "$ws_id" --label "Completado" 1.0

        if [ "${!notified_done_var}" = false ]; then
            cmux notify --title "Sandbox $index terminado" \
                --subtitle "$personality" \
                --body "$commit_count commits — $last_commit" \
                --workspace "$ws_id"
            eval "$notified_done_var=true"
        fi
        return
    fi

    # Estado: CON PROBLEMAS
    if [ -f "$sandbox_dir/PROBLEMAS.md" ] && [ "${!notified_problems_var}" = false ]; then
        cmux set-status --workspace "$ws_id" --icon "⚠️" --color "orange" "forja" "Problemas detectados ($commit_count commits)"
        cmux notify --title "Sandbox $index tiene problemas" \
            --subtitle "$personality" \
            --body "Revisa PROBLEMAS.md" \
            --workspace "$ws_id"
        eval "$notified_problems_var=true"
        return
    fi

    # Estado: EN PROGRESO
    local sandbox_size_mb=$(du -sm "$sandbox_dir" 2>/dev/null | awk '{print $1}')
    local disk_warn=""
    if [ "${sandbox_size_mb:-0}" -gt 2048 ]; then
        disk_warn=" ⚠️${sandbox_size_mb}MB"
        cmux notify --title "Sandbox $index: disco alto" \
            --subtitle "$personality" \
            --body "${sandbox_size_mb}MB — posible npm install o build descontrolado" \
            --workspace "$ws_id"
    fi
    cmux set-status --workspace "$ws_id" --icon "🔨" --color "blue" "forja" "En progreso ($commit_count commits${disk_warn})"
}

# ─── Loop principal ───────────────────────────────────────

echo "🔨 LA FORJA — Monitor cmux activo"
echo "   Actualizando status cada 30s. Ctrl+C para salir."
echo ""

while true; do
    {{#each agents}}
    # Buscar workspace de sandbox-{{index}} por nombre
    WS_{{index}}=$(cmux list-workspaces --json 2>/dev/null | jq -r '.[] | select(.title | contains("S{{index}}")) | .id' | head -1)
    update_sandbox "$WS_{{index}}" "$REPO_DIR/../sandbox-{{index}}" "{{personality}}" {{index}}
    {{/each}}

    # ─── Check de disco global ────────────────────────────
    CLAUDE_TMP="/private/tmp/claude-$(id -u)"
    if [ -d "$CLAUDE_TMP" ]; then
        CLAUDE_TMP_SIZE_MB=$(du -sm "$CLAUDE_TMP" 2>/dev/null | awk '{print $1}')
        CLAUDE_TMP_SIZE_GB=$(( CLAUDE_TMP_SIZE_MB / 1024 ))
        if [ "$CLAUDE_TMP_SIZE_GB" -gt 5 ]; then
            cmux notify --title "ALERTA: /tmp de Claude supera 5GB" \
                --body "${CLAUDE_TMP_SIZE_GB}GB — riesgo de llenar disco. Limpiar: rm -rf $CLAUDE_TMP/*"
        fi
    fi

    # Verificar si todos terminaron
    ALL_DONE=true
    {{#each agents}}
    [ ! -f "$REPO_DIR/../sandbox-{{index}}/RESUMEN.md" ] && ALL_DONE=false
    {{/each}}

    if [ "$ALL_DONE" = true ]; then
        echo ""
        echo "✅ Todos los agentes terminaron."
        echo "   Avísale a tu agente manual para iniciar el review."
        cmux notify --title "LA FORJA — Todos los agentes terminaron" \
            --body "Listo para review y cherry-pick"
        break
    fi

    sleep 30
done
```

---

## Diferencias con monitor.sh

| Aspecto | monitor.sh (terminal manual) | monitor-cmux.sh |
|---------|------------------------------|-----------------|
| Output | `clear` + texto en terminal | Status en sidebar de cmux |
| Notificaciones | Ninguna — polling visual | `cmux notify` con título/body |
| Progreso | Texto "TERMINADO/en progreso" | `cmux set-progress` con barra visual |
| Status | Echo en terminal | `cmux set-status` con icono + color |
| Fin | Loop infinito | Se detiene cuando todos terminan |

---

## Reglas

1. **No enviar notificaciones duplicadas.** Usar variables `NOTIFIED_DONE_N` y
   `NOTIFIED_PROBLEMS_N` para trackear qué notificaciones ya se enviaron.

2. **Buscar workspaces por nombre.** Usa `cmux list-workspaces --json` + `jq`
   para encontrar el workspace de cada sandbox por el prefijo "S[N]" en el título.

3. **Se detiene automáticamente.** Cuando todos los sandboxes tienen `RESUMEN.md`,
   envía una notificación final y termina el loop.

4. **No reemplaza monitor.sh.** Es un archivo separado que solo se genera cuando
   el usuario eligió cmux. `monitor.sh` sigue existiendo para el flujo manual.
