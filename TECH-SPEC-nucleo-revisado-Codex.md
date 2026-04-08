# Nucleo - Tech Spec Revisado (Codex)

> Revision propuesta: v1.1
> Fecha: 2026-04-01
> Base: `TECH-SPEC-nucleo.md`
> Objetivo: reforzar el Golden Path, bajar ambiguedad del MVP y corregir inconsistencias del spec

---

## 1. Opinion General

El tech spec original tiene una base tecnica solida. La direccion general es buena: captura rapida, procesamiento async, organizacion asistida por IA y recuperacion veloz con search local + PostgreSQL.

Donde mas conviene reforzarlo no es en infraestructura, sino en claridad de producto. El documento describe muy bien el "como", pero todavia le falta cerrar con precision el "flujo principal" del usuario y algunas decisiones operativas que hoy quedan implicitas.

Mi conclusion: el spec esta bien encaminado para construir, pero antes de ejecutarlo conviene convertirlo en una v1.1 mas enfocada en el Golden Path del MVP.

---

## 2. Golden Path Propuesto

### 2.1 Golden Path MVP

El Golden Path deberia declararse explicitamente asi:

1. El usuario inicia sesion.
2. Si es su primera vez, el sistema crea automaticamente un workspace por default.
3. El usuario pega una URL desde mobile o desktop.
4. La UI crea la card al instante con estado `processing`.
5. El pipeline extrae metadata, genera titulo/resumen/categoria/tags y sugiere carpeta.
6. La card se actualiza sin refrescar la pagina.
7. Horas o dias despues, el usuario encuentra el item en menos de 5 segundos usando search, tags o categoria.
8. El usuario abre, copia o reutiliza el contenido guardado.

### 2.2 Lo Que Haria Explcito en el Spec

- El MVP es `links-first`.
- Texto, markdown y comandos siguen soportados, pero con un pipeline simplificado en Fase 1.
- La experiencia principal a optimizar no es "organizar mucho", sino "capturar sin pensar y encontrar despues".

### 2.3 Criterios de Exito del Golden Path

- Captura visible en UI en menos de 300 ms.
- Item enriquecido por IA en menos de 10 s en condiciones normales.
- El usuario puede recuperar un item usando texto libre, tags o categoria.
- El usuario no necesita crear manualmente un workspace ni una carpeta para completar el primer guardado.

---

## 3. Propuestas de Mejora Prioritarias

### 3.1 Prioridad Alta

#### A. Declarar el MVP como `links-first`

Hoy el resumen promete links, texto, markdown y comandos con el mismo peso, pero el flujo detallado solo esta realmente especificado para URLs.

Propuesta:

- Mantener soporte de captura para todos los tipos.
- Declarar que el pipeline completo de enriquecimiento automatizado del MVP esta optimizado para `link`.
- Para `text`, `markdown` y `command`, usar flujo simplificado:
  - guardar contenido original
  - generar titulo y tags con IA
  - no depender de OG extraction ni thumbnail

Beneficio:

- Reduce riesgo de scope.
- Alinea producto, UX y arquitectura.
- Evita que el equipo piense que todos los content types ya tienen parity funcional.

#### B. Agregar una seccion formal llamada `Golden Path MVP`

El documento necesita una seccion visible, idealmente cerca del resumen ejecutivo o de arquitectura, con:

- flujo principal
- objetivo de experiencia
- criterios de exito
- supuestos del MVP

Beneficio:

- Sirve como contrato compartido entre producto, diseno e implementacion.
- Facilita recortar alcance sin perder el nucleo del producto.

#### C. Definir el first-run

Falta aclarar que pasa en la primera sesion:

- se crea un workspace default automaticamente
- se redirige al dashboard listo para pegar
- se muestra empty state con CTA unica: `Pega un link o texto`

Beneficio:

- El Golden Path arranca sin friccion.
- Evita un onboarding accidentalmente complejo.

#### D. Corregir inconsistencias entre API y comportamiento real

Hay varias contradicciones del spec que conviene resolver:

- `CreateItemResponse` retorna `processingStatus: 'pending'`, pero el flujo de datos dice que el item se guarda como `processing`.
- `SearchInput` soporta filtros por categoria, tags, tipo y carpeta, pero la funcion SQL publicada no implementa esos filtros.
- La IA devuelve `category` y `tags` como strings, pero no se define el algoritmo de upsert a tablas relacionales.
- `suggestedFolder` existe en el output de IA, pero no se define si la app la crea, la sugiere visualmente o la ignora.

