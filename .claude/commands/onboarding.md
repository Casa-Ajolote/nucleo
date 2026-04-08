---
description: "Ruta personalizada para nuevos usuarios de Forge. Pregunta qué quieres construir, tu experiencia y si es tu primera vez — genera un plan de acción personalizado."
---

# /onboarding — Tu Ruta Forge Personalizada

> *"Antes de forjar, el aprendiz conoce las herramientas.
>   Antes de planificar, el herrero conoce al cliente."*

Bienvenido a Forge. Este comando te ayuda a encontrar el camino más eficiente para tu proyecto.

---

## Instrucciones

Ejecuta las 3 preguntas en orden. Espera la respuesta del usuario antes de continuar con la siguiente.

### Pregunta 1: ¿Qué quieres construir?

Presenta las opciones al usuario:

```
🔨 ¿Qué quieres construir hoy?

  1. 🏗️  SaaS Completo — App web con auth, DB, billing, dashboard
  2. 🚀  MVP para Validar — Producto mínimo para testear con usuarios reales
  3. 🔧  Herramienta Interna — Tool para tu equipo o empresa
  4. 🎯  Landing Page — Página de alta conversión para captar leads
  5. 🤖  Feature con IA — Chatbot, generación de contenido, análisis inteligente
  6. 📂  Proyecto Existente — Ya tengo una app y quiero mejorarla con Forge
  7. 🤷  No estoy seguro — Ayúdame a decidir

Responde con el número o describe tu idea libremente.
```

**Si elige 6 ("Proyecto Existente"):** El usuario ya tiene código. La ruta es diferente — no empieza desde cero. Ver sección "Ruta Proyecto Existente" abajo.

**Si elige 7 ("No estoy seguro"):** Haz 2-3 preguntas de clarificación sobre su idea y recomienda el modo más apropiado. Ejemplos:
- "¿Tu idea necesita que los usuarios creen cuentas?" → Si sí: SaaS o MVP
- "¿Es para uso interno de tu equipo?" → Tool Interna
- "¿Solo necesitas captar emails o mostrar info?" → Landing

Guarda la elección como `BUILD_MODE`.

---

### Pregunta 2: ¿Cuál es tu experiencia con el stack?

```
🧠 ¿Qué tan familiarizado estás con estas tecnologías?

  A. 🌱 Principiante — Primera vez con Next.js, Supabase o Tailwind
  B. 🌿 Algo de experiencia — He usado algunas pero no todas
  C. 🌳 Experimentado — Conozco bien el stack (Next.js + Supabase + Tailwind)
```

Guarda como `EXPERIENCE_LEVEL`.

---

### Pregunta 3: ¿Es tu primera vez con Forge?

```
🔨 ¿Has usado Forge antes?

  Sí / No
```

Guarda como `FIRST_TIME`.

---

## Generar Ruta Personalizada

Con las 3 respuestas, genera la ruta personalizada usando esta lógica:

### Si FIRST_TIME = Sí

```
╔══════════════════════════════════════════════════════════════╗
║                   🔨 TU RUTA FORGE                          ║
║                   Primera vez — Setup completo               ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Paso 0: Verificar entorno                                   ║
║  ➜ /forge-check                                              ║
║  Verifica MCPs, dependencias y credenciales                  ║
║  ⏱ ~5 min                                                    ║
║                                                              ║
║  Paso 1: Configurar MCPs                                     ║
║  ➜ Copiar example.mcp.json → .mcp.json                      ║
║  ➜ Añadir credenciales de Supabase                           ║
║  ⏱ ~10 min                                                   ║
║                                                              ║
║  Paso 2: Activar Hooks (recomendado)                         ║
║  ➜ cp .claude/example.settings.json .claude/settings.json    ║
║  Habilita: typecheck pre-commit, auto-format, security scan  ║
║  ⏱ ~1 min                                                    ║
║                                                              ║
║  Paso 3: Planificar                                          ║
║  ➜ /plan                                                     ║
║  {BUILD_MODE_DESCRIPTION}                                    ║
║  ⏱ {BUILD_MODE_TIME}                                         ║
║                                                              ║
║  Paso 4: Construir                                           ║
║  ➜ /build                                                    ║
║  Elige Build Manual o Modo Forja (sandboxes paralelos)       ║
║  ⏱ Depende del proyecto                                      ║
║                                                              ║
║  Paso 5: Ship                                                ║
║  ➜ /despachar                                                ║
║  Merge, test, review, commit, push, PR — todo automático     ║
║  ⏱ ~10 min                                                   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### Si FIRST_TIME = No

```
╔══════════════════════════════════════════════════════════════╗
║                   🔨 TU RUTA FORGE                          ║
║                   Bienvenido de vuelta                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Paso 1: Planificar                                          ║
║  ➜ /plan                                                     ║
║  {BUILD_MODE_DESCRIPTION}                                    ║
║  ⏱ {BUILD_MODE_TIME}                                         ║
║                                                              ║
║  Paso 2: Construir                                           ║
║  ➜ /build                                                    ║
║  ⏱ Depende del proyecto                                      ║
║                                                              ║
║  Paso 3: Ship                                                ║
║  ➜ /despachar                                                ║
║  ⏱ ~10 min                                                   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## Personalización por BUILD_MODE

