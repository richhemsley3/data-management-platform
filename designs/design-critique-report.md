# Design Critique: Beacon Data Security Platform Prototype

**Stage**: High-fidelity clickable prototype (implementation)
**Date**: 2026-03-14
**Evaluator**: Design critique skill (deep critique level)
**Design System**: Software DS
**Research Reference**: UX Flows v3 (7 flows, 52 screens, 3 personas)

---

## Overall Scorecard

| Dimension | Score | Summary |
|-----------|-------|---------|
| Visual Hierarchy | 4/5 | Strong page header patterns and stat card hierarchy. Dashboard gauge is a clear focal point. Some list views feel flat. |
| Clarity | 4/5 | Labels are action-oriented, status tags communicate state well. Some wizard flows could benefit from more contextual help. |
| Consistency | 4.5/5 | Excellent adherence to shared component library. Same card, tag, table, and button patterns used across all 14+ screens. Minor inline-style deviations. |
| Density & Breathing Room | 3.5/5 | Dashboard is well-balanced. Some list views (Remediation, Review Queue) pack many columns tightly. Onboarding screens have good breathing room. |
| Interaction Design | 3.5/5 | Navigation, tabs, and wizard steps work well. Missing hover states on some card-based layouts. Table row hover is well-handled. No loading/skeleton states visible. |
| Emotional Quality | 4/5 | Professional and trustworthy. Warm gray palette feels approachable. Onboarding celebration moments and risk gauge animation add polish. |

**Overall: 3.9/5**

This is a strong prototype that faithfully translates the UX research into a working implementation. The component system is consistent and the information architecture follows the five-stage loop (Discover > Classify > Assess > Remediate > Track) clearly. The main improvement areas are around density management on data-heavy screens, missing interaction micro-states, and a few places where hardcoded values bypass the design system tokens.

---

## Top Strengths

### 1. Exceptional component reuse and consistency
The `Components.*` module (pageHeader, dataTable, card, tabs, tag, badge, wizardSteps, filterBar, modal, drawer, emptyState, alertRibbon, statCard) creates a unified visual language across all screens. Every flow uses the same building blocks, making the product feel cohesive. The `statusTag()` and `statusDot()` helpers map semantic status strings to the correct SDS tag variants consistently.

### 2. Persona-aware dashboard with toggle tabs
The dashboard (Flow 3) delivers on the research goal of serving Marcus, Priya, and Jordan from a single entry point. The toggle-tab pattern (`sds-toggle-tabs`) with Executive/Governance/Operations views avoids the problem of a one-size-fits-all dashboard. Each view surfaces the right metrics for its persona without creating separate pages.

### 3. Strong onboarding flow
The onboarding (Flow 7) is well-crafted with progressive disclosure, persona selection, coach marks, step-by-step progress tracker, and celebration moments. The "Skip to Dashboard" escape hatch respects expert users. The Marcus demo path with sample data is a smart way to give executives value without requiring technical setup. The shared `guidedMode` concept from the research is reflected in simplified review items and educational tooltips.

### 4. Comprehensive remediation flow with approval workflow
The remediation flow (Flow 4) implements all 11 screens from the research, including the approval sub-flow. The Configure > Preview > Execute wizard pattern is consistent. Context preservation from entry points (risk detail, review queue, dashboard) is implemented via pre-filled configuration. The success screen with animated risk score reduction closes the feedback loop.

### 5. Universal Search (Cmd+K)
The search overlay is well-implemented with grouped results by type (Connections, Tables, Policies, Regulations), keyboard navigation, highlight matching, recent/suggested searches, and proper z-index layering. This is a power-user feature that all three personas will benefit from.

### 6. Sidebar navigation with collapsible state
The sidebar groups navigation items by stage (Discovery, Protection, Compliance) matching the five-stage loop. Badge counts on Review Queue and Remediation surface actionable items. The collapse toggle with smooth animation and proper icon/label hiding is polished.

---

## Areas for Improvement

### Issue 1: Hardcoded color values bypass design system tokens

