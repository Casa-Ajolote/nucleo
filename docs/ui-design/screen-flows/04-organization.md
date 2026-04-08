# Screen Flow — Organization (Workspaces + Folders + Tags + Categories)

> **Epics:** 2 (Workspaces) + 5 (Organización)
> **Stories:** US-005..008 (workspaces), US-019..023 (folders, tags, categorías)

Todo lo organizativo vive en el sidebar. Este flow cubre cómo se crean, editan y navegan las estructuras jerárquicas.

---

## UI Requirements extraídos

| Story | Entry point | Datos | Acciones |
|-------|-------------|-------|----------|
| US-005 | Sidebar top | workspace activo + lista | Cambiar workspace |
| US-006 | Sidebar top → dropdown | nombre, icono | Crear workspace |
| US-007 | Context menu workspace | nombre, icono | Editar |
| US-008 | Context menu workspace | confirmación | Eliminar + cascada |
| US-019 | Sidebar → "+" en sección Carpetas | nombre, parent_id | Crear folder |
| US-020 | Folder tree | depth ≤ 2 | Crear subfolder |
| US-021 | Item detail → "Mover" | folder destino | Mover item |
| US-022 | Sidebar → "Ver todos" tags | lista + conteo | Filtrar, renombrar, eliminar |
| US-023 | Sidebar → Categorías | lista + color + conteo | Filtrar, crear custom |

---

## Sección 1 · Workspace Selector (US-005..008)

### Layout — Sidebar top

```
┌──────────────────────────┐
│  ┌────────────────────┐  │
│  │ 💼 Personal      ▾ │  │ ← trigger
│  └────────────────────┘  │
└──────────────────────────┘
```

### Layout — Dropdown abierto

```
┌──────────────────────────┐
│ WORKSPACES               │
│                          │
│ ● 💼 Personal            │ ← activo (check)
│ ○ 🏢 Trabajo             │
│ ○ 🚀 Side Projects       │
│ ○ 📚 Learning            │
│                          │
│ ─────────────────────    │
│ + Crear workspace        │
│ ⚙️ Gestionar workspaces   │
└──────────────────────────┘
```

### Actions

| Acción | Control | Resultado |
|--------|---------|-----------|
| Cambiar workspace | Tap en item no activo | Navega a `/w/:newId`, grid se actualiza en < 300ms, sidebar refleja nuevo contexto |
| Crear workspace | Tap "+ Crear workspace" | Abre `WorkspaceDialog` en modo create |
| Gestionar | Tap "Gestionar workspaces" | Navega a `/w/:id/settings#workspaces` |
| Context menu | Long press / right-click en workspace | Opciones: Editar, Eliminar (excepto si es el único) |

---

## Pantalla 1 · `WorkspaceDialog` (create/edit)

**Entry from:** "Crear workspace" dropdown, "Editar" context menu
**Story refs:** US-006, US-007

### Layout

```
┌──────────────────────────────┐
│ Nuevo workspace         [X]  │
├──────────────────────────────┤
│ Nombre *                     │
│ ┌──────────────────────────┐ │
│ │                          │ │
│ └──────────────────────────┘ │
│                              │
│ Icono                        │
│ [💼] [🏢] [🚀] [📚] [💡]      │
│ [🎯] [🎨] [🔧] [🧠] [📥]      │
│                              │
│ [ Cancelar ]    [ Crear ]    │
└──────────────────────────────┘
```

En modo edit: título "Editar workspace", botón "Guardar", campos pre-llenados, no permite duplicar el nombre de otro workspace del usuario.

### Data / Validations

| Campo | Tipo | Validación |
|-------|------|-----------|
| Nombre | Input text | Required, max 30 chars, único por usuario |
| Icono | Radio grid | 10 opciones preseteadas, default `💼` |

### States

- **Default:** form vacío (create) o pre-llenado (edit).
- **Submitting:** botón con spinner.
- **Error — nombre vacío:** "El nombre es obligatorio"
- **Error — nombre duplicado:** "Ya tienes un workspace con ese nombre"
- **Error — máximo 5:** "Máximo 5 workspaces. Elimina uno para crear otro."
- **Success:** dialog cierra, nuevo workspace se activa automáticamente (solo en create), sidebar se refresca.

---

## Pantalla 2 · Delete Workspace Confirmation

**Entry from:** Context menu → "Eliminar"
**Story refs:** US-008

### Layout

