---
name: la-herreria
description: >
  Pipeline inteligente para diseñar y planificar proyectos digitales desde una idea hasta
  un blueprint ejecutable. Arranca SIEMPRE con un MODE SELECTOR que determina el camino:
  🏗️ SaaS Completo (11 skills · 5-8h) · 🚀 MVP para Validar (7 skills · 2-3h) ·
  🔧 Herramienta Interna (10 skills · 4-6h) · 🎯 Landing Page (4 steps · ~1h) ·
  🤖 Feature con IA (7 steps · 2-4h). Todos los modos (excepto Landing) arrancan con
  Viability Check (Step 0) como go/no-go gate. Cada modo carga su route file desde routes/ y
  ejecuta solo los skills relevantes. Usa este skill siempre que el usuario quiera crear
  una app, validar una idea, diseñar un SaaS, construir una herramienta interna, o crear
  una landing page. Es el punto de entrada principal — el usuario solo habla con La Herrería
  y ella decide qué ruta tomar.
---

# La Herrería

> *"No necesitas saber qué skill usar. Solo dime qué quieres construir."*

Pipeline completo que transforma una idea en documentación ejecutable para construir un MVP.
En 5-8 horas de trabajo con Claude, produce documentación profesional que un equipo
puede usar para construir la aplicación.

```
IDEA → VIABILITY → BMC → PDR → Tech Spec → UX Research → User Stories → UX Design → UI Design WF → UI → Security Audit → Blueprint
          20m       30m    20m      15m          40m             30m          45m            45m          30m        60m           45m
```

---

## FASE 0: Mode Selector

> *"Antes de construir, saber qué estás construyendo."*

**Esta fase se ejecuta SIEMPRE al inicio, antes de cualquier skill.**

Cuando el usuario llega sin indicar un modo específico, presentar este menú:

```
¡Hola! Antes de arrancar, dime:

¿Qué quieres construir hoy?

1. 🏗️  SaaS Completo       — App production-ready con auth, pagos y seguridad  · 11 skills · 5-8 h
2. 🚀  MVP para Validar     — Prototype funcional para validar una idea rápido   ·  7 skills · 2-3 h
3. 🔧  Herramienta Interna  — Tool para tu equipo, sin landing ni pagos          · 10 skills · 4-6 h
4. 🎯  Landing Page         — Página de conversión sin backend                   ·  4 steps  ·  ~1 h
5. 🤖  Feature con IA       — Módulo AI para app existente o nueva               ·  7 steps  · 2-4 h

Escribe el número o el nombre.
```

### Acción Post-Selección

1. Confirmar el modo elegido
2. **Leer el route file:** `routes/[modo].md`
3. Mostrar el pipeline del modo con tiempos
4. Pedir confirmación para iniciar
5. Ejecutar los steps en orden según el route file

```
✅ Modo seleccionado: [Emoji] [Nombre]

Tu pipeline de hoy:
  Step 1 · [Nombre]  →  [output]  ·  [tiempo]
  Step 2 · [Nombre]  →  [output]  ·  [tiempo]
  ...

Tiempo estimado: [X horas]
¿Arrancamos con el Step 1?
```

### Detección de Modo Implícito

Si el usuario indica el tipo de proyecto sin elegir explícitamente, setear el modo sin preguntar:

| Si el usuario dice... | Modo detectado |
|---|---|
| "quiero una landing", "crea mi landing page" | 🎯 Landing Page |
| "solo quiero validar rápido", "prototipo", "MVP" | 🚀 MVP para Validar |
| "herramienta interna para mi equipo" | 🔧 Herramienta Interna |
| "integrar IA", "agregar AI a mi app", "feature con AI" | 🤖 Feature con IA |
| "SaaS completo", "quiero el pipeline completo" | 🏗️ SaaS Completo |
| Sin indicación clara | → Mostrar el menú de modos |

---

## Arquitectura del Skill

La Herrería es un **orquestador**. Coordina 10 skills especializados, cada uno experto
en una fase del diseño. Todos los skills viven dentro de esta misma carpeta y se cargan
automáticamente cuando se necesitan.

