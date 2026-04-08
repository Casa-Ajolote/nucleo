# La Herrería — Catálogo de Skills

> Referencia completa de los 6 skills del pipeline.
> El Orchestrator lee este archivo cuando necesita detalles sobre un skill específico
> antes de solicitarlo al usuario.

---

## Skill #1: PDR Generator

**Archivo:** `01-pdr-generator/SKILL.md`
**Input:** Conversación con el usuario (entrevista guiada)
**Output:** `PDR-[nombre-kebab].md`
**Duración:** 15-30 min

### Qué Hace

Entrevista estructurada de 9 preguntas que extrae la esencia del negocio. Cubre:
problema, usuario objetivo, solución propuesta, flujo principal, monetización,
competencia, métricas de éxito, alcance MVP, y restricciones.

### Output Esperado

Documento de 10 secciones:
1. Resumen ejecutivo
2. Problema
3. Usuario objetivo (persona)
4. Solución propuesta
5. Flujo principal del usuario
6. Modelo de monetización
7. Análisis competitivo
8. Métricas de éxito (KPIs)
9. Alcance MVP (in-scope / out-of-scope)
10. Restricciones y supuestos

### Cuándo Se Necesita

Siempre es el primer paso. Sin PDR no hay contexto para los demás skills.
Único caso donde se salta: el usuario ya tiene un PDR/brief equivalente.

---

## Skill #2: Tech Spec Generator

**Archivo:** `02-tech-spec/SKILL.md`
**Input:** PDR aprobado
**Output:** `TECH-SPEC-[nombre-kebab].md`
**Duración:** 10-20 min

### Qué Hace

Consultor técnico que evalúa el stack óptimo contra los requisitos del PDR.
No elige la tecnología más popular — elige la que mejor resuelve el problema.
Incluye análisis de tradeoffs explícito.

### Output Esperado

- Stack recomendado (frontend, backend, DB, hosting, auth, pagos)
- Justificación de cada elección (por qué X y no Y)
- Estructura de carpetas del proyecto
- DB schema (tablas, relaciones, índices)
- APIs externas necesarias
- Estimación de costos de infraestructura
- Decisiones de seguridad

### Cuándo Se Necesita

Después del PDR. Se puede saltar si el usuario ya tiene un Tech Spec o
si ya decidió el stack (pero se recomienda validarlo).

---

## Skill #3: User Stories Generator

**Archivo:** `03-user-stories/SKILL.md`
**Input:** PDR + Tech Spec aprobados
**Output:** `USER-STORIES-[nombre-kebab].md`
**Duración:** 20-40 min

### Qué Hace

Genera user stories formato INVEST organizados por Epics. Cada story incluye
acceptance criteria en formato Given-When-Then, prioridad (P0/P1/P2),
y edge cases. Stories se pueden mapear directamente a tickets de Jira/Linear.

### Output Esperado

- Epics con descripción
- User stories con formato "Como [rol] quiero [acción] para [beneficio]"
- Acceptance criteria (Given-When-Then)
- Prioridad P0 (MVP core), P1 (MVP nice-to-have), P2 (post-MVP)
- Edge cases y unhappy paths
- Dependencias entre stories

### Cuándo Se Necesita

Después de PDR + Tech Spec. Es input directo para Wireframes.
Se puede saltar si el usuario ya tiene stories escritos.

---

## Skill #4: Wireframes Generator

**Archivo:** `04-wireframes/SKILL.md`
**Input:** PDR + Tech Spec + User Stories
**Output:** `WIREFRAMES-[nombre-kebab].md`
**Duración:** 30-60 min

### Qué Hace

Genera wireframes low-resolution de todas las pantallas del MVP.
Siempre produce wireframes ASCII (universales). Opcionalmente genera
artifacts HTML/SVG visuales. Mobile-first. Incluye TODOS los estados
(default, empty, error, loading, modal/drawer).

### Output Esperado

- Mapa de navegación (sitemap)
- Wireframe ASCII por pantalla (mobile + desktop)
- Todos los estados de cada pantalla
- Anotaciones de comportamiento e interacción
- Artifacts visuales HTML (si el entorno lo soporta)

### Cuándo Se Necesita

Después de User Stories. Es input para UI Prompts y Blueprint.
Se salta si el usuario ya tiene diseños en Figma/Sketch.

