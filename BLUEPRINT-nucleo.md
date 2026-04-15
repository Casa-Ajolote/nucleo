# Blueprint — Nucleo

> **Fecha:** 2026-04-08
> **Modo:** 🔧 Herramienta Interna
> **Estado del pipeline:** Steps 0-7 completados ✅
> **Próximo paso:** Fase 2 — Items CRUD
> **Fase 1:** ✅ Completada (2026-04-15) — Pendiente: botón "Crear workspace" sin implementar (Fase 4)

---

## Resumen Ejecutivo

**Nucleo** es un segundo cerebro personal. Captura cualquier contenido (links, texto, markdown, comandos) desde iPhone o Mac, lo procesa con IA en background (título, resumen, tags, categoría) y permite recuperarlo en menos de 5 segundos mediante búsqueda global.

**Usuario:** Un solo usuario (owner). Uso diario intensivo desde mobile y desktop.
**KPIs de éxito:** Captura en < 3 taps · < 30s · Recuperación en < 5s.
**Stack:** Next.js 16 + React 19 + TypeScript + Supabase + OpenRouter (Claude Haiku) + Tailwind CSS.

---

## Estado Actual — Lo que ya existe

La UI está diseñada e implementada con datos mock. Lo que falta es conectar todo al backend real.

| Capa | Estado |
|------|--------|
| Design System (Notion Light) | ✅ DESIGN.md + globals.css + tailwind.config |
| Auth UI (login, signup, logout) | ✅ Forms + Server Actions (Supabase Auth conectado) |
| Middleware de protección de rutas | ✅ Operativo |
| App shell (sidebar + FAB) | ✅ Funcional con datos estáticos |
| Dashboard grid + ItemCard | ✅ Con mock data |
| CaptureDialog | ✅ Con submit simulado |
| Item Detail (panel lateral) | ✅ Con mock data |
| Edit Form + TagChipInput | ✅ Con submit simulado |
| Security headers | ✅ next.config.ts |
| DB schema (Supabase) | ❌ No existe aún |
| AI pipeline | ❌ No implementado |
| Search real | ❌ No implementado |
| PWA | ❌ No implementado |
| Import (CSV / Bookmarks) | ❌ No implementado |

---

## Fases de Construcción

```
FASE 1: DB + Auth real        ← CRÍTICO (desbloquea todo)
FASE 2: Items CRUD            ← Core del producto
FASE 3: AI Pipeline           ← El "magic"
FASE 4: Organización          ← Workspaces, Folders, Tags vivos
FASE 5: Búsqueda              ← KPI < 5s
FASE 6: PWA + Import          ← Completitud del producto
FASE 7: Quality & Deploy      ← Producción
```

---

## FASE 1: Supabase Setup & DB Schema

> **Entregable:** App corriendo con auth real end-to-end. Login → Dashboard con workspaces reales del usuario.
> **Stories:** US-001, US-002, US-003, US-004, US-005
> **Estimación:** ~2h

### Subfase 1.1: Configurar proyecto Supabase

**Tarea 1.1.1 — Crear proyecto Supabase**
- Crear proyecto en supabase.com (región: US East o la más cercana)
- Copiar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Crear `.env.local` desde `.env.local.example` con los valores reales

**Tarea 1.1.2 — Habilitar extensión pg_trgm**
```sql
-- Ejecutar en Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

**Tarea 1.1.3 — Crear tipos ENUM**
```sql
CREATE TYPE content_type AS ENUM ('link', 'text', 'markdown', 'command');
CREATE TYPE processing_status AS ENUM ('pending', 'processing', 'ready', 'failed');
```

### Subfase 1.2: Crear schema de DB con RLS

**Tarea 1.2.1 — Tabla `workspaces`**
```sql
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
CREATE POLICY "owner_workspaces" ON workspaces FOR ALL USING (auth.uid() = user_id);
```

**Tarea 1.2.2 — Tabla `folders`**
```sql
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
CREATE POLICY "owner_folders" ON folders FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
```

**Tarea 1.2.3 — Tabla `categories`**
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  color TEXT DEFAULT '#2383E2',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(workspace_id, slug)
);
CREATE INDEX idx_categories_workspace ON categories(workspace_id);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_categories" ON categories FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
```

