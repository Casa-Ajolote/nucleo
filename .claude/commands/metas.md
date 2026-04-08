# /metas — OKRs + Outcome Roadmap

> *"Definir hacia dónde apunta el acero. Sin metas claras, el esfuerzo se dispersa."*

Define **OKRs** (Objectives and Key Results) y transforma un roadmap de features en un
**Outcome Roadmap** que mide resultados, no entregables.

## Instrucciones

### Paso 1: Recopilar Contexto

Buscar información en el proyecto:
1. `NORTH-STAR-*.md` → North Star Metric e input metrics
2. `STRATEGY-CANVAS-*.md` → Visión, key metrics
3. `BLUEPRINT-*.md` → Fases de construcción
4. `USER-STORIES-*.md` → Epics y stories
5. `GTM-STRATEGY-*.md` → Métricas de lanzamiento
6. `BMC-*.md` → Modelo de negocio

Si no hay documentos, entrevista:

```
Para definir tus metas necesito entender:

🎯 Contexto
1. ¿En qué etapa está tu producto? (idea, MVP, beta, lanzado, crecimiento)
2. ¿Cuál es el objetivo principal del próximo trimestre?
3. ¿Tienes equipo o trabajas solo?

📊 Métricas
4. ¿Mides algo actualmente? ¿Qué?
5. ¿Tienes North Star Metric? (si no, puedo ayudarte con /estrella)

🗺️ Roadmap
6. ¿Tienes un listado de features o ideas pendientes?
7. ¿Cómo priorizas hoy? (instinto, usuario, datos)
```

### Paso 2: Definir OKRs

**Estructura de un OKR:**

```
Objective: [Qué queremos lograr — cualitativo, inspirador]
├── KR1: [Métrica específica] de [baseline] a [target] para [fecha]
├── KR2: [Métrica específica] de [baseline] a [target] para [fecha]
└── KR3: [Métrica específica] de [baseline] a [target] para [fecha]
```

**Reglas para buenos OKRs:**

| Componente | Regla | Ejemplo malo | Ejemplo bueno |
|-----------|-------|-------------|---------------|
| **Objective** | Cualitativo, inspirador, no métrica | "Subir MRR a $10K" | "Demostrar product-market fit" |
| **Key Result** | Cuantitativo, SMART, sin ambigüedad | "Mejorar retención" | "Retención D30 de 20% a 40%" |
| **Key Result** | Mide RESULTADO, no actividad | "Publicar 10 blog posts" | "Tráfico orgánico de 500 a 2K visitas/mes" |
| **Key Result** | Stretch pero alcanzable (70% confidence) | "100K usuarios en 1 mes" | "500 usuarios activos semanales" |

**Máximo 3 Objectives por trimestre, 3-5 KRs por Objective.**

### Paso 3: Generar OKRs por Etapa

Adaptar según la etapa del producto:

**Pre-Launch / MVP:**
```
O1: Validar que el problema es real y pagable
├── KR1: Completar 10 entrevistas Mom Test con [ICP]
├── KR2: 3+ entrevistados ofrecen pagar antes de ver el producto
└── KR3: Identificar 1 canal de adquisición con CAC < $50

O2: Construir un MVP que demuestre valor en 5 minutos
├── KR1: Time-to-value < 5 minutos desde signup
├── KR2: NPS de beta users > 40
└── KR3: 30%+ de beta users regresan en semana 2
```

**Post-Launch / Growth:**
```
O1: Establecer tracción sostenible
├── KR1: MRR de $[X] a $[Y]
├── KR2: Churn mensual < 5%
└── KR3: LTV:CAC ratio > 3:1

O2: Construir el loop de crecimiento
├── KR1: [North Star Metric] de [X] a [Y]
├── KR2: Referral rate > 10% de usuarios activos
└── KR3: Organic signups > 50% del total
```

### Paso 4: Transformar Features en Outcomes