---

## Skill #5: UI Generation Prompts (Stitch + Anti-AI-Slop)

**Archivo:** `05-stitch-prompts/SKILL.md`
**Input:** PDR + Tech Spec + User Stories + Wireframes
**Dependencia adicional:** `front-end-design/SKILL.md` (skill de estética)
**Output:** `STITCH-PROMPTS-[nombre-kebab].md`
**Duración:** 20-40 min

### Qué Hace

Genera prompts optimizados para Google Stitch que convierten wireframes en
pantallas UI de alta fidelidad. Integra la filosofía del skill Front-End Design
para romper con la estética genérica de "AI slop" (Inter + gradiente morado +
layout predecible).

Proceso:
1. Design Thinking — elegir dirección estética BOLD
2. Design System Prompt — tipografía con personalidad, paleta con intención
3. Prompts por pantalla — framework Zoom-Out-Zoom-In
4. Evaluación de Generative UI — qué pantallas se benefician de UI dinámica

### Output Esperado

- Design System Prompt (bloque reutilizable para Stitch)
- Prompt individual por pantalla (1:1 con wireframes)
- Refinamientos sugeridos por pantalla
- Generative UI Strategy (si aplica — A2UI, AG-UI, MCP Apps)
- Checklist de exportación

### Anti-AI-Slop (Diferenciador)

Este skill está diseñado para que cada proyecto tenga identidad visual ÚNICA:
- Fuentes prohibidas como principal: Inter, Roboto, Arial, system-ui
- Paletas con dominancia (no distribuidas tímidamente)
- Componentes con identidad propia (no los de Tailwind UI por defecto)
- Detalles de atmósfera (texturas, sombras con color, micro-interactions)
- Test mental: "¿Se distingue de otras apps generadas por IA?"

### Cuándo Se Necesita

Después de Wireframes. Se salta si el usuario ya tiene diseños finales
o no va a usar Google Stitch para generar UI.

---

## Skill #6: Master Blueprint

**Archivo:** `06-master-blueprint/SKILL.md`
**Input:** TODOS los anteriores (o documentos equivalentes)
**Output:** `BLUEPRINT-[nombre-kebab].md`
**Duración:** 30-60 min

### Qué Hace

Consolida TODO en un documento único y ejecutable. El Blueprint es el
"manual de construcción" de la app. Un desarrollador (humano o IA) puede
construir el MVP completo solo con este documento.

Organizado en Fases → Subfases → Tareas. Cada fase incluye:
- User stories relevantes (inline)
- Wireframes de referencia
- Stitch prompts de referencia
- Código de setup cuando aplica
- Criterios de aceptación

### Output Esperado

- Fases de implementación ordenadas por dependencia
- Subfases con tareas específicas
- Para cada tarea: qué hacer, cómo validar, de qué depende
- Setup commands (npm init, prisma migrate, etc.)
- Deployment checklist
- Testing strategy
- Post-launch plan

### Cuándo Se Necesita

Es el último paso. Necesita todos los documentos previos como input.
Puede funcionar con documentos parciales pero la calidad baja proporcionalmente.

---

## Skill Auxiliar: Front-End Design

**Archivo:** `front-end-design/SKILL.md`
**No es parte del pipeline secuencial** — es un skill de soporte usado por el Skill #5.

### Qué Hace

Define principios de diseño para crear interfaces distintivas y
production-grade que evitan la estética genérica de "AI slop".
Cubre: Design Thinking, tipografía, color, motion, composición espacial,
backgrounds y detalles visuales.

### Cuándo Se Usa

El Skill #5 lo lee ANTES de definir el Design System Prompt.
Si no está disponible, el Skill #5 aplica los principios core inline.

---

## Matriz de Dependencias

```
Skill #1 (PDR)
  └──→ Skill #2 (Tech Spec) [requiere: PDR]
        └──→ Skill #3 (Stories) [requiere: PDR + Tech Spec]
              └──→ Skill #4 (Wireframes) [requiere: PDR + Tech Spec + Stories]
                    └──→ Skill #5 (UI Prompts) [requiere: todo + front-end-design]
                          └──→ Skill #6 (Blueprint) [requiere: todo]
```

Cada skill puede funcionar con inputs parciales o equivalentes,
pero la calidad óptima se logra con todos los inputs completos.
