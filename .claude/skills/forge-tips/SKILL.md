---
name: forge-tips
description: "Sistema de tips contextuales que guía al usuario a través de las capacidades de Forge en el momento justo. Se activa automáticamente — nunca se invoca manualmente."
autoTrigger: true
---

# Forge Tips — Progressive Disclosure System

> *"La mejor documentación es la que aparece justo cuando la necesitas."*

## Propósito

Forge tiene 25+ comandos, 12+ agentes, 10+ skills y decenas de capacidades. Es muy fácil que el usuario se pierda. Este sistema resuelve eso revelando capacidades **en el momento exacto en que son útiles**, no de golpe.

## Reglas de Activación

### Cuándo mostrar un tip

1. **Cada 3-5 mensajes** durante conversación general (no en cada respuesta)
2. **En transiciones naturales** — al completar una fase, skill, o tarea significativa
3. **Cuando el contexto lo pide** — si el usuario hace algo que tiene un comando/skill mejor
4. **Después de errores** — cuando un tip puede prevenir que se repita

### Cuándo NO mostrar un tip

- En medio de ejecución de código (no interrumpir el flow)
- Si el usuario está frustrado o con prisa (leer el tono)
- Si ya se mostró el mismo tip en esta sesión
- Más de 1 tip por respuesta (nunca bombardear)
- Durante outputs largos de skills/pipelines (esperar al final)

### Formatos (3 tipos visuales distintos)

Siempre al **final** de la respuesta, después del contenido principal.

#### Tip General (feature discovery)
```
> 💡 **Tip:** [contenido breve y actionable]
```

#### Tip de Seguridad (security awareness)
```
> 🔒 **Seguridad:** [alerta o recomendación de seguridad]
```

#### Tip de Git (workflow y buenas prácticas)
```
> 🌿 **Git:** [recomendación de workflow git/GitHub]
```

**Reglas generales:**
- Máximo 2 líneas por tip
- Siempre incluir el comando/skill/acción concreta
- Nunca genérico — siempre relevante al contexto actual
- Solo 1 tip por respuesta (de cualquier tipo). Prioridad: 🔒 > 🌿 > 💡 si hay conflicto

## Tips por Contexto

### 🚀 Inicio / Primeros mensajes

**Trigger:** Usuario acaba de empezar, primeros 3-5 mensajes de la sesión.

| Situación | Tip |
|-----------|-----|
| Proyecto nuevo, sin Blueprint | `💡 Tip: Usa /plan para crear un Blueprint completo antes de escribir código. Es la diferencia entre construir con planos y construir improvisando.` |
| Proyecto existente, retomando | `💡 Tip: Usa /avivar para que cargue el contexto completo de tu proyecto. Retomo donde lo dejamos sin perder nada.` |
| Usuario no sabe por dónde empezar | `💡 Tip: /onboarding te da una ruta personalizada según tu experiencia y lo que quieras construir.` |
| Entorno no verificado | `💡 Tip: /forge-check verifica que tu entorno esté listo — MCPs, dependencias, hooks, todo. 2 minutos que ahorran horas.` |

### 📋 Planificación (/plan)

**Trigger:** Durante o entre skills de La Herrería.

