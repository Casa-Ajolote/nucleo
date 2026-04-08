# Screen Flow — Items Library (Grid + Detail + Search + Filters)

> **Epics:** 4 (Items) + 6 (Búsqueda)
> **Stories:** US-014..018 (grid, detalle, copy, editar, eliminar) + US-024..026 (search, filtros, sidebar nav)
> **KPI objetivo:** Encontrar cualquier item en < 5 segundos

---

## UI Requirements extraídos

| Story | Pantallas | Datos | Acciones |
|-------|-----------|-------|----------|
| US-014 | Grid principal | cards paginados | scroll infinito, tap → detalle |
| US-015 | Item detail | contenido completo | copy, editar, eliminar, abrir link |
| US-016 | Copy inline | texto del item | clipboard |
| US-017 | Item edit | title, tags, category, folder | submit, cancel |
| US-018 | Delete confirm | — | delete + redirect a grid |
| US-024 | Search bar | query + results | debounced search, fuzzy |
| US-025 | Filter bar | type, category, tags, folder | combinar filtros |
| US-026 | Sidebar nav | workspace / folders / tags / categories | filtrar grid |

---

## Flow Diagram

```
[/w/:id  — Grid principal]
    │
    ├─ Sidebar tap (folder/tag/category) ──→ [/w/:id?folder=X  — Grid filtrado]
    │
    ├─ Filter bar dropdown ─────────────────→ [/w/:id?type=link&category=dev ...]
    │
    ├─ Search bar (Cmd+K) ──────────────────→ [/w/:id?q=supabase  — Results]
    │
    ├─ Scroll → load more (infinite) ───────→ next page
    │
    └─ Tap ItemCard ───────────────────────→ [/w/:id/item/:itemId — Detail]
                                                      │
                                                      ├─ Copy ────→ clipboard + toast
                                                      ├─ Open link → new tab
                                                      ├─ Edit ────→ [Edit form]
                                                      │              └─ Save → Detail
                                                      └─ Delete ──→ [Confirm]
                                                                       └─ Ok → Grid (card removido)
```

---

## Pantalla 1 · Grid principal (`/w/:workspaceId`)

**Entry from:** login exitoso, selección de workspace, tap en logo, `Home`
**Story refs:** US-014, US-025 (filtros), US-026 (sidebar)

### Layout — Desktop

```
┌──────────────┬───────────────────────────────────────────────┐
│ Sidebar      │ ┌─────────────────────────────────────────┐  │
│ (fijo)       │ │ 🔍 Buscar en Personal...      Cmd+K     │  │
│              │ └─────────────────────────────────────────┘  │
│              │ [Tipo ▾][Categ ▾][Tags ▾][Folder ▾]  Limpiar │
│              │ Personal · 142 items                          │
│              ├───────────────────────────────────────────────┤
│              │                                               │
│              │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐             │
│              │  │card │ │card │ │card │ │card │             │
│              │  └─────┘ └─────┘ └─────┘ └─────┘             │
│              │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐             │
│              │  │card │ │card │ │card │ │card │             │
│              │  └─────┘ └─────┘ └─────┘ └─────┘             │
│              │         ↓ infinite scroll                     │
│              │                                   [ + FAB ]   │
└──────────────┴───────────────────────────────────────────────┘
```

### Layout — Mobile

```
┌──────────────────────────────┐
│ [≡] Personal ▾      [🔍]     │ ← top bar
├──────────────────────────────┤
│ [Filtros ⚙️]  142 items      │
├──────────────────────────────┤
│ ┌──────────────────────────┐ │
│ │ card                     │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ card                     │ │
│ └──────────────────────────┘ │
│             ↓                │
│                       [ + ]  │ ← FAB esquina
└──────────────────────────────┘
```

### Data Displayed

| Elemento | Fuente | Formato |
|----------|--------|---------|
| Workspace actual | `workspaces[active]` | Nombre + icono |
| Total items | `count(items WHERE workspace=X)` | "142 items" |
| Grid cards | `items` paginados (20 por page) | ver `ItemCard` en 02-capture.md |
| Filtros activos | URL query params | chips removibles sobre el grid |
| Breadcrumb (si filtrado) | URL + nombre folder/tag/category | "Personal > Claude Code" |

### Actions

