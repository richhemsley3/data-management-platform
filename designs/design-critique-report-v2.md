# Design Critique v2: Beacon Data Security Platform Prototype

**Stage**: High-fidelity clickable prototype (implementation)
**Date**: 2026-03-14
**Evaluator**: Design critique skill (deep critique, second pass)
**Design System**: Software DS
**Research Reference**: UX Flows v3 (7 flows, 52 screens, 3 personas)
**Previous Critique**: v1 (same date) -- this report focuses exclusively on NEW findings

---

## Overall Scorecard

| Dimension | Score | Summary |
|-----------|-------|---------|
| Visual Hierarchy | 3.5/5 | Dashboard gauge is strong, but secondary screens (Settings, Reports Scheduled tab, Catalog) have flat hierarchy with no clear focal point. Wizard flows bury primary CTAs. |
| Clarity | 3.5/5 | Many labels are well-chosen, but several screens have ambiguous actions, unlabelled icon buttons, and tab content that does not actually change when clicked. |
| Consistency | 3.5/5 | Component library is solid, but cross-screen inconsistencies in breadcrumb usage, action button placement, and tab behavior create friction. |
| Density & Breathing Room | 3.5/5 | Good on dashboard and onboarding. Connection Detail and Remediation Configure screens are too dense. Settings page is too sparse. |
| Interaction Design | 3/5 | Several critical interaction gaps: tabs that do not render different content, wizard steps that cannot be navigated non-linearly, destructive actions without confirmation, missing feedback after CTA clicks. |
| Emotional Quality | 4/5 | Professional and warm. Onboarding celebration moments are well done. The overall aesthetic is trustworthy. |

**Overall: 3.5/5**

This prototype has improved since the first critique (v1 found token compliance and alert stacking issues, both now addressed). This second pass surfaces a different class of problems: interaction dead ends, cross-screen inconsistency patterns, information architecture gaps, and copy/content issues that would confuse real users.

---

## What's Working Well

### 1. Alert ribbon now cycles with "1 of N" indicator
The `showAlert()` function in app.js properly implements alert navigation with prev/next buttons and a count indicator. This directly addresses the v1 critique and works well.

### 2. Filter pills and no-results states added
The `Components.filterPills()` and `Components.noResults()` functions are now part of the component library. The CSS for `.filter-pill` uses the correct interactive-primary-subtle token for background. The `.no-results` component provides a friendly fallback for empty filtered views.

### 3. Skeleton loading components defined
The `Components.skeleton()` function and corresponding CSS (`.skeleton-card`, `.skeleton-line`, `.skeleton-chart`) implement shimmer loading states with proper token usage. The animation uses `skeleton-shimmer` keyframes.

### 4. Clickable cards get pointer cursor
The CSS rule `.sds-card[data-navigate], .sds-card[onclick] { cursor: pointer; }` with hover state is now in components.css, fixing the discoverability issue from v1.

---

## NEW Areas for Improvement

### Issue 1: Tabs across multiple screens do not actually switch content

**What I see**: The generic `setupTabHandlers()` in app.js only manages CSS class toggling (adding/removing the `active` class on tab buttons). It does not trigger content re-rendering. Several screens implement their own tab click handlers that DO re-render (Reports, Settings, Review Queue, Connection Detail), but others rely solely on the generic handler, meaning clicking tabs changes the visual active state but shows the same content underneath.

Specifically affected:
- **Remediation History**: The "History" and "Approvals" tabs both use `data-tab` attributes, and the flow4-remediation.js `renderRemediationHistory()` function renders tab-specific content. However, the generic tab handler in app.js also fires and can interfere with the flow-specific handler since both listen for `.sds-tab` clicks.
- **Policy Detail**: Tabs (Overview, Applied Data, Versions, Activity Log) toggle visually but the content rendering depends on the flow-specific handler. If the user clicks a tab before the flow handler attaches, nothing happens.

**Why it matters**: Non-functional tabs are one of the fastest ways to erode user trust in a prototype. A user who clicks "Approvals" and sees the same History table will assume the feature is broken or missing.

