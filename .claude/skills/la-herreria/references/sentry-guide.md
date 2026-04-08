# Sentry Guide — Error Tracking & Observability

> Referencia general para integrar Sentry en cualquier aplicación Next.js. Cubre error tracking, performance tracing, structured logging y mejores prácticas.

---

## ¿Por qué Sentry?

Sentry proporciona visibilidad completa sobre errores en producción:
- **Error tracking**: Captura excepciones con stack trace completo
- **Performance tracing**: Mide duración de operaciones críticas
- **Structured logging**: Logs con contexto enriquecido
- **Session replay**: Reproduce la sesión del usuario que encontró el error
- **Alertas**: Notifica cuando algo se rompe

---

## Setup en Next.js

### 1. Instalación

```bash
npx @sentry/wizard@latest -i nextjs
```

El wizard crea automáticamente los archivos de configuración.

### 2. Variables de Entorno

```bash
# .env.local
# Requerido
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.us.sentry.io/xxx

# Opcional (para upload de source maps en CI/CD)
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
SENTRY_AUTH_TOKEN=your-auth-token
```

### 3. Archivos de Configuración

El wizard genera estos archivos — no modificar estructura:

| Archivo | Propósito |
|---------|-----------|
| `sentry.client.config.ts` | Browser: error tracking + session replay |
| `sentry.server.config.ts` | Server: API routes + Server Actions |
| `sentry.edge.config.ts` | Edge: middleware errors |
| `instrumentation.ts` | Hook de inicialización de Next.js |

---

## Exception Capturing

### En try/catch blocks

```typescript
import * as Sentry from '@sentry/nextjs'

async function processPayment(orderId: string) {
  try {
    const result = await chargeCustomer(orderId)
    return result
  } catch (error) {
    // Siempre incluir contexto relevante
    Sentry.captureException(error, {
      tags: { feature: 'billing', orderId },
      extra: { timestamp: new Date().toISOString() }
    })
    throw error  // Re-throw para que el caller también lo maneje
  }
}
```

### Contexto enriquecido

```typescript
// Bueno — contexto ayuda a reproducir el error
Sentry.captureException(error, {
  tags: { feature: 'auth', userId },
  extra: { action: 'login', provider: 'email' }
})

// Malo — sin contexto es difícil debuggear
Sentry.captureException(error)
```

---

## Performance Tracing

### Custom Span para UI Actions

```typescript
import * as Sentry from '@sentry/nextjs'

function SubmitButton({ formId }: { formId: string }) {
  const handleClick = () => {
    Sentry.startSpan(
      {
        op: 'ui.click',
        name: 'Submit Form Button',
      },
      (span) => {
        span.setAttribute('formId', formId)
        submitForm()
      }
    )
  }

  return <button onClick={handleClick}>Submit</button>
}
```

### Custom Span para API externos

```typescript
import * as Sentry from '@sentry/nextjs'

async function callExternalAPI(payload: object) {
  return Sentry.startSpan(
    {
      op: 'http.client',
      name: 'External API Call',   // Nombre descriptivo, no genérico
    },
    async (span) => {
      span.setAttribute('endpoint', '/api/process')

      const response = await fetch('https://api.external.com/process', {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      span.setAttribute('status', response.status)
      return response.json()
    }
  )
}
```

### Nombres de spans: buenas prácticas

```typescript
// ✅ Bueno — descriptivo y categorizado
Sentry.startSpan({ op: 'http.client', name: 'Payment API — Create Charge' }, ...)
Sentry.startSpan({ op: 'db.query', name: 'Get User Subscription' }, ...)
Sentry.startSpan({ op: 'function', name: 'Process Image Upload' }, ...)

// ❌ Malo — genérico, no ayuda al diagnóstico
Sentry.startSpan({ op: 'fetch', name: 'API call' }, ...)
Sentry.startSpan({ op: 'task', name: 'process' }, ...)
```

---

## Structured Logging

### Niveles de log

