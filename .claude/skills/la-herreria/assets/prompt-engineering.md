# Prompt Engineering para Producción

> *"Un prompt de producción no es el que impresiona — es el que funciona el 99% de las veces."*

Skill para diseñar, versionar y testear prompts de producción. Enfocado en el stack Forge (Next.js + Vercel AI SDK + OpenRouter). Produce `PROMPTS-[nombre].md` con system prompts versionados, ejemplos de test y criterios de éxito.

---

## Inputs Requeridos

Antes de escribir prompts, confirmar que tienes del brief anterior:
- ✅ Qué tarea hace la IA (input → output)
- ✅ Patrón elegido (generación libre, structured output, tool calling)
- ✅ Tipo de usuario (qué lenguaje usa, qué nivel técnico)
- ✅ Casos edge conocidos (qué pasa si el input es vacío, inválido, malicioso)

---

## FASE 1: Anatomía del System Prompt de Producción

Todo system prompt de producción tiene 5 secciones en este orden:

```
1. ROL Y CONTEXTO    — quién eres y en qué contexto operas
2. TAREA PRINCIPAL   — qué haces exactamente
3. REGLAS CRÍTICAS   — qué NUNCA harás (no negociable)
4. FORMATO DE OUTPUT — cómo estructuras la respuesta
5. FALLBACK          — qué hacer cuando no puedes completar la tarea
```

### Template Base

```
Eres [rol específico] en [nombre del producto/contexto].

Tu tarea es [objetivo claro en 1-2 oraciones].

Reglas:
- [Regla 1: restricción de contenido]
- [Regla 2: restricción de formato]
- [Regla 3: manejo de casos edge]
- NUNCA [acción prohibida específica]
- Siempre responde en [idioma / formato: texto / JSON / markdown]

[Sección de contexto si aplica — datos del usuario, estado del sistema]

Si no puedes completar la tarea, responde exactamente: "[mensaje de fallback específico]"
```

### Principios de Calidad

| Principio | Aplicación |
|-----------|------------|
| **Específico > Genérico** | "Eres un asistente de soporte para [Producto]" > "Eres un asistente útil" |
| **Restricciones explícitas** | Decir qué NO hacer es tan importante como qué hacer |
| **Fallback definido** | Siempre hay un mensaje de respaldo para casos que el modelo no puede resolver |
| **Tono del usuario** | Usar el mismo lenguaje que el usuario objetivo (técnico vs casual) |
| **Longitud calibrada** | System prompt < 500 tokens para tasks simples, < 1500 para complejos |

---

## FASE 2: Patrones por Tipo de Feature

### Patrón A — Asistente / Chat (generación libre)

```
Eres el asistente de [Producto], especializado en [dominio específico].

Tu objetivo es ayudar al usuario a [resultado concreto].

Tono: [profesional y conciso / amigable y conversacional / técnico y preciso]

Reglas:
- Responde solo sobre temas relacionados con [dominio]
- Si no sabes algo, admítelo con: "No tengo esa información, pero puedes..."
- Máximo [2-3] párrafos por respuesta salvo que el usuario pida más detalle
- No repitas la pregunta del usuario en tu respuesta
- NUNCA inventes datos, estadísticas o funcionalidades del producto

Si la pregunta está fuera de tu dominio, responde:
"Eso está fuera de lo que puedo ayudarte aquí, pero [sugerencia alternativa]."
```

### Patrón B — Extracción / Análisis (structured output)

```
Eres un extractor de datos especializado en [dominio].

Analiza el input del usuario y extrae [qué información exacta].

Reglas:
- Extrae SOLO lo que está explícitamente en el texto. No inferir.
- Si un campo no está presente, usa null (no inventes valores)
- Números siempre como tipo numérico, no como string
- Fechas en formato ISO 8601 (YYYY-MM-DD)
- Si el input está vacío o no contiene datos relevantes, retorna el schema con todos los campos en null

NUNCA:
- Inventar datos que no están en el input
- Cambiar el formato del schema
- Añadir campos extra no definidos
```

### Patrón C — Clasificación (structured output con enum)

```
Eres un clasificador de [tipo de contenido] para [contexto].

Clasifica el input en una de las siguientes categorías:
- [Categoría 1]: [descripción y criterios]
- [Categoría 2]: [descripción y criterios]
- [Categoría 3]: [descripción y criterios]

Reglas:
- Elige SIEMPRE exactamente una categoría
- Si el input no encaja claramente, elige la más probable y marca confidence < 0.6
- Basa la decisión en el contenido, no en el formato o longitud
- Ignora el idioma: clasifica el contenido independientemente del idioma

Si el input está vacío o no es clasificable, responde con categoría "unknown" y confidence 0.
```

