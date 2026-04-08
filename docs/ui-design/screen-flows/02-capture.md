# Screen Flow — Capture (Core Feature)

> **Epic:** 3 — Captura de Contenido
> **Stories:** US-009 (link), US-010 (texto), US-011 (markdown), US-012 (comando), US-013 (AI async), US-NF-001 (duplicados)
> **KPI objetivo:** < 3 taps · < 30s desde abrir app hasta item guardado
> **Device primario:** iPhone

---

## Por qué este flow es el más crítico

Es la tarea #1 del producto. Todo el resto del software existe para que esto funcione sin fricción. Cualquier decisión de diseño que añada un tap o un campo aquí mata el valor del producto.

---

## UI Requirements extraídos

| Story | Pantallas | Datos | Acciones |
|-------|-----------|-------|----------|
| US-009..012 | `CaptureDialog` overlay | content (string), content_type auto-detectado, folder opcional | Pegar, guardar, cancelar |
| US-013 | `ItemCard` en grid | status (pending/processing/ready/failed), skeleton | Poll + update |
| US-NF-001 | DuplicateWarning inline | URL match existente | Guardar duplicado / cancelar |

---

## Flow Diagram

```
[Grid del workspace]
      │
      ├─ Tap FAB [+] ─────┐
      │                   ▼
      │          [CaptureDialog abierto]
      │                   │
      │          (autofocus en textarea)
      │                   │
      │           Usuario pega/escribe
      │                   │
      │          auto-detect content_type
      │                   │
      │          ┌────────┴────────┐
      │          │ Es URL ya       │
      │          │ guardada?       │
      │          └────────┬────────┘
      │                   │
      │          ┌────────┴────────┐
      │          │ Sí              │ No
      │          ▼                 ▼
      │  [DuplicateWarning]  [Submit habilitado]
      │          │                 │
      │      "Guardar igual"       │
      │          │                 │
      │          └───────┬─────────┘
      │                  │
      │            Tap "Guardar"
      │                  │
      │          Server Action: crea item status=pending
      │                  │
      │          after() → dispara AI pipeline
      │                  │
      ▼                  ▼
[Grid actualizado]  [Item aparece con skeleton]
                          │
                          │ (polling 3s o realtime)
                          │
                   ┌──────┴──────┐
                   │             │
                   ▼             ▼
              [ready]        [failed]
              Card con       Badge rojo
              datos IA      [Reintentar]
```

---

## Pantalla 1 · `CaptureDialog` (overlay)

**Entry from:**
- FAB "+" desde cualquier pantalla del workspace
- Cmd+N desde desktop
- Acción "Compartir a Nucleo" desde iOS (Fase 2)

**Story refs:** US-009, US-010, US-011, US-012, US-NF-001

### Layout — Estado default (mobile)

```
┌──────────────────────────────┐
│ ▬▬▬▬ (handle del sheet)      │ ← bottom sheet en mobile
├──────────────────────────────┤
│  Capturar                [X] │
│                              │
│  ┌────────────────────────┐  │
│  │                        │  │
│  │ Pega un link, texto,   │  │
│  │ markdown o comando…    │  │
│  │                        │  │
│  │                        │  │
│  └────────────────────────┘  │
│                              │
│  + Guardar en carpeta…       │ ← expandible
│                              │
│  [          Guardar        ] │ ← full-width, disabled
│                              │
└──────────────────────────────┘
```

En desktop, el mismo contenido dentro de un `Dialog` centrado de ~500px de ancho, con Esc para cerrar.

### Layout — Con contenido detectado

```
┌──────────────────────────────┐
│  Capturar                [X] │
│                              │
│  ┌────────────────────────┐  │
│  │ https://nextjs.org/... │  │
│  │                        │  │
│  └────────────────────────┘  │
│  🔗 Link detectado           │ ← badge auto-detect
│                              │
│  + Guardar en carpeta…       │
│                              │
│  [          Guardar        ] │ ← habilitado
└──────────────────────────────┘
```

