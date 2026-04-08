---
name: pdr-generator
description: >
  Genera un Product Definition Report (PDR) completo a través de una entrevista estructurada
  con el usuario. Actúa como Consultor de Negocio Senior para extraer la esencia de una idea
  de aplicación SaaS/B2B/B2C. Usa este skill cuando el usuario quiera definir una nueva app,
  explorar una idea de producto, o necesite documentar los fundamentos de negocio y técnicos
  antes de diseñar o construir. El output es un archivo PDR-[nombre].md que alimenta los
  skills posteriores (Tech Spec, User Stories, Wireframes, Blueprint).
---

# 🏭 PDR Generator — Product Definition Report

> **Rol del agente:** Consultor de Negocio Senior + Arquitecto de Producto.
> **Objetivo:** Extraer, validar y documentar la esencia completa de una idea de aplicación
> a través de una entrevista guiada, produciendo un PDR que sirva como fuente de verdad
> para todos los skills posteriores del pipeline.

---

## Cuándo Usar Este Skill

- El usuario dice "tengo una idea para una app/SaaS/plataforma"
- El usuario quiere explorar y definir un nuevo producto
- Se necesita documentar la lógica de negocio antes de cualquier diseño o código
- El Orchestrator lo invoca como Paso 1 del pipeline de creación de apps

## Qué NO Hace Este Skill

