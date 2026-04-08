# PDR: Nucleo

> **Product Definition Report**
> **Estado**: BORRADOR
> **Fecha**: 2026-04-01
> **Version**: 1.0
> **Modo**: Herramienta Interna (uso personal multi-device)

---

## 1. Problema

### El Dolor

Consumo diario de contenido valioso disperso en 8+ plataformas (GitHub, X, Reddit, paginas web, OpenClaw, Perplexity, notas mentales) sin un lugar centralizado para guardar, categorizar, analizar y recuperar. El contenido se pierde, se olvida, y termina re-buscandose o re-preguntandose a herramientas de IA.

Tipos de contenido que se pierden:
- Repositorios de GitHub utiles
- Posts e hilos de X y Reddit
- Paginas web y guias
- Comandos de Claude Code
- Prompts reutilizables
- Ideas generales
- Documentos e investigaciones generadas por IA (OpenClaw, Perplexity)

### El Costo

- **Tiempo perdido:** Re-buscar contenido que ya se encontro una vez. Re-preguntar a IAs cosas que ya respondieron.
- **Conocimiento perdido:** Ideas, patrones, comandos y recursos que se olvidan por no tener donde almacenarlos de forma accesible.
- **Friccion diaria:** Cambiar entre apps, copiar links a notas sueltas, perder contexto entre dispositivos (iPhone vs Mac).

### Situacion Actual

No hay sistema centralizado. El contenido se guarda parcialmente en:
- Bookmarks del navegador (sin organizacion, sin busqueda util)
- Notas sueltas (sin categorizacion, sin IA)
- Historial de chats de IA (no buscable, no persistente)
- Memoria humana (no confiable)

---

## 2. Propuesta de Valor

### En Una Frase

> Un segundo cerebro personal con IA que captura cualquier contenido (links, texto, markdown, comandos), lo analiza y categoriza automaticamente, y te permite encontrarlo en menos de 5 segundos desde cualquier dispositivo.

### Flujo Principal (Happy Path)

1. **Abrir PWA** en iPhone (o Mac)
2. **Elegir workspace** (Personal, Trabajo, o custom)
3. **Tap "+"** → pegar link, texto, markdown o comando
4. **IA procesa automaticamente:**
   - Analiza el contenido
   - Genera resumen
   - Categoriza automaticamente
   - Genera tags relevantes
   - Captura screenshot o extrae OG social image
5. **Contenido guardado** — visible en workspace > carpeta > tags
6. **Buscar y usar** — search bar global, filtros por categoria/tag, copy con 1 click

### Flujos Alternativos

- **Edicion post-captura:** El usuario puede editar categorias, tags y carpeta asignada por la IA en cualquier momento.
- **Carpeta manual:** El usuario puede crear carpetas antes de capturar y asignar directamente al pegar.
- **Bulk import:** Importar bookmarks existentes o cargar CSV con plantilla predefinida.
- **Markdown largo:** Pegar o subir archivos .md completos (investigaciones de OpenClaw/Perplexity). La IA los resume igual.
- **Comando/Prompt:** Al guardar un comando o prompt, se marca como "copiable" y aparece con boton de copy con 1 click.

### Edge Cases

- **Link roto o inaccesible:** La IA marca como "no analizable", guarda el link raw y permite al usuario agregar descripcion manual.
- **Contenido duplicado:** Detectar si un link/contenido ya existe en el workspace y avisar antes de duplicar.
- **IA categoriza mal:** El usuario siempre puede editar. Las ediciones entrenan las preferencias futuras (Fase 2+).

---

## 3. Usuario Objetivo

### Persona Principal

- **Rol**: Developer / power user que consume mucho contenido tecnico
- **Contexto**: Navega en iPhone, encuentra algo util, necesita guardarlo al instante y encontrarlo despues en iPhone o Mac
- **Nivel tecnico**: Tech-savvy (developer senior)
- **Dispositivo principal**: iPhone (consumo/captura), Mac (organizacion/uso)
- **Frecuencia de uso**: Diaria, multiples veces al dia

### TAM Estimado

Herramienta personal. Un usuario. Potencial futuro de apertura a otros power users/developers con el mismo problema.

---

## 4. Arquitectura de Datos

### Input — Que entra al sistema

