# Personas

## What Is a Persona?

A persona is a fictional but research-grounded character representing a distinct user segment. It is not a real person — it is a composite built from patterns in user data, business analysis, and domain knowledge. The persona becomes the subject of every design decision: "Would Sarah do this? Does this help Sarah?"

## Deriving Personas from the Value Proposition Canvas

The VPC already defines who the product serves. Personas make that concrete.

### Step 1: Identify User Segments from Customer Jobs

Read `/docs/value-proposition-canvas.md`. Each distinct type of person performing a customer job is a potential persona. Not every job needs its own persona — group jobs performed by the same type of person.

**Example:**
```
Customer Jobs:
- "Send invoices to customers quickly"        → performed by business owners
- "Track who owes me money"                   → performed by business owners
- "Generate financial reports for accountant" → performed by business owners
- "Review and approve invoices"               → performed by accountants

Personas:
- Sarah, the business owner (covers jobs 1, 2, 3)
- Marcus, the accountant (covers job 4)
```

### Step 2: Identify Pain Points Per Segment

For each persona, pull the pains from the VPC that apply to their jobs. These become the persona's frustrations and motivations.

### Step 3: Identify Goals Per Segment

Pull the gains from the VPC. These become what the persona wants to achieve — the definition of success for them.

## What Makes a Persona Useful

A useful persona answers these questions:
- What is this person trying to accomplish?
- What do they currently do (before this product exists)?
- What frustrates them about the current way?
- What would make their life better?
- How technically comfortable are they?
- When and where do they do this work?

A useless persona is just a name and a stock photo. If you can't answer the questions above, the persona is not grounded enough to make design decisions.

## Rules

- **2–4 personas per product.** More than 4 means the product is trying to serve too many different people. Focus.
- **One primary persona.** The product is optimized for this person. Other personas are secondary — they benefit but are not the design target.
- **Personas are not job titles.** "The small business owner" is a persona segment. "Sarah, who runs a 3-person consulting firm and does her own invoicing on her phone between client meetings" is a persona.
- **Personas change.** Revisit when the product enters a new market or user research reveals a new segment.

## File Format

Create: `/docs/ux-research/personas/[persona-name].md`

```markdown
# Persona: [Name]

**Segment:** [User segment this persona represents]
**Primary:** Yes / No
**Story map activities:** [Which backbone activities this persona performs]

## Background
[2–3 sentences. Who is this person in their daily life? What is their context?]

## Goals
[What does this persona want to accomplish with the product?]
- [Goal 1 — pulled from VPC gains]
- [Goal 2]

## Frustrations
[What currently gets in their way?]
- [Frustration 1 — pulled from VPC pains]
- [Frustration 2]

## Current Behavior
[What does this persona do RIGHT NOW to accomplish their goals, without this product?]
- [Current workaround 1]
- [Current workaround 2]

## Technical Comfort
- **Device:** [Primary device — phone, laptop, desktop]
- **Comfort level:** Low / Medium / High
- **Expectations:** [What does this persona expect software to do? e.g., "expects to find things quickly without reading instructions"]

## Quotes
[Representative statements this persona would make — in their voice, not the product's]
- "[I spend 30 minutes every Friday manually typing invoices into a spreadsheet...]"
- "[I always forget to follow up on unpaid invoices until it's too late...]"

## Design Implications
[How does this persona constrain or inform design decisions?]
- [e.g., "Mobile-first — Sarah is usually between meetings when she needs to send an invoice"]
- [e.g., "One-tap actions — Sarah has limited time and patience for multi-step flows"]
```

## Persona Priority Order

When design decisions conflict between personas, the primary persona wins. Document the trade-off — don't silently ignore secondary personas. Sometimes a secondary persona's need can be accommodated without compromising the primary experience.
