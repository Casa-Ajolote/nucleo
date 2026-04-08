---
description: "Diagnóstico de la Fragua — verifica que el entorno esté listo para Forge. Checa MCPs, dependencias, skills, credenciales y archivos críticos."
---

# /forge-check — Diagnóstico de la Fragua

> *"Antes de encender el horno, el herrero verifica que todo esté en su lugar.
>   Sin carbón no hay fuego. Sin yunque no hay forma."*

Ejecuta un diagnóstico completo del entorno Forge y ofrece arreglar lo que falte.

---

## Instrucciones

Ejecuta TODOS los pasos de diagnóstico y luego presenta el reporte unificado.

### Paso 1: Archivos Críticos de Forge

Verificar que `forge` copió correctamente la infraestructura:

```bash
echo "=== ARCHIVOS FORGE ==="
for f in CLAUDE.md package.json next.config.ts src/app/layout.tsx; do
  [ -f "$f" ] && echo "OK:$f" || echo "FAIL:$f"
done
[ -d ".claude" ] && echo "OK:.claude/" || echo "FAIL:.claude/"
[ -d ".claude/commands" ] && echo "OK:.claude/commands/" || echo "FAIL:.claude/commands/"
[ -d ".claude/skills/la-herreria" ] && echo "OK:la-herreria" || echo "FAIL:la-herreria"
[ -d ".claude/prompts" ] && echo "OK:.claude/prompts/" || echo "FAIL:.claude/prompts/"
```

### Paso 2: Configuración MCP

Verificar `.mcp.json` y sus credenciales:

```bash
echo "=== MCP CONFIG ==="
if [ -f ".mcp.json" ]; then
  echo "OK:mcp-file"
  # Core MCPs
  for mcp in playwright next-devtools supabase shadcn; do
    grep -q "\"$mcp\"" .mcp.json && echo "OK:$mcp" || echo "FAIL:$mcp"
  done
  # Credenciales placeholder (sin configurar)
  grep -o 'YOUR_[A-Z_]*' .mcp.json 2>/dev/null || echo "NO_PLACEHOLDERS"
else
  echo "FAIL:mcp-file"
  # Verificar si existe el template para copiar
  [ -f "example.mcp.json" ] && echo "HINT:example.mcp.json encontrado — copia con: cp example.mcp.json .mcp.json"
  [ ! -f "example.mcp.json" ] && echo "WARN:example.mcp.json tampoco existe — ejecuta forge de nuevo"
fi
```

### Paso 3: Dependencias

```bash
echo "=== DEPENDENCIAS ==="
[ -d "node_modules" ] && echo "OK:node_modules" || echo "FAIL:node_modules"
if [ -f "package.json" ]; then
  node -e "
    const p=require('./package.json');
    const d=p.dependencies||{};
    const dd=p.devDependencies||{};
    console.log('next:'+(d.next||'MISSING'));
    console.log('react:'+(d.react||'MISSING'));
    console.log('tailwindcss:'+(dd.tailwindcss||d.tailwindcss||'MISSING'));
    console.log('zod:'+(d.zod||'MISSING'));
    console.log('zustand:'+(d.zustand||'MISSING'));
  " 2>/dev/null || echo "FAIL:package-parse"
fi
```

### Paso 4: Entorno

```bash
echo "=== ENTORNO ==="
git rev-parse --is-inside-work-tree 2>/dev/null && echo "OK:git" || echo "FAIL:git"
lsof -iTCP:3000 -iTCP:3001 -iTCP:3002 -iTCP:3003 -iTCP:3004 -iTCP:3005 -iTCP:3006 -sTCP:LISTEN 2>/dev/null | grep -q LISTEN && echo "OK:devserver" || echo "WARN:devserver-not-running"
```

### Paso 5: Skills

```bash
echo "=== SKILLS ==="
[ -f ".claude/skills/impeccable/SKILL.md" ] && echo "OK:impeccable" || echo "WARN:impeccable"
[ -f ".claude/skills/web-quality/SKILL.md" ] && echo "OK:web-quality" || echo "WARN:web-quality"
[ -f ".claude/skills/la-forja/SKILL.md" ] && echo "OK:la-forja" || echo "WARN:la-forja"
```

### Paso 5.4: Telemetría externa (opcional)

```bash
echo "=== TELEMETRIA ==="
[ -d "$HOME/.claude/tools/claude-usage" ] && echo "OK:claude-usage" || echo "OPT:claude-usage"
```

### Paso 5.5: Hooks

```bash
echo "=== HOOKS ==="
for hook in pre-commit-validation security-scan auto-format test-runner cost-tracker log-tool-usage stop-hook; do
  [ -f ".claude/hooks/${hook}.sh" ] && echo "OK:${hook}" || echo "WARN:${hook}"
done
# Check if hooks are configured
if [ -f ".claude/settings.json" ]; then
  echo "OK:settings.json"
elif [ -f ".claude/example.settings.json" ]; then
  echo "WARN:settings.json-not-configured"
  echo "HINT:Copia con: cp .claude/example.settings.json .claude/settings.json"
else
  echo "WARN:no-settings-template"
fi
```