```
┌──────────────────────────────┐
│ Eliminar "Personal"?         │
│                              │
│ Se perderán todos los items, │
│ carpetas y tags de este      │
│ workspace.                   │
│                              │
│ Esta acción no se puede      │
│ deshacer.                    │
│                              │
│ Para confirmar, escribe el   │
│ nombre del workspace:        │
│ ┌──────────────────────────┐ │
│ │ Personal                 │ │
│ └──────────────────────────┘ │
│                              │
│ [ Cancelar ] [ Eliminar ]    │ ← destructive, disabled si nombre ≠
└──────────────────────────────┘
```

**Fricción intencional:** escribir el nombre del workspace para confirmar. Es destructivo + cascada a muchos datos — no queremos que sea un tap descuidado.

### Actions

| Acción | Control | Resultado |
|--------|---------|-----------|
| Escribir nombre | Input | Habilita el botón solo cuando match exacto |
| Confirmar | Button destructive | Delete cascada → redirect al primer workspace restante |
| Cancelar | Button outline | Cierra dialog |

### States

- **Default:** botón disabled, input vacío.
- **Typing:** botón enabled en cuanto el texto hace match con el nombre exacto.
- **Deleting:** "Eliminando workspace..."
- **Error — es el único:** dialog muestra mensaje en lugar del form: "No puedes eliminar este workspace porque es el único que tienes. Crea otro primero."
- **Success:** dialog cierra, redirect a `/w/:firstRemainingId`, toast "Workspace eliminado".

---

## Sección 2 · Folder Tree (US-019..021)

### Layout — Sidebar section

```
┌──────────────────────────┐
│ CARPETAS           [+]   │ ← botón crear folder raíz
│                          │
│ ▾ 📁 Claude Code   (34)  │
│   ▾ 📁 Skills     (12)  │
│     📁 Forge      (5)   │ ← nivel 3 (final)
│   ▸ 📁 Commands   (8)   │
│ ▸ 📁 Ideas        (7)   │
│ ▸ 📁 Learning     (15)  │
│ ─────────────────────    │
│ 📂 Sin carpeta   (27)    │ ← bucket especial
└──────────────────────────┘
```

### Actions

| Acción | Control | Resultado |
|--------|---------|-----------|
| Crear folder raíz | Button "+" junto a "CARPETAS" | Abre `FolderDialog` con `parent_id=null` |
| Expandir/colapsar | Tap en ▸/▾ o en la fila | Toggle visibilidad de hijos |
| Seleccionar folder | Tap en nombre | Navega a `/w/:id?folder=:folderId`, grid filtra |
| Crear subfolder | Context menu → "Nueva subcarpeta" | Abre `FolderDialog` con `parent_id=X` (si depth < 2) |
| Editar | Context menu → "Renombrar" | Abre `FolderDialog` en modo edit |
| Eliminar | Context menu → "Eliminar" | Confirm → delete. Items quedan sin carpeta (no se borran). |
| Reordenar (Fase 2) | Drag & drop | Actualiza `order` dentro del mismo parent |

### Reglas de profundidad

- `depth=0`: folders raíz (parent_id = null)
- `depth=1`: subfolders de un folder raíz
- `depth=2`: sub-subfolders (último nivel permitido)
- `depth=3`: **bloqueado en UI y DB** (CHECK constraint)

Si el usuario intenta crear dentro de un folder de depth=2, el botón "Nueva subcarpeta" debe estar disabled con tooltip: *"Máximo 3 niveles de carpetas. Usa tags para más granularidad."*

---

## Pantalla 3 · `FolderDialog`

**Entry from:** Create/edit folder
**Story refs:** US-019, US-020

### Layout

```
┌──────────────────────────────┐
│ Nueva carpeta           [X]  │
├──────────────────────────────┤
│ Nombre *                     │
│ ┌──────────────────────────┐ │
│ │                          │ │
│ └──────────────────────────┘ │
│                              │
│ Dentro de                    │
│ ┌──────────────────────────┐ │
│ │ 📁 Claude Code > Skills ▾│ │
│ └──────────────────────────┘ │
│                              │
│ [ Cancelar ]    [ Crear ]    │
└──────────────────────────────┘
```

### Data / Validations

| Campo | Tipo | Validación |
|-------|------|-----------|
| Nombre | Input text | Required, max 50 chars, único dentro del mismo parent |
| Parent | FolderTreeSelect | Opcional (null = raíz), bloquea depth=3 |

### States

