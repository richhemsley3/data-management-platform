# Design Critique v4: Beacon Data Security Platform Prototype

**Stage**: High-fidelity clickable prototype (implementation)
**Date**: 2026-03-14
**Evaluator**: Design critique skill (deep critique, fourth pass)
**Design System**: Software DS
**Research Reference**: UX Flows v3 (7 flows, 52 screens, 3 personas)
**Previous Critiques**: v1 (token compliance, alert stacking), v2 (interaction dead ends, cross-screen patterns, content), v3 (built-but-not-wired patterns, event delegation, mock data dates)
**Scope**: Exclusively NEW findings not identified in v1, v2, or v3

---

## Overall Scorecard

| Dimension | v3 Score | v4 Score | Delta | Summary |
|-----------|----------|----------|-------|---------|
| Visual Hierarchy | 3.5/5 | 3.5/5 | -- | No regression. The governance view stat grid reduction (from 4 to 3 cards, removing "Snoozed Risks") is a net positive. Operations view still has a hardcoded "Total Access Grants: 1,234" stat that shares the same fabricated-data problem. |
| Clarity | 3/5 | 3/5 | -- | v3 fixes landed (toggle label corrected to "Operations", report generation success banner added). New clarity issues identified: schedule modal shows hardcoded 2024 dates, settings tabs render placeholder text, approval route pattern has a typo. |
| Consistency | 3/5 | 3/5 | -- | Policy delete confirmation was implemented with its own bespoke pattern (name-match input) rather than using `Components.confirmModal()`. Connection detail still has no delete handler. Two confirmation UIs now exist for the same concept. |
| Density | 3.5/5 | 3.5/5 | -- | Appropriate overall. The onboarding flow is well-paced. Some detail screens (regulation detail, connection detail) pack a lot of info but use progressive disclosure well. |
| Interaction Design | 3/5 | 3.5/5 | +0.5 | Several v3 issues were fixed: execution progress auto-navigates correctly, report generation shows success feedback, search pre-population is first-open only. Remaining gaps are more nuanced (form validation absent, no undo patterns, orphaned listeners in flow2). |
| Emotional Quality | 4/5 | 4/5 | -- | Remains strong. The onboarding celebration, success screens, and coach marks are polished. The educational scan progress screen is a highlight. |

**Overall: 3.4/5** (up from 3.3 in v3, reflecting fixes to execution progress and report generation feedback, offset by newly identified consistency and content issues)

---

## What v3 Fixes Landed Successfully

### 1. "Snoozed Risks" stat card removed from Governance view
The governance view now renders a 3-column stat grid with only computed values (Regulation Gaps, Unclassified Columns, Review Queue). v3 Issue 4 is resolved.

### 2. Toggle label corrected to "Operations"
The dashboard persona toggle now renders "Operations" (not "Technical"), matching the function name `renderOperationsView()` and the research terminology. v3 Issue 1 is resolved.

### 3. Execution progress auto-navigates to success
The `renderExecutionProgress()` function now calls `setTimeout(function() { Router.navigate('#/remediation/success'); }, 5000)` directly, without relying on a broken DOM selector. A "View Results" button is also present as a manual fallback. v3 Issue 5 is resolved.

### 4. Report generation shows success feedback
Both `openGenerateModal()` and `openScheduleModal()` now insert a success banner after closing the modal. v3 Issue 2 is resolved.

### 5. Universal search pre-population is first-open only
A `searchHasOpened` flag ensures the "snow" pre-population only fires on the first Cmd+K press. v3 Issue 10 is resolved.

### 6. Onboarding interval cleanup on route change
`State.subscribe('currentRoute', function() { clearScanInterval(); })` is now called at module level. v3 Issue 9 is resolved.

### 7. Mock data dates are now computed relative to today
The `normalizeDates()` IIFE at the bottom of `data.js` shifts all 2024-era dates forward by the offset between `2024-03-14` and the current date. `timeAgo()` now produces meaningful relative timestamps. v3 Issue 11 is resolved.

### 8. Policy delete button is now wired to a confirmation modal
`showPolicyDeleteConfirmation()` renders a custom type-to-confirm modal with input validation. v3 Issue 8 is partially resolved (see Issue 2 below for the consistency concern).

