# La Herrería — Guía de Instalación

## Opción 1: Claude Projects (Recomendada)

La forma más limpia de usar La Herrería. El Orchestrator vive en el proyecto
y los skills se adjuntan bajo demanda.

### Setup

1. Ir a claude.ai → Projects → Crear proyecto "La Herrería"
2. En **Project Knowledge**, subir UN solo archivo:
   - `SKILL.md` (el orchestrator principal)
3. En **Custom Instructions**, pegar:

```
Eres La Herrería, un pipeline de diseño de aplicaciones. Sigue las instrucciones
del SKILL.md para coordinar el proceso. Cuando necesites ejecutar un skill específico,
pide al usuario que adjunte el archivo correspondiente.
Siempre comunica en español a menos que el usuario escriba en otro idioma.
```

4. Listo. Cada chat nuevo en el proyecto tiene acceso al Orchestrator.

### Uso diario

- Abrir un chat en el proyecto "La Herrería"
- Decir "Tengo una idea para una app" o lo que necesites
- Cuando La Herrería pida un skill, adjuntar el .md correspondiente
- Los outputs se generan como archivos descargables

### Organización de archivos

Mantener los skills en tu computadora:

```
~/Documents/la-herreria/
├── SKILL.md                    ← Ya subido al proyecto
├── references/
│   └── skills-catalog.md
├── 01-pdr-generator/SKILL.md
├── 02-tech-spec/SKILL.md
├── 03-user-stories/SKILL.md
├── 04-wireframes/SKILL.md
├── 05-stitch-prompts/SKILL.md
├── 06-master-blueprint/SKILL.md
└── front-end-design/SKILL.md
```

---

## Opción 2: Claude Code (Terminal)

Para developers que trabajan en terminal.

### Setup

1. Copiar la carpeta `la-herreria/` a la raíz de tu proyecto (o a `~/.claude/skills/`)
2. Claude Code detecta los SKILL.md automáticamente
3. Usar: `claude "usa la-herreria para diseñar mi app"`

### Ventaja

Claude Code puede leer los skills directamente del filesystem — no necesitas
adjuntar nada manualmente. El Orchestrator los carga automáticamente.

---

## Opción 3: Chat Individual (Sin Proyecto)

La forma más simple, funciona en cualquier plan de Claude.

### Uso

1. Abrir un chat nuevo en claude.ai
2. Adjuntar `SKILL.md` (el orchestrator)
3. Describir lo que necesitas
4. Adjuntar skills adicionales cuando La Herrería los pida

### Limitación

Los skills no persisten entre chats. Cada conversación nueva requiere
volver a adjuntar el orchestrator.

---

## Opción 4: Claude Desktop (MCP)

Para quienes usan Claude Desktop con acceso al filesystem.

### Setup

1. Guardar `la-herreria/` en una ubicación accesible
2. Configurar MCP file access para esa carpeta
3. Claude Desktop puede leer los skills directamente

---

## Tips de Uso

### Primer Uso

1. Empieza con "Tengo una idea para una app: [describe tu idea]"
2. La Herrería te guiará paso a paso
3. No necesitas conocer los skills individuales

### Retomar Trabajo

1. Adjunta el orchestrator + tus outputs previos (PDR-xxx.md, TECH-SPEC-xxx.md, etc.)
2. Di "¿En qué quedamos?"
3. La Herrería detecta tu progreso y propone el siguiente paso

### Solo Un Paso

1. Adjunta el orchestrator + el skill específico que necesitas
2. Di directamente "Genera wireframes" o lo que necesites
3. La Herrería verifica que tienes los inputs necesarios

### Pipeline Completo en Una Sesión

Si quieres hacerlo todo de una vez:
1. Adjunta el orchestrator
2. Ten los 6 skills listos para adjuntar cuando se pidan
3. Planea 2-4 horas de trabajo
4. El resultado: 6 documentos profesionales listos para construir tu app

---

## Actualizar Skills

Los skills son independientes. Puedes actualizar uno sin tocar los demás:

1. Editar el SKILL.md del skill específico
2. No necesitas re-subir el orchestrator
3. La próxima vez que adjuntes el skill actualizado, Claude usa la nueva versión

## Crear Skills Nuevos

El pipeline es extensible. Puedes agregar skills como:

- Skill #7: Code Generator (Blueprint → código scaffolding)
- Skill #8: Testing Strategy (Stories → test plan)
- Skill #9: API Documentation (Tech Spec → OpenAPI spec)

Solo crea una carpeta `07-code-generator/SKILL.md` y actualiza el orchestrator
para que lo reconozca.
