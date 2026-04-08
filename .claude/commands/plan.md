# /plan — Forge Planning Pipeline

Activa el pipeline completo de planificación de La Herrería.

## Qué Hace

1. Lee `.claude/skills/la-herreria/SKILL.md`
2. Detecta el estado del usuario (desde cero, con docs previos, skill específico, retomar)
3. Ejecuta el pipeline secuencial: PDR → Tech Spec → User Stories → Wireframes → UI Prompts → Blueprint
4. Al terminar el Blueprint, propone transición a `/build`

## Cuándo Usar

```
/plan                              → Desde cero (Forge te entrevistará)
/plan tengo una idea para X        → Desde cero con contexto inicial
/plan wireframes                   → Saltar directo al skill de wireframes
/plan blueprint                    → Generar solo el blueprint (con docs previos)
```

## Pre-Check (Silencioso)

Antes de cargar La Herrería, ejecuta esta verificación sin mostrar output al usuario:

```bash
ISSUES=""
[ ! -f CLAUDE.md ] && ISSUES="${ISSUES}CLAUDE.md; "
[ ! -d .claude/skills/la-herreria ] && ISSUES="${ISSUES}La Herreria no encontrada; "
[ ! -f .mcp.json ] && ISSUES="${ISSUES}.mcp.json; "
[ ! -d node_modules ] && ISSUES="${ISSUES}deps no instaladas; "
echo "${ISSUES:-OK}"
```

- Si todo es **"OK"**:
  - Si NO existen documentos de planificación previos (BMC, PDR, BLUEPRINT, etc.) y NO hay un argumento después de `/plan`: mostrar un one-liner antes de continuar:
    ```
    💡 Primera vez? Prueba /onboarding para una guía personalizada de tu proyecto.
    ```
  - Proceder silenciosamente con el Protocolo de Activación.
- Si hay issues:

```
⚠️ Entorno incompleto:
  • [listar issues]

→ Ejecuta /forge-check para diagnosticar y arreglar, o continúa de todas formas.
  ¿Continuar o ejecutar /forge-check primero?
```

Si el usuario quiere continuar: proceder. Si pide `/forge-check`: ejecutar ese comando.

---

## Protocolo de Activación

Al recibir `/plan`:

1. **Cargar el skill** — Leer `.claude/skills/la-herreria/SKILL.md` completo
2. **Detectar estado** — ¿Tiene el usuario documentos previos? ¿Pide un skill específico?
3. **Ejecutar** — Seguir el protocolo del orchestrator en SKILL.md
4. **Al terminar** — Mostrar el mensaje de cierre y sugerir `/build`

## Mensaje de Cierre (al terminar el Blueprint)

```
✅ BLUEPRINT-[nombre].md generado.

Tienes el plan tecnico completo. Siguiente paso:

  /crisol  — Validacion estrategica (7 dimensiones + dashboard ejecutivo)
             Produce: vision, metricas, competencia, pricing, finanzas, OKRs, GTM
             + dashboard interactivo con veredicto go/no-go.
             Recomendado si: >40h de dev, buscar inversion, o presentar a equipo.

  /build   — Ir directo a construir (Build Manual o Modo Forja)
             Recomendado si: ya tienes claridad estrategica o es experimental.

¿Cuál prefieres?
```

## Notas

- **NUNCA saltes pasos** sin confirmar con el usuario
- Si el usuario ya tiene algún documento (PDR, Tech Spec, etc.), detéctalos y empieza desde ahí
- Cada skill genera un archivo `.md` en el directorio raíz del proyecto
- El Blueprint es el output final y el input requerido para `/build`