- **Default:** nombre vacío, parent pre-seleccionado según entry point.
- **Error — nombre vacío:** "El nombre es obligatorio"
- **Error — duplicado:** "Ya existe una carpeta con ese nombre aquí"
- **Error — depth=3:** no llega aquí — el selector de parent bloquea las opciones depth=2.
- **Success:** dialog cierra, nuevo folder aparece en el árbol con highlight brief (flash bg).

---

## Sección 3 · Tags (US-022)

### Layout — Sidebar section (top 8)

```
┌──────────────────────────┐
│ TAGS                     │
│                          │
│ #claude-code      (22)   │
│ #next-js          (15)   │
│ #prompt           (12)   │
│ #supabase         (10)   │
│ #rls              (8)    │
│ #shadcn           (7)    │
│ #react            (6)    │
│ #forge            (4)    │
│                          │
│ [ Ver todos (47) → ]     │
└──────────────────────────┘
```

Ordenados por frecuencia DESC (más items = arriba). Top 8 visibles por defecto.

### Actions

| Acción | Control | Resultado |
|--------|---------|-----------|
| Filtrar por tag | Tap en tag | Navega a `/w/:id?tags=:slug` |
| Ver todos | Button "Ver todos" | Abre `TagsManagerSheet` |
| Context menu | Long press / right-click | Renombrar, Eliminar |

---

## Pantalla 4 · `TagsManagerSheet`

**Entry from:** "Ver todos" en sidebar, o desde settings
**Story refs:** US-022

### Layout

```
┌──────────────────────────────┐
│ Tags (47)              [X]   │
├──────────────────────────────┤
│ 🔍 Buscar tag…               │
├──────────────────────────────┤
│ #claude-code  (22)    [⋮]    │
│ #next-js      (15)    [⋮]    │
│ #prompt       (12)    [⋮]    │
│ #supabase     (10)    [⋮]    │
│ #rls           (8)    [⋮]    │
│ …                            │
│                              │
└──────────────────────────────┘
```

El `[⋮]` por row abre: Renombrar, Eliminar (con confirm), Ver items.

### Validations de tag

- Max 30 chars
- Solo lowercase + guiones (auto-normalizado al crear)
- Único por workspace

### Actions

| Acción | Resultado |
|--------|-----------|
| Buscar | Filtra la lista en tiempo real |
| Tap en tag | Cierra sheet + navega al grid filtrado |
| Renombrar | Inline input en el row, Enter guarda, Esc cancela |
| Eliminar | Confirm: "¿Eliminar tag #X? Quedará removido de todos los items." → delete |

---

## Sección 4 · Categorías (US-023)

### Layout — Sidebar section

```
┌──────────────────────────┐
│ CATEGORÍAS               │
│                          │
│ 🟦 development    (56)   │
│ 🟪 ai             (31)   │
│ 🟧 design         (18)   │
│ 🟨 productivity   (14)   │
│ 🟩 learning        (9)   │
│ ⬜ other           (14)   │
│                          │
└──────────────────────────┘
```

Cada categoría tiene un color fijo. Las 8 por defecto (generadas por IA):
- `development` (azul)
- `ai` (púrpura)
- `design` (naranja)
- `business` (verde oscuro)
- `productivity` (amarillo)
- `learning` (verde claro)
- `reference` (gris)
- `other` (gris claro)

### Actions

| Acción | Control | Resultado |
|--------|---------|-----------|
| Filtrar por categoría | Tap | `/w/:id?category=:slug` |
| Crear custom | Settings → "Crear categoría" | Form con nombre + color picker |
| Editar | Context menu | Renombrar / cambiar color |
| Eliminar | Context menu | Confirm → items asociados pasan a "other" |

**Regla:** las 8 categorías default no se pueden eliminar (pero sí renombrar). Solo las custom del usuario son eliminables.

---

## Pantalla 5 · Move Item to Folder (`FolderTreeSelect` modal)

**Entry from:** Item detail → "Mover" o item edit form → campo "Carpeta"
**Story refs:** US-021

### Layout

```
┌──────────────────────────────┐
│ Mover a carpeta        [X]   │
├──────────────────────────────┤
│ 🔍 Buscar carpeta…           │
├──────────────────────────────┤
│ ○ Sin carpeta                │
│ ─────────────────────        │
│ ○ 📁 Claude Code             │
│   ○ 📁 Skills                │
│     ● 📁 Forge               │ ← ubicación actual
│   ○ 📁 Commands              │
│ ○ 📁 Ideas                   │
│ ○ 📁 Learning                │
│                              │
│ [ Cancelar ]    [ Mover ]    │
└──────────────────────────────┘
```