| Dato | Tipo | Fuente | Obligatorio |
|------|------|--------|-------------|
| URL (link) | texto/URL | Pegado manual | Si (al menos uno de los 4 tipos) |
| Texto libre | texto | Escrito por usuario | Si (al menos uno de los 4 tipos) |
| Archivo Markdown | archivo .md | Upload o pegado | Si (al menos uno de los 4 tipos) |
| Comando/Prompt | texto | Pegado manual | Si (al menos uno de los 4 tipos) |
| Workspace seleccionado | seleccion | UI | Si (default si no elige) |
| Carpeta (opcional) | seleccion | UI o sugerida por IA | No |
| CSV de importacion | archivo .csv | Upload | No |
| Bookmarks export | archivo | Upload | No |

### Output — Que sale del sistema

| Dato | Tipo | Destino | Formato |
|------|------|---------|---------|
| Resumen generado por IA | texto | UI card/detail view | Markdown |
| Categorias automaticas | tags | UI filtros | Texto |
| Tags generados | tags | UI filtros | Texto |
| Thumbnail/OG image | imagen | UI card | URL o imagen almacenada |
| Contenido original | texto/link | UI detail view | Preservado tal cual |
| Texto copiable (1 click) | texto | Clipboard del usuario | Plain text |

### Entidades Principales (Modelo Conceptual)

| Entidad | Descripcion | Relaciones |
|---------|-------------|------------|
| User | Usuario autenticado | Tiene N workspaces |
| Workspace | Espacio de trabajo (max 5) | Tiene N folders, N items |
| Folder | Carpeta organizativa (max 3 niveles) | Pertenece a 1 workspace, tiene N subfolders, tiene N items |
| Item | Pieza de contenido capturado | Pertenece a 1 workspace, 0-1 folder, tiene N tags, 1 category |
| Tag | Etiqueta (generada por IA o manual) | Pertenece a N items |
| Category | Clasificacion de contenido | Pertenece a N items |
| AIAnalysis | Resultado del analisis de IA | Pertenece a 1 item (resumen, metadata extraida) |

---

## 5. KPIs de Exito

### Metrica Principal

**Encontrar cualquier contenido guardado en menos de 5 segundos.** Busqueda global intuitiva que busque en titulos, resumenes, tags, categorias y contenido original.

### Metricas Secundarias

- **Captura sin friccion:** Guardar algo nuevo en < 3 taps (abrir → workspace → pegar)
- **Uso diario:** Abrir la app al menos 1 vez al dia durante 2 semanas consecutivas
- **Zero loss:** Nunca mas perder un link o recurso que se vio en el celular

---

## 6. Modelo de Negocio

### Monetizacion

Herramienta personal. Sin monetizacion en Fase 1. Potencial futuro como SaaS si se valida el uso personal sostenido.

### Competencia

| Competidor | Que hacen | Diferencia de Nucleo |
|------------|-----------|---------------------|
| Raindrop.io | Bookmarks organizados con tags | No tiene IA, no analiza contenido, no resume |
| Notion | Docs + bases de datos flexibles | Lento en mobile, no tiene AI auto-analysis, no offline |
| Readwise/Reader | Captura + highlights de articulos | No guarda comandos/prompts, no voz, no video |
| Obsidian | Markdown local-first con plugins | No tiene IA nativa, sync de pago, no captura automatica |
| Mem.ai | Notas con IA | No offline, no video analysis, no extension robusta |

### Diferenciador Core

Ninguno combina: captura multi-formato + AI auto-analysis + organizacion por workspaces/carpetas/tags + copy con 1 click + optimizado para mobile-first.

---

## 7. Alcance del MVP (Fase 1)

### Features Core (Debe tener)

1. **Captura universal** — Pegar link, texto, markdown o comando/prompt. Interfaz: "+" → pegar → listo.
2. **AI auto-analysis** — Procesa el contenido, genera resumen, categoriza, genera tags, extrae thumbnail/OG image. Automatico al guardar.
3. **Organizacion** — Workspaces (hasta 5, default: Personal + Trabajo), carpetas anidadas (max 3 niveles), tags editables, categorias editables.
4. **Busqueda global** — Full-text search en titulos, resumenes, tags, categorias y contenido. Encontrar en < 5 segundos.
5. **Copy con 1 click** — Cualquier comando, prompt o texto copiable al clipboard con un tap.
6. **Bulk import** — Importar bookmarks (archivo de export) y CSV con plantilla predefinida.
7. **PWA mobile-first** — Instalable en iPhone, optimizada para mobile, rapida, sin recargas innecesarias.
8. **Sync basico** — Online-first con Supabase. Funciona en iPhone y Mac con la misma cuenta.

### Features Diferidas (Fase 2+)

