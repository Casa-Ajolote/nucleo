# /cancel-review — Cancelar Review Loop Activo

Cancela un review loop en progreso y limpia el state file.

---

## Protocolo

Verificar si hay un loop activo:

```bash
test -f .claude/review-loop.local.md && echo "ACTIVO" || echo "NINGUNO"
```

Si está activo, leer `.claude/review-loop.local.md` para obtener la fase actual y el review ID.

Luego eliminar el state file:

```bash
rm -f .claude/review-loop.local.md
echo "Review loop cancelado."
```

Reportar: "Review loop cancelado (estaba en fase: X, review ID: Y)"

Si no había loop activo, reportar: "No hay review loop activo."
