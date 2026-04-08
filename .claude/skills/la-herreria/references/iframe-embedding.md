# iFrame Embedding Guide — Next.js en Cross-Origin Iframes

> Guía completa para hacer funcionar una app Next.js dentro de un iframe cross-origin (GoHighLevel, HubSpot, Salesforce, etc.), incluyendo soporte completo para Safari.

---

## El Problema

Cuando cargas tu app dentro de un `<iframe>` en un dominio diferente, aparecen tres categorías de problemas:

1. **Browser bloquea el iframe** → necesita headers CSP
2. **Safari muestra página en blanco** → bloquea JS/CSS sin header CORP
3. **Cookies de auth no persisten** → cookies cross-site bloqueadas por defecto

---

## 1. Headers HTTP (next.config.ts)

Dos headers requeridos en **todas las respuestas**:

```typescript
// next.config.ts
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: 'frame-ancestors *',
        },
        {
          key: 'Cross-Origin-Resource-Policy',
          value: 'cross-origin',
        },
      ],
    },
  ]
}
```

### Qué hace cada header

| Header | Propósito | Qué rompe si falta |
|--------|-----------|-------------------|
| `CSP: frame-ancestors *` | Permite embedding desde cualquier origen | Browser rechaza renderizar la página en el iframe |
| `CORP: cross-origin` | Permite carga cross-origin de assets estáticos | **Safari muestra página en blanco** — HTML carga pero JS/CSS son bloqueados silenciosamente |

### Por qué wildcard en `frame-ancestors *`

Plataformas como GoHighLevel usan múltiples dominios: `*.gohighlevel.com`, `*.leadconnectorhq.com`, dominios white-label personalizados. No se pueden enumerar todos, el wildcard es intencional.

### Por qué NO usar `X-Frame-Options`

`X-Frame-Options: ALLOW-FROM` está deprecado. Los browsers modernos lo ignoran. Usar `frame-ancestors` en CSP en su lugar.

---

## 2. Configuración de Cookies (Supabase)

Las cookies en iframes cross-site necesitan atributos especiales o la auth falla completamente.

### Los tres atributos requeridos

```typescript
{
  sameSite: 'none',    // Permite cookies en contexto cross-site
  secure: true,        // Requerido cuando sameSite es 'none' (solo HTTPS)
  partitioned: true,   // Safari CHIPS — aísla cookies por sitio embebedor
}
```

### Por qué condicional en producción

```typescript
const isProduction = process.env.NODE_ENV === 'production'

// Solo aplicar en producción
...(isProduction ? { sameSite: 'none', secure: true, partitioned: true } : {})
```

`sameSite: 'none'` + `secure: true` requiere HTTPS. Localhost usa HTTP, estos settings rompen el desarrollo local. El condicional asegura que dev funcione normalmente.

### Archivos que necesitan esta configuración

**TODOS los archivos que tocan cookies de Supabase deben tener el condicional:**

| Archivo | Por qué |
|---------|---------|
| `src/lib/supabase/client.ts` | Cliente browser — establece `cookieOptions` |
| `src/lib/supabase/server.ts` | Cliente server — callback `setAll` |
| `src/lib/supabase/middleware.ts` | Refresh de sesión — callback `setAll` |
| `src/middleware.ts` | Copia cookies de Supabase a la respuesta |

**Si omites aunque sea un archivo, la auth falla intermitentemente** — a veces login funciona pero la sesión no persiste, o funciona en Chrome pero no en Safari.

### Implementación en cada archivo

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

const isProduction = process.env.NODE_ENV === 'production'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        ...(isProduction ? {
          sameSite: 'none' as const,
          secure: true,
          partitioned: true,
        } : {}),
      },
    }
  )
}
```

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const isProduction = process.env.NODE_ENV === 'production'
const iframeCookieOptions = isProduction
  ? { sameSite: 'none' as const, secure: true, partitioned: true }
  : {}

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, { ...options, ...iframeCookieOptions })
          })
        },
      },
    }
  )
}
```

### ¿Qué es CHIPS (partitioned: true)?

CHIPS = Cookies Having Independent Partitioned State. Soportado en Safari 17+ y Chrome 114+. Significa: "esta cookie pertenece al origen del iframe, pero particionada por el sitio embebedor." Es el reemplazo moderno de las cookies de terceros en iframes.

---

## 3. Safari Storage Access (para Safari < 17)

Safari ITP (Intelligent Tracking Prevention) bloquea cookies de terceros en iframes por defecto. El flag `partitioned: true` maneja la mayoría de los casos, pero para Safari más antiguo, se necesita un componente `StorageAccessGate`.

### Lógica del componente

1. Detecta si corre dentro de un iframe (`window.self !== window.top`)
2. Usa la Storage Access API para verificar acceso a cookies
3. Si no tiene acceso, muestra un prompt al usuario
4. Si el grant falla, abre la app en nueva pestaña (visita first-party habilita acceso futuro en iframe)

### ⚠️ Regla crítica: NUNCA usar como wrapper del layout raíz

```typescript
// ❌ MAL — bloquea SSR, causa página en blanco permanente
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <StorageAccessGate>  {/* NUNCA aquí */}
          {children}
        </StorageAccessGate>
      </body>
    </html>
  )
}
```

Si `StorageAccessGate` retorna `null` durante el estado "checking", SSR produce HTML vacío. Si la hidratación falla (que ocurre en Safari iframes), la página se queda en blanco para siempre.

