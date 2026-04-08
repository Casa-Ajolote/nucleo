# Chat with Docs — Conversa con tus Documentos

> *"El documento que no puedes buscar es un documento que no existe."*

Skill para construir la feature más solicitada en AI SaaS: **subir un documento y hablar con él**. Combina Supabase Storage (upload), extracción de texto, RAG con pgvector y chat streaming. El usuario sube un PDF, y segundos después puede hacerle preguntas en lenguaje natural.

---

## Cuándo Usar Este Skill

| Caso | Usar Chat with Docs |
|------|---------------------|
| "Chat with PDF" / "Chat with contract" | ✅ |
| Base de conocimiento sobre documentos del usuario | ✅ |
| Análisis de reportes, manuales, contratos | ✅ |
| FAQ desde documentación de empresa | ✅ |
| Los documentos son los mismos para todos los usuarios | ❌ — usar RAG Pattern directamente |
| Solo necesitas búsqueda, no conversación | ❌ — usar RAG Pattern directamente |

---

## Arquitectura Completa

```
UPLOAD PIPELINE (una vez por archivo):
Archivo del usuario → Supabase Storage → Text Extraction → Chunking → Embeddings → pgvector

QUERY PIPELINE (cada vez que el usuario pregunta):
Pregunta → Embedding → Similarity Search → Top-K chunks → Prompt con contexto → Streaming response
```

**Stack:**
- **Storage:** Supabase Storage (bucket `documents`)
- **Extracción de texto:** `pdf-parse` para PDFs, lectura directa para `.txt`/`.md`
- **Embeddings:** OpenAI `text-embedding-3-small` (`OPENAI_API_KEY`)
- **Vector DB:** Supabase pgvector
- **Generación:** OpenRouter + Vercel AI SDK v5 (`OPENROUTER_API_KEY`)

---

## FASE 1: Setup de Base de Datos y Storage

### Schema completo

```sql
-- MIGRACIÓN 1: Habilitar pgvector
apply_migration(
  name: "enable_pgvector",
  query: "CREATE EXTENSION IF NOT EXISTS vector"
)

-- MIGRACIÓN 2: Tabla de documentos del usuario
apply_migration(
  name: "create_user_documents",
  query: "
    CREATE TABLE user_documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      name TEXT NOT NULL,
      file_path TEXT NOT NULL,          -- path en Supabase Storage
      file_type TEXT NOT NULL,          -- 'pdf' | 'txt' | 'md'
      file_size INTEGER NOT NULL,       -- bytes
      status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'error')),
      chunk_count INTEGER DEFAULT 0,
      error_message TEXT,
      created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
    )
  "
)

-- MIGRACIÓN 3: Tabla de chunks con embeddings
apply_migration(
  name: "create_document_chunks",
  query: "
    CREATE TABLE document_chunks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      document_id UUID REFERENCES user_documents(id) ON DELETE CASCADE NOT NULL,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      content TEXT NOT NULL,
      chunk_index INTEGER NOT NULL,
      embedding vector(1536),
      created_at TIMESTAMPTZ DEFAULT now() NOT NULL
    )
  "
)

-- MIGRACIÓN 4: Índice para búsqueda vectorial rápida
apply_migration(
  name: "idx_chunks_embedding",
  query: "
    CREATE INDEX idx_chunks_embedding
    ON document_chunks USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100)
  "
)

-- MIGRACIÓN 5: Índices adicionales
apply_migration(
  name: "idx_chunks_document",
  query: "CREATE INDEX idx_chunks_document ON document_chunks(document_id)"
)

apply_migration(
  name: "idx_documents_user",
  query: "CREATE INDEX idx_documents_user ON user_documents(user_id, created_at DESC)"
)

-- MIGRACIÓN 6: RLS — cada usuario solo ve sus documentos
apply_migration(
  name: "rls_user_documents",
  query: "ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY"
)

apply_migration(
  name: "rls_document_chunks",
  query: "ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY"
)

apply_migration(
  name: "policy_documents_own",
  query: "
    CREATE POLICY documents_own ON user_documents
    FOR ALL USING (auth.uid() = user_id)
  "
)

apply_migration(
  name: "policy_chunks_own",
  query: "
    CREATE POLICY chunks_own ON document_chunks
    FOR ALL USING (auth.uid() = user_id)
  "
)

-- MIGRACIÓN 7: Función de búsqueda por similitud en chunks del usuario
apply_migration(
  name: "fn_match_document_chunks",
  query: "
    CREATE OR REPLACE FUNCTION match_document_chunks(
      query_embedding vector(1536),
      filter_user_id uuid,
      filter_document_id uuid DEFAULT NULL,
      match_threshold float DEFAULT 0.65,
      match_count int DEFAULT 5
    )
    RETURNS TABLE (
      id uuid,
      document_id uuid,
      content text,
      similarity float
    )
    LANGUAGE sql STABLE
    AS \$\$
      SELECT
        document_chunks.id,
        document_chunks.document_id,
        document_chunks.content,
        1 - (document_chunks.embedding <=> query_embedding) AS similarity
      FROM document_chunks
      WHERE
        document_chunks.user_id = filter_user_id
        AND (filter_document_id IS NULL OR document_chunks.document_id = filter_document_id)
        AND 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
      ORDER BY document_chunks.embedding <=> query_embedding
      LIMIT match_count;
    \$\$
  "
)

get_advisors(type: "security")
```