### 9. Confirm modal input validation is now wired globally
`app.js` lines 242-256 add a global `input` event listener for `[data-confirm-input]` that enables/disables `[data-confirm-action]`. v3 Issue 7 is resolved.

### 10. Table row focus-visible indicator added
`components.css` line 1352 adds `tr[data-navigate]:focus-visible` with a 2px solid outline. v3 Accessibility Gap 1 is resolved.

### 11. Toggle tabs now update `aria-selected` on interaction
`setupTabHandlers()` in `app.js` lines 277-284 now sets `aria-selected` on toggle tab clicks. v3 Accessibility Gap 2 is resolved.

---

## NEW Areas for Improvement

### Issue 1: Operations view contains hardcoded stat cards with fabricated data

**Severity**: Minor
**File**: `js/flow3-risk.js`, lines ~410-415
**What I see**: The Operations view renders four stat cards. Two of them use computed data ("Connection Health" and "Scan Freshness"). The other two are entirely hardcoded: "Total Access Grants: 1,234" with subtitle "142 with broad access" and "Anomalies (7 days): 8" with subtitle "8 unusual access patterns." There is no access grants or anomaly data anywhere in `data.js`.
**Why it matters**: This is the same category of problem that v3 Issue 4 identified for "Snoozed Risks" in the Governance view. That card was removed, but these two cards in the Operations view were not. They promise features (access monitoring, anomaly detection) that do not exist in the prototype. If a stakeholder asks about the anomaly detection feature, there is nothing to show.
**Suggestion**: Either (a) remove these two cards and reduce to a 2-column grid with only the computed stats, or (b) add mock `accessGrants` and `anomalies` arrays to `Data` so the numbers are at least derived from browsable data. Option (a) is consistent with the v3 fix for the Governance view.

---

### Issue 2: Policy delete uses a bespoke confirmation pattern instead of `Components.confirmModal()`

**Severity**: Minor
**File**: `js/flow5-policies.js`, lines ~1035-1065
**What I see**: The `showPolicyDeleteConfirmation()` function builds its own confirmation modal from scratch using `Components.modal()`, `Components.formGroup()`, and `Components.formInput()`. It wires its own `addEventListener('input', ...)` and `addEventListener('click', ...)` handlers. Meanwhile, `Components.confirmModal()` exists as a reusable component with the same type-to-confirm pattern, and `app.js` has a global `input` listener for `[data-confirm-input]` that does the same enable/disable logic.

The two implementations differ:
- `confirmModal()` uses `data-confirm-input` as the attribute and matches against `placeholder`. The global listener in `app.js` handles enabling/disabling.
- `showPolicyDeleteConfirmation()` uses `input[name="confirm-policy-name"]` and wires its own local listener that matches against `policy.name`. It does not use the global listener pattern.

**Why it matters**: There are now two confirmation UIs for the same interaction. If the design of the confirmation pattern changes (e.g., adding a warning icon, changing the button label from "Delete" to "Permanently Delete"), it must be updated in two places. New screens that need confirmation will face a choice between two patterns with no clear winner.
**Suggestion**: Refactor `showPolicyDeleteConfirmation()` to use `Components.confirmModal()`. Pass `policy.name` as the `confirmText` parameter. The global listener in `app.js` will handle the enable/disable logic. Add a `data-confirm-action` click handler in the overlay that performs the deletion. This eliminates the duplicate implementation.

---

### Issue 3: Connection detail page has no delete button or action at all

**Severity**: Major
**File**: `js/flow1-connections.js`
**What I see**: The Connection Detail page renders an "Edit" button and a "Run Scan" button in the page header, but there is no "Delete" button. Searching for `delete-connection`, `confirmModal`, or any delete-related handler in `flow1-connections.js` returns no results. The v3 report (Issue 8) noted that the Policy Detail delete was not wired. It was subsequently fixed. However, the Connection Detail page was never even given a delete affordance.