---

## Paso 6: Presentar Reporte

Con los resultados de los pasos anteriores, genera este reporte:

```
┌─────────────────────────────────────────────────────┐
│         DIAGNOSTICO DE LA FRAGUA                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ARCHIVOS FORGE                                     │
│  [✅/❌] CLAUDE.md (Factory OS)                     │
│  [✅/❌] .claude/ (Asset Library)                   │
│  [✅/❌] .claude/skills/la-herreria/ (Planificacion)│
│  [✅/❌] package.json                               │
│  [✅/❌] next.config.ts                             │
│  [✅/❌] src/app/layout.tsx                         │
│                                                     │
│  MCPs CORE                                          │
│  [✅/❌] .mcp.json existe                           │
│  [✅/❌] Playwright (ojos de la fabrica)            │
│  [✅/❌] Next.js DevTools (quality control)         │
│  [✅/❌] Supabase (manos de la fabrica)             │
│  [✅/❌] shadcn/ui (componentes)                    │
│                                                     │
│  CREDENCIALES                                       │
│  [✅/⚠️] Supabase project-ref                      │
│  [✅/⚠️] Supabase access-token                     │
│  [listado de otros placeholders YOUR_* sin config]  │
│                                                     │
│  DEPENDENCIAS                                       │
│  [✅/❌] node_modules instalados                    │
│  [✅/❌] Next.js [version]                          │
│  [✅/❌] React [version]                            │
│  [✅/❌] Tailwind CSS [version]                     │
│                                                     │
│  ENTORNO                                            │
│  [✅/❌] Git inicializado                           │
│  [✅/⚠️] Dev server corriendo                      │
│                                                     │
│  SKILLS                                             │
│  [✅/⚠️] Impeccable (design quality)               │
│  [✅/⚠️] Web Quality (auditoria web)               │
│  [✅/⚠️] La Forja (ejecucion paralela)             │
│                                                     │
│  TELEMETRIA (opcional)                              │
│  [✅/○] claude-usage (dashboard de tokens/costo)   │
│                                                     │
│  HOOKS                                              │
│  [✅/⚠️] pre-commit-validation (typecheck)         │
│  [✅/⚠️] security-scan (secrets + debug)           │
│  [✅/⚠️] auto-format (Prettier)                    │
│  [✅/⚠️] test-runner (vitest)                      │
│  [✅/⚠️] cost-tracker (usage log)                  │
│  [✅/⚠️] settings.json configurado                 │
│                                                     │
├─────────────────────────────────────────────────────┤
│  RESULTADO: X ✅  Y ❌  Z ⚠️                       │
│  [VEREDICTO]                                        │
└─────────────────────────────────────────────────────┘
```

### Veredictos

- **Todo core ✅**: `La fragua esta encendida y lista. Puedes usar /plan o /build.`
- **Archivos faltantes**: `Archivos Forge faltantes. Ejecuta el alias "forge" para copiar la infraestructura.`
- **Sin .mcp.json**: `MCPs no configurados. Necesitas copiar el template y añadir tus credenciales.`
- **Placeholders Supabase**: `Supabase sin configurar. Necesitas tu project-ref y access-token.`
- **Sin node_modules**: `Dependencias no instaladas. Necesitas ejecutar npm install.`

---

## Paso 7: Ofrecer Arreglos

Para cada ❌ encontrado, ofrecer la accion correctiva:

| Issue | Fix |
|-------|-----|
| `.mcp.json` no existe | Copiar desde `example.mcp.json` → `.mcp.json` |
| Supabase placeholders | Pedir project-ref y access-token al usuario, reemplazar en `.mcp.json` |
| `node_modules` faltante | Ejecutar `npm install` |
| Git no inicializado | Ejecutar `git init` |
| Dev server no corre | Sugerir `npm run dev` (el usuario lo ejecuta) |
| Skills faltantes | Listar como opcional — no bloquean el flujo |
| Hooks no configurados | Copiar `example.settings.json` → `.claude/settings.json` |
| Hooks faltantes | Los hooks se copian con `forge` — si faltan, ejecutar `forge` de nuevo |
| `claude-usage` no instalado (opcional) | `git clone https://github.com/phuryn/claude-usage ~/.claude/tools/claude-usage` — luego `python3 ~/.claude/tools/claude-usage/cli.py dashboard` para ver consumo real |

Preguntar: **"¿Quieres que arregle los issues marcados con ❌?"**

- Si dice si: ejecutar los fixes en orden, uno por uno, confirmando cada resultado
- Si dice no: continuar — el usuario sabe lo que hace

---

## Siguiente Paso

Al terminar, sugerir:

```
Diagnostico completado.

Proximos pasos recomendados:
  /plan     — Planificar tu app (La Herreria)
  /avivar   — Cargar contexto de proyecto existente
  /build    — Construir desde Blueprint existente
```