### Estructura de Archivos

```
la-herreria/
├── SKILL.md                          ← ESTE ARCHIVO (orchestrator + mode selector)
├── routes/                           ← Pipelines por Build Mode
│   ├── saas-completo.md              ← 🏗️  10 skills · 5-8 h
│   ├── mvp.md                        ← 🚀   6 skills · 2-3 h
│   ├── internal-tool.md              ← 🔧   9 skills · 4-6 h
│   ├── landing-page.md               ← 🎯   4 steps  · ~1 h
│   └── ai-feature.md                 ← 🤖   6 steps  · 2-4 h
├── references/
│   ├── skills-catalog.md             ← Descripciones detalladas de cada skill
│   ├── installation-guide.md         ← Cómo instalar La Herrería
│   ├── business-model-canvas.md      ← Los 9 bloques del BMC
│   ├── value-proposition-canvas.md   ← Las dos caras del VPC
│   ├── canvas-alignment.md           ← Los 5 checks de consistencia
│   ├── personas.md                   ← Cómo crear personas desde el VPC
│   ├── mental-models.md              ← Cómo mapear modelos mentales
│   ├── journey-mapping.md            ← Cómo crear journey maps
│   ├── information-architecture.md   ← Patrones de IA y navegación
│   ├── interaction-patterns.md       ← Feedback, forms, error recovery, state transitions
│   ├── usability-evaluation.md       ← 10 heurísticos de Nielsen + escala de severidad
│   ├── onboarding.md                 ← Patrones de onboarding y first success
│   ├── scenario-to-ui.md             ← Extracción de requisitos UI desde stories
│   ├── screen-flows.md               ← Estructura de screen flow documents
│   ├── component-selection.md        ← Árbol de decisión: usar / componer / crear
│   ├── acceptance-targets.md         ← 8 patrones para targets testeables
│   ├── security-checklist.md         ← OWASP Top 10 2025, auth, secretos, headers
│   ├── vibe-coding-risks.md          ← VCAL, trazabilidad, prompt injection, deuda AI
│   ├── scalability-patterns.md       ← Bottlenecks, KPIs, caching, DB indexing
│   └── observability-guide.md        ← Logging, métricas, circuit breakers, SLOs
└── assets/                           ← Skills del pipeline principal + assets por modo
    ├── 00-viability-check.md         ← Go/No-Go gate — viabilidad técnica, negocio, marketing
    ├── 01-business-model-canvas.md   ← BMC + VPC → modelo de negocio validado
    ├── 02-pdr-generator.md           ← Entrevista de producto → PDR
    ├── 03-tech-spec.md               ← PDR → especificación técnica
    ├── 04-ux-research.md             ← Personas + Modelos Mentales + Journey Maps
    ├── 05-user-stories.md            ← PDR + Spec + UX → user stories INVEST
    ├── 06-ux-design.md               ← IA + Interaction Patterns + Usabilidad + Onboarding
    ├── 07-ui-design-workflow.md      ← Stories + UX → Screen flows + acceptance targets
    ├── 08-ui.md                      ← Screen flows → UI implementada (Front Design)
    ├── 09-security-audit.md          ← UI → Auditoría seguridad + escalabilidad
    ├── 10-master-blueprint.md        ← Todo → plan de ejecución por fases
    ├── lean-canvas.md                ← 📋 Alternativa al BMC para startups (Ash Maurya)
    ├── job-stories.md                ← 🎯 Alternativa/complemento a User Stories
    ├── pre-mortem.md                 ← ⚠️ Análisis riesgos Tigers/Paper Tigers/Elephants
    ├── interview-script.md           ← 🎤 Guiones de entrevista (The Mom Test)
    ├── front-end-design.md           ← Principios de diseño visual distintivo (auxiliar Skill #8)
    ├── copywriting-cro.md            ← 🎯 Landing: copy CRO, messaging framework, psicología
    ├── seo-landing.md                ← 🎯 Landing: SEO técnico, schema markup, Core Web Vitals
    ├── ai-feature-design.md          ← 🤖 AI: modelo, patrones integración, API contract, fallbacks
    ├── prompt-engineering.md         ← 🤖 AI: system prompts, Zod outputs, versioning, golden tests
    ├── llm-cost-optimization.md      ← 🤖 AI: cost calculator, rate limiting, context compression
    ├── rag-pattern.md                ← 🤖 AI: RAG con pgvector, embeddings, similarity search
    ├── memory-pattern.md             ← 🤖 AI: memoria persistente (historial, preferencias, semántica)
    └── chat-with-docs.md             ← 🤖 AI: chat con documentos del usuario (upload + RAG + streaming)
```

