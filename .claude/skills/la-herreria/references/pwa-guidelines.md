# PWA Guidelines — Progressive Web Apps

> Referencia general para implementar Progressive Web Apps en cualquier proyecto web. Aplica a Next.js, React, Vue, Svelte, o cualquier stack moderno.

---

## ¿Qué es una PWA?

Una Progressive Web App combina la accesibilidad de la web con la experiencia nativa de una app móvil. El usuario puede instalarla desde el browser, funciona offline, y se comporta como una app nativa en iOS/Android/Desktop.

**Tres pilares:**
1. **Manifest** → Identidad (nombre, iconos, colores)
2. **Service Worker** → Superpoder (cache, offline, push)
3. **HTTPS** → Seguridad (obligatorio)

---

## 1. Web App Manifest

El manifest define cómo se ve e instala la app.

### En Next.js App Router (recomendado)

```typescript
// src/app/manifest.ts
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tu App Name',
    short_name: 'AppName',
    description: 'Descripción de tu app',
    start_url: '/',
    display: 'standalone',           // Sin barra del browser
    background_color: '#ffffff',
    theme_color: '#000000',
    orientation: 'portrait',
    prefer_related_applications: false,
    categories: ['business', 'productivity'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
```

### Elementos críticos

| Campo | Valor | Por qué |
|-------|-------|---------|
| `display: "standalone"` | Sin barra de browser | Experiencia nativa |
| `icons` 192px + 512px | Mínimo requerido | Android, iOS, Desktop |
| `purpose: "maskable"` | Para íconos adaptativos | Android sin fondo blanco |
| `theme_color` | Color de tu brand | Barra de estado del OS |

---

## 2. Service Worker con Serwist (Recomendado 2025)

