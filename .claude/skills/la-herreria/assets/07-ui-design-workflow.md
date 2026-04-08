# Skill #6 — UI Design Workflow

> *"Del User Story a la pantalla concreta. Sin esto, el developer adivina."*

## Qué Hace Este Skill

Traduce los User Stories y los escenarios de aceptación en diseños de interfaz concretos
antes de que comience la implementación. Toma el "qué hace el usuario" y produce el "cómo
se ve y cómo se comporta" — pantallas, flujos, componentes, estados, y los criterios
de aceptación visuales que el código debe cumplir.

**Por qué va después de User Stories y antes de UI:**
Los User Stories definen QUÉ construir. El UI Design Workflow define CÓMO se verá y
se sentirá. El Skill #7 (UI) implementa el resultado visual aplicando los principios de
diseño. Esta separación evita el "developer-driven design" donde el código dicta la UX.

---

## Inputs Requeridos

- `USER-STORIES-[nombre].md` — Del Skill #5. Los epics y stories INVEST con criterios de aceptación.
- `VPC-[nombre].md` — Del Skill #1. Jobs, pains y gains del usuario para guiar prioridades de diseño.
- `docs/ux-research/` — Del Skill #4. Personas, modelos mentales y journey maps.
  - Personas → para quién se diseña cada pantalla
  - Modelos mentales → arquitectura de información y patrones esperados
  - Journey maps → flujo emocional y puntos de frustración a resolver

---

## Referencias (leer cuando se indique)

- **Extracción de requisitos:** `.claude/skills/la-herreria/references/scenario-to-ui.md`
- **Diseño de Screen Flows:** `.claude/skills/la-herreria/references/screen-flows.md`
- **Selección de componentes:** `.claude/skills/la-herreria/references/component-selection.md`
- **Acceptance Targets:** `.claude/skills/la-herreria/references/acceptance-targets.md`

---

## Workflow

### Paso 1: Extraer Requisitos de UI desde User Stories

Leer cada User Story (especialmente los criterios de aceptación) e identificar:

**Leer:** `.claude/skills/la-herreria/references/scenario-to-ui.md`

Para cada story con UI, extraer:
- **Pantallas** — qué vistas o páginas son necesarias
- **Entry points** — cómo llega el usuario a cada pantalla
- **Datos mostrados** — qué información aparece en cada pantalla
- **Acciones disponibles** — qué puede hacer el usuario en cada pantalla
- **Cambios de estado** — cómo responde la pantalla a las acciones
- **Estados de error** — qué ve el usuario cuando algo falla

**Filtro de scope:**
¿La story tiene UI? → Seguir el workflow.
¿Es solo API o procesamiento en background? → Saltar esta story.
**Señal en criterio de aceptación:** Si dice "el usuario ve", "el usuario puede", o referencia una pantalla → tiene UI.

**Output de este paso:** Documento `## UI Requirements: [Feature]` con las 6 categorías por story.

---

### Paso 2: Diseñar Screen Flows

Mapear los requisitos extraídos en un flujo conectado de pantallas. Cada feature tiene
su screen flow document.

**Leer:** `.claude/skills/la-herreria/references/screen-flows.md`

**Principios:**
- Seguir al usuario, no a la feature — ordenar pantallas por el camino que camina el usuario
- Una screen flow por feature (o por epic si agrupa stories relacionadas)
- Diseñar primero el walking skeleton — la versión mínima viable de cada pantalla
- Anotar con referencias a las stories — cada decisión de diseño traza a una story

**Estructura de cada pantalla:**
```
### [Nombre de Pantalla]

**Entry from:** [Pantalla anterior] via [acción]
**Story refs:** [Story ID], criterio: [descripción]

#### Layout
[Descripción espacial — qué está arriba, medio, abajo. ASCII o prosa.]

#### Data Displayed
| Elemento | Fuente | Formato |
|----------|--------|---------|

#### Actions
| Acción | Control | Resultado |
|--------|---------|-----------|

#### States
- Default / Loading / Empty / Error / Success
```

**Output:** `docs/ui-design/screen-flows/[feature-name].md` por feature

