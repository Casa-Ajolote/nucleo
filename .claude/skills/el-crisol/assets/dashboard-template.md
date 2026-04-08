---
name: strategy-dashboard-template
description: >
  Instrucciones detalladas para generar el dashboard HTML consolidado de El Crisol.
  Define layout (Bento Grid), estilos (Liquid Glass), graficas (Chart.js),
  9 secciones del dashboard, y el mapa de extraccion de datos desde los 7
  documentos de estrategia.
---

# Strategy Dashboard — Template de Generacion

> Este archivo NO es el dashboard. Es la **especificacion** que el agente sigue
> para generar `strategy-dashboard-[nombre].html`.

---

## Especificaciones Tecnicas

- **Formato:** HTML standalone (sin servidor, abre directo en browser)
- **Charts:** Chart.js v4+ via CDN: `https://cdn.jsdelivr.net/npm/chart.js`
- **Layout:** CSS Grid (Bento Grid — 4 cols desktop, 2 tablet, 1 mobile)
- **Estilo:** Liquid Glass (backdrop-blur, semi-transparencia, bordes sutiles)
- **Theme:** Dark mode default (fondo `#0a0a0f`, cards con `rgba(255,255,255,0.05)`)
- **Tipografia:** `system-ui, -apple-system, sans-serif` (no Inter, no Roboto)
- **Responsive:** Mobile-first con breakpoints `768px` (tablet) y `1200px` (desktop)
- **Print:** `@media print` con fondo blanco, sin blur, charts visibles
- **Datos:** Embebidos como `const DATA = { ... }` en un `<script>` block

---

## Estructura CSS Base

```css
:root {
  --bg-primary: #0a0a0f;
  --bg-card: rgba(255, 255, 255, 0.05);
  --bg-card-hover: rgba(255, 255, 255, 0.08);
  --border-card: rgba(255, 255, 255, 0.1);
  --text-primary: #f0f0f5;
  --text-secondary: rgba(240, 240, 245, 0.6);
  --text-muted: rgba(240, 240, 245, 0.4);
  --accent-green: #34d399;
  --accent-yellow: #fbbf24;
  --accent-red: #f87171;
  --accent-blue: #60a5fa;
  --accent-purple: #a78bfa;
  --radius: 16px;
  --blur: 20px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
  padding: 2rem;
}

.dashboard {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.card {
  background: var(--bg-card);
  backdrop-filter: blur(var(--blur));
  -webkit-backdrop-filter: blur(var(--blur));
  border: 1px solid var(--border-card);
  border-radius: var(--radius);
  padding: 1.5rem;
  transition: background 0.2s;
}

.card:hover { background: var(--bg-card-hover); }

.card--full { grid-column: 1 / -1; }
.card--half { grid-column: span 2; }
.card--third { grid-column: span 1; }
.card--two-thirds { grid-column: span 3; }

.score-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-weight: 700;
  font-size: 1.25rem;
}
.score-go { background: rgba(52, 211, 153, 0.15); color: var(--accent-green); }
.score-caution { background: rgba(251, 191, 36, 0.15); color: var(--accent-yellow); }
.score-nogo { background: rgba(248, 113, 113, 0.15); color: var(--accent-red); }

@media (max-width: 1200px) {
  .dashboard { grid-template-columns: repeat(2, 1fr); }
  .card--third { grid-column: span 1; }
  .card--two-thirds { grid-column: span 2; }
}

@media (max-width: 768px) {
  body { padding: 1rem; }
  .dashboard { grid-template-columns: 1fr; }
  .card--half, .card--third, .card--two-thirds { grid-column: 1 / -1; }
}

@media print {
  :root {
    --bg-primary: #fff;
    --bg-card: #f9f9f9;
    --border-card: #ddd;
    --text-primary: #111;
    --text-secondary: #555;
  }
  .card { backdrop-filter: none; break-inside: avoid; }
}
```

---

## 9 Secciones del Dashboard

### Seccion 1: Hero (full-width)

**Layout:** `card--full` con gradiente sutil en el borde superior.

**Contenido:**
- Titulo: nombre del proyecto (h1)
- Vision statement (cita, texto mas pequeno)
- UVP en una linea
- **Build Confidence Score** prominente (badge grande con color segun veredicto)
- Fila de 4 stats clave:

