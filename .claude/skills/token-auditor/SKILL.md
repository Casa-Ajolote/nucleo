---
name: token-auditor
description: "Audita la eficiencia de tokens del proyecto Forge actual. Ejecuta 8 checks sobre tamaño de contexto, hooks, memoria, logs y patrones de uso, y entrega un Token Efficiency Score (0-100) con los top 5 fixes accionables priorizados por ahorro estimado."
---

# Token Auditor — Eficiencia de Tokens del Proyecto Forge

> *"No puedes optimizar lo que no mides."*

## Propósito

El usuario de Forge rara vez sabe dónde está quemando tokens innecesariamente. Esta skill audita 8 dimensiones del proyecto actual y entrega un reporte accionable con score, hallazgos priorizados y los 5 fixes con mayor retorno.

Esta skill **solo audita el proyecto Forge actual** (portable, versionable). No toca `~/.claude/` global ni hace llamadas externas.

## Cuándo activarse

- Usuario ejecuta `/audit-tokens`
- Usuario pregunta: "¿por qué estoy gastando tantos tokens?", "¿cómo reduzco mi consumo?", "¿mi proyecto es eficiente?"
- Usuario menciona el bug de prompt caching, el cambio de planes de Claude, o artículos sobre ahorro de tokens

## Los 8 Checks

Para cada check: qué leer, qué flagear, ahorro estimado, y remedio concreto.

### Check 1 — Tamaño de `CLAUDE.md`

**Qué leer:** `CLAUDE.md` en la raíz del proyecto.
**Cómo medir:** contar líneas y caracteres. Estimar tokens con `chars / 4`.
**Criterios:**
- 🟢 < 200 líneas o < 3,000 tokens aprox
- 🟡 200-400 líneas o 3,000-5,000 tokens
- 🔴 > 400 líneas o > 5,000 tokens

**Por qué importa:** `CLAUDE.md` se reprocesa en cada turno. Cada 1K tokens extra = ~1K tokens reprocesados por mensaje.
**Ahorro estimado:** recortar 3K tokens en un chat de 20 turnos = 60K tokens ahorrados.
**Fix:** mover contenido extendido a `forge-reference` skill (patrón ya usado en Forge). Dejar solo reglas críticas universales en `CLAUDE.md`.

### Check 2 — Hooks `PostToolUse` con `matcher: "*"`

**Qué leer:** `.claude/settings.json` (si existe) o `.claude/example.settings.json`.
**Cómo medir:** buscar entradas en `PostToolUse` con `"matcher": "*"` o regex que matchean todas las tools.
**Criterios:**
- 🟢 0 hooks con matcher wildcard
- 🟡 1-2 hooks con matcher wildcard
- 🔴 3+ hooks con matcher wildcard

**Por qué importa:** los hooks wildcard corren después de cada tool use. Si escriben mucho a stdout y Claude lo lee, inflan el contexto.
**Fix:** acotar matchers (`Edit|Write`, `Bash(git*)`, etc). Los hooks de audit/log pueden seguir en `*` si solo escriben a archivo, no a stdout.

### Check 3 — Bloat en `.claude/memory/`

**Qué leer:** glob `.claude/memory/**/*.md`.
**Cómo medir:** sumar el tamaño total en bytes. Contar archivos.
**Criterios:**
- 🟢 < 10 KB total
- 🟡 10-30 KB total
- 🔴 > 30 KB total

**Por qué importa:** `/avivar` carga esta memoria al inicio de cada sesión. Memoria grande = contexto inicial pesado = cada turno paga el overhead.
**Fix:** archivar entradas viejas en `.claude/memory/archive/` (no se cargan automáticamente). Mantener solo lecciones activas del proyecto actual.

### Check 4 — Longitud de sesiones en logs

**Qué leer:** `.claude/logs/session-costs.log` (si existe, formato `[timestamp] tool=NAME`).
**Cómo medir:** agrupar por día (`YYYY-MM-DD`), contar entries por día. Identificar el día con más entries.
**Criterios:**
- 🟢 max < 100 entries/día
- 🟡 100-200 entries/día
- 🔴 > 200 entries/día

