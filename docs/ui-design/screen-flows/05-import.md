# Screen Flow — Bulk Import

> **Epic:** 7 — Import (P1 — post-MVP pero diseñado ahora)
> **Stories:** US-027 (CSV template), US-028 (CSV import), US-029 (Bookmarks HTML)
> **Entry point:** Sidebar → "📥 Importar" → `/w/:id/import`

---

## UI Requirements extraídos

| Story | Pantalla | Datos | Acciones |
|-------|----------|-------|----------|
| US-027 | Import landing | descripción + button | Descargar template CSV |
| US-028 | CSV upload flow | file + preview + progress | Upload, confirm, import |
| US-029 | Bookmarks HTML flow | file + tree preview | Upload, map folders, import |

---

## Flow Diagram

```
[Sidebar → Importar]
       │
       ▼
[/w/:id/import — Landing]
       │
       ├─ "Descargar plantilla" ─→ download nucleo-import-template.csv
       │
       ├─ "Importar CSV" ─────────┐
       │                          ▼
       │                [Upload CSV]
       │                          │
       │                [Preview (5 rows)]
       │                          │
       │                [Confirm → Importing…]
       │                          │
       │                [Progress X de Y]
       │                          │
       │                [Summary: X ok, Y failed]
       │
       └─ "Importar bookmarks" ───┐
                                  ▼
                        [Upload HTML]
                                  │
                        [Parse + Preview (10 bookmarks + folder tree)]
                                  │
                        [Map folders → Nucleo folders]
                                  │
                        [Confirm → Importing…]
                                  │
                        [Summary]
```

---

## Pantalla 1 · Import Landing (`/w/:id/import`)

**Entry from:** Sidebar "📥 Importar" o settings
**Story refs:** US-027, US-028, US-029

### Layout

```
┌─────────────────────────────────────┐
│ Importar contenido                  │
│                                     │
│ Trae tu contenido existente a       │
│ Nucleo. Los items importados se     │
│ procesan con IA igual que los       │
│ capturados manualmente.             │
│                                     │
│ ───────────────────────────────     │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📄 Importar CSV                 │ │
│ │                                 │ │
│ │ Sube un archivo CSV con tus     │ │
│ │ items. Ideal si tienes una      │ │
│ │ base en Notion, Airtable, etc.  │ │
│ │                                 │ │
│ │ [ Descargar plantilla ]         │ │
│ │ [ Subir CSV ]                   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🔖 Importar bookmarks           │ │
│ │                                 │ │
│ │ Sube el archivo HTML exportado  │ │
│ │ de tu navegador (Chrome, Safari,│ │
│ │ Firefox). Se mapean las         │ │
│ │ carpetas.                       │ │
│ │                                 │ │
│ │ [ Ver instrucciones ]           │ │
│ │ [ Subir bookmarks ]             │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Actions

| Acción | Control | Resultado |
|--------|---------|-----------|
| Descargar plantilla | Button outline | Download `nucleo-import-template.csv` (generado client-side) |
| Ver instrucciones bookmarks | Button link | Expande accordion con pasos por navegador |
| Subir CSV | Button primary | Abre file picker / drop zone |
| Subir bookmarks | Button primary | Abre file picker / drop zone |

### Contenido de la plantilla CSV

```csv
# Plantilla de import para Nucleo. Llena las filas y sube a Importar.
# Columnas: titulo (opcional), url (opcional), contenido (requerido), tipo (link/text/markdown/command), categoria (opcional), tags (opcional, separados por coma), carpeta (opcional, ruta con >)
titulo,url,contenido,tipo,categoria,tags,carpeta
Next.js docs,https://nextjs.org/docs,https://nextjs.org/docs,link,development,"next-js,docs",Learning > Frameworks
Mi nota,,Idea rápida sobre RLS en Supabase,text,development,"rls,supabase",
```

La primera fila son los headers; las dos siguientes son ejemplos comentados (prefijo `#`).

### Instrucciones bookmarks (accordion)

```
Chrome
1. Abre Chrome → Bookmarks → Bookmark Manager
2. Click en ⋮ (esquina superior derecha)
3. Export bookmarks → guarda el .html

Safari
1. Safari → File → Export Bookmarks
2. Guarda el .html

Firefox
1. Bookmarks → Manage Bookmarks
2. Import and Backup → Export Bookmarks to HTML
```

---

## Pantalla 2 · CSV Upload & Preview

**Entry from:** "Subir CSV" en landing
**Story refs:** US-028

### Layout — Empty state (drop zone)

