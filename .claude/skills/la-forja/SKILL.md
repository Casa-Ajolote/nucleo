---
name: la-forja
description: >
  Orquestador de ejecución autónoma con agentes sandbox en Git Worktrees.
  Se activa DESPUÉS de la fase de planeación (cuando ya existen plan.md, tasks.md,
  BLUEPRINT.md, o cualquier documento de plan con fases definidas). Pregunta al usuario
  si quiere ejecutar el build manualmente o con agentes autónomos en sandboxes paralelos.
  Si elige sandboxes, pregunta cuántos agentes (1-5), genera toda la configuración:
  worktrees, config de Supabase local por sandbox, CLAUDE.md, .env.local, y los prompts
  personalizados para cada agente con variaciones de personalidad (literal → creativo →
  disruptivo). También genera el prompt de review para que el agente manual compare y
  cherry-pick lo mejor de cada sandbox.
  Usa este skill siempre que el usuario diga "la forja", "quiero usar sandboxes",
  "agentes autónomos", "worktrees", "ejecutar con múltiples agentes", "lanza los
  agentes", "modo forja", "forja el build", o cuando termine el blueprint y quiera
  pasar a ejecución. También se activa si el usuario dice "quiero correr X agentes
  en paralelo", "sandbox mode", o "autonomous build".
---

# La Forja — Orquestador de Ejecución Autónoma

> *"Planeaste con precisión. Ahora deja que la Forja lo construya."*

La Forja es el puente entre planeación y ejecución. Toma el output de La Herrería
(o cualquier plan estructurado por fases) y lo convierte en una operación de build
con múltiples agentes autónomos trabajando en paralelo, cada uno con su propio
entorno aislado y una personalidad diferente.

```
BLUEPRINT → LA FORJA → N agentes sandbox en paralelo → Review → Cherry-pick → Merge
```

---

## Cuándo Se Activa

La Forja se activa cuando:

