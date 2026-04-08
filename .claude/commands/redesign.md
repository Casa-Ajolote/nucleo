# /redesign — Auditoría y Elevación de Proyecto Existente

> **Nota:** Este comando ahora usa el skill Impeccable como base de diseño.
> Para evaluación rápida de diseño, usa `/critique`.
> Para auditoría de calidad web completa (performance, a11y, SEO), usa `/web-audit`.

Evalúa el diseño de un proyecto existente, identifica los problemas más críticos y los arregla en orden de impacto — sin romper funcionalidad ni reescribir desde cero.

---

## Cuándo Usar

- Ya tienes una app funcionando pero se ve genérica o "hecha por IA"
- Quieres elevar la calidad visual antes de lanzar o mostrar a usuarios
- Heredaste un proyecto y necesitas un diagnóstico objetivo
- Post-MVP: el producto funciona, ahora necesita pulirse

---

## Protocolo de Ejecución

Al recibir `/redesign`, ejecutar en este orden:

### Paso 1: Cargar Skills
Leer y activar `.claude/skills/impeccable/SKILL.md` como referencia de calidad de diseño.
Si se necesita auditoría de a11y/performance, también cargar `.claude/skills/web-quality/SKILL.md`.

### Paso 2: Scan del Proyecto
```
→ Explorar estructura src/ o app/
→ Leer package.json (stack, versiones)
→ Abrir 3-5 componentes clave
→ Revisar globals.css y tailwind.config si existe
→ Screenshot de páginas principales (Playwright si disponible)
```

### Paso 3: Auditoría Completa
Evaluar usando el skill Impeccable como base:
- AI Slop Detection (CRÍTICO — siempre primero)
- Typography · Color · Layout · Motion · Interaction · Responsive · UX Writing
- Visual Details y anti-patterns

### Paso 4: Presentar Reporte
Generar `REDESIGN-AUDIT-[nombre].md` con:
- Veredicto AI Slop (pass/fail)
- Hallazgos catalogados por severidad
- Plan de ejecución ordenado por impacto
- Comandos sugeridos para cada fix (`/polish`, `/normalize`, `/critique`)

**ESPERAR APROBACIÓN DEL USUARIO antes de hacer cambios al código.**

### Paso 5: Ejecutar Fixes (con aprobación)
Arreglar en orden de impacto, usando los guidelines del skill Impeccable.

---

## Mensaje de Inicio

Al recibir `/redesign`, mostrar:

```
🔍 Redesign Mode activado (powered by Impeccable).

Voy a auditar tu proyecto contra anti-patterns de AI slop y
evaluar typography, color, layout, motion, interaction y responsive design.

Primero exploro la estructura, luego genero el reporte REDESIGN-AUDIT.md
con todos los hallazgos ordenados por impacto.

No toco código hasta que apruebes el plan.

Iniciando scan...
```
