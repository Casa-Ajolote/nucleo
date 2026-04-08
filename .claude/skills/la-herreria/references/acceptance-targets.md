# Acceptance Targets

## What Are Acceptance Targets?

Design decisions translated into observable outcomes that acceptance tests can verify. Every significant design decision must have at least one acceptance target — otherwise it's untestable and will drift.

## What Is Testable vs What Is Not

**Testable — acceptance tests can verify:**
- Element is present on the screen
- Element contains specific text or data
- Element is in a specific state (visible, hidden, disabled, focused)
- Action produces a specific result (navigation, state change, data update)
- Error message appears in response to invalid input
- Layout relationship (element A appears before element B)
- Accessible properties (role, label, keyboard behavior)

**Not testable by acceptance tests — leave to visual review:**
- Exact color values (unless tied to a semantic meaning like error=red)
- Precise spacing or margins
- Font weight or style
- Animation timing or easing
- Aesthetic judgment calls

## Mapping Design Decisions to Targets

For each screen in the flow, identify the design decisions that matter and express them as acceptance targets.

### Pattern 1: Element Presence

**Design decision:** "The invoice detail page shows the invoice number at the top"
**Acceptance target:**
```
Then I should see the invoice number displayed
```
**Test verifies:** Element with invoice number text exists on the page

### Pattern 2: Element State

**Design decision:** "The Save button is disabled until all required fields are filled"
**Acceptance target:**
```
Then the Save button should be disabled
When I fill in all required fields
Then the Save button should be enabled
```
**Test verifies:** Button's disabled attribute changes based on form state

### Pattern 3: Conditional Visibility

**Design decision:** "The discount field only appears when the customer has a discount agreement"
**Acceptance target:**
```
Given customer "ACME Corp" has a discount agreement
Then I should see the discount field

Given customer "New Corp" has no discount agreement
Then I should not see the discount field
```
**Test verifies:** Element presence/absence based on data condition

### Pattern 4: Navigation

**Design decision:** "Clicking an invoice row navigates to the invoice detail page"
**Acceptance target:**
```
When I click on invoice "INV-2024-001"
Then I should be on the invoice detail page
And I should see invoice number INV-2024-001
```
**Test verifies:** Page transition and correct data load

### Pattern 5: Error Display

**Design decision:** "Validation errors appear inline below the field that failed"
**Acceptance target:**
```
When I enter an invalid amount
And I attempt to save
Then I should see error "Amount must be positive" below the amount field
```
**Test verifies:** Error message presence and location relative to the field

### Pattern 6: Data Formatting

**Design decision:** "Monetary amounts display with currency symbol and two decimal places"
**Acceptance target:**
```
Then I should see total displayed as "$1,500.00"
```
**Test verifies:** Exact formatted string, not raw number

### Pattern 7: Empty State

**Design decision:** "When no invoices exist, show a message prompting the user to create one"
**Acceptance target:**
```
Given no invoices exist
When I view the invoice list
Then I should see "No invoices yet. Create your first invoice."
And I should see a "Create Invoice" button
```
**Test verifies:** Empty state message and call-to-action presence

### Pattern 8: Loading State

**Design decision:** "While data is loading, show a loading indicator and disable actions"
**Acceptance target:**
```
When the page is loading
Then I should see a loading indicator
And all action buttons should be disabled
```
**Test verifies:** Loading state renders correctly (may require mocked slow response in test)

## Acceptance Target Document

At the end of each screen flow, produce a consolidated list:

```markdown
## Acceptance Targets: [Feature Name]

### [Screen Name]
- [ ] [Target 1 — element presence]
- [ ] [Target 2 — state condition]
- [ ] [Target 3 — navigation]
- [ ] [Target 4 — error display]
- [ ] [Target 5 — empty state]

### [Screen Name]
- [ ] [Target 1]
- [ ] [Target 2]
```

These targets feed directly into the acceptance test assertions during the RED phase of atdd-workflow. Each checkbox becomes a test case.

## Traceability

Every acceptance target traces back to:
- A design decision in the screen flow
- A scenario in the feature file
- A Then step in Gherkin

If a target has no corresponding Then step, either add one to the feature file or remove the target — every testable design decision should be covered by a scenario.
