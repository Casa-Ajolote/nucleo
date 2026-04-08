# RAG Pattern — Retrieval Augmented Generation

> *"La IA sin tus datos es genérica. La IA con tus datos es un producto."*

Skill para diseñar e implementar RAG en proyectos Forge. Conecta un modelo de lenguaje con una base de conocimiento propia del usuario — sin inventar respuestas, sin alucinaciones, con fuentes citables.

---

## Cuándo Usar RAG

| Situación | Usar RAG |
|-----------|---------|
| El usuario necesita respuestas basadas en SUS documentos | ✅ |
| Quieres un asistente que "conoce" tu producto/empresa | ✅ |
| El contenido cambia frecuentemente (KB, docs, FAQs) | ✅ |
| Solo necesitas una respuesta genérica del modelo | ❌ No es RAG |
| El contexto cabe en el context window (<50 páginas) | ❌ Inyécta directo |

---

## Arquitectura RAG en Forge

```
INGESTION (una vez por documento):
Documento → Chunking → Embeddings → Supabase pgvector

QUERY (cada vez que el usuario pregunta):
Pregunta del usuario
      ↓
   Embedding de la pregunta
      ↓
   Similarity search en pgvector
      ↓
   Top-K chunks relevantes recuperados
      ↓
   Prompt = system + chunks + pregunta
      ↓
   Modelo genera respuesta con fuentes
      ↓
   Respuesta + referencias al usuario
```

**Stack de la Forge para RAG:**
- **Vector DB**: Supabase pgvector (sin infra adicional)
- **Embeddings**: OpenAI `text-embedding-3-small` (1536 dims, $0.02/1M tokens)
- **Generación**: OpenRouter + Vercel AI SDK v5 (el stack normal de Forge)
- **Variable nueva**: `OPENAI_API_KEY` (solo para embeddings)

---

## FASE 1: Setup de Supabase pgvector

### Habilitar pgvector y crear tablas

```sql
-- MIGRACIÓN 1: Habilitar extensión
apply_migration(
  name: "enable_pgvector",
  query: "CREATE EXTENSION IF NOT EXISTS vector"
)

-- MIGRACIÓN 2: Tabla de documentos
apply_migration(
  name: "create_documents",
  query: "
    CREATE TABLE documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      title TEXT NOT NULL,
      source_url TEXT,
      content TEXT NOT NULL,
      embedding vector(1536),
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now() NOT NULL
    )
  "
)

-- MIGRACIÓN 3: Índice para búsqueda rápida
apply_migration(
  name: "idx_documents_embedding",
  query: "
    CREATE INDEX idx_documents_embedding
    ON documents USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100)
  "
)

-- MIGRACIÓN 4: RLS obligatorio
apply_migration(
  name: "enable_rls_documents",
  query: "ALTER TABLE documents ENABLE ROW LEVEL SECURITY"
)

apply_migration(
  name: "documents_policy_own",
  query: "
    CREATE POLICY documents_own ON documents
    FOR ALL USING (auth.uid() = user_id)
  "
)

-- MIGRACIÓN 5: Función de búsqueda por similitud
apply_migration(
  name: "fn_match_documents",
  query: "
    CREATE OR REPLACE FUNCTION match_documents(
      query_embedding vector(1536),
      match_threshold float DEFAULT 0.7,
      match_count int DEFAULT 5,
      filter_user_id uuid DEFAULT NULL
    )
    RETURNS TABLE (
      id uuid,
      title text,
      content text,
      similarity float,
      metadata jsonb
    )
    LANGUAGE sql STABLE
    AS \$\$
      SELECT
        documents.id,
        documents.title,
        documents.content,
        1 - (documents.embedding <=> query_embedding) AS similarity,
        documents.metadata
      FROM documents
      WHERE
        (filter_user_id IS NULL OR documents.user_id = filter_user_id)
        AND 1 - (documents.embedding <=> query_embedding) > match_threshold
      ORDER BY documents.embedding <=> query_embedding
      LIMIT match_count;
    \$\$
  "
)

-- VERIFICAR
get_advisors(type: \"security\")
```

---

## FASE 2: Pipeline de Ingesta de Documentos

### Servicio de Embeddings

```typescript
// src/shared/lib/embeddings.ts
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Generar embedding de un texto
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.replace(/\n/g, ' '), // Los saltos de línea reducen la calidad
  })
  return response.data[0]?.embedding ?? []
}

// Generar embeddings en batch (más eficiente)
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts.map(t => t.replace(/\n/g, ' ')),
  })
  return response.data.map(d => d.embedding)
}
```

