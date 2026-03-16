# Flow 5: Tokenization Policy Management -- Design Specification

**Stage**: Remediate (infrastructure)
**Primary personas**: Priya (policy definition), Jordan (technical configuration)
**Date**: 2026-03-14
**Design system**: Software DS

---

## Table of Contents

1. [Feature Requirements](#1-feature-requirements)
2. [Design Rationale](#2-design-rationale)
3. [Pattern Recommendations](#3-pattern-recommendations)
4. [Edge Cases and Considerations](#4-edge-cases-and-considerations)
5. [Screen Designs](#5-screen-designs)
   - [5.1 Policy List](#51-policy-list)
   - [5.2 Template Gallery](#52-template-gallery)
   - [5.3 Create Policy -- Basics + Classifications (Step 1/3)](#53-create-policy----basics--classifications-step-13)
   - [5.4 Create Policy -- Token Configuration (Step 2/3)](#54-create-policy----token-configuration-step-23)
   - [5.5 Create Policy -- Scope + Review (Step 3/3)](#55-create-policy----scope--review-step-33)
   - [5.6 Policy Detail](#56-policy-detail)
   - [5.7 Policy Version Diff](#57-policy-version-diff)
   - [5.8 Inline Policy Creator (Drawer)](#58-inline-policy-creator-drawer)
6. [New Components Needed](#6-new-components-needed)

---

## 1. Feature Requirements

### Problem Statement

Organizations need reusable, auditable tokenization policies that map data classifications to token configurations. Without centralized policy management, teams create ad-hoc tokenization rules, leading to inconsistent protection, compliance gaps, and operational overhead when regulations change.

### Target Users

| Persona | Role | Primary Tasks |
|---------|------|--------------|
| **Priya** | Data Governance Lead | Define policies, set scope, review impact, manage versions |
| **Jordan** | Security Engineer | Configure token formats, test tokenization output, tune reversibility |

### Success Metrics

- Time to create first policy: under 3 minutes using templates
- Policy reuse rate: 80%+ of tokenization operations use an existing policy
- Compliance alignment: 100% of regulation-tagged policies pass audit checks
- Version conflict rate: under 5% of edits require manual resolution

### User Stories

1. As Priya, I want to start from a regulation template so I can create compliant policies without memorizing regulation requirements.
2. As Jordan, I want to test token formats against sample data so I can verify output before applying to production.
3. As Priya, I want to see the projected impact on risk scores before creating a policy so I can prioritize high-impact policies.
4. As Priya, I want to compare policy versions side-by-side so I can understand what changed and why.
5. As Priya, I want to create a policy inline while configuring remediation so I do not lose my context.

---

## 2. Design Rationale

| Decision | Chosen Approach | Alternatives Considered | Why |
|----------|----------------|------------------------|-----|
| Navigation pattern | Full-page views with wizard for creation | Single-page app with inline editing | Wizard reduces cognitive load for multi-step configuration; full pages give more room for complex token config |
| Template gallery placement | Always accessible from Policy List + primary CTA in empty state | Hidden behind a menu; separate templates page | Templates are the fastest path to a working policy; always-available reduces friction |
| Wizard step count | 3 steps (Basics+Classifications, Token Config, Scope+Review) | 5 steps (one per concern); single long form | 3 steps balance completeness with momentum; each step has clear purpose |
| Policy versioning | Automatic version on edit with diff view | Manual save-as; Git-style branching | Auto-versioning ensures audit trail without user overhead |
| Inline creator | Drawer (480px min, full-page below 960px) | Modal; new tab; inline accordion | Drawer preserves remediation context; responsive fallback prevents cramped UI |
| Regulation-aware defaults | Pre-fill with overridable defaults + info panel | Hard constraints; no defaults; separate compliance checker | Informational-not-blocking respects expertise while guiding compliance |
| Status model | Active / Draft / Disabled toggle | Separate lifecycle pages; approval workflow | Simple toggle covers the core need; confirmation dialog handles disable impact |

---

## 3. Pattern Recommendations

| Screen | Primary Pattern | Secondary Pattern | Reference |
|--------|----------------|-------------------|-----------|
| Policy List | Data Table with Inline Actions | Filter Panel (inline bar), Bulk Operations | `data-management-patterns.md` -- Data Table |
| Template Gallery | Card Grid | Empty State | `data-management-patterns.md` -- Import/Export (card selection) |
| Create Policy (all steps) | CRUD Workflow -- Wizard | Form Section | `data-management-patterns.md` -- CRUD Workflow |
| Policy Detail | Master-Detail (tabs) | Data Lineage, Role-Based Access | `data-management-patterns.md` -- Master-Detail |
| Version Diff | Split View (side-by-side) | Data Lineage | Custom pattern |
| Inline Creator | Drawer overlay | CRUD Workflow -- Wizard | Custom pattern |

---

## 4. Edge Cases and Considerations

| Category | Scenario | Design Response |
|----------|----------|-----------------|
| Empty state | No policies exist | Template gallery as primary CTA with heading: "Start with a template to protect sensitive data in minutes" |
| Conflict | Two policies cover the same column | Warning during scope step: "12 columns already covered by PCI Policy. This policy will take precedence (higher priority)." Priority ordering configurable |
| Regulation | Custom regulation needed | "Custom" option in regulation dropdown with free-text name and description. No regulation-aware defaults applied |
| Edit | Editing an active policy | Creates new version. Warning: "Changes applied to 234 columns on next enforcement run. Apply immediately?" |
| Delete | Policy has applied tokenization | Block deletion. Offer: "Transfer columns to another policy" or "Detokenize all columns first" |
| Template | Template does not fit exactly | All template fields are editable. Template is a starting point, not a constraint |
| Testing | Token format produces unexpected output | Test panel shows live preview. User can adjust format and re-test before saving |
| Version | Need to revert a policy change | Version history with diff. "Revert to version N" creates a new version with old settings |
| Inline creation | Creating from Remediation flow | Drawer slides in (480px min). On save, new policy auto-selected in remediation. Drawer closes |
| Disable | Disabling an active policy | Confirmation dialog: "Pausing enforcement. N columns remain tokenized. New matches will not be auto-protected." Re-enable shows columns added while disabled |
| Regulation defaults | User overrides regulation defaults | Info note: "Your configuration differs from [regulation] recommended settings. This may affect compliance status." Not blocking |
| Loading | Slow impact calculation | Skeleton loader for impact preview card. "Calculating impact..." placeholder with spinner |
| Permission | Read-only user views policy | Edit/Delete buttons disabled with tooltip "Contact admin for edit access". Status toggle hidden |

---

## 5. Screen Designs

---

### 5.1 Policy List

**Purpose**: Browse, filter, and manage all tokenization policies. Primary entry point for the Policies section.

#### Shell and Layout

- **Shell**: Full App Shell (header 56px + sidebar 220px + content area)
- **Grid**: Single-column content area with 24px padding
- **Sidebar active item**: "Protection policies" under "Tokenization" group
- **Content max-width**: None (fluid, table stretches)

#### Content Hierarchy

```
┌──────────────────────────────────────────────────────────────────────┐
│ HEADER (56px) -- full width                                          │
├────────────┬─────────────────────────────────────────────────────────┤
│ SIDEBAR    │ CONTENT AREA (padding: 24px)                           │
│ 220px      │                                                         │
│            │ 1. Page Header                                          │
│            │    Breadcrumb: Tokenization > Protection policies       │
│            │    Title: "Protection policies"                         │
│            │    Actions: [Start from Template (secondary)]           │
│            │              [+ Create Policy (primary)]                │
│            │                                                         │
│            │ 2. Filter Bar                                           │
│            │    ┌──────────┬──────────┬──────────┬─────────────────┐ │
│            │    │ Search   │ Reg.     │ Status   │ Classifications │ │
│            │    │ (text)   │ dropdown │ dropdown │ dropdown        │ │
│            │    └──────────┴──────────┴──────────┴─────────────────┘ │
│            │                                                         │
│            │ 3. Policy Table                                         │
│            │    ┌────┬──────────┬──────┬───────┬──────┬─────┬─────┐ │
│            │    │ [] │ Name     │ Reg. │ Class.│Scope │ Sta │ ... │ │
│            │    ├────┼──────────┼──────┼───────┼──────┼─────┼─────┤ │
│            │    │ [] │ PCI Com..│ PCI  │ PAN,..│ All  │ Act │ ... │ │
│            │    │ [] │ GDPR PII │ GDPR │ PII,..│ EU   │ Act │ ... │ │
│            │    │ [] │ HIPAA ..│ HIPAA│ PHI,..│ HC   │ Dra │ ... │ │
│            │    └────┴──────────┴──────┴───────┴──────┴─────┴─────┘ │
│            │                                                         │
│            │ 4. Pagination                                           │
│            │    Showing 1-20 of 47 policies    [< 1 2 3 >]          │
│            │                                                         │
└────────────┴─────────────────────────────────────────────────────────┘
```

#### Component Inventory

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| Header | `/components/header.html` | Global app header |
| Side Navigation | `/components/side-navigation.html` | "Protection policies" active state |
| Button -- Primary (md) | `/components/buttons.html` `.btn-primary.btn-md` | "+ Create Policy" |
| Button -- Secondary (md) | `/components/buttons.html` `.btn-secondary.btn-md` | "Start from Template" |
| Button -- Tertiary (sm) | `/components/buttons.html` `.btn-tertiary.btn-sm` | Inline row actions |
| Button -- Danger Outline (sm) | `/components/buttons.html` `.btn-danger-outline.btn-sm` | Delete action in overflow |
| Tags -- Status | `/components/tags.html` `.sds-tag` | Status column (Active, Draft, Disabled) |
| Tags -- Info | `/components/tags.html` `.sds-tag--info` | Classification chips in table cells |
| Data Table | New component needed | Policy table |
| Filter Bar | New component needed | Search + dropdowns row |
| Pagination | New component needed | Table pagination |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Page background | background | `var(--sds-bg-page)` |
| Sidebar background | background | `var(--sds-nav-sidebar-bg)` |
| Sidebar active item bg | background | `var(--sds-nav-item-active-bg)` |
| Sidebar active item text | color | `var(--sds-nav-item-active-text)` |
| Breadcrumb text | color | `var(--sds-text-link)` -- `#013D5B` |
| Page title | color | `var(--sds-text-primary)` -- 24px / 600 weight |
| Filter bar background | background | `var(--sds-bg-surface)` |
| Search input border | border | `var(--sds-border-default)` |
| Search input border (focus) | border | `var(--sds-border-focus)` |
| Table header background | background | `var(--sds-bg-subtle)` |
| Table header text | color, size, weight | `var(--sds-text-secondary)` -- 12px / 600 |
| Table row border | border-bottom | `var(--sds-border-subtle)` |
| Table cell text | color, size | `var(--sds-text-secondary)` -- 13px / 400 |
| Table row hover | background | `var(--sds-color-warm-gray-050)` -- `#F4F1EB` |
| Policy name (link) | color | `var(--sds-text-link)` |
| Status tag -- Active | `.sds-tag--success` | bg: `var(--sds-status-success-bg)`, text: `var(--sds-color-green-500)` |
| Status tag -- Draft | `.sds-tag--neutral` | bg: `var(--sds-status-neutral-bg)`, text: `var(--sds-color-warm-gray-650)` |
| Status tag -- Disabled | `.sds-tag--warning` | bg: `var(--sds-status-warning-bg)`, text: `var(--sds-color-yellow-550)` |
| Classification chips | `.sds-tag--info.sds-tag--sm` | bg: `var(--sds-status-info-bg)`, text: `var(--sds-color-blue-700)` |
| Pagination text | color | `var(--sds-text-tertiary)` -- 13px |
| Bulk action toolbar bg | background | `var(--sds-interactive-primary-subtle)` |

#### Interaction Details

| Interaction | Behavior |
|-------------|----------|
| Row hover | Row background changes to `var(--sds-color-warm-gray-050)`. Cursor: pointer |
| Row click | Navigates to Policy Detail view for that policy |
| Policy name hover | Underline decoration appears. Color stays `var(--sds-text-link)` |
| "+ Create Policy" click | Navigates to Create Policy wizard Step 1 (blank) |
| "Start from Template" click | Navigates to Template Gallery |
| Status tag click | No action (display only in table) |
| Checkbox select | Selects row. When 1+ rows selected, bulk action toolbar slides down (200ms ease) below filter bar |
| Column header click | Toggles sort ascending/descending. Sort indicator arrow appears. Transition: 150ms |
| Filter dropdown change | Table re-filters immediately. Active filter shows as chip below filter bar |
| Overflow menu (three-dot) | Opens dropdown: Edit, Clone, Delete. Delete shows danger styling |
| Delete action | Opens confirmation dialog. If policy has applied tokenization, shows blocking message |

#### State Variations

**Empty State**:
```
┌──────────────────────────────────────────────────────────────────┐
│                                                                    │
│                    [Shield icon -- 48px, muted]                    │
│                                                                    │
│              Start with a template to protect                      │
│              sensitive data in minutes                             │
│                                                                    │
│         Choose from pre-built compliance templates                 │
│         or create a custom policy from scratch.                    │
│                                                                    │
│           [Start from Template (primary)]                          │
│           [Create from scratch (tertiary)]                         │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```
- Icon: 48px, `var(--sds-text-disabled)` opacity
- Title: 18px / 600, `var(--sds-text-primary)`
- Description: 14px / 400, `var(--sds-text-secondary)`, max-width 420px, centered
- Primary CTA: `.btn-primary.btn-md`
- Secondary link: `.btn-tertiary.btn-md`

**Loading State**:
- Table area shows skeleton rows: 8 rows of animated pulse bars
- Skeleton bg: `var(--sds-bg-subtle)` pulsing to `var(--sds-color-warm-gray-100)`
- Animation: CSS keyframe, 1.5s ease-in-out infinite

**Error State**:
- Inline error banner above table area
- Background: `var(--sds-status-error-bg)`
- Text: `var(--sds-status-error-text)`
- Icon: warning triangle, 16px
- Message: "Unable to load policies. Please try again."
- Retry button: `.btn-tertiary.btn-sm`

**Filtered -- No Results**:
- Table area replaced with centered message
- "No policies match your filters" -- 14px, `var(--sds-text-secondary)`
- "Clear filters" link: `var(--sds-text-link)`

#### Responsive Behavior

- Below 1200px: Classification column hidden
- Below 1024px: Scope column hidden; sidebar collapses to 56px icon-only mode
- Below 768px: Table converts to card list. Each policy becomes a stacked card with name, status tag, regulation, and overflow menu

---

### 5.2 Template Gallery

**Purpose**: Quick-start policy creation by selecting from pre-built regulation templates. Accessible from empty state, Policy List, and during wizard entry.

#### Shell and Layout

- **Shell**: Full App Shell
- **Grid**: Content area uses CSS Grid for card layout: `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))` with 20px gap
- **Content max-width**: 1200px (centered with auto margins)

#### Content Hierarchy

```
┌──────────────────────────────────────────────────────────────────────┐
│ HEADER (56px)                                                        │
├────────────┬─────────────────────────────────────────────────────────┤
│ SIDEBAR    │ CONTENT AREA (padding: 24px)                           │
│ 220px      │                                                         │
│            │ 1. Page Header                                          │
│            │    Breadcrumb: Policies > Choose a template             │
│            │    Title: "Choose a template"                           │
│            │    Description: "Start with a pre-built template to    │
│            │    get compliant protection in minutes. All settings    │
│            │    can be customized in the wizard."                    │
│            │                                                         │
│            │ 2. Template Card Grid (auto-fill, min 280px)            │
│            │    ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│            │    │ [Shield]     │  │ [Shield]     │  │ [Shield]   │  │
│            │    │              │  │              │  │            │  │
│            │    │ PCI DSS      │  │ GDPR PII     │  │ HIPAA PHI  │  │
│            │    │ Compliance   │  │ Protection   │  │ Security   │  │
│            │    │              │  │              │  │            │  │
│            │    │ FPE for card │  │ Hash-based   │  │ FPE for    │  │
│            │    │ numbers,     │  │ pseudonym.,  │  │ identif.,  │  │
│            │    │ reversible   │  │ irreversible │  │ reversible │  │
│            │    │              │  │              │  │            │  │
│            │    │ ┌──┐┌──┐    │  │ ┌──┐┌──┐    │  │ ┌──┐┌──┐  │  │
│            │    │ │PC││PA│    │  │ │PI││Em│    │  │ │PH││SS│  │  │
│            │    │ └──┘└──┘    │  │ └──┘└──┘    │  │ └──┘└──┘  │  │
│            │    │              │  │              │  │            │  │
│            │    │ [Use this →] │  │ [Use this →] │  │[Use this→] │  │
│            │    └──────────────┘  └──────────────┘  └────────────┘  │
│            │                                                         │
│            │    ┌──────────────┐  ┌──────────────┐                  │
│            │    │ [Shield]     │  │ [+]          │                  │
│            │    │              │  │              │                  │
│            │    │ General PII  │  │ Blank        │                  │
│            │    │              │  │ Policy       │                  │
│            │    │ Balanced     │  │              │                  │
│            │    │ defaults for │  │ Start from   │                  │
│            │    │ common PII   │  │ scratch with │                  │
│            │    │              │  │ empty config │                  │
│            │    │ ┌──┐┌──┐    │  │              │                  │
│            │    │ │PI││Ad│    │  │              │                  │
│            │    │ └──┘└──┘    │  │              │                  │
│            │    │              │  │              │                  │
│            │    │ [Use this →] │  │[Start blank] │                  │
│            │    └──────────────┘  └──────────────┘                  │
│            │                                                         │
└────────────┴─────────────────────────────────────────────────────────┘
```

#### Template Card Anatomy

Each template card uses the `.sds-card` component with customizations:

```
┌─────────────────────────────────────┐   Card: .sds-card
│  ┌─────┐                            │
│  │Icon │  40px, rounded square      │   Header zone (no bordered variant)
│  └─────┘                            │   padding: 20px 20px 0
│                                      │
│  PCI DSS Compliance                  │   Title: 16px / 600, --sds-text-primary
│                                      │
│  Format-preserving encryption        │   Description: 13px / 400
│  for card numbers. Reversible        │   --sds-text-secondary
│  tokenization with audit logging.    │   3-line max, ellipsis overflow
│                                      │
│  ┌─────────┐ ┌─────────┐            │   Classification tags: .sds-tag--info.sds-tag--sm
│  │ PCI-PAN │ │ PCI-CVV │            │   gap: 6px, flex-wrap
│  └─────────┘ └─────────┘            │
│                                      │
│  Pre-configured:                     │   Config summary: 12px / 400
│  - Token format: FPE                 │   --sds-text-tertiary
│  - Reversibility: Yes               │   bullet list, 3 items max
│  - Regulation defaults: PCI DSS     │
│                                      │
├──────────────────────────────────────┤   Footer: .sds-card-footer
│  Use this template            →      │   Link: .sds-link, 13px / 500
└──────────────────────────────────────┘   --sds-text-link
```

#### Component Inventory

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| Card | `/components/cards.html` `.sds-card` | Template cards |
| Card Footer | `.sds-card-footer` | "Use this template" link |
| Tags -- Info (sm) | `/components/tags.html` `.sds-tag--info.sds-tag--sm` | Classification labels on cards |
| Button -- Tertiary | `/components/buttons.html` `.btn-tertiary` | Back link |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Content background | background | `var(--sds-bg-page)` |
| Page description | color | `var(--sds-text-secondary)` -- 14px / 400 |
| Card background | background | `var(--sds-bg-card)` |
| Card border | border | 1px solid `var(--sds-border-default)` |
| Card border-radius | border-radius | 8px |
| Card padding (body) | padding | 20px |
| Card hover border | border-color | `var(--sds-border-strong)` |
| Card hover shadow | box-shadow | `0 2px 8px rgba(0,0,0,0.08)` |
| Template icon bg | background | `var(--sds-interactive-primary-subtle)` |
| Template icon color | color | `var(--sds-interactive-primary)` |
| Card title | color, size, weight | `var(--sds-text-primary)` -- 16px / 600 |
| Card description | color | `var(--sds-text-secondary)` -- 13px |
| Config summary | color | `var(--sds-text-tertiary)` -- 12px |
| Footer link | color | `var(--sds-text-link)` |
| Footer border-top | border | 1px solid `var(--sds-border-subtle)` |
| Grid gap | gap | 20px |
| Blank card border | border | 1px dashed `var(--sds-border-default)` |
| Blank card icon | color | `var(--sds-text-tertiary)` |

#### Interaction Details

| Interaction | Behavior |
|-------------|----------|
| Card hover | Border transitions to `var(--sds-border-strong)`. Shadow appears: `0 2px 8px rgba(0,0,0,0.08)`. Transition: 150ms ease |
| Card click (anywhere) | Navigates to wizard Step 1 with template data pre-filled |
| "Use this template" link hover | Underline appears |
| "Blank Policy" card click | Navigates to wizard Step 1 with empty fields |
| Breadcrumb "Policies" click | Returns to Policy List |

#### State Variations

**Loading**: 5 skeleton cards in grid layout with pulse animation.

**Error**: Inline error banner. "Unable to load templates. You can still create a policy from scratch." with "Create from scratch" button.

#### Responsive Behavior

- 3 columns at 1200px+
- 2 columns at 768px-1199px
- 1 column below 768px (cards stack full width)
- Card min-width: 280px

---

### 5.3 Create Policy -- Basics + Classifications (Step 1/3)

**Purpose**: Define policy name, description, regulation context, priority, and select which data classifications this policy covers.

#### Shell and Layout

- **Shell**: Full App Shell
- **Grid**: Content area with centered form column, max-width 720px
- **Wizard progress**: Step indicator bar at top of content area

#### Content Hierarchy

```
┌──────────────────────────────────────────────────────────────────────┐
│ HEADER (56px)                                                        │
├────────────┬─────────────────────────────────────────────────────────┤
│ SIDEBAR    │ CONTENT AREA (padding: 24px)                           │
│ 220px      │                                                         │
│            │ 1. Wizard Progress Bar                                  │
│            │    ┌───────────────────────────────────────────────┐    │
│            │    │ (1) Basics          (2) Token Config  (3) Scope│   │
│            │    │  ●━━━━━━━━━━━━━━━━━━○━━━━━━━━━━━━━━━━━○       │   │
│            │    │  active             upcoming          upcoming │   │
│            │    └───────────────────────────────────────────────┘    │
│            │                                                         │
│            │ 2. Step Header                                          │
│            │    Step 1 of 3                                          │
│            │    Title: "Policy basics & classifications"             │
│            │    Desc: "Name your policy, select a regulation, and   │
│            │    choose which data classifications to protect."       │
│            │                                                         │
│            │ 3. Form: Basics Section                                 │
│            │    ┌──────────────────────────────────────────────┐     │
│            │    │ Policy name *                                │     │
│            │    │ ┌──────────────────────────────────────────┐ │     │
│            │    │ │ e.g., PCI Card Data Protection           │ │     │
│            │    │ └──────────────────────────────────────────┘ │     │
│            │    │                                              │     │
│            │    │ Description                                  │     │
│            │    │ ┌──────────────────────────────────────────┐ │     │
│            │    │ │                                          │ │     │
│            │    │ │                                          │ │     │
│            │    │ └──────────────────────────────────────────┘ │     │
│            │    │                                              │     │
│            │    │ Regulation          Priority                 │     │
│            │    │ ┌────────────────┐  ┌──────────────────┐    │     │
│            │    │ │ PCI DSS     v  │  │ Medium        v  │    │     │
│            │    │ └────────────────┘  └──────────────────┘    │     │
│            │    │ (Info icon) Selecting a regulation will      │     │
│            │    │ pre-fill token configuration defaults.       │     │
│            │    └──────────────────────────────────────────────┘     │
│            │                                                         │
│            │ 4. Form: Classifications Section                        │
│            │    ┌──────────────────────────────────────────────┐     │
│            │    │ Data classifications *                       │     │
│            │    │ Select which classifications this policy     │     │
│            │    │ will protect.                                │     │
│            │    │                                              │     │
│            │    │ ┌─ PCI ──────────────────────────────────┐   │     │
│            │    │ │ [x] PAN (Primary Account Number)       │   │     │
│            │    │ │ [x] CVV / CVC                          │   │     │
│            │    │ │ [ ] Cardholder Name                     │   │     │
│            │    │ │ [ ] Expiration Date                     │   │     │
│            │    │ └────────────────────────────────────────┘   │     │
│            │    │                                              │     │
│            │    │ ┌─ PII ──────────────────────────────────┐   │     │
│            │    │ │ [ ] Social Security Number              │   │     │
│            │    │ │ [ ] Email Address                       │   │     │
│            │    │ │ [ ] Phone Number                        │   │     │
│            │    │ │ [ ] Full Name                           │   │     │
│            │    │ └────────────────────────────────────────┘   │     │
│            │    │                                              │     │
│            │    │ ┌─ PHI ──────────────────────────────────┐   │     │
│            │    │ │ [ ] Medical Record Number               │   │     │
│            │    │ │ [ ] Diagnosis Code                      │   │     │
│            │    │ └────────────────────────────────────────┘   │     │
│            │    │                                              │     │
│            │    │ ┌─ Custom ───────────────────────────────┐   │     │
│            │    │ │ [ ] Internal Employee ID                │   │     │
│            │    │ │ [+ Add custom classification]           │   │     │
│            │    │ └────────────────────────────────────────┘   │     │
│            │    └──────────────────────────────────────────────┘     │
│            │                                                         │
│            │ 5. Wizard Footer (sticky)                               │
│            │    ┌──────────────────────────────────────────────┐     │
│            │    │ [Cancel (tertiary)]              [Next (primary)]│  │
│            │    └──────────────────────────────────────────────┘     │
│            │                                                         │
└────────────┴─────────────────────────────────────────────────────────┘
```

#### Wizard Progress Bar Specs

```
Step indicator anatomy:
  ●━━━━━━━━━━━━━━━━━━━○━━━━━━━━━━━━━━━━━━━○
  Step 1               Step 2               Step 3

- Active step circle: 24px, filled, var(--sds-interactive-primary)
- Active step label: 13px / 500, var(--sds-text-primary)
- Completed step circle: 24px, filled with check icon, var(--sds-interactive-primary)
- Upcoming step circle: 24px, border-only, var(--sds-border-default)
- Upcoming step label: 13px / 400, var(--sds-text-tertiary)
- Connector line (completed): 2px, var(--sds-interactive-primary)
- Connector line (upcoming): 2px, var(--sds-border-default)
- Total height: 64px including labels
- Margin-bottom: 32px
```

#### Component Inventory

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| Button -- Primary (md) | `/components/buttons.html` | "Next" |
| Button -- Tertiary (md) | `/components/buttons.html` | "Cancel" |
| Wizard Progress Bar | New component needed | 3-step progress indicator |
| Form inputs | New component needed | Text input, textarea, select dropdown |
| Checkbox groups | New component needed | Classification selection |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Step header label | color, size | `var(--sds-text-tertiary)` -- 13px / 500 |
| Step title | color, size, weight | `var(--sds-text-primary)` -- 22px / 600 |
| Step description | color | `var(--sds-text-secondary)` -- 14px |
| Form section title | color, size, weight | `var(--sds-text-primary)` -- 16px / 600 |
| Field label | color, size, weight | `var(--sds-text-primary)` -- 13px / 500 |
| Field label (required asterisk) | color | `var(--sds-status-error-text)` |
| Input border | border | 1px solid `var(--sds-border-default)` |
| Input border (focus) | border | 2px solid `var(--sds-border-focus)` |
| Input background | background | `var(--sds-bg-card)` |
| Input text | color | `var(--sds-text-primary)` -- 14px |
| Input placeholder | color | `var(--sds-text-disabled)` |
| Help text | color | `var(--sds-text-tertiary)` -- 12px |
| Error text | color | `var(--sds-status-error-text)` -- 12px |
| Checkbox group border | border | 1px solid `var(--sds-border-subtle)` |
| Checkbox group header bg | background | `var(--sds-bg-subtle)` |
| Checkbox group header text | color | `var(--sds-text-secondary)` -- 12px / 600 / uppercase |
| Checkbox checked | background | `var(--sds-interactive-primary)` |
| Checkbox label | color | `var(--sds-text-primary)` -- 14px |
| Info icon + text | color | `var(--sds-status-info-text)` |
| Wizard footer background | background | `var(--sds-bg-page)` |
| Wizard footer border-top | border | 1px solid `var(--sds-border-subtle)` |

#### Interaction Details

| Interaction | Behavior |
|-------------|----------|
| Regulation dropdown change | If template was selected, regulation was pre-filled. Info text appears below: "Token configuration will use [regulation] recommended defaults." Transition: fade-in 200ms |
| Classification checkbox toggle | Checkbox fills with `var(--sds-interactive-primary)`. Check icon appears (white). Transition: 100ms |
| "Next" click (valid) | Slide-left transition (300ms ease) to Step 2. Progress bar updates: step 1 shows checkmark |
| "Next" click (invalid) | Shake animation on button (200ms). Error messages appear below invalid fields. Scroll to first error |
| "Cancel" click | Confirmation dialog: "Discard this policy? Any progress will be lost." [Discard (danger)] [Keep editing (secondary)] |
| "+ Add custom classification" click | Inline text input appears below the custom group. Focus auto-sets to new input |
| Template pre-fill | When entering from Template Gallery, fields populate with template data. Classification checkboxes pre-checked. Visual indicator: "Pre-filled from [template name]" banner at top |

#### State Variations

**Template Pre-filled**: Info banner at top of form with template name. Background: `var(--sds-status-info-bg)`, text: `var(--sds-status-info-text)`.

**Validation Error**: Red border on invalid fields (`var(--sds-status-error-strong)`). Error message below field in `var(--sds-status-error-text)`.

**Loading (from template)**: Skeleton loader over form fields for 500ms while template data loads.

#### Responsive Behavior

- Form max-width: 720px, centered
- Below 768px: Regulation and Priority dropdowns stack vertically (full width each)
- Classification groups go full-width single column
- Wizard footer becomes fixed to bottom of viewport

---

### 5.4 Create Policy -- Token Configuration (Step 2/3)

**Purpose**: Configure tokenization rules per classification. Set token format, preservation rules, and reversibility. Test against sample data.

#### Shell and Layout

- **Shell**: Full App Shell
- **Grid**: Content area split -- left: configuration form (60%, min 420px), right: test panel (40%, min 320px). Below 960px, test panel moves below config as a collapsible section.
- **Form column max-width**: None (takes available space)

#### Content Hierarchy

```
┌──────────────────────────────────────────────────────────────────────┐
│ HEADER (56px)                                                        │
├────────────┬─────────────────────────────────────────────────────────┤
│ SIDEBAR    │ CONTENT AREA (padding: 24px)                           │
│ 220px      │                                                         │
│            │ 1. Wizard Progress Bar                                  │
│            │    ●━━━━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━○           │
│            │    done              active              upcoming       │
│            │                                                         │
│            │ 2. Step Header                                          │
│            │    Step 2 of 3                                          │
│            │    "Token configuration"                                │
│            │                                                         │
│            │ 3. Content Split                                        │
│            │    ┌───────────────────────┬──────────────────────┐     │
│            │    │ CONFIG FORM (60%)     │ TEST PANEL (40%)     │     │
│            │    │                       │                      │     │
│            │    │ ┌─ Regulation Info ─┐ │ ┌─ Test Output ────┐ │     │
│            │    │ │ (i) PCI DSS       │ │ │ Sample data      │ │     │
│            │    │ │ Requirements:     │ │ │ ┌──────────────┐ │ │     │
│            │    │ │ - Art 3.4: render │ │ │ │4532-1234-    │ │ │     │
│            │    │ │   PAN unreadable  │ │ │ │5678-9012     │ │ │     │
│            │    │ │ - Art 3.5: protect│ │ │ └──────────────┘ │ │     │
│            │    │ │   crypto keys     │ │ │                  │ │     │
│            │    │ └───────────────────┘ │ │ Tokenized output │ │     │
│            │    │                       │ │ ┌──────────────┐ │ │     │
│            │    │ ┌─ PAN Config ──────┐ │ │ │4532-XXXX-    │ │ │     │
│            │    │ │ Token format      │ │ │ │XXXX-9012     │ │ │     │
│            │    │ │ ┌──────────────┐  │ │ │ └──────────────┘ │ │     │
│            │    │ │ │ FPE       v  │  │ │ │                  │ │     │
│            │    │ │ └──────────────┘  │ │ │ Format: FPE      │ │     │
│            │    │ │                   │ │ │ Preserves: first4 │ │     │
│            │    │ │ Preservation      │ │ │ /last4            │ │     │
│            │    │ │ ┌──────────────┐  │ │ │ Reversible: Yes  │ │     │
│            │    │ │ │ First 4 /   │  │ │ │                  │ │     │
│            │    │ │ │ Last 4   v  │  │ │ │ [Run test]       │ │     │
│            │    │ │ └──────────────┘  │ │ └──────────────────┘ │     │
│            │    │ │                   │ │                      │     │
│            │    │ │ Reversibility     │ │                      │     │
│            │    │ │ (o) Reversible    │ │                      │     │
│            │    │ │ ( ) Irreversible  │ │                      │     │
│            │    │ │                   │ │                      │     │
│            │    │ │ (!) Override note │ │                      │     │
│            │    │ └───────────────────┘ │                      │     │
│            │    │                       │                      │     │
│            │    │ ┌─ CVV Config ──────┐ │                      │     │
│            │    │ │ Token format      │ │                      │     │
│            │    │ │ ┌──────────────┐  │ │                      │     │
│            │    │ │ │ Random    v  │  │ │                      │     │
│            │    │ │ └──────────────┘  │ │                      │     │
│            │    │ │ ...               │ │                      │     │
│            │    │ └───────────────────┘ │                      │     │
│            │    └───────────────────────┴──────────────────────┘     │
│            │                                                         │
│            │ 4. Wizard Footer (sticky)                               │
│            │    [Cancel]  [Back (secondary)]  [Next (primary)]       │
│            │                                                         │
└────────────┴─────────────────────────────────────────────────────────┘
```

#### Regulation Info Panel Specs

```
┌─────────────────────────────────────────────────┐
│ (i) PCI DSS Requirements                        │   Background: var(--sds-status-info-bg)
│                                                  │   Border-left: 3px solid var(--sds-status-info-text)
│ The following defaults satisfy PCI DSS:          │   Border-radius: 0 6px 6px 0
│ - Requirement 3.4: Render PAN unreadable         │   Padding: 16px
│ - Requirement 3.5: Protect cryptographic keys    │   Text: 13px, var(--sds-status-info-text)
│                                                  │   Icon: 16px info circle
│ Defaults have been pre-filled. You can override  │   Margin-bottom: 24px
│ any setting below.                               │
└─────────────────────────────────────────────────┘
```

#### Per-Classification Config Card Specs

Each classification gets its own config card using `.sds-card`:

```
┌──────────────────────────────────────────────────┐
│ HEADER (bordered)                                 │
│  PAN (Primary Account Number)    [Classification │   Title: 14px / 600
│                                   tag: PCI]      │   Tag: .sds-tag--info.sds-tag--sm
├──────────────────────────────────────────────────┤
│ BODY                                              │
│                                                   │
│ Token format *                                    │   Field group, 16px gap
│ ┌────────────────────────────────────────────┐   │
│ │ Format-Preserving Encryption (FPE)      v  │   │   Select dropdown
│ └────────────────────────────────────────────┘   │
│ Maintains the original format and character      │   Help text: 12px
│ set of the data.                                 │   --sds-text-tertiary
│                                                   │
│ Preservation rules                               │
│ ┌────────────────────────────────────────────┐   │
│ │ Preserve first 4 and last 4 digits      v  │   │   Select dropdown
│ └────────────────────────────────────────────┘   │
│                                                   │
│ Reversibility                                    │
│ (o) Reversible -- can be detokenized             │   Radio group
│ ( ) Irreversible -- one-way transformation       │   14px, --sds-text-primary
│                                                   │
│ ┌─ Override warning ────────────────────────┐    │   Only shown if user changed
│ │ (!) Your config differs from PCI DSS      │    │   a regulation default
│ │ recommended settings for PAN.             │    │   bg: var(--sds-status-warning-bg)
│ │ This may affect compliance status.        │    │   text: var(--sds-status-warning-text)
│ └───────────────────────────────────────────┘    │   border-left: 3px solid
│                                                   │   var(--sds-status-warning-strong)
└──────────────────────────────────────────────────┘
```

#### Test Panel Specs

The test panel is a sticky card (`position: sticky; top: 24px`) on the right side:

```
┌──────────────────────────────────────┐   .sds-card
│ HEADER (bordered)                     │
│  Token Format Test                    │   Title: 14px / 600
│                          [Clear]      │   Clear: .btn-tertiary.btn-sm
├──────────────────────────────────────┤
│ BODY                                  │
│                                       │
│ Classification                        │   Select: which classification to test
│ ┌──────────────────────────────────┐ │
│ │ PAN (Primary Account Number)  v  │ │
│ └──────────────────────────────────┘ │
│                                       │
│ Sample data                           │   Label: 13px / 500
│ ┌──────────────────────────────────┐ │   Textarea: 4 lines
│ │ 4532-1234-5678-9012              │ │   Monospace font, 13px
│ │                                  │ │   bg: var(--sds-bg-subtle)
│ │                                  │ │   border: var(--sds-border-default)
│ └──────────────────────────────────┘ │
│                                       │
│ [Run test (primary, sm)]              │
│                                       │
│ ── Tokenized output ──────────────── │   Divider: 1px --sds-border-subtle
│                                       │
│ ┌──────────────────────────────────┐ │   Output box:
│ │ 4532-XXXX-XXXX-9012              │ │   bg: var(--sds-status-success-bg)
│ │                                  │ │   border: 1px solid green-200
│ └──────────────────────────────────┘ │   Monospace font, 13px
│                                       │   --sds-status-success-text
│ Format: FPE                           │   Summary: 12px
│ Characters preserved: first 4, last 4 │   --sds-text-tertiary
│ Reversible: Yes                       │
│                                       │
└──────────────────────────────────────┘
```

#### Component Inventory

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| Card (bordered header) | `/components/cards.html` `.sds-card` | Classification config cards, test panel |
| Tags -- Info (sm) | `/components/tags.html` | Classification labels in card headers |
| Button -- Primary (sm) | `/components/buttons.html` | "Run test" |
| Button -- Primary (md) | `/components/buttons.html` | "Next" |
| Button -- Secondary (md) | `/components/buttons.html` | "Back" |
| Button -- Tertiary (sm) | `/components/buttons.html` | "Clear" test panel |
| Select dropdown | New component needed | Token format, preservation rules |
| Radio group | New component needed | Reversibility toggle |
| Info banner | New component needed | Regulation requirements panel |
| Warning banner | New component needed | Override warning |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Split layout gap | gap | 24px |
| Config column min-width | min-width | 420px |
| Test panel min-width | min-width | 320px |
| Config card gap | gap (between cards) | 24px |
| Token format options: FPE | -- | Format-Preserving Encryption |
| Token format options: Hash | -- | SHA-256 Hash |
| Token format options: Random | -- | Random Token |
| Token format options: Mask | -- | Character Masking |
| Override warning bg | background | `var(--sds-status-warning-bg)` |
| Override warning text | color | `var(--sds-status-warning-text)` |
| Override warning border | border-left | 3px solid `var(--sds-status-warning-strong)` |
| Test output success bg | background | `var(--sds-status-success-bg)` |
| Test output success text | color | `var(--sds-status-success-text)` |
| Test output error bg | background | `var(--sds-status-error-bg)` |
| Test output error text | color | `var(--sds-status-error-text)` |
| Monospace font | font-family | `'SF Mono', Menlo, monospace` -- 13px |

#### Interaction Details

| Interaction | Behavior |
|-------------|----------|
| Token format dropdown change | Updates help text below dropdown. If regulation-aware default was changed, override warning appears (fade-in 200ms). Test panel output clears |
| Reversibility radio change | Same override warning behavior |
| "Run test" click | Button shows loading spinner (400ms). Output area transitions from empty to populated (fade-in 200ms). Success: green output box. Error: red output box with error message |
| Classification select in test panel | Loads the config for that classification. Sample data textarea clears. Output clears |
| "Clear" click | Resets sample data and output. Fade-out 150ms |
| "Back" click | Slide-right transition to Step 1. Form state is preserved |
| "Next" click | Validates at least one classification has config. Slide-left to Step 3 |
| Scroll (long config list) | Test panel remains sticky (top: 24px) so it is always visible while scrolling through classification configs |

#### State Variations

**Regulation defaults applied**: Info panel visible at top. Each config card shows defaults pre-filled. Override warning hidden until user changes a value.

**No regulation selected**: Info panel hidden. Config cards show empty dropdowns. No override warnings possible.

**Test running**: "Run test" button disabled with spinner. Output area shows skeleton pulse.

**Test error**: Output box uses error styling. Message: "Unable to tokenize. Check your format configuration."

#### Responsive Behavior

- Below 960px: Test panel moves below configuration cards as a collapsible section. Toggle: "Show test panel" / "Hide test panel". Uses `.sds-card` styling
- Below 768px: Config cards go full width. Sidebar collapses
- Test panel sticky behavior disabled when stacked vertically

---

### 5.5 Create Policy -- Scope + Review (Step 3/3)

**Purpose**: Define where the policy applies (scope), preview impact, and review all settings before creation.

#### Shell and Layout

- **Shell**: Full App Shell
- **Grid**: Content area, max-width 800px centered
- **Three major sections**: Scope selector, Impact preview, Settings summary

#### Content Hierarchy

```
┌──────────────────────────────────────────────────────────────────────┐
│ HEADER (56px)                                                        │
├────────────┬─────────────────────────────────────────────────────────┤
│ SIDEBAR    │ CONTENT AREA (padding: 24px)                           │
│ 220px      │                                                         │
│            │ 1. Wizard Progress Bar                                  │
│            │    ●━━━━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━●           │
│            │    done              done              active           │
│            │                                                         │
│            │ 2. Step Header                                          │
│            │    Step 3 of 3                                          │
│            │    "Scope & review"                                     │
│            │                                                         │
│            │ 3. Scope Section                                        │
│            │    ┌──────────────────────────────────────────────┐     │
│            │    │ Section title: "Scope"                       │     │
│            │    │ "Define where this policy will be enforced." │     │
│            │    │                                              │     │
│            │    │ (o) All matching classifications              │     │
│            │    │     Apply to every connection where matching  │     │
│            │    │     data classifications are found.          │     │
│            │    │                                              │     │
│            │    │ ( ) Specific connections                     │     │
│            │    │     ┌─ Connection picker ─────────────────┐  │     │
│            │    │     │ [x] Snowflake Production            │  │     │
│            │    │     │ [x] PostgreSQL Analytics            │  │     │
│            │    │     │ [ ] BigQuery Data Lake               │  │     │
│            │    │     └─────────────────────────────────────┘  │     │
│            │    │                                              │     │
│            │    │ ( ) Specific schemas                         │     │
│            │    │     ┌─ Schema picker ────────────────────┐   │     │
│            │    │     │ Search schemas...                   │   │     │
│            │    │     │ [ ] finance.transactions            │   │     │
│            │    │     │ [ ] hr.employees                    │   │     │
│            │    │     └────────────────────────────────────┘   │     │
│            │    └──────────────────────────────────────────────┘     │
│            │                                                         │
│            │ 4. Impact Preview                                       │
│            │    ┌──────────────────────────────────────────────┐     │
│            │    │ Section title: "Projected impact"            │     │
│            │    │                                              │     │
│            │    │ ┌─ Metric ──┐  ┌─ Metric ──┐  ┌─ Metric ─┐ │     │
│            │    │ │ Matching  │  │ Risk score │  │ Columns  │ │     │
│            │    │ │ columns   │  │ change     │  │ already  │ │     │
│            │    │ │   234     │  │  -12 pts   │  │ covered  │ │     │
│            │    │ └───────────┘  └───────────┘  └──────────┘ │     │
│            │    │                                              │     │
│            │    │ (!) 12 columns overlap with "PCI Policy".   │     │
│            │    │ This policy has higher priority and will     │     │
│            │    │ take precedence.                             │     │
│            │    └──────────────────────────────────────────────┘     │
│            │                                                         │
│            │ 5. Settings Summary                                     │
│            │    ┌──────────────────────────────────────────────┐     │
│            │    │ Section title: "Review settings"             │     │
│            │    │                                              │     │
│            │    │ ┌─ Basics ─────────────────────────────────┐ │     │
│            │    │ │ Name:        PCI Card Data Protection    │ │     │
│            │    │ │ Regulation:  PCI DSS                     │ │     │
│            │    │ │ Priority:    High                        │ │     │
│            │    │ │                          [Edit step 1]   │ │     │
│            │    │ └─────────────────────────────────────────┘ │     │
│            │    │                                              │     │
│            │    │ ┌─ Classifications & Token Config ─────────┐ │     │
│            │    │ │ PAN  FPE  First4/Last4  Reversible      │ │     │
│            │    │ │ CVV  Random  None        Irreversible    │ │     │
│            │    │ │                          [Edit step 2]   │ │     │
│            │    │ └─────────────────────────────────────────┘ │     │
│            │    │                                              │     │
│            │    │ ┌─ Scope ──────────────────────────────────┐ │     │
│            │    │ │ All matching classifications             │ │     │
│            │    │ │ 234 columns across 3 connections         │ │     │
│            │    │ └─────────────────────────────────────────┘ │     │
│            │    └──────────────────────────────────────────────┘     │
│            │                                                         │
│            │ 6. Wizard Footer (sticky)                               │
│            │    [Cancel]  [Back]      [Create Policy (primary)]      │
│            │                                                         │
└────────────┴─────────────────────────────────────────────────────────┘
```

#### Impact Preview Metric Cards

Use the Metric Cards Row pattern from page-designer:

```
┌─ Card ──────────┐  ┌─ Card ──────────┐  ┌─ Card ──────────┐
│ Matching columns │  │ Risk score      │  │ Already covered  │
│ 234              │  │ -12 pts         │  │ 12               │
└─────────────────┘  └─────────────────┘  └──────────────────┘
```

- Card: `.sds-card`, padding 16px 20px
- Label: 13px, `var(--sds-text-secondary)`
- Value: 24px / 600, `var(--sds-text-primary)`
- Risk score value: `var(--sds-status-success-text)` (green, since it is a reduction)
- "Already covered" value: `var(--sds-status-warning-text)` (if conflicts exist)
- Grid: 3 columns, 16px gap

#### Component Inventory

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| Card | `/components/cards.html` | Metric cards, summary cards |
| Button -- Primary (md) | `/components/buttons.html` | "Create Policy" |
| Button -- Secondary (md) | `/components/buttons.html` | "Back" |
| Button -- Tertiary (sm) | `/components/buttons.html` | "Edit step N" links |
| Radio group | New | Scope selector |
| Checkbox list | New | Connection/schema picker |
| Warning banner | New | Conflict warning |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Section title | color, size, weight | `var(--sds-text-primary)` -- 16px / 600 |
| Section description | color | `var(--sds-text-secondary)` -- 14px |
| Radio label | color | `var(--sds-text-primary)` -- 14px |
| Radio description | color | `var(--sds-text-tertiary)` -- 13px |
| Radio selected circle | fill | `var(--sds-interactive-primary)` |
| Connection picker border | border | 1px solid `var(--sds-border-default)` |
| Connection picker bg | background | `var(--sds-bg-card)` |
| Metric card value (positive) | color | `var(--sds-status-success-text)` |
| Metric card value (warning) | color | `var(--sds-status-warning-text)` |
| Conflict warning bg | background | `var(--sds-status-warning-bg)` |
| Conflict warning text | color | `var(--sds-status-warning-text)` |
| Summary card bg | background | `var(--sds-bg-surface)` |
| Summary label | color | `var(--sds-text-tertiary)` -- 12px |
| Summary value | color | `var(--sds-text-primary)` -- 13px |
| "Edit step" link | color | `var(--sds-text-link)` -- 12px |
| Section gap | margin | 32px between major sections |
| "Create Policy" button | class | `.btn-primary.btn-md` |

#### Interaction Details

| Interaction | Behavior |
|-------------|----------|
| Scope radio change | Connection/schema picker appears (slide-down 200ms) when specific scope selected. Impact preview recalculates (loading state) |
| Impact recalculation | Metric values show skeleton pulse for 1-2s. Values animate in (counter roll-up 500ms) |
| "Edit step N" click | Returns to that wizard step with current values preserved. Slide-right transition |
| "Create Policy" click | Button shows loading state. On success: redirect to Policy Detail with success toast. Policy is created in Draft status |
| Conflict warning | Appears after impact calculation if overlap detected. Yellow warning banner with `var(--sds-status-warning-bg)` |

#### State Variations

**Impact loading**: Metric cards show skeleton loaders (pulse animation). Warning area empty.

**No conflicts**: Warning banner hidden. "Already covered" metric card shows "0" in `var(--sds-text-primary)`.

**Multiple conflicts**: Warning banner lists top 3 conflicting policies. "View all N conflicts" link.

#### Responsive Behavior

- Metric cards: 3 columns at 800px+, 1 column below (stack vertically)
- Summary cards: full width at all sizes
- Connection/schema picker: full width

---

### 5.6 Policy Detail

**Purpose**: View and manage a single policy. Overview, applied data, version history, and activity log.

#### Shell and Layout

- **Shell**: Full App Shell
- **Grid**: Single-column content area, 24px padding
- **Tabs**: 4 tabs below page header

#### Content Hierarchy

```
┌──────────────────────────────────────────────────────────────────────┐
│ HEADER (56px)                                                        │
├────────────┬─────────────────────────────────────────────────────────┤
│ SIDEBAR    │ CONTENT AREA (padding: 24px)                           │
│ 220px      │                                                         │
│            │ 1. Page Header                                          │
│            │    Breadcrumb: Policies > PCI Card Data Protection      │
│            │    Title: "PCI Card Data Protection"                    │
│            │    Status: [Active (tag)]  [Draft (tag)]                │
│            │    Actions: [Clone (tertiary)]                          │
│            │              [Edit (secondary)]                         │
│            │              [Apply to Data (primary)]                  │
│            │    Overflow: [...] -> Delete                            │
│            │                                                         │
│            │ 2. Page Tabs                                            │
│            │    Overview | Applied Data (234) | Versions (3) |       │
│            │    Activity Log                                         │
│            │                                                         │
│            │ ── TAB: OVERVIEW ──────────────────────────────────────  │
│            │                                                         │
│            │ 3a. Status Section                                      │
│            │    ┌──────────────────────────────────────────────┐     │
│            │    │ Policy status              [Active toggle]   │     │
│            │    │ This policy is actively enforced.            │     │
│            │    │ 234 columns are currently protected.         │     │
│            │    └──────────────────────────────────────────────┘     │
│            │                                                         │
│            │ 3b. Impact Metrics                                      │
│            │    ┌───────────┐  ┌───────────┐  ┌───────────┐         │
│            │    │ Protected │  │ Risk      │  │ Last      │         │
│            │    │ columns   │  │ reduction │  │ enforced  │         │
│            │    │ 234       │  │ -47 pts   │  │ 2 hrs ago │         │
│            │    └───────────┘  └───────────┘  └───────────┘         │
│            │                                                         │
│            │ 3c. Policy Configuration Summary                        │
│            │    ┌──────────────────────────────────────────────┐     │
│            │    │ Card: Basics                                 │     │
│            │    │ Regulation:    PCI DSS                       │     │
│            │    │ Priority:      High                          │     │
│            │    │ Scope:         All matching classifications  │     │
│            │    │ Created:       Mar 10, 2026 by Priya S.     │     │
│            │    │ Version:       v3 (latest)                   │     │
│            │    └──────────────────────────────────────────────┘     │
│            │                                                         │
│            │    ┌──────────────────────────────────────────────┐     │
│            │    │ Card: Token Configuration                    │     │
│            │    │ ┌───────┬────────┬──────────┬─────────────┐ │     │
│            │    │ │Class. │Format  │Preserv.  │Reversible   │ │     │
│            │    │ ├───────┼────────┼──────────┼─────────────┤ │     │
│            │    │ │PAN    │FPE     │First4/L4 │Yes          │ │     │
│            │    │ │CVV    │Random  │None      │No           │ │     │
│            │    │ └───────┴────────┴──────────┴─────────────┘ │     │
│            │    └──────────────────────────────────────────────┘     │
│            │                                                         │
│            │ ── TAB: APPLIED DATA ──────────────────────────────── │
│            │                                                         │
│            │ 3d. Applied Data Table                                   │
│            │    ┌──────┬──────────┬─────────┬────────┬──────────┐   │
│            │    │Conn. │Schema    │Table    │Column  │Tokenized │   │
│            │    ├──────┼──────────┼─────────┼────────┼──────────┤   │
│            │    │Snow..│finance   │transact.│card_num│Yes       │   │
│            │    │Snow..│finance   │transact.│cvv     │Yes       │   │
│            │    │Postg.│payments  │orders   │cc_num  │Pending   │   │
│            │    └──────┴──────────┴─────────┴────────┴──────────┘   │
│            │                                                         │
│            │ ── TAB: VERSIONS ─────────────────────────────────── │
│            │                                                         │
│            │ 3e. Version History                                     │
│            │    ┌──────┬──────────────────┬──────────┬──────────┐   │
│            │    │Vers. │Changes           │Author    │Date      │   │
│            │    ├──────┼──────────────────┼──────────┼──────────┤   │
│            │    │v3    │Updated FPE config│Priya S.  │Mar 12    │   │
│            │    │v2    │Added CVV class.  │Jordan K. │Mar 11    │   │
│            │    │v1    │Initial creation  │Priya S.  │Mar 10    │   │
│            │    └──────┴──────────────────┴──────────┴──────────┘   │
│            │    [Compare versions] -- opens Version Diff             │
│            │                                                         │
│            │ ── TAB: ACTIVITY LOG ─────────────────────────────── │
│            │                                                         │
│            │ 3f. Activity Log Table                                   │
│            │    ┌──────────┬───────────────────┬──────────┬────────┐ │
│            │    │Date      │Event              │User      │Detail  │ │
│            │    ├──────────┼───────────────────┼──────────┼────────┤ │
│            │    │Mar 12    │Policy edited      │Priya S.  │v2→v3   │ │
│            │    │Mar 11    │Applied to 47 cols │System    │Auto    │ │
│            │    │Mar 10    │Policy created     │Priya S.  │Draft   │ │
│            │    └──────────┴───────────────────┴──────────┴────────┘ │
│            │                                                         │
└────────────┴─────────────────────────────────────────────────────────┘
```

#### Status Toggle Section

```
┌──────────────────────────────────────────────────────────────────┐
│  Policy status                                    ┌────────────┐ │
│                                                   │ ●━━━ On    │ │  Toggle switch
│  This policy is actively enforced on              └────────────┘ │
│  234 columns across 3 connections.                               │
└──────────────────────────────────────────────────────────────────┘

Toggle on state:
  Track: var(--sds-status-success-strong) -- green-400
  Thumb: white, 20px circle
  Label: "Active" -- var(--sds-status-success-text)

Toggle off confirmation dialog:
  Title: "Pause policy enforcement?"
  Body: "Pausing this policy will stop it from being applied to newly
  classified columns. 234 currently tokenized columns will remain
  protected. To detokenize, use the Remediation flow."
  Actions: [Cancel (secondary)] [Pause enforcement (danger)]
```

#### Component Inventory

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| Header | `/components/header.html` | Global header |
| Side Navigation | `/components/side-navigation.html` | Sidebar |
| Tabs | `/components/tabs.html` `.sds-tabs` | Overview, Applied Data, Versions, Activity Log |
| Tab badges | `/components/tabs.html` `.sds-tab-badge` | Counts on Applied Data, Versions tabs |
| Cards | `/components/cards.html` | Summary cards, status card, metric cards |
| Tags -- Success (with dot) | `/components/tags.html` | Active status |
| Tags -- Neutral (with dot) | `/components/tags.html` | Draft status |
| Tags -- Warning (with dot) | `/components/tags.html` | Disabled status |
| Tags -- Info (sm) | `/components/tags.html` | Classification chips |
| Button -- Primary (md) | `/components/buttons.html` | "Apply to Data" |
| Button -- Secondary (md) | `/components/buttons.html` | "Edit" |
| Button -- Tertiary (md) | `/components/buttons.html` | "Clone" |
| Button -- Danger (md) | `/components/buttons.html` | Delete (in overflow) |
| Data Table | New | Applied data, versions, activity log |
| Toggle Switch | New | Status toggle |
| Confirmation Dialog | New | Disable confirmation |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Page title | color, size, weight | `var(--sds-text-primary)` -- 24px / 600 |
| Status tag (Active) | class | `.sds-tag--success` with `.sds-tag-dot` |
| Status tag (Draft) | class | `.sds-tag--neutral` with `.sds-tag-dot` |
| Status tag (Disabled) | class | `.sds-tag--warning` with `.sds-tag-dot` |
| Tab active indicator | border-bottom | 2px solid `var(--sds-interactive-primary)` |
| Tab active text | color | `var(--sds-text-primary)` -- 500 weight |
| Tab inactive text | color | `var(--sds-text-tertiary)` |
| Tab badge (active) | bg, color | `var(--sds-interactive-primary-subtle)`, `var(--sds-interactive-primary)` |
| Tab badge (inactive) | bg, color | `var(--sds-status-neutral-bg)`, `var(--sds-text-secondary)` |
| Summary card bg | background | `var(--sds-bg-surface)` |
| Summary label | color | `var(--sds-text-tertiary)` -- 12px |
| Summary value | color | `var(--sds-text-primary)` -- 13px |
| Toggle track (on) | background | `var(--sds-status-success-strong)` |
| Toggle track (off) | background | `var(--sds-color-warm-gray-300)` |
| Toggle thumb | background | `var(--sds-color-white)` |
| Version row current | font-weight | 500 (bold) |
| Version link | color | `var(--sds-text-link)` |

#### Interaction Details

| Interaction | Behavior |
|-------------|----------|
| Tab click | Tab content transitions. Active indicator slides (200ms). Badge updates styling |
| "Edit" click | Opens wizard at Step 1 with current values pre-filled. On save, creates new version |
| "Clone" click | Opens wizard at Step 1 with "Copy of [name]" pre-filled. All settings duplicated |
| "Apply to Data" click | Navigates to Remediation Flow 4 with this policy pre-selected |
| "Delete" (overflow) click | If policy has applied data: blocking dialog with options. If no applied data: confirmation dialog |
| Status toggle click | Opens confirmation dialog (when disabling). Toggles state on confirm |
| Version row click | Opens Policy Version Diff between that version and current |
| "Compare versions" click | Opens version picker dropdown, then navigates to diff view |
| Applied data row click | Navigates to Data Catalog filtered to that column |

#### State Variations

**Draft policy**: Toggle hidden (drafts cannot be active/disabled). "Apply to Data" disabled with tooltip: "Activate this policy first."

**Disabled policy**: Warning banner above status section: "This policy is paused. New matching columns will not be protected." Toggle shows "off" state.

**No applied data**: Applied Data tab shows empty state: "This policy has not been applied to any data yet." CTA: "Apply to data" button.

**Loading**: Skeleton loaders for metric cards. Table shows skeleton rows.

#### Responsive Behavior

- Metric cards: 3-up at 800px+, stack at narrower
- Tabs: horizontal scroll when tabs overflow at small widths
- Action buttons: overflow into three-dot menu below 768px
- Tables: horizontal scroll below 600px

---

### 5.7 Policy Version Diff

**Purpose**: Side-by-side comparison of two policy versions, highlighting what changed.

#### Shell and Layout

- **Shell**: Full App Shell
- **Grid**: Content area with two equal columns (50/50 split), 24px gap. Below 960px, stacks vertically.

#### Content Hierarchy

```
┌──────────────────────────────────────────────────────────────────────┐
│ HEADER (56px)                                                        │
├────────────┬─────────────────────────────────────────────────────────┤
│ SIDEBAR    │ CONTENT AREA (padding: 24px)                           │
│ 220px      │                                                         │
│            │ 1. Page Header                                          │
│            │    Breadcrumb: Policies > PCI Card Data > Versions      │
│            │    Title: "Compare versions"                            │
│            │    Version pickers:                                     │
│            │    ┌──────────────┐    ┌──────────────┐                │
│            │    │ Version 2 v  │ vs │ Version 3 v  │                │
│            │    └──────────────┘    └──────────────┘                │
│            │    Actions: [Revert to v2 (secondary)]  [Close]        │
│            │                                                         │
│            │ 2. Diff Content (side by side)                          │
│            │    ┌──────────────────────┬──────────────────────┐      │
│            │    │ VERSION 2            │ VERSION 3 (current)  │      │
│            │    │ Mar 11, Jordan K.    │ Mar 12, Priya S.     │      │
│            │    │                      │                      │      │
│            │    │ ── Basics ────────── │ ── Basics ────────── │      │
│            │    │ Name: PCI Card Data  │ Name: PCI Card Data  │      │
│            │    │ Regulation: PCI DSS  │ Regulation: PCI DSS  │      │
│            │    │ Priority: Medium     │ Priority: High       │      │
│            │    │          ▲ changed   │          ▲ changed   │      │
│            │    │                      │                      │      │
│            │    │ ── Token Config ──── │ ── Token Config ──── │      │
│            │    │ PAN:                 │ PAN:                 │      │
│            │    │   Format: FPE        │   Format: FPE        │      │
│            │    │   Preserve: Last 4   │   Preserve: F4/L4   │      │
│            │    │            ▲ changed │            ▲ changed │      │
│            │    │   Reverse: Yes       │   Reverse: Yes       │      │
│            │    │                      │                      │      │
│            │    │ CVV:                 │ CVV:                 │      │
│            │    │   (no changes)       │   (no changes)       │      │
│            │    │                      │                      │      │
│            │    │ ── Scope ─────────── │ ── Scope ─────────── │      │
│            │    │ All matching         │ All matching         │      │
│            │    │ (no changes)         │ (no changes)         │      │
│            │    └──────────────────────┴──────────────────────┘      │
│            │                                                         │
└────────────┴─────────────────────────────────────────────────────────┘
```

#### Diff Highlighting Specs

```
Changed field row:
  ┌──────────────────────────────────────┐
  │ Priority: Medium                     │   Left (old value):
  │ ▲ changed                            │   bg: var(--sds-status-error-bg) -- red-050
  └──────────────────────────────────────┘   text: var(--sds-text-primary)
                                              "changed" label: 11px, var(--sds-status-error-text)

  ┌──────────────────────────────────────┐
  │ Priority: High                       │   Right (new value):
  │ ▲ changed                            │   bg: var(--sds-status-success-bg) -- green-025
  └──────────────────────────────────────┘   text: var(--sds-text-primary)
                                              "changed" label: 11px, var(--sds-status-success-text)

Unchanged field row:
  No background highlight. Normal text colors.
  Value: var(--sds-text-secondary) -- 13px

Section divider:
  Label: 12px / 600 / uppercase, var(--sds-text-tertiary)
  Line: 1px var(--sds-border-subtle)
```

#### Component Inventory

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| Button -- Secondary (md) | `/components/buttons.html` | "Revert to version" |
| Button -- Tertiary (md) | `/components/buttons.html` | "Close" |
| Tags -- Error (sm) | `/components/tags.html` | "Removed" label |
| Tags -- Success (sm) | `/components/tags.html` | "Added" label |
| Tags -- Neutral (sm) | `/components/tags.html` | "Unchanged" label |
| Select dropdown | New | Version pickers |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Version column header bg | background | `var(--sds-bg-subtle)` |
| Version column header text | color | `var(--sds-text-secondary)` -- 13px / 600 |
| Version metadata (author, date) | color | `var(--sds-text-tertiary)` -- 12px |
| Column divider | border | 1px solid `var(--sds-border-default)` |
| Changed row bg (old/removed) | background | `var(--sds-status-error-bg)` |
| Changed row bg (new/added) | background | `var(--sds-status-success-bg)` |
| Changed indicator text (old) | color | `var(--sds-status-error-text)` -- 11px |
| Changed indicator text (new) | color | `var(--sds-status-success-text)` -- 11px |
| Unchanged text | color | `var(--sds-text-secondary)` |
| Section header | color | `var(--sds-text-tertiary)` -- 12px / 600 / uppercase |
| Field label | color | `var(--sds-text-tertiary)` -- 12px |
| Field value | color | `var(--sds-text-primary)` -- 13px |
| "vs" text | color | `var(--sds-text-disabled)` -- 14px / 500 |

#### Interaction Details

| Interaction | Behavior |
|-------------|----------|
| Version picker change | Both columns update. Changed fields re-highlight. Fade transition 200ms |
| "Revert to v2" click | Confirmation dialog: "This will create a new version (v4) with v2 settings." [Cancel] [Revert (primary)] |
| "Close" click | Returns to Policy Detail, Versions tab |
| Changed field hover | Tooltip shows old and new values |
| Scroll | Both columns scroll in sync (scroll-lock) |

#### State Variations

**No changes between versions**: Message: "These versions are identical." All fields shown without highlighting.

**Many changes**: Changed fields highlighted. Unchanged sections collapsed with "N unchanged fields" toggle.

**Loading**: Skeleton loaders in both columns.

#### Responsive Behavior

- Below 960px: Columns stack vertically. "Version 2" above "Version 3". Each becomes full width
- Below 768px: Sidebar collapses. Columns remain stacked
- Scroll sync disabled when stacked

---

### 5.8 Inline Policy Creator (Drawer)

**Purpose**: Create a policy without leaving the Remediation flow. Slides in as a drawer overlay from the right.

#### Shell and Layout

- **Shell**: Drawer overlay on top of existing page (Remediation flow)
- **Drawer width**: 480px minimum, 560px preferred. Max: 50% of viewport
- **Breakpoint**: Below 960px viewport, drawer becomes full-page takeover
- **Backdrop**: Semi-transparent overlay (`rgba(0,0,0,0.3)`) over the parent page
- **Z-index**: 1000 (above all page content)

#### Content Hierarchy

```
┌─ PARENT PAGE (Remediation Flow) ──────────────────────────────────┐
│                                                                     │
│  ┌─ BACKDROP (rgba(0,0,0,0.3)) ──────────────────────────────────┐│
│  │                                                                ││
│  │         ┌─ DRAWER (480px-560px) ──────────────────────────────┐││
│  │         │                                                      │││
│  │         │ 1. Drawer Header (sticky)                           │││
│  │         │    ┌──────────────────────────────────────────────┐  │││
│  │         │    │ Create policy                    [X Close]   │  │││
│  │         │    │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  │││
│  │         │    │ Step 1 of 3: Basics                          │  │││
│  │         │    └──────────────────────────────────────────────┘  │││
│  │         │                                                      │││
│  │         │ 2. Drawer Body (scrollable)                         │││
│  │         │    ┌──────────────────────────────────────────────┐  │││
│  │         │    │                                              │  │││
│  │         │    │ [Condensed wizard step content]              │  │││
│  │         │    │ Same fields as full wizard, arranged         │  │││
│  │         │    │ single-column, full-width within drawer      │  │││
│  │         │    │                                              │  │││
│  │         │    │ Step 1: Name, description, regulation,      │  │││
│  │         │    │         priority, classifications            │  │││
│  │         │    │                                              │  │││
│  │         │    │ Step 2: Token config per classification      │  │││
│  │         │    │         (test panel is collapsible section)  │  │││
│  │         │    │                                              │  │││
│  │         │    │ Step 3: Scope selector, impact preview,     │  │││
│  │         │    │         settings summary                    │  │││
│  │         │    │                                              │  │││
│  │         │    └──────────────────────────────────────────────┘  │││
│  │         │                                                      │││
│  │         │ 3. Drawer Footer (sticky)                           │││
│  │         │    ┌──────────────────────────────────────────────┐  │││
│  │         │    │ [Cancel]        [Back]  [Next / Create]     │  │││
│  │         │    └──────────────────────────────────────────────┘  │││
│  │         │                                                      │││
│  │         └──────────────────────────────────────────────────────┘││
│  │                                                                ││
│  └────────────────────────────────────────────────────────────────┘│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Drawer Specs

```
Drawer container:
  Position: fixed, right: 0, top: 0, bottom: 0
  Width: clamp(480px, 40vw, 50vw)
  Background: var(--sds-bg-page)
  Border-left: 1px solid var(--sds-border-default)
  Box-shadow: -4px 0 24px rgba(0,0,0,0.12)
  Z-index: 1000
  Animation: slide-in from right, 300ms cubic-bezier(0.4, 0, 0.2, 1)

Drawer header:
  Height: 56px
  Padding: 0 24px
  Border-bottom: 1px solid var(--sds-border-subtle)
  Background: var(--sds-bg-page)
  Position: sticky, top: 0
  Display: flex, align-items: center, justify-content: space-between

Drawer title:
  Font: 16px / 600, var(--sds-text-primary)

Close button:
  .btn-tertiary.btn-sm, icon-only (X icon)
  24px hit area

Progress bar (mini):
  Height: 3px, below header
  Background: var(--sds-border-subtle)
  Fill: var(--sds-interactive-primary)
  Width: 33% (step 1), 66% (step 2), 100% (step 3)
  Transition: width 300ms ease

Step label:
  13px / 400, var(--sds-text-tertiary)
  Below progress bar, padding: 8px 24px

Drawer body:
  Padding: 24px
  Overflow-y: auto
  Flex: 1

Drawer footer:
  Padding: 16px 24px
  Border-top: 1px solid var(--sds-border-subtle)
  Background: var(--sds-bg-page)
  Position: sticky, bottom: 0
  Display: flex, justify-content: space-between

Backdrop:
  Position: fixed, inset: 0
  Background: rgba(0,0,0,0.3)
  Z-index: 999
  Animation: fade-in 200ms
```

#### Drawer Content Adaptations

The drawer uses the same content as the full wizard but with these adaptations:

**Step 1 (Basics + Classifications)**:
- All fields stack in single column (no side-by-side regulation/priority)
- Classification groups use accordion pattern (collapsed by default, expand on click)
- Template selector: simplified dropdown instead of card grid

**Step 2 (Token Configuration)**:
- No side-by-side split. Config cards stack vertically
- Test panel is a collapsible section at the bottom, labeled "Test tokenization"
- Collapsed by default. Toggle button: "Show test panel" / "Hide test panel"
- Test panel: full drawer width when expanded

**Step 3 (Scope + Review)**:
- Impact metrics: 1 column (stacked vertically, not 3-up grid)
- Summary: compact key-value pairs, no cards
- "Create Policy" button in footer changes from "Next" label

#### Component Inventory

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| Button -- Primary (md) | `/components/buttons.html` | "Next" / "Create Policy" |
| Button -- Secondary (md) | `/components/buttons.html` | "Back" |
| Button -- Tertiary (sm) | `/components/buttons.html` | "Cancel", Close icon |
| Card | `/components/cards.html` | Config cards (within drawer body) |
| Tags | `/components/tags.html` | Classification chips |
| Drawer | New component needed | Overlay container |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Drawer background | background | `var(--sds-bg-page)` |
| Drawer border-left | border | 1px solid `var(--sds-border-default)` |
| Drawer shadow | box-shadow | `-4px 0 24px rgba(0,0,0,0.12)` |
| Backdrop | background | `rgba(0,0,0,0.3)` |
| Header border-bottom | border | 1px solid `var(--sds-border-subtle)` |
| Header title | color, size, weight | `var(--sds-text-primary)` -- 16px / 600 |
| Progress bar track | background | `var(--sds-border-subtle)` |
| Progress bar fill | background | `var(--sds-interactive-primary)` |
| Step label | color | `var(--sds-text-tertiary)` -- 13px |
| Footer border-top | border | 1px solid `var(--sds-border-subtle)` |
| Body padding | padding | 24px |
| Field gap | gap | 16px |

#### Interaction Details

| Interaction | Behavior |
|-------------|----------|
| Drawer open | Slides in from right: 300ms cubic-bezier(0.4, 0, 0.2, 1). Backdrop fades in: 200ms. Body scroll locked on parent page |
| Backdrop click | Confirmation dialog if form has unsaved changes: "Discard policy? Progress will be lost." Otherwise, drawer closes |
| Close (X) click | Same as backdrop click |
| Escape key | Same as backdrop click |
| "Next" click | Within-drawer slide-left transition for step content. Progress bar animates width. Footer buttons update |
| "Back" click | Within-drawer slide-right transition. Progress bar reduces |
| "Create Policy" click (Step 3) | Button shows loading state. On success: drawer closes (slide-out 300ms). Success toast appears on parent page. New policy auto-selected in remediation config |
| "Cancel" click | Same as close -- confirmation if changes exist |
| Drawer close | Slide-out right: 300ms. Backdrop fades out: 200ms. Parent scroll restored. Focus returns to trigger element |

#### State Variations

**Empty (just opened)**: Step 1 visible with empty fields. If opened from remediation context, regulation may be pre-suggested based on column classification.

**Form populated**: Fields filled. Validation errors shown inline per field.

**Loading (create)**: "Create Policy" button disabled with spinner. Drawer cannot be closed during creation.

**Success**: Drawer slides out. Toast: "Policy created successfully" with link to full policy detail.

**Error (create failed)**: Error banner at top of drawer body. "Unable to create policy. Please try again." Button re-enabled.

#### Responsive Behavior

- 960px+ viewport: Drawer at 480-560px width, parent page visible behind backdrop
- Below 960px: Drawer becomes full-page takeover. Width: 100vw. Backdrop hidden. Header gains back arrow instead of X. Behaves like a full-page wizard
- Below 480px: Single-column layout within drawer. All fields stack. Test panel hidden by default

---

## 6. New Components Needed

The following components are not yet in the Software DS library and need to be created:

| Component | Used In | Priority |
|-----------|---------|----------|
| **Data Table** | Policy List, Applied Data, Versions, Activity Log | Critical |
| **Filter Bar** | Policy List | High |
| **Pagination** | Policy List, Applied Data | High |
| **Form Inputs** (text, textarea, select, checkbox, radio) | Wizard steps 1-3, Inline creator | Critical |
| **Wizard Progress Bar** | Create Policy wizard (all 3 steps) | High |
| **Toggle Switch** | Policy Detail status toggle | Medium |
| **Drawer / Side Panel** | Inline Policy Creator | High |
| **Confirmation Dialog** | Delete, Disable, Discard actions | High |
| **Toast / Notification** | Success/error messages after actions | Medium |
| **Skeleton Loader** | All loading states | Medium |
| **Info Banner** | Regulation requirements, template pre-fill | Medium |
| **Warning Banner** | Override warnings, conflict notices | Medium |
| **Accordion** | Classification groups in drawer | Medium |
| **Empty State** (pattern) | Policy List, Applied Data tab | Low (follows page-designer spec) |

Use the component-builder skill (`/component-builder`) to design each of these components following Software DS token conventions.
