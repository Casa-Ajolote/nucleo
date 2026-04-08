# Nucleo — Technical Specifications

> **Tech Spec v1.0**
> **Estado**: BORRADOR
> **Fecha**: 2026-04-01
> **PDR de referencia**: PDR-nucleo.md

---

## 1. Resumen Ejecutivo

### Problema (del PDR)
Contenido valioso disperso en 8+ plataformas sin forma centralizada de guardar, categorizar y recuperar. El usuario pierde tiempo re-buscando y re-preguntando.

### Solucion Tecnica
PWA mobile-first con Next.js 16 que captura contenido (links, texto, markdown, comandos), lo procesa con IA de forma asincrona (resumen, categorias, tags, thumbnail), lo almacena en Supabase y permite encontrarlo en < 5 segundos via full-text search con pg_trgm.

### Complejidad Estimada
**MEDIA** — 7 entidades principales, integracion AI async, full-text search, PWA instalable, bulk import. Un solo usuario, sin pagos, sin roles.

---

## 2. Stack Tecnologico

### 2.1 Tabla Resumen

| Capa | Tecnologia | Version | Justificacion |
|------|-----------|---------|---------------|
| Framework | Next.js | 16 | Server Components para cargas rapidas, Server Actions para mutaciones, `after()` para procesamiento async |
| UI Library | React | 19 | Requerido por Next.js 16, use() y transitions para UX fluida |
| Language | TypeScript | 5.x (strict) | Type safety end-to-end, Zod inference |
| Styling | Tailwind CSS | 3.4 | Utility-first, rapido en mobile, purged CSS minimo |
| Components | shadcn/ui | latest | Cards, dialogs, dropdowns, search — todo lo que Nucleo necesita. New York style |
| State Mgmt | Zustand | 5.x | Cache local de items para busqueda instantanea sin round-trip. Prepara offline-first Fase 2 |
| Validation | Zod | 4.x | Schema validation compartido client/server, inference con TypeScript |
| Backend | Supabase | Cloud | Auth + PostgreSQL + Storage en uno. Sin infra extra |
| Database | PostgreSQL | 15+ (via Supabase) | Relacional, pg_trgm para fuzzy search, JSONB para metadata flexible |
| Auth | Supabase Auth | - | Email + password. Single user, sin complejidad de SSO |
| Storage | Supabase Storage | - | Thumbnails y OG images. Bucket privado, max 200KB/imagen |
| AI Engine | Vercel AI SDK | v5 | streamObject + generateObject con Zod schemas. No depende de Vercel hosting |
| AI Provider | OpenRouter | - | Acceso a Haiku 4.5 para categorizacion. Costos bajos |
| PWA | Serwist | latest | Fork moderno de next-pwa. Service worker, manifest, installable |
| Search | pg_trgm | PostgreSQL ext | Trigram fuzzy search. Suficiente para 1 usuario con miles de items |
| Hosting | Docker en VPS | - | Self-hosted. Dockerfile multi-stage + standalone output |
| Monitoring | N/A | - | No necesario para MVP personal |

### 2.2 Decisiones Tecnicas Importantes

**Async sobre Sync para AI processing**
- Razon: La UI responde al instante. El usuario puede pegar 5 items seguidos sin esperar. El analisis aparece cuando esta listo.
- Trade-off: El item aparece brevemente sin resumen/tags (estado "procesando")
- Implementacion: `after()` de Next.js 16 — ejecuta codigo despues de enviar la response. Funciona en standalone mode (Docker).

**pg_trgm sobre Algolia/Meilisearch**
- Razon: Un solo usuario, no justifica un servicio de search externo. pg_trgm soporta fuzzy matching y es nativo de PostgreSQL.
- Trade-off: No tan rapido como Algolia para millones de docs, pero irrelevante para este caso.
- Reevaluar si: +10,000 items y el search se siente lento (> 500ms).

**Docker en VPS sobre Vercel**
- Razon: Control total del hosting, sin vendor lock-in, costos predecibles.
- Trade-off: Hay que mantener el server, no hay auto-scaling. Aceptable para 1 usuario.
- Documentacion de deploy: pendiente del usuario.

**OG extraction + AI fallback**
- Razon: Extraer metadata con fetch+cheerio es gratis e instantaneo. Solo pasar a AI lo que no se puede extraer automaticamente.
- Trade-off: Algunos sitios bloquean fetch (paywalls, SPAs). En ese caso, AI trabaja solo con la URL.

