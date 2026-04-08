# Route: 🎯 Landing Page

> *"Primero piensa, después codifica. Copy aprobado antes del primer componente."*

## Metadata

- **Modo:** 🎯 Landing Page
- **Descripción:** Página de alta conversión con pipeline copy-first y anti-AI-slop visual.
- **Tiempo estimado:** ~1 hora
- **Steps activos:** 4 + checkpoint de calidad
- **Cuándo usar:** Cuando necesitas una página que convierte — no una app

---

## Pipeline

```
Definición Rápida → Copywriting & Mensajería → Diseño Visual → [Review Anti-IA] → SEO & Deploy
      Step 1               Step 2                  Step 3          Checkpoint         Step 4
      10 min               20 min                  25 min           5 min             5 min
```

**No usa:** BMC completo, PDR, Tech Spec, UX Research, User Stories, UX Design, UI Workflow, Security Audit, Blueprint

---

### Step 1 · Definición Rápida

- **Asset:** Ninguno — entrevista directa
- **Output:** `LANDING-BRIEF-[nombre].md` (inline, no archivo separado)
- **Tiempo:** ~10 min
- **Qué hace:** Captura lo esencial para construir la landing

#### Preguntas obligatorias

1. *"¿Qué es exactamente lo que ofreces? Una frase."*
2. *"¿A quién va dirigido? Describe a esa persona."*
3. *"¿Cuál es el mayor dolor/problema que resuelves?"*
4. *"¿Cuál es el CTA principal? (registrarse, comprar, agendar llamada, unirse a waitlist)"*
5. *"¿Tienes prueba social? (testimonios, logos de clientes, métricas)"*
6. *"¿Hay urgencia o escasez? (early access, precio especial por tiempo limitado)"*
7. *"¿Tono? (profesional, casual, técnico, aspiracional, provocador, premium)"*

#### Preguntas nuevas (del Humanizador)

8. *"¿Hay alguna landing page que admires? Pasa la URL."*
9. *"¿Estilo visual? (bento-grid por defecto, o elige: liquid-glass, neobrutalism, neumorphism, gradient-mesh)"*

#### Preguntas opcionales

10. ¿Tienes logo? (SVG preferido)
11. ¿Tienes testimonios escritos o screenshots de mensajes/reviews?
12. ¿Hay un deadline o urgencia real?
13. ¿Es standalone o parte de un funnel?
14. ¿Colores de marca? (Si no tiene, proponer paleta)

**PUNTO DE CONTROL:** No avanzar a Step 2 sin respuestas a las preguntas 1-7.

---

### Step 2 · Copywriting & Mensajería

- **Asset:** `assets/copywriting-cro.md` (incluye Reglas Anti-IA de Copy)
- **Referencia adicional:** `impeccable/references/landing-anti-slop.md` → sección Checklist Copy
- **Output:** `COPY-[nombre].md` con toda la jerarquía de mensajería
- **Tiempo:** ~20 min
- **Inputs requeridos:** `LANDING-BRIEF-[nombre].md` del Step 1

#### Qué hace

Genera el copy completo ANTES de tocar código. Este es el paso más importante — copy mediocre con diseño premium sigue siendo mediocre.

#### Workflow de aprobación progresiva

1. **Primero:** Definir jerarquía de mensajes (Pain / Gain / Differentiator / Proof / CTA)
2. **Después:** Presentar 3 variaciones de headline (Outcome / Problem / Differentiation)
3. **Aprobar:** El usuario elige headline → generar subheadline y CTA button copy
4. **Luego:** Generar copy de todas las secciones restantes
5. **Presentar resumen:** Mostrar el copy completo por secciones para aprobación final

#### Reglas activas

- Aplicar las **Reglas Anti-IA de Copy** del `copywriting-cro.md`:
  - Frases prohibidas: "Bienvenido a", "Solución integral", etc.
  - Tono café, no brochure
  - Botones en primera persona
  - Micro-copy de confianza
- Psicología aplicada: Loss Aversion, Social Proof, Goal-Gradient, Hyperbolic Discounting
- Form CRO: mínimo de campos según tipo de landing

#### ⛔ PUNTO DE CONTROL CRÍTICO

> **Todo el copy debe estar aprobado por el usuario ANTES de empezar Step 3.**
> No se escribe ni una línea de código hasta que el `COPY-[nombre].md` esté aprobado.
> Esta es la regla #1 del pipeline. Copy primero, código después.

---

### Step 3 · Diseño Visual

- **Asset:** `assets/front-end-design.md` → activa skill Impeccable
- **Referencias adicionales:**
  - `impeccable/references/landing-anti-slop.md` → anti-patrones visuales, tipografía, color, layout
  - `la-herreria/references/premium-components.md` → 21st.dev + Landingfolio (opcional)
- **Output:** Landing implementada en `src/features/landing/`
- **Tiempo:** ~25 min
- **Inputs requeridos:** `COPY-[nombre].md` aprobado

#### Estructura de 10 secciones

