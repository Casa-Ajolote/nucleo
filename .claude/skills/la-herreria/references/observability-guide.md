# Observability Guide

## Why Observability

> "If you can't measure it, you can't improve it — and you definitely can't debug it at 2 AM."

**Logging** tells you what happened. **Observability** tells you why it happened, where, and how often.

The difference in practice:
- **Logging only:** "The error occurred." You spend hours reproducing it.
- **Observability:** "The error occurred 47 times in the last hour, all from users on the Pro plan, all on the `/api/invoices/generate` endpoint, all when the PDF had > 50 pages, correlated with a Supabase latency spike at 14:32 UTC." You fix it in 20 minutes.

A SaaS without observability is a black box. You find out about failures when users email you — or when they churn silently.

---

## The Three Pillars

### Pillar 1: Logs

What happened, in a queryable format.

**Structured logging (JSON) — required:**
```typescript
// RED FLAG: Unstructured log (unsearchable, hard to parse)
console.log('Invoice PDF generated for user ' + userId + ' took ' + duration + 'ms')

// CORRECT: Structured log (searchable, filterable, aggregatable)
logger.info('invoice.pdf.generated', {
  userId: hashUserId(userId),  // Hash PII — never log raw user IDs
  invoiceId,
  durationMs: duration,
  pageCount: pdf.pageCount,
  environment: process.env.NODE_ENV,
})
```

**Required fields for every log event:**
```typescript
interface LogEntry {
  timestamp: string      // ISO 8601
  level: 'error' | 'warn' | 'info' | 'debug'
  event: string          // Namespaced: 'invoice.created', 'auth.failed', 'payment.charged'
  traceId?: string       // For correlating logs across a request lifecycle
  userId?: string        // Hashed — never raw user ID or email
  environment: string    // 'production' | 'staging' | 'development'
  // Domain-specific fields
  [key: string]: unknown
}
```

**NEVER log these (GDPR/CCPA risk + security):**
```
❌ Email addresses
❌ Full names
❌ Phone numbers
❌ IP addresses (in most jurisdictions)
❌ Passwords (obviously, but AI might generate this)
❌ API keys or tokens
❌ Credit card numbers or last 4 digits
❌ Session tokens
❌ Raw user IDs that could be correlated across systems
```

**Log level guide:**
| Level | When to use | Example |
|-------|-------------|---------|
| `error` | Something failed and action is required | Database connection failed, payment webhook failed |
| `warn` | Something unexpected happened but recovered | Retry succeeded, deprecated API used |
| `info` | Normal business events worth tracking | Invoice created, user signed up, payment processed |
| `debug` | Detailed technical information for debugging | Query executed in 45ms, cache hit for key X |

**Rule:** `error` and `warn` should trigger alerts. `info` and `debug` should not.

---

### Pillar 2: Metrics

Quantitative measurements over time.

**Core metrics to track for any SaaS:**

```
Error Metrics
- error_rate: (error responses / total responses) * 100
  Target: < 0.1% for critical paths
  Alert: > 1% for 5 minutes

Latency Metrics
- api_response_time_p50: median response time
- api_response_time_p95: 95th percentile (most users' experience)
- api_response_time_p99: 99th percentile (worst users' experience)
  Targets: P50 < 200ms, P95 < 1s, P99 < 3s

Business Metrics
- signups_per_hour: rate of new user registrations
- active_sessions: concurrent authenticated sessions
- feature_usage_rate: how often key features are used
- auth_failure_rate: failed login attempts / total login attempts
  Alert on auth_failure_rate > 10% (possible credential stuffing)

Resource Metrics (Vercel/Supabase)
- db_connection_pool_utilization: % of pool connections in use
  Alert: > 80%
- serverless_function_duration: invocation times
  Alert: P95 > 5s
- db_query_duration_p95: slow query indicator
  Alert: > 500ms
```

**Implementing metrics in Next.js:**
```typescript
// Option 1: Sentry (easiest — automatic for errors)
// Option 2: Vercel Analytics (Core Web Vitals, built-in)
// Option 3: Custom with OpenTelemetry + Datadog/New Relic
// Option 4: Supabase Dashboard (DB metrics, built-in)

// Minimal viable: Sentry for errors + Vercel Analytics for Web Vitals
// That covers 80% of what you need for a pre-launch MVP
```

---

### Pillar 3: Traces

How a request flows through the system.

