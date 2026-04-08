# Interview Script (Guiones de Entrevista — The Mom Test)

> *"Si le preguntas a tu mamá si tu idea es buena, te va a decir que sí. Por eso las preguntas importan más que las respuestas."*

## Qué Hace

Genera **guiones de entrevista de usuario** basados en los principios de **The Mom Test** (Rob Fitzpatrick).
El objetivo: hacer preguntas que ni tu mamá podría responder con falsos positivos.

**Cuándo usar:**
- Después de crear Personas (Step 4 — UX Research)
- Para validar hipótesis del Lean Canvas o BMC
- Antes de invertir en desarrollo — validar que el problema es real
- Cuando el Viability Check dio CAUTION y necesita validación

---

## Los 3 Principios de The Mom Test

| Principio | Mal (Mom Test fail) | Bien (Mom Test pass) |
|-----------|--------------------|--------------------|
| **Habla de su vida, no de tu idea** | "¿Usarías mi app para X?" | "¿Cómo manejas X actualmente?" |
| **Pregunta sobre el pasado, no el futuro** | "¿Pagarías $29/mes por esto?" | "¿Cuánto gastas hoy en resolver esto?" |
| **Habla menos, escucha más** | Pitchear tu solución 10 min | Preguntar y dejar que hablen 80% del tiempo |

---

## Inputs

- `docs/ux-research/personas/` — Personas definidas (si existen)
- `BMC-[nombre].md` o `LEAN-CANVAS-[nombre].md` — Hipótesis de negocio
- `VIABILITY-[nombre].md` — Riesgos identificados
- Contexto conversacional del usuario

---

## Workflow

### Paso 1: Definir Objetivos de la Entrevista

Preguntar al usuario:

```
Para crear un guión de entrevista efectivo, necesito entender:

1. ¿A quién vas a entrevistar? (rol, contexto, cómo los encuentras)
2. ¿Qué hipótesis quieres validar? (máximo 3)
3. ¿Ya tienes acceso a estas personas o necesitas encontrarlas?
4. ¿Cuántas entrevistas planeas hacer? (recomiendo 5-10)
```

Si hay Personas del UX Research, usarlas como base.
Si hay Lean Canvas, extraer las hipótesis de baja confianza.

### Paso 2: Generar el Guión

Estructura de una entrevista de 20-30 minutos:

**1. Apertura (2 min):**
- Agradecer el tiempo
- Explicar que NO estás vendiendo nada
- Pedir permiso para tomar notas
- "No hay respuestas correctas o incorrectas"

**2. Contexto (5 min) — Entender su mundo:**
- "Cuéntame sobre tu día típico cuando [contexto del problema]"
- "¿Cuál es tu rol y qué responsabilidades tienes?"
- "¿Qué herramientas usas actualmente para [dominio]?"

**3. Problema (10 min) — Validar que el dolor existe:**
- "¿Cuál es la parte más frustrante de [proceso]?"
- "Cuéntame la última vez que te pasó [problema]. ¿Qué hiciste?"
- "¿Con qué frecuencia te encuentras con esto?"
- "¿Qué has intentado para resolverlo? ¿Qué pasó?"
- "Si pudieras hacer desaparecer un problema de tu día, ¿cuál sería?"

**4. Comportamiento Actual (5 min) — Entender alternativas:**
- "¿Cómo resuelves esto hoy? Paso a paso."
- "¿Cuánto tiempo te toma?"
- "¿Cuánto gastas actualmente en esto?" (dinero, tiempo, frustración)
- "¿Has buscado soluciones? ¿Qué encontraste?"

**5. Valor y Disposición a Pagar (5 min):**
- "¿Qué significaría para ti resolver este problema?"
- "¿Qué has pagado por herramientas similares?"
- "Si existiera una solución perfecta, ¿cuánto sería razonable pagar?"
- "¿Quién toma la decisión de compra? ¿Tú o alguien más?"

**6. Cierre (3 min):**
- "¿Hay algo que no te pregunté y debería saber?"
- "¿Conoces a alguien más que tenga este problema?"
- "¿Puedo contactarte de nuevo si tengo más preguntas?"

### Paso 3: Generar Preguntas Anti-Mom-Test

Para cada hipótesis del usuario, generar versiones Mom Test:

