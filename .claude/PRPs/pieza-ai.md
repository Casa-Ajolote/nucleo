# La Pieza — AI Feature Template

> *"La IA en un producto no es una feature — es un nuevo tipo de interfaz entre el usuario y sus datos."*

Template específico para features de IA. Usado por `/build` cuando `Build Mode = 🤖 Feature con IA`.
Reemplaza el template genérico (`pieza-base.md`) para capturar las decisiones específicas de IA
antes de que El Yunque empiece a ejecutar.

---

## 🔄 Cómo Encaja en Forge

```
/plan → AI-FEATURE-BRIEF-[nombre].md  (aprobado por ti)
             ↓
/build → Lee el Brief + el subtipo elegido (A/B/C/D/E)
             ↓
         Genera PIEZA-AI-[nombre].md  (este template)
             ↓
         Presenta fases según subtipo → Espera "go"
             ↓
         El Yunque ejecuta por fases (con AI Context Mapping)
             ↓
         Auto-Blindaje documenta aprendizajes aquí
```

---

## 📝 Nomenclatura

- Archivos: `PIEZA-AI-[nombre-del-feature].md`
- Estados: `PENDIENTE` → `APROBADO` → `EN_PROGRESO` → `COMPLETADO`
- Ubicación: `.claude/PRPs/`

---

# TEMPLATE la Pieza — AI FEATURE

```markdown
# la Pieza: [Nombre del Feature IA]

> **Estado**: PENDIENTE
> **Brief origen**: `AI-FEATURE-BRIEF-[nombre].md`
> **Fecha**: YYYY-MM-DD
> **Build Mode**: 🤖 Feature con IA

---

## 🤖 Configuración del Feature IA

| Parámetro | Valor |
|-----------|-------|
| **Subtipo** | [A · Chat Conversacional / B · RAG / C · Chat con Docs / D · Memoria / E · Generación Estructurada] |
| **Modelo Principal** | [ej: `anthropic/claude-3-5-sonnet` via OpenRouter] |
| **Modelo de Embeddings** | [ej: `text-embedding-3-small` via OpenAI / N/A si subtipo A o E] |
| **Estimación de Costo** | ~$[X]/mes conservador · ~$[Y]/mes con crecimiento |
| **Rate Limiting** | [N] req/min por usuario (Upstash Redis / in-memory MVP) |
| **Patrón de Integración** | [streamText + useChat / generateObject + Zod / chat-with-docs pipeline] |
| **pgvector** | [Requerido / No requerido] |

### Variables de Entorno Requeridas

```bash
# Siempre para generación (OpenRouter)
OPENROUTER_API_KEY=...

# Solo si subtipo B, C o D (embeddings con OpenAI)
OPENAI_API_KEY=...

# Rate limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

---

## Objetivo

