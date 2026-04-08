# /critique — Evaluación de Diseño UX/UI

Realiza una crítica holística de diseño, evaluando si la interfaz realmente funciona — no solo técnicamente, sino como experiencia diseñada. Piensa como un design director dando feedback.

## Instrucciones

1. **Lee el skill Impeccable** en `.claude/skills/impeccable/SKILL.md` para principios de diseño y anti-patterns
2. **Si existe `DESIGN.md`** en el root del proyecto, leerlo como **referencia primaria** — contiene las decisiones de diseño aprobadas. Evaluar desviaciones del código respecto a DESIGN.md
3. **Si no existe DESIGN.md**, buscar design system documentado en el proyecto (buscar "design system", "ui guide", "style guide")

## Evaluación (10 dimensiones)

### 1. AI Slop Detection (CRÍTICO)
**El check más importante.** ¿Esto se ve como toda otra interfaz generada por IA de 2024-2025?
Revisar contra TODOS los DON'T guidelines del skill impeccable. Buscar: AI color palette, gradient text, dark mode con glowing accents, glassmorphism, hero metric layouts, card grids idénticas, fonts genéricos.

**El test**: Si le mostraras esto a alguien y dijeras "lo hizo una IA", ¿te creerían inmediatamente?

### 2. Visual Hierarchy
- ¿El ojo fluye al elemento más importante primero?
- ¿Hay un primary action claro? ¿Se puede detectar en 2 segundos?
- ¿Size, color y position comunican importancia correctamente?

### 3. Information Architecture
- ¿La estructura es intuitiva?
- ¿Contenido relacionado está agrupado lógicamente?
- ¿Hay demasiadas opciones a la vez? (cognitive overload)

### 4. Emotional Resonance
- ¿Qué emoción evoca esta interfaz? ¿Es intencional?
- ¿Matchea la personalidad de la marca?

### 5. Discoverability & Affordance
- ¿Los elementos interactivos son obviamente interactivos?
- ¿Los hover/focus states proveen feedback útil?

### 6. Composition & Balance
- ¿El layout se siente balanceado?
- ¿El whitespace es usado intencionalmente?

### 7. Typography as Communication
- ¿La type hierarchy señala claramente qué leer primero?
- ¿Body text es cómodo de leer? (line length, spacing, size)

### 8. Color with Purpose
- ¿El color comunica, no solo decora?
- ¿Funciona para usuarios daltonics?

### 9. States & Edge Cases
- Empty states: ¿Guían a acción?
- Loading states: ¿Reducen percepción de espera?
- Error states: ¿Son helpful y no culposos?

### 10. Microcopy & Voice
- ¿El writing es claro y conciso?
- ¿Labels y buttons son unambiguos?

## Formato del Reporte

### Veredicto Anti-Patterns
**Empezar aquí.** Pass/fail: ¿Se ve AI-generated? Listar tells específicos.

### Impresión General
Gut reaction breve — qué funciona, qué no, y la oportunidad más grande.

### Lo Que Funciona
2-3 cosas bien hechas. Ser específico sobre por qué funcionan.

### Issues Prioritarios
Los 3-5 problemas de diseño más impactantes, ordenados por importancia:

Para cada issue:
- **Qué**: Nombrar el problema claramente
- **Por qué importa**: Cómo afecta a usuarios
- **Fix**: Qué hacer al respecto (ser concreto)
- **Comando**: `/polish`, `/normalize`, u otro comando relevante

### Observaciones Menores
Quick notes sobre issues pequeños.

### Preguntas a Considerar
Preguntas provocativas que podrían desbloquear mejores soluciones.

**Reglas:**
- Ser directo — feedback vago pierde el tiempo de todos
- Ser específico — "el submit button" no "algunos elementos"
- Decir qué está mal Y por qué importa a usuarios
- Dar sugerencias concretas, no solo "considerar explorar..."
- Priorizar despiadadamente
