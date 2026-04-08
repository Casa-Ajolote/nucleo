# VIABILITY-nucleo

> Analisis de viabilidad generado por Forge · 2026-04-01

## Resumen Ejecutivo

**Idea:** Segundo cerebro personal con IA — captura, analiza, categoriza y sincroniza contenido desde cualquier fuente (links, videos, voz, docs) con soporte offline-first, PWA, desktop y extension de Chrome.
**Veredicto:** 🟡 CAUTION
**Score:** 3.6 / 5.0
**Ruta recomendada:** 🔧 Herramienta Interna (con MVP agresivo en fases)

---

## Analisis por Dimension

### Viabilidad Tecnica: 3.0 / 5

- **Golden Path Fit:** 3/5 — El core (web app + Supabase + AI) encaja perfecto. Pero offline-first con sync bidireccional estira los limites de Supabase (no tiene offline SDK nativo). Se necesita IndexedDB + logica de sync custom. La Chrome extension es un codebase separado (Manifest V3 + messaging).
- **APIs Externas:** 3/5 — Transcripcion de video (Whisper API o similar), AI analysis (OpenRouter — ya en Golden Path), embeddings para RAG (pgvector en Supabase). Todo factible pero son 3+ integraciones no triviales.
- **Complejidad:** 2/5 — El MVP como lo describes tiene ~8 features core (captura multi-fuente, AI analysis, offline sync, voice notes, video transcription, RAG chat, Chrome extension, cross-device). Lo ideal para un MVP son 1-3.
- **Datos:** 4/5 — Los datos los genera el usuario. No hay dependencia de datasets externos. El scraping de contenido (tweets, Reddit, etc.) puede chocar con rate limits o ToS, pero hay workarounds.

### Viabilidad de Negocio (Problema): 4.5 / 5

- **Problema:** 5/5 — Extremadamente especifico y doloroso. Lo vives a diario. Informacion dispersa entre GitHub, X, Reddit, OpenClaw, Perplexity, notas mentales. Es un problema que escala: mientras mas contenido consumes, peor se pone.
- **Mercado:** 5/5 — El usuario eres tu. Adopcion garantizada. Ademas, este problema lo tienen miles de power users, developers y researchers.
- **Monetizacion:** 3/5 — Como herramienta personal no necesita monetizacion. Pero tiene potencial SaaS fuerte si decides abrirlo (Raindrop.io cobra $3/mes, Notion cobra $10/mes, Readwise cobra $8/mes).
- **Diferenciacion:** 5/5 — Construido exactamente para tu workflow. Ninguna herramienta existente combina: captura multi-fuente + AI analysis + offline-first + RAG chat + voice notes + video transcription en un solo lugar.

### Viabilidad de Adopcion Interna: 5.0 / 5

- **Usuarios:** Tu. Adopcion inmediata garantizada.
- **Frecuencia de uso:** Diaria, multiples veces al dia.
- **Motivacion:** Pain real — estas perdiendo informacion valiosa constantemente.
- **Cross-device:** iPhone → Mac es tu flujo natural. La PWA lo resuelve.

---

## Riesgos Identificados

| # | Riesgo | Probabilidad | Impacto | Mitigacion |
|---|--------|-------------|---------|------------|
| 1 | **Scope creep** — construir todo a la vez y no terminar nada | Alta | Alto | MVP agresivo: solo captura + AI + sync en Fase 1. Chrome extension y video en fases posteriores |
| 2 | **Offline-first sync** — conflictos de datos, perdida de info | Media | Alto | Usar estrategia "last-write-wins" simple para V1. IndexedDB como cache local + sync queue |
| 3 | **Scraping de contenido** — ToS de X, Reddit, Instagram limitan acceso | Media | Medio | V1: el usuario pega el contenido/link manualmente. Scraping automatico es optimizacion futura |
| 4 | **Costo de AI** — cada captura trigger analisis + embeddings | Media | Medio | Rate limiting interno, batch processing, modelos economicos (Haiku) para categorizacion |
| 5 | **Chrome extension** — codebase separado, review process de Chrome Web Store | Baja | Medio | Dejarlo para Fase 2. La PWA puede tener "share target" que reemplaza parcialmente |

---

## Competencia Existente

| Herramienta | Que hace bien | Que le falta (tu oportunidad) |
|-------------|--------------|-------------------------------|
| Raindrop.io | Bookmarks organizados | No tiene AI, no analiza contenido, no offline-first |
| Notion | Docs + organizacion | Lento en mobile, no tiene AI analysis automatico, no offline real |
| Readwise/Reader | Captura + highlights | No voice notes, no video analysis, no RAG chat |
| Obsidian | Markdown + local-first | No tiene AI nativo, sync de pago, no captura de links automatica |
| Mem.ai | AI + notas | No offline, no video, no extension robusta |

**Tu ventaja:** Ninguno combina TODO lo que necesitas. Pero cada uno hace ALGO bien — el riesgo es intentar superar a todos en V1.

---

## Recomendacion

La idea es **excelente** y el problema es **real y doloroso**. El riesgo no esta en la idea — esta en el **scope**. Si intentas construir las 8 features a la vez, el proyecto muere de ambicion.

### Propuesta: MVP en 3 Fases

**Fase 1 — "Captura + Cerebro" (el MVP real)**
- PWA con UI minimalista
- Pegar un link/texto → AI lo analiza, resume y categoriza
- Busqueda por categoria y keywords
- Sync basico (online-first, cache local para lectura offline)
- Copy-to-clipboard de comandos/prompts con 1 click

**Fase 2 — "Offline + Voz + Chat"**
- Offline-first real con sync queue
- Voice notes → transcripcion → AI analysis
- RAG chat sobre tu base de conocimiento
- Chrome extension basica (captura de links)

**Fase 3 — "Media + Power Features"**
- Video analysis (Reels, TikTok) → hooks + transcripcion
- Chrome extension avanzada (copy commands, quick capture)
- Visualizacion avanzada de documentos
- Export/import masivo

---

### Veredicto: 🟡 CAUTION → GO con Fase 1

Proceder con **Step 1 (PDR)** enfocado en **Fase 1 unicamente**. Documentar Fases 2 y 3 como roadmap pero NO disenarlas ahora.

### Que validar antes de Fase 2
1. ¿Realmente usas la app a diario despues de 2 semanas?
2. ¿La categorizacion automatica de la IA es util o genera ruido?
3. ¿El sync basico (online-first) es suficiente o necesitas offline real?