**Supabase Cloud (no self-hosted)**
- Razon: Managed database sin maintenance overhead. Free tier suficiente para 1 usuario.
- Reevaluar si: El usuario decide self-host todo en el VPS (Supabase tiene Docker compose para self-hosting).

### 2.3 Lo Que NO Se Incluye (y por que)

| Tecnologia | Razon de exclusion | Agregar en |
|------------|-------------------|------------|
| Redis/Upstash | Sin rate limiting ni cache para 1 usuario | Fase 2+ si multi-user |
| Sentry | Monitoring overkill para uso personal | Fase 2+ |
| Resend | Sin emails transaccionales | Si se necesitan |
| Stripe/Polar | Sin pagos | Si se monetiza |
| Algolia/Meilisearch | pg_trgm es suficiente | Si search es lento con 10K+ items |
| Supabase Realtime | Polling simple es suficiente para 1 usuario | Fase 2 si se necesita multi-device sync en vivo |

---

## 3. Arquitectura

### 3.1 Diagrama de Alto Nivel

```
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   iPhone PWA     │────────▶│   Next.js 16     │────────▶│    Supabase      │
│   Mac Browser    │◀────────│   (Docker/VPS)   │◀────────│  (Cloud)         │
└──────────────────┘         └────────┬─────────┘         │  ┌────────────┐  │
                                      │                    │  │ PostgreSQL │  │
                                      │ after()            │  │ Auth       │  │
                                      ▼                    │  │ Storage    │  │
                              ┌───────────────┐            │  └────────────┘  │
                              │ AI Pipeline   │            └──────────────────┘
                              │ (async)       │
                              │               │
                              │ 1. Fetch URL  │
                              │ 2. Extract OG │
                              │ 3. AI Analyze │
                              │ 4. Update DB  │
                              └───────────────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │  OpenRouter    │
                              │  (Haiku 4.5)  │
                              └───────────────┘
```

### 3.2 Arquitectura de Carpetas

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/
│   │   ├── layout.tsx                    # Sidebar + workspace selector
│   │   ├── page.tsx                      # Dashboard / vista principal
│   │   ├── search/page.tsx               # Resultados de busqueda global
│   │   ├── workspace/[id]/
│   │   │   ├── page.tsx                  # Vista del workspace
│   │   │   └── folder/[folderId]/page.tsx
│   │   ├── item/[id]/page.tsx            # Detail view de un item
│   │   └── import/page.tsx               # Bulk import (CSV, bookmarks)
│   ├── api/
│   │   └── og/route.ts                   # OG metadata extraction endpoint
│   ├── layout.tsx                        # Root layout + PWA manifest
│   └── manifest.ts                       # PWA manifest dynamic
├── features/
│   ├── capture/                          # Captura de contenido
│   │   ├── components/
│   │   │   ├── capture-dialog.tsx        # Modal "+" para pegar contenido
│   │   │   └── content-type-detector.tsx
│   │   ├── hooks/
│   │   │   └── use-capture.ts
│   │   ├── services/
│   │   │   ├── actions.ts                # Server Actions: createItem
│   │   │   ├── og-extractor.ts           # Fetch + parse OG tags
│   │   │   └── ai-pipeline.ts            # AI analysis pipeline
│   │   └── types/
│   │       └── index.ts
│   ├── items/                            # Visualizacion y gestion de items
│   │   ├── components/
│   │   │   ├── item-card.tsx
│   │   │   ├── item-detail.tsx
│   │   │   ├── item-grid.tsx
│   │   │   └── copy-button.tsx
│   │   ├── hooks/
│   │   │   └── use-items.ts
│   │   ├── services/
│   │   │   └── actions.ts
│   │   ├── store/
│   │   │   └── items-store.ts            # Zustand store
│   │   └── types/
│   │       └── index.ts
│   ├── workspaces/                       # Gestion de workspaces
│   │   ├── components/
│   │   │   ├── workspace-selector.tsx
│   │   │   └── workspace-settings.tsx
│   │   ├── services/
│   │   │   └── actions.ts
│   │   └── types/
│   │       └── index.ts
│   ├── folders/                          # Carpetas anidadas
│   │   ├── components/
│   │   │   ├── folder-tree.tsx
│   │   │   └── folder-breadcrumb.tsx
│   │   ├── services/
│   │   │   └── actions.ts
│   │   └── types/
│   │       └── index.ts
│   ├── search/                           # Busqueda global
│   │   ├── components/
│   │   │   ├── search-bar.tsx
│   │   │   └── search-results.tsx
│   │   ├── hooks/
│   │   │   └── use-search.ts
│   │   ├── services/
│   │   │   └── actions.ts
│   │   └── store/
│   │       └── search-store.ts
│   ├── tags/                             # Tags y categorias
│   │   ├── components/
│   │   │   ├── tag-badge.tsx
│   │   │   ├── tag-editor.tsx
│   │   │   └── category-filter.tsx
│   │   ├── services/
│   │   │   └── actions.ts
│   │   └── types/
│   │       └── index.ts
│   └── import/                           # Bulk import
│       ├── components/
│       │   ├── csv-import.tsx
│       │   └── bookmark-import.tsx
│       ├── services/
│       │   └── actions.ts
│       └── types/
│           └── index.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # Browser client
│   │   └── server.ts                     # Server client with cookies
│   ├── ai/
│   │   ├── client.ts                     # OpenRouter client config
│   │   ├── schemas.ts                    # Zod schemas for AI structured output
│   │   └── prompts.ts                    # System prompts for analysis
│   └── utils/
│       ├── content-detector.ts           # Detect link vs text vs markdown vs command
│       └── og-parser.ts                  # Parse OG meta tags from HTML
└── shared/
    ├── components/
    │   ├── ui/                           # shadcn/ui components
    │   ├── loading-skeleton.tsx
    │   └── empty-state.tsx
    ├── hooks/
    │   └── use-debounce.ts
    ├── types/
    │   └── index.ts
    └── constants/
        └── index.ts