```
┌─────────────────────────────────┐
│ [← Volver]                      │
│                                 │
│ Importar CSV                    │
│                                 │
│ ┌─────────────────────────────┐ │
│ │                             │ │
│ │        📄                   │ │
│ │                             │ │
│ │  Arrastra tu CSV aquí       │ │
│ │  o [ Seleccionar archivo ]  │ │
│ │                             │ │
│ │  Max 5 MB                   │ │
│ │                             │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### Layout — Preview state

```
┌─────────────────────────────────────┐
│ [← Volver]                          │
│                                     │
│ Preview · nucleo-import.csv         │
│ 142 filas detectadas                │
│                                     │
│ Mostrando las primeras 5:           │
│                                     │
│ ┌───────────────────────────────┐  │
│ │ Título     Tipo  Tags  Folder │  │
│ ├───────────────────────────────┤  │
│ │ Next docs  link  n,d   Learn  │  │
│ │ Mi nota    text  s,r   —      │  │
│ │ git clean  cmd   g,sh  DevOps │  │
│ │ RLS post   md    s,r   —      │  │
│ │ Tailwind   link  tw,css Learn │  │
│ └───────────────────────────────┘  │
│                                     │
│ ⚠️ 3 filas tienen warnings:          │
│    · Fila 12: sin contenido (se     │
│      saltará)                       │
│    · Fila 45: URL inválida          │
│    · Fila 89: folder inexistente    │
│      (se creará)                    │
│                                     │
│ [ Cancelar ]  [ Importar 139 items ]│
└─────────────────────────────────────┘
```

### Actions

| Acción | Control | Resultado |
|--------|---------|-----------|
| Drop file | Drop zone | Parse CSV → transición a preview |
| Seleccionar archivo | Input file | Igual que drop |
| Cancelar | Button | Vuelve a landing |
| Confirmar import | Button primary | Transición a import progress |

### States

- **Empty:** drop zone visible.
- **Parsing:** "Leyendo archivo..."
- **Error — no CSV:** "Solo se aceptan archivos CSV"
- **Error — columnas faltantes:** "El archivo no tiene el formato correcto. Descarga la plantilla."
- **Error — > 5MB:** "El archivo es demasiado grande. Máximo 5 MB."
- **Preview:** tabla con 5 primeras filas + contador total + warnings.
- **Importing:** ver pantalla 3.

---

## Pantalla 3 · Import Progress & Summary

**Entry from:** Confirmar desde preview (CSV o bookmarks)
**Story refs:** US-028, US-029

### Layout — Progress

```
┌─────────────────────────────────┐
│ Importando…                     │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ████████░░░░░░░░░░░░  45%  │ │
│ └─────────────────────────────┘ │
│                                 │
│ 63 de 139 items creados         │
│                                 │
│ ⚠️ No cierres esta ventana       │
│    hasta que termine.           │
└─────────────────────────────────┘
```

### Layout — Summary (success)

```
┌─────────────────────────────────┐
│ ✅ Importación completada        │
│                                 │
│ 136 items importados            │
│ 3 filas fallaron                │
│                                 │
│ Los items se están procesando   │
│ con IA en background. Puedes    │
│ volver a tu workspace mientras  │
│ tanto.                          │
│                                 │
│ [Ver filas fallidas]            │ ← accordion
│                                 │
│ [ Volver al workspace ]         │
└─────────────────────────────────┘
```

### Accordion "Ver filas fallidas"

```
Fila 12: "Mi nota" — sin contenido, se saltó
Fila 45: "Link roto" — URL inválida: "htp://foo"
Fila 89: "Docs" — error al crear folder padre
```

### Actions

| Acción | Control | Resultado |
|--------|---------|-----------|
| Ver fallidas | Accordion trigger | Expande lista detallada |
| Volver | Button primary | Navega a `/w/:id` |

### States

- **Importing:** barra + contador actualizándose.
- **Partial failures:** summary muestra ambos counts + accordion.
- **Completo sin fallas:** "✅ Importación completada. 139 items importados."
- **Interrumpido (conexión):** "La importación se interrumpió. 63 items ya fueron creados. [ Reanudar ] [ Cancelar ]"
- **Error fatal inicial:** "No pudimos iniciar la importación. Intenta nuevamente."

### Backend notes (referenciado desde TECH-SPEC)

- Implementación: Server Action recibe el archivo en chunks (o full si < 5MB), parsea con `papaparse`, crea items en lotes de 20 por transacción.
- Cada item creado dispara el AI pipeline en background (`after()`).
- Progress se reporta via polling a `/api/imports/:importId` o via Supabase Realtime a una tabla `imports` con `progress` column.

---

## Pantalla 4 · Bookmarks Upload & Map

**Entry from:** "Subir bookmarks" en landing
**Story refs:** US-029

### Layout — Drop zone

Idéntica a CSV drop zone pero acepta `.html`.

### Layout — Preview

```
┌─────────────────────────────────────┐
│ [← Volver]                          │
│                                     │
│ Preview · bookmarks.html            │
│ 248 bookmarks · 12 carpetas         │
│                                     │
│ ESTRUCTURA DE CARPETAS              │
│ ┌───────────────────────────────┐  │
│ │ ▾ 📁 Bookmarks bar             │  │
│ │   ▾ 📁 Dev (45)                │  │
│ │     📁 React (12)              │  │
│ │     📁 Vue (8)                 │  │
│ │   ▾ 📁 Design (23)             │  │
│ │   📁 Tools (67)                │  │
│ │ ▾ 📁 Other bookmarks (93)      │  │
│ └───────────────────────────────┘  │
│                                     │
│ PRIMEROS 10 BOOKMARKS               │
│ 🔗 React Hooks docs                 │
│ 🔗 Tailwind cheatsheet              │
│ 🔗 Figma community                  │
│ …                                   │
│                                     │
│ ⚠️ Notas:                            │
│ · Carpetas con > 3 niveles se       │
│   aplanan al nivel 3                │
│ · Separadores e ítems vacíos se     │
│   ignoran                           │
│                                     │
│ [ Cancelar ]  [ Importar 248 ]      │
└─────────────────────────────────────┘
```

### Actions

| Acción | Resultado |
|--------|-----------|
| Preview | Parse HTML con `DOMParser`, extraer `<DT><A HREF>` y `<DT><H3>` |
| Confirmar | Crea folders primero (respetando max depth 3), luego items tipo `link` |
| Cancelar | Vuelve a landing |

### Flattening rules

Si el HTML de bookmarks tiene `Dev > React > Hooks > Advanced`, en Nucleo se crea:
- `Dev > React > Hooks` (nivel 3)
- "Advanced" se concatena al nombre: `Dev > React > Hooks-Advanced` O los items quedan en `Hooks` directamente (decisión: aplanar al padre más cercano válido).

---

## Acceptance Targets

### Landing
- [ ] `/w/:id/import` accesible desde sidebar "Importar".
- [ ] Botón "Descargar plantilla" dispara descarga con nombre `nucleo-import-template.csv`.
- [ ] El CSV descargado contiene headers exactos: `titulo,url,contenido,tipo,categoria,tags,carpeta`.
- [ ] Accordion de instrucciones de bookmarks visible y expandible.

### CSV Flow
- [ ] Drop zone acepta solo `.csv`. Otros formatos → mensaje de error.
- [ ] Archivo > 5MB → error inline.
- [ ] Preview muestra 5 primeras filas con headers correctos.
- [ ] Warnings por fila problemática visibles antes de confirmar.
- [ ] Confirmar transiciona a pantalla de progress.
- [ ] Progress bar refleja % real actualizado (polling o realtime).
- [ ] Contador "X de Y" visible.
- [ ] Al terminar, summary muestra counts correctos.
- [ ] Cada item creado entra al AI pipeline (status=processing en DB).
- [ ] Filas con `contenido` vacío se saltan sin abortar.
- [ ] Filas con `tipo` inválido → error específico en summary.
- [ ] Folders en el CSV se crean si no existen (respetando max 3 niveles).

### Bookmarks Flow
- [ ] Acepta `.html` exportado de Chrome/Safari/Firefox.
- [ ] Preview muestra árbol de folders del export.
- [ ] Counters correctos de bookmarks por folder.
- [ ] Confirmar crea folders primero, luego items tipo `link`.
- [ ] Folders > 3 niveles se aplanan siguiendo la regla definida.
- [ ] Items se procesan por AI en background.

### Progress & Summary
- [ ] Durante import, cerrar la ventana muestra confirm "La importación sigue en background. ¿Salir?"
- [ ] Si el usuario sale, el import continúa (server-side) y puede volver para ver progress.
- [ ] Summary con fallas muestra accordion expandible con detalles por fila.
- [ ] Botón "Volver al workspace" navega a `/w/:id` con el grid ya mostrando los nuevos items (aunque aún estén en processing).

---

## Notas para el Skill #8 (UI)

- **Import es P1.** Puede quedarse en el UI sin backend funcional en Fase 1.
- **Preview client-side:** parseo del CSV (con `papaparse`) o HTML (`DOMParser`) ocurre en el browser. Solo se envía al server si el user confirma.
- **Progress tracking:** preferir Supabase Realtime sobre una tabla `import_jobs` con `progress_percent`, `created_count`, `failed_count`. Más robusto que polling.
- **Background processing:** cada item importado debe entrar al AI pipeline en lotes (ej: grupos de 5) para no saturar OpenRouter.
- **Reanudabilidad:** en Fase 2, guardar el state del import en DB para reanudar si el usuario recarga.
- **Drag & drop:** usar `react-dropzone` o implementación simple con `onDragOver`/`onDrop`.
- **Bookmarks aplanamiento:** documentar claramente en el preview qué va a pasar con carpetas profundas antes de que el usuario confirme.