1. **El pipeline de La Herrería termina** (después del Blueprint, Skill #10)
2. **El usuario tiene documentos de plan con fases** (plan.md, tasks.md, BLUEPRINT-[nombre].md)
3. **El usuario pide explícitamente** usar sandboxes, agentes autónomos, o "la forja"

La Forja NO se activa si no hay un plan con fases definidas. Si el usuario quiere
usar La Forja pero no tiene plan, redirigir a La Herrería primero.

---

## Detección de Estado

### Al Activarse

```
He detectado los siguientes documentos de planificación:

✅ BLUEPRINT-[nombre].md — [Resumen de fases]
✅ TECH-SPEC-[nombre].md — [Stack tecnológico]

El plan tiene [N] fases con [X] tareas totales.

¿Cómo quieres ejecutar el build?
```

Presentar opciones al usuario:

1. **Build Manual** → "Trabajamos tú y yo fase por fase, con tu aprobación en cada paso"
2. **Modo Forja** → "Lanzo agentes autónomos en sandboxes paralelos mientras tú trabajas manual"

Si elige Build Manual → el agente procede normalmente sin invocar La Forja.
Si elige Modo Forja → continuar con el flujo de La Forja.

### Preguntas de Configuración

Si el usuario elige Modo Forja:

```
¡Modo Forja activado! Vamos a configurar tu operación.

¿Cuántos agentes autónomos quieres lanzar?
```

Opciones: 1, 2, 3, 4, 5

Después:

```
¿Tu proyecto usa Supabase?
```

Si sí:

```
¿Cómo quieres aislar las bases de datos?

1. Supabase Local con Docker (gratis, requiere Docker Desktop)
2. Proyectos separados en Supabase Cloud (requiere plan Pro para 3+)
```

Después de que el usuario elige número de agentes, mostrar recursos estimados:

```
📊 Recursos estimados para [N] agentes:

| Agentes | RAM Estimada | Con Supabase Docker |
|---------|-------------|---------------------|
| 1       | ~3 GB       | 1 instancia         |
| 2       | ~6 GB       | 2 instancias        |
| 3       | ~9 GB       | 3 instancias        |
| 4       | ~12 GB      | 4 instancias        |
| 5       | ~15 GB      | 5 instancias        |

Tu selección: [N] agentes → ~[N*3] GB RAM recomendada
```

Si el usuario tiene <16GB y pide 4+ agentes, sugerir activamente reducir a 2-3.

### Pregunta de Terminal (después de recursos)

```
¿Qué terminal usas para gestionar los agentes?
```

Opciones:

1. **cmux** → "Auto-crea workspaces, lanza agentes, y te notifica cuando terminan o necesitan atención" (recomendado si lo tiene instalado)
2. **Terminal manual** → "Ghostty, iTerm, Terminal.app — abres tabs y pegas comandos manualmente"

Antes de preguntar, verificar si cmux está disponible:
- Si `command -v cmux` existe → mostrar ambas opciones, recomendar cmux
- Si no existe → mostrar solo Terminal manual, con nota: "Tip: cmux (https://github.com/manaflow-ai/cmux) automatiza el lanzamiento y monitoreo de agentes"

Guardar la elección como `{{cmux}}` (true/false) para condicionar la generación de outputs.

---

## Wave Planning — Ejecución por Oleadas de Dependencia

> *"No todo puede correr en paralelo. Las waves respetan las dependencias."*

Antes de lanzar sandboxes, La Forja clasifica las User Stories / fases en **waves**
basándose en sus dependencias:

### Cómo Funciona

```
Wave 1: Stories SIN dependencias entre sí → se ejecutan en paralelo
Wave 2: Stories que DEPENDEN de Wave 1 → esperan merge de Wave 1
Wave 3: Stories que DEPENDEN de Wave 2 → esperan merge de Wave 2
```

### Ejemplo

```
Blueprint tiene 6 User Stories:

US-1: Setup + Auth base          → sin dependencias
US-2: DB Schema (tablas core)    → sin dependencias
US-3: CRUD de productos          → depende de US-2
US-4: Dashboard de usuario       → depende de US-1 + US-2
US-5: Sistema de búsqueda        → depende de US-3
US-6: Deploy                     → depende de todas

Wave Planning:
├── Wave 1 (paralelo): US-1, US-2        ← cada sandbox toma una
├── Wave 2 (paralelo): US-3, US-4        ← después del merge de Wave 1
└── Wave 3 (secuencial): US-5, US-6      ← después del merge de Wave 2
```

### Integración con Sandboxes

- **Wave 1:** Cada sandbox recibe stories independientes → ejecutan en paralelo sin conflictos
- **Review + Merge de Wave 1:** El usuario revisa y mergea usando review-prompt.md
- **Wave 2:** Los sandboxes reciben el código mergeado + nuevas stories → ejecutan en paralelo
- **Repetir** hasta completar todas las waves

### Cuándo NO Usar Waves

- Si todas las stories son independientes → una sola wave, todo en paralelo
- Si todas las stories son secuenciales → waves de 1 story cada una (considerar Build Manual)
- Si el usuario tiene 1-2 agentes → las waves se ejecutan como tareas secuenciales por sandbox

### Output del Wave Planning

Al configurar La Forja, mostrar el plan de waves al usuario:

```
📋 Wave Planning:

Wave 1 (paralelo):
  Sandbox 1 → US-1: Setup + Auth
  Sandbox 2 → US-2: DB Schema

Wave 2 (paralelo, después de merge Wave 1):
  Sandbox 1 → US-3: CRUD productos
  Sandbox 2 → US-4: Dashboard

Wave 3 (secuencial):
  Sandbox 1 → US-5: Búsqueda
  Sandbox 1 → US-6: Deploy

¿Apruebas este plan de waves o quieres ajustar?
```

---

## Validación del Plan

Antes de proceder con la generación, La Forja valida que el plan sea viable
para ejecución autónoma.

### Checklist de Validación

```
Validando plan para ejecución autónoma...

[✅/❌] Fases definidas — ¿El plan tiene fases numeradas claramente?
[✅/❌] Tareas por fase — ¿Cada fase tiene tareas o entregables concretos?
[✅/❌] Stack identificado — ¿Se puede extraer el stack técnico?
[✅/❌] Sin dependencias externas bloqueantes — ¿Requiere APIs con keys que no tenemos?
[✅/❌] Migraciones definidas — [Si Supabase] ¿El plan describe el schema de DB?
```

### Si la validación falla

```
⚠️ El plan tiene gaps que pueden bloquear a los agentes autónomos:

[Lista de issues encontrados]

Opciones:
1. Corregir el plan primero (recomendado)
2. Proceder de todos modos (los agentes documentarán bloqueos en PROBLEMAS.md)
```

No bloquear al usuario, pero advertir claramente. Si elige proceder, documentar
los gaps en el CLAUDE.md generado para que los agentes sepan de antemano.

---

## Personalidades de Agentes

Cada agente sandbox tiene una personalidad que define su approach. Las personalidades
se asignan automáticamente según el número de agentes:

### 1 Agente

| Agente | Personalidad | Descripción |
|--------|-------------|-------------|
| Sandbox 1 | **Equilibrado** | Balance entre velocidad, calidad y buenas prácticas |

### 2 Agentes

| Agente | Personalidad | Descripción |
|--------|-------------|-------------|
| Sandbox 1 | **Literal** | Se apega estrictamente al plan, sin desviaciones |
| Sandbox 2 | **Creativo** | Toma libertades para mejorar la implementación |

### 3 Agentes

| Agente | Personalidad | Descripción |
|--------|-------------|-------------|
| Sandbox 1 | **Literal** | Se apega al código y plan tal cual está escrito |
| Sandbox 2 | **Creativo** | Libertad moderada para mejorar patterns y UX |
| Sandbox 3 | **Disruptivo** | Experimenta con approaches alternativos y nuevas ideas |

### 4 Agentes

| Agente | Personalidad | Descripción |
|--------|-------------|-------------|
| Sandbox 1 | **Literal** | Apego estricto al plan |
| Sandbox 2 | **Quality** | Prioriza TDD y cobertura de tests exhaustiva |
| Sandbox 3 | **Creativo** | Mejoras de implementación y UX |
| Sandbox 4 | **Disruptivo** | Arquitectura alternativa y experimentación |

### 5 Agentes

| Agente | Personalidad | Descripción |
|--------|-------------|-------------|
| Sandbox 1 | **Literal** | Apego estricto al plan |
| Sandbox 2 | **Speed** | Velocidad de ejecución, implementación directa |
| Sandbox 3 | **Quality** | TDD y tests exhaustivos |
| Sandbox 4 | **Creativo** | Mejoras de patterns y UX |
| Sandbox 5 | **Disruptivo** | Arquitectura alternativa radical |

---

## Generación de Outputs

Cuando el usuario confirma la configuración, La Forja genera TODO lo necesario
para ejecutar la operación. Los outputs se generan como archivos en el proyecto.

### Estructura de Outputs

```
forja/
├── README.md                      ← Guía paso a paso para el usuario
├── setup.sh                       ← Script de setup automatizado
├── cleanup.sh                     ← Script de limpieza
├── monitor.sh                     ← Monitor de progreso de sandboxes
├── launch-cmux.sh                 ← Lanzamiento automático en cmux (si cmux elegido)
├── monitor-cmux.sh                ← Monitor con status/notificaciones cmux (si cmux elegido)
├── CLAUDE.md                      ← Instrucciones base para todos los agentes
├── prompts/
│   ├── sandbox-1-literal.md       ← Prompt del agente 1
│   ├── sandbox-2-creativo.md      ← Prompt del agente 2
│   ├── sandbox-3-disruptivo.md    ← Prompt del agente 3 (si aplica)
│   └── review-prompt.md           ← Prompt para el agente manual de review
├── configs/
│   ├── sandbox-1-config.toml      ← Config Supabase sandbox 1 (si aplica)
│   ├── sandbox-2-config.toml      ← Config Supabase sandbox 2 (si aplica)
│   └── sandbox-3-config.toml      ← Config Supabase sandbox 3 (si aplica)
└── env-templates/
    ├── sandbox-1.env.local        ← Template de env para sandbox 1
    ├── sandbox-2.env.local        ← Template de env para sandbox 2
    └── sandbox-3.env.local        ← Template de env para sandbox 3
```

---

## Generación del CLAUDE.md

El CLAUDE.md es compartido por TODOS los agentes sandbox (vive en la raíz del repo
y se hereda via worktree). Se genera basándose en el plan del usuario.

### Template del CLAUDE.md

Leer `references/claude-md-template.md` para el template completo y adaptarlo
al proyecto específico del usuario. El template incluye:

- Comandos disponibles (/build, /playwright, /e2e, /lint, /db:migrate, etc.)
- Reglas de ejecución (build + test después de cada fase)
- Skills disponibles (si el usuario tiene skills/)
- Convenciones del proyecto
- Stack técnico extraído del plan
- Reglas de base de datos (si usa Supabase)

---

## Generación de Prompts por Agente

Cada prompt se genera dinámicamente basándose en:

1. El plan del usuario (fases, tareas, migraciones)
2. La personalidad asignada al agente
3. El stack técnico del proyecto
4. Si usa Supabase u otras integraciones

### Estructura de un Prompt de Agente

Leer `references/agent-prompt-template.md` para el template completo.

Cada prompt sigue esta estructura:

```
1. INSTRUCCIONES DE LECTURA
   → Lee CLAUDE.md, BLUEPRINT-[nombre].md, TECH-SPEC-[nombre].md

2. PERSONALIDAD Y PRIORIDAD
   → Define qué prioriza este agente específico

3. ENTORNO
   → Qué servicios tiene disponibles (Supabase, etc.)

4. INSTRUCCIONES POR GRUPO DE FASES
   → Qué skills leer, qué patterns usar en cada grupo

5. LOOP DE EJECUCIÓN POR FASE
   → Los pasos exactos que repite en cada fase

6. MANEJO DE ERRORES
   → Qué hacer si tests fallan, si se atora, etc.

7. OUTPUTS FINALES
   → RESUMEN.md, PROBLEMAS.md, etc.
```

### Variaciones por Personalidad

Las variaciones se inyectan en la sección 2 y 4 del prompt:

**Literal:**
```
Tu prioridad es FIDELIDAD AL PLAN. Implementa exactamente lo que dice el plan
y tasks sin desviaciones. No agregues features, patterns, o abstracciones que
no estén explícitamente en el plan. Si hay ambigüedad, elige la interpretación
más simple y directa. Tu valor es que produces exactamente lo que se planeó.
```

**Speed:**
```
Tu prioridad es VELOCIDAD. Implementa cada fase de la forma más directa y
eficiente posible. Evita sobre-ingeniería. Si el plan pide un CRUD, haz un CRUD
simple que funcione, no un pattern repository con abstracciones. Tu valor es que
produces resultados rápido para validar que el plan funciona.
```

**Quality:**
```
Tu prioridad es CALIDAD y COBERTURA DE TESTS. Cada feature debe tener tests
exhaustivos. Usa TDD: escribe los tests PRIMERO, luego implementa hasta que pasen.
Agrega tests de edge cases, error handling, y happy paths. Tu valor es que produces
código con alta confianza de que funciona correctamente.
```

**Creativo:**
```
Tu prioridad es MEJORA PRAGMÁTICA. Sigue el plan pero toma libertades moderadas
para mejorar la implementación: mejores patterns, mejor UX, abstracciones útiles
que el plan no consideró pero que hacen el código más mantenible. Documenta cada
mejora que hagas en MEJORAS.md explicando qué cambiaste y por qué. Tu valor es
que produces una versión mejorada del plan.
```

**Disruptivo:**
```
Tu prioridad es INNOVACIÓN ARQUITECTÓNICA. Usa el plan como guía de QUÉ construir
pero toma libertad total en CÓMO construirlo. Experimenta con patterns diferentes,
estructuras de proyecto alternativas, libraries que el plan no consideró. Antes de
implementar cada fase, documenta tu approach alternativo en ARQUITECTURA.md
explicando qué harás diferente y por qué. Tu valor es que puede descubrir
approaches superiores que no se consideraron en la planeación.
```

**Equilibrado (para 1 solo agente):**
```
Tu prioridad es BALANCE. Sigue el plan con fidelidad pero aplica buen juicio:
si ves una mejora obvia, aplícala. Si un test es evidente, escríbelo. No
sobre-ingenierices pero tampoco cortes esquinas. Documenta decisiones importantes
en DECISIONES.md. Tu valor es que produces un resultado sólido y equilibrado.
```

---

## Generación del Script de Setup

El script `setup.sh` automatiza la creación de worktrees y configuración de
Supabase. Leer `references/setup-script-template.md` para el template.

El script debe:

1. Crear N worktrees con branches descriptivas
2. Configurar project_id y puertos en config.toml de cada sandbox (si usa Supabase)
3. Generar JWT secrets únicos por sandbox (si usa Supabase)
4. Crear .env.local por sandbox con las credenciales correctas
5. Ejecutar supabase start en cada sandbox (si usa Supabase)
6. Aplicar migraciones existentes
7. Mostrar resumen de URLs y credenciales

---

## Generación del Prompt de Review

Cuando los sandboxes terminan, el agente manual necesita un prompt para hacer
review. Se genera en `forja/prompts/review-prompt.md`.

### Template del Review Prompt

```
Tengo [N] sandboxes que ejecutaron el mismo plan de [M] fases con approaches diferentes:

[Para cada sandbox:]
- ../sandbox-[N] (branch [nombre-branch]) → personalidad: [personalidad]
  [Si Supabase:] Supabase: http://localhost:[puerto]

Cada uno tiene un RESUMEN.md y posiblemente PROBLEMAS.md.
[Si creativo:] El sandbox creativo tiene MEJORAS.md.
[Si disruptivo:] El sandbox disruptivo tiene ARQUITECTURA.md.

Haz esto:
1. Lee todos los RESUMEN.md para contexto general
2. Lee PROBLEMAS.md, MEJORAS.md, y ARQUITECTURA.md si existen
3. [Si Supabase:] Compara las migraciones SQL de los [N] sandboxes
4. Para cada fase (1-[M]), compara la implementación de los [N] sandboxes
5. Dime cuál sandbox lo hizo mejor en cada fase y por qué
6. Para cada fase, recomienda cherry-pick con el comando exacto:
   git cherry-pick <commit-hash>
   Si la fase tiene múltiples commits, lista todos en orden
7. [Si Supabase:] Identifica si las migraciones son compatibles entre sí
8. Identifica si hay ideas del sandbox disruptivo/creativo que valga la pena incorporar

GUÍA DE MERGE CONFLICTS:
9. Anticipa qué archivos van a conflictuar entre sandboxes y explica:
   - Por qué van a conflictuar
   - Cuál sandbox tiene la versión preferida para cada archivo
   - El comando exacto para resolver: git checkout --theirs <file> o --ours <file>
10. Si hay conflictos de migraciones SQL:
    - NO cherry-pick migraciones directamente. Genera una migración consolidada
      que combine lo mejor de cada sandbox
    - Muestra el SQL consolidado para que yo lo revise antes de aplicar
11. Recomienda un orden de merge que minimice conflictos:
    - Empezar por el sandbox Literal (baseline más limpia)
    - Luego cherry-pick mejoras de Creativo/Quality
    - Finalmente evaluar cambios de Disruptivo caso por caso
```

---

## Flujo de Conversación Completo

### Paso 1: Detección

```
🔨 La Forja detectada.

He analizado tu plan:
- [N] fases definidas
- [X] tareas totales
- Stack: [tecnologías]
- [Usa / No usa] Supabase

¿Cómo quieres ejecutar el build?
```

→ Ofrecer opciones: Build Manual vs Modo Forja

### Paso 2: Configuración (si Modo Forja)

```
⚙️ Configurando La Forja...

¿Cuántos agentes autónomos quieres lanzar?
```

→ Preguntar con widget de selección: 1, 2, 3, 4, 5

```
[Si usa Supabase:]
¿Cómo quieres aislar las bases de datos?
```

→ Docker Local vs Supabase Cloud

### Paso 3: Generación

```
🔨 Forjando configuración para [N] agentes...

Generando:
├── CLAUDE.md (instrucciones compartidas)
├── Prompt sandbox-1: [Personalidad]
├── Prompt sandbox-2: [Personalidad]
├── Prompt sandbox-3: [Personalidad]
├── Script de setup (setup.sh + cleanup.sh + monitor.sh)
{{#if cmux}}
├── launch-cmux.sh (lanzamiento automático en cmux)
├── monitor-cmux.sh (monitoreo con status y notificaciones cmux)
{{/if}}
├── Configs de Supabase ([N] instancias)
├── Templates de .env.local
└── Prompt de review

[Generar todos los archivos]
```

### Paso 4: Acompañar al Usuario en el Lanzamiento

En lugar de mostrar todos los pasos de una vez, guiar paso a paso con
confirmación en cada uno. Esto previene que el usuario se pierda o se
encuentre solo con un error.

**4.1 — Advertencia de Seguridad**

```
⚠️  NOTA DE SEGURIDAD

Los agentes autónomos se lanzan con `--dangerously-skip-permissions`.
Esto significa que pueden ejecutar cualquier comando del sistema sin pedirte
confirmación (instalar paquetes, modificar archivos, ejecutar scripts).

Mitigaciones incluidas:
✅ Cada agente corre en un Git Worktree aislado
✅ Las credenciales son de Supabase local (no producción)
✅ El review final te permite validar todo antes del merge

¿Entiendes y quieres continuar?
```

Esperar confirmación explícita del usuario antes de continuar.

**4.2 — Verificar Prerequisitos**

```
Paso 1 de 5: Prerequisitos
━━━━━━━━━━━━━━━━━━━━━━━━━

[Si Supabase:] ¿Tienes Docker Desktop abierto y corriendo?
¿Tienes Claude CLI instalado? (Verifica con: claude --version)
```

Esperar confirmación. Si no tiene algo, guiar la instalación.

**4.3 — Ejecutar Setup**

```
Paso 2 de 5: Setup
━━━━━━━━━━━━━━━━━━

Ejecuta este comando en tu terminal:

  chmod +x "forja/setup.sh" && "./forja/setup.sh"

Te mostrará el progreso. Cuando termine, pégame el resumen.
```

Esperar que el usuario confirme que el setup terminó. Si reporta errores,
diagnosticar y sugerir fix antes de continuar.

**4.4 — Lanzar Agentes**

**Si el usuario eligió cmux:**

```
Paso 3 de 5: Lanzar Agentes
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ejecuta este comando para lanzar todos los agentes automáticamente:

  chmod +x "forja/launch-cmux.sh" && "./forja/launch-cmux.sh"

Esto creará un workspace por agente en cmux con nombres descriptivos
y lanzará cada Claude Code automáticamente.

¿Se lanzaron todos los agentes?
```

Esperar confirmación. Si hay error, diagnosticar antes de continuar.

**Si el usuario eligió Terminal manual:**

```
Paso 3 de 5: Lanzar Agentes
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Abre [N] tabs en tu terminal. Vamos uno por uno:

Tab 1 ([Personalidad]):
  cd "[ruta-con-comillas]/sandbox-1"
  claude --dangerously-skip-permissions "$(cat "[ruta-con-comillas]/forja/prompts/sandbox-1-[slug].md")"

¿Lanzaste el agente 1?
```

Confirmar cada agente uno por uno. Si hay error en alguno, diagnosticar antes
de continuar con el siguiente.

Repetir para cada sandbox hasta completar los [N] agentes.

**4.5 — Monitoreo**

**Si el usuario eligió cmux:**

```
Paso 4 de 5: Monitoreo
━━━━━━━━━━━━━━━━━━━━━━

Los agentes te notificarán automáticamente cuando:
- Completen una fase (notificación + status actualizado)
- Encuentren un error (notificación con advertencia)
- Terminen por completo (notificación + progreso 100%)

Usa ⌘I para ver el panel de notificaciones.
Usa ⌘1-[N] para saltar al workspace de cada agente.

Para monitoreo detallado con status en el sidebar:

  chmod +x "forja/monitor-cmux.sh" && "./forja/monitor-cmux.sh"

Mientras tanto, puedes trabajar tu versión manual en el repo principal.
Cuando recibas las notificaciones de "BUILD TERMINADO", avísame.
```

**Si el usuario eligió Terminal manual:**

```
Paso 4 de 5: Monitoreo
━━━━━━━━━━━━━━━━━━━━━━

Los agentes están trabajando. Para ver su progreso en otra terminal:

  chmod +x "forja/monitor.sh" && "./forja/monitor.sh"

Mientras tanto, puedes trabajar tu versión manual en el repo principal.
Cuando todos muestren "TERMINADO" en el monitor, avísame.
```

**4.6 — Review**

```
Paso 5 de 5: Review
━━━━━━━━━━━━━━━━━━━

¡Los agentes terminaron! Vamos a revisar.

Voy a leer los RESUMEN.md de cada sandbox y darte recomendaciones
de cherry-pick con comandos exactos y guía de merge conflicts.
```

Ejecutar review-prompt.md automáticamente al llegar a este paso.

### Paso 5: Post-Ejecución (Review)

Cuando el usuario regresa después de que los sandboxes terminaron:

```
¿Los agentes terminaron? Vamos a revisar.

[Leer review-prompt.md y ejecutarlo]
[Analizar los N sandboxes]
[Presentar recomendaciones de cherry-pick con orden de merge]
[Guiar resolución de conflictos si los hay]
```

---

## Reglas del Skill

### Generación

1. **Todos los prompts son copy-paste-ready.** El usuario debe poder copiar
   el prompt exacto y pegarlo en Ghostty.

2. **El setup.sh debe ser idempotente.** Si lo corres dos veces, no rompe nada.

3. **Los puertos de Supabase se asignan incrementando de 1000 en 1000:**
   Sandbox 1: 54321+, Sandbox 2: 55321+, Sandbox 3: 56321+, etc.

4. **Las personalidades se asignan en orden:** Literal → Speed → Quality →
   Creativo → Disruptivo. Si hay menos agentes, se seleccionan las más
   relevantes según la tabla de personalidades.

5. **El CLAUDE.md se genera basándose en el plan real del usuario,** no con
   contenido genérico. Los comandos, skills, y convenciones reflejan su stack.

### Review

6. **El prompt de review se adapta al número de sandboxes y personalidades.**

7. **Si hay Supabase, el review incluye comparación de migraciones.**

8. **El review siempre prioriza:** funcionalidad > tests > arquitectura > innovación.

### Seguridad

9. **Nunca incluir secrets reales en archivos commiteados.** Los .env.local
   se generan como templates con placeholders o via script.

10. **Los JWT secrets se generan en runtime por el setup.sh,** no hardcodeados.

11. **Advertencia de permisos obligatoria.** Antes de generar los archivos,
    mostrar la advertencia de `--dangerously-skip-permissions` (ver Paso 4.1)
    y esperar confirmación explícita del usuario. Los agentes autónomos tienen
    acceso total al filesystem dentro de su worktree.

### Paths y Compatibilidad

12. **Todas las rutas van entrecomilladas.** Los comandos generados deben
    funcionar con espacios en el path (ej: "Vibe Coding/mi-proyecto").
    Usar `"$REPO_DIR"` siempre, nunca `$REPO_DIR` sin comillas.

13. **Cross-platform.** El setup.sh usa `sed_inplace()` en vez de `sed -i ''`
    para compatibilidad macOS/Linux. Ver `references/setup-script-template.md`.

14. **Usar el comando completo, no aliases.** Siempre usar
    `claude --dangerously-skip-permissions` en vez de `c`. Opcionalmente
    sugerir al usuario crear el alias como conveniencia, pero los comandos
    generados deben funcionar sin él.

### cmux (Opcional)

15. **cmux es siempre opcional.** Toda la lógica cmux va en bloques
    condicionales `{{#if cmux}}`. El flujo manual no se modifica.

16. **Scripts cmux separados.** `launch-cmux.sh` y `monitor-cmux.sh` son
    archivos independientes, no reemplazan `setup.sh` ni `monitor.sh`.

17. **OSC para notificaciones desde agentes.** Los agentes usan
    `printf '\e]9;...\a'` (secuencia OSC 9 nativa del terminal), no
    `cmux notify` (que requiere acceso al socket externo).

18. **`cmux` CLI para scripts externos.** `monitor-cmux.sh` y
    `launch-cmux.sh` sí usan comandos `cmux` porque corren fuera del
    terminal del agente y tienen acceso al socket.

### Protección de Disco

19. **Validación de espacio obligatoria.** `setup.sh` verifica espacio libre
    en disco y tamaño de `/private/tmp/claude-$(id -u)` antes de crear
    worktrees. Aborta si el espacio estimado supera 75% del disponible.
    Alerta si `/tmp/claude-*` supera 5GB.

20. **node_modules como symlink.** Los worktrees NUNCA instalan sus propias
    dependencias. `setup.sh` crea un symlink de `node_modules` apuntando al
    repo principal. Los prompts de agentes incluyen la regla explícita:
    "NO ejecutes npm install". Si un agente necesita un paquete nuevo, usa
    `npm install <paquete> --save` que se instala via symlink en el principal.

21. **Sin builds intermedios.** Los agentes NO ejecutan `next build` después
    de cada fase. Usan `npm run typecheck` para validar tipos. El build
    completo solo se ejecuta al final de todas las fases.

22. **Cleanup de /tmp.** El script `cleanup.sh` busca y ofrece eliminar
    sesiones de Claude Code en `/private/tmp/claude-*/` relacionadas con
    el proyecto. También ejecuta `git worktree prune` para limpiar
    worktrees huérfanos.

23. **Trap de emergencia.** `setup.sh` usa `trap cleanup_on_error EXIT` para
    limpiar worktrees parcialmente creados si el script falla a mitad.

24. **Monitoreo de disco.** `monitor.sh` y `monitor-cmux.sh` muestran el
    tamaño de cada sandbox y alertan si alguno supera 2GB o si
    `/tmp/claude-*` supera 5GB.

---

## Archivos de Referencia

Para generar los outputs, leer estos archivos en orden:

| Referencia | Cuándo Leer | Qué Contiene |
|------------|-------------|-------------|
| `references/claude-md-template.md` | Al generar CLAUDE.md | Template adaptable por stack |
| `references/agent-prompt-template.md` | Al generar prompts de agentes | Template con secciones y variaciones |
| `references/setup-script-template.md` | Al generar setup.sh | Script con lógica de worktrees + Supabase |
| `references/monitor-cmux-template.md` | Si `{{cmux}}` = true | Template de monitor-cmux.sh + launch-cmux.sh |

---

*"La Forja no reemplaza tu criterio. Multiplica tus manos."*
