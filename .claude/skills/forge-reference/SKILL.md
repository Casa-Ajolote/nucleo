---
name: forge-reference
description: |
  Referencia extendida de Forge: MCPs, hooks, agentes, comandos completos, testing patterns,
  skills externos. Contenido movido de CLAUDE.md para mantenerlo bajo 200 lineas.
  Consultar cuando necesites detalles de MCPs, hooks, lista completa de comandos, o agentes.
allowed-tools: Read
---

# Forge Reference — Detalles Extendidos

Contenido de referencia para consulta on-demand. No necesitas leer esto en cada sesion.

---

## MCPs: Sentidos y Manos

### Next.js DevTools MCP - Quality Control
Conectado via `/_next/mcp`. Ve errores build/runtime en tiempo real.
- `init` → Inicializa contexto
- `nextjs_call` → Lee errores, logs, estado
- `nextjs_docs` → Busca en docs oficiales

### Playwright MCP - Ojos
- `playwright_navigate` → Navega a URL
- `playwright_screenshot` → Captura visual
- `playwright_click/fill` → Interactua con elementos

### Supabase MCP - Manos (Backend)
- `execute_sql` → SELECT, INSERT, UPDATE, DELETE
- `apply_migration` → CREATE TABLE, ALTER, indices, RLS
- `list_tables` → Ver estructura de BD
- `get_advisors` → Detectar tablas sin RLS

---

## Hooks (7, fail-open)

Principio fail-open: Si un hook falla, aprueba la accion. Nunca atrapa al usuario.

| Hook | Tipo | Que Hace |
|------|------|----------|
| `pre-commit-validation.sh` | PreToolUse | TypeScript typecheck antes de commit |
| `security-scan.sh` | PreToolUse | Detecta secretos, CORS `*`, debug stmts |
| `auto-format.sh` | PostToolUse | Prettier automatico |
| `test-runner.sh` | PostToolUse | Tests relacionados al archivo editado |
| `cost-tracker.sh` | PostToolUse | Trackea uso de herramientas por sesion |
| `log-tool-usage.sh` | PostToolUse | Audit log de ejecuciones |
| `stop-hook.sh` | Stop | Review Loop al terminar sesion |

Activar: `cp .claude/example.settings.json .claude/settings.json`

---

## Agentes Especializados (12)

| Agente | Rol |
|--------|-----|
| `frontend-specialist` | UI/UX implementation |
| `backend-specialist` | APIs, DB, server logic |
| `codebase-analyst` | Debugging, refactoring |
| `supabase-admin` | DB, RLS, migrations |
| `vercel-deployer` | Deploy, CI/CD |
| `validacion-calidad` | Testing, QA |
| `gestor-documentacion` | Docs, changelogs |
| `design-critic` | Evaluacion de diseno UX/UI |
| `qa-auditor` | Accessibility + Performance + Security |
| `db-architect` | Schemas, indexacion, query optimization |
| `testing-engineer` | Unit, integration, contract tests |
| `observability-engineer` | Logging, Sentry, metricas, health checks |

---

## Comandos Completos

### Pipeline
- `/plan` — Planificacion (10 skills → Blueprint)
- `/build` — Construccion (Blueprint → La Pieza → Build Manual o Modo Forja)

### Setup
- `/onboarding` — Ruta personalizada para nuevos usuarios
- `/forge-check` — Diagnostico del entorno
- `/avivar` — Retomar contexto del proyecto

### Standalone (Add-X)
- `/add-login` — Auth con Supabase
- `/add-payments` — Pagos (decision Polar vs Stripe)
- `/add-emails` — Emails transaccionales (Resend)
- `/add-mobile` — PWA + push notifications
- `/landing` — Landing page copy-first + anti-AI-slop
- `/website-3d` — Landing cinematica scroll-stop
- `/redesign` — Audita → reporte → fixes

### Design Quality
- `/design` — Genera/extrae/actualiza DESIGN.md
- `/critique` — Evaluacion UX/design (10 dimensiones + AI slop)
- `/polish` — Refinamientos visuales sistematicos
- `/normalize` — Alinear UI con design system
- `/web-audit` — 150+ checks (Performance, A11y, SEO)

### Strategy
- `/brujula` — Product Vision + Strategy Canvas
- `/precio` — Pricing y monetizacion
- `/estrella` — North Star Metric
- `/rivales` — Analisis competitivo + battlecards

### Business
- `/roi` — Metricas SaaS + dashboard HTML
- `/graduate` — MVP → production-ready plan
- `/kanban` — Tablero por User Story
- `/metas` — OKRs + Outcome Roadmap
- `/lanzamiento` — Go-to-Market + launch plan

### Engineering
- `/despachar` — Ship: merge, typecheck, lint, build, review, commit, push, PR
- `/inspeccionar` — Review pre-landing (11 categorias)
- `/fragua-review` — Review con mentalidad founder
- `/retro` — Retrospectiva de ingenieria

### Review Loop
- `/review-loop <tarea>` — Implementa + 4 agentes Codex en paralelo
- `/cancel-review` — Cancela loop activo

### Meta
- `/autoresearch` — Auto-optimizacion de skills (patron Karpathy)
- `/video-visuals` — Visuales estilo sketchnote

### Lifecycle
- `/update-forge` — Actualizar Forge
- `/eject-forge` — Remover Forge, dejar solo codigo

### Dev
- `npm run dev` — Servidor (auto-detecta puerto 3000-3006)
- `npm run build` — Build produccion
- `npm run typecheck` — Verificar tipos
- `npm run lint` — ESLint
- `npm run commit` — Conventional Commits

---

## La Pieza (Blueprints de Features)

Ubicacion: `.claude/PRPs/`

| Archivo | Proposito |
|---------|-----------|
| `pieza-base.md` | Template base para SaaS/MVP/Tool/Landing |
| `pieza-ai.md` | Template para features con IA |
| `PIEZA-[nombre].md` | La Pieza generada para el proyecto |

---

## Testing (Patron AAA)

```typescript
test('should calculate total with tax', () => {
  // Arrange
  const items = [{ price: 100 }, { price: 200 }];
  const taxRate = 0.1;
  // Act
  const result = calculateTotal(items, taxRate);
  // Assert
  expect(result).toBe(330);
});
```

---

## Skills Externos (Extensiones Opcionales)

### Impeccable (17 comandos de diseno)
```bash
npx skills add pbakaus/impeccable
```

### Web Quality (6 skills de auditoria)
```bash
npx skills add addyosmani/web-quality-skills
```

### Agency Agents (61 agentes)
```bash
# Copiar desde github.com/msitarzewski/agency-agents
```

### gstack (Browser QA)
```bash
git clone https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
cd ~/.claude/skills/gstack && ./setup
```
