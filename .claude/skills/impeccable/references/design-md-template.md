# DESIGN.md Template — Forge Extended

> Basado en el spec de [Google Stitch](https://stitch.withgoogle.com/docs/design-md/overview),
> extendido con Motion, Anti-AI-Slop y Generation Notes para el ecosistema Forge.

## Propósito

`DESIGN.md` es el **source of truth portable** de las decisiones de diseño de un proyecto.
Vive en el root del proyecto (junto a `CLAUDE.md`) y es consumido por:

- **Stitch MCP** → genera pantallas consistentes con el design system
- **Impeccable skill** → valida calidad visual contra las decisiones documentadas
- **Comandos** → `/critique`, `/polish`, `/normalize` lo usan como referencia
- **Agentes** → Design Critic, Frontend Specialist lo leen antes de evaluar/implementar
- **AI Studio / Antigravity** → portable a otros entornos de desarrollo con IA

## Cuándo se genera

| Contexto | Quién genera DESIGN.md |
|----------|------------------------|
| `/plan` (Skill #8 — UI) | Se genera automáticamente junto con `UI-[nombre].md` |
| `/design` | Comando standalone — genera desde cero, extrae de Stitch, o actualiza |
| `/landing` (Ruta A) | Si no existe, el Step 3 genera uno básico |

## Cuándo se consume

| Comando | Cómo lo usa |
|---------|-------------|
| `/critique` | Referencia primaria para evaluar desviaciones |
| `/polish` | Valida consistencia de tokens y decisiones |
| `/normalize` | Alinea UI con las decisiones documentadas |
| `/landing` | Respeta paleta, tipografía y tono si existe |
| `/build` | Los agentes lo leen antes de implementar UI |

---

## Estructura del Archivo

```markdown
# Design System: [Project Title]

## 1. Visual Theme & Atmosphere

(Descripción evocativa del mood, densidad visual y filosofía estética.
Usar adjetivos que capturen la sensación: "airy", "grounded", "utilitarian",
"editorial", "sanctuary-like". Explicar POR QUÉ esta dirección.)

**Key Characteristics:**
- [3-5 bullets describiendo los rasgos visuales dominantes]

---

## 2. Color Palette & Roles

### Primary Foundation
- **[Nombre Descriptivo]** ([hex]) — [Rol funcional]. [Por qué este color.]

### Accent & Interactive
- **[Nombre Descriptivo]** ([hex]) — [Rol funcional].

### Typography & Text Hierarchy
- **[Nombre Descriptivo]** ([hex]) — Primary text
- **[Nombre Descriptivo]** ([hex]) — Secondary text
- **[Nombre Descriptivo]** ([hex]) — Borders, dividers

### Functional States
- **Success:** [nombre] ([hex])
- **Error:** [nombre] ([hex])
- **Warning:** [nombre] ([hex])
- **Info:** [nombre] ([hex])

> **Regla Forge:** Usar OKLCH o color-mix() cuando sea posible.
> Tint neutrales hacia el brand hue. NO pure black (#000) ni pure white (#fff).

---

## 3. Typography Rules

**Primary Font:** [Nombre] — [Carácter: por qué esta fuente]

### Hierarchy & Weights
- **Display (H1):** [weight], [size], [letter-spacing]
- **Section Headers (H2):** [weight], [size], [letter-spacing]
- **Subsection (H3):** [weight], [size]
- **Body:** [weight], [line-height], [size]
- **Small/Meta:** [weight], [size]
- **CTA Buttons:** [weight], [letter-spacing], [size]

### Spacing Principles
- [Reglas de letter-spacing, line-height, vertical rhythm]

> **Regla Forge:** NUNCA Inter, Roboto, Arial o system-ui como fuente principal.
> Usar modular type scale con fluid sizing (clamp()).

---

## 4. Component Stylings

### Buttons
- **Shape:** [Descripción — no "rounded-lg", sino "Subtly rounded corners (8px)"]
- **Primary CTA:** [Color] + [text color] + [padding]
- **Hover:** [Comportamiento + timing]
- **Secondary:** [Estilo]

### Cards & Containers
- **Corners:** [Descripción + valor]
- **Background:** [Color + tratamiento]
- **Shadow:** [Estilo — "Flat", "Whisper-soft diffused", "Dramatic"]
- **Hover:** [Comportamiento]

### Navigation
- **Style:** [Horizontal/sidebar, spacing]
- **Active state:** [Indicador visual]
- **Mobile:** [Comportamiento responsive]

### Inputs & Forms
- **Stroke:** [Estilo de borde]
- **Background:** [Color]
- **Focus:** [Estado de foco]
- **Error:** [Presentación de errores]

---

## 5. Layout Principles

### Grid & Structure
- **Max width:** [valor]
- **Grid:** [Columnas, gutters]
- **Breakpoints:** Mobile (<768), Tablet (768-1024), Desktop (>1024)

### Whitespace Strategy
- **Base unit:** [valor]
- **Section margins:** [valor — generoso vs compacto]
- **Edge padding:** [mobile vs desktop]

### Alignment
- **Text:** [left-aligned / centered — cuándo cada uno]
- **Image:text ratio:** [proporción]
- **Touch targets:** Mínimo 44x44px

---

## 6. Motion & Animation

(Sección Forge — no existe en el spec de Google Stitch.)

### Philosophy
[¿Qué rol juega el motion en este proyecto? Staggered reveals, feedback sutil, etc.]

### Timing & Easing
- **Micro-interactions:** [duración] + [easing]
- **Page transitions:** [duración] + [easing]
- **Stagger delay:** [valor entre items]

### Rules
- Solo animar `transform` y `opacity` (60fps)
- Respectar `prefers-reduced-motion`
- Easing: [exponential preferred — ease-out-quart/quint]

> **Referencia:** `.claude/skills/impeccable/references/motion-design.md`

---

## 7. Anti-AI-Slop Markers

(Sección Forge — patrones específicos a EVITAR en este proyecto.)

### Patrones Prohibidos
- [ ] NO [patrón específico identificado para este proyecto]
- [ ] NO [patrón específico identificado para este proyecto]

### El Test
> Si le mostraras esta interfaz a alguien y dijeras "la hizo una IA",
> ¿te creerían inmediatamente? Si sí, hay un problema.

### Diferenciador Visual
[¿Qué hace este UI MEMORABLE? ¿Qué detalle va a recordar el usuario?]

> **Referencia:** `.claude/skills/impeccable/SKILL.md` → The AI Slop Test

---

## 8. Design System Notes for Generation

(Para re-generar pantallas consistentes — compatible con Stitch y otros agentes.)

### Lenguaje Descriptivo
- **Atmósfera:** "[Frase evocativa que capture el mood]"
- **Buttons:** "[Descripción natural — no clases CSS]"
- **Shadows:** "[Descripción natural — no valores]"
- **Spacing:** "[Descripción natural]"

### Color References
Siempre usar nombre descriptivo + hex:
- Primary CTA: "[Nombre] ([hex])"
- Background: "[Nombre] ([hex])"
- Text: "[Nombre] ([hex])"

### Component Prompts
- "[Prompt natural para re-generar el componente principal]"
- "[Prompt natural para re-generar cards]"
- "[Prompt natural para re-generar navegación]"
```

---

## Reglas de Escritura

1. **Lenguaje evocativo** — No "blue", sino "Ocean-deep Cerulean (#0077B6)"
2. **Siempre hex codes** — Nombre descriptivo + hex en paréntesis
3. **Traducir CSS a lenguaje natural** — No "rounded-xl", sino "generously rounded corners"
4. **Explicar el POR QUÉ** — No solo qué, sino por qué esa decisión
5. **Roles funcionales** — Cada color, font y componente tiene un rol claro
6. **Consistencia terminológica** — Mismos nombres a lo largo del documento
