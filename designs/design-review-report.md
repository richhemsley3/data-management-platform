# Design Review Report: Beacon Data Security Platform Prototype

**Date**: 2026-03-14
**Reviewer**: Claude (Design System Compliance Audit)
**Design System**: Software DS
**Prototype Location**: `/Users/richhemsley/Desktop/Claude/Data Management Platform/prototype/`
**UX Research Reference**: `ux-flows-v3.md` (7 flows, 53 screens, 3 personas)

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 14 |
| Major | 9 |
| Minor | 6 |

**Overall Assessment**: The prototype demonstrates strong structural adherence to the Software DS design system. The token file is a complete copy of the canonical source, component patterns (cards, tabs, badges, tags) are well-structured, and icon implementation is excellent. However, the CSS files use raw hex values everywhere instead of semantic `var(--sds-*)` tokens, which is the single largest issue. This means dark mode will not work at all, and any future theme changes will require a full CSS rewrite. The inline styles in JS files compound this problem with ~293 additional raw hex occurrences. Accessibility is the second major gap: almost no ARIA labels on dynamically generated interactive elements, zero `role` attributes, and `focus-visible` styles exist only on `.btn`.

---

## Critical Findings

### C1. Raw hex colors throughout all CSS files instead of semantic tokens

**Scope**: base.css, components.css, charts.css -- every single color declaration uses raw hex values instead of `var(--sds-*)` semantic tokens.

Despite the prototype including a complete copy of `colors.css` as `tokens.css` with all semantic tokens defined, none of the CSS files reference them. Examples:

| File | Line | Raw Value | Should Be |
|------|------|-----------|-----------|
| base.css | 20 | `color: #1C1A17` | `color: var(--sds-text-primary)` |
| base.css | 21 | `background: #FFFFFF` | `background: var(--sds-bg-page)` |
| base.css | 41 | `background: #FFFFFF` | `background: var(--sds-bg-card)` |
| base.css | 42 | `border-bottom: 1px solid #EBE6DD` | `border: ... var(--sds-border-subtle)` |
| base.css | 60 | `background: #FAF8F5` | `background: var(--sds-nav-sidebar-bg)` |
| base.css | 61 | `border-right: 1px solid #E0DCD3` | `border: ... var(--sds-border-default)` |
| base.css | 142 | `background: #013D5B` | `background: var(--sds-interactive-primary)` |
| base.css | 398 | `color: #013D5B` | `color: var(--sds-text-link)` |
| components.css | 53 | `background: #013D5B` | `background: var(--sds-interactive-primary)` |
| components.css | 58 | `background: #05314D` | `background: var(--sds-interactive-primary-hover)` |
| components.css | 62 | `background: #032740` | `background: var(--sds-interactive-primary-active)` |
| components.css | 199 | `border: 1px solid #E0DCD3` | `border: ... var(--sds-border-default)` |
| components.css | 291 | `border-bottom-color: #013D5B` | `var(--sds-interactive-primary)` |
| components.css | 299 | `background: #D9EBED` | `background: var(--sds-nav-item-active-bg)` |
| components.css | 964 | `background: #013D5B` | `background: var(--sds-interactive-primary)` |

**Impact**: Dark mode is completely broken. The semantic tokens define dark mode overrides via `@media (prefers-color-scheme: dark)`, but since no CSS references `var(--sds-*)`, those overrides have zero effect.

**Estimated scope**: ~300+ raw hex values across CSS files need conversion to semantic tokens.

### C2. Raw hex colors in ~293 inline styles across JS files

All 8 JS flow files embed raw hex colors in inline `style=""` attributes within HTML string templates. Examples from flow1-connections.js:

- Platform dot colors: `background:' + color + '` using raw hex from `Data.platformColors`
- Platform icon containers: inline `background:` with computed hex values
- Confidence bars in flow2-scanning.js use raw hex color maps: `{ error: '#BF5547', warning: '#C4AA25', success: '#7A9A01' }`
- Gauge colors in charts.js: `#7A9A01`, `#C4AA25`, `#CF6253`, `#BF5547`
- Donut chart segments pass raw hex colors

**Impact**: Same dark mode failure. These inline styles cannot be overridden by CSS custom property changes.

### C3. Colors not in the token system

