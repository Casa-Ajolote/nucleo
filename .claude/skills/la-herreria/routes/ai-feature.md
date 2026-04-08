# Route: 🤖 Feature con IA

> *"Integra inteligencia real en tu producto. No decoración — valor medible."*

## Metadata

- **Modo:** 🤖 Feature con IA
- **Descripción:** Diseña y construye un módulo AI dentro de una app existente o como núcleo de una nueva
- **Tiempo estimado:** 2h 20m - 4h 20m
- **Steps activos:** 7 (incluye Viability Check)
- **Cuándo usar:** Cuando el valor central del producto viene de un modelo de lenguaje/visión/audio, o cuando quieres agregar una feature con IA a una app que ya existe

---

## Pipeline

```
VIABILITY → Definición → AI Design → User Stories IA → Prompt Engineering → UI del Feature → Cost & Ops
  Step 0      Step 1       Step 2         Step 3            Step 4             Step 5          Step 6
  20 min      15 min       25 min         20 min            20 min             30 min          15 min
```

**No usa:** BMC completo (#1), Tech Spec general (#3), UX Research (#4), UX Design completo (#6), UI Workflow (#7), Security Audit (#9), Blueprint (#10)

---

### Step 0 · Viability Check (Go/No-Go Gate)

- **Asset:** `assets/00-viability-check.md`
- **Output:** `VIABILITY-[nombre].md`
- **Tiempo:** ~20 min
- **Qué hace:** Evalúa viabilidad técnica del feature IA (¿APIs disponibles? ¿Costo asumible? ¿El Golden Path lo soporta?) y viabilidad de negocio (¿agrega valor real o es "IA decorativa"?).
- **Inputs requeridos:** Solo la idea del usuario
- **Gate:** Si NO-GO → detener. Si GO → continuar.

---

### Step 1 · Definición del Feature IA

- **Asset:** Ninguno — entrevista directa
- **Output:** `AI-FEATURE-BRIEF-[nombre].md`
- **Tiempo:** ~15 min
- **Qué hace:** Define con precisión qué hace el feature de IA, qué inputs recibe, qué outputs produce y — **crítico** — qué subtipo de feature es para cargar el patrón correcto en pasos posteriores

#### 1.1 Clasificar el Subtipo de Feature IA

**Antes de cualquier otra pregunta**, identificar el subtipo para cargar los patrones correctos:

```
¿Qué tipo de feature IA quieres construir?

A. 💬 Chat Conversacional
   → El usuario escribe mensajes y el modelo responde en tiempo real
   → Ejemplos: asistente, chatbot, copilot de escritura
   → Patrón: streamText + useChat + (opcional) memory-pattern

B. 🔍 RAG / Búsqueda en Documentos Propios
   → El modelo responde basándose en documentos o KB del sistema
   → Ejemplos: FAQ de empresa, asistente sobre documentación técnica
   → Patrón: rag-pattern (pgvector + embeddings, sin upload de usuario)

C. 📄 Chat con Documentos del Usuario
   → El usuario SUBE sus propios archivos y conversa con ellos
   → Ejemplos: "Chat with PDF", análisis de contratos, resumen de reportes
   → Patrón: chat-with-docs (Storage + extracción + RAG + chat streaming)

D. 🧠 IA con Memoria Persistente
   → El asistente recuerda al usuario entre sesiones
   → Ejemplos: coach personalizado, asistente que aprende preferencias
   → Patrón: memory-pattern (historial + preferencias + memoria semántica)

E. ⚙️ Generación Estructurada (sin chat)
   → El modelo produce datos estructurados a partir de un input
   → Ejemplos: extracción de datos, clasificación, generación de reportes
   → Patrón: generateObject + Zod (sin streaming UI)

Escribe la letra (A-E) o describe tu feature y lo clasifico.
```

**Según el subtipo elegido, el Step 2 cargará el asset correcto:**

| Subtipo | Asset adicional a cargar en Step 2 |
|---------|-----------------------------------|
| A — Chat Conversacional | `assets/ai-feature-design.md` |
| B — RAG / KB del sistema | `assets/ai-feature-design.md` + `assets/rag-pattern.md` |
| C — Chat con Docs del Usuario | `assets/chat-with-docs.md` (reemplaza Step 2-4) |
| D — IA con Memoria | `assets/ai-feature-design.md` + `assets/memory-pattern.md` |
| E — Generación Estructurada | `assets/ai-feature-design.md` |

> **Nota sobre el Subtipo C:** Chat con Documentos del Usuario tiene su propio pipeline autocontenido en `chat-with-docs.md`. Si el usuario elige C, leer ese asset directamente — contiene todo: schema SQL, pipeline de upload, extracción de texto, chunking, embeddings y UI. Los Steps 2-4 se reemplazan por el contenido de ese asset.

#### 1.2 Preguntas de Definición del Feature

- *"¿Qué tarea hace el usuario ahora manualmente que la IA va a hacer/acelerar?"*
- *"¿Qué INPUT recibe la IA? (texto libre, archivo subido, datos estructurados, imágenes)"*
- *"¿Qué OUTPUT espera el usuario? (texto generado, clasificación, análisis, recomendación, datos estructurados)"*
- *"¿Va dentro de una app existente o es el producto en sí?"*
- *"¿Hay latencia aceptable o necesita ser en tiempo real (streaming)?"*
- *"¿Cuántas llamadas al día estimas? ¿Tienes presupuesto de API en mente?"*
- *"¿Qué pasa si el modelo falla o alucina? ¿Hay un fallback?"*

---

### Step 2 · AI Feature Design

- **Asset:** `assets/ai-feature-design.md` (+ asset de patrón específico según subtipo del Step 1)
- **Output:** Sección de diseño en `AI-FEATURE-BRIEF-[nombre].md` (modelo, proveedor, patrón, API contract, fallbacks)
- **Tiempo:** ~25 min
- **Qué hace:** Define la arquitectura del feature — selección de modelo, patrón de integración (streaming / structured output / tool calling / RAG), contrato de API y cadena de fallbacks
- **Inputs requeridos:** `AI-FEATURE-BRIEF-[nombre].md` del Step 1 + subtipo clasificado
- **Adaptación por subtipo:**
  - **A (Chat):** streamText + useChat; definir si incluirá memoria persistente
  - **B (RAG/KB):** leer también `assets/rag-pattern.md`; documentar estructura de knowledge base
  - **C (Chat con Docs):** leer `assets/chat-with-docs.md`; este asset reemplaza Steps 2-4 con su pipeline completo
  - **D (Memoria):** leer también `assets/memory-pattern.md`; elegir entre los 3 tipos de memoria
  - **E (Estructurado):** `generateObject` + Zod; sin streaming — definir el schema de output
- **Siempre:**
  - Usar OpenRouter como proveedor (evita lock-in, un solo API key)
  - Definir el fallback chain: modelo principal → modelo económico → respuesta estática
  - Documentar el endpoint y el request/response schema antes de escribir código

---

### Step 3 · User Stories IA

- **Asset:** `assets/05-user-stories.md`
- **Output:** `USER-STORIES-AI-[nombre].md`
- **Tiempo:** ~20 min
- **Qué hace:** Stories específicas para el feature de IA
- **Inputs requeridos:** `AI-FEATURE-BRIEF-[nombre].md`
- **Adaptación para AI Feature:**
  - Incluir stories del happy path Y del unhappy path (modelo lento, respuesta vacía, error)
  - Stories de feedback: *"Como usuario, sé si la IA está procesando mi request"*
  - Stories de confianza: *"Como usuario, puedo ver la fuente de la recomendación"*
  - Stories de control: *"Como usuario, puedo regenerar una respuesta que no me convenció"*
  - **No incluir** stories de otras partes de la app — foco en el feature IA

---

### Step 4 · Prompt Engineering

- **Asset:** `assets/prompt-engineering.md`
- **Output:** `PROMPTS-[nombre].md` con system prompts versionados, few-shots y golden tests
- **Tiempo:** ~20 min
- **Qué hace:** Diseña los prompts de producción — anatomía del system prompt, patrones por tipo de feature, structured outputs con Zod, versionado semver y suite de golden tests pre-deploy
- **Inputs requeridos:** `AI-FEATURE-BRIEF-[nombre].md` + decisiones del Step 2
- **Adaptación para AI Feature:**
  - El system prompt sigue 5 secciones: rol, tarea, reglas, formato, fallback
  - Usar `generateObject` + Zod schema cuando el output es estructurado — nunca parsear JSON manualmente
  - Los prompts se versionan en `src/features/[nombre]/prompts.ts` como constantes
  - Correr los 5 golden tests antes de ir a producción: happy path, input vacío, ambiguo, injection, otro idioma

---

### Step 5 · UI del Feature IA

- **Asset:** `assets/front-end-design.md` → luego `assets/08-ui.md`
- **Output:** Componentes del feature en `src/features/[nombre-ai]/`
- **Tiempo:** ~30 min
- **Qué hace:** UI para el feature de IA — patrones específicos de AI UX
- **Inputs requeridos:** `USER-STORIES-AI-[nombre].md` + `AI-FEATURE-BRIEF-[nombre].md`
- **Adaptación para AI Feature:**
  - **Streaming UI:** Usar `useCompletion` o `useChat` de Vercel AI SDK para mostrar texto en tiempo real
  - **Loading states:** Skeleton loaders mientras el modelo procesa — nunca spinner vacío
  - **Error states:** Mensajes claros cuando el modelo falla — con opción de reintentar
  - **Confianza:** Mostrar de dónde vino la respuesta si es RAG
  - **Control:** Botones de regenerar, copiar, thumbs up/down para feedback
  - Leer `front-end-design.md` para principios visuales

---

### Step 6 · Cost & Operations

- **Asset:** `assets/llm-cost-optimization.md`
- **Output:** Sección de costos y ops en `AI-FEATURE-BRIEF-[nombre].md` + rate limiting implementado
- **Tiempo:** ~15 min
- **Qué hace:** Estima el costo mensual, implementa rate limiting con Upstash Redis, configura observabilidad con Sentry y define estrategias de reducción de costo (caching, model routing, batching)
- **Inputs requeridos:** Modelo elegido (Step 2) + volumen estimado de requests/día
- **Adaptación para AI Feature:**
  - Calcular escenario conservador y escenario crecimiento antes de ir a producción
  - Implementar rate limiting: 20 req/min para chat, 5 req/min para features costosos
  - Loggear `inputTokens`, `outputTokens`, `latencyMs` y `estimatedCostUsd` por request
  - Definir el umbral de costo que dispara revisión de arquitectura (ej: >$200/mes → evaluar haiku)

---

## Outputs Finales

| Entregable | Generado en |
|-----------|-------------|
| `AI-FEATURE-BRIEF-[nombre].md` | Steps 1-2 |
| `USER-STORIES-AI-[nombre].md` | Step 3 |
| `PROMPTS-[nombre].md` | Step 4 |
| `src/features/[nombre-ai]/` | Step 5 |
| Rate limiting + monitoring implementado | Step 6 |

---

## Arquitectura del Feature (Patrón Base)

```
src/
└── features/
    └── [nombre-ai]/
        ├── components/
        │   ├── AIInput.tsx        ← Input del usuario
        │   ├── AIOutput.tsx       ← Respuesta con streaming
        │   └── AIFeedback.tsx     ← Thumbs up/down + regenerar
        ├── hooks/
        │   └── useAIFeature.ts    ← Lógica con Vercel AI SDK
        └── api/
            └── route.ts           ← Server-side: llama al modelo
```

**Integración con Vercel AI SDK v5:**
```typescript
// src/features/[nombre-ai]/api/route.ts
import { streamText } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'

export async function POST(req: Request) {
  const { messages } = await req.json()
  const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY })

  const result = streamText({
    model: openrouter('anthropic/claude-3-5-sonnet'),
    system: SYSTEM_PROMPT, // desde PROMPTS-[nombre].md
    messages,
  })

  return result.toDataStreamResponse()
}
```

---

## Qué se Omite y Por Qué

| Elemento omitido | Razón |
|-----------------|-------|
| BMC completo (#1) | El feature IA va dentro de un product ya definido (o se define en el brief) |
| UX Research (#4) | Los usuarios del feature son los mismos de la app existente |
| UX Design completo (#6) | El feature tiene patrones de AI UX específicos — no IA general de la app |
| Security Audit (#9) | Se hace a nivel de app completa, no por feature; incluir AI-específicos en el brief |
| Blueprint (#10) | El feature es scope acotado — el plan de construcción está en el brief |

---

*"La IA en un producto no es una feature — es un nuevo tipo de interfaz entre el usuario y sus datos."*