**What a trace is:**
```
Request: POST /api/invoices
│
├── [0ms] Auth middleware → validate session (2ms)
├── [2ms] API route handler start
├── [2ms] → DB query: fetch customer (45ms)        ← potential bottleneck
├── [47ms] → DB query: fetch line items (12ms)
├── [59ms] → External: send email notification (180ms)  ← definitely a bottleneck
├── [239ms] → DB insert: create invoice record (8ms)
└── [247ms] Response sent → 201 Created
Total: 247ms
```

Traces show you exactly where time is spent. Without them, you guess.

**Implementing distributed tracing:**
```typescript
// Minimal viable: Add a traceId to all logs for the same request
import { randomUUID } from 'crypto'

// In Next.js middleware (runs on every request)
export function middleware(request: NextRequest) {
  const traceId = randomUUID()
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-trace-id', traceId)

  return NextResponse.next({ request: { headers: requestHeaders } })
}

// In API routes: extract and include in all logs
export async function POST(req: Request) {
  const traceId = req.headers.get('x-trace-id') ?? randomUUID()

  logger.info('invoice.create.started', { traceId, ...otherFields })
  // ... all subsequent logs include traceId
  logger.info('invoice.create.completed', { traceId, invoiceId, durationMs })
}
```

**For full distributed tracing:** Use OpenTelemetry with Sentry or Datadog. But the traceId-in-logs pattern above gives you 80% of the value for 5% of the work — correct starting point for a pre-launch product.

---

## Circuit Breakers

**What it is:** A pattern that prevents cascading failures when an external service (LLM, payment processor, email provider) is degraded or down.

**The three states:**
```
CLOSED (normal) → requests flow through, failure count tracked
  If failure rate exceeds threshold → OPEN

OPEN (failing) → requests fail immediately without trying the service
  Prevents load on degraded service
  After timeout → HALF-OPEN

HALF-OPEN (testing recovery) → one test request allowed
  If test succeeds → CLOSED (back to normal)
  If test fails → OPEN (keep blocking)
```

**When to implement circuit breakers:**
- Any external API call (LLM, Stripe, SendGrid, etc.)
- Calls that have observable error rates (> 1%) or slow response times (> 2s P95)

**Simple implementation for Next.js:**
```typescript
// Simple circuit breaker for OpenRouter/LLM calls
class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private state: 'closed' | 'open' | 'half-open' = 'closed'

  constructor(
    private threshold = 5,       // failures before opening
    private timeout = 60_000     // ms before attempting half-open
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open'
      } else {
        throw new Error('Circuit open — service unavailable')
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess() {
    this.failures = 0
    this.state = 'closed'
  }

  private onFailure() {
    this.failures++
    this.lastFailureTime = Date.now()
    if (this.failures >= this.threshold) this.state = 'open'
  }
}

// Usage
const llmBreaker = new CircuitBreaker(5, 60_000)
const response = await llmBreaker.execute(() => callOpenRouter(prompt))
```

**Decision rule:** Add circuit breakers for any external call in a critical user path. Start simple — the pattern above is sufficient for most SaaS pre-launch.

---

## Rate Limiting

**Why it matters:**
- Prevents abuse (credential stuffing, scraping, API hammering)
- Controls costs (LLM API calls are expensive — unlimited calls = unlimited cost)
- Protects database (prevents a single user from causing DoS)

**Rate limiting strategies:**

| Strategy | Use Case | Implementation |
|----------|----------|----------------|
| By IP | Auth endpoints (prevent brute force) | Upstash Ratelimit in middleware |
| By user ID | API endpoints (fair use) | Upstash Ratelimit in API route |
| By API key | Public API (if product has one) | Upstash Ratelimit in API middleware |
| By feature | LLM features (cost control) | Custom counter in Supabase |

**Implementation with Upstash (serverless-compatible):**
```typescript
// middleware.ts — rate limit auth endpoints
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10s'), // 10 requests per 10 seconds
})

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/api/auth')) {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
    const { success, limit, remaining } = await ratelimit.limit(ip)

    if (!success) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': '10',
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
        }
      })
    }
  }
}
```

**Rate limit tiers to define before launch:**
```
Auth endpoints:           10 requests / 10 seconds per IP
General API:              100 requests / minute per user
LLM-powered features:     20 requests / hour per user (or based on plan)
File upload:              10 uploads / minute per user
Export/download:          5 requests / hour per user
```

---

## Health Checks

