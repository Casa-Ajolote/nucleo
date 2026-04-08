---
name: el-crisol
description: >
  Pipeline de validacion estrategica que ejecuta 7 analisis en orden de dependencia
  (brujula → estrella → rivales → precio → roi → metas → lanzamiento) y produce
  un dashboard HTML ejecutivo consolidado con metricas, graficas y veredicto go/no-go.
  Se activa DESPUES del Blueprint (entre /plan y /build). Detecta strategy docs existentes
  y reutiliza los que ya estan. Cada paso delega al comando slash correspondiente.
  Usa este skill cuando el usuario diga "crisol", "validacion estrategica",
  "quiero analizar si vale la pena construir", "necesito un pitch deck",
  "presentar a inversores", "dashboard estrategico", o post-Blueprint cuando
  el proyecto justifica inversion significativa.
---

# El Crisol — Validacion Estrategica

> **Rol del agente:** Strategy Consultant + Business Analyst.
> **Objetivo:** Validar la viabilidad estrategica de un producto ANTES de invertir
> semanas construyendolo. Producir un dashboard ejecutivo que permita tomar la
> decision go/no-go con datos solidos.

---

## Pipeline de Dependencias

```
/brujula ──→ /estrella ──→ /rivales ──→ /precio ──→ /roi ──→ /metas ──→ /lanzamiento
   │              │             │            │          │          │            │
   ▼              ▼             ▼            ▼          ▼          ▼            ▼
 Vision +     North Star    Battlecards  Pricing    Unit Econ    OKRs       Go-to-
 Strategy     Metric        + Landscape  Strategy   + ROI       + Roadmap   Market
```

| # | Comando | Produce | Necesita antes |
|---|---------|---------|----------------|
| 1 | `/brujula` | `STRATEGY-CANVAS-[nombre].md` | Solo Blueprint/BMC/PDR |
| 2 | `/estrella` | `NORTH-STAR-[nombre].md` | Brujula (que medir) |
| 3 | `/rivales` | `COMPETITIVE-ANALYSIS-[nombre].md` | Brujula (posicionamiento) |
| 4 | `/precio` | `PRICING-STRATEGY-[nombre].md` | Rivales + Estrella |
| 5 | `/roi` | `saas-analysis-[nombre].md` + `.html` | Precio + Estrella |
| 6 | `/metas` | `OKRS-[nombre].md` | ROI + Estrella |
| 7 | `/lanzamiento` | `GTM-STRATEGY-[nombre].md` | Todo lo anterior |

---

## Fase 0 — Deteccion de Estado

Al activarse, escanear el directorio del proyecto para detectar documentos existentes.

### Scan de Documentos

Buscar en **raiz del proyecto** Y en **`.claude/reports/`**:

| Paso | Glob Pattern (raiz) | Glob Pattern (reports) |
|------|---------------------|----------------------|
| 1. Brujula | `STRATEGY-CANVAS-*.md` | `.claude/reports/STRATEGY-CANVAS-*.md` |
| 2. Estrella | `NORTH-STAR-*.md` | `.claude/reports/NORTH-STAR-*.md` |
| 3. Rivales | `COMPETITIVE-ANALYSIS-*.md` | `.claude/reports/COMPETITIVE-ANALYSIS-*.md` |
| 4. Precio | `PRICING-STRATEGY-*.md` | `.claude/reports/PRICING-STRATEGY-*.md` |
| 5. ROI | `saas-analysis-*.md` | `.claude/reports/saas-analysis-*.md` |
| 6. Metas | `OKRS-*.md` | `.claude/reports/OKRS-*.md` |
| 7. Lanzamiento | `GTM-STRATEGY-*.md` | `.claude/reports/GTM-STRATEGY-*.md` |

Tambien buscar contexto base: `BLUEPRINT-*.md`, `BMC-*.md`, `PDR-*.md`, `LEAN-CANVAS-*.md`

### Determinar Nombre del Proyecto

1. Si existe `BLUEPRINT-[nombre].md` → extraer `[nombre]` del filename
2. Si no: buscar el `[nombre]` mas comun entre los docs encontrados
3. Si no hay docs: preguntar al usuario

### Presentar Estado

```
🔥 El Crisol — Validacion Estrategica

Proyecto: [nombre]

  #  Analisis       Que produce                      Estado
  1  Brujula        Vision + posicionamiento          ✅ ya existe / ⬜ pendiente
  2  Estrella       North Star Metric                 ✅ / ⬜
  3  Rivales        Landscape competitivo             ✅ / ⬜
  4  Precio         Modelo de monetizacion            ✅ / ⬜
  5  ROI            Unit economics + proyecciones     ✅ / ⬜
  6  Metas          OKRs + Outcome Roadmap            ✅ / ⬜
  7  Lanzamiento    Go-to-Market strategy             ✅ / ⬜
  ─────────────────────────────────────────────────────────
  Final  Dashboard   Panel ejecutivo consolidado       ⬜

  Pendientes: [N] de 7  ·  Tiempo estimado: ~[N × 25]min
  Existentes: [M] de 7  (se reutilizan)
```

### Preguntar Perplexity

Si el MCP de Perplexity esta disponible:

```
🔍 Perplexity esta disponible. Quieres enriquecer los analisis con
   investigacion de mercado real? (competidores, benchmarks, TAM)

   Esto mejora la calidad pero anade ~15-20 min al total.
```

Recordar la preferencia y pasarla a cada paso que ofrezca research.

### Confirmar Inicio

```
Arrancamos? Puedes:
  - "go"            → Ejecutar todo lo pendiente en orden
  - "saltar [N]"    → Saltar un paso especifico
  - "desde [N]"     → Empezar desde un paso concreto
  - "solo dashboard" → Generar dashboard con los docs que existen
```

