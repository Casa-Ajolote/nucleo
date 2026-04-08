# Job Stories (Alternativa/Complemento a User Stories)

> *"Las User Stories dicen quién y qué. Las Job Stories dicen cuándo y por qué."*

## Qué Hace

Genera **Job Stories** como alternativa o complemento a las User Stories tradicionales.
Mientras las User Stories se centran en el rol del usuario ("Como [rol]..."), las Job Stories
se centran en la **situación y motivación** ("Cuando [situación]...").

**Cuándo ofrecer Job Stories:**
- El producto tiene pocos roles pero muchos contextos de uso
- Las features se disparan por eventos/situaciones, no por roles
- El usuario quiere capturar la motivación detrás de cada acción
- Complementar User Stories existentes con contexto situacional

**Cuándo usar User Stories clásicas:**
- Hay múltiples roles con permisos distintos (RBAC)
- El foco es en authorization y access control
- El equipo ya trabaja con User Stories

---

## El Formato Job Story

```
When [situación/trigger]
I want to [motivación/acción]
So I can [resultado esperado]
```

### Diferencias con User Stories

| Aspecto | User Story | Job Story |
|---------|-----------|-----------|
| **Foco** | Rol del usuario | Situación/contexto |
| **Trigger** | Implícito | Explícito ("Cuando...") |
| **Motivación** | En el "Para" | En el "Quiero" |
| **Outcome** | Beneficio de negocio | Resultado funcional |
| **Ejemplo** | "Como admin, quiero ver reportes para tomar decisiones" | "Cuando es fin de mes y necesito presentar resultados, quiero un reporte automático para no pasar 3 horas compilando datos" |

---

## Workflow

### Paso 1: Analizar Inputs

Leer los documentos disponibles:
- `PDR-[nombre].md` — Flujos y features del producto
- `TECH-SPEC-[nombre].md` — Restricciones técnicas
- `docs/ux-research/journeys/` — Journey maps (si existen)
- `USER-STORIES-[nombre].md` — User Stories existentes (si se complementa)

Extraer:
- **Situaciones** donde el usuario necesita el producto
- **Triggers** que disparan la necesidad (temporales, eventos, estados)
- **Motivaciones** detrás de cada acción (el "por qué real")
- **Resultados esperados** concretos y medibles

### Paso 2: Identificar Situaciones

Las mejores Job Stories vienen de situaciones reales:

| Tipo de Trigger | Ejemplo |
|----------------|---------|
| **Temporal** | "Cuando es fin de mes...", "Cuando llega un nuevo empleado..." |
| **Evento** | "Cuando recibo una notificación de error...", "Cuando un cliente pide un reembolso..." |
| **Estado** | "Cuando mi dashboard muestra métricas en rojo...", "Cuando no tengo internet..." |
| **Emocional** | "Cuando estoy frustrado buscando un dato...", "Cuando me siento perdido en la app..." |

### Paso 3: Generar Job Stories

Para cada feature del PDR, generar 1-3 Job Stories con este formato:

```markdown
### JS-[NNN]: [Título Descriptivo]

**When** [situación específica con contexto real]
**I want to** [acción motivada — no UI, sino intención]
**So I can** [resultado concreto y medible]

**Acceptance Criteria:**
- [ ] [criterio específico]
- [ ] [criterio específico]
- [ ] [criterio específico]

**Trigger:** [Temporal | Evento | Estado | Emocional]
**Prioridad:** P0 | P1 | P2
**Dependencias:** [JS-XXX si aplica]
```

### Paso 4: Validar Calidad

Cada Job Story debe pasar estos checks:

| Check | Pregunta |
|-------|----------|
| **Situación real** | ¿Puedo imaginar exactamente cuándo ocurre esto? |
| **Sin prescripción UI** | ¿La story describe intención, no botones/pantallas? |
| **Motivación clara** | ¿El "I want to" explica el POR QUÉ, no solo el QUÉ? |
| **Resultado medible** | ¿El "So I can" tiene un resultado concreto? |
| **Contexto suficiente** | ¿Un dev puede diseñar la solución con esta info? |

### Paso 5: Presentar al Usuario

```
📋 JOB STORIES — [Nombre del Proyecto]

Generé [N] Job Stories organizadas por situación:

Situación 1: [Nombre] — [N stories]
  JS-001: [título]
  JS-002: [título]

Situación 2: [Nombre] — [N stories]
  JS-003: [título]
  JS-004: [título]

Total: [N] stories (P0: [X] | P1: [Y] | P2: [Z])

¿Ajustamos algo antes de finalizar?
```

---

## Ejemplo de Job Story Bien Escrita

```markdown
### JS-007: Reporte Automático de Fin de Mes

**When** es el último día del mes y necesito presentar resultados
a mi jefe en la reunión de las 9am del día siguiente
**I want to** generar un reporte automático con las métricas clave del mes
**So I can** llegar preparado sin pasar 3 horas compilando datos de 5 hojas de cálculo

**Acceptance Criteria:**
- [ ] El reporte se genera automáticamente el último día del mes a las 8pm
- [ ] Incluye: revenue total, nuevos usuarios, churn, NPS
- [ ] Se envía por email como PDF adjunto
- [ ] Los datos son del mes calendario completo (día 1 al último día)
- [ ] Si un dato no está disponible, muestra "N/A" en vez de fallar

**Trigger:** Temporal (fin de mes)
**Prioridad:** P1
**Dependencias:** JS-003 (Dashboard de Métricas)
```

---

## Output Contract

```markdown
# JOB-STORIES-[nombre]

> Job Stories generados por Forge · [fecha]
> PDR: PDR-[nombre].md
> Total: [N] stories (P0: [X] | P1: [Y] | P2: [Z])

---

## Situación 1: [Nombre de la situación]

> [Descripción breve del contexto]

### JS-001: [Título]
[... formato completo ...]

---

## Situación 2: [Nombre de la situación]

[... más stories ...]

---

## Resumen de Dependencias

JS-001 → JS-003 → JS-007
JS-002 → JS-004

## Métricas de Validación

| Story | Métrica de Éxito | Target |
|-------|-----------------|--------|
| JS-001 | [métrica] | [valor] |
```

---

## Naming Convention

| Documento | Archivo |
|-----------|---------|
| Job Stories | `JOB-STORIES-[nombre-kebab].md` |

---

## Integración con La Herrería

- **Se ofrece como alternativa** en Step 5 (User Stories)
- Si se generan ambos, las Job Stories complementan las User Stories con contexto situacional
- Los Wireframes (Step 6-7) pueden consumir tanto User Stories como Job Stories
- El Blueprint (Step 10) los trata como equivalentes

---

## Handoff

```
✅ JOB-STORIES-[nombre].md generado
✅ [N] stories en [M] situaciones
✅ Priorización: P0: [X] | P1: [Y] | P2: [Z]

Siguiente: UX Design (Step 6)
Las situaciones y triggers alimentan directamente
la arquitectura de información y los patrones de interacción.

¿Procedemos?
```