In a data security platform, removing a stale or misconfigured connection (like the PostgreSQL Staging connection that has been erroring for 58 days) is a fundamental operation. Users cannot currently remove it from the UI.
**Why it matters**: The alert ribbon says "PostgreSQL Staging connection has been unreachable for 58 days" and links to the connection detail. When the user arrives, there is no way to delete the broken connection. The flow has no resolution path.
**Suggestion**: Add a "Delete" button (`btn-danger-outline`, `data-action="delete-connection"`) to the Connection Detail page header. Wire it to `Components.confirmModal()` with the connection name as the confirmation text. This gives Jordan a way to clean up failed connections.

---

### Issue 4: Schedule report modal shows hardcoded 2024 dates that were not shifted by `normalizeDates()`

**Severity**: Minor
**File**: `js/flow6-monitoring.js`, lines ~301-307
**What I see**: The "Next 3 scheduled dates" preview in the schedule report modal displays hardcoded strings: "Monday, March 18, 2024 at 9:00 AM", "Monday, March 25, 2024", and "Monday, April 1, 2024". Unlike the data arrays in `data.js`, these are inline HTML strings that were not processed by the `normalizeDates()` IIFE. They still show 2024 dates.
**Why it matters**: The v3 fix (Issue 11) shifted all mock data dates to be relative to today, making timestamps appear current. But these inline dates in the schedule modal were missed. A user opening the schedule modal sees dates from two years ago, breaking the illusion of a live product.
**Suggestion**: Compute the next three schedule dates dynamically based on `new Date()`. For the weekly schedule, find the next Monday after today and format three successive weeks. This eliminates the hardcoded dates and makes the preview accurate regardless of when the demo is shown.

---

### Issue 5: Generate report modal date inputs contain hardcoded 2024 date values

**Severity**: Minor
**File**: `js/flow6-monitoring.js`, lines ~199-201
**What I see**: The "Date Range" inputs in the generate report modal are pre-filled with `value="2024-02-01"` and `value="2024-03-14"`. These values were not shifted by `normalizeDates()` because they are inline HTML attributes, not data model fields.
**Why it matters**: Same issue as Issue 4. A user opening the generate report modal sees a date range ending in March 2024. The date normalization fix was thorough for data model fields but missed hardcoded values in modal HTML.
**Suggestion**: Compute default date range values dynamically: `date-to` should be today's date formatted as `YYYY-MM-DD`, and `date-from` should be 30 or 42 days earlier. Use a helper function to format the date for the `value` attribute.

---

### Issue 6: The remediation approval route has a typo that prevents the detail view from loading

**Severity**: Major
**File**: `js/flow4-remediation.js`, line ~1367
**What I see**: The route registration for approval review is:
```
Router.register('/remediation/approval:id', renderApprovalReview);
```
This is missing the `/` before `:id`. The pattern should be `/remediation/approval/:id`. Without the slash, the router's regex will look for a URL like `#/remediation/approvalappr-r1` (no separator between "approval" and the ID), which will never match the actual navigation target `#/remediation/approval/appr-r1` generated by the approval table's `onRowClick`.

Similarly, `Router.register('/remediation:id/rollback', renderRollbackPreview)` is missing a `/` before `:id`.
**Why it matters**: Clicking any row in the Approvals tab navigates to `#/remediation/approval/appr-r1`, which does not match the registered route. The router falls through to `_showComingSoon()`, displaying "Screen coming soon" instead of the approval review screen. This makes the entire approval review flow inaccessible.
**Suggestion**: Fix the route registrations:
- Change `/remediation/approval:id` to `/remediation/approval/:id`
- Change `/remediation:id/rollback` to `/remediation/:id/rollback`

---

### Issue 7: Flow 2 (scanning) uses `addEventListener` extensively without cleanup, causing listener accumulation

**Severity**: Major
**File**: `js/flow2-scanning.js`
**What I see**: The v3 report (Issue 6) identified the `addEventListener` pattern as risky in `flow2-scanning.js`. Examining the file in detail, the problem is extensive. At least seven different `addEventListener` calls are made across the file:
1. Scan list search input (line ~113)
2. Cancel scan button (line ~242)
3. Review tab buttons (line ~377)
4. Bulk accept button (line ~387)
5. Threshold slider (line ~411)
6. Document-level expand handler (line ~422)
7. Catalog search input (line ~1037)
8. Catalog detail tab buttons (line ~1153)