### Carga de Skills

Los skills se cargan **automáticamente desde `assets/`** cuando se necesitan.
El usuario NO tiene que adjuntar nada manualmente.

**Protocolo de carga:**

1. Detectar qué paso del pipeline necesita ejecutarse
2. Leer el skill correspondiente: `assets/[nombre].md`
3. Ejecutar el skill siguiendo sus instrucciones
4. Al terminar, proponer el siguiente paso

```
Para ejecutar el Skill #6, el agente debe:
→ Leer: assets/06-ux-design.md
→ Seguir las instrucciones del skill al pie de la letra
→ Producir el output con la naming convention correcta
```

**Caso especial — Skill #8 (UI):**
Antes de ejecutar el Skill #8, leer TAMBIÉN `assets/front-end-design.md` para
aplicar los principios de diseño visual distintivo (anti-AI-slop).
El Skill #8 ya lo indica en su workflow — pero el orquestador debe asegurarse
de que esté en contexto antes de ejecutar.

**Caso especial — 🎯 Landing Page:**
Los steps especializados de este modo cargan assets propios (no del pipeline principal):
- Step 2 → `assets/copywriting-cro.md`
- Step 4 → `assets/seo-landing.md`

**Caso especial — 🤖 Feature con IA:**
Los steps especializados de este modo cargan assets propios según el subtipo elegido en Step 1:
- Step 2 → `assets/ai-feature-design.md` (siempre)
  - Subtipo B (RAG) → añadir `assets/rag-pattern.md`
  - Subtipo C (Chat con Docs) → usar `assets/chat-with-docs.md` (reemplaza Steps 2-4)
  - Subtipo D (Memoria) → añadir `assets/memory-pattern.md`
- Step 4 → `assets/prompt-engineering.md`
- Step 6 → `assets/llm-cost-optimization.md`

Siempre leer el route file del modo (`routes/[modo].md`) para saber exactamente
qué asset cargar en cada step — los route files son la fuente de verdad.

---

## Los 10 Skills

| # | Skill | Asset | Qué produce | Tiempo |
|---|-------|-------|-------------|--------|
| 1 | Business Model Canvas | `assets/01-business-model-canvas.md` | BMC + VPC + Alineación | 20-40 min |
| 2 | PDR Generator | `assets/02-pdr-generator.md` | Product Definition Report | 15-30 min |
| 3 | Tech Spec | `assets/03-tech-spec.md` | Stack, DB schema, arquitectura | 10-20 min |
| 4 | UX Research | `assets/04-ux-research.md` | Personas + Modelos Mentales + Journey Maps | 30-45 min |
| 5 | User Stories | `assets/05-user-stories.md` | Epics + Stories INVEST | 20-40 min |
| 6 | UX Design | `assets/06-ux-design.md` | IA + Interaction Patterns + Usabilidad + Onboarding | 30-50 min |
| 7 | UI Design Workflow | `assets/07-ui-design-workflow.md` | Screen flows + acceptance targets | 30-60 min |
| 8 | UI | `assets/08-ui.md` | Design System + UI implementada | 30-60 min |
| 9 | Security Audit | `assets/09-security-audit.md` | Auditoría seguridad + escalabilidad + observabilidad | 45-75 min |
| 10 | Blueprint | `assets/10-master-blueprint.md` | Plan de ejecución completo | 30-60 min |
| — | Front-End Design | `assets/front-end-design.md` | Principios estéticos (auxiliar) | — |