### Layout — Con warning de duplicado

```
┌──────────────────────────────┐
│  Capturar                [X] │
│                              │
│  ┌────────────────────────┐  │
│  │ https://nextjs.org/... │  │
│  └────────────────────────┘  │
│  🔗 Link detectado           │
│                              │
│  ⚠️ Ya tienes este link       │ ← inline amarillo
│     guardado. ¿Guardar       │
│     otra copia?              │
│                              │
│  [ Cancelar ] [ Sí, guardar ]│
└──────────────────────────────┘
```

### Layout — Con carpeta expandida

```
│  + Guardar en carpeta…  [▾]  │
│  ┌────────────────────────┐  │
│  │ 🔍 Buscar carpeta…     │  │
│  ├────────────────────────┤  │
│  │ ○ Sin carpeta           │  │
│  │ ● 📁 Claude Code        │  │
│  │   └ 📁 Skills           │  │
│  │ ○ 📁 Ideas              │  │
│  └────────────────────────┘  │
```

### Data Displayed

| Elemento | Fuente | Formato |
|----------|--------|---------|
| Título dialog | literal | "Capturar" |
| Placeholder | literal | "Pega un link, texto, markdown o comando…" |
| Badge auto-detect | detect function | `🔗 Link` / `📝 Texto` / `Ⓜ️ Markdown` / `$ Comando` |
| Carpeta selector | `folders` del workspace activo | árbol con indentación |
| Warning duplicado | query a `items` por URL exacta | ⚠️ + mensaje |

### Actions

| Acción | Control | Resultado |
|--------|---------|-----------|
| Pegar contenido | paste event en textarea | Auto-detecta tipo y muestra badge |
| Toggle manual de tipo | Badge clickable (solo si ambiguo) | Muestra chips: Link / Texto / Markdown / Comando |
| Expandir selector carpeta | Link "+ Guardar en carpeta…" | Expande inline un selector searchable |
| Seleccionar carpeta | Tap en item del árbol | Marca selected, collapsa selector |
| Guardar | Button primary (disabled si vacío) | Server action → item creado → dialog cierra |
| Cancelar | Button X, tap fuera, Escape | Cierra dialog. Si hay contenido → confirmar descarte |
| Guardar duplicado | Button en warning | Fuerza creación ignorando duplicado |

### Auto-detección de content_type

Orden de checks (el primero que hace match gana):

```ts
1. URL regex (http[s]://) → "link"
2. Markdown patterns (# heading | ```code``` | **bold** | - lista) → "markdown"
3. Command patterns ($ | / | git | npm | npx | sudo | curl | cd ) → "command"
4. Else → "text"
```

El usuario puede override manualmente con un dropdown si la detección falla.

### States

- **Default:** textarea vacío, botón "Guardar" disabled, sin badge, carpeta colapsada.
- **Typing:** badge aparece/cambia con cada pulsación, botón habilitado en cuanto hay contenido.
- **Checking duplicate:** spinner pequeño junto al badge ("Verificando…") — solo para URLs, debounce 500ms.
- **Duplicate found:** warning inline amarillo, botón cambia a "Sí, guardar igual", aparece "Cancelar".
- **Submitting:** botón con spinner, textarea disabled, texto "Guardando…"
- **Success:** dialog cierra, toast "Item guardado", grid scroll to top, card aparece con skeleton.
- **Error — sin contenido:** inline bajo textarea: "Pega o escribe algo para guardar"
- **Error — > 50k chars:** "El contenido es demasiado largo. Máximo 50,000 caracteres."
- **Error — URL inválida (si se forzó tipo link):** "Ingresa una URL válida"
- **Error — offline:** toast rojo: "Sin conexión. El item no se guardó."
- **Error — Supabase:** toast: "No pudimos guardar. Intenta nuevamente." Dialog permanece abierto con contenido preservado.

### Componentes usados

