# AI Feature Design

> *"La IA en un producto no es una feature — es una interfaz entre el usuario y sus datos."*

Skill para tomar las decisiones de arquitectura de un feature de IA antes de escribir código. Define: modelo, proveedor, patrón de integración, contrato de API, manejo de errores y streaming. Produce decisiones concretas, no teoría.

---

## Inputs Requeridos

Antes de diseñar, confirmar que tienes del `AI-FEATURE-BRIEF-[nombre].md`:
- ✅ Qué tarea manual automatiza o acelera la IA
- ✅ Input esperado (texto libre, datos estructurados, imágenes)
- ✅ Output esperado (texto generado, clasificación, JSON estructurado)
- ✅ Latencia aceptable (< 1s = no streaming, > 2s = streaming obligatorio)
- ✅ Volumen estimado de requests/día
- ✅ Si va dentro de una app existente o es el producto en sí

---

## FASE 1: Selección de Modelo y Proveedor

### 1.1 — Proveedor: OpenRouter (Recomendado para Forge)

Usar OpenRouter como capa de abstracción. Razón: evitar lock-in de proveedor, acceso a todos los modelos con una sola API key, fallback automático entre proveedores.

```typescript
// .env.local
OPENROUTER_API_KEY=sk-or-...

// src/features/[nombre-ai]/api/route.ts
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY })
```

**Alternativa directa:** Si el cliente tiene cuenta propia en Anthropic/OpenAI y no quiere intermediario, usar el SDK nativo. El código es casi idéntico con Vercel AI SDK.

### 1.2 — Selección de Modelo

Decidir el modelo inicial según el tipo de tarea:

| Caso de uso | Modelo recomendado | Razón |
|-------------|-------------------|-------|
| Chat general, análisis, redacción | `anthropic/claude-3-5-sonnet` | Mejor balance calidad/costo |
| Razonamiento complejo, código | `anthropic/claude-opus-4` | Máxima capacidad |
| Tasks simples, clasificación, extracción | `anthropic/claude-3-haiku` o `openai/gpt-4o-mini` | Costo mínimo |
| Visión (analizar imágenes) | `anthropic/claude-3-5-sonnet` o `openai/gpt-4o` | Multimodal |
| JSON estructurado confiable | `openai/gpt-4o` con `structured_outputs` | Schema enforcement nativo |
| Latencia ultra-baja (< 500ms) | `anthropic/claude-3-haiku` | 30+ tokens/seg |

**Regla de oro:** Empezar con `claude-3-5-sonnet`. Si el costo es demasiado alto → `claude-3-haiku`. Si la calidad no alcanza → `claude-opus-4`.

### 1.3 — Árbol de Decisión de Arquitectura

```
¿Qué necesita el feature?
│
├─ ¿Respuesta basada en datos propios del usuario/empresa?
│   └─ Sí → RAG (retrieval sobre Supabase pgvector)
│   └─ No → Prompt puro o Tool Calling
│
├─ ¿Necesita ejecutar acciones (buscar, calcular, llamar APIs)?
│   └─ Sí → Tool Calling / Function Calling
│   └─ No → Generación directa
│
├─ ¿El output necesita ser un JSON específico o dato estructurado?
│   └─ Sí → Structured Outputs con Zod schema
│   └─ No → Texto libre o markdown
│
└─ ¿La respuesta tarda > 2 segundos?
    └─ Sí → Streaming obligatorio (useCompletion / useChat)
    └─ No → Request/response simple
```

---

## FASE 2: Patrón de Integración

### Patrón A — Generación Directa (más común)

Para: chat, redacción, análisis, explicaciones, resúmenes.

```typescript
// src/features/[nombre-ai]/api/route.ts
import { streamText } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY! })

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: openrouter('anthropic/claude-3-5-sonnet'),
    system: SYSTEM_PROMPT,
    messages,
    maxTokens: 2048,
  })

  return result.toDataStreamResponse()
}
```

