# Nucleo — Information Architecture

> **Fecha**: 2026-04-01
> **Patron de navegacion**: Sidebar (drawer en mobile) + FAB
> **Profundidad maxima**: 3 niveles

---

## Patron de Navegacion Elegido

**Sidebar + FAB (Floating Action Button)**

Razon: El usuario necesita navegar por workspaces, carpetas anidadas (3 niveles) y tags. Eso requiere una estructura de arbol que solo un sidebar resuelve bien. En mobile, el sidebar se convierte en drawer (hamburger o swipe). El FAB "+" es el punto de captura — siempre accesible, 1 tap.

**Descartados:**
- Bottom Nav: No tiene suficiente espacio para mostrar la jerarquia de carpetas. Limita a 3-5 items planos.
- Top Nav: No escala con carpetas anidadas ni tags. Es para apps con pocas secciones fijas.

---

## Site Map

```
Nucleo
│
├── /login                          ← Publico
├── /register                       ← Publico
│
└── /(main)/                        ← Requiere auth
    │
    ├── / (Home)                    ← Grid de items del workspace activo
    │   ├── Filtros: tipo, categoria, tag
    │   └── Vista: cards responsivas
    │
    ├── /search                     ← Resultados de busqueda global
    │   └── Filtros combinados
    │
    ├── /workspace/[id]             ← Vista de workspace especifico
    │   └── /folder/[folderId]      ← Vista filtrada por carpeta
    │
    ├── /item/[id]                  ← Detalle de item
    │   ├── Ver contenido completo
    │   ├── Editar (titulo, tags, categoria, carpeta)
    │   └── Eliminar
    │
    └── /import                     ← Bulk import (CSV, bookmarks)
        ├── CSV upload
        └── Bookmarks upload
```

---

## Jerarquia de Navegacion

### Nivel 1: Shell de la App

```
┌─────────────────────────────────────────┐
│ [≡]  Workspace: Personal  ▾    [🔍] [👤]│  ← Top bar
├─────────────────────────────────────────┤
│                                         │
│           Contenido principal           │
│          (grid, search, detail)         │
│                                         │
│                                         │
│                                         │
│                                    [+]  │  ← FAB
└─────────────────────────────────────────┘
```

**Top bar (siempre visible):**
- Izquierda: Hamburger menu (≡) → abre sidebar drawer
- Centro: Workspace selector (dropdown) → cambiar workspace
- Derecha: Search icon (🔍) → expande search bar o navega a /search
- Derecha: Profile/settings (👤)

**FAB (siempre visible):**
- Boton "+" flotante en esquina inferior derecha
- Tap → abre dialogo de captura
- Es la accion mas importante de la app, siempre a 1 tap

### Nivel 2: Sidebar Drawer

```
┌──────────────────────┐
│  NUCLEO               │
│                       │
│  WORKSPACES           │
│  ● Personal          │  ← Activo
│  ○ Trabajo            │
│  ○ Side Projects      │
│  + Crear workspace    │
│                       │
│  ─────────────────    │
│                       │
│  CARPETAS             │
│  ▾ Claude Code        │
│    ├── Comandos       │
│    ├── Prompts        │
│    └── Patrones       │
│  ▸ React              │
│  ▸ IA                 │
│  + Nueva carpeta      │
│                       │
│  ─────────────────    │
│                       │
│  CATEGORIAS           │
│  ■ Development (24)   │
│  ■ AI (18)            │
│  ■ Design (7)         │
│  ■ Business (3)       │
│                       │
│  ─────────────────    │
│                       │
│  TAGS                 │
│  claude-code (12)     │
│  react (8)            │
│  prompts (6)          │
│  nextjs (5)           │
│  supabase (4)         │
│  ...ver todos         │
│                       │
│  ─────────────────    │
│  ⚙ Configuracion     │
│  📥 Importar          │
└──────────────────────┘
```

