# Lean Canvas (Alternativa al BMC para Startups)

> *"El Lean Canvas no es un BMC simplificado — es un BMC para cuando todavía no sabes nada."*

## Qué Hace

Genera un **Lean Canvas** (Ash Maurya) como alternativa al Business Model Canvas cuando el usuario
está en fase de validación temprana. Mientras el BMC asume que conoces tu modelo de negocio, el
Lean Canvas asume que todo son **hipótesis por validar**.

**Cuándo ofrecer Lean Canvas en vez de BMC:**
- El usuario dice "no estoy seguro si funciona", "quiero validar", "es una idea nueva"
- La ruta es MVP
- El Viability Check dio CAUTION
- No hay datos de mercado reales

**Cuándo usar BMC:**
- El modelo de negocio ya está definido
- Hay usuarios o clientes existentes
- La ruta es SaaS Completo o Herramienta Interna

---

## Los 9 Bloques del Lean Canvas

A diferencia del BMC, el Lean Canvas reemplaza bloques "corporativos" por bloques de validación:

| # | Bloque Lean Canvas | Bloque BMC que reemplaza | Por qué |
|---|-------------------|-------------------------|---------|
| 1 | **Problem** (Top 3 problemas) | — | El BMC no tiene bloque de problema explícito |
| 2 | **Customer Segments** | Customer Segments | Igual, pero enfocado en early adopters |
| 3 | **Unique Value Proposition** | Value Propositions | Una sola frase, no múltiples propuestas |
| 4 | **Solution** (Top 3 features) | — | El BMC no tiene solución explícita |
| 5 | **Channels** | Channels | Enfocado en adquisición, no distribución |
| 6 | **Revenue Streams** | Revenue Streams | Igual |
| 7 | **Cost Structure** | Cost Structure | Simplificado |
| 8 | **Key Metrics** | Key Activities | Métricas > Actividades para startups |
| 9 | **Unfair Advantage** | Key Resources + Key Partners | Lo que NO se puede copiar ni comprar |

---

## Workflow

### Fase 1: Entrevista Rápida (~10 min)

Conversacional, no formulario. Máximo 3-4 preguntas por turno.

**Sobre el problema:**
1. ¿Cuáles son los 3 problemas principales que resuelve tu producto?
2. ¿Cómo los resuelven hoy tus usuarios sin tu producto? (alternativas existentes)
3. ¿Quiénes son tus early adopters? (los primeros 10-50 usuarios, no "todo el mercado")

**Sobre la solución:**
4. ¿Cuáles serían las 3 features mínimas para resolver esos problemas?
5. ¿Puedes describir tu producto en una sola frase clara?

**Sobre el negocio:**
6. ¿Cómo piensas cobrar? ¿Cuánto?
7. ¿Cómo llegarás a los primeros 100 usuarios?
8. ¿Qué tienes que sea difícil de copiar? (expertise, datos, red, marca, patente)

> **Regla:** Si el usuario no puede nombrar a sus early adopters con especificidad,
> eso es una hipótesis que DEBE validar. Documentar como tal.

### Fase 2: Generar el Lean Canvas (~10 min)

**Orden de llenado** (cada bloque informa al siguiente):

1. **Problem** → Los 3 problemas más dolorosos del segmento
2. **Customer Segments** → Early adopters específicos (no el mercado total)
3. **Unique Value Proposition** → Una frase: "Ayudamos a [segmento] a [resultado] sin [dolor]"
4. **Solution** → Top 3 features que atacan los 3 problemas
5. **Channels** → Cómo llegas a los early adopters (no a todo el mercado)
6. **Revenue Streams** → Modelo de cobro con precio específico
7. **Cost Structure** → Solo costos de los primeros 6 meses
8. **Key Metrics** → Las 3-5 métricas que demuestran tracción
9. **Unfair Advantage** → Lo que NO se puede copiar (honesto — si no hay, decir "ninguno aún")

### Fase 3: Identificar Hipótesis Riesgosas (~5 min)

Para cada bloque, marcar si es **hecho** o **hipótesis**:

```
| Bloque | Tipo | Confianza | Cómo validar |
|--------|------|-----------|-------------|
| Problem #1 | Hipótesis | Media | Entrevistar 10 early adopters |
| Customer Segment | Hecho | Alta | Ya tengo 3 clientes actuales |
| UVP | Hipótesis | Baja | Landing page con tasa de conversión |
| Revenue: $29/mes | Hipótesis | Media | Smoke test con pricing page |
```

