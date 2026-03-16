# Beacon Data Security Platform — Design System Compliance Report v4

**Date:** 2026-03-14
**Auditor:** Senior Design Systems Engineer
**Scope:** All prototype source files audited against Software DS token definitions
**Baseline:** v3 report (25 findings). This report contains only **new** findings not present in v1, v2, or v3.

---

## Findings

### C1 — Wrong Fallback Hex Values in flow1-connections.js (Critical)

**Category:** Token Usage
**File:** `prototype/js/flow1-connections.js`
**Lines:** Throughout (~30+ instances)

Multiple CSS custom property fallbacks use incorrect hex values that do not match the canonical token definitions in `colors.css`:

| Token | Fallback Used | Correct Value |
|---|---|---|
| `--sds-text-primary` | `#2C2925` | `#1C1A17` (warm-gray-900) |
| `--sds-text-secondary` | `#6B6560` | `#54514D` (warm-gray-650) |
| `--sds-status-success-text` | `#5C7A15` | `#62800B` (green-500) |
| `--sds-status-warning-text` | `#8C6D1F` | `#8A7515` (yellow-500) |
| `--sds-bg-page` | `#FAFAF7` | `#FFFFFF` |

**Impact:** When tokens fail to resolve, users see off-brand colors. Text contrast ratios may fall below WCAG AA thresholds.

**Suggested Fix:** Replace every fallback hex in flow1-connections.js with the correct value from `tokens/colors.css`. Consider extracting fallback constants to a shared module to prevent drift.

---

### C2 — Systematic Wrong Fallback for --sds-text-secondary in flow2-scanning.js (Critical)

**Category:** Token Usage
**File:** `prototype/js/flow2-scanning.js`
**Lines:** ~40+ occurrences throughout

Every `var(--sds-text-secondary, ...)` fallback in this file uses `#948E85` (warm-gray-400). The correct value is `#54514D` (warm-gray-650). This is a two-step mismatch — the fallback maps to a completely different token tier.

**Impact:** Secondary text renders significantly lighter than intended when tokens fail, reducing contrast and legibility. `#948E85` against a white background yields approximately 3.5:1 contrast, failing WCAG AA for normal text (requires 4.5:1).

**Suggested Fix:** Find-and-replace all `#948E85` fallbacks with `#54514D` across flow2-scanning.js.

---

### C3 — Event Listener Accumulation in Search Results (Critical)

**Category:** CSS Architecture / Performance
**File:** `prototype/js/flow6-monitoring.js`
**Lines:** 599–629

The `performSearch()` function attaches `mouseenter`, `mouseleave`, and `click` listeners to each search result item. This function is called on every keystroke via the search input handler. Since results are rebuilt each time (innerHTML replacement), old DOM nodes are discarded but the pattern creates unnecessary overhead — and if any external references retain the old nodes, listeners accumulate without cleanup.

**Impact:** Potential memory pressure during extended search sessions. Pattern is fragile and error-prone.

**Suggested Fix:** Use event delegation on the results container with a single set of `mouseenter`/`mouseleave`/`click` handlers, consistent with the `content.onclick` delegation pattern used in flows 3–7.

---

### M1 — Wrong Fallback Hex Values in flow6-monitoring.js (Major)

**Category:** Token Usage
**File:** `prototype/js/flow6-monitoring.js`
**Lines:** Search overlay section

| Token | Fallback Used | Correct Value |
|---|---|---|
| `--sds-border-default` | `#D8D3C9` | `#E0DCD3` (warm-gray-150) |
| `--sds-text-disabled` | `#C4BFB5` | `#B0ABA2` (warm-gray-300) |
| `--sds-text-secondary` | `#6B665D` | `#54514D` (warm-gray-650) |

**Impact:** Borders and disabled text render at incorrect tones when tokens fail to resolve.

**Suggested Fix:** Correct each fallback hex to match the canonical token value.

---

### M2 — Wrong Fallback Hex Values in flow7-onboarding.js (Major)

**Category:** Token Usage
**File:** `prototype/js/flow7-onboarding.js`
**Lines:** 128, 130, 467, 481, 483, 718, 848, 1149, 1325

