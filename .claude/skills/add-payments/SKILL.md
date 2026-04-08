---
name: add-payments
description: |
  Integra sistema de pagos en tu proyecto Next.js + Supabase.
  Incluye decision tree para elegir entre Polar (Merchant of Record) y Stripe (directo).
  Polar: ideal para indie hackers sin empresa registrada. Stripe: para empresas con billing custom.

  Usar cuando: "agrega pagos", "add payments", "quiero cobrar", "checkout",
  "suscripciones", "webhook", "sistema de cobros", "monetizar", "billing",
  "cobrar por mi app", "pasarela de pagos", "polar", "stripe".

  Pre-requisito: /add-login (necesita auth + profiles en Supabase).
allowed-tools: Bash(npm *), Bash(npx *), Read, Write, Edit, Glob, Grep
---

# Add Payments — Polar o Stripe

Integra un sistema de pagos completo. Antes de implementar, guia al usuario
para elegir el proveedor correcto segun su situacion.

Pre-requisito: `/add-login` ejecutado (busca `src/shared/lib/supabase/client.ts`).

---

## Seccion 1: Decision Tree — Elegir Proveedor

### Matriz de Decision Rapida

| Factor | Polar (MoR) | Stripe (Directo) |
|--------|-------------|-------------------|
| **Ideal para** | Indie hackers, solopreneurs, creadores | Empresas establecidas, startups funded |
| **Empresa registrada?** | No requerida — Polar es el vendedor legal | Requerida (LLC, Corp, SL, etc.) |
| **Tax/legal** | Polar maneja impuestos, IVA, facturacion | Tu lo manejas (o usas Stripe Tax) |
| **Geografia** | US/EU principalmente | 195+ paises |
| **Billing custom** | Planes standard (month/year) | Control total (metered, usage, custom) |
| **Revenue share** | ~5% + processing fees | ~2.9% + $0.30 por transaccion |
| **Setup** | Baja (~1h, sin empresa) | Media (~2-3h, necesita cuenta verificada) |
| **Customer portal** | Polar lo maneja | Tu lo construyes (o usas el de Stripe) |

### Entrevista (4 preguntas)

Haz estas preguntas al usuario ANTES de implementar:

**1. "Tienes una empresa registrada (LLC, Corp, SL, autonomo)?"**
- NO → Recomienda **Polar** (MoR, ellos facturan por ti)
- SI → Continua con pregunta 2

**2. "Tu publico es global o concentrado en US/EU?"**
- Global / mercados emergentes → Recomienda **Stripe** (195+ paises)
- US/EU principalmente → Ambos sirven, continua con pregunta 3

**3. "Necesitas billing custom (metered, usage-based, invoices personalizadas)?"**
- SI → Recomienda **Stripe** (control total)
- NO, planes standard → Ambos sirven, continua con pregunta 4

**4. "Que es mas importante: velocidad de setup o control total?"**
- Velocidad → **Polar**
- Control → **Stripe**

### Output de la Decision

Basado en las respuestas, di UNO de:

```
Recomendado: Polar (Merchant of Record)
Razon: [razon basada en respuestas]
Procediendo con implementacion Polar...
```

```
Recomendado: Stripe (Directo)
Razon: [razon basada en respuestas]
Procediendo con implementacion Stripe...
```

Luego ejecuta la seccion correspondiente (2 o 3).

---

## Seccion 2: Implementacion Polar

> Polar corre encima de Stripe. Maneja impuestos, facturacion e IVA internacional.
> Tu solo recibes dinero. No necesitas empresa constituida.

### Principios Criticos (Polar)

- **Polar = Merchant of Record.** Ellos son el vendedor legal.
- **El webhook es la fuente de verdad.** NUNCA confies en el frontend para validar pagos.
- **subscription.active = acceso.** NO des acceso en checkout.updated.
- **Idempotencia obligatoria.** El mismo webhook puede llegar multiples veces.
- **SIEMPRE .trim() en secrets.** Espacios invisibles rompen la verificacion de firma.

### Instalar

```bash
npm install @polar-sh/sdk
```

### Archivos a Crear (Polar)

#### 2.1 Migracion SQL

Archivo: `supabase/migrations/$(date +%Y%m%d%H%M%S)_add_payments.sql`

```sql
-- Add payments support
-- Requires: profiles table (from add-login)

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_access boolean DEFAULT false;

CREATE TABLE IF NOT EXISTS public.purchases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'polar' CHECK (provider IN ('polar', 'stripe')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'canceled', 'refunded')),
  provider_checkout_id text,
  provider_subscription_id text UNIQUE,
  provider_customer_id text,
  price_cents integer,
  billing_interval text CHECK (billing_interval IN ('month', 'year')),
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON public.purchases(status);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own purchases" ON public.purchases
  FOR SELECT USING (auth.uid() = user_id);
```

