# Nucleo — Usability Evaluation: Captura y Busqueda

> **Fecha**: 2026-04-01
> **Features evaluadas**: Captura de contenido (Epic 3), Busqueda global (Epic 6)
> **Persona**: Power user / developer (tech-savvy, iPhone primary)

---

## Evaluacion Heuristica

### H1: Visibilidad del estado del sistema

**Score: 0 (Sin violaciones)**

- El FAB "+" esta siempre visible → el usuario sabe como capturar en todo momento
- El status de procesamiento AI es visible en el card (skeleton → ready → failed)
- La busqueda muestra resultados live mientras escribe → feedback inmediato
- El workspace activo siempre visible en top bar

---

### H2: Match entre sistema y mundo real

**Score: 0 (Sin violaciones)**

- Vocabulario usa terminos del usuario: "Workspace", "Carpeta", "Tag" (no jargon tecnico)
- El tipo de contenido se auto-detecta — el usuario no necesita saber que "link" es diferente de "markdown" internamente
- "Guardar" en vez de "Submit", "Copiar" en vez de "Copy to clipboard"

---

### H3: Control y libertad del usuario

**Score: 1 (Cosmetico)**

- El usuario puede editar tags/categorias/carpeta despues de que la IA los asigna ✅
- Cancelar dialogo de captura es posible (tap fuera o X) ✅
- **Violacion menor:** No hay "deshacer" despues de eliminar un item. La confirmacion lo mitiga, pero un undo de 5 segundos seria mejor.
  - **Severidad:** 1 (Cosmetico) — La confirmacion es suficiente para MVP.
  - **Recomendacion:** Agregar undo con toast "Item eliminado. Deshacer" en Fase 2.

---

### H4: Consistencia y estandares

**Score: 0 (Sin violaciones)**

- Todos los dialogs se comportan igual: overlay, X para cerrar, tap fuera para cerrar
- Todos los formularios validan on submit, errores inline
- El FAB "+" es consistente — siempre captura, nunca cambia de funcion
- Cards en grid son consistentes — mismo layout para todos los tipos de contenido

---

### H5: Prevencion de errores

**Score: 0 (Sin violaciones)**

- Deteccion de duplicados antes de guardar (URL exacta) → previene items repetidos
- Max 5 workspaces validado en server → no deja crear el 6to
- Max 3 niveles de carpetas validado → no deja crear el 4to nivel
- El tipo de contenido se auto-detecta → el usuario no puede "equivocarse" de tipo

---

### H6: Reconocimiento sobre memoria

**Score: 0 (Sin violaciones)**

- Todos los filtros activos se muestran como chips visibles → no hay que recordar que esta filtrado
- El breadcrumb muestra la ruta: Workspace > Carpeta > Subcarpeta → el usuario sabe donde esta
- El workspace activo siempre visible en top bar
- Los tags se muestran en los cards → no hay que abrir el detalle para saber de que trata

---

### H7: Flexibilidad y eficiencia de uso

**Score: 0 (Sin violaciones)**

- **Atajos:** Cmd+K para search (desktop). Enter para submit en formularios de 1 campo.
- **Copy con 1 click:** Boton de copy directo en el card para items tipo command
- **Captura en 3 taps:** FAB → pegar → guardar
- **Search primero:** El usuario puede buscar directamente sin navegar la jerarquia

---

### H8: Diseno estetico y minimalista

**Score: 0 (Sin violaciones)**

- El dialogo de captura es minimo: 1 campo + 1 boton + selector de carpeta oculto
- Los cards muestran solo lo esencial: titulo, resumen (2 lineas), thumbnail, tipo, 3 tags
- El sidebar no esta siempre visible en mobile — se oculta como drawer
- Sin elementos decorativos innecesarios

---

### H9: Ayuda a reconocer, diagnosticar y recuperarse de errores

**Score: 0 (Sin violaciones)**

- Errores de AI: card muestra "Fallido" + boton "Reintentar" + opcion de editar manualmente
- Errores de validacion: mensaje especifico que dice que esta mal ("El nombre es obligatorio")
- Errores de red: toast con mensaje claro + boton reintentar
- URL inaccesible: item se guarda sin metadata, no falla silenciosamente

---

### H10: Ayuda y documentacion

**Score: 1 (Cosmetico)**

- **Violacion menor:** No hay tooltips explicativos para usuarios nuevos (ej: que hace el toggle de tipo "command")
  - **Severidad:** 1 (Cosmetico) — El usuario es tech-savvy y es una herramienta personal. El onboarding cubre el first success.
  - **Recomendacion:** Considerar tooltips contextuales en Fase 2 si se abre a mas usuarios.

---

## Resumen

| Heuristico | Score | Severidad |
|-----------|-------|-----------|
| H1: Visibilidad del estado | 0 | — |
| H2: Match mundo real | 0 | — |
| H3: Control y libertad | 1 | Cosmetico |
| H4: Consistencia | 0 | — |
| H5: Prevencion errores | 0 | — |
| H6: Reconocimiento > memoria | 0 | — |
| H7: Flexibilidad | 0 | — |
| H8: Minimalismo | 0 | — |
| H9: Error recovery | 0 | — |
| H10: Ayuda | 1 | Cosmetico |

**Total violaciones: 2 (ambas cosmeticas, Severidad 1)**
**Violaciones Severidad 4: 0** → No hay bloqueos. Proceder al siguiente skill.
