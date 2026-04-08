---
name: go-no-go-scoring
description: >
  Rubrica de scoring para el Build Confidence Score de El Crisol.
  Evalua 7 dimensiones estrategicas con pesos ponderados y produce
  un veredicto Go / Caution / No-Go basado en datos concretos.
---

# Build Confidence Score — Rubrica de Evaluacion

> Cada dimension se evalua 1-10 basandose en datos concretos de los documentos.
> No inventar scores — cada numero debe citarse con el dato que lo justifica.

---

## Dimensiones y Pesos

| # | Dimension | Fuente | Peso |
|---|-----------|--------|------|
| 1 | Market Fit | STRATEGY-CANVAS | 20% |
| 2 | Metric Clarity | NORTH-STAR | 10% |
| 3 | Competitive Position | COMPETITIVE-ANALYSIS | 15% |
| 4 | Monetization | PRICING-STRATEGY | 15% |
| 5 | Financial Viability | saas-analysis | 20% |
| 6 | Execution Plan | OKRS | 10% |
| 7 | GTM Feasibility | GTM-STRATEGY | 10% |

---

## Criterios por Dimension

### 1. Market Fit (20%)

| Score | Criterio |
|-------|----------|
| 9-10 | Problema urgente (magnitud alta), segmento claro y alcanzable, alternativas actuales deficientes |
| 7-8 | Problema real, segmento definido, alternativas existen pero tienen gaps |
| 5-6 | Problema existe pero no es urgente, segmento amplio o poco definido |
| 3-4 | Problema vago, segmento no validado, no queda claro por que ahora |
| 1-2 | Sin problema claro o el mercado ya esta saturado sin diferenciador |

**Dato clave:** Mirar magnitud de los problemas en STRATEGY-CANVAS § Problem.

### 2. Metric Clarity (10%)

| Score | Criterio |
|-------|----------|
| 9-10 | NSM score >4.5/5.0, formula clara, input metrics medibles con stack actual |
| 7-8 | NSM score 3.5-4.5, formula definida, inputs identificados |
| 5-6 | NSM definida pero score <3.5 o formula ambigua |
| 3-4 | NSM elegida pero no pasa los 7 criterios de evaluacion |
| 1-2 | NSM no definida o es una vanity metric |

**Dato clave:** Score total de la tabla de criterios en NORTH-STAR § Por Que Esta Metrica.

### 3. Competitive Position (15%)

| Score | Criterio |
|-------|----------|
| 9-10 | Moat fuerte (red, datos, patente), gaps claros para explotar, posicion unica en el mapa |
| 7-8 | Moat en construccion, battlecards muestran ventajas claras, 2+ gaps explotables |
| 5-6 | Diferenciacion existe pero es debil, competidores fuertes, gaps pero dificiles de explotar |
| 3-4 | Poca diferenciacion, mercado commoditizado, sin gaps claros |
| 1-2 | Sin moat, competidores con ventaja en todos los ejes, red ocean |

**Dato clave:** Moat y defensibilidad de STRATEGY-CANVAS § Competitive Advantage + gaps de COMPETITIVE-ANALYSIS.

### 4. Monetization (15%)

| Score | Criterio |
|-------|----------|
| 9-10 | Gross Margin >80%, LTV:CAC >5:1, modelo validado con WTP, payback <6m |
| 7-8 | Gross Margin >70%, LTV:CAC >3:1, modelo claro, payback <12m |
| 5-6 | Gross Margin 50-70%, LTV:CAC 2-3:1, modelo definido pero no validado |
| 3-4 | Gross Margin <50%, LTV:CAC <2:1, modelo incierto |
| 1-2 | Sin modelo de monetizacion claro o unit economics negativos |

**Dato clave:** Tabla de unit economics en PRICING-STRATEGY § Unit Economics.

### 5. Financial Viability (20%)

| Score | Criterio |
|-------|----------|
| 9-10 | Break-even <6m, MRR moderado cubre costos, runway >12m, sensibilidad positiva |
| 7-8 | Break-even <12m, MRR moderado viable, runway >6m |
| 5-6 | Break-even 12-18m, proyecciones moderadas apretadas, necesita funding |
| 3-4 | Break-even >18m, solo escenario optimista es viable |
| 1-2 | Sin break-even visible en 24m o costos superan revenue en todos los escenarios |

**Dato clave:** Proyecciones de saas-analysis § Proyecciones + break-even point.

### 6. Execution Plan (10%)

| Score | Criterio |
|-------|----------|
| 9-10 | OKRs SMART con confidence >70%, outcome roadmap con metricas claras, cadencia definida |
| 7-8 | OKRs bien definidos, confidence 50-70%, roadmap con outcomes |
| 5-6 | OKRs definidos pero confidence baja o targets poco ambiciosos |
| 3-4 | OKRs vagos, roadmap de features (no outcomes), sin cadencia |
| 1-2 | Sin plan medible o metas inalcanzables |

**Dato clave:** Scores de confianza en OKRS § KRs + tipo de roadmap (features vs outcomes).

### 7. GTM Feasibility (10%)

| Score | Criterio |
|-------|----------|
| 9-10 | GTM motion validada, beachhead especifico y alcanzable, growth loop claro, plan de lanzamiento concreto |
| 7-8 | GTM motion elegida con justificacion, beachhead definido, launch plan con timeline |
| 5-6 | GTM motion definida pero beachhead amplio, plan de lanzamiento generico |
| 3-4 | GTM motion no clara, sin beachhead, "launch and pray" |
| 1-2 | Sin estrategia de distribucion o dependencia de un canal no controlado |

**Dato clave:** GTM motion + beachhead de GTM-STRATEGY.

---

## Calculo del Score Final

```
Score Final = (D1 × 0.20) + (D2 × 0.10) + (D3 × 0.15) + (D4 × 0.15) + (D5 × 0.20) + (D6 × 0.10) + (D7 × 0.10)
```

### Si Faltan Dimensiones

Si el usuario salto algun paso, esa dimension se marca **N/A** y su peso se redistribuye proporcionalmente entre las dimensiones completadas.

Ejemplo: si salto Metas (10%), los pesos se reescalan:
- Market Fit: 20% → 22.2%
- Financial Viability: 20% → 22.2%
- etc.

---

## Veredicto

| Score | Veredicto | Significado |
|-------|-----------|-------------|
| **8.0 - 10.0** | **Go** ✅ | Estrategia solida. Construir con confianza. |
| **5.0 - 7.9** | **Caution** ⚠️ | Areas debiles requieren atencion. Construir con precaucion o ajustar primero. |
| **1.0 - 4.9** | **No-Go** ❌ | Gaps fundamentales. Replantear antes de invertir en construccion. |

### Reportar el Veredicto

Para cada dimension, incluir:
1. **Score** (X/10)
2. **Dato clave** que justifica el score (cita del documento)
3. **Recomendacion** si el score es <7 (que hacer para mejorar)

Ejemplo:
```
4. Monetization: 6/10
   Dato: Gross Margin 62%, LTV:CAC 2.4:1 (debajo del benchmark 3:1)
   Recomendacion: Subir precio del tier Pro o reducir COGS de infraestructura
```