### Skills Opcionales (se ofrecen en checkpoints)

| Skill | Asset | Cuándo se ofrece | Qué produce |
|-------|-------|-----------------|-------------|
| Lean Canvas | `assets/lean-canvas.md` | Step 1 — como alternativa al BMC | `LEAN-CANVAS-[nombre].md` |
| Interview Script | `assets/interview-script.md` | Post Step 4 — para validar personas | `INTERVIEW-SCRIPT-[nombre].md` |
| Job Stories | `assets/job-stories.md` | Step 5 — como alternativa/complemento | `JOB-STORIES-[nombre].md` |
| Pre-Mortem | `assets/pre-mortem.md` | Step 9 — antes del Security Audit | `PRE-MORTEM-[nombre].md` |

Para descripciones completas: `references/skills-catalog.md`

---

## Detección de Estado

Cuando el usuario inicia conversación, detectar en qué punto está del pipeline.

### A) Desde Cero

**Señales:** "tengo una idea", "quiero crear una app", "empezar un proyecto", o similar
sin documentos previos.

**Acción:**
```
1. Leer assets/01-business-model-canvas.md
2. Ejecutar la entrevista estratégica del Skill #1
3. Producir BMC-[nombre].md y VPC-[nombre].md
```

Mensaje al usuario:
```
¡Vamos a construir tu app! Empezamos con lo más importante:
entender cómo tu negocio crea, entrega y captura valor.
Esto hará que todo lo que viene después sea más preciso.

[Iniciar entrevista estratégica del Skill #1]
```

### B) Con Trabajo Previo

**Señales:** El usuario adjunta documentos (plan.md, PDR, spec, wireframes) o dice
"ya tengo documentación".

**Acción:** Analizar los documentos y mapear al pipeline.

```
Analizando tus documentos...

✅ BMC/VPC — Equivalente en [documento]
✅ PDR — Equivalente en [documento]
✅ Tech Spec — Equivalente en [documento]
⚠️ UX Research — Parcial, faltan [X]
⚠️ User Stories — Parcial, faltan [X]
❌ UX Design — No encontrado
❌ UI Design Workflow — No encontrado
❌ UI — No implementado
❌ Security Audit — Pendiente
❌ Blueprint — Pendiente

Recomiendo continuar desde [siguiente paso pendiente].
¿Procedemos?
```

### C) Skill Específico

**Señales:** "hazme screen flows", "genera user stories", "necesito el blueprint", "audita el código".

**Acción:** Verificar inputs necesarios → resolver dependencias → leer asset → ejecutar.

```
Para generar [lo pedido] necesito:
✅ PDR → [encontrado/adjuntado]
❌ Tech Spec → [necesario — ¿lo tienes o lo generamos primero?]

[Resolver dependencias → Leer asset → Ejecutar]
```

### D) Retomar Pipeline

**Señales:** "¿en qué quedamos?", "quiero continuar", outputs previos del pipeline.

**Acción:** Detectar progreso por naming convention y proponer siguiente paso.

```
Tu progreso:
✅ BMC-[nombre].md — Completado
✅ VPC-[nombre].md — Completado
✅ PDR-[nombre].md — Completado
✅ TECH-SPEC-[nombre].md — Completado
✅ docs/ux-research/ — Completado
✅ USER-STORIES-[nombre].md — Completado
✅ docs/ux-design/ — Completado
✅ docs/ui-design/ — Completado
✅ UI-[nombre].md — Completado
⬜ Security Audit — SIGUIENTE
⬜ Blueprint — Pendiente

¿Continuamos con la Auditoría de Seguridad y Escalabilidad?
```

---

## Coordinación Entre Skills

### Naming Convention

Todos los outputs siguen el mismo patrón. El `[nombre-kebab]` se define en el Skill #1
y se mantiene consistente en todo el pipeline:

