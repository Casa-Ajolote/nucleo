# Component — `TagChipInput`

> **Tipo:** shared
> **Ubicación:** `src/features/tags/components/TagChipInput.tsx`
> **Usado en:** Item edit form (03-items)
> **Stories:** US-017, US-022

---

## Propósito

Editor de lista de tags basado en chips. Permite agregar tags existentes o nuevos, quitar tags, y mantener la lista consistente con las reglas de validación (lowercase + guiones, max 30 chars, no duplicados).

---

## Props

```ts
interface TagChipInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]          // tags existentes en el workspace para autocomplete
  maxTags?: number                // default: sin límite explícito
  placeholder?: string            // default: "Escribe y enter…"
  disabled?: boolean
}
```

---

## Layout

```
┌────────────────────────────────────┐
│ [#next-js ×] [#docs ×] [#perf ×]   │
│ [autocomplete cursor]              │
└────────────────────────────────────┘
  ↓ (al escribir, aparece dropdown)
┌────────────────────────────────────┐
│ #next                              │
│ #next-js       ← existente         │
│ #next-auth     ← existente         │
│ ─────────────                      │
│ + Crear "#next"                    │
└────────────────────────────────────┘
```

- Los chips existentes son `TagChip` con prop `onRemove`.
- El input ocupa el espacio restante y hace `flex-grow`.
- Autocomplete dropdown aparece cuando el usuario escribe 1+ caracteres.

---

## Interacciones

| Evento | Resultado |
|--------|-----------|
| Escribir texto | Filtra sugerencias en tiempo real |
| Enter con texto | Crea el tag (normalizado) y lo agrega al array |
| Enter sobre una sugerencia highlighted | Agrega la sugerencia |
| Tab | Igual que Enter (convenience) |
| Backspace con input vacío | Elimina el último chip |
| Click en "×" de un chip | Quita ese tag del array |
| Click fuera | Cierra el dropdown |
| Esc | Cierra el dropdown sin crear |

---

## Normalización

Al crear un tag (via Enter o selección), normalizar:

```ts
function normalizeTag(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')          // espacios → guiones
    .replace(/[^a-z0-9-]/g, '')    // solo lowercase + guiones
    .replace(/-+/g, '-')            // no múltiples guiones seguidos
    .replace(/^-|-$/g, '')          // no guiones al inicio/fin
    .slice(0, 30)                   // max 30 chars
}
```

**Validación:**
- Si el resultado queda vacío → no agregar.
- Si el resultado ya está en `value` → no agregar (no duplicar).
- Si el resultado excede 30 chars se trunca silenciosamente.

---

## Autocomplete

- Fuente: prop `suggestions` (tags existentes en el workspace).
- Filtro: `suggestions.filter(s => s.includes(normalizedInput))`.
- Orden: primero los que empiezan con el input, luego los que lo contienen.
- Límite visible: 6 sugerencias.
- Al final del dropdown, siempre la opción "Crear '#[nuevo-tag]'" si el input no match exactamente una sugerencia existente.

---

## Estado interno

```ts
const [inputValue, setInputValue] = useState('')
const [showSuggestions, setShowSuggestions] = useState(false)
const [highlightedIndex, setHighlightedIndex] = useState(0)

const filteredSuggestions = useMemo(
  () => filterSuggestions(suggestions, inputValue, value),
  [suggestions, inputValue, value]
)
```

---

## Accesibilidad

- `role="combobox"` en el contenedor del input.
- `aria-expanded` según `showSuggestions`.
- `aria-activedescendant` apunta al item highlighted del dropdown.
- Cada chip tiene `role="listitem"` y su botón de remove tiene `aria-label="Quitar tag #X"`.
- El input tiene `aria-label="Agregar tag"`.
- Anunciar cambios con `aria-live="polite"` region cuando se agrega/quita un tag.

---

## Componentes usados

- `TagChip` (ver components/README.md) para render de chips.
- Custom dropdown (no `Command` de shadcn aquí porque el input es parte del mismo contenedor visual).
- `Input` base de shadcn como contenedor.

---

## Acceptance Targets

- [ ] Los tags iniciales en `value` se renderizan como chips.
- [ ] Escribir + Enter agrega un tag nuevo normalizado.
- [ ] Intentar agregar un duplicado no crea uno nuevo.
- [ ] Click en "×" de un chip lo quita de la lista.
- [ ] Backspace con input vacío elimina el último chip.
- [ ] Tags con espacios se normalizan a guiones ("Claude Code" → "claude-code").
- [ ] Tags con mayúsculas se normalizan a lowercase.
- [ ] Tags con símbolos se limpian ("c++ dev" → "c-dev").
- [ ] Tags de > 30 chars se truncan.
- [ ] Sugerencias filtradas aparecen mientras el usuario escribe.
- [ ] ↑↓ navega las sugerencias, Enter selecciona la highlighted.
- [ ] Click fuera del componente cierra el dropdown sin crear.

---

## Ejemplo de uso

```tsx
<TagChipInput
  value={form.watch('tags')}
  onChange={(tags) => form.setValue('tags', tags)}
  suggestions={workspaceTags}
  placeholder="Escribe y enter…"
/>
```