Convertir un roadmap de features en un **Outcome Roadmap**:

**Feature Roadmap (malo):**
```
Q1: Dashboard, Export PDF, Filtros avanzados
Q2: API pública, Integraciones, Mobile app
```

**Outcome Roadmap (bueno):**
```
Q1: Enable [segmento] to [resultado] so that [impacto de negocio]
  → "Enable realtors to see all their listings performance in one place
     so that they spend 0 time switching between tools"
  Métricas: Time-in-app +30%, Tab switches -50%
  Features habilitadoras: Dashboard, Filtros

Q2: Enable [segmento] to [resultado] so that [impacto de negocio]
  → "Enable realtors to share staging results with clients instantly
     so that listing-to-sale time decreases 20%"
  Métricas: Share rate >40%, Sale cycle -20%
  Features habilitadoras: Export PDF, Client portal
```

### Paso 5: Checkpoint con Usuario

```
📋 Propuesta de OKRs — [Nombre]

Objective 1: [título]
  KR1: [métrica] — [baseline] → [target]
  KR2: [métrica] — [baseline] → [target]
  KR3: [métrica] — [baseline] → [target]

Objective 2: [título]
  KR1: ...

Outcome Roadmap:
  Q1: [outcome statement]
  Q2: [outcome statement]

¿Ajustamos algo? ¿Los targets son realistas para tu contexto?
```

### Paso 6: Generar Documento

Crear `OKRS-[nombre].md`:

```markdown
# OKRS-[nombre]

> OKRs + Outcome Roadmap generados por Forge · [fecha]
> Período: [Q1/Q2/etc.] [año]
> Etapa: [Pre-launch | Growth | Scale]

## North Star Metric

⭐ **[Nombre]:** [definición]
**Actual:** [valor] → **Target:** [valor]

---

## OKRs del Trimestre

### Objective 1: [Título inspirador]

> [Descripción de por qué esto importa]

| KR | Métrica | Baseline | Target | Confianza |
|----|---------|----------|--------|-----------|
| 1 | [métrica] | [actual] | [target] | [%] |
| 2 | [métrica] | [actual] | [target] | [%] |
| 3 | [métrica] | [actual] | [target] | [%] |

**Initiatives:**
1. [Acción concreta que mueve los KRs]
2. [Acción concreta]

### Objective 2: [Título]
[mismo formato]

---

## Outcome Roadmap

### Q[N]: [Outcome Statement]

> Enable [segmento] to [resultado] so that [impacto]

**Métricas de éxito:**
| Métrica | Baseline | Target |
|---------|----------|--------|
| [métrica] | [actual] | [target] |

**Features habilitadoras:**
- [feature 1] → impacta [KR]
- [feature 2] → impacta [KR]

### Q[N+1]: [Outcome Statement]
[mismo formato]

---

## Cadencia de Review

| Frecuencia | Qué revisar | Acción |
|-----------|-------------|--------|
| Semanal | Input metrics | Ajustar tácticas |
| Quincenal | KR progress | Score 0-1.0 por KR |
| Final de trimestre | OKR scoring | Retrospectiva + nuevos OKRs |

## Scoring Guide

| Score | Significado |
|-------|------------|
| 0.0-0.3 | No avanzamos — replantear |
| 0.4-0.6 | Progreso parcial — normal para stretch goals |
| 0.7-1.0 | Logrado o superado — ¿el target era ambicioso? |
```

## Output

```
OKRS-[nombre].md
```

## Siguiente Paso Sugerido

```
🎯 OKRs y Outcome Roadmap definidos.

Próximos pasos recomendados:

→ /kanban       — Tablero para trackear initiatives y features
→ /roi          — Proyecciones financieras alineadas a tus OKRs
→ /estrella     — Profundizar tu North Star Metric
→ /plan         — Pipeline de planificación para el próximo sprint
→ /lanzamiento  — GTM strategy alineada a tus outcomes
```