| Acción | Control | Resultado |
|--------|---------|-----------|
| Abrir search | Botón/icono lupa, Cmd+K | Foco en search bar, muestra query vacío |
| Filtrar por tipo | Dropdown "Tipo" | Toggle chips: Link / Texto / Markdown / Comando |
| Filtrar por categoría | Dropdown "Categoría" | Select una (radio) |
| Filtrar por tags | Dropdown "Tags" multi-select | Checkbox list, combina con AND |
| Filtrar por folder | Dropdown "Folder" | Árbol con indentación + "Sin carpeta" |
| Limpiar filtros | Button "Limpiar" | Quita todos los query params |
| Remover chip de filtro activo | "x" en el chip | Quita ese filtro específico |
| Scroll al final | scroll | Load next page (20 items más) |
| Tap en card | click | Navega a `/w/:id/item/:itemId` |
| Long press card (mobile) | gesture | Context menu (Editar, Eliminar) |
| Copy inline (items tipo command) | IconButton en card | Copia + feedback "Copiado ✓" |
| Abrir FAB | tap | Abre `CaptureDialog` (ver 02-capture.md) |

### States

- **Default:** grid con items del workspace, 20 cards primera página, filtros vacíos.
- **Loading inicial:** 8 skeleton cards (grid placeholder).
- **Loading next page:** 4 skeleton cards al final del grid.
- **Empty (workspace nuevo):**
  ```
  ┌──────────────────────┐
  │    📥                │
  │ Tu workspace está    │
  │ vacío                │
  │                      │
  │ Toca + para guardar  │
  │ tu primer recurso    │
  │                      │
  │ [ + Capturar algo ]  │
  └──────────────────────┘
  ```
- **Empty (filtros muy restrictivos):**
  ```
  Sin resultados para los filtros actuales.
  [ Limpiar filtros ]
  ```
- **Loading search:** spinner junto al input + dim del grid.
- **Error fetch:** alert: "No pudimos cargar tus items. [Reintentar]"

### Componentes usados

- `ItemCard` (**nuevo**)
- `FilterBar` (**nuevo**)
- `SearchBar` (**nuevo**)
- `EmptyState` (**nuevo**)
- `FAB` (**nuevo**)
- `Skeleton` (shadcn)
- `Badge` (shadcn) para chips de filtro
- `DropdownMenu` (shadcn) para filtros

---

## Pantalla 2 · Search Command (`Cmd+K` overlay)

**Entry from:** Cmd+K, tap en icono lupa mobile
**Story refs:** US-024

### Layout

Usa `Command` de shadcn (basado en `cmdk`), overlay centrado:

```
┌────────────────────────────────────┐
│ 🔍 Buscar items…                   │
├────────────────────────────────────┤
│ RESULTADOS (7)                     │
│                                    │
│ 🔗 Next.js 16 docs              ★ │ ← highlighted (arrow nav)
│    Documentación oficial de Next…  │
│    #next-js #docs                  │
│                                    │
│ 📝 Notas sobre RLS                 │
│    Row Level Security en Supab…    │
│    #supabase #security             │
│                                    │
│ $ git squash last 3                │
│    git rebase -i HEAD~3            │
│    #git #shell                     │
│                                    │
├────────────────────────────────────┤
│ ↑↓ navegar  ⏎ abrir  esc cerrar    │
└────────────────────────────────────┘
```

### Data Displayed

| Elemento | Fuente | Formato |
|----------|--------|---------|
| Input | estado local | placeholder "Buscar items…" |
| Resultados | `items` full-text search (ver tech-spec `search_items()`) | max 20 visibles |
| Per result | title, summary (1 línea), top 3 tags, type icon | highlight del match en bold |
| Counter | COUNT de results | "7 resultados" |

### Actions

| Acción | Control | Resultado |
|--------|---------|-----------|
| Escribir query | Input | Debounce 300ms → ejecutar `search_items(query)` |
| Navegar resultados | ↑ ↓ | Mueve highlight |
| Abrir item | Enter | Navega a `/w/:id/item/:itemId`, cierra overlay |
| Cerrar | Esc / click fuera | Cierra sin navegar |
| Limpiar query | Button X en input | Vuelve a estado vacío |

### States

- **Empty query:** muestra "Items recientes" (últimos 10 del workspace).
- **Typing (loading):** spinner, resultados de query anterior se mantienen dim.
- **Results:** lista visible, primer resultado auto-highlighted.
- **No results:** "Sin resultados para '[query]'. Intenta con otras palabras."
- **Error:** "No pudimos buscar. Intenta nuevamente."

### Performance target

- Input → resultados visibles: **< 500ms** para queries típicas (< 100 items matcheando).
- Debounce: **300ms** (US-024).
- Cache local (Zustand): si la misma query se repitió en los últimos 30s, usar cache.

---

## Pantalla 3 · Item Detail (`/w/:id/item/:itemId`)

