# Component — `ItemCard`

> **Feature:** items
> **Ubicación:** `src/features/items/components/ItemCard.tsx`
> **Usado en:** Grid del workspace (03-items-library), post-captura (02-capture)
> **Stories:** US-014, US-013, US-016, US-018

---

## Propósito

Card visual que representa un item del workspace en el grid principal. Maneja 3 estados visuales distintos (processing / ready / failed) y todas las micro-interacciones: navegación al detalle, copy inline, context menu, transiciones de status.

Es el componente más visible del producto — aparece decenas de veces por sesión.

---

## Props

```ts
import type { Item } from '@/features/items/types'

interface ItemCardProps {
  item: Item
  onClick?: (item: Item) => void           // default: navigate to /w/:id/item/:itemId
  onRetry?: (item: Item) => Promise<void>  // usado en estado failed
  onDelete?: (item: Item) => Promise<void> // usado en context menu
  className?: string
}
```

El tipo `Item` (de `@/features/items/types`) incluye al menos:

```ts
interface Item {
  id: string
  workspace_id: string
  folder_id: string | null
  title: string | null        // null cuando status != ready
  summary: string | null
  content: string
  content_type: 'link' | 'text' | 'markdown' | 'command'
  url: string | null
  thumbnail_url: string | null
  tags: string[]
  category: string | null
  status: 'pending' | 'processing' | 'ready' | 'failed'
  created_at: string
  updated_at: string
}
```

---

## Layout (desktop, ready state)

```
┌──────────────────────────┐
│ ┌──────────────────────┐ │
│ │                      │ │
│ │    thumbnail 16:9    │ │
│ │                      │ │
│ └──────────────────────┘ │
│                          │
│ Título del artículo      │ ← 1 línea, truncate
│                          │
│ Resumen corto que       │ ← 2 líneas, truncate
│ explica el contenido…   │
│                          │
│ [#tag1][#tag2][#tag3]+2  │ ← max 3 + contador
│                          │
│ 🔗 Link · hace 2h    [⋮] │ ← meta + menu trigger
└──────────────────────────┘
```

**Dimensiones:**
- Ancho: `100%` del grid cell (el grid define columns).
- Altura: auto, determinada por contenido (aproximadamente 320-360px con thumbnail).
- Border radius: consistente con `--radius` del design system.
- Padding interior: 16px (24px en desktop).

---

## Estados visuales

### 1. `processing`

```
┌──────────────────────────┐
│ ┌──────────────────────┐ │
│ │  [placeholder icon]  │ │ ← placeholder por content_type
│ └──────────────────────┘ │
│                          │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓          │ ← Skeleton shadcn
│                          │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓      │
│ ▓▓▓▓▓▓▓▓▓▓              │
│                          │
│ ▓▓▓ ▓▓▓▓ ▓▓             │
│                          │
│ [⏳ procesando]          │
└──────────────────────────┘
```

- Thumbnail placeholder según `content_type` (emoji grande centrado).
- `Skeleton` animado en título (1 línea), summary (2 líneas), tags (3 chips).
- Badge "⏳ procesando" en la parte inferior.
- **No clickeable:** el `onClick` al detail está habilitado, pero la acción de copy está deshabilitada.

### 2. `ready`

- Layout completo con datos reales.
- Transición: fade-in 300ms desde el skeleton.
- Hover (desktop): elevación sutil + borde resaltado.
- Cards de `content_type === 'command'` muestran un `CopyButton` directamente en el card (esquina superior derecha de la thumbnail area, o al lado del título).

### 3. `failed`

```
┌──────────────────────────┐
│ ┌──────────────────────┐ │
│ │   [⚠️ placeholder]    │ │
│ └──────────────────────┘ │
│                          │
│ https://ejemplo.com/...  │ ← URL raw o primeros 60 chars
│                          │
│ ⚠️ Análisis falló         │
│                          │
│ [ Reintentar ]           │
└──────────────────────────┘
```

