# /precio — Estrategia de Pricing y Monetización

> *"El precio no es un número — es una declaración de valor."*

Diseña tu modelo de monetización y estructura de precios. Evalúa múltiples modelos,
calcula unit economics, y produce una recomendación fundamentada.

## Instrucciones

### Paso 1: Recopilar Contexto

Buscar información en el proyecto:
1. `BMC-*.md` o `LEAN-CANVAS-*.md` → Revenue streams, segmentos
2. `STRATEGY-CANVAS-*.md` → Revenue model, competitive advantage
3. `VIABILITY-*.md` → Datos de mercado
4. `PDR-*.md` → Features y scope

Si no hay documentos, entrevista rápida:

```
Para diseñar tu estrategia de pricing necesito entender:

💰 Valor
1. ¿Qué problema resuelve tu producto? ¿Cuánto vale resolver ese problema?
2. ¿Cuánto tiempo/dinero ahorra al usuario?
3. ¿Hay un ROI cuantificable? (ej: "ahorra 10h/semana → $500/mes en tiempo")

👥 Mercado
4. ¿Quiénes son tus usuarios? (freelancers, SMBs, enterprise)
5. ¿Cuánto pagan por alternativas hoy?
6. ¿Cuál es la disposición a pagar de tu segmento?

📊 Modelo
7. ¿Tienes preferencia por algún modelo? (suscripción, freemium, por uso, etc.)
8. ¿Hay costos variables por usuario? (API calls, storage, etc.)
9. ¿Necesitas un tier gratuito para tracción?
```

### Paso 2: Evaluar Modelos de Monetización

Analizar cada modelo contra el producto:

| Modelo | Mejor Para | Riesgo | Ejemplo |
|--------|-----------|--------|---------|
| **Flat-rate Subscription** | Valor predecible, uso similar entre usuarios | Churn si no se usa | Netflix, Basecamp |
| **Tiered Subscription** | Features escalonadas, múltiples segmentos | Complejidad de decision | Notion, Slack |
| **Freemium** | Producto viral, bajo marginal cost | Conversión baja (2-5%) | Spotify, Figma |
| **Usage-based** | Valor proporcional al uso, APIs | Revenue impredecible | AWS, Twilio |
| **Per-seat** | Productos de equipo, colaboración | Seat-sharing fraud | GitHub, Linear |
| **Hybrid** | Combinación de los anteriores | Complejidad | HubSpot, Vercel |

Para cada modelo relevante, evaluar:
- ✅ Fit con el producto (1-5)
- ✅ Simplicidad para el usuario (1-5)
- ✅ Predecibilidad de revenue (1-5)
- ✅ Alineación incentivos usuario-producto (1-5)

### Paso 3: Diseñar Estructura de Tiers

Si el modelo elegido tiene tiers, diseñar 2-4 planes:

```
| | Free | Pro | Team | Enterprise |
|--|------|-----|------|------------|
| Precio | $0 | $X/mes | $Y/mes | Custom |
| [Feature 1] | ✅ limitado | ✅ | ✅ | ✅ |
| [Feature 2] | ❌ | ✅ | ✅ | ✅ |
| [Feature 3] | ❌ | ❌ | ✅ | ✅ |
| [Límite] | [N] | [N×10] | Ilimitado | Custom |
| Soporte | Community | Email | Priority | Dedicado |
```

**Reglas de pricing:**
- El tier gratuito debe ser útil (no crippled) pero crear deseo de upgrade
- La diferencia entre Free y Pro debe ser una "feature killer" que los power users necesitan
- El tier Team debe justificarse por colaboración, no por features individuales
- Annual billing = 2 meses gratis (estándar de la industria)

### Paso 4: Calcular Unit Economics

```
| Métrica | Valor |
|---------|-------|
| ARPU (Average Revenue Per User) | $X/mes |
| COGS por usuario (infra, API, soporte) | $X/mes |
| Gross Margin por usuario | X% |
| CAC estimado | $X |
| LTV (ARPU / Churn Rate) | $X |
| LTV:CAC Ratio | X:1 |
| Payback Period (CAC / ARPU) | X meses |
| Break-even (usuarios) | X usuarios |
```

**Benchmarks SaaS saludable:**
- Gross Margin > 70%
- LTV:CAC > 3:1
- Payback Period < 12 meses

### Paso 5: Análisis de Sensibilidad

```
¿Qué pasa si...?

| Escenario | Impacto en Revenue | Impacto en Unit Economics |
|-----------|-------------------|-------------------------|
| Precio +20% | [impacto] | [impacto] |
| Precio -20% | [impacto] | [impacto] |
| Churn sube a 10% | [impacto] | [impacto] |
| Conversión free→paid baja a 2% | [impacto] | [impacto] |
| COGS sube 50% | [impacto] | [impacto] |
```

### Paso 6: Research con Perplexity (Opcional)

Si el MCP de Perplexity está disponible:

```
🔍 ¿Quieres investigar pricing de competidores?

Puedo analizar:
1. Pricing pages de competidores directos
2. Benchmarks de pricing por industria/sector
3. Tendencias de modelos de monetización
4. Willingness-to-pay por segmento
```

### Paso 7: Generar Documento

Crear `PRICING-STRATEGY-[nombre].md`:

```markdown
# PRICING-STRATEGY-[nombre]

> Estrategia de pricing generada por Forge · [fecha]

## Resumen Ejecutivo
[1 párrafo: modelo elegido, pricing, unit economics clave]

## Modelo de Monetización
[Modelo elegido con justificación]

## Estructura de Precios
[Tabla de tiers con features y precios]

## Unit Economics
[Tabla con ARPU, COGS, LTV, CAC, etc.]

## Análisis de Sensibilidad
[Tabla de escenarios]

## Competitive Pricing
[Comparación con competidores si se investigó]

## Recomendación
[Pricing recomendado con justificación]

## Próximos Pasos
1. Validar pricing con 5+ usuarios potenciales
2. Implementar pricing page
3. A/B test después de 100 signups
```

## Output

```
PRICING-STRATEGY-[nombre].md
```

## Siguiente Paso Sugerido

```
💰 Estrategia de pricing completada.

Próximos pasos recomendados:

→ /plan     — Incluir el pricing en el pipeline de planificación
→ /roi      — Proyecciones financieras con tu nuevo pricing
→ /brujula  — Strategy Canvas completo
→ /landing  — Landing page con pricing page incluida
→ /rivales  — Comparar tu pricing con competidores
```
