# Skill #0 — Viability Check (Go/No-Go Gate)

> *"La mejor feature es la que no construyes porque no tiene mercado."*

## Qué Hace

Evalúa rápidamente si una idea vale la pena ANTES de invertir horas en planificación completa. Cubre tres dimensiones: **Viabilidad Técnica**, **Viabilidad de Negocio** y **Viabilidad de Marketing**. El resultado es un veredicto claro: GO, CAUTION, o NO-GO.

**Tiempo:** ~20 minutos
**Input:** La idea del usuario (sin documentos previos)
**Output:** `VIABILITY-[nombre].md`

---

## Referencias

Consultar si están disponibles:
- `references/business-model-canvas.md` — Modelos de negocio viables
- `references/canvas-alignment.md` — Checks de consistencia
- `references/scalability-patterns.md` — Viabilidad técnica de scaling
- `references/vibe-coding-risks.md` — Riesgos técnicos específicos de AI-assisted dev

---

## Workflow

### Fase 1: Entrevista Rápida (~5 min)

Haz estas preguntas al usuario. Si ya proporcionó contexto, extrae las respuestas sin preguntar de nuevo.

**Sobre el problema:**
1. ¿Qué problema resuelve? (en una oración)
2. ¿Quién tiene este problema? (persona específica, no "todos")
3. ¿Cómo lo resuelven HOY sin tu producto?

**Sobre el mercado:**
4. ¿Conoces competidores directos? ¿Cuáles?
5. ¿Has hablado con usuarios potenciales? ¿Cuántos?
6. ¿Estarían dispuestos a pagar? ¿Cuánto crees?

**Sobre la ejecución:**
7. ¿Tienes deadline o presión de tiempo?
8. ¿Esto es un proyecto personal, startup, o para un cliente?

> **Regla:** Si el usuario no sabe responder #1 y #2, es una señal fuerte de NO-GO. Ayúdalo a refinar antes de continuar.

---

### Fase 2: Análisis de Viabilidad (~10 min)

Evalúa cada dimensión con una puntuación de 1-5 y justificación.

#### 2A. Viabilidad Técnica

| Criterio | Pregunta Clave | Peso |
|----------|---------------|------|
| **Golden Path Fit** | ¿Se puede construir con Next.js + Supabase + Vercel? | 30% |
| **APIs Externas** | ¿Necesita integraciones que no existen o son inestables? | 25% |
| **Complejidad** | ¿Cuántas features core necesita el MVP? (ideal: 1-3) | 25% |
| **Datos** | ¿Necesita datos que no se pueden conseguir fácilmente? | 20% |

**Scoring:**
- 5: Todo en Golden Path, 1-2 features core, sin APIs raras
- 4: Golden Path + 1-2 integraciones estándar (Stripe, OpenAI, etc.)
- 3: Necesita alguna integración no trivial pero factible
- 2: Requiere infra fuera del Golden Path (ML custom, real-time heavy, etc.)
- 1: Imposible o extremadamente complejo con el stack actual

#### 2B. Viabilidad de Negocio

| Criterio | Pregunta Clave | Peso |
|----------|---------------|------|
| **Problema claro** | ¿El problema es específico y doloroso? | 30% |
| **Mercado identificable** | ¿Puedes nombrar dónde están los usuarios? | 25% |
| **Monetización** | ¿Hay un modelo de cobro obvio? | 25% |
| **Diferenciación** | ¿Por qué esto y no la competencia? | 20% |

**Scoring:**
- 5: Problema burning, mercado claro, monetización obvia, diferenciación fuerte
- 4: Problema real, mercado definido, monetización plausible
- 3: Problema existe pero no es urgente, mercado difuso
- 2: Problema débil, no claro quién paga
- 1: Solución buscando problema

#### 2C. Viabilidad de Marketing