Items 3, 4, 6, 7, and 8 are particularly problematic because they attach listeners to existing DOM elements or `document` every time the screen renders. If a user navigates to the Review Queue, then away, then back, two identical listeners fire on every click. After five visits, five listeners fire.

The document-level expand handler (item 6) is the worst case. It uses `document.addEventListener('click', function handleExpand(e) {...})` with a named function but no corresponding `removeEventListener`. Each render adds another copy.
**Why it matters**: This is not just a theoretical concern. In a demo scenario where a presenter navigates back and forth between screens, listener accumulation causes visible symptoms: duplicate UI updates, console errors from references to removed DOM elements, and progressively slower interaction response.
**Suggestion**: Replace all `addEventListener` calls in `flow2-scanning.js` with the `content.onclick` assignment pattern used in other flows. For the document-level handler (item 6), store the function reference and call `document.removeEventListener` before adding a new one, or move the logic into the `content.onclick` handler using event delegation on `[data-expand-row]`.

---

### Issue 8: Three of four Settings tabs display placeholder "coming soon" text with no content

**Severity**: Minor
**File**: `js/flow6-monitoring.js`, lines ~704-708
**What I see**: The Settings page has four tabs: General, Notifications, Integrations, and Team. Only the General tab renders actual content. The other three display identical placeholder text: "[Tab] settings coming soon." with centered tertiary-color text. There is no indication of what these tabs will contain, no disabled state, and no empty state component usage.
**Why it matters**: The `Components.emptyState()` function exists specifically for this situation. Using a plain text string instead of the structured empty state component is inconsistent with how other screens handle missing content (e.g., the remediation history empty state uses `Components.emptyState()` with an icon, title, and description). More importantly, three out of four tabs being empty makes the settings page feel underbaked for a prototype that otherwise has deep screen coverage.
**Suggestion**: Either (a) use `Components.emptyState()` with descriptive text for each tab (e.g., "Configure email notifications for scan completions, policy violations, and approval requests" for the Notifications tab), or (b) disable the three incomplete tabs with `is-disabled` class and a tooltip. Option (a) is better for stakeholder discussions because it communicates intent.

---

### Issue 9: No form validation feedback on any wizard or form across the entire prototype

**Severity**: Major
**File**: Multiple flow files
**What I see**: No form in the prototype implements validation feedback. Specific examples:
1. **Add Connection wizard** (flow1): The user can click "Test Connection" with all fields empty. The button changes to "Testing..." and then navigates to the next step regardless of input.
2. **Create Policy wizard** (flow5): Step 1 (Policy Basics) has required fields (Name, Description) but no validation. Clicking "Next" advances regardless.
3. **Onboarding connection form** (flow7): Same pattern -- "Test Connection" proceeds with empty fields.
4. **Schedule Report modal** (flow6): The "Report Name" field accepts empty input; "Save Schedule" works with no name.
5. **Settings page** (flow6): "Save Changes" provides a success checkmark even if no changes were made.

None of these forms show inline error messages, red borders on invalid fields, or disabled submit buttons when required fields are empty.
**Why it matters**: Form validation is a critical trust signal in a security product. If a user accidentally submits a connection form with the wrong credentials, seeing "Testing..." followed by "Connected!" with no actual validation undermines confidence in the system. The prototype teaches stakeholders that forms do not validate, which sets incorrect expectations for development.
**Suggestion**: Implement lightweight client-side validation for the highest-visibility forms: Add Connection and Create Policy Step 1. Check that required fields are non-empty before allowing the CTA to proceed. Show inline error messages using `form-help` styled in error color (`var(--sds-status-error-text)`). Add `border-color: var(--sds-status-error-strong)` to invalid inputs. Even static prototype validation (checking for empty strings) demonstrates the pattern.

---

### Issue 10: The report date column in the Generated tab is not shifted by `normalizeDates()`

**Severity**: Minor
**File**: `js/flow6-monitoring.js`, lines ~11-15
**What I see**: The `reports` array inside the flow6 IIFE contains hardcoded dates: `'2024-03-13T09:00:00Z'`, `'2024-03-10T14:00:00Z'`, etc. The `normalizeDates()` function in `data.js` only shifts arrays on the `Data` global object (`Data.connections`, `Data.scans`, etc.). It does not touch the `reports` array because it is a local variable inside `flow6-monitoring.js`, not a property of `Data`.