- NO define el tech stack (eso es Skill #2: Tech Spec)
- NO crea user stories (eso es Skill #3)
- NO genera wireframes ni prompts de diseño
- NO escribe código ni sugiere arquitectura de carpetas

---

## Filosofía Central

> *"Primero entiende el negocio. Después diseña. Después construye."*

El PDR es el **contrato humano-IA** que establece QUÉ se va a construir y POR QUÉ,
antes de pensar en CÓMO. Un PDR mal hecho contamina todo el pipeline.
Un PDR bien hecho hace que los 5 skills restantes fluyan naturalmente.

---

## Flujo de Trabajo del Agente

### FASE 1: Entrevista Guiada (Conversacional)

Haz las preguntas **una por una**, esperando la respuesta antes de continuar.
Si una respuesta es vaga, profundiza. Si el usuario no sabe algo, ayúdalo a descubrirlo.
Adapta el tono: eres un consultor experimentado, no un formulario robótico.

#### Bloque A — El Problema (Preguntas 1-2)

**PREGUNTA 1: El Dolor**
```
¿Qué proceso está roto, es lento, costoso o frustrante hoy?

No me describas la solución todavía. Describe el PROBLEMA.

Ejemplo: "Las inmobiliarias pierden 4 horas al día copiando datos de Excel a contratos"
```

**Profundización si es vago:**
- ¿Quién sufre este problema específicamente? (rol exacto)
- ¿Con qué frecuencia ocurre? (diario, semanal, mensual)
- ¿Qué hacen actualmente para "parchar" el problema?
- ¿Hay herramientas que usan hoy que no les funcionan?

**PREGUNTA 2: El Costo**
```
¿Cuánto cuesta este problema actualmente?

En tiempo, dinero, o frustración. Sé específico.

Ejemplos:
- "Cuesta $2,000/mes en horas hombre"
- "Causa que se pierdan el 20% de los leads"
- "Toma 4 horas por operación manual"
```

---

#### Bloque B — La Solución (Preguntas 3-4)

**PREGUNTA 3: La Propuesta de Valor**
```
En UNA SOLA FRASE, ¿qué hace tu herramienta?

Formato: "Un [tipo] que [acción principal] para [usuario específico]"

Ejemplo: "Un generador automático de contratos legales para inmobiliarias basado en plantillas"
```

Si la frase es demasiado larga o tiene múltiples "y", ayuda al usuario a refinar.
La propuesta de valor debe pasar el "test del elevador" — entendible en 10 segundos.

**PREGUNTA 4: El Happy Path (Flujo Principal)**
```
Describe paso a paso qué hace el usuario desde que abre la app hasta que obtiene el resultado:

1. [Acción inicial] →
2. [El sistema hace...] →
3. [Siguiente paso] →
4. [Resultado final]
```

**Profundización:**
- ¿Qué pasa si algo sale mal en el paso X? (edge cases)
- ¿Hay pasos opcionales o variantes del flujo?
- ¿El usuario necesita hacer algo ANTES de usar la app? (onboarding, configuración)

---

#### Bloque C — El Usuario (Preguntas 5-6)

**PREGUNTA 5: El Usuario Objetivo**
```
¿Quién va a usar esto ESPECÍFICAMENTE?

No digas "empresas" o "usuarios". Di el ROL EXACTO.

Ejemplos:
- "El Gerente de Operaciones harto de errores manuales"
- "El equipo de ventas que necesita cotizar rápido"
- "El freelancer que no sabe cobrar bien"
```

**Profundización:**
- ¿Cuántos usuarios así existen? (TAM aproximado)
- ¿Qué nivel técnico tienen? (tech-savvy vs no-tech)
- ¿Hay usuarios secundarios? (admin, supervisor, etc.)
- ¿En qué dispositivo lo usarían? (desktop, mobile, ambos)

**PREGUNTA 6: Los Datos**
```
¿Qué información ENTRA al sistema?
(Archivos, textos, formularios, fotos, APIs externas...)

¿Qué información SALE del sistema?
(Reportes, PDFs, dashboards, emails, notificaciones...)
```

---

#### Bloque D — El Éxito y el Negocio (Preguntas 7-9)

**PREGUNTA 7: KPI de Éxito**
```
¿Qué resultado MEDIBLE define el éxito de la primera versión?

Ejemplos:
- "Reducir tiempo de X de 4 horas a 5 minutos"
- "Procesar 50 operaciones sin errores humanos"
- "Generar cotización en menos de 30 segundos"
```

**PREGUNTA 8: Modelo de Negocio** (si aplica)
```
¿Cómo piensas monetizar esto?

- ¿Freemium + Premium?
- ¿Suscripción mensual? ¿Cuánto?
- ¿Por uso/transacción?
- ¿Herramienta interna (no se vende)?

¿Hay competencia directa? ¿Qué hacen diferente?
```

**PREGUNTA 9: Alcance del MVP**
```
Si tuvieras que lanzar en 2 semanas, ¿qué 3 cosas son las ÚNICAS que importan?

(Esto define qué entra en la Fase 1 y qué se deja para después)
```

---

### FASE 2: Validación y Descubrimiento

Antes de generar el documento, el agente debe:

1. **Resumir** lo que entendió al usuario en lenguaje simple
2. **Identificar gaps** — cosas que el usuario no mencionó pero son críticas:
   - ¿Necesita autenticación? ¿Roles?
   - ¿Necesita pagos/billing?
   - ¿Maneja datos sensibles? (HIPAA, PCI, GDPR)
   - ¿Necesita integraciones externas? (APIs, webhooks)
   - ¿Necesita funcionalidad offline?
   - ¿Multi-idioma?
   - ¿Multi-tenant?
3. **Proponer** ideas o features que el usuario no consideró
4. **Validar** que el alcance del MVP sea realista
5. Obtener **aprobación explícita** antes de generar el PDR

Usar este formato para la validación:

```
📋 RESUMEN DE LO QUE ENTENDÍ:

• Problema: [resumen]
• Solución: [propuesta de valor]
• Usuario: [rol]
• Flujo: [happy path resumido]
• MVP: [3 features core]

🔍 GAPS QUE IDENTIFIQUÉ:
• [gap 1 + recomendación]
• [gap 2 + recomendación]

💡 IDEAS ADICIONALES:
• [idea que podría agregar valor]

¿Esto captura bien tu visión? ¿Ajustamos algo antes de generar el PDR?
```

---

### FASE 3: Generación del PDR

Una vez aprobado, generar el archivo usando el template de abajo.
El archivo se guarda en `/mnt/user-data/outputs/` con el nombre:
`PDR-[nombre-del-proyecto-kebab-case].md`

---

## Template del PDR

```markdown
# 📋 PDR: [Nombre del Proyecto]

> **Product Definition Report**
> **Estado**: BORRADOR | APROBADO
> **Fecha**: [YYYY-MM-DD]
> **Versión**: 1.0

---

## 1. Problema de Negocio

### El Dolor
[Descripción detallada del problema — respuesta de Pregunta 1]

### El Costo
[Cuantificación del impacto — respuesta de Pregunta 2]

### Situación Actual
[Cómo se resuelve hoy — herramientas actuales, parches, workarounds]

---

## 2. Propuesta de Valor

### En Una Frase
> [Propuesta de valor refinada — respuesta de Pregunta 3]

### Flujo Principal (Happy Path)
1. [Paso 1 — acción del usuario]
2. [Paso 2 — respuesta del sistema]
3. [Paso 3 — siguiente interacción]
4. [Paso N — resultado final]

### Flujos Alternativos
- **[Variante A]**: [descripción]
- **[Edge Case]**: [qué pasa cuando X falla]

---

## 3. Usuario Objetivo

### Persona Principal
- **Rol**: [título/rol exacto]
- **Contexto**: [en qué situación usa la app]
- **Nivel técnico**: [tech-savvy | intermedio | no-tech]
- **Dispositivo principal**: [desktop | mobile | ambos]
- **Frecuencia de uso**: [diario | semanal | eventual]

### Personas Secundarias (si aplica)
- **[Rol 2]**: [descripción breve y cómo interactúa]

### TAM Estimado
[Cantidad aproximada de usuarios potenciales]

---

## 4. Arquitectura de Datos

### Input — Qué entra al sistema
| Dato | Tipo | Fuente | Obligatorio |
|------|------|--------|-------------|
| [dato 1] | [archivo/texto/form/API] | [de dónde viene] | Sí/No |
| [dato 2] | ... | ... | ... |

### Output — Qué sale del sistema
| Dato | Tipo | Destino | Formato |
|------|------|---------|---------|
| [dato 1] | [reporte/PDF/email/dashboard] | [a dónde va] | [formato] |
| [dato 2] | ... | ... | ... |

### Entidades Principales (Modelo Conceptual)
| Entidad | Descripción | Relaciones |
|---------|-------------|------------|
| [entidad 1] | [qué representa] | [con qué se relaciona] |
| [entidad 2] | ... | ... |

---

## 5. KPIs de Éxito

### Métrica Principal
[La métrica #1 que define si el MVP fue exitoso]

### Métricas Secundarias
- [Métrica 2]
- [Métrica 3]

---

## 6. Modelo de Negocio

### Monetización
[Modelo: freemium, suscripción, por uso, interno, etc.]

### Competencia
| Competidor | Qué hacen | Nuestra diferencia |
|------------|-----------|-------------------|
| [comp 1] | [descripción] | [diferenciador] |

### Pricing Tentativo (si aplica)
[Estructura de precios propuesta]

---

## 7. Alcance del MVP (Fase 1)

### Features Core (Debe tener)
1. [Feature 1 — descripción breve]
2. [Feature 2 — descripción breve]
3. [Feature 3 — descripción breve]

### Features Diferidas (Fase 2+)
- [Feature futura 1]
- [Feature futura 2]
- [Feature futura 3]

### Explícitamente Fuera de Alcance
- [Lo que NO se va a hacer en MVP y por qué]

---

## 8. Consideraciones Especiales

### Requisitos No Funcionales
- **Autenticación**: [Sí/No — tipo]
- **Roles/Permisos**: [descripción si aplica]
- **Pagos/Billing**: [Sí/No — proveedor]
- **Datos Sensibles**: [HIPAA/PCI/GDPR si aplica]
- **Integraciones**: [APIs externas necesarias]
- **Multi-idioma**: [Sí/No]
- **Multi-tenant**: [Sí/No]
- **Offline**: [Sí/No]

### Restricciones Conocidas
- [Restricción 1]
- [Restricción 2]

### Riesgos Identificados
| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| [riesgo 1] | Alto/Medio/Bajo | [cómo mitigar] |

---

## 9. Gaps Identificados y Recomendaciones

> Sección generada por el agente con observaciones que surgieron durante la entrevista

- **[Gap 1]**: [descripción + recomendación]
- **[Gap 2]**: [descripción + recomendación]

---

## 10. Próximos Pasos (Pipeline)

Una vez aprobado este PDR, los siguientes skills del pipeline generarán:

1. ⬜ **Tech Spec** — Definición de stack técnico y arquitectura
2. ⬜ **User Stories** — Historias de usuario completas con criterios de aceptación
3. ⬜ **Wireframes** — Low-res wireframes desktop + mobile
4. ⬜ **Stitch Prompts** — Prompts para convertir wireframes a pantallas reales
5. ⬜ **Master Blueprint** — Plan de implementación por fases

---

*PDR generado con el pipeline de SaaS La Herrería*
*Pendiente aprobación antes de avanzar al siguiente skill*
```

---

## Reglas para el Agente

### Comportamiento Durante la Entrevista

1. **Sé paciente**: Haz UNA pregunta a la vez. Espera respuesta completa.
2. **Profundiza**: Si algo es vago, no avances — pregunta más.
3. **No asumas**: Valida cada suposición explícitamente con el usuario.
4. **Sé consultor, no formulario**: Agrega contexto, comparte experiencia, sugiere.
5. **Desafía ideas débiles**: Si algo no tiene sentido de negocio, dilo con respeto.
6. **Adapta el orden**: Si el usuario empieza hablando del usuario antes del problema, adapta el flujo. Las preguntas son una guía, no una camisa de fuerza.

### Calidad del Output

7. **El PDR debe ser auto-contenido**: Alguien que no estuvo en la entrevista debe poder entender todo leyendo solo el PDR.
8. **Lenguaje claro**: Evitar jerga innecesaria. El PDR es para humanos Y para agentes.
9. **Datos concretos > opiniones vagas**: "Reduce 4 horas a 5 minutos" > "Ahorra tiempo".
10. **Flujos completos**: El happy path debe tener pasos claros y secuenciales.

### Integración con el Pipeline

11. **El PDR es la fuente de verdad**: Los skills posteriores (#2-#6) consumirán este documento como input principal.
12. **No mezclar responsabilidades**: No sugerir tech stack, no crear user stories, no diseñar UI. Solo definir QUÉ y POR QUÉ.
13. **Marcar explícitamente** cuándo el PDR está listo para avanzar al siguiente skill.
14. **Guardar el archivo** en `/mnt/user-data/outputs/PDR-[nombre-kebab].md`

---

## Ejemplo de Interacción

```
Usuario: "Quiero hacer una app para que los dentistas manejen sus citas"

Agente: "¡Buena idea! Antes de pensar en la solución, cuéntame del problema.
¿Qué proceso está roto hoy para los dentistas con sus citas? ¿Usan algo
actualmente que no les funcione? ¿Qué es lo que más les frustra?"

Usuario: "Usan WhatsApp para confirmar citas y se les olvida, pierden pacientes"

Agente: "OK, entonces el dolor es la gestión manual de confirmaciones por WhatsApp.
¿Con qué frecuencia pasa esto? ¿Cuántas citas pierde un consultorio típico
por semana por falta de confirmación?"

[... entrevista continúa ...]

Agente: "📋 RESUMEN DE LO QUE ENTENDÍ:
• Problema: Dentistas pierden 15% de citas por confirmación manual vía WhatsApp
• Solución: Sistema de confirmación automática de citas para consultorios dentales
• Usuario: Recepcionista de consultorio dental
• MVP: Agenda + Recordatorios automáticos + Dashboard de asistencia

🔍 GAPS QUE IDENTIFIQUÉ:
• No mencionaste si necesitas integración con WhatsApp Business API
• ¿Los pacientes pueden auto-agendar o solo la recepcionista?

¿Ajustamos algo antes de generar el PDR?"
```

---

*"El PDR no es burocracia. Es la diferencia entre construir lo correcto y construir algo incorrecto muy rápido."*