**Por qué importa:** sesiones largas reprocesan el historial en cada turno. Una sesión de 200+ tool invocations probablemente debió cortarse con `/clear` o `/avivar` en sesión nueva.
**Fix:** cortar sesiones en transiciones naturales (cambio de feature, fase del build). Usar `.claude/memory/` para persistir estado entre sesiones.

### Check 5 — Diversidad de tools

**Qué leer:** mismo log de arriba.
**Cómo medir:** `grep "tool=" | sort | uniq -c | sort -rn`. Calcular % de cada tool sobre el total.
**Criterios:**
- 🟢 ninguna tool >50% del total
- 🟡 una tool 50-70% del total
- 🔴 una tool >70% del total

**Por qué importa:** si `Read` domina >70%, el usuario está usando el contexto principal como buffer de exploración en vez de delegar a subagents (`Agent` con `Explore`).
**Fix:** para exploración inicial, usar `Agent(Explore)`. La salida verbosa se queda en el contexto del subagent y solo vuelve el resumen. Ahorro típico: 40-70% en sesiones de investigación.

### Check 6 — Uso de subagents

**Qué leer:** mismo log.
**Cómo medir:** contar `tool=Agent` / total. Calcular %.
**Criterios:**
- 🟢 ≥ 10% de invocaciones son `Agent`
- 🟡 5-10%
- 🔴 < 5%

**Por qué importa:** delegar outputs verbosos (tests, logs, búsquedas masivas) a subagents aísla tokens. El contexto principal se mantiene ligero.
**Fix:** usar `Agent(Explore)` para búsquedas, agentes especializados (`testing-engineer`, `codebase-analyst`) para tareas con output grande.

### Check 7 — Prompts estáticos grandes

**Qué leer:** `.claude/prompts/*.md`, `.claude/skills/*/SKILL.md`.
**Cómo medir:** encontrar archivos > 500 líneas o > 8,000 tokens.
**Criterios:**
- 🟢 ningún prompt/skill > 500 líneas
- 🟡 1-2 archivos > 500 líneas
- 🔴 3+ archivos > 500 líneas

**Por qué importa:** cada vez que un comando carga un skill, el archivo entero entra al contexto. Un SKILL.md de 1000 líneas = 12-15K tokens solo para empezar la tarea.
**Fix:** dividir en sub-skills (un skill por fase) o mover referencias a un archivo secundario que se carga solo si hace falta (patrón `forge-reference`).

### Check 8 — Aprendizajes de Auto-Blindaje acumulados en `CLAUDE.md`

**Qué leer:** `CLAUDE.md`, buscar secciones "Aprendizajes", "Auto-Blindaje", "Errores conocidos".
**Cómo medir:** contar entradas en esas secciones.
**Criterios:**
- 🟢 ≤ 5 entradas
- 🟡 6-15 entradas
- 🔴 > 15 entradas

**Por qué importa:** Auto-Blindaje es oro, pero si vive en `CLAUDE.md` se reprocesa cada turno. Con >15 entradas, estamos pagando el costo de lecciones que aplican a situaciones raras.
**Fix:** mover a `.claude/memory/LESSONS.md`. El skill `memory-manager` las recupera on-demand cuando el contexto lo pide.

## Cálculo del Score

**Rúbrica:** 8 checks × 12.5 puntos cada uno = 100 puntos total.

- 🟢 óptimo = 12.5 pts
- 🟡 mejorable = 6 pts
- 🔴 crítico = 0 pts

**Rangos finales:**
- **85-100** → 🟢 Excelente. Proyecto bien optimizado.
- **70-84** → 🟡 Bueno. Hay 2-3 fixes fáciles para ganar ~20% de eficiencia.
- **50-69** → 🟠 Mejorable. Al menos un área crítica. Fixes moderados darían 30-50% de ahorro.
- **< 50** → 🔴 Crítico. Múltiples áreas sangran tokens. Plan de acción urgente.

## Formato del reporte

Producir exactamente este template (usar los números reales del proyecto):