**Tarea 1.2.4 — Tabla `items`**
```sql
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  content_type content_type NOT NULL,
  title TEXT,
  original_url TEXT,
  original_content TEXT NOT NULL,
  summary TEXT,
  ai_metadata JSONB DEFAULT '{}',
  processing_status processing_status NOT NULL DEFAULT 'pending',
  processing_error TEXT,
  thumbnail_url TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_items_workspace ON items(workspace_id);
CREATE INDEX idx_items_folder ON items(folder_id);
CREATE INDEX idx_items_category ON items(category_id);
CREATE INDEX idx_items_content_type ON items(content_type);
CREATE INDEX idx_items_status ON items(processing_status);
CREATE INDEX idx_items_created ON items(created_at DESC);
CREATE INDEX idx_items_title_trgm ON items USING GIN (title gin_trgm_ops);
CREATE INDEX idx_items_summary_trgm ON items USING GIN (summary gin_trgm_ops);
CREATE INDEX idx_items_content_trgm ON items USING GIN (original_content gin_trgm_ops);
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_items" ON items FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));
```

**Tarea 1.2.5 — Tablas `tags` e `item_tags`**
```sql
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
CREATE POLICY "owner_tags" ON tags FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));

CREATE TABLE item_tags (
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, tag_id)
);
CREATE INDEX idx_item_tags_tag ON item_tags(tag_id);
ALTER TABLE item_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_item_tags" ON item_tags FOR ALL
  USING (item_id IN (
    SELECT id FROM items WHERE workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  ));
```

**Tarea 1.2.6 — Función `search_items`**
```sql
CREATE OR REPLACE FUNCTION search_items(
  p_workspace_id UUID,
  p_query TEXT,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID, title TEXT, summary TEXT, content_type content_type,
  thumbnail_url TEXT, category_id UUID, folder_id UUID,
  created_at TIMESTAMPTZ, similarity REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id, i.title, i.summary, i.content_type,
    i.thumbnail_url, i.category_id, i.folder_id, i.created_at,
    GREATEST(
      similarity(COALESCE(i.title,''), p_query),
      similarity(COALESCE(i.summary,''), p_query),
      similarity(i.original_content, p_query)
    ) AS similarity
  FROM items i
  WHERE i.workspace_id = p_workspace_id
    AND i.processing_status = 'ready'
    AND (
      i.title % p_query OR i.summary % p_query OR i.original_content % p_query
    )
  ORDER BY similarity DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Subfase 1.3: Auth end-to-end con workspaces automáticos

**Tarea 1.3.1 — Crear workspaces en signup**
Actualizar `src/features/auth/services/actions.ts` → `signupAction`:
```ts
// Después del signUp exitoso, insertar workspaces default:
const { data: { user } } = await supabase.auth.getUser()
if (user) {
  await supabase.from('workspaces').insert([
    { user_id: user.id, name: 'Personal', slug: 'personal', icon: '📁', position: 0 },
    { user_id: user.id, name: 'Trabajo', slug: 'trabajo', icon: '💼', position: 1 },
  ])
}
```

**Tarea 1.3.2 — Actualizar redirect post-login a workspace real**
En `actions.ts` loginAction: después del login, obtener el primer workspace del usuario y redirigir a `/w/[workspaceId]`.

**Tarea 1.3.3 — Crear ruta `/w/[workspaceId]`**
Crear `src/app/(main)/w/[workspaceId]/page.tsx` que lea el workspace de Supabase y renderice el dashboard.

**Tarea 1.3.4 — Conectar sidebar a workspaces reales**
Convertir `SidebarContent` en `(main)/layout.tsx` para fetchear workspaces del usuario autenticado desde Supabase en lugar de los datos estáticos.

**Verificación Fase 1:**
- [ ] `npm run dev` sin errores de compilación
- [ ] Registro → crea 2 workspaces en Supabase
- [ ] Login → redirige a `/w/[id]` del workspace Personal
- [ ] Sidebar muestra workspaces reales
- [ ] Logout → elimina sesión, redirige a `/login`
- [ ] Rutas protegidas sin sesión → redirigen a `/login`

---

## FASE 2: Items CRUD — Core del Producto

> **Entregable:** Capturar un item real → aparece en el grid → se puede ver, editar y eliminar.
> **Stories:** US-009, US-010, US-011, US-012, US-014, US-015, US-016, US-017, US-018
> **Estimación:** ~3h

### Subfase 2.1: Server Actions de items

**Tarea 2.1.1 — Crear `src/features/capture/services/itemActions.ts`**
```ts
'use server'
// createItem(content, content_type, folder_id?, workspace_id)
// → INSERT en items con status='pending'
// → Retorna item creado
// → Disparar AI pipeline via after() (Fase 3)