#### 2.2 Polar Client

Archivo: `src/shared/lib/polar.ts`

```typescript
import { Polar } from '@polar-sh/sdk';

const isSandbox = process.env.POLAR_ENVIRONMENT === 'sandbox';

export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN?.trim(),
  server: isSandbox ? 'sandbox' : 'production',
});

// CRITICO: .trim() evita espacios invisibles que rompen verificacion de firma
export const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET?.trim() ?? '';
export const POLAR_PRODUCT_ID = process.env.POLAR_PRODUCT_ID ?? '';
```

#### 2.3 Supabase Admin Client

Archivo: `src/shared/lib/supabase/admin.ts`

SI ya existe (de add-login u otro skill), NO sobreescribir.

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

#### 2.4 Webhook Handler (Polar)

Archivo: `src/app/api/webhooks/polar/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks';
import { POLAR_WEBHOOK_SECRET } from '@/shared/lib/polar';
import { supabaseAdmin } from '@/shared/lib/supabase/admin';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headers = Object.fromEntries(request.headers.entries());

  let event;
  try {
    event = validateEvent(body, headers, POLAR_WEBHOOK_SECRET);
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }
    throw error;
  }

  try {
    switch (event.type) {
      case 'subscription.active':
        await handleSubscriptionActive(event.data);
        break;
      case 'subscription.canceled':
      case 'subscription.revoked':
        await handleSubscriptionCanceled(event.data);
        break;
      case 'checkout.updated':
        if (event.data.status === 'succeeded') {
          await handleCheckoutSucceeded(event.data);
        }
        break;
      default:
        console.log(`[Webhook] Unhandled event: ${event.type}`);
    }
  } catch (error) {
    console.error(`[Webhook] Error handling ${event.type}:`, error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// AQUI es donde das acceso. NO en checkout.updated.
async function handleSubscriptionActive(subscription: any) {
  const userId = subscription.metadata?.user_id;
  if (!userId) return;

  // Idempotencia: si ya procesamos este periodo, ignorar
  const { data: existing } = await supabaseAdmin
    .from('purchases')
    .select('current_period_end')
    .eq('provider_subscription_id', subscription.id)
    .single();

  if (existing?.current_period_end === subscription.current_period_end) return;

  await supabaseAdmin.from('purchases').upsert(
    {
      user_id: userId,
      provider: 'polar',
      status: 'completed',
      provider_subscription_id: subscription.id,
      provider_customer_id: subscription.customer_id,
      price_cents: subscription.amount,
      billing_interval: subscription.recurring_interval,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'provider_subscription_id' }
  );

  await supabaseAdmin
    .from('profiles')
    .update({ has_access: true })
    .eq('id', userId);
}

async function handleSubscriptionCanceled(subscription: any) {
  const userId = subscription.metadata?.user_id;
  if (!userId) return;

  const { data: otherActive } = await supabaseAdmin
    .from('purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .neq('provider_subscription_id', subscription.id);

  await supabaseAdmin
    .from('purchases')
    .update({ status: 'canceled', updated_at: new Date().toISOString() })
    .eq('provider_subscription_id', subscription.id);

  if (!otherActive || otherActive.length === 0) {
    await supabaseAdmin
      .from('profiles')
      .update({ has_access: false })
      .eq('id', userId);
  }
}

async function handleCheckoutSucceeded(checkout: any) {
  const userId = checkout.metadata?.user_id;
  if (!userId) return;

  await supabaseAdmin
    .from('purchases')
    .update({ provider_checkout_id: checkout.id, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('status', 'pending')
    .is('provider_checkout_id', null);
}
```

#### 2.5 Server Action (Polar Checkout)

Archivo: `src/features/billing/actions/checkout.ts`

```typescript
'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { polar, POLAR_PRODUCT_ID } from '@/shared/lib/polar';

export async function createCheckout() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  try {
    const checkout = await polar.checkouts.custom.create({
      productId: POLAR_PRODUCT_ID,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
      customerEmail: user.email!,
      metadata: { user_id: user.id, product_type: 'subscription' },
    });

    return { url: checkout.url };
  } catch (error) {
    console.error('[Checkout] Error:', error);
    return { error: 'Failed to create checkout' };
  }
}
```

#### 2.6 Checkout + Success Pages

Archivo: `src/app/(auth)/checkout/page.tsx`