### Patrón B — Structured Output

Para: extracción de datos, clasificación, formularios inteligentes, análisis que deben ser parseables.

```typescript
import { generateObject } from 'ai'
import { z } from 'zod'

const ResponseSchema = z.object({
  // Definir el schema exacto esperado
  sentiment: z.enum(['positive', 'negative', 'neutral']),
  confidence: z.number().min(0).max(1),
  summary: z.string().max(200),
  action_items: z.array(z.string()),
})

export async function POST(req: Request) {
  const { input } = await req.json()

  const { object } = await generateObject({
    model: openrouter('openai/gpt-4o'),  // GPT-4o tiene mejor structured output
    schema: ResponseSchema,
    prompt: `Analiza el siguiente texto: ${input}`,
    system: SYSTEM_PROMPT,
  })

  return Response.json(object)
}
```

### Patrón C — Tool Calling

Para: features que necesitan buscar en DB, calcular, o llamar APIs externas.

```typescript
import { streamText, tool } from 'ai'
import { z } from 'zod'

const tools = {
  searchProducts: tool({
    description: 'Busca productos en la base de datos',
    parameters: z.object({
      query: z.string(),
      category: z.string().optional(),
    }),
    execute: async ({ query, category }) => {
      // Llamada real a Supabase
      const { data } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${query}%`)
      return data
    },
  }),
}

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: openrouter('anthropic/claude-3-5-sonnet'),
    system: SYSTEM_PROMPT,
    messages,
    tools,
    maxSteps: 5,  // Máximo de pasos tool-call → observe → respond
  })

  return result.toDataStreamResponse()
}
```

### Patrón D — RAG (Retrieval Augmented Generation)

Para: chatbots con documentos propios, búsqueda semántica, Q&A sobre data privada.

```typescript
// 1. Buscar contexto relevante en Supabase pgvector
async function getContext(query: string): Promise<string> {
  const embedding = await generateEmbedding(query)  // text-embedding-3-small

  const { data } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: 0.75,
    match_count: 5,
  })

  return data?.map((d: any) => d.content).join('\n\n') ?? ''
}

// 2. Inyectar contexto en el system prompt
export async function POST(req: Request) {
  const { messages } = await req.json()
  const lastMessage = messages[messages.length - 1].content
  const context = await getContext(lastMessage)

  const result = streamText({
    model: openrouter('anthropic/claude-3-5-sonnet'),
    system: `${SYSTEM_PROMPT}\n\nContexto relevante:\n${context}`,
    messages,
  })

  return result.toDataStreamResponse()
}
```

---

## FASE 3: Contrato de la API

Definir el contrato del endpoint antes de implementar:

```typescript
// Para cada feature de IA, documentar en AI-FEATURE-BRIEF:

// Endpoint
POST /api/ai/[nombre-feature]

// Request body
{
  messages: Message[]  // Para chat/streaming
  // O
  input: string        // Para single-turn requests
  context?: object     // Datos adicionales del usuario (userId, etc.)
}

// Response — Streaming
DataStream (Vercel AI SDK format)

// Response — Structured
{
  // Campos según el ResponseSchema de Zod
}

// Error Response
{
  error: string
  code: 'RATE_LIMITED' | 'MODEL_ERROR' | 'INVALID_INPUT'
}
```

---

## FASE 4: Streaming UI

Cuándo usar streaming y qué componente:

| Caso | Herramienta | Cuándo |
|------|-------------|--------|
| Chat multi-turno | `useChat` (Vercel AI SDK) | Chatbot, asistente conversacional |
| Generación single-turn | `useCompletion` | Generar texto, análisis, redacción |
| Sin streaming | `fetch` normal | Clasificación, extracción (< 1s) |

```typescript
// src/features/[nombre-ai]/hooks/useAIFeature.ts
'use client'
import { useCompletion } from 'ai/react'

