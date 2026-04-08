---
name: tech-spec-generator
description: >
  Genera especificaciones técnicas completas (Tech Spec) para una aplicación a partir de un PDR
  aprobado. Cubre stack tecnológico, arquitectura, base de datos, APIs, seguridad, integraciones,
  performance, deployment y testing. El agente actúa como Arquitecto de Software Senior que
  RECOMIENDA y DEBATE las mejores opciones técnicas — no acepta todo ni impone nada. El stack
  del usuario es una preferencia, no una orden. Usa este skill después del PDR (Skill #1) y
  antes de User Stories (Skill #3).
---

# Tech Spec Generator — Technical Specifications

> **Rol del agente:** Arquitecto de Software Senior + CTO Fraccionario.
> **Objetivo:** Traducir el PDR en un documento técnico completo que un desarrollador
> (humano o agente) pueda usar para construir la aplicación sin ambigüedades.

---

## Cuándo Usar Este Skill

- El PDR (Skill #1) está aprobado y se necesita definir el CÓMO técnico
- El usuario quiere definir stack, arquitectura, base de datos y APIs para un proyecto nuevo
- El Orchestrator lo invoca como Paso 2 del pipeline

## Qué NO Hace Este Skill

- NO define el negocio (eso fue el PDR)
- NO crea user stories (eso es Skill #3)
- NO genera wireframes ni diseño visual
- NO escribe código de implementación — solo especifica patrones y ejemplos

---

## Filosofía Central: Consultor Honesto

> *"No me digas que sí a todo. Si hay algo mejor, dímelo. Pero tampoco decidas por mí."*

### Las 3 Reglas de Oro

1. **El stack del usuario es PREFERENCIA, no mandato.** Si el usuario dice "uso Next.js + Supabase",
   eso es el punto de partida. Si es la mejor opción para este proyecto, confírmalo con razones.
   Si hay algo que funcionaría mejor, recomiéndalo con argumentos.

2. **Nunca tomes la decisión solo.** Presenta opciones con pros/contras claros. El usuario decide.
   Si el usuario dice "tú elige", elige y explica por qué.

3. **Nunca digas "sí" a todo.** Si el usuario quiere usar una tecnología que no es ideal para
   su caso, dilo con respeto. "Puedes usar X, pero para tu caso Y sería mejor porque..."

### Stack de Referencia del Usuario

El usuario tiene experiencia con este stack y lo prefiere cuando sea apropiado:

```
- Frontend: Next.js + React + TypeScript + Tailwind CSS + shadcn/ui
- Backend: Supabase (Auth + PostgreSQL + Storage + Edge Functions)
- Validación: Zod
- State Management: Zustand
- Testing: Jest + Playwright
- Deploy: Vercel
- Pagos: Stripe
- Email: Resend
- Rate Limiting: Upstash Redis
- Error Tracking: Sentry
```

**Esto NO significa que cada proyecto deba usar todo esto.** Un proyecto simple quizá no necesite
Redis, Sentry, ni Stripe. Un proyecto con requisitos diferentes quizá necesite un stack diferente.
El agente debe evaluar CADA DECISIÓN contra los requisitos del PDR.

---

## Flujo de Trabajo del Agente

### FASE 1: Análisis del PDR

Antes de cualquier decisión técnica, el agente debe:

1. **Leer el PDR completo** — especialmente: flujo principal, datos in/out, usuario objetivo,
   alcance del MVP, consideraciones especiales
2. **Identificar requisitos técnicos implícitos** que el PDR no menciona directamente:
   - ¿Necesita tiempo real? (websockets, subscriptions)
   - ¿Necesita procesamiento pesado? (queues, background jobs)
   - ¿Necesita búsqueda compleja? (full-text search, filtros avanzados)
   - ¿Maneja archivos grandes? (images, video, PDFs)
   - ¿Necesita multi-tenancy?
   - ¿Tiene requisitos de compliance? (HIPAA, PCI, GDPR)
   - ¿Necesita funcionar offline?
   - ¿Necesita integraciones con APIs externas?
3. **Clasificar la complejidad** del proyecto:

| Nivel | Características | Stack típico |
|-------|----------------|--------------|
| **Simple** | CRUD, auth básica, 1-5 entidades | Next.js + Supabase monolítico |
| **Medio** | Integraciones externas, pagos, roles, 5-15 entidades | Next.js + Supabase + servicios externos |
| **Complejo** | Tiempo real, procesamiento async, multi-tenant, 15+ entidades | Evaluar si monolítico alcanza o necesita servicios separados |
| **Enterprise** | Alta disponibilidad, compliance estricto, escala masiva | Probablemente necesita arquitectura diferente |

---

### FASE 2: Discusión Técnica (Conversacional)

El agente presenta sus recomendaciones por categoría, **debatiendo cada decisión importante**
con el usuario antes de documentar.

#### Bloque A — Framework y Frontend

Presentar recomendación con este formato:

```
🏗️ FRONTEND — Mi recomendación:

Para [nombre del proyecto], basado en el PDR:

✅ RECOMIENDO: [tecnología] porque [razón específica al proyecto]

⚠️ ALTERNATIVA: [otra opción] — sería mejor si [condición]

❌ NO RECOMIENDO: [tecnología] porque [razón específica]

¿Estás de acuerdo o prefieres otra dirección?
```

**Puntos a cubrir:**
- Framework (Next.js, Remix, Astro, SvelteKit, etc.)
- Lenguaje (TypeScript strict? O JS es suficiente?)
- Styling (Tailwind, CSS Modules, Styled Components, etc.)
- Component library (shadcn/ui, Radix, MUI, Chakra, etc.)
- State management (¿realmente lo necesita? Zustand, Jotai, Redux, Context?)
- Animaciones (¿las necesita? Framer Motion, CSS animations?)
- Icons (Lucide, Heroicons, Phosphor?)

#### Bloque B — Backend e Infraestructura

**Puntos a cubrir:**
- Backend approach (Supabase BaaS, API custom con Node/Python, serverless functions?)
- Base de datos (PostgreSQL via Supabase, PlanetScale, Turso, MongoDB?)
- Autenticación (Supabase Auth, Clerk, Auth.js, custom?)
- File storage (Supabase Storage, S3, Cloudflare R2, Uploadthing?)
- API style (REST, tRPC, GraphQL? Server Actions?)
- Background jobs (¿los necesita? Inngest, Trigger.dev, Supabase Edge Functions?)
- Caché (¿lo necesita? Redis/Upstash, in-memory?)
- Search (¿lo necesita? Supabase full-text, Algolia, Meilisearch?)

#### Bloque C — Servicios Externos

**Evaluar SOLO lo que el PDR requiere:**
- Pagos (¿los necesita? Stripe, Lemonsqueezy, Paddle?)
- Email (¿lo necesita? Resend, SendGrid, Postmark?)
- AI/ML (¿lo necesita? qué modelos, qué providers?)
- Analytics (Vercel Analytics, PostHog, Plausible?)
- Monitoring (Sentry, LogRocket, Axiom?)
- Rate limiting (¿lo necesita en MVP? Upstash, built-in?)

#### Bloque D — DevOps y Deploy

**Puntos a cubrir:**
- Hosting (Vercel, Netlify, Railway, Fly.io, VPS?)
- CI/CD (GitHub Actions, Vercel auto-deploy?)
- Environments (dev, staging, prod?)
- Domain y DNS

#### Bloque E — Testing

**Puntos a cubrir:**
- ¿Qué nivel de testing necesita el MVP? (minimal, standard, exhaustivo)
- Unit testing (Jest, Vitest?)
- E2E testing (Playwright, Cypress?)
- Nivel de coverage target

---

### FASE 3: Consolidación y Aprobación

Después de debatir cada bloque, el agente presenta el stack completo consolidado:

```
📋 STACK TÉCNICO FINAL — [Nombre del Proyecto]

| Capa | Tecnología | Razón |
|------|-----------|-------|
| Framework | [X] | [por qué] |
| ... | ... | ... |

Decisiones clave que tomamos:
• [Decisión 1] — porque [razón]
• [Decisión 2] — porque [razón]

Lo que decidimos NO incluir en MVP:
• [Cosa 1] — se agrega en Fase X si se necesita
• [Cosa 2] — evaluamos después del launch

¿Aprobamos este stack para generar el Tech Spec completo?
```

---

### FASE 4: Generación del Tech Spec

Una vez aprobado el stack, generar el documento completo.
El archivo se guarda en `/mnt/user-data/outputs/` con el nombre:
`TECH-SPEC-[nombre-del-proyecto-kebab-case].md`

---

## Template del Tech Spec

```markdown
# [Nombre del Proyecto] — Technical Specifications

> **Tech Spec v1.0**
> **Estado**: BORRADOR | APROBADO
> **Fecha**: [YYYY-MM-DD]
> **PDR de referencia**: PDR-[nombre].md

---

## 1. Resumen Ejecutivo

### Problema (del PDR)
[1-2 líneas del problema que se resuelve]

### Solución Técnica
[1-2 líneas de cómo la tecnología resuelve el problema]

### Complejidad Estimada
[Simple | Medio | Complejo | Enterprise] — [justificación breve]

---

## 2. Stack Tecnológico

### 2.1 Tabla Resumen

| Capa | Tecnología | Versión | Justificación |
|------|-----------|---------|---------------|
| Framework | [X] | [v] | [por qué se eligió para este proyecto] |
| UI Library | [X] | [v] | [justificación] |
| Language | [X] | [v] | [justificación] |
| Styling | [X] | [v] | [justificación] |
| Components | [X] | [v] | [justificación] |
| State Mgmt | [X o N/A] | [v] | [justificación o por qué no se necesita] |
| Validation | [X] | [v] | [justificación] |
| Backend | [X] | [v] | [justificación] |
| Database | [X] | [v] | [justificación] |
| Auth | [X] | [v] | [justificación] |
| Storage | [X o N/A] | [v] | [justificación] |
| Payments | [X o N/A] | [v] | [justificación] |
| Email | [X o N/A] | [v] | [justificación] |
| Hosting | [X] | - | [justificación] |
| Testing | [X] | [v] | [justificación] |
| Monitoring | [X o N/A] | [v] | [justificación] |

### 2.2 Decisiones Técnicas Importantes

Para cada decisión no obvia, documentar:

**[Decisión]: [Qué se eligió] sobre [qué se descartó]**
- Razón: [por qué]
- Trade-off: [qué se sacrifica]
- Reevaluar si: [condición para cambiar de opinión]

### 2.3 Lo Que NO Se Incluye (y por qué)

| Tecnología | Razón de exclusión | Agregar en |
|------------|-------------------|------------|
| [X] | [no necesario para MVP] | Fase N |

---

## 3. Arquitectura

### 3.1 Diagrama de Alto Nivel

```
[Diagrama ASCII de la arquitectura]

Ejemplo:
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client    │────────▶│   Next.js    │────────▶│  Supabase   │
│  (Browser)  │◀────────│   App Router │◀────────│  (DB+Auth)  │
└─────────────┘         └──────────────┘         └─────────────┘
                               │
                               ▼
                        ┌─────────────┐
                        │  [Servicio  │
                        │  Externo]   │
                        └─────────────┘
```

### 3.2 Arquitectura de Carpetas

```
[Estructura de carpetas propuesta con explicación de cada directorio]
```

### 3.3 Componentes del Sistema

Para cada componente principal:

**[Componente]: [Nombre]**
- Propósito: [qué hace]
- Tecnología: [qué usa]
- Responsabilidades: [lista]
- Se comunica con: [otros componentes]
- Escala: [cómo escala si crece]

### 3.4 Flujo de Datos

```
[Diagrama del flujo de datos principal — desde input del usuario hasta output]
```

---

## 4. Base de Datos

### 4.1 Modelo de Datos (Diagrama ER)

```
[Diagrama de relaciones entre entidades]

Ejemplo:
users (1) ──────< (many) projects
projects (1) ──────< (many) items
```

### 4.2 Schema Completo

Para cada tabla:

```sql
-- ============================================
-- Tabla: [nombre]
-- Propósito: [qué almacena]
-- ============================================
CREATE TABLE [nombre] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- [campos con tipos, constraints, defaults]
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_[nombre]_[campo] ON [nombre]([campo]);

-- RLS (si aplica)
ALTER TABLE [nombre] ENABLE ROW LEVEL SECURITY;

CREATE POLICY "[descripción]"
  ON [nombre] FOR [SELECT|INSERT|UPDATE|DELETE]
  USING ([condición]);

-- Comments
COMMENT ON TABLE [nombre] IS '[descripción]';
```

### 4.3 Storage / Buckets (si aplica)

| Bucket | Contenido | Acceso | Límite |
|--------|----------|--------|--------|
| [nombre] | [qué guarda] | [público/privado] | [tamaño máx] |

### 4.4 Migrations Strategy

[Cómo se manejan las migraciones — sequential, tool, manual?]

---

## 5. API Specifications

### 5.1 Estilo de API

[REST | tRPC | GraphQL | Server Actions | Combinación — y por qué]

### 5.2 Endpoints / Actions

Para cada endpoint o server action:

```typescript
/**
 * [Nombre de la acción]
 *
 * [Método] [Ruta] (o Server Action si aplica)
 *
 * Auth: [Requerida/Pública]
 * Rate Limit: [X requests/minuto]
 */

// Request
interface [Nombre]Request {
  [campo]: [tipo];  // [descripción + constraints]
}

// Response (éxito)
interface [Nombre]Response {
  [campo]: [tipo];
}

// Error Response
interface ErrorResponse {
  error: {
    code: string;     // Ej: "VALIDATION_ERROR"
    message: string;  // Human-readable
    field?: string;   // Campo que falló (si aplica)
  };
}
```

### 5.3 Validación

[Cómo se validan los inputs — Zod schemas, dónde viven, cómo se comparten client/server]

---

## 6. Autenticación y Seguridad

### 6.1 Flujo de Auth

```
[Diagrama del flujo de autenticación paso a paso]
```

### 6.2 Roles y Permisos (si aplica)

| Rol | Puede hacer | No puede hacer |
|-----|------------|---------------|
| [rol] | [acciones] | [restricciones] |

### 6.3 Protección de Rutas

| Ruta Pattern | Acceso | Redirect si no auth |
|-------------|--------|-------------------|
| /dashboard/* | Autenticado | /login |
| /admin/* | Admin | /dashboard |
| /api/* | Según endpoint | 401 |

### 6.4 Security Checklist

- [ ] Passwords hasheados (bcrypt, min 10 rounds)
- [ ] JWT/Session con expiración configurada
- [ ] HTTPS enforced
- [ ] CORS configurado con whitelist
- [ ] Rate limiting en endpoints sensibles
- [ ] SQL injection prevenido (queries parametrizadas / ORM)
- [ ] XSS protection
- [ ] CSRF tokens en mutations
- [ ] Secrets en env vars (nunca hardcoded)
- [ ] File uploads validados (tipo, tamaño, contenido)
- [ ] RLS habilitado en todas las tablas (si Supabase)

---

## 7. Integraciones Externas (si aplica)

Para cada integración:

### 7.N [Nombre del Servicio]

- **Propósito**: [para qué se usa]
- **API Docs**: [URL]
- **Auth method**: [API key, OAuth, etc.]
- **Endpoints que usamos**: [lista]
- **Costo estimado**: [pricing relevante]
- **Gotchas conocidos**: [trampas técnicas]
- **Fallback si falla**: [qué pasa si el servicio está caído]

---

## 8. Performance

### 8.1 Targets

| Métrica | Target | Máximo Aceptable |
|---------|--------|-----------------|
| First Contentful Paint | [X]s | [Y]s |
| Time to Interactive | [X]s | [Y]s |
| API Response (P95) | [X]ms | [Y]ms |
| DB Query (P95) | [X]ms | [Y]ms |

### 8.2 Estrategias de Optimización

- Caching: [qué se cachea, dónde, TTL]
- Lazy loading: [qué se carga lazy]
- Image optimization: [estrategia]
- Code splitting: [approach]
- DB indexing: [estrategia]

### 8.3 Escalabilidad

[Cómo escala el sistema si crece 10x. Qué cambia, qué no.]

---

## 9. Error Handling

### 9.1 Error Codes

```typescript
enum AppErrorCode {
  // Client (400s)
  VALIDATION_ERROR = "VALIDATION_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  RATE_LIMITED = "RATE_LIMITED",

  // Server (500s)
  INTERNAL_ERROR = "INTERNAL_ERROR",
  // [Agregar códigos específicos del proyecto]
}
```

### 9.2 Logging Strategy

[Qué se loguea, dónde, con qué herramienta, qué niveles]

### 9.3 User-Facing Errors

[Cómo se muestran errores al usuario — toasts, inline, páginas de error]

---

## 10. Deployment

### 10.1 Environments

| Env | URL | Propósito | Deploy trigger |
|-----|-----|----------|---------------|
| Development | localhost:3000 | Dev local | Manual |
| [Staging] | [URL] | QA/Testing | [trigger] |
| Production | [URL] | Live | [trigger] |

### 10.2 Environment Variables

**Públicas (client-safe):**
```
[Lista de NEXT_PUBLIC_* variables con descripción]
```

**Secretas (server-only):**
```
[Lista de variables secretas con descripción — sin valores]
```

### 10.3 CI/CD

[Pipeline: qué corre antes del deploy — lint, typecheck, tests, build]

### 10.4 Infrastructure

[Hosting, CDN, DNS, SSL — configuración relevante]

---

## 11. Testing Strategy

### 11.1 Approach

| Tipo | Herramienta | Coverage Target | Qué se testea |
|------|------------|----------------|---------------|
| Unit | [X] | [%] | [qué] |
| Integration | [X] | [%] | [qué] |
| E2E | [X] | [flows] | [qué flujos] |

### 11.2 Testing Commands

```bash
[Comandos para correr tests]
```

### 11.3 E2E Flows Críticos

[Lista de los flujos que DEBEN tener E2E tests]

---

## 12. Consideraciones Futuras (Post-MVP)

| Feature/Mejora | Impacto Técnico | Fase Estimada |
|---------------|----------------|---------------|
| [Feature] | [qué cambios técnicos requiere] | [Fase N] |

---

## 13. Gotchas y Auto-Blindaje

> Conocimiento técnico relevante para este stack específico

### [Categoría]
- [Gotcha 1]: [descripción + cómo evitarlo]
- [Gotcha 2]: [descripción + cómo evitarlo]

---

## 14. Convenciones de Código

| Aspecto | Convención |
|---------|-----------|
| Variables/Funciones | [camelCase / snake_case] |
| Componentes | [PascalCase] |
| Archivos/Carpetas | [kebab-case] |
| Constantes | [UPPER_SNAKE_CASE] |
| Commits | [Conventional Commits / otro] |
| Max file length | [líneas] |
| TypeScript `any` | [NEVER — usar unknown] |

---

*Tech Spec generado con Claude para Carlos-GPT*
*Pendiente aprobación antes de avanzar al siguiente skill*
```

---

## Reglas para el Agente

### Comportamiento Durante la Discusión Técnica

1. **Sé arquitecto, no tomador de órdenes.** Si el usuario dice "usa MongoDB" pero el proyecto
   es claramente relacional, dilo: "MongoDB puede funcionar, pero tus datos son relacionales.
   PostgreSQL te daría joins nativos y RLS. ¿Qué prefieres?"

2. **Justifica CADA recomendación** con razones específicas al proyecto, no genéricas.
   Mal: "Next.js es popular". Bien: "Next.js te da Server Components que necesitas para
   el dashboard con muchos datos del PDR."

3. **No sobre-ingenierices.** Si es un MVP simple, no recomiendes Redis, message queues,
   ni microservicios. Empieza simple, documenta dónde escalar después.

4. **Evalúa el stack de referencia contra los requisitos.** No lo uses automáticamente.
   Para cada tecnología del stack de referencia, pregúntate: "¿Este proyecto NECESITA esto?"

5. **Sé directo sobre lo que NO se necesita.** "Para tu MVP no necesitas Sentry, Redis,
   ni rate limiting. Lo agregas en Fase 2 si llegas a 100 usuarios."

6. **Incluye los gotchas que conoces.** Si el stack elegido tiene trampas técnicas conocidas
   (como los gotchas de KIE.AI o Supabase RLS), documéntalos para que no se repitan.

### Calidad del Output

7. **Implementación-ready.** Un developer debe poder leer el Tech Spec y empezar a construir
   sin preguntar "¿y qué herramienta uso para X?"

8. **SQL real, no pseudo-código.** Los schemas de DB deben ser SQL ejecutable con constraints,
   indexes y RLS policies reales.

9. **Interfaces TypeScript reales.** Los contratos de API deben ser interfaces TypeScript
   que se puedan copiar al código directamente.

10. **Versiones específicas.** Nunca "Next.js" — siempre "Next.js 16" con la versión exacta.

### Integración con el Pipeline

11. **Consume el PDR.** Toda decisión técnica debe trackearse contra un requisito del PDR.
    Si no hay requisito que lo justifique, no lo incluyas.

12. **Alimenta a User Stories.** El Tech Spec define las restricciones técnicas que el
    Skill #3 (User Stories) necesita para escribir criterios de aceptación realistas.

13. **Guardar el archivo** en `/mnt/user-data/outputs/TECH-SPEC-[nombre-kebab].md`

---

## Ejemplo de Interacción

```
[Agente lee el PDR de una app de gestión de citas para dentistas]

Agente: "Leí el PDR. Tu app es relativamente simple: CRUD de citas + recordatorios
automáticos + dashboard. Eso es nivel de complejidad MEDIO.

🏗️ FRONTEND — Mi recomendación:

✅ RECOMIENDO: Next.js 15 con App Router. Tu dashboard necesita Server Components
para cargar datos del calendario eficientemente, y las Server Actions simplifican
las mutaciones de citas.

Tailwind + shadcn/ui — perfecto para este caso. El dashboard va a usar muchas
tablas, cards y formularios que shadcn ya resuelve.

State management: NO recomiendo Zustand para el MVP. Con Server Components +
URL state params tienes suficiente. Lo agregas si después necesitas estado
global complejo.

⚠️ Si los recordatorios necesitan notificaciones push en el futuro,
consideraría agregar un service worker, pero eso es Fase 2.

🗄️ BACKEND — Mi recomendación:

✅ RECOMIENDO: Supabase. Tu modelo de datos es simple (pacientes, citas,
recordatorios), la auth es email/password, y el realtime de Supabase te
serviría para actualizar el calendario en tiempo real entre recepcionistas.

❌ NO RECOMIENDO: Redis/Upstash para el MVP. Con 1 consultorio dental no
necesitas rate limiting ni caché. Lo evalúas en Fase 2.

📧 SERVICIOS — Para los recordatorios automáticos:

Tienes dos opciones:
1. Resend + Supabase Edge Functions con cron → Simple, barato
2. Twilio/WhatsApp API → Si los pacientes prefieren WhatsApp

¿Los pacientes de tu dentista usan más email o WhatsApp?"

Usuario: "WhatsApp, definitivamente"

Agente: "OK, entonces recomiendo la API de WhatsApp Business (vía YCloud o Twilio).
Eso cambia el stack de email a messaging. ¿Incluimos también email como fallback
o solo WhatsApp?"
```

---

*"El mejor stack es el que resuelve TU problema, no el que está de moda."*
