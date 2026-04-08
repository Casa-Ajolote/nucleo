# /fragua-review — Review de Producto con Mentalidad Founder

> *"Antes de encender la fragua, el maestro cuestiona si está forjando la pieza correcta. No basta con construir bien — hay que construir lo correcto."*

Review de plan/Blueprint con mentalidad de founder. No rubber-stamp — rethink. Busca el producto 10 estrellas escondido dentro del request. Tres modos: EXPANSIÓN (dream big), MANTENER (máximo rigor), REDUCCIÓN (strip to essentials).

## Instrucciones

### Fase 0: Contexto del Sistema

Antes de cualquier review, hacer un scan rápido del proyecto:

```bash
git log --oneline -20                     # Historia reciente
git diff main --stat 2>/dev/null          # Qué ya cambió
```

Leer el BLUEPRINT más reciente, y cualquier documento de planificación existente:
- `BLUEPRINT-*.md`
- `BMC-*.md` o `LEAN-CANVAS-*.md`
- `PDR-*.md`
- `STRATEGY-CANVAS-*.md`

Mapear:
- ¿Cuál es el estado actual del sistema?
- ¿Qué ya está construido?
- ¿Qué decisiones ya se tomaron?

Reportar hallazgos antes de proceder.

### Fase 1: Nuclear Scope Challenge

#### 1A. Premisa Challenge

1. **¿Es el problema correcto?** ¿Podría un framing diferente producir una solución dramáticamente más simple o impactante?
2. **¿Cuál es el outcome real?** ¿El plan es el camino más directo a ese outcome, o está resolviendo un problema proxy?
3. **¿Qué pasa si no hacemos nada?** ¿Dolor real o hipotético?

#### 1B. Leverage de Código Existente

1. ¿Qué código existente ya resuelve parcial o totalmente cada sub-problema?
2. ¿El plan está reconstruyendo algo que ya existe? Si sí, ¿por qué reconstruir es mejor que refactorizar?

#### 1C. Dream State Mapping

```
  ESTADO ACTUAL                  ESTE PLAN                  IDEAL 12 MESES
  [describir]          --->      [describir delta]    --->   [describir target]
```

¿Este plan mueve hacia el estado ideal o se aleja?

#### 1D. Selección de Modo

Presentar tres opciones:

1. **EXPANSIÓN:** El plan es bueno pero podría ser extraordinario. Proponer la versión ambiciosa. Push scope UP. Construir la catedral.
2. **MANTENER:** El scope del plan es correcto. Revisar con máximo rigor — arquitectura, seguridad, edge cases, observabilidad. Hacerlo blindado.
3. **REDUCCIÓN:** El plan está sobredimensionado. Proponer la versión mínima que logra el objetivo core. Cortar todo lo demás.

**Defaults según contexto:**
- Feature greenfield → default EXPANSIÓN
- Bug fix / hotfix → default MANTENER
- Refactor → default MANTENER
- Plan que toca >15 archivos → sugerir REDUCCIÓN
- Usuario dice "ambicioso" / "go big" → EXPANSIÓN sin preguntar

**STOP.** Usar AskUserQuestion para que el usuario elija modo. No proceder sin respuesta.

### Fase 2: Review de Arquitectura (post selección de modo)

Evaluar y diagramar:
- **Diseño general** — boundaries de componentes, dependency graph
- **Data flow** — 4 paths: happy, nil, empty, error. ASCII diagram obligatorio.
- **Scaling** — ¿Qué se rompe primero con 10x usuarios? ¿Con 100x?
- **Seguridad** — Auth boundaries, data access patterns, API surfaces
- **Rollback** — Si esto se rompe en producción, ¿cuál es el procedimiento? ¿Feature flag? ¿Git revert? ¿Cuánto toma?

**EXPANSIÓN addition:** ¿Qué haría esta arquitectura bella? No solo correcta — elegante. ¿Qué infraestructura haría de esta feature una plataforma sobre la que otras features puedan construir?

**STOP.** AskUserQuestion por cada issue. Un issue por pregunta. Recomendar + por qué.

### Fase 3: Security & Edge Cases

- **Attack surface:** ¿Qué nuevos vectores de ataque introduce este plan? Nuevos endpoints, params, file paths, background jobs
- **Input validation:** Para cada nuevo input de usuario: ¿validado con Zod? ¿Qué pasa con nil, empty, string excediendo max length, injection attempts?
- **Authorization:** ¿Cada nuevo data access está scoped al usuario/role correcto? ¿Hay direct object reference vulnerability?
- **Interaction edge cases:**

