# Pre-Mortem (Análisis de Riesgos de Proyecto)

> *"No esperes a que el proyecto falle para preguntarte por qué falló."*

## Qué Hace

Ejecuta un **pre-mortem** antes de que el proyecto empiece la construcción. En vez de
preguntar "¿qué podría salir mal?", asume que el proyecto YA FALLÓ y pregunta "¿por qué falló?".
Esto desbloquea sesgos cognitivos que el optimismo natural oculta.

Clasifica riesgos usando el modelo **Tigers / Paper Tigers / Elephants**:

| Tipo | Qué es | Acción |
|------|--------|--------|
| **Tigers** | Riesgos reales y probables | Mitigar activamente |
| **Paper Tigers** | Riesgos percibidos pero manejables | Documentar plan, no obsesionarse |
| **Elephants** | Riesgos ignorados que nadie menciona | Forzar conversación |

**Cuándo usar:**
- Antes del Blueprint (Step 10) — complementa la Security Audit (Step 9)
- Antes de un sprint grande
- Cuando el equipo tiene "demasiada confianza" en el plan
- Como parte de `/brujula` o `/graduate`

---

## Inputs

- `PDR-[nombre].md` — Scope, features, timeline
- `TECH-SPEC-[nombre].md` — Stack, integraciones, arquitectura
- `BMC-[nombre].md` o `LEAN-CANVAS-[nombre].md` — Modelo de negocio, hipótesis
- `VIABILITY-[nombre].md` — Riesgos ya identificados (si existe)
- Contexto conversacional del usuario

---

## Workflow

### Fase 1: El Escenario de Fracaso (~5 min)

Presentar al usuario:

```
Imagina que estamos 6 meses en el futuro.
Tu proyecto [nombre] fracasó completamente.
Los usuarios no lo usan, el dinero se acabó, el equipo está frustrado.

Vamos a descubrir POR QUÉ fracasó — antes de que pase.
```

Hacer preguntas provocadoras:
1. "Si tu proyecto fracasara, ¿cuál sería la razón #1?"
2. "¿Qué es lo que más te preocupa y no has dicho en voz alta?"
3. "¿Qué supuesto de tu plan es el más débil?"
4. "Si un competidor te copiara mañana, ¿qué te quitaría?"

### Fase 2: Identificación de Riesgos (~10 min)

Analizar los documentos del proyecto y la conversación. Buscar riesgos en 6 categorías:

**1. Riesgos de Producto:**
- ¿El problema es real o asumido?
- ¿El MVP resuelve el problema o solo una parte?
- ¿Hay product-market fit o es un "nice to have"?

**2. Riesgos Técnicos:**
- ¿Hay integraciones con APIs inestables o nuevas?
- ¿El stack soporta lo que se quiere construir?
- ¿Hay dependencias de terceros críticas?

**3. Riesgos de Mercado:**
- ¿El timing es correcto?
- ¿Hay competidores que no se consideraron?
- ¿El canal de adquisición está validado?

**4. Riesgos de Ejecución:**
- ¿El scope es realista para el timeline?
- ¿Hay conocimiento técnico faltante?
- ¿Quién mantiene el producto post-launch?

**5. Riesgos Financieros:**
- ¿Los costos están bien estimados?
- ¿Hay runway suficiente para pivotar si falla?
- ¿El pricing es validado o asumido?

**6. Riesgos de Equipo/Humanos:**
- ¿Hay un solo punto de falla (una persona)?
- ¿El fundador tiene sesgo de confirmación sobre la idea?
- ¿Hay alignment entre stakeholders?

### Fase 3: Clasificar (Tigers / Paper Tigers / Elephants) (~5 min)

Para cada riesgo identificado:

```
| ID | Riesgo | Tipo | Probabilidad | Impacto | Score |
|----|--------|------|-------------|---------|-------|
| R-01 | [riesgo] | Tiger | Alta | Alto | 🔴 |
| R-02 | [riesgo] | Paper Tiger | Media | Bajo | 🟡 |
| R-03 | [riesgo] | Elephant | ? | Alto | 🔴 |
```

**Scoring:**
- **Probabilidad × Impacto** = Score del riesgo
- 🔴 Alto × Alto = Bloquear si no se mitiga
- 🟡 Medio × Medio = Plan de contingencia
- 🟢 Bajo × Bajo = Aceptar y monitorear