**Seccion Workspaces:** Lista de workspaces con indicador activo. Tap = cambiar workspace.
**Seccion Carpetas:** Arbol colapsable. Tap en carpeta = filtra grid. Max 3 niveles visibles con indentacion.
**Seccion Categorias:** Lista con color badge y conteo. Tap = filtra grid.
**Seccion Tags:** Top tags por frecuencia con conteo. "Ver todos" expande la lista completa. Tap = filtra grid.

### Nivel 3: Contenido

Dentro de cada vista principal:

| Vista | Contenido | Interacciones |
|-------|-----------|---------------|
| Home / Grid | Cards de items del workspace activo | Scroll infinito, tap = detalle |
| Search | Search bar + resultados + filtros | Escribir → resultados live |
| Folder view | Cards filtradas por carpeta | Breadcrumb para navegar niveles |
| Item detail | Contenido completo del item | Copy, editar, eliminar |
| Import | Upload area + preview + confirm | Drag & drop o file picker |

---

## Vocabulario de Navegacion

Derivado del lenguaje natural del usuario (como piensa sobre su contenido):

| Concepto del usuario | Label en UI | NO usar |
|---------------------|-------------|---------|
| Donde guardo las cosas | Workspace | Proyecto, Espacio, Coleccion |
| Subcategorias por tema | Carpeta | Directorio, Grupo, Seccion |
| Etiquetas descriptivas | Tag | Label, Keyword, Marca |
| Tipo de contenido | Tipo | Formato, Clase |
| Lo que guarde | Item | Recurso, Nota, Entrada, Registro |
| Lo que la IA me dice | Resumen | Analisis, Descripcion, Abstracto |
| Agrupacion tematica | Categoria | Clasificacion, Grupo |

---

## Flujos de Navegacion Principales

### Flujo 1: Captura rapida (el mas frecuente)

```
Cualquier pantalla → Tap [+] → Pegar contenido → Tap "Guardar" → Vuelve a donde estaba
```
3 taps. El dialogo de captura es un overlay — no navega a otra pagina.

### Flujo 2: Buscar algo

```
Cualquier pantalla → Tap [🔍] → Escribir query → Ver resultados → Tap item → Detalle
```
Search es modal: se superpone al contenido actual. Resultados aparecen live.

### Flujo 3: Explorar por carpeta

```
Tap [≡] → Sidebar → Tap carpeta → Grid filtrado → Tap subcarpeta (breadcrumb) → Grid refinado
```

### Flujo 4: Organizar un item

```
Grid → Tap item → Detalle → Tap "Editar" → Cambiar carpeta/tags/categoria → Guardar → Detalle actualizado
```

---

## Responsive Behavior

| Breakpoint | Sidebar | Grid | FAB | Search |
|-----------|---------|------|-----|--------|
| Mobile (< 768px) | Drawer (hamburger) | 1 columna | Flotante bottom-right | Expande desde icono |
| Tablet (768-1024px) | Drawer (hamburger) | 2 columnas | Flotante bottom-right | Barra visible |
| Desktop (> 1024px) | Fijo a la izquierda | 3-4 columnas | Flotante bottom-right | Barra visible en top bar |

**Mobile-first:** Todo se disena para 1 columna primero. Desktop agrega sidebar fijo y mas columnas.

---

## Principios de IA

1. **Flat is fast.** Maximo 3 niveles de profundidad en cualquier flujo. Si llegas a 4, redisena.
2. **El "+" siempre visible.** La captura es la accion #1 — nunca debe estar a mas de 1 tap.
3. **Workspace como contexto, no como destino.** El workspace se selecciona una vez y todo filtra automaticamente. No es una pagina a la que "vas".
4. **Search > browse.** El KPI es encontrar en < 5s. Search es el atajo principal, la navegacion por sidebar es el alternativo.
5. **No ocultar informacion util.** Tags, categorias y tipo de contenido siempre visibles en los cards. No esconder detras de hovers o clicks.
