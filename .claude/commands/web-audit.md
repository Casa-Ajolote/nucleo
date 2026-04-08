# /web-audit — Auditoría de Calidad Web

Ejecuta una auditoría integral de calidad web basada en Google Lighthouse (150+ checks). Cubre Performance, Core Web Vitals, Accessibility, SEO y Best Practices.

## Instrucciones

1. **Lee el skill Web Quality** en `.claude/skills/web-quality/SKILL.md`
2. **Si necesitas profundidad**, consulta los references:
   - `references/performance.md` — Performance y Core Web Vitals
   - `references/accessibility.md` — WCAG 2.1 completo
   - `references/seo.md` — SEO técnico y on-page

## Workflow

### 1. Scan
Explorar el proyecto para entender el stack y la estructura:
- Leer `package.json` → dependencias, scripts
- Revisar `src/app/` → rutas, layouts, pages
- Abrir 3-5 componentes representativos
- Ver `tailwind.config` y `next.config.ts` → configuración
- Si Playwright MCP está disponible: screenshots de las páginas principales

### 2. Audit
Ejecutar checks contra las 4 categorías del skill:

**Performance (40%):**
- Core Web Vitals (LCP < 2.5s, INP < 200ms, CLS < 0.1)
- Uso de `next/image`, `next/font`, `next/dynamic`
- Code splitting y lazy loading
- Bundle size y tree shaking

**Accessibility (30%):**
- Contrast ratios (WCAG AA mínimo)
- Keyboard navigation y focus indicators
- ARIA labels y HTML semántico
- Alt text en imágenes

**SEO (15%):**
- Meta tags (title, description, canonical)
- Heading hierarchy
- Structured data (JSON-LD)
- `metadata` export en pages/layouts

**Best Practices (15%):**
- HTTPS, CSP headers
- Sin APIs deprecated
- Error handling
- Console limpia

### 3. Report
Generar reporte siguiendo el formato del skill:

```markdown
## Resultados de Auditoría — [Nombre]

### Issues Críticos (X encontrados)
- **[Categoría]** Descripción. Archivo: `path/to/file.tsx:123`
  - **Impacto:** Por qué importa
  - **Fix:** Cambio específico

### Alta Prioridad (X encontrados)
...

### Resumen
| Categoría | Issues | Críticos | Score Estimado |
|-----------|--------|----------|----------------|
| Performance | X | Y | ~XX |
| Accessibility | X | Y | ~XX |
| SEO | X | Y | ~XX |
| Best Practices | X | Y | ~XX |

### Prioridad Recomendada
1. Primero...
2. Luego...
3. Finalmente...
```

### 4. Fix (con aprobación)
Presentar el reporte al usuario ANTES de hacer cualquier cambio.
Esperar aprobación explícita para proceder con los fixes.
Ejecutar fixes en orden de prioridad (critical → high → medium).

## Checklist Pre-Deploy (Quick)

Si el usuario solo quiere un quick check antes de deploy:

- [ ] `npm run build` sin errores
- [ ] `npm run typecheck` sin errores
- [ ] Core Web Vitals estimados pasando
- [ ] Sin console errors en producción
- [ ] Meta tags presentes en todas las páginas
- [ ] Alt text en imágenes
- [ ] `npm audit` sin vulnerabilidades high/critical
