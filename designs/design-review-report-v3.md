# Beacon Data Security Platform -- Design Review Report v3

**Date:** 2026-03-14
**Reviewer:** Senior Design Systems Engineer (automated audit)
**Scope:** Full prototype codebase audit against Software DS design system
**Baseline:** v2 report (46 findings). This report contains only **new** findings not previously documented.

---

## Severity Definitions

| Severity | Definition |
|----------|------------|
| **Critical** | Systemic issues affecting multiple files or introducing functional regressions |
| **Major** | Individual issues affecting accessibility, token compliance, or architectural consistency |
| **Minor** | Cosmetic deviations, style inconsistencies, or best-practice gaps |

---

## Findings

---

### C1 -- Incorrect Fallback Hex Values in flow5-policies.js

**Severity:** Critical
**Category:** Token Usage
**Description:** flow5-policies.js contains approximately 20 `var()` fallback values where the hex color does not match the referenced token's actual value in the design system. This is a distinct set from v2's C2 (which covered flow1/flow6/flow7). If CSS custom properties fail to load, the UI will render with incorrect colors throughout the Policy Management screens.

**File:** `/prototype/js/flow5-policies.js`

**Incorrect mappings found:**

| Token Referenced | Fallback Used | Correct Value |
|---|---|---|
| `--sds-interactive-primary-subtle` | `#E8EFF3` | `#D9EBED` |
| `--sds-status-info-text` | `#1A6FA3` | `#0C4A69` |
| `--sds-status-success-text` | `#4A7A0B` | `#62800B` |
| `--sds-status-warning-text` | `#8A6D00` | `#8A7515` |
| `--sds-color-warm-gray-300` | `#C8C3B8` | `#B0ABA2` |
| `--sds-status-error-bg` | `#FFF0EE` | `#FFEEEB` |
| `--sds-status-success-bg` | `#F0F7E6` | `#F4FAEB` |
| `--sds-status-warning-bg` | `#FFF8E1` | `#FCF9D9` |
| `--sds-bg-surface` | `#FAFAF7` | `#FAF8F5` |
| `--sds-status-error-text` | `#C14533` | `#BF5547` |
| `--sds-status-info-bg` | `#E8F4F8` | `#EBF4F5` |

**Suggested fix:** Replace each fallback hex with the correct value from `tokens/colors.css`. Consider a build-time or lint-time check to validate fallback values against the token source.

---

### C2 -- Inconsistent Event Handler Migration (flow1 and flow2)

**Severity:** Critical
**Category:** CSS Architecture
**Description:** The v2 report recommended migrating from `addEventListener` to `content.onclick` delegation to prevent event listener leaks (v2 C1). Flows 3--7 have been migrated, but flow1-connections.js and flow2-scanning.js still use `addEventListener` extensively. This creates an inconsistent architecture and means the original C1 leak problem persists in these two flows. Each navigation into and out of these screens accumulates orphaned listeners.

**Files:**
- `/prototype/js/flow1-connections.js` -- lines 269, 341, 497, 516, 522, 647, 829, 1042, 1072, 1079
- `/prototype/js/flow2-scanning.js` -- lines 205, 340, 350, 374, 385, 801, 1066

**Suggested fix:** Migrate flow1 and flow2 to the `content.onclick` delegation pattern used in flows 3--7. Remove all `addEventListener` calls that attach to `content` or `document` within render functions.

---

### C3 -- Raw Hex Colors in SVG Chart Rendering

**Severity:** Critical
**Category:** Token Usage
**Description:** charts.js and flow3-risk.js use raw hex color values for SVG stroke and fill attributes. While SVG attributes do not support `var()`, these values are not sourced from a central config and will drift from the design system over time. The same colors appear in multiple locations with no single source of truth.

**Files:**
- `/prototype/js/charts.js` -- lines 21-24 (`#7A9A01`, `#C4AA25`, `#CF6253`, `#BF5547`), line 26 (`#F4F1EB`), line 178 (`#013D5B`), line 185 (`#F4F1EB`)
- `/prototype/js/flow3-risk.js` -- lines 210-212 (`#7A9A01`, `#DB7060`, `#D0CBC3`), line 910 (`#7A9A01`, `#C4AA25`, `#DB7060`)

