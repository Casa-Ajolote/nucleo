# Componentes Premium — 21st.dev + Landingfolio

> *Referencia opcional para elevar la calidad visual de landing pages. Ninguna de estas herramientas es un requisito — son potenciadores.*

---

## 21st.dev — Componentes Premium para shadcn/ui

### Qué es

Librería de componentes premium compatibles con shadcn/ui. Se instalan igual que componentes shadcn pero con diseño más elaborado: hero sections, testimonial cards, pricing tables, etc.

### Cómo instalar

```bash
npx shadcn@latest add "https://21st.dev/r/[component-url]"
```

### Componentes prioritarios para landing pages

| Tipo | Para qué usarlo |
|------|-----------------|
| **Hero sections** | Reemplazar el típico "texto izquierda + imagen derecha" |
| **Testimonial cards** | Social proof con diseño no genérico |
| **Pricing tables** | Tablas que se sienten custom, no template |
| **Feature grids** | Layouts asimétricos o bento grid |
| **CTA sections** | Urgencia visual con diseño elaborado |

### Regla de oro

**NUNCA usar un componente de 21st.dev "as is".** Siempre customizar:

- ✅ Colores de marca (reemplazar los defaults)
- ✅ Copy real del usuario (no el placeholder)
- ✅ Spacing adaptado al ritmo de la página
- ✅ Breakpoints verificados en mobile
- ❌ Copiar y pegar sin cambios

---

## Tiers de Degradación

### Tier 1: 21st.dev disponible
Instalar componentes premium, customizar con marca del usuario. Mejor resultado visual.

### Tier 2: Solo shadcn/ui
Usar componentes base de shadcn/ui con heavy customization:
- Cambiar border-radius, shadows, spacing
- Añadir variantes de color con HSL variables
- Aplicar las reglas de `landing-anti-slop.md`
- Resultado: muy bueno si se aplican las guidelines

### Tier 3: Tailwind puro + Design System Forge
Construir desde cero con Tailwind siguiendo uno de los 5 design systems de Forge:
- **Bento Grid** (recomendado para features)
- **Liquid Glass** (premium, moderna)
- **Gradient Mesh** (dinámica)
- **Neobrutalism** (bold, energética)
- **Neumorphism** (soft, táctil)

**Regla:** La calidad de la landing NO depende de 21st.dev. Depende de tipografía, color, layout y copy. Los componentes premium aceleran, no definen.

---

## Landingfolio.com — Inspiración Real

### Qué es

Directorio de landing pages reales de startups y empresas. No son templates — son referencias de diseño para estudiar.

### Cómo usarlo

1. Buscar por nicho/industria del usuario (ej: "fitness", "SaaS", "coaching")
2. Identificar patrones que funcionan:
   - ¿Cómo manejan el hero?
   - ¿Qué tipo de social proof usan?
   - ¿Cómo presentan pricing?
   - ¿Qué tipografía y colores se sienten premium?
3. Extraer el **patrón**, no copiar el diseño
4. Adaptar al stack Forge (Next.js + Tailwind + shadcn/ui)

### Cuándo usarlo

- Al inicio del Step 3 (Diseño Visual) de la ruta Landing Page
- Cuando el usuario dice "quiero algo como [referencia]"
- Cuando la página se siente genérica y necesitas inspiración fresca

---

## Notas importantes

- 21st.dev puede requerir cuenta o tener limitaciones en free tier
- Si `npx shadcn@latest add` falla con una URL de 21st.dev → caer a Tier 2 sin fricción
- Landingfolio es solo para inspiración — no copiar layouts literalmente
- Estas herramientas complementan las guidelines de Impeccable, no las reemplazan
