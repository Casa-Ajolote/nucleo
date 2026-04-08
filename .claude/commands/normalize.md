# /normalize — Alinear con Design System

Analiza y rediseña el feature para que matchee perfectamente los estándares, estética y patterns del design system del proyecto.

## Instrucciones

1. **Lee el skill Impeccable** en `.claude/skills/impeccable/SKILL.md` para principios de diseño

## Plan

Antes de hacer cambios, entender profundamente el contexto:

### 1. Descubrir el Design System
**Si existe `DESIGN.md` en el root**, usarlo como referencia primaria — es el source of truth de las decisiones de diseño aprobadas. Complementar con documentación adicional si existe.

Si no existe DESIGN.md, buscar documentación de design system, UI guidelines, component libraries, o style guides (grep "design system", "ui guide", "style guide", archivos en `.claude/design-systems/`). Estudiar hasta entender:
- Principios de diseño core y dirección estética
- Audiencia target y personas
- Patterns y convenciones de componentes
- Design tokens (colors, typography, spacing)

**CRÍTICO**: Si algo no está claro, preguntar. No adivinar principios de design system.

### 2. Analizar el Feature Actual
- ¿Dónde se desvía de los patterns del design system?
- ¿Qué inconsistencias son cosméticas vs funcionales?
- ¿Cuál es la root cause? (missing tokens, one-off implementations, misalignment conceptual)

### 3. Crear Plan de Normalización
- ¿Qué componentes se pueden reemplazar con equivalentes del design system?
- ¿Qué styles necesitan usar design tokens en vez de valores hardcodeados?
- ¿Cómo los UX patterns pueden matchear user flows establecidos?

**IMPORTANTE**: Gran diseño es diseño efectivo. Priorizar UX consistency y usability sobre visual polish solo.

## Ejecutar

Abordar sistemáticamente todas las inconsistencias:

- **Typography**: Usar fonts, sizes, weights y line heights del design system. Reemplazar valores hardcodeados con tokens tipográficos
- **Color & Theme**: Aplicar color tokens del design system. Remover colores one-off que rompen la paleta
- **Spacing & Layout**: Usar spacing tokens (margins, padding, gaps). Alinear con grid systems
- **Components**: Reemplazar implementaciones custom con componentes del design system (shadcn/ui)
- **Motion & Interaction**: Matchear animation timing, easing y interaction patterns
- **Responsive**: Asegurar breakpoints y responsive patterns alineados con estándares
- **Accessibility**: Verificar contrast ratios, focus states, ARIA labels
- **Progressive Disclosure**: Matchear information hierarchy con patterns establecidos

**NUNCA:**
- Crear componentes one-off nuevos cuando existen equivalentes del design system
- Hardcodear valores que deberían usar design tokens
- Introducir patterns nuevos que divergen del design system
- Comprometer accessibility por consistencia visual

## Clean Up

Después de normalizar:

- **Consolidar componentes reusables**: Si creaste componentes nuevos que deberían compartirse, moverlos al path de UI compartido (`src/shared/components/`)
- **Remover código orphan**: Eliminar implementaciones, styles o archivos obsoletos
- **Verificar calidad**: Lint, type-check, test. Asegurar que la normalización no introdujo regresiones
- **Asegurar DRYness**: Buscar duplicación introducida durante refactoring y consolidar