**What I see**: Throughout the CSS files, color values are specified as hex literals rather than referencing `var(--sds-*)` tokens. For example, in `base.css`: `color: #1C1A17` instead of `var(--sds-text-primary)`, `background: #FAF8F5` instead of `var(--sds-nav-sidebar-bg)`, `border: 1px solid #E0DCD3` instead of `var(--sds-border-default)`. The `tokens.css` file correctly defines all semantic tokens, but `base.css` and `components.css` use the raw hex values.

**Why it matters**: This defeats the purpose of the token system. If the design system evolves or dark mode is needed, every hardcoded value must be found and replaced. The JS flow files are even more problematic -- they construct inline styles with hardcoded hex values (e.g., `style="color:#948E85"` in flow files).

**Suggestion**: Replace all hardcoded hex values in `base.css` and `components.css` with their corresponding `var(--sds-*)` semantic tokens. For example:
- `#1C1A17` -> `var(--sds-text-primary)`
- `#6B6760` -> `var(--sds-text-secondary)`
- `#FAF8F5` -> `var(--sds-nav-sidebar-bg)`
- `#E0DCD3` -> `var(--sds-border-default)`
- `#013D5B` -> `var(--sds-interactive-primary)`
- `#F4F1EB` -> `var(--sds-bg-subtle)`

In JS flow files, use CSS classes instead of inline styles where possible, or reference `var()` tokens in the inline style strings.

### Issue 2: Data table density on list screens

**What I see**: The Remediation History, Review Queue, Scans, and Data Catalog screens display tables with 6-8 columns. At standard viewport widths, columns like "Connection," "Regulation," "Assignee," and action buttons compete for horizontal space. The Review Queue renders confidence bars, category tags, and sample values in a single row, creating visual overload.

**Why it matters**: Jordan and Priya spend significant time on these list views. Dense tables slow scanning speed and increase cognitive load. The research specifically calls out that Priya wants "clear workflow queues, not alert firehoses."

**Suggestion**:
1. Consider a two-line row pattern for the Review Queue: first line for column/table/connection, second line for confidence bar and sample value. This reduces column count while keeping information accessible.
2. Add column visibility controls (show/hide columns) for power users.
3. On the Remediation History table, collapse the "Items" and "Completed" columns into a single progress indicator (e.g., "8/12" with a mini progress bar).
4. Use `--sds-bg-subtle` (`var(--sds-color-warm-gray-050)`) alternating row backgrounds for tables with 10+ rows to improve scannability.

### Issue 3: Missing loading and skeleton states

**What I see**: The research specifies skeleton loading for the dashboard ("Score loads first, then trend, then coverage, then compliance cards") and scan progress animation. The prototype renders content synchronously without any loading states, skeleton placeholders, or transition animations.

**Why it matters**: In production, API calls introduce latency. Without loading states, the UI will flash from empty to populated, creating a jarring experience. The research identifies this as important for perceived performance, especially for Marcus who needs the dashboard to feel responsive and premium.

**Suggestion**: Add skeleton card components that match the stat card and chart card dimensions. Implement them as CSS-only placeholders with a shimmer animation:
```css
.skeleton {
  background: linear-gradient(90deg, var(--sds-bg-subtle) 25%, var(--sds-bg-surface) 50%, var(--sds-bg-subtle) 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: 4px;
}
```
The dashboard render function should show skeletons first, then populate each section with a slight stagger.

### Issue 4: Filter bar lacks active filter indication

**What I see**: The filter bar component (`Components.filterBar`) renders search input and select dropdowns, but there is no visual indication of active filters. When a user filters the Connections list by "Degraded" status or the Review Queue by "PII" category, the filter select looks the same as its default state.

**Why it matters**: Users lose context about what they are looking at. Jordan filtering connections by status and then navigating away and back should immediately see that a filter is active. Without this, filtered views can be mistaken for the complete dataset.

**Suggestion**: Add an active filter pill pattern. When a filter has a non-default value, show a dismissible pill below the filter bar:
```html
<div class="filter-active-pills">
  <span class="filter-pill">
    Status: Degraded
    <button class="filter-pill-remove">&times;</button>
  </span>
</div>
```
Use `--sds-interactive-primary-subtle` (`var(--sds-color-blue-100)`) as the pill background and `--sds-interactive-primary` (`var(--sds-color-blue-750)`) as the text color to match the active nav item pattern.