```

### 3.3 Componentes del Sistema

**Next.js App (Docker container)**
- Proposito: Sirve la PWA, procesa Server Actions, ejecuta AI pipeline async
- Responsabilidades: UI rendering, auth flow, content capture, AI orchestration, search
- Escala: Standalone mode en Docker. Para 1 usuario, un container basta.

**Supabase Cloud**
- Proposito: Base de datos, auth, file storage
- Responsabilidades: Persistencia, autenticacion, almacenamiento de thumbnails
- Se comunica con: Next.js via supabase-js client

**AI Pipeline (async, dentro de Next.js)**
- Proposito: Analizar contenido capturado
- Flujo: `after()` → fetch URL → extract OG → call OpenRouter → update DB
- Tecnologia: Vercel AI SDK v5 + OpenRouter (Haiku 4.5)

### 3.4 Flujo de Datos — Captura de un Link

```
Usuario pega URL
       │
       ▼
[Server Action: createItem]
       │
       ├──▶ Detectar tipo de contenido (URL regex)
       ├──▶ Guardar item en DB (status: "processing")
       ├──▶ Retornar response al cliente (UI muestra card con skeleton)
       │
       └──▶ after() ─── Background ───
                │
                ▼
         [Fetch URL HTML]
                │
                ▼
         [Extraer OG tags]
         ┌──────┴──────┐
         │             │
    OG disponible  OG no disponible
         │             │
         ▼             ▼
    Usar OG data   AI genera titulo
    como base      y descripcion
         │             │
         └──────┬──────┘
                ▼
         [AI Analysis via OpenRouter]
         - Generar resumen (< 200 palabras)
         - Categorizar automaticamente
         - Generar 3-7 tags relevantes
         - Sugerir carpeta si hay carpetas existentes
                │
                ▼
         [Descargar OG image / screenshot]
         - Guardar en Supabase Storage
         - Comprimir a max 200KB
                │
                ▼
         [Update item en DB]
         - status: "ready"
         - summary, category, tags, thumbnail_url
                │
                ▼
         [Cliente detecta cambio]
         - Polling cada 3s mientras status === "processing"
         - Card se actualiza con datos completos
