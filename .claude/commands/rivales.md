# /rivales — Análisis Competitivo + Battlecards

> *"Conoce al enemigo antes de la batalla. La mejor espada se forja sabiendo contra qué corta."*

Analiza el panorama competitivo y genera **battlecards** listas para ventas, pitch decks,
y decisiones estratégicas.

## Instrucciones

### Paso 1: Identificar Competidores

Buscar contexto en:
1. `BMC-*.md` o `LEAN-CANVAS-*.md` → Alternativas mencionadas
2. `STRATEGY-CANVAS-*.md` → Competitive advantage
3. `VIABILITY-*.md` → Competidores identificados

Si no hay documentos, preguntar:

```
Para analizar tu competencia necesito:

⚔️ Tu producto
1. ¿Qué problema resuelve tu producto? (en una oración)
2. ¿Quién es tu usuario principal?

🏟️ Competencia
3. ¿Conoces competidores directos? Nombra los que conozcas.
4. ¿Hay competidores indirectos? (resuelven el mismo problema diferente)
5. ¿Cuál es la alternativa "hacer nada" / manual? (Excel, papel, etc.)

💡 Diferenciación
6. ¿Por qué alguien elegiría tu producto sobre los demás?
```

### Paso 2: Research con Perplexity (Recomendado)

Si el MCP de Perplexity está disponible:

```
🔍 Perplexity disponible — voy a investigar:

1. Competidores directos e indirectos de [producto]
2. Features y pricing de cada competidor
3. Reviews y opiniones de usuarios
4. Tendencias del mercado
5. Gaps no atendidos

Esto tomará ~2-3 minutos. ¿Procedo?
```

Si no hay Perplexity, trabajar con la información del usuario y conocimiento general.

### Paso 3: Landscape Competitivo

Generar una **matriz de features** comparativa:

```
| Feature | Tu Producto | Comp. 1 | Comp. 2 | Comp. 3 |
|---------|-------------|---------|---------|---------|
| [feature 1] | ✅/🟡/❌ | ✅/🟡/❌ | ✅/🟡/❌ | ✅/🟡/❌ |
| [feature 2] | ✅/🟡/❌ | ✅/🟡/❌ | ✅/🟡/❌ | ✅/🟡/❌ |
| Pricing | $X/mes | $X/mes | $X/mes | $X/mes |
| Target | [segmento] | [segmento] | [segmento] | [segmento] |

Leyenda: ✅ Sí · 🟡 Parcial · ❌ No
```

### Paso 4: Mapa de Posicionamiento

Crear un mapa 2D de posicionamiento:

```
                    Complejo/Enterprise
                          │
          [Comp. A]       │        [Comp. B]
                          │
    Caro ─────────────────┼───────────────── Barato
                          │
          [Tu producto]   │        [Comp. C]
                          │
                    Simple/SMB
```

Ejes recomendados (elegir los más relevantes):
- Precio vs. Complejidad
- Generalista vs. Especializado
- Self-serve vs. Sales-led
- Automation vs. Manual

### Paso 5: Generar Battlecards

Para cada competidor principal (top 3-5), generar una battlecard:

```markdown
## Battlecard: [Tu Producto] vs [Competidor]

### Quick Facts
- **Fundado:** [año]
- **Pricing:** [modelo + precio]
- **Target:** [segmento]
- **Fortaleza #1:** [su mejor feature/ventaja]
- **Debilidad #1:** [su mayor gap]

### ¿Por Qué Nos Eligen a Nosotros?
1. [razón 1 — con evidencia]
2. [razón 2 — con evidencia]
3. [razón 3 — con evidencia]

### ¿Por Qué Nos Pierden?
1. [razón 1 — ser honesto]
2. [razón 2 — ser honesto]

### Objeciones Comunes y Respuestas
| Objeción | Respuesta |
|----------|----------|
| "[competidor] es más barato" | "[tu respuesta basada en valor]" |
| "[competidor] tiene más features" | "[tu respuesta sobre foco]" |

### Talking Points para Ventas
- ✅ Decir: "[frase que resalta tu ventaja]"
- ❌ No decir: "[frase que te pone en desventaja]"
- 🎯 Pregunta killer: "[pregunta que expone la debilidad del competidor]"
```

### Paso 6: Análisis de Gaps y Oportunidades

```
## Oportunidades No Atendidas

| Gap | Competidores que lo ignoran | Oportunidad para nosotros |
|-----|---------------------------|--------------------------|
| [gap 1] | Todos | Alta — first mover |
| [gap 2] | [Comp. A, B] | Media — niche |
```

### Paso 7: Generar Documento

Crear `COMPETITIVE-ANALYSIS-[nombre].md`:

```markdown
# COMPETITIVE-ANALYSIS-[nombre]

> Análisis competitivo generado por Forge · [fecha]

## Resumen Ejecutivo
[Posición competitiva en 1 párrafo]

## Landscape
[Matriz de features + Mapa de posicionamiento]

## Battlecards
[Una por competidor principal]

## Gaps y Oportunidades
[Tabla de oportunidades no atendidas]

## Recomendación Estratégica
[Qué hacer con esta información — positioning, features a priorizar, pricing adjustments]
```

## Output

```
COMPETITIVE-ANALYSIS-[nombre].md
```

## Siguiente Paso Sugerido

```
⚔️ Análisis competitivo completado.

Próximos pasos recomendados:

→ /brujula    — Strategy Canvas incorporando el análisis competitivo
→ /precio     — Ajustar pricing basado en la competencia
→ /plan       — Pipeline de planificación con diferenciación clara
→ /landing    — Landing page con positioning sharpened
→ /lanzamiento — GTM strategy con battlecards listas
```
