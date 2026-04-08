# Scalability Patterns

## What Is a Scalability Audit?

A review of the application's architecture and code patterns to identify bottlenecks before they become incidents. Run it before the Blueprint — catching a non-scalable pattern at design time costs nothing. Discovering it when you have 10,000 users means emergency refactoring under load.

This is not a load test (that requires running infrastructure). It is a pattern review: Are the queries efficient? Are the right caching strategies in place? Will the architecture hold when traffic multiplies?

---

## Scalability Severity Scale

| Level | Description | Action |
|-------|-------------|--------|
| 🔴 Critical | Will fail or become prohibitively expensive at projected scale | Fix before Blueprint |
| 🟠 High | Will degrade significantly at 10x current load | Fix in 30-day plan |
| 🟡 Medium | Suboptimal but manageable with monitoring | Fix in 60-day plan |
| 🔵 Low | Minor inefficiency with minimal real-world impact | Fix in 90-day plan |

---

## Performance KPI Targets

These are the targets to design toward. Use them as the acceptance criteria for scalability findings.

### Core Web Vitals (User Experience)

| Metric | Target (Good) | Warning | Critical |
|--------|---------------|---------|----------|
| LCP (Largest Contentful Paint) | < 2.5s | 2.5–4s | > 4s |
| FID (First Input Delay) / INP | < 100ms | 100–300ms | > 300ms |
| CLS (Cumulative Layout Shift) | < 0.1 | 0.1–0.25 | > 0.25 |
| TTFB (Time to First Byte) | < 800ms | 800ms–1.8s | > 1.8s |

### API Performance

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| P50 response time | < 200ms | 200–500ms | > 500ms |
| P95 response time | < 1s | 1–3s | > 3s |
| P99 response time | < 3s | 3–10s | > 10s |
| Error rate | < 0.1% | 0.1–1% | > 1% |

### Database

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Query execution time (P95) | < 100ms | 100–500ms | > 500ms |
| Connection pool utilization | < 50% | 50–80% | > 80% |

---

## Bottleneck Identification

### Database: N+1 Query Problem

**What it is:** Fetching a list of items, then fetching related data for each item in a loop. 1 query becomes N+1 queries.

**In Supabase/Next.js:**
```typescript
// RED FLAG: N+1 pattern
const { data: invoices } = await supabase.from('invoices').select('*')
for (const invoice of invoices) {
  // This fires a separate query for EACH invoice
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', invoice.customer_id)
    .single()
}

// CORRECT: Join in a single query
const { data: invoices } = await supabase
  .from('invoices')
  .select('*, customers(*)')  // Supabase join syntax
```

**How to identify:**
```bash
# Find loops with database calls inside
grep -r "for.*of\|\.forEach\|\.map" src/ -A 5 | grep "supabase\|\.from\|await"
```

---

### Database: Missing Indexes

**What it is:** Queries filtering or joining on columns without indexes cause full table scans — O(n) vs O(log n).

**Common missing indexes in SaaS apps:**
```sql
-- Every foreign key that's used in a JOIN or filter
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- Composite indexes for common filter combinations
CREATE INDEX idx_invoices_user_status ON invoices(user_id, status);

-- Timestamp columns used in date-range queries
CREATE INDEX idx_invoices_created_at ON invoices(created_at);
```

**How to verify in Supabase:**
- Supabase Dashboard → Table Editor → Select table → Indexes tab
- SQL: `SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'invoices';`
- Supabase Dashboard → Reports → Query Performance (shows slow queries)

**Rule of thumb:** Every column that appears in a `.eq()`, `.gte()`, `.lte()`, `.order()`, or as a foreign key in a join should have an index.

---

### Frontend: Bundle Size

**What it is:** Large JavaScript bundles slow initial page load, especially on mobile. Each KB of unused JS is a tax on every user.

**How to check:**
```bash
# Build and analyze bundle
npm run build
# Next.js shows bundle sizes in the build output
# Look for pages with > 200KB first load JS (shown in build output)
```