| Situación | Tip |
|-----------|-----|
| Después del BMC (Skill #1) | `💡 Tip: El BMC que acabamos de crear alimenta todo lo que sigue. Si algo no se siente bien, este es el mejor momento para ajustarlo.` |
| Después de User Stories (Skill #5) | `💡 Tip: Cada User Story se convertirá en tareas concretas durante /build. Si una story es demasiado grande, divídela ahora.` |
| Después de UX Design (Skill #6) | `💡 Tip: En el siguiente paso (UI Wireframes) puedes elegir un design system predefinido: Liquid Glass, Neobrutalism, Neumorphism, Bento Grid, o Gradient Mesh.` |
| Después de UI (Skill #8) | `💡 Tip: Viene la Auditoría de Seguridad. Revisa ~200 amenazas incluyendo riesgos específicos de vibe coding y MCP.` |
| Blueprint terminado | `💡 Tip: Blueprint listo. Cuando quieras construir, usa /build. Te preguntaré si prefieres Build Manual (fase a fase) o Modo Forja (paralelo con agentes).` |

### 🏗️ Construcción (/build)

**Trigger:** Durante el build, entre fases o después de subtareas.

| Situación | Tip |
|-----------|-----|
| Antes de elegir modo | `💡 Tip: Build Manual es ideal si quieres control total. Modo Forja lanza agentes en paralelo — más rápido pero menos control granular.` |
| Fase 1 completada | `💡 Tip: Si quieres ver el progreso visual, /kanban genera un tablero HTML con el estado de cada User Story.` |
| Después de implementar UI | `💡 Tip: /critique evalúa tu UI en 10 dimensiones incluyendo detección de AI slop. /polish hace micro-refinamientos automáticos.` |
| Después de implementar auth | `💡 Tip: Verifica RLS en Supabase. El agente supabase-admin puede auditar políticas con get_advisors.` |
| Error encontrado y resuelto | `💡 Tip: Este error se documentó en Auto-Blindaje. Forge aprende — no volverá a ocurrir en este proyecto ni en futuros.` |
| Fase 3+ completada | `💡 Tip: Llevamos varias fases. Si el contexto se siente pesado, puedo delegar a subagents o puedes iniciar sesión nueva con /avivar.` |

### 🎨 Diseño y UI

**Trigger:** Cuando se trabaja en componentes visuales, estilos, o animaciones.

| Situación | Tip |
|-----------|-----|
| Creando componentes UI | `💡 Tip: /normalize alinea todos los componentes con tu design system. Útil después de implementar varias features.` |
| Animaciones implementadas | `💡 Tip: Las animaciones de UI deben ser <300ms. El checklist de motion está en las references de Impeccable si quieres revisión detallada.` |
| UI terminada | `💡 Tip: /web-audit corre 150+ checks de Lighthouse adaptados al Golden Path — Performance, Accessibility, SEO, Best Practices.` |
| Landing page | `💡 Tip: /landing está optimizado para landing pages de alta conversión. Incluye copy, estructura, y CTA strategy.` |

### 📊 Estrategia de Producto

**Trigger:** Cuando el usuario habla de negocio, mercado, pricing, o competencia.

| Situación | Tip |
|-----------|-----|
| Habla de competencia | `💡 Tip: /rivales genera análisis competitivo con battlecards. Útil antes de definir tu propuesta de valor.` |
| Habla de pricing | `💡 Tip: /precio diseña tu estrategia de monetización — freemium, tiers, pricing psychology.` |
| Habla de métricas | `💡 Tip: /estrella define tu North Star Metric. /roi genera un dashboard HTML con MRR, CAC, LTV y más.` |
| Quiere lanzar | `💡 Tip: /lanzamiento genera un plan Go-to-Market completo. /metas crea OKRs y Outcome Roadmap.` |
| Quiere evaluar el MVP | `💡 Tip: /graduate evalúa si tu MVP está listo para escalar a SaaS production-ready y genera un plan de graduación.` |

### 🚢 Shipping y Calidad

**Trigger:** Cuando el usuario quiere deployar, hacer review, o terminar.

| Situación | Tip |
|-----------|-----|
| Quiere hacer deploy | `💡 Tip: /despachar automatiza el ship completo — merge main, typecheck, lint, build, review, commit, push, y crea PR.` |
| Antes de entregar | `💡 Tip: /inspeccionar corre un checklist de 11 categorías adaptado al Golden Path. Es tu review pre-landing.` |
| Review de producto | `💡 Tip: /fragua-review evalúa tu producto con mentalidad founder — busca el "producto 10 estrellas".` |
| Post-sprint | `💡 Tip: /retro genera una retrospectiva de ingeniería con métricas de sesión, streaks, y mejoras.` |

### 🔄 Continuidad entre Sesiones

**Trigger:** Inicio de nueva sesión o contexto largo.

| Situación | Tip |
|-----------|-----|
| Nueva sesión | `💡 Tip: /avivar carga la memoria del proyecto (.claude/memory/) con todo el contexto. Retomamos exactamente donde lo dejamos.` |
| Contexto largo (3+ fases) | `💡 Tip: El contexto se está acumulando. Considera iniciar sesión nueva con /avivar para contexto fresco, o delego tareas a subagents.` |
| Usuario regresa después de días | `💡 Tip: .claude/memory/ tiene la memoria del proyecto. /avivar + /kanban te dan el panorama completo en segundos.` |

### 🔧 Situaciones Especiales

| Situación | Tip |
|-----------|-----|
| Usuario escribe código sin Blueprint | `💡 Tip: Forge funciona mejor con un Blueprint aprobado. ¿Quieres que hagamos /plan rápido primero? Hay modos express.` |
| Pide feature de IA | `💡 Tip: Para features con IA, Forge tiene templates LEGO en .claude/ai_templates/. Se configuran automáticamente durante /build.` |
| Quiere agregar login | `💡 Tip: /add-login implementa auth con Supabase (Email/Password) con todo el flujo — signup, login, protección de rutas.` |
| Quiere actualizar Forge | `💡 Tip: /update-forge actualiza a la última versión. /eject-forge remueve Forge y deja solo tu código.` |
| Pregunta "¿qué puedo hacer?" | `💡 Tip: Los comandos principales son /plan (planificar), /build (construir), /critique (evaluar diseño), /web-audit (auditar calidad), y /despachar (shippear).` |

---

## 🔒 Tips de Seguridad

> Formato: `> 🔒 **Seguridad:** [alerta o recomendación]`

**Trigger:** Cuando el código toca autenticación, datos de usuario, APIs, secrets, permisos, o cualquier superficie de ataque. También de forma preventiva en momentos clave del build.

### Durante Planificación

| Situación | Tip |
|-----------|-----|
| BMC define modelo con datos de usuario | `🔒 Seguridad: Este modelo maneja datos de usuario. Skill #9 (Security Audit) revisará ~200 amenazas antes del Blueprint — incluyendo GDPR y data privacy.` |
| Tech Spec define API routes | `🔒 Seguridad: Cada API route necesita validación con Zod + auth check. Nunca confíes en datos del cliente — valida en el server.` |
| Blueprint aprobado, pre-build | `🔒 Seguridad: Antes de codear, verifica que el hook security-scan.sh esté activo. Detecta secrets, CORS wildcard, y debug statements automáticamente.` |

### Durante Construcción

| Situación | Tip |
|-----------|-----|
| Creando tablas en Supabase | `🔒 Seguridad: Toda tabla nueva necesita RLS habilitado desde el día 1. Sin RLS, la anon key expone todos los datos al público. Usa get_advisors para auditar.` |
| Implementando auth | `🔒 Seguridad: Usa Email/Password con Supabase Auth. Nunca almacenes passwords manualmente. Verifica que el service_role key NO esté en el cliente.` |
| Usando NEXT_PUBLIC_ env vars | `🔒 Seguridad: NEXT_PUBLIC_ expone la variable al browser. Solo la anon key de Supabase va ahí. Nunca service_role, API keys privadas, o secrets.` |
| Creando API route handlers | `🔒 Seguridad: Valida auth en CADA route handler — no asumas que el middleware lo cubrió. Patrón: getUser() → validate → respond.` |
| Instalando nuevo package | `🔒 Seguridad: Verifica el package en npmjs.com antes de instalar — downloads, última publicación, maintainers. Ghost packages (sugeridos por IA pero inexistentes) son un riesgo real.` |
| Usando fetch a APIs externas | `🔒 Seguridad: Nunca expongas API keys en el cliente. Crea un route handler en /api/ que actúe como proxy. El key va en env vars server-side.` |
| Subiendo archivos | `🔒 Seguridad: Limita tamaño de uploads (máx 10MB), valida MIME type en server, y configura storage bucket policies en Supabase. Nunca confíes en el Content-Type del cliente.` |
| Implementando webhooks | `🔒 Seguridad: Verifica la firma del webhook (HMAC) antes de procesar. Sin verificación, cualquiera puede enviar payloads falsos a tu endpoint.` |
| Usando dangerouslySetInnerHTML | `🔒 Seguridad: dangerouslySetInnerHTML abre la puerta a XSS. Sanitiza con DOMPurify antes de renderizar HTML de usuario o APIs externas.` |
| Console.log con datos sensibles | `🔒 Seguridad: Nunca loggees passwords, tokens, o datos de sesión — ni en dev. Los logs persisten y se filtran. El hook security-scan.sh detecta esto automáticamente.` |
| Configurando CORS | `🔒 Seguridad: Evita Access-Control-Allow-Origin: *. Configura solo los orígenes específicos de tu app. El hook security-scan.sh alerta sobre CORS wildcard.` |

### Durante Deploy / Pre-launch

| Situación | Tip |
|-----------|-----|
| Preparando deploy | `🔒 Seguridad: Verifica security headers — CSP, HSTS, X-Frame-Options, Referrer-Policy. /inspeccionar incluye un checklist de headers.` |
| Configurando env vars en Vercel | `🔒 Seguridad: Revisa que no haya secrets en .env.local committeados. Usa Vercel Environment Variables para production. Rota el service_role key si fue expuesto.` |
| Post-deploy | `🔒 Seguridad: Después del deploy, verifica que /api/ routes requieran auth, que RLS esté activo, y que la anon key no dé acceso a datos sensibles sin login.` |

### Vibe Coding Risks (específicos de desarrollo con IA)

| Situación | Tip |
|-----------|-----|
| Pegando código de IA sin revisar | `🔒 Seguridad: VCAL Risk — El código de IA puede incluir patrones inseguros. Siempre revisa auth logic, validación de input, y manejo de secrets antes de commitear.` |
| Chateando sobre secrets | `🔒 Seguridad: Nunca pegues API keys, passwords, o service_role keys en el chat de IA. Los contextos se almacenan. Usa referencias como "la variable de entorno SUPABASE_KEY".` |
| Instalando dependencia sugerida por IA | `🔒 Seguridad: Ghost Package Risk — Verifica que el package exista en npmjs.com, tenga >1000 downloads semanales, y esté activamente mantenido.` |

---

## 🌿 Tips de Git (Workflow y Buenas Prácticas)

> Formato: `> 🌿 **Git:** [recomendación de workflow]`

**Trigger:** Cuando el usuario trabaja con código, completa tareas, está por deployar, o en momentos donde un buen hábito de Git previene problemas.

### Commits

| Situación | Tip |
|-----------|-----|
| Primera subtarea completada | `🌿 Git: Commitea después de cada subtarea completada — no acumules. Formato: feat(F1-T1): create auth service. Un commit atómico = un rollback limpio.` |
| Código funciona pero sin commit | `🌿 Git: Buen momento para commitear. El código funciona — guarda ese progreso. Un commit ahora es un checkpoint al que puedes volver.` |
| Fix aplicado | `🌿 Git: Los fixes van en su propio commit: fix(F1-T3): fix RLS policy. Separar fix de feat facilita git bisect si algo falla después.` |
| Refactor hecho | `🌿 Git: Refactors van separados: refactor(F2-T1): extract validation utils. Nunca mezcles refactor con feat — si el refactor rompe algo, quieres revertir solo eso.` |
| Cambio de estilos | `🌿 Git: Cambios de estilo puros van con style(): style(F2-T4): align spacing in dashboard. Mantiene el git log legible.` |

### Ramas

| Situación | Tip |
|-----------|-----|
| Inicio de proyecto | `🌿 Git: Trabaja en main para el MVP inicial. Las ramas son útiles cuando hay features que podrían no entrar o cuando colaboras con otros.` |
| Feature experimental | `🌿 Git: Para features experimentales, crea una rama: git checkout -b feat/nombre-feature. Si no funciona, la borras sin contaminar main.` |
| Hotfix en producción | `🌿 Git: Para hotfixes, crea rama desde main: git checkout -b fix/descripcion. Fix → commit → PR → merge → deploy. Rápido y limpio.` |
| Múltiples features en paralelo | `🌿 Git: Una rama por feature: feat/auth, feat/dashboard, feat/billing. Cada rama se mergea independientemente. Evita conflictos cruzados.` |

### Pull Requests

| Situación | Tip |
|-----------|-----|
| Feature completa, lista para merge | `🌿 Git: Crea un PR antes de mergear. Aunque seas solo tú, el PR documenta qué cambió y por qué. /despachar lo automatiza completo.` |
| PR con muchos cambios | `🌿 Git: PRs grandes son difíciles de revisar. Si tiene >400 líneas, considera dividirlo en PRs más pequeños por subtarea o fase.` |
| PR aprobado | `🌿 Git: Usa Squash & Merge para PRs de feature — compacta los commits en uno limpio en main. Merge commit para PRs con historia que vale preservar.` |

### Push y Sincronización

| Situación | Tip |
|-----------|-----|
| Fin de sesión de trabajo | `🌿 Git: Antes de cerrar, haz push. Tu código local es tan seguro como tu último push al remoto. Un disco muerto no perdona.` |
| Antes de cambiar de rama | `🌿 Git: Commitea o stashea antes de cambiar de rama. git stash guarda cambios temporales — git stash pop los recupera.` |
| Conflictos al hacer pull | `🌿 Git: Conflictos son normales. Abre los archivos marcados, resuelve las secciones <<<< / >>>>, y commitea el merge. Nunca hagas force push para "resolver" conflictos.` |
| Código en producción | `🌿 Git: Nunca hagas push directo a main en producción. Siempre PR → review → merge. /despachar sigue este flujo automáticamente.` |

### Buenas Prácticas Generales

| Situación | Tip |
|-----------|-----|
| .gitignore incompleto | `🌿 Git: Verifica que .gitignore incluya: node_modules/, .env.local, .next/, *.log, .DS_Store. Nunca commitees dependencias o secrets.` |
| Mensaje de commit vago | `🌿 Git: Buenos mensajes de commit cuentan el "qué" y el "por qué": feat(F1-T2): add password reset flow (closes #12). Malos: "fixed stuff", "updates".` |
| Proyecto sin tags | `🌿 Git: Usa tags para marcar releases: git tag -a v1.0.0 -m "MVP launch". Los tags son checkpoints inmutables — útiles para rollbacks.` |
| Antes de deploy a producción | `🌿 Git: Pre-deploy checklist — ¿main está actualizado? ¿CI pasó? ¿No hay PRs pendientes que bloqueen? /inspeccionar cubre esto.` |
| Archivo sensible committeado por error | `🌿 Git: Si committeaste un .env o secret, no basta con borrarlo en otro commit — el historial lo conserva. Usa git filter-branch o BFG Repo Cleaner, y rota los secrets expuestos.` |
