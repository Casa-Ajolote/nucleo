# Skill #4 — UX Research

> *"Discovery before design. Sin esto, estás adivinando."*

## Qué Hace Este Skill

Define quiénes son los usuarios reales del producto, cómo piensan, qué hacen hoy, y dónde se frustran. Cada decisión de diseño downstream — wireframes, flujos, pantallas — se ancla en esta investigación.

Produce tres tipos de documentos interconectados:

1. **Personas** — Los arquetipos de usuario derivados del VPC. Son los personajes para los que se diseña cada pantalla.
2. **Modelos Mentales** — Cómo cada persona *piensa* sobre el dominio del problema. Determina la arquitectura de información y los patrones de interacción.
3. **Journey Maps** — El recorrido completo de cada persona hacia su objetivo: qué hace, qué piensa, qué siente, dónde se atasca.

**Por qué va antes de User Stories:** Las User Stories sin personas son abstracciones sin sujeto. Los journey maps revelan qué actividades deben existir en el backbone del story map y cuáles son Must Have vs. nice-to-have.

---

## Inputs Requeridos

- `VPC-[nombre].md` — Del Skill #1 (Business Model Canvas). Las personas se derivan directamente de los Customer Jobs y segmentos del VPC.
- `PDR-[nombre].md` — Del Skill #2. Contexto adicional del producto y su alcance.

---

## Referencias (leer cuando se indique)

- **Personas:** `.claude/skills/la-herreria/references/personas.md`
- **Modelos Mentales:** `.claude/skills/la-herreria/references/mental-models.md`
- **Journey Mapping:** `.claude/skills/la-herreria/references/journey-mapping.md`

---

## Workflow

### Paso 1: Definir Personas

Las personas son los personajes del producto. Cada decisión de diseño posterior se toma "para" una persona específica.

**Leer:** `.claude/skills/la-herreria/references/personas.md`

**Protocolo:**
1. Leer el `VPC-[nombre].md` — cada tipo de persona que ejecuta Customer Jobs es una persona candidata
2. Agrupar jobs que hace el mismo tipo de persona (máximo 2-4 personas por producto)
3. Definir 1 persona primaria — el producto se optimiza para ella
4. Para cada persona: Background, Goals (de VPC gains), Frustrations (de VPC pains), Current Behavior, Technical Comfort, Quotes, Design Implications

**Output:** `docs/ux-research/personas/[persona-name].md` (una por persona)

---

### Paso 2: Mapear Modelos Mentales

Los modelos mentales capturan cómo cada persona *piensa* sobre el dominio — no cómo funciona el sistema, sino cómo el usuario lo conceptualiza.

**Leer:** `.claude/skills/la-herreria/references/mental-models.md`

**Fuentes para identificar el modelo mental:**
- ¿Qué herramienta usa hoy para hacer este job? (el modelo mental está embebido en esa herramienta)
- ¿A qué objeto físico o proceso mapea este dominio en su mente?
- ¿Qué patrones de software conocido aplica? (inbox, file system, shopping cart, spreadsheet)

**Output:** `docs/ux-research/mental-models/[persona-name]-[dominio].md`

---

### Paso 3: Mapear Journey Maps

Un journey map traza a una persona a través de un objetivo específico — desde que se da cuenta que necesita algo hasta que lo logra. Revela los pain points que el producto debe resolver y las oportunidades de deleite.

**Leer:** `.claude/skills/la-herreria/references/journey-mapping.md`

**5 fases de cada journey:**
1. **Become Aware** — Qué dispara la necesidad
2. **Decide** — Cómo evalúa opciones
3. **Act** — El recorrido dentro del producto (más largo)
4. **Verify** — Cómo confirma que funcionó
5. **Reflect** — Qué opina de la experiencia

**Para cada fase:** Pasos → Touchpoints → Pensamientos → Emociones 😤→😐→😊→😄 → Pain Points → Oportunidades

**Output:** `docs/ux-research/journeys/[persona-name]-[objetivo].md`

---

### Paso 4: Actualizar el VPC

Los hallazgos de la investigación fluyen de regreso al VPC. Las personas revelan cuáles Customer Jobs importan más. Los journey maps revelan cuáles pains son más severos y cuáles gains son más valorados.

Actualizar `VPC-[nombre].md` con los hallazgos antes de continuar al Skill #5.

---

## Estructura de Output

```
docs/
└── ux-research/
    ├── personas/
    │   ├── [persona-primaria].md
    │   └── [persona-secundaria].md
    ├── mental-models/
    │   ├── [persona-primaria]-[dominio].md
    │   └── [persona-secundaria]-[dominio].md
    └── journeys/
        ├── [persona-primaria]-[objetivo-principal].md
        └── [persona-secundaria]-[objetivo-principal].md
```

---

## Naming Convention

| Documento | Archivo |
|-----------|---------|
| Persona | `docs/ux-research/personas/[nombre-kebab].md` |
| Mental Model | `docs/ux-research/mental-models/[persona]-[dominio].md` |
| Journey Map | `docs/ux-research/journeys/[persona]-[objetivo].md` |

Usar nombres reales de personas (ej: `sarah`, `marcus`) en kebab-case.

---

## Reglas Críticas

- **2-4 personas máximo.** Más significa que el producto sirve a demasiados segmentos distintos.
- **1 persona primaria.** El producto se optimiza para ella. Las secundarias se benefician pero no dictan el diseño.
- **Mapear el estado actual primero.** Cómo el usuario hace el job HOY, sin el producto. Luego el estado futuro. La diferencia entre ambos es exactamente lo que el producto debe hacer.
- **Pain points del journey = features Must Have.** Si un pain aparece en la fase Act del journey, existe un Must Have en el story map.
- **NO inventar personas.** Se derivan del VPC. Si el VPC dice que los segmentos son X e Y, las personas son X e Y.

---

## Integración con Skills Downstream

| Skill | Cómo consume el UX Research |
|-------|---------------------------|
| User Stories (#5) | Los Customer Jobs → Epics. El backbone del story map sigue el journey map |
| Wireframes (#6) | Los modelos mentales determinan la arquitectura de información y los patrones |
| UI/UX (#7) | Las emociones del journey map informan el tono visual y los momentos de deleite |
| Blueprint (#8) | Las features Must Have priorizan las fases del plan de ejecución |

---

## Handoff al Skill #5

```
✅ Personas definidas: [N] personas ([nombre primaria] — primaria)
✅ Modelos mentales: [N] documentos
✅ Journey maps: [N] mapas
✅ VPC actualizado con hallazgos

Siguiente: User Stories (Skill #5)
Las personas y journeys alimentan directamente el story map —
cada actividad del backbone se deriva de los jobs y fases del journey.

¿Procedemos?
```