Several colors used in the CSS are not part of the Software DS token palette:

| Raw Hex | Location | Issue |
|---------|----------|-------|
| `#333` | components.css line 493 (`.data-table td`) | Not a valid warm-gray value. Should be `var(--sds-text-primary)` (#1C1A17) |
| `#4A7A2B` | components.css line 969, base.css line 483 | Used for success fill/text. Not in token system. Should use `var(--sds-status-success-text)` (#62800B) or `var(--sds-status-success-strong)` (#7A9A01) |
| `#C68A19` | components.css line 971, base.css line 484 | Used for warning. Not in token system. Should use `var(--sds-status-warning-text)` (#8A7515) |
| `#FAFAF9` | components.css lines 500, 795 | Not in warm-gray palette (warm-gray-025 is #FAF8F5). Should be `var(--sds-bg-surface)` |
| `#FFF6E0` | components.css line 1021 | Warning ribbon bg. Not in yellow palette. Closest is yellow-025 (#FCF9D9) |
| `#8A6914` | components.css line 1022 | Warning ribbon text. Not in yellow palette. Closest is yellow-500 (#8A7515) |
| `#EDF5E4` | components.css line 1027, charts.css line 126 | Success ribbon bg. Not in green palette. Closest is green-025 (#F4FAEB) |
| `#3D6520` | components.css line 1028, charts.css line 126 | Success ribbon text. Not in green palette. Closest is green-600 (#466B11) |
| `#E6F0F4` | components.css line 1033 | Info ribbon bg. Not in blue palette. Should use `var(--sds-status-info-bg)` (#EBF4F5) |
| `#E0C560` | components.css line 1023 | Warning ribbon border. Not in palette |
| `#A8CB8A` | components.css line 1029 | Success ribbon border. Not in palette |
| `#7A6710` | components.css lines 379, 444 | Warning tag/badge text. Differs from token system warning text (#8A7515) |
| `#AD4739` | components.css lines 374, 443 | Error tag/badge text. Not in the standard error text token (#BF5547) |

### C4. Missing ARIA labels on dynamically generated interactive elements

The HTML shell in `index.html` has proper `aria-label` attributes on the header help button and profile button. However, **zero** ARIA labels exist on any dynamically generated content:

- **Icon-only buttons**: `Components.iconButton()` generates `<button class="btn btn-tertiary btn-sm btn-icon-only">` with no `aria-label`. These appear throughout tables (edit, delete, more actions).
- **Navigation links**: `<a class="sidenav-item">` elements have no `aria-label` (though they do contain visible text, which is acceptable).
- **Modal close buttons**: Generated with `data-modal-close` but no `aria-label="Close"`.
- **Tab buttons**: No `role="tab"` or `aria-selected` attributes on `.sds-tab` elements.
- **Toggle tabs**: No `role="tablist"` on `.sds-toggle-tabs` container.
- **Data table rows with `data-navigate`**: Clickable rows have no `role="link"` or keyboard accessibility indication.
- **Filter bar search inputs**: No `aria-label` on search inputs.
- **Alert ribbon close**: No `aria-label="Dismiss alert"`.

### C5. Zero `role` attributes in entire prototype

No `role` attributes exist anywhere in the codebase. Custom widgets that need them:

- Tab containers (`.sds-tabs`) need `role="tablist"`
- Tab buttons (`.sds-tab`) need `role="tab"` and `aria-selected`
- Tab panels need `role="tabpanel"`
- Modal (`.modal`) needs `role="dialog"` and `aria-modal="true"`
- Drawer needs `role="dialog"`
- Data tables with clickable rows need `role="link"` on rows or proper button semantics
- Alert ribbon needs `role="alert"` or `role="status"`
- Wizard steps should have `role="progressbar"` or `aria-current="step"`

### C6. Focus-visible styles only on `.btn`

Only one `focus-visible` rule exists in the entire CSS:

```css
.btn:focus-visible {
  outline: 2px solid #013D5B;
  outline-offset: 2px;
}
```

Missing `focus-visible` styles on:
- `.sidenav-item` (sidebar navigation links)
- `.sds-tab` and `.sds-toggle-tab` (tab buttons)
- `.form-input`, `.form-select`, `.form-textarea` (form elements use `:focus` but not `:focus-visible`)
- `.modal-close` (close buttons)
- `.sidenav-collapse` (collapse toggle)
- `.header-help` and `.header-profile` (header interactive elements)
- `.link` class elements
- Data table rows with `data-navigate`

---

## Major Findings

### M1. Non-standard spacing: `padding: 3px` on `.sds-toggle-tabs`

**Line**: components.css:321
`padding: 3px;` -- 3px is not on the 8px grid and not the allowed 4px exception.
**Fix**: Use `padding: 4px;`

### M2. Non-standard spacing: `padding: 1px 7px` on `.sds-tag--outline`

**Line**: components.css:406
`padding: 1px 7px;` -- Both values are off-grid. This appears to compensate for the 1px border.
**Fix**: Use `padding: 2px 8px;` and adjust the border-box calculation, or accept this as an intentional 1px reduction for border compensation.

### M3. Non-standard border-radius: `10px` on badges and toggle slider

**Lines**: components.css:304 (`.sds-tab-badge`), 438 (`.sds-badge`), 639 (`.form-toggle-slider`)
`border-radius: 10px;` -- 10px is not in the standard set (4px, 6px, 8px, 12px, 50%).
**Fix**: For pill shapes, use a large value like `border-radius: 100px;` or `50%` depending on the element. For the toggle slider at 20px height, `border-radius: 10px` is intentionally 50% of height, which is acceptable as a circle/pill. Consider documenting this as an allowed pattern.

### M4. Missing hover state on `.sds-card`

Cards (`.sds-card`) have no hover state defined, even though they are used as clickable elements in several places (e.g., policy templates, onboarding persona cards, report templates). Clickable cards should show `background: var(--sds-bg-subtle)` or a subtle elevation change on hover.

### M5. Missing hover, active, and focus states on `.form-toggle`

The toggle switch has only `background` transition on the slider but no hover indication on the toggle container itself. Users cannot tell the toggle is interactive before clicking.

### M6. Missing disabled state on `.sds-tab`, `.sds-toggle-tab`, `.form-select`

These interactive elements have active/hover states but no disabled variant. The `.sds-tab` and `.sds-toggle-tab` should support `disabled` for tabs that are not yet available. `.form-select` lacks `:disabled` styling.

### M7. Missing active (pressed) state on `.sidenav-item`

The sidebar nav has `:hover` and `.active` (selected) states but no `:active` (pressed) state for click feedback.

### M8. Data table row hover uses non-token color

**Line**: components.css:500
`.data-table tr:hover td { background: #FAFAF9; }` -- `#FAFAF9` is not in the warm-gray palette. Should be `var(--sds-bg-subtle)` (warm-gray-050 / #F4F1EB) or `var(--sds-bg-surface)` (warm-gray-025 / #FAF8F5).

### M9. Color-only information conveying without text alternative

Several UI elements convey status using color alone:
- **Platform dots** in connection lists: colored circles with no text label for the platform
- **Confidence bars** in scan results: colored progress bars (green/yellow/red) with percentage but the color band itself carries meaning without a text label like "High" / "Medium" / "Low" consistently applied
- **Heatmap cells**: rely solely on background color gradients to convey severity

---

## Minor Findings

### m1. Font stack includes "Oxygen, Ubuntu" not in spec

**Line**: base.css:17
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
```
The Software DS spec is: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

The `Oxygen, Ubuntu` additions are harmless but inconsistent with the design system specification.

### m2. Missing transition on `.link` class

**Line**: components.css:1089-1098
The `.link` class has no `transition` property. Interactive text should have `transition: color 0.15s ease;` for smooth hover effects.

### m3. Missing transition on `.sidenav-collapse`

**Line**: base.css:366
The collapse button has `transition: color 0.12s;` but no `background` transition, even though it could benefit from one for hover state feedback.

### m4. Header chevron icon uses hardcoded stroke color

**Line**: base.css:241
`stroke: #6B6760;` -- should be `stroke: currentColor` to inherit from parent, consistent with the icon system pattern used everywhere else.

### m5. Gap utility `gap-6` uses 6px

**Line**: base.css:457
`gap: 6px;` and `gap-10` at line 459 use `10px` -- neither 6px nor 10px are on the strict 8px grid. However, both are commonly used for tight internal spacing and may be intentional. 6px is non-standard; 10px appears throughout the component system (e.g., sidenav-item gap).

### m6. Inconsistent icon sizing in buttons

Button icons (`.btn-icon`) default to 16x16px, while the design system specifies 18x18px as the default icon size. The `.btn-lg .btn-icon` correctly uses 18x18px. This is likely intentional (smaller icons in smaller buttons) but should be documented as an allowed variation.

---

## UX Research Cross-Reference

### Screen Coverage

The UX research document (ux-flows-v3.md) specifies 53 screens across 7 flows. The prototype registers **48 routes**:

| Flow | Research Screens | Implemented Routes | Coverage |
|------|-----------------|-------------------|----------|
| Flow 1: Connections | 4 | 4 (`/connections`, `/connections/add`, `/connections/add/schemas`, `/connections/:id`) | 100% |
| Flow 2: Scanning & Classification | 10 | 10 (`/scans`, `/scans/:id`, `/scans/:id/summary`, `/review`, `/review/table/:id`, `/review/rules`, `/review/rules/create`, `/review/rules/:id`, `/catalog`, `/catalog/:id`) | 100% |
| Flow 3: Risk Assessment | 4 | 4 (`/dashboard`, `/dashboard/risk/:id`, `/regulations`, `/regulations/:id`) | 100% |
| Flow 4: Remediation | 11 | 11 (`/remediation`, `/remediation/configure`, `/remediation/preview`, `/remediation/dryrun`, `/remediation/execute`, `/remediation/success`, `/remediation/approval/request`, `/remediation/approvals`, `/remediation/approval/:id`, `/remediation/:id/rollback`, `/remediation/:id`) | 100% |
| Flow 5: Policies | 8 | 7 (`/policies`, `/policies/templates`, `/policies/create`, `/policies/create/tokens`, `/policies/create/scope`, `/policies/:id/diff`, `/policies/:id`) | 88% -- missing `/policies/create/review` (Review & Activate step) |
| Flow 6: Dashboard & Monitoring | 6 | 1 (`/reports`) + Universal Search (overlay, not route) | 33% -- missing `/settings` detail screen, missing dedicated monitoring/activity screens |
| Flow 7: Onboarding | 10 | 10 (`/onboarding`, `/onboarding/dashboard`, `/onboarding/connect`, `/onboarding/scan`, `/onboarding/review`, `/onboarding/score`, `/onboarding/remediate`, `/onboarding/monitor`, `/onboarding/demo`, `/onboarding/complete`) | 100% |
| **Total** | **53** | **48** | **~91%** |

### Missing Screens

1. **Policy Create Review & Activate** (Flow 5): The wizard has Basics, Tokens, and Scope steps but no Review & Activate confirmation step.
2. **Settings page**: Referenced in sidebar navigation but has no registered route or render function (will show empty/error content).
3. **Activity Log / Monitoring dashboard**: The research specifies activity monitoring screens. Reports exist but dedicated monitoring views don't.
4. **Scan Freshness Heatmap**: Specified in Flow 6 for the dashboard, partially implemented inline in the dashboard view but not as a standalone feature.

### Persona Workflow Support

| Persona | Primary Workflows | Supported? |
|---------|------------------|------------|
| **Jordan (Data Engineer)** | Connect sources, run scans, monitor infrastructure | Yes -- Flow 1 and Flow 2 scan phase fully implemented |
| **Priya (Governance Analyst)** | Review classifications, define policies, track compliance | Yes -- Review Queue with Rules tab, Policy management, Regulations views all present |
| **Marcus (VP Security)** | Dashboard, risk scores, compliance reports | Yes -- Executive dashboard with risk gauge, compliance overview, and report generation. Onboarding demo path specific to Marcus implemented |

### Cross-Flow Navigation

| Navigation Path | Status |
|-----------------|--------|
| Connection > Scan (Save + Start Scan) | Implemented via wizard flow |
| Dashboard > Connection (health widget click) | Implemented -- connection status links to connection list |
| Dashboard > Remediation (risk factor click) | Implemented -- risk items link to remediation |
| Review Queue > Data Catalog | Implemented -- table links navigate to catalog detail |
| Onboarding > Main flows | Implemented -- each onboarding step links to corresponding main flow |
| Universal Search (Cmd+K) | Implemented -- searches connections, tables, policies, regulations |
| Sidebar badge counts | Implemented -- Review Queue and Remediation show pending counts |

### Edge Cases

| Category | Specified | Implemented? |
|----------|----------|-------------|
| Empty states | All flows | Partially -- data table shows "No data available" placeholder; dedicated empty states exist for `emptyState` component but not used consistently |
| Error states | Connection errors, scan failures | Yes -- connection error display, scan failure state |
| Loading states | Scan progress, connection test | Yes -- scan progress animation, connection test simulation |
| Confirmation dialogs | Delete connection, policy disable | Partially -- modal component exists but not all destructive actions use confirmation |
| Keyboard navigation | Escape closes overlays, Cmd+K search | Yes -- Escape handler, Cmd+K search implemented |

---

## Recommendations

### Priority 1: Convert all CSS to semantic tokens (Critical)

This is the single highest-impact change. Replace every raw hex value in base.css, components.css, and charts.css with the corresponding `var(--sds-*)` semantic token. This unlocks dark mode for free since the token file already includes dark mode overrides.

Estimated effort: 2-3 hours for a systematic find-and-replace using the mapping table in `references/review-checklist.md`.

### Priority 2: Eliminate inline hex colors in JS files (Critical)

Refactor the ~293 inline style color references in JS files to use CSS classes or CSS custom properties. For chart colors that must be dynamic, use `getComputedStyle(document.documentElement).getPropertyValue('--sds-*')` to read token values at runtime.

### Priority 3: Add ARIA attributes to dynamic components (Critical)

Add `role`, `aria-label`, and `aria-selected` attributes to:
- Tab components (`role="tablist"`, `role="tab"`, `aria-selected`)
- Modal/drawer (`role="dialog"`, `aria-modal="true"`, `aria-label`)
- Icon-only buttons (`aria-label="[action]"`)
- Alert ribbon (`role="alert"`)
- Close buttons (`aria-label="Close"`)

### Priority 4: Add focus-visible styles to all interactive elements (Critical)

Extend the `focus-visible` pattern from `.btn` to all interactive elements: tabs, nav items, form elements, links, table rows.

### Priority 5: Fix non-system colors (Critical)

Replace the 13 off-palette colors identified in C3 with their closest token equivalents. The alert ribbon variants, progress bar fills, and stat card trends use custom colors that should map to the semantic status tokens.

### Priority 6: Add missing interactive states (Major)

Add hover states to clickable cards, active/pressed states to nav items, and disabled states to tabs and form selects.

### Priority 7: Implement missing screens (Major)

Add the Settings page route and the Policy Create Review step to reach 100% screen coverage against the UX research specification.

---

## Positive Findings

The following areas demonstrate strong design system compliance:

1. **Token file**: Complete and accurate copy of the canonical Software DS color tokens, including dark mode overrides.
2. **Icon system**: All 40+ icons follow the spec precisely -- 18x18 viewBox, stroke-based, 1.5px stroke-width, round caps/joins, `fill: none; stroke: currentColor`.
3. **Component architecture**: Clean separation of concerns -- CSS for styling, JS for rendering, HTML for shell. Component functions return strings and are composable.
4. **Typography**: Correct font stack (minus Oxygen/Ubuntu extras), correct `-webkit-font-smoothing: antialiased`, correct size scale (11px labels, 13px body, 14px default, 24px page title).
5. **Spacing utilities**: All utility classes follow the 8px grid (4, 8, 12, 16, 20, 24, 32, 48).
6. **Layout transitions**: Sidebar collapse uses the correct `cubic-bezier(0.4, 0, 0.2, 1)` easing.
7. **State transitions**: Buttons, tabs, and nav items use `0.15s ease` or `0.12s ease` as specified.
8. **Button system**: Complete state coverage (hover, active, disabled) across all 5 variants (primary, secondary, tertiary, danger, danger-outline).
9. **Screen coverage**: 91% of the 53 specified screens are implemented as navigable routes.
10. **Persona workflows**: All 3 personas (Jordan, Priya, Marcus) have dedicated entry points and optimized paths through the product.
11. **Data model**: Comprehensive mock data covers all entities with realistic relationships, enabling full flow demonstrations.
