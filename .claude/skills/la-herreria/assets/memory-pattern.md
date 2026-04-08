# Memory Pattern — Memoria Persistente en AI Features

> *"Un asistente que te olvida cada vez que recargas la página no es un asistente — es una demo."*

Skill para implementar memoria persistente en features de IA. Cubre historial de conversaciones, preferencias de usuario y memorias semánticas de largo plazo.

---

## Tipos de Memoria

| Tipo | Qué guarda | Alcance | Tecnología |
|------|-----------|---------|-----------|
| **Historial de sesión** | Mensajes del chat actual | Sesión actual | Estado local (useChat) |
| **Historial persistente** | Conversaciones pasadas | Siempre disponible | Supabase `conversations` |
| **Preferencias** | Tono, idioma, configuración | Por usuario | Supabase `profiles` |
| **Memoria semántica** | Hechos importantes extraídos | Largo plazo | Supabase `memories` + pgvector |

---

## Cuándo Usar Cada Tipo

```
¿El usuario vuelve otra sesión y necesita continuidad?
  └─ Sí → Historial persistente (Supabase)

¿El asistente necesita "recordar" preferencias del usuario?
  └─ Sí → Preferencias en profiles

¿El asistente mejora con el tiempo según las interacciones del usuario?
  └─ Sí → Memoria semántica con extracción automática

¿Solo necesitas el contexto de la conversación actual?
  └─ Solo → useChat (ya incluye historial en memoria)
```

---

## PATRÓN A: Historial de Conversaciones (El Más Común)

### Schema de Base de Datos

```sql
-- Tabla de conversaciones
apply_migration(
  name: "create_conversations",
  query: "
    CREATE TABLE conversations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      title TEXT NOT NULL DEFAULT 'Nueva conversación',
      feature TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
    )
  "
)

-- Tabla de mensajes
apply_migration(
  name: "create_messages",
  query: "
    CREATE TABLE messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
      content TEXT NOT NULL,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now() NOT NULL
    )
  "
)

-- Índices
apply_migration(
  name: "idx_conversations_user",
  query: "CREATE INDEX idx_conversations_user ON conversations(user_id, updated_at DESC)"
)

apply_migration(
  name: "idx_messages_conversation",
  query: "CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at ASC)"
)

-- RLS
apply_migration(
  name: "rls_conversations",
  query: "ALTER TABLE conversations ENABLE ROW LEVEL SECURITY"
)

apply_migration(
  name: "rls_messages",
  query: "ALTER TABLE messages ENABLE ROW LEVEL SECURITY"
)

apply_migration(
  name: "policy_conversations_own",
  query: "
    CREATE POLICY conversations_own ON conversations
    FOR ALL USING (auth.uid() = user_id)
  "
)

-- Los mensajes heredan acceso a través de la conversación
apply_migration(
  name: "policy_messages_own",
  query: "
    CREATE POLICY messages_own ON messages
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM conversations
        WHERE conversations.id = messages.conversation_id
        AND conversations.user_id = auth.uid()
      )
    )
  "
)

get_advisors(type: \"security\")
```

### Servicio de Historial

```typescript
// src/features/[nombre]/services/history.service.ts
import { createClient } from '@/shared/lib/supabase/server'

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

// Obtener o crear una conversación
export async function getOrCreateConversation(
  userId: string,
  conversationId?: string,
  feature: string = 'ai-assistant'
): Promise<string> {
  const supabase = await createClient()

  if (conversationId) {
    const { data } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single()

    if (data) return data.id
  }

  // Crear nueva conversación
  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_id: userId, feature })
    .select('id')
    .single()

  if (error) throw new Error('Error al crear conversación')
  return data.id
}

// Obtener historial de una conversación (con límite para el context window)
export async function getConversationHistory(
  conversationId: string,
  limit: number = 20
): Promise<Message[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) return []

  return data as Message[]
}

// Guardar mensajes (user + assistant juntos para atomicidad)
export async function saveMessages(
  conversationId: string,
  messages: Message[]
): Promise<void> {
  const supabase = await createClient()

  await supabase.from('messages').insert(
    messages.map(m => ({
      conversation_id: conversationId,
      role: m.role,
      content: m.content,
    }))
  )

  // Actualizar timestamp de la conversación
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId)
}

// Listar conversaciones del usuario
export async function getUserConversations(
  userId: string,
  feature: string,
  limit: number = 20
) {
  const supabase = await createClient()

  return supabase
    .from('conversations')
    .select('id, title, created_at, updated_at')
    .eq('user_id', userId)
    .eq('feature', feature)
    .order('updated_at', { ascending: false })
    .limit(limit)
}
```