```tsx
'use client';

import { useState } from 'react';
import { createCheckout } from '@/features/billing/actions/checkout';

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCheckout() {
    setLoading(true);
    setError('');
    const result = await createCheckout();

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    if (result.url) window.location.href = result.url;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-3xl font-bold">Suscribete</h1>
        <p className="text-muted-foreground">
          Accede a todas las funcionalidades con tu suscripcion.
        </p>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full py-3 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Redirigiendo...' : 'Comenzar Suscripcion'}
        </button>
      </div>
    </div>
  );
}
```

Archivo: `src/app/(auth)/checkout/success/page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/shared/lib/supabase/client';

export default function CheckoutSuccessPage() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'timeout'>('verifying');
  const router = useRouter();

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 10;

    const checkAccess = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: profile } = await supabase
        .from('profiles').select('has_access').eq('id', user.id).single();

      if (profile?.has_access) {
        setStatus('success');
        setTimeout(() => router.push('/'), 2000);
        return;
      }

      attempts++;
      if (attempts >= maxAttempts) { setStatus('timeout'); return; }
      setTimeout(checkAccess, 2000);
    };

    checkAccess();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4">
        {status === 'verifying' && (
          <>
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            <h1 className="text-2xl font-bold">Verificando pago...</h1>
            <p className="text-muted-foreground">Esto toma unos segundos.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-green-500 text-5xl font-bold">&#10003;</div>
            <h1 className="text-2xl font-bold">Pago confirmado</h1>
            <p className="text-muted-foreground">Redirigiendo...</p>
          </>
        )}
        {status === 'timeout' && (
          <>
            <h1 className="text-2xl font-bold">Procesando tu pago</h1>
            <p className="text-muted-foreground">Tu pago fue recibido. El acceso se activara en unos minutos.</p>
            <button onClick={() => router.push('/')} className="py-2 px-4 bg-primary text-primary-foreground rounded-lg">Ir al inicio</button>
          </>
        )}
      </div>
    </div>
  );
}
```

### Env Vars (Polar)

```
POLAR_ACCESS_TOKEN=polar_at_xxx
POLAR_PRODUCT_ID=xxx
POLAR_WEBHOOK_SECRET=xxx
POLAR_ENVIRONMENT=sandbox
```

---

## Seccion 3: Implementacion Stripe

> Stripe te da control total sobre billing. Necesitas empresa registrada.
> Tu manejas impuestos (o usas Stripe Tax). Mas trabajo, mas flexibilidad.

### Principios Criticos (Stripe)

- **El webhook es la fuente de verdad.** NUNCA confies en el frontend.
- **checkout.session.completed = verificar suscripcion.** No dar acceso directo.
- **customer.subscription.updated/deleted = actualizar acceso.**
- **Idempotencia via subscription ID.** El mismo evento puede llegar multiples veces.
- **stripe.webhooks.constructEvent para verificar firma.** Usar el raw body.

### Instalar

```bash
npm install stripe
```

### Archivos a Crear (Stripe)

#### 3.1 Migracion SQL

Usar la misma migracion de la Seccion 2.1 — la tabla `purchases` ya soporta ambos proveedores con la columna `provider`.

#### 3.2 Stripe Client

Archivo: `src/shared/lib/stripe.ts`

```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? '';
export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID ?? '';
```

#### 3.3 Supabase Admin Client

Mismo archivo de Seccion 2.3 (`src/shared/lib/supabase/admin.ts`). No duplicar.

#### 3.4 Webhook Handler (Stripe)

Archivo: `src/app/api/webhooks/stripe/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/shared/lib/stripe';
import { supabaseAdmin } from '@/shared/lib/supabase/admin';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error('[Stripe Webhook] Invalid signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        console.log(`[Stripe Webhook] Unhandled event: ${event.type}`);
    }
  } catch (error) {
    console.error(`[Stripe Webhook] Error handling ${event.type}:`, error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  if (!userId || session.mode !== 'subscription') return;

  const subscriptionId = session.subscription as string;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  await supabaseAdmin.from('purchases').upsert(
    {
      user_id: userId,
      provider: 'stripe',
      status: 'completed',
      provider_subscription_id: subscription.id,
      provider_customer_id: subscription.customer as string,
      provider_checkout_id: session.id,
      price_cents: subscription.items.data[0]?.price?.unit_amount ?? 0,
      billing_interval: subscription.items.data[0]?.price?.recurring?.interval === 'year' ? 'year' : 'month',
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'provider_subscription_id' }
  );

  await supabaseAdmin
    .from('profiles')
    .update({ has_access: true })
    .eq('id', userId);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const { data: purchase } = await supabaseAdmin
    .from('purchases')
    .select('user_id')
    .eq('provider_subscription_id', subscription.id)
    .single();

  if (!purchase) return;

  const isActive = subscription.status === 'active' || subscription.status === 'trialing';

  await supabaseAdmin
    .from('purchases')
    .update({
      status: isActive ? 'completed' : 'canceled',
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq('provider_subscription_id', subscription.id);

  await supabaseAdmin
    .from('profiles')
    .update({ has_access: isActive })
    .eq('id', purchase.user_id);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { data: purchase } = await supabaseAdmin
    .from('purchases')
    .select('user_id')
    .eq('provider_subscription_id', subscription.id)
    .single();

  if (!purchase) return;

  await supabaseAdmin
    .from('purchases')
    .update({ status: 'canceled', updated_at: new Date().toISOString() })
    .eq('provider_subscription_id', subscription.id);

  // Verificar si tiene otra suscripcion activa
  const { data: otherActive } = await supabaseAdmin
    .from('purchases')
    .select('id')
    .eq('user_id', purchase.user_id)
    .eq('status', 'completed')
    .neq('provider_subscription_id', subscription.id);

  if (!otherActive || otherActive.length === 0) {
    await supabaseAdmin
      .from('profiles')
      .update({ has_access: false })
      .eq('id', purchase.user_id);
  }
}
```

