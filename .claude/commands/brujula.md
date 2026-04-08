# /brujula — Product Vision & Strategy Canvas

> *"La brújula antes de forjar. Sin dirección clara, hasta el mejor acero se desperdicia."*

Define la visión y estrategia de producto ANTES de entrar al pipeline de planificación.
Genera un **Product Strategy Canvas** de 9 secciones + una declaración de visión inspiradora.

## Instrucciones

### Paso 1: Entender el Producto

Busca contexto existente:
1. `BMC-*.md` o `LEAN-CANVAS-*.md` → Modelo de negocio
2. `VIABILITY-*.md` → Análisis de viabilidad
3. `PDR-*.md` → Definición de producto

Si no hay documentos, hacer entrevista:

```
Para definir tu brújula estratégica necesito entender:

🎯 Visión
1. ¿Qué quieres que tu producto logre en 3 años?
2. ¿Cómo se ve el mundo si tu producto triunfa?

👥 Usuarios
3. ¿Quiénes son tus usuarios? ¿Cómo se benefician?
4. ¿Hay un segmento que deberías atacar PRIMERO?

⚔️ Competencia
5. ¿Quiénes son tus competidores directos e indirectos?
6. ¿Por qué ganarías contra ellos?

📈 Crecimiento
7. ¿Cuál es tu modelo de monetización?
8. ¿Cuál sería tu North Star Metric?
```

### Paso 2: Generar Product Vision

Crear 3-5 variaciones de una declaración de visión. Cada una debe ser:
- **Inspiradora** — motiva al equipo
- **Alcanzable** — no es ciencia ficción
- **Emocional** — conecta con un propósito
- **Memorable** — una oración que se queda

Formato: "Un mundo donde [grupo] puede [logro] sin [obstáculo]"

Presentar las 3-5 opciones y pedir al usuario que elija o combine.

### Paso 3: Generar Strategy Canvas (9 secciones)

| # | Sección | Qué define |
|---|---------|-----------|
| 1 | **Vision** | Declaración de visión elegida |
| 2 | **Target Customer** | Segmento primario + secondary. Quién NO es cliente. |
| 3 | **Problem** | Top 3 problemas, magnitud del dolor, alternativas actuales |
| 4 | **Value Proposition** | UVP en una frase + propuesta expandida por segmento |
| 5 | **Competitive Advantage** | Moat: qué no se puede copiar. Defensibilidad real. |
| 6 | **Key Metrics** | 3-5 métricas que demuestran progreso hacia la visión |
| 7 | **Channels** | Adquisición, activación, retención — por orden de prioridad |
| 8 | **Revenue Model** | Cómo captura valor. Pricing tentativo. Unit economics. |
| 9 | **Strategic Risks** | Top 3 riesgos + mitigación (usa modelo Tigers/Paper Tigers/Elephants) |

### Paso 4: Pre-Mortem Estratégico (Opcional)

Si el proyecto es ambicioso o el usuario lo pide:

```
🎯 ¿Quieres hacer un Pre-Mortem rápido?

Imagina que tu proyecto fracasó en 6 meses.
Vamos a descubrir por qué — antes de que pase.
```

Si acepta, leer `assets/pre-mortem.md` y ejecutar el análisis.
Incorporar los hallazgos en la sección 9 (Strategic Risks) del canvas.

### Paso 5: Research con Perplexity (Opcional)

Si el MCP de Perplexity está disponible:

```
🔍 ¿Quieres enriquecer tu estrategia con investigación de mercado?

Puedo investigar:
1. Análisis de competidores (features, pricing, posicionamiento)
2. Tamaño del mercado (TAM/SAM/SOM)
3. Tendencias del sector
4. Benchmarks de la industria
```

### Paso 6: Generar Documento

Crear `STRATEGY-CANVAS-[nombre].md`:

```markdown
# STRATEGY-CANVAS-[nombre]

> Strategy Canvas generado por Forge · [fecha]

## Vision

> "[Declaración de visión elegida]"

## 1. Target Customer

**Primario:** [descripción específica]
**Secundario:** [si aplica]
**No es cliente:** [quién explícitamente NO servimos]

## 2. Problem

| # | Problema | Magnitud | Alternativa Actual |
|---|----------|---------|-------------------|
| 1 | [problema] | [alta/media/baja] | [cómo lo resuelven hoy] |

## 3. Value Proposition

> "[UVP en una frase]"

[Propuesta expandida]

## 4. Competitive Advantage (Moat)

[Qué no se puede copiar — datos, red, expertise, patente, marca]
**Defensibilidad a 12 meses:** [evaluación honesta]

## 5. Key Metrics

| Métrica | Target 3 meses | Target 12 meses |
|---------|----------------|-----------------|
| [métrica] | [valor] | [valor] |

## 6. Channels

| Prioridad | Canal | CAC Estimado | Timeline |
|-----------|-------|-------------|----------|
| 1 | [canal] | [costo] | [cuándo activo] |

## 7. Revenue Model

- **Modelo:** [suscripción / freemium / etc.]
- **Pricing:** [estructura de precios]
- **Unit Economics:** LTV: $X | CAC: $X | Ratio: X:1

## 8. Strategic Risks

| Tipo | Riesgo | Mitigación |
|------|--------|-----------|
| Tiger | [riesgo real] | [acción] |
| Elephant | [riesgo ignorado] | [forzar conversación] |

---

## Próximos Pasos

Usar `/plan` para convertir esta estrategia en un Blueprint ejecutable.
```

## Output

```
.claude/reports/STRATEGY-CANVAS-[nombre].md
```

## Siguiente Paso Sugerido

```
🧭 Brújula completada.

Tu estrategia está definida. Próximos pasos recomendados:

→ /plan        — Convertir esta estrategia en un Blueprint ejecutable
→ /estrella    — Definir tu North Star Metric con más profundidad
→ /precio      — Diseñar tu estrategia de pricing detallada
→ /rivales     — Análisis competitivo profundo con battlecards
→ /roi         — Proyecciones financieras basadas en tu strategy canvas
```