**Suggested fix:** Create a `ChartColors` constant object (similar to `Data.platformColors`) that maps semantic names to hex values, sourced from the design system tokens. Reference this object in all chart rendering code. Add a comment linking each value to its design system token.

---

### M1 -- No Skip-to-Content Link

**Severity:** Major
**Category:** Accessibility
**Description:** index.html has no skip-to-content link. Keyboard users must tab through the entire header and sidebar navigation on every page load before reaching the main content area. This is a WCAG 2.1 Level A failure (Success Criterion 2.4.1).

**File:** `/prototype/index.html`

**Suggested fix:** Add a visually-hidden skip link as the first focusable element in `<body>`:
```html
<a href="#main-content" class="skip-to-content">Skip to main content</a>
```
Add corresponding CSS in base.css and an `id="main-content"` on the `<main>` element.

---

### M2 -- No aria-live Regions for Dynamic Content Updates

**Severity:** Major
**Category:** Accessibility
**Description:** The application dynamically updates content in response to navigation, filtering, scanning progress, and search results, but does not use `aria-live` regions to announce these changes to screen readers. Users relying on assistive technology will not be notified when content changes.

**Affected areas:**
- Scan progress updates (flow2-scanning.js)
- Search results count and list (flow6-monitoring.js)
- Filter result counts after applying filters (all flows)
- Alert ribbon content changes (app.js)
- Form validation messages

**Suggested fix:** Add `aria-live="polite"` to content regions that update dynamically. For time-sensitive updates (scan progress), use `aria-live="assertive"`. Wrap status messages in an element with `role="status"`.

---

### M3 -- Schedule Modal Bypasses Components.modal()

**Severity:** Major
**Category:** Accessibility / CSS Architecture
**Description:** The schedule modal in flow6-monitoring.js is built with raw HTML strings instead of using the shared `Components.modal()` function. As a result, it is missing `role="dialog"` and `aria-modal="true"` attributes, and does not benefit from the standard modal styling and behavior.

**File:** `/prototype/js/flow6-monitoring.js` -- lines 305-313

**Suggested fix:** Refactor the schedule modal to use `Components.modal()`, which already includes the correct ARIA attributes (as fixed in v2 M2). Pass content as the modal body parameter.

---

### M4 -- No tabpanel Role on Tab Content Areas

**Severity:** Major
**Category:** Accessibility
**Description:** Tab interfaces throughout the prototype use `role="tablist"` and `role="tab"` on the tab bar, but the corresponding content panels lack `role="tabpanel"` and `aria-labelledby` associations. This breaks the ARIA tabs pattern (WAI-ARIA Authoring Practices).

**Files:** All flows that use `Components.tabs()`, and tab content rendering in flow1, flow2, flow3, flow4, flow5, flow6.

**Suggested fix:** Wrap each tab's content area in a container with `role="tabpanel"`, `aria-labelledby` pointing to the corresponding tab, and `tabindex="0"` for keyboard access. Update `Components.tabs()` to generate matching `id` attributes on tabs.

---

### M5 -- No Arrow Key Navigation Between Tabs

**Severity:** Major
**Category:** Accessibility
**Description:** The tab components do not support arrow key navigation. Per WAI-ARIA Authoring Practices, users should be able to move between tabs using left/right arrow keys, with Home/End to jump to first/last tab. Currently only click/tap interaction is supported.

**Files:** `/prototype/js/app.js` (tab handler setup), `/prototype/js/components.js` (tab rendering)

**Suggested fix:** Add a `keydown` event listener on the `[role="tablist"]` container that handles ArrowLeft, ArrowRight, Home, and End keys. Move focus and activate the corresponding tab. Use `roving tabindex` pattern (active tab gets `tabindex="0"`, others get `tabindex="-1"`).

---

### M6 -- Duplicate Local sensitivityTag() Functions

**Severity:** Major
**Category:** CSS Architecture
**Description:** v2's M9 was addressed by creating `Components.sensitivityTag()`, but flow2-scanning.js (lines 43-52) and flow4-remediation.js (lines 28-36) still contain their own local copies. This creates maintenance risk -- changes to the shared component will not propagate to these flows.

**File:**
- `/prototype/js/flow2-scanning.js` -- lines 43-52
- `/prototype/js/flow4-remediation.js` -- lines 28-36

