# Nucleo

> Tu segundo cerebro personal. Captura cualquier contenido, procesado con IA, recuperado en menos de 5 segundos.

---

## El problema

El conocimiento valioso se dispersa en 8+ plataformas — GitHub, X, Reddit, páginas web, chats de IA — y se pierde. Se re-busca lo que ya se encontró. Se re-pregunta lo que ya se respondió.

**Nucleo centraliza todo en un solo lugar:**
- Links, texto, markdown y comandos
- La IA genera título, resumen, categoría y tags automáticamente
- Búsqueda global que encuentra cualquier cosa en menos de 5 segundos

---

## Stack

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 16 + React 19 + TypeScript |
| Estilos | Tailwind CSS 3.4 (design system Notion Light) |
| Auth + DB | Supabase (Auth + PostgreSQL + RLS) |
| AI | OpenRouter (Claude Haiku) |
| Search | PostgreSQL `pg_trgm` full-text |
| Validación | Zod |
| Estado | Zustand |
| Deploy | Vercel |

---

## Arquitectura

```
src/
├── app/
│   ├── (auth)/          # login, signup
│   └── (main)/          # dashboard, workspace, item detail
├── features/
│   ├── auth/            # Login, Signup, Server Actions
│   ├── capture/         # CaptureDialog, detección de tipo, CTA
│   └── dashboard/       # ItemCard, FilterBar, ItemDetail, EditForm
└── lib/
    ├── supabase/        # client.ts + server.ts
    └── utils.ts         # cn()
```

**Patrón Feature-First:** cada feature tiene sus propios `components/`, `services/`, `types/` y `store/`. Sin dependencias circulares entre features.

---

## Setup local

**Prerequisitos:** Node.js 18+, cuenta Supabase, cuenta OpenRouter.

```bash
# 1. Clonar
git clone https://github.com/Carlos-Dominguez-faber/nucleo.git
cd nucleo

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tus credenciales

# 4. Crear el schema en Supabase
# Copiar y ejecutar el SQL de BLUEPRINT-nucleo.md → FASE 1 en el SQL Editor de Supabase

# 5. Arrancar
npm run dev
```

### Variables de entorno

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
OPENROUTER_API_KEY=sk-or-v1-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Estado del proyecto

El pipeline de planning está completo (Steps 0-8). La UI está implementada con datos mock. El backend real se construye siguiendo el Blueprint.

| Fase | Descripción | Estado |
|------|-------------|--------|
| F1 | Supabase setup + DB schema + auth real | ⏳ Pendiente |
| F2 | Items CRUD — conectar UI a DB | ⏳ Pendiente |
| F3 | AI pipeline — enriquecimiento async | ⏳ Pendiente |
| F4 | Organización — workspaces, folders, tags vivos | ⏳ Pendiente |
| F5 | Búsqueda global con pg_trgm | ⏳ Pendiente |
| F6 | PWA instalable + import de bookmarks | ⏳ Pendiente |
| F7 | Tests E2E + deploy a producción | ⏳ Pendiente |

Ver [BLUEPRINT-nucleo.md](BLUEPRINT-nucleo.md) para el plan detallado con SQL, tareas y comandos copy-paste.

---

## Documentación del producto

| Documento | Contenido |
|-----------|-----------|
| [PDR-nucleo.md](PDR-nucleo.md) | Problema, propuesta de valor, usuarios, flujo principal |
| [TECH-SPEC-nucleo.md](TECH-SPEC-nucleo.md) | Stack, DB schema, AI pipeline, decisiones técnicas |
| [USER-STORIES-nucleo.md](USER-STORIES-nucleo.md) | 31 user stories con acceptance criteria (P0/P1) |
| [DESIGN.md](DESIGN.md) | Design system completo — paleta, tipografía, componentes |
| [SECURITY-AUDIT-nucleo.md](SECURITY-AUDIT-nucleo.md) | Auditoría OWASP + fixes aplicados |
| [BLUEPRINT-nucleo.md](BLUEPRINT-nucleo.md) | Plan de construcción por fases |

---

## Comandos de desarrollo

```bash
npm run dev      # Dev server con Turbopack
npm run build    # Build de producción
npm run lint     # ESLint
```

---

## Licencia

MIT — ver [LICENSE](LICENSE).
