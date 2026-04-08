# Route: 🚀 MVP para Validar

> *"Valida la idea antes de construir la solución perfecta."*

## Metadata

- **Modo:** 🚀 MVP para Validar
- **Descripción:** Prototype funcional enfocado en validar la hipótesis central del negocio
- **Tiempo estimado:** 2h 20m - 3h 20m
- **Skills activos:** 7 de 10 (incluye Viability Check)
- **Cuándo usar:** Cuando necesitas mostrar algo funcionando rápido, validar con usuarios reales, o decidir si vale la pena construir el SaaS completo

---

## Pipeline

```
VIABILITY → BMC (lean) → PDR → Tech Spec → User Stories → UI (core) → Blueprint (lean)
   #0           #1         #2      #3           #5             #8            #10
  20m          20m        15m     10m          20m            30m            20m
```

**Skipped:** UX Research (#4), UX Design (#6), UI Design Workflow (#7), Security Audit (#9)

---

### Step 0 · Viability Check (Go/No-Go Gate)

- **Asset:** `assets/00-viability-check.md`
- **Output:** `VIABILITY-[nombre].md`
- **Tiempo:** ~20 min
- **Qué hace:** Evaluación rápida de viabilidad técnica, negocio y marketing
- **Inputs requeridos:** Solo la idea del usuario
- **Gate:** Si NO-GO → detener. Si CAUTION o GO → continuar con BMC lean.

---

### Step 1 · Business Model Canvas (Versión Lean)

- **Asset:** `assets/01-business-model-canvas.md`
- **Output:** `BMC-[nombre].md`
- **Tiempo:** ~20 min
- **Qué hace:** Versión enfocada del BMC — solo los bloques esenciales para el MVP
- **Inputs requeridos:** `VIABILITY-[nombre].md` (contexto) + idea del usuario
- **Adaptación para MVP:**
  - Enfocarse en: Segmento de clientes, Propuesta de valor, Canales, Fuentes de ingreso
  - Saltar o simplificar: Estructura de costos detallada, Alianzas clave elaboradas
  - Pregunta clave: *"¿Qué hipótesis central estamos validando con este MVP?"*
  - **Producir solo `BMC-[nombre].md`** — VPC es opcional en este modo

---

### Step 2 · PDR Generator

- **Asset:** `assets/02-pdr-generator.md`
- **Output:** `PDR-[nombre].md`
- **Tiempo:** ~15 min
- **Qué hace:** Product Definition Report — define el scope del MVP
- **Inputs requeridos:** `BMC-[nombre].md`
- **Adaptación para MVP:**
  - Scope estricto: máximo 3 features core para validar la hipótesis
  - Incluir explícitamente la sección "Fuera de Scope"
  - Definir la métrica de validación: *"El MVP es exitoso si [métrica] alcanza [valor]"*

---

### Step 3 · Tech Spec

- **Asset:** `assets/03-tech-spec.md`
- **Output:** `TECH-SPEC-[nombre].md`
- **Tiempo:** ~10 min
- **Qué hace:** Stack mínimo necesario, DB schema básico
- **Inputs requeridos:** `PDR-[nombre].md`
- **Adaptación para MVP:**
  - Stack: Golden Path de Forge (Next.js + Supabase) — no explorar alternativas
  - DB schema: Solo las tablas esenciales para las 3 features core
  - No incluir: caching, optimizaciones, infraestructura avanzada

---

### Step 4 · User Stories (Core Only)

- **Asset:** `assets/05-user-stories.md`
- **Output:** `USER-STORIES-[nombre].md`
- **Tiempo:** ~20 min
- **Qué hace:** User stories solo para las features del MVP
- **Inputs requeridos:** `PDR-[nombre].md` + `TECH-SPEC-[nombre].md`
- **Adaptación para MVP:**
  - Máximo 1-2 epics, 5-8 stories en total
  - Criterio de prioridad: *"¿Esta story ayuda a validar la hipótesis central?"*
  - Si no ayuda a validar → fuera del MVP

---

### Step 5 · UI (Core Screens)

- **Asset:** `assets/front-end-design.md` → luego `assets/08-ui.md`
- **Output:** `UI-[nombre].md` + pantallas core en `src/features/`
- **Tiempo:** ~30 min
- **Qué hace:** Solo las pantallas necesarias para el flujo de validación
- **Inputs requeridos:** `USER-STORIES-[nombre].md`
- **Adaptación para MVP:**
  - Máximo 3-5 pantallas: onboarding/registro, feature core, resultado/valor
  - Diseño funcional pero presentable — no pulir hasta validar
  - Leer `front-end-design.md` para no caer en AI-slop incluso en MVP

---

### Step 6 · Blueprint (Lean)

- **Asset:** `assets/10-master-blueprint.md`
- **Output:** `BLUEPRINT-[nombre].md`
- **Tiempo:** ~20 min
- **Qué hace:** Plan de construcción del MVP + criterios de validación + next steps si valida
- **Inputs requeridos:** Todos los outputs anteriores
- **Adaptación para MVP:**
  - Fase única de construcción (no múltiples fases)
  - Incluir: Criterios de éxito del MVP, métricas a medir, qué construir después si valida
  - Estimación realista: *"Este MVP se construye en [X días/semanas]"*

---

## Outputs Finales

| Archivo | Generado en |
|---------|-------------|
| `BMC-[nombre].md` | Step 1 |
| `PDR-[nombre].md` | Step 2 |
| `TECH-SPEC-[nombre].md` | Step 3 |
| `USER-STORIES-[nombre].md` | Step 4 |
| `UI-[nombre].md` | Step 5 |
| `BLUEPRINT-[nombre].md` | Step 6 ← **Entregable final** |

---

## Qué se Omite y Por Qué

| Skill omitido | Razón |
|---------------|-------|
| UX Research (#4) | Personas y journey maps toman tiempo; en MVP hablas directamente con los usuarios |
| UX Design (#6) | IA y patterns son necesarios en producto maduro; el MVP valida antes de optimizar |
| UI Design Workflow (#7) | Screen flows detallados no aportan velocidad de validación |
| Security Audit (#9) | No hay datos de producción reales; se hace antes de escalar |

---

## El MVP Valida — ¿Y Después?

Si el MVP valida la hipótesis, el siguiente paso es migrar a **Route: SaaS Completo**.
Los outputs del MVP son inputs válidos para ese pipeline:
- `BMC` y `PDR` son reusables (ampliarlos, no rehacerlos)
- `TECH-SPEC` puede extenderse
- Las `USER-STORIES` del MVP se convierten en el backlog base

---

*"Un MVP no es una versión barata del producto — es el experimento mínimo para aprender máximo."*