Beneficio:

- Reduce huecos de implementacion.
- Evita decisiones divergentes cuando se empiece a construir.

### 3.2 Prioridad Media

#### E. Hacer durable el async processing

`after()` es una buena decision para respuesta rapida, pero por si solo no garantiza durabilidad si el proceso reinicia en medio del pipeline.

Propuesta pragmatica de MVP:

- Mantener `after()` para disparar el procesamiento.
- Agregar estados y timestamps claros: `processing_started_at`, `processed_at`, `failed_at`.
- Agregar `processing_attempts`.
- Permitir un job de recuperacion manual o programado que reprocesse items atascados en `processing`.

Beneficio:

- Conserva simplicidad.
- Evita items "fantasma" cuando hay reinicios o fallos intermedios.

#### F. Buscar tambien por tags y categoria

Si la app promete clasificacion automatica, la busqueda deberia aprovecharla de verdad.

Propuesta:

- Extender `search_items` para incluir nombre de tags y categoria.
- O construir una columna materializada / vista indexable de search con:
  - title
  - summary
  - original_content resumido
  - tags agregados
  - category name

Beneficio:

- Hace mas coherente la promesa de "guardar y encontrar despues".

#### G. Definir la estrategia de thumbnails privadas

El spec dice bucket privado con signed URLs, pero no define como se renuevan ni como se renderizan en listas.

Propuesta:

- Mantener bucket privado.
- Generar signed URL on-demand desde server para detail views.
- Para grid/listado del MVP, considerar:
  - proxy interno de imagen, o
  - thumbnails publicas de bajo riesgo si no contienen material sensible

Beneficio:

- Evita expiracion silenciosa de imagenes en la UI.

### 3.3 Prioridad Baja

#### H. Minimo de observabilidad aunque no haya Sentry

Aunque el producto sea personal, un pipeline async sin visibilidad se vuelve dificil de depurar.

Propuesta:

- structured logs con `item_id`, `workspace_id`, `stage`, `duration_ms`, `error_code`
- endpoint `/api/health`
- endpoint o vista simple de `failed items`

#### I. Agregar 2-3 tests pequenos de alto ROI

Aunque no haya unit tests formales en Fase 1, yo si agregaria tests para:

- deteccion de content type
- parser de OG metadata
- mapping de AI output a categoria/tags/folder

Beneficio:

- Mucho valor por poco costo.
- Protege las partes mas propensas a regresiones silenciosas.

---

## 4. Inconsistencias Puntuales a Corregir

### 4.1 Estado inicial del item

Propuesta:

- Crear siempre el item con `processing_status = 'processing'`.
- Reservar `pending` solo si en el futuro existe una cola externa o una etapa de encolado real.

### 4.2 Filtros de search

Hoy el API define mas capacidades que la SQL.

Opciones:

1. Implementar en SQL todos los filtros declarados.
2. Simplificar el API del MVP para reflejar lo que realmente existira.

Mi recomendacion:

- Implementarlos desde el principio si tags, categoria y carpeta van a estar visibles en UI.

### 4.3 Mapping relacional de IA

Falta especificar esto:

1. `category` de IA -> slug -> upsert en `categories` por `workspace_id`.
2. `tags` de IA -> normalizacion -> slug -> upsert en `tags`.
3. relacion final en `item_tags`.
4. si la IA sugiere una carpeta inexistente, no crearla automaticamente en MVP; mostrar sugerencia.

### 4.4 Content-language y ai_metadata

El spec obtiene `contentLanguage`, pero no dice donde vive.

Propuesta:

- Guardarlo dentro de `ai_metadata`.
- Versionar ese JSON:
  - `schemaVersion`
  - `model`
  - `contentLanguage`
  - `confidence`
  - `suggestedFolder`

---

## 5. Propuesta de Recorte de Scope para el MVP

### 5.1 Mantener en MVP

- auth por email/password
- un solo usuario
- workspaces
- captura de links
- captura basica de texto
- procesamiento async
- tags y categoria
- search
- PWA instalable

### 5.2 Simplificar en MVP

- folders: soportar max 2 niveles visibles aunque la DB permita 3
- imports: dejar bookmarks primero, CSV despues si aprieta el tiempo
- comandos y markdown: guardar y etiquetar, pero sin pipeline sofisticado

### 5.3 Mover a post-MVP si hace falta

