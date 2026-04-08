# Template: CLAUDE.md

Este template se adapta al proyecto del usuario. Las secciones entre `{{}}` se
reemplazan con datos reales del plan.

---

## Template Base

```markdown
# La Forja — Instrucciones para Agentes

## Comandos Disponibles

### Build y Tests
- `/build` → Ejecuta `{{build_command}}` y verifica que compile sin errores
- `/playwright` → Ejecuta tests e2e con Playwright
- `/e2e` → Alias de /playwright
- `/lint` → Ejecuta `{{lint_command}}`
- `/test` → Ejecuta `{{test_command}}`

{{#if supabase}}
### Base de Datos
- `/db:migrate` → Ejecuta `supabase db push` para aplicar migraciones pendientes
- `/db:reset` → Ejecuta `supabase db reset` para limpiar DB y re-aplicar todo
- `/db:seed` → Ejecuta seed.sql para datos de prueba
- `/db:diff` → Ejecuta `supabase db diff` para ver cambios pendientes
- `/db:status` → Ejecuta `supabase status` para ver URLs y keys
{{/if}}

### Deploy
- `/deploy:preview` → Hace deploy a preview (no producción)

## Reglas de Ejecución
- Después de completar CADA fase, ejecuta /build y /playwright
- Si los tests fallan, corrige antes de avanzar a la siguiente fase
- No avances de fase si hay errores de build o tests rotos
- Si una fase falla tests 3 veces seguidas, documenta en PROBLEMAS.md y avanza

{{#if supabase}}
## Reglas de Base de Datos
- TODAS las migraciones van en supabase/migrations/ con formato: YYYYMMDDHHMMSS_nombre.sql
- NUNCA modifiques la DB directamente, siempre via migraciones
- Cada tabla DEBE tener RLS policies configuradas
- Después de crear migraciones, ejecuta /db:migrate para aplicarlas
- Si algo sale mal con la DB, ejecuta /db:reset para empezar limpio
- Datos de prueba van en supabase/seed.sql
- Para probar emails de auth, revisa Inbucket en el puerto configurado

## Reglas de Storage
- Crea buckets via migración SQL, no manualmente
- Configura RLS policies para cada bucket

## Reglas de Auth
- Usa Supabase Auth (no custom auth)
- site_url en config.toml debe coincidir con tu dev server
{{/if}}

{{#if skills}}
## Skills Disponibles
{{#each skills}}
- `{{path}}` → {{description}}
{{/each}}
{{/if}}

## Stack Técnico
{{stack_table}}

## Recursos del Sistema

Este sandbox es parte de una operación La Forja con {{num_agents}} agentes paralelos.

| Recurso | Por Sandbox | Total Estimado |
|---------|-------------|----------------|
| RAM | ~3 GB | ~{{total_ram}} GB |
| Disco | ~2 GB (Docker images) | ~{{total_disk}} GB |
| Puertos | 8-10 (Supabase + dev) | {{total_ports}} |

Si experimentas lentitud extrema o errores de memoria, documenta en PROBLEMAS.md
y continúa con fases que no requieran hot-reload.

## Convenciones
- Commits: "fase-N: descripción corta"
- Tests: cada feature nueva requiere al menos un test e2e
- Variables de entorno: nunca hardcodear, siempre .env.local
- Documentar decisiones ambiguas en comentarios del código
- Worktree: estás en un sandbox aislado. NO modifiques archivos fuera de tu worktree
- Si necesitas algo del repo principal, lee pero no escribas
```

---

## Reglas de Adaptación

1. **Detectar el stack del plan.** Si el plan menciona Next.js, los comandos de
   build serán `npm run build`. Si menciona Vite, serán `vite build`. Etc.

2. **Detectar si usa Supabase.** Buscar en plan/tasks/blueprint menciones de
   Supabase, PostgreSQL, RLS, migrations. Si las encuentra, incluir la sección
   de DB. Si no, omitirla.

3. **Detectar skills disponibles.** Revisar si existe `skills/` en el repo y
   listar los archivos .md encontrados.

4. **Los comandos deben ser verificables.** Si el plan usa pnpm en vez de npm,
   los comandos deben reflejarlo. Revisar package.json si existe.

5. **El CLAUDE.md se escribe EN el repo principal** (no en forja/). Se commitea
   para que todos los worktrees lo hereden automáticamente.
