# Value Proposition Canvas — Referencia Completa

## Qué Es el VPC

El VPC hace zoom en una relación específica del BMC: qué necesita un segmento de
cliente específico y qué le ofrece el producto. Es el documento más consultado de
la metodología — múltiples skills lo leen directamente. Si está mal, todo lo que
se construye downstream se basa en cimientos falsos.

Un VPC por segmento de cliente. Si el BMC define tres segmentos, hay tres VPCs.
Todos viven en el mismo archivo, claramente separados por segmento.

---

## Las Dos Caras

### Cara 1: Perfil del Cliente (lo que el cliente necesita)

Tres categorías, pobladas desde investigación — no desde suposiciones sobre lo que
el producto hará.

#### Customer Jobs (Trabajos del Cliente)
Lo que el cliente está tratando de lograr. Los jobs son actividades, no features.
Se declaran en el lenguaje del cliente, no del producto.

- **Jobs funcionales:** Tareas que necesitan completar.
  "Enviar una factura a un cliente." "Saber cuánto dinero debo en impuestos."

- **Jobs sociales:** Cómo quieren ser percibidos.
  "Verme profesional ante mis clientes." "Demostrar responsabilidad financiera ante mi contador."

- **Jobs emocionales:** Cómo quieren sentirse.
  "Sentir confianza de que mis finanzas están bajo control." "Dejar de preocuparme por facturas impagas."

**Reglas:**
- Los jobs son declaraciones de intención, no descripciones de dolor.
  "Rastrear facturas impagas" es un job. "Frustrado por perder track de facturas" es un pain.
- Ordenar jobs por importancia para el cliente. El primer job es el que el producto
  debe resolver para entregar valor central.
- Cada job aquí puede convertirse en una actividad principal en story-mapping.

#### Pains (Dolores)
Lo que frustra al cliente cuando intenta lograr sus jobs. Los pains son problemas
específicos y observables — no insatisfacción vaga.

- **Dolores emocionales:** Ansiedad, frustración, miedo.
  "Preocupado de que se me pase una fecha límite de pago."

- **Dolores funcionales:** Obstáculos e ineficiencias.
  "Pasa 45 minutos ingresando datos de facturas manualmente en una hoja de cálculo cada viernes."

- **Dolores sociales:** Cómo las soluciones actuales los hacen sentir.
  "Avergonzado de enviar facturas que se ven poco profesionales."

**Reglas:**
- Los pains mapean a frustraciones en documentos de persona/research.
- Los pains más severos mapean a features Must Have en la planeación de releases.
- Ser específico sobre magnitud. "Es lento" es vago. "Toma 45 minutos" es medible y testeable.

#### Gains (Ganancias)
Lo que el cliente quiere lograr o experimentar como resultado de cumplir sus jobs.
Las ganancias son la definición de éxito.

- **Ganancias funcionales:** Lo que quieren que el producto haga.
  "Enviar facturas en menos de 2 minutos."

- **Ganancias sociales:** Cómo quieren ser vistos.
  "Que mis clientes me perciban como organizado y profesional."

- **Ganancias emocionales:** Cómo quieren sentirse.
  "Confiado de que todas las facturas están rastreadas y se les da seguimiento automáticamente."

- **Ganancias estratégicas:** Resultados a largo plazo.
  "Pasar menos tiempo en tareas administrativas y más tiempo en trabajo con clientes."

**Reglas:**
- Las ganancias mapean a goals en documentos de persona/research.
- Ordenar ganancias por importancia. La primera ganancia es lo que el producto
  entrega cuando funciona perfectamente.

---

### Cara 2: Propuesta de Valor (lo que el producto ofrece)

Tres categorías, cada una respondiendo directamente al perfil del cliente del otro lado.

#### Productos y Servicios
Lo que el producto realmente es y hace. La oferta concreta.

- Listar el producto y cualquier servicio que lo acompañe (onboarding, soporte, integraciones).
- Cada producto o servicio debe responder a al menos un Customer Job.
  Si una feature existe que no sirve a ningún job, es desperdicio.

#### Pain Relievers (Alivios de Dolor)
Cómo el producto aborda cada dolor. Cada pain reliever mapea a un dolor específico.

- Ser explícito sobre el mapeo: **"Alivia [nombre del dolor] mediante [cómo]."**
- Si un dolor no tiene pain reliever, es un problema no abordado. O el producto
  debe atenderlo (se convierte en feature Must Have) o el dolor está fuera de alcance
  (documentar por qué).

#### Gain Creators (Creadores de Ganancia)
Cómo el producto entrega cada ganancia. Cada gain creator mapea a una ganancia específica.

- Ser explícito sobre el mapeo: **"Crea [nombre de la ganancia] mediante [cómo]."**
- Si una ganancia no tiene gain creator, es una expectativa no cumplida. O el producto
  debe crearla o la ganancia es aspiracional para un release futuro (documentar cuándo).

---

## Formato de Archivo

Crear: `VPC-[nombre-kebab].md`

Si existen múltiples segmentos, cada uno tiene su propia sección claramente separada.
Todos los segmentos viven en el mismo archivo.

```markdown
# Value Proposition Canvas — [Nombre del Producto]

**Creado:** [Fecha]
**Última actualización:** [Fecha]
**Producto:** [Nombre del producto]

---

## Segmento: [Nombre del Segmento]

**Referencia BMC:** Segmentos de Clientes → [Nombre del segmento]

### Perfil del Cliente

#### Customer Jobs
1. **[Nombre del job]** — [Descripción en lenguaje del cliente. Qué están tratando de lograr.]
2. **[Nombre del job]** — [Descripción]

#### Pains
1. **[Nombre del dolor]** — [Problema específico y observable. Incluir magnitud cuando sea posible.]
2. **[Nombre del dolor]** — [Descripción]

#### Gains
1. **[Nombre de la ganancia]** — [Cómo se ve el éxito para el cliente. Específico, no vago.]
2. **[Nombre de la ganancia]** — [Descripción]

### Propuesta de Valor

#### Productos y Servicios
- **[Nombre del producto/servicio]:** [Qué es y qué hace. Mapea a cuál(es) Customer Job(s).]
- **[Nombre del producto/servicio]:** [Descripción]

#### Pain Relievers
- **Alivia [Nombre del dolor]** mediante [Cómo el producto aborda este dolor específico]
- **Alivia [Nombre del dolor]** mediante [Cómo]

#### Gain Creators
- **Crea [Nombre de la ganancia]** mediante [Cómo el producto entrega esta ganancia específica]
- **Crea [Nombre de la ganancia]** mediante [Cómo]

### No Abordado
[Documentar cualquier dolor sin pain reliever y cualquier ganancia sin gain creator.
Cada uno debe tener una disposición:]

- Dolor: [Nombre] — Must Have, target Release [N] / Fuera de alcance — porque [razón]
- Ganancia: [Nombre] — Must Have, target Release [N] / Fuera de alcance — porque [razón]

---

## Segmento: [Siguiente Segmento]

[Misma estructura que arriba]
```

---

## Reglas

- Customer Jobs se ordenan por importancia. El primer job es el que el producto debe
  resolver para entregar valor central.
- Pains y Gains se ordenan por severidad e importancia respectivamente.
- Cada dolor debe tener una disposición: aliviado por el producto, o explícitamente fuera
  de alcance con una razón.
- Cada ganancia debe tener una disposición: creada por el producto, o explícitamente
  aspiracional con un release objetivo.
- NO poblar el lado de la Propuesta de Valor hasta que el lado del Perfil del Cliente
  esté completo. La propuesta de valor debe responder a necesidades reales del cliente,
  no al revés.