// deleteItem(id)
// → DELETE en items (RLS valida ownership)
// → DELETE thumbnail de Storage si existe

// updateItem(id, { title, category_id, folder_id, tags })
// → UPDATE items
// → Sync tags: delete item_tags + insert nuevos

// getItems(workspace_id, filters)
// → SELECT items con JOIN tags, categories, folders
// → Paginado (limit 20, offset)
```

**Tarea 2.1.2 — Conectar CaptureDialog a createItem**
En `src/features/capture/components/CaptureDialog.tsx`:
- Reemplazar el `setTimeout` simulado por llamada a `createItem`
- Al éxito: cerrar dialog, el grid se refrescará con Zustand store

**Tarea 2.1.3 — Crear Zustand store de items**
`src/features/dashboard/store/itemsStore.ts`:
```ts
interface ItemsStore {
  items: NucleoItem[]
  isLoading: boolean
  setItems: (items: NucleoItem[]) => void
  addItem: (item: NucleoItem) => void
  updateItem: (id: string, data: Partial<NucleoItem>) => void
  removeItem: (id: string) => void
}
```
El store es la fuente de verdad en cliente. Las Server Actions mutan DB y el store se actualiza optimísticamente.

### Subfase 2.2: Dashboard con datos reales

**Tarea 2.2.1 — Fetch inicial de items**
En `src/app/(main)/w/[workspaceId]/page.tsx`: Server Component que fetcha los primeros 20 items y los pasa al store via hydration.

**Tarea 2.2.2 — Conectar ItemCard a acciones reales**
- Click en card: navega a `/w/[workspaceId]/item/[itemId]`
- Delete en context menu: llama `deleteItem`, luego `store.removeItem`

**Tarea 2.2.3 — Crear ruta de item detail**
`src/app/(main)/w/[workspaceId]/item/[itemId]/page.tsx`
Fetch del item por ID desde Supabase. Renderiza `ItemDetail` con datos reales.

**Tarea 2.2.4 — Conectar EditForm a updateItem**
En `ItemEditForm.tsx`: reemplazar submit simulado por `updateItem` Server Action. Sync de tags con `item_tags`.

**Tarea 2.2.5 — Check de duplicados real**
En `CaptureDialog.tsx`: reemplazar check simulado por query a Supabase:
```ts
// Debounce 500ms, solo para content_type='link'
const { data } = await supabase
  .from('items')
  .select('id')
  .eq('workspace_id', workspaceId)
  .eq('original_url', content.trim())
  .maybeSingle()