| Skill | Archivo Output |
|-------|---------------|
| #1 | `BMC-[nombre].md` + `VPC-[nombre].md` |
| #2 | `PDR-[nombre].md` |
| #3 | `TECH-SPEC-[nombre].md` |
| #4 | `docs/ux-research/` (personas/, mental-models/, journeys/) |
| #5 | `USER-STORIES-[nombre].md` |
| #6 | `docs/ux-design/` (information-architecture.md, interaction-patterns.md, onboarding.md, usability-evaluation/) |
| #7 | `docs/ui-design/screen-flows/` + `docs/ui-design/components/` |
| #8 | `UI-[nombre].md` + `src/features/` + `src/shared/ui/` |
| #9 | `SECURITY-AUDIT-[nombre].md` |
| #10 | `BLUEPRINT-[nombre].md` |

### Handoff Entre Skills

Cuando un skill termina:

1. **Confirmar output** con el usuario antes de continuar
2. **Ofrecer el siguiente paso** sin forzarlo
3. **Mantener contexto** — no repetir preguntas ya respondidas en skills anteriores

```
✅ [Skill] completado → [archivo].md

Siguiente: [Nombre del próximo skill]
[Qué hará en una línea]

¿Procedemos o ajustamos algo primero?
```

### Handoff Post-Blueprint (Skill #10 → El Crisol / La Forja)