**Common causes:**
- Importing the entire library when only one function is needed
  ```typescript
  // RED FLAG
  import _ from 'lodash' // 71KB
  // CORRECT
  import debounce from 'lodash/debounce' // 1KB
  ```
- Large date libraries (moment.js = 300KB)
- Not using dynamic imports for heavy components

**Quick wins:**
```typescript
// Dynamic import for heavy components (only loads when needed)
const HeavyChart = dynamic(() => import('./HeavyChart'), { ssr: false })
const PDFViewer = dynamic(() => import('./PDFViewer'), { ssr: false })
```

---

### API Routes: No Pagination

**What it is:** Returning all records from a table without limits. Acceptable with 10 records, catastrophic with 100,000.

```typescript
// RED FLAG: No limit
const { data } = await supabase.from('invoices').select('*')

// CORRECT: Paginated
const { data, count } = await supabase
  .from('invoices')
  .select('*', { count: 'exact' })
  .range(page * pageSize, (page + 1) * pageSize - 1)
  .order('created_at', { ascending: false })
```

**Rule:** Every endpoint that returns a list must have a maximum limit. Default: 50 records. Maximum: 500 records.

---

### API Routes: Synchronous Expensive Operations

**What it is:** Long-running operations (PDF generation, email sending, heavy computation) blocking the HTTP response.

```typescript
// RED FLAG: Generating a large PDF synchronously in a request handler
export async function POST(req: Request) {
  const pdf = await generateLargePDF(data) // Takes 5 seconds
  return new Response(pdf)
}

// BETTER FOR LARGE OPERATIONS: Queue it, return immediately
export async function POST(req: Request) {
  const jobId = await queuePDFGeneration(data)
  return Response.json({ jobId, status: 'processing' })
}
// Client polls /api/jobs/[jobId] for status
```

**When to consider async queuing:** Operations that regularly take > 2 seconds.

---

## Next.js/Vercel Scalability Patterns

### SSR vs SSG vs ISR Decision Matrix

| Rendering | Use When | Scales Because |
|-----------|----------|----------------|
| **SSG** (Static) | Content doesn't change per user (marketing pages, docs) | Served from CDN edge, zero server cost |
| **ISR** (Incremental Static Regeneration) | Content changes occasionally, same for all users (public dashboards, pricing) | Cached at edge, regenerates on interval |
| **SSR** (Server-side) | Content is user-specific (authenticated dashboards, user data) | Necessary, but add caching where possible |
| **CSR** (Client-side) | Content changes frequently and user-specific (real-time data) | Offloads to client, good for interactivity |

**Common mistake:** Using SSR for pages that could be SSG (marketing pages, landing pages). Every SSR page costs a serverless invocation.

### Vercel Edge Functions

For globally low-latency responses (auth checks, A/B testing, geolocation-based redirects), use Edge Runtime instead of Node.js runtime:

```typescript
// app/api/lightweight-check/route.ts
export const runtime = 'edge' // Runs at the CDN edge, faster globally

export async function GET(req: Request) {
  // Keep this lightweight — no Node.js-specific APIs
  // No heavy npm packages
  // No long-running operations
}
```

**Use Edge when:** The route does simple checks, redirects, or lightweight data transformations.
**Use Node.js when:** The route does database queries, file operations, or heavy computation.

### Supabase Connection Pooling

Supabase uses PgBouncer for connection pooling. This is critical for serverless environments where each function invocation creates a new DB connection.

```typescript
// Use the pooled connection string for server-side (API routes)
// In Supabase: Settings → Database → Connection string → Transaction mode
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    db: { schema: 'public' },
    // For serverless: use transaction pooler mode URL
  }
)
```

**Critical:** Using the direct connection URL (not pooled) in a serverless environment will exhaust Postgres connection limits under load.

---

## Caching Strategies

### Layer 1: CDN (Vercel Edge)

Static assets, SSG pages, and ISR pages are automatically cached at Vercel's edge. No work needed if you're using these rendering modes.