### Issue 5: Inline styles in JS flow files undermine maintainability

**What I see**: The flow JS files (especially flow3-risk.js, flow4-remediation.js, flow5-policies.js, flow7-onboarding.js) use extensive inline `style=""` attributes for layout, spacing, and color. Examples: `style="display:flex;gap:20px;align-items:flex-start;"`, `style="font-size:13px;color:#948E85;"`, complex nested div structures with 5+ inline style properties.

**Why it matters**: This creates a maintenance burden and makes it impossible to update the visual language by changing CSS alone. It also means these elements cannot participate in dark mode or theme changes. For a prototype this is understandable, but it will become a significant obstacle when moving toward production.

**Suggestion**: Extract the most common inline patterns into named CSS classes:
- `style="display:flex;gap:20px;align-items:flex-start;"` -> class `flex items-start gap-20` (utility classes already exist in base.css)
- `style="font-size:13px;color:var(--sds-text-tertiary);"` -> class `text-sm text-tertiary`
- Card-like containers with `background:var(--sds-bg-card);border:1px solid var(--sds-border-default);border-radius:8px;padding:24px;` -> class `sds-card` + `sds-card-body`

Prioritize the dashboard (flow3) and onboarding (flow7) files first since those are the most-visited screens.

### Issue 6: Connection Detail screen lacks visual hierarchy for tabs

**What I see**: The Connection Detail page (flow1-connections.js) renders four tabs (Overview, Schemas, Scan History, Settings) with substantial content in each. The Overview tab shows health metrics, latency info, and scan history all in a flat layout. The tab content does not use cards or visual grouping to separate these sections.

**Why it matters**: Jordan visits Connection Detail frequently to check health status. Without visual grouping, the eye has to scan a long vertical page to find the relevant metric. The research calls for "health metrics, latency chart" as the key content -- these should be visually prominent.

**Suggestion**: Wrap the health metrics section in a `sds-card` with a bordered header. Use a 2-column grid (`grid-2`) for the key metrics (status, latency, uptime, last scan) and place the latency chart in its own card below. This creates clear visual groups:
```
[Stat cards: Status | Latency | Tables | Coverage]
[Latency Chart card]
[Recent Scans card with table]
```

### Issue 7: Wizard flows lack a persistent summary panel

**What I see**: The Add Connection and Create Policy wizards move through steps sequentially. Each step replaces the previous content entirely. The user cannot see what they configured in Step 1 while working on Step 2.

**Why it matters**: The research specifically calls for "a collapsible summary panel" and "side-by-side split layout" for schema selection. While the wizard step indicator shows progress, there is no running summary of choices made. For the policy wizard (3 steps: Basics, Token Config, Scope), users may need to reference their regulation choice while configuring token formats.

**Suggestion**: Add a compact summary sidebar or collapsible panel on the right side of wizard flows (min-width 200px) that shows key choices from previous steps. Use the `sds-card` pattern with `--sds-bg-subtle` background and subdued text (`--sds-text-secondary`). This is especially important for the schema selection step, which the research specifies as a side-by-side split layout.

### Issue 8: Risk Simulation drawer interaction needs refinement

**What I see**: The risk simulation (flow3-risk.js) renders as a section within the Risk Detail page rather than as the drawer specified in the research. Items are listed with checkboxes and a projected score, but the interaction between selecting items and seeing the score update is static (hardcoded projected values rather than reactive calculation).

**Why it matters**: Risk simulation is called out in the research as a unique differentiator: "No competitor offers this." The interaction should feel dynamic and responsive. The drawer pattern allows users to keep the risk detail context visible while exploring simulation scenarios.

**Suggestion**: Implement the simulation as a proper `drawer` component (already defined in components.css at 480px width). Use JavaScript to recalculate the projected score as checkboxes are toggled. Add the filter controls specified in the research (by connection, classification type, remediation action type). Show the before/after score comparison with an animated transition using `transition: 0.3s ease`.