```

---

## 4. Base de Datos

### 4.1 Modelo de Datos (Diagrama ER)

```
users (1) ──────< (many) workspaces
workspaces (1) ──────< (many) folders
workspaces (1) ──────< (many) items
folders (1) ──────< (many) folders (self-ref, max 3 levels)
folders (1) ──────< (many) items
items (many) >──────< (many) tags (via item_tags)
categories (1) ──────< (many) items
```

### 4.2 Schema Completo

```sql
-- ============================================
-- Extension: pg_trgm para fuzzy search
-- ============================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- Tabla: workspaces
-- Proposito: Espacios de trabajo del usuario (max 5)
-- ============================================
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  icon TEXT DEFAULT 'briefcase',
  position SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, slug)
);

CREATE INDEX idx_workspaces_user ON workspaces(user_id);

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own workspaces"
  ON workspaces FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- Tabla: folders
-- Proposito: Carpetas anidadas (max 3 niveles)
-- ============================================
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  depth SMALLINT NOT NULL DEFAULT 0 CHECK (depth <= 2),
  position SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(workspace_id, parent_id, slug)
);

CREATE INDEX idx_folders_workspace ON folders(workspace_id);
CREATE INDEX idx_folders_parent ON folders(parent_id);

ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own folders"
  ON folders FOR ALL
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- Tabla: categories
-- Proposito: Clasificaciones de contenido (generadas por IA o manuales)
-- ============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(workspace_id, slug)
);

CREATE INDEX idx_categories_workspace ON categories(workspace_id);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own categories"
  ON categories FOR ALL
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- Tabla: items
-- Proposito: Piezas de contenido capturado
-- ============================================
CREATE TYPE content_type AS ENUM ('link', 'text', 'markdown', 'command');
CREATE TYPE processing_status AS ENUM ('pending', 'processing', 'ready', 'failed');

CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,

  -- Contenido original
  content_type content_type NOT NULL,
  title TEXT,
  original_url TEXT,
  original_content TEXT NOT NULL,

  -- Generado por IA
  summary TEXT,
  ai_metadata JSONB DEFAULT '{}',
  processing_status processing_status NOT NULL DEFAULT 'pending',
  processing_error TEXT,

  -- Visual
  thumbnail_url TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,

  -- Organizacion
  is_pinned BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_items_workspace ON items(workspace_id);
CREATE INDEX idx_items_folder ON items(folder_id);
CREATE INDEX idx_items_category ON items(category_id);
CREATE INDEX idx_items_content_type ON items(content_type);
CREATE INDEX idx_items_status ON items(processing_status);
CREATE INDEX idx_items_created ON items(created_at DESC);

-- Full-text search indexes (pg_trgm)
CREATE INDEX idx_items_title_trgm ON items USING GIN (title gin_trgm_ops);
CREATE INDEX idx_items_summary_trgm ON items USING GIN (summary gin_trgm_ops);
CREATE INDEX idx_items_content_trgm ON items USING GIN (original_content gin_trgm_ops);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own items"
  ON items FOR ALL
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- Tabla: tags
-- Proposito: Etiquetas (generadas por IA o manuales)
-- ============================================
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(workspace_id, slug)
);

CREATE INDEX idx_tags_workspace ON tags(workspace_id);
CREATE INDEX idx_tags_name_trgm ON tags USING GIN (name gin_trgm_ops);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tags"
  ON tags FOR ALL
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- Tabla: item_tags (junction)
-- Proposito: Relacion many-to-many items <-> tags
-- ============================================
CREATE TABLE item_tags (
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, tag_id)
);

CREATE INDEX idx_item_tags_tag ON item_tags(tag_id);

