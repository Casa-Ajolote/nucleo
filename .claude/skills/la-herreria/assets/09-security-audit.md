# Skill #9 — Security & Scalability Audit

> *"El código que no revisas es código que el atacante ya revisó."*

## Qué Hace Este Skill

Antes de que el Blueprint cristalice las decisiones de arquitectura en un plan de ejecución,
este skill hace una parada obligatoria: auditoría integral del producto desde cuatro ángulos.

**Por qué va antes del Blueprint:**
El Blueprint genera el plan de ejecución — lo que se va a construir, en qué orden, con qué
estructura. Si hay una vulnerabilidad crítica en el diseño actual, el Blueprint la codifica
como decisión permanente. Auditar después de Blueprint significa refactorizar sobre código
ya comprometido. Auditar antes significa que el Blueprint nace limpio.

**Los cinco ángulos de auditoría:**
1. **Seguridad clásica** — OWASP Top 10 2025, autenticación, secretos, headers, CORS
2. **Riesgos Vibe Coding / IA** — trazabilidad, dependencias, exposición de prompts, prompt injection
3. **Escalabilidad** — bottlenecks, queries N+1, paginación, caching, bundle size
4. **Observabilidad** — logging estructurado, métricas, circuit breakers, rate limiting, health checks
5. **Web Quality** — Performance (Core Web Vitals), Accessibility (WCAG 2.1 AA), SEO, Best Practices
   → Consultar `.claude/skills/web-quality/SKILL.md` y sus references para checks detallados de cada área

---

## Inputs Requeridos

- `src/` — Todo el código fuente del producto (features, shared, app)
- `TECH-SPEC-[nombre].md` — Del Skill #3. Stack, dependencias, arquitectura de datos
- `PDR-[nombre].md` — Del Skill #2. Contexto de negocio, usuarios, datos sensibles que maneja el producto
- `package.json` — Dependencias actuales (para audit de npm)
- `next.config.ts` — Configuración de Next.js (headers de seguridad)

---

## Referencias (leer cuando se indique en cada paso)

- **Security Checklist:** `.claude/skills/la-herreria/references/security-checklist.md`
  → OWASP Top 10 2025, auth/authz, secretos, inputs, headers, formato de hallazgos
- **Vibe Coding Risks:** `.claude/skills/la-herreria/references/vibe-coding-risks.md`
  → VCAL, trazabilidad, deps, prompt exposure, prompt injection, deuda técnica AI
- **Scalability Patterns:** `.claude/skills/la-herreria/references/scalability-patterns.md`
  → Bottlenecks, KPIs, Next.js/Supabase patterns, caching, DB indexing
- **Observability Guide:** `.claude/skills/la-herreria/references/observability-guide.md`
  → Logging estructurado, métricas, circuit breakers, rate limiting, health checks, SLOs
- **Threat Database:** `.claude/skills/la-herreria/references/threat-db.yaml`
  → Base de amenazas estructurada (~200 entradas): OWASP, vibe coding, MCP security, Golden Path, infraestructura, data privacy

---

## Workflow

### Paso 1: Compilar Contexto

**Leer:** `TECH-SPEC-[nombre].md` y `PDR-[nombre].md`. Explorar estructura de `src/`.

Antes de auditar, entender el terreno:

```
CONTEXTO DE AUDITORÍA — [Nombre del Proyecto]

PRODUCTO:
¿Qué hace? ¿Quién lo usa? ¿Qué datos sensibles maneja?
(De PDR: modelo de negocio, usuarios objetivo)

STACK:
Framework: Next.js [versión]
Auth: Supabase Auth
DB: Supabase PostgreSQL
AI features: [sí/no — cuáles]
External APIs: [lista de integraciones]
(De Tech Spec: stack completo)

VCAL ESTIMADO:
¿Qué porcentaje del código fue AI-generated vs. human-written?
→ VCAL-[1-5] — [justificación]
Referencia: vibe-coding-risks.md

SUPERFICIE DE ATAQUE (mapear antes de auditar):
→ Endpoints de autenticación: [listar rutas /api/auth/...]
→ Endpoints con datos de usuario: [listar rutas /api/...]
→ Features con IA: [listar si existen]
→ Integraciones de pago: [listar si existen]
→ Datos PII manejados: [email, nombre, ...?]
→ Tablas con RLS: [¿cuáles? ¿todas las necesarias?]
```