- sugerencia automatica de carpeta accionable
- screenshots como fallback visual
- cache local avanzada con Zustand para search offline-ish
- import masivo completo con UX avanzada

---

## 6. Texto Propuesto Para Agregar al Tech Spec Original

### 6.1 Nueva Seccion: Golden Path MVP

```md
## X. Golden Path MVP

### Objetivo

Permitir que el usuario capture un link en segundos, lo deje procesando sin friccion y pueda recuperarlo mas tarde sin recordar exactamente donde lo guardo.

### Flujo principal

1. Usuario inicia sesion.
2. Si no existe workspace, la app crea uno por default.
3. Usuario pega una URL desde mobile o desktop.
4. La app crea inmediatamente un item con estado `processing`.
5. El pipeline async extrae metadata y enriquece el item con IA.
6. La UI actualiza la card automaticamente al terminar.
7. El usuario recupera ese item despues mediante search, tags o categoria.

### No-objetivos del MVP

- No optimizar todos los content types con el mismo nivel de profundidad.
- No requerir organizacion manual antes de guardar.
- No depender de carpetas para que el usuario encuentre valor.

### Criterios de exito

- La captura responde en menos de 300 ms.
- El item queda procesado en menos de 10 s en casos normales.
- El usuario recupera un item reciente en menos de 5 s usando search.
```

### 6.2 Reemplazo Propuesto de la Decision de Alcance

```md
**MVP links-first**
- Razon: El flujo mejor especificado y de mayor valor inmediato es guardar URLs.
- Implicacion: Texto, markdown y comandos se soportan en Fase 1 con enriquecimiento simplificado.
- Trade-off: Menos parity funcional al inicio, pero menor riesgo y mejor foco.
```

### 6.3 Regla Propuesta Para Carpetas

```md
**Carpetas en MVP**
- Las carpetas son una mejora de organizacion, no un requisito del Golden Path.
- La IA puede sugerir una carpeta, pero la app no la crea automaticamente en Fase 1.
- El usuario puede mover items manualmente despues de capturarlos.
```

---

## 7. Propuesta de Ajustes al Modelo de Datos

### 7.1 Campos Nuevos Recomendados en `items`

```sql
processing_started_at TIMESTAMPTZ,
processed_at TIMESTAMPTZ,
failed_at TIMESTAMPTZ,
processing_attempts SMALLINT NOT NULL DEFAULT 0
```

### 7.2 Convenciones de Estado

- `pending`: reservado para encolado futuro
- `processing`: pipeline activo o disparado
- `ready`: enriquecimiento terminado
- `failed`: pipeline agotado o error manualmente visible

### 7.3 Duplicados

No impondria un `UNIQUE(original_url)` en MVP.

Si agregaria:

- deteccion blanda de duplicados por `workspace_id + original_url`
- sugerencia visual tipo `Ya guardaste este link el 2026-04-01`

---

## 8. Propuesta de Ajustes a Search

### 8.1 Search del MVP deberia soportar

- texto libre
- match aproximado en titulo, resumen y contenido
- filtros por categoria
- filtros por tags
- filtros por carpeta
- orden por relevancia y luego recencia

### 8.2 Recomendacion de implementacion

Si se busca mantener simple:

- mantener `pg_trgm`
- agregar joins con `item_tags`, `tags` y `categories`
- devolver `similarity` y `created_at`

Si luego crece:

- mover a vista materializada o tabla de search denormalizada

---

## 9. Version Resumida del Spec que Yo Ejecutaria

Si tuviera que convertir este documento en un plan de implementacion mas seguro, lo resumiria asi:

1. Construir login + middleware + workspace default.
2. Implementar captura de links con respuesta instantanea.
3. Procesar en background con estado visible y retry manual.
4. Guardar categoria y tags relacionales de forma determinista.
5. Habilitar search real por texto, tags y categoria.
6. Agregar vista detalle y acciones de reutilizacion.
7. Cerrar con PWA y pruebas E2E del Golden Path.

---

## 10. Recomendacion Final

No cambiaria la direccion general del proyecto. La idea base esta bien y el stack tiene sentido para el problema.

Lo que si haria antes de empezar a construir es:

1. declarar formalmente el Golden Path
2. recortar el MVP a `links-first`
3. resolver las inconsistencias entre API, SQL y pipeline
4. definir first-run, retries y mapping relacional de IA

Con esos ajustes, el spec quedaria mucho mas ejecutable y mucho menos expuesto a scope creep disfrazado de flexibilidad.