**Suggested fix:** Delete the local `sensitivityTag()` functions and replace all call sites with `Components.sensitivityTag()`.

---

### M7 -- addEventListener on Overlay Elements Without Cleanup

**Severity:** Major
**Category:** CSS Architecture
**Description:** Several flows attach `addEventListener` to overlay backdrop elements or specific buttons within rendered content. These listeners are added each time the screen renders but never removed, accumulating on repeated navigation.

**Files:**
- `/prototype/js/flow5-policies.js` -- lines 1057, 1064
- `/prototype/js/flow6-monitoring.js` -- lines 218, 318
- `/prototype/js/flow7-onboarding.js` -- lines 1364, 1385

**Suggested fix:** For overlay dismissal, use the `content.onclick` delegation pattern with `e.target.closest()` or `e.target.matches()`. For one-off button handlers, use `{ once: true }` option or delegate through the page-level click handler.

---

### M8 -- Drawer Title Uses Inline Style Instead of CSS Class

**Severity:** Major
**Category:** CSS Architecture
**Description:** The shared `Components.drawer()` function applies drawer title styling via an inline `style` attribute (`font-size:16px;font-weight:600;`) rather than a CSS class. This bypasses the design system's typography tokens and cannot be overridden or themed.

**File:** `/prototype/js/components.js` -- line 285

**Suggested fix:** Add a `.drawer-title` class to components.css with the appropriate typography token values, and replace the inline style with `class="drawer-title"`.

---

### M9 -- Inline Toggle Switch Styles with Hardcoded Colors

**Severity:** Major
**Category:** Token Usage
**Description:** flow1-connections.js and flow5-policies.js both render inline toggle switch components with fully hardcoded styles (dimensions, colors, border-radius) in template strings. These use raw `#fff` and `rgba(0,0,0,0.2)` values and differ in dimensions from the `.form-toggle` CSS class defined in components.css.

**Files:**
- `/prototype/js/flow1-connections.js` -- line 1003
- `/prototype/js/flow5-policies.js` -- lines 1091-1093

**Suggested fix:** Use the existing `.form-toggle` CSS component class instead of inline styles. If the toggle needs variant sizing, extend the CSS class with a modifier (e.g., `.form-toggle--sm`).

---

### M10 -- Search Result Items Lack Keyboard Accessibility

**Severity:** Major
**Category:** Accessibility
**Description:** Search results in the universal search overlay (flow6-monitoring.js) are rendered as plain `<div>` elements without `tabindex`, `role`, or keyboard event handlers. Users cannot navigate to or select search results using the keyboard.

**File:** `/prototype/js/flow6-monitoring.js`

**Suggested fix:** Add `role="option"` to each result item with `tabindex="-1"`, wrap the list in a container with `role="listbox"`, and handle arrow key navigation to move focus between results. Alternatively, use `role="link"` with `tabindex="0"` and handle Enter/Space to activate.

---

### M11 -- Alert Ribbon Action Link Uses Inline Styles

**Severity:** Major
**Category:** CSS Architecture / Token Usage
**Description:** The alert ribbon action link in app.js uses an inline `style` attribute with hardcoded values (`font-weight:600;color:inherit;text-decoration:underline;`). This should be a CSS class to maintain consistency and allow theming.

**File:** `/prototype/js/app.js` -- line 190

**Suggested fix:** Add an `.alert-ribbon-action` class to components.css with the appropriate styles and replace the inline attribute.

---

### M12 -- Search Overlay Backdrop Uses Non-Tokenized rgba()

**Severity:** Major
**Category:** Token Usage
**Description:** The search overlay backdrop in flow6-monitoring.js uses `rgba(0,0,0,0.4)` directly in an inline style rather than the design system's overlay token.

**File:** `/prototype/js/flow6-monitoring.js` -- line 333

**Suggested fix:** Use `var(--sds-bg-overlay)` (defined in tokens.css) or add an overlay backdrop CSS class that references the token.

---

### m1 -- Raw Hex in flow7 Progress Tracker Circles

**Severity:** Minor
**Category:** Token Usage
**Description:** The onboarding progress tracker uses raw `#fff` for circle text color instead of a design system token.

**File:** `/prototype/js/flow7-onboarding.js` -- lines 81, 85

