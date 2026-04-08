# /despachar — Ship Workflow

> *"La pieza terminada sale de la forja al mundo. Sin ceremonia de release, hasta el mejor código muere en una rama."*

Workflow automatizado de release: merge main, typecheck, lint, build, review pre-landing, commit, push, crear PR. Para una rama lista, no para decidir qué construir.

## Instrucciones

### Protocolo: Non-Interactive por Defecto

`/despachar` es **automatizado**. No preguntar confirmación en cada paso. El usuario dijo `/despachar` — eso significa HAZLO.

**Solo detenerse por:**
- Estás en `main` (abortar)
- Merge conflicts que no se pueden auto-resolver (mostrar conflictos)
- Tests/typecheck/build fallan (mostrar errores)
- Review pre-landing encuentra issues CRITICAL (preguntar por cada uno)

**Nunca detenerse por:**
- Cambios sin commitear (siempre incluirlos)
- Contenido del CHANGELOG (auto-generar)
- Aprobación del commit message (auto-commit)

---

### Paso 1: Pre-Flight

1. Verificar branch actual. Si es `main`, **abortar**: "Estás en main. Despacha desde una feature branch."

2. `git status` (nunca usar `-uall`). Cambios sin commitear se incluyen siempre.

3. `git diff main...HEAD --stat` y `git log main..HEAD --oneline` para entender qué se está despachando.

---

### Paso 2: Merge origin/main (ANTES de tests)

Traer los últimos cambios de main para testear contra el estado actual:

```bash
git fetch origin main && git merge origin/main --no-edit
```

**Si hay merge conflicts:** Intentar auto-resolver si son simples (CHANGELOG, package-lock). Si son complejos, **STOP** y mostrar.

**Si ya está al día:** Continuar silenciosamente.

---

### Paso 3: Quality Gates (Golden Path)

Ejecutar los 3 gates en secuencia:

```bash
# 1. TypeScript — verificar tipos
npm run typecheck 2>&1 | tee /tmp/despachar-typecheck.txt

# 2. ESLint — verificar estilo
npm run lint 2>&1 | tee /tmp/despachar-lint.txt

# 3. Build — verificar que compila
npm run build 2>&1 | tee /tmp/despachar-build.txt
```

**Si cualquier gate falla:** Mostrar errores y **STOP**. No proceder.

**Si todos pasan:** Continuar — solo notar los conteos brevemente.

---

### Paso 4: Review Pre-Landing

Revisión de diff para issues estructurales que los tests no capturan.

#### 4A. Obtener el diff

```bash
git diff origin/main
```

#### 4B. Checklist adaptado al Golden Path

Revisar en dos pases:

**PASE 1 — CRITICAL (bloquea /despachar):**

| Categoría | Qué buscar |
|-----------|-----------|
| **TypeScript Safety** | `any` usado en lugar de `unknown`, `as` casts sin validación, `@ts-ignore` sin justificación |
| **Supabase Data Safety** | RLS faltante en tablas nuevas, queries sin `.eq('user_id', userId)`, `service_role` key en cliente |
| **Auth Boundaries** | Routes sin middleware de auth, API routes sin verificar `session`, datos de usuario A accesibles por B |
| **Server/Client Boundary** | `"use client"` faltante en componentes con hooks, secrets importados en componentes client, `process.env` sin `NEXT_PUBLIC_` en client |
| **Injection Vectors** | Input de usuario directo en queries SQL, `dangerouslySetInnerHTML` con datos de usuario, prompt injection en features de IA |

**PASE 2 — INFORMATIONAL (incluir en PR body):**

| Categoría | Qué buscar |
|-----------|-----------|
| **React Patterns** | useEffect sin cleanup, deps arrays incompletos, renders innecesarios, state que debería ser derived |
| **Zod Validation** | Inputs de API sin validación Zod, schemas incompletos, `.parse()` sin try/catch |
| **Performance** | Queries N+1, `use client` en páginas que podrían ser server components, imágenes sin `next/image` |
| **Dead Code** | Variables asignadas sin usar, imports no utilizados, componentes huérfanos |
| **Error Handling** | `catch(e) {}` vacíos, errores swallowed sin logging, estados de error UI faltantes |
| **Console Artifacts** | `console.log` olvidados en producción |

#### 4C. Output del review

```
Review Pre-Landing: N issues (X critical, Y informational)

**CRITICAL** (bloquea /despachar):
- [archivo:línea] Descripción del problema
  Fix: solución sugerida

**Issues** (no bloquean):
- [archivo:línea] Descripción del problema
  Fix: solución sugerida
```

Si no hay issues: `Review Pre-Landing: Sin issues encontrados.`

**Si hay issues CRITICAL:** Para CADA issue crítico, usar AskUserQuestion individual:
- Problema + fix recomendado
- Opciones: A) Arreglar ahora (recomendado), B) Reconocer y despachar igual, C) Falso positivo — saltar

Si el usuario elige A en alguno: aplicar fixes, commitear solo esos archivos, luego indicar "Ejecuta `/despachar` de nuevo para re-testear con los fixes."

---

### Paso 5: Commit (chunks bisectables)

**Objetivo:** Commits pequeños y lógicos que funcionen con `git bisect`.

1. Analizar el diff y agrupar cambios en commits lógicos. Cada commit = una unidad coherente.

2. **Orden de commits** (primero los más tempranos):
   - **Infraestructura:** migraciones, config, rutas
   - **Services & Types:** services, tipos, hooks
   - **Components & Pages:** componentes, páginas, layouts
   - **Tests:** si hay tests separados
   - **Final:** CHANGELOG / versión (si aplica)

3. **Reglas:**
   - Un service y su hook van en el mismo commit
   - Un componente y su test van juntos
   - Si el diff total es pequeño (<50 líneas, <4 archivos): un solo commit está bien
   - Cada commit debe ser independientemente válido

4. **Formato de commit message:**
   ```
   <type>: <resumen>

   <descripción breve>
   ```
   Types: `feat` / `fix` / `chore` / `refactor` / `docs` / `test`

---

### Paso 6: Push

```bash
git push -u origin <branch-name>
```

---

### Paso 7: Crear PR

Crear PR con resumen auto-generado del diff:

```bash
gh pr create --title "<type>: <resumen>" --body "$(cat <<'EOF'
## Resumen
<bullet points de los cambios>

## Review Pre-Landing
<hallazgos del Paso 4, o "Sin issues encontrados.">

## Quality Gates
- [x] TypeScript typecheck pasado
- [x] ESLint pasado
- [x] Next.js build exitoso

🔨 Despachado con [Forge](https://github.com/getforja/forge-pro)
EOF
)"
```

**Output final:** La URL del PR — esto es lo último que el usuario debe ver.

---

### Paso 8 (Opcional): Si `gh` no está disponible

Si `gh` CLI no está instalado:

```bash
git push -u origin <branch-name>
```

Informar al usuario:

```
🔨 Branch despachada: <branch-name>

Para crear el PR manualmente:
→ https://github.com/<owner>/<repo>/compare/<branch-name>

💡 Tip: Instala GitHub CLI (gh) para crear PRs automáticamente:
   brew install gh && gh auth login
```

## Siguiente Paso Sugerido

```
🔨 Despachado.

Próximos pasos recomendados:

→ /retro          — Retrospectiva de la semana de trabajo
→ /review-loop    — Review independiente con Codex multi-agente
→ /web-audit      — Auditoría de calidad web post-deploy
→ /qa             — Testing visual sistemático (requiere gstack browse)
```