**Suggestion**: Each screen that uses tabs should render tab-specific content in its own click handler, using `State.set()` to persist the active tab and calling its render function. The generic `setupTabHandlers()` in app.js should be limited to visual state management or removed entirely in favor of per-screen handlers that own both visual and content updates.

---

### Issue 2: Breadcrumb usage is inconsistent across detail and sub-pages

**What I see**: Breadcrumbs appear on some sub-pages but not others:
- Connection Detail (`/connections/conn-1`): Has breadcrumb ("Connections / Snowflake Production")
- Add Connection wizard (`/connections/add`): Has breadcrumb ("Connections / Add Connection")
- Policy wizard (`/policies/create`): Has breadcrumb ("Policies / Create Policy")
- Policy wizard review step (`/policies/create/review`): Has breadcrumb
- Remediation Configure (`/remediation/configure`): Has breadcrumb ("Remediation / Configure")
- **Settings page** (`/settings`): NO breadcrumb -- but it is a top-level page, so this is acceptable
- **Regulation Detail** (`/regulations/:id`): Has breadcrumb
- **Catalog Table Detail** (`/catalog/:id`): Has breadcrumb

However, the breadcrumb behavior when navigating BETWEEN sub-pages is not always correct. For example, navigating from Risk Detail to Remediation Configure loses the Risk Detail context in the breadcrumb -- the breadcrumb shows "Remediation / Configure" with no indication of where the user came from.

**Why it matters**: The UX research emphasizes context preservation across flows. When Priya navigates from Risk Detail to Remediation, she needs to know how to get back. The breadcrumb should reflect the user's navigation path, not just the destination's static hierarchy.

**Suggestion**: For cross-flow navigation (Risk > Remediation, Review Queue > Remediation, Dashboard > Risk Detail), prepend the source context to the breadcrumb: "Dashboard / Risk Detail / Remediate" or "Review Queue / Remediate Column." This can be implemented by passing a `from` parameter in the route hash or storing the navigation origin in State.

---

### Issue 3: Settings page has three placeholder tabs with no content

**What I see**: The Settings page (`/settings`) renders four tabs: General, Notifications, Integrations, Team. Only the General tab has content. The other three display a centered text string: "Notifications settings coming soon." / "Integrations settings coming soon." / "Team settings coming soon."

**Why it matters**: In a high-fidelity prototype that is otherwise fully built out, placeholder tabs feel jarring. These are not obscure features -- Notifications and Team are fundamental settings that Priya and Marcus would expect to configure. The "coming soon" pattern is acceptable in a beta product but feels lazy in a prototype that renders 52 screens worth of other content. It undermines the sense of completeness.

**Suggestion**: Either:
1. Remove the placeholder tabs entirely and only show "General" (simpler, honest)
2. Add minimal representative content for each tab -- even static mockup content showing what the settings WOULD look like. For Notifications: toggle rows for email/in-app/slack per event type. For Team: a simple member list table with role badges. For Integrations: a card grid of supported integrations (Jira, Slack, PagerDuty) with connect/disconnect toggle.

Option 2 is preferred since it demonstrates the product's scope to stakeholders reviewing the prototype.

---

### Issue 4: The "What Changed" summary on the dashboard lacks visual hierarchy within its items

**What I see**: The `whatChanged` array in flow3-risk.js renders a list of delta items, each showing a +/- value, a description, and a clickable link. These items are rendered with similar visual weight -- all use the same font size and weight pattern. The deltas are color-coded (green for negative/good, red for positive/bad), but the descriptions are uniformly styled.

**Why it matters**: Marcus scans this section to understand risk drivers. When 5+ items appear, they blend together. The most impactful changes (e.g., "+4 from stale scan on Snowflake Prod") should visually stand out from smaller ones (e.g., "-1 from 2 columns tokenized"). The research says the "What Changed" section should make risk drivers immediately scannable.

**Suggestion**: Sort items by absolute impact magnitude (highest first -- already done) AND vary the visual weight: items with |delta| >= 3 get `font-weight: 600` and a larger delta badge. Items with |delta| == 1 get `font-weight: 400` and subdued text. This creates a natural reading order from most to least impactful.