### Configurar Supabase Storage

```sql
-- Crear bucket privado para documentos
-- (Hacerlo desde el Dashboard de Supabase o via MCP)
-- Bucket: 'user-documents'
-- Tipo: Private (NO público)
-- Max file size: 10MB
-- Allowed MIME types: application/pdf, text/plain, text/markdown

-- RLS en Storage: cada usuario solo accede a su carpeta
-- La política de Storage se configura en el Dashboard:
-- Policy: authenticated users can INSERT/SELECT/DELETE objects where path starts with auth.uid()::text
```

---

## FASE 2: Instalación de Dependencias

```bash
# Extracción de texto de PDFs
npm install pdf-parse
npm install --save-dev @types/pdf-parse

# El resto ya está en el stack Forge:
# - openai (embeddings)
# - ai + @openrouter/ai-sdk-provider (generación)
# - @supabase/supabase-js (storage + DB)
```

---

## FASE 3: Servicios de Procesamiento

### Extractor de Texto

```typescript
// src/features/[nombre]/services/text-extractor.service.ts

interface ExtractedText {
  content: string
  pageCount?: number
}

export async function extractTextFromFile(
  fileBuffer: Buffer,
  fileType: string
): Promise<ExtractedText> {
  if (fileType === 'application/pdf') {
    return extractFromPDF(fileBuffer)
  }

  if (fileType === 'text/plain' || fileType === 'text/markdown') {
    return { content: fileBuffer.toString('utf-8') }
  }

  throw new Error(`Tipo de archivo no soportado: ${fileType}`)
}

async function extractFromPDF(buffer: Buffer): Promise<ExtractedText> {
  // Importación dinámica para evitar problemas con el bundle de Next.js
  const pdfParse = (await import('pdf-parse')).default
  const data = await pdfParse(buffer)

  return {
    content: data.text.replace(/\s+/g, ' ').trim(),
    pageCount: data.numpages,
  }
}
```

### Procesador de Documentos (Pipeline Completo)