### Actions

| Acción | Control | Resultado |
|--------|---------|-----------|
| Buscar | Input | Filtra el árbol |
| Seleccionar | Radio (tap en row) | Marca selected (destacado) |
| Mover | Button primary | Update `items.folder_id` → cierra modal + toast "Item movido" |
| Cancelar | Button outline | Cierra sin cambios |

### States

- **Default:** ubicación actual pre-seleccionada (highlighted).
- **Submit:** botón con spinner, "Moviendo..."
- **Success:** modal cierra, detail actualizado, toast "Item movido a [folder]".

---

## Acceptance Targets

### Workspace Selector
- [ ] Dropdown en sidebar con todos los workspaces del usuario.
- [ ] Workspace activo marcado con check o dot lleno.
- [ ] Tap en otro workspace → URL cambia a `/w/:newId` en < 300ms.
- [ ] El workspace seleccionado persiste en DB (`users.last_workspace_id`) — al relogin vuelve al mismo.
- [ ] Crear workspace → aparece en el dropdown + se selecciona automáticamente.
- [ ] Crear con 5 workspaces existentes → error "Máximo 5 workspaces".
- [ ] Eliminar con solo 1 workspace → error "No puedes eliminar este workspace...".
- [ ] Delete confirm exige escribir el nombre exacto para habilitar el botón.
- [ ] Delete cascada: eliminar el workspace elimina `items`, `folders`, `tags` asociados (verificable en DB).

### Folders
- [ ] Sidebar muestra árbol con indentación visual por depth.
- [ ] Click en folder → grid filtrado + breadcrumb actualizado.
- [ ] Folders colapsables; estado de colapso persiste durante la sesión.
- [ ] Crear subfolder dentro de depth=2 → error "Máximo 3 niveles…" o botón disabled con tooltip.
- [ ] Crear con nombre duplicado en mismo parent → error inline.
- [ ] Eliminar folder → items quedan con `folder_id=null` (no se borran).
- [ ] "Sin carpeta" bucket muestra count de items con `folder_id IS NULL`.

### Tags
- [ ] Sidebar muestra top 8 tags ordenados por frecuencia DESC.
- [ ] Click en tag → grid filtrado por ese tag.
- [ ] "Ver todos" abre sheet con lista completa + búsqueda.
- [ ] Renombrar tag afecta a todos los items que lo contengan.
- [ ] Eliminar tag lo quita de todos los items (no los borra).
- [ ] Crear tag con mayúsculas → normalizado a lowercase + guiones.

### Categorías
- [ ] 8 categorías default presentes para cada workspace nuevo.
- [ ] Cada categoría tiene un color fijo en badge.
- [ ] Click → grid filtrado.
- [ ] Categorías default no eliminables (botón disabled o no visible).
- [ ] Crear custom → form con nombre + color picker → persiste.
- [ ] Eliminar custom → items asociados se reasignan a "other".

### Move to Folder
- [ ] Modal muestra árbol completo del workspace activo.
- [ ] "Sin carpeta" siempre visible arriba.
- [ ] Folder actual del item pre-seleccionado (highlighted).
- [ ] Submit → item aparece en el folder destino, desaparece del origen.

---

## Notas para el Skill #8 (UI)

- **Sidebar scroll independiente:** si el sidebar tiene muchas folders/tags, debe tener su propio scroll (no scrollear la app entera).
- **Tree rendering:** evitar re-renders completos del árbol al expandir/colapsar. Usar estado local por nodo.
- **Folder tree select:** componente reutilizable que aparece en capture dialog, edit item, y move modal. Debe soportar búsqueda, deshabilitar nodos depth=2 para creación, y marcar el seleccionado.
- **Context menus:** usar `ContextMenu` de shadcn (click derecho desktop + long press mobile via `use-long-press`).
- **Delete con fricción:** solo para workspaces. Para folders, tags y categorías, un confirm simple es suficiente (son menos destructivos).
- **Color de categorías:** definir las 8 defaults como tokens en `tailwind.config.ts` para consistencia. Custom usan `hex` stored en DB.
- **Real-time sync:** si el usuario está en múltiples devices (iPhone + Mac) simultáneamente, considerar Supabase Realtime en el sidebar para que los cambios se reflejen. Fase 2, no Fase 1.
