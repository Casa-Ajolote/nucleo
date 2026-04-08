# Interaction Patterns

## What Are Interaction Patterns?

Interaction patterns are the rules that govern how controls behave. They are product-wide conventions. A button behaves the same way on every screen. A form validates the same way everywhere. An error is presented the same way throughout.

Consistency here is the difference between a product that feels like one cohesive tool and a product that feels like a collection of unrelated screens.

## Pattern 1: Feedback Loops

Every action the user takes must produce a visible result. Without feedback, users don't know if their action worked, repeat it (causing duplicates), or lose trust.

### Feedback Timing

| Action type | Feedback timing | Feedback type |
|---|---|---|
| Button click (instant action) | Immediate (< 200ms) | Visual state change on button |
| Form submission | Immediate (button shows loading) | Loading state, then success or error |
| Data save (auto-save) | Within 2 seconds | Subtle "Saved" indicator, fades after 3s |
| Background process | Within 5 seconds | Progress indicator or status update |
| Long-running process (> 10s) | Ongoing | Progress bar with estimated time, or "We're working on it" |

### Feedback Hierarchy

- **Micro-feedback:** Button press ripple, checkbox toggle animation. Confirms the control registered the interaction.
- **Action feedback:** Toast notification, inline status change. Confirms the action completed.
- **State feedback:** Page updates, data refreshes. Confirms the result is reflected.

**Rule:** Never skip a level. If a button click triggers a save, the user needs micro-feedback (button reacts), action feedback (save confirmed), AND state feedback (the saved data appears).

## Pattern 2: Form Behavior

Forms are the most common interaction pattern. Consistency here has the highest impact.

### Validation Timing

| Validation type | When to validate | Why |
|---|---|---|
| Required field | On blur (when user leaves the field) | Validates too early (on focus) is annoying. Too late (on submit) wastes time. |
| Format validation (email, phone) | On blur | Same reasoning as required fields |
| Cross-field validation (password confirm) | On blur of the second field | Can't validate until both fields have values |
| Business rule validation (unique name) | On blur, requires server call | Must check against existing data |
| Form-level validation | On submit | Catches anything field-level missed |

### Error Presentation

- Field-level errors appear **inline, directly below the field**. Never at the top of the form alone.
- The field border changes to error state (see ui-design-system components reference).
- Focus moves to the first field with an error on submit.
- Error messages are specific: "Email must contain @" not "Invalid input".
- Error messages suggest correction: "Must be at least 8 characters (currently 5)" not just "Too short".

### Success After Submit

- Form disappears or transitions to a confirmation/detail view
- A success indicator confirms what was created or saved
- The user can immediately see the result of their action — no need to navigate elsewhere to verify

## Pattern 3: Progressive Disclosure

Show only what the user needs right now. Reveal more as their context develops. Overwhelming users with all options at once increases cognitive load and reduces task completion.

### Levels of Disclosure

**Level 1 — Default view:** The minimum controls needed for the most common action. Everything else is hidden.

**Level 2 — Expanded view:** Additional options revealed when the user indicates they need them (clicks "More options", selects a specific variant, etc.)

**Level 3 — Advanced view:** Power-user options behind a clearly labeled "Advanced" toggle or section. Most users never see this.

### When to Disclose

| Trigger | Pattern |
|---|---|
| User clicks "More options" | Expand additional fields/controls inline |
| User selects a specific type | Show fields relevant to that type only |
| User has completed the basic flow | Offer enhancements ("Want to add a discount?") |
| User explicitly opts in | Show advanced configuration panel |

### Rules
- The default view must be sufficient to complete the primary task
- Disclosed content appears adjacent to the trigger, not in a separate location
- Disclosure state persists within the session — don't collapse it every time
- Label what's hidden: "3 more options available" not just a vague "More" button

## Pattern 4: Error Recovery

Errors will happen. The product's job is to make recovery as painless as possible. A product that handles errors gracefully builds more trust than a product that never has errors but recovers badly when it does.

### Error Categories and Recovery Patterns

**Validation error (user input is wrong):**
- Show inline error message
- Keep all entered data intact — don't clear the form
- Focus on the first error field
- User corrects and resubmits — no penalty, no restart

**Not found (resource doesn't exist):**
- Show a clear message: "[Entity] not found"
- Suggest what to do next: "Check the ID and try again" or link to the list view
- Never show a blank page or a generic error code

**Permission denied (user can't do this):**
- Show a clear message: "You don't have permission to [action]"
- Explain what permission is needed or who to contact
- Don't hide the feature entirely — that makes it invisible and confusing

**Server error (something went wrong on our side):**
- Show a human-readable message: "Something went wrong. Please try again."
- Preserve entered data wherever possible
- Offer a retry button
- If the error persists, suggest contacting support

**Network error (connectivity lost):**
- Show a connection status indicator
- Queue actions locally if possible — complete them when reconnected
- Never lose unsaved work due to a network blip

### Recovery Rules
- **Never blame the user.** Error messages describe what happened, not what the user did wrong.
- **Always provide a path forward.** Every error state has at least one action the user can take.
- **Preserve context.** The user should never have to start over after an error.

## Pattern 5: State Transitions

Many entities in the product move through states (Draft → Sent → Paid). How these transitions are presented determines whether the user understands what's happening or is confused by unexplained changes.

### Visibility Rules
- The current state is always visible on the entity's detail view
- State is shown as a badge or status indicator (see ui-design-system components)
- Available transitions (actions the user can take) are shown as buttons, labeled with the resulting state: "Send Invoice" not just "Next"
- Unavailable transitions are either hidden or shown as disabled with an explanation

### Transition Feedback
- Transitioning state shows a brief loading indicator
- After transition, the state badge updates immediately
- A confirmation message states what changed: "Invoice sent to ACME Corp"
- If the transition fails, show an error and return to the previous state — no ambiguous in-between

### State Visibility by Persona
Different personas may see different states. An accountant reviewing invoices sees "Pending Review" and "Approved". A business owner sending invoices sees "Draft" and "Sent". The state model is the same underneath — the UI filters what's relevant per persona.