**Entry from:** tap en card del grid, click en resultado de search
**Story refs:** US-015, US-016

### Layout — Desktop (modal overlay sobre el grid)

```
┌────────────────────────────────────────────────┐
│                                           [X]  │ ← cerrar
│  ┌────────────┐                                │
│  │ OG image   │                                │
│  └────────────┘                                │
│                                                │
│  Título del artículo                           │
│                                                │
│  🔗 Link · development · hace 2 días           │
│                                                │
│  #next-js #docs #performance  +2               │
│                                                │
│  ───────────────────────────────────────       │
│                                                │
│  📋 Resumen                                    │
│  Lorem ipsum dolor sit amet, consectetur       │
│  adipiscing elit. Sed do eiusmod tempor…       │
│                                                │
│  ───────────────────────────────────────       │
│                                                │
│  Contenido original                            │
│  ┌────────────────────────────────────────┐   │
│  │ https://nextjs.org/docs/...       [🔗] │   │ ← abrir
│  │                                    [📋] │   │ ← copy
│  └────────────────────────────────────────┘   │
│                                                │
│  ┌─────────┐ ┌─────────┐ ┌────────────────┐   │
│  │ Editar  │ │ Mover   │ │  Eliminar      │   │
│  └─────────┘ └─────────┘ └────────────────┘   │
└────────────────────────────────────────────────┘
```

### Layout — Mobile (full-screen)

```
┌──────────────────────────────┐
│ [←] Item            [⋮]      │ ← back + menu
├──────────────────────────────┤
│ ┌──────────────────────────┐ │
│ │ [OG image]               │ │
│ └──────────────────────────┘ │
│                              │
│ Título del artículo          │
│                              │
│ 🔗 Link · development        │
│ hace 2 días                  │
│                              │
│ [#next-js][#docs][#perf]     │
│                              │
│ ─────────────────────        │
│                              │
│ 📋 Resumen                   │
│ Lorem ipsum dolor sit…       │
│                              │
│ ─────────────────────        │
│                              │
│ Contenido original           │
│ ...                          │
│ [📋 Copiar]  [🔗 Abrir]      │ ← sticky bottom bar
└──────────────────────────────┘
```

El menú `[⋮]` contiene: Editar, Mover, Eliminar.

### Data Displayed

| Elemento | Fuente | Formato |
|----------|--------|---------|
| Thumbnail | `items.thumbnail_url` | imagen o placeholder grande |
| Title | `items.title` | h1 |
| Meta | `content_type + category + created_at` | badge + texto + relative time |
| Tags | `items.tags` | chips coloreados |
| Summary | `items.summary` | markdown renderizado |
| Content (link) | `items.url` | box con URL + icons copy/open |
| Content (text) | `items.content` | texto plano |
| Content (markdown) | `items.content` | **markdown renderizado** (headers, lists, code blocks, bold, links) |
| Content (command) | `items.content` | **monospace** con fondo oscuro + botón copy prominente |

### Actions

| Acción | Control | Resultado |
|--------|---------|-----------|
| Cerrar | [X] o Esc o back | Vuelve al grid en la posición previa |
| Copy contenido completo | Button "Copiar" | Clipboard + toast "Copiado ✓" |
| Abrir link original | Button "Abrir" (solo `link`) | `window.open` en nueva pestaña |
| Editar | Button "Editar" | Abre form de edición (ver Pantalla 4) |
| Mover (folder) | Button "Mover" | Abre `FolderTreeSelect` modal |
| Eliminar | Button destructive | Abre confirm (Pantalla 5) |
| Copy inline URL | IconButton en box de URL | Copia solo la URL |

### States

- **Loading:** skeleton completo (thumbnail + líneas de título + párrafos).
- **Ready:** contenido completo renderizado.
- **404:** "Este item no existe o fue eliminado." + botón "Volver al inicio".
- **Processing (item recién creado visto rápido):** muestra lo que haya + banner "La IA está procesando este item. Recarga en unos segundos."
- **Failed:** muestra URL/content raw + botón "Reintentar análisis" + posibilidad de editar manualmente.

### Componentes usados

- `Dialog` (shadcn) — desktop modal
- `Sheet` (shadcn) — mobile full-screen
- `Button` (shadcn)
- `Badge` (shadcn)
- `DropdownMenu` (shadcn) — menú `[⋮]`
- `MarkdownRenderer` (**nuevo** — ver components/MarkdownRenderer.md)
- `CopyButton` (**nuevo**)
- `TagChip` (**nuevo**)

---

## Pantalla 4 · Item Edit Form