| Stat | Fuente | Formato |
|------|--------|---------|
| LTV:CAC Ratio | `PRICING-STRATEGY` → Unit Economics | `X.X:1` con semaforo |
| Break-even | `saas-analysis` → Break-even point | `Mes X` |
| North Star Target | `NORTH-STAR` → Target 12m | Valor + nombre metrica |
| Gross Margin | `PRICING-STRATEGY` → Gross Margin | `XX%` con semaforo |

**Semaforo:**
- Verde: LTV:CAC >3, Margin >70%, Break-even <12m
- Amarillo: LTV:CAC 2-3, Margin 50-70%, Break-even 12-18m
- Rojo: LTV:CAC <2, Margin <50%, Break-even >18m

### Seccion 2: Strategy Canvas (2 cards half-width)

**Card izquierda — Target & Problem:**
- Target Customer primario (de STRATEGY-CANVAS § Target Customer)
- Top 3 problemas con magnitud (de STRATEGY-CANVAS § Problem)

**Card derecha — Moat & Defensibility:**
- Competitive Advantage (de STRATEGY-CANVAS § Competitive Advantage)
- Defensibilidad a 12 meses (texto)

**Chart:** Radar chart (Chart.js) que ocupa una card full-width debajo. 5 ejes:

| Eje | Fuente | Como puntuar (1-5) |
|-----|--------|--------------------|
| Market Fit | STRATEGY-CANVAS § Problem magnitudes | 5=dolor urgente, 1=nice-to-have |
| Defensibility | STRATEGY-CANVAS § Competitive Advantage | 5=moat fuerte, 1=facilmente copiable |
| Monetization | PRICING-STRATEGY § Unit Economics | 5=margins >80%, 1=margins <40% |
| GTM Clarity | GTM-STRATEGY § GTM Motion + Beachhead | 5=canal validado, 1=sin canal claro |
| Execution | OKRS § Confidence scores promedio | 5=alta confianza, 1=baja confianza |

```javascript
// Chart.js config para radar
{
  type: 'radar',
  data: {
    labels: ['Market Fit', 'Defensibility', 'Monetization', 'GTM Clarity', 'Execution'],
    datasets: [{
      label: projectName,
      data: [marketFit, defensibility, monetization, gtmClarity, execution],
      backgroundColor: 'rgba(96, 165, 250, 0.15)',
      borderColor: 'rgba(96, 165, 250, 0.8)',
      pointBackgroundColor: 'rgba(96, 165, 250, 1)',
      borderWidth: 2,
    }]
  },
  options: {
    scales: { r: { min: 0, max: 5, ticks: { stepSize: 1 } } },
    plugins: { legend: { display: false } }
  }
}
```

### Seccion 3: North Star Metric (1 card large + 3 cards small)

**Card grande (half-width) — NSM Definition:**
- Nombre de la metrica (h2)
- Definicion (texto)
- Formula (monospace)
- Score de evaluacion (de NORTH-STAR § tabla de criterios, total X.X/5.0)

**3 cards pequenas (third-width cada una) — Input Metrics:**
Para cada input metric del arbol de descomposicion:
- Nombre de la metrica
- Target 3m y 12m
- Gauge visual: Chart.js doughnut mostrando % hacia el target

```javascript
// Chart.js config para gauge (doughnut)
{
  type: 'doughnut',
  data: {
    datasets: [{
      data: [currentValue, targetValue - currentValue],
      backgroundColor: ['rgba(52, 211, 153, 0.8)', 'rgba(255, 255, 255, 0.05)'],
      borderWidth: 0,
    }]
  },
  options: {
    circumference: 180, rotation: 270,
    cutout: '75%',
    plugins: { legend: { display: false } }
  }
}
```

### Seccion 4: Competitive Landscape (full-width)

**Tabla comparativa:**
HTML table estilizada con los datos de COMPETITIVE-ANALYSIS § Landscape (matriz de features).
- Primera columna: feature names
- Columnas restantes: producto del usuario + competidores
- Celdas con iconos: ✅ (verde), 🟡 (amarillo), ❌ (rojo)

**Chart:** Scatter plot de posicionamiento (Chart.js).
- Ejes: los 2 ejes del mapa de posicionamiento de COMPETITIVE-ANALYSIS
- Puntos: producto del usuario (acento azul, mas grande) + competidores (gris)
- Labels en cada punto

