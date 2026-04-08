# Screen Flow — Auth

> **Epic:** 1 — Auth
> **Stories:** US-001 (Registro), US-002 (Login), US-003 (Logout), US-004 (Protección de rutas)
> **Layout:** `app/(auth)/layout.tsx` — centrado, sin shell, logo arriba
> **Device primario:** iPhone (safe-area respetada)

---

## UI Requirements extraídos

| Story | Pantallas necesarias | Datos | Acciones |
|-------|---------------------|-------|----------|
| US-001 | `/signup` | email, password | Crear cuenta, ir a login |
| US-002 | `/login` | email, password | Iniciar sesión, ir a signup, recordar último workspace |
| US-003 | — | — | Botón logout en sidebar (con confirmación) |
| US-004 | Middleware redirect | — | Redirect a `/login` si sesión inválida |

---

## Flow Diagram

```
[Entrada URL /] ─┬─ sesión válida ──→ [/w/:lastUsed]
                 └─ sin sesión ──────→ [/login]
                                          │
                                          ├─ "Registrarme" ──→ [/signup]
                                          │                       │
                                          │                       └─ success ──→ [/w/personal]
                                          │
                                          └─ submit ─ success ──→ [/w/:lastUsed]
                                                    └ error ─────→ [/login] (error inline)

[Sidebar] ─ Logout ─→ [Confirmación] ─ ok ─→ [/login]
```

---

## Pantalla 1 · `/login`

**Entry from:** URL directa, redirect de middleware, logout, link "Inicia sesión" desde `/signup`
**Story refs:** US-002

### Layout (mobile-first)

```
┌──────────────────────────┐
│                          │
│        [Logo Nucleo]     │
│                          │
│   Bienvenido de vuelta   │
│                          │
│   ┌────────────────────┐ │
│   │ Email              │ │
│   └────────────────────┘ │
│                          │
│   ┌────────────────────┐ │
│   │ Password      [👁] │ │
│   └────────────────────┘ │
│                          │
│   [ Iniciar sesión    ]  │ ← primary, full-width
│                          │
│   ¿No tienes cuenta?     │
│   Regístrate             │ ← link
│                          │
└──────────────────────────┘
```

### Data Displayed

| Elemento | Fuente | Formato |
|----------|--------|---------|
| Logo | asset estático | SVG, ~48px |
| Headline | literal | "Bienvenido de vuelta" |
| Inputs | estado local | email (type=email), password (type=password) |
| Link signup | literal | `/signup` |

### Actions

| Acción | Control | Resultado |
|--------|---------|-----------|
| Submit credenciales | Button primary (Enter o tap) | Loading → redirect `/w/:lastUsed` o error inline |
| Toggle visibilidad password | IconButton dentro del input | Cambia `type=password` ↔ `type=text`, icono 👁 ↔ 🙈 |
| Ir a signup | Link `Regístrate` | Navega a `/signup` |

### States

- **Default:** form vacío, submit disabled hasta tener email + password.
- **Loading:** botón con spinner, inputs disabled, texto "Iniciando sesión..."
- **Error — credenciales inválidas:** alert inline encima del form, rojo: "Email o contraseña incorrectos". Foco vuelve al email, password se limpia.
- **Error — servicio caído:** toast superior: "Servicio temporalmente no disponible. Intenta en unos minutos." Form preservado.
- **Error — campo vacío:** mensaje bajo el input: "Este campo es obligatorio", borde rojo, foco automático.
- **Success:** spinner breve → redirect (no se muestra success explícito).

### Componentes usados

- `Button` (shadcn)
- `Input` (shadcn)
- `Label` (shadcn)
- `Form` (shadcn — react-hook-form + zod)
- `Alert` (shadcn) para errores
- `PasswordInput` (**nuevo** — ver components/PasswordInput.md)

---

## Pantalla 2 · `/signup`

**Entry from:** Link "Regístrate" desde `/login`, URL directa
**Story refs:** US-001

### Layout

Idéntico a `/login` pero:
- Headline: "Crea tu segundo cerebro"
- CTA: "Crear cuenta"
- Footer link: "¿Ya tienes cuenta? **Inicia sesión**"

### Data Displayed

| Elemento | Fuente | Formato |
|----------|--------|---------|
| Headline | literal | "Crea tu segundo cerebro" |
| Helper text | literal | "Usa un email y password seguros. Los datos son solo tuyos." |

### Actions