**Explorar src/ para entender la estructura antes de auditar:**
```bash
find src/ -type f -name "*.ts" -o -name "*.tsx" | head -50
ls src/app/api/          # Todos los API routes
ls src/features/         # Features implementadas
```

---

### Paso 2: Auditoría de Seguridad App

**Leer:** `.claude/skills/la-herreria/references/security-checklist.md`

Evaluar el código contra cada categoría del checklist.

**Proceso:**

1. **OWASP Top 10 2025** — Revisar cada categoría (A01–A10):
   - Para cada una: ¿hay señales de la vulnerabilidad en el código?
   - Buscar los patrones indicados en security-checklist.md
   - Cross-reference contra `threat-db.yaml` para cobertura completa
   - Documentar: ¿hallazgo o OK?

2. **Autenticación y Autorización:**
   ```bash
   # Encontrar todos los API routes
   find src/app/api -name "route.ts" | head -30
   # Verificar que cada uno valida la sesión server-side
   grep -r "supabase.auth.getUser\|createServerClient" src/app/api/
   ```
   - ¿Cada API route verifica la sesión antes de acceder a datos?
   - ¿El ID de usuario viene de la sesión server-side (no del body del request)?
   - ¿Las tablas con datos de usuario tienen RLS habilitado?

3. **Secretos:**
   ```bash
   grep -r "sk-\|api_key\|apiKey\|API_KEY" src/ --include="*.ts" --include="*.tsx" | grep -v "process.env\|env\."
   grep -r "localStorage" src/ | grep -i "token\|auth\|session"
   ```

4. **Headers de Seguridad:**
   - ¿`next.config.ts` tiene security headers configurados?
   - Usar template de security-checklist.md si faltan

5. **npm audit:**
   ```bash
   npm audit --audit-level=high
   ```

6. **Extended Checks (Vibe Coding Security):**
   - Revisar la sección "Extended Checks: Vibe Coding Security" en security-checklist.md
   - Verificar: CORS, redirects, storage buckets, webhooks, session, GDPR, uploads, audit log
   - Estos 14 checks cubren vectores reales de vibe coding que OWASP no cubre explícitamente

**Por cada hallazgo encontrado, usar el formato de security-checklist.md:**
```
SEC-[N] — [Título]
OWASP: A0X / Severidad: X / CVSS: X / Evidencia: [archivo:línea]
Descripción: [qué es el problema]
Impacto: [qué puede hacer un atacante]
Recomendación: [fix específico]
```

---

### Paso 3: Auditoría Vibe Coding / IA

**Leer:** `.claude/skills/la-herreria/references/vibe-coding-risks.md`

Evaluar los riesgos específicos del proceso de desarrollo con IA.

**Proceso:**

1. **Confirmar VCAL:**
   - Basado en la exploración del código en el Paso 1
   - ¿El estilo de commits y comentarios sugiere alto o bajo nivel de revisión humana?

2. **Trazabilidad:**
   ```bash
   git log --oneline | head -30
   # ¿Los commits son descriptivos o genéricos?
   git log --stat | head -50
   # ¿Hay commits con +500 líneas sin contexto?
   ```
   - Documentar: ¿es posible auditar qué generó el AI vs. qué escribió un humano?

3. **Control de Dependencias:**
   ```bash
   npm audit
   # Revisar package.json manualmente — ¿hay deps sospechosas o redundantes?
   cat package.json | python3 -c "import json,sys; d=json.load(sys.stdin); [print(k, v) for k,v in {**d.get('dependencies',{}), **d.get('devDependencies',{})}.items()]"
   ```
   - ¿Todas las deps tienen > 10K descargas semanales en npm?
   - ¿Hay deps que hacen lo mismo que el stack ya provee?