---

### Issue 5: Wizard flows are strictly linear -- users cannot jump between completed steps

**What I see**: The `Components.wizardSteps()` function renders step indicators that show completed/active/pending states, but the step numbers and labels are not clickable. In the Add Connection wizard, Create Policy wizard, and Remediation Configure wizard, users must use "Back" and "Next" buttons to navigate between steps. There is no way to click on a completed step indicator to jump back to it.

**Why it matters**: The UX research describes the policy wizard as a 3-step process (Basics + Classifications, Token Configuration, Scope + Review). Priya may want to jump from Step 3 (Review) back to Step 1 (Basics) to change the regulation selection after seeing the impact preview. Forcing her through Back > Back is unnecessary friction. Every major SaaS product (Stripe, AWS, Salesforce) allows clicking completed wizard steps.

**Suggestion**: Make completed wizard step indicators clickable by adding `data-navigate` or `data-wizard-step` attributes. When a completed step is clicked, navigate to that step while preserving all form state. The current step's data should be saved to State before navigating. Pending (future) steps should remain non-clickable.

---

### Issue 6: Connection Detail Overview tab renders a flat list of metrics without visual grouping

**What I see**: The Connection Detail Overview tab (flow1-connections.js) renders status, latency, tables, schemas, last scan, and coverage as individual metrics in a grid layout. Below that, it renders scan history as a table. These sections flow into each other without clear visual separation -- there is no card boundary or section header between the stat metrics and the scan history table.

The v1 critique noted this but focused on tabs specifically. The deeper issue is within the Overview tab itself: the health metrics, connection metadata, and scan history are all at the same visual level.

**Why it matters**: Jordan visits Connection Detail frequently. The primary question is "is this connection healthy?" -- that answer should be in the first visual block. Secondary information (scan history, schema details) should be visually separated into distinct sections.

**Suggestion**: Wrap health metrics (status, latency, uptime) in their own `sds-card` with a title "Connection Health." Wrap scan history in a separate `sds-card` with title "Recent Scans." Add `margin-top: 20px` between them. The latency value should use conditional coloring: green for < 100ms, yellow for 100-200ms, red for > 200ms. This mirrors the status tag pattern already used elsewhere.

---

### Issue 7: Remediation Configure wizard has two competing primary CTAs

**What I see**: The Remediation Configure screen (flow4-remediation.js) renders both "Preview Impact" and "Execute Now" as buttons in the action footer. In some paths, "Submit for Approval" is also present. The visual hierarchy between these buttons is unclear -- "Preview Impact" uses `btn-primary` and "Execute Now" also uses `btn-primary` or a prominent style.

**Why it matters**: Having two equally prominent primary actions creates decision paralysis. The research explicitly states that Preview should be the default path for production data ("Dry-run is the default CTA for production targets"). Only one button should be the obvious next step.

**Suggestion**: "Preview Impact" should be the sole `btn-primary` CTA. "Execute Now" should be `btn-secondary` or even `btn-tertiary` with a label like "Skip preview and execute" to communicate that it is the non-default path. For production data targets, "Execute Now" should be disabled entirely with a tooltip: "Preview required for production data."

---

### Issue 8: Data Catalog table has no column for "needs review" status linking to Review Queue

**What I see**: The Data Catalog table (flow2-scanning.js) shows columns for name, schema, connection, column count, classified percentage, sensitivity, and last scanned. There is no visual indicator showing whether a table has pending (unreviewed) classifications.

**Why it matters**: The research explicitly states that unreviewed items in the Data Catalog should show a "Review in Queue" link. Priya browsing the Data Catalog should immediately see which tables have pending work. Without this, the Catalog and Review Queue feel disconnected -- two separate worlds rather than complementary views of the same data.

**Suggestion**: Add a "Review Status" column to the Data Catalog table that renders:
- "All reviewed" (green success tag) when `classifiedPct === 100` and no pending items
- "N pending" (warning tag, clickable) when unreviewed items exist, linking to `#/review?table=TABLE_ID`
- "Not scanned" (neutral tag) when `classifiedPct === 0`