**Entry from:** Button "Editar" desde detail
**Story refs:** US-017

### Layout

```
┌──────────────────────────────┐
│ Editar item           [X]    │
├──────────────────────────────┤
│ Título *                     │
│ ┌──────────────────────────┐ │
│ │ Título del artículo      │ │
│ └──────────────────────────┘ │
│                              │
│ Categoría                    │
│ ┌──────────────────────────┐ │
│ │ development           ▾  │ │
│ └──────────────────────────┘ │
│                              │
│ Tags                         │
│ ┌──────────────────────────┐ │
│ │[#next-js][#docs][#perf][x]│
│ │ Escribe y enter…         │ │
│ └──────────────────────────┘ │
│                              │
│ Carpeta                      │
│ ┌──────────────────────────┐ │
│ │ 📁 Claude Code > Skills ▾│ │
│ └──────────────────────────┘ │
│                              │
│ [ Cancelar ]  [  Guardar  ]  │
└──────────────────────────────┘
```

### Data Displayed / Editables

| Campo | Tipo | Validación |
|-------|------|-----------|
| Título | Input text | Required, max 120 chars |
| Categoría | Select | Valores existentes + "Crear nueva" |
| Tags | Chip input | Max 30 chars per tag, lowercase + guiones |
| Carpeta | TreeSelect | Opcional, incluye "Sin carpeta" |

**NO editable:** `summary`, `content` original, `content_type`, `thumbnail_url`. La edición es sobre metadata, no sobre el contenido.

### Actions

| Acción | Control | Resultado |
|--------|---------|-----------|
| Cambiar título | Input | Estado local |
| Agregar tag | Escribir + Enter | Chip nuevo, limpia input |
| Quitar tag | Click en "x" del chip | Quita del array |
| Crear tag nuevo | Escribir nombre no existente + Enter | Se crea al guardar |
| Seleccionar carpeta | Tree select | Actualiza path |
| Guardar | Button primary | Submit → update DB → vuelve a detail con datos nuevos |
| Cancelar | Button outline | Descarta cambios → vuelve a detail |

### States

- **Default:** campos pre-llenados con valores actuales.
- **Dirty:** botón "Guardar" habilitado. Cambios sin guardar → intentar cerrar dispara confirm.
- **Submitting:** botón con spinner, form disabled.
- **Error — título vacío:** inline bajo título: "El título es obligatorio"
- **Error — título > 120:** "Máximo 120 caracteres"
- **Error — Supabase:** toast: "No pudimos guardar los cambios."
- **Success:** dialog cierra, detail se refresca con valores nuevos, toast "Cambios guardados".

### Componentes usados

- `Form` (shadcn + react-hook-form)
- `Input`, `Select`, `Button`
- `TagChipInput` (**nuevo**)
- `FolderTreeSelect` (**nuevo**)

---

## Pantalla 5 · Delete Confirmation

**Entry from:** Button "Eliminar" desde detail o context menu del grid
**Story refs:** US-018

### Layout

```
┌──────────────────────────────┐
│  Eliminar "Título del item"? │
│                              │
│  Esta acción no se puede     │
│  deshacer.                   │
│                              │
│  [ Cancelar ]  [ Eliminar ]  │ ← destructive rojo
└──────────────────────────────┘
```

### Actions

| Acción | Control | Resultado |
|--------|---------|-----------|
| Confirmar | Button destructive | Delete en DB + Storage thumbnail → cierra detail → vuelve al grid con card removido (animación fade+scale) |
| Cancelar | Button outline | Cierra confirm, detail permanece |

### States

- **Default:** confirm abierto.
- **Deleting:** botón con spinner, "Eliminando..."
- **Error:** toast: "No pudimos eliminar el item. Intenta nuevamente." Confirm permanece.
- **Success:** cierra confirm + detail, vuelve al grid, toast "Item eliminado".

---

## Pantalla 6 · Grid filtrado (filters y search como query params)

**Entry from:** aplicar filtros desde FilterBar, click en sidebar (folder/tag/category), submit de search bar
**Story refs:** US-024, US-025, US-026

Es la misma Pantalla 1 pero con:
- Breadcrumb actualizado: `Personal > Claude Code > Skills` o `Personal · Tag: #next-js` o `Personal · Búsqueda: "rls"`
- Chips de filtros activos encima del grid
- Botón "Limpiar filtros" visible
- Empty state distinto: "Sin resultados para estos filtros"
- La URL refleja todos los filtros (bookmarkeable, back/forward funcional)

### Reglas de combinación de filtros

```
URL: /w/:id?type=link,command&category=dev&tags=next-js,react&folder=abc&q=supabase
```

