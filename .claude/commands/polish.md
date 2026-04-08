# /polish — Final Quality Pass

Realiza un pass meticuloso final para atrapar todos los detalles pequeños que separan el trabajo bueno del trabajo excelente. La diferencia entre "shipped" y "polished".

## Instrucciones

1. **Lee el skill Impeccable** en `.claude/skills/impeccable/SKILL.md` para principios de diseño
2. **Si existe `DESIGN.md`** en el root del proyecto, leerlo — validar que tokens (colores, fuentes, spacing) matcheen las decisiones documentadas
3. **Verifica que el feature esté funcionalmente completo** — polish es el último paso, no el primero

## Pre-Polish Assessment

1. ¿Está funcionalmente completo?
2. ¿Cuál es el quality bar? (MVP vs flagship feature)

## Polish Sistemático

### Visual Alignment & Spacing
- Pixel-perfect alignment en todos los breakpoints
- Spacing consistente usando design tokens (no gaps random de 13px)
- Optical alignment: ajustar por peso visual
- Responsive: spacing y alignment funcionan en todos los viewports

### Typography Refinement
- Hierarchy consistency: mismos elementos usan mismos sizes/weights
- Line length: 45-75 caracteres para body text
- Line height apropiado para font size y contexto
- Font loading: sin FOUT/FOIT flashes

### Color & Contrast
- Contrast ratios: todo el texto cumple WCAG AA (4.5:1 normal, 3:1 large)
- Uso consistente de tokens — sin colores hardcodeados
- Funciona en todos los theme variants
- Neutrales tinted (no pure gray ni pure black)

### Interaction States
Cada elemento interactivo necesita TODOS los estados:
- **Default** | **Hover** | **Focus** | **Active** | **Disabled** | **Loading** | **Error** | **Success**

Estados missing crean confusión y experiencias rotas.

### Micro-interactions & Transitions
- Transiciones smooth (150-300ms)
- Easing consistente: ease-out-quart/quint/expo para deceleración natural
- 60fps: solo animar transform y opacity
- Respectar `prefers-reduced-motion`

### Content & Copy
- Terminología consistente
- Capitalización consistente (Title Case vs Sentence case)
- Sin typos ni errores gramaticales
- Puntuación consistente

### Icons & Images
- Estilo consistente (mismo family)
- Sizing apropiado y consistente
- Alt text en todas las imágenes
- Sin layout shift en load (aspect ratios)

### Forms & Inputs
- Labels en todos los inputs
- Indicadores de required claros
- Mensajes de error consistentes y helpful
- Tab order lógico

### Edge Cases
- Loading states en todas las acciones async
- Empty states welcoming
- Errores con recovery paths
- Long content handled (nombres largos, etc.)

### Responsiveness
- Todos los breakpoints: mobile, tablet, desktop
- Touch targets: 44x44px mínimo
- Text: no menor a 14px en mobile
- Sin horizontal scroll

### Code Quality
- Sin console.logs en producción
- Sin commented code
- Sin unused imports
- Sin TypeScript `any`
- ARIA labels y HTML semántico

## Checklist Final

- [ ] Visual alignment perfecto en todos los breakpoints
- [ ] Spacing usa design tokens consistentemente
- [ ] Typography hierarchy consistente
- [ ] Todos los interaction states implementados
- [ ] Transiciones smooth (60fps)
- [ ] Copy consistente y polished
- [ ] Touch targets 44x44px mínimo
- [ ] Contrast ratios cumplen WCAG AA
- [ ] Keyboard navigation funciona
- [ ] Focus indicators visibles
- [ ] Sin console errors
- [ ] Sin layout shift en load
- [ ] Respeta reduced motion preference
- [ ] Código limpio (sin TODOs, console.logs, commented code)

**NUNCA:**
- Polish antes de que esté funcionalmente completo
- Introducir bugs mientras polish (test thoroughly)
- Perfeccionar una cosa dejando otras rough (calidad consistente)
