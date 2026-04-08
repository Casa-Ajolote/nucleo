# Nucleo — Onboarding Strategy

> **Fecha**: 2026-04-01
> **Tipo de onboarding**: Empty State Design + Guided First Action
> **Time-to-first-success target**: < 60 segundos

---

## First Success

> **¿Cual es la cosa mas valiosa que este usuario puede lograr en la primera sesion?**

**Pegar un link y verlo analizado por la IA con resumen, tags y categoria.**

Ese es el momento "wow" — el usuario pega algo, la IA lo procesa, y aparece organizado automaticamente. Eso es exactamente lo que no puede hacer en ninguna otra herramienta. Todo el onboarding apunta a ese momento.

---

## Flujo de Primer Uso

```
Registro (email + password)
       │
       ▼
Redirect a Home (workspace "Personal" seleccionado)
       │
       ▼
Empty state con CTA claro
       │
       ▼
Tap "+" → Pegar primer link/texto
       │
       ▼
Item aparece con skeleton → IA procesa → Card completo
       │
       ▼
✅ FIRST SUCCESS — El usuario ve su contenido analizado y categorizado
```

**Tiempo total estimado:** 30-45 segundos (registro) + 15-30 segundos (captura) = < 90 segundos.

---

## Empty States

Cada vista con lista/grid tiene un empty state disenado. Nunca "No hay datos" o una pantalla en blanco.

### Home / Grid principal (primer login)

```
┌─────────────────────────────────────────┐
│                                         │
│          [Icono: cerebro/lightbulb]     │
│                                         │
│     Tu segundo cerebro esta listo       │
│                                         │
│     Pega un link, texto o comando       │
│     y la IA lo analiza por ti.          │
│                                         │
│        [ + Guardar mi primero ]         │  ← CTA primario
│                                         │
│     Tip: Prueba pegando un link de      │
│     GitHub o un post de X               │
│                                         │
└─────────────────────────────────────────┘
```

- **Icono:** Relevante al dominio (cerebro, lightbulb, o similar)
- **Headline:** Corta, orientada a accion, sin jargon
- **Body:** 1 frase que explica que hacer
- **CTA:** Boton primario que abre el dialogo de captura directamente
- **Tip:** Sugerencia concreta para reducir la barrera de "que pego primero?"

### Carpeta vacia

```
┌─────────────────────────────────────────┐
│                                         │
│          [Icono: carpeta abierta]       │
│                                         │
│     Esta carpeta esta vacia             │
│                                         │
│     Mueve items aqui o captura          │
│     algo nuevo directamente.            │
│                                         │
│        [ + Capturar aqui ]              │
│                                         │
└─────────────────────────────────────────┘
```

CTA abre dialogo de captura con la carpeta pre-seleccionada.

### Resultados de busqueda vacios

```
┌─────────────────────────────────────────┐
│                                         │
│          [Icono: lupa con X]            │
│                                         │
│     No encontre nada para "[query]"     │
│                                         │
│     Intenta con otras palabras          │
│     o revisa los filtros activos.       │
│                                         │
│     [ Limpiar filtros ]                 │
│                                         │
└─────────────────────────────────────────┘
```

Si hay filtros activos, el CTA es "Limpiar filtros". Si no hay filtros, no hay CTA — solo la sugerencia.

### Workspace vacio (workspace recien creado)

```
┌─────────────────────────────────────────┐
│                                         │
│          [Icono: workspace/briefcase]   │
│                                         │
│     Workspace "[nombre]" listo          │
│                                         │
│     Empieza a guardar contenido         │
│     o importa tus bookmarks.            │
│                                         │
│   [ + Capturar ]    [ Importar ]        │
│                                         │
└─────────────────────────────────────────┘
```

Dos CTAs: capturar (primario) e importar (secundario).

### Sin tags (sidebar)

```
Los tags se generan automaticamente
cuando guardes tu primer item.
```

Texto sutil inline en la seccion de tags del sidebar. No necesita CTA — los tags aparecen solos.

### Sin categorias filtradas

```
No hay items con la categoria "[nombre]"
en este workspace.
```

Texto simple sin CTA.

---

## Guided First Action

El dialogo de captura en la primera vez incluye un helper adicional:

```
┌─────────────────────────────────────────┐
│  Guardar en: Personal             [X]  │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │  Pega un link, texto, markdown  │    │
│  │  o comando aqui...              │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  💡 La IA analizara tu contenido        │
│     automaticamente                     │
│                                         │
│  ▸ Guardar en carpeta...                │
│                                         │
│              [ Guardar ]                │
│                                         │
└─────────────────────────────────────────┘
```

- **Helper text (💡):** Solo se muestra las primeras 3 veces. Despues desaparece. Guardado en localStorage.
- **Autofocus:** El cursor esta en el area de texto al abrir — el usuario puede pegar inmediatamente.
- **Workspace pre-seleccionado:** El workspace activo, visible pero no prominente (texto gris arriba).

---

## Sugerencia de Instalacion PWA

Despues del first success (primer item guardado y procesado), mostrar un banner sutil:

```
┌─────────────────────────────────────────┐
│ 📱 Instala Nucleo en tu iPhone:         │
│ Tap en Compartir → Agregar a inicio     │
│                                 [ OK ]  │
└─────────────────────────────────────────┘
```

- Se muestra 1 vez despues del first success
- Dismissible con "OK"
- Se guarda en localStorage para no mostrar de nuevo
- Solo aparece en Safari iOS (no en desktop ni Android)

---

## Lo Que NO Se Incluye en Onboarding

- **No hay tutorial paso a paso.** El usuario es tech-savvy. El empty state + CTA es suficiente.
- **No hay tooltips en todas partes.** Solo el helper en el dialogo de captura las primeras 3 veces.
- **No hay video explicativo.** La app es lo suficientemente simple para entenderse sola.
- **No hay checklist de "completa tu perfil".** No hay perfil que completar.
- **No hay progress bar de setup.** El setup es: registrarse → pegar algo. 2 pasos.

---

## Metricas de Onboarding (observar, no medir con analytics)

Como es una herramienta personal sin analytics en Fase 1, estas metricas se observan manualmente:

1. **Time-to-first-success:** ¿Cuanto tardo en pegar mi primer item? Target: < 60s.
2. **First-day retention:** ¿Volvi a usar la app el mismo dia?
3. **First-week items:** ¿Cuantos items guarde en la primera semana? Target: > 10.
4. **Search usage:** ¿Use la busqueda en la primera semana? Si no, el contenido no llego a masa critica aun.