| Token | Fallback Used | Correct Value | Lines |
|---|---|---|---|
| `--sds-color-blue-200` | `#B3D9E3` | `#A6CBD6` | 128, 481, 718, 848 |
| `--sds-color-blue-450` | `#3A8DAF` | `#4F8AA0` | 130, 483, 1149 |
| `--sds-color-blue-400` | `#4A9BBF` | `#5E96AB` | 467 |
| `--sds-status-success-bg` | `#EDF4DC` | `#F4FAEB` | 1325 |

**Impact:** Onboarding visuals (progress rings, persona cards, completion states) render in off-brand blues and greens when tokens fail.

**Suggested Fix:** Replace each fallback with the correct hex from `tokens/colors.css`.

---

### M3 — Wrong CONFETTI_COLORS Token Mapping Comments (Major)

**Category:** Token Usage / Documentation
**File:** `prototype/js/flow7-onboarding.js`
**Lines:** 23–24

The `CONFETTI_COLORS` constant has comments that mislabel token tiers:
- Line 23: `#98B43B` is labeled `green-500` but is actually `green-300`
- Line 24: `#EBCE2D` is labeled `yellow-500` but is actually `yellow-200`

**Impact:** Misleading comments cause maintainers to believe the wrong token tier is in use. If someone "corrects" the hex to match the comment, the colors would shift significantly.

**Suggested Fix:** Update comments to reflect the actual token tier, or update the hex values to match the labeled tier if the intent was to use green-500 and yellow-500.

---

### M4 — Raw rgba() Overlay Values in flow7-onboarding.js (Major)

**Category:** Token Usage
**File:** `prototype/js/flow7-onboarding.js`
**Lines:** 1221, 1321, 1351

Three overlay backgrounds use raw `rgba()` values instead of design system tokens:
- Line 1221: `rgba(0,0,0,0.3)` — tour step overlay
- Line 1321: `rgba(0,0,0,0.2)` — completion overlay
- Line 1351: `rgba(0,0,0,0.2)` — additional overlay

**Impact:** Overlay opacities are not governed by the design system. Changes to the system's overlay token would not propagate here.

**Suggested Fix:** Use `var(--sds-bg-overlay, rgba(0,0,0,0.3))` or the appropriate overlay token. If no overlay token exists, propose one to the design system.

---

### M5 — addEventListener Without Cleanup in flow7-onboarding.js (Major)

**Category:** CSS Architecture
**File:** `prototype/js/flow7-onboarding.js`
**Lines:** 1102 (slider), 1376 (exploreBtn), 1397 (dismissBtn)

Three elements use `addEventListener` for click/input handlers. When the onboarding view is re-entered or torn down, these listeners are not removed, creating potential for duplicate handler execution.

**Impact:** Repeated entry into the onboarding flow could stack duplicate event handlers.

**Suggested Fix:** Migrate to the `content.onclick` delegation pattern used in other flows, or store references and call `removeEventListener` on view teardown.

---

### M6 — Missing focus-visible States on Onboarding Interactive Elements (Major)

**Category:** Accessibility / Component States
**File:** `prototype/js/flow7-onboarding.js`
**Lines:** Persona cards (~lines 460–520), review items, tour navigation dots

Persona selection cards, review checklist items, and tour navigation dots are interactive (clickable) but have no `:focus-visible` outline or ring defined. Keyboard users cannot see which element is focused.

**Impact:** WCAG 2.1 SC 2.4.7 (Focus Visible) failure. Keyboard-only users cannot navigate the onboarding flow.

**Suggested Fix:** Add `outline: 2px solid var(--sds-border-focus)` on `:focus-visible` for all interactive onboarding elements. Ensure elements are reachable via Tab key (add `tabindex="0"` where needed) and include `role="button"` or use semantic `<button>` elements.

---

### M7 — Off-Scale Font Size 28px in flow7-onboarding.js (Major)

**Category:** Typography
**File:** `prototype/js/flow7-onboarding.js`
**Line:** 1179

An inline `font-size:28px` is used for a heading or value display. The Software DS type scale does not include 28px — the nearest valid sizes are 24px and 32px.