```typescript
// src/features/[nombre]/services/document-processor.service.ts
import OpenAI from 'openai'
import { createClient } from '@/shared/lib/supabase/server'
import { extractTextFromFile } from './text-extractor.service'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const CHUNK_SIZE = 1500
const CHUNK_OVERLAP = 200

function chunkText(text: string): string[] {
  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length)
    const chunk = text.slice(start, end).trim()
    if (chunk.length > 50) chunks.push(chunk)
    start = end - CHUNK_OVERLAP
    if (start <= 0 || end === text.length) break
  }

  return chunks
}

async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts.map(t => t.replace(/\n/g, ' ')),
  })
  return response.data.map(d => d.embedding)
}

export async function processDocument(
  documentId: string,
  userId: string,
  filePath: string,
  fileType: string
): Promise<void> {
  const supabase = await createClient()

  try {
    // 1. Descargar el archivo desde Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('user-documents')
      .download(filePath)

    if (downloadError || !fileData) {
      throw new Error(`Error descargando archivo: ${downloadError?.message}`)
    }

    // 2. Extraer texto según el tipo de archivo
    const buffer = Buffer.from(await fileData.arrayBuffer())
    const { content } = await extractTextFromFile(buffer, fileType)

    if (!content || content.length < 50) {
      throw new Error('El documento está vacío o no se pudo extraer el texto')
    }

    // 3. Dividir en chunks
    const chunks = chunkText(content)

    if (chunks.length === 0) {
      throw new Error('No se generaron chunks del documento')
    }

    // 4. Generar embeddings en batch (eficiente: 1 llamada a la API)
    const BATCH_SIZE = 100 // OpenAI permite hasta 2048 inputs por request
    const allEmbeddings: number[][] = []

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE)
      const embeddings = await generateEmbeddingsBatch(batch)
      allEmbeddings.push(...embeddings)
    }

    // 5. Guardar chunks en Supabase
    const rows = chunks.map((content, i) => ({
      document_id: documentId,
      user_id: userId,
      content,
      chunk_index: i,
      embedding: allEmbeddings[i],
    }))

    // Insertar en lotes para evitar payload grande
    const INSERT_BATCH_SIZE = 50
    for (let i = 0; i < rows.length; i += INSERT_BATCH_SIZE) {
      const batch = rows.slice(i, i + INSERT_BATCH_SIZE)
      const { error: insertError } = await supabase
        .from('document_chunks')
        .insert(batch)

      if (insertError) throw new Error(`Error guardando chunks: ${insertError.message}`)
    }

    // 6. Actualizar estado del documento a 'ready'
    await supabase
      .from('user_documents')
      .update({
        status: 'ready',
        chunk_count: chunks.length,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)

  } catch (error) {
    // 7. Marcar como error si algo falla
    await supabase
      .from('user_documents')
      .update({
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Error desconocido',
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)

    throw error
  }
}
```

---

## FASE 4: API Routes

### Route de Upload

```typescript
// src/features/[nombre]/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/shared/lib/supabase/server'
import { processDocument } from '../../services/document-processor.service'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['application/pdf', 'text/plain', 'text/markdown']

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 })
  }

  // Validaciones
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'El archivo supera el límite de 10MB' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({
      error: `Tipo de archivo no soportado. Acepta: PDF, TXT, MD`,
    }, { status: 400 })
  }

  // Subir a Supabase Storage
  const filePath = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
  const fileBuffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from('user-documents')
    .upload(filePath, fileBuffer, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json({ error: 'Error al subir el archivo' }, { status: 500 })
  }

  // Crear registro del documento en BD (status: 'processing')
  const { data: document, error: dbError } = await supabase
    .from('user_documents')
    .insert({
      user_id: user.id,
      name: file.name,
      file_path: filePath,
      file_type: file.type,
      file_size: file.size,
      status: 'processing',
    })
    .select('id')
    .single()

  if (dbError || !document) {
    // Limpiar el archivo si falla la BD
    await supabase.storage.from('user-documents').remove([filePath])
    return NextResponse.json({ error: 'Error al registrar el documento' }, { status: 500 })
  }

  // Procesar en background (no esperar — responder inmediatamente)
  // El cliente hará polling del status
  processDocument(document.id, user.id, filePath, file.type).catch(console.error)

  return NextResponse.json({
    documentId: document.id,
    status: 'processing',
    message: 'Documento subido. Procesando...',
  })
}
```

### Route de Chat

```typescript
// src/features/[nombre]/api/chat/route.ts
import { streamText } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { NextRequest } from 'next/server'
import { createClient } from '@/shared/lib/supabase/server'
import { generateEmbedding } from '@/shared/lib/embeddings'
import { rateLimiter } from '@/shared/lib/rate-limit'

const SYSTEM_PROMPT = `Eres un asistente que responde preguntas sobre los documentos del usuario.

