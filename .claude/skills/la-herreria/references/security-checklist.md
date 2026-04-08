# Security Checklist

## What Is a Security Audit?

A structured review of the application's code and architecture against established security principles. Run it BEFORE generating the Blueprint — catching vulnerabilities at this stage is free. Catching them post-launch means breach response, user data loss, and reputation damage.

This is not a penetration test (that requires runtime access). It is a code and configuration review: Are the patterns correct? Are the dangerous practices absent? Are the defaults secure?

---

## Severity Scale (CVSS Simplified)

| Score | Severity | Meaning | Action |
|-------|----------|---------|--------|
| 9–10 | 🔴 Critical | Data breach, full system compromise possible | Block Blueprint — fix first |
| 7–8.9 | 🟠 High | Significant data exposure or auth bypass | Fix before Blueprint |
| 4–6.9 | 🟡 Medium | Exploitable under specific conditions | Fix in 30-day plan |
| 0.1–3.9 | 🔵 Low | Minimal real-world impact | Fix in 60-day plan |
| 0 | ✅ OK | No issue found | Document as reviewed |

**Blocking rule:** Any Critical finding (9–10) must be resolved before the Blueprint is generated. The Blueprint encodes architecture decisions — shipping with a critical vulnerability baked in is unacceptable.

---

## OWASP Top 10 2025

### A01 — Broken Access Control

