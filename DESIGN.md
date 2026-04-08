# Design System: Nucleo

## 1. Visual Theme & Atmosphere

Nucleo adopta la estética de Notion light: limpia, documental, casi tipográfica. El fondo es blanco puro, el sidebar es gris suave, todo el "peso visual" viene del contenido, no de la decoración. La sensación es la de un bloc de notas bien organizado — no una app de marketing, no un dashboard lleno de métricas.

Es una herramienta íntima de uso diario. El diseño no llama la atención sobre sí mismo.

**Key Characteristics:**
- Fondo blanco puro con sidebar en gris muy suave
- Tipografía sans-serif limpia con jerarquía clara por peso y tamaño
- Sin gradientes, sin sombras dramáticas, sin ornamentos
- Estados hover con fondo gris muy tenue
- Un único acento azul para acciones primarias e interactivos

---

## 2. Color Palette & Roles

### Primary Foundation
- **Canvas White** (`#FFFFFF`) — Fondo del área de contenido principal
- **Sidebar Warm** (`#F7F6F3`) — Fondo del sidebar y paneles secundarios
- **Hover Mist** (`#EBEBEA`) — Hover sobre items navegables, selected state
- **Selection Blue** (`#E8F0FD`) — Selected state con acento azul (workspace activo)

### Accent & Interactive
- **Notion Blue** (`#2383E2`) — Links, botón primary, estados activos, focus ring
- **Blue Hover** (`#1D6EC7`) — Hover sobre elementos azules

### Typography & Text Hierarchy
- **Ink** (`#37352F`) — Texto primario (títulos, labels, body)
- **Muted** (`#787774`) — Texto secundario (metadatos, timestamps, placeholders muted)
- **Placeholder** (`#9B9A97`) — Placeholder en inputs
- **Divider** (`#E3E2E0`) — Bordes, separadores, divisores

### Functional States
- **Success:** `#0F7B6C` (verde oscuro Notion)
- **Error:** `#EB5757` (rojo Notion)
- **Warning:** `#DFAB01` (amarillo Notion)
- **Info:** `#2383E2` (mismo que el accent)

---

## 3. Typography Rules

**Primary Font:** Geist Sans — limpia, moderna, sin rasgos de serif. Muy similar a la tipografía de Notion en personalidad (neutral, documental, funcional) pero con su propia identidad.

### Hierarchy & Weights
- **Display (H1):** 600, 24px, tracking -0.02em
- **Section Headers (H2):** 600, 18px, tracking -0.01em
- **Subsection (H3):** 500, 14px, tracking 0
- **Body:** 400, 14px, line-height 1.5
- **Small/Meta:** 400, 12px, color Muted
- **CTA Buttons:** 500, 14px, tracking 0

### Spacing Principles
- Line height 1.5 para body, 1.2 para headings
- Letter-spacing negativo en headings grandes (-0.02em)
- Scale: 12 / 14 / 18 / 24px — cuatro tamaños, no más

---

## 4. Component Stylings

### Buttons
- **Shape:** Ligeramente redondeado (6px)
- **Primary CTA:** Azul `#2383E2` + texto blanco + padding 8px 16px, font-weight 500
- **Hover:** `#1D6EC7`, transición 150ms ease
- **Secondary/Ghost:** Transparente, texto Ink, hover con `#EBEBEA` fondo
- **Destructive:** Texto `#EB5757`, hover fondo `#FFF0F0`
- **Disabled:** Opacidad 40%, cursor not-allowed

### Cards & Containers
- **Corners:** 8px
- **Background:** Blanco (`#FFFFFF`)
- **Border:** 1px solid `#E3E2E0`
- **Shadow:** `0 1px 3px rgba(0,0,0,0.06)` — casi invisible, sólo da profundidad
- **Hover:** border-color `#C7C6C4`, shadow `0 2px 6px rgba(0,0,0,0.09)`

### Navigation (Sidebar)
- **Background:** `#F7F6F3`
- **Item default:** texto Muted `#787774`, sin fondo
- **Item hover:** fondo `#EBEBEA`, texto Ink `#37352F`
- **Item active:** fondo `#E8F0FD`, texto Notion Blue `#2383E2`, font-weight 500
- **Sección headers:** texto `#9B9A97`, 11px, uppercase, tracking 0.08em
- **Width desktop:** 240px fixed
- **Mobile:** drawer (off-canvas)

### Inputs & Forms
- **Border:** 1px solid `#E3E2E0`
- **Background:** `#FFFFFF`
- **Radius:** 6px
- **Padding:** 8px 12px
- **Focus:** border-color `#2383E2`, box-shadow `0 0 0 2px rgba(35,131,226,0.15)`
- **Error:** border-color `#EB5757`, box-shadow `0 0 0 2px rgba(235,87,87,0.15)`
- **Placeholder:** `#9B9A97`

---

## 5. Spacing & Layout

- **Base unit:** 4px
- **Content padding:** 24px desktop, 16px mobile
- **Section gap:** 32px
- **Item gap en grid:** 12px
- **Sidebar padding:** 8px horizontal
- **Max content width:** 1200px

---

## 6. Motion & Transitions

- **Duración estándar:** 150ms ease — hover states, color changes
- **Duración apertura de modals/drawers:** 200ms ease-out
- **Duración cierre:** 150ms ease-in
- **Card entrada en grid:** fade-in 200ms + translate-y 4px → 0
- **Skeleton pulse:** 1.5s infinite (opacity 0.5 → 1)
- **Sin bounce, sin spring dramático** — motion es sutil y funcional

---

## 7. Anti-AI-Slop Rules

- ✗ No Inter como fuente principal (usar Geist)
- ✗ No gradiente azul/morado sobre blanco
- ✗ No cards con sombra dramática tipo dashboard
- ✗ No paleta arco-iris de colores
- ✗ No border-radius > 8px en containers (no pill-shaped cards)
- ✗ No "hero section" ni ilustraciones vectoriales genéricas
- ✓ Lo que hace memorable a Nucleo: la fidelidad absoluta a la estética Notion — el usuario que ya conoce Notion se siente en casa inmediatamente

---

## 8. Generation Notes

- Framework: Next.js 16 + React 19 + TypeScript
- CSS: Tailwind CSS 3.4 + CSS custom properties para los tokens
- Components: Radix UI primitives (sin shadcn — implementado manualmente)
- Icons: Lucide React
- Forms: react-hook-form + zod v4
- Navegación: sidebar fijo en desktop (240px), drawer en mobile
- FAB: siempre visible en esquina inferior derecha, color `#2383E2`
