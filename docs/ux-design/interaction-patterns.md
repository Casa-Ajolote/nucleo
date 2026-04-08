# Nucleo — Interaction Patterns

> **Fecha**: 2026-04-01
> **Aplica a**: Todo el producto. Sin excepciones.

---

## 1. Feedback Loops

Cada accion del usuario produce feedback visual inmediato. Nunca "nada pasa" despues de un tap.

| Tipo de accion | Feedback | Tiempo |
|---------------|----------|--------|
| Tap en boton (copy, delete, save) | Boton cambia estado visual (color, icono, label) | < 100ms |
| Guardar item | Dialogo se cierra + item aparece en grid con skeleton | < 300ms |
| AI procesando | Card muestra skeleton animado en titulo/resumen/tags | 3-15s (background) |
| AI termina | Card se actualiza suavemente con datos reales (fade in) | Transicion 300ms |
| AI falla | Card muestra badge "Fallido" + boton "Reintentar" | Inmediato |
| Copy al clipboard | Boton cambia a "Copiado ✓" con check verde | 1.5s → vuelve a estado normal |
| Eliminar item | Card desaparece del grid con animacion (scale down + fade) | 200ms |
| Cambiar workspace | Grid se actualiza con items del nuevo workspace | < 300ms percibido |
| Busqueda | Resultados aparecen mientras escribe (debounced) | 300ms debounce + < 500ms response |

**Regla:** Si una accion tarda > 300ms, mostrar loading indicator inmediatamente. Nunca dejar al usuario sin saber si su accion fue registrada.

---

## 2. Form Behavior

### Captura (dialogo "+")

- **Validacion:** On submit (no on blur — es un solo campo, no tiene sentido validar al salir)
- **Error inline:** Debajo del area de texto con mensaje especifico
- **Success:** Dialogo se cierra automaticamente + toast sutil "Item guardado"
- **Contenido pegado:** El area de texto auto-detecta tipo sin intervencion del usuario
- **Cancelar:** Tap fuera del dialogo o boton X. Contenido pegado se pierde (no hay borrador)

### Edicion de item

- **Validacion:** On blur para titulo (campo unico critico). Tags/carpeta/categoria no necesitan validacion on blur.
- **Error inline:** Debajo del campo que falla, color rojo, mensaje especifico
- **Al submit con error:** Focus en primer campo con error + scroll si necesario
- **Success:** Vista de edicion cierra → vuelve a detalle con datos actualizados + toast "Cambios guardados"

### Crear workspace / carpeta

- **Formulario minimo:** Solo nombre (1 campo). No hay razon para mas complejidad.
- **Validacion:** On submit
- **Success:** Dialog cierra → nuevo item aparece en sidebar con highlight breve (background flash)

### Regla global de forms

- **Siempre preservar datos ingresados** en caso de error. Nunca borrar el formulario si falla el submit.
- **Enter = submit** en formularios de un solo campo.
- **Escape = cancelar** en dialogs.

---

## 3. Progressive Disclosure

Nucleo es minimalista por diseno. La disclosure es simple:

| Contexto | Visible por default | Oculto hasta que se necesite |
|----------|--------------------|-----------------------------|
| Card en grid | Titulo, resumen (2 lineas), thumbnail, tipo badge, 3 tags | Tags adicionales ("+N"), contenido completo |
| Vista de detalle | Todo el contenido: titulo, resumen, original, tags, categoria, link | Boton "Editar" (no inline editing) |
| Sidebar | Workspaces, carpetas nivel 1, top 5 tags | Subcarpetas (expandir con ▸), todos los tags ("ver todos") |
| Dialogo de captura | Area de texto + boton guardar | Selector de carpeta (expandible: "Guardar en carpeta...") |
| Filtros (mobile) | Nada visible. Boton "Filtros" | Drawer con todos los filtros (tipo, categoria, tag) |
| Filtros (desktop) | Barra horizontal con chips activos | Dropdown de cada filtro |

**Regla:** El dialogo de captura solo muestra lo esencial: pegar + guardar. La carpeta es opcional y se oculta detras de un link "Guardar en carpeta..." que expande un selector inline.

---

## 4. Error Recovery

### Errores de validacion

- **Donde:** Inline, debajo del campo que falla
- **Color:** Rojo (destructive) con icono de alerta
- **Texto:** Mensaje especifico que dice que esta mal Y como arreglarlo
- **Comportamiento:** Focus en primer campo con error. Datos preservados.
- **Ejemplo:** "El nombre es obligatorio" (no "Error de validacion en campo nombre")

### Errores de red / conexion

- **Donde:** Toast notification en la parte superior
- **Texto:** "Sin conexion. Verifica tu internet e intenta nuevamente."
- **Comportamiento:** La accion se puede reintentar con boton "Reintentar" en el toast
- **No:** No hay queue offline en Fase 1. Si no hay conexion, la accion falla.

### Errores de servidor (Supabase, AI)

- **Donde:** Toast notification para acciones globales. Inline para formularios.
- **Texto:** Mensaje legible, no codigos de error. "No pudimos guardar tu item. Intenta nuevamente."
- **Comportamiento:** Boton "Reintentar" siempre disponible. Datos del formulario preservados.

### Errores de AI pipeline

- **Donde:** Directamente en el card del item
- **Visual:** Badge "Fallido" en rojo + boton "Reintentar" visible en el card
- **Comportamiento:** El item existe y es accesible, pero sin resumen/tags/categoria. El usuario puede editar manualmente o reintentar el AI.

### Item no encontrado (404)

- **Donde:** Pagina completa
- **Texto:** "Este item no existe o fue eliminado."
- **CTA:** "Volver a inicio"

### Regla global de errores

- **Nunca mostrar errores tecnicos** al usuario (no stack traces, no error codes, no "500 Internal Server Error")
- **Siempre dar una accion siguiente** (reintentar, volver, editar manualmente)
- **Nunca perder datos del usuario** por un error del sistema

---

## 5. State Transitions

### Item: Estados de procesamiento

```
[pending] → [processing] → [ready]
                         → [failed] → (retry) → [processing] → [ready]
                                                              → [failed]
```

| Estado | Visual en card | Acciones disponibles |
|--------|---------------|---------------------|
| pending | Skeleton completo | Ninguna (transitorio, < 1s) |
| processing | Skeleton en titulo/resumen/tags, thumbnail placeholder | Ver contenido original |
| ready | Card completo con todos los datos | Copy, editar, eliminar, ver detalle |
| failed | Badge "Fallido" rojo + boton "Reintentar" | Reintentar AI, editar manual, eliminar |

**Transicion visual:** Cuando un card pasa de "processing" a "ready", los skeletons hacen fade out y los datos reales hacen fade in (300ms). No hay recarga de pagina.

### Workspace: Cambio de contexto

```
Tap en workspace → Grid hace fade out (100ms) → Grid carga nuevos items (fade in 200ms)
```
No hay pagina intermedia ni loading page. El cambio es visual e inmediato con los datos en cache.

### Sidebar: Carpetas colapsables

```
Tap en ▸ → Subcarpetas aparecen con slide down (150ms)
Tap en ▾ → Subcarpetas desaparecen con slide up (150ms)
```
El estado de colapso se mantiene durante la sesion. Al recargar, todas las carpetas inician colapsadas excepto la ruta activa.

### Filtros: Aplicar/remover

```
Tap en filtro → Grid se filtra instantaneamente (< 100ms local, < 500ms con query)
Tap en chip "x" → Filtro se remueve → Grid se actualiza
```
Los filtros activos se muestran como chips encima del grid. Cada chip tiene "x" para remover.
