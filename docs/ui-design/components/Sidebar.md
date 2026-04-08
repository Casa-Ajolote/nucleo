# Component — `Sidebar`

> **Tipo:** layout
> **Ubicación:** `src/shared/components/Sidebar.tsx` (o `src/app/(main)/_components/Sidebar.tsx`)
> **Usado en:** `app/(main)/layout.tsx` — fijo desktop, drawer mobile
> **Stories:** US-005, US-026, y cross-cutting

---

## Propósito

Navegación principal del app shell. Contiene:

1. Workspace selector (arriba)
2. Búsqueda rápida (Cmd+K trigger)
3. Vistas globales (Todos / Recientes / Procesando)
4. Árbol de carpetas colapsable
5. Categorías (por frecuencia)
6. Tags populares (top 8)
7. Footer: Importar, Settings, Logout

**Responsive:**
- **≥ 1024px:** fijo a la izquierda, 280px de ancho, scroll interno.
- **< 1024px:** drawer lateral (izquierda-a-derecha), trigger con hamburger en el header mobile.

---

## Props

```ts
interface SidebarProps {
  workspace: Workspace
  workspaces: Workspace[]
  folders: FolderTree
  topTags: Array<{ tag: string; count: number }>
  categories: Array<{ slug: string; name: string; color: string; count: number }>
  viewCounts: {
    all: number
    recent: number
    processing: number
  }
  user: { email: string }
}
```

El Sidebar se renderiza como Server Component (Next.js App Router) con los datos pre-cargados en el layout. Las partes interactivas (folder collapse, workspace switch) son client components sub-árbol.

---

## Estructura (top → bottom)

### 1. Workspace Selector (`WorkspaceSelector` sub-component)

- Renderiza el workspace activo con su icono y nombre.
- Click abre un `DropdownMenu` con la lista completa + "Crear workspace" + "Gestionar".
- Al cambiar, llama a `router.push('/w/:newId')` y actualiza `users.last_workspace_id`.

### 2. Search trigger

```
┌──────────────────────────┐
│ 🔍 Buscar...     Cmd+K   │
└──────────────────────────┘
```

- Click abre el `SearchCommand` overlay (Cmd+K).
- En mobile, el trigger es un icono en el header principal, no en el sidebar (se duplica).

### 3. Vistas globales

```
📥 Todos los items        (142)
⭐ Recientes               (20)
⏳ Procesando               (3)
```

- "Todos" → `/w/:id` (sin filtros).
- "Recientes" → `/w/:id?recent=7d` (últimos 7 días).
- "Procesando" → `/w/:id?status=processing` (solo si count > 0).

El counter es pasado por props; el Sidebar no fetchea.

### 4. Carpetas (`FolderTreeNav` sub-component)

```
CARPETAS                    [+]
▾ 📁 Claude Code          (34)
  ▾ 📁 Skills             (12)
    📁 Forge               (5)
  ▸ 📁 Commands            (8)
▸ 📁 Ideas                 (7)
─────────────────────
📂 Sin carpeta            (27)
```

- Botón `+` abre `FolderDialog` en modo create con `parentId=null`.
- Nodos colapsables (estado local, persistente en `sessionStorage`).
- Context menu por nodo: Nueva subcarpeta (disabled si depth=2), Renombrar, Eliminar.
- "Sin carpeta" es un bucket especial, siempre visible al final.

### 5. Categorías

```
CATEGORÍAS
🟦 development    (56)
🟪 ai             (31)
🟧 design         (18)
…
```

- Ordenadas por count DESC.
- Colapsable si hay más de 6 (default: ocultas las que tienen count < 5%).
- Click → filtra el grid por category.

### 6. Tags populares

```
TAGS POPULARES
#claude-code      (22)
#next-js          (15)
…
[ Ver todos (47) → ]
```

- Top 8 visibles.
- "Ver todos" abre `TagsManagerSheet`.

### 7. Footer

```
─────────────────────
📥 Importar
⚙️  Settings
👤 carlos@...  ·  Logout
```

- "Importar" → `/w/:id/import`.
- "Settings" → `/w/:id/settings`.
- "Logout" abre el confirm de logout.

---

## Responsive behavior

### Desktop (≥ 1024px)

```css
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 280px;
  border-right: 1px solid hsl(var(--border));
  overflow-y: auto;
  background: hsl(var(--sidebar));
}
.main {
  margin-left: 280px;
}
```

### Mobile (< 1024px)

- Renderizar como `Sheet` de shadcn `side="left"`.
- Trigger: botón hamburger en el header mobile.
- Al hacer tap en cualquier item de navegación (folder, tag, category, workspace), el sheet se cierra automáticamente.
- Swipe desde la izquierda para abrir (implementación opcional, Fase 2).

---

## Sub-componentes

| Sub-componente | Responsabilidad |
|----------------|----------------|
| `WorkspaceSelector` | Dropdown con workspaces + crear + gestionar |
| `FolderTreeNav` | Árbol colapsable de carpetas con context menu |
| `CategoryList` | Lista de categorías con badge de color |
| `TagList` | Lista de top 8 tags + "Ver todos" |
| `SidebarFooter` | Importar, settings, logout |

Cada uno es client component porque necesita interactividad. El `Sidebar` shell es server component.

---

## State management

- **Folder collapse state:** `sessionStorage` con key `nucleo:sidebar:folders:collapsed:${workspaceId}`.
- **Active route highlighting:** leer `usePathname()` y `useSearchParams()`.
- **No hay fetching en el sidebar:** los datos vienen por props desde el layout server component.

---

## Performance

- **Cero re-renders al cambiar de página:** el Sidebar es parte del layout, no se desmonta al navegar entre rutas dentro del app shell.
- **Folder tree virtualization:** si un workspace tiene > 100 folders (raro), considerar virtualización con `@tanstack/react-virtual`. Fase 1 no lo necesita.
- **Updates incrementales:** al crear/eliminar una folder, actualizar el cache de React Query localmente en vez de re-fetchear toda la estructura.

---

## Accesibilidad

- `<nav aria-label="Navegación principal">` como elemento raíz.
- Cada sección con `role="group"` y `aria-labelledby` al header (CARPETAS, CATEGORÍAS, etc.).
- El árbol de folders usa `role="tree"` con nodos `role="treeitem"`.
- Estado de colapso anunciado con `aria-expanded`.
- Contraste WCAG AA para todos los textos.
- Foco visible con ring en todos los items interactivos.
- Atajos de teclado para abrir el search (Cmd+K) y el dialog de captura (Cmd+N).

---

## Acceptance Targets

- [ ] `<nav data-testid="sidebar">` presente en todas las rutas del app shell.
- [ ] En desktop, el sidebar está fijo a la izquierda con 280px de ancho.
- [ ] En mobile, el sidebar aparece como drawer via hamburger.
- [ ] El workspace activo está resaltado.
- [ ] Click en otro workspace navega a `/w/:newId` en < 300ms.
- [ ] El árbol de folders es colapsable y mantiene estado entre navegaciones.
- [ ] La ruta activa (folder/tag/category) está resaltada visualmente.
- [ ] "Sin carpeta" es visible siempre.
- [ ] Tap en cualquier item del sidebar en mobile cierra el drawer automáticamente.
- [ ] El footer incluye email del usuario, importar, settings y logout.
- [ ] Cmd+K abre el search overlay desde cualquier lugar del app shell.