- `Dialog` / `Sheet` (shadcn — responsivo: Sheet en mobile, Dialog en desktop)
- `Textarea` (shadcn) con auto-resize
- `Button` (shadcn)
- `Badge` (shadcn)
- `Alert` (shadcn) — warning duplicate
- `CaptureDialog` (**nuevo wrapper** — ver components/CaptureDialog.md)
- `FolderTreeSelect` (**nuevo** — ver components/FolderTreeSelect.md)
- `ContentTypeBadge` (**nuevo** — ver components/ContentTypeBadge.md)

---

## Pantalla 2 · `ItemCard` en estado de procesamiento

**Entry from:** Inmediatamente después de guardar desde el `CaptureDialog`
**Story refs:** US-013

### Layout — estado `processing`

```
┌─────────────────────┐
│ ┌─────────────────┐ │
│ │ [thumbnail      │ │
│ │  placeholder]   │ │
│ └─────────────────┘ │
│                     │
│ ▓▓▓▓▓▓▓▓▓▓▓ 80%    │ ← skeleton líneas
│ ▓▓▓▓▓▓▓▓           │
│ ▓▓▓▓▓▓▓▓▓▓▓▓ 95%   │
│                     │
│ [⏳ procesando]     │ ← badge status
└─────────────────────┘
```

### Layout — estado `ready`

```
┌─────────────────────┐
│ ┌─────────────────┐ │
│ │ [OG image]      │ │
│ └─────────────────┘ │
│                     │
│ Título del artículo │
│ Resumen corto que   │
│ explica el conteni… │ ← truncado 2 líneas
│                     │
│ [#tag1] [#tag2] +3  │
│ 🔗 Link · hace 2m   │
└─────────────────────┘
```

### Layout — estado `failed`

```
┌─────────────────────┐
│ ┌─────────────────┐ │
│ │ [placeholder]   │ │
│ └─────────────────┘ │
│                     │
│ (sin título)        │ ← muestra URL raw
│ https://example…    │
│                     │
│ ⚠️ Análisis falló    │
│ [ Reintentar ]      │
└─────────────────────┘
```

### Data Displayed

| Elemento | Fuente | Formato |
|----------|--------|---------|
| Thumbnail | `items.thumbnail_url` o placeholder por tipo | imagen 16:9 o ícono grande |
| Status badge | `items.status` | ⏳ / ✅ (implícito) / ⚠️ |
| Title | `items.title` | 1 línea, truncate |
| Summary | `items.summary` | 2 líneas, truncate |
| Tags | `items.tags` (join) | max 3 visibles + "+N" |
| Type badge | `items.content_type` | 🔗/📝/Ⓜ️/$ + label |
| Relative time | `created_at` | "hace 2m", "hace 1h", "ayer" |

### Actions

| Acción | Control | Resultado |
|--------|---------|-----------|
| Tap card | click en toda el área | Abre vista detalle (`/w/:id/item/:itemId`) |
| Copy (solo command) | IconButton esquina | Copia contenido al clipboard + feedback "Copiado ✓" |
| Long press (mobile) / right-click | gesture/menu | Context menu: Editar, Mover, Eliminar |
| Reintentar AI | Button en estado failed | Dispara `/api/items/:id/reprocess` |

### States

- **processing:** skeleton animado en título + resumen + tags. Thumbnail placeholder por tipo. Badge "⏳ procesando". No clickeable el action de copy (aún no hay datos).
- **ready:** card completa con datos IA. Transición fade-in 300ms desde el skeleton.
- **failed:** badge rojo "⚠️ Análisis falló", botón "Reintentar" visible, título muestra URL raw o primeras 60 chars del contenido, card sigue siendo clickeable para ver/editar manualmente.
- **hover (desktop):** elevación sutil, borde resaltado, actions secundarias aparecen (copy, context menu trigger).
- **loading retry:** botón con spinner, badge vuelve a "⏳ procesando".

### Polling strategy

```ts
// En el cliente, mientras el card esté visible y status ∈ {pending, processing}:
// poll GET /api/items/:id cada 3s hasta status ∈ {ready, failed}
// Si más de 5 cards están polling, hacer bulk: GET /api/items?ids=a,b,c
```