```javascript
{
  type: 'scatter',
  data: {
    datasets: [
      { label: projectName, data: [{x: X, y: Y}], pointRadius: 10, backgroundColor: 'rgba(96, 165, 250, 0.8)' },
      { label: 'Comp A', data: [{x: X, y: Y}], pointRadius: 7, backgroundColor: 'rgba(255, 255, 255, 0.3)' },
      // ... mas competidores
    ]
  }
}
```

### Seccion 5: Pricing & Economics (3 cards third-width)

**Card 1 — Tier Table:**
Tabla estilizada de PRICING-STRATEGY § Estructura de Precios.
- Filas: features
- Columnas: tiers (Free, Pro, Team, etc.)
- Precios en header con destaque del tier recomendado

**Card 2 — Unit Economics:**
3 gauges (Chart.js doughnut, mismo estilo seccion 3):
- LTV:CAC Ratio (target: 3:1)
- Gross Margin % (target: 70%)
- Payback Period en meses (target: <12)

**Card 3 — Sensitivity:**
Top 3 escenarios del analisis de sensibilidad de PRICING-STRATEGY.
- Cada escenario con icono semaforo (verde/amarillo/rojo)
- Impacto resumido en una linea

### Seccion 6: Financial Projections (full-width)

**Chart principal:** Line chart con 3 lineas (MRR proyecciones).
Datos de `saas-analysis` § Proyecciones.

```javascript
{
  type: 'line',
  data: {
    labels: ['Mes 1', 'Mes 2', ... 'Mes 12'],
    datasets: [
      { label: 'Optimista', data: [...], borderColor: 'rgba(52, 211, 153, 0.8)', borderDash: [5, 5] },
      { label: 'Moderado', data: [...], borderColor: 'rgba(96, 165, 250, 0.8)', borderWidth: 3 },
      { label: 'Conservador', data: [...], borderColor: 'rgba(251, 191, 36, 0.8)', borderDash: [5, 5] },
    ]
  }
}
```

**Chart secundario (debajo o superpuesto):** Bar chart Revenue vs Costs.
- Barras verdes: revenue mensual
- Barras rojas (semi-transparentes): costos mensuales
- Linea horizontal: break-even point marker

**Metricas debajo de los charts:**
Fila de stats: MRR Mes 12 (moderado), ARR proyectado, Break-even month, Runway.

### Seccion 7: OKRs & Roadmap (2 cards half-width)

**Card izquierda — OKRs:**
Para cada Objective:
- Titulo del objetivo (h3)
- Key Results como progress bars:
  - Barra de fondo gris
  - Barra de progreso coloreada (baseline → target, confidence como opacidad)
  - Labels: "KR1: [nombre] — [baseline] → [target]"

Datos de OKRS § OKRs del Trimestre.

**Card derecha — Outcome Roadmap:**
Timeline vertical por trimestres.
Para cada Q:
- Badge con "Q1", "Q2", etc.
- Outcome statement
- Metricas de exito resumidas

Datos de OKRS § Outcome Roadmap.

### Seccion 8: Go-to-Market (full-width)

**Layout:** Fila de 4 elementos + timeline abajo.

**Fila superior:**
- **GTM Motion badge:** PLG / Sales-Led / Community-Led / Content-Led (con icono y color propio)
- **Beachhead:** Segmento primario (de GTM-STRATEGY § Segmento Beachhead)
- **ICP:** Resumen en una linea (de GTM-STRATEGY § ICP)
- **Growth Loop:** Tipo principal (de GTM-STRATEGY § Growth Loops)

**Timeline de lanzamiento (abajo):**
3 columnas: Pre-Launch | Launch Week | Post-Launch
Con los action items clave de cada fase (de GTM-STRATEGY § Plan de Lanzamiento).
Max 4 items por fase para mantener legibilidad.

### Seccion 9: Risks & Verdict (full-width)

**Risk Matrix (mitad izquierda):**
Tabla de riesgos con 3 tipos:
- 🐯 Tiger (riesgo real y urgente) — fila con borde rojo
- 🐘 Elephant (riesgo ignorado) — fila con borde amarillo
- 📄 Paper Tiger (parece peligroso pero no lo es) — fila con borde verde

Datos de STRATEGY-CANVAS § Strategic Risks.

**Build Confidence Breakdown (mitad derecha):**
Tabla con las 7 dimensiones del scoring:

