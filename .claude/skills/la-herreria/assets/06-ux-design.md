# Skill #6 — UX Design

> *"La estructura invisible que hace que todo se sienta natural."*

## Qué Hace Este Skill

Toma las personas y modelos mentales del UX Research (Skill #4) y los User Stories
(Skill #5) para definir la arquitectura de la experiencia **antes de diseñar una sola
pantalla**: cómo se organiza el producto, cómo se comportan los controles, si el flujo
es usable, y cómo el primer usuario llega a su primer éxito.

**Por qué va antes de UI Design Workflow:**
Sin IA definida, el diseñador de screen flows adivina la navegación. Sin evaluación de
usabilidad, los problemas de UX se descubren después de implementar. Sin onboarding
strategy, el primer usuario llega a una pantalla vacía y se va. UX Design responde estas
preguntas estructurales antes de que se diseñe una sola pantalla.

---

## Inputs Requeridos

- `docs/ux-research/personas/` — Del Skill #4. Las personas y sus características.
- `docs/ux-research/mental-models/` — Del Skill #4. Cómo los usuarios piensan sobre el dominio.
- `USER-STORIES-[nombre].md` — Del Skill #5. Los epics y stories con sus criterios de aceptación.

---

## Referencias (leer cuando se indique)

- **Information Architecture:** `.claude/skills/la-herreria/references/information-architecture.md`
- **Interaction Patterns:** `.claude/skills/la-herreria/references/interaction-patterns.md`
- **Usability Evaluation:** `.claude/skills/la-herreria/references/usability-evaluation.md`
- **Onboarding:** `.claude/skills/la-herreria/references/onboarding.md`

---

## Workflow

### Paso 1: Definir Information Architecture

La IA organiza el producto — qué vive dónde, cómo los usuarios encuentran las cosas,
cómo la jerarquía mental mapea a la navegación. Una IA incorrecta significa que los
usuarios no pueden encontrar lo que necesitan. Una IA correcta se siente obvia.

**Leer:** `.claude/skills/la-herreria/references/information-architecture.md`

**Fuentes para derivar la IA (no inventar):**

1. **Modelos mentales** (`docs/ux-research/mental-models/`) — los términos y categorías
   que el usuario ya usa. Si el usuario piensa en "facturas", la navegación dice "Facturas",
   no "Documentos" o "Transacciones".
2. **Epics de User Stories** — cada epic es un área principal del producto. Si hay epic
   "Gestión de inventario", hay sección "Inventario" en la navegación.

**Seleccionar UN patrón de navegación:**
- **Top Nav:** 3–6 secciones top-level, productos desktop-primary, usuarios que cambian
  de sección frecuentemente.
- **Sidebar:** 5+ secciones con subsecciones, apps donde se trabajan sesiones largas
  dentro de una misma sección. En móvil: drawer tras hamburger.
- **Bottom Nav:** Mobile-first, 3–5 secciones primarias, acceso con un pulgar.

**Máxima profundidad: 3 niveles.** Si hay más, aplanar o dividir.

**Output:** `docs/ux-design/information-architecture.md`

---

### Paso 2: Definir Interaction Patterns

Los interaction patterns son las reglas que gobiernan cómo se comportan los controles
en todo el producto. Consistencia significa que el usuario aprende una vez y aplica en
todas las pantallas. Inconsistencia hace que cada pantalla se sienta como un producto nuevo.

**Leer:** `.claude/skills/la-herreria/references/interaction-patterns.md`

Definir los 5 patrones para este producto:

**1. Feedback Loops**
¿Cuánto tarda el feedback de cada tipo de acción?
- Acción instantánea (click de botón) → feedback < 200ms
- Submit de formulario → estado loading inmediato, luego success/error
- Auto-save → indicador "Guardado" a los 2s, se desvanece
- Proceso largo (> 10s) → progress bar con tiempo estimado

**2. Form Behavior**
¿Cuándo validar, cómo mostrar errores, qué pasa en success?
- Validar on blur (al salir del campo), no on change
- Errores inline debajo del campo, con mensaje específico y corrección sugerida
- Al submit: focus en el primer campo con error
- Success: el form desaparece o transiciona a la vista de detalle

**3. Progressive Disclosure**
¿Qué se muestra por defecto, qué se oculta hasta que se necesita?
- Vista default: solo controles para la acción más común
- "Más opciones": campos adicionales expandibles inline
- "Avanzado": configuración de power users detrás de toggle explícito

**4. Error Recovery**
¿Cómo maneja cada categoría de error?
- Validación: inline, mantener datos ingresados, focus en primer error
- Not found: mensaje claro + qué hacer a continuación
- Permission denied: mensaje + qué permiso se necesita (no ocultar la feature)
- Server error: mensaje legible + botón retry + preservar datos
- Network error: indicador de conectividad + queue de acciones si es posible

**5. State Transitions**
¿Cómo se muestran los cambios de estado en las entidades del producto?
- Estado actual siempre visible como badge/indicador
- Acciones disponibles etiquetadas con el estado resultante ("Enviar Factura", no solo "Siguiente")
- Transición: loading brief → badge actualizado → mensaje de confirmación

**Output:** `docs/ux-design/interaction-patterns.md`

---

### Paso 3: Evaluar Usabilidad

Antes de diseñar una sola pantalla, evaluar la experiencia planeada contra los 10
heurísticos de usabilidad de Nielsen. Los problemas encontrados aquí cuestan cero.
Los encontrados después de implementar cuestan un ciclo completo de rediseño.

**Leer:** `.claude/skills/la-herreria/references/usability-evaluation.md`

**Los 10 Heurísticos:**
- H1: Visibilidad del estado del sistema
- H2: Match entre sistema y mundo real
- H3: Control y libertad del usuario
- H4: Consistencia y estándares
- H5: Prevención de errores
- H6: Reconocimiento sobre memoria
- H7: Flexibilidad y eficiencia de uso
- H8: Diseño estético y minimalista
- H9: Ayuda a reconocer, diagnosticar y recuperarse de errores
- H10: Ayuda y documentación

**Escala de severidad:**
| Score | Severidad | Acción requerida |
|-------|-----------|-----------------|
| 4 | Catastrófico | Bloquea el pipeline — rediseñar el flujo |
| 3 | Mayor | Resolver antes de implementar |
| 2 | Menor | Resolver antes de lanzar |
| 1 | Cosmético | Resolver si hay tiempo |

**Regla de bloqueo:** Cualquier violación Severidad 4 debe resolverse ANTES de
continuar al Skill #7. No se avanza con problemas que impidan completar la tarea.

Evaluar las features principales (las epics de mayor impacto para el usuario primario).

**Output:** `docs/ux-design/usability-evaluation/[feature-kebab].md` por feature principal

---

### Paso 4: Diseñar Onboarding Strategy

Los primeros 60 segundos determinan si el usuario se queda o se va. El objetivo del
onboarding no es enseñar el producto completo — es llevar al usuario a su **PRIMER
ÉXITO** lo más rápido posible. Una vez que experimenta éxito, está motivado para explorar.

**Leer:** `.claude/skills/la-herreria/references/onboarding.md`

**Responder la pregunta central:**
> ¿Cuál es la cosa más valiosa que este usuario puede lograr en la primera sesión,
> y cómo llegamos ahí con cero fricción?

Eso es el "first success". Todo el onboarding apunta a él.

**Patterns a seleccionar (pueden combinarse):**

- **Empty State Design** — Cada lista/tabla/dashboard vacío tiene un empty state
  diseñado (no "No hay datos"): ícono de dominio + headline + body (1 frase) +
  CTA primario que lleva al first success.
- **Guided First Action** — El primer formulario tiene defaults sensibles, campos
  mínimos, helper text por campo, y success state claro.
- **Contextual Tooltips** — Nuevas capacidades se revelan en el momento relevante
  (primera visita a una sección, primera vez que una feature se activa). Un tooltip
  a la vez, siempre dismissible.
- **Progress Indication** — Solo para productos con setup multi-paso (3+ pasos
  de configuración necesarios antes del first success).

**Definir empty states para TODAS las vistas de listado** del producto.

**Output:** `docs/ux-design/onboarding.md`

---

### Paso 5: Verificar Completitud

Antes de hacer handoff al Skill #7 (UI Design Workflow):

```
✅ Information Architecture documentada con patrón de navegación elegido
✅ Profundidad máxima 3 niveles respetada
✅ Labels de navegación en vocabulario de los modelos mentales
✅ Interaction patterns definidos para las 5 categorías
✅ Usabilidad evaluada → cero violaciones Severidad 4 sin resolver
✅ First success definido
✅ Empty states definidos para todas las vistas de listado
✅ Onboarding strategy documentada
✅ Todos los docs en docs/ux-design/
```

---

## Output

```
docs/ux-design/
├── information-architecture.md    ← Organización y navegación del producto
├── interaction-patterns.md        ← Cómo se comportan los controles (producto-wide)
├── onboarding.md                  ← Estrategia de primer uso + empty states
└── usability-evaluation/
    └── [feature-kebab].md         ← Evaluación heurística por feature principal
```

---

## Naming Convention

| Documento | Archivo |
|-----------|---------|
| Information Architecture | `docs/ux-design/information-architecture.md` |
| Interaction Patterns | `docs/ux-design/interaction-patterns.md` |
| Onboarding Strategy | `docs/ux-design/onboarding.md` |
| Usability Evaluation | `docs/ux-design/usability-evaluation/[feature-kebab].md` |

---

## Reglas Críticas

- **La IA se deriva de los modelos mentales — no se inventa.** Si el usuario piensa en
  "clientes", la navegación dice "Clientes", no "Usuarios" o "Cuentas".
- **Un solo patrón de navegación, elegido una vez.** No mezclar top nav con sidebar.
  Consistencia sobre cualquier otra consideración estética.
- **Interaction patterns son producto-wide.** No hay un comportamiento de validación
  en un formulario y otro diferente en otro formulario del mismo producto.
- **Severidad 4 bloquea el pipeline.** Si la evaluación de usabilidad encuentra un
  problema catastrófico, no se avanza hasta resolverlo con un cambio de diseño.
- **El first success se define ANTES de diseñar los empty states.** Todo el onboarding
  — cada CTA, cada tooltip — apunta a ese primer éxito.
- **Documentar incluso si no se encuentran violaciones.** La evaluación de usabilidad
  debe existir aunque el resultado sea "ningún problema encontrado". Prueba que se revisó.

---

## Integración con Skills Upstream/Downstream

| Skill | Conexión |
|-------|---------|
| UX Research (#4) | Personas y modelos mentales → fuente primaria para la IA y el lenguaje de navegación. |
| User Stories (#5) | Los epics definen las áreas principales del producto (secciones top-level de nav). Los criterios de aceptación informan los interaction patterns. |
| UI Design Workflow (#7) | La IA define la estructura de navegación que respetan los screen flows. Los interaction patterns definen cómo se comportan los componentes. El onboarding define los empty states de cada pantalla. |

---

## Handoff al Skill #7

```
✅ Information Architecture → docs/ux-design/information-architecture.md
✅ Interaction Patterns → docs/ux-design/interaction-patterns.md
✅ Usability Evaluation → docs/ux-design/usability-evaluation/ (sin Severidad 4)
✅ Onboarding Strategy → docs/ux-design/onboarding.md

Siguiente: UI Design Workflow (Skill #7)
Tomará la IA y los interaction patterns para diseñar los screen flows
respetando la estructura de navegación y el comportamiento de controles
ya definidos.

¿Procedemos?
```