**Alternativa:** Supabase Realtime subscription al workspace. Si está habilitado, no hacer polling.

### Componentes usados

- `ItemCard` (**nuevo** — ver components/ItemCard.md)
- `Skeleton` (shadcn)
- `Badge` (shadcn)
- `Button` (shadcn) ghost/icon
- `ContentTypeBadge` (**nuevo**)
- `StatusBadge` (**nuevo**)
- `CopyButton` (**nuevo** — ver components/CopyButton.md)

---

## Acceptance Targets

### CaptureDialog

- [ ] FAB `[data-testid="capture-fab"]` visible en todas las páginas del app shell.
- [ ] Click/tap en FAB abre el dialog en < 100ms (sin fetch).
- [ ] Textarea tiene `autofocus` al abrir.
- [ ] Pegar `https://foo.com` muestra badge "🔗 Link" en < 50ms.
- [ ] Pegar `# Heading\n- item` muestra badge "Ⓜ️ Markdown".
- [ ] Pegar `$ git status` muestra badge "$ Comando".
- [ ] Pegar texto plano sin patterns muestra badge "📝 Texto".
- [ ] Botón "Guardar" disabled con textarea vacío, habilitado con ≥1 char.
- [ ] Submit con URL ya existente → warning amarillo inline con mensaje "Ya tienes este link guardado".
- [ ] Submit exitoso → dialog cierra en < 300ms + nuevo card aparece en el grid en estado processing.
- [ ] Escape cierra el dialog.
- [ ] Tap fuera del dialog con contenido → confirmación "¿Descartar lo escrito?"
- [ ] Tap fuera con textarea vacío → cierra sin confirmar.
- [ ] En iOS standalone, el teclado virtual no tapa el botón "Guardar" (dialog respeta `safe-area-inset-bottom`).
- [ ] Cmd+N (desktop) abre el dialog desde cualquier pantalla del app shell.
- [ ] Link "+ Guardar en carpeta…" expande un selector en < 100ms sin cerrar el dialog.

### ItemCard en procesamiento

- [ ] Card nueva aparece en la primera posición del grid con `[data-status="processing"]`.
- [ ] Skeleton visible en título, summary y tags.
- [ ] Badge "⏳ procesando" presente.
- [ ] Tras procesamiento (< 15s en happy path), `data-status` cambia a `"ready"` y el skeleton desaparece con fade.
- [ ] Múltiples items en processing simultáneamente no bloquean la UI (scroll sigue fluido).
- [ ] Card en estado `failed` muestra botón "Reintentar".
- [ ] Click en "Reintentar" → `data-status` vuelve a `"processing"` y el botón se oculta.
- [ ] Card en `failed` sigue siendo clickeable hacia `/w/:id/item/:itemId` (para editar manual).

### Performance

- [ ] Tiempo desde tap FAB hasta textarea con foco: < 150ms.
- [ ] Tiempo desde tap "Guardar" hasta card en grid: < 500ms (sin esperar IA).
- [ ] Poll interval para items en processing: 3s ± 500ms jitter.

---

## Notas para el Skill #8 (UI)

- **El FAB y el CaptureDialog son el corazón del producto.** Cualquier regresión aquí es crítica.
- **Auto-detect debe ser síncrono.** Cero fetch para detectar el tipo — solo regex.
- **El check de duplicado es debounced** (500ms) para no martillar Supabase mientras el usuario escribe.
- **Nunca hacer navigate lateral** después del submit — el usuario vuelve al grid donde estaba, con el nuevo card visible arriba.
- **Preservar el contenido del textarea** ante cualquier error. Si falla el submit, el usuario no pierde lo que pegó.
- **iOS safe-area:** el FAB debe vivir sobre `env(safe-area-inset-bottom) + 16px`. El bottom sheet del dialog debe subir ante el keyboard (`visualViewport` API).
- **Streaming no aplica aquí.** El AI pipeline es background; la UI solo muestra estados discretos (processing → ready/failed).
