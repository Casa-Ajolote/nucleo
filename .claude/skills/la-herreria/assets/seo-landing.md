# SEO & Deploy — Landing Page

> *"Una landing que nadie encuentra es un trabajo desperdiciado."*

Skill especializado para preparar y desplegar una landing page con SEO técnico, visibilidad en motores de IA y Core Web Vitals optimizados. Combina on-page SEO clásico + AI SEO (GEO/AEO) + deploy en Vercel.

---

## Inputs Requeridos

Antes de implementar, confirmar que tienes del proceso anterior:
- ✅ `COPY-[nombre].md` — headline, meta description, keywords objetivo
- ✅ Landing implementada en `src/app/page.tsx`
- ✅ Nombre del proyecto / dominio destino
- ✅ Open Graph image (`public/og-image.png`, 1200×630px) — o generar placeholder

Si falta el og-image, crear uno básico con el headline de la landing.

---

## FASE 1: Metadata en Next.js

### 1.1 — `src/app/layout.tsx`

Implementar el export `metadata` con todos los campos:

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  // === BÁSICO ===
  title: {
    default: '[Headline principal de la landing]',
    template: '%s | [Nombre del proyecto]',
  },
  description: '[150-160 chars: propuesta de valor + CTA implícito. Incluir keyword principal.]',
  keywords: ['keyword-principal', 'keyword-secundaria', 'keyword-long-tail'],

  // === OPEN GRAPH (redes sociales + WhatsApp + Slack) ===
  openGraph: {
    type: 'website',
    locale: 'es_MX', // o 'es_ES', 'en_US' según el mercado
    url: 'https://[dominio].com',
    siteName: '[Nombre del proyecto]',
    title: '[Headline principal — mismo que title o variante más social]',
    description: '[Misma description o versión más conversacional]',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '[Descripción del og-image con keyword]',
      },
    ],
  },

  // === TWITTER / X CARDS ===
  twitter: {
    card: 'summary_large_image',
    title: '[Headline para Twitter/X]',
    description: '[Máximo 200 chars para Twitter]',
    images: ['/og-image.png'],
    creator: '@[handle si existe]',
  },

  // === INDEXACIÓN ===
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // === VERIFICACIÓN (si aplica) ===
  // verification: {
  //   google: '[Google Search Console verification token]',
  // },
}
```

**Reglas del title tag:**
- Máximo 60 caracteres (incluye nombre de marca)
- Keyword principal en los primeros 30 chars si es posible
- Ejemplo: `"Cierra más ventas con IA | NombreApp"` ✅
- Evitar: `"Bienvenido a NombreApp — La mejor solución para..."` ❌

**Reglas de la meta description:**
- 150-160 caracteres exactos
- Incluir CTA implícito ("Empieza gratis", "Descubre cómo")
- Voz activa, no pasiva
- Evitar comillas dobles (rompen el HTML)

---

## FASE 2: Datos Estructurados (Schema.org JSON-LD)

Agregar en `src/app/layout.tsx` o como componente `<JsonLd>`:

### 2.1 — Organization (siempre incluir)

```typescript
// src/app/layout.tsx — dentro del <head> via Script o directamente
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: '[Nombre del proyecto/empresa]',
  url: 'https://[dominio].com',
  logo: 'https://[dominio].com/logo.png',
  description: '[Qué hace la empresa en 1 oración]',
  sameAs: [
    // Redes sociales y perfiles verificados
    'https://twitter.com/[handle]',
    'https://linkedin.com/company/[slug]',
  ],
}
```

### 2.2 — WebPage / SoftwareApplication

Para landing de producto SaaS:

```typescript
const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '[Nombre del producto]',
  applicationCategory: 'BusinessApplication',
  description: '[Propuesta de valor en 1-2 oraciones]',
  offers: {
    '@type': 'Offer',
    price: '[precio]', // '0' si es gratis, o precio real
    priceCurrency: 'USD',
    description: '[Descripción del plan o tier]',
  },
  aggregateRating: {
    // SOLO si tienes ratings reales
    '@type': 'AggregateRating',
    ratingValue: '[4.8]',
    ratingCount: '[número real de reviews]',
  },
}
```

### 2.3 — FAQPage (si la landing tiene sección FAQ)

```typescript
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '[Pregunta 1 de la sección FAQ]',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '[Respuesta completa — misma que en el copy de la landing]',
      },
    },
    // repetir para cada pregunta
  ],
}
```

### Implementación del JSON-LD

```typescript
// src/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productSchema),
          }}
        />
        {/* Solo si hay FAQ en la landing */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

---

## FASE 3: robots.txt — Acceso a Bots de IA

Una landing que bloquea bots de IA no puede ser citada en respuestas de ChatGPT, Perplexity o Claude.

Crear `public/robots.txt`:

```txt
# Motores de búsqueda tradicionales
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# Bots de IA — mantener habilitados para citabilidad
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

# Bots de scraping de entrenamiento (bloquear si prefieres)
# User-agent: CCBot
# Disallow: /

# General
User-agent: *
Allow: /

Sitemap: https://[dominio].com/sitemap.xml
```

**Por qué importa:**
- AI Overviews aparecen en ~45% de búsquedas en Google
- Marcas 6.5× más citadas cuando no bloquean bots de IA
- Estadísticas en el copy + schema FAQPage → +37-40% de visibilidad en AI

---

## FASE 4: Sitemap

Crear `src/app/sitemap.ts` (generado automáticamente por Next.js):

```typescript
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://[dominio].com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    // Agregar páginas adicionales si las hay
    // { url: 'https://[dominio].com/about', priority: 0.8 },
  ]
}
```

---

## FASE 5: Core Web Vitals — Checklist

Verificar antes del deploy:

### LCP (Largest Contentful Paint) — Target: < 2.5s

- [ ] Imagen hero con `priority` en `<Image>` de Next.js
  ```tsx
  <Image src="/hero.png" alt="..." priority width={1200} height={600} />
  ```
- [ ] Fuentes cargadas con `next/font` (no @import en CSS)
  ```typescript
  import { Inter } from 'next/font/google'
  const inter = Inter({ subsets: ['latin'] })
  ```
- [ ] Sin CSS crítico bloqueante — Tailwind inline es OK

### CLS (Cumulative Layout Shift) — Target: < 0.1

- [ ] Todas las imágenes con `width` y `height` definidos (o `fill` + container con aspect-ratio)
- [ ] Fuentes con `display: swap` (next/font lo maneja automáticamente)
- [ ] Sin elementos que se inserten dinámicamente arriba del fold

### INP (Interaction to Next Paint) — Target: < 200ms

- [ ] No hay JS pesado bloqueando el hilo principal en la carga
- [ ] Componentes interactivos (formulario) con estado local simple

### Verificación

```bash
# PageSpeed Insights
open "https://pagespeed.web.dev/report?url=https://[dominio].com"

# O con Lighthouse local
npx lighthouse https://[dominio].com --view
```

---

## FASE 6: Deploy a Vercel

### 6.1 — Variables de entorno (si hay formulario)

Si la landing tiene un formulario de waitlist/lead:

```bash
# En Vercel dashboard o CLI
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add RESEND_API_KEY  # si hay email de confirmación
```

### 6.2 — Deploy

```bash
# Primera vez
vercel

# Producción
vercel --prod
```

**O via Git (recomendado):**
1. Push al branch `main`
2. Vercel detecta el push y despliega automáticamente
3. URL de producción: `https://[proyecto].vercel.app` o dominio personalizado

### 6.3 — Dominio personalizado (si aplica)

```bash
vercel domains add [dominio].com
```

Luego configurar DNS en el registrador:
- **A record:** `76.76.21.21`
- **CNAME:** `cname.vercel-dns.com` (para subdominios)

---

## FASE 7: Analytics (Básico)

Para landing pages, implementar lo mínimo necesario para medir conversión:

### Opción A — Plausible (recomendado: ligero, sin cookies)

```typescript
// src/app/layout.tsx
<Script
  defer
  data-domain="[dominio].com"
  src="https://plausible.io/js/script.js"
/>
```

### Opción B — Google Analytics 4

```typescript
// src/app/layout.tsx
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  `}
</Script>
```

**Evento clave a trackear:** conversión del CTA principal

```typescript
// En el botón CTA o en el form submit
gtag('event', 'conversion', {
  event_category: 'landing',
  event_label: 'cta_principal',
})
```

---

## Output Final

Al completar este skill, la landing tiene:

| Ítem | Estado |
|------|--------|
| `metadata` export completo en `layout.tsx` | ✅ |
| Open Graph + Twitter Cards configurados | ✅ |
| JSON-LD: Organization + Product/WebPage | ✅ |
| JSON-LD: FAQPage (si aplica) | ✅ |
| `public/robots.txt` con bots de IA habilitados | ✅ |
| `src/app/sitemap.ts` generado | ✅ |
| Core Web Vitals: imágenes con priority/width/height | ✅ |
| Fuentes con `next/font` (sin @import) | ✅ |
| Deploy en Vercel con URL pública | ✅ |
| Analytics básico configurado | ✅ |

---

## Checklist de Calidad

Antes de considerar el deploy completo:

- [ ] ¿El title tag tiene < 60 chars y keyword en los primeros 30?
- [ ] ¿La meta description tiene 150-160 chars y un CTA implícito?
- [ ] ¿El og:image es 1200×630px y visualmente representa la propuesta de valor?
- [ ] ¿robots.txt no bloquea GPTBot, PerplexityBot, ClaudeBot, Google-Extended?
- [ ] ¿El JSON-LD valida en [Rich Results Test](https://search.google.com/test/rich-results)?
- [ ] ¿LCP < 2.5s medido con PageSpeed Insights?
- [ ] ¿CLS < 0.1 (sin layout shifts visibles)?
- [ ] ¿La URL del sitemap en robots.txt coincide con el dominio real?
- [ ] ¿El evento de conversión se trackea correctamente?
- [ ] ¿La landing se ve correctamente en preview de WhatsApp/Twitter (og:image)?

---

*"El SEO de una landing no es opcional — es el puente entre crear y ser encontrado."*
