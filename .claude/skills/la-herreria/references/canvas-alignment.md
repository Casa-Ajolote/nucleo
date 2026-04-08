# Alineación de Canvas

## Por Qué Importa la Alineación

El BMC y el VPC son dos vistas de la misma estrategia. El BMC es el sistema completo.
El VPC hace zoom en una relación dentro de ese sistema. Si se contradicen, el producto
se está construyendo hacia metas contradictorias. Skills downstream no van a detectar
esto — leen cada canvas independientemente. Solo esta verificación detecta el conflicto.

La alineación no es una verificación única. Se ejecuta cada vez que cualquiera de los
canvas cambia.

---

## Los 5 Checks de Alineación

Ejecutar los 5 checks cada vez que se crea o actualiza un canvas.

### Check 1: Cada Segmento de Cliente Tiene un VPC

**Regla:** Cada segmento listado en BMC → Segmentos de Clientes debe tener una sección
correspondiente en el VPC.

**Cómo se ve una falla:** El BMC lista "Departamentos de IT Empresariales" como segmento.
No existe ninguna sección del VPC para ellos. El modelo de negocio asume que este segmento
genera ingresos, pero nadie ha definido qué valor el producto les entrega o qué problemas
les resuelve.

**Cómo resolver:** Crear el VPC para el segmento faltante, o eliminar el segmento del
BMC si es aspiracional y aún no se está sirviendo.

### Check 2: Cada Fuente de Ingreso Tiene una Propuesta de Valor

**Regla:** Cada stream listado en BMC → Fuentes de Ingreso debe mapear a al menos una
Propuesta de Valor en BMC → Propuestas de Valor, la cual debe mapear a al menos un VPC.

**Cómo se ve una falla:** El BMC lista "Ingresos por consultoría enterprise" como fuente
de ingreso. El bloque de Propuestas de Valor no tiene una proposición correspondiente.
Ningún VPC define qué valor entrega la consultoría. Esto es una promesa sin fundamento —
el modelo asume ingresos de un valor que el producto aún no entrega.

**Cómo resolver:** Definir la propuesta de valor y el VPC que soportan esta fuente de
ingreso, o eliminar la fuente del BMC hasta que la propuesta esté definida.

### Check 3: Los Customer Jobs del VPC Mapean a Segmentos del BMC

**Regla:** Cada Customer Job en el VPC debe pertenecer a un segmento que existe en el BMC.

**Cómo se ve una falla:** El VPC define un job "Generar reportes de impuestos para
declaración trimestral" bajo un segmento llamado "Dueños de Pequeños Negocios."
El BMC no lista Dueños de Pequeños Negocios como Segmento de Cliente — lista
"Freelancers" y "Dueños de Agencias." El VPC apunta a un segmento que el modelo
de negocio no sirve.

**Cómo resolver:** Agregar el segmento al BMC (con la propuesta de valor, canales
y fuente de ingreso correspondientes), o mover el job a un segmento existente que
realmente lo ejecute.

### Check 4: Pain Relievers y Gain Creators Cubren la Propuesta de Valor Central

**Regla:** La Propuesta de Valor del BMC para cada segmento debe estar respaldada por
Pain Relievers y Gain Creators específicos en el VPC. La propuesta declarada no puede
ser más vaga que lo que el VPC promete.

**Cómo se ve una falla:** El BMC declara "Elimina la entrada manual de facturas por
completo." Los Pain Relievers del VPC dicen "Reduce el tiempo de entrada de facturas
proporcionando plantillas." El BMC promete eliminación. El VPC entrega reducción.
El producto no puede entregar lo que el BMC promete — o el BMC exagera el valor o
el VPC subestima lo que el producto hace.

**Cómo resolver:** Alinear el lenguaje. Si el producto realmente elimina la entrada
manual, actualizar el VPC. Si solo la reduce, actualizar el BMC. Los canvas deben
coincidir en lo que el producto realmente entrega.

### Check 5: Pains y Gains No Abordados Están Explícitamente Disposicionados

**Regla:** Cada dolor sin pain reliever y cada ganancia sin gain creator debe tener
una disposición documentada en la sección "No Abordado" del VPC.

**Cómo se ve una falla:** El VPC lista "Preocupado de que se me pasen fechas límite
de pago" como dolor. Ningún pain reliever lo aborda. La sección de No Abordado está
vacía. Story-mapping no va a señalar esto — simplemente no creará una tarea para ello.
El dolor existe, el cliente lo siente, y el producto lo ignora silenciosamente.

**Cómo resolver:** Disposicionar cada item no abordado. "Must Have — target Release [N]"
o "Fuera de alcance — porque [razón]." Si es Must Have, debe aparecer en el próximo
plan de release.

---

## Checklist de Alineación

Ejecutar después de cada creación o actualización de canvas:

```markdown
## Verificación de Alineación — [Fecha]

- [ ] Check 1: Cada Segmento del BMC tiene una sección en el VPC
- [ ] Check 2: Cada Fuente de Ingreso del BMC mapea a una Propuesta de Valor con VPC
- [ ] Check 3: Cada Customer Job del VPC pertenece a un segmento del BMC
- [ ] Check 4: Propuestas de Valor del BMC y Pain Relievers/Gain Creators del VPC coinciden
- [ ] Check 5: Cada dolor y ganancia no abordados en el VPC tienen disposición documentada

### Conflictos Encontrados
[Listar cualquier check que falló, cuál es el conflicto y cómo se resolvió.]
- Check [N]: [Descripción del conflicto] → [Resolución]

### Actualizaciones Realizadas
[Listar cualquier cambio hecho a cualquier canvas como resultado de esta verificación.]
- [Canvas]: [Qué cambió y por qué]
```

Agregar este checklist al final de `BMC-[nombre-kebab].md` cada vez que se valide
la alineación. Es el registro de auditoría que muestra que los canvas fueron verificados
y están sincronizados.

---

## Cuándo Actualizar los Canvas

### Cuando Research de Usuarios Revela Hallazgos

Personas, modelos mentales y journey maps pueden revelar:

- **Un Customer Job nuevo** que el VPC no capturó.
  → Agregar el job al VPC. Verificar si mapea a un segmento existente del BMC o requiere uno nuevo (Check 3).

- **Un dolor más severo de lo esperado.** Un journey map muestra un punto de dolor
  con alta frustración que el VPC listó pero no priorizó.
  → Reordenar la lista de Pains del VPC. Verificar si el dolor más doloroso está
  siendo atendido (Check 5). Si no, escalar a Must Have.

- **Una ganancia que el cliente valora pero el VPC no listó.**
  → Agregar la ganancia al VPC. Disposicionar — ¿el producto debería crearla o está fuera de alcance?

### Cuando Métricas Post-Lanzamiento Señalan Desvío

- **Usuarios no experimentan la ganancia que el VPC promete.**
  → La propuesta de valor puede estar equivocada, o la implementación no entrega lo que describe. Investigar.

- **Un dolor que el VPC dice está aliviado sigue apareciendo en tickets de soporte.**
  → O el pain reliever es insuficiente (actualizar VPC) o la implementación tiene un bug (arreglar implementación).

- **Una fuente de ingreso tiene bajo rendimiento.**
  → Verificar si la propuesta de valor para ese segmento es suficientemente convincente.