The `schedules` array has the same issue: its `nextRun` dates are hardcoded 2024 values.
**Why it matters**: The Generated tab shows report dates like "Mar 13, 2024" while the rest of the app shows dates relative to today. The inconsistency is jarring when the dashboard activity feed shows "2h ago" but the reports page shows dates from two years ago.
**Suggestion**: Either (a) move `reports` and `schedules` to `Data` and add them to the `normalizeDates()` shift arrays, or (b) apply the same date-shifting logic locally within the flow6 IIFE at initialization. Option (a) is cleaner and consistent with how all other mock data is managed.

---

### Issue 11: The `data-navigate` pattern on approval table rows generates URLs that cannot be resolved

**Severity**: Major
**File**: `js/flow4-remediation.js`, lines ~295-298
**What I see**: The approvals table uses `onRowClick: function(row) { return '#/remediation/approval/' + row.id; }`. This generates URLs like `#/remediation/approval/appr-r1`. However, the route is registered as `/remediation/approval:id` (see Issue 6). Even after fixing Issue 6 to `/remediation/approval/:id`, the IDs used in the approvals tab (`appr-r1`, `appr-r2`, `appr-r3`) come from the local `approvalRows` array, not from `Data.approvals`. The `renderApprovalReview()` function likely looks up the approval by `params.id` against a different data set.

Similarly, the history table generates URLs like `#/remediation/rem-h1`, but these IDs (`rem-h1`, `rem-h2`, etc.) come from the local `historyRows` array and do not match the IDs in `Data.remediations` (`rem-1`, `rem-2`, etc.).
**Why it matters**: Even after fixing the route typo (Issue 6), clicking a row in the History or Approvals tab may navigate to a detail view that cannot find the matching record, resulting in either a broken screen or showing data for the wrong item.
**Suggestion**: Align the IDs in `historyRows` and `approvalRows` with those in `Data.remediations` and `Data.approvals`, or have the detail view functions look up records from both local and global arrays. The simplest fix is to derive `historyRows` and `approvalRows` from `Data` arrays instead of maintaining separate local copies with different IDs.

---

### Issue 12: The header profile button and help button have no click handlers and do nothing

**Severity**: Minor
**File**: `index.html`, lines ~25-33; `js/app.js`
**What I see**: The header contains a "?" help button and a profile dropdown button (showing "JC" avatar and "Jordan Chen"). Neither element has a click handler, a `data-navigate` attribute, or any JavaScript behavior. Clicking the help button does nothing. Clicking the profile button does nothing. There is no dropdown menu, no popover, and no route navigation.
**Why it matters**: These are persistent chrome elements visible on every screen. A non-functional profile dropdown is particularly noticeable because the avatar and username suggest interactivity. In a demo, a presenter or stakeholder clicking the profile button and getting no response creates an awkward moment.
**Suggestion**: Add simple click handlers that either (a) open a small dropdown menu with static options (Profile, Preferences, Log out) for the profile button and a help panel or link for the help button, or (b) navigate to the Settings page when the profile is clicked and show a tooltip "Help documentation coming soon" for the help button. Even a simple overlay or drawer is sufficient for a prototype.

---

### Issue 13: Onboarding flow does not handle "back" browser navigation gracefully

**Severity**: Minor
**File**: `js/flow7-onboarding.js`
**What I see**: The onboarding flow hides the sidebar and header on the Welcome screen (`sidebar.style.display = 'none'`, `header.style.display = 'none'`). The router's `_handleRoute()` restores these elements at the top of every route change. However, if a user is on the Onboarding Dashboard (screen 2, where the shell is visible) and presses the browser back button, they return to the Welcome screen, which re-hides the shell. This is correct.

But if the user then presses the browser forward button or navigates directly to `#/dashboard`, the router's shell-restoration logic at lines 78-81 checks `sidebar.style.display === 'none'` and restores it. This works. However, the alert ribbon state is not restored -- `alertRibbon.setAttribute('hidden', '')` is called on the Welcome screen, and nothing in `_handleRoute()` or `setupAlertRibbon()` re-shows it after the onboarding flow.
**Why it matters**: After completing or skipping onboarding, the alert ribbon (which warns about the PostgreSQL staging connection) is permanently hidden for the rest of the session. The user misses the critical alert about the 58-day-old connection failure.
**Suggestion**: In `_handleRoute()`, after restoring the sidebar and header, also check if the alert ribbon should be visible: `if (alertRibbon && alertRibbon.hasAttribute('hidden') && Data.alerts && Data.alerts.length > 0) { showAlert(ribbon, 0); }`. This ensures the ribbon reappears when navigating out of onboarding.