This creates the bridge between Catalog and Review Queue that the research calls for.

---

### Issue 9: Onboarding Welcome screen hides the app shell, but restoration is fragile

**What I see**: The `renderWelcome()` function in flow7-onboarding.js directly manipulates DOM elements: `sidebar.style.display = 'none'` and `header.style.display = 'none'`. The `restoreShell()` function (called at the top of subsequent onboarding screens) resets these styles. However, if the user navigates directly to any non-onboarding route (e.g., bookmarking `#/dashboard` and navigating there after `#/onboarding` has hidden the shell), the sidebar and header remain hidden.

**Why it matters**: This is a prototype-level bug, but it creates a broken experience if a stakeholder navigates away from onboarding mid-flow. The app becomes a full-screen content area with no navigation.

**Suggestion**: The `restoreShell()` function should be called at the beginning of every route handler in ALL flow files, not just onboarding screens. Alternatively, move the shell restoration logic into the Router's `_handleRoute()` method so it runs before any route handler. Add a check: if the sidebar or header has `display: none`, reset it.

---

### Issue 10: The Reports page does not have a breadcrumb or subtitle, making it feel disconnected from the Compliance section

**What I see**: The Reports page renders a page header with "Reports" as the title and a subtitle. But it does not indicate that it sits within the Compliance section of the sidebar navigation. The Regulations page similarly lacks this context.

**Why it matters**: When a user lands on Reports, there is no visual connection to the Compliance section. The sidebar active state shows "Reports" is selected, but the page content does not reinforce the section context. This is especially important for Marcus, who navigates between Regulations and Reports frequently and needs to understand the relationship between them.

**Suggestion**: Add a section label or subtle breadcrumb to pages within the Compliance group: "Compliance / Reports" and "Compliance / Regulations." This mirrors how the sidebar groups items and creates consistency between navigation structure and page content.

---

### Issue 11: The drawer component uses hardcoded hex border color for left-positioned drawers

**What I see**: In `Components.drawer()`, when position is `'left'`, the function applies inline style `border-right:1px solid #E0DCD3`. This is one of the remaining hardcoded hex values that was not caught in the v1 token compliance audit.

**Why it matters**: This is a minor issue in isolation, but it exemplifies a pattern: the JS component functions were not systematically audited for hardcoded values the way the CSS files were. Other instances exist in flow files (platform brand colors for platform icons are intentionally hardcoded, but border/background/text colors should use tokens).

**Suggestion**: Replace `#E0DCD3` with `var(--sds-border-default)` in the drawer component's inline style string. Audit all `Components.*` functions for remaining hardcoded non-brand colors.

---

### Issue 12: No confirmation dialog for destructive actions in the prototype

**What I see**: Several screens offer destructive actions (Delete Connection, Delete Policy, Cancel Remediation) but the click handlers either navigate away immediately or show no confirmation. For example:
- Connection Detail's "Delete" button is present but clicking it has no confirmation step
- Policy Detail's "Delete" action does not show a two-step confirmation
- Remediation Cancel does not confirm before cancelling a scheduled remediation

**Why it matters**: The research explicitly defines confirmation patterns for destructive actions: "Two-step confirmation: acknowledge data loss count, type connection name to confirm" (for deleting a connection). Deleting without confirmation in a data security product is a trust-breaking experience. Even in a prototype, the confirmation pattern should be demonstrated since it is a core interaction pattern.

**Suggestion**: Implement confirmation modals for all destructive actions using the existing `Components.modal()` function. For high-severity deletions (connections with data, policies with applied tokenization), use a "type to confirm" pattern:
```
Are you sure you want to delete "Snowflake Production"?
This will remove 847 tables and 234 classifications.
Type "Snowflake Production" to confirm: [input]
[Cancel] [Delete Connection (disabled until name typed)]
```

---

### Issue 13: Policy wizard Step 4 "Review" does not show a meaningful summary

