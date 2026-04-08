---
name: master-blueprint-generator
description: >
  Genera el Master Blueprint: un documento único y completo que contiene TODO lo necesario
  para construir una aplicación desde cero. Organiza el desarrollo en Fases → Subfases → Tareas,
  donde cada fase integra sus propios User Stories, Wireframes ASCII, y Prompts de Google Stitch.
  Es la consolidación final de los 5 skills anteriores (PDR, Tech Spec, User Stories, Wireframes,
  Stitch Prompts) en un plan de ejecución por fases listo para entregar a cualquier equipo
  de desarrollo. Usa este skill como Paso 6 (final) del pipeline, después de Stitch Prompts (Skill #5).
  El output es un archivo BLUEPRINT-[nombre].md que es, literalmente, el manual de construcción.
---

# Master Blueprint Generator — El Manual de Construcción

> **Rol del agente:** Technical Project Manager Senior + Solutions Architect.
> **Objetivo:** Consolidar TODO el trabajo de los 5 skills anteriores en un único documento
> ejecutable que cualquier equipo de desarrollo pueda seguir para construir la aplicación
> completa, fase por fase, sin necesitar otro documento de referencia.

---

## Cuándo Usar Este Skill

- Los 5 skills anteriores están completados y aprobados (PDR, Tech Spec, User Stories, Wireframes, Stitch Prompts)
- Se necesita un plan de ejecución por fases para un equipo de desarrollo
- El Orchestrator lo invoca como Paso 6 (final) del pipeline

## Qué NO Hace Este Skill

- NO define negocio ni producto (eso fue el PDR)
- NO decide el stack (eso fue el Tech Spec)
- NO inventa stories nuevos (los toma del Skill #3)
- NO genera wireframes nuevos (los toma del Skill #4)
- NO crea prompts de Stitch nuevos (los toma del Skill #5)
- NO escribe código de implementación

Lo que SÍ hace: **ORGANIZA, SECUENCIA, INTEGRA y PRODUCE** un documento
que contiene todo eso junto, en el orden correcto, con dependencias claras.

---

## Filosofía Central

> *"Un Blueprint no es documentación. Es una máquina de instrucciones.
> Si lo sigues paso a paso, al final tienes una app funcionando."*

### Las 3 Reglas

1. **Autosuficiente.** El Blueprint NO debe requerir leer ningún otro documento.
   Todo lo que el equipo necesita está DENTRO del Blueprint: stories, wireframes,
   prompts, stack, comandos, schemas. Si falta algo, el Blueprint está incompleto.

2. **Secuencial.** Cada fase produce algo funcional y verificable. No hay fases
   "de preparación" sin entregable. No hay saltos de dependencia. Fase 2 depende
   solo de Fase 1. Fase 3 depende solo de Fase 1 y 2. Nunca de Fase 5.

3. **Copy-paste-ready.** Los comandos de setup son copiables. Los schemas SQL son
   copiables. Los wireframes ASCII están inline. Los prompts de Stitch son copiables.
   El equipo no tiene que interpretar nada — solo ejecutar.

---

## Flujo de Trabajo del Agente

### FASE 1: Recopilar y Validar Inputs

Antes de generar cualquier cosa, el agente DEBE verificar que tiene todos los inputs:

```
CHECKLIST DE INPUTS:
□ PDR (Skill #1)     → Extraer: nombre, visión, usuario objetivo, modelo de negocio,
                        features principales, métricas de éxito
□ Tech Spec (Skill #2) → Extraer: stack completo, servicios externos, DB schema,
                          estructura de carpetas, APIs, hosting
□ User Stories (Skill #3) → Extraer: todos los US-X.X con prioridad (P0/P1/P2),
                              acceptance criteria, épics
□ Wireframes (Skill #4)   → Extraer: wireframes ASCII de cada pantalla, versión
                              mobile y desktop, estados (empty, error, loading)
□ Stitch Prompts (Skill #5) → Extraer: Design System Prompt, prompts por pantalla,
                                refinamientos sugeridos
□ (Opcional) Generative UI Strategy → Si el Skill #5 identificó pantallas con GenUI
```

**Si falta algún input:** Notificar al usuario qué falta y sugerir ejecutar el skill
correspondiente primero. NO generar el Blueprint con inputs incompletos.

**Si los inputs son documentos existentes** (como plan.md, tasks.md, PRODUCT-SPEC.md
que el usuario ya tenga de trabajo previo): El agente debe analizar esos documentos
y mapearlos a los inputs del pipeline, extrayendo la información equivalente.

### FASE 2: Definir las Fases de Desarrollo

El agente analiza los User Stories por prioridad y los agrupa en fases lógicas.

#### Principios de Agrupación

```
REGLA 1 — P0 primero, P1 después, P2 al final
  Los stories P0 forman las fases iniciales (MVP).
  Los P1 son fases intermedias.
  Los P2 son fases finales o post-MVP.

REGLA 2 — Dependencias naturales
  Auth antes de cualquier feature autenticado.
  CRUD de entidad base antes de features sobre esa entidad.
  Pagos después de features que generan valor (para que haya algo que pagar).
  Notificaciones después de las acciones que las disparan.
  Admin panel después de que exista data que administrar.
  Testing después de que existan flujos que testear.
  Landing/SEO al final cuando el producto está estable.

REGLA 3 — Cada fase produce un incremento demostrable
  Al final de cada fase, el usuario (o stakeholder) puede ver algo nuevo
  funcionando. Nunca una fase de "solo backend" o "solo setup".
  Excepción: La Fase 1 (Foundation) es setup — pero DEBE terminar con
  "app corriendo en local con auth funcional" como entregable mínimo.

REGLA 4 — Máximo 10 fases, mínimo 4
  Menos de 4 fases = fases demasiado grandes, imposibles de estimar.
  Más de 10 fases = granularidad excesiva, overhead de coordinación.
  El sweet spot es 6-8 fases para un MVP típico.
```

#### Patrón Universal de Fases

Aunque cada proyecto es diferente, este es el patrón que aplica al 90% de SaaS MVPs:

```
FASE 1: Foundation & Setup
  └─ Stack, DB schema, auth, proyecto corriendo local

FASE 2: Design System & Layout
  └─ Componentes UI base, layouts, navegación

FASE 3: Core Entity CRUD
  └─ La entidad principal del negocio (propiedades, proyectos, productos, etc.)

FASE 4: Core Feature (El "Magic")
  └─ La feature que diferencia la app (IA, procesamiento, cálculos, etc.)

FASE 5: Monetización
  └─ Pagos, suscripciones, limits, billing

FASE 6: Comunicación
  └─ Notificaciones, emails, alertas

FASE 7: Administración
  └─ Admin panel, moderación, analytics internos

FASE 8: Quality & Polish
  └─ Testing, performance, seguridad, UX refinement

FASE 9: Launch Preparation
  └─ Landing page, SEO, deployment producción, beta

(FASE 10: Post-MVP — si aplica)
  └─ Features P2, integraciones, expansión
```

**IMPORTANTE:** El agente ADAPTA este patrón al proyecto específico. No lo copia literal.
Si el proyecto no tiene pagos, no hay fase de monetización. Si es una internal tool,
no hay fase de landing page. El patrón es una guía, no una plantilla rígida.

### FASE 3: Descomponer Cada Fase en Subfases y Tareas

Cada fase se descompone en:

```
FASE [N]: [Nombre de la Fase]
  ├── Subfase [N.1]: [Nombre]
  │   ├── Tarea [N.1.1]: [Descripción accionable]
  │   ├── Tarea [N.1.2]: [Descripción accionable]
  │   └── Tarea [N.1.3]: [Descripción accionable]
  ├── Subfase [N.2]: [Nombre]
  │   ├── Tarea [N.2.1]: [...]
  │   └── Tarea [N.2.2]: [...]
  └── Subfase [N.3]: [Nombre]
      └── Tarea [N.3.1]: [...]
```

#### Reglas de Descomposición

**Subfases (máx 5 por fase):**
- Agrupan tareas relacionadas temáticamente
- Cada subfase tiene un entregable claro
- Se pueden asignar a un desarrollador individual
- Típicamente 2-5 subfases por fase

**Tareas (máx 8 por subfase):**
- Cada tarea es accionable por UNA persona en MÁXIMO 1 día
- El nombre empieza con verbo en infinitivo: "Crear", "Implementar", "Configurar"
- Incluye archivos/rutas específicas cuando es posible
- NO es ambigua: "Hacer el login" ❌ → "Crear formulario de login con email/password, validación Zod, y redirect a dashboard" ✅

### FASE 4: Integrar Contenido de Skills Anteriores

Aquí es donde el Blueprint se diferencia de un simple task list.
**Cada fase recibe el contenido completo** que su equipo necesita.

#### Para Cada Fase, Incluir:

```
## FASE [N]: [Nombre]

> **Duración estimada:** [X días/semanas]
> **Dependencias:** Fase [N-1] completada
> **Entregable:** [Qué se puede demostrar al final]
> **Desarrollador(es):** [Sugerencia de asignación si hay roles]

### User Stories de Esta Fase

[Listar los US-X.X que se implementan en esta fase,
con su descripción completa y acceptance criteria.
NO solo el ID — el contenido completo, porque el Blueprint
es autosuficiente.]

### Wireframes de Esta Fase

[Incluir los wireframes ASCII de las pantallas que se construyen
en esta fase. Versión mobile y desktop. Incluir estados si son
relevantes para esta fase.]

### Prompts de Stitch (Diseño Visual)

[Incluir los prompts de Stitch para las pantallas de esta fase.
Si esta fase no tiene nuevas pantallas (ej: fase de backend),
indicar "Sin pantallas nuevas — reutiliza componentes de Fase [X]"]

### Subfases y Tareas

[El desglose completo Subfase → Tarea]

### Criterios de Aceptación de la Fase

[Checklist que el equipo usa para validar que la fase está completa]

### Notas Técnicas

[Tips, decisiones de arquitectura, pitfalls conocidos,
cosas que se descubrieron en skills anteriores y aplican aquí]
```

### FASE 5: Validar Cobertura Total

Antes de entregar el Blueprint, el agente valida:

```
VALIDACIÓN FINAL:

□ COBERTURA DE STORIES
  Cada US-X.X del Skill #3 está asignado a exactamente UNA fase.
  No hay stories sin fase. No hay stories duplicados en múltiples fases.
  → Generar tabla de mapeo US → Fase al final del documento.

□ COBERTURA DE WIREFRAMES
  Cada wireframe del Skill #4 está incluido en la fase donde se construye.
  No hay pantallas sin wireframe. No hay wireframes huérfanos.
  → Generar tabla de mapeo Pantalla → Fase al final del documento.

□ COBERTURA DE STITCH PROMPTS
  Cada prompt del Skill #5 está incluido en la fase correspondiente.
  El Design System Prompt está en Fase 2 (donde se crea el design system).
  → Verificar que total de prompts = total de pantallas.

□ DEPENDENCIAS LINEALES
  Fase N no requiere nada que no esté en Fases 1 a N-1.
  No hay dependencias circulares ni saltos hacia adelante.

□ ESTIMACIONES COHERENTES
  La suma de duraciones de fases ≈ timeline total del proyecto.
  Si PDR dice "8 semanas" pero las fases suman 14, hay un problema.

□ ENTREGABLES VERIFICABLES
  Cada fase tiene un entregable que se puede demostrar en 5 minutos.
  "Auth funciona" se demuestra creando una cuenta y haciendo login.
  "Staging funciona" se demuestra subiendo una foto y viendo el resultado.
```

### FASE 6: Generar el Documento Final

El agente produce el Blueprint completo y lo guarda:

**Archivo:** `/mnt/user-data/outputs/BLUEPRINT-[nombre-kebab].md`

---

## Template del Documento Master Blueprint

```markdown
# [NOMBRE DEL PROYECTO] — Master Blueprint

> **Versión:** 1.0
> **Fecha:** [YYYY-MM-DD]
> **Timeline Total:** [X semanas]
> **Equipo:** [N desarrolladores + roles]
> **Estado:** BORRADOR | APROBADO | EN EJECUCIÓN
>
> **Documentos Fuente:**
> - PDR: [nombre-archivo.md]
> - Tech Spec: [nombre-archivo.md]
> - User Stories: [nombre-archivo.md]
> - Wireframes: [nombre-archivo.md]
> - Stitch Prompts: [nombre-archivo.md]

---

## Visión del Producto

[1-3 párrafos tomados del PDR. Qué es, para quién, qué problema resuelve,
y cuál es la propuesta de valor principal.]

---

## Stack Técnico (Referencia Rápida)

[Tabla del Tech Spec con el stack completo. El equipo debe poder mirar
esta tabla y saber exactamente qué instalar.]

| Capa | Tecnología | Versión | Para qué |
|------|-----------|---------|----------|
| Framework | [Next.js] | [16] | [Full-stack, App Router] |
| Lenguaje | [TypeScript] | [5.x] | [Type safety] |
| Estilos | [Tailwind CSS] | [3.4] | [Utility-first] |
| Base de datos | [Supabase] | [latest] | [PostgreSQL + Auth + Storage] |
| Pagos | [Stripe] | [latest] | [Suscripciones + one-time] |
| Hosting | [Vercel] | [N/A] | [Edge, preview deploys] |
| [etc.] | [...] | [...] | [...] |

### Servicios Externos y API Keys Requeridos

| Servicio | API Key Necesaria | Costo Estimado |
|----------|------------------|----------------|
| [Servicio 1] | [Nombre de la key] | [$X/mes o per-use] |
| [...] | [...] | [...] |

### Estructura de Carpetas Base

```
[nombre-proyecto]/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── features/         # Feature modules
│   │   ├── auth/
│   │   ├── [entity]/
│   │   └── billing/
│   ├── shared/           # Shared components, utils, hooks
│   └── lib/              # External service clients
├── supabase/
│   ├── migrations/       # SQL migrations
│   └── functions/        # Edge Functions
├── public/               # Static assets
└── docs/                 # Documentation
```

---

## Database Schema

[Schema SQL completo o tablas con columnas. Tomado del Tech Spec.
Debe ser copy-paste-ready para crear las tablas.]

---

## Design System

[Tomado del Skill #5 — Design System Prompt completo. Incluir aquí
porque el equipo lo necesita como referencia constante y porque
se pega en cada prompt de Stitch.]

---

## Resumen de Fases

| # | Fase | Duración | Stories | Pantallas | Entregable |
|---|------|----------|---------|-----------|------------|
| 1 | [Foundation & Setup] | [1 semana] | [US-X.X] | [0] | [App corriendo + auth] |
| 2 | [Design System & Layout] | [3 días] | [—] | [N] | [Componentes + layouts] |
| 3 | [Core Entity] | [1 semana] | [US-X.X...] | [N] | [CRUD de [entidad]] |
| ... | ... | ... | ... | ... | ... |

---

## FASE 1: [Nombre]

> **Duración:** [X días/semana]
> **Depende de:** Nada (es la primera)
> **Entregable:** [Qué se puede demostrar]
> **Asignación sugerida:** [Dev 1 + Dev 2 / Full team]

### 1.0 User Stories de Esta Fase

**US-X.X: [Título]** (P0)
As a [usuario], I want to [acción], so that [beneficio].
**Acceptance Criteria:**
- AC1: [criterio específico y verificable]
- AC2: [...]
- AC3: [...]

[Repetir para cada story de esta fase]

### 1.1 [Nombre de la Subfase]

- [ ] **[T-1.1.1]** [Descripción accionable de la tarea]
  - Archivos: `[ruta/archivo.ext]`
  - Notas: [contexto adicional si necesario]
- [ ] **[T-1.1.2]** [Descripción accionable]
- [ ] **[T-1.1.3]** [Descripción accionable]

### 1.2 [Nombre de la Subfase]

- [ ] **[T-1.2.1]** [...]
- [ ] **[T-1.2.2]** [...]

### Wireframes — Fase 1

[Si esta fase tiene pantallas nuevas, incluir wireframes ASCII aquí.
Si no tiene pantallas (ej: setup), indicar "Sin wireframes nuevos".]

#### [Nombre de la Pantalla] — Mobile (375px)

```
┌─────────────────────────┐
│ [wireframe ASCII]       │
│                         │
└─────────────────────────┘
```

#### [Nombre de la Pantalla] — Desktop (1440px)

```
┌───────────────────────────────────────────┐
│ [wireframe ASCII]                         │
│                                           │
└───────────────────────────────────────────┘
```

### Stitch Prompts — Fase 1

[Si esta fase tiene pantallas nuevas, incluir los prompts de Stitch.
Cada prompt es copy-paste-ready para pegar en stitch.withgoogle.com.
Si no tiene pantallas, indicar "Sin prompts nuevos".]

#### Prompt: [Nombre de la Pantalla]

```
[DESIGN SYSTEM PROMPT — copiar bloque completo de la sección Design System]

---

CONTEXTO DEL PRODUCTO (Zoom-Out):
[...]

PANTALLA A DISEÑAR (Zoom-In):
[...]

Componentes necesarios:
[...]

NO CAMBIAR de lo ya establecido:
[...]
```

**Refinamientos sugeridos:**
1. "[ajuste específico]"
2. "[ajuste específico]"

### Checklist de Aceptación — Fase 1

- [ ] [Criterio verificable 1]
- [ ] [Criterio verificable 2]
- [ ] [Criterio verificable 3]
- [ ] Screenshot/video de la demo
- [ ] PR reviewed y merged a main

### Notas Técnicas — Fase 1

[Tips de implementación, decisiones de arquitectura específicas de esta fase,
pitfalls conocidos, referencias a documentación externa relevante.]

---

## FASE 2: [Nombre]

[Misma estructura que Fase 1]

---

[Repetir para cada fase...]

---

## Apéndice A: Mapeo Completo US → Fase

| User Story | Prioridad | Fase | Subfase |
|-----------|-----------|------|---------|
| US-1.1 | P0 | 1 | 1.2 |
| US-1.2 | P0 | 1 | 1.2 |
| US-2.1 | P0 | 3 | 3.1 |
| [...] | [...] | [...] | [...] |

**Validación:** [Total] stories asignados. 0 sin fase. 0 duplicados.

---

## Apéndice B: Mapeo Pantallas → Fase

| Pantalla | Wireframe | Stitch Prompt | Fase |
|----------|-----------|---------------|------|
| Login | ✅ | ✅ | 1 |
| Dashboard | ✅ | ✅ | 3 |
| [...] | [...] | [...] | [...] |

**Validación:** [Total] pantallas. [Total] wireframes. [Total] prompts Stitch.

---

## Apéndice C: Dependencias Entre Fases

```
Fase 1 ──→ Fase 2 ──→ Fase 3 ──→ Fase 4 ──→ Fase 5
                                    │
                                    └──→ Fase 6 ──→ Fase 7
                                                      │
                                                      └──→ Fase 8 ──→ Fase 9
```

[Diagrama adaptado al proyecto específico. Indicar si alguna fase se puede
ejecutar en paralelo (ej: Fase 6 y Fase 7 si hay 2 devs).]

---

## Apéndice D: Estimaciones y Timeline

| Fase | Días Estimados | Fecha Inicio | Fecha Fin | Desarrollador |
|------|---------------|-------------|-----------|---------------|
| 1 | [N] | [YYYY-MM-DD] | [YYYY-MM-DD] | [Nombre/Rol] |
| 2 | [N] | [...] | [...] | [...] |
| [...] | [...] | [...] | [...] | [...] |
| **TOTAL** | **[N]** | | | |

---

## Apéndice E: Generative UI Strategy (si aplica)

[Solo si el Skill #5 identificó pantallas con Generative UI.
De lo contrario, omitir este apéndice.]

| Pantalla | Tipo GenUI | Protocolo | Fase de Implementación |
|----------|-----------|-----------|----------------------|
| [...] | [Static/Declarative] | [AG-UI/A2UI] | [N] |

---

## Changelog

| Fecha | Versión | Cambios |
|-------|---------|---------|
| [YYYY-MM-DD] | 1.0 | Blueprint inicial generado |

```

---

## Reglas Para el Agente

### Calidad del Blueprint

1. **Autosuficiencia total.** El lector del Blueprint NO debe necesitar abrir
   ningún otro archivo. Todo está inline: stories completos con AC, wireframes
   ASCII, prompts de Stitch, schema SQL, comandos de setup. Si el equipo tiene
   que buscar información en otro lugar, el Blueprint falló.

2. **Copy-paste-ready.** Cada comando, schema, prompt, y configuración debe ser
   copiable directamente. No escribir "configura Supabase con las tablas del Tech Spec" —
   escribir las sentencias SQL exactas o indicar el archivo de migración.

3. **Tareas de máximo 1 día.** Si una tarea toma más de 1 día, descomponerla.
   "Implementar sistema de pagos" ❌ → "Crear checkout session con Stripe",
   "Manejar webhook de Stripe", "Crear página de billing", etc. ✅

4. **Verbos de acción.** Cada tarea empieza con verbo infinitivo:
   Crear, Implementar, Configurar, Integrar, Diseñar, Agregar, Testear, Corregir,
   Documentar, Desplegar, Verificar, Migrar.

5. **Sin ambigüedad.** "Hacer que funcione" ❌ → "Verificar que el upload de imagen
   retorna URL pública desde Supabase Storage y se muestra en el componente RoomCard" ✅

6. **Archivos específicos.** Cuando sea posible, indicar la ruta del archivo que se
   debe crear o modificar: `src/features/auth/components/LoginForm.tsx`

### Integración del Pipeline

7. **Mapeo 1:1 entre stories y fases.** Cada story va en exactamente una fase.
   Si un story es demasiado grande para una fase, se debió splitear en el Skill #3.

8. **Wireframes en la fase donde se construyen.** No adelantar wireframes a fases
   anteriores ni postergarlos. Si la Fase 3 construye el Dashboard, el wireframe
   del Dashboard está en la Fase 3.

9. **Stitch Prompts en la fase del wireframe.** El prompt de Stitch de una pantalla
   va en la misma fase que su wireframe, porque el equipo de frontend los necesita juntos.

10. **Design System Prompt una sola vez.** Va en la fase donde se crea el design system
    (típicamente Fase 2) y se referencia en las demás fases como "usar el Design System
    Prompt de la Fase 2".

### Manejo de Proyectos Existentes (Trabajo Previo)

11. **Si el usuario proporciona documentos de trabajo previo** (como plan.md, tasks.md,
    PRODUCT-SPEC.md con fases ya definidas), el agente debe:
    - Analizar el estado actual (qué fases están completas, cuáles pendientes)
    - Respetar la estructura existente si es coherente
    - Mejorar la estructura si tiene gaps (fases sin stories, sin wireframes, sin prompts)
    - Consolidar todo en el formato del Blueprint
    - Marcar fases ya completadas como `[✅ COMPLETADA]`

12. **Si hay conflictos entre documentos previos y el pipeline de skills:**
    El pipeline de skills es la fuente de verdad para formato y calidad.
    Los documentos previos son la fuente de verdad para contenido y decisiones.

### Dimensionamiento

13. **El Blueprint SERÁ un documento largo.** Un MVP típico produce un Blueprint
    de 500-1500 líneas. Esto es esperado y correcto. El valor está en que TODO
    está en un solo lugar.

14. **No sacrificar completitud por brevedad.** Es mejor un Blueprint de 1200 líneas
    donde el equipo nunca tiene que preguntar, que uno de 200 líneas donde el equipo
    está adivinando constantemente.

15. **Pero no repetir innecesariamente.** El Design System Prompt se escribe UNA vez
    y se referencia. Los wireframes de una pantalla aparecen UNA vez en su fase.
    La tabla de stack técnico aparece UNA vez al inicio.

---

## Flujo de Conversación con el Usuario

### Paso 1: Recibir y Validar Inputs

```
He recibido los siguientes documentos del pipeline:
✅ PDR — [nombre] (Skill #1)
✅ Tech Spec — [nombre] (Skill #2)
✅ User Stories — [X stories en Y épics] (Skill #3)
✅ Wireframes — [X pantallas] (Skill #4)
✅ Stitch Prompts — [X prompts + Design System] (Skill #5)

[O si son documentos existentes:]
He analizado los documentos proporcionados:
✅ plan.md → Equivalente a PDR + Tech Spec parcial
✅ tasks.md → Equivalente a User Stories + Plan de Fases parcial
✅ PRODUCT-SPEC.md → Equivalente a PDR completo
✅ [otros documentos]

Gaps identificados:
⚠️ [Lo que falta, si hay algo]
```

### Paso 2: Proponer Estructura de Fases

```
Propongo la siguiente estructura de [N] fases:

FASE 1: [Nombre] — [X días] — [Y stories]
  Entregable: [...]

FASE 2: [Nombre] — [X días] — [Y stories]
  Entregable: [...]

[...]

¿Apruebas esta estructura o quieres ajustar algo antes de que
genere el Blueprint completo?
```

### Paso 3: Generar el Blueprint

Solo después de aprobación del usuario, generar el documento completo.

### Paso 4: Preguntas de Refinamiento

```
Al usuario:
1. ¿Hay alguna fase que quieras reordenar o combinar?
2. ¿El timeline estimado se alinea con tu expectativa?
3. ¿Hay alguna tarea que falte o sobre?
4. ¿Quieres que marque fases ya completadas? (si hay trabajo previo)
```

---

## Ejemplo: Mapeo de Documentos Existentes a Blueprint

Cuando el usuario proporciona documentos de trabajo previo (como los archivos
plan.md, tasks.md, PRODUCT-SPEC.md del proyecto Virtual Staging), el agente
debe hacer este mapeo:

```
DOCUMENTO EXISTENTE          → SECCIÓN DEL BLUEPRINT
──────────────────────────────────────────────────────
plan.md
├── Executive Summary        → Visión del Producto
├── Technical Architecture   → Stack Técnico
├── Pricing Strategy         → (Info para stories de billing)
├── Core Workflows           → (Info para descomponer tareas)
├── Sprint Structure         → Timeline / Estimaciones
└── Post-MVP Roadmap         → Fase 10 (Post-MVP)

tasks.md
├── Phase 1-12               → Fases 1-N del Blueprint
│   ├── Subtasks [x]/[ ]     → Tareas con estado (completada/pendiente)
│   └── Implementation Notes → Notas Técnicas por fase
├── Current Status            → Marcar fases completadas
└── QA Testing Results       → Criterios de aceptación con evidencia

PRODUCT-SPEC.md
├── Business Overview        → Visión del Producto
├── Feature Specification    → (Enriquece User Stories)
├── User Stories             → Stories completos con AC
├── Database Schema          → Database Schema (copiar)
└── External Services        → Servicios Externos tabla

PRODUCTION_AUDIT.md
├── Known Issues             → Notas Técnicas (warnings)
├── Critical Issues          → Tareas adicionales en fase de Quality
└── Performance              → Input para fase de Polish
```

---

## Checklist de Calidad del Blueprint

El agente verifica antes de entregar:

```
ESTRUCTURA:
□ Tiene sección de Visión del Producto
□ Tiene tabla de Stack Técnico completa
□ Tiene Schema de DB (o referencia a migration files)
□ Tiene Design System Prompt
□ Tiene Resumen de Fases (tabla)
□ Cada fase tiene: stories, subfases/tareas, wireframes, stitch prompts, checklist
□ Tiene Apéndice de Mapeo US → Fase
□ Tiene Apéndice de Mapeo Pantallas → Fase
□ Tiene Apéndice de Dependencias
□ Tiene Apéndice de Timeline

CONTENIDO:
□ Todos los US del Skill #3 están asignados a una fase
□ Todos los wireframes del Skill #4 están incluidos
□ Todos los prompts del Skill #5 están incluidos
□ No hay stories duplicados entre fases
□ No hay dependencias circulares
□ Cada tarea tiene verbo de acción + es accionable en ≤1 día

COPY-PASTE READINESS:
□ Comandos de setup son copiables
□ Schema SQL es copiable (o tiene referencia exacta)
□ Prompts de Stitch son copiables
□ Wireframes ASCII están renderizados correctamente
□ Tabla de API keys tiene nombres exactos de variables

ESTIMACIONES:
□ Suma de duraciones ≈ timeline del PDR
□ Cada fase tiene duración estimada
□ No hay fases > 2 semanas (descomponer si las hay)
```

---

*"El Blueprint perfecto es aquel que hace innecesaria la reunión de kickoff.
Lo lees, lo sigues, y al final tienes una app."*