### Issue 9: Empty states are functional but not emotionally engaging

**What I see**: The `emptyState` component renders a faded icon, title, description, and optional action button. This is correct structurally, but the visual treatment is minimal -- a low-opacity SVG icon and plain text.

**Why it matters**: Empty states are the first thing new users see on most screens. The research emphasizes time-to-value and celebration of micro-wins. Empty states should be inviting and motivating, not just informational. Competitors like Wiz use illustration-quality empty states that create a moment of delight.

**Suggestion**: Consider upgrading the empty state icon treatment:
1. Increase the icon container size and use a circular background with `--sds-interactive-primary-subtle` (`var(--sds-color-blue-100)`)
2. Add a subtle border or shadow to give the icon presence
3. For the Connections empty state, show platform logos (Snowflake, AWS, BigQuery, Databricks) arranged in a small grid to make the "Connect in under 2 minutes" promise feel tangible
4. Use `--sds-text-primary` for the title (currently correct) and ensure the CTA button uses `btn-primary btn-md` (not just a tertiary link)

### Issue 10: Alert Ribbon does not stack multiple alerts

**What I see**: The `setupAlertRibbon()` function in app.js only renders `Data.alerts[0]` -- the first alert. The mock data has two alerts (PostgreSQL connection error and overdue remediation tasks). The second alert is never shown.

**Why it matters**: The research defines the Alert Ribbon as a persistent cross-page notification system. When multiple alerts are active (connection failure + compliance change + overdue tasks), users need awareness of all of them. Showing only one creates false confidence.

**Suggestion**: Implement alert cycling or stacking:
- **Option A (Cycling)**: Show one alert at a time with a "1 of 3" indicator and left/right arrows to cycle
- **Option B (Stacking)**: Show the highest-severity alert with a count badge: "PostgreSQL connection unreachable + 2 more alerts"
- In either case, clicking the alert or a "View all" link should navigate to a notification center or expand the ribbon to show all active alerts

---

## Evaluation Against Persona Goals

### Jordan (Data Engineer)
**Goal**: Manage connections, run scans, monitor infrastructure
**Assessment**: Well-served

- Connection List with status badges, platform icons, and filter/search provides the overview Jordan needs
- Connection Detail with Overview/Schemas/Scan History/Settings tabs gives deep access to health metrics
- Add Connection wizard is streamlined to 2 steps (Platform+Configure, Schema Selection)
- Scan progress with real-time stats (tables scanned, columns discovered, ETA) addresses Jordan's need for operational visibility
- Operations dashboard view shows connection health and scan freshness heatmap

**Gaps**:
- The side-by-side schema selection layout specified in the research is implemented as a sequential step rather than a true split view
- Connection grouping for 20+ connections (mentioned in research) does not appear to be implemented
- Latency chart in Connection Detail is referenced in the research but appears to be a placeholder rather than a rendered chart

### Priya (Governance Analyst)
**Goal**: Define policies, review classifications, track compliance
**Assessment**: Well-served

- Review Queue with tabs (Queue, Rules, Consistency) provides the dedicated workflow the research calls for
- Classification reasoning (pattern match type, confidence breakdown, similar classifications) is shown on expand
- Bulk accept with confidence threshold is implemented
- Policy wizard with templates, regulation-aware defaults, and impact preview addresses Priya's governance needs
- Governance dashboard view surfaces review queue count, regulation cards, and policy coverage

**Gaps**:
- The Classification Rules "Create Rule" screen could benefit from a live preview of matching columns (mentioned in research, may need more visual prominence)
- Cross-table consistency checker could use more visual differentiation to highlight conflicts (currently appears as a standard table)

### Marcus (Security Leader)
**Goal**: Consume dashboards, risk scores, compliance reports
**Assessment**: Well-served

- Executive dashboard view with animated risk gauge, trend chart, protection donut, and compliance cards delivers the one-page summary
- "What Changed" summary with itemized delta and clickable links addresses Marcus's need to understand risk drivers
- Quick Actions panel provides one-click navigation to highest-priority tasks
- Report generation and scheduling with PDF/CSV export and email delivery serves the board-reporting use case
- Onboarding demo path with sample data lets Marcus experience value without technical setup