Seguir este orden. Cada sección construye sobre la anterior:

```
1. Navbar      — Logo + máx 3 links + CTA button. Sticky con backdrop-blur.
2. Hero        — Headline resultado + subheadline + CTA + visual real + social proof badge
3. Problema    — 3 pain points en lenguaje del usuario. Storytelling, no bullets corporativos
4. Solución    — 3-4 pasos. Proceso, no features. Ícono/número + título + una línea
5. Features    — Bento grid o asimétrico. Resultado, no especificación técnica
6. Social Proof — Testimonios con nombre + foto + resultado. O screenshots de DMs/tweets
7. Pricing     — Anclaje de precio + máx 3 tiers + highlight recomendado + garantía
8. FAQ         — 4-5 objeciones REALES. Respuestas directas, no corporativas
9. CTA Final   — Repite headline del hero + CTA grande + micro-garantía
10. Footer     — Logo + links legales + contacto. Nada más
```

**Nota:** Pricing y Social Proof son opcionales según el tipo de landing. Omitir si no aplican.

#### Reglas de código

1. **Fuentes:** Google Fonts premium via `next/font/google` — ver pairings en `landing-anti-slop.md`
2. **Colores:** HSL variables en `globals.css` — ver patrón en `landing-anti-slop.md`
3. **Layout:** Bento grid para features, ritmo variable de spacing, asimetría
4. **Componentes premium:** Consultar `premium-components.md` para 21st.dev (opcional, Tier 1-3)
5. **Imágenes:** `next/image` siempre. Reales > stock. Si no hay: tipografía + color
6. **Responsive:** Mobile-first. Hero en 375px. Touch targets 48px. Body 16px mín
7. **Performance:** Lazy load below the fold. Solo fonts que uses. LCP < 2.5s
8. **Design system:** Aplicar el sistema elegido en Step 1 pregunta 9 (bento-grid por defecto)

#### Arquitectura de archivos (Feature-First)

```
src/features/landing/
├── components/
│   ├── navbar.tsx
│   ├── hero.tsx
│   ├── problem.tsx
│   ├── solution.tsx
│   ├── features.tsx
│   ├── testimonials.tsx
│   ├── pricing.tsx
│   ├── faq.tsx
│   ├── cta-final.tsx
│   └── footer.tsx
└── index.tsx            ← Exporta el componente LandingPage completo

src/app/page.tsx         ← Importa y renderiza <LandingPage />
  (o src/app/[ruta]/page.tsx si es ruta custom)
```

#### No construir

- Auth, base de datos, backend — solo estático o Server Components
- **Excepción:** Si hay formulario de captación → API route mínima (`src/app/api/waitlist/route.ts`)

---

### Checkpoint · Review Anti-IA

- **Referencia:** `impeccable/references/landing-anti-slop.md` → Checklist Review Anti-IA
- **Tiempo:** ~5 min
- **Qué hace:** Validación rápida antes de SEO/Deploy

#### Proceso

1. Pasar la **Checklist Review Anti-IA** (21 puntos: Visual + Copy + Técnico)
2. Si **3+ puntos fallan** → volver a Step 3 y corregir
3. Si pasa → compartir screenshot/preview con el usuario
4. Preguntar: *"¿Se siente diseñada por humano o por IA?"*
5. Si el usuario dice que se ve IA → usar las **soluciones de recuperación** de `landing-anti-slop.md`

---

### Step 4 · SEO & Deploy

- **Asset:** `assets/seo-landing.md`
- **Output:** Landing desplegada con URL pública + SEO implementado
- **Tiempo:** ~5 min
- **Inputs requeridos:** `COPY-[nombre].md` (para title, description) + landing validada

#### Qué hace

- `metadata` export en `layout.tsx`: title, description, og:image, twitter:card
- JSON-LD: Organization + WebPage + FAQPage (si aplica)
- `public/robots.txt` con GPTBot, PerplexityBot, ClaudeBot, Google-Extended habilitados
- Verificar LCP < 2.5s con `<Image priority>` en hero
- Deploy con `vercel --prod` o push a main

---

## Outputs Finales

| Entregable | Generado en |
|-----------|-------------|
| `COPY-[nombre].md` (mensajería completa y aprobada) | Step 2 |
| `src/features/landing/` (landing implementada) | Step 3 |
| Checklist Anti-IA passed | Checkpoint |
| URL pública en Vercel | Step 4 |

---

## Qué se Omite y Por Qué

| Elemento omitido | Razón |
|-----------------|-------|
| BMC / PDR | La landing es el experimento — el business model se define si convierte |
| UX Research | Una landing tiene un usuario objetivo claro desde el brief |
| User Stories | No hay features — hay secciones y un CTA |
| UX Design | La landing tiene estructura probada + anti-slop guidelines |
| Security Audit | No hay datos sensibles ni backend complejo |
| Blueprint | La landing se construye y se itera — no necesita plan de fases |

---

*"Copy aprobado antes del primer componente. Diseño con identidad antes del deploy. Así se hace una landing que convierte."*