[Qué se construye — estado final en 1-2 oraciones concretas.
Ejemplo: "Un asistente de chat que responde preguntas sobre la documentación técnica
interna usando RAG, con respuestas en streaming y citas de fuente."]

## Por Qué

| Problema del Usuario | Cómo lo Resuelve |
|---------------------|-----------------|
| [Dolor específico] | [Feature que lo elimina] |

**Impacto medible**: [Tiempo ahorrado, conversiones, valor percibido]

## Qué

### Criterios de Éxito (Definition of Done)

- [ ] El usuario puede [acción principal del feature] sin errores
- [ ] La respuesta se muestra en streaming (< 500ms primer token)
- [ ] El rate limiting responde 429 + Retry-After al superar el límite
- [ ] Los 4 estados UI están implementados: loading / error / empty / data
- [ ] `npm run typecheck` → 0 errores
- [ ] `npm run build` → exitoso
- [ ] Playwright screenshot confirma UI y flujo principal funcionando

### Happy Path

[Flujo del usuario de A a Z:
1. El usuario [acción de entrada]
2. La IA [procesa / busca / genera]
3. El usuario ve [output esperado]
4. El usuario puede [acción de seguimiento]]

### Unhappy Paths (Obligatorio en AI Features)

- **Modelo lento / timeout**: Mostrar estado "Procesando..." → error con reintentar
- **Rate limit alcanzado**: 429 con mensaje "Intenta en X segundos"
- **Respuesta vacía / alucinación**: [Fallback definido en el Brief]
- **Sin resultados en RAG**: "No encontré información sobre eso en [fuente]" (si aplica)

---

## Contexto

### Referencias de Código

- `src/features/[existente]/` → Patrón Feature-First a seguir
- `AI-FEATURE-BRIEF-[nombre].md` → Fuente de verdad del diseño
- `.claude/skills/la-herreria/assets/[patrón].md` → Implementación de referencia
  - Subtipo A: `ai-feature-design.md`
  - Subtipo B: `rag-pattern.md`
  - Subtipo C: `chat-with-docs.md`
  - Subtipo D: `memory-pattern.md`
  - Subtipo E: `ai-feature-design.md` + `prompt-engineering.md`

### Arquitectura Feature-First

```
src/features/[nombre-ai]/
├── api/
│   ├── chat/route.ts          ← POST: streaming (subtipo A/B/C/D)
│   ├── upload/route.ts        ← POST: file upload (subtipo C only)
│   └── [accion]/route.ts      ← POST: structured output (subtipo E)
├── components/
│   ├── [Feature]Chat.tsx      ← Layout principal + streaming UI
│   ├── [Feature]Input.tsx     ← Input del usuario
│   └── [Feature]Output.tsx    ← Respuesta + estados loading/error/empty
├── hooks/
│   └── use[Feature].ts        ← useChat / useCompletion / estado custom
├── services/
│   ├── [feature].service.ts   ← Lógica de negocio + llamadas al modelo
│   ├── embeddings.service.ts  ← Solo si subtipo B/C/D
│   └── context.service.ts     ← compressHistoryIfNeeded (si subtipo D)
└── types/
    └── index.ts               ← Types del feature
```

### Modelo de Datos (completar según subtipo)

**Subtipo A — Chat Conversacional** (sin persistencia):
```
No requiere schema adicional.
Si se quiere historial → ver Subtipo D.
```

**Subtipo B — RAG (documentos del sistema)**:
```sql
-- Completar desde rag-pattern.md
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY documents_own ON documents FOR ALL USING (auth.uid() = user_id);
-- Ver rag-pattern.md para índice ivfflat + función match_documents
```

**Subtipo C — Chat con Docs del Usuario**:
```sql
-- Ver chat-with-docs.md para schema completo:
-- user_documents (id, user_id, name, file_path, status, chunk_count)
-- document_chunks (id, document_id, user_id, content, chunk_index, embedding)
-- Función match_document_chunks con filtro por document_id opcional
```

**Subtipo D — IA con Memoria**:
```sql
-- Ver memory-pattern.md para los 3 patrones:
-- Patrón A: conversations + messages
-- Patrón B: profiles.ai_preferences JSONB
-- Patrón C: memories (id, user_id, content, embedding, memory_type)
```

**Subtipo E — Generación Estructurada**:
```
No requiere schema adicional.
El output se retorna en el response de la API route.
Si se necesita persistir resultados → añadir tabla según el caso.
```

### Contrato de API

```typescript
// Endpoint principal
POST /api/features/[nombre]/chat (o /generate para subtipo E)

// Request
{
  messages: Message[]  // subtipo A/B/D: historial completo
  documentId?: string  // subtipo C: documento seleccionado
  input?: string       // subtipo E: input para generateObject
}

// Response
// Subtipo A/B/C/D: data stream (Vercel AI SDK)
// Subtipo E: JSON con el objeto Zod validado

// Errores
// 401: No autenticado
// 429: Rate limit con Retry-After header
// 500: Error del modelo con mensaje en español
```

### Schema de Output Zod (solo Subtipo E)

```typescript
// Definir antes de escribir la route
import { z } from 'zod'

export const [FeatureName]Schema = z.object({
  // Definir según el AI-FEATURE-BRIEF
})

export type [FeatureName]Output = z.infer<typeof [FeatureName]Schema>
```

---

## Blueprint (Fases de Construcción)

> ⚠️ REGLA CRÍTICA: Solo definir FASES aquí. Las subtareas se generan
> al ENTRAR a cada fase (mapeo de contexto just-in-time).
> Ver: `.claude/prompts/el-yunque.md`

---

### Subtipo A — Chat Conversacional

#### Fase 1: Setup + Route de Chat
**Objetivo**: API route con `streamText`, rate limiting y auth funcionando
**Validación**: `curl -X POST /api/features/[nombre]/chat` devuelve stream
**Tiempo estimado**: ~1h

#### Fase 2: UI con Streaming
**Objetivo**: Componente con `useChat`, 4 estados UI (loading/error/empty/data)
**Validación**: Playwright screenshot del chat respondiendo en tiempo real
**Tiempo estimado**: ~1.5h

#### Fase 3: Validación Final
**Objetivo**: Feature production-ready
**Validación**:
- [ ] `npm run typecheck` → 0 errores
- [ ] `npm run build` → exitoso
- [ ] Playwright: flujo completo usuario → respuesta
- [ ] Rate limiting: 21 mensajes rápidos → 429 en el 21
- [ ] Variables de entorno en Vercel configuradas
**Tiempo estimado**: ~30min

---

### Subtipo B — RAG

#### Fase 1: Infraestructura Vectorial (pgvector + schema + RLS)
**Objetivo**: Tablas creadas, RLS activo, función `match_documents` lista
**Validación**: `get_advisors(type:"security")` → 0 warnings
**Tiempo estimado**: ~45min

#### Fase 2: Pipeline de Ingesta
**Objetivo**: Servicio que toma texto → chunks → embeddings → Supabase
**Validación**: Ingestar 1 doc de prueba → verificar chunks en Supabase
**Tiempo estimado**: ~1h

#### Fase 3: API de Query con Streaming
**Objetivo**: Route que toma pregunta → similarity search → `streamText` con contexto
**Validación**: Pregunta sobre el doc ingestado → respuesta correcta con cita
**Tiempo estimado**: ~1h

#### Fase 4: UI del Asistente
**Objetivo**: Chat con indicador "Basado en tus documentos" + 4 estados UI
**Validación**: Playwright screenshot del chat respondiendo con fuente citada
**Tiempo estimado**: ~1h

#### Fase 5: Validación Final
**Objetivo**: Feature production-ready
**Validación**:
- [ ] `npm run typecheck` → 0 errores · `npm run build` → exitoso
- [ ] Playwright: flujo completo pregunta → respuesta con cita
- [ ] Similarity threshold 0.65: preguntas irrelevantes → "No encontré información"
- [ ] Rate limiting funcionando · Variables en Vercel
**Tiempo estimado**: ~30min

---

### Subtipo C — Chat con Documentos del Usuario

#### Fase 1: Storage + Schema (user_documents + document_chunks)
**Objetivo**: Bucket privado en Supabase Storage + tablas con RLS en cascada
**Validación**: `get_advisors(type:"security")` → 0 warnings
**Tiempo estimado**: ~1h

#### Fase 2: Pipeline de Procesamiento (extract + chunk + embed)
**Objetivo**: Servicio async que descarga archivo → extrae texto → chunks → embeddings
**Validación**: Subir PDF de prueba → verificar chunks en document_chunks
**Tiempo estimado**: ~1.5h

#### Fase 3: API Routes (upload + chat + status)
**Objetivo**: 3 routes: POST /upload (async), GET /documents/[id] (polling), POST /chat
**Validación**: Upload + polling hasta status='ready' + pregunta → respuesta
**Tiempo estimado**: ~1.5h

#### Fase 4: UI Completa (upload + lista + chat)
**Objetivo**: `DocumentUpload` (drag & drop) + `DocumentList` (polling) + `ChatWithDocs`
**Validación**: Playwright: subir PDF → esperar ready → hacer pregunta → ver respuesta
**Tiempo estimado**: ~2h

#### Fase 5: Validación Final
**Objetivo**: Feature production-ready
**Validación**:
- [ ] `npm run typecheck` → 0 errores · `npm run build` → exitoso
- [ ] Playwright: flujo end-to-end completo (upload → ready → chat)
- [ ] PDF inválido → error claro en UI · Archivo >10MB → error claro
- [ ] Borrar documento → chunks se borran por CASCADE
- [ ] Variables en Vercel (OPENAI_API_KEY incluida)
**Tiempo estimado**: ~45min

---

### Subtipo D — IA con Memoria Persistente

#### Fase 1: Schema de Memoria (elegir patrón: historial / preferencias / semántico)
**Objetivo**: Tablas y columnas del patrón elegido con RLS
**Validación**: `get_advisors(type:"security")` → 0 warnings
**Tiempo estimado**: ~45min

#### Fase 2: Servicios de Memoria
**Objetivo**: `history.service.ts`, `preferences.service.ts` o `memory.service.ts` según patrón
**Validación**: Tests manuales con execute_sql → datos guardados correctamente
**Tiempo estimado**: ~1.5h

#### Fase 3: Route de Chat con Memoria
**Objetivo**: Route que carga historial → (comprimir si >30 msgs) → stream → guarda en onFinish
**Validación**: 2 sesiones separadas → el contexto persiste entre ellas
**Tiempo estimado**: ~1h

#### Fase 4: UI con Historial Visible
**Objetivo**: `ConversationList` (sidebar) + `Chat` (mensajes persistidos)
**Validación**: Playwright: conversación, refrescar página → historial visible
**Tiempo estimado**: ~1.5h

#### Fase 5: Validación Final
**Objetivo**: Feature production-ready
**Validación**:
- [ ] `npm run typecheck` → 0 errores · `npm run build` → exitoso
- [ ] Playwright: sesión 1 → info compartida · sesión 2 → info recordada
- [ ] Context compression: simular >30 msgs → verificar que comprime
- [ ] Rate limiting funcionando · Variables en Vercel
**Tiempo estimado**: ~30min

---

### Subtipo E — Generación Estructurada

#### Fase 1: Schema Zod + Service
**Objetivo**: Schema definido y validado + servicio que llama a `generateObject`
**Validación**: Test unitario del schema con input de muestra
**Tiempo estimado**: ~45min

#### Fase 2: API Route
**Objetivo**: Route con `generateObject` + rate limiting + error handling
**Validación**: curl POST → JSON válido según el schema Zod
**Tiempo estimado**: ~45min

#### Fase 3: UI (sin streaming)
**Objetivo**: Formulario de input + display del output estructurado + 4 estados UI
**Validación**: Playwright screenshot del resultado con datos reales
**Tiempo estimado**: ~1h

#### Fase 4: Validación Final
**Objetivo**: Feature production-ready
**Validación**:
- [ ] `npm run typecheck` → 0 errores · `npm run build` → exitoso
- [ ] Input inválido → Zod valida y devuelve error claro (no 500)
- [ ] Rate limiting funcionando · Variables en Vercel
**Tiempo estimado**: ~30min

---

## 🤖 Gotchas por Subtipo (Leer ANTES de implementar)

### Generales para todos los subtipos

- ❌ **NO usar `toTextStreamResponse()`** — usar `toDataStreamResponse()` con Vercel AI SDK v5
- ❌ **NO parsear JSON manualmente** — `generateObject` + Zod siempre para outputs estructurados
- ❌ **NO hardcodear el model string** — definirlo como constante en `prompts.ts` o `config.ts`
- ✅ Rate limiting SIEMPRE antes de llamar al modelo (no después)
- ✅ Leer OPENROUTER_API_KEY desde `process.env` (no importar como módulo)

### Subtipo B y C (embeddings)

- ❌ **NO usar OpenRouter para embeddings** — OpenRouter no tiene API de embeddings
- ✅ Usar `openai` package directamente con `OPENAI_API_KEY` para `text-embedding-3-small`
- ✅ Generar embeddings en **batch** — 1 llamada para N chunks, no N llamadas
- ❌ **NO activar pgvector con `CREATE EXTENSION vector`** — usar `CREATE EXTENSION IF NOT EXISTS vector`
- ✅ El índice `ivfflat` requiere que la tabla tenga datos para ser útil (se puede crear vacío)

### Subtipo C (Chat con Docs)

- ❌ **NO procesar el PDF síncronamente** en la route de upload — timeout en Vercel a los 10s
- ✅ Subir a Storage → crear registro con `status: 'processing'` → procesar async → polling desde cliente
- ❌ **NO guardar el Storage path en el campo `content`** — guardar solo en `file_path`; chunks van en `document_chunks`
- ✅ Siempre limpiar Storage si el INSERT en BD falla (evitar archivos huérfanos)

### Subtipo D (Memoria)

- ✅ `compressHistoryIfNeeded` activar cuando el historial supera 30 mensajes
- ❌ **NO guardar el `content` de mensajes de streaming parciales** — solo guardar en `onFinish`
- ✅ El `conversation_id` se genera en el primer mensaje y persiste en el cliente (header o body)

---

## 🔒 Anti-Patrones Forge AI

- ❌ NO crear tablas de IA sin RLS
- ❌ NO olvidar `ON DELETE CASCADE` entre documents → chunks
- ❌ NO generar embeddings de chunks >2000 chars (degradan la calidad)
- ❌ NO ignorar el similarity threshold (< 0.65 → ruido en el contexto)
- ❌ NO usar `text-embedding-3-large` — `text-embedding-3-small` tiene calidad comparable a 1/5 del costo
- ❌ NO omitir el fallback chain: modelo principal → modelo económico → respuesta estática
- ❌ NO dejar la route de IA sin timeout (`export const maxDuration = 30` en la route)
- ❌ NO escribir código en `src/app/` — toda la lógica va en `src/features/[nombre]/`

```typescript
// Siempre añadir en routes de IA (Vercel necesita esto para streaming)
export const runtime = 'edge'     // opcional pero recomendado para streaming
export const maxDuration = 30     // timeout en segundos
```

---

## 🔒 Auto-Blindaje

> *"Cada error es un impacto que refuerza la estructura. El mismo error nunca ocurre dos veces."*
>
> Esta sección CRECE durante la implementación. El agente la actualiza
> cada vez que encuentra y resuelve un error.

### [YYYY-MM-DD]: [Título corto del aprendizaje]
- **Error**: [Qué falló exactamente]
- **Fix**: [Cómo se resolvió]
- **Aplicar en**: [Dónde más aplica — feature, agente, o todo el proyecto]

---

*la Pieza pendiente aprobación. Ninguna línea de código ha sido modificada.*
```

---

## 🎯 Stack Golden Path — AI Features

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 16 + React 19 + TypeScript (strict) |
| Generación | Vercel AI SDK v5 (`streamText`, `generateObject`) + OpenRouter |
| Embeddings | OpenAI `text-embedding-3-small` (`OPENAI_API_KEY`) |
| Vector DB | Supabase pgvector (`vector(1536)`, índice ivfflat cosine) |
| Rate Limiting | Upstash Redis (`@upstash/ratelimit` sliding window) |
| Storage | Supabase Storage (bucket privado, para subtipo C) |
| Extracción PDF | `pdf-parse` (para subtipo C) |
| Validación | Zod — siempre en inputs y outputs estructurados |
| UI Streaming | `useChat` (conversacional) / `useCompletion` (single prompt) |
| Deploy | Vercel (edge runtime para streaming) |

---

## 🔗 Archivos Relacionados

| Archivo | Rol |
|---------|-----|
| `AI-FEATURE-BRIEF-[nombre].md` | Fuente de verdad del diseño (input de /build) |
| `.claude/prompts/el-yunque.md` | Motor de ejecución por fases (con AI Context Mapping) |
| `.claude/commands/build.md` | Comando que genera este la Pieza |
| `.claude/agents/backend-specialist.md` | Agente que implementa las routes de IA |
| `.claude/agents/supabase-admin.md` | Agente que crea el schema de pgvector |
| `.claude/agents/frontend-specialist.md` | Agente que implementa la UI de streaming |
| `.claude/skills/la-herreria/assets/rag-pattern.md` | Patrón completo para subtipo B |
| `.claude/skills/la-herreria/assets/chat-with-docs.md` | Patrón completo para subtipo C |
| `.claude/skills/la-herreria/assets/memory-pattern.md` | Patrón completo para subtipo D |