4. **Exposición de Prompts:**
   ```bash
   grep -r "SYSTEM_PROMPT\|systemPrompt\|system_prompt" src/ --include="*.ts" --include="*.tsx"
   grep -r "sk-ant\|sk-proj\|openai\|anthropic" src/ --include="*.ts" --include="*.tsx" | grep -v "process.env"
   ```

5. **Prompt Injection** (solo si el producto tiene features de IA):
   - ¿Hay endpoints donde input de usuario llega a un LLM?
   - ¿Ese input está separado del system prompt o concatenado?
   - ¿Hay límites de longitud de input?

6. **Revisión Humana de Código Crítico:**
   ```bash
   # Auth logic
   find src/ -name "*.ts" -o -name "*.tsx" | xargs grep -l "signIn\|signUp\|signOut\|getUser\|auth" 2>/dev/null
   # Payment logic
   find src/ -name "*.ts" -o -name "*.tsx" | xargs grep -l "stripe\|payment\|checkout\|webhook" 2>/dev/null
   ```
   - ¿Hay evidencia de que auth y payment code fue revisado (comentarios, commits específicos)?

7. **Adversarial Analysis:**
   Después de completar los puntos 1-6, hacer un paso de pensamiento adversarial:
   - Pregunta: "Si un atacante viera este código, ¿qué explotaría primero?"
   - Documenta los 3 vectores de ataque más probables con su mitigación
   - Cross-reference contra `threat-db.yaml` categorías `blog-security-tips` y `vibe-coding`
   - Si el producto maneja pagos o PII, este paso es OBLIGATORIO

8. **Deuda Técnica AI:**
   ```bash
   # Archivos grandes (posible código AI sin refactorizar)
   find src/ -name "*.tsx" -o -name "*.ts" | xargs wc -l 2>/dev/null | sort -rn | head -20
   # Archivos sin tests
   find src/features -name "*.tsx" | grep -v "\.test\.\|\.spec\." | head -20
   ```

---

### Paso 4: Auditoría de Escalabilidad + Observabilidad

**Leer:** `.claude/skills/la-herreria/references/scalability-patterns.md`
**Leer:** `.claude/skills/la-herreria/references/observability-guide.md`

**Escalabilidad — buscar los anti-patrones críticos:**

1. **Queries N+1:**
   ```bash
   grep -r "for.*of\|\.forEach\|\.map" src/ -A 5 | grep "supabase\|\.from\|await"
   ```
   - ¿Hay llamadas a DB dentro de loops?

2. **Sin paginación:**
   ```bash
   grep -r "\.select\(\|\.from\(" src/ | grep -v "\.range\|\.limit\|count"
   ```
   - ¿Hay endpoints que retornan todos los registros sin límite?

3. **Bundle size:**
   - ¿Hay importaciones de librerías completas en lugar de funciones específicas?
   ```bash
   grep -r "^import.*from 'lodash'" src/
   grep -r "^import.*from 'moment'" src/
   ```

4. **Índices en Supabase:**
   - Revisar el schema (de Tech Spec) — ¿las columnas de filtro tienen índices?
   - Columnas que siempre necesitan índice: user_id, [entity]_id, status, created_at

5. **Rendering strategy:**
   - ¿Las páginas de marketing/landing usan SSG?
   - ¿Los dashboards usan SSR o CSR correctamente?

**Observabilidad — evaluar el estado actual:**

1. **Logging:**
   ```bash
   grep -r "console.log\|console.error" src/ | wc -l
   grep -r "logger\." src/ | wc -l
   ```
   - ¿Hay logging estructurado (JSON) o solo console.log?
   - ¿Los logs incluyen traceId?

