# Flow 4: Remediation -- Design Specification

**Version**: 1.0
**Date**: 2026-03-14
**Flow stage**: Remediate
**Primary personas**: Priya (governance-driven remediation), Jordan (technical execution)
**Design system**: Software DS (`/Users/richhemsley/Desktop/software-ds/`)

---

## Table of Contents

1. [Feature Requirements](#1-feature-requirements)
2. [Design Rationale](#2-design-rationale)
3. [Pattern Recommendations](#3-pattern-recommendations)
4. [Edge Cases & Considerations](#4-edge-cases--considerations)
5. [Screen Specifications](#5-screen-specifications)
   - 5.1 Configure Remediation
   - 5.2 Preview Impact
   - 5.3 Dry Run Results
   - 5.4 Execution Progress
   - 5.5 Remediation Success
   - 5.6 Remediation History
   - 5.7 Remediation Detail
   - 5.8 Rollback Preview
   - 5.9 Approval Request
   - 5.10 Approval Review
   - 5.11 Approval Queue
6. [New Components Required](#6-new-components-required)

---

## 1. Feature Requirements

### Problem Statement

Security and governance teams identify sensitive data risks through scanning and classification (Flows 1-3), but lack an efficient, in-context way to act on those findings. Existing DSPM tools route users to external ticketing systems (Cyera, BigID), breaking context and creating friction. Users need to apply remediation actions (tokenize, revoke access, delete data, apply policies) directly from the risk assessment screens, with full visibility into impact, dry-run validation, approval workflows, and rollback capabilities.

### Target Users

| Persona | Role | Primary Tasks |
|---------|------|---------------|
| **Priya** | Data Governance Lead | Reviews remediation impact, approves/rejects requests, monitors history, initiates rollbacks |
| **Jordan** | Data Engineer | Configures technical remediation details, runs dry runs, monitors execution, handles failures |
| **Marcus** | Compliance Officer | Reviews remediation history for audit, exports records (read-only consumer of this flow) |

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time from risk identification to remediation start | < 2 minutes | Entry-to-configure timestamp delta |
| Dry-run adoption rate | > 60% of production remediations | Dry-run executions / total production remediations |
| Remediation completion rate | > 95% | Successful completions / total initiated |
| Approval turnaround time | < 4 hours median | Request-to-decision timestamp delta |
| Rollback frequency | < 5% of completed remediations | Rollbacks / total completed |

### User Stories

1. As **Jordan**, I want to configure a tokenization remediation with pre-filled context from the risk detail page so that I do not re-select items I already identified.
2. As **Priya**, I want to preview the before/after impact of a remediation including projected risk score changes so that I can make an informed decision.
3. As **Jordan**, I want to run a dry run against production data so that I can validate the remediation will work without modifying anything.
4. As **Priya**, I want to approve or reject remediation requests with full visibility into scope and impact so that I maintain governance control.
5. As **Jordan**, I want to monitor batch execution progress with per-item status so that I can identify and retry failures.
6. As **Priya**, I want to see an animated risk score reduction on success so that the value of the remediation is immediately tangible.
7. As **Priya**, I want to roll back a tokenization remediation with a preview of what will change so that reversals are safe and predictable.

---

## 2. Design Rationale

### Key Design Decisions

| Decision | Chosen Approach | Alternatives Considered | Rationale |
|----------|-----------------|------------------------|-----------|
| Remediation structure | Unified 3-step wizard (Configure > Preview > Execute) | Separate flows per action type; Single-page form | Reduces cognitive load across 4 action types. Wizard enforces sequential validation. Competitors use disparate flows which confuse users. |
| Impact preview | Side-by-side before/after comparison | Inline diff view; Modal overlay; Separate detail page | Side-by-side is the most scannable pattern for data comparison. Users can see current and projected state simultaneously without scrolling. |
| Dry run | Dedicated results screen after simulation | Inline results within preview; Toast notification with summary | Dry run results are complex enough to warrant their own screen. Users need to review simulated outcomes in detail before committing. |
| Batch progress | Persistent progress view with per-item status | Background execution with email notification only; Progress toast | For 50+ items, users need granular visibility. Per-item status enables targeted retry of failures. |
| Risk score animation | Animated counter ticking down from old to new score | Static before/after numbers; Chart showing trend over time | Animation creates a moment of celebration and makes the value tangible. This is the emotional payoff for the entire discovery-to-remediation journey. |
| Approval workflow | Inline within remediation flow, not external | Separate approval module; Email-only approval; Slack integration | Keeping approvals within the same flow preserves context. Approvers see the same impact preview the requestor saw. |
| Rollback | Dedicated preview screen accessible from history | Inline rollback button with confirmation dialog; Undo toast | Rollback is consequential enough to warrant its own preview showing impact. A simple confirmation dialog does not provide enough information. |
| Wizard step indicator | Horizontal stepper bar at top of content area | Vertical sidebar stepper; Breadcrumb-style; Tab-based steps | Horizontal stepper is the standard pattern for linear multi-step flows. Keeps the full content width available for configuration. |

---

## 3. Pattern Recommendations

### Patterns by Screen

| Screen | Primary Pattern | Secondary Patterns | Reference |
|--------|-----------------|-------------------|-----------|
| Configure Remediation | CRUD Workflow (Create form) | Filter Panel (item selection), Bulk Operations (batch items) | `data-management-patterns.md` |
| Preview Impact | Data Lineage / Relationship Visualization | Master-Detail (affected items list + detail) | `data-management-patterns.md` |
| Dry Run Results | Data Table with Inline Actions | Import/Export (export results) | `data-management-patterns.md` |
| Execution Progress | Custom progress pattern (new) | Bulk Operations (batch status) | -- |
| Remediation Success | Custom celebration pattern (new) | -- | -- |
| Remediation History | Data Table with Inline Actions | Filter Panel, Saved Views | `data-management-patterns.md` |
| Remediation Detail | Master-Detail View | Data Lineage (rollback impact) | `data-management-patterns.md` |
| Rollback Preview | Data Lineage / Relationship Visualization | -- | `data-management-patterns.md` |
| Approval Request | CRUD Workflow (Create form) | -- | `data-management-patterns.md` |
| Approval Review | Master-Detail View | Role-Based Access Indicators | `data-management-patterns.md` |
| Approval Queue | Data Table with Inline Actions | Filter Panel, Bulk Operations | `data-management-patterns.md` |

---

## 4. Edge Cases & Considerations

| Category | Scenario | Design Response |
|----------|----------|-----------------|
| **Destructive** | Deleting data with downstream dependencies | Dependency tree visualization in Preview. Warning callout: "3 pipelines reference this table." Typed confirmation of table name required. |
| **Destructive** | Tokenizing production data | Orange warning banner in Preview. Dry-run is the default CTA for production targets. |
| **Partial failure** | Some items fail during batch execution | Succeeded items committed. Failed items listed with per-item error reasons. "Retry Failed" bulk action button. Risk score reflects partial completion. |
| **Rollback** | Tokenization needs reversal | Available for 30 days. Rollback Preview shows detokenized sample data. Risk score impact shown (score will increase). |
| **Rollback** | Delete cannot be reversed | "Deletion is permanent and cannot be reversed" shown during original confirmation. Typed confirmation required. No rollback option in history. |
| **Permission** | User can view but not execute | "Request Approval" replaces "Execute" button. Routes to Approval Request screen. |
| **Batch** | 500+ items | Background execution with progress tracker. Email notification on completion. Progress viewable from sidebar badge. |
| **Conflict** | Remediation conflicts with active policy | Warning in Preview: "This action conflicts with policy X. Override requires admin approval." |
| **Network** | Connection drops during execution | Partial results saved. Error message: "23 of 50 completed before interruption." Resume button provided. |
| **Concurrent** | Two users remediating same items | Optimistic locking. Second user sees: "These items are being remediated by [user] -- started 2 minutes ago." Option to wait or choose different items. |
| **Approval** | Approver unavailable | Approval expires after configurable period (default 7 days). Auto-escalates to next approver. Requestor notified. |
| **Approval** | Urgent remediation | "Urgent" flag sends push + email notifications. Urgent requests highlighted at top of Approval Queue. |
| **Scheduled** | Maintenance window passes without execution | If connection unhealthy at scheduled time, remediation deferred. Status: "Deferred -- connection unavailable." |
| **Empty state** | No remediation history exists | Centered empty state illustration with description and CTA to start first remediation. |

---

## 5. Screen Specifications

---

### 5.1 Configure Remediation

**Purpose**: Set up the remediation action with pre-filled context from the entry point (Risk Detail, Table Detail, Dashboard, or Review Queue).

**Page type**: Wizard step 1 of 3

#### Shell & Layout

- **Shell**: Full App Shell (header 56px + sidebar 220px + content area)
- **Grid**: Single-column content area with 24px padding
- **Sidebar**: "Remediation" nav item active (`--sds-nav-item-active-bg`, `--sds-nav-item-active-text`)
- **Responsive**: Below 1024px, sidebar collapses to 56px icon-only mode. Below 768px, form fields stack to single column.

#### Content Hierarchy

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER (56px)                                                     │
├────────┬─────────────────────────────────────────────────────────┤
│SIDEBAR │ Content Area (padding: 24px)                            │
│ 220px  │                                                         │
│        │ ┌─Breadcrumb─────────────────────────────────────────┐ │
│        │ │ Risk Detail > Remediation                          │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Page Title Row─────────────────────────────────────┐ │
│        │ │ "Configure Remediation"            [Cancel (sec)]  │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Wizard Stepper─────────────────────────────────────┐ │
│        │ │  (1) Configure  ───  (2) Preview  ───  (3) Execute │ │
│        │ │  [active]             [pending]         [pending]   │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Context Banner (card)──────────────────────────────┐ │
│        │ │ Info icon  "Pre-filled from: Customer PII Risk"    │ │
│        │ │            "12 columns across 3 tables selected"   │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─2-column layout (60/40 split)──────────────────────┐ │
│        │ │                                                     │ │
│        │ │ LEFT COLUMN (configuration form)                    │ │
│        │ │ ┌─Section: Action Type─────────────────────────┐   │ │
│        │ │ │ Toggle tabs: Tokenize | Revoke | Delete |    │   │ │
│        │ │ │              Apply Policy                     │   │ │
│        │ │ └───────────────────────────────────────────────┘   │ │
│        │ │                                                     │ │
│        │ │ ┌─Section: Action Config (type-specific)───────┐   │ │
│        │ │ │ [Tokenize]: Policy selector dropdown         │   │ │
│        │ │ │   + "Create new policy" tertiary link        │   │ │
│        │ │ │   + Column-to-token-format mapping table     │   │ │
│        │ │ │ [Revoke]: Grant selector with checkboxes     │   │ │
│        │ │ │ [Delete]: Confirmation checkbox list         │   │ │
│        │ │ │ [Apply Policy]: Policy selector + preview    │   │ │
│        │ │ └───────────────────────────────────────────────┘   │ │
│        │ │                                                     │ │
│        │ │ ┌─Section: Schedule─────────────────────────────┐   │ │
│        │ │ │ Radio: Execute now | Schedule for later       │   │ │
│        │ │ │ [If scheduled]: Date/time picker              │   │ │
│        │ │ │                 or "Next maintenance window"   │   │ │
│        │ │ └───────────────────────────────────────────────┘   │ │
│        │ │                                                     │ │
│        │ │ RIGHT COLUMN (affected items)                       │ │
│        │ │ ┌─Card: Affected Items──────────────────────────┐   │ │
│        │ │ │ Header: "Affected Items" + count badge        │   │ │
│        │ │ │ Search input                                  │   │ │
│        │ │ │ ┌─Item list (scrollable)──────────────────┐   │   │ │
│        │ │ │ │ [x] schema.table.column  SSN  Critical  │   │   │ │
│        │ │ │ │ [x] schema.table.column  Email  High    │   │   │ │
│        │ │ │ │ [x] schema.table.column  Name  Medium   │   │   │ │
│        │ │ │ │ ...                                      │   │   │ │
│        │ │ │ └─────────────────────────────────────────┘   │   │ │
│        │ │ │ Footer: "Select all" | "Remove selected"      │   │ │
│        │ │ └───────────────────────────────────────────────┘   │ │
│        │ │                                                     │ │
│        │ └─────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Sticky Footer Bar──────────────────────────────────┐ │
│        │ │                   [Back (sec)] [Preview Impact (pri)]│ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
└────────┴─────────────────────────────────────────────────────────┘
```

#### Component Inventory

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| Header | `/components/header.html` | App header with logo, help, profile |
| Side Navigation | `/components/side-navigation.html` | "Remediation" item active |
| Toggle Tabs | `/components/tabs.html` `.sds-toggle-tabs` | Action type selector (Tokenize/Revoke/Delete/Apply Policy) |
| Card | `/components/cards.html` `.sds-card` | Context banner, affected items panel |
| Buttons | `/components/buttons.html` | Cancel (secondary), Back (secondary), Preview Impact (primary) |
| Tags | `/components/tags.html` `.sds-tag` | Sensitivity level tags on affected items (Critical = `--error`, High = `--warning`, Medium = `--info`) |
| Badge | `/components/tags.html` `.sds-badge` | Item count in affected items header |
| **Wizard Stepper** | NEW COMPONENT NEEDED | Horizontal 3-step progress indicator |
| **Inline Policy Creator Drawer** | NEW COMPONENT NEEDED | Right-side drawer, min-width 480px |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Page background | background | `var(--sds-bg-page)` |
| Content area padding | padding | 24px |
| Breadcrumb text | color | `var(--sds-text-link)` / 13px |
| Page title | color, size, weight | `var(--sds-text-primary)` / 24px / 600 |
| Context banner card | background | `var(--sds-status-info-bg)` |
| Context banner text | color | `var(--sds-status-info-text)` |
| Context banner border | border | 1px solid `var(--sds-color-blue-200)` |
| Wizard stepper active step | color | `var(--sds-interactive-primary)` |
| Wizard stepper pending step | color | `var(--sds-text-disabled)` |
| Wizard stepper connector line (done) | background | `var(--sds-interactive-primary)` |
| Wizard stepper connector line (pending) | background | `var(--sds-border-default)` |
| Form section title | color, size, weight | `var(--sds-text-primary)` / 16px / 600 |
| Form field label | color, size, weight | `var(--sds-text-primary)` / 13px / 500 |
| Input border (default) | border | 1px solid `var(--sds-border-default)` |
| Input border (focus) | border | 2px solid `var(--sds-border-focus)` |
| Help text | color, size | `var(--sds-text-tertiary)` / 12px |
| Affected items card | background, border | `var(--sds-bg-card)` / `var(--sds-border-default)` |
| Affected items card header | border-bottom | `var(--sds-border-subtle)` |
| Item checkbox row | padding | 10px 16px |
| Item checkbox row hover | background | `var(--sds-color-warm-gray-050)` |
| Item path text | color, size | `var(--sds-text-secondary)` / 13px |
| Sticky footer bar | background, border-top | `var(--sds-bg-page)` / `var(--sds-border-default)` |
| Cancel button | variant | `btn-secondary btn-md` |
| Preview Impact button | variant | `btn-primary btn-md` |
| Schedule radio default | border | `var(--sds-border-default)` |
| Schedule radio selected | border, fill | `var(--sds-interactive-primary)` |
| "Create new policy" link | color | `var(--sds-text-link)` |

#### Interaction Details

| Interaction | Behavior |
|-------------|----------|
| Action type toggle | Switching between Tokenize/Revoke/Delete/Apply Policy swaps the type-specific configuration section with a 150ms crossfade transition. Selected toggle pill gets white bg with shadow. |
| "Create new policy" link | Opens a right-side drawer (min-width 480px). On viewports < 960px, becomes full-page takeover with "Back to Remediation" breadcrumb. Drawer slides in from right with 300ms ease-out. |
| Remove item from list | Clicking checkbox deselects item. Item fades out (200ms) and list reflows. Count badge updates immediately. If 0 items remain, sticky footer "Preview Impact" button becomes disabled. |
| Schedule radio selection | Selecting "Schedule for later" reveals date/time picker with a 200ms slide-down animation. |
| Preview Impact button | Validates form (all required fields). If invalid, scrolls to first error with red border (`var(--sds-status-error-strong)`) and error text (`var(--sds-status-error-text)`). If valid, navigates to Preview Impact with a left-to-right slide transition. |
| Cancel button | Shows confirmation dialog if form has been modified: "Discard changes? Your configuration will be lost." with [Cancel]/[Discard] buttons. |
| Keyboard | Tab order: breadcrumb > title > action type tabs (arrow keys within) > form fields > affected items > footer buttons. |

#### State Variations

| State | Description |
|-------|-------------|
| **Loading** | Content area shows skeleton placeholders: rectangular pulse animations for form sections and affected items list. Skeleton uses `var(--sds-bg-subtle)` with 1.5s pulse. |
| **Populated (default)** | Pre-filled from entry context. Items checked, recommended action pre-selected. |
| **Empty items** | If all items are deselected, show inline empty state in the affected items card: "No items selected. At least one item is required." with a tertiary "Restore original selection" link. |
| **Error (validation)** | Invalid fields show red border (`var(--sds-status-error-strong)`), error text below field in 12px `var(--sds-status-error-text)`. |
| **Error (connection)** | If the target connection is unhealthy, show a warning banner at top of form: orange background (`var(--sds-status-warning-bg)`), "Connection [name] is currently unavailable. Remediation may fail." |
| **Permission-restricted** | If user lacks execute permission, the footer shows "Request Approval" (primary) instead of "Preview Impact." Tooltip on hover explains: "Your role requires approval for this action." |

#### Responsive Behavior

- **>= 1280px**: 2-column layout (60/40 split). Full sidebar.
- **1024px - 1279px**: 2-column layout (55/45). Sidebar collapsed to 56px icons.
- **768px - 1023px**: Single column. Affected items card moves below configuration form. Sidebar collapsed.
- **< 768px**: Single column, full-width inputs. Sticky footer remains pinned. Sidebar hidden (hamburger menu).

---

### 5.2 Preview Impact

**Purpose**: Show what will change before executing, including before/after comparison and projected risk score delta.

**Page type**: Wizard step 2 of 3

#### Shell & Layout

- **Shell**: Full App Shell
- **Grid**: Single-column content area, 24px padding
- **Responsive**: Below 1024px, before/after columns stack vertically.

#### Content Hierarchy

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER (56px)                                                     │
├────────┬─────────────────────────────────────────────────────────┤
│SIDEBAR │ Content Area                                             │
│        │                                                         │
│        │ Breadcrumb: Risk Detail > Remediation > Preview          │
│        │ Title: "Preview Impact"              [Edit Config (sec)] │
│        │                                                         │
│        │ ┌─Wizard Stepper─────────────────────────────────────┐ │
│        │ │  (1) Configure  ───  (2) Preview  ───  (3) Execute │ │
│        │ │  [completed]          [active]          [pending]   │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Warning Banner (conditional)───────────────────────┐ │
│        │ │ ! "This will modify production data in [conn]."    │ │
│        │ │   "Consider running a dry run first."              │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Risk Score Projection Card─────────────────────────┐ │
│        │ │  Current Risk Score    Projected Risk Score         │ │
│        │ │  ┌──────────┐         ┌──────────┐                │ │
│        │ │  │    78    │   ->    │    65    │    -13 points   │ │
│        │ │  │  [red]   │         │ [yellow] │    (arrow down) │ │
│        │ │  └──────────┘         └──────────┘                │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Summary Card───────────────────────────────────────┐ │
│        │ │ Action: Tokenize  |  Items: 12 columns  |          │ │
│        │ │ Tables: 3  |  Connection: Snowflake Prod            │ │
│        │ │ Schedule: Immediate                                 │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Before/After Comparison (2-col)────────────────────┐ │
│        │ │ ┌─Before────────────┐  ┌─After─────────────────┐  │ │
│        │ │ │ Column: ssn       │  │ Column: ssn            │  │ │
│        │ │ │ 123-45-6789       │  │ tok_a8f2...x9d1        │  │ │
│        │ │ │ 987-65-4321       │  │ tok_c3e7...k2m8        │  │ │
│        │ │ │ 456-78-9012       │  │ tok_f1b4...p5q3        │  │ │
│        │ │ │ (sample data)     │  │ (tokenized preview)    │  │ │
│        │ │ └───────────────────┘  └────────────────────────┘  │ │
│        │ │                                                     │ │
│        │ │ [Revoke: access diff table]                         │ │
│        │ │ [Delete: dependency tree visualization]             │ │
│        │ └─────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Affected Items Table───────────────────────────────┐ │
│        │ │ Column | Table | Type | Sensitivity | Status        │ │
│        │ │ ssn    | users | SSN  | Critical    | Will tokenize │ │
│        │ │ email  | users | Email| High        | Will tokenize │ │
│        │ │ ...    |       |      |             |               │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Sticky Footer──────────────────────────────────────┐ │
│        │ │ [Back (sec)] [Dry Run (sec)] [Execute (pri)]        │ │
│        │ │                       OR                             │ │
│        │ │ [Back (sec)] [Dry Run (sec)] [Request Approval (pri)]│ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
└────────┴─────────────────────────────────────────────────────────┘
```

#### Component Inventory

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| Card | `/components/cards.html` `.sds-card` | Risk score projection, summary, before/after comparison |
| Tags | `/components/tags.html` | Sensitivity tags, status tags (`.sds-tag--error` Critical, `.sds-tag--warning` High, `.sds-tag--info` Medium) |
| Buttons | `/components/buttons.html` | Back (secondary), Dry Run (secondary), Execute (primary), Request Approval (primary) |
| **Risk Score Gauge** | NEW COMPONENT NEEDED | Circular or numeric score display with color coding |
| **Before/After Comparison** | NEW COMPONENT NEEDED | Side-by-side data comparison panel |
| **Warning Banner** | NEW COMPONENT NEEDED | Full-width callout with icon, uses warning status tokens |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Warning banner bg | background | `var(--sds-status-warning-bg)` |
| Warning banner border | border-left | 4px solid `var(--sds-status-warning-strong)` |
| Warning banner text | color | `var(--sds-status-warning-text)` |
| Risk score current (high risk) | color | `var(--sds-status-error-text)` |
| Risk score projected (medium risk) | color | `var(--sds-status-warning-text)` |
| Risk score projected (low risk) | color | `var(--sds-status-success-text)` |
| Score delta badge | background, color | `var(--sds-status-success-bg)` / `var(--sds-status-success-text)` |
| Score delta arrow | stroke | `var(--sds-status-success-strong)` |
| Before column header | background | `var(--sds-bg-subtle)` |
| Before column data | color | `var(--sds-text-secondary)` |
| After column header | background | `var(--sds-status-info-bg)` |
| After column data | color | `var(--sds-status-info-text)` |
| Summary card | background, border | `var(--sds-bg-card)` / `var(--sds-border-default)` |
| Summary card labels | color, size | `var(--sds-text-secondary)` / 13px |
| Summary card values | color, size, weight | `var(--sds-text-primary)` / 14px / 500 |
| Affected items table header | background | `var(--sds-bg-subtle)` |
| Affected items table header text | color, size, weight | `var(--sds-text-secondary)` / 12px / 600 |
| Affected items table row border | border-bottom | `var(--sds-border-subtle)` |
| Affected items table row hover | background | `var(--sds-color-warm-gray-050)` |
| Dry Run button | variant | `btn-secondary btn-md` |
| Execute button | variant | `btn-primary btn-md` |
| Execute button (for delete) | variant | `btn-danger btn-md` (uses red to signal destructive action) |

#### Interaction Details

| Interaction | Behavior |
|-------------|----------|
| Risk score projection | On page load, the projected score animates from the current value to the projected value over 800ms with an ease-out curve. The delta badge fades in after the animation completes. |
| Before/after columns | Differences are highlighted with a subtle blue background (`var(--sds-status-info-bg)`) on changed values. Unchanged values use default text color. |
| Dry Run button click | Navigates to Dry Run Results screen. Button shows a loading spinner (16px) during the brief transition. |
| Execute button click | For delete actions, requires typed confirmation of the table name in a modal dialog. For all types on production data, shows a final confirmation dialog. Then navigates to Execution Progress. |
| Edit Config button | Navigates back to Configure Remediation preserving all current settings. |
| Warning banner dismiss | Warning banner has an "x" close button. Dismissed for the current session only. Reappears on page reload. |
| Scheduled remediation | If scheduled, the Execute button label changes to "Schedule Remediation" and shows the scheduled time in the summary card. |
| Hover on affected item row | Row highlights with `var(--sds-color-warm-gray-050)`. Clicking a row expands to show column-specific details (sample data, current access grants, etc.). |

#### State Variations

| State | Description |
|-------|-------------|
| **Loading** | Skeleton placeholders for risk score, summary, and comparison sections. |
| **Populated (Tokenize)** | Before/after shows sample data rows with original vs tokenized values. |
| **Populated (Revoke)** | Before/after shows access diff: grants being removed shown with red strikethrough, remaining grants in normal text. |
| **Populated (Delete)** | Before/after shows dependency tree: tables/columns being deleted with red highlight, downstream dependencies listed with warning icons. |
| **Populated (Apply Policy)** | Before/after shows which columns will match the new policy, current policy (if any) vs new policy side by side. |
| **Production warning** | Orange warning banner visible at top when target connection is tagged as production. |
| **Irreversible action** | For delete: additional red callout banner below warning: "Deletion is permanent and cannot be reversed." Uses `var(--sds-status-error-bg)` background. |
| **Approval required** | Footer shows "Request Approval" instead of "Execute." Info banner: "This remediation requires approval before execution." |

#### Responsive Behavior

- **>= 1280px**: Before/after comparison in 2-column 50/50 layout.
- **1024px - 1279px**: Before/after still side-by-side but narrower. Summary metrics wrap.
- **768px - 1023px**: Before/after stack vertically. "Before" above "After."
- **< 768px**: Full single column. All sections stack.

---

### 5.3 Dry Run Results

**Purpose**: Show simulated results of the remediation without modifying any actual data.

**Page type**: Results view (not a wizard step -- accessible from Preview)

#### Shell & Layout

- **Shell**: Full App Shell
- **Grid**: Single-column content area, 24px padding

#### Content Hierarchy

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER                                                            │
├────────┬─────────────────────────────────────────────────────────┤
│SIDEBAR │ Content Area                                             │
│        │                                                         │
│        │ Breadcrumb: Remediation > Preview > Dry Run Results      │
│        │ Title: "Dry Run Results"                                 │
│        │                                                         │
│        │ ┌─Status Banner──────────────────────────────────────┐ │
│        │ │ Check icon  "Dry run completed successfully.       │ │
│        │ │              No data was modified."                 │ │
│        │ │              Timestamp: Mar 14, 2026 2:34 PM        │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Metrics Row (3-up cards)───────────────────────────┐ │
│        │ │ ┌──────────┐  ┌──────────┐  ┌──────────┐          │ │
│        │ │ │ Items    │  │ Would    │  │ Would    │          │ │
│        │ │ │ Tested   │  │ Succeed  │  │ Fail     │          │ │
│        │ │ │   12     │  │   11     │  │    1     │          │ │
│        │ │ └──────────┘  └──────────┘  └──────────┘          │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Results Table──────────────────────────────────────┐ │
│        │ │ Column | Table | Simulated Result | Status          │ │
│        │ │ ssn    | users | tok_a8f2..x9d1   | Would succeed  │ │
│        │ │ email  | users | tok_c3e7..k2m8   | Would succeed  │ │
│        │ │ phone  | users | --               | Would fail:    │ │
│        │ │        |       |                  | "Format error" │ │
│        │ │ ...                                                 │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Sticky Footer──────────────────────────────────────┐ │
│        │ │   [Back to Configure (sec)] [Proceed for Real (pri)]│ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
└────────┴─────────────────────────────────────────────────────────┘
```

#### Component Inventory

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| Card | `.sds-card` | Status banner, metric cards |
| Tags | `.sds-tag` | Status tags: `.sds-tag--success` "Would succeed", `.sds-tag--error` "Would fail" |
| Buttons | `.btn-secondary`, `.btn-primary` | Back to Configure, Proceed for Real |
| **Data Table** | NEW COMPONENT (standard table pattern) | Results table with sortable columns |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Status banner (success) | background | `var(--sds-status-success-bg)` |
| Status banner border | border-left | 4px solid `var(--sds-status-success-strong)` |
| Status banner text | color | `var(--sds-status-success-text)` |
| Status banner (has failures) | background | `var(--sds-status-warning-bg)` |
| Metric card "Items Tested" | value color | `var(--sds-text-primary)` |
| Metric card "Would Succeed" | value color | `var(--sds-status-success-text)` |
| Metric card "Would Fail" | value color | `var(--sds-status-error-text)` |
| Results table header bg | background | `var(--sds-bg-subtle)` |
| Results table header text | color | `var(--sds-text-secondary)` / 12px / 600 |
| Results table row border | border | `var(--sds-border-subtle)` |
| Failed row background | background | `var(--sds-status-error-bg)` (subtle) |
| Error reason text | color | `var(--sds-status-error-text)` / 12px |

#### Interaction Details

| Interaction | Behavior |
|-------------|----------|
| Page load | Results appear immediately (dry run already completed). Metric card values count up from 0 over 400ms. |
| Sort table columns | Click column header to sort ascending/descending. Sort indicator arrow in header. |
| Click failed row | Expands to show full error details and possible remediation suggestion. |
| "Proceed for Real" | If there are failures, shows a confirmation: "1 item would fail. Proceed with the remaining 11 items?" with [Cancel]/[Proceed] buttons. Then navigates to Execution Progress (or Approval Request if approval is required). |
| "Back to Configure" | Returns to Configure step with all settings preserved. User can modify configuration and re-run dry run. |
| Export results | Tertiary "Export" button in table header area. Downloads CSV of dry run results. |

#### State Variations

| State | Description |
|-------|-------------|
| **All succeed** | Green status banner. "Would Fail" metric shows 0 with neutral color. |
| **Partial failure** | Yellow/warning status banner. Failed rows highlighted with subtle error background. |
| **All fail** | Red status banner. "Proceed for Real" button disabled. Message: "All items would fail. Please review configuration." |

---

### 5.4 Execution Progress

**Purpose**: Track real-time progress of remediation execution, especially for batch operations.

**Page type**: Progress view

#### Shell & Layout

- **Shell**: Full App Shell
- **Grid**: Single-column content area, centered content (max-width 720px)

#### Content Hierarchy

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER                                                            │
├────────┬─────────────────────────────────────────────────────────┤
│SIDEBAR │ Content Area (centered, max-width 720px)                │
│        │                                                         │
│        │ Breadcrumb: Remediation > Executing                      │
│        │ Title: "Remediation in Progress"                         │
│        │                                                         │
│        │ ┌─Progress Card──────────────────────────────────────┐ │
│        │ │                                                     │ │
│        │ │  Tokenizing 12 columns across 3 tables              │ │
│        │ │                                                     │ │
│        │ │  ┌─Progress Bar─────────────────────────────────┐  │ │
│        │ │  │ ████████████████░░░░░░░░░░  8 of 12 (67%)   │  │ │
│        │ │  └──────────────────────────────────────────────┘  │ │
│        │ │                                                     │ │
│        │ │  Elapsed: 1m 23s    Estimated remaining: ~45s       │ │
│        │ │                                                     │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Per-Item Status List (scrollable)──────────────────┐ │
│        │ │ ┌─Item─────────────────────────────────────────┐   │ │
│        │ │ │ [check] users.ssn         Done      0.8s     │   │ │
│        │ │ │ [check] users.email       Done      1.2s     │   │ │
│        │ │ │ [check] users.phone       Done      0.9s     │   │ │
│        │ │ │ [spin]  orders.address    Executing...        │   │ │
│        │ │ │ [queue] orders.name       Queued              │   │ │
│        │ │ │ [queue] orders.zip        Queued              │   │ │
│        │ │ │ ...                                           │   │ │
│        │ │ └───────────────────────────────────────────────┘   │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Footer──────────────────────────────────────────────┐ │
│        │ │                              [Cancel Remediation]    │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
└────────┴─────────────────────────────────────────────────────────┘
```

#### Component Inventory

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| Card | `.sds-card` | Progress card |
| Tags | `.sds-tag` | Status: `.sds-tag--success` "Done", `.sds-tag--info` "Executing", `.sds-tag--neutral` "Queued", `.sds-tag--error` "Failed" |
| Buttons | `.btn-danger-outline btn-md` | Cancel Remediation |
| **Progress Bar** | NEW COMPONENT NEEDED | Horizontal bar with fill animation |
| **Status List** | NEW COMPONENT NEEDED | Per-item status list with icons and transitions |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Progress card | background, border | `var(--sds-bg-card)` / `var(--sds-border-default)` |
| Progress bar track | background | `var(--sds-bg-subtle)` |
| Progress bar fill | background | `var(--sds-interactive-primary)` |
| Progress bar fill (has failures) | background | `var(--sds-status-warning-strong)` |
| Progress percentage text | color, weight | `var(--sds-text-primary)` / 600 |
| Progress description text | color, size | `var(--sds-text-secondary)` / 14px |
| Elapsed/remaining time | color, size | `var(--sds-text-tertiary)` / 13px |
| Done icon | color | `var(--sds-status-success-strong)` |
| Executing spinner | color | `var(--sds-interactive-primary)` |
| Queued icon | color | `var(--sds-text-disabled)` |
| Failed icon | color | `var(--sds-status-error-strong)` |
| Item name text | color | `var(--sds-text-primary)` / 13px |
| Item duration text | color | `var(--sds-text-tertiary)` / 12px |
| Cancel button | variant | `btn-danger-outline btn-md` |
| Status list item border | border-bottom | `var(--sds-border-subtle)` |

#### Interaction Details

| Interaction | Behavior |
|-------------|----------|
| Progress bar | Animates smoothly as each item completes. Fill width transitions with 300ms ease-out. |
| Per-item status transition | Items transition from "Queued" to "Executing" to "Done" or "Failed." Executing state shows a 16px spinner. Done shows a green checkmark that fades in over 200ms. Failed shows a red "x" icon. |
| Small batch (< 50 items) | All items visible in the list. No scrolling needed. Progress completes quickly with inline spinner. |
| Large batch (50+ items) | List is scrollable. Currently executing item auto-scrolls into view. Header shows "Running in background" note and email notification promise. |
| Cancel Remediation | Confirmation dialog: "Cancel in progress? Items already processed will remain changed. Currently queued items will not be processed." [Continue Executing] / [Cancel Remediation]. If cancelled, navigates to partial results view. |
| Real-time updates | WebSocket or polling (every 2 seconds) updates the progress bar and item statuses. |
| Page navigation away | Browser beforeunload prompt: "Remediation is still running. It will continue in the background." Sidebar badge shows progress indicator. |
| Completion | When all items complete, automatically navigates to Success screen after a 1-second delay showing the completed progress bar at 100%. |

#### State Variations

| State | Description |
|-------|-------------|
| **In progress** | Progress bar animating, items transitioning through statuses. Cancel button visible. |
| **All succeeded** | Brief 100% state (1s) then auto-navigates to Success screen. |
| **Partial failure** | Progress bar turns to warning color. Failed items show red status with error message. Footer changes to [Retry Failed (primary)] [View Results (secondary)]. |
| **Complete failure** | Progress bar turns to error color. All items show failed. Footer: [Back to Configure (secondary)] [View Error Details (primary)]. |
| **Cancelled** | Progress bar stops. Remaining items show "Cancelled" tag (`.sds-tag--neutral`). Footer: [View Partial Results (primary)]. |
| **Background execution** | When user navigates away, sidebar "Remediation" nav item shows a small notification dot (8px, `var(--sds-interactive-primary)`). Clicking returns to this progress view. |

---

### 5.5 Remediation Success

**Purpose**: Celebrate risk reduction, show what changed, and provide next action pathways.

**Page type**: Success celebration

#### Shell & Layout

- **Shell**: Full App Shell
- **Grid**: Single-column, centered content (max-width 640px)

#### Content Hierarchy

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER                                                            │
├────────┬─────────────────────────────────────────────────────────┤
│SIDEBAR │ Content Area (centered, max-width 640px)                │
│        │                                                         │
│        │            ┌─Success Celebration─────────────┐          │
│        │            │                                  │          │
│        │            │    [Animated checkmark icon]     │          │
│        │            │                                  │          │
│        │            │   "Remediation Complete"         │          │
│        │            │                                  │          │
│        │            │   ┌─Risk Score Animation──────┐  │          │
│        │            │   │                            │  │          │
│        │            │   │   78  ─────>  65           │  │          │
│        │            │   │  [red]  anim  [yellow]     │  │          │
│        │            │   │                            │  │          │
│        │            │   │   -13 points  (arrow down) │  │          │
│        │            │   │   "Risk reduced by 17%"    │  │          │
│        │            │   │                            │  │          │
│        │            │   └────────────────────────────┘  │          │
│        │            │                                  │          │
│        │            │   ┌─What Changed Summary──────┐  │          │
│        │            │   │ 12 columns tokenized       │  │          │
│        │            │   │ across 3 tables             │  │          │
│        │            │   │ in Snowflake Production     │  │          │
│        │            │   │ Duration: 2m 15s            │  │          │
│        │            │   │                            │  │          │
│        │            │   │ Audit log entry: #4521     │  │          │
│        │            │   └────────────────────────────┘  │          │
│        │            │                                  │          │
│        │            │   ┌─Next Actions────────────────┐ │          │
│        │            │   │ [Return to Dashboard (pri)] │ │          │
│        │            │   │ [Remediate More (sec)]      │ │          │
│        │            │   │ [View History (tertiary)]   │ │          │
│        │            │   └────────────────────────────┘ │          │
│        │            │                                  │          │
│        │            └──────────────────────────────────┘          │
│        │                                                         │
└────────┴─────────────────────────────────────────────────────────┘
```

#### Component Inventory

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| Buttons | `.btn-primary btn-lg`, `.btn-secondary btn-md`, `.btn-tertiary btn-md` | Next action buttons |
| Card | `.sds-card` | What Changed summary |
| **Animated Risk Score** | NEW COMPONENT NEEDED | Score counter animation with color transition |
| **Animated Checkmark** | NEW COMPONENT NEEDED | SVG checkmark with draw-on animation |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Checkmark circle bg | background | `var(--sds-status-success-bg)` |
| Checkmark stroke | color | `var(--sds-status-success-strong)` |
| Title "Remediation Complete" | color, size, weight | `var(--sds-text-primary)` / 28px / 700 |
| Score "before" value | color | `var(--sds-status-error-text)` |
| Score "after" value | color | `var(--sds-status-success-text)` or `var(--sds-status-warning-text)` depending on new level |
| Score delta badge | background, color | `var(--sds-status-success-bg)` / `var(--sds-status-success-text)` |
| Percentage text | color | `var(--sds-status-success-text)` / 14px / 500 |
| Summary card | background, border | `var(--sds-bg-card)` / `var(--sds-border-default)` |
| Summary labels | color | `var(--sds-text-secondary)` / 13px |
| Summary values | color, weight | `var(--sds-text-primary)` / 14px / 500 |
| Audit log link | color | `var(--sds-text-link)` |
| Return to Dashboard button | variant | `btn-primary btn-lg` |
| Remediate More button | variant | `btn-secondary btn-md` |
| View History link | variant | `btn-tertiary btn-md` |

#### Interaction Details

| Interaction | Behavior |
|-------------|----------|
| Page load animation sequence | 1. Checkmark circle scales in from 0 to 100% (300ms, ease-out-back). 2. Checkmark stroke draws on (400ms, ease-out). 3. Title fades in and slides up 8px (200ms). 4. Risk score "before" number appears (100ms). 5. Score animates: digits tick down from 78 to 65 over 1200ms. Color transitions from red to yellow (or green). 6. Delta badge slides up and fades in (200ms). 7. Summary card fades in (200ms). 8. Action buttons fade in (200ms). Total sequence: ~2.5 seconds. |
| Risk score digit animation | Uses a CSS counter or JS requestAnimationFrame to tick digits. Each number change has a slight vertical slide (2px). Easing: ease-out-cubic. |
| Color transition on score | Score color interpolates between `--sds-status-error-text` and `--sds-status-warning-text` (or `--sds-status-success-text` if score drops below 50) as the number decreases. |
| Return to Dashboard | Navigates to Dashboard. The dashboard should show the updated risk score, ideally with the delta still visible briefly (2s) via a toast or inline badge. |
| Remediate More | Navigates to Configure Remediation with a fresh form (no pre-filled context). |
| View History | Navigates to Remediation History with the most recent entry highlighted at top. |
| Audit log link | Opens Remediation Detail for this specific remediation entry. |

#### State Variations

| State | Description |
|-------|-------------|
| **Full success** | All items remediated. Green checkmark animation. Score ticks down. |
| **Partial success** | Checkmark is yellow/warning. Title: "Remediation Partially Complete." Additional line: "3 of 12 items failed." Shows [Retry Failed (primary)] alongside other actions. Score reflects partial improvement. |
| **Scheduled success** | Title: "Remediation Scheduled." No score animation (not executed yet). Shows scheduled date/time. CTA: "View in History." |

---

### 5.6 Remediation History

**Purpose**: Audit trail of all remediations with filtering, and tab for approval queue.

**Page type**: List view with tabs

#### Shell & Layout

- **Shell**: Full App Shell
- **Grid**: Single-column content area, 24px padding, full-width table

#### Content Hierarchy

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER                                                            │
├────────┬─────────────────────────────────────────────────────────┤
│SIDEBAR │ Content Area                                             │
│        │                                                         │
│        │ Title: "Remediation"             [Export (sec)]          │
│        │                                                         │
│        │ ┌─Page Tabs──────────────────────────────────────────┐ │
│        │ │ History | Approvals (3)                             │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Filter Bar─────────────────────────────────────────┐ │
│        │ │ [Type v] [Status v] [User v] [Date range] [Search] │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Active Filter Chips────────────────────────────────┐ │
│        │ │ Type: Tokenize [x]   Status: Applied [x]  [Clear] │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─History Table──────────────────────────────────────┐ │
│        │ │ Date       | Type      | User    | Items | Risk   │ │
│        │ │            |           |         |       | Impact │ │
│        │ │            |           |         |       | Status │ │
│        │ │────────────┼───────────┼─────────┼───────┼────────│ │
│        │ │ Mar 14     | Tokenize  | Jordan  | 12    | -13   │ │
│        │ │ 2:34 PM    |           |         |       | Applied│ │
│        │ │────────────┼───────────┼─────────┼───────┼────────│ │
│        │ │ Mar 13     | Revoke    | Priya   | 5     | -8    │ │
│        │ │ 10:15 AM   |           |         |       | Applied│ │
│        │ │────────────┼───────────┼─────────┼───────┼────────│ │
│        │ │ Mar 15     | Tokenize  | Jordan  | 20    | -15   │ │
│        │ │ 9:00 AM    |           |         |       |Scheduled│ │
│        │ │────────────┼───────────┼─────────┼───────┼────────│ │
│        │ │ Mar 12     | Delete    | Jordan  | 3     | -5    │ │
│        │ │ 4:00 PM    |           |         |       | Rolled │ │
│        │ │            |           |         |       | Back   │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Pagination─────────────────────────────────────────┐ │
│        │ │ Showing 1-20 of 47         [< 1 2 3 >]             │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
└────────┴─────────────────────────────────────────────────────────┘
```

#### Component Inventory

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| Page Tabs | `/components/tabs.html` `.sds-tabs` | History / Approvals tabs. Approvals tab has `.sds-tab-badge` showing pending count. |
| Tags | `.sds-tag` | Status tags: `.sds-tag--success` "Applied", `.sds-tag--neutral` "Scheduled", `.sds-tag--warning` "Pending Approval", `.sds-tag--error` "Failed", `.sds-tag--info` "Rolled Back", `.sds-tag--purple` "Cancelled" |
| Buttons | `.btn-secondary btn-md` | Export |
| Badge | `.sds-badge--warning` | Approvals count in tab |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Page title | color, size, weight | `var(--sds-text-primary)` / 24px / 600 |
| Tab bar border | border-bottom | `var(--sds-border-default)` |
| Active tab indicator | border-bottom | 2px `var(--sds-interactive-primary)` |
| Active tab text | color, weight | `var(--sds-text-primary)` / 500 |
| Inactive tab text | color | `var(--sds-text-tertiary)` |
| Approvals badge | background, color | `var(--sds-status-warning-bg)` / `var(--sds-status-warning-text)` |
| Filter dropdown border | border | `var(--sds-border-default)` |
| Active filter chip bg | background | `var(--sds-interactive-primary-subtle)` |
| Active filter chip text | color | `var(--sds-interactive-primary)` |
| Filter chip remove "x" | color | `var(--sds-interactive-primary)` |
| Table header bg | background | `var(--sds-bg-subtle)` |
| Table header text | color, size, weight | `var(--sds-text-secondary)` / 12px / 600 |
| Table row border | border-bottom | `var(--sds-border-subtle)` |
| Table row hover | background | `var(--sds-color-warm-gray-050)` |
| Table cell text | color, size | `var(--sds-text-secondary)` / 13px |
| Risk impact negative (good) | color | `var(--sds-status-success-text)` |
| Risk impact positive (bad, after rollback) | color | `var(--sds-status-error-text)` |
| Pagination text | color | `var(--sds-text-tertiary)` / 13px |
| Pagination active page | color, weight | `var(--sds-interactive-primary)` / 600 |

#### Interaction Details

| Interaction | Behavior |
|-------------|----------|
| Click table row | Navigates to Remediation Detail for that entry. Row click target is the entire row. Cursor changes to pointer on hover. |
| Tab switch (History/Approvals) | Content swaps with no page reload. Active tab indicator slides to new position (200ms ease). |
| Filter dropdown | Opens dropdown with checkbox options. Selecting an option adds a filter chip below the bar and filters the table in real time. |
| Date range filter | Opens a date range picker. Predefined options: Today, Last 7 days, Last 30 days, Custom range. |
| Search | Debounced text search (300ms) across all columns. Highlights matching text in results. |
| Sort columns | Click column header to sort. Arrow indicator shows direction. Default sort: newest first. |
| Export button | Downloads CSV/Excel of currently filtered results. |
| Clear all filters | Removes all filter chips and shows full unfiltered list. |

#### State Variations

| State | Description |
|-------|-------------|
| **Empty** | Centered empty state: Illustration icon (48px), Title: "No remediations yet", Description: "Remediations you execute will appear here." CTA: "Start a Remediation" (primary button). Uses standard empty state pattern. |
| **Loading** | Skeleton rows (6 rows) with pulse animation in `var(--sds-bg-subtle)`. |
| **Populated** | Table with data, pagination visible. |
| **Filtered (no results)** | "No results match your filters." with "Clear all filters" tertiary link. |

---

### 5.7 Remediation Detail

**Purpose**: Full record of a single remediation action including what was done, who did it, when, affected items, and rollback availability.

**Page type**: Detail view

#### Shell & Layout

- **Shell**: Full App Shell
- **Grid**: Single-column content area, 24px padding

#### Content Hierarchy

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER                                                            │
├────────┬─────────────────────────────────────────────────────────┤
│SIDEBAR │ Content Area                                             │
│        │                                                         │
│        │ Breadcrumb: Remediation > History > Detail                │
│        │ Title: "Tokenize 12 columns"   [Status Tag] [Rollback] │
│        │                                                         │
│        │ ┌─Metadata Card──────────────────────────────────────┐ │
│        │ │ ┌─────────────┬──────────────┬──────────────────┐  │ │
│        │ │ │ Executed by │ Date         │ Duration         │  │ │
│        │ │ │ Jordan K.   │ Mar 14, 2026 │ 2m 15s           │  │ │
│        │ │ │             │ 2:34 PM      │                  │  │ │
│        │ │ ├─────────────┼──────────────┼──────────────────┤  │ │
│        │ │ │ Connection  │ Action Type  │ Risk Impact      │  │ │
│        │ │ │ Snowflake   │ Tokenize     │ -13 points       │  │ │
│        │ │ │ Production  │              │ (78 > 65)        │  │ │
│        │ │ └─────────────┴──────────────┴──────────────────┘  │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Approval Chain (if applicable)─────────────────────┐ │
│        │ │ Requested by: Jordan K.   Mar 14, 1:20 PM          │ │
│        │ │ Approved by:  Priya S.    Mar 14, 2:30 PM          │ │
│        │ │ Approval notes: "Reviewed impact. Approved."        │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Affected Items Table───────────────────────────────┐ │
│        │ │ Column | Table | Sensitivity | Result | Status      │ │
│        │ │ ssn    | users | Critical    | Token. | Succeeded   │ │
│        │ │ email  | users | High        | Token. | Succeeded   │ │
│        │ │ ...                                                 │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Rollback Info Card─────────────────────────────────┐ │
│        │ │ Rollback available until: Apr 13, 2026              │ │
│        │ │ "Rolling back will detokenize all 12 columns and    │ │
│        │ │  increase the risk score by 13 points."             │ │
│        │ │ [Preview Rollback (danger-outline)]                 │ │
│        │ │                                                     │ │
│        │ │ OR                                                  │ │
│        │ │                                                     │ │
│        │ │ "Rollback not available. Deletion is permanent."    │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
└────────┴─────────────────────────────────────────────────────────┘
```

#### Component Inventory

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| Card | `.sds-card` | Metadata, approval chain, rollback info |
| Tags | `.sds-tag` | Status tag in title row, sensitivity tags, result tags |
| Buttons | `.btn-danger-outline btn-md` | Preview Rollback |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Breadcrumb | color | `var(--sds-text-link)` / 13px |
| Title | color, size, weight | `var(--sds-text-primary)` / 24px / 600 |
| Status tag (applied) | variant | `.sds-tag--success` |
| Status tag (rolled back) | variant | `.sds-tag--info` |
| Status tag (failed) | variant | `.sds-tag--error` |
| Metadata card | background, border | `var(--sds-bg-card)` / `var(--sds-border-default)` |
| Metadata labels | color, size | `var(--sds-text-tertiary)` / 12px |
| Metadata values | color, size, weight | `var(--sds-text-primary)` / 14px / 500 |
| Metadata cell dividers | border | `var(--sds-border-subtle)` |
| Risk impact value (negative = good) | color | `var(--sds-status-success-text)` |
| Approval chain card | background | `var(--sds-bg-surface)` |
| Approval chain connector line | border-left | 2px solid `var(--sds-border-default)` |
| Approval node dot (completed) | background | `var(--sds-status-success-strong)` |
| Rollback info card | background | `var(--sds-bg-card)` |
| Rollback expiry text | color | `var(--sds-text-secondary)` / 13px |
| Rollback warning text | color | `var(--sds-text-primary)` / 14px |
| Rollback unavailable text | color | `var(--sds-text-tertiary)` / 14px, italic |
| Preview Rollback button | variant | `btn-danger-outline btn-md` |

#### Interaction Details

| Interaction | Behavior |
|-------------|----------|
| Click affected item row | Expands to show before/after data for that specific item. |
| Preview Rollback button | Navigates to Rollback Preview screen. |
| Audit log link | Scrolls to or opens the audit trail section. |
| Export | Tertiary button in page header exports the detail as PDF or CSV. |
| Back navigation | Breadcrumb "History" returns to Remediation History preserving filters. |

#### State Variations

| State | Description |
|-------|-------------|
| **Applied** | Green status tag. Rollback info card visible with expiry date. |
| **Rolled back** | Blue/info status tag. Rollback info card shows: "This remediation was rolled back on [date] by [user]." No rollback button. |
| **Failed** | Red status tag. Affected items table shows per-item error reasons. Rollback info: "No rollback needed -- remediation did not complete." |
| **Scheduled** | Neutral tag "Scheduled." Shows scheduled execution time. Action: "Cancel Scheduled Remediation" (danger-outline). |
| **Pending approval** | Warning tag "Pending Approval." Shows approval request details. No rollback section. |
| **Rollback expired** | Rollback info card: "Rollback window expired on [date]." Grayed-out rollback button with tooltip. |

---

### 5.8 Rollback Preview

**Purpose**: Show exactly what will be reversed and the risk score impact before confirming a rollback.

**Page type**: Confirmation view

#### Shell & Layout

- **Shell**: Full App Shell
- **Grid**: Single-column, centered content (max-width 720px)

#### Content Hierarchy

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER                                                            │
├────────┬─────────────────────────────────────────────────────────┤
│SIDEBAR │ Content Area (centered, max-width 720px)                │
│        │                                                         │
│        │ Breadcrumb: Remediation > History > Detail > Rollback    │
│        │ Title: "Rollback Preview"                                │
│        │                                                         │
│        │ ┌─Warning Banner─────────────────────────────────────┐ │
│        │ │ ! "Rolling back will reverse the tokenization of   │ │
│        │ │    12 columns. Original data will be exposed."      │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Risk Score Impact Card─────────────────────────────┐ │
│        │ │  Current Score     After Rollback                   │ │
│        │ │  ┌────────┐       ┌────────┐                       │ │
│        │ │  │   65   │  ->   │   78   │    +13 points         │ │
│        │ │  │[yellow] │       │  [red]  │    (arrow up, red)   │ │
│        │ │  └────────┘       └────────┘                       │ │
│        │ │  "Risk score will increase by 17%"                  │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─What Will Be Reversed──────────────────────────────┐ │
│        │ │ Before Rollback      After Rollback                 │ │
│        │ │ tok_a8f2...x9d1  ->  123-45-6789                   │ │
│        │ │ tok_c3e7...k2m8  ->  john@email.com                │ │
│        │ │ (sample of affected data)                           │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Affected Items Summary─────────────────────────────┐ │
│        │ │ 12 columns across 3 tables will be detokenized      │ │
│        │ │ Connection: Snowflake Production                    │ │
│        │ │ Originally remediated by: Jordan K. on Mar 14       │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Footer──────────────────────────────────────────────┐ │
│        │ │ Rollback reason (optional textarea)                 │ │
│        │ │                                                     │ │
│        │ │ [Cancel (sec)]           [Confirm Rollback (danger)] │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
└────────┴─────────────────────────────────────────────────────────┘
```

#### Component Inventory

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| Card | `.sds-card` | Risk score impact, what will be reversed, affected items summary |
| Buttons | `.btn-secondary btn-md`, `.btn-danger btn-md` | Cancel, Confirm Rollback |
| **Warning Banner** | (same as Preview Impact) | Top warning about data exposure |
| **Before/After Comparison** | (same as Preview Impact, reversed direction) | Tokenized > Original data |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Warning banner bg | background | `var(--sds-status-warning-bg)` |
| Warning banner border | border-left | 4px solid `var(--sds-status-warning-strong)` |
| Warning banner text | color | `var(--sds-status-warning-text)` |
| Score delta badge (increase = bad) | background, color | `var(--sds-status-error-bg)` / `var(--sds-status-error-text)` |
| Delta arrow (up, bad) | stroke | `var(--sds-status-error-strong)` |
| Before column (tokenized) | background | `var(--sds-bg-subtle)` |
| After column (original, exposed) | background | `var(--sds-status-warning-bg)` |
| Rollback reason textarea border | border | `var(--sds-border-default)`, focus: `var(--sds-border-focus)` |
| Confirm Rollback button | variant | `btn-danger btn-md` |
| Cancel button | variant | `btn-secondary btn-md` |

#### Interaction Details

| Interaction | Behavior |
|-------------|----------|
| Confirm Rollback | Executes the rollback. Shows a brief progress spinner on the button (2-3 seconds for most rollbacks). Then navigates to Remediation History with a success toast: "Rollback completed. Risk score updated." |
| Cancel | Returns to Remediation Detail. |
| Rollback reason | Optional text area for audit purposes. Logged in the audit trail. Placeholder: "Optional: explain why this rollback is needed." |

#### State Variations

| State | Description |
|-------|-------------|
| **Default** | All cards populated with rollback preview data. |
| **Processing** | After clicking Confirm Rollback, button shows spinner and disables. Cancel button also disabled. |
| **Error** | If rollback fails, shows error banner: "Rollback failed: [reason]." with [Retry] button. |

---

### 5.9 Approval Request

**Purpose**: Submit a remediation for approval when the user lacks execute permissions, or when org policy requires sign-off for production data or large-scope remediations.

**Page type**: Form view

#### Shell & Layout

- **Shell**: Full App Shell
- **Grid**: Single-column, centered content (max-width 640px)

#### Content Hierarchy

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER                                                            │
├────────┬─────────────────────────────────────────────────────────┤
│SIDEBAR │ Content Area (centered, max-width 640px)                │
│        │                                                         │
│        │ Breadcrumb: Remediation > Preview > Request Approval     │
│        │ Title: "Request Approval"                                │
│        │                                                         │
│        │ ┌─Remediation Summary Card───────────────────────────┐ │
│        │ │ Action: Tokenize 12 columns                         │ │
│        │ │ Connection: Snowflake Production                    │ │
│        │ │ Risk impact: -13 points (78 > 65)                   │ │
│        │ │ Schedule: Immediate                                 │ │
│        │ │ Dry-run status: Passed (11/12 items)                │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Approver Section───────────────────────────────────┐ │
│        │ │ Approver (auto-assigned based on scope/data owner)  │ │
│        │ │ [Priya Sharma - Data Governance Lead       v]       │ │
│        │ │ or                                                  │ │
│        │ │ [Search for approver...]                            │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Request Details────────────────────────────────────┐ │
│        │ │ Priority                                            │ │
│        │ │ ( ) Normal   ( ) Urgent                             │ │
│        │ │                                                     │ │
│        │ │ Notes for approver                                  │ │
│        │ │ ┌─textarea──────────────────────────────────────┐  │ │
│        │ │ │ Explain the business justification...         │  │ │
│        │ │ └───────────────────────────────────────────────┘  │ │
│        │ │                                                     │ │
│        │ │ Expiry: Request will expire in 7 days if not        │ │
│        │ │         reviewed.                                   │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Footer──────────────────────────────────────────────┐ │
│        │ │         [Cancel (sec)]     [Submit Request (pri)]    │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
└────────┴─────────────────────────────────────────────────────────┘
```

#### Component Inventory

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| Card | `.sds-card` | Remediation summary, approver section, request details |
| Buttons | `.btn-secondary btn-md`, `.btn-primary btn-md` | Cancel, Submit Request |
| Tags | `.sds-tag--success` | Dry-run passed indicator |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Summary card | background, border | `var(--sds-bg-surface)` / `var(--sds-border-default)` |
| Summary labels | color, size | `var(--sds-text-secondary)` / 13px |
| Summary values | color, weight | `var(--sds-text-primary)` / 500 |
| Approver dropdown border | border | `var(--sds-border-default)`, focus: `var(--sds-border-focus)` |
| Priority radio default | border | `var(--sds-border-default)` |
| Priority radio selected | fill | `var(--sds-interactive-primary)` |
| "Urgent" radio label | color | `var(--sds-status-warning-text)` |
| Notes textarea border | border | `var(--sds-border-default)`, focus: `var(--sds-border-focus)` |
| Notes textarea placeholder | color | `var(--sds-text-tertiary)` |
| Expiry note text | color, size | `var(--sds-text-tertiary)` / 12px |
| Submit Request button | variant | `btn-primary btn-md` |

#### Interaction Details

| Interaction | Behavior |
|-------------|----------|
| Approver auto-assignment | System pre-fills the recommended approver based on data owner mapping and scope. User can override with a dropdown search. |
| Urgent priority selection | Selecting "Urgent" shows a warning tooltip: "Urgent requests send push and email notifications immediately." |
| Submit Request | Validates that approver is selected. Shows brief spinner on button. Sends notification (Alert Ribbon + email) to approver. Navigates to Remediation History with the new request visible as "Pending Approval" status. Shows toast: "Approval request submitted to Priya Sharma." |
| Cancel | Returns to Preview Impact screen. |

#### State Variations

| State | Description |
|-------|-------------|
| **Default** | Pre-filled summary. Auto-assigned approver. Empty notes. |
| **No auto-approver** | If no data owner mapping exists, approver field is empty with placeholder "Select an approver." Submit disabled until selected. |
| **With dry-run results** | Summary card includes dry-run outcome with success/failure counts. |

---

### 5.10 Approval Review

**Purpose**: Approver evaluates a remediation request with full visibility into scope, impact, and dry-run results.

**Page type**: Review view

#### Shell & Layout

- **Shell**: Full App Shell
- **Grid**: Single-column content area, 24px padding

#### Content Hierarchy

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER                                                            │
├────────┬─────────────────────────────────────────────────────────┤
│SIDEBAR │ Content Area                                             │
│        │                                                         │
│        │ ┌─Alert Ribbon (if urgent)───────────────────────────┐ │
│        │ │ ! Urgent approval request from Jordan K.            │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ Breadcrumb: Remediation > Approvals > Review             │
│        │ Title: "Approval Review"    [Urgent tag] [Status tag]   │
│        │ Subtitle: Requested by Jordan K. on Mar 14, 2:30 PM     │
│        │                                                         │
│        │ ┌─Requestor Notes Card───────────────────────────────┐ │
│        │ │ "Customer PII risk identified in Snowflake prod.   │ │
│        │ │  Need to tokenize SSN and email columns to meet    │ │
│        │ │  CCPA compliance deadline."                         │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Impact Preview (embedded from Preview Impact)──────┐ │
│        │ │ Risk Score: 78 -> 65 (-13 points)                   │ │
│        │ │ Action: Tokenize | Items: 12 columns | Tables: 3   │ │
│        │ │ Connection: Snowflake Production                    │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Affected Data Inventory────────────────────────────┐ │
│        │ │ Column | Table | Schema | Sensitivity | Data Type   │ │
│        │ │ ssn    | users | public | Critical    | SSN         │ │
│        │ │ email  | users | public | High        | Email       │ │
│        │ │ ... (expandable rows with sample data)              │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Dry Run Results (if available)──────────────────────┐ │
│        │ │ Dry run: Passed | 11 of 12 items would succeed      │ │
│        │ │ 1 item would fail: orders.phone (format error)      │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Decision Section───────────────────────────────────┐ │
│        │ │ ┌─Comment textarea──────────────────────────────┐  │ │
│        │ │ │ Add a comment (required for reject/changes)...│  │ │
│        │ │ └───────────────────────────────────────────────┘  │ │
│        │ │                                                     │ │
│        │ │ [Request Changes (sec)] [Reject (danger)] [Approve (pri)] │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
└────────┴─────────────────────────────────────────────────────────┘
```

#### Component Inventory

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| Card | `.sds-card` | All content sections |
| Tags | `.sds-tag` | `.sds-tag--warning` "Urgent", `.sds-tag--info` "Under Review", Sensitivity tags |
| Buttons | `.btn-secondary btn-md`, `.btn-danger btn-md`, `.btn-primary btn-md` | Request Changes, Reject, Approve |
| **Alert Ribbon** | NEW COMPONENT NEEDED | Top-of-page notification bar for urgent requests |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Alert ribbon bg | background | `var(--sds-status-warning-bg)` |
| Alert ribbon text | color | `var(--sds-status-warning-text)` |
| Alert ribbon border | border-bottom | 1px solid `var(--sds-status-warning-strong)` |
| Urgent tag | variant | `.sds-tag--warning` |
| Requestor notes card | background | `var(--sds-bg-surface)` |
| Requestor notes text | color, size | `var(--sds-text-primary)` / 14px |
| Impact preview (reuses Preview Impact tokens) | -- | See Preview Impact token table |
| Data inventory table header | background | `var(--sds-bg-subtle)` |
| Dry-run results card (passed) | border-left | 4px solid `var(--sds-status-success-strong)` |
| Dry-run results card (partial) | border-left | 4px solid `var(--sds-status-warning-strong)` |
| Decision comment textarea | border | `var(--sds-border-default)`, focus: `var(--sds-border-focus)` |
| Approve button | variant | `btn-primary btn-md` |
| Reject button | variant | `btn-danger btn-md` |
| Request Changes button | variant | `btn-secondary btn-md` |

#### Interaction Details

| Interaction | Behavior |
|-------------|----------|
| Approve | If no comment, proceeds directly. Shows confirmation: "Approve this remediation? It will be executed immediately." with [Cancel]/[Approve]. Sends notification to requestor. Navigates to Approval Queue. |
| Reject | Requires comment (textarea border turns red if empty on click). Shows confirmation with the rejection reason. Sends notification to requestor with reason. Navigates to Approval Queue. |
| Request Changes | Requires comment. Returns the request to the requestor's Configure step with the comments attached. Sends notification. |
| Expand data row | Clicking a row in the affected data inventory expands it to show sample data, current access, or column metadata. |
| Drill-down links | Connection name, table name, and column name are clickable links to their respective detail pages (Connection Detail, Table Detail). Opens in same tab with browser back support. |
| Approve keyboard shortcut | Cmd/Ctrl + Enter submits the approval (with comment if written). |

#### State Variations

| State | Description |
|-------|-------------|
| **Under review** | Default state. All action buttons active. Status tag: "Under Review." |
| **Urgent** | Alert ribbon visible at top. Urgent tag next to title. Request highlighted with warning left border on the card. |
| **Already decided** | If another approver already acted, buttons disabled. Message: "This request was [approved/rejected] by [name] on [date]." |
| **Expired** | Buttons disabled. Banner: "This request expired on [date]. It has been escalated to [next approver]." |

---

### 5.11 Approval Queue

**Purpose**: View all pending approval requests. Accessible as the "Approvals" tab on the Remediation History page.

**Page type**: List view (embedded as tab content within Remediation History)

#### Shell & Layout

- **Shell**: Full App Shell (same as Remediation History -- this is a tab within that page)
- **Grid**: Single-column table, 24px padding

#### Content Hierarchy

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER                                                            │
├────────┬─────────────────────────────────────────────────────────┤
│SIDEBAR │ Content Area                                             │
│        │                                                         │
│        │ Title: "Remediation"                [Export (sec)]       │
│        │                                                         │
│        │ ┌─Page Tabs──────────────────────────────────────────┐ │
│        │ │ History | Approvals (3) [active]                    │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Filter Bar─────────────────────────────────────────┐ │
│        │ │ [Status v] [Requestor v] [Action Type v] [Search]  │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Urgent Requests Section (if any)────────────────────┐│
│        │ │ Subheading: "Urgent" (warning color)                ││
│        │ │ ┌─────────────────────────────────────────────────┐ ││
│        │ │ │ Req Date  | Requestor| Type    | Items | Risk  │ ││
│        │ │ │           |          |         |       | Expiry│ ││
│        │ │ │ Mar 14    | Jordan K.| Token.  | 12    | -13  │ ││
│        │ │ │ 2:30 PM   |          |         |       | 5d   │ ││
│        │ │ └─────────────────────────────────────────────────┘ ││
│        │ └─────────────────────────────────────────────────────┘│
│        │                                                         │
│        │ ┌─All Requests Table─────────────────────────────────┐ │
│        │ │ Req Date | Requestor | Action | Scope | Risk     │ │
│        │ │          |           | Type   | Count | Impact   │ │
│        │ │          |           |        |       | Status   │ │
│        │ │          |           |        |       | Expiry   │ │
│        │ │──────────┼───────────┼────────┼───────┼──────────│ │
│        │ │ Mar 14   | Jordan K. | Token. | 12    | -13     │ │
│        │ │          |           |        |       | Requested│ │
│        │ │          |           |        |       | 5d left  │ │
│        │ │──────────┼───────────┼────────┼───────┼──────────│ │
│        │ │ Mar 13   | Alex M.   | Revoke | 5     | -8      │ │
│        │ │          |           |        |       | Under    │ │
│        │ │          |           |        |       | Review   │ │
│        │ │          |           |        |       | 3d left  │ │
│        │ │──────────┼───────────┼────────┼───────┼──────────│ │
│        │ │ Mar 10   | Jordan K. | Token. | 30    | -22     │ │
│        │ │          |           |        |       | Approved │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Bulk Actions Bar (when rows selected)──────────────┐ │
│        │ │ [x] 2 selected    [Bulk Approve (for low-risk)]     │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
│        │ ┌─Pagination─────────────────────────────────────────┐ │
│        │ │ Showing 1-10 of 12         [< 1 2 >]               │ │
│        │ └────────────────────────────────────────────────────┘ │
│        │                                                         │
└────────┴─────────────────────────────────────────────────────────┘
```

#### Component Inventory

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| Page Tabs | `.sds-tabs` | History / Approvals (with `.sds-tab-badge` count) |
| Tags | `.sds-tag` | Status: `.sds-tag--info` "Requested", `.sds-tag--info` "Under Review", `.sds-tag--success` "Approved", `.sds-tag--error` "Rejected", `.sds-tag--neutral` "Expired", `.sds-tag--warning` "Urgent" |
| Buttons | `.btn-secondary btn-sm` | Bulk Approve |
| Badge | `.sds-badge--warning` | Tab count badge |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Urgent section subheading | color | `var(--sds-status-warning-text)` / 12px / 600 / uppercase |
| Urgent row background | background | `var(--sds-status-warning-bg)` (subtle highlight) |
| Urgent row left border | border-left | 3px solid `var(--sds-status-warning-strong)` |
| Table header bg | background | `var(--sds-bg-subtle)` |
| Table header text | color, size, weight | `var(--sds-text-secondary)` / 12px / 600 |
| Table row border | border-bottom | `var(--sds-border-subtle)` |
| Table row hover | background | `var(--sds-color-warm-gray-050)` |
| Expiry text (> 3 days) | color | `var(--sds-text-tertiary)` |
| Expiry text (< 3 days) | color | `var(--sds-status-warning-text)` |
| Expiry text (< 1 day) | color | `var(--sds-status-error-text)` |
| Bulk actions bar | background | `var(--sds-interactive-primary-subtle)` |
| Bulk actions bar text | color | `var(--sds-interactive-primary)` |
| Checkbox (default) | border | `var(--sds-border-default)` |
| Checkbox (checked) | background | `var(--sds-interactive-primary)` |
| Row selection highlight | background | `var(--sds-interactive-primary-subtle)` (very light) |

#### Interaction Details

| Interaction | Behavior |
|-------------|----------|
| Click table row | Navigates to Approval Review for that request. |
| Select checkbox | Selects row. Bulk actions bar slides down from above the table (200ms ease). Shows count of selected items. |
| Bulk Approve | Only available for requests marked as "low-risk" (scope < threshold). Confirmation dialog: "Approve 2 low-risk requests?" Lists the requests. On confirm, all selected requests are approved and notifications sent. |
| Filter by status | Dropdown with: Requested, Under Review, Approved, Rejected, Expired, All. |
| Expiry countdown | Shows "Xd left" for pending requests. Updates in real time. When < 1 day, text turns red and shows hours remaining. |
| Sort | Default sort: Urgent requests first, then by date (newest). Clicking column headers allows re-sorting. |
| Tab badge auto-update | The "Approvals (3)" badge updates in real time as requests are approved/rejected. When no pending requests remain, badge disappears. |

#### State Variations

| State | Description |
|-------|-------------|
| **Empty** | "No pending approvals." Centered text with neutral illustration. If user is not an approver: "You do not have approver permissions." |
| **With urgent** | Urgent section appears above the main table with highlighted rows. |
| **All resolved** | Table shows historical approved/rejected requests. Filter defaults to "All" to show them. |
| **Loading** | Skeleton rows with pulse animation. |

---

## 6. New Components Required

The following components are not currently in the Software DS library and will need to be designed and built:

| Component | Used In | Description | Priority |
|-----------|---------|-------------|----------|
| **Wizard Stepper** | Configure, Preview, Execute | Horizontal 3-step indicator with active/completed/pending states. Each step has a number, label, and connector line. Uses `--sds-interactive-primary` for active/completed, `--sds-text-disabled` for pending. | Critical |
| **Progress Bar** | Execution Progress | Horizontal bar with animated fill. Track uses `--sds-bg-subtle`, fill uses `--sds-interactive-primary`. Supports percentage label and estimated time. | Critical |
| **Warning Banner** | Preview Impact, Rollback Preview | Full-width callout with left color bar (4px), icon, and message text. Variants: warning (yellow), error (red), info (blue). | Critical |
| **Before/After Comparison** | Preview Impact, Rollback Preview, Dry Run Results | Two-column panel with "Before" and "After" headers, showing data transformation. Changed values highlighted. | Critical |
| **Risk Score Gauge** | Preview Impact, Success, Rollback Preview | Numeric score display with color coding based on value (red > 75, yellow 50-75, green < 50). Supports animation for countup/countdown. | High |
| **Status List** | Execution Progress | Vertical list of items with icon, name, status tag, and metadata. Icons transition between queued (circle), executing (spinner), done (check), failed (x). | High |
| **Alert Ribbon** | Approval Review | Persistent top-of-content notification bar. Dismissible. Supports warning and info variants. | High |
| **Data Table** | Multiple screens | Standard sortable, filterable table with row selection, pagination, and inline actions. Headers use `--sds-bg-subtle`, rows use `--sds-border-subtle`. | High |
| **Typed Confirmation Dialog** | Preview Impact (delete), Cancel actions | Modal dialog requiring the user to type a specific string (e.g., table name) to confirm a destructive action. Input must match exactly before the confirm button enables. | Medium |
| **Dependency Tree** | Preview Impact (delete type) | Tree visualization showing parent-child relationships between data objects. Nodes use cards, edges use `--sds-border-default` lines. Affected nodes highlighted with `--sds-status-error-bg`. | Medium |
| **Approval Timeline** | Remediation Detail | Vertical timeline showing approval chain steps. Each step has a dot, label, user, and timestamp. Uses status colors for node dots. | Medium |

---

## Appendix: Cross-Screen Token Summary

### Backgrounds

| Usage | Token |
|-------|-------|
| Page | `var(--sds-bg-page)` |
| Sidebar | `var(--sds-nav-sidebar-bg)` |
| Cards | `var(--sds-bg-card)` |
| Table headers | `var(--sds-bg-subtle)` |
| Surface sections | `var(--sds-bg-surface)` |
| Row hover | `var(--sds-color-warm-gray-050)` |

### Text

| Usage | Token |
|-------|-------|
| Page titles | `var(--sds-text-primary)` / 24px / 600 |
| Section titles | `var(--sds-text-primary)` / 16px / 600 |
| Body text | `var(--sds-text-secondary)` / 14px |
| Table cell text | `var(--sds-text-secondary)` / 13px |
| Table header text | `var(--sds-text-secondary)` / 12px / 600 |
| Help text / timestamps | `var(--sds-text-tertiary)` / 12px |
| Disabled text | `var(--sds-text-disabled)` |
| Links | `var(--sds-text-link)` |

### Borders

| Usage | Token |
|-------|-------|
| Card borders | `var(--sds-border-default)` |
| Table row dividers | `var(--sds-border-subtle)` |
| Input focus | `var(--sds-border-focus)` |
| Strong separators | `var(--sds-border-strong)` |

### Status Colors

| Status | Background | Text | Strong (icons/borders) |
|--------|-----------|------|----------------------|
| Success | `var(--sds-status-success-bg)` | `var(--sds-status-success-text)` | `var(--sds-status-success-strong)` |
| Warning | `var(--sds-status-warning-bg)` | `var(--sds-status-warning-text)` | `var(--sds-status-warning-strong)` |
| Error | `var(--sds-status-error-bg)` | `var(--sds-status-error-text)` | `var(--sds-status-error-strong)` |
| Info | `var(--sds-status-info-bg)` | `var(--sds-status-info-text)` | -- |
| Neutral | `var(--sds-status-neutral-bg)` | `var(--sds-status-neutral-text)` | -- |
| Purple | `var(--sds-status-purple-bg)` | `var(--sds-status-purple-text)` | -- |

### Interactive

| Usage | Token |
|-------|-------|
| Primary action | `var(--sds-interactive-primary)` |
| Primary hover | `var(--sds-interactive-primary-hover)` |
| Primary active | `var(--sds-interactive-primary-active)` |
| Primary subtle (selections, highlights) | `var(--sds-interactive-primary-subtle)` |

### Button Variants Used

| Context | Variant |
|---------|---------|
| Primary actions (Execute, Submit, Approve) | `btn-primary btn-md` |
| Secondary actions (Back, Cancel, Dry Run, Edit) | `btn-secondary btn-md` |
| Tertiary actions (View History, links) | `btn-tertiary btn-md` |
| Destructive actions (Delete, Reject, Confirm Rollback) | `btn-danger btn-md` |
| Warning destructive (Preview Rollback, Cancel Remediation) | `btn-danger-outline btn-md` |
| Success celebration CTA | `btn-primary btn-lg` |
| Table inline actions | `btn-tertiary btn-sm` |

### Tag Variants Used

| Status | Tag Variant | Dot? |
|--------|-------------|------|
| Applied/Succeeded | `.sds-tag--success` | Optional |
| Scheduled/Queued/Cancelled | `.sds-tag--neutral` | No |
| Pending Approval/Urgent | `.sds-tag--warning` | Yes for urgent |
| Failed/Error | `.sds-tag--error` | Yes |
| Under Review/In Progress/Rolled Back | `.sds-tag--info` | Optional |
| Executing (live) | `.sds-tag--info` | With spinner instead of dot |
| Protection Applied | `.sds-tag--purple` | Optional |
| Sensitivity: Critical | `.sds-tag--error` | No |
| Sensitivity: High | `.sds-tag--warning` | No |
| Sensitivity: Medium | `.sds-tag--info` | No |
| Sensitivity: Low | `.sds-tag--neutral` | No |