```

**Verificación Fase 2:**
- [ ] Pegar URL en CaptureDialog → item aparece en grid con status=pending
- [ ] Grid muestra items reales de Supabase (no mock)
- [ ] Click en card → detail con datos reales
- [ ] Editar título/tags → se persiste en DB
- [ ] Eliminar → card desaparece del grid
- [ ] Pegar URL duplicada → warning "Ya tienes este link guardado"

---

## FASE 3: AI Pipeline — El Magic

> **Entregable:** Item capturado → IA genera título, resumen, tags, categoría automáticamente. Card se actualiza en tiempo real.
> **Stories:** US-013, US-NF-001 (duplicate detection)
> **Estimación:** ~4h

### Subfase 3.1: Integración OpenRouter

**Tarea 3.1.1 — Instalar cliente y configurar**
```bash
npm install openai  # OpenRouter usa compatible API de OpenAI
```
Crear `src/lib/ai/client.ts`:
```ts
import OpenAI from 'openai'
export const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
})
```
Agregar `OPENROUTER_API_KEY` a `.env.local`.

**Tarea 3.1.2 — Crear schemas Zod para output estructurado**
`src/lib/ai/schemas.ts`:
```ts
export const itemAnalysisSchema = z.object({
  title: z.string().max(120),
  summary: z.string().max(500),
  category: z.enum(['Development','AI','Design','Business','Research','Personal','Other']),
  tags: z.array(z.string().max(30)).max(7),
})
```

**Tarea 3.1.3 — Crear system prompt de análisis**
`src/lib/ai/prompts.ts`:
```ts
export const ANALYSIS_SYSTEM_PROMPT = `
Eres un asistente que analiza contenido y extrae metadatos.
Dado el contenido del usuario, responde SIEMPRE con JSON válido con:
- title: título conciso (max 120 chars)
- summary: resumen claro y útil (max 500 chars)
- category: una de [Development, AI, Design, Business, Research, Personal, Other]
- tags: 3-7 tags en lowercase con guiones, muy específicos al contenido

Para URLs: analiza la URL para inferir el contenido si no tienes el texto.
Para comandos: el título debe ser la descripción de qué hace el comando.
`
```

### Subfase 3.2: Pipeline de procesamiento

**Tarea 3.2.1 — Crear API Route para processing**
`src/app/api/items/[id]/process/route.ts`:
```ts
// POST /api/items/:id/process
// 1. Verificar que item existe y pertenece al usuario autenticado
// 2. Actualizar status → 'processing'
// 3. Para links: fetch OG tags de la URL (title, description, image)
// 4. Llamar OpenRouter con el contenido del item
// 5. Parsear respuesta con itemAnalysisSchema
// 6. UPDATE item: title, summary, category_id, thumbnail_url, status='ready'
// 7. INSERT tags en tabla tags + item_tags
// 8. Si falla: UPDATE status='failed', processing_error=mensaje
```

**Tarea 3.2.2 — OG tag extractor**
`src/lib/ai/og-extractor.ts`:
```ts
// fetchOgTags(url: string): Promise<{title, description, image} | null>
// Fetch con timeout 5s, parse HTML, extraer <meta property="og:*">
// Headers: User-Agent de browser para evitar bloqueos
```

**Tarea 3.2.3 — Disparar pipeline con `after()` al crear item**
En `createItem` Server Action:
```ts
import { after } from 'next/server'
// Después del INSERT exitoso:
after(async () => {
  await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/items/${item.id}/process`, {
    method: 'POST',
    headers: { Cookie: /* session cookie */ },
  })
})
```

### Subfase 3.3: Actualización en tiempo real del card

**Tarea 3.3.1 — Supabase Realtime subscription**
En el dashboard page, subscribe al canal del workspace:
```ts
supabase.channel(`items:${workspaceId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'items',
    filter: `workspace_id=eq.${workspaceId}`,
  }, (payload) => {
    store.updateItem(payload.new.id, payload.new)
  })
  .subscribe()
```
Alternativa (si Realtime no está disponible): polling cada 3s para items con `status IN ('pending','processing')`.

**Tarea 3.3.2 — Transición visual pending → ready**
En `ItemCard.tsx`: cuando `status` cambia de `'processing'` a `'ready'`, animar con `fade-in 300ms` los datos que aparecen (título, resumen, tags).

**Verificación Fase 3:**
- [ ] Capturar URL → card aparece con skeleton en < 500ms
- [ ] Dentro de 15s, card se actualiza con título, resumen y tags generados por IA
- [ ] Categoría asignada automáticamente aparece en el sidebar
- [ ] Si falla la IA → card muestra badge rojo + botón "Reintentar"
- [ ] Reintentar → status vuelve a processing → IA intenta de nuevo
- [ ] Para links: thumbnail de OG image aparece en la card

---

## FASE 4: Organización — Workspaces, Folders, Tags

> **Entregable:** Sidebar 100% funcional con datos reales. Crear/editar/eliminar workspaces y carpetas. Tags vivos del workspace.
> **Stories:** US-005, US-006, US-007, US-008, US-019, US-020, US-021, US-022, US-023
> **Estimación:** ~2h

### Subfase 4.1: Workspaces management

**Tarea 4.1.1 — Server Actions de workspaces**
`src/features/workspaces/services/actions.ts`:
- `createWorkspace(name, icon)` → INSERT + redirect al nuevo workspace
- `updateWorkspace(id, name, icon)` → UPDATE
- `deleteWorkspace(id)` → DELETE (cascada borra folders, items, tags del workspace)
- Límite: máx 5 workspaces por usuario (verificar antes del INSERT)

**Tarea 4.1.2 — UI de gestión en sidebar**
Actualizar `SidebarContent` para que el botón "+ Crear workspace" abra un dialog con form de nombre + icono (emoji picker simple: lista de 12 emojis predefinidos).

**Tarea 4.1.3 — Workspace selector funcional**
Click en workspace en el sidebar → navega a `/w/[workspaceId]`. Estado activo refleja el workspace de la URL.

### Subfase 4.2: Folders CRUD

**Tarea 4.2.1 — Server Actions de folders**
`src/features/folders/services/actions.ts`:
- `createFolder(workspace_id, name, parent_id?)` → INSERT con depth validation (max 2)
- `updateFolder(id, name)` → UPDATE
- `deleteFolder(id)` → DELETE (cascada: items de la carpeta quedan con folder_id=null)
- `moveFolder(id, new_parent_id)` → UPDATE parent_id + recalcular depth

**Tarea 4.2.2 — Árbol de carpetas en sidebar con datos reales**
Reemplazar `FOLDERS` estático en `SidebarContent` por fetch de `folders` del workspace activo. Árbol colapsable funcional. Botón "+ Nueva carpeta" con inline input.

**Tarea 4.2.3 — Mover items entre carpetas**
En `ItemEditForm.tsx`: selector de carpeta con datos reales (fetch de folders del workspace). Al guardar, actualiza `folder_id` del item.

### Subfase 4.3: Tags y Categorías vivos

**Tarea 4.3.1 — Tags en sidebar con conteos reales**
Query:
```sql
SELECT t.id, t.name, COUNT(it.item_id) as count
FROM tags t
LEFT JOIN item_tags it ON it.tag_id = t.id
WHERE t.workspace_id = $1
GROUP BY t.id, t.name
ORDER BY count DESC LIMIT 10
```
Actualizar sidebar para usar este query.

**Tarea 4.3.2 — Categorías en sidebar con conteos reales**
Similar: `SELECT c.*, COUNT(i.id) as count FROM categories c LEFT JOIN items i ON i.category_id = c.id WHERE c.workspace_id = $1 GROUP BY c.id ORDER BY count DESC`.

**Tarea 4.3.3 — Click en sidebar filtra el grid**
Click en folder/tag/category en sidebar → navega a `/w/[id]?folder=X` o `?tag=X` o `?category=X`. El grid filtra según los query params.

**Verificación Fase 4:**
- [ ] Crear workspace → aparece en sidebar, límite de 5 respetado
- [ ] Crear carpeta anidada (profundidad máx 3) → visible en árbol del sidebar
- [ ] Click en carpeta en sidebar → grid filtra por esa carpeta
- [ ] Click en tag en sidebar → grid filtra por ese tag
- [ ] Mover item a carpeta → folder_id actualizado en DB

---

## FASE 5: Búsqueda Global

> **Entregable:** Buscar cualquier item en < 5 segundos. Filtros combinados. Cmd+K funcional.
> **Stories:** US-024, US-025, US-026
> **Estimación:** ~2h

### Subfase 5.1: Search backend

**Tarea 5.1.1 — Server Action de búsqueda**
`src/features/search/services/actions.ts`:
```ts
// searchItems(workspace_id, query, limit=20)
// → llama función SQL search_items() con pg_trgm
// → retorna items con similarity score
// → incluye tags JOIN para cada resultado
```

**Tarea 5.1.2 — Búsqueda por filtros (sin texto)**
Cuando `query` está vacío pero hay filtros:
```ts
// getFilteredItems(workspace_id, { type?, category_id?, tag_ids?, folder_id? })
// → SELECT con WHERE dinámico
// → ORDER BY created_at DESC
```

**Tarea 5.1.3 — Zustand search store**
`src/features/search/store/searchStore.ts`:
```ts
interface SearchStore {
  query: string
  results: NucleoItem[]
  isSearching: boolean
  cache: Map<string, { results: NucleoItem[]; timestamp: number }>
  setQuery: (q: string) => void
  search: (workspaceId: string) => Promise<void>
}
// Cache: si misma query en < 30s, usar resultado cacheado
```

### Subfase 5.2: Search UI funcional

**Tarea 5.2.1 — Conectar FilterBar a query params reales**
`src/features/dashboard/components/FilterBar.tsx`: los dropdowns de filtros actualizan URL query params con `useRouter().replace()`. El grid re-fetcha con los nuevos parámetros.

**Tarea 5.2.2 — Implementar Cmd+K overlay**
Crear `src/features/search/components/CommandSearch.tsx` con `@radix-ui/react-dialog`:
- `useEffect` que escucha `keydown` con `(e.metaKey || e.ctrlKey) && e.key === 'k'`
- Input con autofocus y debounce 300ms
- Navegación con ↑↓, Enter abre el item, Esc cierra
- Sin query: muestra últimos 10 items del workspace
- Con query: resultados de `searchItems()` con fragmentos resaltados (el texto que matchea en **bold**)

**Tarea 5.2.3 — Conectar searchbar del top bar al Cmd+K**
El botón de lupa en el top bar abre el mismo overlay.

**Tarea 5.2.4 — Registrar CommandSearch en el layout**
Agregar `<CommandSearch />` a `src/app/(main)/layout.tsx` para que esté disponible en todas las páginas.

**Verificación Fase 5:**
- [ ] Cmd+K abre overlay desde cualquier página
- [ ] Escribir query → resultados en < 500ms (p95)
- [ ] Resultados incluyen: título, resumen truncado, tipo, tags
- [ ] ↑↓ navegan entre resultados, Enter abre el item
- [ ] Esc cierra sin navegar
- [ ] Sin query → últimos 10 items del workspace
- [ ] Filtros (tipo, categoría, tag, carpeta) actualizan URL y el grid
- [ ] Combinar varios filtros funciona correctamente (AND)
- [ ] "Limpiar filtros" vuelve a `/w/[id]` sin query params

---

## FASE 6: PWA + Import

> **Entregable:** App instalable en iPhone. Import de bookmarks del navegador.
> **Stories:** US-027, US-028, US-029, US-030, US-031, US-032
> **Estimación:** ~2h

### Subfase 6.1: PWA instalable

**Tarea 6.1.1 — Instalar next-pwa**
```bash
npm install next-pwa
```
Configurar en `next.config.ts`:
```ts
import withPWA from 'next-pwa'
export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})(nextConfig)
```

**Tarea 6.1.2 — Web App Manifest**
Crear `public/manifest.json`:
```json
{
  "name": "Nucleo",
  "short_name": "Nucleo",
  "description": "Tu segundo cerebro",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2383E2",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Tarea 6.1.3 — Íconos de app**
Crear `public/icon-192.png` y `public/icon-512.png` (logo "N" de Nucleo, fondo azul #2383E2).

**Tarea 6.1.4 — iOS safe-area en FAB y CaptureDialog**
En `globals.css`:
```css
.fab {
  bottom: calc(env(safe-area-inset-bottom) + 16px);
  right: calc(env(safe-area-inset-right) + 16px);
}
```
En `CaptureDialog.tsx` (bottom sheet mobile): padding-bottom con `env(safe-area-inset-bottom)`.

**Tarea 6.1.5 — Agregar `<link rel="manifest">` en layout**
En `src/app/layout.tsx`, agregar en el `<head>`:
```tsx
<link rel="manifest" href="/manifest.json" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="theme-color" content="#2383E2" />
```

### Subfase 6.2: Import de bookmarks

**Tarea 6.2.1 — Página de import**
`src/app/(main)/import/page.tsx` — ya referenciada en la IA del sidebar como "Importar".

**Tarea 6.2.2 — Import de bookmarks HTML (Netscape format)**
`src/features/import/components/BookmarkImport.tsx`:
- Input de archivo HTML (drag & drop o file picker)
- Parser de bookmarks (formato Netscape: `<DT><A HREF="url">título</A>`)
- Preview: tabla con N bookmarks detectados, selección por checkbox
- Submit: crea items en batch (createItem × N) con content_type='link'
- Progress bar durante la creación

**Tarea 6.2.3 — Import CSV**
`src/features/import/components/CsvImport.tsx`:
- Botón "Descargar plantilla CSV" (columnas: url, title, content_type, tags)
- Import: parsear CSV con `Papa.parse`, validar columnas, crear items en batch
- Límite: 500 rows por import

### Subfase 6.3: Export a Obsidian

> **Entregable:** Botón "Download .md" en panel de detalle que genera un archivo Obsidian-compatible.

**Tarea 6.3.1 — Utility de export**
Crear `src/features/dashboard/utils/exportObsidian.ts`:
- `buildObsidianDocument(item, displayTitle)` — genera el string .md completo (frontmatter YAML + body)
- `buildObsidianFilename(item, displayTitle)` — genera el nombre `YYYY-MM-DD-slug.md`
- `downloadObsidianNote(item, displayTitle)` — dispara la descarga del navegador via Blob
- 100% client-side, sin API routes, sin dependencias nuevas

**Tarea 6.3.2 — Integrar en ItemDetail**
Modificar `src/features/dashboard/components/ItemDetail.tsx`:
- Agregar opción "Exportar a Obsidian" con icono `Download` en HeaderMenu (entre Editar y Eliminar)
- Agregar botón icon-only en sticky footer (entre Editar y Eliminar)

**Tarea 6.3.3 — Integrar en ItemCard**
Modificar `src/features/dashboard/components/ItemCard.tsx`:
- Agregar "Exportar .md" en CardMenu (entre Mover y Eliminar)

**Mapping content_type → frontmatter `type`:**
- `link` → `article`
- `text` → `note`
- `markdown` → `note`
- `command` → `prompt`

**Formato del archivo:**
- Filename: `YYYY-MM-DD-slug-del-titulo.md`
- Frontmatter: `type`, `source` (nucleo), `url`, `date_saved`, `tags`, `topic`
- Body: `# Título`, `## Contenido`, `## Por qué lo guardé`, `## Links relacionados`

**Verificación Fase 6:**
- [ ] En iOS Safari: "Añadir a pantalla de inicio" muestra el ícono de Nucleo
- [ ] App instalada abre en modo standalone (sin barra del browser)
- [ ] FAB no es tapado por el home indicator de iPhone
- [ ] CaptureDialog no sube bajo el teclado virtual de iOS
- [ ] Import de bookmarks HTML: parsea correctamente el formato de Chrome/Firefox/Safari
- [ ] Import de 50 bookmarks → 50 items creados con status=pending → IA los procesa en background
- [ ] Botón "Exportar a Obsidian" visible en HeaderMenu y footer del panel de detalle
- [ ] Archivo descargado tiene nombre `YYYY-MM-DD-slug.md`
- [ ] Frontmatter YAML válido (type, source, url, date_saved, tags, topic)
- [ ] Tildes y caracteres especiales normalizados en el filename
- [ ] Descarga funciona en Chrome, Safari iOS y Safari Mac

---

## FASE 7: Quality & Deploy

> **Entregable:** App en producción en Vercel. Tests E2E del flujo crítico.
> **Estimación:** ~2h

### Subfase 7.1: Tests E2E

**Tarea 7.1.1 — Instalar Playwright**
```bash
npm install -D @playwright/test
npx playwright install chromium
```

**Tarea 7.1.2 — Test: flujo de captura completo**
`tests/capture.spec.ts`:
```ts
// 1. Login con credenciales de test
// 2. Verificar que el dashboard carga con el workspace
// 3. Click en FAB → dialog abre
// 4. Pegar URL de test
// 5. Click en Guardar
// 6. Verificar que el card aparece en el grid con status=processing
// 7. Esperar < 20s a que status cambie a ready
// 8. Verificar que el card tiene título y resumen
```

**Tarea 7.1.3 — Test: búsqueda**
`tests/search.spec.ts`:
- Cmd+K abre overlay
- Escribir término → resultados aparecen
- Enter navega al item correcto

### Subfase 7.2: Optimización y deploy

**Tarea 7.2.1 — Auditoría de performance**
```bash
npm run build  # Verificar que buildea sin errores
# Revisar bundle size en .next/analyze (si se instala @next/bundle-analyzer)
```

**Tarea 7.2.2 — Variables de entorno en Vercel**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENROUTER_API_KEY=
NEXT_PUBLIC_APP_URL=https://nucleo.vercel.app
```

**Tarea 7.2.3 — Deploy a Vercel**
```bash
npx vercel --prod
# O conectar repositorio en vercel.com para CI/CD automático
```

**Tarea 7.2.4 — Verificaciones post-deploy**
- [ ] Auth funciona en producción (cookies con `secure: true`)
- [ ] Supabase RLS correctamente aplicada (verificar con SQL Editor)
- [ ] AI pipeline funciona (capturar un item real en producción)
- [ ] Security headers presentes (verificar con securityheaders.com)
- [ ] Agregar CSP con dominios de Supabase Storage (pendiente del audit)

**Verificación Fase 7:**
- [ ] `npm run build` sin errores ni warnings críticos
- [ ] `npx playwright test` pasa los tests E2E
- [ ] URL de producción accesible y funcional
- [ ] Login/signup funciona en producción
- [ ] Item capturado en producción aparece en grid y se procesa con IA

---

## Dependencias entre Fases

```
FASE 1 (DB)
  └─→ FASE 2 (Items CRUD)
        └─→ FASE 3 (AI Pipeline)
        └─→ FASE 4 (Organización)
              └─→ FASE 5 (Búsqueda)
                    └─→ FASE 6 (PWA + Import)
                          └─→ FASE 7 (Deploy)
```

Fases 3 y 4 pueden desarrollarse en paralelo una vez completada la Fase 2.

---

## Variables de Entorno Completas

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
OPENROUTER_API_KEY=sk-or-v1-...
NEXT_PUBLIC_APP_URL=http://localhost:3000  # producción: https://tu-dominio.com
```

---

## Pendientes de Seguridad (del Audit)

| Item | Cuándo | Responsable |
|------|--------|-------------|
| RLS en todas las tablas | Fase 1 ← INCLUIDO | Blueprint |
| Supabase Auth Captcha | Antes de deploy | Manualmente en Supabase Dashboard |
| CSP header con dominios Supabase | Fase 7 | Actualizar next.config.ts |
| Rate limiting en auth | Post-deploy | Vercel Edge Config o Upstash Ratelimit |

---

## Resumen del Pipeline Completado

| Step | Documento | Estado |
|------|-----------|--------|
| 0 · Viability | `VIABILITY-nucleo.md` | ✅ |
| 1 · PDR | `PDR-nucleo.md` | ✅ |
| 2 · Tech Spec | `TECH-SPEC-nucleo.md` | ✅ |
| 3 · User Stories | `USER-STORIES-nucleo.md` | ✅ |
| 4 · UX Design | `docs/ux-design/` | ✅ |
| 5 · UI Design Workflow | `docs/ui-design/` | ✅ |
| 6 · UI | `DESIGN.md` + `src/features/` | ✅ |
| 7 · Security Audit | `SECURITY-AUDIT-nucleo.md` | ✅ |
| 8 · Blueprint | `BLUEPRINT-nucleo.md` | ✅ **ESTE DOCUMENTO** |

---

*"El Blueprint no es el destino. Es el mapa. Ahora hay que construir."*

**Siguiente paso:** `/build` — elige el modo de construcción (Manual o Modo Forja).
