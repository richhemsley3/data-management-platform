# Flow 2: Data Scanning & Classification -- Design Specification

**Version**: 1.0
**Date**: 2026-03-14
**Flow stage**: Discover + Classify
**Primary personas**: Jordan (scan operations), Priya (classification review)

---

## Table of Contents

1. [Feature Requirements](#1-feature-requirements)
2. [Design Rationale](#2-design-rationale)
3. [Pattern Recommendations](#3-pattern-recommendations)
4. [Edge Cases & Considerations](#4-edge-cases--considerations)
5. [Screen Specifications](#5-screen-specifications)
   - [5.1 Scan Progress](#51-scan-progress)
   - [5.2 Scan Summary](#52-scan-summary)
   - [5.3 Schema Drift Summary](#53-schema-drift-summary)
   - [5.4 Classification Review Queue](#54-classification-review-queue)
   - [5.5 Table Review](#55-table-review)
   - [5.6 Data Catalog](#56-data-catalog)
   - [5.7 Table Detail](#57-table-detail)
   - [5.8 Classification Rules List](#58-classification-rules-list)
   - [5.9 Create Rule](#59-create-rule)
   - [5.10 Rule Detail](#510-rule-detail)

---

## 1. Feature Requirements

### Problem Statement

After connecting data sources (Flow 1), organizations need to discover what data they have, identify sensitive fields, and classify them accurately. Manual classification does not scale -- a single Snowflake instance may contain 50,000+ columns. Users need guided, semi-automatic classification with human oversight to balance speed with accuracy.

### Target Users

| Persona | Role | Primary Tasks |
|---------|------|---------------|
| **Jordan** | Data Engineer / Scan Operator | Trigger scans, monitor progress, configure schedules, review scan results |
| **Priya** | Data Steward / Classification Reviewer | Review pending classifications, create rules, resolve inconsistencies, override/accept suggestions |

### Success Metrics

- Time to first classification < 30 minutes after first scan completes
- Classification review throughput > 200 columns/hour with bulk actions
- False positive rate on auto-classification < 5% at 90%+ confidence threshold
- Schema drift detection within 24 hours of change
- Rule coverage > 60% of columns after 2 weeks of use

### User Stories

1. As Jordan, I want to trigger a scan and see real-time progress so I know when results are ready.
2. As Jordan, I want large scans to run in the background so I can continue other work.
3. As Priya, I want pending classifications sorted by confidence so I review the hardest items first.
4. As Priya, I want to bulk-accept high-confidence classifications so I can focus my time on edge cases.
5. As Priya, I want to see why the system suggested a classification so I can trust or correct it.
6. As Priya, I want to create reusable rules so future scans classify automatically.
7. As Priya, I want to see cross-table inconsistencies so I can enforce consistent classification.

---

## 2. Design Rationale

| Decision | Chosen Approach | Alternatives Considered | Rationale |
|----------|-----------------|------------------------|-----------|
| Review workflow | Dedicated Review Queue separate from Data Catalog | Inline review in Data Catalog | Separating the workflow tool (Queue) from the reference tool (Catalog) lets each optimize for its primary task. Queue surfaces actionable items; Catalog supports browsing. |
| Confidence display | Horizontal bar with numeric percentage | Star rating, letter grades, color-only | Percentage is precise and sortable. Bar adds visual weight. Color coding (red/yellow/green) reinforces at-a-glance scanning. |
| Classification reasoning | Expandable row with signal breakdown | Tooltip, modal, separate page | Expandable row keeps context in-flow. Tooltip is too small for detailed reasoning. Modal interrupts workflow. |
| Bulk actions | Threshold-based accept with preview | Select-all checkbox only | Threshold gives Priya control over quality vs. speed tradeoff. Preview prevents accidental mass-accepts. |
| Rules management | Tab within Review Queue | Separate top-level page | Co-locating rules with the queue where they take effect reduces navigation. Rules are part of the classification workflow, not a standalone feature. |
| Consistency checker | Tab within Review Queue | Separate page, inline warnings only | Tab keeps all classification workflow in one place. Inline-only warnings are easy to miss in large datasets. |
| Scan progress | Dedicated progress page with live updates | Toast/notification only | Large scans (10K+ tables) merit a dedicated view. Background mode + notification handles the "don't want to watch" case. |
| Schema drift | Separate summary before classification | Inline in Data Catalog | Surfacing drift as a deliberate step ensures Jordan/Priya acknowledge changes before classification review begins. |

---

## 3. Pattern Recommendations

| Screen | Primary Pattern | Secondary Patterns | Reference |
|--------|-----------------|-------------------|-----------|
| Scan Progress | Progress view (custom) | -- | Custom animated progress |
| Scan Summary | Summary view with metric cards | -- | Metric Cards Row pattern |
| Schema Drift Summary | Data Table with Inline Actions | Filter Panel | Data Management Patterns: Data Table |
| Classification Review Queue | Queue/List with Tabs | Filter Panel, Bulk Operations | Data Management Patterns: Data Table, Filter Panel, Bulk Operations |
| Table Review | Data Table with Inline Actions | Bulk Operations | Data Management Patterns: Data Table, Bulk Operations |
| Data Catalog | Data Table with Inline Actions | Filter Panel, Search | Data Management Patterns: Data Table, Filter Panel, Search |
| Table Detail | Detail View with Tabs | Master-Detail | Data Management Patterns: Master-Detail |
| Classification Rules List | Data Table with Inline Actions | CRUD Workflow | Data Management Patterns: Data Table, CRUD Workflow |
| Create Rule | Form View | -- | Page Designer: Form Section pattern |
| Rule Detail | Detail View | Data Lineage | Data Management Patterns: Data Lineage |

---

## 4. Edge Cases & Considerations

### Empty States

| Screen | Empty Condition | Message | CTA |
|--------|----------------|---------|-----|
| Scan Progress | No active scans | "No scans running. Start a scan from a connection or the Scans page." | [Go to Connections] (primary) |
| Scan Summary | N/A (always has data after scan) | -- | -- |
| Review Queue | No pending items | "All classifications reviewed. Run a new scan or create rules for future automation." | [Run Scan] (primary), [Create Rule] (secondary) |
| Data Catalog | No scanned data | "No data discovered yet. Connect a data source and run your first scan." | [Add Connection] (primary) |
| Rules List | No rules created | "No classification rules yet. Create rules to automate future classification suggestions." | [Create Rule] (primary) |
| Consistency Tab | No inconsistencies | "No inconsistencies found. All same-name columns are classified consistently." | -- (success state) |

### Error States

| Scenario | Display | Recovery |
|----------|---------|----------|
| Full scan failure | Error banner with reason. Link to connection health check. | [Retry Scan] (primary), [Check Connection] (secondary) |
| Partial scan failure | Summary shows success count + failure count. Failed tables listed with per-table retry. | [Retry All Failed] (primary), per-row [Retry] (tertiary) |
| Network drop mid-scan | Banner: "Scan interrupted at N%. Partial results saved." | [Resume Scan] (primary) |
| Classification save fails | Inline error on the specific item. Toast notification. | Automatic retry after 3s, then manual [Retry] |
| Rule pattern invalid | Inline validation under the pattern input. | Fix pattern, re-validate |

### Scale Considerations

| Scenario | Handling |
|----------|----------|
| 10K+ pending classifications | Paginated queue (50 per page). Progress indicator: "247 of 10,342 reviewed." Bulk accept with threshold. |
| 1000+ tables in catalog | Server-side pagination. Search + filter. Column visibility toggle. |
| Large scan (>10K tables) | Auto-move to background after 15 minutes. Sidebar badge shows running count. |
| Rule matches thousands | Show match count in rule detail. Paginated matches list. |

---

## 5. Screen Specifications

---

### 5.1 Scan Progress

**Purpose**: Show real-time scan status with live-updating metrics so Jordan can monitor discovery progress.

**Page type**: Progress view
**Primary persona**: Jordan
**Entry from**: Trigger scan (Connection Detail or Scans page)
**Exits to**: Scan Summary (on completion), Background (on move-to-background)

#### Shell & Layout

- **Shell**: Full App Shell (header 56px + sidebar 220px + content area)
- **Grid**: Single-column content area, centered layout
- **Sidebar active item**: "Scans" under the Discover group
- **Content max-width**: 640px, horizontally centered within content area

```
+------------------------------------------------------------------+
| Header (56px)                                                     |
+----------+-------------------------------------------------------+
| Sidebar  | Content Area (padding: 24px)                          |
| 220px    |                                                       |
|          |   Breadcrumb: Scans > Scan Progress                   |
|          |   Page Title: "Scanning [Connection Name]"             |
|          |                                                       |
|          |   +----------------------------------------------+    |
|          |   |  Progress Card                               |    |
|          |   |                                               |    |
|          |   |  [============>-------] 67%                   |    |
|          |   |                                               |    |
|          |   |  Tables: 6,721 / 10,000                       |    |
|          |   |  Columns discovered: 84,205                   |    |
|          |   |  Elapsed: 12m 34s    ETA: ~6m remaining       |    |
|          |   |                                               |    |
|          |   +----------------------------------------------+    |
|          |                                                       |
|          |   +----------------------------------------------+    |
|          |   |  Live Discovery Feed (card)                   |    |
|          |   |  Schema: analytics.events  - 42 columns       |    |
|          |   |  Schema: analytics.users   - 18 columns       |    |
|          |   |  Schema: finance.txns      - 31 columns       |    |
|          |   |  ...auto-scrolling feed...                    |    |
|          |   +----------------------------------------------+    |
|          |                                                       |
|          |   [Cancel Scan] (danger-outline)                      |
|          |   [Move to Background] (secondary)                    |
|          |                                                       |
+----------+-------------------------------------------------------+
```

#### Content Hierarchy

1. **Breadcrumb**
   - Path: Scans > Scan Progress
   - Font: 13px, `var(--sds-text-link)` (`--sds-color-blue-750`)
   - Separator: dot, `var(--sds-color-warm-gray-300)`

2. **Page Title**
   - Text: "Scanning [Connection Name]"
   - Font: 24px, weight 600, `var(--sds-text-primary)`
   - Below title: Subtitle line showing scan type and start time
   - Subtitle font: 14px, `var(--sds-text-secondary)`
   - Gap title to content: 24px

3. **Progress Card** (`.sds-card`)
   - Background: `var(--sds-bg-card)`
   - Border: 1px solid `var(--sds-border-default)`
   - Border-radius: 8px
   - Padding: 24px

   a. **Progress bar**
   - Height: 8px, border-radius: 4px
   - Track background: `var(--sds-bg-subtle)` (`--sds-color-warm-gray-050`)
   - Fill: `var(--sds-interactive-primary)` (`--sds-color-blue-750`)
   - Animation: Width transitions with `ease-out 0.6s`
   - Percentage label: Right-aligned, 24px, weight 600, `var(--sds-text-primary)`

   b. **Metrics grid** (2x2 grid, 16px gap)
   - Each metric:
     - Label: 13px, `var(--sds-text-secondary)` (`--sds-color-warm-gray-650`)
     - Value: 20px, weight 600, `var(--sds-text-primary)` (`--sds-color-warm-gray-900`)
   - Metrics:
     - "Tables scanned": "6,721 / 10,000"
     - "Columns discovered": "84,205" (animated counter)
     - "Elapsed time": "12m 34s"
     - "Estimated remaining": "~6m"

4. **Live Discovery Feed** (`.sds-card`)
   - Background: `var(--sds-bg-card)`
   - Border: 1px solid `var(--sds-border-default)`
   - Header: "Recent discoveries", 14px, weight 600
   - Max-height: 240px, overflow-y: auto
   - Each feed item:
     - Schema + table name: 13px, weight 500, `var(--sds-text-primary)`
     - Column count: 13px, `var(--sds-text-secondary)`
     - Separator: 1px solid `var(--sds-border-subtle)`
   - New items animate in from bottom with `translateY(8px)` + opacity, 0.2s ease

5. **Action Buttons**
   - Layout: flex row, gap 12px, margin-top 24px
   - [Cancel Scan]: `.btn .btn-danger-outline .btn-md`
   - [Move to Background]: `.btn .btn-secondary .btn-md`

#### Component Inventory

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| Header | `/components/header.html` | Global header bar |
| Side Navigation | `/components/side-navigation.html` | Sidebar with "Scans" active |
| Card | `/components/cards.html` | Progress card, Feed card |
| Button (danger-outline) | `/components/buttons.html` | Cancel Scan |
| Button (secondary) | `/components/buttons.html` | Move to Background |
| **New: Progress Bar** | Needs component | Horizontal progress bar |
| **New: Live Feed** | Needs component | Auto-scrolling feed list |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Page background | background | `var(--sds-bg-page)` |
| Sidebar background | background | `var(--sds-nav-sidebar-bg)` |
| Sidebar active item bg | background | `var(--sds-nav-item-active-bg)` |
| Sidebar active item text | color | `var(--sds-nav-item-active-text)` |
| Breadcrumb | color | `var(--sds-text-link)` |
| Page title | color | `var(--sds-text-primary)` |
| Progress bar track | background | `var(--sds-bg-subtle)` |
| Progress bar fill | background | `var(--sds-interactive-primary)` |
| Card surface | background | `var(--sds-bg-card)` |
| Card border | border | `var(--sds-border-default)` |
| Metric label | color | `var(--sds-text-secondary)` |
| Metric value | color | `var(--sds-text-primary)` |
| Feed item divider | border | `var(--sds-border-subtle)` |

#### Interaction Details

- **Progress bar**: Animates smoothly via CSS `transition: width 0.6s ease-out`. Updates every 2 seconds via polling or WebSocket.
- **Counter animation**: Columns discovered count uses a number-rolling animation (CSS `@keyframes` or JS `requestAnimationFrame`). Increments shown as they arrive.
- **Live feed**: New items slide in from bottom with `transform: translateY(8px); opacity: 0` to `translateY(0); opacity: 1` over 0.2s.
- **Move to Background**: Click triggers a toast notification "Scan moved to background. You'll be notified when complete." Navigates user to previous page. Sidebar "Scans" item shows a badge with active scan count using `.sds-badge .sds-badge--info`.
- **Cancel Scan**: Opens confirmation dialog. "Cancel this scan? Partial results will be discarded." [Cancel Scan] (danger), [Keep Running] (secondary).

#### State Variations

| State | Display |
|-------|---------|
| **Loading** | Skeleton shimmer on progress card. Feed shows 3 placeholder rows with pulsing `var(--sds-bg-subtle)` blocks. |
| **In progress** | Default state as described above. |
| **Large scan (>10K tables)** | After 15 minutes, a banner appears above the progress card: "This scan is taking a while." with auto-move-to-background prompt. Background: `var(--sds-status-info-bg)`, text: `var(--sds-status-info-text)`. |
| **Error (connection dropped)** | Progress bar freezes. Red banner appears: "Scan interrupted at 67%." Background: `var(--sds-status-error-bg)`, text: `var(--sds-status-error-text)`. Actions: [Resume Scan] (primary), [Check Connection] (tertiary). |
| **Complete** | Auto-navigates to Scan Summary after a 1.5s delay. Brief checkmark animation on the progress bar (green fill flash). |

#### Responsive Behavior

- Below 1024px: Content max-width goes to 100% with padding 16px.
- Below 768px: Sidebar collapses to 56px icon-only mode. Metrics grid becomes 1-column stack.
- The live feed card maintains its max-height but grows horizontally to fill available width.

---

### 5.2 Scan Summary

**Purpose**: Present a concise overview of scan results -- what was found, how it breaks down by sensitivity category, and what changed since the last scan.

**Page type**: Summary view
**Primary persona**: Jordan
**Entry from**: Scan completion (auto-navigate from Scan Progress)
**Exits to**: Classification Review Queue, Data Catalog, Schema Drift Summary

#### Shell & Layout

- **Shell**: Full App Shell
- **Grid**: Single-column content area
- **Sidebar active item**: "Scans"
- **Content max-width**: None (full width of content area)

```
+------------------------------------------------------------------+
| Header (56px)                                                     |
+----------+-------------------------------------------------------+
| Sidebar  | Content Area (padding: 24px)                          |
| 220px    |                                                       |
|          |  Breadcrumb: Scans > Scan Summary                     |
|          |  Title: "Scan Complete: [Connection Name]"             |
|          |  Subtitle: "Completed Mar 14, 2026 at 2:45 PM"        |
|          |  Actions: [View Review Queue] (primary)                |
|          |           [Re-scan] (secondary)                        |
|          |                                                       |
|          |  +--------+ +--------+ +--------+ +--------+          |
|          |  | Total  | | Total  | |Sensitive| | Schema |          |
|          |  | Tables | |Columns | |Columns  | | Drift  |          |
|          |  | 1,247  | | 15,821 | | 3,456   | | 12     |          |
|          |  +--------+ +--------+ +--------+ +--------+          |
|          |                                                       |
|          |  +------------------------------------------------+   |
|          |  | Sensitivity Breakdown (card)                    |   |
|          |  | +----------+ +----------+ +----------+         |   |
|          |  | | PII      | | PCI      | | PHI      |         |   |
|          |  | | 1,892    | | 847      | | 717      |         |   |
|          |  | +----------+ +----------+ +----------+         |   |
|          |  +------------------------------------------------+   |
|          |                                                       |
|          |  +------------------------------------------------+   |
|          |  | Classification Status (card)                    |   |
|          |  | [=====Auto-classified====][===Pending===][Done] |   |
|          |  | Auto-classified: 2,180 | Pending: 1,276 | ...  |   |
|          |  +------------------------------------------------+   |
|          |                                                       |
|          |  +------------------------------------------------+   |
|          |  | Schema Drift Detected (conditional card)        |   |
|          |  | 8 new tables, 3 dropped columns, 1 type change |   |
|          |  | [View Schema Changes] (tertiary)                |   |
|          |  +------------------------------------------------+   |
|          |                                                       |
+----------+-------------------------------------------------------+
```

#### Content Hierarchy

1. **Page Header**
   - Breadcrumb: Scans > Scan Summary (13px, `var(--sds-text-link)`)
   - Title: "Scan Complete: [Connection Name]" (24px, weight 600, `var(--sds-text-primary)`)
   - Subtitle: Timestamp (14px, `var(--sds-text-secondary)`)
   - Right-aligned actions: [View Review Queue] (`.btn-primary .btn-md`), [Re-scan] (`.btn-secondary .btn-md`)
   - Title-to-content gap: 24px

2. **Summary Metric Cards** (4-column grid, 16px gap)
   - Card: `.sds-card` with `.sds-card-body` only
   - Padding: 16px 20px
   - Label: 13px, `var(--sds-text-secondary)`
   - Value: 24px, weight 600, `var(--sds-text-primary)`
   - Cards:
     - "Total Tables" / count
     - "Total Columns" / count
     - "Sensitive Columns" / count -- value uses `var(--sds-status-warning-text)` if > 0
     - "Schema Changes" / count -- value uses `var(--sds-status-info-text)` if > 0, hidden on first scan

3. **Sensitivity Breakdown Card** (`.sds-card`)
   - Header: "Sensitivity Breakdown" (`.sds-card-header .sds-card-header--bordered`)
   - Body: 3-column grid of sub-cards (16px gap)
   - Each sub-card is a div with:
     - Classification category tag: `.sds-tag .sds-tag--error` (PII), `.sds-tag .sds-tag--warning` (PCI), `.sds-tag .sds-tag--purple` (PHI)
     - Count: 20px, weight 600, `var(--sds-text-primary)`
     - Percentage of total: 13px, `var(--sds-text-tertiary)`

4. **Classification Status Card** (`.sds-card`)
   - Header: "Classification Status" (`.sds-card-header .sds-card-header--bordered`)
   - Body: Stacked horizontal bar chart
     - Bar height: 12px, border-radius: 6px
     - Segments:
       - Auto-classified (high confidence): `var(--sds-status-success-strong)` (`--sds-color-green-400`)
       - Pending review: `var(--sds-status-warning-strong)` (`--sds-color-yellow-200`)
       - Previously classified: `var(--sds-status-neutral-bg)` (`--sds-color-warm-gray-100`)
     - Legend below bar: dot + label + count for each segment
     - Legend font: 13px, `var(--sds-text-secondary)`

5. **Schema Drift Card** (conditional -- only shown on re-scans with detected changes)
   - `.sds-card` with left border accent: 3px solid `var(--sds-status-info-text)` (`--sds-color-blue-700`)
   - Header: "Schema Changes Detected" with `.sds-badge .sds-badge--info` showing count
   - Body: Summary line listing change types
     - "8 new tables, 3 dropped columns, 1 type change"
     - Font: 14px, `var(--sds-text-primary)`
   - Footer: [View Schema Changes] (`.btn-tertiary .btn-sm`)

#### Component Inventory

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| Header | `/components/header.html` | Global header |
| Side Navigation | `/components/side-navigation.html` | Sidebar |
| Card | `/components/cards.html` | All content cards |
| Button (primary) | `/components/buttons.html` | View Review Queue |
| Button (secondary) | `/components/buttons.html` | Re-scan |
| Button (tertiary) | `/components/buttons.html` | View Schema Changes |
| Tags | `/components/tags.html` | PII/PCI/PHI classification tags |
| Badges | `/components/tags.html` | Schema drift count badge |
| **New: Horizontal Stacked Bar** | Needs component | Classification status breakdown |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Metric card bg | background | `var(--sds-bg-card)` |
| Metric card border | border | `var(--sds-border-default)` |
| Metric label | color | `var(--sds-text-secondary)` |
| Metric value | color | `var(--sds-text-primary)` |
| Sensitive count (warning) | color | `var(--sds-status-warning-text)` |
| Schema drift accent | border-left | `var(--sds-status-info-text)` |
| Success bar segment | background | `var(--sds-status-success-strong)` |
| Warning bar segment | background | `var(--sds-status-warning-strong)` |
| Neutral bar segment | background | `var(--sds-status-neutral-bg)` |
| PII tag | class | `.sds-tag--error` |
| PCI tag | class | `.sds-tag--warning` |
| PHI tag | class | `.sds-tag--purple` |

#### Interaction Details

- **Page load animation**: Metric cards animate in with staggered fade-up (0.1s delay between each). Values count up from 0 over 0.6s.
- **View Review Queue**: Navigates to Classification Review Queue filtered to this scan's results. Badge on button shows pending count.
- **Re-scan**: Opens confirmation dialog. "Run a new scan on [Connection Name]? This will check for new and changed data." [Start Scan] (primary), [Cancel] (secondary).
- **View Schema Changes**: Navigates to Schema Drift Summary screen.
- **Hover on sensitivity sub-cards**: Background transitions to `var(--sds-bg-subtle)` over 0.12s. Cursor: pointer. Click navigates to Data Catalog filtered by that classification type.

#### State Variations

| State | Display |
|-------|---------|
| **First scan (no prior data)** | Schema Drift card hidden. "Schema Changes" metric card hidden. Classification Status shows only "Pending review" and "Auto-classified" segments. |
| **Partial failure** | Error banner above metric cards: "Scan completed with errors. [N] tables failed." Background: `var(--sds-status-error-bg)`. Link: [View Failed Tables]. Metric cards show partial results with a caution icon. |
| **No sensitive data found** | "Sensitive Columns" metric shows "0" in `var(--sds-status-success-text)`. Sensitivity Breakdown card shows empty state: "No sensitive data detected in this scan." |
| **Loading** | Skeleton shimmer on all cards. Metric values show animated shimmer blocks. |

#### Responsive Behavior

- Below 1280px: Metric cards go to 2x2 grid.
- Below 768px: Metric cards stack to 1 column. Sensitivity sub-cards stack to 1 column. Sidebar collapses.

---

### 5.3 Schema Drift Summary

**Purpose**: Surface structural changes detected between scans -- new tables, dropped columns, and type changes -- so operators can assess impact before classification review.

**Page type**: Summary view with data table
**Primary persona**: Jordan / Priya
**Entry from**: Scan Summary ("View Schema Changes")
**Exits to**: Classification Review Queue, Data Catalog

#### Shell & Layout

- **Shell**: Full App Shell
- **Grid**: Single-column content area, full width
- **Sidebar active item**: "Scans"

```
+------------------------------------------------------------------+
| Header (56px)                                                     |
+----------+-------------------------------------------------------+
| Sidebar  | Content Area (padding: 24px)                          |
| 220px    |                                                       |
|          |  Breadcrumb: Scans > Scan Summary > Schema Changes    |
|          |  Title: "Schema Changes Since Last Scan"               |
|          |  Subtitle: "12 changes detected -- last scanned Feb 28"|
|          |  Actions: [Acknowledge All] (primary)                  |
|          |                                                       |
|          |  +--------+ +--------+ +--------+                     |
|          |  | New    | | Dropped| | Modified|                     |
|          |  | Tables | |Columns | | Types   |                     |
|          |  | 8      | | 3      | | 1       |                     |
|          |  +--------+ +--------+ +--------+                     |
|          |                                                       |
|          |  [Filter: Change Type v] [Filter: Schema v]           |
|          |                                                       |
|          |  +------------------------------------------------+   |
|          |  | Change Type | Item          | Schema  | Impact  |   |
|          |  |-------------|---------------|---------|---------|   |
|          |  | + New Table | analytics.evt | analyti | 42 cols |   |
|          |  | + New Table | finance.inv   | finance | 18 cols |   |
|          |  | - Dropped   | users.legacy  | users   | 5 class |   |
|          |  | ~ Modified  | orders.items  | orders  | type chg|   |
|          |  +------------------------------------------------+   |
|          |                                                       |
+----------+-------------------------------------------------------+
```

#### Content Hierarchy

1. **Page Header**
   - Breadcrumb: Scans > Scan Summary > Schema Changes
   - Title: "Schema Changes Since Last Scan" (24px, weight 600, `var(--sds-text-primary)`)
   - Subtitle: "[N] changes detected -- last scanned [date]" (14px, `var(--sds-text-secondary)`)
   - Right-aligned: [Acknowledge All] (`.btn-primary .btn-md`)

2. **Change Summary Cards** (3-column grid, 16px gap)
   - Each card (`.sds-card`, body only, padding 16px 20px):
     - Icon: 20px, change-type specific color
     - Label: 13px, `var(--sds-text-secondary)`
     - Value: 24px, weight 600
     - "New Tables": Value in `var(--sds-status-success-text)`
     - "Dropped Columns": Value in `var(--sds-status-error-text)`
     - "Modified Types": Value in `var(--sds-status-warning-text)`

3. **Filter Bar**
   - Inline filter bar above table
   - Two dropdown filters: Change Type (New/Dropped/Modified/All), Schema
   - Filter styling: 13px, border 1px solid `var(--sds-border-default)`, border-radius 6px, padding 6px 12px
   - Active filter chip: background `var(--sds-interactive-primary-subtle)`, text `var(--sds-interactive-primary)`

4. **Changes Table**
   - Header row: background `var(--sds-bg-subtle)`, text 12px weight 600 `var(--sds-text-secondary)`
   - Columns:
     - **Change Type**: Tag showing change type
       - New: `.sds-tag .sds-tag--success` "New Table" or "New Column"
       - Dropped: `.sds-tag .sds-tag--error` "Dropped"
       - Modified: `.sds-tag .sds-tag--warning` "Type Changed"
     - **Item Name**: 13px, weight 500, `var(--sds-text-primary)`. Schema-qualified name.
     - **Schema**: 13px, `var(--sds-text-secondary)`
     - **Impact**: 13px, `var(--sds-text-secondary)`. Shows column count for new tables, classification count for dropped items.
     - **Actions**: [View] (`.btn-tertiary .btn-sm`) for new tables, [Archive Classifications] for dropped
   - Row hover: background `var(--sds-color-warm-gray-050)`
   - Row border: 1px solid `var(--sds-border-subtle)`

#### Component Inventory

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| Card | `/components/cards.html` | Summary metric cards |
| Tags | `/components/tags.html` | Change type indicators |
| Button (primary) | `/components/buttons.html` | Acknowledge All |
| Button (tertiary) | `/components/buttons.html` | Row actions |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Table header bg | background | `var(--sds-bg-subtle)` |
| Table header text | color | `var(--sds-text-secondary)` |
| Table row border | border-bottom | `var(--sds-border-subtle)` |
| Table row hover | background | `var(--sds-color-warm-gray-050)` |
| New tag | class | `.sds-tag--success` |
| Dropped tag | class | `.sds-tag--error` |
| Modified tag | class | `.sds-tag--warning` |
| Filter active chip bg | background | `var(--sds-interactive-primary-subtle)` |
| Filter active chip text | color | `var(--sds-interactive-primary)` |

#### Interaction Details

- **Acknowledge All**: Marks all schema changes as reviewed. Shows toast: "All schema changes acknowledged." Navigates to Review Queue.
- **Row click (new tables)**: Navigates to Table Detail in Data Catalog for that table.
- **Dropped items**: "Archive Classifications" archives the classifications for dropped columns. Shows confirmation: "Archive 5 classifications from users.legacy? These columns no longer exist."

#### State Variations

| State | Display |
|-------|---------|
| **No changes** | This screen is not navigable when no drift is detected. |
| **Only new tables** | Dropped/Modified metric cards show "0" in muted text. |
| **Large drift (50+ changes)** | Paginated table, 25 rows per page. Pagination at bottom with page numbers. |

#### Responsive Behavior

- Below 1024px: Summary cards stack to horizontal scroll. Table becomes scrollable horizontally.
- Below 768px: Sidebar collapses. Filter bar stacks vertically.

---

### 5.4 Classification Review Queue

**Purpose**: Centralized workflow hub for reviewing, accepting, overriding, or rejecting pending classification suggestions. Contains three sub-views as tabs: Queue, Rules, and Consistency.

**Page type**: Queue/list view with tabs
**Primary persona**: Priya
**Entry from**: Scan Summary, sidebar navigation, notification deep-link
**Exits to**: Table Review, Data Catalog, Create Rule, Rule Detail

#### Shell & Layout

- **Shell**: Full App Shell
- **Grid**: Single-column content area, full width
- **Sidebar active item**: "Review Queue" under the Classify group

```
+------------------------------------------------------------------+
| Header (56px)                                                     |
+----------+-------------------------------------------------------+
| Sidebar  | Content Area (padding: 24px)                          |
| 220px    |                                                       |
|          |  Title: "Classification Review"                        |
|          |  Subtitle: "1,276 items pending review"                |
|          |  Actions: [Bulk Accept] (primary)                      |
|          |                                                       |
|          |  [Queue (1,276)] [Rules (8)] [Consistency (3)]         |
|          |  ----tab bar border------------------------------      |
|          |                                                       |
|          |  === QUEUE TAB (active) ===                            |
|          |                                                       |
|          |  [Search...        ] [Connection v] [Type v]           |
|          |  [Confidence v] [Rule-suggested v]                     |
|          |                                                       |
|          |  Progress: 247 of 1,276 reviewed  [===>-------]        |
|          |                                                       |
|          |  +------------------------------------------------+   |
|          |  | [] | Column       | Table    | Conn | Class    |   |
|          |  |    |              |          |      | Confid.  |   |
|          |  |----|--------------|----------|------|----------|   |
|          |  | [] | ssn          | users    | Snow | PII 45%  |   |
|          |  |    | [v expand reasoning]                      |   |
|          |  | [] | card_number  | payments | Snow | PCI 52%  |   |
|          |  | [] | phone        | contacts | PG   | PII 68%  |   |
|          |  | [] | email_hash   | users    | Snow | PII 91%  |   |
|          |  |    |              |          |      |          |   |
|          |  | Actions per row: [Accept] [Override] [Reject]  |   |
|          |  +------------------------------------------------+   |
|          |                                                       |
|          |  Pagination: < 1 2 3 ... 26 >                         |
|          |                                                       |
+----------+-------------------------------------------------------+
```

#### Content Hierarchy

1. **Page Header**
   - Title: "Classification Review" (24px, weight 600, `var(--sds-text-primary)`)
   - Subtitle: "[N] items pending review" (14px, `var(--sds-text-secondary)`)
   - Right-aligned: [Bulk Accept] (`.btn-primary .btn-md`) with leading icon

2. **Page Tabs** (`.sds-tabs`)
   - Tab bar with bottom border: 1px solid `var(--sds-border-default)`
   - Tabs:
     - "Queue" with `.sds-tab-badge` showing pending count -- active badge uses `var(--sds-interactive-primary-subtle)` bg / `var(--sds-interactive-primary)` text
     - "Rules" with `.sds-tab-badge` showing rule count
     - "Consistency" with `.sds-tab-badge` showing inconsistency count -- badge uses `.sds-badge--warning` when count > 0
   - Active tab: `var(--sds-text-primary)`, weight 500, 2px bottom border `var(--sds-interactive-primary)`
   - Inactive tab: `var(--sds-text-tertiary)`

3. **Queue Tab Content**

   a. **Filter Bar** (inline, above table, gap 8px)
   - Search input: 200px, placeholder "Search columns...", border `var(--sds-border-default)`, focus border `var(--sds-border-focus)`
   - Dropdown filters: Connection, Classification Type, Confidence Range, Rule-suggested
   - Each filter: 13px, border `var(--sds-border-default)`, border-radius 6px, height 32px
   - Active filter chips: below filter bar, `var(--sds-interactive-primary-subtle)` bg, `var(--sds-interactive-primary)` text, with [x] remove

   b. **Review Progress Bar**
   - Height: 4px, width: 100%, margin 16px 0
   - Track: `var(--sds-bg-subtle)`
   - Fill: `var(--sds-status-success-strong)` (`--sds-color-green-400`)
   - Label above: "247 of 1,276 reviewed" -- 13px, `var(--sds-text-secondary)`

   c. **Queue Table**
   - Full-width data table
   - Header row: `var(--sds-bg-subtle)` bg, 12px weight 600 uppercase `var(--sds-text-secondary)`
   - Columns:
     - **Checkbox**: Selection column for bulk actions
     - **Column Name**: 13px, weight 500, `var(--sds-text-primary)`. Monospace font for column names.
     - **Table**: 13px, `var(--sds-text-secondary)`
     - **Connection**: 13px, `var(--sds-text-secondary)`, truncated with tooltip
     - **Suggested Classification**: `.sds-tag` using semantic variant (PII: `--error`, PCI: `--warning`, PHI: `--purple`)
     - **Confidence**: Custom confidence bar
       - Bar width: 60px, height: 6px, border-radius: 3px
       - Below 60%: fill `var(--sds-status-error-strong)`, badge `.sds-tag--error .sds-tag--sm` "Low"
       - 60-89%: fill `var(--sds-status-warning-strong)`, no badge
       - 90%+: fill `var(--sds-status-success-strong)`, badge `.sds-tag--success .sds-tag--sm` "High"
       - Percentage text: 12px, weight 500 next to bar
     - **Sample**: 13px, `var(--sds-text-tertiary)`, masked (e.g., "4***-****-****-1234"), monospace
     - **Actions**: flex row, gap 4px
       - [Accept] (`.btn .btn-sm`, custom success variant: bg `var(--sds-status-success-bg)`, text `var(--sds-status-success-text)`)
       - [Override] (`.btn-tertiary .btn-sm`)
       - [Reject] (`.btn-tertiary .btn-sm`, text `var(--sds-status-error-text)`)

   - Row border: 1px solid `var(--sds-border-subtle)`
   - Row hover: `var(--sds-color-warm-gray-050)`
   - Sorted by confidence ascending (lowest first) by default

   d. **Expandable Row: Classification Reasoning**
   - Toggle: Chevron icon on column name row, or click "Why?" link
   - Expanded section: padding 16px 20px 16px 48px (indented past checkbox)
   - Background: `var(--sds-bg-surface)` (`--sds-color-warm-gray-025`)
   - Border-top/bottom: 1px solid `var(--sds-border-subtle)`
   - Content:
     - **Pattern match type**: "Matched by: column name pattern" -- 13px, weight 500
     - **Confidence breakdown**: Signal weights shown as labeled bars
       - "Column name match: 35%" -- small horizontal bar
       - "Data pattern match: 45%" -- small horizontal bar
       - "Sample value match: 20%" -- small horizontal bar
       - Bar height: 4px, fill `var(--sds-interactive-primary)`
     - **Similar classifications**: "3 other tables have a column named 'ssn' classified as PII"
       - Text: 13px, `var(--sds-text-secondary)`
       - Links to related items: `var(--sds-text-link)`
     - **Rule suggested** (if applicable): "Suggested by rule: SSN Pattern Match" with `.sds-tag .sds-tag--info` showing rule name

   e. **Bulk Action Toolbar** (appears when rows selected)
   - Position: Sticky at bottom of content area
   - Background: `var(--sds-interactive-primary-subtle)` (`--sds-color-blue-100`)
   - Border: 1px solid `var(--sds-interactive-primary)`
   - Border-radius: 8px
   - Padding: 12px 20px
   - Content: "[checkbox] 12 selected" + [Accept Selected] (primary) + [Reject Selected] (danger-outline)
   - Text: 13px weight 500, `var(--sds-text-primary)`

   f. **Pagination**
   - Below table, right-aligned
   - Style: page numbers as small buttons
   - Active page: `var(--sds-interactive-primary)` bg, `var(--sds-text-on-primary)` text
   - Inactive: `var(--sds-bg-card)` bg, `var(--sds-text-secondary)` text
   - 50 items per page

4. **Bulk Accept Modal** (triggered by [Bulk Accept] button)
   - Modal overlay: `rgba(0,0,0,0.4)` backdrop
   - Modal card: `var(--sds-bg-elevated)`, border-radius 12px, max-width 480px, centered
   - Title: "Bulk Accept Classifications" (18px, weight 600)
   - Threshold slider: "Accept all above [__]% confidence"
     - Slider track: `var(--sds-bg-subtle)`, thumb: `var(--sds-interactive-primary)`
     - Default value: 90%
   - Preview: "42 columns will be accepted as suggested. 3 below threshold excluded."
     - Preview text: 14px, `var(--sds-text-primary)`
     - Excluded count: `var(--sds-status-warning-text)`
   - Actions: [Confirm] (primary), [Cancel] (secondary)

#### Component Inventory

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| Header | `/components/header.html` | Global header |
| Side Navigation | `/components/side-navigation.html` | Sidebar |
| Tabs | `/components/tabs.html` | Queue / Rules / Consistency tabs |
| Tags | `/components/tags.html` | Classification type, confidence level, rule badge |
| Badges | `/components/tags.html` | Tab counts |
| Button (primary) | `/components/buttons.html` | Bulk Accept |
| Button (tertiary) | `/components/buttons.html` | Override, Reject, row actions |
| Card | `/components/cards.html` | Modal card |
| **New: Confidence Bar** | Needs component | Horizontal confidence indicator |
| **New: Threshold Slider** | Needs component | Bulk accept threshold control |
| **New: Expandable Table Row** | Needs component | Classification reasoning |
| **New: Bulk Action Toolbar** | Needs component | Sticky selection toolbar |
| **New: Data Table** | Needs component | Sortable, filterable table with checkbox selection |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Tab border | border-bottom | `var(--sds-border-default)` |
| Active tab indicator | border-bottom | `var(--sds-interactive-primary)` |
| Active tab badge bg | background | `var(--sds-interactive-primary-subtle)` |
| Active tab badge text | color | `var(--sds-interactive-primary)` |
| Filter input border | border | `var(--sds-border-default)` |
| Filter input focus | border | `var(--sds-border-focus)` |
| Active filter chip bg | background | `var(--sds-interactive-primary-subtle)` |
| Table header bg | background | `var(--sds-bg-subtle)` |
| Table header text | color | `var(--sds-text-secondary)` |
| Table row hover | background | `var(--sds-color-warm-gray-050)` |
| Low confidence | fill/tag | `var(--sds-status-error-strong)` / `.sds-tag--error` |
| High confidence | fill/tag | `var(--sds-status-success-strong)` / `.sds-tag--success` |
| Expanded reasoning bg | background | `var(--sds-bg-surface)` |
| Bulk toolbar bg | background | `var(--sds-interactive-primary-subtle)` |
| Bulk toolbar border | border | `var(--sds-interactive-primary)` |
| Accept button (custom) | background | `var(--sds-status-success-bg)` |
| Accept button text | color | `var(--sds-status-success-text)` |
| Reject text | color | `var(--sds-status-error-text)` |
| Modal backdrop | background | `rgba(0,0,0,0.4)` |
| Modal card | background | `var(--sds-bg-elevated)` |

#### Interaction Details

- **Sort**: Click column headers to sort. Default: confidence ascending. Arrow indicator shows sort direction.
- **Expand reasoning**: Click chevron or "Why?" link. Row expands with 0.2s slide-down animation. Chevron rotates 90 degrees.
- **Accept**: Click triggers brief green checkmark animation on the row. Row fades out over 0.3s and removes from list. Toast: "Classification confirmed."
- **Override**: Opens inline dropdown below the row. Dropdown shows classification options. Selecting one shows justification text input. Save button confirms.
- **Reject**: If confidence > 70%, confirmation dialog: "This column was flagged with [X]% confidence. Are you sure it's not sensitive?" [Confirm Reject] (danger), [Cancel] (secondary).
- **Bulk accept**: Modal shows live preview as threshold slider changes. Count updates in real-time.
- **Risk score delta**: After any classification action, a small inline indicator appears: "+2 risk points" or "-5 risk points" in `var(--sds-status-warning-text)` or `var(--sds-status-success-text)` respectively. Fades after 3 seconds.

#### State Variations

| State | Display |
|-------|---------|
| **Empty (no items)** | Centered empty state. Illustration (48px, muted). Title: "All caught up!" (18px, weight 600). Description: "No classifications to review. Run a scan or create rules for future automation." CTAs: [Run Scan] (primary), [Create Rule] (secondary). |
| **Loading** | Skeleton shimmer on table rows. 5 placeholder rows with pulsing blocks. |
| **All reviewed** | Progress bar at 100% in `var(--sds-status-success-strong)`. Success banner: "All classifications reviewed! Risk scores updated." |
| **Error saving** | Inline error on the specific row. Red border-left on the row. Retry button appears. |
| **Conflict on override** | Warning banner appears inline below the override dropdown: "This conflicts with your PCI Compliance Policy." Background: `var(--sds-status-warning-bg)`, text: `var(--sds-status-warning-text)`. Requires acknowledgment checkbox before save. |

#### Responsive Behavior

- Below 1280px: Sample column hidden. Connection column truncated shorter.
- Below 1024px: Table scrolls horizontally. Filter bar wraps to two rows.
- Below 768px: Sidebar collapses. Confidence bar hidden, percentage only. Actions column becomes overflow menu (three-dot icon).

---

### 5.5 Table Review

**Purpose**: Review all columns for a single table at once, enabling efficient batch classification of related columns.

**Page type**: Classification review table
**Primary persona**: Priya
**Entry from**: Review Queue (group by table click, or table link)
**Exits to**: Review Queue

#### Shell & Layout

- **Shell**: Full App Shell
- **Grid**: Single-column content area, full width
- **Sidebar active item**: "Review Queue"

```
+------------------------------------------------------------------+
| Header (56px)                                                     |
+----------+-------------------------------------------------------+
| Sidebar  | Content Area (padding: 24px)                          |
| 220px    |                                                       |
|          |  Breadcrumb: Review Queue > Table Review               |
|          |  Title: "[schema].[table_name]"                        |
|          |  Subtitle: "42 columns -- 28 pending review"           |
|          |  Actions: [Accept All Above 90%] (primary)             |
|          |           [Back to Queue] (secondary)                  |
|          |                                                       |
|          |  +------------------------------------------------+   |
|          |  | [] | Column    | Type    | Classif. | Confid.  |   |
|          |  |    |           |         |          | Sample   |   |
|          |  |----|-----------|---------|----------|----------|   |
|          |  | [] | id        | INT     | --       | --  n/a  |   |
|          |  | [] | ssn       | VARCHAR | PII 45%  | 5**-**.. |   |
|          |  |    |  [Accept] [Override] [Reject]              |   |
|          |  | [check] | email | VARCHAR | PII 92%  | j***@... |   |
|          |  |    |  [Accept] [Override] [Reject]              |   |
|          |  | [] | amount    | DECIMAL | --       | --  n/a  |   |
|          |  | [] | card_num  | VARCHAR | PCI 88%  | 4***-... |   |
|          |  |    |  [Accept] [Override] [Reject]              |   |
|          |  +------------------------------------------------+   |
|          |                                                       |
|          |  Bulk Toolbar (when rows selected):                   |
|          |  [12 selected] [Accept] [Reject]                      |
|          |                                                       |
+----------+-------------------------------------------------------+
```

#### Content Hierarchy

1. **Page Header**
   - Breadcrumb: Review Queue > Table Review (13px, `var(--sds-text-link)`)
   - Title: "[schema].[table_name]" in monospace (24px, weight 600, `var(--sds-text-primary)`)
   - Subtitle: "[N] columns -- [M] pending review" (14px, `var(--sds-text-secondary)`)
   - Right-aligned: [Accept All Above 90%] (`.btn-primary .btn-md`), [Back to Queue] (`.btn-secondary .btn-md`)

2. **Column Table**
   - Same table styling as Review Queue table
   - Additional columns:
     - **Data Type**: 13px, monospace, `var(--sds-text-tertiary)` (VARCHAR, INT, DECIMAL, etc.)
     - **Status Badge**: Shows review status
       - Pending: `.sds-tag .sds-tag--warning` "Pending"
       - Accepted: `.sds-tag .sds-tag--success` "Classified"
       - Not sensitive: `.sds-tag .sds-tag--neutral` "Not Sensitive"
   - Non-sensitive columns (no classification suggestion): Actions column shows only [Mark as Sensitive] (tertiary)
   - Row grouping: Optional visual separator between classified and unclassified sections
   - Confidence bar and actions identical to Review Queue table

3. **Bulk Action Toolbar**
   - Same as Review Queue bulk toolbar
   - Additional action: [Accept All Selected] which accepts the suggested classification for all checked rows

#### Component Inventory

Same as Review Queue, minus tabs. Plus:

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| Tags | `/components/tags.html` | Status badges (Pending, Classified, Not Sensitive) |

#### Token References

Same as Review Queue table tokens. Additional:

| Element | Property | Token |
|---------|----------|-------|
| Monospace column names | font-family | `'SF Mono', Menlo, monospace` |
| Data type text | color | `var(--sds-text-tertiary)` |
| Pending status tag | class | `.sds-tag--warning` |
| Classified status tag | class | `.sds-tag--success` |
| Not Sensitive status tag | class | `.sds-tag--neutral` |

#### Interaction Details

- **Accept All Above 90%**: Shows preview count, same as Bulk Accept modal but pre-set to 90% and scoped to this table only.
- **Inline actions**: Same behavior as Review Queue -- accept animates green checkmark, override opens inline dropdown, reject shows confirmation for high-confidence items.
- **Sample value reveal**: Click masked sample to reveal full value for 5 seconds. Tooltip: "Revealing sample values is logged for audit." Value reverts to masked after timeout.
- **Row keyboard navigation**: Tab moves between rows. Enter on a row opens inline actions. Arrow keys navigate between Accept/Override/Reject.
- **Classification reasoning tooltip**: Hover over confidence bar shows tooltip with abbreviated reasoning (pattern match type + top signal). Click opens full expandable reasoning.

#### State Variations

| State | Display |
|-------|---------|
| **All columns reviewed** | Success banner: "All columns for [table] reviewed." [Back to Queue] button becomes primary. |
| **No sensitive columns detected** | All rows show no classification. Message above table: "No sensitive data detected in this table. You can manually mark columns as sensitive." |
| **Loading** | Skeleton table with 8 shimmer rows. |

#### Responsive Behavior

- Below 1024px: Sample column hidden. Table scrolls horizontally.
- Below 768px: Sidebar collapses. Data Type column hidden.

---

### 5.6 Data Catalog

**Purpose**: Browse all scanned data assets as a reference view. Shows confirmed classifications. Unreviewed items link to the Review Queue.

**Page type**: List view
**Primary persona**: Priya / Jordan
**Entry from**: Sidebar navigation, Scan Summary
**Exits to**: Table Detail, Review Queue (filtered)

#### Shell & Layout

- **Shell**: Full App Shell
- **Grid**: Single-column content area, full width
- **Sidebar active item**: "Data Catalog" under the Discover group

```
+------------------------------------------------------------------+
| Header (56px)                                                     |
+----------+-------------------------------------------------------+
| Sidebar  | Content Area (padding: 24px)                          |
| 220px    |                                                       |
|          |  Title: "Data Catalog"                                 |
|          |  Subtitle: "1,247 tables across 4 connections"         |
|          |  Actions: [Export] (secondary)                         |
|          |                                                       |
|          |  [Search tables...    ] [Connection v] [Sensitivity v] |
|          |  [Review Status v]                                     |
|          |                                                       |
|          |  +------------------------------------------------+   |
|          |  | Schema     | Table     | Cols | Class% | Sens.  |   |
|          |  |            |           |      |        | Level  |   |
|          |  |------------|-----------|------|--------|--------|   |
|          |  | analytics  | events    | 42   | 100%   | High   |   |
|          |  | analytics  | users     | 18   | 89%    | High   |   |
|          |  | finance    | invoices  | 31   |  0%    | --     |   |
|          |  |            |           |      |        |[Review]|   |
|          |  | marketing  | campaigns | 12   | 100%   | Low    |   |
|          |  +------------------------------------------------+   |
|          |                                                       |
|          |  Pagination: Showing 1-50 of 1,247  < 1 2 3 ... >     |
|          |                                                       |
+----------+-------------------------------------------------------+
```

#### Content Hierarchy

1. **Page Header**
   - Title: "Data Catalog" (24px, weight 600, `var(--sds-text-primary)`)
   - Subtitle: "[N] tables across [M] connections" (14px, `var(--sds-text-secondary)`)
   - Right-aligned: [Export] (`.btn-secondary .btn-md`) with download icon

2. **Filter Bar** (inline, gap 8px)
   - Search input: 260px, placeholder "Search tables...", icon search
   - Dropdown filters: Connection, Sensitivity Level (High/Medium/Low/None), Review Status (All/Fully Classified/Partially Classified/Unreviewed)
   - Same styling as Review Queue filters

3. **Catalog Table**
   - Header: `var(--sds-bg-subtle)` bg, 12px weight 600 uppercase
   - Columns:
     - **Schema**: 13px, `var(--sds-text-secondary)`
     - **Table Name**: 13px, weight 500, `var(--sds-text-primary)`. Clickable -- navigates to Table Detail. Hover: underline.
     - **Columns**: 13px, `var(--sds-text-secondary)`, right-aligned
     - **Classified %**: Horizontal micro-bar (40px wide, 4px height)
       - 100%: full green (`var(--sds-status-success-strong)`)
       - 1-99%: partial yellow (`var(--sds-status-warning-strong)`)
       - 0%: empty gray (`var(--sds-bg-subtle)`)
       - Percentage text next to bar: 12px, `var(--sds-text-secondary)`
     - **Sensitivity Level**: Tag
       - High: `.sds-tag .sds-tag--error` "High"
       - Medium: `.sds-tag .sds-tag--warning` "Medium"
       - Low: `.sds-tag .sds-tag--success` "Low"
       - None: `.sds-tag .sds-tag--neutral` "None"
     - **Last Scanned**: 13px, `var(--sds-text-tertiary)`, relative time ("2 hours ago"). If > 30 days: `var(--sds-status-warning-text)`.
     - **Actions**: [Review in Queue] (`.btn-tertiary .btn-sm`) -- only shown for unreviewed/partially classified tables
   - Row click: Navigates to Table Detail
   - Row hover: `var(--sds-color-warm-gray-050)`, cursor pointer
   - Row border: 1px solid `var(--sds-border-subtle)`

4. **Pagination**
   - Below table, space-between layout
   - Left: "Showing 1-50 of 1,247" (13px, `var(--sds-text-secondary)`)
   - Right: Page number buttons (same styling as Review Queue pagination)

#### Component Inventory

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| Header | `/components/header.html` | Global header |
| Side Navigation | `/components/side-navigation.html` | Sidebar |
| Tags | `/components/tags.html` | Sensitivity level tags |
| Button (secondary) | `/components/buttons.html` | Export |
| Button (tertiary) | `/components/buttons.html` | Review in Queue |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Table header bg | background | `var(--sds-bg-subtle)` |
| Table name (clickable) | color | `var(--sds-text-primary)` |
| Table name hover | text-decoration | underline |
| Stale scan date | color | `var(--sds-status-warning-text)` |
| High sensitivity tag | class | `.sds-tag--error` |
| Medium sensitivity tag | class | `.sds-tag--warning` |
| Low sensitivity tag | class | `.sds-tag--success` |
| None sensitivity tag | class | `.sds-tag--neutral` |
| Classification bar (full) | background | `var(--sds-status-success-strong)` |
| Classification bar (partial) | background | `var(--sds-status-warning-strong)` |
| Classification bar (empty) | background | `var(--sds-bg-subtle)` |

#### Interaction Details

- **Search**: Debounced (300ms). Filters table client-side for <500 rows, server-side for larger sets. Highlights matching text in results.
- **Table name click**: Navigates to Table Detail. Preserves filter state via URL query params so breadcrumb back returns to filtered view.
- **Review in Queue**: Navigates to Review Queue filtered to that specific table's pending items.
- **Export**: Dropdown with format options (CSV, JSON). Exports current filtered view.
- **Sort**: Click column headers. Default: Schema ASC, then Table Name ASC.

#### State Variations

| State | Display |
|-------|---------|
| **Empty (no scans)** | Centered empty state. Title: "No data discovered yet." Description: "Connect a data source and run your first scan to populate the catalog." CTA: [Add Connection] (primary). |
| **No search results** | Table replaced with: "No tables match your search." [Clear Filters] (tertiary). |
| **Loading** | Skeleton table, 10 rows with shimmer blocks. |

#### Responsive Behavior

- Below 1280px: Last Scanned column hidden. Classified % shows text only (no bar).
- Below 1024px: Table scrolls horizontally. Schema and Table columns merge into "Schema.Table" format.
- Below 768px: Sidebar collapses. Search input goes full width above filters.

---

### 5.7 Table Detail

**Purpose**: Column-level view of a single table showing all classifications, access information, lineage, and history.

**Page type**: Detail view with tabs
**Primary persona**: Priya
**Entry from**: Data Catalog (row click), Review Queue (table link)
**Exits to**: Data Catalog, Review Queue, Remediation (Flow 4)

#### Shell & Layout

- **Shell**: Full App Shell
- **Grid**: Single-column content area, full width
- **Sidebar active item**: "Data Catalog"

```
+------------------------------------------------------------------+
| Header (56px)                                                     |
+----------+-------------------------------------------------------+
| Sidebar  | Content Area (padding: 24px)                          |
| 220px    |                                                       |
|          |  Breadcrumb: Data Catalog > analytics.users            |
|          |  Title: "analytics.users"                              |
|          |  Subtitle: "Snowflake Production -- 18 columns"        |
|          |  Tags: [PII] [High Sensitivity]                        |
|          |  Actions: [Remediate] (primary) [Re-scan] (secondary)  |
|          |                                                       |
|          |  [Classifications] [Access] [Lineage] [History]        |
|          |  ----tab bar border------------------------------      |
|          |                                                       |
|          |  === CLASSIFICATIONS TAB (active) ===                  |
|          |                                                       |
|          |  +------------------------------------------------+   |
|          |  | Column    | Type    | Classification | Confid.  |   |
|          |  |           |         |                | Status   |   |
|          |  |-----------|---------|----------------|----------|   |
|          |  | id        | INT     | --             | --       |   |
|          |  | email     | VARCHAR | PII            | 92% OK   |   |
|          |  | ssn       | VARCHAR | PII            | 45% Pend |   |
|          |  |           |         | [Review in Queue]         |   |
|          |  | full_name | VARCHAR | PII            | 88% OK   |   |
|          |  | phone     | VARCHAR | PII            | 76% OK   |   |
|          |  +------------------------------------------------+   |
|          |                                                       |
+----------+-------------------------------------------------------+
```

#### Content Hierarchy

1. **Page Header**
   - Breadcrumb: Data Catalog > [schema.table] (13px, `var(--sds-text-link)`)
   - Title: "[schema].[table_name]" in monospace (24px, weight 600, `var(--sds-text-primary)`)
   - Subtitle: "[Connection Name] -- [N] columns" (14px, `var(--sds-text-secondary)`)
   - Tags row (gap 8px): Classification type tags (`.sds-tag--error` PII, etc.) + Sensitivity level tag
   - Right-aligned actions:
     - [Remediate] (`.btn-primary .btn-md`) -- only shown if high-sensitivity columns present
     - [Re-scan Table] (`.btn-secondary .btn-md`)

2. **Page Tabs** (`.sds-tabs`)
   - Classifications (default active), Access, Lineage, History
   - Badge counts on each tab

3. **Classifications Tab Content**
   - Full-width data table
   - Columns:
     - **Column Name**: 13px, weight 500, `var(--sds-text-primary)`, monospace
     - **Data Type**: 13px, monospace, `var(--sds-text-tertiary)`
     - **Classification**: Tag using semantic variant, or "--" if unclassified
     - **Confidence**: Percentage with micro-bar (same as Review Queue)
     - **Status**:
       - Confirmed: `.sds-tag .sds-tag--success` "Confirmed"
       - Pending: `.sds-tag .sds-tag--warning` "Pending" + [Review in Queue] link
       - Overridden: `.sds-tag .sds-tag--info` "Overridden" with tooltip showing original suggestion
       - Not Sensitive: `.sds-tag .sds-tag--neutral` "Not Sensitive"
     - **Classified By**: 13px, `var(--sds-text-secondary)` -- user name or "Auto" for rule-based
     - **Actions**: Only for confirmed items: overflow menu (three-dot) with [Re-classify], [View History]

4. **Access Tab** (secondary, placeholder for this spec)
   - Lists users and roles with access to this table
   - Standard data table pattern

5. **Lineage Tab** (secondary, placeholder for this spec)
   - Shows upstream/downstream dependencies
   - Visual node-edge diagram (future component)

6. **History Tab** (secondary, placeholder for this spec)
   - Audit log of all classification changes
   - Columns: Date, User, Action, Column, Previous Value, New Value

#### Component Inventory

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| Tabs | `/components/tabs.html` | Classifications / Access / Lineage / History |
| Tags | `/components/tags.html` | Classification type, status, sensitivity |
| Button (primary) | `/components/buttons.html` | Remediate |
| Button (secondary) | `/components/buttons.html` | Re-scan Table |

#### Token References

Same table tokens as previous screens. Additional:

| Element | Property | Token |
|---------|----------|-------|
| Confirmed status | class | `.sds-tag--success` |
| Pending status | class | `.sds-tag--warning` |
| Overridden status | class | `.sds-tag--info` |
| Not Sensitive status | class | `.sds-tag--neutral` |
| "Review in Queue" link | color | `var(--sds-text-link)` |

#### Interaction Details

- **Row click**: No action on Classifications tab (data is inline). On Access/History tabs, row click may expand details.
- **Review in Queue link**: Navigates to Review Queue filtered to this specific column.
- **Remediate button**: Navigates to Flow 4 (Remediation) scoped to this table's high-sensitivity columns.
- **Re-scan Table**: Triggers a targeted scan of just this table. Shows progress inline (small progress bar replaces the subtitle temporarily).
- **Overridden tooltip**: Hover shows: "Originally suggested: [type] at [X]%. Overridden by [user] on [date]. Justification: [note]."

#### State Variations

| State | Display |
|-------|---------|
| **All classified** | All rows show Confirmed or Not Sensitive status. No "Review in Queue" links. |
| **Partially classified** | Mix of Confirmed and Pending statuses. Pending rows have subtle left border accent in `var(--sds-status-warning-strong)`. |
| **Never scanned** | Empty table: "This table hasn't been scanned yet." CTA: [Scan Now] (primary). |
| **Loading** | Skeleton table. |

#### Responsive Behavior

- Below 1280px: Classified By column hidden.
- Below 1024px: Table scrolls horizontally.
- Below 768px: Sidebar collapses. Tabs become scrollable horizontal.

---

### 5.8 Classification Rules List

**Purpose**: Manage reusable classification rules that auto-suggest classifications for future scan results.

**Page type**: List view (CRUD pattern)
**Primary persona**: Priya
**Entry from**: Review Queue "Rules" tab
**Exits to**: Create Rule, Rule Detail

#### Shell & Layout

- **Shell**: Full App Shell
- **Grid**: Single-column, full width
- **Sidebar active item**: "Review Queue" (this is a tab within Review Queue)
- **Context**: This screen is the content of the "Rules" tab within the Classification Review Queue page

```
+------------------------------------------------------------------+
| (within Review Queue page, Rules tab active)                      |
|                                                                   |
|  [Queue (1,276)] [Rules (8)] [Consistency (3)]                    |
|  ----tab bar border (Rules tab active)------------------          |
|                                                                   |
|  Actions: [+ Create Rule] (primary)                               |
|                                                                   |
|  +------------------------------------------------------------+  |
|  | Name          | Pattern Type  | Classification | Matches    |  |
|  |               |               |                | Status     |  |
|  |---------------|---------------|----------------|------------|  |
|  | SSN Pattern   | Column name   | PII            | 142  Active|  |
|  | CC Number     | Regex         | PCI            | 89   Active|  |
|  | Email Fields  | Column name   | PII            | 234  Active|  |
|  | DOB Pattern   | Sample match  | PII            | 56   Paused|  |
|  +------------------------------------------------------------+  |
|                                                                   |
+------------------------------------------------------------------+
```

#### Content Hierarchy

1. **Tab Context**
   - This content lives inside the Classification Review Queue page, under the "Rules" tab
   - When Rules tab is active, the page subtitle updates to "[N] classification rules"

2. **Actions Row**
   - Right-aligned: [+ Create Rule] (`.btn-primary .btn-md`) with plus icon
   - Gap below tab bar: 24px

3. **Rules Table**
   - Header: `var(--sds-bg-subtle)` bg
   - Columns:
     - **Rule Name**: 13px, weight 500, `var(--sds-text-primary)`. Clickable -- navigates to Rule Detail.
     - **Pattern Type**: `.sds-tag .sds-tag--neutral`
       - "Column name" / "Regex" / "Sample match"
     - **Classification Applied**: `.sds-tag` with semantic variant (PII: `--error`, PCI: `--warning`, PHI: `--purple`)
     - **Match Count**: 13px, weight 500, `var(--sds-text-primary)` -- number of columns currently matching
     - **Auto-applied**: 13px, `var(--sds-text-secondary)` -- number of suggestions generated
     - **Status**:
       - Active: `.sds-dot .sds-dot--success` + "Active" text
       - Paused: `.sds-dot .sds-dot--neutral` + "Paused" text
     - **Actions**: overflow menu (three-dot icon)
       - [Edit] -- navigates to Rule Detail in edit mode
       - [Pause] / [Resume]
       - [Delete] -- confirmation dialog

   - Row hover: `var(--sds-color-warm-gray-050)`
   - Row border: 1px solid `var(--sds-border-subtle)`
   - Row click: Navigates to Rule Detail

4. **Empty State**
   - Centered in tab content area
   - Title: "No classification rules yet" (18px, weight 600, `var(--sds-text-primary)`)
   - Description: "Create rules to automatically suggest classifications for future scan results. Rules match column names, regex patterns, or sample values." (14px, `var(--sds-text-secondary)`, max-width 420px)
   - CTA: [Create Your First Rule] (`.btn-primary .btn-md`)

#### Component Inventory

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| Tags | `/components/tags.html` | Pattern type, classification type |
| Dots | `/components/tags.html` | Status dots |
| Button (primary) | `/components/buttons.html` | Create Rule |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Rule name (link) | color | `var(--sds-text-primary)` |
| Rule name hover | text-decoration | underline |
| Pattern type tag | class | `.sds-tag--neutral` |
| Active status dot | class | `.sds-dot--success` |
| Paused status dot | class | `.sds-dot--neutral` |
| Match count | color | `var(--sds-text-primary)` |
| Auto-applied count | color | `var(--sds-text-secondary)` |

#### Interaction Details

- **Create Rule**: Navigates to Create Rule screen.
- **Row click**: Navigates to Rule Detail for that rule.
- **Pause/Resume**: Toggles rule status. Toast: "Rule paused" / "Rule resumed." Status dot updates immediately.
- **Delete**: Confirmation dialog: "Delete rule '[name]'? Existing classifications made by this rule will not be affected." [Delete] (danger), [Cancel] (secondary).

#### State Variations

| State | Display |
|-------|---------|
| **Empty** | Empty state as described above. |
| **Loading** | Skeleton table, 4 rows. |
| **Rules with conflicts** | Row shows warning icon next to match count if two rules have overlapping patterns. Tooltip: "Overlaps with [other rule name]." |

#### Responsive Behavior

- Below 1024px: Auto-applied column hidden. Table scrolls horizontally.
- Below 768px: Pattern Type column hidden.

---

### 5.9 Create Rule

**Purpose**: Form to define a new classification rule with pattern matching and live preview.

**Page type**: Form view
**Primary persona**: Priya
**Entry from**: Rules List "+ Create Rule" button
**Exits to**: Rules List (on save or cancel)

#### Shell & Layout

- **Shell**: Full App Shell
- **Grid**: Single-column content, centered, max-width 640px
- **Sidebar active item**: "Review Queue"

```
+------------------------------------------------------------------+
| Header (56px)                                                     |
+----------+-------------------------------------------------------+
| Sidebar  | Content Area (padding: 24px)                          |
| 220px    |                                                       |
|          |  Breadcrumb: Review Queue > Rules > Create Rule        |
|          |  Title: "Create Classification Rule"                   |
|          |                                                       |
|          |  +------------------------------------------------+   |
|          |  | Form Card                                      |   |
|          |  |                                                |   |
|          |  | Rule Name *                                    |   |
|          |  | [_______________________________]              |   |
|          |  |                                                |   |
|          |  | Pattern Type *                                 |   |
|          |  | ( ) Column name pattern                        |   |
|          |  | ( ) Regex pattern                              |   |
|          |  | (o) Sample value match                         |   |
|          |  |                                                |   |
|          |  | Pattern *                                      |   |
|          |  | [_______________________________]              |   |
|          |  | Help: "Enter a regex pattern to match..."      |   |
|          |  |                                                |   |
|          |  | Classification to Apply *                      |   |
|          |  | [PII                          v]               |   |
|          |  |                                                |   |
|          |  | Scope                                          |   |
|          |  | (o) All connections                            |   |
|          |  | ( ) Specific connections                       |   |
|          |  |     [x] Snowflake Prod  [x] PostgreSQL         |   |
|          |  |                                                |   |
|          |  | [ ] Auto-apply to future scan results          |   |
|          |  |                                                |   |
|          |  +------------------------------------------------+   |
|          |                                                       |
|          |  +------------------------------------------------+   |
|          |  | Live Preview Card                              |   |
|          |  | "This rule matches 23 existing columns"        |   |
|          |  |                                                |   |
|          |  | analytics.users.ssn       -- Unreviewed        |   |
|          |  | analytics.users.ssn_hash  -- Unreviewed        |   |
|          |  | finance.employees.ssn     -- Classified (PII)  |   |
|          |  | ...showing 3 of 23                             |   |
|          |  +------------------------------------------------+   |
|          |                                                       |
|          |  [Cancel] (secondary)  [Test Rule] (secondary)        |
|          |  [Save Rule] (primary)                                |
|          |                                                       |
+----------+-------------------------------------------------------+
```

#### Content Hierarchy

1. **Page Header**
   - Breadcrumb: Review Queue > Rules > Create Rule
   - Title: "Create Classification Rule" (24px, weight 600, `var(--sds-text-primary)`)
   - Gap to form: 24px

2. **Form Card** (`.sds-card`)
   - Padding: 24px
   - Field gap: 16px vertical

   a. **Rule Name** (required)
   - Label: 13px, weight 500, `var(--sds-text-primary)`
   - Input: height 40px, border `var(--sds-border-default)`, border-radius 6px, padding 8px 12px
   - Focus: border `var(--sds-border-focus)`
   - Placeholder: "e.g., SSN Column Pattern"

   b. **Pattern Type** (required, radio group)
   - Label: 13px, weight 500, `var(--sds-text-primary)`
   - Options:
     - "Column name pattern" -- help: "Match columns by name (supports wildcards)"
     - "Regex pattern" -- help: "Match using regular expressions"
     - "Sample value match" -- help: "Match based on data patterns in sample values"
   - Radio: 16px circle, selected fill `var(--sds-interactive-primary)`, unselected border `var(--sds-border-default)`
   - Help text: 12px, `var(--sds-text-tertiary)`

   c. **Pattern** (required)
   - Label: 13px, weight 500
   - Input: monospace font, same sizing as Rule Name
   - Help text changes based on Pattern Type selection
   - Validation: red border `var(--sds-status-error-strong)` + error message below in 12px `var(--sds-status-error-text)` on invalid regex

   d. **Classification to Apply** (required)
   - Label: 13px, weight 500
   - Dropdown select: height 40px, same border styling
   - Options: PII, PCI, PHI, Custom (with text input for custom name)
   - Selected option shows as tag inside the dropdown

   e. **Scope** (optional, defaults to All)
   - Radio group: "All connections" (default) vs "Specific connections"
   - When "Specific" selected: checkbox list of connections appears, indented 20px
   - Checkbox: 16px square, checked fill `var(--sds-interactive-primary)`, checkmark `var(--sds-text-on-primary)`

   f. **Auto-apply toggle**
   - Checkbox: "Auto-apply to future scan results"
   - Help text: "When enabled, this rule will automatically suggest classifications for matching columns in future scans."

3. **Live Preview Card** (`.sds-card`)
   - Header: "Live Preview" with match count (`.sds-card-header .sds-card-header--bordered`)
   - Shows when pattern field has input and is valid
   - Lists first 5 matching columns with their current classification status
   - Footer: "Showing 5 of [N] matches" with [View All Matches] link
   - Loading state: Spinner + "Searching..." while pattern is being evaluated (debounced 500ms)
   - No matches: "No existing columns match this pattern." in `var(--sds-text-tertiary)`

4. **Action Buttons**
   - Layout: flex row, justify-content space-between
   - Left: [Cancel] (`.btn-secondary .btn-md`)
   - Right: [Test Rule] (`.btn-secondary .btn-md`), [Save Rule] (`.btn-primary .btn-md`)
   - Gap between right buttons: 12px

#### Component Inventory

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| Card | `/components/cards.html` | Form card, Preview card |
| Button (primary) | `/components/buttons.html` | Save Rule |
| Button (secondary) | `/components/buttons.html` | Cancel, Test Rule |
| Tags | `/components/tags.html` | Classification type in dropdown |
| **New: Radio Group** | Needs component | Pattern type selector |
| **New: Checkbox** | Needs component | Scope connections, Auto-apply |
| **New: Select Dropdown** | Needs component | Classification dropdown |
| **New: Form Input** | Needs component | Text inputs with validation |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Form card bg | background | `var(--sds-bg-card)` |
| Form card border | border | `var(--sds-border-default)` |
| Field label | color | `var(--sds-text-primary)` |
| Field label weight | font-weight | 500 |
| Input border | border | `var(--sds-border-default)` |
| Input focus border | border | `var(--sds-border-focus)` |
| Input error border | border-color | `var(--sds-status-error-strong)` |
| Error text | color | `var(--sds-status-error-text)` |
| Help text | color | `var(--sds-text-tertiary)` |
| Radio selected fill | background | `var(--sds-interactive-primary)` |
| Checkbox fill | background | `var(--sds-interactive-primary)` |
| Checkbox checkmark | color | `var(--sds-text-on-primary)` |

#### Interaction Details

- **Live preview**: Debounced 500ms after pattern input changes. Shows loading spinner during evaluation. Updates match count and preview list.
- **Test Rule**: Runs the pattern against all existing columns and shows full results in a modal or expanded preview. Shows: total matches, matches already classified, matches unreviewed.
- **Save Rule**: Validates all required fields. Shows saving state (button shows spinner). On success: navigates to Rules List with toast "Rule created. [N] matching columns will receive suggestions." On error: inline error at top of form.
- **Cancel**: If form has unsaved changes, shows confirmation: "Discard unsaved changes?" [Discard] (danger), [Keep Editing] (secondary).
- **Pattern validation**: Regex patterns are validated on blur. Invalid patterns show inline error immediately.

#### State Variations

| State | Display |
|-------|---------|
| **Empty form** | All fields empty. Save Rule button disabled (`var(--sds-text-disabled)` text, cursor not-allowed). |
| **Partially filled** | Save Rule stays disabled until all required fields have values. |
| **Valid form** | Save Rule becomes active. Live preview shows matches. |
| **Validation errors** | Red borders on invalid fields. Error messages below each. Form does not submit. |
| **Saving** | Save Rule button shows spinner, text changes to "Saving...", button disabled. |
| **Edit mode** | Same form but pre-filled. Title changes to "Edit Rule: [name]". Save button says "Update Rule". |

#### Responsive Behavior

- Below 768px: Content max-width becomes 100%. Preview card goes below form. Sidebar collapses.

---

### 5.10 Rule Detail

**Purpose**: View and manage a single classification rule, its match history, and effectiveness.

**Page type**: Detail view
**Primary persona**: Priya
**Entry from**: Rules List (row click)
**Exits to**: Rules List, Review Queue (filtered by rule)

#### Shell & Layout

- **Shell**: Full App Shell
- **Grid**: Single-column content area, full width
- **Sidebar active item**: "Review Queue"

```
+------------------------------------------------------------------+
| Header (56px)                                                     |
+----------+-------------------------------------------------------+
| Sidebar  | Content Area (padding: 24px)                          |
| 220px    |                                                       |
|          |  Breadcrumb: Review Queue > Rules > SSN Pattern        |
|          |  Title: "SSN Pattern"                                  |
|          |  Status: [Active dot] Active                           |
|          |  Actions: [Edit Rule] (secondary)                      |
|          |           [Pause] (secondary) [Delete] (danger-outline)|
|          |                                                       |
|          |  +--------+ +--------+ +--------+ +--------+          |
|          |  | Total  | | Suggest| | Confirm| | Reject |          |
|          |  | Matches| | -ions  | | -ed    | | -ed    |          |
|          |  | 142    | | 89     | | 78     | | 11     |          |
|          |  +--------+ +--------+ +--------+ +--------+          |
|          |                                                       |
|          |  +------------------------------------------------+   |
|          |  | Rule Definition (card)                         |   |
|          |  | Pattern Type: Column name pattern              |   |
|          |  | Pattern: *ssn*                                 |   |
|          |  | Classification: PII                            |   |
|          |  | Scope: All connections                         |   |
|          |  | Auto-apply: Yes                                |   |
|          |  | Created: Mar 1, 2026 by Priya                  |   |
|          |  +------------------------------------------------+   |
|          |                                                       |
|          |  +------------------------------------------------+   |
|          |  | Matched Columns (card with table)              |   |
|          |  | Column       | Table    | Status    | Confid.  |   |
|          |  |--------------|----------|-----------|----------|   |
|          |  | ssn          | users    | Confirmed | 95%      |   |
|          |  | ssn_hash     | users    | Pending   | 78%      |   |
|          |  | employee_ssn | hr.staff | Rejected  | 82%      |   |
|          |  | [View in Queue] (footer link)                  |   |
|          |  +------------------------------------------------+   |
|          |                                                       |
+----------+-------------------------------------------------------+
```

#### Content Hierarchy

1. **Page Header**
   - Breadcrumb: Review Queue > Rules > [Rule Name]
   - Title: Rule name (24px, weight 600, `var(--sds-text-primary)`)
   - Status: `.sds-dot .sds-dot--success` + "Active" or `.sds-dot .sds-dot--neutral` + "Paused" (14px, `var(--sds-text-secondary)`)
   - Right-aligned actions:
     - [Edit Rule] (`.btn-secondary .btn-md`)
     - [Pause] / [Resume] (`.btn-secondary .btn-md`)
     - [Delete] (`.btn-danger-outline .btn-md`)

2. **Effectiveness Metric Cards** (4-column grid, 16px gap)
   - Each card (`.sds-card`, body only):
     - "Total Matches" / count / `var(--sds-text-primary)`
     - "Suggestions Generated" / count / `var(--sds-status-info-text)`
     - "Confirmed" / count / `var(--sds-status-success-text)`
     - "Rejected" / count / `var(--sds-status-error-text)`

3. **Rule Definition Card** (`.sds-card`)
   - Header: "Rule Definition" (`.sds-card-header .sds-card-header--bordered`)
   - Body: Definition list layout (2-column grid)
     - Left: label (13px, weight 500, `var(--sds-text-secondary)`)
     - Right: value (13px, `var(--sds-text-primary)`)
   - Fields: Pattern Type, Pattern (monospace), Classification (as tag), Scope, Auto-apply (Yes/No), Created (date + user), Last modified

4. **Matched Columns Card** (`.sds-card`)
   - Header: "Matched Columns" with count badge (`.sds-card-header .sds-card-header--bordered`)
   - Body: Data table
   - Columns:
     - **Column Name**: 13px, weight 500, monospace, `var(--sds-text-primary)`
     - **Table**: 13px, `var(--sds-text-secondary)` (schema-qualified)
     - **Classification Status**:
       - Confirmed: `.sds-tag .sds-tag--success` "Confirmed"
       - Pending: `.sds-tag .sds-tag--warning` "Pending"
       - Rejected: `.sds-tag .sds-tag--error` "Rejected"
       - Skipped (manual override): `.sds-tag .sds-tag--neutral` "Skipped"
     - **Confidence**: Percentage, 12px, `var(--sds-text-secondary)`
   - Footer: [View All Matches in Queue] (`.sds-link`) -- navigates to Review Queue filtered by this rule
   - Pagination: If >25 matches, paginate within the card

5. **Priority & Conflicts Section** (conditional)
   - Only shown if this rule overlaps with another rule
   - Card with warning accent: left border 3px `var(--sds-status-warning-strong)`
   - Content: "This rule overlaps with [other rule name] on [N] columns. Higher priority rule: [name]."
   - Link: [Adjust Priority] -- navigates to a drag-to-reorder priority list

#### Component Inventory

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| Card | `/components/cards.html` | Definition card, Matches card, Conflict card |
| Tags | `/components/tags.html` | Classification status, classification type |
| Dots | `/components/tags.html` | Rule status indicator |
| Badges | `/components/tags.html` | Match count in card header |
| Button (secondary) | `/components/buttons.html` | Edit, Pause |
| Button (danger-outline) | `/components/buttons.html` | Delete |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Metric "Suggestions" value | color | `var(--sds-status-info-text)` |
| Metric "Confirmed" value | color | `var(--sds-status-success-text)` |
| Metric "Rejected" value | color | `var(--sds-status-error-text)` |
| Definition label | color | `var(--sds-text-secondary)` |
| Definition value | color | `var(--sds-text-primary)` |
| Pattern value | font-family | `'SF Mono', Menlo, monospace` |
| Conflict card accent | border-left | `var(--sds-status-warning-strong)` |
| Confirmed match tag | class | `.sds-tag--success` |
| Pending match tag | class | `.sds-tag--warning` |
| Rejected match tag | class | `.sds-tag--error` |
| Skipped match tag | class | `.sds-tag--neutral` |
| Active rule dot | class | `.sds-dot--success` |
| Paused rule dot | class | `.sds-dot--neutral` |

#### Interaction Details

- **Edit Rule**: Navigates to Create Rule form pre-filled with this rule's data (edit mode).
- **Pause**: Confirmation: "Pause rule '[name]'? It will stop generating suggestions for new scan results." [Pause] (secondary), [Cancel] (secondary). Status dot updates inline on confirm.
- **Delete**: Confirmation: "Delete rule '[name]'? Existing classifications from this rule will not be affected." [Delete] (danger), [Cancel] (secondary).
- **View All Matches in Queue**: Navigates to Review Queue with filter `rule=[rule-id]` applied.
- **Row click in matches table**: Navigates to Table Detail for the column's table, scrolled to that column.

#### State Variations

| State | Display |
|-------|---------|
| **Active rule, no matches** | Metric cards all show "0". Matched Columns card shows: "No matches found yet. This rule will apply to future scan results." |
| **Paused rule** | Status shows paused dot. Metrics remain (historical). Banner: "This rule is paused. It will not generate suggestions for new scan results." Background: `var(--sds-status-neutral-bg)`. |
| **Rule with conflicts** | Conflict card visible at bottom with warning styling. |
| **Loading** | Skeleton on all cards. |

#### Responsive Behavior

- Below 1280px: Metric cards go to 2x2 grid. Definition card stays single column.
- Below 1024px: Matches table scrolls horizontally.
- Below 768px: Sidebar collapses. Metric cards stack to 1 column. Action buttons wrap below title.

---

## Appendix: New Components Needed

The following components are referenced across Flow 2 screens but do not yet exist in the Software DS component library. They should be built using `/component-builder`:

| Component | Used In | Priority |
|-----------|---------|----------|
| Data Table | Review Queue, Table Review, Data Catalog, Table Detail, Rules List, Schema Drift, Matched Columns | Critical |
| Progress Bar | Scan Progress, Review Progress | High |
| Confidence Bar | Review Queue, Table Review, Table Detail | High |
| Expandable Table Row | Review Queue (classification reasoning) | High |
| Bulk Action Toolbar | Review Queue, Table Review | High |
| Form Input (text) | Create Rule | High |
| Select Dropdown | Create Rule (classification type) | High |
| Radio Group | Create Rule (pattern type, scope) | High |
| Checkbox | Create Rule (scope connections, auto-apply) | High |
| Filter Bar | Review Queue, Data Catalog, Schema Drift | High |
| Filter Chip (removable) | Review Queue, Data Catalog | Medium |
| Pagination | Review Queue, Data Catalog, Matched Columns | Medium |
| Live Feed | Scan Progress | Medium |
| Threshold Slider | Bulk Accept modal | Medium |
| Confirmation Dialog | Cancel Scan, Delete Rule, Reject high-confidence | Medium |
| Toast Notification | All screens (success/error feedback) | Medium |
| Skeleton Loader | All screens (loading state) | Medium |
| Empty State | All screens | Medium |

---

## Appendix: Navigation Map

```
Sidebar "Scans"     --> Scan Progress (active scan) | Scans list
Sidebar "Review Queue" --> Classification Review Queue
Sidebar "Data Catalog"  --> Data Catalog

Scan Progress         --> Scan Summary
Scan Summary          --> Review Queue | Data Catalog | Schema Drift Summary
Schema Drift Summary  --> Review Queue | Data Catalog
Review Queue (Queue)  --> Table Review | Data Catalog (via table link)
Review Queue (Rules)  --> Create Rule | Rule Detail
Review Queue (Consist)--> Review Queue (Queue) filtered
Table Review          --> Review Queue
Data Catalog          --> Table Detail | Review Queue (filtered)
Table Detail          --> Data Catalog | Review Queue (filtered) | Remediation (Flow 4)
Create Rule           --> Rules List
Rule Detail           --> Rules List | Review Queue (filtered) | Create Rule (edit mode)
```