```
INTERACCIÓN          | EDGE CASE              | MANEJADO?
---------------------|------------------------|----------
Form submission      | Double-click submit    | ?
                     | Submit con state stale | ?
Async operation      | Usuario navega away    | ?
                     | Operación timeout      | ?
Lista/tabla          | Zero resultados        | ?
                     | 10,000 resultados      | ?
```

**STOP.** AskUserQuestion por cada gap encontrado.

### Fase 4: Tests & Quality

Hacer diagrama de TODO lo nuevo que este plan introduce:

```
NUEVOS UX FLOWS:
  [listar cada interacción nueva visible al usuario]

NUEVOS DATA FLOWS:
  [listar cada nuevo path de datos por el sistema]

NUEVOS CODEPATHS:
  [listar cada nueva branch, condición, o execution path]

NUEVAS INTEGRACIONES:
  [listar cada llamada externa nueva]
```

Para cada item: ¿qué tipo de test lo cubre? ¿Existe en el plan? Si no, escribir el spec header.

**Test de confianza:** Para cada nueva feature:
- ¿Qué test te daría confianza para deployer a las 2am un viernes?
- ¿Qué test escribiría un QA hostil para romper esto?

**STOP.** AskUserQuestion por cada gap.

### Fase 5: Trayectoria a Largo Plazo

- **Deuda técnica introducida:** Código, operacional, testing, documentación
- **Path dependency:** ¿Esto hace cambios futuros más difíciles?
- **Reversibilidad:** Rate 1-5 (1 = one-way door, 5 = fácilmente reversible)
- **El test de 1 año:** Lee este plan como un nuevo ingeniero en 12 meses — ¿es obvio?

**EXPANSIÓN additions:**
- ¿Qué viene después de que esto ship? ¿Fase 2? ¿Fase 3? ¿La arquitectura lo soporta?
- ¿Esto crea capacidades que otras features pueden aprovechar?

### Outputs Requeridos

#### Sección "NO en scope"
Lista de trabajo considerado y explícitamente diferido, con una línea de justificación.

#### Sección "Lo que ya existe"
Código/flows existentes que parcialmente resuelven sub-problemas del plan.

#### Sección "Delta al dream state"
Dónde nos deja este plan relativo al ideal de 12 meses.

#### Failure Modes Registry

```
CODEPATH | FAILURE MODE   | MANEJADO? | TEST? | USUARIO VE?   | LOGGED?
---------|----------------|-----------|-------|---------------|--------
```

Cualquier fila con MANEJADO=N, TEST=N, USUARIO VE=Silencioso → **GAP CRÍTICO**.

#### Diagrams (obligatorios, producir todos los que apliquen)
1. Arquitectura del sistema
2. Data flow (incluyendo shadow paths)
3. State machine (si hay estados)
4. Error flow

#### Completion Summary

```
┌════════════════════════════════════════════════════════┐
│          FRAGUA REVIEW — RESUMEN                      │
├════════════════════════════════════════════════════════┤
│ Modo seleccionado    │ EXPANSIÓN / MANTENER / REDUCCIÓN│
│ Contexto del sistema │ [hallazgos clave]               │
│ Scope Challenge      │ [decisiones clave]              │
│ Arquitectura         │ ___ issues encontrados          │
│ Security & Edge Cases│ ___ issues, ___ gaps críticos   │
│ Tests & Quality      │ Diagrama producido, ___ gaps    │
│ Trayectoria          │ Reversibilidad: _/5             │
│ NO en scope          │ ___ items diferidos             │
│ Failure modes        │ ___ total, ___ GAPS CRÍTICOS    │
│ Diagramas producidos │ ___ (listar tipos)              │
│ Decisiones sin resolver │ ___                          │
└════════════════════════════════════════════════════════┘
```

## Regla Crítica — Cómo Preguntar

Cada AskUserQuestion DEBE: (1) presentar 2-3 opciones concretas con letras, (2) indicar cuál recomiendas PRIMERO, (3) explicar en 1-2 oraciones POR QUÉ esa opción. No batching. No yes/no.

**Lead with recommendation:** "Recomendamos B. Aquí el por qué:" — no "La opción B podría valer la pena." Sé opinionado.

## No Hacer

- ❌ Hacer cambios de código. NO empezar implementación.
- ❌ Batching múltiples issues en una pregunta.
- ❌ Drift silencioso entre modos. Una vez elegido, comprometerse.
- ❌ Reducir scope si el usuario eligió EXPANSIÓN.
- ❌ Añadir scope si el usuario eligió REDUCCIÓN.

## Siguiente Paso Sugerido

```
🔍 Fragua Review completado.

Próximos pasos recomendados:

→ /build            — Ejecutar el plan revisado
→ /plan             — Regenerar el Blueprint con los hallazgos
→ /metas            — OKRs alineados al plan revisado
→ /inspeccionar     — Review de código pre-landing (post-build)
```
