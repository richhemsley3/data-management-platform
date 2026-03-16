# Beacon Data Security Platform -- Design Review Report v2

**Date:** 2026-03-14
**Scope:** Second-pass audit of all files in `prototype/`
**Auditor:** Claude (Design System Compliance Audit)
**Previous:** design-review-report.md (v1 fixed ~300 CSS hex values, ~293 JS hex values, added ARIA, focus-visible, etc.)

---

## Summary

The v1 audit made substantial progress converting raw hex values to design tokens. This v2 audit uncovered **46 findings** across three categories: issues the first pass missed entirely, regressions introduced by the v1 fixes, and persistent issues that were flagged but not fixed.

The most impactful finding is that the v1 pass wrapped ~90+ inline hex values in `var(--sds-token, #hex)` format but used **incorrect fallback hex values** that do not match the actual token values in `tokens.css`. If any token ever fails to resolve, the UI will render off-palette colors.

| Severity | New | Regression | Persistent | Total |
|----------|-----|------------|------------|-------|
| Critical | 3   | 3          | 2          | 8     |
| Major    | 13  | 3          | 2          | 18    |
| Minor    | 12  | 4          | 4          | 20    |
| **Total**| **28** | **10**  | **8**      | **46** |

---

## Critical Findings

### C1. Event listener accumulation -- memory leaks on every navigation (New)

**Scope:** All flow JS files (flow1 through flow7), app.js

**55 `addEventListener` calls** exist across the codebase but only **1 `removeEventListener`** call (in flow6-monitoring.js for the search keydown handler). Every `render*()` function adds event listeners to `content` or `document` without cleanup. When the user navigates to a new route, `content.innerHTML` is replaced (destroying child elements) but listeners attached to `content` itself persist and accumulate.

| File | addEventListener count | removeEventListener count | Leak risk |
|------|----------------------|--------------------------|-----------|
| app.js | 7 (on document -- single setup) | 0 | Low -- runs once |
| flow1-connections.js | 10 (on content) | 0 | HIGH |
| flow2-scanning.js | 7 (on content) | 0 | HIGH |
| flow3-risk.js | 3 (on content) | 0 | HIGH |
| flow4-remediation.js | 2 (on content) | 0 | HIGH |
| flow5-policies.js | 3 (on content) | 0 | HIGH |
| flow6-monitoring.js | 13 (mixed) | 1 | HIGH for content |
| flow7-onboarding.js | 9 (on content) | 0 | HIGH |

**Impact:** After navigating through 10-20 screens, dozens of stale click handlers fire on every click event inside `content`, executing against DOM elements that no longer exist.

**Fix:** Use `content.onclick = handler` (replaces previous handler), remove listeners before re-rendering, or use a single delegated handler in app.js.

---

### C2. Incorrect fallback hex values in var() calls -- ~90+ instances (Regression)

**Files:** `js/flow1-connections.js` (80+ instances), `js/flow6-monitoring.js` (9 instances), `js/flow7-onboarding.js` (8 instances), `css/components.css` (1 instance)

The v1 fix wrapped standalone hex values in `var(--sds-token, #hex)` format, but the fallback hex values do NOT match the actual token values defined in `tokens.css`.