| Acción | Control | Resultado |
|--------|---------|-----------|
| Submit registro | Button primary | Crea cuenta + 2 workspaces default (Personal, Trabajo) + redirect `/w/:personalId` |
| Ir a login | Link | Navega a `/login` |

### States

- **Default:** form vacío.
- **Loading:** "Creando cuenta..."
- **Error — email ya existe:** inline bajo email: "Ya existe una cuenta con este email". Link sugerido: "¿Iniciar sesión?"
- **Error — email inválido:** "Ingresa un email válido"
- **Error — password corto:** "La contraseña debe tener al menos 8 caracteres"
- **Error — Supabase falla:** toast: "No pudimos crear tu cuenta. Intenta nuevamente."
- **Success:** redirect directo a workspace Personal (sin pantalla intermedia — el grid con empty state es el onboarding).

---

## Pantalla 3 · Logout (desde sidebar)

**Entry from:** Click en "Logout" en el footer del sidebar
**Story refs:** US-003

### Layout

Dialog modal centrado:

```
┌───────────────────────────────┐
│  ¿Cerrar sesión?              │
│                               │
│  Tendrás que volver a iniciar │
│  sesión la próxima vez.       │
│                               │
│  [ Cancelar ]  [ Cerrar ses.] │
└───────────────────────────────┘
```

### Actions

| Acción | Control | Resultado |
|--------|---------|-----------|
| Confirmar | Button destructive | Invalida sesión + redirect `/login` |
| Cancelar | Button outline | Cierra dialog, vuelve al estado anterior |

### States

- **Default:** dialog abierto.
- **Loading:** "Cerrando sesión..." (muy breve)
- **Success:** redirect a `/login`.

---

## Ruta 4 · Middleware de protección

**Story refs:** US-004
**No es pantalla** — es lógica en `middleware.ts` de Next.js con `@supabase/ssr`.

### Comportamiento observable

| Request | Sesión | Redirect |
|---------|--------|----------|
| `/w/*` | válida | permite |
| `/w/*` | inválida | → `/login?next=<path>` |
| `/login`, `/signup` | válida | → `/w/:lastUsed` |
| `/login`, `/signup` | inválida | permite |
| `/` | válida | → `/w/:lastUsed` |
| `/` | inválida | → `/login` |

---

## Acceptance Targets

### `/login`
- [ ] `[data-testid="login-form"]` presente
- [ ] Input `name="email"` tipo `email`, required
- [ ] Input `name="password"` tipo `password`, required
- [ ] Button type=submit contiene texto "Iniciar sesión"
- [ ] Submit con credenciales inválidas → alert con texto "Email o contraseña incorrectos"
- [ ] Submit con campo vacío → mensaje "Este campo es obligatorio" bajo el campo
- [ ] Toggle de visibilidad cambia atributo `type` del input
- [ ] Enter dentro de cualquier input dispara submit
- [ ] Submit exitoso → URL cambia a `/w/:id` en < 2s
- [ ] En iOS standalone, el teclado virtual no tapa el botón submit (scroll into view)

### `/signup`
- [ ] Submit exitoso crea 2 workspaces ("Personal", "Trabajo") verificables en DB
- [ ] Redirect post-signup apunta al workspace "Personal"
- [ ] Email duplicado → mensaje específico con link a login
- [ ] Password < 8 chars → mensaje específico, submit bloqueado

### Logout
- [ ] Click en "Logout" abre dialog de confirmación (no logout directo)
- [ ] Confirmar elimina cookie de sesión (verificable)
- [ ] Post-logout, navegar a `/w/:id` redirige a `/login`

### Middleware
- [ ] Sin sesión + `/w/abc` → `/login?next=/w/abc`
- [ ] Con sesión + `/login` → `/w/:lastUsed`
- [ ] Sesión expirada mid-navegación → siguiente request redirige a `/login`

---

## Notas para el Skill #8 (UI)

- **Fondo del layout auth:** neutro, no heroico. Es una herramienta interna — no hay marketing.
- **Logo:** usar el asset que ya exista en `assets/`. Si no existe, placeholder simple (texto "Nucleo" con monospace o typeface distintiva).
- **Formularios:** usar `react-hook-form` + `zodResolver` — los schemas de validación viven en `src/features/auth/services/schemas.ts`.
- **Password toggle:** el icono debe ser 44x44px mínimo para tap en iPhone.
- **Auto-focus:** al cargar `/login`, foco en input email automáticamente (excepto si hay `next=` en query, donde puede haber teclado ya mostrado).
