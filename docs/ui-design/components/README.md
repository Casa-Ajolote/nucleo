# UI Design — Components Index

> **Fecha:** 2026-04-08
> **Fuente:** docs/ui-design/screen-flows/*
> **Propósito:** Inventario de componentes nuevos identificados por el Skill #7. Los que tienen spec dedicada cubren componentes complejos o reutilizados en varios flows. Los demás se implementan inline en el feature correspondiente.

---

## Tabla de componentes

| Componente | Tipo | Reuso | Spec dedicada | Apariciones |
|-----------|------|-------|---------------|-------------|
| [ItemCard](./ItemCard.md) | feature | Alto | ✅ | 03-items-library, 02-capture |
| [CaptureDialog](./CaptureDialog.md) | feature | Único | ✅ | 02-capture (app-wide overlay) |
| [Sidebar](./Sidebar.md) | layout | Único | ✅ | App shell, 04-organization |
| [FolderTreeSelect](./FolderTreeSelect.md) | shared | Alto | ✅ | 02-capture, 03-items (edit), 04-organization (move) |
| [TagChipInput](./TagChipInput.md) | shared | Medio | ✅ | 03-items (edit), 04-organization (tags manager) |
| ContentTypeBadge | shared | Alto | Inline (este archivo) | 02-capture, 03-items |
| StatusBadge | shared | Alto | Inline | 02-capture (item processing) |
| CopyButton | shared | Alto | Inline | 02-capture, 03-items |
| FAB | layout | Único | Inline | App shell (todas las páginas del workspace) |
| FilterBar | feature | Único | Inline | 03-items-library |
| SearchCommand (Cmd+K) | feature | Único | Inline | 03-items-library |
| EmptyState | shared | Alto | Inline | Grid, search, folders |
| MarkdownRenderer | shared | Medio | Inline | 03-items (detail) |
| PasswordInput | shared | Bajo | Inline | 01-auth |
| TagChip | shared | Alto | Inline | 03-items, 04-organization |
| WorkspaceDialog | feature | Bajo | Inline | 04-organization |
| FolderDialog | feature | Bajo | Inline | 04-organization |
| DeleteWorkspaceConfirm | feature | Bajo | Inline | 04-organization |

---

## Convenciones comunes

- **Ubicación:**
  - Componentes de feature → `src/features/[feature]/components/`
  - Componentes compartidos → `src/shared/components/` o `src/shared/ui/`
  - Wrappers de shadcn modificados → `src/shared/ui/` (mantener nombres originales)
- **TypeScript:** todos los props con interfaces explícitas, nada de `any`.
- **Tamaño máximo:** 300 líneas por componente (regla Forge: 500 max archivo, 50 max función).
- **Estado local:** `useState`/`useReducer` cuando es solo del componente; Zustand para estado compartido entre features.
- **Naming:** `PascalCase` para el archivo y el componente (`ItemCard.tsx`).
- **Testing hooks:** `data-testid` en elementos clave referenciados en los acceptance targets.

---

## Specs inline de componentes menores

### ContentTypeBadge

**Props:**
```ts
type ContentType = 'link' | 'text' | 'markdown' | 'command'
interface ContentTypeBadgeProps {
  type: ContentType
  size?: 'sm' | 'md'
}
```

**Renders:**
| type | icon | label | color |
|------|------|-------|-------|
| link | 🔗 | "Link" | blue |
| text | 📝 | "Texto" | gray |
| markdown | Ⓜ️ | "Markdown" | purple |
| command | $ | "Comando" | orange (dark bg) |

**Uso:** cards del grid, dialog de captura, detail view, filter bar.

---

### StatusBadge

**Props:**
```ts
type ItemStatus = 'pending' | 'processing' | 'ready' | 'failed'
interface StatusBadgeProps {
  status: ItemStatus
}
```

**Renders:**
- `pending` / `processing` → spinner + "procesando" (texto opcional)
- `ready` → no render (estado implícito; no mostrar badge)
- `failed` → ⚠️ + "Análisis falló" rojo

---

### CopyButton

**Props:**
```ts
interface CopyButtonProps {
  text: string
  variant?: 'icon' | 'button'
  label?: string  // default: "Copiar"
  onCopied?: () => void
}
```

**Comportamiento:**
- `navigator.clipboard.writeText(text)`.
- Tras éxito: cambia a "Copiado ✓" (check verde) por 1500ms, luego vuelve.
- Fallback para browsers sin Clipboard API: `document.execCommand('copy')` con selección.
- Min tap target 44×44px en mobile (requerido por US-016).
- Ref accesible para `aria-label`.

---

### FAB

**Props:**
```ts
interface FABProps {
  onClick: () => void
  icon?: React.ReactNode  // default: Plus
  label?: string  // aria-label, default "Capturar"
}
```

**Styling:**
- Posición: `fixed`, esquina inferior-derecha.
- Offset: `bottom: env(safe-area-inset-bottom) + 16px; right: 16px`.
- Tamaño: 56×56px (mobile), 48×48px (desktop).
- Elevación: sombra con blur para profundidad.
- Z-index: sobre el grid pero debajo de dialogs.
- Siempre visible en rutas `(main)/*` excepto cuando `CaptureDialog` está abierto.

---

### FilterBar

**Props:**
```ts
interface FilterBarProps {
  workspace: Workspace
  filters: {
    type?: ContentType[]
    category?: string
    tags?: string[]
    folder?: string
  }
  onChange: (next: Filters) => void
}
```

**Renders:**
- Row horizontal de dropdowns (desktop) o un botón "Filtros" que abre un Sheet (mobile).
- Chips de filtros activos arriba del grid con "x" para remover.
- Button "Limpiar" si hay al menos un filtro activo.
- Sincroniza con URL query params (via `useSearchParams` + `router.replace`).

---

### SearchCommand (Cmd+K)

**Props:**
```ts
interface SearchCommandProps {
  workspace: Workspace
  open: boolean
  onOpenChange: (open: boolean) => void
}
```

**Basado en:** `Command` de shadcn (cmdk).

**Comportamiento:**
- Atajo global: Cmd+K / Ctrl+K registrado en un `useEffect` top-level.
- Debounce del input: 300ms.
- Query function: llama a `search_items(query, workspaceId)` (función SQL definida en tech-spec).
- Cache Zustand: key `${workspaceId}:${query}`, TTL 30s.
- Resultados: max 20 visibles.
- Empty query: muestra "Items recientes" (últimos 10).
- Navegación con ↑↓, Enter abre, Esc cierra.

---

### EmptyState

**Props:**
```ts
interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'outline'
  }
}
```

**Casos de uso:**
- Workspace vacío → icon 📥, title "Tu workspace está vacío", action "+ Capturar algo"
- Folder vacío → "Esta carpeta está vacía. Mueve items aquí o captura algo nuevo."
- Sin resultados search → "No encontré nada para '[query]'. Intenta con otras palabras."
- Sin resultados filtros → "Sin resultados para estos filtros." + action "Limpiar filtros"

**Reglas:**
- No usar texto genérico "No hay datos".
- Siempre ofrecer un next action si es posible.
- Ícono grande + espacio vertical centrado.

---

### MarkdownRenderer

**Props:**
```ts
interface MarkdownRendererProps {
  content: string
  className?: string
}
```

**Dependencias:**
- `react-markdown` + `remark-gfm` (GitHub Flavored: tablas, strikethrough, checkboxes).
- `rehype-highlight` para code blocks.
- `rehype-sanitize` con schema permisivo (sin scripts, sí links externos con `rel="noopener"`).

**Estilos:**
- Usar `@tailwindcss/typography` (`prose`) con adaptaciones.
- `prose-code` en monospace.
- Headers h1-h3 con tamaños consistentes con el resto del producto.

---

### PasswordInput

**Props:** extiende `React.InputHTMLAttributes<HTMLInputElement>`.

**Comportamiento:**
- `type=password` por default.
- Botón toggle (icono 👁/🙈) dentro del input, alineado a la derecha.
- Botón min 44×44px tap target.
- Alterna `type=password` ↔ `type=text`.
- Nunca logear el valor.

---

### TagChip

**Props:**
```ts
interface TagChipProps {
  tag: string
  onClick?: () => void
  onRemove?: () => void
  variant?: 'default' | 'interactive'
}
```

**Styling:**
- Prefijo `#`.
- Background `secondary` con hover.
- Si `onRemove` está presente, muestra una "x" clickeable en el lado derecho.
- Truncate a 30 chars con ellipsis.

---

### WorkspaceDialog

**Props:**
```ts
interface WorkspaceDialogProps {
  mode: 'create' | 'edit'
  workspace?: Workspace
  open: boolean
  onOpenChange: (open: boolean) => void
}
```

**Comportamiento:**
- Form con `name` (required, max 30) + `icon` (grid de 10 emojis preseteados).
- Submit llama a Server Action `createWorkspace` o `updateWorkspace`.
- En create exitoso, setea el nuevo workspace como activo automáticamente.
- Errores inline bajo el input.

---

### FolderDialog

Similar a `WorkspaceDialog` pero con `name` (max 50) + `parentId`. Ver 04-organization para reglas de depth.

---

### DeleteWorkspaceConfirm

**Comportamiento crítico:**
- Requiere escribir el nombre exacto del workspace para habilitar el botón de confirmación (fricción intencional).
- Muestra aviso explícito de la cascada: "Se perderán todos los items, carpetas y tags de este workspace."
- Botón destructive (rojo) solo habilitado cuando el input match exacto.