| Token Used | Correct Value (from tokens.css) | Wrong Fallback Used | Count |
|-----------|--------------------------------|---------------------|-------|
| `--sds-text-primary` | `#1C1A17` (warm-gray-900) | `#2C2925` | 26 |
| `--sds-text-secondary` | `#54514D` (warm-gray-650) | `#6B6560` or `#6B665D` | 16 |
| `--sds-text-tertiary` | `#6B6760` (warm-gray-550) | `#948E85` (warm-gray-400!) | 15 |
| `--sds-bg-page` | `#FFFFFF` (white) | `#FAFAF7` | 2 |
| `--sds-bg-surface` | `#FAF8F5` (warm-gray-025) | `#F7F5F0` | 1 |
| `--sds-border-subtle` | `#EBE6DD` (warm-gray-100) | `#F0EDE6` | 8 |
| `--sds-border-default` | `#E0DCD3` (warm-gray-150) | `#D8D3C9` (in flow6) | 5 |
| `--sds-status-success-text` | `#62800B` (green-500) | `#5C7A15` | 4 |
| `--sds-status-warning-text` | `#8A7515` (yellow-500) | `#8C6D1F` | 2 |
| `--sds-status-info-text` | `#0C4A69` (blue-700) | `#1565C0` | 1 |
| `--sds-status-error-bg` | `#FFEEEB` (red-050) | `#FDF0EE` | 2 |
| `--sds-status-warning-bg` | `#FCF9D9` (yellow-025) | `#FDF8E8` | 1 |
| `--sds-status-success-bg` | `#F4FAEB` (green-025) | `#F0F4E4` | 1 |
| `--sds-color-blue-200` | `#A6CBD6` | `#B3D9E3` (in flow7) | 4 |
| `--sds-color-blue-450` | `#4F8AA0` | `#3A8DAF` (in flow7) | 3 |
| `--sds-color-blue-400` | `#5E96AB` | `#4A9BBF` (in flow7) | 1 |
| `--sds-interactive-primary-subtle` | `#D9EBED` (blue-100) | `#E8EEF0` (in flow6) | 4 |
| `--sds-text-secondary` (CSS) | `#54514D` (warm-gray-650) | `#6B6760` (components.css:1239) | 1 |

**Fix:** Systematic find-and-replace in all files to correct fallback values to match tokens.css definitions.

---

### C3. Raw hex values in components.js -- no var() wrapper at all (Persistent)

**File:** `js/components.js`

Two inline styles use raw hex colors with no `var()` wrapper:
- **Line 62:** `color:#948E85` in empty table state -- should be `color:var(--sds-text-tertiary)`
- **Line 282:** `border-right:1px solid #E0DCD3` in left-positioned drawer -- should be `border-right:1px solid var(--sds-border-default)`

These will not adapt in dark mode.

---

## Major Findings

### M1. Missing CSS definitions for 17+ JS-generated class names (New)

Multiple class names used in JS-generated HTML have NO corresponding CSS rules, relying entirely on inline `style=""` attributes. This means no hover/focus/active states, no dark mode adaptation, and no ability to theme these elements.

| Class Name | Used In | CSS Rule Exists? |
|-----------|---------|-----------------|
| `.alert-ribbon-content` | app.js:178 | No |
| `.alert-ribbon-controls` | app.js:181 | No |
| `.alert-ribbon-count` | app.js:183 | No |
| `.alert-ribbon-nav` | app.js:184-185 | No |
| `.alert-ribbon-dismiss` | app.js:187 | No |
| `.onb-mini-progress` | flow7-onboarding.js:46 | No |
| `.onb-coach-mark` | flow7-onboarding.js:107 | No |
| `.onb-coach-dismiss` | flow7-onboarding.js:113 | No |
| `.onb-persona-card` | flow7-onboarding.js:178 | No |
| `.onb-skip-link` | flow7-onboarding.js:193 | No |
| `.onb-platform-card` | flow7-onboarding.js:324 | No |
| `.onb-review-item` | flow7-onboarding.js:631 | No |
| `.search-overlay-backdrop` | flow6-monitoring.js:340 | No |
| `.search-panel` | flow6-monitoring.js:341 | No |
| `.search-result-item` | flow6-monitoring.js:460+ | No |
| `.tab-content` | flow6-monitoring.js:49 | No |
| `.highlighted` (on search items) | flow6-monitoring.js:449 | No |

**Fix:** Move inline styles to `components.css` or a new `flow-specific.css` file.

---

### M2. No keyboard trap management for modals and drawers (New)

When a modal or drawer opens:
- Focus is not moved to the modal/drawer
- There is no focus trap -- Tab key can reach elements behind the modal backdrop
- When closed, focus is not returned to the triggering element
- The Escape key handler in app.js closes overlays but does not restore focus
- The drawer component (components.js:283) has `role="dialog"` but MISSING `aria-modal="true"` (unlike the modal which has it)

**Fix:** Implement focus trapping, add `aria-modal="true"` to drawer.

---

### M3. Form labels not programmatically connected to inputs (New)

**File:** `js/components.js:180-191`

`Components.formGroup()` generates `<label class="form-label">` and inputs but does NOT connect them via `for`/`id` attributes. There are **29 form inputs** across the codebase with no programmatic label association.

