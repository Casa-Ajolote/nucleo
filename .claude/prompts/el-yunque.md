# El Yunque — Motor de Ejecución Forge

> *"No planifiques lo que no entiendes. Mapea contexto, luego planifica."*

El modo BLUEPRINT es para sistemas complejos que requieren construcción por fases con mapeo de contexto just-in-time.

---

## 🎯 Cuándo Usar BLUEPRINT

- [ ] La tarea requiere múltiples componentes coordinados
- [ ] Involucra cambios en DB + código + UI
- [ ] Tiene fases que dependen una de otra
- [ ] Requiere entender contexto antes de implementar
- [ ] El sistema final tiene múltiples partes integradas

### Ejemplos de Tareas BLUEPRINT

```
✅ "Sistema de autenticación con roles y permisos"
✅ "Feature de notificaciones en tiempo real"
✅ "Dashboard con métricas y gráficos"
✅ "Sistema de facturación con Stripe"
✅ "CRUD completo de productos con imágenes"
✅ "Migración de arquitectura de componentes"

🤖 AI Features:
✅ "Chat conversacional con streaming y memoria entre sesiones"
✅ "RAG sobre documentación interna con pgvector"
✅ "Chat with PDF — el usuario sube archivos y los interroga"
✅ "Pipeline de extracción de datos de contratos con generateObject"
✅ "Coach personalizado que recuerda preferencias y contexto del usuario"
```

---

## 🔑 La Innovación Clave: Mapeo de Contexto Just-In-Time

### ❌ El Problema del Enfoque Tradicional

```
Recibir problema
    ↓
Generar TODAS las tareas y subtareas
    ↓
Ejecutar linealmente
```

**Problema**: Las subtareas se generan basándose en SUPOSICIONES, no en contexto real.

### ✅ El Enfoque BLUEPRINT

```
Recibir problema
    ↓
Generar solo FASES (sin subtareas)
    ↓
ENTRAR en Fase 1
    ↓
MAPEAR contexto real de Fase 1
    ↓
GENERAR subtareas basadas en contexto REAL
    ↓
Ejecutar Fase 1
    ↓
ENTRAR en Fase 2
    ↓
MAPEAR contexto (incluyendo lo construido en Fase 1)
    ↓
GENERAR subtareas de Fase 2
    ↓
... repetir ...
```

**Ventaja**: Cada fase se planifica con información REAL del estado actual del sistema.

---

