# /design — Gestionar DESIGN.md

> **Tu rol:** Design Systems Lead que sintetiza decisiones de diseño en un archivo portable.
> **Output:** `DESIGN.md` en el root del proyecto — source of truth para todos los agentes y comandos.

## Detección de Contexto

```
¿Existe DESIGN.md en el root del proyecto?
  → SÍ: Modo actualización
  → NO: ¿Hay proyecto en Stitch MCP?
    → SÍ: Modo extracción
    → NO: Modo generación desde cero
```

---

## Modo 1: Generación desde Cero

**Cuando no existe DESIGN.md ni proyecto Stitch.**

### Paso 1: Discovery

Leer el skill Impeccable en `.claude/skills/impeccable/SKILL.md`.
Leer el template en `.claude/skills/impeccable/references/design-md-template.md`.

Preguntar al usuario:

```
🎨 Vamos a definir el Design System de tu proyecto.

1. ¿Qué SENSACIÓN debe transmitir?
   (Elegante hotel boutique / Eficiente cockpit / Cálida cafetería / Bold streetwear / Otra)

2. ¿Tienes colores de marca definidos?
   (Si no, propongo basándome en tu industria)

3. ¿Alguna app o sitio cuyo diseño admires?
   (No tiene que ser del mismo rubro)

4. ¿Cuál es el dispositivo principal de tus usuarios?
   (Mobile-first / Desktop-first / Ambos)
```

### Paso 2: Escanear Proyecto (si existe código)

Si hay código en `src/`:
1. Leer `tailwind.config.*` → colores y fuentes actuales
2. Leer `globals.css` → variables CSS
3. Revisar 3-5 componentes → patterns recurrentes
4. Detectar fuentes importadas en `layout.tsx`

### Paso 3: Generar DESIGN.md

Siguiendo el template de `.claude/skills/impeccable/references/design-md-template.md`:
- Secciones 1-5: Core design system (compatible con Google Stitch)
- Sección 6: Motion & Animation (extensión Forge)
- Sección 7: Anti-AI-Slop Markers (extensión Forge)
- Sección 8: Generation Notes (prompts naturales para regenerar)

**Escribir en lenguaje descriptivo + hex codes.** No CSS técnico.

Presentar al usuario para aprobación antes de guardar.

---

## Modo 2: Extracción desde Stitch

**Cuando el Stitch MCP está disponible.**

### Paso 1: Conectar con Stitch

```
1. list_projects → encontrar el proyecto target
2. list_screens → identificar pantallas diseñadas
3. get_project → extraer designTheme (colores, fuentes, roundness)
4. get_screen → obtener HTML/CSS de la pantalla principal
```

### Paso 2: Analizar Assets

Del `designTheme`:
- Color mode, custom colors, fonts, roundness → Secciones 2, 3, 4

Del HTML/CSS descargado:
- Clases Tailwind → traducir a lenguaje descriptivo
- Patterns de componentes → Sección 4
- Layout structure → Sección 5

### Paso 3: Sintetizar DESIGN.md

Combinar datos de Stitch con las extensiones Forge:
- Secciones 1-5: Extraídas de Stitch (traducidas a lenguaje semántico)
- Sección 6: Inferir motion patterns del HTML o proponer defaults
- Sección 7: Aplicar AI Slop Test y documentar markers
- Sección 8: Generar prompts naturales para Stitch

---

## Modo 3: Extracción desde URL

**Cuando el usuario proporciona una URL de un sitio existente.**

### Paso 1: Capturar

Usar Playwright MCP:
```
playwright_navigate → URL del sitio
playwright_screenshot → Captura visual de referencia
```

### Paso 2: Analizar

Inspeccionar el DOM:
- Fuentes cargadas, colores dominantes, spacing patterns
- Componentes recurrentes, estados de interacción
- Layout responsive

### Paso 3: Sintetizar

Generar DESIGN.md infiriendo el design system del sitio analizado.
Presentar al usuario para validación — pueden existir elementos no visibles.

---

## Modo 4: Actualización

**Cuando ya existe DESIGN.md.**

### Paso 1: Leer Estado Actual

```
1. Leer DESIGN.md existente
2. Escanear src/ para detectar divergencias
3. Comparar tokens documentados vs implementados
```

### Paso 2: Reportar Divergencias

```
📊 DESIGN.md vs Código Actual:

✅ Colores: 5/5 tokens en uso
⚠️  Tipografía: Body usa 'Inter' en 2 componentes (DESIGN.md dice 'DM Sans')
❌ Spacing: 8 valores hardcodeados no usan tokens
✅ Motion: Consistente con documentación
```

### Paso 3: Proponer Actualización

- ¿Actualizar DESIGN.md para reflejar el código? (el código es la verdad)
- ¿O normalizar el código para matchear DESIGN.md? (→ sugerir `/normalize`)

---

## Reglas

- **Lenguaje descriptivo** — "Ocean-deep Cerulean (#0077B6)", no "blue" ni "text-blue-600"
- **Siempre hex codes** — Nombre + hex en paréntesis, sin excepción
- **Traducir CSS** — "rounded-xl" → "generously rounded corners (12px)"
- **Explicar el POR QUÉ** — Cada decisión tiene una razón vinculada al producto
- **Compatible con Stitch** — Secciones 1-5 siguen el spec de Google exactamente
- **No duplicar Impeccable** — DESIGN.md documenta decisiones, Impeccable define guidelines

---

*"Un design system que nadie lee es decoración. DESIGN.md es el contrato visual entre diseño y código."*
