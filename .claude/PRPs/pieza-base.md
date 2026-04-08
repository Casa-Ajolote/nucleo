# Sistema La Pieza — Product Blueprint

> *"El Blueprint no es lo que imaginas. Es lo que vas a construir."*

Una Pieza es el **contrato entre el plan y el código**. La genera el comando `/build` automáticamente desde el BLUEPRINT aprobado, y guía a El Yunque fase por fase.

---

## 🔄 Cómo Encaja en Forge

```
/plan  →  BLUEPRINT-[nombre].md  (aprobado por ti)
              ↓
/build →  Lee el Blueprint
              ↓
         Genera PIEZA-[nombre].md  (este archivo)
              ↓
         Presenta fases → Espera "go"
              ↓
         El Yunque ejecuta por fases
              ↓
         Auto-Blindaje documenta aprendizajes aquí
```

---

## 📋 Anatomía de La Pieza

| Sección | Propósito | Quién la llena |
|---------|-----------|----------------|
| **Objetivo** | Qué se construye — estado final en 1-2 oraciones | `/build` desde el Blueprint |
| **Por Qué** | Valor de negocio | `/build` desde el PDR |
| **Qué** | Comportamiento + criterios de éxito medibles | `/build` + refinamiento |
| **Contexto** | Código existente, docs, referencias | Agente mapea just-in-time |
| **Blueprint** | Fases de implementación (SIN subtareas) | `/build` desde el Blueprint |
| **Auto-Blindaje** | Errores y fixes documentados durante la build | Agente actualiza en tiempo real |

---

## 📝 Nomenclatura

- Archivos: `PIEZA-[nombre-del-proyecto].md`
- Estados: `PENDIENTE` → `APROBADO` → `EN_PROGRESO` → `COMPLETADO`
- Ubicación: `.claude/PRPs/`

---

# TEMPLATE LA PIEZA

```markdown
# La Pieza: [Nombre del Proyecto]

> **Estado**: PENDIENTE
> **Blueprint origen**: `BLUEPRINT-[nombre].md`
> **Fecha**: YYYY-MM-DD
> **Build Mode**: [SaaS Completo / MVP / Herramienta Interna / Landing Page / AI Feature]

---

## Objetivo

[Qué se construye — estado final deseado en 1-2 oraciones concretas]

## Por Qué

| Problema del Usuario | Cómo lo Resuelve |
|---------------------|--------------------|
| [Dolor específico] | [Feature que lo elimina] |

**Impacto medible**: [Conversiones, tiempo ahorrado, revenue potencial]

## Qué

### Criterios de Éxito (Definition of Done)
- [ ] [Criterio medible 1 — con número si aplica]
- [ ] [Criterio medible 2]
- [ ] [Criterio medible 3]

### Happy Path
[Flujo principal del usuario — de A a Z]

---

## Contexto

### Referencias de Código
- `src/features/[existente]/` → Patrón a seguir para la nueva feature
- [URL de docs de librería] → API reference
- `BLUEPRINT-[nombre].md` → Fuente de verdad del plan

### Arquitectura Propuesta (Feature-First)
```
src/features/[nueva-feature]/
├── components/        ← UI components de la feature
├── hooks/             ← Custom hooks
├── services/          ← Business logic + API calls
├── store/             ← Zustand slice (si aplica)
└── types/             ← TypeScript types
```

### Modelo de Datos (si aplica)
```sql
CREATE TABLE [tabla] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: OBLIGATORIO en toda tabla con datos de usuario
ALTER TABLE [tabla] ENABLE ROW LEVEL SECURITY;

CREATE POLICY [tabla]_select_own ON [tabla]
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY [tabla]_insert_own ON [tabla]
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY [tabla]_update_own ON [tabla]
  FOR UPDATE USING (auth.uid() = user_id);
```

---

## Blueprint (Fases de Construcción)

> ⚠️ REGLA CRÍTICA: Solo definir FASES aquí. Las subtareas se generan
> al ENTRAR a cada fase (mapeo de contexto just-in-time).
> Ver: `.claude/prompts/el-yunque.md`

### Fase 1: [Nombre — ej: Setup + Auth]
**Objetivo**: [Qué queda funcionando al completar esta fase]
**Validación**: [Cómo confirmar que está completa — comando o comportamiento]
**Tiempo estimado**: ~Xh

### Fase 2: [Nombre — ej: DB Schema + RLS]
**Objetivo**: [Qué queda funcionando]
**Validación**: [Cómo confirmar]
**Tiempo estimado**: ~Xh

### Fase 3: [Nombre — ej: Core Features]
**Objetivo**: [Qué queda funcionando]
**Validación**: [Cómo confirmar]
**Tiempo estimado**: ~Xh

### Fase N: Validación Final
**Objetivo**: Sistema funcionando end-to-end
**Validación**:
- [ ] `npm run typecheck` → 0 errores
- [ ] `npm run build` → exitoso
- [ ] Playwright screenshot confirma UI renderiza
- [ ] Todos los criterios de éxito cumplidos
- [ ] RLS verificado con `get_advisors(type: "security")`

---

## 🔒 Auto-Blindaje

> *"Cada error es un impacto que refuerza la estructura. El mismo error nunca ocurre dos veces."*
>
> Esta sección CRECE durante la implementación. El agente la actualiza
> cada vez que encuentra y resuelve un error. El conocimiento persiste.

### [YYYY-MM-DD]: [Título corto del aprendizaje]
- **Error**: [Qué falló exactamente]
- **Fix**: [Cómo se resolvió]
- **Aplicar en**: [Dónde más aplica — feature, agente, o todo el proyecto]

---

## Gotchas (Antes de Implementar)

> Cosas críticas que hay que saber ANTES de escribir código.

- [ ] [Gotcha 1 — ej: "Chart.js requiere dynamic import con ssr: false"]
- [ ] [Gotcha 2 — ej: "Supabase RLS debe verificarse con get_advisors después de cada migración"]
- [ ] [Gotcha 3 — ej: "Vercel AI SDK v5: usar `streamText` para conversacional, `generateObject` para datos estructurados"]

## Anti-Patrones Forge

- ❌ NO crear nuevos patrones cuando los existentes funcionan
- ❌ NO ignorar errores de TypeScript — corregirlos siempre
- ❌ NO hardcodear valores — usar variables de entorno o constantes
- ❌ NO omitir validación Zod en cualquier input del usuario
- ❌ NO crear tablas sin RLS si contienen datos de usuario
- ❌ NO parsear JSON manualmente cuando existe `generateObject` + Zod
- ❌ NO escribir código en el root de `src/app/` — respetar Feature-First

---

*La Pieza pendiente aprobación. Ninguna línea de código ha sido modificada.*
```

---

## 🎯 Stack Golden Path (Referencia Rápida)

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 16 + React 19 + TypeScript (strict) |
| Estilos | Tailwind CSS 3.4 + shadcn/ui |
| Backend | Supabase (Auth + PostgreSQL + RLS) |
| AI Engine | Vercel AI SDK v5 + OpenRouter |
| Validación | Zod — siempre, sin excepción |
| Estado | Zustand (client) |
| Testing | Playwright MCP (E2E visual) |
| Deploy | Vercel |

---

## 🔗 Archivos Relacionados

| Archivo | Rol |
|---------|-----|
| `BLUEPRINT-[nombre].md` | Fuente de verdad del plan (input de /build) |
| `.claude/prompts/el-yunque.md` | Motor de ejecución por fases (El Yunque) |
| `.claude/commands/build.md` | Comando que genera esta Pieza |
| `.claude/agents/` | Agentes especializados que ejecutan las fases |