## 🔄 El Flujo BLUEPRINT Completo

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  PASO 1: DELIMITAR Y DESCOMPONER EN FASES                   │
│                                                             │
│  • Entender el problema FINAL completo                      │
│  • Romper en FASES ordenadas cronológicamente               │
│  • Identificar dependencias entre fases                     │
│  • ⚠️ NO generar subtareas todavía                          │
│  • Usar TodoWrite para registrar las fases                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  PASO 2: ENTRAR EN FASE N - MAPEAR CONTEXTO                 │
│                                                             │
│  ANTES de generar subtareas, explorar:                      │
│                                                             │
│  📁 Codebase:                                               │
│     • ¿Qué archivos/componentes existen relacionados?       │
│     • ¿Qué patrones usa el proyecto actualmente?            │
│     • ¿Hay código que puedo reutilizar?                     │
│                                                             │
│  🗄️ Base de Datos (Supabase MCP):                           │
│     • ¿Qué tablas existen?                                  │
│     • ¿Qué estructura tienen?                               │
│     • ¿Hay RLS policies configuradas?                       │
│                                                             │
│  🔗 Dependencias:                                           │
│     • ¿Qué construí en fases anteriores?                    │
│     • ¿Qué puedo asumir que ya existe?                      │
│     • ¿Qué restricciones tengo?                             │
│                                                             │
│  🤖 Si la feature es de IA (además del mapeo base):         │
│     • ¿La Pieza indica el subtipo? (A/B/C/D/E)               │
│       → A: Chat · B: RAG · C: Chat con Docs                 │
│       → D: Memoria · E: Generación Estructurada             │
│     • ¿Existen rutas de IA previas en el proyecto?          │
│       Grep: src/features/*/api/route.ts                     │
│     • ¿Hay shared/lib/embeddings.ts o rate-limit.ts?        │
│     • Variables de entorno presentes en .env.local:         │
│       → OPENROUTER_API_KEY (generación — siempre)           │
│       → OPENAI_API_KEY (embeddings — solo si B/C/D)         │
│       → UPSTASH_REDIS_REST_URL (rate limiting)              │
│     • Para subtipo B, C o D — verificar pgvector:           │
│       execute_sql("SELECT extname FROM pg_extension          │
│       WHERE extname = 'vector'") → debe retornar 1 fila     │
│     • Cargar el asset de patrón correspondiente:            │
│       B → rag-pattern.md · C → chat-with-docs.md            │
│       D → memory-pattern.md                                 │
│                                                             │
│  DESPUÉS de mapear, generar subtareas específicas           │
│  y actualizar TodoWrite                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  PASO 3: EJECUTAR SUBTAREAS DE LA FASE                      │
│                                                             │
│  WHILE subtareas pendientes en fase actual:                 │
│                                                             │
│    1. Marcar subtarea como in_progress en TodoWrite         │
│                                                             │
│    2. Ejecutar la subtarea                                  │
│                                                             │
│    3. [Dinámico] Usar MCPs si el juicio lo indica:          │
│       • 🧠 Next.js MCP → Ver errores en tiempo real         │
│       • 👁️ Playwright → Validar visualmente                 │
│       • 🗄️ Supabase → Consultar/modificar DB                │
│                                                             │
│    4. Validar resultado                                     │
│       • Si hay error → AUTO-BLINDAJE (ver paso 3.5)           │
│       • Si está bien → Marcar completed                     │
│                                                             │
│    5. Siguiente subtarea                                    │
│                                                             │
│  Fase completada cuando todas las subtareas done ✅          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  PASO 3.5: AUTO-BLINDAJE (cuando hay errores)              │
│                                                             │
│  El sistema se BLINDA con cada error. Cuando algo falla:       │
│                                                             │
│  1. ARREGLA el código                                       │
│  2. TESTEA que funcione                                     │
│  3. DOCUMENTA el aprendizaje:                               │
│     • En la Pieza actual (sección "Aprendizajes")             │
│     • O en el prompt relevante (.claude/prompts/*.md)       │
│  4. Continúa con la subtarea                                │
│                                                             │
│  Ejemplo:                                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Error: "Chart.js falla en SSR"                      │    │
│  │ Fix: Usar dynamic import con ssr: false             │    │
│  │ Documenta en la Pieza:                                   │    │
│  │   "APRENDIZAJE: Chart.js requiere dynamic import"   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  El conocimiento persiste. El mismo error NUNCA ocurre      │
│  dos veces en este proyecto ni en proyectos futuros.        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  PASO 4: TRANSICIÓN A SIGUIENTE FASE                        │
│                                                             │
│  • Confirmar que fase actual está REALMENTE completa        │
│  • NO asumir que todo salió como se planeó                  │
│                                                             │
│  📋 KANBAN UPDATE (si KANBAN.md existe):                    │
│  • Mover stories completadas en esta fase a su nueva        │
│    columna (Dev → QA, QA → Review, Review → Done)           │
│  • Actualizar metricas de progreso en KANBAN.md             │
│  • Regenerar .claude/reports/kanban-board.html              │
│  • Si KANBAN.md NO existe: ignorar silenciosamente          │
│                                                             │
│  📝 MEMORY UPDATE (siempre):                                 │
│  • Actualizar `.claude/memory/` via memory-manager skill     │
│  • Registrar: fase completada, decisiones tomadas,          │
│    blockers resueltos, contexto para próxima sesión          │
│  • Si es nueva sesión: leer `.claude/memory/MEMORY.md`      │
│    PRIMERO en PASO 2                                         │
│  • Ver `.claude/skills/memory-manager/SKILL.md` para        │
│    protocolo completo                                        │
│                                                             │
│  • Volver a PASO 2 con la siguiente fase                    │
│  • El contexto ahora INCLUYE lo construido                  │
│                                                             │
│  Repetir hasta completar todas las fases                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  PASO 5: VALIDACIÓN FINAL                                   │
│                                                             │
│  • Testing end-to-end del sistema completo                  │
│  • Validación visual con Playwright si aplica               │
│  • Confirmar que el problema ORIGINAL está resuelto         │
│                                                             │
│  📐 Quality Gates (antes de reportar al usuario):           │
│  • `/critique` → Evaluar diseño UI contra AI slop           │
│    (usa skills/impeccable/SKILL.md)                         │
│  • `/web-audit` → Auditar Performance, A11y, SEO            │
│    (usa skills/web-quality/SKILL.md)                        │
│  • Arreglar issues Critical/High del reporte                │
│                                                             │
│  • Reportar al usuario qué se construyó                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Ejemplo Completo BLUEPRINT

### Tarea
```
Usuario: "Necesito un sistema de autenticación con roles y permisos"
```

### PASO 1: Delimitar y Descomponer en Fases

```
🎯 Problema Final: Sistema de auth con roles y permisos

📋 TodoWrite - FASES (sin subtareas):
├─ 🔲 Fase 1: Infraestructura de autenticación base
├─ 🔲 Fase 2: Sistema de roles
├─ 🔲 Fase 3: Sistema de permisos
├─ 🔲 Fase 4: Middleware de protección de rutas
├─ 🔲 Fase 5: Interfaz de usuario
└─ 🔲 Fase 6: Testing y validación E2E
```

### PASO 2: Entrar en Fase 1 - Mapear Contexto

```
🔍 MAPEANDO CONTEXTO DE FASE 1...

📁 Explorando codebase:
   • src/lib/supabase/ → Existe client.ts y server.ts ✓
   • src/features/auth/ → Carpeta vacía
   • src/app/(auth)/ → Tiene layout.tsx, login/page.tsx, signup/page.tsx (básicos)

🗄️ [Supabase MCP] → list_tables
   • auth.users existe (Supabase built-in)
   • No hay tablas custom de auth todavía

🔗 Dependencias:
   • Supabase client ya configurado ✓
   • No hay auth implementado todavía

✅ CONTEXTO MAPEADO. Generando subtareas...

📋 TodoWrite ACTUALIZADO:
├─ 🔄 Fase 1: Infraestructura de autenticación base
│     ├─ 🔲 Crear helper signUp en features/auth/services/
│     ├─ 🔲 Crear helper signIn en features/auth/services/
│     ├─ 🔲 Crear helper signOut en features/auth/services/
│     ├─ 🔲 Crear hook useAuth en features/auth/hooks/
│     ├─ 🔲 Crear tipos User y Session en features/auth/types/
│     └─ 🔲 Actualizar páginas login y signup para usar servicios
├─ 🔲 Fase 2: Sistema de roles
├─ 🔲 Fase 3: Sistema de permisos
├─ 🔲 Fase 4: Middleware de protección
├─ 🔲 Fase 5: UI de auth
└─ 🔲 Fase 6: Testing E2E
```

### PASO 3: Ejecutar Subtareas de Fase 1

```
[Subtarea 1.1] Crear helper signUp
   → Código generado en features/auth/services/auth.service.ts
   → [Next.js MCP] get_errors → Sin errores ✅
   → Completada ✓

[Subtarea 1.2] Crear helper signIn
   → Código generado
   → [Next.js MCP] get_errors → Error de tipos en Session
   → Corregido importando tipo correcto de @supabase/supabase-js
   → [Next.js MCP] get_errors → Sin errores ✅
   → Completada ✓

[Subtarea 1.3] Crear helper signOut
   → Código generado
   → Completada ✓

[Subtarea 1.4] Crear hook useAuth
   → Código generado en features/auth/hooks/useAuth.ts
   → Completada ✓

[Subtarea 1.5] Crear tipos
   → Código generado en features/auth/types/index.ts
   → Completada ✓

[Subtarea 1.6] Actualizar páginas
   → Modificado login/page.tsx y signup/page.tsx
   → [Playwright MCP] screenshot de /login
   → Formulario renderiza correctamente ✅
   → Completada ✓

✅ FASE 1 COMPLETADA
```

### PASO 4: Transición a Fase 2

```
🔍 MAPEANDO CONTEXTO DE FASE 2...

📁 Explorando codebase:
   • features/auth/services/auth.service.ts → signUp, signIn, signOut ✓
   • features/auth/hooks/useAuth.ts → hook funcional ✓
   • features/auth/types/ → User, Session definidos ✓

🗄️ [Supabase MCP] → list_tables
   • auth.users existe con usuarios de prueba
   • NO existe tabla de roles todavía

🔗 Dependencias:
   • Auth base FUNCIONA (verificado en Fase 1)
   • Necesito crear tabla roles y user_roles

✅ CONTEXTO MAPEADO. Generando subtareas de Fase 2...

📋 TodoWrite ACTUALIZADO:
├─ ✅ Fase 1: Infraestructura de autenticación base (COMPLETADA)
├─ 🔄 Fase 2: Sistema de roles
│     ├─ 🔲 [Supabase] Crear tabla 'roles' (id, name, description)
│     ├─ 🔲 [Supabase] Crear tabla 'user_roles' (user_id, role_id)
│     ├─ 🔲 [Supabase] Crear RLS policies para roles
│     ├─ 🔲 Crear tipos Role y UserRole en features/auth/types/
│     ├─ 🔲 Crear servicio getRoles, assignRole, removeRole
│     └─ 🔲 Crear hook useUserRoles
├─ 🔲 Fase 3: Sistema de permisos
...
```

### (Continúa el ciclo hasta completar todas las fases)

---

## 🤖 Ejemplo Completo BLUEPRINT — AI Feature (RAG)

### Tarea
```
Usuario: "Quiero un asistente que responda preguntas sobre
          nuestra documentación técnica interna"
Pieza:    PIEZA-AI-[nombre].md · Subtipo B — RAG
```

### PASO 1: Delimitar y Descomponer en Fases

```
🎯 Problema Final: Asistente RAG sobre documentación técnica
📋 Subtipo: B — RAG con pgvector (sin upload de usuario)

TodoWrite - FASES (sin subtareas):
├─ 🔲 Fase 1: Infraestructura vectorial (pgvector + schema + RLS)
├─ 🔲 Fase 2: Pipeline de ingesta (chunks + embeddings)
├─ 🔲 Fase 3: API de query con streaming
├─ 🔲 Fase 4: UI del asistente RAG
└─ 🔲 Fase 5: Validación final + rate limiting
```

### PASO 2: Entrar en Fase 1 — Mapear Contexto

```
🔍 MAPEANDO CONTEXTO DE FASE 1...

📁 Codebase:
   • src/shared/lib/ → supabase/server.ts ✓, embeddings.ts ✗ (crear)
   • src/features/ → no hay features de IA previas

🗄️ [Supabase MCP] → list_tables
   • Tablas existentes: users, profiles
   • Sin tablas de documents ni chunks todavía

🤖 AI Context:
   • .env.local: OPENROUTER_API_KEY ✓, OPENAI_API_KEY ✓
   • pgvector: execute_sql("SELECT extname FROM pg_extension
     WHERE extname='vector'") → 0 filas → hay que habilitarla
   • No hay rutas de IA existentes → empezar desde cero
   • Asset cargado: .claude/skills/la-herreria/assets/rag-pattern.md ✓

✅ CONTEXTO MAPEADO. Generando subtareas...

TodoWrite ACTUALIZADO:
├─ 🔄 Fase 1: Infraestructura vectorial
│     ├─ 🔲 [Supabase] apply_migration: enable vector extension
│     ├─ 🔲 [Supabase] apply_migration: CREATE TABLE documents
│     │       (id, user_id, title, content, embedding vector(1536))
│     ├─ 🔲 [Supabase] apply_migration: ivfflat index (cosine)
│     ├─ 🔲 [Supabase] apply_migration: RLS + policy documents_own
│     ├─ 🔲 [Supabase] apply_migration: función match_documents
│     └─ 🔲 [Supabase] get_advisors(type:"security") → validar RLS
├─ 🔲 Fase 2: Pipeline de ingesta
├─ 🔲 Fase 3: API de query
├─ 🔲 Fase 4: UI
└─ 🔲 Fase 5: Validación final
```

### PASO 3: Ejecutar Subtareas de Fase 1

```
[1.1] apply_migration: enable pgvector
   → execute_sql CREATE EXTENSION IF NOT EXISTS vector
   → [Supabase MCP] execute_sql: SELECT extname... → 1 fila ✅

[1.2] apply_migration: CREATE TABLE documents
   → Schema con embedding vector(1536), RLS habilitado
   → Completada ✓

[1.3] apply_migration: ivfflat index
   → CREATE INDEX USING ivfflat (embedding vector_cosine_ops) WITH (lists=100)
   → Completada ✓

[1.4] apply_migration: RLS + policy
   → ENABLE ROW LEVEL SECURITY + policy FOR ALL USING auth.uid() = user_id
   → Completada ✓

[1.5] apply_migration: match_documents function
   → Función SQL con similarity threshold 0.65, LIMIT 5
   → Completada ✓

[1.6] get_advisors(type: "security")
   → 0 warnings ✅ — RLS correctamente configurado

✅ FASE 1 COMPLETADA — infraestructura vectorial lista
```

### PASO 4: Transición a Fase 2

```
🔍 MAPEANDO CONTEXTO DE FASE 2...

📁 Codebase actualizado:
   • src/shared/lib/supabase/server.ts ✓
   • src/features/[nombre]/ → carpeta vacía (crear estructura Feature-First)

🗄️ [Supabase MCP] → list_tables
   • documents: id, user_id, title, content, embedding vector(1536) ✓
   • RLS activo, función match_documents lista ✓

🤖 AI Context:
   • OPENAI_API_KEY confirmado ✓ → text-embedding-3-small disponible
   • rag-pattern.md cargado → seguir el servicio generateEmbedding + chunkText

✅ Generando subtareas Fase 2...

TodoWrite ACTUALIZADO:
├─ ✅ Fase 1: Infraestructura vectorial (COMPLETADA)
├─ 🔄 Fase 2: Pipeline de ingesta
│     ├─ 🔲 Crear src/shared/lib/embeddings.ts
│     │       (generateEmbedding con text-embedding-3-small, batch-efficient)
│     ├─ 🔲 Crear features/[nombre]/services/ingestion.service.ts
│     │       (chunkText 1500/200 overlap + generateEmbeddingsBatch)
│     ├─ 🔲 Crear api/ingest/route.ts (recibe texto → chunks → embeddings → Supabase)
│     └─ 🔲 Test: ingestar 1 doc de prueba → verificar en Supabase ✅
├─ 🔲 Fase 3: API de query
...
```

---

## 🔧 Uso de MCPs en BLUEPRINT

Los MCPs se usan **durante la ejecución**, no como pasos del plan.

### Durante Mapeo de Contexto

```
🗄️ Supabase MCP:
   • list_tables → Ver qué tablas existen
   • execute_sql → Verificar estructura actual

📁 Codebase (Grep/Glob/Read):
   • Buscar patrones existentes
   • Entender estructura actual
```

### Durante Ejecución de Subtareas

```
🧠 Next.js MCP:
   • get_errors → Después de escribir código
   • get_logs → Si algo no funciona como esperado

👁️ Playwright MCP:
   • screenshot → Validar UI después de cambios visuales
   • click/fill → Probar flujos completos

🗄️ Supabase MCP:
   • apply_migration → Crear/modificar tablas
   • execute_sql → Verificar que datos se guardan
```

---

## ⚠️ Errores Comunes a Evitar

### ❌ Error 1: Generar todas las subtareas al inicio

```
MAL:
Fase 1: Auth base
   └─ 10 subtareas detalladas
Fase 2: Roles
   └─ 8 subtareas detalladas (basadas en SUPOSICIONES)
Fase 3: Permisos
   └─ 12 subtareas detalladas (basadas en SUPOSICIONES)
```

Las subtareas de Fase 2 y 3 están basadas en cómo IMAGINAS que quedará Fase 1.

```
BIEN:
Fase 1: Auth base (sin subtareas)
Fase 2: Roles (sin subtareas)
Fase 3: Permisos (sin subtareas)

→ Entrar en Fase 1
→ MAPEAR contexto
→ GENERAR subtareas de Fase 1
→ Ejecutar
→ Entrar en Fase 2
→ MAPEAR contexto (ahora incluye lo que REALMENTE construí)
→ GENERAR subtareas de Fase 2
...
```

### ❌ Error 2: MCPs como pasos obligatorios

```
MAL:
1. Tomar screenshot
2. Escribir código
3. Tomar screenshot
4. Verificar errores
5. Tomar screenshot
```

```
BIEN:
1. Implementar componente LoginForm
2. Implementar validación
3. Conectar con auth service

(Durante ejecución, usar MCPs cuando el JUICIO lo indique)
```

### ❌ Error 3: No re-mapear contexto entre fases

```
MAL:
Fase 1 completada → Pasar directo a ejecutar Fase 2
```

```
BIEN:
Fase 1 completada → MAPEAR contexto de Fase 2 → Generar subtareas → Ejecutar
```

---

## 🏁 Principios BLUEPRINT

1. **Fases primero, subtareas después**: Solo generar subtareas cuando entras a la fase
2. **Mapeo obligatorio**: Siempre mapear contexto antes de generar subtareas
3. **MCPs como herramientas**: Usar cuando el juicio lo indique, no como pasos fijos
4. **TodoWrite activo**: Mantener actualizado el progreso para visibilidad
5. **Validación por fase**: Confirmar que cada fase está completa antes de avanzar
6. **Contexto acumulativo**: Cada fase hereda el contexto de las anteriores

---

## 📊 Checklist de Calidad BLUEPRINT

Antes de marcar una fase como completada:

- [ ] ¿Todas las subtareas están realmente terminadas?
- [ ] ¿Verifiqué errores con Next.js MCP?
- [ ] ¿La funcionalidad hace lo que se esperaba?
- [ ] ¿Hay algo que debería ajustar antes de avanzar?

Después de implementar UI (fases con componentes visuales):
- [ ] `/critique` ejecutado — AI slop detection pasado
- [ ] Issues de diseño High/Critical resueltos

Antes de marcar el build como TERMINADO:
- [ ] `/web-audit` ejecutado — Performance ≥90, Accessibility 100, SEO ≥95
- [ ] Issues Critical/High del web-audit resueltos
- [ ] Si KANBAN.md existe: todas las stories en columna Done
- [ ] Dashboard HTML actualizado (`.claude/reports/kanban-board.html`)
- [ ] `.claude/memory/` actualizado con estado final via memory-manager (todas las fases completadas)

Antes de transicionar a siguiente fase:

- [ ] ¿Mapeé el contexto actualizado?
- [ ] ¿Las subtareas de la nueva fase consideran lo que YA existe?
- [ ] ¿Hay dependencias que debo tener en cuenta?

### Checklist Adicional para AI Features

Al completar la **Fase de Infraestructura** (si subtipo B/C/D):
- [ ] `execute_sql("SELECT extname FROM pg_extension WHERE extname='vector'")` → 1 fila
- [ ] `get_advisors(type: "security")` → 0 warnings en tablas de chunks/documents
- [ ] La función de similarity search (`match_documents` o equivalente) existe y tiene RLS

Al completar la **Fase de Pipeline de IA**:
- [ ] Los embeddings se generan en **batch** (1 llamada a la API por lote) — no uno a uno
- [ ] El chunk size está entre 100 y 2000 chars — fuera de ese rango, revisar
- [ ] `npm run typecheck` → 0 errores en los servicios de embeddings

Al completar la **Fase de API Route**:
- [ ] La route tiene rate limiting (429 con `Retry-After` header)
- [ ] La route devuelve error claro cuando el modelo falla (no 500 genérico)
- [ ] `streamText` → `toDataStreamResponse()` (no `.toTextStreamResponse()`)

Al completar la **Fase de UI**:
- [ ] Los 4 estados UI están presentes: loading, error, empty, data
- [ ] El loading state es específico: "Buscando en documentos..." no spinner genérico
- [ ] El error state tiene botón de reintentar

**Validación Final de AI Feature** (antes de deploy):
- [ ] `npm run typecheck` → 0 errores
- [ ] `npm run build` → exitoso
- [ ] Playwright: screenshot del chat con una pregunta real respondida
- [ ] Playwright: screenshot del estado de error (desconectar red, enviar mensaje)
- [ ] Variables de entorno configuradas en Vercel (OPENROUTER_API_KEY, OPENAI_API_KEY si aplica)
- [ ] Rate limiting testeado manualmente (enviar 25 mensajes rápidos → debe dar 429)

---

## 🔥 Auto-Blindaje: El Sistema que se Fortalece Solo

> *"Inspirado en el acero del Cybertruck: cada error es un impacto que refuerza nuestra estructura. Blindamos el proceso para que la falla nunca se repita."*

### Por Qué Auto-Blindaje

Sin Auto-Blindaje:
```
Error ocurre → Se arregla → Se olvida → Error ocurre de nuevo
```

Con Auto-Blindaje:
```
Error ocurre → Se arregla → Se documenta → NUNCA ocurre de nuevo
```

### Dónde Documentar Aprendizajes

| Tipo de Error | Dónde Documentar |
|---------------|------------------|
| Específico de esta feature | Pieza actual (sección Aprendizajes) |
| Aplica a múltiples features | `.claude/prompts/` relevante |
| Aplica a TODO el proyecto | `CLAUDE.md` (sección No Hacer) |

### Formato de Aprendizaje

```markdown
### [YYYY-MM-DD]: [Título corto]
- **Error**: [Qué falló exactamente]
- **Fix**: [Cómo se arregló]
- **Aplicar en**: [Dónde más aplica este conocimiento]
```

### Ejemplos Reales

```markdown
### 2024-12-05: Lighthouse penaliza imágenes grandes
- **Error**: Score de performance bajo (< 80)
- **Fix**: Usar WebP, max 80KB, lazy loading
- **Aplicar en**: Todas las features con imágenes

### 2024-12-06: Supabase RLS olvidado
- **Error**: Datos visibles sin autenticación
- **Fix**: SIEMPRE habilitar RLS después de CREATE TABLE
- **Aplicar en**: Todas las migraciones de BD

### 2024-12-07: Zustand hydration mismatch
- **Error**: Error de hidratación en SSR
- **Fix**: Usar persist middleware con skipHydration
- **Aplicar en**: Todos los stores que persisten en localStorage
```

---

---

## 📝 Memoria Persistente Entre Sesiones (memory-manager)

> *"El contexto que no se escribe, se pierde."*

### Cómo Funciona

La memoria del proyecto vive en `.claude/memory/` — versionada en git, compartida con el equipo.

```
Sesión termina → memory-manager captura contexto → Nueva sesión lee MEMORY.md → Continuidad perfecta
```

### Protocolo

Ver `.claude/skills/memory-manager/SKILL.md` para el protocolo completo. Puntos clave:

1. La memoria vive en `.claude/memory/` (no en STATE.md)
2. Git-versioned y team-shareable
3. `MEMORY.md` es el índice (max 200 líneas)
4. `/avivar` lee `MEMORY.md` como fuente primaria de contexto
5. 4 carpetas tipadas: `user/`, `feedback/`, `project/`, `reference/`

### Cuándo Actualizar

- **PASO 4 (Transición):** Después de completar cada fase
- **PASO 5 (Validación Final):** Al cerrar el build
- **Auto-Blindaje:** Cuando se resuelve un blocker importante

### Backward Compatibility

Si el proyecto tiene `STATE.md` pero no `.claude/memory/`, leer STATE.md (proyecto legacy V1).

---

## 🧠 Context Hygiene — Conciencia del Consumo de Contexto

> *"La calidad del agente degrada cuando el contexto se satura. Reconócelo y actúa."*

### Rangos de Calidad por Contexto

| Uso de Contexto | Calidad | Acción |
|-----------------|---------|--------|
| 0-30% | PEAK | Trabajar normalmente |
| 30-50% | BUENA | Trabajar normalmente, considerar delegar fases pesadas |
| 50-70% | DEGRADANDO | Usar `Agent` tool para subtareas complejas |
| 70%+ | POBRE | Completar fase actual y sugerir al usuario iniciar nueva sesión con `/avivar` |

### Guías Prácticas

1. **Después de 3+ fases en la misma sesión:** Considera usar `Agent` tool para ejecutar las fases restantes. Cada subagent recibe un contexto fresco.

2. **Señales de degradación:** Errores que ya habías resuelto reaparecen, olvidas decisiones tomadas anteriormente, generas código que contradice lo construido.

3. **Acción al detectar degradación:** Actualizar `.claude/memory/` con todo el contexto actual via memory-manager y sugerir al usuario:
```
⚠️ El contexto de esta sesión está saturado (3+ fases ejecutadas).
Memoria del proyecto actualizada con todo el progreso.

Recomiendo iniciar una nueva sesión y ejecutar /avivar para continuar
con contexto fresco. La memoria en .claude/memory/ preservará toda la continuidad.
```

4. **La Forja es inmune:** Los sandboxes usan contextos frescos por definición. Esto es una ventaja arquitectónica del Modo Forja para builds grandes (5+ fases).

---

## 🗣️ Decision Check — Validación de Decisiones Pendientes

En **PASO 2** (Mapear Contexto), DESPUÉS de explorar codebase, BD, y dependencias, agregar este micro-paso:

```
¿Hay decisiones de producto, UX, o negocio NO RESUELTAS para esta fase?

Ejemplos:
- ¿El usuario puede editar su perfil o es read-only?
- ¿Los roles son fijos o configurables por el admin?
- ¿Las notificaciones son email, in-app, o ambas?
- ¿El dashboard muestra datos en tiempo real o con refresh manual?
```

**Si hay decisiones ambiguas:**
- PAUSAR antes de generar subtareas
- Listar las decisiones pendientes al usuario
- Esperar respuesta antes de continuar

**Si todo está claro en el Blueprint/Pieza:** Continuar silenciosamente.

Este paso previene construir features basadas en suposiciones que luego requieren re-trabajo.

---

## 📦 Git Convention — Atomic Commits por Fase

> *"Un git history legible es documentación gratuita."*

### Formato de Commit

```
[tipo](F[fase]-T[tarea]): [descripción]
```

**Ejemplos:**
```
feat(F1-T1): create auth service with signUp and signIn
feat(F1-T2): create useAuth hook with session management
fix(F1-T3): fix RLS policy for profiles table
feat(F2-T1): create roles table with migration
test(F3-T2): add permission middleware tests
```

### Reglas

1. **Un commit por subtarea completada** — no acumular cambios
2. **El prefijo F/T mapea a fases/tareas del TodoWrite** — git history es rastreable
3. **Tipos permitidos:** `feat`, `fix`, `refactor`, `test`, `style`, `docs`, `chore`
4. **Descripción en minúsculas**, máximo 72 caracteres

### Beneficios

- `git log --oneline` muestra el progreso exacto por fase
- `git bisect` identifica la tarea exacta que introdujo un bug
- Cada tarea es independientemente revertible
- El historial sirve como documentación del build

---

*"La precisión viene de mapear la realidad, no de imaginar el futuro."*
*"El sistema que se blinda solo es invencible."*
