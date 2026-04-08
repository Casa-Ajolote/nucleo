# Component Selection

## Decision: Use Existing or Create New?

For each UI element in a screen flow, run this decision tree:

### Does a component already exist in the design system that does this?
**Yes** → Use it. Do not create a variant unless the existing component genuinely cannot accommodate the need.
**No** → Continue to next question.

### Can an existing component be composed to achieve this?
**Yes** → Compose. Example: a labeled input is just a Label + Input + HelperText arranged vertically. No new component needed.
**No** → Continue to next question.

### Is this element likely to appear in more than one screen or feature?
**Yes** → Create a new reusable component. Spec it in `/docs/ui-design/components/[name].md`
**No** → Implement inline in the screen. It's a one-off layout detail, not a component.

## When Existing Components Need Modification

If an existing component almost works but needs a small addition, prefer:

1. **Props first** — can a new prop configure the existing component? (e.g., `size="compact"`, `variant="inline"`)
2. **Composition second** — can you wrap the component with additional elements?
3. **New variant last** — only if the behavior is fundamentally different, not just visually different

**Never fork a component** to create a slightly different version. Two components that drift apart are harder to maintain than one flexible component.

## Specifying a New Component

When a new component is needed, create: `/docs/ui-design/components/[component-name].md`

```markdown
# Component: [Name]

**First used in:** [feature name], [screen name]
**Design system token group:** [which token group it belongs to — e.g., form, feedback, navigation]

## Purpose
[One sentence: what this component does for the user]

## When to Use
- [Situation where this component is appropriate]
- [Another situation]

## When NOT to Use
- [Situation where a different component is better]

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| [name] | [type] | Yes/No | [value] | [what it does] |

## States

| State | Description | Visual indication |
|-------|-------------|-------------------|
| Default | [normal state] | [how it looks] |
| Hover | [mouse over] | [how it looks] |
| Focus | [keyboard focus] | [how it looks] |
| Disabled | [not interactive] | [how it looks] |
| Error | [invalid state] | [how it looks] |
| Loading | [waiting for data] | [how it looks] |

## Variants
- **[Variant name]:** [when to use this variant, how it differs]

## Accessibility
- **Role:** [ARIA role]
- **Keyboard:** [how keyboard navigation works]
- **Screen reader:** [what gets announced]
- **Color contrast:** [meets WCAG AA minimum]

## Usage Example
```
[Show the component in context — which props, which state, 
placed within a parent layout]
```

## Do Not
- [Anti-pattern specific to this component]
- [Another anti-pattern]
```

## Component Categories

Organize components into these categories. New components should be placed in the correct category:

**Form** — inputs, selects, checkboxes, radio buttons, text areas, date pickers
**Feedback** — alerts, toasts, error messages, validation messages, loading indicators, progress bars
**Navigation** — nav bars, breadcrumbs, tabs, pagination, back buttons, sidebars
**Layout** — cards, panels, modals, drawers, accordions, grids
**Display** — tables, lists, badges, avatars, icons, chips/tags
**Action** — buttons, icon buttons, menus, dropdowns, context menus

## Reuse Rules

- A component used in 1 place is a layout detail
- A component used in 2+ places is a candidate for the design system
- A component used in 3+ places is a design system component — spec it formally
- All design system components must have documented props, states, and accessibility

## Naming Conventions

- PascalCase: `InvoiceStatusBadge`, not `invoice-status-badge`
- Name after what it IS, not where it's used: `StatusBadge`, not `InvoicePageBadge`
- If a component is a variant of another, use a prop: `Badge variant="status"`, not a new `StatusBadge` component