2. **Health check:**
   ```bash
   ls src/app/api/health/ 2>/dev/null || echo "No health check endpoint found"
   ```

3. **Rate limiting:**
   ```bash
   grep -r "ratelimit\|rate.limit\|Ratelimit" src/ | head -5
   grep -r "@upstash" package.json
   ```

4. **Circuit breakers:**
   ```bash
   grep -r "CircuitBreaker\|circuit.breaker\|circuitBreaker" src/ | head -5
   ```

---

### Paso 5: Consolidar Informe

Con todos los hallazgos de los pasos anteriores, generar `SECURITY-AUDIT-[nombre].md`.

**Estructura del informe:**

```markdown
# Security & Scalability Audit — [Nombre del Proyecto]

**Fecha:** [fecha]
**VCAL:** [1-5] — [descripción]
**Revisado por:** Claude (Skill #9 — Security & Scalability Audit)

---

## Resumen Ejecutivo

**Nivel de Riesgo Global:** 🔴 Alto / 🟡 Medio / 🟢 Bajo

**Top 5 Riesgos:**
1. [Riesgo más crítico] — [severidad]
2. [Segundo riesgo] — [severidad]
...

**Decisión de pipeline:**
- ⛔ PAUSAR → Resolver hallazgos críticos antes de generar el Blueprint
- ▶️ PROCEDER → Sin hallazgos críticos. Blueprint puede generarse.

**Resumen de hallazgos:**
| Categoría | Críticos | Altos | Medios | Bajos | OK |
|-----------|----------|-------|--------|-------|----|
| Seguridad App | [N] | [N] | [N] | [N] | [N] |
| Vibe Coding | [N] | [N] | [N] | [N] | [N] |
| Escalabilidad | [N] | [N] | [N] | [N] | [N] |
| Observabilidad | [N] | [N] | [N] | [N] | [N] |

---

## Hallazgos de Seguridad

[Para cada hallazgo usar el formato SEC-N de security-checklist.md]

### SEC-1 — [Título]
...

---

## Hallazgos de Escalabilidad

[Para cada hallazgo usar el formato SCALE-N de scalability-patterns.md]

### SCALE-1 — [Título]
...

---

## Checklist de Mínimos

### Seguridad
| Item | Estado |
|------|--------|
| RLS habilitado en todas las tablas con datos de usuario | ✅ / ⚠️ / ❌ |
| Sin secretos en código cliente | ✅ / ⚠️ / ❌ |
| API routes validan sesión server-side | ✅ / ⚠️ / ❌ |
| Security headers en next.config.ts | ✅ / ⚠️ / ❌ |
| npm audit: cero vulnerabilidades high/critical | ✅ / ⚠️ / ❌ |

### Escalabilidad
| Item | Estado |
|------|--------|
| Sin queries N+1 | ✅ / ⚠️ / ❌ |
| Todos los list endpoints paginados | ✅ / ⚠️ / ❌ |
| Columnas clave indexadas en Supabase | ✅ / ⚠️ / ❌ |
| Sin librerías deprecated o duplicadas | ✅ / ⚠️ / ❌ |

### Observabilidad
| Item | Estado |
|------|--------|
| Logging estructurado (no solo console.log) | ✅ / ⚠️ / ❌ |
| Health check endpoint (/api/health) | ✅ / ⚠️ / ❌ |
| Rate limiting en auth endpoints | ✅ / ⚠️ / ❌ |
| Circuit breaker en llamadas LLM (si aplica) | ✅ / ⚠️ / ❌ |

**Leyenda:** ✅ OK · ⚠️ Riesgo aceptable · ❌ Bloqueante

---

## Plan de Acción

### 🔴 Inmediato (antes del Blueprint / antes de lanzar)
[Hallazgos críticos que DEBEN resolverse ahora]
1. [Fix específico] — Hallazgo SEC-N / SCALE-N

### 📅 30 días (post-lanzamiento — Sprint 1)
[Hallazgos altos que deben resolverse en el primer sprint post-lanzamiento]
1. [Fix específico] — Hallazgo SEC-N / SCALE-N

### 📅 60 días (Sprint 2)
[Hallazgos medios]
1. [Fix específico]

### 📅 90 días (Sprint 3)
[Hallazgos bajos + mejoras de observabilidad]
1. [Mejora específica]
```