[Serwist](https://serwist.pages.dev/) es el sucesor de `next-pwa`, mantenido activamente.

### Instalación

```bash
npm install serwist @serwist/next
```

### Configurar next.config.ts

```typescript
import type { NextConfig } from 'next'
import withSerwistInit from '@serwist/next'

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',  // SW solo en producción
})

const nextConfig: NextConfig = {
  // tu config existente
}

export default withSerwist(nextConfig)
```

### Crear el Service Worker

```typescript
// src/app/sw.ts
/// <reference lib="webworker" />
import { defaultCache } from '@serwist/next/worker'
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { Serwist } from 'serwist'

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope & typeof globalThis

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: '/offline',
        matcher: ({ request }) => request.destination === 'document',
      },
    ],
  },
})

serwist.addEventListeners()
```

### .gitignore para archivos generados

```
# PWA - archivos generados por Serwist
public/sw.js
public/sw.js.map
public/workbox-*.js
public/workbox-*.js.map
public/swe-worker-*.js
public/swe-worker-*.js.map
```

---

## 3. Página Offline

```typescript
// src/app/offline/page.tsx
'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Sin conexión</h1>
        <p className="text-gray-600 mb-6">
          Verifica tu conexión a internet e intenta de nuevo.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}
```

---

## 4. Botón de Instalación (PWAProvider)

Componente para gestionar la instalación y mostrar un banner nativo.

```typescript
// src/components/PWAProvider.tsx
'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)

  useEffect(() => {
    // Registrar service worker manualmente (opcional si ya lo hace Serwist)
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js')
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches
      if (!isInstalled) {
        setTimeout(() => setShowInstallBanner(true), 3000)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', () => {
      setShowInstallBanner(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') console.log('PWA instalada')
    setDeferredPrompt(null)
    setShowInstallBanner(false)
  }

  const handleDismiss = () => {
    setShowInstallBanner(false)
    sessionStorage.setItem('pwa-banner-dismissed', 'true')
  }

  return (
    <>
      {children}
      {showInstallBanner && deferredPrompt && (
        <div className="fixed bottom-4 left-4 right-4 z-50 bg-white border rounded-lg p-4 shadow-lg">
          <h3 className="font-semibold">Instalar App</h3>
          <p className="text-sm text-gray-600">Añade a la pantalla de inicio para acceso rápido</p>
          <div className="flex gap-2 mt-3">
            <button onClick={handleDismiss} className="text-gray-500">Ahora no</button>
            <button onClick={handleInstall} className="bg-blue-500 text-white px-4 py-1 rounded">
              Instalar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
```

### Añadir al layout raíz

```typescript
// src/app/layout.tsx
import { PWAProvider } from '@/components/PWAProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <PWAProvider>
          {children}
        </PWAProvider>
      </body>
    </html>
  )
}
```

---

## 5. Generar Iconos PWA

```javascript
// scripts/generate-pwa-icons.mjs
import sharp from 'sharp'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '../public')

async function generateIcons() {
  const svgBuffer = readFileSync(join(publicDir, 'icon.svg'))

  await sharp(svgBuffer).resize(192, 192).png().toFile(join(publicDir, 'icons/icon-192.png'))
  await sharp(svgBuffer).resize(512, 512).png().toFile(join(publicDir, 'icons/icon-512.png'))
  await sharp(svgBuffer).resize(180, 180).png().toFile(join(publicDir, 'apple-touch-icon.png'))

  console.log('✅ PWA icons generated!')
}

generateIcons()
```

```bash
npm install -D sharp
node scripts/generate-pwa-icons.mjs
```

**Rutas requeridas:**
- `public/icons/icon-192.png` (192x192)
- `public/icons/icon-512.png` (512x512)
- `public/apple-touch-icon.png` (180x180)

---

## 6. APIs Avanzadas

### Push Notifications

```javascript
const permission = await Notification.requestPermission()
if (permission === 'granted') {
  const registration = await navigator.serviceWorker.ready
  await registration.showNotification('¡Nuevo mensaje!', {
    body: 'Tienes una nueva notificación',
    icon: '/icons/icon-192.png',
  })
}
```

### Background Sync

```javascript
navigator.serviceWorker.ready.then((registration) => {
  return registration.sync.register('sync-data')
})
```

### Web Share API

```javascript
if (navigator.share) {
  await navigator.share({
    title: 'Mi App',
    url: window.location.href
  })
}
```

---

## 7. Performance Targets

| Métrica | Target | Herramienta |
|---------|--------|-------------|
| First Contentful Paint | < 1.8s | Lighthouse |
| Largest Contentful Paint | < 2.5s | Lighthouse |
| Total Blocking Time | < 200ms | Lighthouse |
| PWA Score | 90+ | Lighthouse |
| Funciona offline | ✅ | DevTools → Network → Offline |

---

## 8. Checklist Pre-Lanzamiento

```
- [ ] manifest.ts configurado correctamente
- [ ] Service Worker registrado y funcionando (probar en producción)
- [ ] HTTPS habilitado
- [ ] Iconos: 192px, 512px, apple-touch-icon (180px)
- [ ] Página /offline personalizada
- [ ] Lighthouse PWA Score > 90
- [ ] Funciona en modo avión
- [ ] Prompt de instalación aparece
- [ ] Responsive: mobile (320px), tablet (768px), desktop (1920px+)
- [ ] Touch targets > 44x44px
- [ ] Carga < 3s en 4G
```

---

## 9. Debugging

### Verificar con Chrome DevTools

1. `Application` → `Manifest` → verificar sin errores
2. `Application` → `Service Workers` → verificar registrado
3. `Lighthouse` → Run PWA audit
4. `Network` → activar "Offline" → verificar página offline

### Problemas Comunes

| Problema | Causa | Solución |
|----------|-------|----------|
| SW no se registra | Sólo funciona en producción | `npm run build && npm start` |
| Manifest no carga | Ruta o formato incorrecto | Verificar `src/app/manifest.ts` |
| Offline no funciona | Fallback no configurado | Verificar ruta `/offline` en sw.ts |
| Install prompt no aparece | Sin HTTPS o criterios no cumplidos | Verificar HTTPS + visitas previas |

---

## Referencias

- [MDN PWA Guides](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps)
- [Serwist Documentation](https://serwist.pages.dev/)
- [PWA Builder (Microsoft)](https://www.pwabuilder.com/)
- [web.dev — What are PWAs?](https://web.dev/explore/progressive-web-apps)