### Fase 4: Plan de Mitigación (~5 min)

Para cada Tiger y Elephant:

```
R-01: [Título del riesgo]
├── Tipo: Tiger
├── Si ocurre: [impacto concreto]
├── Señales tempranas: [cómo detectar antes de que sea crítico]
├── Mitigación: [acción específica, no genérica]
├── Plan B: [qué hacer si la mitigación falla]
└── Responsable: [quién monitorea]
```

Para cada Paper Tiger:
```
R-02: [Título del riesgo]
├── Tipo: Paper Tiger
├── Por qué no es tan grave: [justificación]
└── Acción: [monitorear / aceptar / ninguna]
```

---

## Output Format

```markdown
# PRE-MORTEM-[nombre]

> Pre-mortem generado por Forge · [fecha]

## Escenario de Fracaso

> "Es [fecha + 6 meses]. [Nombre del proyecto] fracasó porque..."

[Narrativa breve del peor escenario realista — 3-5 oraciones]

---

## Inventario de Riesgos

### Tigers (Riesgos Reales — Mitigar Activamente)

| ID | Riesgo | Categoría | Probabilidad | Impacto |
|----|--------|-----------|-------------|---------|
| R-01 | [riesgo] | Producto | Alta | Alto |

**R-01: [Título]**
- **Si ocurre:** [impacto]
- **Señales tempranas:** [indicadores]
- **Mitigación:** [acción]
- **Plan B:** [contingencia]

### Paper Tigers (Riesgos Percibidos — No Obsesionarse)

| ID | Riesgo | Por Qué No Es Tan Grave |
|----|--------|------------------------|
| R-03 | [riesgo] | [justificación] |

### Elephants (Riesgos Ignorados — Forzar Conversación)

| ID | Riesgo | Por Qué Se Ignora | Impacto Real |
|----|--------|-------------------|-------------|
| R-05 | [riesgo] | [razón] | [impacto] |

---

## Resumen de Riesgos

| Categoría | Tigers | Paper Tigers | Elephants | Total |
|-----------|--------|-------------|-----------|-------|
| Producto | [N] | [N] | [N] | [N] |
| Técnico | [N] | [N] | [N] | [N] |
| Mercado | [N] | [N] | [N] | [N] |
| Ejecución | [N] | [N] | [N] | [N] |
| Financiero | [N] | [N] | [N] | [N] |
| Equipo | [N] | [N] | [N] | [N] |
| **Total** | **[N]** | **[N]** | **[N]** | **[N]** |

## Nivel de Riesgo Global

[🔴 Alto | 🟡 Medio | 🟢 Bajo]

[Justificación en 1-2 oraciones]

---

## Plan de Acción

### Antes de Construir (Bloqueantes)
1. [Acción para Tiger más crítico]
2. [Acción para Elephant más grave]

### Durante la Construcción (Monitorear)
1. [Señal temprana a vigilar]
2. [Checkpoint de validación]

### Post-Launch (Contingencia)
1. [Plan B si [riesgo] se materializa]
```

---

## Naming Convention

| Documento | Archivo |
|-----------|---------|
| Pre-Mortem | `PRE-MORTEM-[nombre-kebab].md` |

---

## Integración con La Herrería

- **Complementa la Security Audit** (Step 9) — Security Audit cubre riesgos técnicos/código,
  Pre-Mortem cubre riesgos de producto/mercado/equipo
- **Se ofrece como sub-step opcional** antes del Blueprint (Step 10)
- Los Tigers identificados se incorporan al Blueprint como "riesgos a monitorear"
- Los Elephants generan conversaciones que pueden cambiar el scope del Blueprint
- También disponible via `/brujula` (como parte del Strategy Canvas)

---

## Reglas

1. **Sé provocador, no complaciente.** El pre-mortem funciona porque fuerza honestidad brutal.
2. **Busca los Elephants activamente.** Son los más peligrosos porque nadie los menciona.
3. **Mitigaciones específicas.** "Validar con usuarios" no es una mitigación. "Entrevistar 5 early adopters esta semana y medir [métrica]" sí lo es.
4. **No todo es un Tiger.** Sobre-clasificar riesgos como críticos genera parálisis. Distinguir Paper Tigers.
5. **El pre-mortem no es permiso para no actuar.** Es una herramienta para actuar con los ojos abiertos.
