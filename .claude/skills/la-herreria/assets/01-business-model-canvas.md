# Skill #1 — Business Model Canvas

> *"Antes de diseñar pantallas o escribir código, hay que entender cómo el negocio
> crea, entrega y captura valor. Sin esto, todo lo demás es decoración."*

## Qué Hace Este Skill

Genera dos documentos estratégicos fundamentales y valida que sean coherentes entre sí:

1. **Business Model Canvas (BMC)** — Visión de sistema completo del negocio en una página.
   9 bloques que muestran cómo todo se conecta: segmentos, propuesta de valor, canales,
   relaciones, ingresos, recursos, actividades, alianzas y costos.

2. **Value Proposition Canvas (VPC)** — Zoom profundo en la relación entre lo que el
   cliente necesita y lo que el producto ofrece. Un VPC por cada segmento de cliente.

3. **Validación de Alineación** — 5 checks de consistencia que aseguran que los dos
   canvas no se contradigan.

**Por qué va primero:** El BMC y el VPC informan todo lo que viene después. El PDR,
el Tech Spec, las User Stories, los Wireframes y el Blueprint son más precisos y
coherentes cuando el modelo de negocio está claro desde el inicio. El marketing
queda cubierto en los bloques de Canales y Relaciones del BMC.

---

## Referencias (leer cuando se indique)

- **Bloques del BMC:** `.claude/skills/la-herreria/references/business-model-canvas.md`
- **Value Proposition Canvas:** `.claude/skills/la-herreria/references/value-proposition-canvas.md`
- **Alineación entre canvas:** `.claude/skills/la-herreria/references/canvas-alignment.md`

---

## Workflow

### Fase 1: Entrevista Estratégica

Antes de llenar cualquier canvas, entender la idea del usuario.
Esta entrevista es conversacional — no es un formulario.
Hacer máximo 3-4 preguntas por turno. No abrumar.

**Preguntas guía (adaptar al contexto):**

**Sobre el problema y el cliente:**
1. ¿Qué problema específico resuelve tu producto? ¿Cómo lo resuelven hoy sin él?
2. ¿Quién tiene este problema? Describe a tu cliente ideal con contexto real.
3. ¿Hay diferentes tipos de clientes que lo necesitan por razones distintas?

**Sobre la solución y el valor:**
4. ¿Qué hace tu producto concretamente? ¿Cuál es la acción principal del usuario?
5. ¿Por qué elegirían tu producto sobre las alternativas? ¿Qué lo diferencia?
6. ¿Qué frustraciones elimina? ¿Qué logros permite que antes no eran posibles?

**Sobre el modelo de negocio:**
7. ¿Cómo piensas cobrar? (Suscripción, freemium, por uso, licencia, etc.)
8. ¿Cómo van a descubrir tu producto los clientes?
9. ¿Qué necesitas para operar? (Equipo, tecnología, proveedores, capital.)

**Reglas de la entrevista:**
- Si el usuario da respuestas vagas ("todo el mundo lo necesita"), profundizar.
- Si el usuario no sabe algo, documentarlo como supuesto a validar.
- No repetir lo que el usuario ya dijo.

### Fase 2: Generar el Business Model Canvas

Leer: `.claude/skills/la-herreria/references/business-model-canvas.md`

**Orden de llenado** (cada bloque informa al siguiente):
1. Customer Segments → 2. Value Propositions → 3. Channels → 4. Customer Relationships
→ 5. Revenue Streams → 6. Key Resources → 7. Key Activities → 8. Key Partnerships
→ 9. Cost Structure

**Output:** `BMC-[nombre-kebab].md` con los 9 bloques + Risk Points.

### Fase 3: Generar el Value Proposition Canvas

Leer: `.claude/skills/la-herreria/references/value-proposition-canvas.md`

Para CADA segmento de cliente identificado en el BMC, generar un VPC completo.

**Orden de llenado:**
1. Primero el **Customer Profile** (jobs → pains → gains)
2. Después el **Value Proposition** (pain relievers → gain creators)
3. Finalmente: **No Abordado** — cada dolor/ganancia sin cobertura con disposición explícita

**Regla crítica:** NO poblar el Value Proposition hasta que el Customer Profile
esté completo. La propuesta responde al cliente, no al revés.