### Estrategia de Chunking

```typescript
// src/shared/lib/chunking.ts

interface Chunk {
  content: string
  index: number
  metadata: Record<string, unknown>
}

// Chunking por caracteres con overlap (para texto general)
export function chunkText(
  text: string,
  options: { chunkSize?: number; overlap?: number } = {}
): Chunk[] {
  const { chunkSize = 1500, overlap = 200 } = options

  const chunks: Chunk[] = []
  let start = 0
  let index = 0

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    const content = text.slice(start, end).trim()

    if (content.length > 50) { // Ignorar chunks muy pequeños
      chunks.push({ content, index, metadata: { start, end } })
      index++
    }

    // Avanzar con overlap para mantener contexto entre chunks
    start = end - overlap
    if (start <= 0 || end === text.length) break
  }

  return chunks
}

// Chunking por párrafos (mejor para documentos estructurados)
export function chunkByParagraph(
  text: string,
  maxChunkSize: number = 2000
): Chunk[] {
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0)
  const chunks: Chunk[] = []
  let currentChunk = ''
  let index = 0

  for (const paragraph of paragraphs) {
    if ((currentChunk + paragraph).length > maxChunkSize && currentChunk) {
      chunks.push({ content: currentChunk.trim(), index, metadata: {} })
      currentChunk = paragraph
      index++
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph
    }
  }

  if (currentChunk.trim()) {
    chunks.push({ content: currentChunk.trim(), index, metadata: {} })
  }

  return chunks
}
```

### API Route de Ingesta

```typescript
// src/features/[nombre-rag]/api/ingest/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/shared/lib/supabase/server'
import { chunkText, generateEmbeddings } from '@/shared/lib'

const ingestSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(10),
  sourceUrl: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const parsed = ingestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { title, content, sourceUrl, metadata } = parsed.data

  // 1. Chunking
  const chunks = chunkText(content, { chunkSize: 1500, overlap: 200 })

  // 2. Generar embeddings en batch (1 llamada a la API)
  const embeddings = await generateEmbeddings(chunks.map(c => c.content))

  // 3. Guardar en Supabase
  const rows = chunks.map((chunk, i) => ({
    user_id: user.id,
    title: `${title} [${chunk.index + 1}/${chunks.length}]`,
    content: chunk.content,
    embedding: embeddings[i],
    source_url: sourceUrl,
    metadata: { ...metadata, chunkIndex: chunk.index, totalChunks: chunks.length },
  }))

  const { error } = await supabase.from('documents').insert(rows)

  if (error) {
    console.error('[ingest] Supabase error:', error)
    return NextResponse.json({ error: 'Error al guardar el documento' }, { status: 500 })
  }

  return NextResponse.json({
    message: 'Documento procesado correctamente',
    chunks: chunks.length,
  })
}
```

---

## FASE 3: Query — Búsqueda y Generación

### Servicio de RAG

```typescript
// src/features/[nombre-rag]/services/rag.service.ts
import { createClient } from '@/shared/lib/supabase/server'
import { generateEmbedding } from '@/shared/lib/embeddings'

export interface RelevantChunk {
  id: string
  title: string
  content: string
  similarity: number
}

export async function retrieveRelevantChunks(
  query: string,
  userId: string,
  options: { threshold?: number; limit?: number } = {}
): Promise<RelevantChunk[]> {
  const { threshold = 0.7, limit = 5 } = options

  const supabase = await createClient()

  // 1. Embedding de la query
  const queryEmbedding = await generateEmbedding(query)

  // 2. Búsqueda por similitud
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: limit,
    filter_user_id: userId,
  })

  if (error) {
    console.error('[rag] match_documents error:', error)
    return []
  }

  return data ?? []
}

// Formatear chunks como contexto para el prompt
export function formatContext(chunks: RelevantChunk[]): string {
  if (chunks.length === 0) return 'No se encontró información relevante.'

  return chunks
    .map((chunk, i) => `[Fuente ${i + 1}: ${chunk.title}]\n${chunk.content}`)
    .join('\n\n---\n\n')
}
```

### API Route de Query con Streaming