---

### Issue 14: The `CONFETTI_COLORS` array in flow7-onboarding.js uses hardcoded hex values that do not match the comment annotations

**Severity**: Minor
**File**: `js/flow7-onboarding.js`, lines ~22-27
**What I see**: The confetti colors are defined as:
```
'#77B2C7', /* --sds-color-blue-300 */
'#98B43B', /* --sds-color-green-500 */  <-- comment says green-500 but actual token value is #62800B
'#EBCE2D', /* --sds-color-yellow-500 */ <-- comment says yellow-500 but actual token value is #8A7515
'#A6CBD6', /* --sds-color-blue-200 */
'#C0EAF2'  /* --sds-color-blue-100 */   <-- comment says blue-100 but actual token value is #D9EBED
```
The hex values do not match the token values defined in `tokens.css`. For example, `--sds-color-green-500` is `#62800B` (a dark olive) but the confetti uses `#98B43B` (which is actually `--sds-color-green-300`). The comment annotations are wrong.
**Why it matters**: This is a minor accuracy issue. The confetti colors themselves look fine visually, but the comments mislead anyone trying to maintain token consistency. If a dark mode pass updates the token values, these hardcoded colors will remain unchanged.
**Suggestion**: Either (a) correct the comment annotations to match the actual token stops being used, or (b) use the `ChartColors` constant approach from `charts.js` to centralize color references and document the correct mappings.

---

## Regressions from v3 Fixes

### 1. Policy delete confirmation exists but uses a different pattern than `Components.confirmModal()`
v3 Issue 8 recommended wiring delete buttons to `Components.confirmModal()`. The fix built a custom confirmation modal in `showPolicyDeleteConfirmation()` instead of using the reusable component. The `Components.confirmModal()` component and its global `[data-confirm-input]` listener in `app.js` now exist alongside the bespoke implementation, creating two parallel confirmation patterns. This is not a functional regression (the feature works) but a consistency regression.

### 2. Connection Detail still has no delete action
v3 Issue 8 mentioned Connection Detail alongside Policy Detail as needing delete confirmation. Policy Detail was fixed, but Connection Detail was not addressed at all -- it does not even have a delete button in the UI.

---

## Accessibility Gaps (New Findings)

### 1. Drawer and modal focus trapping is still not implemented
v3 identified this gap and it remains unaddressed. When a modal or drawer opens, focus is not trapped within the overlay. Tab key moves focus to elements behind the overlay. This is a WCAG 2.4.3 (Focus Order) violation.

### 2. Search overlay results lack `aria-activedescendant` for keyboard navigation
The universal search implements keyboard navigation (arrow keys move highlight, Enter selects). However, the search input does not use `aria-activedescendant` to announce which result is currently highlighted. Screen reader users cannot determine which result will be selected when they press Enter. The `role="listbox"` and `role="option"` attributes are present, but the active descendant link is missing.

### 3. Inline `onclick` attribute used in success banner HTML
The report generation success banner (flow6, line ~227) uses `onclick="this.parentElement.remove()"` as an inline attribute for the dismiss button. This is (a) not the delegated event pattern used elsewhere in the prototype, (b) would fail in a Content Security Policy environment, and (c) is invisible to assistive technology because there is no `aria-label` on the dismiss button for the success banner.

### 4. Radio button groups in modals lack `fieldset` and `legend`
The Generate Report and Schedule Report modals use radio button groups for "Format" (PDF/CSV) and "Frequency" (Daily/Weekly/Monthly). These are rendered as bare `<label>` + `<input type="radio">` elements without a wrapping `<fieldset>` or `<legend>`. Screen readers cannot determine the group label for these radio sets, making them ambiguous.