**Suggested fix:** Replace `#fff` with the semantic token value. Since this is in an SVG context, use `white` or extract to a constant referencing `--sds-text-on-primary`.

---

### m2 -- Confetti Animation Uses Raw Hex Color Array

**Severity:** Minor
**Category:** Token Usage
**Description:** The onboarding completion confetti effect uses a hardcoded array of hex colors with no reference to design system tokens.

**File:** `/prototype/js/flow7-onboarding.js` -- line 1296

**Colors:** `['#77B2C7', '#98B43B', '#EBCE2D', '#A6CBD6', '#C0EAF2']`

**Suggested fix:** Extract to a named constant and add comments mapping each color to its design system token equivalent.

---

### m3 -- Off-Scale Font Size in Onboarding

**Severity:** Minor
**Category:** Typography
**Description:** flow7-onboarding.js uses `font-size:28px` which does not exist in the type scale (which defines 12, 13, 14, 16, 20, 24, 32px).

**File:** `/prototype/js/flow7-onboarding.js` -- line 171

**Suggested fix:** Use `font-size:24px` (h1) or `font-size:32px` (display) from the type scale.

---

### m4 -- Inconsistent Search Input Font Sizes

**Severity:** Minor
**Category:** Typography
**Description:** The universal search input in flow6-monitoring.js uses `font-size:16px` inline, while the filter bar search inputs across other flows use `font-size:13px` from CSS. This creates an inconsistent text input appearance.

**Files:**
- `/prototype/js/flow6-monitoring.js` -- search input inline style
- `/prototype/css/components.css` -- `.filter-bar input` at 13px

**Suggested fix:** Decide on a single search input size (16px for prominent search, 13px for inline filter search is acceptable if intentional). Document the distinction or unify to a single size using a CSS class.

---

### m5 -- Inline Spacer Divs Instead of Utility Classes

**Severity:** Minor
**Category:** Spacing & Layout
**Description:** Multiple flow files use `<div style="height:Npx;"></div>` spacer divs for vertical spacing instead of the spacing utility classes defined in base.css (`.mt-8`, `.mb-16`, etc.). This makes spacing harder to audit and adjust globally.

**Files:** Appears across flow1 through flow7 in template strings.

**Suggested fix:** Replace inline spacer divs with margin/padding utility classes on adjacent elements. Where no element exists to attach the class, use a `<div class="mt-16"></div>` utility div instead of an inline style.

---

### m6 -- Radio/Checkbox Inputs Missing Custom Focus Styles

**Severity:** Minor
**Category:** Component States
**Description:** Custom-styled radio buttons and checkboxes in forms do not have a visible `:focus-visible` style that matches the design system's focus ring token. The browser default focus outline is suppressed by the custom styling but not replaced.

**File:** `/prototype/css/components.css` -- form input styles

**Suggested fix:** Add `:focus-visible` rules for `.form-radio` and `.form-checkbox` using the `--sds-focus-ring` token, matching the pattern used for buttons and other interactive elements.

---

### m7 -- flow6 Email Pill Tags Use Wrong Fallback Hex

**Severity:** Minor
**Category:** Token Usage
**Description:** Email pill tags in the reports screen use `#E8EEF0` as the fallback for `--sds-interactive-primary-subtle`, which should be `#D9EBED`.

**File:** `/prototype/js/flow6-monitoring.js` -- lines 137, 279-280

**Suggested fix:** Replace `#E8EEF0` with `#D9EBED`.

---

### m8 -- flow7 Wrong Fallback for Red Color Token

**Severity:** Minor
**Category:** Token Usage
**Description:** flow7-onboarding.js uses `#CF6253` as the fallback for what appears to reference `--sds-color-red-500`, but the actual red-500 value is `#BF5547`. The value `#CF6253` corresponds to `--sds-color-red-450`, indicating a token/value mismatch.

**File:** `/prototype/js/flow7-onboarding.js` -- line 805

**Suggested fix:** Verify the intended token and use the correct corresponding hex value.

---

### m9 -- Coach Mark Dismiss Button Missing Hover/Focus States

**Severity:** Minor
**Category:** Component States
**Description:** The onboarding coach mark dismiss button (flow7) has no hover or focus-visible styles defined, either in CSS or via inline styles. This leaves users without visual feedback when interacting with the control.

