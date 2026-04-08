# Extracting UI Requirements from Gherkin Scenarios

## Mapping Process

Read each scenario and extract six categories of UI requirement. Not every scenario produces all six — extract only what's present.

### 1. Screens

Identify every distinct view or page the scenario touches.

**Signals in Gherkin:**
- "Given I am on the [X] page"
- "When I navigate to [X]"
- "Then I should see the [X] screen"

**Example:**
```gherkin
Scenario: Create invoice
  Given I am on the invoice list page
  When I click create
  Then I should see the new invoice form
```
→ Screens: Invoice List, New Invoice Form

### 2. Entry Points

How does the user get to each screen? Every screen must have at least one entry point.

**Signals in Gherkin:**
- "When I click [X]"
- "When I navigate to [X]"
- "When I select [X] from [Y]"

**Example:**
```
Invoice List → [Create button] → New Invoice Form
Invoice List → [Invoice row] → Invoice Detail
```

### 3. Data Displayed

What information must appear on each screen for the scenario to work?

**Signals in Gherkin:**
- "Then I should see [specific data]"
- "Then I should see [entity] with [attributes]"

**Example:**
```gherkin
Then I should see invoice number INV-2024-001
And I should see customer "ACME Corp"
And I should see total $1,500.00
```
→ Invoice Detail must display: invoice number, customer name, total

### 4. Actions Available

What can the user do on each screen? Actions become buttons, links, or interactive controls.

**Signals in Gherkin:**
- "When I [verb] the [noun]"
- "When I click [X]"
- "When I enter [value] into [field]"
- "When I select [option]"

**Example:**
```
New Invoice Form actions:
- Enter customer name (text input)
- Add line item (button)
- Enter line item description (text input)
- Enter line item amount (number input)
- Save (button)
- Cancel (button)
```

### 5. State Changes

How does the screen change in response to an action? This drives component state and conditional rendering.

**Signals in Gherkin:**
- "Then I should see [X] change to [Y]"
- "Then [element] should [appear/disappear/update]"
- "Then I should be redirected to [screen]"

**Example:**
```
After save:
- Form disappears
- User is redirected to Invoice Detail
- Invoice Detail shows the new invoice data

After add line item:
- New empty line item row appears in the form
- Total updates to include new line item
```

### 6. Error States

What does the user see when something goes wrong?

**Signals in Gherkin:**
- "Then I should see error [message]"
- "Then I should see validation [message]"
- "And the [entity] should not be saved"

**Example:**
```
New Invoice Form errors:
- Customer not found: inline error below customer field
- Amount is negative: inline error below amount field
- Save fails: banner error at top of form
```

## Extraction Template

For each feature, produce this summary before designing screen flows:

```markdown
## UI Requirements: [Feature Name]

### Screens
- [Screen 1]: [purpose]
- [Screen 2]: [purpose]

### Entry Points
- [Screen A] → [action] → [Screen B]

### Data Displayed
- [Screen 1]: [list of data elements]
- [Screen 2]: [list of data elements]

### Actions
- [Screen 1]: [list of actions with control types]
- [Screen 2]: [list of actions with control types]

### State Changes
- [Action] → [what changes and where]

### Error States
- [Error condition] → [what user sees and where]
```

## Common Gaps

If extraction reveals any of these, the feature file needs updating before design proceeds:

- A screen with no entry point — how does the user get there?
- An action with no outcome — what happens when the user does this?
- Data displayed but never explained how it gets there — where does this data come from?
- An error mentioned but the recovery path is unclear — what does the user do after seeing the error?