### API Route con Historial

```typescript
// src/features/[nombre]/api/chat/route.ts
import { streamText } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { NextRequest } from 'next/server'
import { createClient } from '@/shared/lib/supabase/server'
import { getOrCreateConversation, getConversationHistory, saveMessages } from '../services/history.service'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('No autorizado', { status: 401 })

  const { message, conversationId } = await req.json()

  // 1. Obtener o crear conversación
  const activeConversationId = await getOrCreateConversation(
    user.id,
    conversationId
  )

  // 2. Recuperar historial (últimos 20 mensajes para no saturar el context)
  const history = await getConversationHistory(activeConversationId, 20)

  // 3. Construir messages con historial
  const messages = [
    ...history,
    { role: 'user' as const, content: message },
  ]

  const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY! })

  // 4. Generar con streaming
  const result = streamText({
    model: openrouter('anthropic/claude-3-5-sonnet'),
    system: SYSTEM_PROMPT,
    messages,
    onFinish: async ({ text }) => {
      // 5. Guardar la conversación completa en BD
      await saveMessages(activeConversationId, [
        { role: 'user', content: message },
        { role: 'assistant', content: text },
      ])
    },
  })

  // Pasar el conversationId al cliente en los headers
  const response = result.toDataStreamResponse()
  response.headers.set('X-Conversation-Id', activeConversationId)

  return response
}
```

---

## PATRÓN B: Preferencias de Usuario

Las preferencias viven en `profiles` (ya existe en Forge):

```sql
-- Añadir columna de preferencias AI a profiles
apply_migration(
  name: "add_ai_preferences_to_profiles",
  query: "
    ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS ai_preferences JSONB DEFAULT '{
      \"language\": \"es\",
      \"tone\": \"professional\",
      \"response_length\": \"concise\"
    }'
  "
)
```

```typescript
// src/features/[nombre]/services/preferences.service.ts
import { createClient } from '@/shared/lib/supabase/server'

interface AIPreferences {
  language: 'es' | 'en'
  tone: 'professional' | 'casual' | 'technical'
  responseLength: 'concise' | 'detailed'
}

export async function getUserPreferences(userId: string): Promise<AIPreferences> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('profiles')
    .select('ai_preferences')
    .eq('id', userId)
    .single()

  return data?.ai_preferences ?? {
    language: 'es',
    tone: 'professional',
    responseLength: 'concise',
  }
}

// Inyectar preferencias en el system prompt
export function applyPreferencesToPrompt(
  basePrompt: string,
  prefs: AIPreferences
): string {
  const toneMap = {
    professional: 'formal y profesional',
    casual: 'amigable y casual',
    technical: 'técnico y preciso',
  }

  const lengthMap = {
    concise: 'Sé conciso — máximo 3 párrafos.',
    detailed: 'Puedes ser detallado cuando el tema lo requiera.',
  }

  return `${basePrompt}

PREFERENCIAS DEL USUARIO:
- Idioma de respuesta: ${prefs.language === 'es' ? 'Español' : 'English'}
- Tono: ${toneMap[prefs.tone]}
- Extensión: ${lengthMap[prefs.responseLength]}`
}
```

---

## PATRÓN C: Memoria Semántica (Long-Term Memory)

Para features donde el asistente "aprende" del usuario con el tiempo:

```sql
-- Tabla de memorias extraídas
apply_migration(
  name: "create_memories",
  query: "
    CREATE TABLE memories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      content TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      importance FLOAT DEFAULT 0.5 CHECK (importance BETWEEN 0 AND 1),
      embedding vector(1536),
      created_at TIMESTAMPTZ DEFAULT now() NOT NULL
    )
  "
)

apply_migration(
  name: "rls_memories",
  query: "ALTER TABLE memories ENABLE ROW LEVEL SECURITY"
)

apply_migration(
  name: "policy_memories_own",
  query: "CREATE POLICY memories_own ON memories FOR ALL USING (auth.uid() = user_id)"
)
```

