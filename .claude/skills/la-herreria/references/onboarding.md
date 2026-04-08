# Onboarding

## Why Onboarding Matters

First-time users have zero context. They don't know what the product does, where things are, or what to do first. The first 60 seconds determine whether a user stays or leaves. Onboarding is not a feature — it is the product's first conversation with the user.

The goal of onboarding is not to teach the entire product. It is to get the user to their first success as fast as possible. Once they experience success, they are motivated to explore further.

## The First Success Principle

Every onboarding strategy must answer one question: **What is the single most valuable thing this user can accomplish in the first session, and how do we get them there with zero friction?**

This is the "first success." Everything in onboarding is optimized to reach it. Features, settings, and advanced capabilities wait until after first success.

**Example:** For an invoicing product, first success = "User creates and sends their first invoice." Onboarding does not teach reporting, settings, or integrations first. It guides the user straight to creating an invoice.

## Onboarding Patterns

Choose the pattern(s) appropriate for the product and primary persona. Most products use a combination.

### Pattern 1: Empty State Design

The most important onboarding moment is often the first screen the user sees after signing up — which is empty. An empty screen with no guidance causes immediate abandonment. An empty screen with a clear next step causes immediate engagement.

**Structure of an effective empty state:**
```
[Icon or illustration — relates to the domain, not generic]

[Headline — what the user will be able to do here]
"Your invoices will appear here"

[Body — one sentence of context]
"Create your first invoice to get started."

[Primary action button — the single most important thing to do]
[Create Invoice]

[Optional: secondary link for users who need context first]
"Not sure where to start? See how it works →"
```

**Rules:**
- Every list, table, or data view has a designed empty state
- The empty state is not a blank page with a generic "No data" message
- The primary action in the empty state is the same action that leads to first success
- The empty state disappears completely once data exists — it is not a persistent element

### Pattern 2: Guided First Action

After the user clicks the empty state's primary action, guide them through the first completion without interruption.

**How it works:**
- The form or flow for the first action is pre-populated with sensible defaults wherever possible
- Required fields are minimal for the first action — reduce friction to zero
- Helper text or placeholder text explains what to put in each field
- No optional fields are shown on the first pass (progressive disclosure — see interaction-patterns.md)
- After completion, a clear success state confirms what was accomplished

**Example flow:**
```
1. Empty state: "Create your first invoice"  →  [Create Invoice]
2. Form appears with:
   - Customer name (helper: "Who is this invoice for?")
   - Amount (helper: "How much do they owe?")
   - Due date (default: 30 days from today)
   - [Send Invoice] button
3. Success: "Invoice sent to [Customer]! They'll receive it by email."
4. User lands on invoice detail — first success achieved.
```

### Pattern 3: Contextual Tooltips

After first success, reveal additional capabilities at the point where they become relevant — not all at once.

**Rules:**
- Tooltips appear only when the user navigates to a new area for the first time
- One tooltip at a time. Never show multiple tooltips simultaneously.
- Each tooltip explains one thing: what this control does and why it matters
- Tooltips are dismissible. They do not block interaction.
- Tooltips do not reappear after dismissal (within the same session or across sessions, depending on product)
- Tooltips are not shown for controls that are self-explanatory (a button labeled "Save" needs no tooltip)

**Trigger rules:**
- First visit to a new section → show tooltip for the primary action in that section
- First time a new feature becomes available (e.g., after completing a prerequisite) → show tooltip explaining the new capability
- Never show tooltips based on time alone ("You've been using this for 5 minutes, here's a tip") — this interrupts flow

### Pattern 4: Progress Indication

For products where setup requires multiple steps (profile completion, integrations, configuration), show progress so the user knows what remains.

**Structure:**
```
Setup Progress: ██████░░░░  60% complete

✅ Create account
✅ Send first invoice
○  Connect bank account
○  Set up recurring invoices
```

**Rules:**
- Progress indication is only used when there are 3+ distinct setup steps
- Each step has a clear completion condition — no ambiguity about whether it's done
- Steps are ordered by value: the most valuable actions first
- Completing all steps is encouraged but never required — the product is fully usable after first success
- Progress indication disappears once all steps are complete or after a reasonable time (it does not linger forever)

## Onboarding Strategy Document

Create: `/docs/ux-design/onboarding.md`

```markdown
# Onboarding Strategy

**Primary persona:** [Name — from personas]
**First success definition:** [The single most valuable accomplishment in the first session]
**Patterns used:** [List: empty state design, guided first action, contextual tooltips, progress indication]

## First Success Flow

[Step-by-step description of how the primary persona reaches first success.
Include what they see at each step, what is pre-populated, what is hidden.]

1. [Step 1 — what the user sees and does]
2. [Step 2]
3. [Step N — first success achieved]

## Empty States

| Screen | Empty state message | Primary action | Secondary link |
|---|---|---|---|
| [Screen name] | [Headline] | [Button label] | [Link text → destination] |
| [Screen name] | [Headline] | [Button label] | [Link text → destination] |

## Contextual Tooltips

| Location | Trigger | Tooltip text | Why here |
|---|---|---|---|
| [Control or section] | [What triggers it] | [What the tooltip says] | [Why this is the right moment] |

## Progress Steps (if applicable)

| Step | Completion condition | Value delivered |
|---|---|---|
| [Step name] | [How we know it's done] | [What the user gains] |

## Secondary Persona Onboarding

[How does the secondary persona's first experience differ? Do they need a different first success path? Are there empty states specific to their view?]
```

## Common Onboarding Mistakes

- **Teaching the product before the user has a reason to care.** A video tour on signup teaches nothing — the user has no context to attach the information to. Guide them to first success first. Then teach.
- **Requiring setup before first value.** If the user must complete a 10-step setup before they can do anything useful, they leave. Make first success possible with zero setup.
- **Showing everything at once.** A dashboard full of empty widgets and "Get started" prompts everywhere is as confusing as an empty page. One clear next step at a time.
- **Never letting go.** Tooltips and guides that persist forever become noise. They should fade as the user becomes comfortable. The product should feel clean and uncluttered after the first session.
- **Ignoring the returning user.** A user who left mid-onboarding and returns should pick up where they left off, not restart. Preserve state.
