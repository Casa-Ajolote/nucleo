# LLM Cost & Operations

> *"El feature de IA que no monitoreas es el que te cobra una sorpresa a fin de mes."*

Skill para implementar rate limiting, estimar costos, configurar observabilidad y definir estrategias de reducción de costo para features de IA en producción. Produce código funcional + estimación documentada.

---

## Inputs Requeridos

Antes de implementar, confirmar que tienes del brief:
- ✅ Modelo elegido (ej: `anthropic/claude-3-5-sonnet`)
- ✅ Input promedio estimado en tokens
- ✅ Output promedio estimado en tokens
- ✅ Volumen de requests/día estimado
- ✅ Si es B2C (muchos usuarios, pocas requests cada uno) o B2B (pocos usuarios, muchas requests)

---

## FASE 1: Calculadora de Costos

Estimar el costo mensual antes de ir a producción.

### Precios de referencia (verificar en openrouter.ai/models)

| Modelo | Input ($/1M tokens) | Output ($/1M tokens) |
|--------|--------------------|--------------------|
| `claude-3-5-sonnet` | ~$3.00 | ~$15.00 |
| `claude-3-haiku` | ~$0.25 | ~$1.25 |
| `claude-opus-4` | ~$15.00 | ~$75.00 |
| `gpt-4o` | ~$5.00 | ~$15.00 |
| `gpt-4o-mini` | ~$0.15 | ~$0.60 |

### Fórmula de Estimación

```
Costo mensual =
  (requests/día × 30)
  × [(tokens_input_promedio × precio_input) + (tokens_output_promedio × precio_output)]
  / 1,000,000
```

### Ejemplo de Estimación Documentada

```markdown
## Estimación de Costo — [Feature Name]

**Modelo:** anthropic/claude-3-5-sonnet
**Tokens input promedio:** 800 (system prompt ~300 + user input ~500)
**Tokens output promedio:** 400

**Escenario conservador:** 100 requests/día
  - Input: 100 × 800 × 30 × $3/1M = $7.20/mes
  - Output: 100 × 400 × 30 × $15/1M = $18.00/mes
  - **Total: ~$25/mes**

**Escenario crecimiento:** 1,000 requests/día
  - **Total: ~$250/mes**

**Umbral de cambio de modelo:** Si supera $200/mes → evaluar migrar
partes del flujo a claude-3-haiku ($25/mes equivalent)
```

---

## FASE 2: Rate Limiting

Implementar rate limiting en la API route para controlar costos y proteger de abuso.

### Opción A — Rate Limiting con Upstash Redis (Recomendado)

```bash
npm install @upstash/ratelimit @upstash/redis
```

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Rate limit general: 20 requests/min por usuario
export const rateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '1 m'),
  analytics: true,
  prefix: 'ai-feature',
})

// Rate limit estricto para features caros: 5 requests/min
export const strictRateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
  prefix: 'ai-expensive',
})
```

```typescript
// src/features/[nombre-ai]/api/route.ts
import { rateLimiter } from '@/lib/rate-limit'
import { auth } from '@/lib/auth'  // Supabase auth

