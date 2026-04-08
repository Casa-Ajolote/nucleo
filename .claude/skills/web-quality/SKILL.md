---
name: web-quality
description: >
  Auditoría integral de calidad web basada en Google Lighthouse (150+ checks).
  Cubre Performance, Core Web Vitals, Accessibility (WCAG 2.1), SEO y Best Practices.
  Adaptado al Golden Path de Forge (Next.js 16, Tailwind, Vercel). Úsalo cuando el
  usuario pida auditar su sitio, revisar performance, mejorar SEO, accesibilidad,
  o hacer un quality check antes de deploy. Invocado por /web-audit.
---

# Web Quality — Auditoría Integral

> Basado en [web-quality-skills](https://github.com/addyosmani/web-quality-skills) de Addy Osmani.
> Adaptado al Golden Path de Forge: Next.js 16 + Tailwind 3.4 + Vercel.

## Cómo Funciona

1. Analizar el código/proyecto por problemas de calidad
2. Categorizar hallazgos por severidad (Critical, High, Medium, Low)
3. Proveer recomendaciones específicas y accionables
4. Incluir code examples para los fixes

## Categorías de Auditoría

### Performance (40% de issues típicos)

**Core Web Vitals** — Deben pasar para buena page experience:

| Métrica | Bueno | Necesita Mejora | Pobre |
|---------|-------|-----------------|-------|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | 2.5s – 4s | > 4s |
| **INP** (Interaction to Next Paint) | ≤ 200ms | 200ms – 500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | 0.1 – 0.25 | > 0.25 |

**Performance Budget:**

| Recurso | Budget | Notas Next.js |
|---------|--------|---------------|
| Página total | < 1.5 MB | Vercel Edge Cache ayuda |
| JavaScript (comprimido) | < 300 KB | Usar `next/dynamic` para code split |
| CSS (comprimido) | < 100 KB | Tailwind purge elimina unused |
| Imágenes above-fold | < 500 KB | Usar `next/image` con `priority` |
| Fonts | < 100 KB | Usar `next/font` (auto-optimized) |
| Third-party | < 200 KB | Lazy-load con `next/script` |

**Optimizaciones Next.js específicas:**
* Usar `next/image` con `priority` para LCP images
* Usar `next/font` para font optimization automática (no Google Fonts CDN)
* Usar `next/dynamic` con `{ ssr: false }` para componentes pesados
* Usar `React.memo`, `useMemo`, `useCallback` para INP
* Usar `useTransition` para state updates no urgentes
* Server Components por defecto — solo `'use client'` cuando necesario

→ *Ver [references/performance.md](references/performance.md) para guía completa*

### Accessibility (30% de issues típicos)

**WCAG 2.1 — Nivel AA obligatorio:**

**Perceivable:**
* Todo `<img>` con `alt` descriptivo. Decorativos: `alt=""`
* Contraste mínimo 4.5:1 (normal text), 3:1 (large text)
* No depender solo del color para comunicar información
* Video con captions, audio con transcripts

**Operable:**
* Todo accesible por teclado. Sin keyboard traps
* Focus visible en todos los elementos interactivos
* Skip links para navegación
* `prefers-reduced-motion` respetado

**Understandable:**
* `lang` en `<html>`
* Navegación consistente entre páginas
* Errores de form claramente descritos y asociados
* Labels en todos los inputs

**Robust:**
* HTML válido (sin IDs duplicados)
* ARIA usado correctamente (preferir elementos nativos)
* Elementos interactivos con accessible names

→ *Ver [references/accessibility.md](references/accessibility.md) para guía WCAG completa*

### SEO (15% de issues típicos)

**Crawlability:**
* `robots.txt` válido, no bloquea recursos importantes
* XML sitemap actualizado
* Canonical URLs para evitar contenido duplicado
* No `noindex` en páginas importantes

**On-Page SEO:**
* Title tags únicos (50-60 chars), keyword al inicio
* Meta descriptions únicas (150-160 chars)
* Heading hierarchy: un solo `<h1>`, estructura lógica
* Link text descriptivo (no "click here")

**Structured Data:**
* JSON-LD para rich snippets (Article, Product, FAQ, Breadcrumbs)
* Validar en Google Rich Results Test

**Next.js específico:**
* Usar `metadata` export en `layout.tsx` / `page.tsx`
* `generateMetadata()` para meta dinámico
* `sitemap.ts` para sitemap automático
* `robots.ts` para robots.txt programático

→ *Ver [references/seo.md](references/seo.md) para guía SEO completa*

### Best Practices (15% de issues típicos)

**Security:**
* HTTPS everywhere, sin mixed content
* No librerías vulnerables (`npm audit`)
* CSP headers configurados
* Sin source maps expuestos en producción

**Modern Standards:**
* HTML5 doctype, charset UTF-8 primero en `<head>`
* Viewport meta tag responsive
* No APIs deprecated (`document.write`, XHR síncrono)
* Passive event listeners para scroll/touch

**Code Quality:**
* Console limpia, sin errores
* HTML semántico (`<main>`, `<nav>`, `<article>`)
* Error handling apropiado (Error Boundaries en React)
* Memory cleanup en componentes

## Niveles de Severidad

| Nivel | Descripción | Acción |
|-------|-------------|--------|
| **Critical** | Vulnerabilidades de seguridad, fallos completos | Fix inmediato |
| **High** | Core Web Vitals fallan, barreras de a11y mayores | Fix antes de launch |
| **Medium** | Oportunidades de performance, mejoras SEO | Fix en el sprint |
| **Low** | Optimizaciones menores, calidad de código | Fix cuando convenga |

## Formato del Reporte

```markdown
## Resultados de Auditoría — [Nombre del Proyecto]

### Issues Críticos (X encontrados)
- **[Categoría]** Descripción del issue. Archivo: `path/to/file.tsx:123`
  - **Impacto:** Por qué importa
  - **Fix:** Cambio específico de código

### Alta Prioridad (X encontrados)
...

### Resumen
- Performance: X issues (Y críticos)
- Accessibility: X issues (Y críticos)
- SEO: X issues
- Best Practices: X issues

### Prioridad Recomendada
1. Primero arreglar esto porque...
2. Luego abordar...
3. Finalmente optimizar...
```

## Checklist Pre-Deploy

- [ ] Core Web Vitals pasando (LCP < 2.5s, INP < 200ms, CLS < 0.1)
- [ ] Sin errores de accessibility (Lighthouse score 100)
- [ ] Sin console errors
- [ ] HTTPS funcionando
- [ ] Meta tags presentes
- [ ] `npm audit` sin vulnerabilidades high/critical

## Lighthouse Score Targets

| Categoría | Target |
|-----------|--------|
| Performance | ≥ 90 |
| Accessibility | 100 |
| Best Practices | ≥ 95 |
| SEO | ≥ 95 |