**What I see**: The policy wizard has a route registered at `/policies/create/review` (Step 4 in the wizard, labeled as step 3/3 in the UX research since it combined steps). This review step should show a comprehensive summary of everything configured in previous steps. However, it renders a generic summary without pulling in the actual selections from previous steps -- the summary content is static/placeholder rather than reflecting user choices.

**Why it matters**: The review step is the final check before policy creation. If it does not accurately reflect what the user configured, it fails its purpose. Priya needs to see: policy name, selected regulation, classification types, token format per classification, scope (which connections/schemas), and the impact preview (how many columns match, projected risk score change).

**Suggestion**: Use `State.get()` to retrieve the wizard form data from previous steps and render a dynamic summary. Each section should be editable (click to jump back to that step). The impact preview section should calculate matching columns from `Data.classifications` and `Data.tables` based on the selected scope and classification types.

---

### Issue 14: Activity feed on the dashboard does not actually filter when filter buttons are clicked

**What I see**: The Executive dashboard view in flow3-risk.js renders an "Activity Feed" card with filter links (All, Scans, Classifications, Remediations). These links are rendered with `data-action="filter-activity"` attributes, but the click handler for activity filtering either does not exist or does not re-render the feed with filtered items. The feed always shows the same static list of activities regardless of which filter is selected.

**Why it matters**: The activity feed is described in the research as "live-updating via WebSocket" with "filtering by type." While WebSocket is out of scope for a prototype, the filtering interaction should at minimum show different subsets of the activity data. Non-functional filters compound with the non-functional tab issue (Issue 1) to create a pattern of "clickable things that do nothing."

**Suggestion**: Implement basic client-side filtering. The activity items already have type metadata. When a filter link is clicked, re-render the feed showing only matching items. Add the `.active` class to the selected filter link and use `--sds-interactive-primary` color to indicate the active filter.

---

### Issue 15: Scan Freshness Heatmap is not implemented in the Operations dashboard view

**What I see**: The Operations dashboard view in flow3-risk.js renders several sections for Jordan's operational needs. The research specifies a "Scan Freshness Heatmap" as a key component of this view, with detailed specifications (Y-axis: connections grouped by platform, X-axis: time buckets, color: freshness). The prototype does not render this heatmap -- the Operations view shows connection health cards and scan status but the heatmap is absent.

**Why it matters**: The Scan Freshness Heatmap is described as a differentiating visualization in the research. It provides Jordan with an at-a-glance view of which connections need attention. Without it, the Operations view is a list of stat cards and a table -- functionally similar to the Connections page, reducing the value of the persona-specific dashboard toggle.

**Suggestion**: Implement the heatmap as a grid-based visualization using HTML/CSS (no charting library needed). Each row is a connection, each column is a time bucket (< 24h, 1-7d, 7-14d, 14-30d, 30d+). Each cell is a colored square using status tokens:
- `--sds-status-success-bg` for fresh (< 7 days)
- `--sds-status-warning-bg` for aging (7-14 days)
- `--sds-color-orange-100` for stale (14-30 days)
- `--sds-status-error-bg` for critical (30+ days)

Make each cell clickable to navigate to the Connection Detail for that connection.

---

### Issue 16: The "Save Changes" button on Settings has no feedback after clicking

**What I see**: The Settings General tab renders a "Save Changes" primary button at the bottom. Clicking it does nothing visible -- no toast, no success message, no button state change. The button click is not handled in the event listeners.

**Why it matters**: Every primary CTA should provide feedback. In a settings context, users need confirmation that their changes were saved. Without feedback, they may click multiple times or lose trust that the action worked.

**Suggestion**: Add a click handler that:
1. Changes the button text to "Saved" with a checkmark icon
2. Changes the button variant to `btn-success` (or apply inline success coloring)
3. After 2 seconds, reverts to "Save Changes"

Alternatively, show an inline success message below the button: "Changes saved successfully" with `--sds-status-success-text` color.

---

### Issue 17: The Remediation page "Approvals" tab badge count is inflated