Reglas:
1. Usa SOLO la información del contexto proporcionado.
2. Si la respuesta no está en los documentos, di: "No encontré información sobre eso en tus documentos."
3. Cita el documento cuando sea relevante (ej: "Según el documento X...").
4. Sé conciso y directo.`

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('No autorizado', { status: 401 })

  // Rate limiting
  const { success } = await rateLimiter.limit(user.id)
  if (!success) {
    return new Response('Demasiadas requests. Intenta en unos momentos.', { status: 429 })
  }

  const { messages, documentId } = await req.json()
  const lastUserMessage = messages[messages.length - 1]?.content ?? ''

  // 1. Embedding de la pregunta del usuario
  const queryEmbedding = await generateEmbedding(lastUserMessage)

  // 2. Buscar chunks relevantes (con o sin filtro de documento específico)
  const { data: chunks } = await supabase.rpc('match_document_chunks', {
    query_embedding: queryEmbedding,
    filter_user_id: user.id,
    filter_document_id: documentId ?? null,
    match_threshold: 0.65,
    match_count: 5,
  })

  // 3. Construir el contexto con los chunks encontrados
  const context = chunks && chunks.length > 0
    ? chunks.map((c: { content: string }, i: number) => `[Fragmento ${i + 1}]\n${c.content}`).join('\n\n---\n\n')
    : 'No se encontró información relevante en los documentos.'

  // 4. Generar con streaming
  const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY! })

  const result = streamText({
    model: openrouter('anthropic/claude-3-5-haiku'), // Haiku es suficiente para RAG
    system: `${SYSTEM_PROMPT}\n\nCONTEXTO DE TUS DOCUMENTOS:\n${context}`,
    messages,
  })

  return result.toDataStreamResponse()
}
```

### Route de Status (Polling)

```typescript
// src/features/[nombre]/api/documents/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/shared/lib/supabase/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data, error } = await supabase
    .from('user_documents')
    .select('id, name, status, chunk_count, file_size, error_message, created_at')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // Obtener el file_path antes de borrar
  const { data: doc } = await supabase
    .from('user_documents')
    .select('file_path')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!doc) return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })

  // Borrar chunks (CASCADE lo hace automáticamente), el registro y el archivo
  await supabase.from('user_documents').delete().eq('id', params.id)
  await supabase.storage.from('user-documents').remove([doc.file_path])

  return NextResponse.json({ success: true })
}
```

---

## FASE 5: Componentes UI

### Hook Central

```typescript
// src/features/[nombre]/hooks/useChatWithDocs.ts
import { useState, useCallback, useRef } from 'react'
import { useChat } from 'ai/react'

interface Document {
  id: string
  name: string
  status: 'processing' | 'ready' | 'error'
  chunk_count: number
  file_size: number
  error_message?: string
}

export function useChatWithDocs() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/features/[nombre]/chat',
    body: { documentId: activeDocumentId },
    onError: (err) => console.error('[chat] error:', err),
  })

  // Polling del status del documento hasta que esté 'ready' o 'error'
  const pollDocumentStatus = useCallback((documentId: string) => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/features/[nombre]/documents/${documentId}`)
        const doc: Document = await res.json()

        setDocuments(prev => prev.map(d => d.id === documentId ? doc : d))

        if (doc.status === 'processing') {
          pollingRef.current = setTimeout(poll, 2000) // Reintentar en 2 segundos
        }
      } catch (e) {
        console.error('[poll] error:', e)
      }
    }
    poll()
  }, [])

  const uploadDocument = useCallback(async (file: File) => {
    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/features/[nombre]/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al subir el archivo')
      }

      // Agregar el documento a la lista con status 'processing'
      const newDoc: Document = {
        id: data.documentId,
        name: file.name,
        status: 'processing',
        chunk_count: 0,
        file_size: file.size,
      }
      setDocuments(prev => [newDoc, ...prev])

      // Iniciar polling hasta que esté listo
      pollDocumentStatus(data.documentId)

    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsUploading(false)
    }
  }, [pollDocumentStatus])

  const deleteDocument = useCallback(async (documentId: string) => {
    await fetch(`/api/features/[nombre]/documents/${documentId}`, { method: 'DELETE' })
    setDocuments(prev => prev.filter(d => d.id !== documentId))
    if (activeDocumentId === documentId) setActiveDocumentId(null)
  }, [activeDocumentId])

  return {
    documents, activeDocumentId, setActiveDocumentId,
    isUploading, uploadError, uploadDocument, deleteDocument,
    messages, input, handleInputChange, handleSubmit, isLoading,
    chatError: error,
  }
}
```

### Componente Principal

```typescript
// src/features/[nombre]/components/ChatWithDocs.tsx
'use client'
import { useRef } from 'react'
import { useChatWithDocs } from '../hooks/useChatWithDocs'
import { DocumentList } from './DocumentList'
import { DocumentUpload } from './DocumentUpload'