export async function POST(req: Request) {
  // 1. Autenticación
  const session = await auth()
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Rate limiting por userId
  const { success, limit, reset, remaining } = await rateLimiter.limit(
    session.user.id
  )

  if (!success) {
    return Response.json(
      {
        error: 'Demasiadas requests. Intenta de nuevo en unos momentos.',
        code: 'RATE_LIMITED',
        reset: new Date(reset).toISOString(),
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
          'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      }
    )
  }

  // 3. Ejecutar el feature de IA
  // ...
}
```

```bash
# Variables de entorno necesarias (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=AX...
```

### Opción B — Rate Limiting Simple sin Redis (para MVPs)

Si no quieres configurar Redis aún, una solución en memoria (no persiste entre deployments):

```typescript
// src/lib/rate-limit-simple.ts
// NOTA: Solo para MVP/testing. No usar en producción con múltiples instancias.

const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  userId: string,
  limit: number = 10,
  windowMs: number = 60_000
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = requestCounts.get(userId)

  if (!record || now > record.resetTime) {
    requestCounts.set(userId, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: limit - record.count }
}
```

### Límites Recomendados por Tipo de Feature

| Feature | Requests/min | Requests/día | Razón |
|---------|-------------|-------------|-------|
| Chat conversacional | 20/min | Sin límite diario | Usuario activo |
| Análisis de documentos | 5/min | 50/día | Costoso en tokens |
| Generación de contenido | 10/min | 100/día | Moderado |
| Feature con modelo caro (opus) | 2/min | 10/día | Muy costoso |

---

## FASE 3: Caching de Respuestas

Cuando las mismas consultas se repiten, cachear evita requests al modelo.

### Cuándo cachear

```
¿El output depende SOLO del input (sin estado del usuario)?
  └─ Sí → Candidato para caché
     └─ ¿El input es texto libre y variable?
        └─ Sí → Usar caché semántico (embeddings)
        └─ No (es determinista) → Usar caché exacto

¿El output depende del usuario o del tiempo?
  └─ Sí → NO cachear
```

### Caché Exacto (para requests deterministas)

```typescript
// src/lib/ai-cache.ts
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export async function getCachedResponse(cacheKey: string): Promise<string | null> {
  return redis.get<string>(cacheKey)
}

export async function setCachedResponse(
  cacheKey: string,
  response: string,
  ttlSeconds: number = 3600  // 1 hora por defecto
): Promise<void> {
  await redis.setex(cacheKey, ttlSeconds, response)
}

// Generar una cache key determinista desde el input
export function generateCacheKey(featureName: string, input: string): string {
  const hash = Buffer.from(input).toString('base64').slice(0, 32)
  return `ai:${featureName}:${hash}`
}
```

```typescript
// En la API route
export async function POST(req: Request) {
  const { input } = await req.json()

  // Check cache first
  const cacheKey = generateCacheKey('mi-feature', input)
  const cached = await getCachedResponse(cacheKey)
  if (cached) {
    return Response.json(JSON.parse(cached))
  }

  // Generar con el modelo
  const { object } = await generateObject({ ... })

  // Guardar en cache
  await setCachedResponse(cacheKey, JSON.stringify(object), 7200)

  return Response.json(object)
}
```

---

## FASE 4: Observabilidad y Monitoreo

Loggear métricas clave para detectar problemas y optimizar costos.

### Métricas a Trackear

```typescript
// src/lib/ai-observability.ts
import * as Sentry from '@sentry/nextjs'

interface AIRequestMetrics {
  feature: string
  model: string
  inputTokens: number
  outputTokens: number
  latencyMs: number
  userId: string
  success: boolean
  fallbackUsed: boolean
  error?: string
  estimatedCostUsd?: number
}

export function trackAIRequest(metrics: AIRequestMetrics) {
  // Sentry para errores y performance
  if (!metrics.success) {
    Sentry.captureMessage(`AI feature error: ${metrics.feature}`, {
      level: 'error',
      extra: metrics,
    })
  }

  // Log estructurado para análisis
  console.log(JSON.stringify({
    event: 'ai_request',
    timestamp: new Date().toISOString(),
    ...metrics,
  }))
}
```

### Implementación en la Route

```typescript
export async function POST(req: Request) {
  const startTime = Date.now()
  let fallbackUsed = false

  try {
    // ... lógica del feature

    trackAIRequest({
      feature: 'nombre-feature',
      model: 'anthropic/claude-3-5-sonnet',
      inputTokens: result.usage?.promptTokens ?? 0,
      outputTokens: result.usage?.completionTokens ?? 0,
      latencyMs: Date.now() - startTime,
      userId: session.user.id,
      success: true,
      fallbackUsed,
      estimatedCostUsd: calculateCost(
        result.usage?.promptTokens ?? 0,
        result.usage?.completionTokens ?? 0,
        'claude-3-5-sonnet'
      ),
    })

    return result.toDataStreamResponse()

  } catch (error) {
    trackAIRequest({
      feature: 'nombre-feature',
      model: 'anthropic/claude-3-5-sonnet',
      inputTokens: 0,
      outputTokens: 0,
      latencyMs: Date.now() - startTime,
      userId: session?.user.id ?? 'anonymous',
      success: false,
      fallbackUsed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    throw error
  }
}

// Helper para estimar costo
function calculateCost(
  inputTokens: number,
  outputTokens: number,
  model: string
): number {
  const pricing: Record<string, { input: number; output: number }> = {
    'claude-3-5-sonnet': { input: 3.0, output: 15.0 },
    'claude-3-haiku': { input: 0.25, output: 1.25 },
    'gpt-4o': { input: 5.0, output: 15.0 },
    'gpt-4o-mini': { input: 0.15, output: 0.60 },
  }

  const prices = pricing[model] ?? { input: 3.0, output: 15.0 }
  return (inputTokens * prices.input + outputTokens * prices.output) / 1_000_000
}
```

### Alertas de Costo

Configurar alertas en OpenRouter o en el dashboard de observabilidad cuando:
- El costo diario supera el 150% del promedio
- La tasa de error del modelo supera 5%
- La latencia P95 supera el SLA definido
- Se usa el modelo de fallback en > 10% de las requests

---

## FASE 5: Estrategias de Reducción de Costo

Aplicar según el presupuesto y volumen:

### 1. Optimizar el System Prompt (impacto: -10% a -30% tokens)

```typescript
// ❌ System prompt verboso
const VERBOSE_PROMPT = `
Eres un asistente muy capaz y experimentado que trabaja para nuestra empresa
y que tiene como objetivo principal ayudar a nuestros usuarios con sus preguntas
sobre nuestro producto, siendo siempre muy amable y profesional en todo momento...
`

// ✅ System prompt conciso — mismo resultado, menos tokens
const CONCISE_PROMPT = `
Eres el asistente de [Producto]. Responde preguntas sobre [dominio].
Tono: profesional y conciso. Si no sabes algo, dilo directamente.
`
```

### 2. Usar el Modelo Correcto para Cada Tarea (impacto: -50% a -90% costo)

```typescript
// Routing por complejidad de tarea
function selectModel(taskType: 'simple' | 'complex' | 'analysis'): string {
  const modelMap = {
    simple: 'anthropic/claude-3-haiku',      // Clasificación, extracción básica
    complex: 'anthropic/claude-3-5-sonnet',  // Análisis, redacción, razonamiento
    analysis: 'anthropic/claude-opus-4',     // Solo si realmente necesitas lo mejor
  }
  return modelMap[taskType]
}
```

### 3. Truncar Input Largo (impacto: variable)

```typescript
// Nunca enviar más tokens de los necesarios
function truncateInput(text: string, maxTokens: number = 2000): string {
  // Aproximación: 1 token ≈ 4 caracteres en español/inglés
  const maxChars = maxTokens * 4
  if (text.length <= maxChars) return text

  // Truncar y añadir indicación
  return text.slice(0, maxChars - 100) + '\n\n[Texto truncado por extensión]'
}
```

### 4. Agrupar Requests (batching) — Para procesamiento masivo

```typescript
// En lugar de N llamadas individuales → 1 llamada con N items
async function batchProcess(items: string[]): Promise<string[]> {
  const { object } = await generateObject({
    model: openrouter('anthropic/claude-3-haiku'),
    schema: z.object({
      results: z.array(z.object({
        index: z.number(),
        result: z.string(),
      }))
    }),
    prompt: `Procesa cada uno de los siguientes items:
${items.map((item, i) => `${i}. ${item}`).join('\n')}

Retorna un resultado para cada índice.`,
  })

  return object.results
    .sort((a, b) => a.index - b.index)
    .map(r => r.result)
}
```

### 5. Context Compression — Para chats de larga duración (impacto: -50% a -90% tokens)

Cuando el historial de conversación crece, comprimir los mensajes más antiguos en un resumen. Reduce drásticamente el costo sin perder coherencia conversacional.

```typescript
// src/features/[nombre]/services/context.service.ts
import { generateText } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'

const MAX_MESSAGES_BEFORE_COMPRESSION = 30  // Comprimir cuando supera este límite
const MESSAGES_TO_KEEP_RECENT = 10          // Siempre conservar los N más recientes

export async function compressHistoryIfNeeded(
  messages: Array<{ role: string; content: string }>
): Promise<typeof messages> {
  if (messages.length <= MAX_MESSAGES_BEFORE_COMPRESSION) {
    return messages // No hay nada que comprimir
  }

  // Separar: mensajes a comprimir (los más antiguos) + mensajes recientes a conservar
  const toCompress = messages.slice(0, -MESSAGES_TO_KEEP_RECENT)
  const recent = messages.slice(-MESSAGES_TO_KEEP_RECENT)

  const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY! })

  // Resumir con haiku (barato) — el resumen va como system message
  const { text: summary } = await generateText({
    model: openrouter('anthropic/claude-3-haiku'),
    prompt: `Resume esta conversación en máximo 150 palabras, capturando:
- El contexto del usuario (quién es, qué necesita)
- Decisiones tomadas y acuerdos alcanzados
- Información clave mencionada

Conversación:
${toCompress.map(m => `${m.role}: ${m.content}`).join('\n')}`,
  })

  // Estructura comprimida: [resumen como system] + [mensajes recientes]
  return [
    { role: 'system', content: `[Resumen de conversación anterior]\n${summary}` },
    ...recent,
  ]
}
```

**Dónde usar en la API route:**

```typescript
// En la route de chat, antes de llamar al modelo
import { compressHistoryIfNeeded } from '../services/context.service'
import { getConversationHistory } from '../services/history.service'

export async function POST(req: NextRequest) {
  const { message, conversationId } = await req.json()

  // Obtener historial completo
  const rawHistory = await getConversationHistory(conversationId, 50)

  // ✅ Comprimir si es necesario (reducción de 50-90% en tokens de historial largo)
  const history = await compressHistoryIfNeeded(rawHistory)

  const messages = [...history, { role: 'user' as const, content: message }]

  // ... resto de la route igual
}
```

**Impacto real en tokens:**

```
Conversación de 40 mensajes (~8,000 tokens de historial)
Después de comprimir:
  → 1 system message de resumen (~300 tokens)
  → 10 mensajes recientes (~2,000 tokens)
  → Total historial: ~2,300 tokens (ahorro: 71%)
```

---

## Output: Sección de Operaciones en `AI-FEATURE-BRIEF-[nombre].md`

```markdown
## Costo y Operaciones

### Estimación de Costo
- Modelo: [nombre]
- Tokens promedio input/output: [X] / [Y]
- Volumen estimado: [N] requests/día
- Costo estimado: $[X]/mes (conservador) — $[Y]/mes (crecimiento)
- Umbral de alerta: $[Z]/mes → revisar modelo o caching

### Rate Limiting Configurado
- Límite: [N] requests/min por usuario
- Implementación: [Upstash Redis / In-memory]
- Response en 429: mensaje en español + Retry-After header

### Caching
- [Sí / No] — Razón: [el output es determinista / depende del usuario]
- TTL si aplica: [X horas]

### Monitoreo
- Métricas loggeadas: latencia, tokens, costo estimado, fallback_used
- Alertas configuradas en: [Sentry / PostHog]
- Dashboard: [link si aplica]

### Variables de Entorno Requeridas
- OPENROUTER_API_KEY — clave de OpenRouter
- UPSTASH_REDIS_REST_URL — para rate limiting (si aplica)
- UPSTASH_REDIS_REST_TOKEN — para rate limiting (si aplica)
```

---

## Checklist de Operations

Antes de ir a producción:

- [ ] ¿Estimamos el costo mensual con el volumen esperado?
- [ ] ¿Está implementado el rate limiting (al menos in-memory para MVP)?
- [ ] ¿Se loggean latencia y tokens en cada request?
- [ ] ¿Hay un timeout configurado en la route (recomendado: 30s)?
- [ ] ¿El error 429 tiene un mensaje claro en el idioma del usuario?
- [ ] ¿Las variables OPENROUTER_API_KEY están configuradas en Vercel?
- [ ] ¿Definimos el umbral de costo que dispara una revisión de arquitectura?
- [ ] ¿El chat tiene `compressHistoryIfNeeded` si las conversaciones pueden ser largas?

---

*"No optimices prematuramente — pero sí mide desde el día uno."*
