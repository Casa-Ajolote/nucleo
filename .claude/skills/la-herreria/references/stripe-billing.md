# Stripe & Billing — Guía de Implementación

> Referencia general para implementar un sistema de billing con Stripe + Supabase en cualquier SaaS. Cubre checkout, webhooks, suscripciones, grupos beta, email receipts y testing.

---

## Arquitectura del Sistema

```
Usuario hace clic en "Subscribe"
        │
        ▼
  [Lógica de acceso especial]
        │
   staff? ──────────────────► Acceso inmediato (sin Stripe)
        │
   trial/beta? ─────────────► Stripe Checkout con trial_period_days
        │
   usuario regular? ─────────► Stripe Checkout a precio completo
        │
        ▼
  Stripe procesa el pago
        │
        ▼
  Webhook → Supabase Edge Function
        │
        ▼
  tabla profiles actualizada
```

---

## Variables de Entorno

```bash
# .env.local (Next.js)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Price IDs (crear en Stripe Dashboard)
NEXT_PUBLIC_STRIPE_PRICE_TIER1=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_TIER2=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_TIER3=price_xxxxx
```

```bash
# Supabase Edge Function Secrets
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Setup Inicial

### 1. Crear Productos y Precios en Stripe

En [Stripe Dashboard → Products](https://dashboard.stripe.com/products):

**Para planes one-time (por ej. créditos):**
- Standard pricing → precio fijo → One time

**Para suscripciones mensuales:**
- Standard pricing → precio fijo → Monthly (o Yearly)

Copiar los `price_` IDs resultantes a las env vars.

**Regla importante:** No crear precios separados para trials. Los trials se aplican dinámicamente al crear la sesión de checkout:

```typescript
// Trial aplicado en código, no en Stripe Dashboard
session = await stripe.checkout.sessions.create({
  // ...
  subscription_data: {
    trial_period_days: 90,
  },
})
```

### 2. Configurar Webhook Endpoint

En [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks):

1. "Add endpoint"
2. URL: `https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook`
3. Seleccionar eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Copiar el Signing Secret → añadir a Supabase secrets como `STRIPE_WEBHOOK_SECRET`

### 3. Schema de Base de Datos

Columnas recomendadas en la tabla `profiles`:

```sql
subscription_plan        TEXT    -- 'free', 'tier1', 'tier2', 'tier3', etc.
subscription_status      TEXT    -- 'active', 'canceled', 'past_due', 'trialing'
stripe_customer_id       TEXT    -- 'cus_...'
stripe_subscription_id   TEXT    -- 'sub_...' (solo suscripciones recurrentes)
current_period_start     TIMESTAMPTZ
current_period_end       TIMESTAMPTZ
cancel_at_period_end     BOOLEAN DEFAULT false
```

**Para beta groups (acceso especial):**

```sql
-- Migración para añadir beta_group
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'beta_group'
  ) THEN
    ALTER TABLE profiles
    ADD COLUMN beta_group TEXT CHECK (
      beta_group IN ('staff', 'early_adopter')
    );

    CREATE INDEX idx_profiles_beta_group
    ON profiles(beta_group) WHERE beta_group IS NOT NULL;
  END IF;
END $$;
```

---

## Billing Service (Next.js)

```typescript
// src/features/billing/services/billing.service.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function createCheckoutSession({
  userId,
  priceId,
  successUrl,
  cancelUrl,
  trialDays,
}: {
  userId: string
  priceId: string
  successUrl: string
  cancelUrl: string
  trialDays?: number
}) {
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      supabase_user_id: userId,  // CRÍTICO: necesario para el webhook
    },
  }

  if (trialDays) {
    sessionParams.subscription_data = {
      trial_period_days: trialDays,
    }
  }

  return stripe.checkout.sessions.create(sessionParams)
}

