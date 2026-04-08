# Component — `CaptureDialog`

> **Feature:** capture
> **Ubicación:** `src/features/capture/components/CaptureDialog.tsx`
> **Usado en:** App shell (overlay global), trigger por FAB / Cmd+N
> **Stories:** US-009, US-010, US-011, US-012, US-NF-001

---

## Propósito

Overlay de captura de contenido. Es el **primer punto de contacto** entre el usuario y la app — debe abrirse en < 100ms, el textarea debe tener foco, y todo el flujo (pegar → guardar) debe completarse en máximo 3 taps.

Es el componente más crítico del producto. Cualquier regresión aquí rompe el KPI principal (captura < 3 taps).

---

## Responsive

- **Mobile (< 640px):** `Sheet` de shadcn en modo `side="bottom"`, altura auto, respeta `safe-area-inset-bottom`.
- **Desktop (≥ 640px):** `Dialog` de shadcn centrado, ancho ~500px, backdrop con blur sutil.

Usar un hook `useIsMobile()` para decidir el componente base, o implementar un wrapper polimórfico.

---

## Props

```ts
interface CaptureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
  defaultFolderId?: string  // pre-selecciona una carpeta (útil si se abre desde dentro de una folder view)
  onItemCreated?: (itemId: string) => void  // callback para actualizar el grid optimísticamente
}
```

---

## Estado interno

```ts
type State = {
  content: string
  detectedType: ContentType | null
  manualTypeOverride: ContentType | null
  selectedFolderId: string | null
  folderSelectorExpanded: boolean
  duplicateOf: { id: string; title: string } | null
  checkingDuplicate: boolean
  submitting: boolean
  error: string | null
}
```

Usar `useReducer` para manejar estas transiciones atomicamente.

---

## Layout

### Default (vacío)

```
┌──────────────────────────────┐
│ ▬▬▬▬ (sheet handle, mobile)  │
├──────────────────────────────┤
│  Capturar              [X]   │
│                              │
│  ┌────────────────────────┐  │
│  │ [autofocus]            │  │
│  │ Pega un link, texto,   │  │
│  │ markdown o comando…    │  │
│  │                        │  │
│  └────────────────────────┘  │
│                              │
│  + Guardar en carpeta…       │
│                              │
│  [         Guardar        ]  │ ← disabled
└──────────────────────────────┘
```

### Con contenido (detectado)

```
│  [ContentTypeBadge: 🔗 Link] │
```

Aparece bajo el textarea inmediatamente al detectar el tipo.

### Con duplicado

```
│  ⚠️ Ya tienes este link       │
│     guardado. ¿Guardar otra  │
│     copia?                   │
│                              │
│  [ Cancelar ] [ Sí, guardar ]│
```

Alert amarillo (warning), el botón primary cambia de "Guardar" a "Sí, guardar".

### Con carpeta expandida

```
│  + Guardar en carpeta…  [▾]  │
│  ┌────────────────────────┐  │
│  │ FolderTreeSelect       │  │
│  └────────────────────────┘  │
```

---

## Auto-detección de contenido

Función pura síncrona en `src/features/capture/services/detectContentType.ts`:

```ts
export function detectContentType(input: string): ContentType {
  const trimmed = input.trim()
  if (!trimmed) return 'text'

  // 1. URL detection
  if (/^https?:\/\/[^\s]+$/i.test(trimmed)) return 'link'

  // 2. Markdown detection (necesita > 1 patrón para evitar falsos positivos)
  const mdPatterns = [
    /^#{1,6}\s/m,        // headers
    /```[\s\S]*```/,      // code blocks
    /^\s*[-*+]\s/m,       // bullet lists
    /\*\*.+\*\*/,         // bold
    /^\s*\d+\.\s/m,       // numbered lists
    /\[.+\]\(.+\)/,       // markdown links
  ]
  const mdMatches = mdPatterns.filter((p) => p.test(trimmed)).length
  if (mdMatches >= 2) return 'markdown'

  // 3. Command detection
  const cmdPatterns = [
    /^\$\s/m,                       // $ prompt
    /^(git|npm|npx|yarn|pnpm|bun|sudo|curl|wget|cd|ls|cat|grep|find|docker)\s/m,
    /^\//m,                          // slash command
  ]
  if (cmdPatterns.some((p) => p.test(trimmed))) return 'command'

  // 4. Default
  return 'text'
}
```

**Pruebas unitarias mínimas:**
- `https://foo.com` → `link`
- `# Heading\n- item\n- item` → `markdown`
- `$ git status` → `command`
- `npm install next` → `command`
- `/help` → `command`
- `Recuerda comprar leche` → `text`

---

## Duplicate check (solo para `link`)

- Debounced a 500ms desde el último paste/keystroke.
- Query: `items WHERE workspace_id = X AND url = input AND deleted_at IS NULL`.
- Si existe, muestra el warning con el título del item existente.
- Si el usuario confirma "Sí, guardar", se crea un item nuevo sin bloquear.