```typescript
// src/features/[nombre-rag]/api/query/route.ts
import { streamText } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { NextRequest } from 'next/server'
import { createClient } from '@/shared/lib/supabase/server'
import { retrieveRelevantChunks, formatContext } from '../services/rag.service'

const RAG_SYSTEM_PROMPT = `Eres un asistente que responde preguntas basándose
EXCLUSIVAMENTE en el contexto proporcionado.

Reglas:
1. Solo usa información del contexto. No inventes datos.
2. Si la respuesta no está en el contexto, dilo claramente.
3. Cita las fuentes al final de tu respuesta (ej: "Fuente: [nombre]").
4. Sé conciso y directo.`

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('No autorizado', { status: 401 })

  const { query, messages } = await req.json()

  // 1. Recuperar chunks relevantes
  const chunks = await retrieveRelevantChunks(query, user.id, {
    threshold: 0.65,
    limit: 5,
  })
  const context = formatContext(chunks)

  // 2. Construir prompt con contexto
  const contextualPrompt = `${RAG_SYSTEM_PROMPT}

CONTEXTO DISPONIBLE:
${context}

Responde a la pregunta del usuario usando solo la información anterior.`

  // 3. Generar con streaming
  const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY! })

  const result = streamText({
    model: openrouter('anthropic/claude-3-5-haiku'), // Haiku es suficiente para RAG
    system: contextualPrompt,
    messages,
  })

  return result.toDataStreamResponse()
}
```

---

## FASE 4: UI con Fuentes Citables

```typescript
// src/features/[nombre-rag]/components/RAGChat.tsx
import { useChat } from 'ai/react'

export function RAGChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/features/[nombre-rag]/query',
  })

  return (
    <div className="flex flex-col h-full">
      {/* Historial de mensajes */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={cn(
              'rounded-lg p-3 max-w-[80%]',
              message.role === 'user'
                ? 'ml-auto bg-primary text-primary-foreground'
                : 'bg-muted'
            )}
          >
            {/* Indicador de fuente en respuestas de la IA */}
            {message.role === 'assistant' && (
              <div className="text-xs text-muted-foreground mb-1">
                🔍 Basado en tus documentos
              </div>
            )}
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
        ))}

        {/* Loading state específico de RAG */}
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="animate-pulse">●</span>
            Buscando en tus documentos...
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Pregunta sobre tus documentos..."
            className="flex-1 rounded-lg border px-3 py-2 text-sm focus-visible:ring-2"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            Enviar
          </Button>
        </div>
      </form>
    </div>
  )
}
```

---

## Variables de Entorno Requeridas

```bash
# Para embeddings (OpenAI directamente — OpenRouter no soporta embeddings)
OPENAI_API_KEY=sk-...

# Para generación (el stack normal de Forge)
OPENROUTER_API_KEY=...
```

---

## Arquitectura Feature-First

```
src/features/[nombre-rag]/
├── api/
│   ├── ingest/route.ts       ← POST: procesa y guarda documentos
│   └── query/route.ts        ← POST: búsqueda + generación con streaming
├── components/
│   ├── RAGChat.tsx            ← Chat interface con fuentes
│   ├── DocumentUpload.tsx     ← Subir/gestionar documentos
│   └── DocumentList.tsx      ← Lista de documentos indexados
├── services/
│   └── rag.service.ts        ← retrieveRelevantChunks, formatContext
└── types/
    └── index.ts              ← Document, Chunk, RAGQuery types
```

---

## Métricas de Calidad RAG

Para evaluar si el RAG funciona bien:

| Métrica | Qué mide | Target |
|---------|---------|--------|
| Similarity threshold | Relevancia mínima de chunks | > 0.65 |
| Context coverage | % de preguntas con chunks relevantes | > 80% |
| Respuestas con "no encontré info" | Señal de gap en documentos | < 20% |
| Latencia total (embed + search + gen) | UX aceptable | < 5s |

---

## Anti-Patrones RAG

- ❌ NO usar chunks demasiado grandes (>2000 chars) — pierdes precisión
- ❌ NO usar chunks demasiado pequeños (<100 chars) — pierdes contexto
- ❌ NO ignorar el threshold de similitud — mejor "no sé" que información incorrecta
- ❌ NO olvidar RLS en la tabla `documents` — los documentos de un usuario son privados
- ❌ NO usar `text-embedding-3-large` sin necesidad — `text-embedding-3-small` es 5x más barato con calidad similar

---

*"RAG es el puente entre el conocimiento del usuario y la inteligencia del modelo."*