---

### Regla de Bloqueo

**Si hay hallazgos con severidad CRÍTICA (CVSS 9-10 o equivalente):**
```
⛔ PIPELINE BLOQUEADO

No se genera el Blueprint hasta resolver:
- [Lista de hallazgos críticos]

Pasos:
1. Resolver cada hallazgo crítico con el fix recomendado
2. Verificar que el fix elimina la vulnerabilidad
3. Volver a ejecutar los checks relevantes del Paso 2 o 3
4. Confirmar que no quedan Críticos → ▶️ Continuar al Blueprint
```

**Si no hay hallazgos críticos:**
```
✅ PIPELINE CLEARED

No se encontraron vulnerabilidades críticas.
Los hallazgos High/Medium/Low quedan documentados en el Plan de Acción.
▶️ Proceder al Skill #10 — Blueprint
```

---

## Output

```
SECURITY-AUDIT-[nombre].md   ← Informe completo generado en el Paso 5
```

El informe documenta:
- VCAL del proyecto
- Todos los hallazgos (SEC-N, SCALE-N) con severidad y recomendación específica
- Checklist de mínimos con estado actual
- Plan de acción 30/60/90 días

---

## Naming Convention

| Documento | Archivo |
|-----------|---------|
| Informe de Auditoría | `SECURITY-AUDIT-[nombre].md` |

---

## Reglas Críticas

- **Leer los 4 reference files antes de auditar.** Cada uno tiene los patrones y formatos correctos.
- **VCAL determina la intensidad.** VCAL-4/5 requiere auditar TODO el código, no solo spot-check.
- **Hallazgos críticos BLOQUEAN el pipeline.** No se genera el Blueprint con vulnerabilidades críticas abiertas.
- **Documentar los OK también.** Si OWASP A03 fue evaluado y no hay inyección, documentarlo. Prueba que se revisó.
- **Recomendaciones son específicas, no genéricas.** No "mejorar la seguridad" — "mover el JWT de localStorage a httpOnly cookie configurando Supabase auth options".
- **El plan de acción es realista.** 30 días = sprint de trabajo real, no una lista de deseos.
- **No auditar lo que no existe todavía.** Si el producto es un MVP sin features de pago, no crear hallazgos hipotéticos sobre futuros sistemas de pago.

---

## Integración con Skills Upstream/Downstream

| Skill | Conexión |
|-------|---------|
| Tech Spec (#3) | Stack y arquitectura de datos → superficie de ataque a auditar |
| PDR (#2) | Contexto de negocio → qué datos sensibles maneja el producto |
| UI (#8) | Código fuente generado → objeto de la auditoría |
| Blueprint (#10) | Recibe el informe → incorpora fixes críticos en el plan de ejecución |

---

## Handoff al Skill #10

```
✅ Auditoría completada → SECURITY-AUDIT-[nombre].md
✅ Hallazgos críticos: [0 / N — si hay N, BLOQUEADO]
✅ Hallazgos altos: [N] → Plan de Acción 30 días
✅ Hallazgos medios/bajos: [N] → Plan de Acción 60/90 días
✅ Checklist de mínimos: [N] ✅ [N] ⚠️ [N] ❌
✅ VCAL: [1-5]

[Si sin Críticos]:
Siguiente: Blueprint (Skill #10)
El Blueprint puede generarse. El informe de auditoría provee
contexto de riesgos y el plan de acción post-lanzamiento.

[Si con Críticos]:
Pipeline BLOQUEADO. Resolver antes de continuar:
[lista de hallazgos críticos con sus fixes]

¿Procedemos?
```