export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}
```

---

## Webhook Handler (Supabase Edge Function)

```typescript
// supabase/functions/stripe-webhook/index.ts
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')!
  const body = await req.text()

  let event: Stripe.Event

  try {
    // En Deno/Edge: usar constructEventAsync (NO constructEvent)
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.supabase_user_id

      if (!userId) break

      await supabase.from('profiles').update({
        subscription_plan: session.metadata?.plan,
        subscription_status: 'active',
        stripe_customer_id: session.customer as string,
      }).eq('id', userId)
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      await supabase.from('profiles').update({
        subscription_status: sub.status,
        current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        cancel_at_period_end: sub.cancel_at_period_end,
      }).eq('stripe_customer_id', sub.customer as string)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await supabase.from('profiles').update({
        subscription_plan: 'free',
        subscription_status: 'canceled',
        stripe_subscription_id: null,
      }).eq('stripe_customer_id', sub.customer as string)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      await supabase.from('profiles').update({
        subscription_status: 'past_due',
      }).eq('stripe_customer_id', invoice.customer as string)
      break
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

**Error crítico:** En entornos Deno/Edge Functions, usar siempre `constructEventAsync()` (async), nunca `constructEvent()` (sync). El sync lanza error `"SubtleCryptoProvider cannot be used in a synchronous context"`.

---

## Beta Groups / Acceso Especial

Sistema para dar acceso gratuito a staff o early adopters sin modificar la lógica de pricing.

### Gestión de acceso

```sql
-- Dar acceso a staff (gratis para siempre)
UPDATE profiles SET beta_group = 'staff' WHERE email = 'admin@tuempresa.com';

-- Dar acceso early adopter (trial de 90 días en plan premium)
UPDATE profiles SET beta_group = 'early_adopter' WHERE email = 'earlyuser@example.com';

-- Revocar acceso especial
UPDATE profiles SET beta_group = NULL WHERE email = 'user@example.com';

-- Dar early adopter a los primeros N signups
UPDATE profiles
SET beta_group = 'early_adopter'
WHERE id IN (
  SELECT id FROM profiles
  WHERE beta_group IS NULL
  ORDER BY created_at ASC
  LIMIT 100
);
```

### Lógica en el frontend

```typescript
export async function handleSubscribe(userId: string, planId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('beta_group')
    .eq('id', userId)
    .single()

  // Staff: acceso inmediato sin Stripe
  if (profile?.beta_group === 'staff') {
    await supabase.from('profiles').update({
      subscription_plan: planId,
      subscription_status: 'active',
    }).eq('id', userId)
    return { type: 'direct_access' }
  }

  // Early adopter en plan premium: trial de 90 días
  const trialDays = (profile?.beta_group === 'early_adopter' && planId === 'tier3')
    ? 90
    : undefined

  const session = await createCheckoutSession({
    userId,
    priceId: PRICE_IDS[planId],
    successUrl: `${baseUrl}/dashboard?upgraded=true`,
    cancelUrl: `${baseUrl}/pricing`,
    trialDays,
  })

  return { type: 'checkout', url: session.url }
}
```

---

## Email Receipts

Stripe envía emails automáticos — no requiere código adicional.

### Activar en Stripe Dashboard → Settings → Emails

| Email | Cuándo |
|-------|--------|
| Successful payment | `checkout.session.completed` |
| Failed payment | `invoice.payment_failed` |
| Invoice finalization | Al crear invoice |
| Upcoming renewal reminder | 7 días antes |
| Trial will end | 3 días antes del fin del trial |
| Subscription canceled | Al cancelar |

### Configurar branding

Settings → Branding → subir logo, colores, nombre de empresa, email de soporte.

---

## Testing

### Tarjetas de prueba

| Tarjeta | Resultado |
|---------|-----------|
| `4242 4242 4242 4242` | Pago exitoso |
| `4000 0000 0000 0002` | Pago rechazado |
| `4000 0025 0000 3155` | Requiere 3D Secure |

### Probar webhooks localmente

```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Reenviar webhooks a localhost
stripe listen --forward-to localhost:3000/api/stripe-webhook

# En otro terminal, disparar evento de prueba
stripe trigger checkout.session.completed
```

---

## Monitoring

### Queries SQL útiles

```sql
-- Ver todos los suscriptores activos
SELECT email, subscription_plan, subscription_status, current_period_end
FROM profiles
WHERE subscription_status = 'active'
ORDER BY subscription_plan;

-- Ver usuarios con pago fallido
SELECT email, subscription_plan, stripe_customer_id
FROM profiles
WHERE subscription_status = 'past_due';

-- Revenue activo por plan
SELECT
  subscription_plan,
  COUNT(*) AS subscribers
FROM profiles
WHERE subscription_status = 'active'
GROUP BY subscription_plan;
```

---

## Troubleshooting

| Error | Causa | Solución |
|-------|-------|----------|
| `Invalid signature` | `STRIPE_WEBHOOK_SECRET` incorrecto | Verificar en Stripe Dashboard → Webhooks |
| `No profile found for customer` | Falta `metadata.supabase_user_id` | Añadir metadata al crear la session |
| `SubtleCryptoProvider...` | Usando `constructEvent()` en Deno | Cambiar a `constructEventAsync()` |
| Suscripción no actualiza | Webhook no recibe eventos | Verificar Stripe Dashboard → Webhooks → Events |

---

## Checklist de Producción

```
- [ ] Precios creados en Stripe Dashboard (live mode)
- [ ] Price IDs en .env.production
- [ ] Webhook configurado apuntando a producción
- [ ] STRIPE_SECRET_KEY y STRIPE_WEBHOOK_SECRET en secrets de Edge Function
- [ ] Email branding configurado
- [ ] Todos los tipos de email habilitados
- [ ] Flujos de pago testeados con tarjeta 4242
- [ ] Webhook testeado con Stripe CLI
- [ ] Manejo de `past_due` implementado (degradar acceso)
- [ ] Página de billing portal configurada
```

---

## Referencias

- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Stripe Billing Portal](https://stripe.com/docs/billing/subscriptions/customer-portal)