**What it is:** An endpoint that reports whether the application and its dependencies are operational.

**Required: `/api/health`**

```typescript
// app/api/health/route.ts
export async function GET() {
  const checks: Record<string, 'ok' | 'degraded' | 'down'> = {}

  // Check database connectivity
  try {
    const supabase = createServiceClient()
    await supabase.from('_health_check').select('1').limit(1)
    checks.database = 'ok'
  } catch {
    checks.database = 'down'
  }

  // Check if critical env vars are present (not their values)
  checks.config = (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  ) ? 'ok' : 'down'

  const isHealthy = Object.values(checks).every(v => v === 'ok')

  return Response.json(
    {
      status: isHealthy ? 'healthy' : 'degraded',
      checks,
      // NEVER include: version numbers, dependency versions, internal paths, stack traces
    },
    { status: isHealthy ? 200 : 503 }
  )
}
```

**What NOT to expose in `/api/health`:**
- Database version or schema version
- Dependency versions (reveals attack surface)
- Internal hostnames or IPs
- Stack traces
- Environment variable values

---

## SLOs (Service Level Objectives)

**What it is:** A commitment to a measurable level of reliability. Defines "acceptable" vs "incident-worthy."

**Defining SLOs:**
```
Availability SLO
- Definition: % of minutes in a month with < 1% error rate
- Target: 99.9% (allows 8.7 hours downtime per year)
- At 99.5%: 43.8 hours downtime per year — too much for a paid SaaS
- At 99.99%: 52 minutes downtime per year — overkill pre-launch

Latency SLO
- Definition: % of API requests with P95 < 1 second
- Target: 95% of requests (1 in 20 can be slow — P95 is your target, not max)

Error Rate SLO
- Definition: % of API requests returning 5xx errors
- Target: < 0.1%

Error Budget
- If SLO = 99.9% availability, error budget = 0.1% of the month
- 0.1% of 30 days = 43.2 minutes
- Once the error budget is burned, stop shipping features, fix reliability
```

**For pre-launch MVP:** Define SLOs but don't enforce them yet. Use them as calibration for alerting thresholds.

---

## Alerting

**Alert only on what requires immediate human action.** Alert fatigue (too many alerts) is as dangerous as no alerts — people start ignoring the alerts.

**Alert on:**
```
🚨 PagerDuty/immediate action:
- Error rate > 1% for 5 consecutive minutes (users are affected NOW)
- API P95 latency > 5s for 5 minutes (product unusable)
- Health check failure (application is down)
- Auth failure rate > 20% (possible attack)
- DB connection pool > 90% utilized

⚠️ Slack/next business hour:
- Error rate > 0.5% for 30 minutes (degraded but not broken)
- API P95 latency > 2s for 30 minutes (sluggish)
- LLM cost spike > 3x daily average (possible abuse or runaway feature)
- Any security log event (failed auth, permission denied)
```

**Don't alert on:**
```
❌ Individual 4xx errors (user errors, not system errors)
❌ Individual slow queries (unless they persist)
❌ Successful events (don't alert "invoice created")
❌ Metrics within normal range
❌ Things you can't act on
```

---

## Observability Checklist

### Logging
```
[ ] Structured JSON logging implemented (not console.log)
[ ] All logs include: timestamp, level, event name, traceId
[ ] No PII in logs (no email, name, phone, raw user ID)
[ ] Error logs include: error message, stack trace, context
[ ] Business events logged at INFO level (signups, payments, key actions)
```

### Metrics
```
[ ] Error rate tracked and alertable
[ ] API response time P50/P95/P99 tracked
[ ] Auth failure rate tracked
[ ] Key business events tracked (signups, activations, churn)
[ ] Supabase Dashboard checked for slow queries
```

### Traces
```
[ ] traceId propagated through all logs for a single request
[ ] Slow request paths identifiable from logs alone
[ ] External service calls logged with duration
```

### Resilience
```
[ ] Circuit breakers on external API calls (LLM, email, payment)
[ ] Rate limiting on auth endpoints
[ ] Rate limiting on expensive LLM-powered features
[ ] /api/health endpoint implemented and does not expose sensitive info
```

### Alerting
```
[ ] Alert on error rate spike (> 1% for 5 minutes)
[ ] Alert on latency spike (P95 > 5s for 5 minutes)
[ ] Alert on health check failure
[ ] Alert on auth anomaly (failure rate > 20%)
[ ] Alert on LLM cost spike
```