Reemplaza `{BUILD_MODE_DESCRIPTION}` y `{BUILD_MODE_TIME}` según la elección:

| Modo | Descripción | Tiempo /plan | Skills |
|------|-------------|--------------|--------|
| SaaS Completo | 10 skills: BMC → Security Audit → Blueprint | 5-8h | 10 + 4 opcionales |
| MVP para Validar | 7 skills: ruta rápida a validación | 2-3h | 7 |
| Herramienta Interna | 10 skills: optimizado para tools internas | 4-6h | 10 |
| Landing Page | 4 pasos: idea → copy → diseño → código | ~1h | 4 |
| Feature con IA | 7 pasos: diseño → AI templates → implementación | 2-4h | 7 |

---

## Personalización por EXPERIENCE_LEVEL

### Principiante — Añadir tips extras

Después de la ruta, añadir:

```
💡 Tips para principiantes:

• Next.js usa "App Router" — las rutas son carpetas en src/app/
• Supabase es tu base de datos Y autenticación — todo en uno
• Tailwind son clases CSS directas en el HTML: className="bg-blue-500 text-white"
• Si algo falla, /forge-check diagnostica qué está mal
• Si pierdes contexto en una sesión larga, /avivar recarga todo
```

### Experimentado — Sugerir comandos de estrategia

Después de la ruta, añadir:

```
🎯 Comandos de estrategia (pre-plan, opcionales):

• /brujula     — Product Vision + Strategy Canvas
• /precio      — Estrategia de pricing y monetización
• /estrella    — Define tu North Star Metric
• /rivales     — Análisis competitivo + battlecards
• /roi         — Proyección ROI + dashboard con métricas SaaS

Estos comandos generan documentos que /plan puede usar como input.
```

---

## Ruta Proyecto Existente (BUILD_MODE = Proyecto Existente)

Cuando el usuario ya tiene una app y quiere mejorarla con Forge:

```
╔══════════════════════════════════════════════════════════════╗
║                   🔨 TU RUTA FORGE                          ║
║                   Proyecto Existente                         ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Paso 0: Verificar entorno                                   ║
║  ➜ /forge-check                                              ║
║  Verifica MCPs, dependencias y credenciales                  ║
║  ⏱ ~5 min                                                    ║
║                                                              ║
║  Paso 1: Cargar contexto del proyecto                        ║
║  ➜ /avivar                                                   ║
║  Escanea codebase, DB, features existentes                   ║
║  ⏱ ~5 min                                                    ║
║                                                              ║
║  Paso 2: Elegir camino                                       ║
║                                                              ║
║  ¿Qué quieres hacer con tu proyecto?                         ║
║                                                              ║
║  A. 🎨 Mejorar diseño/UX → /redesign                        ║
║     Audita tu UI actual, genera reporte de mejoras,          ║
║     y aplica fixes por orden de impacto.                     ║
║                                                              ║
║  B. ➕ Agregar features nuevas → /plan                       ║
║     Usa La Herrería para planificar las nuevas features      ║
║     considerando lo que ya existe.                           ║
║                                                              ║
║  C. 🔧 Agregar un building block → Comando directo          ║
║     /add-login    — Auth con Supabase                        ║
║     /add-payments — Pagos (Polar o Stripe)                   ║
║     /add-emails   — Emails transaccionales                   ║
║     /add-mobile   — PWA + push notifications                 ║
║                                                              ║
║  D. 🔍 Auditar calidad → /critique + /web-audit             ║
║     Evaluación UX/UI + Lighthouse (150+ checks)              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Importante:** Al ejecutar `/avivar`, Forge escanea el proyecto y entiende qué ya existe. Los comandos posteriores (`/plan`, `/redesign`, building blocks) usarán ese contexto para no duplicar lo que ya hay.

---

## Cierre

Termina siempre con:

```
¿Listo para empezar? Tu siguiente paso es:
➜ {NEXT_STEP}

Si en cualquier momento necesitas ayuda: /forge-check diagnostica tu entorno.
```

Donde `{NEXT_STEP}` es:
- First-timers: `/forge-check`
- Returning + Principiante: `/plan`
- Returning + Experimentado: Comando de estrategia sugerido o `/plan`
- Proyecto Existente: `/forge-check` → `/avivar`