---

### Paso 3: Seleccionar Componentes

Para cada pantalla, identificar qué componentes del design system se necesitan
y cuáles hay que crear nuevos.

**Leer:** `.claude/skills/la-herreria/references/component-selection.md`

**Árbol de decisión:**
1. ¿Existe un componente en el design system que hace esto? → Usarlo
2. ¿Se puede componer desde componentes existentes? → Componer
3. ¿Aparecerá en más de una pantalla? → Crear componente nuevo con spec
4. ¿Es solo esta pantalla? → Implementar inline (no es un componente)

Para componentes nuevos: crear spec en `docs/ui-design/components/[nombre].md`

---

### Paso 4: Definir Acceptance Targets

Traducir las decisiones de diseño en resultados observables y verificables.
Estos se convierten en los criterios de aceptación visuales que el código debe cumplir.

**Leer:** `.claude/skills/la-herreria/references/acceptance-targets.md`

**Qué es testeable:**
- Elemento presente en pantalla
- Elemento contiene texto o datos específicos
- Elemento en estado específico (visible, oculto, disabled, focused)
- Acción produce resultado específico (navegación, cambio de estado)
- Mensaje de error aparece en respuesta a input inválido
- Relación de layout (elemento A aparece antes que B)

**Qué NO es testeable** (dejar a revisión visual):
- Colores exactos (a menos que tengan significado semántico: error=rojo)
- Spacing o márgenes precisos
- Timing de animaciones

**Output:** Sección `## Acceptance Targets` al final de cada screen flow.

---

### Paso 5: Verificar Completitud

Antes de hacer handoff al Skill #7:

```
✅ Todos los epics/stories con UI tienen al menos un screen flow
✅ Cada pantalla tiene: entry point, data, actions, states, error states
✅ Todos los componentes identificados (existentes o nuevos)
✅ Acceptance targets definidos para cada decisión de diseño significativa
✅ Empty states y error states diseñados (no solo el happy path)
✅ Casos móviles anotados si el producto es mobile-first
```

---

## Estructura de Output

```
docs/
└── ui-design/
    ├── screen-flows/
    │   ├── [epic-o-feature-1].md    ← Flow diagram + pantallas
    │   └── [epic-o-feature-2].md
    └── components/
        └── [nuevo-componente].md    ← Solo si hay componentes nuevos
```

---

## Naming Convention

| Documento | Archivo |
|-----------|---------|
| Screen Flow | `docs/ui-design/screen-flows/[feature-kebab].md` |
| Component Spec | `docs/ui-design/components/[ComponentName].md` |

---

## Reglas Críticas

- **No diseñar pantallas que ninguna story requiere.** Cada pantalla traza a una story.
- **No saltar empty states y error states.** Estos son los momentos más críticos de UX.
- **Máximo 7 acciones primarias por pantalla.** Más indica que la pantalla hace demasiado.
- **Mobile-first si el journey map muestra uso en móvil.** Las personas del Skill #4 definen el dispositivo primario.
- **Los modelos mentales del Skill #4 dictan la arquitectura de información.** Si el usuario piensa en "documentos", la navegación refleja documentos — no estados de base de datos.

---

## Integración con Skills Upstream/Downstream

| Skill | Qué aporta / Qué consume |
|-------|--------------------------|
| UX Research (#4) | Las personas determinan para quién diseñar. Los journey maps revelan qué momentos son críticos. Los modelos mentales dictan la arquitectura de información. |
| User Stories (#5) | Los criterios de aceptación son el input principal de extracción de UI. |
| UI (#7) | Consume los screen flows y acceptance targets para implementar el diseño visual final. |
| Blueprint (#8) | Los componentes nuevos identificados aquí se convierten en tasks de implementación. |

---

## Handoff al Skill #7

```
✅ Screen flows: [N] features documentadas
✅ Componentes nuevos: [N] specs creadas / [ninguno]
✅ Acceptance targets: definidos por pantalla

Siguiente: UI (Skill #7)
Tomará los screen flows y aplicará los principios de diseño visual
para producir la implementación UI final.

¿Procedemos?
```