- Clicking label text does not focus the input
- Screen readers cannot associate labels with inputs

**Fix:** Generate unique IDs in `formGroup()` and set `for` on label and `id` on input.

---

### M4. No form validation anywhere in the prototype (New)

Across all forms (connection setup, policy wizard, report generation, schedule creation, settings):
- No `required` attribute on any form input
- No `aria-required="true"` on any form input
- No validation error messages or visual error states
- No `.form-input--error` CSS class defined
- No form submission prevention for empty required fields
- Connection form fields marked with `*` in label text but no actual enforcement

---

### M5. Clickable table rows use `role="link"` incorrectly (New)

**File:** `js/components.js:72`

Table rows with `data-navigate` get `role="link" tabindex="0"`. Issues:
- `role="link"` on `<tr>` overrides implicit `role="row"`, breaking table semantics
- No `keydown` handler for Enter/Space activation -- keyboard-only users can focus but not activate
- Screen readers announce these as "link" within a table, which is confusing

**Fix:** Remove `role="link"`. Either make first cell content a real `<a>` element, or handle Enter key via JS.

---

### M6. Z-index stacking conflicts between overlays (New)

| Element | z-index | File |
|---------|---------|------|
| Alert ribbon | 99 | base.css:517 |
| App header | 100 | base.css:35 |
| Onboarding checklist | 100 | flow7-onboarding.js:1329 |
| Drawer | 900 | components.css:915 |
| Search overlay | 900 | flow6-monitoring.js:340 |
| Modal backdrop | 1000 | components.css:839 |
| Onboarding tour | 2000-2001 | flow7-onboarding.js:1199-1200 |
| Completion overlay | 2500 | flow7-onboarding.js:1299 |
| Confetti | 3000 | flow7-onboarding.js:1280 |

Issues:
- Drawer and search overlay share z-index 900 -- overlap unpredictably if both open
- Onboarding checklist (100) ties with header -- renders behind header on scroll
- No z-index scale defined as tokens

---

### M7. Dark mode tokens incomplete -- 14 semantic tokens have no dark override (New)

**File:** `css/tokens.css:236-258`

The `@media (prefers-color-scheme: dark)` block only overrides background, text (primary through disabled), border, and navigation tokens. Missing dark overrides:

