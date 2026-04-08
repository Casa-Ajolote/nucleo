# /build — Forge Execution Pipeline

Toma el Blueprint aprobado y lo convierte en código production-ready.

## Qué Hace

1. Lee el `BLUEPRINT-[nombre].md` o `AI-FEATURE-BRIEF-[nombre].md` (según el modo)
2. **Determina qué template de Pieza usar** según el Build Mode del documento:
   - 🏗️ SaaS Completo / 🚀 MVP / 🔧 Herramienta Interna / 🎯 Landing → `pieza-base.md`
   - 🤖 Feature con IA → **`pieza-ai.md`** (template AI-específico)
3. Genera la Pieza en `.claude/PRPs/PIEZA-[nombre].md` o `.claude/PRPs/PIEZA-AI-[nombre].md`
4. Presenta el plan de ejecución por fases (máximo 10 líneas)
5. **PREGUNTA: ¿Build Manual o Modo Forja?**
   - **Build Manual** → ESPERA "go" y ejecuta El Yunque
   - **Modo Forja** → Carga `skills/la-forja/SKILL.md` y configura los sandboxes
6. Ejecuta según la opción elegida

## Fork: Build Manual vs Modo Forja

Después de mostrar el plan de fases, presentar siempre esta elección:

```
¿Cómo quieres ejecutar este build?

🔧 Build Manual — Trabajamos tú y yo, fase por fase, con tu aprobación en cada paso
🔨 Modo Forja   — Lanzo N agentes autónomos en sandboxes paralelos mientras avanzas tú también
```

**Si elige Build Manual:** proceder con el flujo estándar (esperar "go" → El Yunque).

**Si elige Modo Forja:** leer `skills/la-forja/SKILL.md` y seguir sus instrucciones
para configurar los sandboxes, personalidades, y generar los archivos `forja/`.

## Handoff Protocol

Para features de IA (`Build Mode: 🤖 Feature con IA`):

```
📋 AI-FEATURE-BRIEF leído: AI-FEATURE-BRIEF-[nombre].md
🤖 Subtipo: [A · Chat / B · RAG / C · Chat con Docs / D · Memoria / E · Estructurado]
📄 La Pieza generada: .claude/PRPs/PIEZA-AI-[nombre].md

Plan de ejecución:
• Fase 1: [según subtipo — ej: Infraestructura vectorial (~45min)]
• Fase 2: [ej: Pipeline de ingesta (~1h)]
• Fase 3: [ej: API route con streaming (~1h)]
• Fase 4: [ej: UI del asistente (~1h)]
• Fase 5: Validación final (~30min)

¿Cómo quieres ejecutar este build?
🔧 Build Manual — Fase por fase, con tu aprobación
🔨 Modo Forja   — N agentes autónomos en paralelo
```

Para otros modos (SaaS / MVP / Tool / Landing):

```
📋 Blueprint leído: BLUEPRINT-[nombre].md
📄 La Pieza generada: .claude/PRPs/PIEZA-[nombre].md

Plan de ejecución:
• Fase 1: Setup + Auth (~2h)
• Fase 2: DB Schema + RLS (~1h)
• Fase 3: Core Features (~4h)
• Fase 4: UI + Testing (~2h)
• Fase 5: Deploy Vercel (~30min)

¿Cómo quieres ejecutar este build?
🔧 Build Manual — Fase por fase, con tu aprobación
🔨 Modo Forja   — N agentes autónomos en paralelo
```

## Reglas Críticas

- ❌ **NO escribas ninguna línea de código sin recibir elección del usuario** (Manual o Forja)
- ❌ **NO asumas aprobación** — espera explícitamente
- ✅ El usuario puede modificar fases antes de elegir modo
- ✅ El resumen de fases debe ser conciso (10 líneas máximo)
- ✅ Build Manual: ejecutar según `.claude/prompts/el-yunque.md`
- ✅ Modo Forja: leer `skills/la-forja/SKILL.md` y seguir su flujo

## Cuándo Usar

```
/build                             → Usa el Blueprint en contexto actual
/build BLUEPRINT-inventario.md     → Especifica qué Blueprint usar
```

## Pre-requisitos

- Para modos SaaS/MVP/Tool/Landing: debe existir `BLUEPRINT-[nombre].md` generado por `/plan`
- Para modo 🤖 Feature con IA: debe existir `AI-FEATURE-BRIEF-[nombre].md` generado por `/plan`
- El documento debe estar aprobado por el usuario
- Sin documento de plan no hay construcción (❌ código sin planificación = deuda técnica)

## Flujo Completo

```
/build
  ↓
¿Build Mode = 🤖 Feature con IA?
  ├─ SÍ → Leer AI-FEATURE-BRIEF-[nombre].md
  │        Generar PIEZA-AI-[nombre].md desde pieza-ai.md
  │        (incluye subtipo, modelo, schema, fases por subtipo)
  │
  └─ NO → Leer BLUEPRINT-[nombre].md
           Generar PIEZA-[nombre].md desde pieza-base.md
  ↓
Mostrar fases concisas (≤ 10 líneas)
  ↓
PREGUNTAR: ¿Build Manual o Modo Forja?
  ├─ Build Manual → ESPERAR "go" → Ejecutar El Yunque por fases
  │                  → Playwright valida visualmente
  │                  → Deploy a Vercel
  │
  └─ Modo Forja  → Leer skills/la-forja/SKILL.md
                    → Configurar N agentes + personalidades
                    → Generar forja/ (CLAUDE.md, prompts, setup.sh)
                    → Presentar comandos de lanzamiento
```