Cuando el Blueprint (Skill #10) termina, La Herrería ofrece dos caminos.

```
✅ Blueprint completado → BLUEPRINT-[nombre].md

El plan está listo. Siguiente paso:

→ /crisol — Validación estratégica (7 análisis + dashboard ejecutivo con veredicto go/no-go)
→ /build  — Ir directo a construir (Build Manual o Modo Forja)

Recomendación: Si el proyecto justifica >40h de desarrollo o necesitas
presentar a stakeholders, pasa por El Crisol primero.
```

La Forja (`skills/la-forja/SKILL.md`) se activa desde `/build` cuando el usuario
elige **Modo Forja**: lanza N agentes autónomos en Git Worktrees paralelos, cada
uno con su propia personalidad (Literal, Creativo, Disruptivo, etc.) y entorno
aislado de Supabase.

### Reglas de Contexto

Estas reglas son críticas para la coherencia del pipeline:

1. **No repetir preguntas.** Si el PDR estableció el usuario objetivo, los skills
   posteriores lo toman de ahí sin volver a preguntar.

2. **No contradecir decisiones.** Si el Tech Spec eligió "Next.js + Supabase",
   todos los skills posteriores respetan esa decisión.

3. **Propagar cambios.** Si el usuario modifica el PDR después de tener Stories,
   avisar que los Stories pueden necesitar actualización.

4. **Nunca inventar.** Si el PDR no menciona una feature, ningún skill la agrega.
   La innovación viene del usuario, no del pipeline.

5. **Hallazgos críticos bloquean.** Si el Skill #9 encuentra vulnerabilidades críticas,
   el Blueprint (Skill #10) no se genera hasta resolverlas.

### Cuándo Saltar Skills

No siempre se necesitan los 10 skills:

| Situación | Saltar | Razón |
|-----------|--------|-------|
| Ya tiene BMC/modelo de negocio | #1 | Empieza directo en PDR |
| Ya tiene diseños en Figma | #6, #7, #8 | No necesita generar UI |
| Solo quiere el plan | #6, #7, #8, #9 | Stories → Blueprint directo |
| Ya tiene stories | #1, #2, #3, #4 | Empieza en UX Design |
| Solo quiere el PDR | #3-#10 | Solo exploración de idea |
| Tiene docs completos | #1-#8 | Security Audit → Blueprint |
| Ya hizo research previo | #4 | Empieza en User Stories con UX existente |
| Ya tiene IA y patrones definidos | #6 | Empieza en UI Design Workflow |
| Ya tiene auditoría aprobada | #9 | Empieza directo en Blueprint |

**Siempre preguntar antes de saltar:**

```
Dado que ya tienes [X], podemos saltar a [Y].
¿O prefieres que complementemos [X] primero?
```

---

## Secuencia de Ejecución para el Agente

Al recibir este skill, tu rol es de **Director de Proyecto**. No ejecutas todo tú
— coordinas y delegas a los skills especializados leyéndolos de `assets/`.

### Loop Principal

```
0. FASE 0: Si BUILD_MODE no está seteado → ejecutar MODE SELECTOR (ver sección FASE 0)
1. LEER el route file: routes/[BUILD_MODE].md
2. Mostrar el pipeline del modo con tiempos y pedir confirmación
3. Para cada step del route file:
   a. Detectar estado del usuario (trabajo previo / desde cero)
   b. Verificar que los inputs del step están disponibles
   c. LEER el asset correspondiente: assets/[NN]-[nombre].md
   d. EJECUTAR el skill siguiendo SUS instrucciones (no las tuyas)
   e. Producir el output con la naming convention correcta
   f. Confirmar output con el usuario
   g. Proponer siguiente step
4. Repetir hasta completar el pipeline del modo o hasta donde el usuario quiera
```

### Orden de Lectura de Assets por Skill

| Al ejecutar... | Leer primero |
|----------------|-------------|
| Skill #1 | `assets/01-business-model-canvas.md` |
| Skill #2 | `assets/02-pdr-generator.md` |
| Skill #3 | `assets/03-tech-spec.md` |
| Skill #4 | `assets/04-ux-research.md` |
| Skill #5 | `assets/05-user-stories.md` |
| Skill #6 | `assets/06-ux-design.md` |
| Skill #7 | `assets/07-ui-design-workflow.md` |
| Skill #8 | `assets/front-end-design.md` → luego `assets/08-ui.md` |
| Skill #9 | `assets/09-security-audit.md` |
| Skill #10 | `assets/10-master-blueprint.md` |

El Skill #8 es el único que requiere leer DOS assets: primero el de front-end-design
(para los principios estéticos anti-AI-slop) y luego el de `08-ui.md`.

---

## Pipeline Visual

```
┌──────────────────────────────────────────────────────────────────┐
│                        APP FACTORY                                │
│                                                                   │
│  ┌─────────┐   ┌─────────┐   ┌──────────┐   ┌───────────────┐  │
│  │ SKILL 1 │──→│ SKILL 2 │──→│ SKILL 3  │──→│   SKILL 4     │  │
│  │   BMC   │   │   PDR   │   │Tech Spec │   │  UX Research  │  │
│  │  + VPC  │   │         │   │          │   │Personas+Mental│  │
│  └─────────┘   └─────────┘   └──────────┘   │Models+Journeys│  │
│                                              └───────┬───────┘  │
│                                                      │           │
│                                                      ▼           │
│                                              ┌───────────────┐  │
│                                              │   SKILL 5     │  │
│                                              │ User Stories  │  │
│                                              └───────┬───────┘  │
│                                                      │           │
│                                                      ▼           │
│                                              ┌───────────────┐  │
│                                              │   SKILL 6     │  │
│                                              │  UX Design    │  │
│                                              │ IA+Patterns+  │  │
│                                              │Usablt+Onboard │  │
│                                              └───────┬───────┘  │
│                                                      │           │
│                                                      ▼           │
│                                              ┌───────────────┐  │
│                                              │   SKILL 7     │  │
│                                              │ UI Design WF  │  │
│                                              │Screen flows + │  │
│                                              │Accept targets │  │
│                                              └───────┬───────┘  │
│                                                      │           │
│                                                      ▼           │
│                                              ┌───────────────┐  │
│                                              │   SKILL 8     │  │
│                                              │      UI       │ ← front-end │
│                                              │ (anti-slop)   │   design    │
│                                              └───────┬───────┘  │
│                                                      │           │
│                                                      ▼           │
│                                              ┌───────────────┐  │
│                                              │   SKILL 9     │  │
│                                              │   Security    │  │
│                                              │    Audit      │  │
│                                              │ OWASP+Vibe+   │  │
│                                              │ Scale+Observ  │  │
│                                              └───────┬───────┘  │
│                                                      │           │
│                                              [Sin críticos]      │
│                                                      │           │
│                                                      ▼           │
│                                              ┌───────────────┐  │
│                                              │   SKILL 10    │  │
│                                              │    Master     │ ← todo junto │
│                                              │   Blueprint   │  │
│                                              └───────┬───────┘  │
│                                                      │           │
│                                                      ▼           │
│                                              ┌───────────────┐  │
│                                              │  ENTREGABLE   │  │
│                                              │  BLUEPRINT-   │  │
│                                              │ [nombre].md   │  │
│                                              └───────────────┘  │
│                                                                   │
│  Tiempo total: 5-8 horas → Documentación completa para MVP       │
└──────────────────────────────────────────────────────────────────┘
```

---

## Frases de Activación

**Frases que activan el MODE SELECTOR (FASE 0):**

| El usuario dice... | Acción |
|--------------------|--------|
| "Tengo una idea", "quiero crear algo" | → **FASE 0**: mostrar menú de modos |
| "App factory" | → **FASE 0**: presentarse + mostrar menú de modos |
| "Quiero empezar un proyecto" | → **FASE 0**: mostrar menú de modos |

**Frases que detectan modo implícito (saltar menú, ir directo al route):**

| El usuario dice... | Modo detectado | Acción |
|--------------------|---------------|--------|
| "Quiero crear un SaaS completo" | 🏗️ SaaS Completo | → Leer `routes/saas-completo.md` |
| "Quiero una landing page" | 🎯 Landing Page | → Leer `routes/landing-page.md` |
| "Solo quiero validar rápido / MVP" | 🚀 MVP | → Leer `routes/mvp.md` |
| "Herramienta interna para mi equipo" | 🔧 Internal Tool | → Leer `routes/internal-tool.md` |
| "Integrar IA / feature con AI" | 🤖 AI Feature | → Leer `routes/ai-feature.md` |

**Frases que van directo al skill (dentro de un modo ya activo):**

| El usuario dice... | Acción |
|--------------------|--------|
| "Analiza mi modelo de negocio" | → Leer `assets/01-business-model-canvas.md` |
| "Genera el PDR" | → Leer `assets/02-pdr-generator.md` |
| "Define el stack para [proyecto]" | → Leer `assets/03-tech-spec.md` |
| "Crea las personas / UX research" | → Leer `assets/04-ux-research.md` |
| "Genera user stories" | → Leer `assets/05-user-stories.md` |
| "Define la arquitectura / navegación" | → Leer `assets/06-ux-design.md` |
| "Diseña los screen flows" | → Leer `assets/07-ui-design-workflow.md` |
| "Implementa el UI / diseño front-end" | → Leer `assets/front-end-design.md` → luego `assets/08-ui.md` |
| "Audita la seguridad / escalabilidad" | → Leer `assets/09-security-audit.md` |
| "Genera el blueprint" | → Leer `assets/10-master-blueprint.md` |
| "¿En qué quedamos?" | → Detectar estado → siguiente skill del route activo |
| "Tengo estos documentos" | → Analizar → mapear al route → continuar |
| "La forja", "modo forja", "sandboxes", "agentes autónomos" | → Usar `/build` para activar La Forja |

---

## Estimación del Pipeline Completo

| Paso | Skill | Tiempo | Acumulado |
|------|-------|--------|-----------|
| 1 | Business Model Canvas | 20-40 min | 20-40 min |
| 2 | PDR Generator | 15-30 min | 35-70 min |
| 3 | Tech Spec | 10-20 min | 45-90 min |
| 4 | UX Research | 30-45 min | 75-135 min |
| 5 | User Stories | 20-40 min | 95-175 min |
| 6 | UX Design | 30-50 min | 125-225 min |
| 7 | UI Design Workflow | 30-60 min | 155-285 min |
| 8 | UI (Front Design) | 30-60 min | 185-345 min |
| 9 | Security Audit | 45-75 min | 230-420 min |
| 10 | Blueprint | 30-60 min | 260-480 min |
| **Total** | | **5-8 horas** | |

---

*"De idea a blueprint en una tarde. Eso es La Herrería."*