- **type:** CSV → OR (link OR command)
- **category:** single → AND
- **tags:** CSV → AND (next-js AND react) — stricter pero coincide con expectativa del user story
- **folder:** single → AND
- **q:** texto → full-text search sobre title+summary+content+tags

Todos los filtros se combinan con **AND** entre categorías. El usuario ve "Mostrando X de Y items".

---

## Acceptance Targets

### Grid (`/w/:id`)
- [ ] Grid responsive: 1 col < 640px, 2 cols 640-1024px, 3-4 cols > 1024px.
- [ ] Primera página (20 items) carga en < 1.5s.
- [ ] Scroll al 80% del grid dispara fetch de página siguiente.
- [ ] Contador "X items" visible y refleja el total filtrado.
- [ ] FAB `[data-testid="capture-fab"]` siempre visible.
- [ ] Empty state con CTA visible cuando `items.length === 0`.

### FilterBar
- [ ] Filtros visibles: Tipo, Categoría, Tags, Folder + Limpiar.
- [ ] Aplicar filtro actualiza URL (query params) sin reload.
- [ ] Chips de filtro activo muestran la label y un "x" para remover.
- [ ] "Limpiar" remueve todos los filtros y vuelve a `/w/:id` sin query.
- [ ] Back button del browser revierte el último filtro aplicado.

### Search (`Cmd+K`)
- [ ] Cmd+K abre el overlay desde cualquier pantalla del app shell.
- [ ] Input con autofocus.
- [ ] Escribir → debounce 300ms → llamada a `search_items()`.
- [ ] Respuesta visible en < 500ms (p95).
- [ ] Match en título/summary/tags aparece resaltado en bold.
- [ ] ↑↓ navega entre resultados, Enter abre el seleccionado.
- [ ] Esc cierra el overlay sin navegar.
- [ ] Empty query muestra "Items recientes" (últimos 10).

### Item Detail
- [ ] URL `/w/:id/item/:itemId` carga el item correcto.
- [ ] 404 si el item no pertenece al workspace del usuario (RLS).
- [ ] Markdown se renderiza con formato: headers h1-h3, listas, code blocks, bold, links.
- [ ] Commands se muestran en monospace con fondo oscuro y botón copy prominente.
- [ ] Click en "Copiar" copia al clipboard y muestra feedback "Copiado ✓" por 1.5s.
- [ ] Click en "Abrir" (links) abre en nueva pestaña (`target="_blank" rel="noopener"`).
- [ ] En mobile, detail es full-screen; en desktop, modal overlay.
- [ ] Back button vuelve al grid en la misma posición (scroll restaurado).

### Edit
- [ ] Título vacío → mensaje "El título es obligatorio", submit bloqueado.
- [ ] Título > 120 chars → mensaje "Máximo 120 caracteres".
- [ ] Agregar tag con Enter crea chip. Click en "x" lo quita.
- [ ] Tag inválido (mayúsculas, símbolos) → rechazado silenciosamente o normalizado a lowercase+guiones.
- [ ] Guardar → cierra form + refresca detail + toast "Cambios guardados".
- [ ] Cerrar con cambios dirty → confirm "¿Descartar cambios?"

### Delete
- [ ] Confirm incluye el título del item en la pregunta.
- [ ] Confirmar → item desaparece del grid con animación + toast.
- [ ] Eliminar desde detail → vuelve al grid automáticamente.
- [ ] Thumbnail del item se elimina del Storage tras el delete (verificable).

---

## Notas para el Skill #8 (UI)

- **Grid density:** priorizar información visible. Un card debe mostrar: thumbnail, título (1 línea), resumen (2 líneas), 3 tags, type badge, relative time. No aire decorativo innecesario.
- **Infinite scroll:** usar `IntersectionObserver` en un sentinel al final. Cache la página en Zustand para que el back del detail no re-fetche.
- **Mobile detail:** usar `Sheet` de shadcn en modo bottom-to-top full-screen. El back gesture nativo de iOS debe funcionar.
- **Markdown renderer:** usar `react-markdown` + `remark-gfm` + `rehype-highlight` para code blocks. Sanitizar con `rehype-sanitize`.
- **Command cards:** fondo oscuro consistente, botón copy en esquina superior derecha de la code block, copia incluyendo newlines.
- **Scroll restoration:** al volver al grid desde el detail, respetar la posición previa (Next.js 16 lo hace por default en `<Link>` pero validar).
- **Filter persistence:** los filtros viven en URL, no en localStorage. Al recargar, se preservan. Al cambiar de workspace, se limpian.