**File:** `/prototype/js/flow7-onboarding.js` -- coach mark rendering

**Suggested fix:** Add hover and focus-visible styles to the dismiss button, either through a CSS class (preferred) or by ensuring the button uses an existing styled component class like `.btn-ghost`.

---

### m10 -- Platform Colors Duplicated Across Files

**Severity:** Minor
**Category:** CSS Architecture
**Description:** Platform brand colors (Snowflake blue, AWS orange, Azure blue, etc.) are defined in `Data.platformColors` (data.js lines 206-213) but also hardcoded again in flow7-onboarding.js (lines 131-134). Any brand color update requires changes in multiple locations.

**File:**
- `/prototype/js/data.js` -- lines 206-213
- `/prototype/js/flow7-onboarding.js` -- lines 131-134

**Suggested fix:** Remove the duplicate definitions in flow7 and reference `Data.platformColors` exclusively.

---

## Summary Table

| ID | Severity | Category | Description | File(s) |
|----|----------|----------|-------------|---------|
| C1 | Critical | Token Usage | ~20 wrong fallback hex values in flow5-policies.js | flow5-policies.js |
| C2 | Critical | CSS Architecture | flow1 and flow2 not migrated to content.onclick pattern | flow1-connections.js, flow2-scanning.js |
| C3 | Critical | Token Usage | Raw hex colors in SVG chart rendering with no central source | charts.js, flow3-risk.js |
| M1 | Major | Accessibility | No skip-to-content link | index.html |
| M2 | Major | Accessibility | No aria-live regions for dynamic content | Multiple flows |
| M3 | Major | Accessibility | Schedule modal bypasses Components.modal() | flow6-monitoring.js |
| M4 | Major | Accessibility | No tabpanel role on tab content areas | Multiple flows |
| M5 | Major | Accessibility | No arrow key navigation between tabs | app.js, components.js |
| M6 | Major | CSS Architecture | Duplicate local sensitivityTag() in flow2 and flow4 | flow2-scanning.js, flow4-remediation.js |
| M7 | Major | CSS Architecture | addEventListener on overlays without cleanup | flow5, flow6, flow7 |
| M8 | Major | CSS Architecture | Drawer title uses inline style instead of CSS class | components.js |
| M9 | Major | Token Usage | Inline toggle switches with hardcoded colors | flow1-connections.js, flow5-policies.js |
| M10 | Major | Accessibility | Search result items lack keyboard accessibility | flow6-monitoring.js |
| M11 | Major | CSS Architecture | Alert ribbon action link uses inline styles | app.js |
| M12 | Major | Token Usage | Search overlay backdrop uses non-tokenized rgba() | flow6-monitoring.js |
| m1 | Minor | Token Usage | Raw #fff in flow7 progress tracker | flow7-onboarding.js |
| m2 | Minor | Token Usage | Confetti colors as raw hex array | flow7-onboarding.js |
| m3 | Minor | Typography | Off-scale font-size:28px in onboarding | flow7-onboarding.js |
| m4 | Minor | Typography | Inconsistent search input font sizes | flow6-monitoring.js, components.css |
| m5 | Minor | Spacing & Layout | Inline spacer divs instead of utility classes | Multiple flows |
| m6 | Minor | Component States | Radio/checkbox missing custom focus styles | components.css |
| m7 | Minor | Token Usage | Wrong fallback hex on email pill tags | flow6-monitoring.js |
| m8 | Minor | Token Usage | Wrong fallback hex for red token | flow7-onboarding.js |
| m9 | Minor | Component States | Coach mark dismiss button missing hover/focus | flow7-onboarding.js |
| m10 | Minor | CSS Architecture | Platform colors duplicated across files | data.js, flow7-onboarding.js |

---

## Totals

| Severity | Count |
|----------|-------|
| Critical | 3 |
| Major | 12 |
| Minor | 10 |
| **Total** | **25** |

---

## Category Breakdown

| Category | Count |
|----------|-------|
| Token Usage | 9 |
| Accessibility | 5 |
| CSS Architecture | 7 |
| Typography | 2 |
| Spacing & Layout | 1 |
| Component States | 2 |

---

*Report generated as part of a systematic audit of all prototype source files against the Software DS design system. Only new findings not present in the v2 report are included.*