**Output:** `VPC-[nombre-kebab].md` con un VPC por segmento.

### Fase 4: Validar Alineación

Leer: `.claude/skills/la-herreria/references/canvas-alignment.md`

Ejecutar los 5 checks de consistencia entre BMC y VPC:

| # | Check | Qué detecta |
|---|-------|-------------|
| 1 | Cada Segmento del BMC tiene un VPC | Segmentos sin propuesta de valor definida |
| 2 | Cada Revenue Stream tiene un Value Proposition | Ingresos prometidos sin valor que los respalde |
| 3 | Cada Customer Job del VPC pertenece a un segmento del BMC | VPC apuntando a segmentos que el negocio no sirve |
| 4 | Pain Relievers y Gain Creators cubren la propuesta central | Promesas exageradas o subestimadas |
| 5 | Pains y Gains no abordados tienen disposición explícita | Problemas del cliente ignorados silenciosamente |

Si un check falla: resolver el conflicto antes de continuar.

### Fase 5: Presentar al Usuario

Mostrar:
1. **BMC completo** — resumen de los 9 bloques
2. **VPC por segmento** — Customer Profile + Value Proposition
3. **Resultado de alineación** — los 5 checks (✅ o ❌)
4. **Risk Points** — riesgos identificados
5. **Supuestos a validar** — lo que el usuario no supo responder

Preguntar: "¿Esto refleja bien tu idea? ¿Hay algo que corregir o profundizar?"

---

## Output Contract

```
BMC:
  Customer Segments     → Quién servimos (2-4 segmentos max)
  Value Propositions    → Qué valor entregamos a cada segmento
  Revenue Streams       → Cómo capturamos valor económico
  Channels              → Cómo llegamos al cliente (adquisición + marketing)
  Cost Structure        → Qué cuesta operar el modelo

VPC (por segmento):
  Customer Jobs         → Qué intenta lograr el cliente
  Pains                 → Qué le frustra del proceso actual (con magnitud)
  Gains                 → Qué significa éxito
  Pain Relievers        → Cómo el producto alivia cada dolor
  Gain Creators         → Cómo el producto crea cada ganancia
  Unaddressed           → Qué no se atiende y por qué
```

**Estos documentos son consumidos por todos los skills downstream:**
- **PDR (Skill #2):** Toma los segmentos y propuesta de valor como base
- **Tech Spec (Skill #3):** Alinea el stack con los recursos clave del BMC
- **User Stories (Skill #4):** Los Customer Jobs se convierten en epics
- **Wireframes (Skill #5):** Priorización según pains más severos
- **UI/UX (Skill #6):** El tono visual refleja la propuesta de valor
- **Blueprint (Skill #7):** Las fases respetan las fuentes de ingreso y la estructura de costos

---

## Naming Convention

| Documento | Archivo |
|-----------|---------|
| Business Model Canvas | `BMC-[nombre-kebab].md` |
| Value Proposition Canvas | `VPC-[nombre-kebab].md` |
| Reporte de Alineación | Incluido al final de `BMC-[nombre-kebab].md` |

El `[nombre-kebab]` es el nombre del proyecto (ej: `BMC-virtual-staging.md`).
Se usa este mismo nombre en todos los documentos del pipeline.

---

## Errores Comunes a Evitar

- **Segmentos demasiado amplios.** "Empresas" no es un segmento. "Agencias de marketing de 5-20 personas que gastan >$10K/mes en herramientas" sí lo es.
- **Value Propositions genéricas.** "Ahorra tiempo" no vale. "Elimina 30 minutos de entrada manual por factura cada semana" sí.
- **Customer Jobs como features.** "Usar el dashboard" es feature, no job. "Saber cuánto dinero me deben mis clientes" es un job.
- **Pains sin magnitud.** "Es lento" no es medible. "Toma 45 minutos cada viernes" sí.
- **Llenar el Value Proposition antes del Customer Profile.** Siempre el cliente primero.

---

## Handoff al Skill #2

Al terminar:

```
✅ BMC-[nombre].md generado
✅ VPC-[nombre].md generado
✅ Alineación validada (5/5 checks)

Siguiente: PDR Generator (Skill #2)
Con el modelo de negocio claro, la entrevista de producto
será más enfocada y el PDR más preciso.

¿Procedemos?
```
