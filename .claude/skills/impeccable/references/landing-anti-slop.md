# Landing Anti-Slop — Referencia Visual y Copy para Landing Pages

> *Cargado automáticamente durante la construcción de landing pages. Complementa las guidelines generales de Impeccable con reglas específicas para páginas de conversión.*

---

## Los 10 Indicadores de "Esto lo hizo IA"

| Patrón Genérico de IA | Alternativa Premium |
|------------------------|---------------------|
| Gradiente azul-morado de fondo | Color sólido de marca con acentos sutiles |
| Grid de 3 columnas con iconos de Lucide | Layout asimétrico o bento grid |
| Hero con mockup genérico de laptop | Foto real del producto o video embed |
| "Trusted by 10,000+ customers" sin logos | Logos reales de clientes o screenshots de testimonios |
| Botón "Get Started" sin contexto | CTA específico: "Agenda tu demo de 15 min" |
| Fuente Inter en todo | Mezcla: display font para headlines + sans-serif para body |
| Secciones con padding uniforme | Ritmo visual variado — secciones tight y secciones con aire |
| FAQ genérica en acordeón | Objeciones reales escritas como conversación |
| Footer con 47 links | Footer minimal: logo + legal + contacto |
| Animaciones de scroll genéricas | Micro-interacciones en hover, no animaciones de entrada |

---

## Tipografía para Landing Pages

### Headlines (Display Fonts)

Elige UNA de estas para el headline principal. Todas disponibles en `next/font/google`:

- **Instrument Serif** — Elegante, editorial, alta legibilidad
- **Fraunces** — Serif con personalidad, curvas distintivas
- **Playfair Display** — Clásica serif con contraste alto
- **Bricolage Grotesque** — Sans-serif con carácter, alternativa bold

### Body (Sans-Serif)

Pairea con UNA de estas para body text:

- **Geist** — Moderna, limpia, diseñada por Vercel
- **DM Sans** — Geométrica, amigable, excelente legibilidad
- **Plus Jakarta Sans** — Redonda, contemporánea, versatile

### Implementación

```tsx
import { Instrument_Serif, DM_Sans } from 'next/font/google'

const serif = Instrument_Serif({ subsets: ['latin'], weight: '400' })
const sans = DM_Sans({ subsets: ['latin'] })
```

**Regla:** Nunca usar solo Inter, Roboto o system defaults. La tipografía es el diferenciador #1 entre una landing genérica y una premium.

---

## Color: HSL Variables

Define la paleta del usuario en `globals.css` con variables HSL para consistencia:

```css
:root {
  --brand: 24 95% 53%;        /* color primario */
  --brand-dark: 24 95% 40%;   /* variante oscura */
  --surface: 0 0% 98%;        /* fondo principal */
  --text: 0 0% 10%;           /* texto principal */
  --muted: 0 0% 45%;          /* texto secundario */
}
```

**Prohibido:**
- Gradientes azul-morado como fondo principal (indicador #1 de IA)
- Pure black `#000` o pure white `#fff` — siempre tintear
- Gray text plano en fondos de color — usar un shade del background

---

## Layout: Ritmo y Asimetría

### Reglas de spacing

- **Variar el padding** entre secciones — no 80px uniformes
- Hero: generoso (`py-24` a `py-32`)
- Problem/Solution: más tight (`py-16`)
- Features: mediano (`py-20`)
- CTA Final: generoso con aire (`py-28`)

### Reglas de layout

- Features: **bento grid** (columnas irregulares) o layout asimétrico, NO el grid simétrico de 3 columnas
- Alternar entre secciones full-width y contenidas (`max-w-5xl`)
- Romper la simetría: texto + imagen no siempre 50/50
- Mobile-first obligatorio: hero funciona en 375px, botones 48px mínimo touch target, body text 16px mínimo

---

## Checklist Review Anti-IA

Pasar esta checklist antes de deploy. Si falla 3+ puntos → volver a rediseñar.

### Visual (¿Se ve humana?)

- [ ] NO se ve como template out-of-the-box de Framer/Webflow
- [ ] Colores son de la marca, no gradientes genéricos
- [ ] Tipografía tiene personalidad (no Inter/default)
- [ ] Layout tiene variación entre secciones
- [ ] Imágenes son reales o relevantes (no stock genérico)
- [ ] Spacing varía entre secciones (ritmo visual)
- [ ] Mobile se ve diseñado, no solo "encogido para caber"

### Copy (¿Suena humana?)

- [ ] Headline habla de un RESULTADO, no de features
- [ ] No hay "Bienvenido a", "Solución integral", "En el mundo actual"
- [ ] Testimonios tienen resultados específicos y nombres reales
- [ ] CTAs son específicos, no "Get Started" o "Learn More"
- [ ] FAQ responde objeciones REALES, no preguntas de relleno
- [ ] Tono suena como persona real, no corporativo

### Técnico

- [ ] Lighthouse Performance > 90
- [ ] Funciona en mobile (375px+)
- [ ] CTA visible sin scroll (above the fold)
- [ ] Carga en < 3 segundos
- [ ] Sin errores en consola
- [ ] Meta tags y OG image configurados
- [ ] `next/image` para todas las imágenes
- [ ] Lazy load en secciones below the fold

**Gate:** Compartir screenshot/preview con el usuario. Preguntar: *"¿Se siente diseñada por humano o por IA?"*

---

## Recuperación

| Problema | Solución |
|----------|----------|
| Sin imágenes de producto | Screenshots de interfaz, GIFs, o secciones basadas en tipografía + color |
| Copy suena a IA | Reescribir como "WhatsApp a un amigo que necesita esto". Luego pulir |
| Página se ve genérica | Cambiar font del headline a serif editorial + romper simetría de secciones |
| Usuario quiere "más animaciones" | Micro-interacciones (hover, transiciones de botón) > animaciones de scroll |
| Sin presupuesto para imágenes | Unsplash selectivo (editorial, nunca corporativo) o visuales CSS puro |
| Sin logos de clientes | Screenshots de DMs, tweets, emails, reviews — social proof real |

---

## 9 Cosas que NUNCA Hacer

1. Usar un template y solo cambiar textos — se nota al instante
2. Dejar lorem ipsum "temporalmente" — todo el copy va ANTES del código
3. Gradientes azul-morado en el hero — indicador #1
4. Grid de 3 features con iconos de Lucide — indicador #2
5. Stock photos de personas sonriendo — indicador #3
6. "Trusted by thousands" sin número real
7. Codificar sin copy aprobado
8. Ignorar mobile (60%+ del tráfico es mobile)
9. Animaciones excesivas al scroll — 1-2 sutiles, no todo flotando