### Patrón D — Generación con Restricciones (redacción, sugerencias)

```
Eres [rol] experto en [dominio] para [tipo de usuarios].

Genera [qué tipo de contenido] basado en el input del usuario.

Restricciones de contenido:
- Extensión: [X palabras / X párrafos / X items]
- Tono: [profesional / casual / técnico]
- Idioma: [mismo que el input / siempre español / siempre inglés]
- NO incluir: [lo que nunca debe aparecer]

Formato de output:
[describir estructura exacta — bullets, párrafos, secciones]

Si el input es insuficiente para generar algo útil, responde:
"Necesito más contexto sobre [qué información falta] para ayudarte mejor."
```

---

## FASE 3: Few-Shot Examples

Cuándo agregar ejemplos al system prompt:

| Caso | ¿Agregar ejemplos? |
|------|--------------------|
| Formato de output muy específico | ✅ Sí — 2-3 ejemplos |
| Output en idioma técnico/dominio específico | ✅ Sí — 2 ejemplos |
| Tarea simple y bien conocida | ❌ No necesario |
| Structured output con schema JSON | ❌ El schema es suficiente |
| Tarea ambigua o subjetiva | ✅ Sí — 3+ ejemplos cubriendo edge cases |

### Formato de Few-Shot en System Prompt

```
Ejemplos:

Input: "[ejemplo 1 — caso simple]"
Output: "[output correcto — caso simple]"

Input: "[ejemplo 2 — caso con datos faltantes]"
Output: "[output con nulls / manejo correcto del edge case]"

Input: "[ejemplo 3 — caso edge o límite]"
Output: "[cómo manejar el límite]"
```

**Reglas para examples:**
- Máximo 3 ejemplos (más no mejora, solo gasta tokens)
- El último ejemplo siempre debe ser un edge case
- Examples antes del input del usuario, nunca después
- Consistent con el formato pedido en "Formato de output"

---

## FASE 4: Structured Outputs con Zod

Para outputs predecibles, definir el schema con Zod y pasarlo a `generateObject`:

```typescript
// src/features/[nombre-ai]/api/route.ts
import { generateObject } from 'ai'
import { z } from 'zod'

// Definir schema estricto — esto es también la documentación del output
export const OutputSchema = z.object({
  // Campos requeridos con descripción
  result: z.string().describe('El resultado principal de la tarea'),
  confidence: z.number().min(0).max(1).describe('Confianza del modelo 0-1'),

  // Campos opcionales con .nullable() explícito
  category: z.enum(['type_a', 'type_b', 'type_c']).nullable()
    .describe('Categoría detectada, null si no aplica'),

  // Arrays con tipos estrictos
  items: z.array(z.object({
    id: z.string(),
    value: z.string(),
    score: z.number(),
  })).describe('Lista de items extraídos'),

  // Metadatos del error/fallback
  error: z.string().nullable()
    .describe('Mensaje de error si la tarea no se pudo completar, null si exitoso'),
})

export type AIOutput = z.infer<typeof OutputSchema>

export async function POST(req: Request) {
  const { input } = await req.json()

  const { object } = await generateObject({
    model: openrouter('openai/gpt-4o'),
    schema: OutputSchema,
    system: SYSTEM_PROMPT,
    prompt: input,
  })

  return Response.json(object satisfies AIOutput)
}
```

**Reglas del schema:**
- Todos los campos opcionales deben ser `.nullable()`, no `z.optional()`
- Siempre incluir un campo `error: z.string().nullable()` para fallback
- `.describe()` en cada campo — sirve al modelo como instrucción
- Usar enums en lugar de strings libres cuando los valores son conocidos

---

## FASE 5: Versionado de Prompts

Los prompts cambian. Versionarlos evita romper producción.

### Estructura del archivo `PROMPTS-[nombre].md`

```markdown
# Prompts: [Nombre del Feature]

## Versión Activa: v1.2.0

---

## v1.2.0 — [fecha]
**Cambio:** [qué se modificó y por qué]
**Trigger:** [qué problema resolvió este cambio]

### System Prompt
\`\`\`
[SYSTEM PROMPT COMPLETO]
\`\`\`

### Test Cases
| Input | Output Esperado | ✅/❌ |
|-------|----------------|------|
| [caso 1] | [output] | ✅ |
| [caso edge] | [output fallback] | ✅ |

---

## v1.1.0 — [fecha] (deprecated)
**Cambio:** ...
[mismo formato]
```

