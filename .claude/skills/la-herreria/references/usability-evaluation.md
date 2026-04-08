# Usability Evaluation

## What Is a Usability Evaluation?

A structured review of a planned experience against established usability principles. Run it BEFORE screen flows are designed — catching problems at this stage costs nothing. Catching them after implementation costs a full redesign cycle.

This is not a visual design review. It is a behavioral review: Will users be able to accomplish their goals? Where will they get stuck? Where will they make mistakes?

## The 10 Heuristics

These are the evaluation criteria. For each planned screen or flow, check against all 10. Document any violations found.

### H1: Visibility of System Status
The product always keeps users informed about what is going on, through appropriate feedback within reasonable time.

**Check:** Does every action produce visible feedback? Does the user always know what state they're in? Is loading always indicated? Is the current location in the navigation always clear?

### H2: Match Between System and Real World
The product speaks the user's language — words, phrases, concepts familiar to the user. Information appears in a natural and logical order.

**Check:** Do all labels match the mental model vocabulary? Are navigation categories organized the way the user thinks about the domain? Do action labels describe the outcome, not the system operation?

### H3: User Control and Freedom
Users often choose system functions by mistake and need a clearly marked "emergency exit" to leave the unwanted state without having to go through a long procedure.

**Check:** Can the user undo every action? Is Cancel always available alongside Save? Can the user close or dismiss any modal, drawer, or overlay? Is there a way back from every dead end?

### H4: Consistency and Standards
Users should not have to wonder whether different words, situations, or actions mean the same thing. Follow platform conventions.

**Check:** Do all buttons of the same type look and behave identically? Do all forms validate the same way? Do all error messages follow the same structure? Does terminology stay consistent across all screens?

### H5: Error Prevention
Even better than good error messages is careful design that prevents problems from occurring in the first place.

**Check:** Are required fields clearly marked before the user submits? Are invalid options removed or disabled rather than shown and then rejected? Does the system warn before destructive actions? Are ambiguous actions clarified before execution?

### H6: Recognition Rather Than Recall
Minimize the user's memory load by making objects, actions, and options visible. The user should not have to remember information from one part of the interface to use another.

**Check:** Are options visible rather than requiring the user to recall them? Are defaults sensible? Is context preserved when navigating between screens? Are labels and instructions visible at the point of use, not hidden in a help page?

### H7: Flexibility and Efficiency of Use
Accelerators — unseen by the novice user — may often speed up interaction for expert users. The system should cater to both inexperienced and experienced users.

**Check:** Can expert users accomplish tasks faster (keyboard shortcuts, bulk actions, saved filters)? Does the default flow serve novice users without requiring them to know shortcuts? Are frequently used actions accessible without deep navigation?

### H8: Aesthetic and Minimalist Design
Dialogues should not contain irrelevant or rarely needed information. Every extra unit of information competes with relevant information and diminishes their relative visibility.

**Check:** Does every screen contain only information needed for the current task? Are there elements that exist for decoration rather than function? Can any screen be simplified without losing necessary capability?

### H9: Help Users Recognize, Diagnose, and Recover from Errors
Error messages should be expressed in plain language (not codes), precisely indicate the problem, and constructively suggest a solution.

**Check:** Do all error messages explain what went wrong in plain language? Do they suggest what to do next? Do they preserve the user's work? Is there a path forward from every error state? (See interaction-patterns.md Error Recovery for detail.)

### H10: Help and Documentation
Even though it is better if the system can be used without documentation, it may be necessary to provide help that is easy to search and focused on the user's task.

**Check:** Is the product usable without documentation for the primary persona's primary goal? Where help IS needed, is it contextual (at the point of use) rather than requiring the user to leave the task to find it? Are tooltips or inline explanations present for non-obvious controls?

## Severity Scoring

Each violation found gets a severity score. This determines priority.

| Score | Severity | Meaning |
|---|---|---|
| 0 | Not a problem | Evaluated but no usability issue exists |
| 1 | Cosmetic | Problem occurs but does not affect task completion |
| 2 | Minor | Occasional usability problem, workaround exists |
| 3 | Major | Usability problem, no obvious workaround, task completion is impaired |
| 4 | Catastrophic | Users cannot accomplish the task at all |

**Priority rule:**
- Score 4: Must fix before any screen is designed. Redesign the flow.
- Score 3: Must fix before implementation begins.
- Score 2: Fix before shipping. Can be addressed during design phase.
- Score 1: Fix if time permits. Does not block.

## Evaluation Report Format

Create: `/docs/ux-design/usability-evaluation/[feature-name].md`

```markdown
# Usability Evaluation: [Feature Name]

**Evaluated:** [Date]
**Personas evaluated for:** [List of personas]
**Scenarios evaluated:** [List of feature file scenarios]
**Evaluated by:** [Claude / team member]

## Summary
[1–2 sentences: overall usability health of this feature's planned experience.
How many violations found, how many are critical.]

## Violations Found

### [Violation Title]
- **Heuristic:** H[N] — [Heuristic name]
- **Severity:** [0–4]
- **Location:** [Which screen or flow step]
- **Description:** [What the problem is — specific, not generic]
- **Impact:** [What happens to the user if this isn't fixed]
- **Recommendation:** [Specific fix — not "make it better" but "change X to Y"]

### [Next Violation]
[Same structure]

---

## Violations by Severity

| Severity | Count | Violations |
|---|---|---|
| 4 — Catastrophic | [N] | [titles] |
| 3 — Major | [N] | [titles] |
| 2 — Minor | [N] | [titles] |
| 1 — Cosmetic | [N] | [titles] |

## Clearance

- [ ] All severity 4 violations resolved — redesign before proceeding
- [ ] All severity 3 violations resolved — cleared for ui-design-workflow
```

## Rules

- Run evaluation after scenarios are written but before screen flows are designed
- Evaluate for the primary persona first. Then check if secondary personas can accomplish their goals with the same design
- A severity 4 violation means the planned flow must change. Do not proceed to screen design until it is resolved
- Document the evaluation even if no violations are found — it proves the design was checked
