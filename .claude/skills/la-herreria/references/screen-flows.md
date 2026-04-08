# Screen Flows

## What is a Screen Flow?

A screen flow documents every screen a feature touches, how they connect, what each screen contains, and how it behaves. It is the design specification that acceptance tests verify against.

## Design Principles

**Follow the user, not the feature.** Order screens by the path the user walks, not by technical grouping. A user creating an invoice starts at the list, moves to the form, ends at the detail. Design in that order.

**One screen flow per feature.** A feature file maps to one screen flow document. If a feature touches screens that already exist, document what changes on those screens — don't redesign from scratch.

**Design for the walking skeleton first.** The minimum viable version of each screen. Depth (sorting, filtering, pagination) comes in later releases.

**Annotate with scenario references.** Every design decision should trace back to a specific scenario. This makes acceptance tests straightforward to write.

## Screen Document Structure

Each screen within the flow follows this structure:

```markdown
### [Screen Name]

**Entry from:** [Previous screen] via [action — e.g., "Create button"]
**Scenario refs:** [TASK-ID], Scenario: [scenario name]

#### Layout
[Describe the spatial arrangement — what's at the top, middle, bottom.
Use a simple ASCII wireframe or prose description.]

#### Data Displayed
| Element | Source | Format |
|---------|--------|--------|
| [Label] | [where data comes from] | [how it's formatted] |

#### Actions
| Action | Control Type | Outcome |
|--------|-------------|---------|
| [What user does] | [button/input/select/link] | [what happens next] |

#### States
- **Default:** [what the screen looks like when first loaded]
- **Loading:** [what the user sees while data is fetching]
- **Empty:** [what the user sees when there's no data]
- **Error:** [what the user sees when something fails]
- **Success:** [what the user sees after a successful action]

#### Accessibility
- [Key keyboard navigation path]
- [Screen reader label for primary action]
- [Any ARIA roles or states needed]
```

## File Format

Create: `/docs/ui-design/screen-flows/[feature-name].md`

```markdown
# Screen Flow: [Feature Name]

**Feature file:** `/features/[domain]/[feature].feature`
**Story map task:** [TASK-ID]
**Release:** [Release name]

## Flow Summary

[Simple prose description of the user's path through the feature.
2-3 sentences maximum.]

## Flow Diagram

```
[Screen A] --[action]--> [Screen B] --[action]--> [Screen C]
                              |
                         [error] --> [Screen B with error state]
```

## Screens

[Screen documents in user-flow order, using the structure above]
```

## Notation for Flow Diagrams

Keep diagrams simple. ASCII is fine — the point is connectivity, not visual polish.

```
[List Page] --[Create button]--> [Create Form]
[Create Form] --[Save]--> [Detail Page]
[Create Form] --[Cancel]--> [List Page]
[Create Form] --[validation error]--> [Create Form, error state]
[Detail Page] --[Edit button]--> [Edit Form]
[Detail Page] --[Back]--> [List Page]
```

## Designing for Existing Screens

When a new feature adds to a screen that already exists, document only the delta:

```markdown
### Invoice List (modified)

**Changes for this feature:**
- New column: "Status" — displays invoice state (Draft/Sent/Paid/Cancelled)
- New filter: "Status" dropdown in filter bar
- New action: "Export" button in toolbar

**Unchanged:** Sorting, pagination, search, row selection
```

## Common Mistakes

- Designing screens that no scenario requires — stick to what the scenarios describe
- Skipping the empty and error states — these are scenarios too
- Making screens too dense — if a screen has more than 7 primary actions, it's doing too much. Split into sub-screens or progressive disclosure
- Ignoring mobile — if the product will be used on mobile, note responsive breakpoints