| Dimension | Score | Peso | Justificacion |
|-----------|-------|------|---------------|
| Market Fit | X/10 | 20% | [1 linea] |
| ... | ... | ... | ... |
| **Total** | **X.X/10** | 100% | |

Badge grande con veredicto final: Go ✅ / Caution ⚠️ / No-Go ❌

**CTA final:**
- Si Go: "Ready to build → /build"
- Si Caution: "Review [areas] before building"
- Si No-Go: "Rethink strategy before investing in code"

---

## Mapa de Extraccion de Datos

Para generar el dashboard, el agente debe leer cada documento y extraer:

### De STRATEGY-CANVAS-[nombre].md
- `vision`: § Vision → texto de la cita
- `uvp`: § Value Proposition → UVP en una frase
- `target_customer`: § Target Customer → Primario
- `problems`: § Problem → tabla (top 3)
- `moat`: § Competitive Advantage → texto
- `defensibility`: § Competitive Advantage → Defensibilidad a 12 meses
- `key_metrics`: § Key Metrics → tabla
- `channels`: § Channels → tabla
- `revenue_model`: § Revenue Model → Modelo + Pricing
- `risks`: § Strategic Risks → tabla (Tigers/Elephants/Paper Tigers)

### De NORTH-STAR-[nombre].md
- `nsm_name`: § La Estrella → nombre de la metrica
- `nsm_definition`: § La Estrella → definicion
- `nsm_formula`: § La Estrella → Formula
- `nsm_score`: § Por Que Esta Metrica → Total X.X/5.0
- `input_metrics`: § Descomposicion → array de {name, target_3m, target_12m}

### De COMPETITIVE-ANALYSIS-[nombre].md
- `feature_matrix`: § Landscape → tabla de features
- `positioning_map`: § Landscape → datos del mapa 2D (posiciones de cada competidor)
- `battlecards`: § Battlecards → resumen por competidor
- `gaps`: § Gaps y Oportunidades → tabla

### De PRICING-STRATEGY-[nombre].md
- `pricing_model`: § Modelo de Monetizacion → modelo elegido
- `tiers`: § Estructura de Precios → tabla de tiers
- `unit_economics`: § Unit Economics → tabla (ARPU, COGS, LTV, CAC, Margin, Payback)
- `sensitivity`: § Analisis de Sensibilidad → tabla (top 3 escenarios)

### De saas-analysis-[nombre].md
- `mrr_projections`: § Proyecciones → tablas mes a mes (3 escenarios)
- `revenue_vs_costs`: datos mensuales de revenue y costos
- `break_even`: § Break-even o Executive Summary → mes de break-even
- `saas_metrics`: § Metricas Clave → tabla completa
- `runway`: § Metricas Clave → runway en meses

### De OKRS-[nombre].md
- `nsm_current`: § North Star Metric → Actual
- `nsm_target`: § North Star Metric → Target
- `okrs`: § OKRs del Trimestre → array de {objective, key_results: [{metric, baseline, target, confidence}]}
- `outcome_roadmap`: § Outcome Roadmap → array de {quarter, statement, metrics, features}

### De GTM-STRATEGY-[nombre].md
- `gtm_motion`: § GTM Motion → motion elegida
- `beachhead`: § Segmento Beachhead → descripcion
- `icp`: § Ideal Customer Profile → resumen
- `growth_loops`: § Growth Loops → loops identificados
- `launch_plan`: § Plan de Lanzamiento → pre-launch, launch week, post-launch items
- `success_metrics`: § Metricas de Exito → tabla

---

## Notas para el Agente

1. **No adivinar datos.** Si un documento no tiene un campo esperado, omitir esa parte del dashboard (no inventar valores).
2. **Adaptar, no rigidizar.** Si un documento tiene estructura diferente a la esperada, adaptar la extraccion al formato real.
3. **Colores consistentes.** Usar las CSS custom properties definidas arriba. No agregar colores ad-hoc.
4. **Charts legibles.** Labels con `var(--text-secondary)`, grid lines con `rgba(255,255,255,0.05)`.
5. **Datos como JS object.** Embeber todos los datos extraidos como `const DATA = { hero: {...}, canvas: {...}, ... }` al inicio del `<script>` block, luego referenciar `DATA.hero.vision`, etc.
6. **Graceful degradation.** Si solo hay 5 de 7 docs, generar el dashboard con las secciones disponibles. Secciones sin datos muestran "Analisis no realizado — ejecuta /[comando] para completar".
