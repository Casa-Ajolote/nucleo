# /estrella — North Star Metric

> *"La estrella que guía la forja. Sin ella, construyes rápido pero sin rumbo."*

Define la **North Star Metric** de tu producto: la única métrica que mejor captura
el valor que entregas a tus clientes y predice el éxito a largo plazo del negocio.

## Instrucciones

### Paso 1: Clasificar el Negocio

Buscar contexto en:
1. `BMC-*.md` o `LEAN-CANVAS-*.md` → Propuesta de valor
2. `STRATEGY-CANVAS-*.md` → Key metrics
3. `PDR-*.md` → Features core

Determinar el tipo de negocio:

| Tipo | Descripción | NSM típica | Ejemplos |
|------|------------|-----------|----------|
| **Attention** | Monetiza tiempo/engagement del usuario | Tiempo de uso, DAU | Facebook, YouTube, TikTok |
| **Transaction** | Monetiza cada transacción | Revenue por transacción, GMV | Airbnb, Shopify, Stripe |
| **Productivity** | Monetiza eficiencia/output del usuario | Tareas completadas, tiempo ahorrado | Slack, Notion, Figma |

Si no hay documentos, preguntar:

```
Para definir tu North Star Metric necesito entender:

⭐ Tu producto
1. ¿Qué es lo MÁS valioso que tu producto hace por el usuario?
2. ¿Cómo sabes que un usuario está obteniendo valor? (¿qué acción lo demuestra?)
3. ¿Tu negocio gana dinero por atención (ads), transacciones, o productividad (suscripción)?

📊 Métricas actuales
4. ¿Estás midiendo algo hoy? ¿Qué?
5. ¿Qué número, si sube, te haría feliz?
```

### Paso 2: Generar Candidatas

Producir 3-5 métricas candidatas y evaluarlas contra 7 criterios:

| Criterio | Pregunta | Peso |
|----------|----------|------|
| **Expresa valor** | ¿Cuando sube, significa que usuarios reciben más valor? | 20% |
| **Leading indicator** | ¿Predice revenue futuro (no lo mide directamente)? | 20% |
| **Accionable** | ¿El equipo puede influir directamente en ella? | 15% |
| **Medible** | ¿Se puede medir de forma confiable con el stack actual? | 15% |
| **Simple** | ¿Se entiende sin explicación? | 10% |
| **No vanity** | ¿Es imposible que suba sin que el producto mejore? | 10% |
| **Alineadora** | ¿Todos los equipos pueden contribuir a ella? | 10% |

Scoring 1-5 por criterio, promedio ponderado.

### Paso 3: Descomponer la Ganadora

La NSM se descompone en **input metrics** que el equipo puede optimizar:

```
                    ⭐ North Star Metric
                    [nombre]: [definición]
                           │
              ┌────────────┼────────────┐
              │            │            │
         [Input 1]   [Input 2]   [Input 3]
         [nombre]    [nombre]    [nombre]

Ejemplo para Airbnb:
                    ⭐ Nights Booked
                           │
              ┌────────────┼────────────┐
              │            │            │
         Listings     Search→Book   Guest
         Created      Conversion    Retention
```

Para cada input metric:
- **Definición exacta** (qué mide, cómo se calcula)
- **Owner** (qué equipo/persona la optimiza)
- **Target** a 3 y 12 meses
- **Cómo mejorarla** (1-2 acciones concretas)

### Paso 4: Definir Cadencia de Medición

```
| Métrica | Frecuencia | Herramienta | Alert |
|---------|-----------|------------|-------|
| ⭐ NSM | Semanal | [PostHog/Mixpanel/custom] | Si baja >10% vs semana anterior |
| Input 1 | Diario | [herramienta] | Si baja >15% |
| Input 2 | Diario | [herramienta] | Si baja >15% |
| Input 3 | Semanal | [herramienta] | Si baja >10% |
```

### Paso 5: Generar Documento

Crear `NORTH-STAR-[nombre].md`:

```markdown
# NORTH-STAR-[nombre]

> North Star Metric definida por Forge · [fecha]

## La Estrella

⭐ **[Nombre de la métrica]**

> [Definición en una oración]

**Tipo de negocio:** [Attention | Transaction | Productivity]
**Fórmula:** [cómo se calcula exactamente]
**Frecuencia:** [diario | semanal | mensual]

## Por Qué Esta Métrica

| Criterio | Score (1-5) | Justificación |
|----------|------------|---------------|
| Expresa valor | [X] | [razón] |
| Leading indicator | [X] | [razón] |
| Accionable | [X] | [razón] |
| Medible | [X] | [razón] |
| Simple | [X] | [razón] |
| No vanity | [X] | [razón] |
| Alineadora | [X] | [razón] |
| **Total** | **[X.X/5.0]** | |

## Candidatas Evaluadas

| Métrica | Score | Por Qué No |
|---------|-------|-----------|
| [candidata 2] | [X.X] | [razón] |
| [candidata 3] | [X.X] | [razón] |

## Descomposición

[Diagrama de árbol: NSM → Input Metrics]

### Input 1: [Nombre]
- **Definición:** [qué mide]
- **Target 3m:** [valor]
- **Target 12m:** [valor]
- **Cómo mejorar:** [acciones]

### Input 2: [Nombre]
[mismo formato]

## Cadencia y Alertas

[Tabla de medición]

## Implementación

**Stack de medición recomendado:**
- [PostHog | Mixpanel | custom] para event tracking
- Dashboard semanal con NSM + inputs
- Alertas automáticas si baja >10%
```

## Output

```
NORTH-STAR-[nombre].md
```

## Siguiente Paso Sugerido

```
⭐ North Star definida: [nombre de la métrica]

Próximos pasos recomendados:

→ /roi      — Proyecciones financieras alineadas a tu North Star
→ /plan     — Pipeline de planificación con métricas integradas
→ /brujula  — Strategy Canvas completo
→ /metas    — OKRs basados en tu North Star
→ /kanban   — Tablero para trackear features que impactan la NSM
```
