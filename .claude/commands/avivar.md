---
description: "Avivar la fragua — inicializa el contexto del proyecto al comenzar cada sesión. Claude mapea el estado real del proyecto y está listo para forjar en segundos."
---

# Avivar: Contexto Forge

Este proyecto fue creado con **Forge**, una template optimizada para desarrollo Agent-First. Al ejecutar `/avivar`, el agente entiende inmediatamente qué tiene disponible y cómo trabajar.

## Lo Que Ya Sabes (Forge DNA)

### Golden Path (Stack Fijo)
No hay decisiones técnicas que tomar. El stack está definido:

| Capa | Tecnología | Notas |
|------|------------|-------|
| Framework | Next.js 16 + Turbopack | App Router, Server Components |
| UI | React 19 + TypeScript | Strict mode |
| Styling | Tailwind CSS 3.4 | Sin CSS custom |
| Backend | Supabase | Auth + PostgreSQL + Storage + RLS |
| Validation | Zod | Schemas compartidos client/server |

### Arquitectura Feature-First
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Route group: páginas sin sidebar
│   ├── (main)/            # Route group: páginas con sidebar
│   └── api/               # API Routes
├── features/              # Todo colocalizado por feature
│   └── [feature-name]/
│       ├── components/    # UI de la feature
│       ├── services/      # Lógica de negocio
│       ├── hooks/         # React hooks
│       └── types/         # TypeScript types
├── components/            # Componentes compartidos (Sidebar, etc.)
└── lib/
    └── supabase/          # Clients (client.ts, server.ts)
```

### MCPs Disponibles
Tienes 3 MCPs conectados. Úsalos:

| MCP | Comandos Clave | Cuándo Usar |
|-----|----------------|-------------|
| **Supabase** | `list_tables`, `execute_sql`, `apply_migration`, `get_logs` | SIEMPRE para BD. No uses CLI. |
| **Next.js DevTools** | `nextjs_index`, `nextjs_call`, `browser_eval` | Debug errores, ver estado del servidor |
| **Playwright** | `browser_navigate`, `browser_snapshot`, `browser_click` | Validación visual, testing UI |

### Agentes Especializados
Delega tareas complejas a agentes via `Task` tool:

| Agente | Responsabilidad |
|--------|-----------------|
| `frontend-specialist` | UI/UX, componentes, Tailwind, animaciones |
| `backend-specialist` | Server Actions, APIs, lógica de negocio |
| `supabase-admin` | Migraciones, RLS policies, queries complejas |
| `validacion-calidad` | Tests, quality gates, verificación |
| `vercel-deployer` | Deploy, env vars, dominios |
| `gestor-documentacion` | README, docs técnicos |
| `codebase-analyst` | Patrones, convenciones del proyecto |

### Comandos Slash Disponibles
- `/avivar` → Este comando (contexto inicial)
- `/a2a-report` → Reporte para comunicar a otra IA
- `/generar-prp` → Generar La Pieza (plan de construcción)
- `/new-app` → Crear nueva aplicación desde cero

---

## Paso 0: Quick Check (Silencioso)

Antes de contextualizar, ejecuta esta verificación rápida sin mostrar output al usuario:

```bash
ISSUES=""
[ ! -f CLAUDE.md ] && ISSUES="${ISSUES}CLAUDE.md faltante; "
[ ! -d .claude ] && ISSUES="${ISSUES}.claude/ faltante; "
[ ! -f .mcp.json ] && ISSUES="${ISSUES}.mcp.json no configurado; "
[ ! -d node_modules ] && ISSUES="${ISSUES}dependencias no instaladas; "
echo "${ISSUES:-OK}"
```

- Si el resultado es **"OK"**: no mostrar nada, proceder al Paso 1 silenciosamente.
- Si hay issues: mostrar esto antes de continuar:

```
⚠️ Detecté configuración incompleta:
  • [listar los issues encontrados]

→ Ejecuta /forge-check para diagnosticar y arreglar todo, o continúa de todas formas.
  ¿Continuar o ejecutar /forge-check primero?
```

Si el usuario quiere continuar: proceder con el Paso 1.
Si pide `/forge-check`: ejecutar ese comando en su lugar.

---

## Proceso de Contextualización

### 0.5. Leer Memoria del Proyecto (si existe)

Si existe `.claude/memory/MEMORY.md`, leerlo PRIMERO. Este archivo es el índice de la memoria persistente del proyecto:
- En qué fase del build estaba el agente anterior
- Decisiones ya tomadas (no volver a preguntar)
- Blockers resueltos (no repetir errores)
- Contexto técnico (qué ya existe, qué patrones se establecieron)

Si `.claude/memory/MEMORY.md` existe, usarlo como **fuente primaria** de contexto y complementar con los pasos siguientes. Leer archivos de detalle relevantes en las subcarpetas (user/, feedback/, project/, reference/). Mostrar al usuario:
```
📝 Memoria del proyecto encontrada — retomando desde Fase [N] de [Total].
Última acción: [última fase completada]
Próxima acción: [qué sigue]
```

**Backward compat:** Si `.claude/memory/` NO existe pero `STATE.md` sí, leer STATE.md (proyecto legacy V1).

Si ninguno existe: el proyecto aún no ha iniciado build, proceder normalmente.

### 1. Leer Identidad del Proyecto

Lee `CLAUDE.md` y extrae:
- **Nombre del proyecto**
- **Problema que resuelve** (propuesta de valor)
- **Usuario target** (avatar)
- **Reglas de negocio específicas**

### 2. Mapear Estado de BD (via Supabase MCP)

Ejecuta `list_tables` para ver:
- Qué tablas existen
- Cuántos registros tiene cada una
- Si RLS está habilitado
- Relaciones entre tablas (foreign keys)

### 3. Escanear Features Implementadas

Revisa `src/app/` y `src/features/` para entender:
- Qué páginas existen
- Qué features están construidas
- Qué API endpoints hay

### 4. Entregar Resumen

```markdown
# 🏭 [Nombre del Proyecto]

## Template
Forge V1 (Next.js 16 + Supabase)

## Propósito
[Qué problema resuelve en 1-2 líneas]

## Estado Actual

### Base de Datos
| Tabla | Registros | RLS |
|-------|-----------|-----|
| ... | ... | ✅/❌ |

### Rutas Implementadas
- `/` → [descripción]
- `/dashboard` → [descripción]
- ...

### API Endpoints
- `POST /api/xxx` → [qué hace]
- ...

## MCPs Activos
✅ Supabase | ✅ Next.js DevTools | ✅ Playwright

## Comandos
- `npm run dev` → Desarrollo
- `npm run build` → Build

## Listo para trabajar
¿En qué te ayudo?
```

---

## Filosofía Forge

### El Humano Decide QUÉ, Tú Ejecutas CÓMO
- El humano define el problema de negocio
- Tú traduces a código usando el Golden Path
- No preguntas "¿qué stack usar?" - ya está decidido

### Velocidad = Inteligencia
- Turbopack permite 100 iteraciones en 30 segundos
- Usa Playwright para validar visualmente → código → screenshot → iterar
- No planifiques de más, ejecuta y ajusta

### MCPs son tus Sentidos
- **Supabase MCP** = Tu conexión a la BD (no uses CLI)
- **Next.js DevTools** = Tus ojos en errores/logs
- **Playwright** = Tu validación visual

---

## Uso

```bash
# Al inicio de cada conversación nueva
/avivar

# El agente lee el contexto y está listo para trabajar
```

**Objetivo**: De 5-10 minutos de explicación a 30 segundos de contexto automático.

---

*Forge: Agent-First Development*
