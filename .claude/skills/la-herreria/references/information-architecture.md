# Information Architecture

## What Is Information Architecture?

IA is the structure of the product — how content and features are organized, categorized, and labeled so users can find what they need. It determines what appears in the navigation, how pages relate to each other, and what mental categories the product uses.

Good IA feels invisible. Users find things where they expect them without thinking about it. Bad IA feels like a maze — users know what they want but can't find it.

## Deriving IA from Mental Models and Story Maps

IA is not invented. It is derived from two sources:

### Source 1: Mental Models (from ux-research)

Read `/docs/ux-research/mental-models/`. The mental model defines the categories users expect. If the user thinks of their work in terms of "invoices", "customers", and "payments", those are the top-level categories — regardless of how the database is structured.

**Rule:** Navigation labels match mental model vocabulary. Never expose system terminology in navigation.

### Source 2: Story Map Backbone (from story-mapping)

Read `/docs/story-map/backbone.md`. Each activity on the backbone is a potential top-level navigation item. The backbone is already ordered by user flow — IA follows that order.

**Rule:** If an activity has enough tasks to warrant its own section, it becomes a nav item. If it has 1–2 tasks, it may live inside a parent section.

## Navigation Patterns

Choose ONE pattern for the product. Do not mix patterns. Consistency is more important than any individual pattern being "better."

### Top Navigation Bar
**When to use:** 3–6 top-level sections. Desktop-primary products. Products where users switch between sections frequently.

```
[Logo]  [Section A] [Section B] [Section C] [Section D]     [User]
         ^^^^^^^^^^
         Active section highlighted
```

**Rules:**
- Maximum 6 items. More = group into a dropdown or rethink the IA.
- Active section is always visually distinct.
- Sub-sections appear as a secondary nav row or dropdown on hover/click.

### Sidebar Navigation
**When to use:** 5+ top-level sections with sub-sections. App-style products where users spend long sessions inside one section. Products with hierarchical content.

```
┌─────────────┐
│ [Logo]      │
│             │
│ [Section A] │  ← active
│  [Sub 1]    │
│  [Sub 2]    │
│ [Section B] │
│ [Section C] │
└─────────────┘
```

**Rules:**
- Expandable/collapsible sections keep the sidebar scannable.
- Active item + active section are both highlighted.
- On mobile, sidebar becomes a drawer opened by hamburger menu.

### Bottom Navigation (Mobile Only)
**When to use:** Mobile-first products with 3–5 primary sections. Users need one-thumb access to all major areas.

```
┌───────────────────────┐
│                       │
│     [Content]         │
│                       │
├───────────────────────┤
│ [A]  [B]  [C]  [D]   │  ← icons + labels, active highlighted
└───────────────────────┘
```

**Rules:**
- Maximum 5 items (4 is ideal).
- Icons must be universally understood or labeled.
- Current section is highlighted. Badges show counts (unread, pending).

## Labeling Rules

Labels are the words that appear in navigation and headings. They must match the mental model vocabulary exactly.

- Use the terms from `/docs/ubiquitous-language.md`
- Use nouns for sections ("Invoices"), not verbs ("Create Invoice")
- Use plural for collections ("Invoices", "Customers"), singular for individual items ("Invoice #001")
- Never use internal system names, database table names, or technical terms in navigation

## Hierarchy Rules

- **Maximum depth: 3 levels.** Top section → Sub-section → Detail page. Deeper than 3 means the IA is too complex. Flatten or split.
- **Breadcrumbs for depth.** Any page more than 2 levels deep shows breadcrumbs so users know where they are and can navigate back.
- **Current location is always visible.** The user must always be able to answer "where am I?" by looking at the navigation.

## File Format

Create: `/docs/ux-design/information-architecture.md`

```markdown
# Information Architecture

**Navigation pattern:** [Top nav / Sidebar / Bottom nav]
**Source:** Derived from personas [list] and backbone activities [list]

## Navigation Structure

```
[Section A: Label]
├── [Sub-section A1: Label]
├── [Sub-section A2: Label]
└── Detail: [Individual item page]

[Section B: Label]
├── [Sub-section B1: Label]
└── Detail: [Individual item page]
```

## Section Definitions

### [Section A: Label]
**Mental model source:** [Which mental model this maps to]
**Backbone activity:** [Which story map activity]
**Contains:** [What the user finds here]
**Entry point:** [How users get here — nav item, link, etc.]

### [Section B: Label]
[Same structure]

## Labeling Decisions
| Label used | Why | Alternative rejected | Why rejected |
|---|---|---|---|
| [Label] | [Reason — matches mental model / ubiquitous language] | [Alt] | [Why not] |

## Navigation Rules (product-specific)
- [Any rules specific to this product's IA]
```

## Common IA Mistakes

- **Organizing by feature instead of by user goal.** "Reports" is a feature. "My Business Health" is a user goal. Organize around what the user wants to accomplish.
- **Too many top-level sections.** If navigation has 8+ items, users can't scan it. Group related sections. Reduce scope.
- **Inconsistent labeling.** Calling something "Invoices" in the nav but "Bills" in the content. Pick one term. Use it everywhere.
- **Burying critical actions.** If the primary action (create invoice) requires more than 2 clicks from any page, the IA is wrong. Primary actions should be reachable from anywhere.
