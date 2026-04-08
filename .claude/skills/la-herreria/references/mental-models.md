# Mental Models

## What Is a Mental Model?

A mental model is the internal framework a user has for understanding how something works. It is built from prior experience — other software they've used, physical analogies, and common sense. Users don't read documentation before forming mental models. They just start using the product and expect it to behave the way they already think about the problem.

**When the product matches the mental model:** The user feels the product is intuitive. They find things where they expect them. Actions produce expected results.

**When the product conflicts with the mental model:** The user feels confused. They look in the wrong place. They click the wrong button. They call it "unintuitive" — which actually means "it doesn't match how I already think about this."

## Why Mental Models Matter

Mental models are the single most important input to information architecture and interaction design. A product with beautiful visuals but wrong mental models will be abandoned. A product with simple visuals but correct mental models will feel effortless.

## How to Identify Mental Models

### Source 1: Existing Tools

What does the persona currently use to do this job? The mental model is embedded in that tool's structure.

**Example:** A business owner who currently invoices via a Word document thinks of invoices as documents — you create one, write on it, save it, print or email it. They do NOT think of invoices as database records with states and transitions.

**Design implication:** The invoice creation flow should feel like composing a document, not filling out a database form. The "Save" action should feel like saving a document, not submitting a record.

### Source 2: Physical Analogies

What physical object or process does this domain map to in the user's mind?

**Example:** Invoicing maps to "sending a bill" — a piece of paper you hand to someone expecting payment. Payment tracking maps to a "ledger" — a list of who owes what.

**Design implication:** Use metaphors that match. An invoice list looks like a stack of papers or a ledger. A payment status looks like a checkmark next to an amount, not an abstract state machine.

### Source 3: Common Software Patterns

Users carry mental models from widely-used software. Email, file systems, shopping carts, and social feeds have trained billions of users in specific patterns.

**Common mental models to leverage:**
- **Inbox:** Messages arrive. You open them. You act on them or archive them.
- **File system:** Things live in folders. You create, rename, move, delete.
- **Shopping cart:** You browse, add things, review, checkout.
- **Spreadsheet:** Data lives in rows and columns. You sort, filter, calculate.

If your domain maps to one of these, lean into the metaphor. Don't fight it.

## Mental Model Conflicts to Avoid

### Conflict 1: Mixed Metaphors
Using "inbox" metaphor for notifications but "file system" metaphor for the same data when accessed from a different screen. The user encounters the same thing in two incompatible mental frameworks.

**Rule:** One mental model per domain concept. Pick it. Be consistent everywhere.

### Conflict 2: System Mental Model ≠ User Mental Model
Designing the UI around how the database is structured rather than how the user thinks about the problem.

**Example (bad):** Invoice has states: DRAFT, PENDING_REVIEW, APPROVED, SENT, PAID, OVERDUE, CANCELLED. That's the system model. The user thinks: "I made an invoice. I sent it. They paid it." Three states, not seven.

**Rule:** The UI exposes the user's mental model. The system model lives behind the scenes.

### Conflict 3: Forcing a New Mental Model Without Justification
Inventing a novel interaction pattern when a familiar one exists. Users have to unlearn before they can learn. This costs trust.

**Rule:** Only introduce a new mental model when existing patterns genuinely cannot serve the need. And when you do, provide clear onboarding that explains the new way.

## File Format

Create: `/docs/ux-research/mental-models/[persona-name]-[domain].md`

```markdown
# Mental Model: [Persona Name] — [Domain]

**Persona:** [Link to persona file]
**Domain:** [What area of the product this covers — e.g., "invoicing", "payments"]

## Current Mental Model
[How does this persona currently think about this domain?
Describe the metaphor or framework they use.]

## Source
[Where does this mental model come from?]
- Existing tool: [tool name and how it shaped the model]
- Physical analogy: [what real-world object/process maps to this]
- Common software pattern: [inbox / file system / shopping cart / etc.]

## Key Expectations
[What does this mental model predict the product will do?]
- [Expectation 1 — "I expect to find X in Y because that's where Z puts it"]
- [Expectation 2]

## Design Constraints
[How does this mental model constrain UI decisions?]
- [Constraint 1 — "Navigation must use [structure] because that matches how the user thinks about it"]
- [Constraint 2]

## Where the System Model Differs
[Where does the technical reality conflict with the user's mental model?
This is where translation is needed — the UI must hide the system model and present the user model.]
- [Difference 1]
- [Difference 2]
```

## Integration with Downstream Skills

Mental models directly constrain:
- **story-mapping:** The backbone activities should match the user's mental model of what they do, not the system's internal process names
- **ux-design:** Information architecture must follow the mental model's structure
- **bdd-specification:** Gherkin scenarios should use language that matches the mental model — "When I send the invoice" not "When I transition the invoice to SENT state"