**What it is:** Users can act beyond their intended permissions (access other users' data, perform admin actions, escalate privileges).

**In Next.js/Supabase context:**
- Missing or misconfigured Row Level Security (RLS) policies in Supabase
- API routes that trust client-provided user IDs without verifying against the session
- Admin endpoints with no role check
- Missing `auth.uid()` in RLS policies that should filter by owner

**How to verify:**
```sql
-- In Supabase: check which tables have RLS enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
-- Every table with user data must show rowsecurity = true
```
```typescript
// RED FLAG: trusting client-provided ID
const { data } = await supabase.from('invoices').select('*').eq('user_id', body.userId)
// CORRECT: using the authenticated session
const { data: { user } } = await supabase.auth.getUser()
const { data } = await supabase.from('invoices').select('*').eq('user_id', user.id)
```

**Severity if found:** Critical (9) if user data is directly accessible cross-tenant.

---

### A02 — Cryptographic Failures

**What it is:** Sensitive data exposed in transit or at rest due to missing or weak encryption.

**In Next.js/Supabase context:**
- Secrets stored in localStorage or cookies without httpOnly
- Passwords stored as plaintext (Supabase handles hashing — verify you're using Supabase Auth, not rolling your own)
- API keys or tokens logged to console or stored in the database
- HTTP endpoints (not HTTPS) — Vercel enforces HTTPS, but check custom domains

**How to verify:**
```bash
# Search for sensitive data in logs
grep -r "console.log" src/ | grep -i "token\|password\|secret\|key"
# Search for localStorage with tokens
grep -r "localStorage" src/ | grep -i "token\|auth\|session"
```

**Severity if found:** Critical (9) if passwords or tokens stored insecurely.

---

### A03 — Injection

**What it is:** Attacker-controlled data interpreted as code or commands (SQL injection, XSS, command injection).

**In Next.js/Supabase context:**
- Supabase client uses parameterized queries by default — SQL injection is unlikely if using the SDK
- XSS via `dangerouslySetInnerHTML` without sanitization
- Server-side template injection if using string concatenation to build queries
- Server actions receiving unvalidated input

**How to verify:**
```bash
# Find dangerouslySetInnerHTML usage
grep -r "dangerouslySetInnerHTML" src/
# Find raw query strings (not using SDK patterns)
grep -r "\.rpc\|\.query\|executeQuery" src/
```
```typescript
// RED FLAG: unvalidated input in server action
export async function createItem(data: FormData) {
  const name = data.get('name') // No validation
  await supabase.from('items').insert({ name })
}
// CORRECT: validate with Zod before using
const schema = z.object({ name: z.string().min(1).max(200) })
const validated = schema.parse(Object.fromEntries(data))
```

**Severity if found:** High (8) for XSS, Critical (10) for SQLi if found.

---

### A04 — Insecure Design

**What it is:** Architecture and design flaws that cannot be fixed by code — they require redesign.

**In Next.js/Supabase context:**
- No rate limiting on auth endpoints (brute force possible)
- No limit on resource creation (one user can create unlimited records, causing DoS)
- Password reset flows that allow account enumeration
- Business logic that can be abused (e.g., applying a discount code unlimited times)

**How to verify:** Review the flows, not just the code. Ask: "What happens if a user calls this endpoint 1000 times?"

**Severity if found:** High (7) for rate limiting absence, Medium (5) for business logic abuse.

---

### A05 — Security Misconfiguration

**What it is:** Default configurations that are insecure, unnecessary features enabled, missing security headers.

**In Next.js/Supabase context:**
- Missing HTTP security headers (CSP, HSTS, X-Frame-Options)
- CORS too permissive (`*` when specific origins should be allowed)
- Supabase RLS disabled on tables
- Error messages exposing stack traces in production
- `next.config.ts` missing security headers

**How to verify:**
```typescript
// next.config.ts — security headers must be present
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  { key: 'Content-Security-Policy', value: "default-src 'self'..." },
]
```

**Severity if found:** Medium (6) for missing headers, High (8) for disabled RLS.

---

### A06 — Vulnerable and Outdated Components

**What it is:** Dependencies with known vulnerabilities.

**How to verify:**
```bash
npm audit
# Check for high/critical severity advisories
npm audit --audit-level=high
```

Also check: Are AI-generated `package.json` additions reviewed? Does any dep look suspicious (typosquatting pattern)?

**Severity if found:** Depends on CVE severity — inherit from the advisory score.

---

### A07 — Identification and Authentication Failures

**What it is:** Broken auth — weak passwords allowed, no MFA, session tokens exposed, auth bypass.

**In Next.js/Supabase context:**
- JWT tokens stored in localStorage (XSS attack vector) instead of httpOnly cookies
- No session expiry configured
- Supabase session not validated server-side in API routes (trusting client-side session)
- Auth state checked only client-side (`useUser()`) without server-side validation

**How to verify:**
```typescript
// RED FLAG: API route trusting client-provided auth without server validation
export async function GET(req: Request) {
  const userId = req.headers.get('x-user-id') // Attacker can set this!
}
// CORRECT: validate server-side
export async function GET(req: Request) {
  const supabase = createServerClient(...)
  const { data: { user }, error } = await supabase.auth.getUser()
  if (!user || error) return new Response('Unauthorized', { status: 401 })
}
```

**Severity if found:** Critical (9) for auth bypass, High (7) for token storage issues.

---

### A08 — Software and Data Integrity Failures

**What it is:** Code and data integrity assumptions without verification — untrusted deserialization, unsigned updates.

**In Next.js/Supabase context:**
- Webhook endpoints not verifying the signature (e.g., Stripe webhooks without `stripe.webhooks.constructEvent()`)
- Deserializing user-provided JSON without schema validation
- Trusting `req.body` without Zod validation

**How to verify:**
```bash
grep -r "req.body\|request.json()" src/app/api/ | grep -v "schema\|parse\|validate"
```

**Severity if found:** High (8) for unsigned webhooks (payment manipulation possible).

---

### A09 — Security Logging and Monitoring Failures

**What it is:** Insufficient logging means breaches go undetected for months.

**In Next.js/Supabase context:**
- No logging of failed auth attempts
- No logging of admin actions
- No alerting on anomalous patterns
- Logs contain PII (GDPR/CCPA risk)

**How to verify:** Check if there's any structured logging. If `console.log` is the only logging mechanism, this is a gap.

**Severity if found:** Medium (5) — not directly exploitable but increases breach impact.

---

### A10 — Server-Side Request Forgery (SSRF)

**What it is:** Attacker tricks the server into making requests to internal systems.

**In Next.js/Supabase context:**
- API routes that fetch URLs provided by the user without validation
- AI features that use user-provided URLs as inputs to `fetch()`

**How to verify:**
```bash
grep -r "fetch(" src/app/api/ | grep -v "supabase\|openai\|anthropic"
# Review any remaining fetch calls — do they use user-provided URLs?
```

**Severity if found:** High (8) if internal Supabase endpoints could be reached.

---

## Extended Checks: Vibe Coding Security

These checks are derived from real-world vibe coding security incidents and the [30 Security Tips for Vibe Coding](https://www.itsthatlady.dev/blog/vibe-coding-security-tips/) compilation. They cover gaps not addressed by the standard OWASP categories above.

### EXT-01 — CORS Lockdown

**What it is:** `Access-Control-Allow-Origin` set to `*` allows any website to call your API endpoints.

**How to verify:**
```bash
grep -r "Access-Control-Allow-Origin" src/ next.config.ts middleware.ts
# Any result containing '*' is a finding
```

**Severity:** High (7) — enables cross-site API abuse from any domain.

**Fix:** Set CORS to specific allowed domains. Use Next.js middleware for dynamic origin validation:
```typescript
const allowedOrigins = ['https://yourdomain.com', 'https://app.yourdomain.com']
```

---

### EXT-02 — Redirect Validation

**What it is:** Login/auth flows with `?redirect=/dashboard` that don't validate the URL, allowing `?redirect=https://evil.com/phishing`.

**How to verify:**
```bash
grep -r "redirect\|returnUrl\|callbackUrl\|next=" src/ --include="*.ts" --include="*.tsx"
# Check if any redirect target comes from query params without validation
```

**Severity:** High (7) — enables phishing attacks that look legitimate (user sees your login page, then gets redirected to attacker's page).

**Fix:** Validate all redirect URLs against an allowlist. Only allow relative paths or known domains:
```typescript
function isValidRedirect(url: string): boolean {
  if (url.startsWith('/')) return true // relative path OK
  const allowed = ['https://yourdomain.com']
  return allowed.some(origin => url.startsWith(origin))
}
```

---

### EXT-03 — Storage Bucket Policies

**What it is:** Supabase Storage buckets configured as public, making all uploaded files accessible via direct URL — including user files that should be private.

**How to verify:**
- Check Supabase dashboard → Storage → Policies for each bucket
- Buckets with user data must have RLS policies restricting access to the file owner

**Severity:** High (8) — all user files (profile photos, documents, attachments) indexed by Google and accessible to anyone.

**Fix:** Set storage policies: users can only read/write files they uploaded. Never make user-data buckets public:
```sql
CREATE POLICY "Users can access own files" ON storage.objects
  FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);
```

---

### EXT-04 — Webhook Signature Verification

**What it is:** Webhook endpoints (Stripe, Clerk, etc.) that process incoming requests without verifying the cryptographic signature.

**How to verify:**
```bash
# Find webhook handlers
find src/app/api -name "route.ts" -path "*webhook*"
# Check each for signature verification (constructEvent, verifyWebhook, etc.)
grep -r "constructEvent\|verifyWebhook\|verify.*signature" src/app/api/
```

**Severity:** Critical (9) — unverified webhooks accept fabricated "payment succeeded" events. Attacker sends fake webhook → your app grants premium access.

**Fix:** Always verify webhook signatures using the provider's SDK:
```typescript
// Stripe example
const event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
```

---

### EXT-05 — Rate Limiting on Password Resets

**What it is:** Password reset endpoint allows unlimited requests, enabling inbox flooding and reset token brute-force.

**How to verify:** Check Supabase Auth settings for rate limiting on password reset. Default may be too permissive.

**Severity:** Medium (5) — inbox flooding is annoying; token brute-force is harder but possible.

**Fix:** Limit to 3 password reset requests per email per hour. Configure in Supabase Auth settings or add application-level rate limiting.

---

### EXT-06 — Session Expiration

**What it is:** JWT tokens with very long or no expiry. A stolen session cookie grants permanent account access.

**How to verify:** Check Supabase Auth → Settings → JWT expiry and refresh token configuration.

**Severity:** High (7) — indefinite sessions mean a single XSS or cookie theft = permanent account takeover.

**Fix:** Set JWT expiry to 1 hour with refresh token rotation enabled. Configure in Supabase dashboard under Auth settings.

---

### EXT-07 — Consistent API Protection

**What it is:** Some API routes have auth + validation while others don't. Attackers find the weakest endpoint.

**How to verify:**
```bash
# List all API routes
find src/app/api -name "route.ts"
# For each, verify auth check exists
grep -L "getUser\|createServerClient\|auth" $(find src/app/api -name "route.ts")
# Any files listed = unprotected routes
```

**Severity:** High (7) — one unprotected route undermines the entire auth system.

**Fix:** Apply consistent middleware pattern. Every API route: auth check → input validation → business logic.

---

### EXT-08 — AI Cost Caps

**What it is:** AI endpoints without spending limits. Attackers or bugs can trigger massive API bills overnight.

**How to verify:**
```bash
grep -r "maxTokens\|max_tokens" src/ --include="*.ts"
# Check for per-user rate limiting on AI routes
grep -r "ratelimit\|rate.limit" src/app/api/ | grep -i "ai\|chat\|completion"
```

**Severity:** Medium (6) — financial impact, not data breach. $10K+ bills overnight are documented cases.

**Fix:** Set `maxTokens` in every AI SDK call. Add per-user rate limiting (e.g., 50 requests/day). Set budget alerts in AI provider dashboard.

---

### EXT-09 — Email Infrastructure

**What it is:** Sending transactional email (password resets, notifications) without SPF/DKIM/DMARC records causes deliverability failures and enables domain spoofing.

**How to verify:** Check DNS records for SPF, DKIM, and DMARC entries for the sending domain.

**Severity:** Medium (5) — email deliverability breaks password resets, notifications, core functionality. Domain spoofing enables phishing.

**Fix:** Use verified sending services (Resend, SendGrid). Configure SPF, DKIM, DMARC records as guided by the provider.

---

### EXT-10 — Account Deletion (GDPR)

**What it is:** Users cannot delete their data. A single GDPR complaint can trigger investigation with fines up to 4% of global revenue.

**How to verify:**
```bash
grep -r "delete.*account\|delete.*user\|removeUser" src/ --include="*.ts"
# Check for data export functionality
grep -r "export.*data\|download.*data" src/ --include="*.ts"
```

**Severity:** High (7) — legal/compliance risk. Regulators are actively enforcing.

**Fix:** Create endpoint that removes all user data from DB (CASCADE deletes), Storage (uploaded files), and any third-party services. Add to Settings page.

---

### EXT-11 — Secret Rotation

**What it is:** API keys and tokens never rotated. A key leaked in an old commit, Slack message, or screenshot grants permanent access.

**How to verify:** Ask the team: when were API keys last rotated? Enable GitHub secret scanning.

**Severity:** Medium (5) — increases the window of exposure for any leaked credential.

**Fix:** Rotate all API keys every 90 days. Use GitHub secret scanning to detect leaks. Plan zero-downtime rotation: set new key in env, deploy, then revoke old key.

---

### EXT-12 — DDoS Protection

**What it is:** Application exposed without CDN or edge-level rate limiting. 100K requests/second attacks are cheap and automated.

**How to verify:** Check if using Vercel (built-in basic protection) or custom domain without Cloudflare.

**Severity:** Medium (6) — service downtime, not data breach. But can cost money if on usage-based pricing.

**Fix:** Vercel provides basic DDoS protection by default. For custom domains, add Cloudflare free tier. Add Vercel Edge Config rate limiting for API routes.

---

### EXT-13 — Upload Size Limits

**What it is:** No file size validation on uploads. Users upload 500MB videos, spiraling storage costs and potentially crashing the server.

**How to verify:**
```bash
grep -r "upload\|formData\|multipart" src/app/api/ --include="*.ts"
# Check for size limits in each handler
```

**Severity:** Medium (5) — financial and availability impact.

**Fix:** Set max file size (5MB for images, 25MB for documents). Validate file types server-side:
```typescript
// Next.js route config
export const config = { api: { bodyParser: { sizeLimit: '5mb' } } }
```
Configure limits in Supabase Storage bucket settings.

---

### EXT-14 — Audit Log Table

**What it is:** No record of critical actions. When a security incident happens, forensic investigation is impossible.

**How to verify:**
```bash
# Check for audit_log or activity_log table in migrations
grep -r "audit_log\|activity_log" supabase/migrations/ src/
```

**Severity:** Medium (5) — not directly exploitable but multiplies impact of every other vulnerability.

**Fix:** Create `audit_log` table:
```sql
CREATE TABLE audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,      -- 'user.deleted', 'role.changed', 'payment.processed'
  details JSONB,             -- contextual data
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Index for querying by user or time
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_time ON audit_log(created_at);
```
Log: user deletions, role changes, payments, data exports, admin actions.

---

## Authentication & Authorization Checklist

```
Auth Storage
[ ] JWT tokens in httpOnly cookies (not localStorage, not sessionStorage)
[ ] Supabase session handled server-side in API routes
[ ] No auth state relied upon exclusively client-side for data access decisions

RLS (Row Level Security)
[ ] RLS enabled on ALL tables with user data
[ ] Every RLS policy uses auth.uid() — not a client-provided parameter
[ ] Policies tested for cross-tenant access (can user A read user B's data?)
[ ] Service role key NEVER exposed to the client

Session Management
[ ] Session expiry configured (Supabase default: 1 hour — review for your threat model)
[ ] Refresh token rotation enabled
[ ] Logout actually invalidates the session server-side

Permissions
[ ] Role-based access if product has roles (admin, member, viewer)
[ ] API routes check permissions, not just authentication
[ ] Admin operations are not just client-side controlled
```

---

## Secrets Management Checklist

```
[ ] All secrets in .env.local (never committed)
[ ] .env.local in .gitignore
[ ] No secrets in next.config.ts (it's committed to git)
[ ] NEXT_PUBLIC_ variables contain ZERO secrets (they're exposed to the browser)
[ ] Supabase service role key only in server-side code (API routes, server actions)
[ ] Supabase anon key is the only Supabase credential on the client side
[ ] AI API keys (OpenRouter, Anthropic, OpenAI) only in server-side code
[ ] No secrets in console.log statements
[ ] No secrets hardcoded in any file
[ ] CI/CD environment variables set in Vercel dashboard, not in code
```

---

## Security Headers Configuration Template

Add to `next.config.ts`:

```typescript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  },
  // CSP: customize for your actual domains
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // unsafe-eval needed for Next.js dev
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self' *.supabase.co wss://*.supabase.co",
    ].join('; ')
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}
```

---

## Finding Report Template

Use this format for each security finding in `SECURITY-AUDIT-[name].md`:

```markdown
### SEC-[N] — [Short Title]

| Field | Value |
|-------|-------|
| **ID** | SEC-[N] |
| **OWASP** | A0X — [Category] |
| **Severity** | 🔴 Critical / 🟠 High / 🟡 Medium / 🔵 Low |
| **CVSS Score** | [0–10] |
| **Probability** | High / Medium / Low |
| **Status** | 🔴 Open / 🟡 Accepted / ✅ Resolved |

**Description:** [What the vulnerability is — specific, not generic]

**Evidence:** [File path, line number, or code snippet showing the issue]

**Impact:** [What an attacker could do if this is exploited]

**Recommendation:** [Specific fix — not "improve security" but "change X to Y"]
```