**Regla:** Las hipótesis de **baja confianza** en Problem y Customer Segments son bloqueantes.
Si no sabes si el problema existe o quién lo tiene, todo lo demás es castillo en el aire.

### Fase 4: Presentar al Usuario

Mostrar:
1. **Lean Canvas completo** — los 9 bloques en formato visual
2. **Mapa de hipótesis** — qué es hecho vs. hipótesis
3. **Top 3 riesgos** — las hipótesis más peligrosas
4. **Plan de validación** — cómo validar cada hipótesis riesgosa antes de construir

Preguntar: "¿Esto captura bien tu idea? ¿Hay algo que corregir?"

---

## Output Format

```markdown
# LEAN-CANVAS-[nombre]

> Lean Canvas generado por Forge · [fecha]

## El Canvas

### 1. Problem
| # | Problema | Alternativa Existente |
|---|----------|----------------------|
| 1 | [problema más doloroso] | [cómo lo resuelven hoy] |
| 2 | [segundo problema] | [alternativa] |
| 3 | [tercer problema] | [alternativa] |

### 2. Customer Segments
**Early Adopters:** [descripción específica — no "empresas" sino "agencias de marketing de 5-20 personas"]
**Características:** [qué los hace early adopters vs. mainstream]

### 3. Unique Value Proposition
> "[Una frase clara y memorable]"

**High-Level Concept:** [X para Y — ej: "Uber para mudanzas"]

### 4. Solution
| # | Feature | Problema que resuelve |
|---|---------|----------------------|
| 1 | [feature mínima] | Problem #1 |
| 2 | [feature mínima] | Problem #2 |
| 3 | [feature mínima] | Problem #3 |

### 5. Channels
- **Adquisición:** [cómo llegan los early adopters]
- **Activación:** [primer momento de valor]
- **Retención:** [por qué regresan]

### 6. Revenue Streams
- **Modelo:** [suscripción / freemium / por uso / etc.]
- **Pricing:** [precio específico]
- **Primera venta esperada:** [cuándo]

### 7. Cost Structure
| Concepto | Costo Mensual |
|----------|--------------|
| Infraestructura (Vercel, Supabase) | $XX |
| APIs externas | $XX |
| Marketing inicial | $XX |
| **Total** | **$XX/mes** |

### 8. Key Metrics
1. [Métrica de activación — ej: "% usuarios que completan onboarding"]
2. [Métrica de valor — ej: "tareas completadas por semana"]
3. [Métrica de retención — ej: "usuarios activos día 7"]
4. [Métrica de revenue — ej: "conversión free → paid"]

### 9. Unfair Advantage
[Lo que NO se puede copiar ni comprar fácilmente]
> Si no hay: "Ninguno aún — construir ventaja a través de [estrategia]"

---

## Mapa de Hipótesis

| Bloque | Tipo | Confianza | Validación Propuesta |
|--------|------|-----------|---------------------|
| [bloque] | Hecho/Hipótesis | Alta/Media/Baja | [cómo validar] |

## Top 3 Riesgos

| # | Riesgo | Impacto si falla | Mitigación |
|---|--------|-----------------|------------|
| 1 | [riesgo] | [impacto] | [cómo mitigar] |

## Plan de Validación (Pre-Build)

1. [Acción 1 — validar hipótesis más riesgosa]
2. [Acción 2]
3. [Acción 3]
```

---

## Naming Convention

| Documento | Archivo |
|-----------|---------|
| Lean Canvas | `LEAN-CANVAS-[nombre-kebab].md` |

---

## Integración con La Herrería

- **Reemplaza al BMC** cuando se elige esta alternativa en Step 1
- El PDR (Step 2) consume el Lean Canvas igual que consumiría el BMC
- Los Customer Segments y Solution del Lean Canvas alimentan el UX Research (Step 4)
- Las Key Metrics alimentan `/roi` y `/metas`

---

## Handoff al Step 2

```
✅ LEAN-CANVAS-[nombre].md generado
✅ Hipótesis identificadas: [N] hipótesis, [M] hechos
✅ Top 3 riesgos documentados

Siguiente: PDR Generator (Step 2)
Con el Lean Canvas claro, la entrevista de producto
será más enfocada y el PDR más preciso.

¿Procedemos?
```
