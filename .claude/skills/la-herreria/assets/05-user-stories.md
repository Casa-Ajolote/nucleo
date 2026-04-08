---
name: user-stories-generator
description: >
  Genera user stories completos y accionables a partir de un PDR y Tech Spec aprobados.
  Sigue los criterios INVEST, organiza por Epics, incluye acceptance criteria detallados
  (Given-When-Then + Checklist), priorización (P0/P1/P2), edge cases, y mapeo de user journey.
  Usa este skill después del Tech Spec (Skill #2) y antes de Wireframes (Skill #4).
  El output es un archivo USER-STORIES-[nombre].md que alimenta wireframes y el blueprint.
---

# User Stories Generator

> **Rol del agente:** Product Owner Senior + Business Analyst.
> **Objetivo:** Traducir el PDR y Tech Spec en user stories completos, accionables y
> verificables que cubran el MVP completo, organizados por Epics y priorizados para
> implementación por fases.

---

## Cuándo Usar Este Skill

- El PDR (Skill #1) y Tech Spec (Skill #2) están aprobados
- Se necesitan user stories para planificar la implementación
- El Orchestrator lo invoca como Paso 3 del pipeline

## Qué NO Hace Este Skill

- NO define el negocio (eso fue el PDR)
- NO define la arquitectura (eso fue el Tech Spec)
- NO genera wireframes ni diseño visual (eso es Skill #4)
- NO escribe código de implementación

---

## Filosofía Central

> *"Las user stories no son especificaciones. Son promesas de conversación."*

### Las 3 Reglas

1. **Usuario primero, siempre.** Cada story debe responder: "¿Qué valor entrega esto
   a una persona real?" Si no hay valor claro, no es un story.

2. **Vertical, nunca horizontal.** Cada story entrega valor end-to-end (UI + lógica + datos).
   Nunca escribir "crear tabla X" o "hacer endpoint Y" como stories separados.

3. **Testeable o no existe.** Si no puedes escribir acceptance criteria específicos y
   medibles, el story es demasiado vago. Refina antes de incluir.

---

## Flujo de Trabajo del Agente

### FASE 1: Análisis de Inputs

Antes de escribir un solo story, el agente debe:

1. **Leer el PDR completo** — extraer:
   - Personas/usuarios objetivo (roles exactos, nivel técnico, dispositivos)
   - Happy path completo (flujo principal paso a paso)
   - Flujos alternativos y edge cases mencionados
   - Features del MVP (Fase 1) vs features diferidas
   - KPIs de éxito (para stories de performance/analytics)

2. **Leer el Tech Spec** — extraer:
   - Restricciones técnicas que afectan acceptance criteria
   - Modelo de datos (entidades = posibles Epics)
   - Integraciones externas (APIs = stories de integración)
   - Requisitos de auth/roles (stories de permisos)
   - Performance targets (stories no-funcionales)

3. **Mapear el User Journey** completo del MVP:

```
[Entrada] → [Paso 1] → [Paso 2] → ... → [Resultado Final]

Ejemplo:
Signup → Login → Dashboard → Crear Proyecto → Subir Datos → Procesar → Ver Resultado → Descargar/Compartir
```

4. **Identificar Epics** a partir del journey:

Cada etapa importante del journey = 1 Epic.
Cada Epic contiene múltiples stories.

---

### FASE 2: Discusión con el Usuario (Conversacional)

Antes de generar, presentar el plan al usuario:

```
📋 PLAN DE USER STORIES — [Nombre del Proyecto]

Basado en el PDR y Tech Spec, identifiqué estos Epics:

Epic 1: [Nombre] — [X stories estimados]
Epic 2: [Nombre] — [X stories estimados]
Epic 3: [Nombre] — [X stories estimados]
...

Total estimado: [N] user stories

User Journey Map:
[Epic 1] → [Epic 2] → [Epic 3] → ... → [Epic N]

Priorización propuesta:
• P0 (MVP): Epics 1, 2, 3 — [razón]
• P1 (Post-launch): Epics 4, 5 — [razón]
• P2 (Futuro): Epic 6 — [razón]

¿Ajustamos algo antes de escribir los stories?
```

**Puntos a validar con el usuario:**
- ¿Falta algún Epic o flujo?
- ¿La priorización está correcta?
- ¿Hay features que debería mover de P1 a P0 o viceversa?
- ¿Hay edge cases o flujos alternativos que deba considerar?

---

### FASE 3: Generación de User Stories

Una vez aprobado el plan, generar todos los stories siguiendo las reglas de abajo.
El archivo se guarda en `/mnt/user-data/outputs/` con el nombre:
`USER-STORIES-[nombre-del-proyecto-kebab-case].md`

---

## Reglas de Escritura

### Formato de Cada Story

```markdown
### US-[NNN]: [Título Conciso y Descriptivo]

**Como** [persona/rol específico — nunca "usuario" genérico]
**Quiero** [objetivo/funcionalidad — describir necesidad, NO solución UI]
**Para** [beneficio concreto — valor de negocio real, NO requisito técnico]

**Acceptance Criteria:**

Funcionalidad:
- [ ] [Criterio específico y medible]
- [ ] [Criterio específico y medible]
- [ ] [Criterio específico y medible]

Validaciones:
- [ ] [Regla de validación con mensaje de error exacto]

Error Handling:
- [ ] [Qué pasa cuando X falla — mensaje o comportamiento exacto]

UX:
- [ ] [Requisito de experiencia — responsive, loading state, etc.]

**Prioridad:** P0 | P1 | P2
**Estimación:** [S | M | L] (1-2 días | 3-4 días | 5+ días)
**Dependencias:** [US-XXX si aplica, o "Ninguna"]
**Notas técnicas:** [Solo si hay restricciones del Tech Spec relevantes]
```

### Criterios INVEST — Verificar Cada Story

| Criterio | Pregunta de Validación |
|----------|----------------------|
| **I**ndependent | ¿Se puede desarrollar sin esperar otro story? |
| **N**egotiable | ¿Deja espacio para que el dev elija la implementación? |
| **V**aluable | ¿Entrega valor al usuario o al negocio? |
| **E**stimable | ¿El equipo puede estimar el esfuerzo? |
| **S**mall | ¿Se completa en 1-5 días? Si no, dividir. |
| **T**estable | ¿Los acceptance criteria son verificables? |

### Acceptance Criteria — Formato Mixto

Usar **Checklist** como formato principal (más práctico para desarrollo).
Usar **Given-When-Then** solo para flujos complejos con múltiples caminos:

```
Given que soy un [rol] con [precondición]
When [realizo acción X]
Then [resultado esperado]
And [resultado adicional]
```

### Cuántos Criteria por Story

- Mínimo: 3
- Ideal: 5-8
- Máximo: 10 (si tienes más, el story es muy grande — dividir)

### Edge Cases Obligatorios

Cada story debe cubrir al menos estos escenarios:

1. **Empty state** — ¿Qué ve el usuario si no hay datos?
2. **Error state** — ¿Qué pasa si la operación falla?
3. **Loading state** — ¿Qué se muestra mientras procesa?
4. **Permission denied** — ¿Qué pasa si no tiene acceso?
5. **Validation failure** — ¿Qué pasa si el input es inválido?

No todos aplican a cada story, pero el agente debe evaluarlos y documentar los relevantes.

---

## Técnicas de Splitting

Si un story es demasiado grande (>5 días o >10 criteria), dividir usando:

| Técnica | Cuándo Usar | Ejemplo |
|---------|------------|---------|
| **Por roles** | Diferentes usuarios hacen lo mismo diferente | Admin vs User |
| **Por CRUD** | Gestión completa de una entidad | Crear, Ver, Editar, Eliminar |
| **Por criteria** | Cada criterio podría ser un story | Registro: email, verificación, perfil |
| **Por happy/sad path** | Flujo exitoso vs manejo de errores | Pago exitoso vs pago fallido |
| **Por datos** | Diferentes tipos de datos | Ver datos básicos vs ver historial |
| **Por MVF** | Mínimo viable primero, luego extras | Dashboard básico → con filtros → con export |

**Regla de oro: siempre cortar VERTICAL (end-to-end), nunca HORIZONTAL (por capa técnica).**

---

## Tipos de Stories a Incluir

### 1. Feature Stories (mayoría)
Funcionalidad que el usuario interactúa directamente.

### 2. Technical Stories (cuando necesario)
Infraestructura que entrega valor indirecto. Siempre justificar el valor:

```markdown
### US-XXX: Rate Limiting en API

**Como** operador del sistema
**Quiero** que los endpoints tengan límites de solicitudes
**Para** proteger el servicio de abusos y mantener costos controlados

**Acceptance Criteria:**
- [ ] Máximo [N] requests por minuto por usuario
- [ ] Retornar HTTP 429 con header Retry-After cuando se excede
- [ ] Loguear violaciones de rate limit
- [ ] [Criterio específico al proyecto]

**Prioridad:** P1
```

### 3. Spike Stories (investigación)
Time-boxed research cuando hay incertidumbre técnica:

```markdown
### US-XXX: [SPIKE] Evaluar Provider de [Servicio]

**Como** equipo de producto
**Quiero** evaluar opciones de [servicio] comparando [criterios]
**Para** tomar una decisión informada antes de implementar

**Acceptance Criteria:**
- [ ] Comparar mínimo 3 providers
- [ ] Documentar: pricing, calidad, velocidad, API complexity
- [ ] Recomendar uno con justificación
- [ ] Time-boxed a [N] horas

**Prioridad:** P0
**Estimación:** S (time-boxed)
```

---

## Priorización

| Nivel | Significado | Criterio |
|-------|-----------|----------|
| **P0** | Must Have — MVP | Sin esto no se puede lanzar. Bloquea funcionalidad core. |
| **P1** | Should Have — Post-launch | Importante pero no crítico. Mejora la experiencia. Se puede agregar en Fase 2. |
| **P2** | Nice to Have — Futuro | Deseable. Bajo impacto si falta. Fase 3+. |

### Reglas de Priorización

- **Auth siempre es P0** (login, signup, logout, protección de rutas)
- **El happy path completo del MVP es P0**
- **Los edge cases del happy path son P0** (errores, validaciones del flujo principal)
- **Features que mejoran pero no bloquean son P1** (filtros avanzados, export, notificaciones)
- **Optimizaciones y nice-to-haves son P2** (analytics, multi-idioma, temas oscuros)

---

## Template del Documento Final

```markdown
# [Nombre del Proyecto] — User Stories

> **Versión**: 1.0
> **Estado**: BORRADOR | APROBADO
> **Fecha**: [YYYY-MM-DD]
> **PDR**: PDR-[nombre].md
> **Tech Spec**: TECH-SPEC-[nombre].md
> **Total Stories**: [N] (P0: [X] | P1: [Y] | P2: [Z])

---

## User Journey Map

```
[Diagrama visual del journey completo]
[Epic 1] → [Epic 2] → [Epic 3] → ... → [Epic N]
```

## Resumen de Epics

| Epic | Stories | Prioridad | Descripción |
|------|---------|-----------|-------------|
| Epic 1: [Nombre] | US-001 a US-00N | P0 | [descripción breve] |
| Epic 2: [Nombre] | US-00N a US-0NN | P0 | [descripción breve] |
| ... | ... | ... | ... |

---

## Epic 1: [Nombre del Epic]

> [Descripción breve del epic y su valor]

### US-001: [Título]

**Como** [persona]
**Quiero** [objetivo]
**Para** [beneficio]

**Acceptance Criteria:**

Funcionalidad:
- [ ] [criterio]

Validaciones:
- [ ] [criterio]

Error Handling:
- [ ] [criterio]

UX:
- [ ] [criterio]

**Prioridad:** P0
**Estimación:** M
**Dependencias:** Ninguna

---

### US-002: [Título]
[... mismo formato ...]

---

## Epic 2: [Nombre del Epic]

> [Descripción]

### US-00N: [Título]
[... stories del epic ...]

---

## Stories No-Funcionales

> Stories técnicos que no pertenecen a un epic de usuario pero son necesarios

### US-NNN: [Título]
[... stories técnicos ...]

---

## Resumen de Dependencias

```
US-003 (Login) → US-005 (Dashboard) → US-008 (Crear Proyecto)
                                     → US-012 (Ver Perfil)
US-001 (Signup) → US-002 (Verificar Email) → US-003 (Login)
```

## Stories Diferidos (Post-MVP)

| Story | Epic | Razón de Diferimiento | Fase Tentativa |
|-------|------|----------------------|----------------|
| [título] | [epic] | [razón] | Fase 2 |

---

*User Stories generados con Claude para Carlos-GPT*
*Pendiente aprobación antes de avanzar al siguiente skill*
```

---

## Reglas para el Agente

### Calidad de los Stories

1. **Nunca uses "usuario" genérico.** Siempre el rol específico del PDR:
   "Como recepcionista del consultorio", "Como realtor", "Como admin del sistema".

2. **El "Para" nunca es técnico.** Mal: "Para que los datos se guarden en la BD".
   Bien: "Para no perder la información de mis pacientes".

3. **Acceptance criteria concretos.** Mal: "El formulario funciona bien".
   Bien: "Email valida formato user@domain.com. Si es inválido, muestra 'Ingresa un email válido' debajo del campo."

4. **Mensajes de error exactos.** No "mostrar error". Sí: "Mostrar: 'No pudimos procesar tu pago. Verifica los datos de tu tarjeta e intenta nuevamente.'"

5. **Sin prescripción de UI.** Mal: "Un botón azul de 200px".
   Bien: "El usuario puede confirmar la acción fácilmente". El wireframe (Skill #4) define la UI.

6. **Numbers > words.** "Carga en <2 segundos" > "carga rápido".
   "Soporta archivos hasta 10MB" > "soporta archivos grandes".

### Completitud

7. **Cubrir el journey completo.** Desde signup hasta el resultado final del MVP.
   No dejar huecos — si el usuario llega a un punto sin story, falta uno.

8. **Incluir stories "invisibles".** Los que el usuario no pide pero necesita:
   password reset, empty states, loading states, error pages, logout.

9. **Stories de auth siempre.** Signup, login, logout, password reset,
   protección de rutas — son P0 siempre que el PDR requiera autenticación.

### Integración con el Pipeline

10. **Respetar el alcance del PDR.** Si el PDR dice "MVP = 3 features", solo P0 esas 3.
    El resto es P1/P2. No inflar el MVP.

11. **Respetar restricciones del Tech Spec.** Si el Tech Spec dice "Supabase Auth con email/password",
    los stories de auth reflejan eso (no OAuth, no magic links a menos que el spec lo diga).

12. **Cada story mapeará a wireframes.** El Skill #4 va a tomar estos stories y crear
    pantallas. Asegurarse de que cada story con UI tenga suficiente contexto para dibujar.

13. **Guardar el archivo** en `/mnt/user-data/outputs/USER-STORIES-[nombre-kebab].md`

---

## Ejemplo de Story Bien Escrito

```markdown
### US-007: Subir Fotos de Propiedad

**Como** realtor
**Quiero** subir múltiples fotos de una propiedad desde mi computadora o teléfono
**Para** poder iniciar el proceso de staging virtual sin depender de un fotógrafo profesional

**Acceptance Criteria:**

Funcionalidad:
- [ ] El usuario puede arrastrar y soltar archivos o usar el selector de archivos
- [ ] Soporta selección múltiple (hasta 20 imágenes por propiedad)
- [ ] Formatos aceptados: JPG, PNG, HEIC
- [ ] Tamaño máximo por imagen: 10MB
- [ ] Muestra thumbnail de cada imagen subida
- [ ] El usuario puede eliminar imágenes antes de confirmar

Validaciones:
- [ ] Si el archivo no es JPG/PNG/HEIC: "Formato no soportado. Usa JPG, PNG o HEIC."
- [ ] Si el archivo excede 10MB: "La imagen es muy grande. El máximo es 10MB."
- [ ] Si se exceden 20 imágenes: "Máximo 20 imágenes por propiedad. Elimina alguna para agregar más."

Error Handling:
- [ ] Si la subida falla por red: "No pudimos subir [nombre]. Intenta nuevamente." con botón de retry
- [ ] Las imágenes que sí se subieron se mantienen — no se pierden si una falla

UX:
- [ ] Barra de progreso individual por imagen
- [ ] Funciona en desktop (drag & drop) y mobile (selector nativo de fotos)
- [ ] Las imágenes se muestran en grid responsive después de subir

**Prioridad:** P0
**Estimación:** M (3-4 días)
**Dependencias:** US-005 (Crear Propiedad)
**Notas técnicas:** Usar Supabase Storage bucket "property-images". Validar tipo MIME en server, no solo extensión.
```

---

*"Un user story sin acceptance criteria es un deseo. Un acceptance criteria sin story es una tarea."*