```markdown
# 💰 Token Efficiency Audit — [fecha YYYY-MM-DD]

**Score: XX/100** — [🟢 Excelente / 🟡 Bueno / 🟠 Mejorable / 🔴 Crítico]

---

## Hallazgos

| # | Check | Estado | Detalle | Ahorro estimado |
|---|-------|--------|---------|-----------------|
| 1 | CLAUDE.md size | 🔴/🟡/🟢 | [líneas] líneas / ~[X]K tokens | ~[X]% por turno |
| 2 | Hooks wildcard | 🔴/🟡/🟢 | [N] hooks con matcher `*` | ~[X]% en sesiones largas |
| 3 | Memoria | 🔴/🟡/🟢 | [X] KB en N archivos | ~[X]% al iniciar sesión |
| 4 | Sesiones largas | 🔴/🟡/🟢 | max [N] entries/día | ~[X]% por sesión |
| 5 | Diversidad tools | 🔴/🟡/🟢 | [Tool] domina [X]% | ~[X]% en exploración |
| 6 | Uso de subagents | 🔴/🟡/🟢 | [X]% de invocaciones | ~[X]% en tareas verbosas |
| 7 | Prompts estáticos | 🔴/🟡/🟢 | [N] archivos > 500 líneas | ~[X]% al cargar skills |
| 8 | Auto-Blindaje en CLAUDE.md | 🔴/🟡/🟢 | [N] entradas acumuladas | ~[X]% por turno |

---

## 🎯 Top 5 Fixes (priorizados por ahorro)

### 1. [Fix #1 con mayor impacto]
**Archivo:** `path/to/file:line`
**Acción:** [comando exacto o edit concreto]
**Ahorro estimado:** [X]% de tokens por turno / [Y]K tokens/sesión

### 2. [Fix #2]
...

---

## 📋 Resumen ejecutivo

[2-3 líneas: qué está bien, dónde sangra más, cuál es el fix de mayor ROI]

---

## 🔗 Relacionado

- Memoria persistente: `memory-manager` skill
- Delegación a subagents: `Agent(Explore)` para búsquedas, agentes especializados para tareas con output grande

---

## 📊 Telemetría runtime (opcional)

Esta auditoría es **estática** — analiza tu configuración. Para ver tu **consumo real** (tokens gastados, costo en $, histórico por modelo), instala `claude-usage` (Python, sin deps externas):

```bash
git clone https://github.com/phuryn/claude-usage ~/.claude/tools/claude-usage
python3 ~/.claude/tools/claude-usage/cli.py dashboard
```

Abre `localhost:8080` con dashboard de uso por modelo y sesión. Lee los JSONL que Claude Code ya escribe en `~/.claude/projects/` — no requiere ninguna integración con Forge.

Combinación recomendada:
- `/audit-tokens` → **qué arreglar** en tu config
- `claude-usage` → **cuánto estás gastando** en tiempo real
```

## Instrucciones al auditor

1. **Ser directo.** Nada de filler. Cada hallazgo con archivo:línea y acción concreta.
2. **Medir antes de juzgar.** Ejecutar los comandos reales (`wc -l`, `du -sh`, `grep -c`) antes de asignar estado 🔴/🟡/🟢. Si un archivo no existe, marcar 🟢 (nada que optimizar).
3. **Priorizar fixes por ahorro real.** El Top 5 se ordena por % de ahorro estimado × frecuencia (un 10% en cada turno bate un 80% en un edge case).
4. **No inventar métricas.** Si no hay `.claude/logs/session-costs.log`, decirlo: "log no existe — activar `cost-tracker.sh` para habilitar este check en el próximo audit".
5. **Referenciar archivos con paths absolutos** cuando el usuario los tenga que editar.
6. **No modificar nada** — esta skill solo audita. Los fixes los aplica el usuario (o una skill futura de remediación).

## Herramientas a usar

- `Read` para leer `CLAUDE.md`, `.claude/settings.json`, prompts y skills específicos
- `Glob` para `.claude/memory/**/*.md`, `.claude/prompts/*.md`, `.claude/skills/*/SKILL.md`
- `Grep` para buscar patrones en el log y en `CLAUDE.md`
- `Bash` solo para `wc -l`, `du -sh`, `grep -c` cuando sea más eficiente que las tools dedicadas

## Ejemplo de invocación

```
Usuario: /audit-tokens

Claude:
[ejecuta los 8 checks leyendo archivos reales]
[produce el reporte markdown con el template anterior]
[termina con resumen ejecutivo y top 5 fixes priorizados]
```