- Placeholder con ícono de warning.
- Título reemplazado con la URL raw o los primeros 60 chars del content.
- Mensaje "Análisis falló" en rojo.
- Botón "Reintentar" ejecuta `onRetry?.(item)`.
- Sigue siendo clickeable (permite al usuario abrir el detail y editar manualmente).

---

## Interacciones

| Interacción | Device | Resultado |
|-------------|--------|-----------|
| Click en card | desktop | `onClick(item)` → navigate a `/w/:id/item/:itemId` |
| Tap en card | mobile | idem |
| Hover | desktop | Elevación + actions secundarias visibles |
| Long press | mobile | Abre context menu (Editar, Mover, Eliminar) |
| Right-click | desktop | Context menu |
| Click en CopyButton (command) | ambos | Copia contenido, muestra "Copiado ✓", no navega al detail (stopPropagation) |
| Click en "Reintentar" (failed) | ambos | `onRetry(item)`, transición a processing |

---

## Context Menu

Abierto por long press (mobile) o right-click (desktop):

| Opción | Icono | Shortcut | Resultado |
|--------|-------|----------|-----------|
| Abrir | ↗ | Enter | Navega al detail |
| Copiar contenido | 📋 | Cmd+C | Copia `item.content` |
| Editar | ✏️ | E | Navega al detail en modo edit |
| Mover a carpeta | 📁 | M | Abre `FolderTreeSelect` modal |
| Eliminar | 🗑 | Del | Abre delete confirm |

Usar `ContextMenu` de shadcn para desktop + `use-long-press` hook para mobile.

---

## Polling (cuando status ∈ {pending, processing})

El componente **no** hace polling por sí solo. El polling se maneja en el parent (grid) con un hook `useItemPolling` que:

1. Detecta items con status != ready/failed en la página visible.
2. Polla `/api/items?ids=a,b,c` cada 3s (con jitter ±500ms).
3. Usa React Query `useQuery` + `refetchInterval` condicional.
4. Cuando un item cambia de status, el cache se actualiza y el `ItemCard` re-renderiza automáticamente.

Alternativa: Supabase Realtime subscription al workspace (preferido en Fase 2 si hay > 10 items processing simultáneamente).

---

## Accesibilidad

- `<article>` como elemento raíz con `role="button"` y `tabIndex={0}` para foco con teclado.
- `aria-label` descriptivo: `"Item: ${title}. Tipo ${content_type}. ${status}."`
- Navegación por teclado: Enter/Space → onClick, Delete → confirm eliminar.
- Contraste del texto sobre el background: WCAG AA.
- Los CopyButton y context menu items tienen `aria-label` propios.

---

## Performance

- **Memoización:** envolver en `React.memo` con comparador custom sobre `item.id`, `item.status`, `item.updated_at`.
- **Lazy loading de thumbnails:** `<Image loading="lazy" />` de `next/image`.
- **No re-renderizar el grid completo** al actualizar un item: el parent usa una key stable (`item.id`) y React reconcilia solo el card afectado.

---

## Variantes / TODO Fase 2

- **Compact variant** (prop `variant="compact"`): sin thumbnail, layout horizontal, para vistas densas.
- **List variant**: fila en lugar de card, para usuarios que prefieren tabla sobre grid.
- **Selected state**: con checkbox para bulk actions (delete, move, tag).

Fuera de scope para Fase 1.

---

## Acceptance Targets (del card)

- [ ] `data-testid="item-card-${item.id}"` presente.
- [ ] `data-status` refleja el status actual del item.
- [ ] En estado `processing`, los skeletons son visibles y no hay datos reales.
- [ ] En estado `ready`, el título, summary, tags, type badge y timestamp son visibles.
- [ ] En estado `failed`, el botón "Reintentar" es visible y clickeable.
- [ ] Click en el card (no en sub-botones) navega a `/w/:workspaceId/item/:itemId`.
- [ ] Click en CopyButton (items command) copia el contenido sin navegar.
- [ ] Long press (mobile) / right-click (desktop) abre context menu con 5 opciones.
- [ ] Skeleton transition a ready hace fade-in (sin hard swap).
- [ ] Thumbnail con `loading="lazy"`.
- [ ] Hover state visible solo en desktop (no en mobile touch).
