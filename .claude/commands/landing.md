# 🚀 /landing - The Money Maker

> **Tu rol:** Copywriter y Diseñador de Clase Mundial.
> **Filosofía:** Copy primero, código después. Nunca al revés.

## Detección de Contexto

Antes de empezar, detectar el entorno:

```
¿Existe CLAUDE.md + .claude/skills/la-herreria/ en el proyecto actual?
```

---

## Ruta A: Proyecto Forge (Pipeline Completo)

**Si estamos dentro de un proyecto Forge** → usar el pipeline de La Herrería con anti-AI-slop.

**Si existe `DESIGN.md`** en el root del proyecto → leerlo y respetar las decisiones de diseño
documentadas (paleta, tipografía, tono, componentes). La landing debe ser coherente con el
design system del producto.

### Mensaje al usuario:

```
🚀 /landing detectado en proyecto Forge.

Pipeline Landing Page (4 steps + checkpoint, ~1h):
  Step 1: Definición Rápida (10 min)
  Step 2: Copywriting & Mensajería (20 min) — copy ANTES de código
  Step 3: Diseño Visual (25 min) — anti-AI-slop activado
  ✓ Checkpoint: Review Anti-IA
  Step 4: SEO & Deploy (5 min)

Empezando Step 1...
```

### Ejecución:

1. Leer y seguir `.claude/skills/la-herreria/routes/landing-page.md`
2. Cargar assets según indica cada Step
3. Respetar los puntos de control — especialmente el gate de copy en Step 2

---

## Ruta B: Fuera de Forge (Modo Rápido)

**Si NO estamos en un proyecto Forge** → entrevista rápida + ejecución directa con reglas anti-slop.

### Mentalidad

Este formulario es una semilla de contexto, no una plantilla de relleno.
Tu trabajo:
1. **Analiza** los puntos de dolor y el vibe
2. **Infiere** la mejor estructura, colores y tono
3. **Redacta** textos persuasivos (copy-first)
4. **Diseña** una interfaz que CONVIERTA
5. **Ejecuta** el código

**Sé proactivo. Sorprende.**

### Flujo de Entrevista

Haz estas preguntas **una por una**, esperando respuesta antes de continuar.

#### PREGUNTA 1: El Objetivo de Conversión 💰
```
¿Cuál es la ÚNICA acción que queremos que haga el usuario?

A) Captura de Lead - Formulario nombre/email a cambio de valor
B) Contacto Directo - Botón WhatsApp / Llamada
C) Agendar Cita - Calendly / Cal.com embebido
D) Venta Directa - Botón de compra
```

#### PREGUNTA 2: El Vibe Visual 🎨
```
¿Qué sensación debe transmitir el diseño?

A) Corporativo / Autoridad - Confianza, solidez
B) Moderno / Disruptivo - Tech, dark mode, futuro
C) Minimalista / High-End - Espacio, elegancia
D) Energético / Acción - Vibrante, dinámico

¿Tienes colores específicos? (Si no, yo elijo)
```

#### PREGUNTA 3: Psicología de Ventas 🧠
```
Dame la MUNICIÓN para el copy:

1. DOLOR PRINCIPAL del cliente:
   (¿Qué le quita el sueño? Sé crudo.)

2. FOMO (Miedo a Perderse Algo):
   (¿Por qué actuar AHORA?)

3. BENEFICIO MÁGICO:
   (¿Cómo se siente su vida DESPUÉS?)
```

#### PREGUNTA 4: Información del Negocio 🏢
```
- Nombre del Negocio:
- Contacto (Email/Tel):
- Links (Redes/Calendly):
- Tagline o slogan (si tiene):
```

#### PREGUNTA 5: Recursos Visuales 📸
```
¿Tenemos fotos/imágenes?

A) Sí, las subiré a public/images
B) No - Usa tipografía + color (sin stock genérico)
```

#### PREGUNTA 6: Ruta de la Landing
```
¿Dónde quieres esta landing?

A) Página principal (src/app/page.tsx)
B) Nueva ruta (ej: /landing-[nombre])
```

### Ejecución (Modo Rápido)

Una vez tengas todas las respuestas:

#### 1. Escribe el Copy PRIMERO
Usando frameworks AIDA o PAS, generar:
- **3 opciones de headline** — presentar al usuario, que elija
- **Subheadline** que explique el beneficio
- **Copy de cada sección** — texto final, no placeholder
- **CTAs** específicos en primera persona

**Reglas Anti-IA de Copy:**
- NO: "Bienvenido a", "Solución integral", "En el mundo actual", "Potenciamos tu"
- SÍ: Lenguaje del target, datos específicos, dolor real
- Tono: Café, no brochure. Máx 3 líneas por párrafo
- Botones: Primera persona ("Quiero mi acceso", no "Get Started")

#### 2. Diseña y Ejecuta el Código
**Si existe `DESIGN.md`**, respetar paleta, tipografía y tono documentados.
**Si no existe**, el design system creado aquí puede guardarse como `DESIGN.md` para futuros usos.

Con el copy aprobado, construir usando:
- **Next.js** App Router + **Tailwind CSS** + **shadcn/ui**
- **Google Fonts premium** — NO solo Inter (usar serif para headlines)
- **HSL variables** para colores de marca
- **Bento grid** para features, layout asimétrico
- **Framer Motion** para micro-interacciones sutiles (opcional)

#### 3. Valida Anti-IA
Antes de entregar, verificar:
- [ ] NO se ve como template genérico de IA
- [ ] Tipografía tiene personalidad
- [ ] Layout tiene variación entre secciones
- [ ] Copy habla de resultados, no features
- [ ] CTAs son específicos
- [ ] CTA visible above the fold
- [ ] Mobile-first (375px+)
- [ ] Lighthouse Performance > 90

### Estructura de Componentes

```
src/app/[ruta-landing]/
├── page.tsx
└── components/
    ├── hero.tsx
    ├── problem.tsx
    ├── solution.tsx
    ├── features.tsx
    ├── testimonials.tsx
    ├── pricing.tsx
    ├── faq.tsx
    └── cta-final.tsx
```

---

## Notas para el Agente

- **Copy primero:** Escribe todo el copy y preséntalo ANTES de codificar
- **Sé creativo:** No hagas landings genéricas — aplica las reglas anti-AI-slop
- **Sorprende:** Propón elementos que el usuario no pidió pero mejoran conversión
- **Ejecuta:** Después de aprobación de copy, construye sin preguntar
- **Itera:** Si algo se ve IA, corrige — cambiar font a serif + romper simetría
- **Documenta:** Explica brevemente las decisiones de diseño

---

*"Una landing que no convierte es solo una página bonita. Haz que el dinero fluya — con identidad."*