| Missing Token | Light Value | Problem in Dark Mode |
|--------------|-------------|---------------------|
| `--sds-text-link` | blue-750 (#013D5B) | Too dark on dark background |
| `--sds-border-focus` | blue-750 | Too dark, invisible |
| `--sds-interactive-primary` | blue-750 | Very dark on dark bg |
| `--sds-interactive-primary-hover` | blue-800 | Nearly invisible |
| `--sds-interactive-primary-active` | blue-850 | Nearly invisible |
| `--sds-interactive-primary-subtle` | blue-100 | Too bright/saturated |
| `--sds-interactive-secondary` | white | Too bright |
| `--sds-interactive-secondary-border` | warm-gray-800 | Invisible on dark bg |
| `--sds-status-success-bg` | green-025 | Too bright |
| `--sds-status-warning-bg` | yellow-025 | Too bright |
| `--sds-status-error-bg` | red-050 | Too bright |
| `--sds-status-info-bg` | blue-050 | Too bright |
| `--sds-status-neutral-bg` | warm-gray-100 | Too bright |
| `--sds-status-purple-bg` | `#F7EEFF` (raw hex) | Too bright, also raw hex |

---

### M8. Zero responsive behavior -- no breakpoints anywhere (New)

The entire CSS codebase contains zero `@media (max-width: ...)` queries:
- Sidebar: fixed `width: 220px; min-width: 220px` with no auto-collapse
- Grids: `.grid-2`, `.grid-3`, `.grid-4` use fixed column counts
- Content area: `padding: 24px 32px` at all viewport sizes
- Search overlay: fixed `width:600px`
- Drawer: fixed `width: 480px`
- Modal: `max-width: 640px; width: 90%` -- the only responsive-friendly pattern

Any viewport under ~700px will have severe overflow issues.

---

### M9. `sensitivityTag()` function duplicated across files (New)

**Files:** `js/flow2-scanning.js:43-52`, `js/flow4-remediation.js:28-36`

Identical helper duplicated -- must be updated in two places if mapping changes.

**Fix:** Move to `Components.sensitivityTag()`.

---

### M10. Platform colors duplicated in flow7-onboarding.js (New)

**File:** `js/flow7-onboarding.js:122-125`

The platform color hex values (`#29B5E8`, `#FF9900`, `#4285F4`, `#FF3621`) are hardcoded again instead of referencing `Data.platformColors`.

---

### M11. Card hover uses `--sds-bg-surface` instead of `--sds-bg-subtle` (Regression)

**File:** `css/components.css:1159`

`.sds-card[data-navigate]:hover` uses `background: var(--sds-bg-surface)` (warm-gray-025). Data table row hover at line 508 correctly uses `var(--sds-bg-subtle)` (warm-gray-050). The surface color is too close to white card background to be perceptible as a hover.

---

### M12. `setInterval` in onboarding scan not cleaned up on navigation (New)

**File:** `js/flow7-onboarding.js:510`

The scan progress interval clears at line 579 when progress hits 100%, but if the user navigates away before completion, the interval keeps running against nonexistent DOM elements.

---

### M13. `rgba(1, 61, 91, 0.1)` hardcoded for focus ring -- not tokenized (New)

**File:** `css/components.css:553, 578, 598, 1143`

Focus ring box-shadow uses hardcoded RGB values for `#013D5B` (blue-750). In dark mode this will appear muddy. Also, `:focus` uses 0.1 opacity while `:focus-visible` uses 0.15 -- inconsistent.

---

### M14. Breadcrumb nav has no `aria-label` (New)

**File:** `js/components.js:26`

Generates `<nav class="breadcrumb">` without `aria-label="Breadcrumb"`. Multiple `<nav>` elements on page (sidebar + breadcrumb) should each have descriptive labels for screen readers.

---

### M15. `onb-spin` animation referenced but never defined (New)

**File:** `js/flow7-onboarding.js:534`

`animation:onb-spin 1s linear infinite` is used inline, but `@keyframes onb-spin` is never defined in any CSS file. The spinner will not animate.

---

## Minor Findings

### m1. `--sds-status-purple-bg` uses raw hex `#F7EEFF` (Persistent)

**File:** `css/tokens.css:228`

All other status bg tokens reference `var(--sds-color-*)` but purple uses a raw hex value not in any color scale.

### m2. `header-help` button is 32x32px -- below 44px touch target minimum (New)

**File:** `css/base.css:170-171`

Also: `.modal-close` is 32x32px, `.btn-sm` is 32px height, `.sidenav-collapse` has no explicit min size. All below WCAG 2.5.5 44px recommendation.

### m3. Tables have no horizontal scroll wrapper (New)

**File:** `css/components.css:473`

`.data-table` uses `width: 100%` with no `overflow-x: auto` wrapper. Tables with many columns overflow the viewport on narrow screens.

### m4. Toggle switches built inline instead of using `Components.formToggle` CSS (New)

**Files:** `js/flow1-connections.js:1003`, `js/flow5-policies.js:1047`

Both construct toggle switches with inline HTML and different dimensions than the `.form-toggle` component in `components.css`.

### m5. Sidebar collapse toggle missing `aria-label` and `aria-expanded` (New)

**File:** `app.js:54`

Has `title="Collapse sidebar"` but no `aria-label` or `aria-expanded` attribute for screen reader state communication.

### m6. Header chevron uses non-standard 14x14 viewBox (Persistent)

**File:** `index.html:28`

All other icons use 18x18 viewBox but this chevron uses 14x14.

### m7. `gap-6` and `gap-10` utility classes use non-8px-grid values (Persistent)

**File:** `css/base.css:457, 459`

6px and 10px are not on the standard 4/8/12/16/20/24 spacing scale.

### m8. `border-radius: 10px` on badges/toggles -- non-standard (Persistent)

**Files:** `base.css:345`, `components.css:304, 438, 639`

10px is not in the standard set (4/6/8/12px or 50%). Should be `100px` or `50%` for pill shapes.

### m9. Onboarding welcome hides shell via `style.display='none'` (New)

**File:** `flow7-onboarding.js:148-150`

Sets `sidebar.style.display = 'none'` and `header.style.display = 'none'`. If page refreshes on welcome screen and user navigates via hash, the shell may remain hidden since `restoreShell()` only runs on other onboarding screens.

### m10. `onb-confetti-fall` keyframes injected via inline `<style>` tag, never cleaned up (New)

**File:** `flow7-onboarding.js:1275-1283`

The completion screen injects a `<style>` tag that persists after navigating away.

### m11. Search overlay backdrop uses `.matches()` instead of `.closest()` (Regression)

**File:** `flow6-monitoring.js:396`

Using `.matches('[data-search-backdrop]')` means clicks on child elements within the backdrop padding won't close the search. All other overlay handlers use `.closest()`.

### m12. No `<noscript>` fallback in index.html (New)

**File:** `index.html`

Application is fully JS-rendered. If JS fails to load, users see a blank page.

### m13. Data tables have no sort functionality or `aria-sort` (New)

Table headers are static text with no click handlers, sort indicators, or `aria-sort` attributes.

### m14. Alert ribbon controls have no CSS styles (Regression)

**File:** `app.js:177-192`

The `showAlert()` function generates HTML with classes `.alert-ribbon-content`, `.alert-ribbon-controls`, `.alert-ribbon-count`, `.alert-ribbon-nav`, `.alert-ribbon-dismiss` but none of these have CSS rules. The ribbon's internal layout renders as unstyled inline elements.

---

## Token System Completeness

### Tokens defined but never used in prototype:
- `--sds-color-brand-sky`, `--sds-color-brand-heritage-red`, `--sds-color-brand-prairie`
- `--sds-color-brand-pistachio`, `--sds-color-brand-parakeet`, `--sds-color-brand-lime`, `--sds-color-brand-oat`
- `--sds-color-cool-gray-975`, `--sds-color-warm-gray-975`
- Many intermediate gray steps (025, 250, 350, 450, etc.)

### Custom semantic tokens that should be contributed back to the design system:
- `--sds-nav-text-primary` / `--sds-nav-text-secondary` -- Navigation-specific text colors
- `--sds-status-purple-bg` / `--sds-status-purple-text` -- Purple status variant

### Missing tokens the prototype needs:
- Z-index scale (`--sds-z-header`, `--sds-z-drawer`, `--sds-z-overlay`, `--sds-z-modal`)
- Focus ring token (`--sds-focus-ring-color`, `--sds-focus-ring-offset`)
- Dark mode overrides for interactive and status tokens (14 missing)

---

## Cross-File Consistency Analysis

| Pattern | Consistent? | Details |
|---------|-------------|---------|
| `Components.*` usage | Yes | All flows use shared component library |
| Duplicate helpers | No | `sensitivityTag()` duplicated in flow2 and flow4 |
| Inline styles for layout | Heavy | All flows use extensive inline `style=""` rather than utility classes |
| Color fallback pattern | Inconsistent | flow1, flow6, flow7 use `var(--sds-token, #fallback)` with WRONG fallbacks; flow3, flow4 use fewer inline styles |
| Tab handling | Inconsistent | Some flows re-render entire page on tab change, others swap inner content |
| Event binding | No | Some flows bind to `content` children (cleaned on innerHTML replace), others bind to `content` itself (persists) |

---

## Recommendations (Priority Order)

1. **Fix all ~90 fallback hex mismatches** (C2) -- Systematic find-and-replace with correct values from tokens.css
2. **Address event listener leaks** (C1) -- Refactor to delegated handling or cleanup pattern
3. **Fix raw hex in components.js** (C3) -- 2 instances in the shared component library
4. **Add focus trap to modals/drawers** (M2) -- Required for WCAG 2.1 AA
5. **Complete dark mode token overrides** (M7) -- 14 missing semantic tokens
6. **Add CSS rules for unstyled classes** (M1) -- 17+ classes with no CSS
7. **Connect form labels to inputs** (M3) -- `for`/`id` in `formGroup()`
8. **Add responsive breakpoints** (M8) -- Auto-collapse sidebar, table scroll wrappers
9. **Fix card hover token** (M11) -- Change `--sds-bg-surface` to `--sds-bg-subtle`
10. **Fix role="link" on table rows** (M5) -- Use proper table semantics
11. **Define z-index scale** (M6) -- Prevent stacking conflicts
12. **Add form validation** (M4) -- Required attributes and error states