### 5. Color-only differentiation in heatmap cells
The heatmap in the Operations view uses background colors (success-bg, warning-bg, error-bg, bg-subtle) to communicate data freshness levels. Cells with values display the number, but cells with value 0 display nothing. Users with color vision deficiency may not distinguish the "none" cells from the "low" cells without text or icon differentiation.

---

## Content Quality Issues (New Findings)

### 1. Report names reference "March 2024" and "Feb 2024" as hardcoded strings
The `reports` array contains names like "Executive Summary -- March 2024" and "Risk Trend -- Feb 2024". Even if dates are shifted by `normalizeDates()`, the report names themselves are static strings that will always say 2024. A report generated "today" would still be labeled "March 2024."

### 2. The onboarding flow claims "See your data risk score in 30 minutes" but the guided experience takes 5 steps with estimated times totaling ~14-24 minutes
The welcome screen headline says "30 minutes" but the step cards show estimated times of ~3-8m, ~5m, ~3m, ~1m, and ~2m, totaling 14-19 minutes at the low end. The 30-minute claim is either padded (which undersells the product) or inaccurate.

### 3. The regulation detail "Last assessed" dates may not shift correctly for regulations with only `lastAssessed` field
The `normalizeDates()` function shifts `Data.regulations` arrays but does not include `lastAssessed` in its field list. Regulation assessment dates may still show 2024 values.

---

## Quick Wins (Prioritized)

1. **Fix the approval route typo.** Change `/remediation/approval:id` to `/remediation/approval/:id` and `/remediation:id/rollback` to `/remediation/:id/rollback`. Two string edits. (Fixes Issue 6)

2. **Add a delete button to Connection Detail.** Render a "Delete" button in the page header and wire it to `Components.confirmModal()`. Copy the pattern from Policy Detail. (Fixes Issue 3)

3. **Compute schedule modal dates dynamically.** Replace the hardcoded "March 18, 2024" strings with dates calculated from `new Date()`. Ten lines of code. (Fixes Issue 4)

4. **Compute generate modal date range dynamically.** Set `date-to` to today and `date-from` to 30 days ago. Two lines. (Fixes Issue 5)

5. **Move `reports` and `schedules` arrays to `Data` and shift their dates.** Add them to the `normalizeDates()` processing. Also update report name strings to use dynamic month/year. (Fixes Issue 10, Content Issue 1)

6. **Refactor `showPolicyDeleteConfirmation()` to use `Components.confirmModal()`.** Eliminate the duplicate confirmation pattern. (Fixes Issue 2)

7. **Convert flow2 `addEventListener` calls to `content.onclick` assignment.** Replace at least the five most problematic listeners. (Fixes Issue 7)

8. **Add `fieldset`/`legend` to radio groups in modals.** Wrap radio groups in semantic HTML. (Fixes Accessibility Gap 4)

---

## Summary of Issue Severity

| Severity | Count | Issues |
|----------|-------|--------|
| Critical | 0 | -- |
| Major | 4 | Issues 3, 6, 7, 9, 11 |
| Minor | 9 | Issues 1, 2, 4, 5, 8, 10, 12, 13, 14 |

The prototype has continued to improve. The v3 fixes addressed several of the most visible problems (execution dead end, report generation silence, mock data dates, search pre-population). The remaining issues fall into three categories:

1. **Missed edges of v3 fixes**: The date normalization fix was thorough for `Data` properties but missed local arrays (`reports`, `schedules`) and inline HTML strings (modal date inputs, schedule previews, report names). These are straightforward to fix with the same pattern.

2. **Route registration typos**: Two routes have missing slashes that make the approval review and rollback screens unreachable. These are trivial fixes with high impact.

3. **Structural consistency debt**: Two confirmation patterns exist for the same interaction. Flow 2 still uses `addEventListener` extensively. Form validation is absent across all flows. These are systemic issues that compound as the prototype grows.

The highest-priority cluster for the next iteration is the route typos (Issue 6) and the ID mismatches (Issue 11), which together make the remediation approval flow non-functional.

---

*Fourth-pass critique based on complete code analysis of 18 source files (index.html, 4 CSS files, 13 JS files), evaluated against UX Flows v3 research, Software DS design system tokens, and the v3 critique report. Focused exclusively on issues not identified in v1, v2, or v3 critiques.*
