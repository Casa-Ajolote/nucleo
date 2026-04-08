# /roi — Reporte de ROI y Métricas SaaS

Genera un análisis financiero y de métricas SaaS basado en los datos del proyecto (BMC, Blueprint, o input directo del usuario). Produce un documento Markdown detallado y una página HTML standalone con gráficas interactivas.

## Instrucciones

### Paso 1: Recopilar Datos

Busca información financiera en el proyecto:

1. **BMC-*.md** → Revenue streams, cost structure, customer segments
2. **VIABILITY-*.md** → Market analysis, pricing, TAM/SAM/SOM
3. **BLUEPRINT-*.md** → Scope, timeline, resources
4. **GRADUATION-PLAN-*.md** → Current state, missing features

Si no hay documentos, hacer entrevista rápida:

```
Para generar tu reporte de ROI necesito algunos datos:

💰 Pricing
1. ¿Cuál es tu precio mensual por usuario/plan? (o tiers si hay varios)
2. ¿Hay plan gratuito? ¿Con qué límites?

📊 Mercado
3. ¿Cuántos usuarios potenciales estimas en tu mercado? (TAM)
4. ¿Cuántos podrías alcanzar realistamente en 12 meses? (SAM)
5. ¿Cuántos esperas capturar en los primeros 6 meses?

💸 Costos
6. ¿Cuánto inviertes/invertirás en marketing mensual?
7. ¿Tienes costos de infraestructura estimados? (Vercel, Supabase, APIs)
8. ¿Hay otros costos fijos? (equipo, herramientas, etc.)

📈 Crecimiento
9. ¿Cómo planeas adquirir usuarios? (orgánico, paid, referrals)
10. ¿Cuál es tu churn rate esperado? (si no sabes, usaré 5% mensual)
```

### Paso 2: Calcular Métricas

Generar las métricas SaaS estándar:

| Métrica | Fórmula | Benchmark |
|---------|---------|-----------|
| **MRR** | Usuarios × Precio mensual | — |
| **ARR** | MRR × 12 | — |
| **CAC** | Gasto marketing / Nuevos usuarios | < LTV/3 |
| **LTV** | ARPU / Churn rate | > 3× CAC |
| **LTV:CAC Ratio** | LTV / CAC | > 3:1 |
| **Payback Period** | CAC / ARPU mensual | < 12 meses |
| **Churn Rate** | Usuarios perdidos / Total usuarios | < 5% mensual |
| **Net Revenue Retention** | (MRR inicio + expansion - churn) / MRR inicio | > 100% |
| **Burn Rate** | Costos totales mensuales - Revenue | — |
| **Runway** | Capital disponible / Burn rate | > 6 meses |
| **Break-even** | Mes donde Revenue ≥ Costos | — |
| **Gross Margin** | (Revenue - COGS) / Revenue | > 70% |

### Paso 3: Proyecciones (3, 6, 12 meses)

Generar proyecciones conservadora, moderada y optimista:

```
Escenario Conservador: Crecimiento 10% mensual, Churn 7%
Escenario Moderado:    Crecimiento 20% mensual, Churn 5%
Escenario Optimista:   Crecimiento 35% mensual, Churn 3%
```

### Paso 4: Generar Documento Markdown

Crear `.claude/reports/saas-analysis-[nombre].md`:

```markdown
# SaaS Analysis — [Nombre]

> Generado por Forge · [fecha]

## Executive Summary
[1 párrafo con los números clave y el veredicto]

## Métricas Clave
[Tabla con todas las métricas calculadas]

## Proyecciones
[Tablas mes a mes para cada escenario]

## Unit Economics
[Desglose de CAC, LTV, payback]

## Riesgos Financieros
[Top 3 riesgos con mitigación]

## Recomendaciones
[3-5 acciones concretas basadas en los números]
```

### Paso 5: Generar Dashboard HTML

Crear `.claude/reports/saas-dashboard-[nombre].html`:

- **Página HTML standalone** (no requiere servidor)
- Usar **Chart.js via CDN** para gráficas
- Incluir:
  - Gráfica de líneas: MRR proyectado (3 escenarios)
  - Gráfica de barras: Revenue vs Costs por mes
  - Gauge: LTV:CAC ratio
  - Tabla: Métricas clave con semáforos (verde/amarillo/rojo)
  - Timeline: Break-even point marcado
- Estilo: Limpio, minimalista, colores del proyecto si hay design system
- Responsive (funciona en mobile)
- Listo para compartir con inversores/stakeholders

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>SaaS Dashboard — [Nombre]</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    /* Estilos minimalistas inline */
  </style>
</head>
<body>
  <!-- Dashboard content with Chart.js -->
</body>
</html>
```

### Paso 6: Research con Perplexity (Opcional)

Si el MCP de Perplexity está disponible:

```
🔍 ¿Quieres enriquecer el reporte con datos de mercado reales?

Puedo investigar:
1. Pricing de competidores directos
2. Benchmarks de la industria (churn, CAC, LTV)
3. Tamaño del mercado (TAM/SAM) con fuentes
4. Tendencias de crecimiento del sector
```

## Output

```
.claude/reports/
├── saas-analysis-[nombre].md      ← Documento completo
└── saas-dashboard-[nombre].html   ← Dashboard visual con gráficas
```

Informar al usuario:

```
📊 Reporte generado:
  📄 .claude/reports/saas-analysis-[nombre].md
  📈 .claude/reports/saas-dashboard-[nombre].html

Para ver el dashboard, abre el HTML en tu navegador:
  open .claude/reports/saas-dashboard-[nombre].html
```

## Siguiente Paso Sugerido

```
📊 Reporte ROI completado.

Próximos pasos recomendados:

→ /precio       — Ajustar pricing basado en los unit economics
→ /estrella     — Definir North Star Metric alineada a revenue
→ /metas        — OKRs basados en las proyecciones financieras
→ /graduate     — Evaluar qué falta para cobrar
→ /lanzamiento  — GTM strategy con CAC/LTV targets
```
