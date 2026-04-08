# Nucleo — User Stories

> **Version**: 1.0
> **Estado**: BORRADOR
> **Fecha**: 2026-04-01
> **PDR**: PDR-nucleo.md
> **Tech Spec**: TECH-SPEC-nucleo.md
> **Total Stories**: 31 (P0: 28 | P1: 3)

---

## User Journey Map

```
[Registro] → [Login] → [Seleccionar Workspace] → [Capturar Contenido] → [AI Procesa]
                                                         │
                                                         ▼
                                                  [Ver Items Grid]
                                                         │
                                    ┌────────────────────┼────────────────────┐
                                    ▼                    ▼                    ▼
                             [Organizar]           [Buscar]             [Ver Detalle]
                          Folders / Tags        Search Global         Copy / Editar
                          Categorias            Filtros
                                                         │
                                                         ▼
                                                  [Bulk Import]
                                               CSV / Bookmarks
```

## Resumen de Epics

| Epic | Stories | Prioridad | Descripcion |
|------|---------|-----------|-------------|
| Epic 1: Auth | US-001 a US-004 | P0 | Registro, login, logout, proteccion de rutas |
| Epic 2: Workspaces | US-005 a US-008 | P0 | CRUD de workspaces, selector, limite de 5 |
| Epic 3: Captura | US-009 a US-013 | P0 | Pegar contenido, deteccion de tipo, AI async |
| Epic 4: Items | US-014 a US-018 | P0 | Grid, detalle, copy, editar, eliminar |
| Epic 5: Organizacion | US-019 a US-023 | P0 | Folders anidados, tags, categorias, mover items |
| Epic 6: Busqueda | US-024 a US-026 | P0 | Search global, filtros, resultados |
| Epic 7: Import | US-027 a US-029 | P1 | CSV template, CSV import, bookmark import |
| Epic 8: PWA | US-030 a US-031 | P0 | App instalable, cache del shell |

---

## Epic 1: Auth

> Registro, autenticacion y proteccion de rutas. Single-user, email + password via Supabase Auth.

### US-001: Registro de cuenta

**Como** power user
**Quiero** crear una cuenta con email y password
**Para** tener acceso seguro a mi base de conocimiento desde cualquier dispositivo

**Acceptance Criteria:**

Funcionalidad:
- [ ] Formulario con campos: email y password
- [ ] Al registrarse, se crean automaticamente 2 workspaces: "Personal" y "Trabajo"
- [ ] Despues del registro exitoso, redirect a la vista principal con workspace "Personal" seleccionado

Validaciones:
- [ ] Email valida formato user@domain.com. Si invalido: "Ingresa un email valido"
- [ ] Password minimo 8 caracteres. Si menor: "La contrasena debe tener al menos 8 caracteres"
- [ ] Si el email ya esta registrado: "Ya existe una cuenta con este email"

Error Handling:
- [ ] Si Supabase Auth falla: "No pudimos crear tu cuenta. Intenta nuevamente."

UX:
- [ ] Boton de submit muestra loading spinner mientras procesa
- [ ] Password tiene toggle de visibilidad (ojo abierto/cerrado)
- [ ] Link a login: "Ya tienes cuenta? Inicia sesion"

**Prioridad:** P0
**Estimacion:** S
**Dependencias:** Ninguna

---

### US-002: Login

**Como** power user
**Quiero** iniciar sesion con mi email y password
**Para** acceder a mi base de conocimiento

**Acceptance Criteria:**

Funcionalidad:
- [ ] Formulario con campos: email y password
- [ ] Login exitoso redirect a la vista principal con el ultimo workspace usado
- [ ] La sesion persiste entre recargas de pagina (cookie httpOnly)

Validaciones:
- [ ] Si credenciales incorrectas: "Email o contrasena incorrectos"
- [ ] Campos vacios: "Este campo es obligatorio"

Error Handling:
- [ ] Si Supabase Auth esta caido: "Servicio temporalmente no disponible. Intenta en unos minutos."

UX:
- [ ] Boton de submit muestra loading spinner mientras procesa
- [ ] Password tiene toggle de visibilidad
- [ ] Link a registro: "No tienes cuenta? Registrate"
- [ ] Funciona correctamente en iPhone (teclado no tapa campos)

**Prioridad:** P0
**Estimacion:** S
**Dependencias:** US-001

---

### US-003: Logout

**Como** power user
**Quiero** cerrar mi sesion
**Para** proteger mi cuenta en dispositivos compartidos

**Acceptance Criteria:**

Funcionalidad:
- [ ] Opcion de logout accesible desde el menu principal
- [ ] Al cerrar sesion, redirect a /login
- [ ] La sesion se invalida completamente (cookie eliminada)
- [ ] No se puede acceder a rutas protegidas despues del logout sin re-autenticarse