export function ChatWithDocs() {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const {
    documents, activeDocumentId, setActiveDocumentId,
    isUploading, uploadError, uploadDocument, deleteDocument,
    messages, input, handleInputChange, handleSubmit, isLoading,
  } = useChatWithDocs()

  const activeDoc = documents.find(d => d.id === activeDocumentId)
  const canChat = activeDocumentId && activeDoc?.status === 'ready'

  return (
    <div className="flex h-[calc(100vh-80px)] gap-4 p-4">

      {/* SIDEBAR: Lista de documentos */}
      <div className="w-72 flex flex-col gap-3 shrink-0">
        <DocumentUpload
          onUpload={uploadDocument}
          isUploading={isUploading}
          error={uploadError}
        />
        <DocumentList
          documents={documents}
          activeDocumentId={activeDocumentId}
          onSelect={setActiveDocumentId}
          onDelete={deleteDocument}
        />
      </div>

      {/* MAIN: Chat */}
      <div className="flex-1 flex flex-col border rounded-xl overflow-hidden">

        {/* Header con documento activo */}
        <div className="p-3 border-b bg-muted/50 flex items-center gap-2">
          {activeDoc ? (
            <>
              <span className="text-sm font-medium truncate">{activeDoc.name}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {activeDoc.chunk_count} fragmentos indexados
              </span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">
              Selecciona un documento para comenzar
            </span>
          )}
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && canChat && (
            <div className="text-center text-sm text-muted-foreground mt-8">
              <p className="font-medium">Documento listo 🎉</p>
              <p>Hazle una pregunta a <strong>{activeDoc?.name}</strong></p>
            </div>
          )}

          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`
                rounded-lg p-3 max-w-[75%] text-sm
                ${message.role === 'user'
                  ? 'bg-primary text-primary-foreground ml-12'
                  : 'bg-muted mr-12'
                }
              `}>
                {message.role === 'assistant' && (
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <span>🔍</span>
                    <span>Basado en tus documentos</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground animate-pulse">
                Buscando en el documento...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3 border-t">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder={
                canChat
                  ? `Pregunta sobre "${activeDoc?.name}"...`
                  : 'Selecciona un documento listo para chatear'
              }
              disabled={!canChat || isLoading}
              className="flex-1 rounded-lg border px-3 py-2 text-sm focus-visible:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!canChat || isLoading || !input.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

### DocumentUpload Component

```typescript
// src/features/[nombre]/components/DocumentUpload.tsx
'use client'
import { useCallback } from 'react'

interface Props {
  onUpload: (file: File) => void
  isUploading: boolean
  error: string | null
}

export function DocumentUpload({ onUpload, isUploading, error }: Props) {
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onUpload(file)
    e.target.value = '' // Resetear para permitir re-upload del mismo archivo
  }, [onUpload])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) onUpload(file)
  }, [onUpload])

  return (
    <div>
      <label
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        className={`
          block border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
          transition-colors text-sm
          ${isUploading
            ? 'border-primary/50 bg-primary/5 cursor-not-allowed'
            : 'border-muted-foreground/30 hover:border-primary hover:bg-muted/50'
          }
        `}
      >
        <input
          type="file"
          className="hidden"
          accept=".pdf,.txt,.md"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-muted-foreground">Subiendo...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg">📄</span>
            <span className="font-medium">Subir documento</span>
            <span className="text-xs text-muted-foreground">PDF, TXT o MD · Máx 10MB</span>
          </div>
        )}
      </label>

      {error && (
        <p className="mt-2 text-xs text-destructive bg-destructive/10 rounded p-2">{error}</p>
      )}
    </div>
  )
}
```

### DocumentList Component

```typescript
// src/features/[nombre]/components/DocumentList.tsx
'use client'

interface Document {
  id: string
  name: string
  status: 'processing' | 'ready' | 'error'
  chunk_count: number
  file_size: number
  error_message?: string
}

interface Props {
  documents: Document[]
  activeDocumentId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

const statusConfig = {
  processing: { icon: '⏳', label: 'Procesando...', color: 'text-yellow-600' },
  ready: { icon: '✅', label: 'Listo', color: 'text-green-600' },
  error: { icon: '❌', label: 'Error', color: 'text-red-600' },
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DocumentList({ documents, activeDocumentId, onSelect, onDelete }: Props) {
  if (documents.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-6 border rounded-lg">
        <p>No tienes documentos aún.</p>
        <p className="text-xs mt-1">Sube uno para empezar.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 overflow-y-auto">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
        Tus documentos ({documents.length})
      </p>
      {documents.map(doc => {
        const status = statusConfig[doc.status]
        const isActive = doc.id === activeDocumentId

        return (
          <div
            key={doc.id}
            onClick={() => doc.status === 'ready' && onSelect(doc.id)}
            className={`
              group relative rounded-lg border p-3 text-sm transition-all
              ${doc.status === 'ready' ? 'cursor-pointer hover:shadow-sm' : 'cursor-default opacity-70'}
              ${isActive ? 'border-primary bg-primary/5' : 'hover:border-foreground/20'}
            `}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate" title={doc.name}>{doc.name}</p>
                <p className={`text-xs mt-0.5 flex items-center gap-1 ${status.color}`}>
                  <span>{status.icon}</span>
                  <span>
                    {doc.status === 'ready'
                      ? `${doc.chunk_count} fragmentos · ${formatFileSize(doc.file_size)}`
                      : status.label
                    }
                  </span>
                </p>
                {doc.status === 'error' && doc.error_message && (
                  <p className="text-xs text-destructive mt-1 truncate" title={doc.error_message}>
                    {doc.error_message}
                  </p>
                )}
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); onDelete(doc.id) }}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity text-xs p-1 rounded"
                title="Eliminar documento"
              >
                🗑
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

---

## Arquitectura Feature-First

```
src/features/[nombre-chat-docs]/
├── api/
│   ├── upload/route.ts           ← POST: upload + inicia procesamiento async
│   ├── chat/route.ts             ← POST: similarity search + streaming
│   └── documents/
│       └── [id]/route.ts         ← GET: status polling · DELETE: borrar doc
├── components/
│   ├── ChatWithDocs.tsx          ← Layout principal (sidebar + chat)
│   ├── DocumentUpload.tsx        ← Drag & drop upload con estados
│   └── DocumentList.tsx          ← Lista de docs con status en tiempo real
├── hooks/
│   └── useChatWithDocs.ts        ← Estado, polling, upload, chat
└── services/
    ├── text-extractor.service.ts ← PDF/TXT/MD → texto plano
    └── document-processor.service.ts ← chunk → embed → guardar en pgvector
```

---

## Variables de Entorno Requeridas

```bash
# Para embeddings (OpenAI — OpenRouter NO soporta embeddings)
OPENAI_API_KEY=sk-...

# Para generación con streaming (stack normal Forge)
OPENROUTER_API_KEY=...

# Para rate limiting
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=AX...

# Supabase (ya en el stack)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## Límites y Configuración

| Parámetro | Valor por Defecto | Ajustar Si... |
|-----------|------------------|---------------|
| Tamaño máximo de archivo | 10 MB | Documentos técnicos largos → 25 MB |
| Tipos permitidos | PDF, TXT, MD | Necesitas DOCX → añadir `mammoth` |
| Chunk size | 1500 chars | Documentos muy técnicos → 2000 |
| Chunk overlap | 200 chars | Necesitas más contexto → 300 |
| Similarity threshold | 0.65 | Respuestas muy genéricas → subir a 0.72 |
| Chunks por query | 5 | Documentos muy largos con info dispersa → 8 |
| Batch de embeddings | 100 | Sin cambios (límite de la API) |

---

## Anti-Patrones

- ❌ **NO procesar PDFs síncronamente** — Documentos grandes tardan > 30s; siempre procesar en background con polling
- ❌ **NO guardar el texto extraído completo** — Solo los chunks + sus embeddings; el texto íntegro en Storage
- ❌ **NO olvidar el `ON DELETE CASCADE`** — Si se borra el documento, sus chunks deben borrarse automáticamente
- ❌ **NO usar Storage público** — Los documentos del usuario son privados; bucket privado siempre
- ❌ **NO dejar los documentos en Storage si la BD falla** — Siempre limpiar el archivo de Storage si el INSERT falla
- ❌ **NO hacer polling eterno** — Detener el polling cuando el status sea `ready` o `error`
- ❌ **NO usar `text-embedding-3-large`** — `text-embedding-3-small` tiene calidad similar a 5x menor costo

---

*"El mejor asistente no es el que sabe más — es el que sabe exactamente lo que tú ya sabes."*