```typescript
// ✅ BIEN — usar ErrorBoundary en el raíz, StorageAccessGate más profundo
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          {children}  {/* StorageAccessGate va dentro de una página específica */}
        </ErrorBoundary>
      </body>
    </html>
  )
}
```

---

## 4. localStorage Safety

Safari lanza `SecurityError` al acceder `localStorage` en iframes cross-origin sin storage access.

### Nunca acceder localStorage directamente

```typescript
// ❌ MAL — lanza SecurityError en Safari cross-origin
const data = localStorage.getItem('key')

// ✅ BIEN — siempre con try/catch
export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null  // Safari cross-origin iframe — fallback silencioso
  }
}

export function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Safari cross-origin iframe — ignorar silenciosamente
  }
}
```

**Regla:** Nunca llamar `localStorage` directamente. Siempre usar helpers con try/catch o `safe-storage.ts`.

---

## 5. Error Boundary en Layout Raíz

```typescript
// src/app/layout.tsx
import { ErrorBoundary } from '@/components/error-boundary'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
```

El ErrorBoundary captura errores de renderizado/hidratación y muestra un mensaje en lugar de una página en blanco. Crítico en contextos de iframe donde no puedes abrir DevTools fácilmente.

---

## 6. Fechas y Timezones en Iframes

### El bug de `Intl.DateTimeFormat` con regex

```typescript
// ❌ MAL — formato varía entre browsers, regex no matchea en Safari
formatter.format(date).replace(
  /(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)/,
  '$3-$1-$2T$4:$5:$6'
)
// Safari produce formato diferente → regex no matchea → new Date() recibe string inválido → crash

// ✅ BIEN — calcular diferencias directamente, sin parsear strings formateados
const diff = targetDate.getTime() - referenceDate.getTime()
const result = new Date(Date.now() + diff)
```

**Regla:** Nunca parsear output de `Intl.DateTimeFormat` con regex. El formato no está estandarizado entre browsers.

---

## Debugging Checklist

### Página completamente en blanco

1. Verificar que `Cross-Origin-Resource-Policy: cross-origin` está presente (Safari)
2. Verificar que ningún componente retorna `null` en el layout raíz
3. Network tab → ¿cargan los chunks de JS/CSS o están bloqueados?

### Página carga pero auth no funciona

1. Verificar los 4 archivos Supabase tienen la config de cookies
2. DevTools → Application → Cookies → verificar `SameSite=None; Secure; Partitioned`
3. Verificar que estás en HTTPS (requerido para `SameSite=None`)

### Funciona en Chrome pero no en Safari

1. Header `Cross-Origin-Resource-Policy` ausente (causa más común)
2. `partitioned: true` ausente de la config de cookies
3. Acceso a `localStorage` sin try/catch

### Errores de JavaScript en el iframe

1. Verificar que ErrorBoundary los captura (mensaje de error vs página en blanco)
2. Revisar uso de `Intl.DateTimeFormat` — no parsear con regex
3. Validar que inputs de `new Date()` no son null/undefined

---

## Referencia Completa de Archivos

| Archivo | Cambios Necesarios |
|---------|-------------------|
| `next.config.ts` | CSP `frame-ancestors *` + CORP `cross-origin` |
| `src/middleware.ts` | Cookie passthrough con atributos iframe-safe |
| `src/lib/supabase/client.ts` | `cookieOptions` con atributos iframe-safe |
| `src/lib/supabase/server.ts` | `setAll` con atributos iframe-safe |
| `src/lib/supabase/middleware.ts` | `setAll` con atributos iframe-safe |
| `src/lib/safe-storage.ts` | Wrapper con try/catch para `localStorage` |
| `src/components/storage-access-gate.tsx` | Safari Storage Access API prompt |
| `src/components/error-boundary.tsx` | Error catching a nivel raíz |
| `src/app/layout.tsx` | ErrorBoundary wrapping el árbol de providers |

---

## Lecciones Aprendidas

1. **Safari es el bottleneck.** Chrome es permisivo con iframes. Safari no lo es. Siempre testear en Safari primero.

2. **El header CORP es el fix #1.** Sin `Cross-Origin-Resource-Policy: cross-origin`, Safari bloquea silenciosamente todo JS/CSS. El HTML carga bien, pero React nunca hidrata.

3. **Nunca bloquear SSR con client gates.** Un componente cliente que retorna `null` como wrapper raíz produce HTML vacío desde SSR. Si la hidratación falla (que ocurrirá en Safari iframes), la página se queda en blanco para siempre.

4. **La config de cookies debe estar en TODOS los archivos.** Omitirla en uno solo causa fallos de auth intermitentes que son extremadamente difíciles de debuggear.

5. **localhost necesita tratamiento especial.** El condicional `isProduction` no es opcional — sin él, el desarrollo local se rompe completamente.

6. **El output de `Intl` no es portable.** No lo parsees con regex. Diferentes browsers formatean fechas de manera diferente.

7. **`localStorage` lanza errores en Safari iframes.** Siempre envolver en try/catch.

---

## Referencias

- [MDN — Cross-Origin-Resource-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Resource-Policy)
- [MDN — CSP frame-ancestors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-ancestors)
- [Storage Access API](https://developer.mozilla.org/en-US/docs/Web/API/Storage_Access_API)
- [CHIPS — Cookies Having Independent Partitioned State](https://developer.chrome.com/docs/privacy-sandbox/chips/)
- [Supabase SSR Auth](https://supabase.com/docs/guides/auth/server-side/nextjs)