**Gaps**:
- The executive PDF export mentioned in the research ("one page, risk score, trend, coverage %, top 3 risks, compliance status") is a button that does not produce an actual preview in the prototype -- expected for a prototype, but worth noting for production
- Risk trend chart with key events marked (mentioned in research) could use event markers on the sparkline

---

## Quick Wins

1. **Replace hardcoded hex colors with CSS custom property references in base.css and components.css.** This is a find-and-replace operation (approximately 60-80 replacements) that immediately improves maintainability and enables dark mode support. Start with `base.css` body, header, sidebar, and typography sections.

2. **Add `cursor: pointer` to all `sds-card` elements that have `data-navigate` or click handlers.** Several card-based layouts (policy templates, report templates, onboarding persona cards) are clickable but do not show a pointer cursor from CSS alone (they rely on inline style). Adding a `.sds-card[data-navigate] { cursor: pointer; }` rule fixes this globally.

3. **Add active filter pill display below the filter bar.** Implement as a simple `<div class="filter-active-pills">` that appears when any filter has a non-default value. Use existing tag styling (`sds-tag--info`) for the pill appearance.

4. **Fix alert ribbon to cycle or stack multiple alerts.** Change `Data.alerts[0]` to a cycling mechanism with a "1 of N" indicator. This is a small JS change in `app.js` `setupAlertRibbon()` that significantly improves alert awareness.

5. **Add a "no results" state for filtered table views.** When filters produce zero results, show a friendly empty state: "No items match your filters. Try adjusting your search or clearing filters." Several list views (Connections, Remediation, Data Catalog) would benefit from this.

6. **Increase page-header bottom margin from 24px to 32px.** The page title sits slightly close to the first content element on most screens. The extra 8px of breathing room between the header and body content improves the reading experience without any layout disruption.

---

## Design System Token Compliance Summary

| Area | Compliance | Notes |
|------|-----------|-------|
| **Semantic tokens defined** | Excellent | `tokens.css` defines a complete set of bg, text, border, interactive, nav, and status semantic tokens |
| **Token usage in CSS** | Needs work | `base.css` and `components.css` use raw hex values instead of `var(--sds-*)` references |
| **Token usage in JS** | Needs work | Flow files use inline hex values; some use `var()` references in inline styles (inconsistent) |
| **Color palette** | Correct | All colors used in the prototype exist in the SDS option token scale |
| **Status colors** | Correct | Success (green), Warning (yellow), Error (red), Info (blue), Neutral (warm-gray), Purple all map correctly |
| **Typography scale** | Correct | 24/20/16/14/13/12/11px sizes follow the SDS scale |
| **Spacing** | Mostly correct | 8px grid is followed. Utility classes (mt-8, gap-12, p-24) are properly defined |
| **Border radius** | Correct | 4px (tags), 6px (buttons, inputs), 8px (cards, filter bar), 12px (modals) -- consistent scale |
| **Shadows** | Correct | Subtle shadows used per SDS principle (0 1px 3px for cards, heavier for modals/drawers) |
| **Active states** | Correct | Light blue (blue-100 bg + blue-750 text) for active nav items per SDS principle |

---

## Next Steps

Based on this critique, recommended follow-up actions:

1. **Use `/design-reviewer`** to audit token compliance systematically and generate a list of all hardcoded values that need replacement
2. **Use `/component-builder`** to spec loading/skeleton states, active filter pills, and alert cycling behavior
3. **Use `/page-designer`** to redesign the Review Queue table layout with a two-line row pattern for better density management
4. **Use `/accessibility-auditor`** to verify contrast ratios (especially for status tag text on colored backgrounds) and keyboard navigation across all screens
5. **Use `/content-copy-designer`** to review empty state copy and wizard step descriptions for consistency and motivation

---

*Critique generated from code analysis of the complete prototype implementation (18 source files) evaluated against UX Flows v3 research document (52 screens, 7 flows, 3 personas) and Software DS design system tokens.*