```ts
useEffect(() => {
  if (detectedType !== 'link' || !content) return
  const handle = setTimeout(async () => {
    setCheckingDuplicate(true)
    const match = await checkDuplicateUrl(workspaceId, content)
    setDuplicateOf(match)
    setCheckingDuplicate(false)
  }, 500)
  return () => clearTimeout(handle)
}, [content, detectedType, workspaceId])
```

---

## Submit flow

```ts
async function handleSubmit() {
  setSubmitting(true)
  try {
    const result = await createItemAction({
      workspaceId,
      content,
      contentType: manualTypeOverride ?? detectedType ?? 'text',
      folderId: selectedFolderId,
      ignoreDuplicate: duplicateOf !== null,
    })
    onItemCreated?.(result.itemId)
    toast.success('Item guardado')
    onOpenChange(false)
    resetState()
  } catch (err) {
    setError('No pudimos guardar. Intenta nuevamente.')
    // NO cerrar el dialog — preservar el contenido
  } finally {
    setSubmitting(false)
  }
}
```

- El Server Action `createItemAction` crea la fila con `status='pending'` y dispara el AI pipeline en `after()`.
- El toast usa el componente `Toaster` de shadcn.
- El grid debe refrescar optimísticamente usando el `onItemCreated` callback (insertar un card en processing al inicio de la lista sin esperar revalidación).

---

## Keyboard

| Tecla | Acción |
|-------|--------|
| Cmd+N / Ctrl+N | Abre el dialog (registrado en el app shell, no en el componente) |
| Escape | Cierra el dialog (con confirm si hay contenido) |
| Cmd+Enter / Ctrl+Enter | Submit desde el textarea |
| Tab | Navega entre textarea → folder selector → botones |

---

## iOS PWA (safe-area + keyboard)

- El `Sheet` en modo `side="bottom"` debe aplicar `padding-bottom: env(safe-area-inset-bottom)`.
- Usar `visualViewport` API para detectar el teclado virtual y elevar el sheet (o al menos no dejar el botón "Guardar" tapado).

```ts
useEffect(() => {
  if (!window.visualViewport) return
  const handler = () => {
    const keyboardHeight = window.innerHeight - window.visualViewport!.height
    document.documentElement.style.setProperty('--keyboard-h', `${keyboardHeight}px`)
  }
  window.visualViewport.addEventListener('resize', handler)
  return () => window.visualViewport!.removeEventListener('resize', handler)
}, [])
```

Aplicar `padding-bottom: var(--keyboard-h)` al contenido del sheet.

---

## Estados de error

| Error | Visual | Dónde |
|-------|--------|-------|
| Textarea vacío | "Pega o escribe algo para guardar" | Inline bajo textarea |
| > 50k chars | "El contenido es demasiado largo. Máximo 50,000 caracteres." | Inline |
| URL inválida (tipo forzado a link) | "Ingresa una URL válida" | Inline |
| Sin conexión | Toast rojo superior | Toast |
| Supabase falla | Toast "No pudimos guardar. Intenta nuevamente." | Toast, dialog abierto |
| AI pipeline pre-flight (ej: OpenRouter rate limited) | NO bloquea el submit — el item se crea en processing y el AI pipeline reporta failed | — |

**Regla:** el contenido del textarea nunca se borra ante un error de servidor.

---

## Acceptance Targets

Ver `screen-flows/02-capture.md` sección "Acceptance Targets → CaptureDialog" para la lista completa. Lo crítico desde el punto de vista del componente:

- [ ] Se monta desmontado (no en el árbol) cuando `open=false` para no afectar performance del grid.
- [ ] Textarea con autofocus al abrir.
- [ ] `onOpenChange(false)` con contenido dirty dispara confirm "¿Descartar lo escrito?".
- [ ] `onOpenChange(false)` con textarea vacío cierra sin confirm.
- [ ] Botón "Guardar" disabled cuando `content.trim() === ''`.
- [ ] Detección de tipo es síncrona (< 50ms).
- [ ] Check de duplicado solo ocurre para `type === 'link'` y debounced.
- [ ] Submit exitoso resetea el estado y cierra el dialog.
- [ ] Submit fallido preserva el contenido y muestra toast.

---

## Dependencias externas

- `@/shared/ui/dialog`, `@/shared/ui/sheet` (shadcn)
- `@/shared/ui/button`, `@/shared/ui/textarea`, `@/shared/ui/alert`
- `@/features/capture/services/detectContentType`
- `@/features/capture/services/createItemAction` (Server Action)
- `@/features/capture/services/checkDuplicateUrl`
- `@/shared/hooks/useIsMobile`
- `@/features/items/components/ContentTypeBadge`
- `@/features/folders/components/FolderTreeSelect`
- `sonner` / shadcn Toaster para notificaciones