**What I see**: In app.js, `getBadgeCount('pendingReviews')` adds `+ 37` to the actual approval count. This makes the Review Queue badge show an inflated number (actual pending approvals from Data.approvals + 37 hardcoded). While this is presumably meant to simulate a realistic count, it creates confusion if anyone inspects the data vs. the display.

More importantly, the badge on the "Review Queue" sidebar item (which shows pending reviews) uses a different calculation than the badge on the "Remediation" sidebar item (which shows open remediations). The Review Queue badge conflates approval requests with pending classification reviews into one number.

**Why it matters**: Badge counts drive user behavior. If the badge says 42 but the user only sees 5 items in the queue, they will question the interface's reliability. The research separates classification reviews (Priya's workflow) from remediation approvals (a different workflow). The badge should distinguish these.

**Suggestion**: Separate the badge counts: Review Queue badge = pending classification count from `Data.classifications.filter(c => c.status === 'pending').length`. Remediation badge = open remediations. Remove the `+ 37` hardcoded addition or replace it with actual mock data that accounts for the displayed count.

---

## Cross-Screen Consistency Issues

### Stat card patterns vary across screens
- Dashboard uses `Components.statCard()` consistently
- Connection Detail uses inline-styled metric blocks that mimic stat cards but are not the same component
- Onboarding scan progress uses a third style of metric display (centered, no card border)
- Remediation success screen has yet another stat card style with custom inline animation styles

**Recommendation**: Audit all metric/stat displays and ensure they use `Components.statCard()`. Create a `statCard` variant for "compact" mode (smaller padding, smaller font) if needed for dense layouts.

### Action button placement varies
- Dashboard: actions in page header (top-right)
- Connections: primary action ("Add Connection") in page header (top-right) -- correct
- Policies: primary action ("Create Policy") in page header (top-right) -- correct
- Remediation: "New Remediation" in page header -- correct
- Settings: "Save Changes" at the bottom of the form -- appropriate for a form
- Reports: two action buttons in the header ("Generate Report" + "Schedule Report") -- correct

This is mostly consistent. The only deviation is the Settings form, which appropriately puts the submit button at the bottom.

### Icon-only buttons lack consistent tooltips
Several screens use `Components.iconButton()` for actions (more-vertical, refresh, download). Some have `title` attributes for native browser tooltips; others do not. The `more-vertical` icon button is used on several tables but is non-functional -- clicking it does nothing.

**Recommendation**: All icon-only buttons must have `title` and `aria-label` attributes. Non-functional icon buttons should be removed from the prototype or connected to a dropdown menu.

---

## Content & Copy Issues

### 1. Generic empty state descriptions
The empty state descriptions use functional but uninspiring copy:
- "No data available" (data table fallback) -- should be contextual
- "No classifications to review" -- could include the next step
- "Connect your first data source" -- good, but could quantify the value

**Better examples**:
- "No connections yet. Connect your first data source to start discovering sensitive data."
- "All classifications reviewed! Your data is fully classified."
- "Connect in under 2 minutes and discover what sensitive data lives in your infrastructure."

### 2. Dates use ISO format in some places
`Data.formatDateTime()` is used in most places, but some render functions display raw ISO strings or partial date formats. The scheduled report dates in the modal are hardcoded as "Monday, March 18, 2024" -- which is now out of date (the prototype data uses 2024 dates but we are in 2026).

**Recommendation**: Use relative dates where possible ("2 days ago", "Last Tuesday") for recent events, and absolute dates for scheduled/future events. Update the mock data year from 2024 to 2026 so the prototype feels current.

### 3. Inconsistent capitalization in page subtitles
- "Complete these 5 steps to see your first risk score" -- sentence case (correct)
- "Generate, schedule, and manage risk and compliance reports" -- sentence case (correct)
- Connection Detail subtitle uses the connection host URL -- appropriate

Capitalization is mostly consistent, which is good.

---

## Quick Wins

1. **Make wizard step indicators clickable for completed steps.** Add `cursor: pointer` and `data-wizard-step` to completed `.wizard-step` elements. This is a small JS change in `Components.wizardSteps()` with high usability payoff.