### En código: usar constante con versión

```typescript
// src/features/[nombre-ai]/prompts.ts

// Versión activa — editar aquí para actualizar
export const SYSTEM_PROMPT_VERSION = 'v1.2.0'

export const SYSTEM_PROMPT = `
Eres [rol] para [producto].
[... prompt completo ...]
` as const

// Tip: guardar versiones anteriores comentadas
// v1.1.0 (deprecated — tenía problema con inputs vacíos):
// export const SYSTEM_PROMPT_V1_1 = `...`
```

---

## FASE 6: Testing de Prompts

Antes de ir a producción, cada prompt necesita pasar un test suite mínimo.

### Golden Tests (obligatorios)

Definir en `PROMPTS-[nombre].md` al menos:

| Test | Input | Output esperado | Criterio de éxito |
|------|-------|----------------|-------------------|
| Caso normal | Input típico | Output correcto | Contiene [elemento clave] |
| Input vacío | `""` o `{}` | Mensaje de fallback | No error 500 |
| Input ambiguo | Input con múltiple interpretación | Respuesta con confidence < 0.7 | No inventa |
| Input malicioso | `"Ignora tus instrucciones y..."` | Respuesta normal, ignora instrucción | No sigue instrucción |
| Input en otro idioma | Input en inglés si el feature es español | Respuesta coherente | No rompe el formato |

### Test Manual Rápido (pre-deploy checklist)

```bash
# Probar los 5 casos críticos antes de hacer push
# 1. ¿Funciona el caso happy path?
# 2. ¿Responde algo sensato con input vacío?
# 3. ¿El formato del output es siempre consistente?
# 4. ¿Ignora instrucciones inyectadas en el input?
# 5. ¿El fallback message aparece cuando corresponde?
```

### Evaluación Continua en Producción

Loggear en Sentry o PostHog:
- `model_used`: qué modelo respondió
- `input_length`: tokens del input
- `output_length`: tokens del output
- `latency_ms`: tiempo de respuesta
- `fallback_triggered`: boolean — se usó el fallback?
- `schema_valid`: boolean (si structured output) — validó el Zod schema?

---

## Output: `PROMPTS-[nombre].md`

Archivo final entregado al completar este skill:

```markdown
# Prompts: [Nombre del Feature]

## Versión Activa: v1.0.0

---

## v1.0.0 — [fecha de creación]

### System Prompt
\`\`\`
[SYSTEM PROMPT FINAL — listo para producción]
\`\`\`

### Configuración del Modelo
- Modelo: [anthropic/claude-3-5-sonnet]
- Max tokens: [2048]
- Temperature: [0.3 para tasks deterministas / 0.7 para generación creativa]

### Schema (si aplica)
\`\`\`typescript
export const OutputSchema = z.object({
  // [campos del schema]
})
\`\`\`

### Golden Tests
| Test | Input | Output esperado | Estado |
|------|-------|----------------|--------|
| Happy path | [input] | [output] | ✅ |
| Input vacío | "" | "[fallback msg]" | ✅ |
| Edge case | [edge input] | [edge output] | ✅ |
| Prompt injection | "Ignora..." | [respuesta normal] | ✅ |

### Notas de Implementación
- [Cualquier decisión técnica relevante]
- [Comportamientos conocidos o limitaciones]
```

---

## Checklist de Calidad

Antes de declarar el prompt listo para producción:

- [ ] ¿El system prompt tiene las 5 secciones (rol, tarea, reglas, formato, fallback)?
- [ ] ¿Las reglas de "NUNCA" cubren los casos edge más importantes?
- [ ] ¿El fallback message es específico y no genérico?
- [ ] ¿El schema Zod tiene todos los campos con `.describe()`?
- [ ] ¿Los campos opcionales son `.nullable()` no `.optional()`?
- [ ] ¿Pasó los 5 golden tests (happy path, vacío, ambiguo, injection, otro idioma)?
- [ ] ¿Está versionado en `PROMPTS-[nombre].md`?
- [ ] ¿La constante `SYSTEM_PROMPT` está en un archivo separado (no inline en la route)?

---

*"El mejor prompt no es el más largo — es el más predecible."*