```typescript
// src/features/[nombre]/services/memory.service.ts
import { generateObject } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { z } from 'zod'
import { generateEmbedding } from '@/shared/lib/embeddings'
import { createClient } from '@/shared/lib/supabase/server'

const MemoryExtractionSchema = z.object({
  memories: z.array(z.object({
    content: z.string().describe('Hecho importante sobre el usuario en forma corta'),
    category: z.enum(['preferencia', 'contexto', 'objetivo', 'restriccion']),
    importance: z.number().min(0).max(1),
  })),
})

// Extraer memorias importantes de una conversación
export async function extractMemories(
  userId: string,
  conversation: Array<{ role: string; content: string }>
): Promise<void> {
  const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY! })

  const { object } = await generateObject({
    model: openrouter('anthropic/claude-3-haiku'),
    schema: MemoryExtractionSchema,
    prompt: `Analiza esta conversación y extrae SOLO los hechos importantes y permanentes
sobre el usuario que un asistente debería recordar en futuras conversaciones.
NO extraigas el contenido de la conversación — solo los hechos sobre el usuario.

Conversación:
${conversation.map(m => `${m.role}: ${m.content}`).join('\n')}

Extrae máximo 3 memorias importantes. Si no hay hechos relevantes, devuelve array vacío.`,
  })

  if (!object.memories.length) return

  const supabase = await createClient()

  for (const memory of object.memories) {
    const embedding = await generateEmbedding(memory.content)
    await supabase.from('memories').insert({
      user_id: userId,
      content: memory.content,
      category: memory.category,
      importance: memory.importance,
      embedding,
    })
  }
}

// Recuperar memorias relevantes para la query actual
export async function getRelevantMemories(
  userId: string,
  query: string,
  limit: number = 5
): Promise<string[]> {
  const supabase = await createClient()
  const embedding = await generateEmbedding(query)

  const { data } = await supabase.rpc('match_memories', {
    query_embedding: embedding,
    filter_user_id: userId,
    match_count: limit,
  })

  return (data ?? []).map((m: { content: string }) => m.content)
}
```

---

## Context Window Management (Anti-Desbordamiento)

Cuando las conversaciones son largas, comprimir el historial para no superar el context window:

```typescript
// src/features/[nombre]/services/context.service.ts
import { generateText } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'

// Máximo de mensajes antes de comprimir
const MAX_MESSAGES_BEFORE_COMPRESSION = 30
const MESSAGES_TO_KEEP_RECENT = 10

export async function compressHistoryIfNeeded(
  messages: Array<{ role: string; content: string }>
): Promise<typeof messages> {
  if (messages.length <= MAX_MESSAGES_BEFORE_COMPRESSION) {
    return messages
  }

  // Separar: mensajes a comprimir + mensajes recientes a conservar
  const toCompress = messages.slice(0, -MESSAGES_TO_KEEP_RECENT)
  const recent = messages.slice(-MESSAGES_TO_KEEP_RECENT)

  const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY! })

  // Resumir la parte antigua
  const { text: summary } = await generateText({
    model: openrouter('anthropic/claude-3-haiku'),
    prompt: `Resume brevemente (máximo 200 palabras) los puntos clave de esta conversación:

${toCompress.map(m => `${m.role}: ${m.content}`).join('\n')}

El resumen debe capturar: contexto del usuario, decisiones tomadas, información clave.`,
  })

  // Inyectar resumen como contexto del sistema
  return [
    { role: 'system', content: `[Resumen de conversación anterior]\n${summary}` },
    ...recent,
  ]
}
```

---

## Arquitectura Feature-First

```
src/features/[nombre-con-memoria]/
├── api/
│   └── chat/route.ts          ← POST: streaming + guarda historial
├── services/
│   ├── history.service.ts     ← getConversationHistory, saveMessages
│   ├── preferences.service.ts ← getUserPreferences, applyPreferencesToPrompt
│   ├── memory.service.ts      ← extractMemories, getRelevantMemories
│   └── context.service.ts     ← compressHistoryIfNeeded
└── components/
    ├── Chat.tsx               ← Chat con historial visible
    └── ConversationList.tsx   ← Sidebar de conversaciones pasadas
```

---

## Variables de Entorno Requeridas

```bash
OPENROUTER_API_KEY=...          # Para generación (ya en stack Forge)
OPENAI_API_KEY=...              # Para embeddings (si usas memoria semántica)
```

---

*"La memoria no es un feature — es el factor que convierte una herramienta en un asistente."*