2. **Add confirmation modals for delete actions.** Use the existing `Components.modal()` with a "Type to confirm" input for Connection Delete and Policy Delete. Three instances to fix, all using the same pattern.

3. **Remove the `+ 37` from the Review Queue badge count.** In app.js line 83, remove the hardcoded addition. Replace with actual mock data count from `Data.classifications.filter(c => c.status === 'pending').length`.

4. **Add "Save Changes" click feedback to Settings.** A 5-line click handler that changes the button text and reverts after 2 seconds.

5. **Call `restoreShell()` in the Router's `_handleRoute()` method.** Prevents the sidebar/header from staying hidden if a user navigates away from onboarding mid-flow. One line of code in router.js.

6. **Remove the three "coming soon" tabs from Settings.** If the content is not implemented, do not show the tabs. They set expectations that are not met.

7. **Add a "Review Status" column to the Data Catalog table.** Bridge the gap between Catalog browsing and the Review Queue workflow by showing which tables have pending reviews.

---

## Evaluation Against Persona Goals (Gaps Only)

### Jordan (Data Engineer)
**New gaps identified**:
- Connection Detail Overview lacks visual grouping (Issue 6)
- Operations dashboard missing the Scan Freshness Heatmap (Issue 15)
- No indication of active scans visible globally (sidebar badge mentioned in research but not implemented)

### Priya (Governance Analyst)
**New gaps identified**:
- Data Catalog lacks "Review in Queue" linkage (Issue 8)
- Policy wizard review step does not show dynamic summary (Issue 13)
- Wizard steps are not clickable for jumping between completed steps (Issue 5)
- Activity feed filters on dashboard do not function (Issue 14)

### Marcus (Security Leader)
**New gaps identified**:
- "What Changed" items lack visual hierarchy by impact magnitude (Issue 4)
- Report dates in mock data show 2024, which feels dated in a 2026 prototype
- Dashboard-to-Remediation cross-flow breadcrumb loses context (Issue 2)

---

## Design System Token Compliance (Delta from v1)

| Area | v1 Status | v2 Status | Notes |
|------|-----------|-----------|-------|
| **CSS token usage** | Needs work | Improved | base.css and components.css now use `var(--sds-*)` consistently |
| **JS component functions** | Needs work | Still needs work | `Components.drawer()` still has `#E0DCD3` hardcoded (Issue 11). Several flow files still use inline hex for non-brand colors |
| **Filter pills** | Not implemented | Implemented | Correct token usage in `.filter-pill` CSS |
| **Skeleton loading** | Not implemented | Implemented | Uses tokens with fallback hex values (acceptable pattern) |
| **No-results state** | Not implemented | Implemented | Correct token usage |
| **Clickable cards** | Missing cursor | Fixed | `.sds-card[data-navigate]` rule added |

---

## Next Steps

Based on this second critique, recommended follow-up actions:

1. **Fix interaction dead ends first** -- non-functional tabs (Issue 1), non-functional filters (Issue 14), and missing confirmation dialogs (Issue 12) are the highest-impact fixes. Users who encounter non-functional interactive elements lose trust in the prototype.

2. **Use `/component-builder`** to spec clickable wizard steps with state preservation, confirmation modal with "type to confirm" input, and save feedback pattern.

3. **Use `/page-designer`** to redesign the Connection Detail Overview tab with proper visual grouping (health card, scan history card, metadata section).

4. **Use `/page-designer`** to design the Scan Freshness Heatmap for the Operations dashboard view.

5. **Use `/content-copy-designer`** to rewrite empty state descriptions, update mock data dates from 2024 to 2026, and improve "What Changed" copy with impact-proportional styling.

6. **Use `/accessibility-auditor`** to verify that icon-only buttons have proper `aria-label` attributes and all interactive elements are keyboard accessible.

---

*Second-pass critique based on complete code analysis of 18 source files, evaluated against UX Flows v3 research (52 screens, 7 flows, 3 personas) and Software DS design system tokens. Focused exclusively on issues not identified in the v1 critique.*