UX:
- [ ] Confirmacion antes de cerrar sesion: "Seguro que quieres cerrar sesion?"

**Prioridad:** P0
**Estimacion:** S
**Dependencias:** US-002

---

### US-004: Proteccion de rutas

**Como** power user
**Quiero** que mis datos esten protegidos si alguien accede a la URL directamente
**Para** que nadie sin sesion activa pueda ver mi contenido

**Acceptance Criteria:**

Funcionalidad:
- [ ] Todas las rutas bajo /(main)/* requieren sesion activa
- [ ] Si no hay sesion, redirect a /login
- [ ] Si la sesion expira mientras navega, redirect a /login al siguiente request
- [ ] /login y /register son accesibles sin sesion (redirect a / si ya esta autenticado)

**Prioridad:** P0
**Estimacion:** S
**Dependencias:** US-002
**Notas tecnicas:** Implementar en middleware de Next.js con @supabase/ssr. RLS en Supabase protege datos a nivel DB.

---

## Epic 2: Workspaces

> Espacios de trabajo para separar contenido (Personal, Trabajo, custom). Max 5.

### US-005: Seleccionar workspace

**Como** power user
**Quiero** cambiar entre mis workspaces rapidamente
**Para** ver solo el contenido relevante al contexto en el que estoy (personal vs trabajo)

**Acceptance Criteria:**

Funcionalidad:
- [ ] Selector de workspace visible en la barra superior o sidebar
- [ ] Al seleccionar un workspace, la vista se actualiza mostrando solo sus items, carpetas y tags
- [ ] El workspace seleccionado persiste entre sesiones (se recuerda al volver)
- [ ] Los 2 workspaces default ("Personal" y "Trabajo") estan disponibles desde el primer login

UX:
- [ ] El workspace activo se muestra claramente con nombre visible
- [ ] Cambiar de workspace es instantaneo (< 300ms de respuesta visual)
- [ ] En mobile, el selector es accesible con un solo tap

**Prioridad:** P0
**Estimacion:** S
**Dependencias:** US-001

---

### US-006: Crear workspace

**Como** power user
**Quiero** crear workspaces adicionales
**Para** organizar mi contenido en contextos separados mas alla de Personal y Trabajo

**Acceptance Criteria:**

Funcionalidad:
- [ ] Opcion "Crear workspace" en el selector de workspaces
- [ ] Formulario con campo: nombre (obligatorio) e icono (opcional, default "briefcase")
- [ ] El nuevo workspace aparece en el selector inmediatamente despues de crearse

Validaciones:
- [ ] Nombre obligatorio, max 30 caracteres. Si vacio: "El nombre es obligatorio"
- [ ] Si ya tiene 5 workspaces: "Maximo 5 workspaces. Elimina uno para crear otro."
- [ ] Nombre duplicado: "Ya tienes un workspace con ese nombre"

UX:
- [ ] Dialog/modal limpio con formulario minimo
- [ ] Al crear, el nuevo workspace se selecciona automaticamente

**Prioridad:** P0
**Estimacion:** S
**Dependencias:** US-005

---

### US-007: Editar workspace

**Como** power user
**Quiero** editar el nombre e icono de un workspace
**Para** mantener mi organizacion actualizada si cambia el contexto

**Acceptance Criteria:**

Funcionalidad:
- [ ] Opcion "Editar" accesible desde el menu del workspace (tres puntos o long press)
- [ ] Puede cambiar nombre e icono
- [ ] Los cambios se reflejan inmediatamente en el selector

Validaciones:
- [ ] Mismas reglas que US-006 (nombre obligatorio, max 30, no duplicado)

**Prioridad:** P0
**Estimacion:** S
**Dependencias:** US-006

---

### US-008: Eliminar workspace

**Como** power user
**Quiero** eliminar un workspace que ya no necesito
**Para** mantener limpia mi lista de workspaces

**Acceptance Criteria:**

Funcionalidad:
- [ ] Opcion "Eliminar" accesible desde el menu del workspace
- [ ] Al eliminar, se eliminan todos los items, carpetas, tags y categorias del workspace
- [ ] Despues de eliminar, se selecciona automaticamente otro workspace

Validaciones:
- [ ] No se puede eliminar si es el unico workspace restante: "Necesitas al menos un workspace"
- [ ] Confirmacion obligatoria: "Eliminar [nombre]? Se perderan todos los items, carpetas y tags. Esta accion no se puede deshacer."

Error Handling:
- [ ] Si la eliminacion falla: "No pudimos eliminar el workspace. Intenta nuevamente."

**Prioridad:** P0
**Estimacion:** S
**Dependencias:** US-006

---

## Epic 3: Captura de Contenido

> El corazon de Nucleo: pegar cualquier contenido y que la IA lo procese automaticamente.

### US-009: Capturar un link

**Como** power user
**Quiero** pegar una URL y que se guarde automaticamente en mi workspace activo
**Para** no perder ningun recurso que encuentre mientras navego en mi celular

**Acceptance Criteria:**

Funcionalidad:
- [ ] Boton "+" prominente y accesible en la vista principal
- [ ] Al tap en "+", se abre un dialogo con area de texto para pegar
- [ ] Al pegar una URL, el sistema la detecta automaticamente como tipo "link"
- [ ] El item se guarda inmediatamente con status "procesando"
- [ ] Opcion de seleccionar carpeta destino antes de guardar (opcional, default: sin carpeta)
- [ ] El dialogo se cierra despues de guardar y el item aparece en el grid

Validaciones:
- [ ] URL debe ser un formato valido (http:// o https://). Si invalido: "Ingresa una URL valida"

Error Handling:
- [ ] Si no hay conexion: "Sin conexion. El item se guardara cuando vuelvas a estar online." (Fase 1: mostrar error. Fase 2: queue offline)
- [ ] Si Supabase falla: "No pudimos guardar. Intenta nuevamente."

UX:
- [ ] El flujo completo es: tap "+" → pegar → tap "Guardar" → listo. Maximo 3 taps.
- [ ] El area de texto tiene autofocus al abrir
- [ ] En iPhone, la interfaz no se rompe con el teclado virtual

**Prioridad:** P0
**Estimacion:** M
**Dependencias:** US-005
**Notas tecnicas:** Detectar URL con regex. Server Action crea item + after() dispara AI pipeline.

---

### US-010: Capturar texto libre

**Como** power user
**Quiero** pegar o escribir una nota rapida de texto
**Para** guardar ideas, fragmentos o informacion que no viene de un link

**Acceptance Criteria:**

Funcionalidad:
- [ ] El mismo dialogo "+" acepta texto libre (no-URL)
- [ ] El sistema detecta que no es URL y lo clasifica como tipo "text"
- [ ] Se guarda con status "procesando" y la IA genera resumen, tags y categoria

Validaciones:
- [ ] Contenido no puede estar vacio: "Pega o escribe algo para guardar"
- [ ] Max 50,000 caracteres. Si excede: "El contenido es demasiado largo. Maximo 50,000 caracteres."

UX:
- [ ] El area de texto se expande automaticamente con el contenido
- [ ] Placeholder: "Pega un link, texto, markdown o comando..."

**Prioridad:** P0
**Estimacion:** S
**Dependencias:** US-009

---

### US-011: Capturar markdown

**Como** power user
**Quiero** pegar archivos markdown completos (investigaciones de OpenClaw, Perplexity)
**Para** centralizar mis investigaciones en un solo lugar y poder buscarlas despues

**Acceptance Criteria:**

Funcionalidad:
- [ ] El sistema detecta sintaxis markdown (headers #, listas, code blocks, etc.)
- [ ] Se clasifica como tipo "markdown"
- [ ] La IA genera resumen del documento completo aunque sea largo
- [ ] En la vista de detalle, el markdown se renderiza con formato (headers, bold, code, listas)

UX:
- [ ] El preview del contenido en el grid muestra las primeras lineas con formato basico
- [ ] Documentos largos no bloquean la UI — la IA los procesa en background

**Prioridad:** P0
**Estimacion:** S
**Dependencias:** US-009
**Notas tecnicas:** Deteccion de markdown: presencia de # headers, ```, **, -, [] patterns. Limite del AI: si el contenido excede el context window, truncar para el resumen.

---

### US-012: Capturar comando o prompt

**Como** power user
**Quiero** guardar comandos de Claude Code, prompts reutilizables o snippets de codigo
**Para** poder copiarlos con un click cuando los necesite sin buscar en historiales

**Acceptance Criteria:**

Funcionalidad:
- [ ] El sistema detecta patrones de comando ($, /, git, npm, npx, sudo, curl, etc.) o el usuario marca manualmente como "command"
- [ ] Se clasifica como tipo "command"
- [ ] Los commands/prompts se muestran con formato monospace y boton de copy prominente
- [ ] La IA genera un titulo descriptivo y tags relevantes

UX:
- [ ] Toggle manual para marcar contenido como "comando" si la auto-deteccion falla
- [ ] En la vista grid, los items tipo command se distinguen visualmente (icono terminal o badge)

**Prioridad:** P0
**Estimacion:** S
**Dependencias:** US-009

---

### US-013: Procesamiento AI asincrono

**Como** power user
**Quiero** que la IA procese mi contenido en background sin hacerme esperar
**Para** poder seguir pegando cosas rapidamente sin bloqueos

**Acceptance Criteria:**

Funcionalidad:
- [ ] Al guardar un item, aparece inmediatamente en el grid con status "procesando"
- [ ] La IA en background: extrae metadata OG (si es link), genera titulo, resumen (< 200 palabras), categoria, y 3-7 tags
- [ ] Si hay OG image disponible, la descarga y usa como thumbnail
- [ ] Si no hay OG image, usa un placeholder segun el tipo de contenido
- [ ] Cuando la IA termina, el card se actualiza automaticamente con los datos generados
- [ ] La IA sugiere una carpeta existente si hay alguna relevante

Validaciones:
- [ ] Si la URL es inaccesible (paywall, 404), la IA trabaja solo con la URL como contexto y marca como "metadata limitada"

Error Handling:
- [ ] Si la IA falla (OpenRouter caido, timeout): status cambia a "fallido" con boton "Reintentar"
- [ ] Si el retry falla 2 veces: se mantiene como "fallido" y el usuario puede editar titulo/tags manualmente

UX:
- [ ] El card en status "procesando" muestra skeleton animado en lugar de titulo, resumen y tags
- [ ] Polling cada 3 segundos hasta que status cambie a "ready" o "failed"
- [ ] Multiples items pueden estar procesandose simultaneamente sin interferencia

**Prioridad:** P0
**Estimacion:** L
**Dependencias:** US-009
**Notas tecnicas:** after() de Next.js 16. OpenRouter con Haiku 4.5. Zod schema para structured output. OG extraction con fetch + cheerio en /api/og. Thumbnails a Supabase Storage, max 200KB.

---

## Epic 4: Items

> Visualizacion, detalle, copia y gestion de items guardados.

### US-014: Ver grid de items

**Como** power user
**Quiero** ver todos mis items del workspace activo en una cuadricula visual
**Para** tener una vista rapida de todo lo que he guardado

**Acceptance Criteria:**

Funcionalidad:
- [ ] Los items se muestran en cards con: thumbnail (o placeholder), titulo, resumen truncado (2 lineas), tags (max 3 visibles + "+N"), tipo de contenido (badge), fecha de creacion
- [ ] Ordenados por fecha de creacion (mas reciente primero)
- [ ] Paginacion por infinite scroll (20 items por pagina)
- [ ] Los items tipo "command" muestran boton de copy directamente en el card

Empty State:
- [ ] Si no hay items: "Tu workspace esta vacio. Toca + para guardar tu primer recurso."

UX:
- [ ] El grid es responsive: 1 columna en mobile, 2-3 en tablet, 3-4 en desktop
- [ ] Thumbnails cargan con lazy loading
- [ ] El grid carga en < 1.5 segundos

**Prioridad:** P0
**Estimacion:** M
**Dependencias:** US-009

---

### US-015: Ver detalle de item

**Como** power user
**Quiero** ver el contenido completo de un item guardado
**Para** leer el resumen, ver los tags, y acceder al contenido original

**Acceptance Criteria:**

Funcionalidad:
- [ ] Vista de detalle muestra: titulo, resumen completo, contenido original (renderizado segun tipo), thumbnail/OG image, categoria, todos los tags, fecha de guardado, link original (si es tipo link, clickeable)
- [ ] Contenido markdown se renderiza con formato completo (headers, listas, code blocks, bold, links)
- [ ] Contenido tipo command se muestra en bloque monospace con boton de copy
- [ ] Links originales se abren en nueva pestana

UX:
- [ ] En mobile, la vista de detalle es full-screen con boton "atras"
- [ ] Scroll suave para contenido largo
- [ ] Boton de acciones rapidas: copy, editar, eliminar

**Prioridad:** P0
**Estimacion:** M
**Dependencias:** US-014

---

### US-016: Copiar contenido con un click

**Como** power user
**Quiero** copiar comandos, prompts o cualquier texto con un solo tap
**Para** pegarlo inmediatamente donde lo necesite sin seleccionar texto manualmente

**Acceptance Criteria:**

Funcionalidad:
- [ ] Boton de copy visible en: card del grid (items tipo command), vista de detalle (todos los tipos), contenido original completo
- [ ] Al tap en copy, el texto se copia al clipboard del dispositivo
- [ ] Feedback visual: el boton cambia momentaneamente a "Copiado" con check icon (1.5 segundos)

Validaciones:
- [ ] Si el clipboard API no esta disponible (navegador antiguo): fallback a seleccionar texto automaticamente

UX:
- [ ] El boton de copy es lo suficientemente grande para tap en mobile (min 44x44px)
- [ ] Para items tipo command: el boton de copy esta en la esquina superior derecha del bloque de codigo

**Prioridad:** P0
**Estimacion:** S
**Dependencias:** US-015

---

### US-017: Editar item

**Como** power user
**Quiero** editar el titulo, categoria, tags y carpeta de un item
**Para** corregir o mejorar la categorizacion que hizo la IA

**Acceptance Criteria:**

Funcionalidad:
- [ ] Desde la vista de detalle, boton "Editar" abre formulario de edicion
- [ ] Campos editables: titulo, categoria (selector de existentes + crear nueva), tags (agregar/quitar), carpeta (selector de arbol de carpetas + opcion "sin carpeta")
- [ ] Guardar actualiza el item inmediatamente
- [ ] El contenido original y el resumen de IA NO son editables (son generados)

Validaciones:
- [ ] Titulo no puede quedar vacio: "El titulo es obligatorio"
- [ ] Max 120 caracteres en titulo

UX:
- [ ] Los tags se editan con input tipo "chip": escribir + Enter para agregar, X para quitar
- [ ] El selector de carpeta muestra el arbol anidado con indentacion visual
- [ ] El formulario se puede cancelar sin guardar cambios

**Prioridad:** P0
**Estimacion:** M
**Dependencias:** US-015

---

### US-018: Eliminar item

**Como** power user
**Quiero** eliminar items que ya no necesito
**Para** mantener mi base de conocimiento limpia y relevante

**Acceptance Criteria:**

Funcionalidad:
- [ ] Opcion "Eliminar" accesible desde: vista de detalle (menu de acciones) y long press / context menu en el card del grid
- [ ] Al eliminar, el item desaparece del grid y se elimina de la DB junto con su thumbnail de Storage
- [ ] Los tags huerfanos (sin items asociados) se mantienen — no se eliminan automaticamente

Validaciones:
- [ ] Confirmacion obligatoria: "Eliminar [titulo]? Esta accion no se puede deshacer."

UX:
- [ ] Despues de eliminar desde detalle, vuelve al grid
- [ ] El card desaparece con animacion suave del grid

**Prioridad:** P0
**Estimacion:** S
**Dependencias:** US-015

---

## Epic 5: Organizacion

> Carpetas anidadas, tags y categorias para mantener el contenido organizado.

### US-019: Crear carpetas

**Como** power user
**Quiero** crear carpetas dentro de mi workspace
**Para** organizar mi contenido por temas o proyectos

**Acceptance Criteria:**

Funcionalidad:
- [ ] Opcion "Nueva carpeta" accesible desde el sidebar/navegacion del workspace
- [ ] Formulario con campo: nombre (obligatorio)
- [ ] La carpeta aparece en el arbol de navegacion inmediatamente
- [ ] Al seleccionar una carpeta, el grid filtra mostrando solo sus items

Empty State:
- [ ] Carpeta vacia: "Esta carpeta esta vacia. Mueve items aqui o captura algo nuevo."

Validaciones:
- [ ] Nombre obligatorio, max 50 caracteres. Si vacio: "El nombre es obligatorio"
- [ ] Nombre duplicado dentro del mismo nivel: "Ya existe una carpeta con ese nombre aqui"

UX:
- [ ] El arbol de carpetas es visible en sidebar (desktop) o en navegacion tipo breadcrumb (mobile)

**Prioridad:** P0
**Estimacion:** M
**Dependencias:** US-005

---

### US-020: Carpetas anidadas

**Como** power user
**Quiero** crear subcarpetas dentro de carpetas (hasta 3 niveles)
**Para** organizar contenido con mas granularidad cuando un tema tiene subtemas

**Acceptance Criteria:**

Funcionalidad:
- [ ] Puedo crear carpetas dentro de otras carpetas
- [ ] Maximo 3 niveles de profundidad (raiz → nivel 1 → nivel 2)
- [ ] El arbol de navegacion refleja la jerarquia con indentacion
- [ ] Breadcrumb muestra la ruta: Workspace > Carpeta > Subcarpeta > Sub-subcarpeta

Validaciones:
- [ ] Si intenta crear un 4to nivel: "Maximo 3 niveles de carpetas. Reorganiza tu contenido o usa tags para mas granularidad."

UX:
- [ ] Las carpetas son colapsables en el arbol del sidebar
- [ ] En mobile, la navegacion es por breadcrumb (tap para ir a nivel superior)

**Prioridad:** P0
**Estimacion:** M
**Dependencias:** US-019
**Notas tecnicas:** Campo depth en tabla folders con CHECK constraint <= 2 (0-indexed). Calcular depth en Server Action basado en parent_id.

---

### US-021: Mover items entre carpetas

**Como** power user
**Quiero** mover un item de una carpeta a otra o sacarlo de una carpeta
**Para** reorganizar mi contenido cuando la categorizacion inicial no fue la correcta

**Acceptance Criteria:**

Funcionalidad:
- [ ] Desde la vista de detalle o edicion, puedo cambiar la carpeta del item
- [ ] Selector muestra arbol de carpetas completo del workspace activo
- [ ] Opcion "Sin carpeta" para sacar un item de cualquier carpeta
- [ ] El movimiento es inmediato — el item desaparece de la carpeta anterior y aparece en la nueva

UX:
- [ ] El selector de carpeta muestra el arbol con indentacion visual para los 3 niveles

**Prioridad:** P0
**Estimacion:** S
**Dependencias:** US-019, US-017

---

### US-022: Gestionar tags

**Como** power user
**Quiero** ver, crear y editar tags en mi workspace
**Para** tener un sistema de etiquetado consistente que me ayude a encontrar cosas

**Acceptance Criteria:**

Funcionalidad:
- [ ] Los tags generados por IA son sugerencias — los puedo editar o eliminar del item
- [ ] Puedo crear tags nuevos al editar un item (escribir nombre que no existe + Enter lo crea)
- [ ] La navegacion lateral muestra los tags del workspace con conteo de items
- [ ] Al tap en un tag, el grid filtra mostrando solo items con ese tag

Validaciones:
- [ ] Tag max 30 caracteres, solo minusculas y guiones
- [ ] Si un tag ya existe, se reutiliza (no se duplica)

UX:
- [ ] Tags se muestran como chips/badges de color
- [ ] La lista de tags en el sidebar se ordena por frecuencia de uso (mas items primero)

**Prioridad:** P0
**Estimacion:** M
**Dependencias:** US-013, US-017

---

### US-023: Gestionar categorias

**Como** power user
**Quiero** ver y filtrar por categorias
**Para** encontrar contenido agrupado por tema amplio (development, design, ai, etc.)

**Acceptance Criteria:**

Funcionalidad:
- [ ] La IA asigna una categoria automaticamente al procesar (development, design, ai, business, productivity, learning, reference, other)
- [ ] Puedo cambiar la categoria de un item desde la vista de edicion
- [ ] Puedo crear categorias custom con nombre y color
- [ ] Filtro por categoria disponible en la vista principal (dropdown o tabs)
- [ ] Las categorias son por workspace (no globales)

UX:
- [ ] Cada categoria tiene un color distintivo que se muestra como badge en los cards
- [ ] El filtro de categoria se puede combinar con tags y tipo de contenido

**Prioridad:** P0
**Estimacion:** M
**Dependencias:** US-013, US-017

---

## Epic 6: Busqueda Global

> Full-text search para encontrar cualquier cosa en < 5 segundos.

### US-024: Search bar global

**Como** power user
**Quiero** una barra de busqueda siempre accesible
**Para** encontrar cualquier item guardado en menos de 5 segundos

**Acceptance Criteria:**

Funcionalidad:
- [ ] Search bar visible en la parte superior de la vista principal (siempre accesible)
- [ ] Busca en: titulos, resumenes, tags, categorias y contenido original
- [ ] Resultados aparecen mientras escribo (debounce 300ms)
- [ ] Busqueda fuzzy — encuentra resultados aunque haya typos menores
- [ ] La busqueda se ejecuta dentro del workspace activo

Empty State:
- [ ] Sin resultados: "No encontre nada para '[query]'. Intenta con otras palabras."

UX:
- [ ] En mobile, tap en icono de lupa expande el search bar
- [ ] Atajo de teclado en desktop: Cmd+K abre el search
- [ ] Los resultados muestran: titulo, resumen truncado (1 linea), tags, tipo, con el match resaltado en bold
- [ ] Respuesta en < 500ms para queries tipicas

**Prioridad:** P0
**Estimacion:** M
**Dependencias:** US-014
**Notas tecnicas:** Funcion search_items() de PostgreSQL con pg_trgm. Zustand cache local para busqueda instantanea antes de round-trip a DB.

---

### US-025: Filtros combinados

**Como** power user
**Quiero** filtrar items por tipo de contenido, categoria, tag y carpeta simultaneamente
**Para** encontrar exactamente lo que busco cuando el search no es suficiente

**Acceptance Criteria:**

Funcionalidad:
- [ ] Filtros disponibles: tipo de contenido (link, text, markdown, command), categoria (dropdown), tags (multi-select), carpeta (arbol)
- [ ] Los filtros se combinan con AND (tipo=command + tag=claude-code = items que cumplan ambos)
- [ ] Los filtros se combinan con la busqueda de texto (search + filtros = resultados refinados)
- [ ] Contador de resultados activos: "Mostrando X items"
- [ ] Boton "Limpiar filtros" para resetear todo

UX:
- [ ] En mobile, los filtros se acceden desde un boton "Filtros" que abre un drawer/sheet
- [ ] En desktop, los filtros son visibles en una barra horizontal debajo del search
- [ ] Los filtros activos se muestran como chips removibles

**Prioridad:** P0
**Estimacion:** M
**Dependencias:** US-024

---

### US-026: Navegacion por sidebar

**Como** power user
**Quiero** navegar mi contenido desde un sidebar con workspaces, carpetas y tags
**Para** explorar mi base de conocimiento visualmente sin necesidad de buscar

**Acceptance Criteria:**

Funcionalidad:
- [ ] Sidebar muestra: workspace selector (arriba), arbol de carpetas (colapsable), lista de tags con conteo, lista de categorias con conteo
- [ ] Tap en carpeta = grid filtra por carpeta
- [ ] Tap en tag = grid filtra por tag
- [ ] Tap en categoria = grid filtra por categoria
- [ ] Breadcrumb muestra la navegacion actual: Workspace > Carpeta > Subcarpeta

UX:
- [ ] En desktop: sidebar fijo a la izquierda, siempre visible
- [ ] En mobile: sidebar se oculta, accesible con hamburger menu o swipe desde la izquierda
- [ ] El sidebar no hace refetch de datos al interactuar — filtra localmente cuando es posible

**Prioridad:** P0
**Estimacion:** M
**Dependencias:** US-019, US-022, US-023

---

## Epic 7: Bulk Import

> Importar contenido existente desde otros sistemas.

### US-027: Descargar plantilla CSV

**Como** power user
**Quiero** descargar una plantilla CSV con las columnas correctas
**Para** llenar mis datos existentes y subirlos masivamente

**Acceptance Criteria:**

Funcionalidad:
- [ ] Boton "Descargar plantilla" en la pagina de import
- [ ] El CSV descargado tiene columnas: titulo, url (opcional), contenido, tipo (link/text/markdown/command), categoria (opcional), tags (opcional, separados por coma), carpeta (opcional)
- [ ] Primera fila son los headers. Segunda fila es un ejemplo comentado.

UX:
- [ ] El CSV se descarga con nombre "nucleo-import-template.csv"
- [ ] Instrucciones breves visibles en la pagina antes de descargar

**Prioridad:** P1
**Estimacion:** S
**Dependencias:** US-005

---

### US-028: Importar CSV

**Como** power user
**Quiero** subir un CSV con multiples items para importarlos masivamente
**Para** migrar mi base de conocimiento existente sin pegar uno por uno

**Acceptance Criteria:**

Funcionalidad:
- [ ] Upload de archivo CSV (max 5MB)
- [ ] Preview de los primeros 5 items antes de confirmar la importacion
- [ ] Al confirmar, cada fila del CSV crea un item en el workspace activo
- [ ] La IA procesa cada item importado en background (como si se hubiera pegado individualmente)
- [ ] Progreso visible: "Importando X de Y items..."
- [ ] Al terminar, resumen: "X items importados exitosamente. Y fallaron."

Validaciones:
- [ ] Si el archivo no es CSV: "Solo se aceptan archivos CSV"
- [ ] Si el CSV no tiene las columnas requeridas: "El archivo no tiene el formato correcto. Descarga la plantilla."
- [ ] Si "contenido" esta vacio en una fila: se salta esa fila con warning

Error Handling:
- [ ] Si una fila falla, las demas continuan. Al final, lista de filas que fallaron con razon.
- [ ] Si la importacion se interrumpe por conexion: los items ya importados se mantienen.

UX:
- [ ] Drag & drop o selector de archivo
- [ ] Barra de progreso durante la importacion

**Prioridad:** P1
**Estimacion:** L
**Dependencias:** US-027, US-013

---

### US-029: Importar bookmarks del navegador

**Como** power user
**Quiero** importar el archivo de bookmarks exportado de Chrome/Safari/Firefox
**Para** traer mis marcadores existentes a Nucleo sin copiar cada URL manualmente

**Acceptance Criteria:**

Funcionalidad:
- [ ] Upload de archivo HTML de bookmarks (formato estandar de export de navegadores)
- [ ] El sistema parsea el HTML y extrae: titulo, URL, carpeta original (si existe)
- [ ] Preview de los primeros 10 bookmarks antes de confirmar
- [ ] Al confirmar, cada bookmark se crea como item tipo "link"
- [ ] La estructura de carpetas del bookmark se mapea a carpetas en Nucleo (respetando max 3 niveles)
- [ ] La IA procesa cada bookmark importado en background

Validaciones:
- [ ] Si el archivo no es HTML valido de bookmarks: "No se pudo leer el archivo. Asegurate de usar la opcion 'Exportar bookmarks' de tu navegador."

UX:
- [ ] Instrucciones paso a paso: "En Chrome, ve a Bookmarks > Bookmark Manager > ⋮ > Export bookmarks"

**Prioridad:** P1
**Estimacion:** L
**Dependencias:** US-013, US-019

---

## Epic 8: PWA

> App instalable en iPhone, rapida, sin recargas innecesarias.

### US-030: PWA instalable

**Como** power user
**Quiero** instalar Nucleo como app en mi iPhone
**Para** acceder con un tap desde la pantalla de inicio, sin abrir Safari

**Acceptance Criteria:**

Funcionalidad:
- [ ] La app tiene manifest valido con: nombre "Nucleo", icono en multiples tamanos, tema oscuro/claro, display "standalone"
- [ ] En Safari iOS, aparece la opcion "Agregar a pantalla de inicio"
- [ ] Al abrir desde la pantalla de inicio, se comporta como app nativa (sin barra de Safari, pantalla completa)
- [ ] El splash screen muestra el logo de Nucleo mientras carga

UX:
- [ ] Al primer acceso desde Safari, sugerir instalacion: "Instala Nucleo: tap en Compartir → Agregar a pantalla de inicio"
- [ ] La sugerencia se puede descartar y no vuelve a aparecer

**Prioridad:** P0
**Estimacion:** M
**Dependencias:** US-002
**Notas tecnicas:** Serwist para generar service worker y manifest. manifest.ts dinamico en Next.js. Iconos en 192x192, 512x512 png.

---

### US-031: Cache del shell de la app

**Como** power user
**Quiero** que la app cargue instantaneamente al abrirla
**Para** no esperar 2-3 segundos de carga cada vez que quiero guardar algo rapido

**Acceptance Criteria:**

Funcionalidad:
- [ ] El service worker cachea el shell de la app (HTML, CSS, JS) despues de la primera visita
- [ ] Las visitas siguientes cargan el shell desde cache (< 500ms)
- [ ] Los datos (items, workspaces) se cargan frescos del server
- [ ] Cuando hay una actualizacion de la app, el service worker se actualiza silenciosamente

UX:
- [ ] La app nunca muestra una pantalla en blanco — el shell se muestra inmediatamente
- [ ] Si hay actualizacion disponible, mostrar banner sutil: "Nueva version disponible. Recarga para actualizar."

**Prioridad:** P0
**Estimacion:** M
**Dependencias:** US-030
**Notas tecnicas:** Serwist con estrategia StaleWhileRevalidate para el shell. NetworkFirst para API calls. Versionar el service worker con build hash.

---

## Stories No-Funcionales

> Stories tecnicos que no pertenecen a un epic de usuario pero son necesarios.

### US-NF-001: Deteccion de contenido duplicado

**Como** power user
**Quiero** que el sistema me avise si intento guardar algo que ya existe
**Para** no llenar mi base con duplicados

**Acceptance Criteria:**

Funcionalidad:
- [ ] Al pegar una URL, verificar si ya existe un item con esa URL en el workspace activo
- [ ] Si existe, mostrar: "Ya tienes este link guardado. ¿Quieres guardarlo de nuevo?"
- [ ] El usuario decide: guardar duplicado o cancelar
- [ ] La deteccion es solo por URL exacta (no por contenido similar)

**Prioridad:** P0
**Estimacion:** S
**Dependencias:** US-009

---

## Resumen de Dependencias

```
US-001 (Registro) → US-002 (Login) → US-004 (Proteccion rutas)
                                    → US-003 (Logout)

US-001 → US-005 (Workspace selector) → US-006 (Crear workspace)
                                      → US-007 (Editar workspace)
                                      → US-008 (Eliminar workspace)

US-005 → US-009 (Capturar link) → US-010 (Texto)
                                → US-011 (Markdown)
                                → US-012 (Comando)
                                → US-013 (AI async) → US-022 (Tags)
                                                    → US-023 (Categorias)

US-009 → US-014 (Grid) → US-015 (Detalle) → US-016 (Copy)
                                            → US-017 (Editar) → US-021 (Mover)
                                            → US-018 (Eliminar)

US-005 → US-019 (Crear carpetas) → US-020 (Anidadas)
                                  → US-026 (Sidebar)

US-014 → US-024 (Search) → US-025 (Filtros)

US-027 (CSV template) → US-028 (CSV import)
US-013 + US-019 → US-029 (Bookmark import)

US-002 → US-030 (PWA) → US-031 (Cache)
```

## Stories Diferidos (Post-MVP)

| Story | Epic | Razon de Diferimiento | Fase |
|-------|------|----------------------|------|
| Voice notes (dictado de ideas) | Captura | Requiere Web Speech API o Whisper. Nuevo content_type. | Fase 2 |
| RAG chat (preguntar al agente) | Busqueda | Requiere pgvector, embeddings, chat UI con streaming | Fase 2 |
| Chrome extension (captura rapida) | Captura | Codebase separado, Manifest V3 | Fase 2 |
| Offline-first real (sync queue) | Infra | IndexedDB + conflict resolution | Fase 2 |
| Video analysis (Reels, TikTok) | Captura | Transcripcion API, scraping | Fase 3 |
| Favoritos y pinned avanzados | Items | Filtros por favoritos, vista de pinned | Fase 2 |
| Undo delete (papelera) | Items | Soft delete + vista de eliminados recientes | Fase 2 |
| Dark mode | UI | Theming con CSS variables | Fase 2 |
| Export de datos | Import | JSON/CSV export de todos los items | Fase 2 |

---

*User Stories generados con el pipeline de La Herreria*
*Pendiente aprobacion antes de avanzar al siguiente skill*
