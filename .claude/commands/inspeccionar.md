# /inspeccionar — Review Pre-Landing

> *"Ningún herrero entrega una pieza sin inspeccionarla. Los tests pasan, pero eso no significa que el código sea seguro."*

Analiza el diff de la branch actual contra main buscando issues estructurales que los tests no capturan. Enfocado en el Golden Path (Next.js + TypeScript + Supabase + Tailwind).

## Instrucciones

### Paso 1: Verificar branch

1. `git branch --show-current` para obtener la branch actual.
2. Si estás en `main`, output: **"Nada que inspeccionar — estás en main o no hay cambios contra main."** y parar.
3. `git fetch origin main --quiet && git diff origin/main --stat` para verificar si hay diff. Si no hay, mismo mensaje y parar.

### Paso 2: Obtener el diff

```bash
git fetch origin main --quiet
git diff origin/main
```

Esto incluye cambios commiteados y no commiteados contra el último main.

### Paso 3: Review en dos pases

#### PASE 1 — CRITICAL (bloquean `/despachar`)

##### TypeScript Safety
- `any` usado en lugar de `unknown`
- `as` casts sin validación runtime (Zod `.parse()` o type guard)
- `@ts-ignore` / `@ts-expect-error` sin comentario justificando
- `!` (non-null assertion) en datos que vienen de API o DB

##### Supabase Data Safety
- Tablas nuevas sin RLS policies
- Queries sin filtro de `user_id` en tablas con datos de usuario
- `service_role` key importada en código client-side
- `supabaseAdmin` usado donde debería ser `supabase` (client)
- `.single()` sin manejo de `null` result

##### Auth & Trust Boundaries
- API routes sin verificar `session` / `getUser()`
- Server actions sin auth check
- Datos de usuario A accesibles por usuario B vía ID manipulation
- `middleware.ts` no protegiendo rutas que deberían ser privadas
- Cookies/tokens expuestos en client-side code

##### Server/Client Boundary
- `"use client"` faltante en componentes que usan hooks (`useState`, `useEffect`, etc.)
- Secrets (`process.env.SUPABASE_SERVICE_ROLE_KEY`, etc.) importados en componentes `"use client"`
- `process.env.VARIABLE` (sin `NEXT_PUBLIC_`) referenciado en client components
- Server-only imports (`next/headers`, `cookies()`) usados en client components

##### Injection Vectors
- `dangerouslySetInnerHTML` con datos de usuario
- String interpolation en queries SQL de Supabase
- Input de usuario directo en system prompts de LLM (prompt injection)
- URLs construidas con input de usuario sin validación

**DO NOT flag:**
- `as const` assertions (son safe)
- `as` casts en test files
- `process.env` en `next.config.ts` o archivos de configuración server-only
- RLS ya configurada en migraciones previas (leer diff completo primero)

#### PASE 2 — INFORMATIONAL (incluir en PR body)

##### React Patterns
- `useEffect` sin cleanup function cuando tiene subscriptions, timers, o event listeners
- Dependencies array de `useEffect`/`useMemo`/`useCallback` incompleto o sospechoso
- State que podría ser derived (computed) en vez de almacenado
- Components re-rendering innecesariamente (objetos/arrays nuevos en cada render como props)

##### Zod Validation
- API routes que leen `request.json()` sin validar con Zod
- Server actions que reciben `formData` sin schema validation
- Schemas Zod incompletos (faltan campos del form, o no cubren edge cases)

##### Performance
- Queries potenciales N+1 (loop → query dentro del loop)
- `"use client"` en páginas/componentes que podrían ser server components
- Imágenes sin `next/image` (missing optimization)
- Imports pesados sin lazy loading (`React.lazy` / `dynamic()`)
- `fetch` en componentes client sin `useSWR`/`useQuery` (no caching)

##### Dead Code & Consistency
- Variables asignadas pero nunca leídas
- Imports no utilizados
- Componentes exportados pero no importados en ningún lado
- Comentarios que describen comportamiento anterior después de cambiar el código

##### Error Handling
- `catch(e) {}` vacíos — errors swallowed silenciosamente
- `catch` que solo hace `console.error` sin UI feedback al usuario
- Promesas sin `.catch()` o `try/catch`
- Estados de error faltantes en UI (loading: sí, success: sí, error: ?)

##### Console Artifacts
- `console.log` olvidados (que no son debug intencional)
- `console.error` que deberían ser Sentry captures en producción

### Paso 4: Output

**Siempre output TODOS los hallazgos** — critical e informational.

**Formato:**

```
🔍 Inspección Pre-Landing: N issues (X critical, Y informational)

**CRITICAL** (bloquean /despachar):
- [archivo:línea] Descripción del problema
  Fix: solución sugerida

**Issues** (no bloquean):
- [archivo:línea] Descripción del problema
  Fix: solución sugerida
```

Si no hay issues: `🔍 Inspección Pre-Landing: Sin issues encontrados. Listo para despachar.`

**Si hay issues CRITICAL:** Para CADA issue, usar AskUserQuestion separado:
- Problema + fix recomendado + opciones:
  - A) Arreglar ahora (recomendado)
  - B) Reconocer y continuar
  - C) Falso positivo — saltar

Si el usuario elige A: aplicar fixes. Si la inspección fue invocada desde `/despachar`, indicar que se re-ejecute.

### Paso 5: Resumen

Al final, presentar resumen scaneable:

```
┌──────────────────────────────────────────┐
│     INSPECCIÓN PRE-LANDING — RESUMEN     │
├──────────────────────────────────────────┤
│ TypeScript Safety      │ X issues        │
│ Supabase Data Safety   │ X issues        │
│ Auth & Trust           │ X issues        │
│ Server/Client Boundary │ X issues        │
│ Injection Vectors      │ X issues        │
│ React Patterns         │ X issues        │
│ Zod Validation         │ X issues        │
│ Performance            │ X issues        │
│ Dead Code              │ X issues        │
│ Error Handling         │ X issues        │
│ Console Artifacts      │ X issues        │
├──────────────────────────────────────────┤
│ TOTAL: X critical, Y informational      │
└──────────────────────────────────────────┘
```

## Reglas Importantes

- **Leer el diff COMPLETO antes de comentar.** No flaggear issues que ya están addressed en el diff.
- **Read-only por default.** Solo modificar archivos si el usuario elige "Arreglar ahora".
- **Ser conciso.** Una línea el problema, una línea el fix.
- **Solo flaggear problemas reales.** Saltar lo que está bien.
- **Nunca commitear, pushear, o crear PRs.** Eso es trabajo de `/despachar`.

## Siguiente Paso Sugerido

```
🔍 Inspección completada.

Próximos pasos recomendados:

→ /despachar       — Ship automático (incluye esta inspección)
→ /review-loop     — Review independiente con Codex multi-agente
→ /web-audit       — Auditoría de calidad web
→ /critique        — Evaluación de diseño UX/UI
```