- Voice notes (dictado de ideas → transcripcion → AI analysis)
- RAG chat (preguntar a un agente sobre tu base de conocimiento)
- Chrome extension (captura rapida desde el navegador)
- Offline-first real (IndexedDB + sync queue)
- Video analysis (Reels, TikTok → hooks + transcripcion)
- AI learning de preferencias (mejorar categorizacion con ediciones del usuario)

### Explicitamente Fuera de Alcance

- **No es un editor de documentos** — Nucleo captura y organiza, no es Notion ni Google Docs.
- **No busca en internet** — Solo busca en tu propia base de conocimiento.
- **No tiene colaboracion** — Es personal. No hay sharing ni permisos multi-usuario.
- **No tiene notificaciones** — No manda push ni emails. Es pull, no push.
- **No hace scraping automatico** — El usuario pega el contenido manualmente. No crawlea fuentes.

---

## 8. Consideraciones Especiales

### Requisitos No Funcionales

- **Autenticacion**: Si — email + password (Supabase Auth)
- **Roles/Permisos**: No — un solo usuario (owner de todo)
- **Pagos/Billing**: No
- **Datos Sensibles**: Bajo — contenido personal, no PII de terceros. Standard security.
- **Integraciones**: OpenRouter (AI analysis), Supabase (DB + Auth + Storage)
- **Multi-idioma**: No — espanol e ingles en contenido, UI en espanol
- **Multi-tenant**: No — single user
- **Offline**: Basico (cache de lectura) en Fase 1. Offline-first real en Fase 2.

### Restricciones Conocidas

- **iPhone como dispositivo principal** — La UI debe ser impecable en mobile. Desktop es secundario.
- **Velocidad** — No puede sentirse lenta. El AI processing puede ser async pero la UI debe responder inmediatamente.
- **Max 5 workspaces** — Limitacion intencional para evitar over-organization.
- **Max 3 niveles de carpetas** — Limitacion intencional para mantener simplicidad.

### Riesgos Identificados

| Riesgo | Impacto | Mitigacion |
|--------|---------|------------|
| AI categoriza mal frecuentemente | Medio | Permitir edicion facil. Categorias/tags son sugerencias, no imposiciones |
| Links inaccesibles (paywalls, auth walls) | Bajo | Guardar link raw + permitir descripcion manual |
| OG images no disponibles | Bajo | Fallback a screenshot generico o placeholder por tipo de contenido |
| Performance con muchos items | Medio | Paginacion, busqueda indexada (pg_trgm), lazy loading de thumbnails |
| Costo de AI por item | Medio | Usar modelos economicos (Haiku) para categorizacion. Batch processing |

---

## 9. Gaps Identificados y Recomendaciones

- **Deteccion de tipo de contenido:** Al pegar, Nucleo debe auto-detectar si es un link, texto libre, markdown o comando. Recomendacion: regex para URLs, deteccion de sintaxis markdown, el resto es texto libre. Comandos se marcan manualmente o se detectan por patrones (empieza con `$`, `/`, `git`, `npm`, etc.).
- **Tamano de contenido:** ¿Hay limite? Un markdown de Perplexity puede ser 5,000+ palabras. Recomendacion: sin limite duro, pero el resumen de IA siempre es < 200 palabras.
- **Thumbnails storage:** Las OG images y screenshots necesitan storage. Recomendacion: Supabase Storage con bucket publico. Comprimir a max 200KB por thumbnail.
- **Search performance:** Full-text search en contenido largo puede ser lento con muchos items. Recomendacion: usar pg_trgm (trigram index) de PostgreSQL para fuzzy search. Indexar: titulo, resumen, tags, categoria. El contenido original se busca como fallback.
- **CSV template:** Definir formato estandar con columnas: titulo, url, contenido, tipo, categoria, tags, carpeta. Generar template descargable desde la UI.

---

## 10. Proximos Pasos (Pipeline)

Una vez aprobado este PDR, los siguientes skills del pipeline generaran:

1. ⬜ **Tech Spec** — Stack tecnico, DB schema, arquitectura
2. ⬜ **User Stories** — Epics + stories INVEST con criterios de aceptacion
3. ⬜ **UX Design** — Arquitectura de informacion + patrones de interaccion
4. ⬜ **UI Design Workflow** — Screen flows + acceptance targets
5. ⬜ **UI** — Componentes implementados (mobile-first)
6. ⬜ **Security Audit** — Auditoria de seguridad
7. ⬜ **Blueprint** — Plan de ejecucion por fases

---

*PDR generado con el pipeline de La Herreria*
*Pendiente aprobacion antes de avanzar al siguiente skill*