```typescript
import * as Sentry from '@sentry/nextjs'

const { logger } = Sentry

logger.trace('Iniciando conexión', { service: 'database' })     // Ultra-detallado
logger.debug(logger.fmt`Cache miss para key: ${'user:123'}`)    // Dev debugging
logger.info('Operación completada', { userId, action: 'login' }) // Operaciones normales
logger.warn('Rate limit cerca', { endpoint: '/api/ai', remaining: 5 }) // Advertencias
logger.error('Falló operación', { orderId, amount: 99.99 })     // Errores no críticos
logger.fatal('DB pool agotado', { connections: 100 })           // Fallo crítico
```

### Cuándo usar cada nivel

| Nivel | Cuándo Usar | ¿Producción? |
|-------|-------------|--------------|
| `trace` | Debugging ultra-detallado | Raramente |
| `debug` | Info de desarrollo | No |
| `info` | Acciones del usuario, completaciones | Sí |
| `warn` | Rate limits, reintentos, degradación | Sí |
| `error` | Errores que no crashean la app | Sí |
| `fatal` | Fallos críticos que requieren atención inmediata | Sí |

### Ejemplo: Service Layer

```typescript
import * as Sentry from '@sentry/nextjs'

const { logger } = Sentry

export async function createResource(userId: string, data: ResourceInput) {
  logger.info('Creating resource', { userId, resourceName: data.name })

  try {
    const resource = await db.resources.create({ data, userId })
    logger.info('Resource created', { resourceId: resource.id })
    return resource
  } catch (error) {
    logger.error('Failed to create resource', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    Sentry.captureException(error)
    throw error
  }
}
```

---

## Qué NUNCA loguear

```typescript
// ❌ NUNCA — datos sensibles
logger.info('User authenticated', {
  email: user.email,        // PII
  password: user.password,  // Credenciales
  token: user.apiToken,     // Secretos
  cardNumber: '4242...',    // Datos financieros
  ssn: '123-45-6789',       // Documentos de identidad
})

// ✅ SIEMPRE — IDs y metadata no sensible
logger.info('User authenticated', {
  userId: user.id,          // ID interno
  authMethod: 'email',      // Metadata
  success: true,            // Estado
})
```

---

## Error Boundaries

### Configuración en Next.js

```typescript
// src/app/error.tsx — Errores de página
'use client'
import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function Error({ error, reset }: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div>
      <h2>Algo salió mal</h2>
      <button onClick={reset}>Intentar de nuevo</button>
    </div>
  )
}
```

```typescript
// src/app/global-error.tsx — Errores del layout raíz
'use client'
import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({ error, reset }: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <h2>Error crítico de la aplicación</h2>
        <button onClick={reset}>Reiniciar</button>
      </body>
    </html>
  )
}
```

---

## Integración con console

```typescript
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  integrations: [
    Sentry.captureConsoleIntegration({
      levels: ['warn', 'error'],  // console.warn y console.error van a Sentry
    }),
  ],
})
```

> **Nota:** Los `console.error()` existentes se capturan automáticamente. Para código nuevo, usar `logger.*` para mejor contexto y filtrado.

---

## Checklist de Producción

```
- [ ] NEXT_PUBLIC_SENTRY_DSN configurado en .env.production
- [ ] SENTRY_AUTH_TOKEN configurado para source maps
- [ ] Error boundaries en error.tsx y global-error.tsx
- [ ] Logs no contienen PII (emails, passwords, tokens, tarjetas)
- [ ] captureException con contexto (tags, extra) en catch críticos
- [ ] Custom spans en operaciones > 500ms
- [ ] Alertas configuradas en Sentry Dashboard
```

---

## Alertas Recomendadas

Configurar en Sentry Dashboard → Alerts:

| Alerta | Condición | Canal |
|--------|-----------|-------|
| Error rate alto | > 1% por 5 minutos | PagerDuty / SMS |
| Error rate medio | > 0.5% por 30 minutos | Slack |
| Nuevo error en producción | Primera ocurrencia | Slack |
| Performance degradada | P95 > 3s por 10 minutos | Slack |

---

## Referencias

- [Sentry Next.js SDK](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Performance Tracing](https://docs.sentry.io/product/performance/)
- [Sentry Logging](https://docs.sentry.io/platforms/javascript/guides/nextjs/logs/)
- [Error Boundaries](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#react-error-boundary)