| Criterio | Pregunta Clave | Peso |
|----------|---------------|------|
| **Canal de adquisición** | ¿Cómo llegan los primeros 100 usuarios? | 35% |
| **Explicabilidad** | ¿Se entiende en 10 segundos qué hace? | 30% |
| **Timing** | ¿Por qué ahora y no hace 2 años? | 20% |
| **Viral potential** | ¿Los usuarios lo compartirían orgánicamente? | 15% |

**Scoring:**
- 5: Canal claro, producto self-explanatory, timing perfecto
- 4: Canal identificado, producto entendible con demo
- 3: Canal posible pero requiere inversión, messaging confuso
- 2: No hay canal claro, requiere mucha educación de mercado
- 1: No se puede explicar fácilmente, no hay canal viable

---

### Fase 3: Veredicto (~5 min)

Calcula el **Viability Score** (promedio ponderado):

```
Score = (Técnica × 0.30) + (Negocio × 0.40) + (Marketing × 0.30)
```

| Score | Veredicto | Acción |
|-------|-----------|--------|
| **4.0 - 5.0** | 🟢 **GO** | Proceder con La Herrería. La idea tiene potencial claro. |
| **2.5 - 3.9** | 🟡 **CAUTION** | Proceder con precauciones. Listar riesgos y mitigation plan. Recomendar MVP route. |
| **1.0 - 2.4** | 🔴 **NO-GO** | Detener. Explicar por qué. Sugerir pivots o alternativas. |

---

## Output Format

```markdown
# VIABILITY-[nombre]

> Análisis de viabilidad generado por Forge · [fecha]

## Resumen Ejecutivo

**Idea:** [una línea]
**Veredicto:** [🟢 GO | 🟡 CAUTION | 🔴 NO-GO]
**Score:** [X.X / 5.0]
**Ruta recomendada:** [🏗️ SaaS Completo | 🚀 MVP | 🔧 Herramienta Interna | 🎯 Landing]

---

## Análisis por Dimensión

### Viabilidad Técnica: [X/5]
- **Golden Path Fit:** [evaluación]
- **APIs Externas:** [evaluación]
- **Complejidad:** [evaluación]
- **Datos:** [evaluación]

### Viabilidad de Negocio: [X/5]
- **Problema:** [evaluación]
- **Mercado:** [evaluación]
- **Monetización:** [evaluación]
- **Diferenciación:** [evaluación]

### Viabilidad de Marketing: [X/5]
- **Canal de adquisición:** [evaluación]
- **Explicabilidad:** [evaluación]
- **Timing:** [evaluación]
- **Viral potential:** [evaluación]

---

## Riesgos Identificados

| # | Riesgo | Probabilidad | Impacto | Mitigación |
|---|--------|-------------|---------|------------|
| 1 | [riesgo] | Alta/Media/Baja | Alto/Medio/Bajo | [cómo mitigar] |

---

## Recomendación

[Párrafo con la recomendación clara: proceder, pivotar, o detenerse. Si es CAUTION, incluir qué validar antes de invertir más tiempo.]

### Si GO → Siguiente paso
Proceder con **Step 1 (BMC)** del pipeline [ruta recomendada].

### Si CAUTION → Qué validar primero
1. [acción de validación 1]
2. [acción de validación 2]
3. [acción de validación 3]

### Si NO-GO → Alternativas sugeridas
1. [pivot idea 1]
2. [pivot idea 2]
```

---

## Reglas

1. **Sé honesto, no complaciente.** Si la idea no es viable, dilo con respeto pero sin suavizar.
2. **Siempre sugiere alternativas.** Un NO-GO no es un callejón sin salida — es una redirección.
3. **No adivines datos de mercado.** Si no tienes info, marca como "Requiere validación" y sugiere cómo obtenerla.
4. **El score más bajo de las 3 dimensiones es el techo.** Un 5 en técnica y 1 en negocio = NO-GO.
5. **Sesgo hacia la acción.** En caso de duda entre CAUTION y GO, elige CAUTION con plan de validación, no NO-GO.