---

## Fase 1 — Ejecucion Secuencial

Para cada paso pendiente, en orden de dependencia:

### Protocolo por Paso

1. **Anunciar paso:**
```
━━━ Paso [N]/7: [Nombre] ━━━
[Que hara en una linea]
Dependencias: [listar docs que usara como input]
```

2. **Cargar el comando:** Leer `.claude/commands/[nombre-comando].md` y ejecutar su logica completa.
   - Pasar todo el contexto acumulado (Blueprint + docs previos del Crisol)
   - Si el usuario eligio Perplexity: activar research en comandos que lo ofrecen
   - Respetar el flujo del comando: entrevista (si falta contexto), generacion, confirmacion

3. **Confirmar output:**
```
✅ Paso [N]/7 completado → [archivo].md
   [Dato clave extraido — ej: "NSM: Weekly Active Projects"]

Siguiente: [Nombre del paso N+1] — [que hara en una linea]
Continuar, saltar, o ajustar?
```

4. **Transicion:** Si continua → paso N+1. Si salta → paso N+2. Si ajusta → re-ejecutar paso N.

### Mapeo Comando ↔ Paso

| Paso | Leer comando | Output esperado |
|------|-------------|-----------------|
| 1 | `.claude/commands/brujula.md` | `STRATEGY-CANVAS-[nombre].md` |
| 2 | `.claude/commands/estrella.md` | `NORTH-STAR-[nombre].md` |
| 3 | `.claude/commands/rivales.md` | `COMPETITIVE-ANALYSIS-[nombre].md` |
| 4 | `.claude/commands/precio.md` | `PRICING-STRATEGY-[nombre].md` |
| 5 | `.claude/commands/roi.md` | `.claude/reports/saas-analysis-[nombre].md` + `.html` |
| 6 | `.claude/commands/metas.md` | `OKRS-[nombre].md` |
| 7 | `.claude/commands/lanzamiento.md` | `GTM-STRATEGY-[nombre].md` |

### Reglas de Ejecucion

1. **No repetir preguntas.** Si la brujula ya definio el target customer, no volver a preguntar en rivales.
2. **Propagar contexto.** Cada paso lee los outputs de pasos anteriores como input.
3. **No contradecir.** Si precio definio tiers, roi los usa tal cual.
4. **Docs existentes = contexto.** Si ya existia un STRATEGY-CANVAS, todos los pasos posteriores lo usan.

---

## Fase 2 — Consolidacion + Dashboard

Cuando los 7 pasos estan completos (o los que el usuario decidio ejecutar):

### Paso 1: Generar Resumen Ejecutivo

Leer `.claude/skills/el-crisol/assets/strategy-summary.md` como template.

Leer los 7 documentos de estrategia y generar:

**Output:** `.claude/reports/STRATEGY-REPORT-[nombre].md`

### Paso 2: Calcular Build Confidence Score

Leer `.claude/skills/el-crisol/assets/go-no-go-scoring.md` como rubrica.

Evaluar cada dimension (1-10) basandose en los datos concretos de cada documento:
- No inventar scores — cada score debe citar el dato que lo justifica
- Si un paso fue saltado, esa dimension se marca "N/A" y se redistribuye el peso

Calcular score ponderado final (1-10).

### Paso 3: Generar Dashboard HTML

Leer `.claude/skills/el-crisol/assets/dashboard-template.md` para las instrucciones detalladas
de layout, secciones, graficas y estilos.

**Output:** `.claude/reports/strategy-dashboard-[nombre].html`

Requisitos criticos del dashboard:
- **Standalone:** Abre en cualquier browser sin servidor
- **Chart.js via CDN:** `https://cdn.jsdelivr.net/npm/chart.js`
- **Responsive:** 4 cols desktop, 2 tablet, 1 mobile
- **Dark mode default** con Liquid Glass styling
- **Print-friendly:** @media print para exportar a PDF
- **Datos embebidos:** Todo como `const DATA = { ... }` en un `<script>` block

---

## Fase 3 — Handoff

Presentar resultado final:

```
🔥 El Crisol completado — [nombre]

Build Confidence Score: [X]/10 — [Go ✅ / Caution ⚠️ / No-Go ❌]

Documentos generados:
  📊 .claude/reports/strategy-dashboard-[nombre].html  (dashboard interactivo)
  📄 .claude/reports/STRATEGY-REPORT-[nombre].md       (resumen ejecutivo)
  [+ listar los 7 docs individuales generados]

→ Abre el dashboard:
  open .claude/reports/strategy-dashboard-[nombre].html
```

### Segun Veredicto

**Go (8-10):**
```
Estrategia solida. Siguiente paso:
→ /build para construir (Build Manual o Modo Forja)
```

**Caution (5-7):**
```
Hay areas que necesitan atencion antes de invertir en construccion:
  - [Area 1]: [que mejorar]
  - [Area 2]: [que mejorar]

Puedes ajustar esas areas y re-ejecutar /crisol,
o proceder con /build aceptando los riesgos.
```

**No-Go (1-4):**
```
La estrategia tiene gaps fundamentales:
  - [Gap 1]: [por que es critico]
  - [Gap 2]: [por que es critico]

Recomendacion: Replantear antes de construir.
→ Revisa los documentos marcados y ajusta la estrategia.
→ Luego re-ejecuta /crisol para re-evaluar.
```

---

## Cuando NO Usar El Crisol

- Proyectos personales/experimentales donde el usuario solo quiere construir
- Features individuales (ya tienen su propio Blueprint via La Pieza)
- Si el usuario ya hizo los 7 analisis individualmente y solo quiere el dashboard → usar `/crisol dashboard`