```typescript
// Explicitly cache API responses at the edge
export async function GET(req: Request) {
  const data = await fetchPublicData()
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  })
}
```

### Layer 2: React Query / SWR (Client)

For user-specific data, cache at the client level to avoid redundant API calls:

```typescript
// React Query: Cache invoice list, revalidate every 30 seconds
const { data: invoices } = useQuery({
  queryKey: ['invoices', userId],
  queryFn: () => fetchInvoices(userId),
  staleTime: 30_000,        // Data fresh for 30 seconds
  gcTime: 5 * 60_000,       // Keep in memory for 5 minutes
})
```

### Layer 3: Redis (Optional — for high-traffic patterns)

For expensive computations needed across multiple users (analytics aggregations, leaderboards):

```typescript
// Only add Redis if you have > 1000 DAU and measurable DB load
// Upstash provides serverless Redis compatible with Vercel
import { Redis } from '@upstash/redis'
const redis = new Redis({ url: process.env.UPSTASH_URL, token: process.env.UPSTASH_TOKEN })

const cached = await redis.get(`analytics:${userId}:${date}`)
if (cached) return cached
// ... compute and cache for 5 minutes
await redis.set(`analytics:${userId}:${date}`, result, { ex: 300 })
```

**Decision rule:** Add Redis only when you can demonstrate a specific hot query that would benefit. Don't add it speculatively.

---

## Scalability Checklist

### Database
```
[ ] Every foreign key column has an index
[ ] Every column used in .eq(), .gte(), .lte(), .order() has an index
[ ] No N+1 patterns (loops with database calls inside)
[ ] All list endpoints have pagination (limit + offset or cursor)
[ ] Using Supabase pooled connection string (not direct)
[ ] Supabase Query Performance dashboard checked — no queries > 500ms P95
[ ] RLS policies are efficient (indexed columns used in policy conditions)
```

### API Routes
```
[ ] No list endpoints returning unbounded results
[ ] Long operations (> 2s) queued asynchronously
[ ] Appropriate use of Edge vs Node.js runtime
[ ] API response caching for public/shared data
[ ] Rate limiting on expensive endpoints
```

### Frontend
```
[ ] Build output checked — no pages with > 200KB first load JS
[ ] Heavy components use dynamic() import
[ ] No full library imports when only one function needed
[ ] Images use next/image (automatic optimization + lazy loading)
[ ] Marketing/landing pages use SSG (not SSR)
[ ] React Query / SWR used for client-side data fetching (with staleTime)
```

### Infrastructure
```
[ ] Vercel plan appropriate for expected traffic (Pro for production)
[ ] Supabase plan has enough DB connections for expected concurrency
[ ] No single point of failure for critical user flows
[ ] Large file storage uses Supabase Storage (not API route proxy)
```

---

## Scalability Finding Template

```markdown
### SCALE-[N] — [Short Title]

| Field | Value |
|-------|-------|
| **ID** | SCALE-[N] |
| **Category** | Database / API / Frontend / Infrastructure |
| **Severity** | 🔴 Critical / 🟠 High / 🟡 Medium / 🔵 Low |
| **Threshold** | Becomes critical at [X] users / [Y] records |

**Description:** [What the scalability problem is]

**Evidence:** [File path, query, or pattern]

**Impact at scale:** [Specific consequence at 10x/100x current load]

**Recommendation:** [Specific fix with code example if applicable]
```

---

## Load Estimation Framework

Use this to contextualize findings with realistic numbers:

```
Given:
- Expected users at launch: [N]
- Expected users at 12 months: [M]
- Peak concurrency estimate: [N * 0.1] simultaneous users (10% DAU rule)
- Data volume at 12 months: [estimate records per user * M users]

For each bottleneck, ask:
- At current scale (launch): Does this cause problems? → If yes: Critical
- At 3-month scale: Would this cause problems? → If yes: High
- At 12-month scale: Would this cause problems? → If yes: Medium
- Beyond 12 months: Would this cause problems? → If yes: Low
```

This prevents over-engineering (fixing things that won't matter for years) while catching things that will break soon.
