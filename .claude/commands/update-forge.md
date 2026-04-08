---
description: "Actualiza Forge a la ultima version. Busca el alias forge, hace git pull y reemplaza la carpeta .claude/"
---

# Update Forge

Este comando actualiza las herramientas de desarrollo (carpeta `.claude/`) a la ultima version disponible.

## Proceso

### Paso 1: Buscar el alias forge

Busca el alias `forge` en los archivos de configuracion del shell del usuario:

```bash
# Buscar en zshrc
grep "alias forge" ~/.zshrc

# Si no esta, buscar en bashrc
grep "alias forge" ~/.bashrc
```

El alias tiene este formato:
```bash
alias forge="cp -r /ruta/al/repo/forge/forge/. ."
```

**Extrae la ruta del repo** del alias (la parte entre `cp -r ` y `/forge/.`).

Si no encuentras el alias, pregunta al usuario:
> No encontre el alias `forge`. Por favor, indica la ruta donde tienes el repositorio de Forge.

### Paso 2: Actualizar el repositorio fuente

Una vez tengas la ruta del repo, actualiza con git:

```bash
cd [RUTA_REPO_FORGE]
git pull origin main
```

Si hay errores de git (cambios locales, etc.), informa al usuario y sugiere solucion.

### Paso 3: Reemplazar .claude/ y actualizar archivos de referencia

Elimina la carpeta `.claude/` actual del proyecto y copia la nueva.
Tambien actualiza `example.mcp.json` (el template de referencia, NO el `.mcp.json` del usuario):

```bash
# En el directorio del proyecto actual
rm -rf .claude/
cp -r [RUTA_REPO_FORGE]/forge/.claude/ .claude/

# Actualizar example.mcp.json (template de referencia — no toca .mcp.json del usuario)
cp [RUTA_REPO_FORGE]/forge/example.mcp.json example.mcp.json
```

### Paso 4: Detectar MCPs nuevos

Compara `example.mcp.json` con `.mcp.json` del usuario para detectar MCPs nuevos que se hayan agregado en la actualizacion:

```bash
# Si el usuario tiene .mcp.json, comparar keys
if [ -f ".mcp.json" ]; then
  echo "Comparando MCPs..."
fi
```

Si hay MCPs nuevos en `example.mcp.json` que no existen en `.mcp.json`, informar:

```
Nuevos MCPs disponibles en esta version:
  • [nombre-mcp] — [descripcion breve]

Para agregarlos, edita .mcp.json o ejecuta /forge-check.
```

Si no hay diferencias o no existe `.mcp.json`: no mostrar nada sobre MCPs.

### Paso 5: Confirmar actualizacion

Informa al usuario:

```
Forge actualizado correctamente.

Cambios aplicados:
- .claude/commands/       (comandos actualizados — /plan, /build, etc.)
- .claude/agents/         (agentes actualizados)
- .claude/PRPs/           (templates de Pieza actualizados)
- .claude/ai_templates/   (bloques LEGO actualizados)
- .claude/design-systems/ (sistemas de diseno actualizados)
- .claude/skills/         (skills actualizados — La Herrería incluido)
- .claude/prompts/        (metodologias actualizadas)
- example.mcp.json        (template MCP actualizado)

Archivos NO modificados:
- CLAUDE.md (tu configuracion de proyecto)
- .mcp.json (tus credenciales — no se toca)
- src/ (tu codigo)
```

Si se detectaron MCPs nuevos, agregar al final:

```
Ejecuta /forge-check para ver si hay nuevos MCPs que quieras configurar.
```

## Notas

- Este comando NO modifica `CLAUDE.md`, `.mcp.json` ni el codigo fuente
- Actualiza `example.mcp.json` (template de referencia) pero NUNCA `.mcp.json` (credenciales del usuario)
- Solo actualiza la "toolbox" de desarrollo (comandos, agentes, skills, templates)
- Si necesitas actualizar `CLAUDE.md` manualmente, revisa el template en el repo Forge