ALTER TABLE item_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own item_tags"
  ON item_tags FOR ALL
  USING (
    item_id IN (
      SELECT id FROM items WHERE workspace_id IN (
        SELECT id FROM workspaces WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================
-- Funcion: search_items (full-text search)
-- ============================================
CREATE OR REPLACE FUNCTION search_items(
  p_workspace_id UUID,
  p_query TEXT,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  summary TEXT,
  content_type content_type,
  thumbnail_url TEXT,
  category_id UUID,
  folder_id UUID,
  created_at TIMESTAMPTZ,
  similarity REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id,
    i.title,
    i.summary,
    i.content_type,
    i.thumbnail_url,
    i.category_id,
    i.folder_id,
    i.created_at,
    GREATEST(
      similarity(i.title, p_query),
      similarity(i.summary, p_query),
      similarity(i.original_content, p_query)
    ) AS similarity
  FROM items i
  WHERE i.workspace_id = p_workspace_id
    AND i.processing_status = 'ready'
    AND (
      i.title % p_query
      OR i.summary % p_query
      OR i.original_content % p_query
    )
  ORDER BY similarity DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4.3 Storage / Buckets

| Bucket | Contenido | Acceso | Limite |
|--------|----------|--------|--------|
| thumbnails | OG images y screenshots de items | Privado (signed URLs) | 200KB por imagen |
| imports | Archivos CSV/bookmarks temporales | Privado | 5MB por archivo |

### 4.4 Migrations Strategy

Migraciones secuenciales en `supabase/migrations/`. Ejecutadas con Supabase CLI (`supabase db push` para dev, `supabase db push --linked` para prod). Cada migracion es un archivo SQL con timestamp.

---

## 5. API Specifications

### 5.1 Estilo de API

**Server Actions** para todas las mutaciones (create, update, delete). **Server Components** para queries de lectura. Un **API Route** (`/api/og`) para extraccion de metadata que puede ser llamado internamente.

### 5.2 Server Actions

```typescript
// === CAPTURE ===

interface CreateItemInput {
  workspaceId: string;
  content: string;          // URL, texto, markdown o comando
  contentType?: ContentType; // Auto-detectado si no se provee
  folderId?: string;
}

interface CreateItemResponse {
  id: string;
  processingStatus: 'pending';
}

// === ITEMS ===

interface UpdateItemInput {
  id: string;
  title?: string;
  folderId?: string | null;
  categoryId?: string | null;
  isPinned?: boolean;
  isFavorite?: boolean;
}

interface DeleteItemInput {
  id: string;
}

// === WORKSPACES ===

interface CreateWorkspaceInput {
  name: string;
  icon?: string;
}
// Max 5 por usuario — validado en server

interface UpdateWorkspaceInput {
  id: string;
  name?: string;
  icon?: string;
}

// === FOLDERS ===

interface CreateFolderInput {
  workspaceId: string;
  parentId?: string;      // null = root level
  name: string;
}
// Max depth 2 (3 niveles: root/child/grandchild) — validado en server

// === TAGS ===

interface UpdateItemTagsInput {
  itemId: string;
  tagIds: string[];       // Reemplaza todos los tags del item
}

interface CreateTagInput {
  workspaceId: string;
  name: string;
}

// === SEARCH ===

interface SearchInput {
  workspaceId: string;
  query: string;
  categoryId?: string;
  tagIds?: string[];
  contentType?: ContentType;
  folderId?: string;
  limit?: number;         // default 20
  offset?: number;        // default 0
}

// === IMPORT ===

interface ImportCSVInput {
  workspaceId: string;
  file: File;             // CSV con plantilla predefinida
}

interface ImportBookmarksInput {
  workspaceId: string;
  file: File;             // HTML export de bookmarks del navegador
}
```

### 5.3 AI Structured Output

```typescript
// Zod schema para la respuesta de AI
const aiAnalysisSchema = z.object({
  title: z.string().max(120).describe('Titulo conciso y descriptivo del contenido'),
  summary: z.string().max(800).describe('Resumen en 1-3 parrafos del contenido'),
  category: z.string().describe('Categoria principal: development, design, ai, business, productivity, learning, reference, other'),
  tags: z.array(z.string().max(30)).min(2).max(7).describe('Tags relevantes en minusculas'),
  suggestedFolder: z.string().optional().describe('Nombre de carpeta sugerida si no existe una apropiada'),
  contentLanguage: z.enum(['es', 'en', 'other']).describe('Idioma principal del contenido'),
});
```

### 5.4 Validacion

Zod schemas definidos en cada feature (`features/[name]/types/`). Compartidos client/server via imports directos. El Server Action valida con `.parse()` antes de cualquier operacion en DB. Errores de validacion retornan mensajes human-readable.

---

## 6. Autenticacion y Seguridad

### 6.1 Flujo de Auth

```
[Login Page] ──▶ Supabase Auth (email + password)
      │
      ▼
[Session cookie set] ──▶ Redirect to /(main)/
      │
      ▼
[Middleware] ──▶ Verifica session en cada request
      │
   ┌──┴──┐
  Valid  Invalid
   │       │
   ▼       ▼
 Render   Redirect
 page     to /login
```

### 6.2 Proteccion de Rutas

| Ruta Pattern | Acceso | Redirect si no auth |
|-------------|--------|-------------------|
| /login, /register | Publico | N/A |
| /(main)/* | Autenticado | /login |
| /api/og | Autenticado | 401 |

### 6.3 Security Checklist

- [x] Passwords hasheados (Supabase Auth — bcrypt por default)
- [x] Session con cookies httpOnly + secure
- [x] RLS habilitado en TODAS las tablas
- [x] SQL injection prevenido (supabase-js usa queries parametrizadas)
- [x] XSS protection (React escapa por default + Content-Security-Policy)
- [x] Secrets en env vars (nunca hardcoded)
- [x] File uploads validados (tipo CSV/HTML, max 5MB)
- [x] Thumbnails validados (tipo imagen, max 200KB)
- [x] CORS configurado para dominio propio
- [x] HTTPS enforced en produccion (VPS con reverse proxy)

---

## 7. Integraciones Externas

### 7.1 OpenRouter (AI)

- **Proposito**: Analisis de contenido, generacion de resumen, categorizacion, tags
- **Auth method**: API key en env var `OPENROUTER_API_KEY`
- **Modelo**: `anthropic/claude-haiku-4-5-20251001` (rapido, barato)
- **Costo estimado**: ~$0.001 por item analizado (input ~500 tokens, output ~200 tokens)
- **Fallback si falla**: Item queda en status "failed", usuario puede re-procesar manualmente

### 7.2 OG Metadata Extraction (interno)

- **Proposito**: Extraer titulo, descripcion e imagen de URLs
- **Implementacion**: API route interna (`/api/og`) con fetch + cheerio
- **Timeout**: 5 segundos por URL
- **Fallback si falla**: AI genera titulo/descripcion sin metadata previa

---

## 8. Performance

### 8.1 Targets

| Metrica | Target | Maximo Aceptable |
|---------|--------|-----------------|
| First Contentful Paint | < 1.5s | 2.5s |
| Time to Interactive | < 2.0s | 3.0s |
| Search Response (P95) | < 200ms | 500ms |
| Item Capture (UI response) | < 300ms | 500ms |
| AI Processing (background) | < 10s | 30s |

### 8.2 Estrategias de Optimizacion

- **PWA caching**: Serwist cachea shell de la app. Navegacion instantanea entre pages.
- **Zustand local cache**: Items del workspace activo en memoria. Search local primero, DB como fallback.
- **Lazy loading**: Thumbnails con loading="lazy". Items paginados (20 por pagina, infinite scroll).
- **Image optimization**: Next.js Image component con sizes responsivos. Thumbnails max 200KB.
- **DB indexing**: pg_trgm indexes en title, summary, content. B-tree indexes en foreign keys y created_at.
- **Debounced search**: 300ms debounce en search input. No query en cada keystroke.

---

## 9. Error Handling

### 9.1 Estrategia

```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: string };
```

Todos los Server Actions retornan `ActionResult`. El cliente checa `success` y muestra el error en un toast si es `false`.

### 9.2 Errores de AI Pipeline

| Error | Comportamiento |
|-------|---------------|
| OpenRouter timeout/error | Item queda status "failed", boton "Reintentar" en UI |
| URL no accesible (paywall, 404) | Guardar item sin metadata OG, AI trabaja solo con URL |
| AI genera output invalido | Retry 1 vez, si falla → status "failed" |
| Supabase Storage error | Item se guarda sin thumbnail, log error |

### 9.3 User-Facing Errors

Toast notifications (shadcn/ui Sonner) para errores no criticos. Inline errors en formularios. Empty states informativos cuando no hay items/resultados.

---

## 10. Deployment

### 10.1 Environments

| Env | URL | Proposito | Deploy trigger |
|-----|-----|----------|---------------|
| Development | localhost:3000 | Dev local | Manual |
| Production | VPS (Docker) | Live | Manual / CI pipeline |

### 10.2 Environment Variables

**Publicas (client-safe):**
```
NEXT_PUBLIC_SUPABASE_URL=           # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # Supabase anon key (public, safe)
NEXT_PUBLIC_APP_URL=                # URL de la app en produccion
```

**Secretas (server-only):**
```
SUPABASE_SERVICE_ROLE_KEY=          # Supabase service role (solo server)
OPENROUTER_API_KEY=                 # OpenRouter API key
```

### 10.3 Docker

```dockerfile
# Multi-stage build
# Stage 1: Dependencies
# Stage 2: Build (next build con output: 'standalone')
# Stage 3: Production (node server.js, ~50MB image)
```

Next.js config: `output: 'standalone'` en `next.config.ts`. Genera un server Node.js minimal que no necesita node_modules completo.

Documentacion detallada de Docker/VPS pendiente del usuario.

### 10.4 Reverse Proxy

Nginx o Caddy como reverse proxy frente al container de Next.js. Maneja SSL (Let's Encrypt), HTTPS redirect, y static file caching.

---

## 11. Testing Strategy

### 11.1 Approach

| Tipo | Herramienta | Coverage Target | Que se testea |
|------|------------|----------------|---------------|
| E2E | Playwright MCP | Flujos criticos | Captura, busqueda, organizacion |
| Visual | Playwright MCP | UI responsive | Mobile + desktop rendering |

Testing manual via Playwright MCP para MVP. No unit tests en Fase 1 — el ROI es bajo para una herramienta personal de 1 usuario.

### 11.2 E2E Flows Criticos

1. Login → ver dashboard
2. Seleccionar workspace → pegar link → ver item procesado
3. Buscar item por texto → encontrar resultado
4. Crear carpeta → mover item a carpeta
5. Editar tags de un item
6. Import CSV → ver items importados
7. PWA: instalar en iPhone → abrir app standalone

---

## 12. Consideraciones Futuras (Post-MVP)

| Feature/Mejora | Impacto Tecnico | Fase |
|---------------|----------------|------|
| Voice notes | Web Speech API o Whisper API. Nuevo content_type. Storage para audio. | Fase 2 |
| RAG chat | pgvector extension, embeddings por item, chat UI con streaming | Fase 2 |
| Chrome extension | Codebase separado (Manifest V3), messaging con API route | Fase 2 |
| Offline-first | IndexedDB via Zustand persist, sync queue, conflict resolution | Fase 2 |
| Video analysis | Transcripcion API (Whisper), scraping de Reels/TikTok | Fase 3 |
| Multi-user / SaaS | Row-level isolation, billing, onboarding, pricing | Fase 3+ |

---

## 13. Gotchas y Auto-Blindaje

### Supabase
- **RLS es obligatorio.** Nunca crear una tabla sin RLS policies. Cada tabla valida `auth.uid()`.
- **Service role key** solo en server. Nunca en client components.
- **supabase-js v2** tiene breaking changes vs v1. Usar siempre imports de `@supabase/ssr`.

### Next.js 16
- **`after()`** requiere que el Server Action retorne primero. No bloquea la response.
- **Standalone output** no incluye `public/` ni `static/`. Copiarlos explicitamente en Dockerfile.
- **Middleware** corre en Edge runtime. El client de Supabase para middleware usa `@supabase/ssr`.

### PWA (Serwist)
- **iOS Safari** tiene limitaciones con PWA: no hay push notifications (Fase 2), no hay background sync nativo.
- **Cache invalidation** es critica. Versionar el service worker para forzar updates.
- **manifest.ts** debe generar el manifest dinamicamente para que Next.js lo maneje correctamente.

### pg_trgm
- **Threshold default** de similarity es 0.3. Ajustar con `SET pg_trgm.similarity_threshold = 0.1` para busquedas mas permisivas.
- **Performance** degrada con textos muy largos en el index. Considerar indexar solo los primeros 1000 caracteres del content.

### Docker
- **Puerto 3000** dentro del container. Mapear al puerto deseado en docker-compose.
- **Health check** con `curl http://localhost:3000/api/health` (crear endpoint simple).

---

## 14. Convenciones de Codigo

| Aspecto | Convencion |
|---------|-----------|
| Variables/Funciones | camelCase |
| Componentes | PascalCase |
| Archivos/Carpetas | kebab-case |
| Constantes | UPPER_SNAKE_CASE |
| Commits | `feat(F1-T1): description` |
| Max file length | 500 lineas |
| Max function length | 50 lineas |
| TypeScript `any` | NEVER — usar `unknown` |
| Imports | `@/*` alias para `./src/*` |

---

*Tech Spec generado con el pipeline de La Herreria*
*Pendiente aprobacion antes de avanzar al siguiente skill*