```
HIPÓTESIS: "Los realtors necesitan staging virtual"

❌ Mom Test FAIL:
- "¿Te gustaría una app de staging virtual?"
- "¿Pagarías $49/mes por staging virtual?"
- "¿No crees que el staging virtual es el futuro?"

✅ Mom Test PASS:
- "Cuéntame la última vez que tuviste una propiedad difícil de vender. ¿Qué hiciste?"
- "¿Cuánto gastas en staging físico por propiedad?"
- "¿Cuántas propiedades has perdido porque no se veían bien en fotos?"
- "¿Has probado alguna herramienta digital para tus listings? ¿Qué pasó?"
```

### Paso 4: Notas de Campo

Generar template para tomar notas durante la entrevista:

```
ENTREVISTA #[N] — [fecha]
Entrevistado: [nombre/alias] | Rol: [rol] | Duración: [min]

PROBLEMA VALIDADO: [Sí/No/Parcial]
DOLOR REAL: [1-5 — qué tan intenso es el dolor]
ALTERNATIVA ACTUAL: [qué usa hoy]
DISPOSICIÓN A PAGAR: [sí/no — cuánto]

QUOTES CLAVE:
- "[cita textual relevante]"
- "[cita textual relevante]"

SORPRESAS (lo que no esperabas):
- [hallazgo inesperado]

SEÑALES DE COMPRA:
- [preguntó cuándo sale / pidió acceso beta / ofreció presentar a colegas]

SEÑALES DE ALARMA:
- [fue cortés pero no comprometido / "interesante" sin emoción / no tiene el problema]
```

---

## Output Format

```markdown
# INTERVIEW-SCRIPT-[nombre]

> Guión de entrevista generado por Forge · [fecha]
> Basado en: The Mom Test (Rob Fitzpatrick)

## Objetivos

| # | Hipótesis a Validar | Tipo | Confianza Actual |
|---|---------------------|------|-----------------|
| 1 | [hipótesis] | Problema/Mercado/Pricing | Baja/Media |

## Perfil del Entrevistado

- **Persona target:** [nombre de persona del UX Research si existe]
- **Dónde encontrarlos:** [LinkedIn, comunidades, referidos, etc.]
- **Entrevistas recomendadas:** 5-10
- **Duración:** 20-30 min

---

## El Guión

### Apertura (2 min)
[Script de apertura personalizado]

### Bloque 1: Contexto (5 min)
1. [pregunta]
2. [pregunta]
3. [pregunta]

### Bloque 2: Problema (10 min)
1. [pregunta — Mom Test pass]
2. [pregunta — Mom Test pass]
3. [pregunta — Mom Test pass]
4. [pregunta — Mom Test pass]

### Bloque 3: Comportamiento Actual (5 min)
1. [pregunta]
2. [pregunta]
3. [pregunta]

### Bloque 4: Valor y Pricing (5 min)
1. [pregunta]
2. [pregunta]
3. [pregunta]

### Cierre (3 min)
[Script de cierre personalizado]

---

## Preguntas Anti-Mom-Test

| Hipótesis | ❌ No Preguntar | ✅ Preguntar |
|-----------|----------------|-------------|
| [hipótesis 1] | [pregunta sesgada] | [pregunta Mom Test] |

---

## Template de Notas de Campo

[Template reutilizable para cada entrevista]

---

## Después de las Entrevistas

Cuando completes 5+ entrevistas, analiza:
- **Patrones:** ¿Qué problemas se repiten?
- **Hipótesis validadas:** ¿Cuáles se confirmaron?
- **Hipótesis invalidadas:** ¿Cuáles hay que pivotar?
- **Sorpresas:** ¿Qué no esperabas?

Actualizar: Lean Canvas, Personas, y/o BMC con los hallazgos.
```

---

## Naming Convention

| Documento | Archivo |
|-----------|---------|
| Guión de Entrevista | `INTERVIEW-SCRIPT-[nombre-kebab].md` |

---

## Integración con La Herrería

- **Se ofrece como sub-step opcional** después de UX Research (Step 4)
- Los hallazgos de entrevistas actualizan: Personas, Journey Maps, Lean Canvas/BMC
- Especialmente valioso cuando Viability Check = CAUTION
- También disponible standalone para validación continua post-build