export function useAIFeature() {
  const { complete, completion, isLoading, error } = useCompletion({
    api: '/api/ai/[nombre-feature]',
  })

  return { complete, completion, isLoading, error }
}
```

---

## FASE 5: Error Handling y Fallbacks

Definir la estrategia de fallback **antes** de implementar:

```typescript
// 3 niveles de fallback para producción
const FALLBACK_CHAIN = [
  'anthropic/claude-3-5-sonnet',    // Modelo principal
  'anthropic/claude-3-haiku',        // Fallback si el principal tiene timeout
  null,                              // Fallback estático (respuesta predefinida)
]

// Manejo de errores en la route
export async function POST(req: Request) {
  try {
    const result = streamText({
      model: openrouter('anthropic/claude-3-5-sonnet'),
      messages,
      abortSignal: AbortSignal.timeout(30_000),  // 30s timeout
    })
    return result.toDataStreamResponse()
  } catch (error) {
    // Intentar con modelo de fallback
    if (error.name === 'AbortError' || error.status === 529) {
      const fallback = streamText({
        model: openrouter('anthropic/claude-3-haiku'),
        messages,
      })
      return fallback.toDataStreamResponse()
    }

    // Si todo falla, respuesta estática
    return Response.json(
      { error: 'El servicio no está disponible. Intenta de nuevo en unos momentos.' },
      { status: 503 }
    )
  }
}
```

**Errores críticos a manejar:**
- `AbortError` / timeout → modelo sobrecargado → usar fallback
- `429 Too Many Requests` → rate limit propio → mostrar mensaje y delay
- `529 Overloaded` (Anthropic) → modelo ocupado → usar fallback
- Respuesta vacía o malformada → reintentar o usar fallback estático
- Alucinaciones / output fuera de schema → validar con Zod, retry con corrección

---

## Output: Sección de Diseño en `AI-FEATURE-BRIEF-[nombre].md`

Completar esta sección en el brief:

```markdown
## Decisiones de Diseño IA

### Proveedor y Modelo
- **Proveedor:** OpenRouter
- **Modelo principal:** anthropic/claude-3-5-sonnet
- **Modelo fallback:** anthropic/claude-3-haiku
- **Razón:** [balance calidad/costo para el tipo de tarea]

### Patrón de Integración
- **Patrón:** [Generación Directa / Structured Output / Tool Calling / RAG]
- **Razón:** [por qué este patrón para este feature]
- **Streaming:** Sí / No — Razón: [latencia estimada]

### Contrato de API
- **Endpoint:** POST /api/ai/[nombre]
- **Request:** { messages: Message[] } / { input: string }
- **Response:** DataStream / { schema fields }

### Manejo de Errores
- **Timeout:** 30 segundos
- **Fallback 1:** claude-3-haiku
- **Fallback 2:** [respuesta estática o mensaje de error]

### Dependencias
- [ ] OPENROUTER_API_KEY en .env
- [ ] Vercel AI SDK v5 instalado (`ai` + `@openrouter/ai-sdk-provider`)
- [ ] Zod schema definido (si aplica)
- [ ] Supabase pgvector setup (si es RAG)
```

---

## Checklist de Decisiones

Antes de pasar a implementar, verificar:

- [ ] ¿Elegimos el modelo correcto para la tarea (no over-engineering)?
- [ ] ¿Definimos el patrón (streaming / structured / tool)?
- [ ] ¿El contrato de API está documentado?
- [ ] ¿Hay un fallback definido para cuando el modelo falla?
- [ ] ¿El timeout está configurado (30s recomendado)?
- [ ] ¿Tenemos OPENROUTER_API_KEY en .env.local y en Vercel?
- [ ] ¿Estimamos el costo mensual con el volumen esperado? (ver `llm-cost-optimization.md`)

---

*"Elegir el modelo correcto vale más que optimizarlo. El 80% del valor viene de la arquitectura correcta."*
