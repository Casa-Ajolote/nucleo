# Journey Mapping

## What Is a Journey Map?

A journey map traces a specific persona through a specific goal — from the moment they realize they need something to the moment they've accomplished it. It captures what they do, what they think, what they feel, and where things break down.

Journey maps reveal two things no other method reveals:
1. **Pain points** — the moments where frustration is highest. These are the problems the product must solve.
2. **Delight opportunities** — the moments where a small improvement creates disproportionate satisfaction. These are where the product wins loyalty.

## Scope

One journey map per persona per goal. A goal is a single end-to-end accomplishment — not a feature, not a screen, but a thing the user wants to have done.

**Good goal:** "Get paid for consulting work"
**Bad goal (too broad):** "Run my business"
**Bad goal (too narrow, this is a task not a goal):** "Click the Send button"

## Journey Phases

Every journey has these phases. Not every phase has the same number of steps — some journeys have a long "Become Aware" phase and a short "Act" phase. Map what actually happens, don't force equal length.

### Phase 1: Become Aware
The persona realizes they have a need or a problem. This often happens outside the product entirely.

**Questions to answer:**
- What triggers the realization? (deadline approaching, colleague mentions it, pain point hits)
- What do they do first? (search online, ask someone, open a tool they already use)
- What information are they looking for?

### Phase 2: Decide
The persona evaluates options — including doing nothing or continuing their current workaround.

**Questions to answer:**
- What alternatives do they consider?
- What makes them choose one option over another?
- What builds or destroys trust at this stage?

### Phase 3: Act
The persona does the thing. This is where the product is most directly involved.

**Questions to answer:**
- What steps do they take?
- Where do they get stuck or confused?
- What information do they need at each step that they don't have?
- What do they expect to happen vs what actually happens?

### Phase 4: Verify
The persona checks that the thing worked. This is often overlooked in design but critical for trust.

**Questions to answer:**
- How does the persona know it worked?
- What confirmation do they need?
- What would make them doubt it worked?

### Phase 5: Reflect
The persona forms an opinion about the experience. This drives whether they come back, recommend the product, or look for alternatives.

**Questions to answer:**
- How do they feel about the experience overall?
- What would they tell someone else about it?
- What would make them do this again vs find another way?

## Touchpoints

A touchpoint is any point where the persona interacts with the product or with information related to the goal. Touchpoints include:

- The product itself (screens, features)
- Email communications (confirmations, reminders, receipts)
- External systems (bank statements, email inbox, calendar)
- Other people (colleagues, customers, accountants)
- Physical artifacts (printed invoices, paper records)

Map ALL touchpoints, not just the ones inside the product. The user's experience doesn't start when they open your app.

## Emotion Curve

At each step, note the persona's emotional state on a simple scale:

```
😤 Frustrated  →  😐 Neutral  →  😊 Satisfied  →  😄 Delighted
```

The emotion curve across the journey reveals the shape of the experience. A journey that starts frustrated and ends delighted is a success story. A journey that starts hopeful and ends frustrated is a churn risk.

## File Format

Create: `/docs/ux-research/journeys/[persona-name]-[goal].md`

```markdown
# Journey Map: [Persona Name] — [Goal]

**Persona:** [Link to persona file]
**Goal:** [The end-to-end accomplishment being mapped]
**Current state:** Before product / With product (map both if product exists)

## Journey Summary
[2–3 sentences describing the overall shape of this journey and where the biggest pain points are]

## Phase 1: Become Aware

### Steps
1. [What the persona does]
2. [What the persona does]

### Touchpoints
- [Touchpoint 1]
- [Touchpoint 2]

### Thoughts
- "[What the persona is thinking at this stage]"

### Feelings
😤 → 😐 (emotion at start → emotion at end of phase)

### Pain Points
- [What frustrates them here]

### Opportunities
- [What the product could do better here]

---

## Phase 2: Decide
[Same structure as above]

---

## Phase 3: Act
[Same structure — this is usually the longest phase]

---

## Phase 4: Verify
[Same structure]

---

## Phase 5: Reflect
[Same structure]

---

## Summary

### Top Pain Points (ranked)
1. [Biggest pain — most frustration, most friction]
2. [Second biggest]
3. [Third biggest]

### Top Delight Opportunities (ranked)
1. [Biggest opportunity — highest impact, most feasible]
2. [Second biggest]
3. [Third biggest]

### Story Map Impact
[How does this journey inform the story map?]
- Activity [X] exists because of step [Y] in Phase [Z]
- Task [A] is Must Have because Pain Point [B] is the primary reason users struggle
- Task [C] is Could Have because it addresses a minor friction only
```

## Rules

- Map the CURRENT state first (how the persona does it today, without or with the existing product). Then map the FUTURE state (how the product should change the journey). Comparing the two reveals exactly what the product must do.
- Pain points in the current state become Must Have features. Delight opportunities become Should Have or Could Have.
- Journey maps are living documents. Revisit when user research reveals new information or when the product changes significantly.
- One journey map is not enough. Map at least the primary persona's most important goal. Ideally map each persona's primary goal.
