---
name: strategy-summary-template
description: >
  Template para generar el STRATEGY-REPORT-[nombre].md consolidado.
  Resumen ejecutivo de los 7 analisis estrategicos de El Crisol
  en un solo documento markdown legible.
---

# Strategy Report — Template de Generacion

> Este archivo define la estructura del `STRATEGY-REPORT-[nombre].md`.
> El agente lee los 7 documentos de estrategia y genera un resumen consolidado.

---

## Estructura del Documento

```markdown
# STRATEGY-REPORT-[nombre]

> Reporte estrategico consolidado · Generado por Forge El Crisol · [fecha]
> Build Confidence Score: [X.X]/10 — [Go / Caution / No-Go]

---

## Executive Summary

[1 parrafo que responde: Que es, para quien, por que ahora, y si vale la pena construir.
Incluir: UVP, segmento principal, modelo de monetizacion, NSM, y veredicto.]

---

## Metricas Clave

| Metrica | Valor | Benchmark | Status |
|---------|-------|-----------|--------|
| North Star Metric | [nombre]: [target 12m] | — | — |
| LTV:CAC Ratio | [X:1] | >3:1 | [ok/warning/critical] |
| Gross Margin | [X%] | >70% | [ok/warning/critical] |
| Payback Period | [X meses] | <12m | [ok/warning/critical] |
| Break-even | Mes [X] | <18m | [ok/warning/critical] |
| MRR Mes 12 (moderado) | $[X] | — | — |
| Churn Rate | [X%] | <5% | [ok/warning/critical] |

---

## Vision y Posicionamiento

**Vision:** "[declaracion de vision]"

**UVP:** [propuesta de valor en una frase]

**Target Customer:** [segmento primario]

**Moat:** [competitive advantage en una frase]

**Defensibilidad a 12 meses:** [evaluacion]

---

## Competencia

**Posicion:** [resumen de la posicion competitiva en 2-3 lineas]

**Ventajas clave:**
1. [ventaja 1]
2. [ventaja 2]
3. [ventaja 3]

**Gaps explotables:**
- [gap 1]: [oportunidad]
- [gap 2]: [oportunidad]

---

## Monetizacion

**Modelo:** [modelo elegido]

**Tiers:**
| Tier | Precio | Target |
|------|--------|--------|
| [Free] | $0 | [quien] |
| [Pro] | $X/mes | [quien] |
| [Team] | $Y/mes | [quien] |

**Unit Economics:** ARPU $[X] · COGS $[Y] · LTV $[Z] · CAC $[W]

---

## Proyeccion Financiera

| Mes | MRR (Conservador) | MRR (Moderado) | MRR (Optimista) |
|-----|-------------------|----------------|-----------------|
| 3 | $[X] | $[X] | $[X] |
| 6 | $[X] | $[X] | $[X] |
| 12 | $[X] | $[X] | $[X] |

**Break-even:** Mes [X] (escenario moderado)

---

## Metas Q1

**Objective 1:** [titulo]
- KR1: [metrica] — [baseline] → [target]
- KR2: [metrica] — [baseline] → [target]
- KR3: [metrica] — [baseline] → [target]

**Objective 2:** [titulo]
- KR1: [metrica] → [target]
- KR2: [metrica] → [target]

---

## Go-to-Market

**Motion:** [PLG / Sales-Led / Community-Led / Content-Led]
**Beachhead:** [segmento]
**Growth Loop:** [tipo principal]
**Launch Timeline:** [Pre-launch X semanas → Launch → Post-launch]

---

## Riesgos Top 3

| # | Tipo | Riesgo | Mitigacion |
|---|------|--------|------------|
| 1 | [Tiger/Elephant] | [riesgo] | [accion] |
| 2 | [Tiger/Elephant] | [riesgo] | [accion] |
| 3 | [Tiger/Elephant] | [riesgo] | [accion] |

---

## Build Confidence Score

| Dimension | Score | Peso | Justificacion |
|-----------|-------|------|---------------|
| Market Fit | [X]/10 | 20% | [1 linea] |
| Metric Clarity | [X]/10 | 10% | [1 linea] |
| Competitive Position | [X]/10 | 15% | [1 linea] |
| Monetization | [X]/10 | 15% | [1 linea] |
| Financial Viability | [X]/10 | 20% | [1 linea] |
| Execution Plan | [X]/10 | 10% | [1 linea] |
| GTM Feasibility | [X]/10 | 10% | [1 linea] |
| **Total** | **[X.X]/10** | **100%** | **[Go / Caution / No-Go]** |

---

## Siguiente Paso

[Segun veredicto:]
- Go → "Estrategia validada. Usa /build para construir."
- Caution → "Revisar [areas] antes de construir. Luego /build."
- No-Go → "Replantear [gaps]. Re-ejecutar /crisol tras ajustes."

---

## Documentos de Referencia

| Analisis | Documento |
|----------|-----------|
| Vision + Strategy | STRATEGY-CANVAS-[nombre].md |
| North Star Metric | NORTH-STAR-[nombre].md |
| Competencia | COMPETITIVE-ANALYSIS-[nombre].md |
| Pricing | PRICING-STRATEGY-[nombre].md |
| Finanzas | .claude/reports/saas-analysis-[nombre].md |
| Dashboard financiero | .claude/reports/saas-dashboard-[nombre].html |
| OKRs | OKRS-[nombre].md |
| Go-to-Market | GTM-STRATEGY-[nombre].md |
| **Dashboard consolidado** | **.claude/reports/strategy-dashboard-[nombre].html** |
```

---

## Notas para el Agente

1. **Extraer datos reales.** Cada campo debe venir de un documento especifico (no inventar).
2. **Ser conciso.** Este es un resumen ejecutivo — una pagina ideal, max dos.
3. **Status column.** Usar: `ok` (verde, dentro de benchmark), `warning` (amarillo, cerca del limite), `critical` (rojo, fuera de benchmark).
4. **Si falta un documento.** Marcar la seccion como "[Analisis no realizado]" y omitir del scoring.
5. **Links.** Los documentos de referencia al final permiten drill-down para mas detalle.