#### 3.5 Server Action (Stripe Checkout)

Archivo: `src/features/billing/actions/checkout.ts`

```typescript
'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { stripe, STRIPE_PRICE_ID } from '@/shared/lib/stripe';

export async function createCheckout() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
      customer_email: user.email!,
      metadata: { user_id: user.id },
    });

    return { url: session.url };
  } catch (error) {
    console.error('[Stripe Checkout] Error:', error);
    return { error: 'Failed to create checkout' };
  }
}
```

#### 3.6 Pages

Las paginas de checkout y success son las mismas de la Seccion 2.6.
El unico cambio es el texto del boton:
- Polar: "Redirigiendo a Polar..."
- Stripe: "Redirigiendo a Stripe..."

Adaptar el texto segun el proveedor elegido.

### Env Vars (Stripe)

```
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

---

## Flujo de Ejecucion

1. **Verificar pre-requisito:** `/add-login` ejecutado.
2. **Decision tree:** Hacer las 4 preguntas al usuario.
3. **Instalar SDK:** `npm install @polar-sh/sdk` o `npm install stripe` segun eleccion.
4. **Crear archivos:** Segun la seccion elegida (2 o 3).
5. **Aplicar migracion.**
6. **Mostrar mensaje final** con env vars del proveedor elegido.

## Mensaje Final (Polar)

```
Sistema de pagos integrado con Polar

Archivos creados:
  supabase/migrations/XXXXX_add_payments.sql
  src/shared/lib/polar.ts
  src/shared/lib/supabase/admin.ts
  src/app/api/webhooks/polar/route.ts
  src/features/billing/actions/checkout.ts
  src/app/(auth)/checkout/page.tsx
  src/app/(auth)/checkout/success/page.tsx

Configura en .env.local:
  POLAR_ACCESS_TOKEN=polar_at_xxx
  POLAR_PRODUCT_ID=xxx
  POLAR_WEBHOOK_SECRET=xxx
  POLAR_ENVIRONMENT=sandbox

Pasos siguientes:
  1. Crea cuenta en https://sandbox.polar.sh
  2. Crea un producto con precio de suscripcion
  3. Configura webhook: URL https://tudominio.com/api/webhooks/polar
     Eventos: checkout.updated, subscription.active, subscription.canceled
  4. Para dev local: ngrok http 3000
  5. Prueba con tarjeta: 4242 4242 4242 4242
  6. Production: POLAR_ENVIRONMENT=production
```

## Mensaje Final (Stripe)

```
Sistema de pagos integrado con Stripe

Archivos creados:
  supabase/migrations/XXXXX_add_payments.sql
  src/shared/lib/stripe.ts
  src/shared/lib/supabase/admin.ts
  src/app/api/webhooks/stripe/route.ts
  src/features/billing/actions/checkout.ts
  src/app/(auth)/checkout/page.tsx
  src/app/(auth)/checkout/success/page.tsx

Configura en .env.local:
  STRIPE_SECRET_KEY=sk_test_xxx
  STRIPE_WEBHOOK_SECRET=whsec_xxx
  STRIPE_PRICE_ID=price_xxx
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

Pasos siguientes:
  1. Crea cuenta en https://dashboard.stripe.com
  2. Crea producto + precio en Products
  3. Configura webhook: URL https://tudominio.com/api/webhooks/stripe
     Eventos: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
  4. Para dev local: stripe listen --forward-to localhost:3000/api/webhooks/stripe
  5. Prueba con tarjeta: 4242 4242 4242 4242
```
