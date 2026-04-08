# Component — `FolderTreeSelect`

> **Tipo:** shared
> **Ubicación:** `src/features/folders/components/FolderTreeSelect.tsx`
> **Usado en:** CaptureDialog (02-capture), Item edit form (03-items), Move to folder modal (04-organization)
> **Stories:** US-019, US-020, US-021

---

## Propósito

Selector reutilizable de carpeta que muestra el árbol de folders del workspace activo, permite buscar, y respeta el límite de profundidad (max 3 niveles). Aparece en 3 contextos distintos — la consistencia entre ellos es crítica.

---

## Props

```ts
interface FolderTreeSelectProps {
  workspaceId: string
  value: string | null                  // folder_id seleccionado, null = "Sin carpeta"
  onChange: (folderId: string | null) => void
  variant?: 'select' | 'tree'           // default: 'select'
  excludeFolderId?: string               // para evitar seleccionarse a sí mismo al mover
  disabledDepth?: number                 // ej: 2 para deshabilitar nodos donde se crearían hijos de depth 3
  allowNone?: boolean                    // default: true, "Sin carpeta" como opción
  searchable?: boolean                   // default: true
  placeholder?: string                   // default: "Sin carpeta"
}
```

### Variantes

- **`select` (default):** trigger compacto con label + dropdown. Usado en forms de edit y capture dialog.
- **`tree`:** árbol expandido visible directamente, sin trigger. Usado en el modal de "Mover" donde queremos ver todo el árbol de un vistazo.

---

## Layout — Variant `select`

### Trigger

```
┌──────────────────────────┐
│ 📁 Claude Code > Skills ▾│
└──────────────────────────┘
```

- Muestra el path completo del folder seleccionado (o "Sin carpeta" si `value === null`).
- Click abre el popover con el árbol.

### Popover expandido

```
┌──────────────────────────┐
│ 🔍 Buscar carpeta…       │
├──────────────────────────┤
│ ○ Sin carpeta            │
│ ─────────────────────    │
│ ▾ 📁 Claude Code         │
│   ▾ 📁 Skills            │
│     ● 📁 Forge           │ ← seleccionado
│   ▸ 📁 Commands          │
│ ▸ 📁 Ideas               │
│ ▸ 📁 Learning            │
└──────────────────────────┘
```

## Layout — Variant `tree`

Mismo contenido que el popover pero renderizado inline, con altura definida por contenedor y scroll interno si excede.

---

## Búsqueda

- Input con placeholder "Buscar carpeta…"
- Filtra nodos por nombre (case-insensitive, match parcial).
- Los ancestros de un match se muestran expandidos automáticamente.
- Los nodos no-match se ocultan, pero la jerarquía se preserva visualmente.

---

## Disabled state

Un nodo se muestra disabled (grayed out, no seleccionable) cuando:

- `excludeFolderId === folder.id` — no puedes mover un item a sí mismo (aunque irrelevante para items) o una carpeta a sí misma.
- Un ancestro del nodo match `excludeFolderId` — no puedes mover una carpeta dentro de uno de sus descendientes.
- `disabledDepth` aplica a escenarios de creación: si `disabledDepth=2`, los nodos de `depth=2` no pueden ser seleccionados como "padre" (porque crearían hijos de depth=3).

Mostrar tooltip en hover: "Esta carpeta no puede contener más subcarpetas" o similar.

---

## Estado interno

```ts
const [open, setOpen] = useState(false)
const [search, setSearch] = useState('')
const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

// Al abrir, expandir automáticamente los ancestros del valor seleccionado
useEffect(() => {
  if (open && value) {
    setExpandedNodes(getAncestors(value, folderTree))
  }
}, [open, value])
```

---

## Datos

El componente consume un `folderTree` del workspace activo. Esto debe venir pre-cargado del parent (via prop o via un hook compartido `useFolderTree(workspaceId)` con React Query cache).

```ts
interface FolderNode {
  id: string
  name: string
  depth: 0 | 1 | 2
  parent_id: string | null
  children: FolderNode[]
  itemCount?: number
}

type FolderTree = FolderNode[]
```

**Shape:** árbol aplanado por depth, ya ordenado (usar `buildFolderTree()` helper en `src/features/folders/services/`).

---

## Keyboard navigation

| Tecla | Acción |
|-------|--------|
| ↑ ↓ | Moverse entre nodos visibles |
| ← | Colapsar nodo (o subir al padre si ya está colapsado) |
| → | Expandir nodo |
| Enter | Seleccionar el nodo resaltado |
| Esc | Cerrar popover sin seleccionar |
| Escribir texto | Filtro de búsqueda inmediato |

---

## Componentes base

- `Popover` de shadcn para variant `select`.
- `Input` para el search.
- Renderizado del árbol: implementación custom (no hay tree component en shadcn).
- Consider `@radix-ui/react-collapsible` para el colapso/expansión de nodos.

---

## Performance

- Si el árbol tiene < 50 nodos, renderizar directo.
- Si tiene más (raro en Fase 1), considerar virtualización.
- Memoizar el árbol ordenado/filtrado con `useMemo`.
- No re-renderizar si solo cambia `value` (usar `React.memo` con comparador).

---

## Accesibilidad

- `role="listbox"` en el contenedor del árbol.
- `role="option"` en cada nodo.
- `aria-selected` en el nodo actualmente seleccionado.
- `aria-expanded` en nodos con hijos.
- `aria-disabled` en nodos bloqueados.
- Focus trap dentro del popover mientras está abierto.
- Tab cierra el popover (convención con Radix).

---

## Acceptance Targets

- [ ] Trigger muestra el path completo del folder seleccionado ("Claude Code > Skills > Forge").
- [ ] "Sin carpeta" es la primera opción cuando `allowNone=true`.
- [ ] Search filtra el árbol en tiempo real con expansión automática de ancestros.
- [ ] Nodos con `disabledDepth` alcanzado se muestran grayed out y no clickeables.
- [ ] Al abrir el popover, los ancestros del valor actual se expanden automáticamente.
- [ ] Seleccionar un nodo cierra el popover y llama a `onChange(folderId)`.
- [ ] Teclado: ↑↓←→ navegan, Enter selecciona, Esc cierra.
- [ ] En variant `tree`, el árbol es visible sin trigger y ocupa el espacio del contenedor.
- [ ] El componente no hace fetch propio — consume `folderTree` desde props o context.

---

## Ejemplos de uso

### En CaptureDialog

```tsx
<FolderTreeSelect
  workspaceId={workspaceId}
  value={selectedFolderId}
  onChange={setSelectedFolderId}
  variant="select"
  disabledDepth={2}
  allowNone
  placeholder="Sin carpeta"
/>
```

### En Item edit form

```tsx
<FolderTreeSelect
  workspaceId={workspaceId}
  value={item.folder_id}
  onChange={(id) => setFieldValue('folder_id', id)}
  variant="select"
  allowNone
/>
```

### En Move to folder modal

```tsx
<FolderTreeSelect
  workspaceId={workspaceId}
  value={item.folder_id}
  onChange={handleMove}
  variant="tree"
  allowNone
/>
```