**Impact:** Inconsistent type hierarchy. The same off-scale value also appears in `components.css` (see m1 below), suggesting a systemic gap.

**Suggested Fix:** Use 24px (`--sds-font-size-xl`) or 32px (`--sds-font-size-2xl`) depending on the intended visual weight.

---

### m1 — Off-Scale Font Size 28px in components.css stat-card-value (Minor)

**Category:** Typography
**File:** `prototype/css/components.css`
**Line:** 1054

`.stat-card-value` uses `font-size: 28px`, which is not on the Software DS type scale.

**Impact:** Minor visual inconsistency. The value falls between scale steps.

**Suggested Fix:** Use 24px or 32px per the type scale.

---

### m2 — Raw fill="white" in flow7-onboarding.js SVG (Minor)

**Category:** Token Usage
**File:** `prototype/js/flow7-onboarding.js`
**Line:** 178

An inline SVG uses `fill="white"` as a raw color value instead of referencing a token constant.

**Impact:** SVG attributes cannot use `var()`, but the value should reference a centralized constant (as done in `charts.js` with `ChartColors`) for maintainability.

**Suggested Fix:** Define a constant (e.g., `const SVG_WHITE = '#FFFFFF'`) or reference an existing constant and use it in the SVG attribute.

---

### m3 — Inline Style on confirmModal Paragraph in components.js (Minor)

**Category:** CSS Architecture
**File:** `prototype/js/components.js`
**Line:** 466

The `confirmModal()` function applies `style="margin-bottom:16px;..."` inline on a paragraph element instead of using a CSS class.

**Impact:** Spacing is not governed by the design system and cannot be overridden via CSS.

**Suggested Fix:** Create a `.confirm-modal-message` class in `components.css` and apply spacing there.

---

## Summary Table

| ID | Severity | Category | File | Description |
|---|---|---|---|---|
| C1 | Critical | Token Usage | flow1-connections.js | ~30+ wrong fallback hex values across 5 tokens |
| C2 | Critical | Token Usage | flow2-scanning.js | ~40+ instances of `#948E85` instead of `#54514D` for --sds-text-secondary |
| C3 | Critical | CSS Architecture | flow6-monitoring.js | Event listeners accumulate in search results on every keystroke |
| M1 | Major | Token Usage | flow6-monitoring.js | 3 wrong fallback hex values in search overlay |
| M2 | Major | Token Usage | flow7-onboarding.js | 4 tokens with wrong fallback hex values across 9 locations |
| M3 | Major | Token Usage | flow7-onboarding.js | CONFETTI_COLORS comments mislabel token tiers |
| M4 | Major | Token Usage | flow7-onboarding.js | 3 raw rgba() overlay values |
| M5 | Major | CSS Architecture | flow7-onboarding.js | 3 addEventListener calls without cleanup |
| M6 | Major | Accessibility | flow7-onboarding.js | Interactive elements missing focus-visible states |
| M7 | Major | Typography | flow7-onboarding.js | Off-scale font-size: 28px |
| m1 | Minor | Typography | components.css | Off-scale font-size: 28px on stat-card-value |
| m2 | Minor | Token Usage | flow7-onboarding.js | Raw fill="white" in SVG |
| m3 | Minor | CSS Architecture | components.js | Inline style on confirmModal paragraph |

**Totals:** 3 Critical, 7 Major, 3 Minor — **13 new findings**

---

## Comparison with Previous Reports

| Report | Critical | Major | Minor | Total |
|---|---|---|---|---|
| v1 | — | — | — | — |
| v2 | — | — | — | — |
| v3 | 3 | 12 | 10 | 25 |
| **v4** | **3** | **7** | **3** | **13** |

The v4 findings are predominantly token-value mismatches in fallback hex values — a systemic issue across flow1, flow2, flow6, and flow7 that was not surfaced in v3. The v3 report identified one instance of wrong fallback hex (C1 in flow5-policies.js); v4 reveals this pattern extends to four additional flow files with significantly more occurrences.

**Recommendation:** Introduce a build-time or lint-time check that validates all `var(--sds-*, <fallback>)` expressions against the canonical token map. This would catch fallback drift at authoring time rather than during manual audits.
