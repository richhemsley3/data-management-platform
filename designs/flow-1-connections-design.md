# Flow 1: Data Source Connections — Screen Design Specification

**Flow**: Data Source Connections
**Stage**: Discover
**Primary persona**: Jordan (Data Engineer)
**Screens**: 4 (Connection List, Add Connection — Platform + Configure, Add Connection — Select Schemas, Connection Detail)
**Design system**: Software DS
**Last updated**: 2026-03-14

---

## Table of Contents

1. [Feature Requirements](#1-feature-requirements)
2. [Design Rationale](#2-design-rationale)
3. [Pattern Recommendations](#3-pattern-recommendations)
4. [Edge Cases & Considerations](#4-edge-cases--considerations)
5. [Screen 1: Connection List](#5-screen-1-connection-list)
6. [Screen 2: Add Connection — Platform + Configure](#6-screen-2-add-connection--platform--configure)
7. [Screen 3: Add Connection — Select Schemas](#7-screen-3-add-connection--select-schemas)
8. [Screen 4: Connection Detail](#8-screen-4-connection-detail)
9. [New Components Needed](#9-new-components-needed)

---

## 1. Feature Requirements

### Problem Statement

Data engineers need to connect external data platforms (Snowflake, BigQuery, PostgreSQL, Databricks, etc.) to the security product so the system can scan and ingest metadata. The current onboarding bottleneck in comparable products is 4-6 weeks; the goal is to reduce time-to-first-scan to under 10 minutes.

### Users

| User | Role | Goal in This Flow |
|------|------|-------------------|
| **Jordan (Data Engineer)** | Primary | Connect platforms, verify connectivity, select schemas for scanning |
| **Priya (Governance Analyst)** | Secondary viewer | See schema coverage and classification status on existing connections |
| **Marcus (VP Security)** | Does not interact | Sees aggregate connection health on the Dashboard (Flow 6) |

### Success Metrics

| Metric | Target |
|--------|--------|
| Time from landing on Connections page to first successful connection test | < 3 minutes |
| Time from successful test to first scan initiated | < 2 minutes |
| Connection test failure recovery rate (user retries and succeeds) | > 80% |
| Zero-state to first scan (end-to-end) | < 10 minutes |

### User Stories

1. As Jordan, I want to see all my data source connections in one place so I can monitor their health at a glance.
2. As Jordan, I want to add a new connection by selecting a platform and entering credentials so the system can access my data.
3. As Jordan, I want to use OAuth for supported platforms so I can skip manual credential entry.
4. As Jordan, I want to select specific schemas for scanning so I can control scope and scan time.
5. As Jordan, I want to see clear error messages when connection tests fail so I can fix the issue quickly.
6. As Jordan, I want to reconnect a broken connection without re-entering the platform type so I can restore access quickly.
7. As Jordan, I want to group connections by platform or environment tag when I have many so I can find what I need.

---

## 2. Design Rationale

### Key Design Decisions

| Decision | Chosen Approach | Alternatives Considered | Why |
|----------|----------------|------------------------|-----|
| Platform selection + credential entry | Single step with inline reveal on card click | Multi-step wizard with separate pages | Reduces friction. Platform selection is a simple click, not worth a full page. Card click reveals the form inline, keeping context. |
| OAuth support | "Quick Connect" button alongside manual form | OAuth only, or manual only | Covers both paths. OAuth-enabled platforms show a prominent one-click option that skips 60% of form fields. Manual always available as fallback. |
| Schema selection layout | Side-by-side split (tree left, summary right) | Collapsible summary panel, full-page tree | Persistent spatial layout reduces cognitive load during large selection operations. User always sees impact of selections. |
| Review step | Merged into schema selection summary panel | Dedicated review page | Eliminates one wizard step. The right panel in the split layout serves as live review, showing selected schemas, table counts, and estimated scan time. |
| Connection list at scale (20+) | Groupable data table with environment tags | Pagination only, card grid | Data table is the standard for structured data with many attributes. Grouping prevents the list from becoming unmanageable. Consistent with the Data Table pattern from the DS. |
| Connection health model | Three states: Active, Degraded, Error | Binary active/error | Degraded state prevents false-alarm disconnection badges. Captures intermittent connectivity that affects scan reliability. |
| Primary CTA on schema selection | "Save + Start Scan" | "Save" with separate scan trigger | Makes the transition to Flow 2 (scanning) the default happy path. Reduces decision friction. |

---

## 3. Pattern Recommendations

### Per-Screen Pattern Mapping

| Screen | Primary Pattern | Secondary Patterns |
|--------|-----------------|-------------------|
| Connection List | Data Table with Inline Actions | Filter Panel (inline bar), Bulk Operations, Saved Views |
| Add Connection — Platform + Configure | CRUD Workflow (Create step) | Card selection grid |
| Add Connection — Select Schemas | Split View (tree + summary) | Bulk Operations (select all schema) |
| Connection Detail | Master-Detail View (page variant) | Tabs for content sections, Data Table for scan history |

---

## 4. Edge Cases & Considerations

| Category | Scenario | Design Response | Screen Affected |
|----------|----------|-----------------|-----------------|
| Empty state | No connections exist | Guided empty state centered in content area. Platform logos, "Connect in under 2 minutes" promise, single primary CTA. | Connection List |
| Auth error | Invalid credentials on test | Inline error banner on credential form. Specific reason text: wrong password, expired token, or insufficient permissions. Form fields with errors get `--sds-status-error-strong` border. | Add Connection |
| Network error | Host unreachable | Separate error state with diagnostic checklist: hostname, firewall, service maintenance. Distinct from auth errors. | Add Connection |
| Timeout | Connection test > 30s | Show elapsed time counter. At 30s, surface "Retry with extended timeout (60s)" secondary action. | Add Connection |
| Degraded | Intermittent connectivity | Yellow `sds-tag--warning` badge with dot. Health tab shows latency chart with spike highlighting. Warning text about scan reliability. | Connection Detail |
| Reconnect | Previously working connection breaks | "Reconnect" button on error banner. Pre-fills platform and host. Only asks for new credentials. Skips platform selection. | Connection Detail |
| Permission | Read-only user views connections | All mutation buttons disabled with tooltip "Contact admin for edit access". List and detail views remain fully visible. | All screens |
| Destructive action | Delete connection with associated data | Two-step confirmation dialog. Step 1: acknowledge affected data count. Step 2: type connection name to confirm. Uses `btn-danger` for final confirm. | Connection Detail |
| Interruption | Browser closed mid-wizard | Draft saved to localStorage. On return, toast notification: "Resume setting up your [Platform] connection?" with Resume and Discard actions. | Add Connection |
| Scale | 50+ connections | Pagination (20 per page). Platform/status filters in inline filter bar. Search input. Health summary bar at top: "12 active, 2 degraded, 1 error". Group-by toggle. | Connection List |
| First run | User came from onboarding (Flow 7) | Platform pre-selected based on signup questionnaire. Jump straight to credential form with platform card pre-expanded. | Add Connection |

---

## 5. Screen 1: Connection List

### Purpose
Browse all connected data sources, monitor health at a glance, and initiate new connections. This is the primary landing page for the Connections section in the sidebar.

### Shell & Layout

**Shell**: Full App Shell (Header 56px + Sidebar 220px + Content Area)
**Grid**: Single-column content area with 24px padding
**Content max-width**: None (table stretches to fill)

```
┌──────────────────────────────────────────────────────────────┐
│ Header (56px)                                                │
├────────────┬─────────────────────────────────────────────────┤
│ Sidebar    │ Content Area (padding: 24px)                    │
│ 220px      │                                                 │
│            │ ┌─ Page Header ──────────────────────────────┐  │
│ [Discover] │ │ Title: Connections     [+ Add Connection]  │  │
│  > Conns*  │ └────────────────────────────────────────────┘  │
│  Data Cat  │                                                 │
│  ...       │ ┌─ Health Summary Bar ──────────────────────┐  │
│            │ │ 12 Active  ·  2 Degraded  ·  1 Error      │  │
│            │ └────────────────────────────────────────────┘  │
│            │                                                 │
│            │ ┌─ Filter Bar ──────────────────────────────┐  │
│            │ │ [Search...] [Platform ▾] [Status ▾] [Group]│  │
│            │ └────────────────────────────────────────────┘  │
│            │                                                 │
│            │ ┌─ Data Table ──────────────────────────────┐  │
│            │ │ ☐  Name ▾    Platform  Status  Last Scan  │  │
│            │ │ ☐  Prod DW   ❄ Snow..  Active  2h ago     │  │
│            │ │ ☐  Analytics  BQ       Active  1d ago     │  │
│            │ │ ☐  Staging    ❄ Snow..  Degraded 4h ago   │  │
│            │ │ ☐  Legacy DB  PG       Error   3d ago     │  │
│            │ └────────────────────────────────────────────┘  │
│            │                                                 │
│            │ ┌─ Pagination ──────────────────────────────┐  │
│            │ │ Showing 1-15 of 15    [< 1 >]             │  │
│            │ └────────────────────────────────────────────┘  │
└────────────┴─────────────────────────────────────────────────┘
```

### Content Hierarchy

#### 1. Page Header
- **Title**: "Connections"
  - Font: 24px, weight 600, `var(--sds-text-primary)`
- **Action button** (right-aligned): "+ Add Connection"
  - Component: `btn btn-primary btn-md` with leading plus icon
  - Background: `var(--sds-interactive-primary)` / #013D5B
  - Text: `var(--sds-text-on-primary)` / #FFFFFF
  - Icon: 16x16 plus SVG, stroke currentColor
- **Spacing**: Title to health summary bar: 24px

#### 2. Health Summary Bar (visible when connections > 0)
- **Container**: Inline flex row, no background (sits on page)
- **Items**: Text badges showing counts by status
  - Active count: `var(--sds-status-success-text)` / green-500
  - Degraded count: `var(--sds-status-warning-text)` / yellow-500
  - Error count: `var(--sds-status-error-text)` / red-500
- **Typography**: 13px, weight 500, separated by centered dot (middot) in `var(--sds-text-tertiary)`
- **Spacing**: Summary bar to filter bar: 16px

#### 3. Filter Bar
- **Layout**: Flex row, gap 12px, items vertically centered
- **Search input**:
  - Height: 36px, padding: 8px 12px, font: 13px
  - Border: 1px solid `var(--sds-border-default)` / warm-gray-150
  - Border-radius: 6px
  - Placeholder: "Search connections..." in `var(--sds-text-tertiary)`
  - Focus border: `var(--sds-border-focus)` / blue-750
  - Leading search icon: 16px, stroke `var(--sds-text-tertiary)`
  - Width: 240px
- **Platform dropdown**: Select input, 36px height, same border tokens as search
  - Options: All Platforms, Snowflake, BigQuery, PostgreSQL, Databricks, etc.
- **Status dropdown**: Same styling as platform dropdown
  - Options: All Statuses, Active, Degraded, Error
- **Group-by toggle**: Icon button, `btn btn-secondary btn-sm`
  - Icon: grid/group icon, 16px
  - Tooltip on hover: "Group by platform"
  - Active state: `var(--sds-interactive-primary-subtle)` background with `var(--sds-interactive-primary)` border
- **Spacing**: Filter bar to table: 16px

#### 4. Data Table
- **Table header row**:
  - Background: `var(--sds-bg-subtle)` / warm-gray-050
  - Text: 12px, weight 600, `var(--sds-text-secondary)` / warm-gray-650
  - Border-bottom: 1px solid `var(--sds-border-default)` / warm-gray-150
  - Padding: 10px 16px per cell
  - Sortable columns show sort chevron icon (14px) on hover and when active

- **Columns**:

  | Column | Width | Content |
  |--------|-------|---------|
  | Checkbox | 40px | Row selection checkbox. Header has "select all" checkbox. |
  | Name | flex (min 200px) | Connection name as link (`var(--sds-text-link)` / blue-750). Navigates to Connection Detail. |
  | Platform | 140px | Platform icon (20x20) + platform name text. Icon uses brand colors per platform. |
  | Status | 120px | Status tag with dot indicator. Uses `sds-tag--success` (Active), `sds-tag--warning` (Degraded), `sds-tag--error` (Error). |
  | Last Scan | 140px | Relative timestamp, e.g. "2h ago", "1d ago". Text: `var(--sds-text-secondary)`. If never scanned: "Never" in `var(--sds-text-tertiary)`. |
  | Schemas | 100px | Integer count, e.g. "12". Text: `var(--sds-text-secondary)`. |
  | Classification % | 120px | Percentage with small inline progress bar. Text: `var(--sds-text-secondary)`. Progress fill: `var(--sds-status-success-strong)` / green-400. Track: `var(--sds-bg-subtle)`. |
  | Actions | 80px | Tertiary icon button (more/ellipsis), 32px. Opens dropdown: Edit, Reconnect, Trigger Scan, Delete. |

- **Table row**:
  - Background: `var(--sds-bg-card)` / white
  - Border-bottom: 1px solid `var(--sds-border-subtle)` / warm-gray-100
  - Padding: 12px 16px per cell
  - Cell text: 13px, `var(--sds-text-secondary)` / warm-gray-650
  - Hover: background `var(--sds-color-warm-gray-050)` / #F4F1EB
  - Row click (on Name cell): navigates to Connection Detail

- **Bulk action toolbar** (appears when rows selected):
  - Slides down between filter bar and table
  - Background: `var(--sds-interactive-primary-subtle)` / blue-100
  - Padding: 8px 16px
  - Border-radius: 6px
  - Content: "N selected" text (13px, weight 500, `var(--sds-interactive-primary)`) + action buttons
  - Buttons: "Reconnect" (`btn btn-secondary btn-sm`), "Delete" (`btn btn-danger-outline btn-sm`)

- **Group headers** (when grouping enabled):
  - Background: `var(--sds-bg-subtle)` / warm-gray-050
  - Text: 13px, weight 600, `var(--sds-text-primary)` / warm-gray-900
  - Padding: 10px 16px
  - Collapse/expand chevron: 14px, left of group label
  - Aggregate status shown: "3 active, 1 degraded"
  - Border-bottom: 1px solid `var(--sds-border-default)`

#### 5. Pagination
- **Layout**: Flex row, space-between
- **Left**: "Showing 1-15 of 15" in 13px, `var(--sds-text-tertiary)`
- **Right**: Page number buttons
  - Active page: `var(--sds-interactive-primary)` background, white text
  - Inactive: transparent background, `var(--sds-text-secondary)` text
  - Hover: `var(--sds-bg-subtle)` background
  - Arrow buttons: previous/next, disabled at bounds with `var(--sds-text-disabled)`
- **Spacing**: Table to pagination: 16px

### Component Inventory

| Component | Source | Variant Used |
|-----------|--------|-------------|
| Header | `/components/header.html` | Default (56px, full-width) |
| Side Navigation | `/components/side-navigation.html` | Expanded (220px), "Connections" active under "Discover" group |
| Primary Button | `/components/buttons.html` | `btn btn-primary btn-md` with leading icon |
| Secondary Button | `/components/buttons.html` | `btn btn-secondary btn-sm` (bulk actions) |
| Danger Outline Button | `/components/buttons.html` | `btn btn-danger-outline btn-sm` (bulk delete) |
| Tertiary Icon Button | `/components/buttons.html` | `btn btn-tertiary btn-sm btn-icon-only` (row actions) |
| Status Tags | `/components/tags.html` | `sds-tag--success`, `sds-tag--warning`, `sds-tag--error` with dots |
| Data Table | **New component needed** | Sortable, selectable, groupable |
| Filter Bar | **New component needed** | Search + dropdowns + toggle |
| Pagination | **New component needed** | Page numbers + showing count |

### Token References Summary

| Element | Property | Token |
|---------|----------|-------|
| Page background | background | `var(--sds-bg-page)` |
| Sidebar background | background | `var(--sds-nav-sidebar-bg)` |
| Sidebar active item | background / color | `var(--sds-nav-item-active-bg)` / `var(--sds-nav-item-active-text)` |
| Page title | color / size / weight | `var(--sds-text-primary)` / 24px / 600 |
| Table header bg | background | `var(--sds-bg-subtle)` |
| Table header text | color / size / weight | `var(--sds-text-secondary)` / 12px / 600 |
| Table row border | border-bottom | `var(--sds-border-subtle)` |
| Table row hover | background | warm-gray-050 (#F4F1EB) |
| Cell text | color / size | `var(--sds-text-secondary)` / 13px |
| Connection name link | color | `var(--sds-text-link)` |
| Checkbox border | border | `var(--sds-border-strong)` |
| Checkbox checked | background | `var(--sds-interactive-primary)` |
| Active tag | bg / text | `var(--sds-status-success-bg)` / `var(--sds-status-success-text)` |
| Degraded tag | bg / text | `var(--sds-status-warning-bg)` / `var(--sds-status-warning-text)` |
| Error tag | bg / text | `var(--sds-status-error-bg)` / `var(--sds-status-error-text)` |
| Bulk toolbar bg | background | `var(--sds-interactive-primary-subtle)` |

### Interaction Details

| Trigger | Action | Animation |
|---------|--------|-----------|
| Click connection name | Navigate to Connection Detail | Page transition (no animation, instant navigation) |
| Click "+ Add Connection" | Navigate to Add Connection wizard | Page transition |
| Click table header | Sort ascending, click again descending, third click removes sort | Sort icon rotates. Table rows re-order with 150ms ease transition. |
| Hover table row | Row background changes | 120ms ease transition on background |
| Check row checkbox | Bulk action toolbar appears | Toolbar slides down with 200ms ease-out. Height animates from 0. |
| Uncheck all | Bulk toolbar disappears | Toolbar slides up with 150ms ease-in |
| Click row actions (ellipsis) | Dropdown menu appears | Dropdown fades in with 150ms ease, positioned below-right of button |
| Click group toggle | Table regroups by selected dimension | Groups expand/collapse with 200ms ease transition on max-height |
| Type in search | Table filters in real-time (debounced 300ms) | Rows that no longer match fade out with 150ms transition |

### State Variations

#### Empty State (no connections)
```
┌──────────────────────────────────────────────────────────────┐
│ Content Area                                                  │
│                                                               │
│              ┌────────────────────────────┐                   │
│              │         [Icon 48px]        │                   │
│              │                            │                   │
│              │  Connect your first        │                   │
│              │  data source               │                   │
│              │                            │                   │
│              │  Connect a data platform   │                   │
│              │  so the system can scan    │                   │
│              │  and classify your data.   │                   │
│              │  It takes under 2 minutes. │                   │
│              │                            │                   │
│              │  ❄  BQ  PG  DB            │                   │
│              │  (platform logo row)       │                   │
│              │                            │                   │
│              │  [+ Add Connection]        │                   │
│              └────────────────────────────┘                   │
└──────────────────────────────────────────────────────────────┘
```
- **Icon**: 48px, muted, connection/plug motif, opacity 0.3
- **Title**: 18px, weight 600, `var(--sds-text-primary)`
- **Description**: 14px, `var(--sds-text-secondary)`, max-width 420px, centered
- **Platform logos**: Row of 4-6 platform icons (24px each, 12px gap), grayscale, centered
- **CTA**: `btn btn-primary btn-md` with leading plus icon
- Vertically and horizontally centered in the content area

#### Loading State
- Table skeleton: 5 rows of shimmer/pulse placeholders
- Each row shows gray blocks mimicking column widths
- Pulse animation: opacity oscillates between 0.3 and 0.7, 1.5s ease-in-out infinite
- Background of shimmer blocks: `var(--sds-bg-subtle)`

#### Error State (failed to load connections)
- Full-width banner at top of content area
- Background: `var(--sds-status-error-bg)` / red-050
- Text: `var(--sds-status-error-text)` / red-500
- Message: "Unable to load connections. Please try again."
- "Retry" tertiary button aligned right

### Responsive Behavior

- **< 1024px**: Hide Classification % and Schemas columns. Search input shrinks to 180px.
- **< 768px**: Sidebar collapses to 56px icon-only mode. Filter dropdowns stack below search.
- **Table horizontal scroll**: At extreme narrow widths, table gets horizontal scroll with sticky first column (Name).

---

## 6. Screen 2: Add Connection — Platform + Configure

### Purpose
Select a data platform and enter connection credentials in a single step. This is step 1 of a 2-step wizard. OAuth-enabled platforms show a "Quick Connect" path that bypasses manual credential entry.

### Shell & Layout

**Shell**: Full App Shell (Header 56px + Sidebar 220px + Content Area)
**Grid**: Content area with centered form layout, max-width 720px
**Content padding**: 24px

```
┌──────────────────────────────────────────────────────────────┐
│ Header (56px)                                                │
├────────────┬─────────────────────────────────────────────────┤
│ Sidebar    │ Content Area                                    │
│ 220px      │                                                 │
│            │ ┌─ Breadcrumb + Wizard Progress ─────────────┐  │
│            │ │ Connections > Add Connection                 │  │
│            │ │ Step 1 of 2: Connect  ─────○ Select Schemas │  │
│            │ └────────────────────────────────────────────┘  │
│            │                                                 │
│            │ ┌─ Page Header ──────────────────────────────┐  │
│            │ │ Add Connection                    [Cancel]  │  │
│            │ └────────────────────────────────────────────┘  │
│            │                                                 │
│            │ ┌─ Platform Selection Grid ──────────────────┐  │
│            │ │ Choose a platform                           │  │
│            │ │                                             │  │
│            │ │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │  │
│            │ │ │  ❄   │ │  BQ  │ │  PG  │ │  DB  │       │  │
│            │ │ │Snowfl.│ │BigQu.│ │Postg.│ │Databr│       │  │
│            │ │ └──────┘ └──────┘ └──────┘ └──────┘       │  │
│            │ │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │  │
│            │ │ │  RD  │ │  MS  │ │  OR  │ │  S3  │       │  │
│            │ │ │Redsh. │ │MySQL │ │Oracle│ │  S3  │       │  │
│            │ │ └──────┘ └──────┘ └──────┘ └──────┘       │  │
│            │ └────────────────────────────────────────────┘  │
│            │                                                 │
│            │ ┌─ Credential Form (after card click) ──────┐  │
│            │ │ ❄ Snowflake                                │  │
│            │ │                                             │  │
│            │ │ [Quick Connect with OAuth]  ── or ──       │  │
│            │ │                                             │  │
│            │ │ Connection Name  [________________]         │  │
│            │ │ Account URL      [________________]         │  │
│            │ │ Username         [________________]         │  │
│            │ │ Password         [________________]  👁     │  │
│            │ │ Warehouse        [________________]         │  │
│            │ │ Role (optional)  [________________]         │  │
│            │ │                                             │  │
│            │ │ [Test Connection]                           │  │
│            │ └────────────────────────────────────────────┘  │
└────────────┴─────────────────────────────────────────────────┘
```

### Content Hierarchy

#### 1. Breadcrumb + Wizard Progress
- **Breadcrumb**: "Connections" (link, `var(--sds-text-link)` / blue-750) > "Add Connection" (current, `var(--sds-text-primary)`)
  - Font: 13px, separator: " > " in `var(--sds-text-tertiary)`
  - Spacing: breadcrumb to wizard progress: 16px

- **Wizard progress indicator**:
  - Layout: Flex row with two steps connected by a line
  - Step 1 (active): Filled circle (16px, `var(--sds-interactive-primary)` background, white number) + label "Connect" (13px, weight 500, `var(--sds-text-primary)`)
  - Connector line: 1px solid, spans between circles. Left half filled `var(--sds-interactive-primary)`, right half `var(--sds-border-default)`
  - Step 2 (upcoming): Outlined circle (16px, `var(--sds-border-default)` border, `var(--sds-text-tertiary)` number) + label "Select Schemas" (13px, `var(--sds-text-tertiary)`)
  - Spacing: wizard progress to page header: 24px

#### 2. Page Header
- **Title**: "Add Connection"
  - Font: 24px, weight 600, `var(--sds-text-primary)`
- **Cancel button** (right-aligned): `btn btn-tertiary btn-md` — text "Cancel", navigates back to Connection List
- **Spacing**: Title to platform grid: 24px

#### 3. Platform Selection Grid
- **Section label**: "Choose a platform"
  - Font: 16px, weight 600, `var(--sds-text-primary)`
  - Spacing: label to grid: 16px

- **Platform cards**: CSS grid, 4 columns, gap 12px
  - **Card dimensions**: Approximately 160px wide (fluid within grid), 96px height
  - **Card styling**:
    - Background: `var(--sds-bg-card)` / white
    - Border: 1px solid `var(--sds-border-default)` / warm-gray-150
    - Border-radius: 8px
    - Padding: 16px
    - Cursor: pointer
    - Transition: border-color 0.15s ease, box-shadow 0.15s ease
  - **Card content**: Centered vertically
    - Platform icon/logo: 32px, centered, brand colors
    - Platform name: 13px, weight 500, `var(--sds-text-primary)`, centered below icon, 8px gap
  - **Card hover**:
    - Border-color: `var(--sds-border-strong)` / warm-gray-200
    - Box-shadow: 0 2px 8px rgba(0,0,0,0.06)
  - **Card selected (clicked)**:
    - Border: 2px solid `var(--sds-interactive-primary)` / blue-750
    - Background: `var(--sds-color-blue-025)` / #F2F7F7
    - Box-shadow: 0 0 0 3px `var(--sds-interactive-primary-subtle)` / blue-100 (focus ring effect)
  - **Card disabled** (platform coming soon):
    - Opacity: 0.5
    - Cursor: not-allowed
    - "Coming soon" badge: `sds-tag sds-tag--sm sds-tag--neutral`, positioned top-right of card

- **OAuth indicator**: Platforms with OAuth support show a small lightning bolt icon (12px) in the top-right corner of the card, color `var(--sds-status-info-text)` / blue-700

#### 4. Credential Form (appears after platform card click)
- **Reveal animation**: Form slides down with 250ms ease-out, max-height animating from 0
- **Container**: No card border (flat section). Separated from grid by 24px gap and a horizontal rule (`var(--sds-border-subtle)` / warm-gray-100).

- **Platform confirmation header**:
  - Platform icon (24px) + Platform name (16px, weight 600, `var(--sds-text-primary)`)
  - "Change" tertiary link beside it (13px, `var(--sds-text-link)`)
  - Spacing: header to form/OAuth: 20px

- **OAuth Quick Connect** (for Snowflake, BigQuery):
  - Button: Full-width, 48px height, `btn btn-secondary btn-lg`
  - Label: "Quick Connect with OAuth" + platform's OAuth icon
  - Background: `var(--sds-bg-card)` with `var(--sds-border-strong)` border
  - Hover: `var(--sds-color-warm-gray-050)` background
  - **Divider**: "or" text centered on a horizontal line
    - Line: `var(--sds-border-subtle)` / warm-gray-100
    - "or" text: 12px, weight 500, `var(--sds-text-tertiary)`, `var(--sds-bg-page)` background padding to mask line
  - Spacing: OAuth button to divider: 20px, divider to manual form: 20px

- **Manual credential form fields** (Snowflake example):

  | Field | Type | Required | Help Text |
  |-------|------|----------|-----------|
  | Connection Name | text input | Yes | "A display name to identify this connection" |
  | Account URL | text input | Yes | "e.g. xy12345.us-east-1.snowflakecomputing.com" |
  | Username | text input | Yes | — |
  | Password | password input (with visibility toggle) | Yes | — |
  | Warehouse | text input | Yes | "The default warehouse for queries" |
  | Role | text input | No | "Optional. Leave blank to use default role." |

  - **Field styling**:
    - Label: 13px, weight 500, `var(--sds-text-primary)`
    - Required indicator: red asterisk after label, `var(--sds-status-error-text)`
    - Input: Height 40px, padding 10px 12px, font 14px, `var(--sds-text-primary)` text
    - Input border: 1px solid `var(--sds-border-default)` / warm-gray-150, radius 6px
    - Input focus: border `var(--sds-border-focus)` / blue-750, box-shadow 0 0 0 3px `var(--sds-interactive-primary-subtle)`
    - Input placeholder: `var(--sds-text-tertiary)` / warm-gray-550
    - Help text: 12px, `var(--sds-text-tertiary)`, 4px below input
    - Error state: border `var(--sds-status-error-strong)` / red-450, error text 12px `var(--sds-status-error-text)` / red-500 below input
    - Field vertical gap: 16px
    - Password visibility toggle: Icon button (eye/eye-off), inside input right padding, 16px icon, `var(--sds-text-tertiary)`

- **Test Connection button**:
  - `btn btn-primary btn-md` — "Test Connection"
  - Spacing: 24px above button, left-aligned
  - Width: auto (fits content)

#### 5. Test Connection States

**Testing (in progress)**:
- Button changes to loading state: "Testing..." with inline spinner (16px, rotating 360deg, 1s linear infinite)
- Button is disabled during test
- Progress text below button: "Connecting to xy12345.us-east-1..." in 13px, `var(--sds-text-tertiary)`
- Elapsed time counter appears after 5s: "12s elapsed" in `var(--sds-text-tertiary)`

**Test success**:
- Success banner appears below form:
  - Background: `var(--sds-status-success-bg)` / green-025
  - Border-left: 3px solid `var(--sds-status-success-strong)` / green-400
  - Padding: 12px 16px
  - Icon: Green checkmark, 16px
  - Text: "Connection successful" — 13px, weight 500, `var(--sds-status-success-text)`
  - Fade in with 200ms ease
- Button changes to: "Continue to Schema Selection" `btn btn-primary btn-md` with right arrow icon
- The previous "Test Connection" button becomes `btn btn-secondary btn-md` "Re-test"

**Test failure — Auth error**:
- Error banner appears below form:
  - Background: `var(--sds-status-error-bg)` / red-050
  - Border-left: 3px solid `var(--sds-status-error-strong)` / red-450
  - Padding: 12px 16px
  - Icon: Red alert triangle, 16px
  - Title: "Authentication failed" — 13px, weight 600, `var(--sds-status-error-text)`
  - Description: Specific reason, e.g. "The password provided is incorrect. Check your credentials and try again." — 13px, `var(--sds-text-secondary)`
- Fields with errors get red border: `var(--sds-status-error-strong)`
- Button remains "Test Connection" (enabled, ready for retry)

**Test failure — Network error**:
- Error banner with diagnostic checklist:
  - Title: "Unable to reach host"
  - Checklist items (13px, `var(--sds-text-secondary)`, bulleted):
    - "Verify the hostname is correct"
    - "Check that your firewall allows outbound connections on port 443"
    - "Confirm the service is not in maintenance"
  - Background/border same as auth error pattern

**Test failure — Timeout**:
- Warning banner:
  - Background: `var(--sds-status-warning-bg)` / yellow-025
  - Border-left: 3px solid `var(--sds-status-warning-strong)` / yellow-200
  - Title: "Connection timed out after 30 seconds"
  - Action: "Retry with extended timeout (60s)" — `btn btn-secondary btn-sm`

### Component Inventory

| Component | Source | Variant Used |
|-----------|--------|-------------|
| Header | `/components/header.html` | Default |
| Side Navigation | `/components/side-navigation.html` | Expanded, "Connections" active |
| Primary Button | `/components/buttons.html` | `btn btn-primary btn-md` (Test Connection, Continue) |
| Secondary Button | `/components/buttons.html` | `btn btn-secondary btn-lg` (OAuth), `btn btn-secondary btn-md` (Re-test) |
| Tertiary Button | `/components/buttons.html` | `btn btn-tertiary btn-md` (Cancel) |
| Status Tags | `/components/tags.html` | `sds-tag--neutral sds-tag--sm` (Coming soon badge) |
| Cards | `/components/cards.html` | Adapted for platform selection cards (body-only variant) |
| Wizard Progress | **New component needed** | Step indicator with connecting line |
| Form Inputs | **New component needed** | Text, password, with validation states |
| Alert Banners | **New component needed** | Success, error, warning variants with left border accent |

### Token References Summary

| Element | Property | Token |
|---------|----------|-------|
| Breadcrumb link | color | `var(--sds-text-link)` |
| Breadcrumb separator | color | `var(--sds-text-tertiary)` |
| Wizard active step circle | background | `var(--sds-interactive-primary)` |
| Wizard upcoming step circle | border | `var(--sds-border-default)` |
| Platform card bg | background | `var(--sds-bg-card)` |
| Platform card border | border | `var(--sds-border-default)` |
| Platform card selected border | border | `var(--sds-interactive-primary)` |
| Platform card selected bg | background | `var(--sds-color-blue-025)` |
| Platform card selected ring | box-shadow | `var(--sds-interactive-primary-subtle)` |
| Form label | color / weight | `var(--sds-text-primary)` / 500 |
| Form input border | border | `var(--sds-border-default)` |
| Form input focus | border | `var(--sds-border-focus)` |
| Form help text | color | `var(--sds-text-tertiary)` |
| Form error text | color | `var(--sds-status-error-text)` |
| Form error border | border | `var(--sds-status-error-strong)` |
| Success banner bg | background | `var(--sds-status-success-bg)` |
| Success banner accent | border-left | `var(--sds-status-success-strong)` |
| Error banner bg | background | `var(--sds-status-error-bg)` |
| Error banner accent | border-left | `var(--sds-status-error-strong)` |
| Warning banner bg | background | `var(--sds-status-warning-bg)` |
| Warning banner accent | border-left | `var(--sds-status-warning-strong)` |

### Interaction Details

| Trigger | Action | Animation |
|---------|--------|-----------|
| Click platform card | Card gets selected state. Credential form slides into view below. Other cards remain visible but dimmed (opacity 0.6). | Selected card: border transition 150ms. Form: slideDown 250ms ease-out (max-height 0 to auto). |
| Click "Change" link on selected platform | Deselects card, form slides up, all cards return to full opacity | slideUp 200ms ease-in |
| Focus form input | Border changes to focus color, focus ring appears | border-color 150ms, box-shadow 150ms |
| Click "Test Connection" | Button enters loading state with spinner | Spinner rotates 360deg, 1s linear infinite. Button text cross-fades 150ms. |
| Test succeeds | Success banner fades in. Button text changes. | Banner: fadeIn 200ms. Button text: cross-fade 150ms. |
| Test fails | Error banner fades in. Error fields get red borders. | Banner: fadeIn 200ms. Border: color transition 150ms. |
| Click "Continue to Schema Selection" | Navigate to Screen 3 | Page transition |
| Click "Cancel" | Navigate back to Connection List | Page transition. If form has values, show confirmation dialog: "Discard unsaved changes?" |

### State Variations

#### OAuth Flow (Quick Connect)
1. User clicks "Quick Connect with OAuth"
2. New browser tab/popup opens for OAuth provider
3. Original page shows: "Waiting for authorization..." with pulsing dots animation
4. On OAuth callback success: popup closes, original page shows success state, auto-advances to Schema Selection
5. On OAuth callback failure: popup closes, error banner shows "Authorization failed or was cancelled"

#### Reconnect Flow (from Connection Detail)
- Platform card grid is hidden (platform already known)
- Platform confirmation header is pre-filled and non-editable
- Credential form is pre-filled with existing host/account info
- Only credential fields (username, password/token) are editable
- Title changes to "Reconnect — [Connection Name]"

### Responsive Behavior

- **< 1024px**: Platform grid goes to 3 columns. Form max-width remains 720px.
- **< 768px**: Platform grid goes to 2 columns. Sidebar collapses. Form fields stack full-width.
- Form always centered horizontally in content area with auto margins.

---

## 7. Screen 3: Add Connection — Select Schemas

### Purpose
Choose which databases and schemas to include in scanning. This is step 2 of the 2-step wizard. Uses a side-by-side split layout: schema tree on the left, live selection summary on the right.

### Shell & Layout

**Shell**: Full App Shell (Header 56px + Sidebar 220px + Content Area)
**Grid**: Content area split into two panels (60% / 40%) with 1px vertical divider
**Content padding**: 0 (panels have their own padding)

```
┌──────────────────────────────────────────────────────────────┐
│ Header (56px)                                                │
├────────────┬─────────────────────────────────────────────────┤
│ Sidebar    │ ┌─ Breadcrumb + Wizard Progress ─────────────┐ │
│ 220px      │ │ Connections > Add Connection                 │ │
│            │ │ ● Connect  ────────● Select Schemas         │ │
│            │ └──────────────────────────────────────────────┘ │
│            │                                                  │
│            │ ┌─ Left Panel (60%) ─┬─ Right Panel (40%) ────┐ │
│            │ │ Select schemas      │ Selection Summary      │ │
│            │ │                     │                        │ │
│            │ │ [Search schemas...] │ ❄ Snowflake            │ │
│            │ │ [☑ Select all]      │ xy12345.us-east-1      │ │
│            │ │                     │                        │ │
│            │ │ ▼ PROD_DB           │ ── Selected ────────── │ │
│            │ │   ☑ PUBLIC (42)     │ 3 schemas, 127 tables  │ │
│            │ │   ☑ ANALYTICS (18)  │                        │ │
│            │ │   ☐ STAGING (6)     │ ── Scan Estimate ───── │ │
│            │ │ ▼ DEV_DB            │ ~15 min initial scan   │ │
│            │ │   ☐ PUBLIC (12)     │                        │ │
│            │ │   ☐ SANDBOX (3)     │ ── Selected Schemas ── │ │
│            │ │ ▶ ARCHIVE_DB        │ • PUBLIC (42 tables)   │ │
│            │ │                     │ • ANALYTICS (18 tables)│ │
│            │ │                     │ • REPORTING (24 tables)│ │
│            │ │                     │                        │ │
│            │ │                     │ ────────────────────── │ │
│            │ │                     │ [Save Only] [Save +   ]│ │
│            │ │                     │             [Start Scan]│ │
│            │ └─────────────────────┴────────────────────────┘ │
└────────────┴─────────────────────────────────────────────────┘
```

### Content Hierarchy

#### 1. Breadcrumb + Wizard Progress (same pattern as Screen 2)
- Step 1 "Connect": Completed state — filled circle with checkmark icon, `var(--sds-status-success-strong)` / green-400
- Step 2 "Select Schemas": Active state — filled circle `var(--sds-interactive-primary)`, label `var(--sds-text-primary)`, weight 500
- Connector line: fully filled with `var(--sds-interactive-primary)`
- Spacing: wizard to split layout: 24px

#### 2. Left Panel — Schema Tree (60% width)
- **Panel padding**: 24px
- **Background**: `var(--sds-bg-page)` / white

- **Section title**: "Select schemas to scan"
  - Font: 16px, weight 600, `var(--sds-text-primary)`
  - Spacing to search: 16px

- **Search input**:
  - Full panel width, 36px height
  - Same styling as Connection List search
  - Placeholder: "Search databases and schemas..."
  - Spacing to select-all: 12px

- **Select all control**:
  - Checkbox + "Select all" label
  - Checkbox: 16px, border `var(--sds-border-strong)`, checked: `var(--sds-interactive-primary)` fill
  - Label: 13px, weight 500, `var(--sds-text-primary)`
  - Indeterminate state (some selected): horizontal dash inside checkbox, `var(--sds-interactive-primary)` fill
  - Spacing to tree: 16px
  - Separator: 1px border-bottom `var(--sds-border-subtle)`, with 8px padding below

- **Schema tree**:
  - **Database nodes** (top level):
    - Expand/collapse chevron: 14px, `var(--sds-text-tertiary)`, rotates 90deg when expanded (transition 150ms)
    - Database icon: 16px, `var(--sds-text-secondary)`
    - Database name: 14px, weight 500, `var(--sds-text-primary)`
    - Indeterminate checkbox when some child schemas are selected
    - Padding: 8px 0
    - Hover: background `var(--sds-color-warm-gray-050)`, border-radius 6px

  - **Schema nodes** (nested under databases):
    - Indent: 32px from left edge (icon-width + gap)
    - Checkbox: 16px
    - Schema icon: 14px, `var(--sds-text-tertiary)`
    - Schema name: 13px, `var(--sds-text-secondary)`
    - Table count badge: `sds-badge sds-badge--sm sds-badge--neutral` — e.g. "42"
    - Padding: 6px 0
    - Hover: same as database node

  - **Checkbox states**:
    - Unchecked: `var(--sds-border-strong)` border, white fill
    - Checked: `var(--sds-interactive-primary)` fill, white checkmark
    - Indeterminate: `var(--sds-interactive-primary)` fill, white horizontal dash
    - Disabled: `var(--sds-border-default)` border, `var(--sds-bg-subtle)` fill

  - **Tree connector lines**: None (clean indentation only)

#### 3. Vertical Divider
- Width: 1px
- Color: `var(--sds-border-default)` / warm-gray-150
- Full height of the split panel area

#### 4. Right Panel — Selection Summary (40% width)
- **Panel padding**: 24px
- **Background**: `var(--sds-bg-surface)` / warm-gray-025
- **Sticky positioning**: Panel stays fixed in viewport as left panel scrolls (position: sticky, top: 0)

- **Connection info block**:
  - Platform icon (20px) + Platform name (14px, weight 600, `var(--sds-text-primary)`)
  - Host/account URL: 12px, `var(--sds-text-tertiary)`, truncated with ellipsis
  - Spacing to selection stats: 24px

- **Selection stats**:
  - Section label: "Selected" — 11px, weight 600, uppercase, letter-spacing 0.4px, `var(--sds-text-tertiary)`
  - Count: e.g. "3 schemas, 127 tables" — 20px, weight 600, `var(--sds-text-primary)`
  - Spacing: 16px below

- **Scan estimate**:
  - Section label: "Estimated scan time" — same styling as above
  - Estimate: e.g. "~15 minutes" — 16px, weight 500, `var(--sds-text-primary)`
  - Note: "Initial scans are the longest. Subsequent scans are incremental." — 12px, `var(--sds-text-tertiary)`
  - Spacing: 16px below

- **Selected schemas list**:
  - Section label: "Schemas included" — same styling as above
  - List items:
    - Schema name: 13px, weight 500, `var(--sds-text-primary)`
    - Table count: 13px, `var(--sds-text-tertiary)`, e.g. "(42 tables)"
    - Remove button: small X icon (12px), `var(--sds-text-tertiary)`, hover `var(--sds-status-error-text)`
    - Vertical gap: 8px
    - Max-height: 200px, overflow-y auto with scrollbar

- **Divider**: 1px `var(--sds-border-subtle)`, 24px vertical margin

- **Action buttons** (bottom of right panel):
  - Layout: Flex row, gap 12px, right-aligned
  - "Back": `btn btn-tertiary btn-md` — navigates to Screen 2 (credentials preserved)
  - "Save Only": `btn btn-secondary btn-md` — saves connection, navigates to Connection Detail
  - "Save + Start Scan": `btn btn-primary btn-md` — saves and triggers first scan, navigates to Connection Detail with live scan progress
  - "Save + Start Scan" is the recommended/default action (rightmost, primary)

### Component Inventory

| Component | Source | Variant Used |
|-----------|--------|-------------|
| Header | `/components/header.html` | Default |
| Side Navigation | `/components/side-navigation.html` | Expanded, "Connections" active |
| Primary Button | `/components/buttons.html` | `btn btn-primary btn-md` (Save + Start Scan) |
| Secondary Button | `/components/buttons.html` | `btn btn-secondary btn-md` (Save Only) |
| Tertiary Button | `/components/buttons.html` | `btn btn-tertiary btn-md` (Back) |
| Count Badge | `/components/tags.html` | `sds-badge sds-badge--sm sds-badge--neutral` |
| Wizard Progress | **New component needed** | Shared with Screen 2 |
| Tree View | **New component needed** | Expandable/collapsible with checkboxes |
| Split Panel Layout | **New component needed** | 60/40 with sticky right panel |

### Token References Summary

| Element | Property | Token |
|---------|----------|-------|
| Left panel bg | background | `var(--sds-bg-page)` |
| Right panel bg | background | `var(--sds-bg-surface)` |
| Panel divider | border-color | `var(--sds-border-default)` |
| Section label | color / weight / size | `var(--sds-text-tertiary)` / 600 / 11px |
| Selection count | color / size | `var(--sds-text-primary)` / 20px |
| Database name | color / weight | `var(--sds-text-primary)` / 500 |
| Schema name | color | `var(--sds-text-secondary)` |
| Tree item hover | background | warm-gray-050 |
| Chevron | color | `var(--sds-text-tertiary)` |
| Checkbox checked | fill | `var(--sds-interactive-primary)` |
| Completed step | fill | `var(--sds-status-success-strong)` |

### Interaction Details

| Trigger | Action | Animation |
|---------|--------|-----------|
| Click database chevron | Expand/collapse child schemas | Chevron rotates 90deg (150ms). Children slideDown/slideUp (200ms ease). |
| Check/uncheck schema | Right panel summary updates: count, list, scan estimate | Count cross-fades (150ms). List item adds/removes with fadeIn/fadeOut (150ms). |
| Check database-level checkbox | All child schemas check/uncheck | Checkboxes transition simultaneously (no stagger). |
| Click "Select all" | All schemas across all databases check | Summary snaps to full count. |
| Type in search | Tree filters to matching schemas. Non-matching items hidden. Database stays visible if any child matches. | Filtered items fade out (150ms). |
| Click schema remove (X) in right panel | Unchecks corresponding checkbox in left tree | Checkbox state transitions. Item fades out of list (150ms). |
| Click "Save + Start Scan" | Connection saved, scan starts, redirect to Connection Detail | Page transition. Toast: "Connection saved. Scan started." |
| Click "Save Only" | Connection saved, redirect to Connection Detail | Page transition. Toast: "Connection saved." |
| Click "Back" | Navigate to Screen 2, form values preserved | Page transition (reverse). |

### State Variations

#### Loading Tree (fetching schema metadata)
- Left panel shows skeleton tree: 3 database-level blocks + 2 schema-level blocks per database
- Shimmer pulse animation on placeholder blocks
- Right panel shows connection info but "Loading schemas..." in stats area
- Estimated 2-5 seconds for most platforms

#### Empty Tree (no schemas found)
- Left panel shows empty state: "No schemas found for this connection"
- Suggestion text: "This might mean the credentials have insufficient read permissions. Check that the role can access INFORMATION_SCHEMA."
- "Re-test Connection" tertiary button

#### Large Schema Set (100+ schemas)
- Tree uses virtualized rendering (only visible items in DOM)
- Search becomes critical — prominently placed
- Right panel scrollable list caps at 200px height with scroll indicator

### Responsive Behavior

- **< 1024px**: Split changes from side-by-side to stacked. Tree panel full-width on top. Summary panel full-width below with sticky action buttons at bottom of viewport.
- **< 768px**: Sidebar collapses. Stacked layout maintained. Action buttons become fixed footer bar (56px, white bg, top border `var(--sds-border-default)`, padding 8px 16px).

---

## 8. Screen 4: Connection Detail

### Purpose
View connection health, manage schemas, review scan history, and configure settings for an existing connection. This is the detail page reached by clicking a connection name in the list, or after completing the wizard.

### Shell & Layout

**Shell**: Full App Shell (Header 56px + Sidebar 220px + Content Area)
**Grid**: Single-column content area, 24px padding
**Content max-width**: None (fills available width)

```
┌──────────────────────────────────────────────────────────────┐
│ Header (56px)                                                │
├────────────┬─────────────────────────────────────────────────┤
│ Sidebar    │ Content Area                                    │
│ 220px      │                                                 │
│            │ ┌─ Breadcrumb ──────────────────────────────┐  │
│            │ │ Connections > Prod Data Warehouse           │  │
│            │ └────────────────────────────────────────────┘  │
│            │                                                 │
│            │ ┌─ Page Header ──────────────────────────────┐  │
│            │ │ ❄ Prod Data Warehouse  [Active]            │  │
│            │ │                    [Edit] [Trigger Scan]    │  │
│            │ └────────────────────────────────────────────┘  │
│            │                                                 │
│            │ ┌─ Status Banner (conditional) ──────────────┐  │
│            │ │ ⚠ Intermittent connectivity detected...    │  │
│            │ └────────────────────────────────────────────┘  │
│            │                                                 │
│            │ ┌─ Tabs ────────────────────────────────────┐  │
│            │ │ Overview | Schemas (42) | Scan History | Settings │
│            │ └────────────────────────────────────────────┘  │
│            │                                                 │
│            │ ┌─ Tab Content ─────────────────────────────┐  │
│            │ │ (varies by active tab)                     │  │
│            │ └────────────────────────────────────────────┘  │
└────────────┴─────────────────────────────────────────────────┘
```

### Content Hierarchy

#### 1. Breadcrumb
- "Connections" (link, `var(--sds-text-link)`) > "[Connection Name]" (current, `var(--sds-text-primary)`)
- Font: 13px
- Spacing to page header: 8px

#### 2. Page Header
- **Layout**: Flex row, space-between, items center
- **Left side**:
  - Platform icon: 24px, brand colors
  - Connection name: 24px, weight 600, `var(--sds-text-primary)`, 10px gap from icon
  - Status tag: `sds-tag` with dot, 12px gap from name
    - Active: `sds-tag--success` — "Active"
    - Degraded: `sds-tag--warning` — "Degraded"
    - Error: `sds-tag--error` — "Disconnected"
- **Right side** (action buttons):
  - "Edit": `btn btn-secondary btn-sm` with pencil icon
  - "Trigger Scan": `btn btn-primary btn-sm`
  - "More" (ellipsis): `btn btn-tertiary btn-sm btn-icon-only` — dropdown: Reconnect, Disable, Delete
  - Button gap: 8px
- **Spacing**: Header to status banner or tabs: 16px

#### 3. Status Banner (conditional, shown for degraded/error states)

**Degraded state**:
- Background: `var(--sds-status-warning-bg)` / yellow-025
- Border-left: 3px solid `var(--sds-status-warning-strong)` / yellow-200
- Border-radius: 0 6px 6px 0
- Padding: 12px 16px
- Icon: Warning triangle, 16px, `var(--sds-status-warning-text)`
- Text: "Intermittent connectivity detected. Scans may experience delays." — 13px, `var(--sds-text-primary)`
- Dismiss X button: 16px, `var(--sds-text-tertiary)`, right-aligned

**Error state**:
- Background: `var(--sds-status-error-bg)` / red-050
- Border-left: 3px solid `var(--sds-status-error-strong)` / red-450
- Icon: Error circle, 16px, `var(--sds-status-error-text)`
- Text: "Connection lost. Unable to reach the data source." — 13px, `var(--sds-text-primary)`
- Action button: "Reconnect" `btn btn-secondary btn-sm` — inline, right side of banner

**Scan in progress** (after wizard or manual trigger):
- Background: `var(--sds-status-info-bg)` / blue-050
- Border-left: 3px solid `var(--sds-status-info-text)` / blue-700
- Icon: Spinning loader, 16px, `var(--sds-status-info-text)`
- Text: "Scanning in progress... 34% complete (42 of 127 tables)" — 13px, `var(--sds-text-primary)`
- Progress bar below text: 4px height, `var(--sds-bg-subtle)` track, `var(--sds-interactive-primary)` fill
- "Cancel Scan" tertiary link, right-aligned

**Spacing**: Banner to tabs: 16px

#### 4. Page Tabs
- Component: `sds-tabs` (underline style from `/components/tabs.html`)
- Tabs:
  - "Overview" (default active)
  - "Schemas" with count badge: `sds-tab-badge` — e.g. "42"
  - "Scan History"
  - "Settings"
- Tab styling per DS spec:
  - Inactive: 14px, `var(--sds-text-tertiary)` / warm-gray-550
  - Active: 14px, weight 500, `var(--sds-text-primary)`, 2px bottom border `var(--sds-interactive-primary)`
  - Badge inactive: `var(--sds-status-neutral-bg)` bg, `var(--sds-text-secondary)` text
  - Badge active: `var(--sds-interactive-primary-subtle)` bg, `var(--sds-interactive-primary)` text
- Spacing: Tabs to tab content: 24px

#### 5. Tab Content: Overview

**5a. Metric Cards Row** (4-column grid, 16px gap):

| Card | Label | Value | Token |
|------|-------|-------|-------|
| Status | "Connection Status" | "Active" or dot + text | Status-specific color |
| Last Scan | "Last Scan" | Relative time, e.g. "2 hours ago" | `var(--sds-text-primary)` |
| Schemas | "Schemas Scanned" | Count, e.g. "42" | `var(--sds-text-primary)` |
| Classification | "Classification Coverage" | Percentage, e.g. "87%" | `var(--sds-text-primary)` |

- Card: `sds-card` (body-only variant)
  - Background: `var(--sds-bg-card)` / white
  - Border: 1px solid `var(--sds-border-default)` / warm-gray-150
  - Border-radius: 8px
  - Padding: 16px 20px
- Label: 13px, `var(--sds-text-secondary)` / warm-gray-650
- Value: 24px, weight 600, `var(--sds-text-primary)` / warm-gray-900
- Spacing: cards row to latency chart: 24px

**5b. Connection Health Card** (full-width):
- Card with bordered header: `sds-card` with `sds-card-header--bordered`
- Title: "Connection Health" — 14px, weight 600
- Time range toggle tabs (right-aligned in header): `sds-toggle-tabs` — "24h | 7d | 30d"
- Body: Latency line chart (placeholder — requires charting library)
  - Y-axis: Response time (ms)
  - X-axis: Time
  - Line color: `var(--sds-interactive-primary)` / blue-750
  - Spike threshold line: dashed, `var(--sds-status-warning-text)` / yellow-500
  - Area fill below line: `var(--sds-interactive-primary-subtle)` at 20% opacity
- Card height: 280px

**5c. Recent Scans Card** (full-width):
- Card with bordered header
- Title: "Recent Scans" — 14px, weight 600
- Action in header: "View All" `sds-link` — navigates to Scan History tab
- Body: Mini table, last 3 scans

  | Column | Content |
  |--------|---------|
  | Date | Timestamp, 13px, `var(--sds-text-secondary)` |
  | Duration | e.g. "12 min", 13px, `var(--sds-text-secondary)` |
  | Tables Scanned | Count, 13px |
  | New Classifications | Count with info badge, 13px |
  | Status | `sds-tag--success` "Complete" or `sds-tag--error` "Failed" |

- Table styling: same data table tokens as Connection List screen

#### 6. Tab Content: Schemas
- Same tree view component as Screen 3 (Select Schemas) but in read-only mode (no checkboxes)
- Each schema row is clickable and navigates to the Table Detail screen in Data Catalog (Flow 2 cross-link)
- Shows classification coverage percentage per schema
- "Edit Schema Selection" secondary button in tab content header

#### 7. Tab Content: Scan History
- Full data table of all scans
- Columns: Scan ID, Started, Duration, Tables, New Classifications, Status, Actions (View Log)
- Sortable by Started date (default: newest first)
- Pagination: 20 per page
- Table styling: same tokens as Connection List data table

#### 8. Tab Content: Settings
- Form sections in a single-column layout, max-width 640px

**Section 1: Connection Details** (editable form)
- Same fields as the credential form from Screen 2, pre-filled
- "Update Credentials" `btn btn-primary btn-sm` at bottom
- "Test Connection" `btn btn-secondary btn-sm` beside it

**Section 2: Scan Schedule**
- Toggle: "Enable scheduled scans" — switch control
- When enabled:
  - Frequency dropdown: Daily, Weekly, Custom cron
  - Time picker: Hour + timezone
  - Next scheduled scan: read-only display text
- Spacing between sections: 32px

**Section 3: Environment Tags**
- Tag input: text input with tag chips
- Pre-defined suggestions: Production, Staging, Development, QA
- Chip styling: `sds-tag sds-tag--neutral` with remove X
- Add custom tags by typing and pressing Enter

**Section 4: Danger Zone**
- Background: `var(--sds-status-error-bg)` / red-050 (subtle tint)
- Border: 1px solid `var(--sds-color-red-150)`
- Border-radius: 8px
- Padding: 20px
- Items:
  - "Disable Connection": Description text + `btn btn-secondary btn-sm`
  - "Delete Connection": Description text + `btn btn-danger btn-sm`
- Delete flow: Two-step confirmation dialog
  - Step 1: Dialog with warning text showing affected data count
  - Step 2: Type connection name in input to confirm
  - Confirm button: `btn btn-danger btn-md` — disabled until name matches

### Component Inventory

| Component | Source | Variant Used |
|-----------|--------|-------------|
| Header | `/components/header.html` | Default |
| Side Navigation | `/components/side-navigation.html` | Expanded, "Connections" active |
| Page Tabs | `/components/tabs.html` | `sds-tabs` with badges |
| Toggle Tabs | `/components/tabs.html` | `sds-toggle-tabs` (health chart time range) |
| Cards | `/components/cards.html` | Metric cards (body-only), content cards (header+body) |
| Status Tags | `/components/tags.html` | `sds-tag--success/warning/error` with dots |
| Count Badges | `/components/tags.html` | `sds-tab-badge` in tabs, `sds-badge--neutral` in tree |
| Primary Button | `/components/buttons.html` | `btn btn-primary btn-sm` (Trigger Scan, Update Credentials) |
| Secondary Button | `/components/buttons.html` | `btn btn-secondary btn-sm` (Edit, Reconnect, Test) |
| Danger Button | `/components/buttons.html` | `btn btn-danger btn-sm` (Delete), `btn btn-danger btn-md` (confirm dialog) |
| Tertiary Button | `/components/buttons.html` | `btn btn-tertiary btn-sm btn-icon-only` (More menu) |
| Alert Banners | **New component needed** | Warning, error, info variants (shared with Screen 2) |
| Line Chart | **New component needed** | Connection health latency visualization |
| Confirmation Dialog | **New component needed** | Two-step delete with name-typing verification |
| Switch Toggle | **New component needed** | For scan schedule enable/disable |
| Tag Input | **New component needed** | For environment tags |

### Token References Summary

| Element | Property | Token |
|---------|----------|-------|
| Breadcrumb link | color | `var(--sds-text-link)` |
| Connection name | color / size / weight | `var(--sds-text-primary)` / 24px / 600 |
| Metric card label | color / size | `var(--sds-text-secondary)` / 13px |
| Metric card value | color / size / weight | `var(--sds-text-primary)` / 24px / 600 |
| Metric card bg | background | `var(--sds-bg-card)` |
| Metric card border | border | `var(--sds-border-default)` |
| Tab inactive text | color | `var(--sds-text-tertiary)` |
| Tab active text | color / weight | `var(--sds-text-primary)` / 500 |
| Tab active indicator | border-bottom | `var(--sds-interactive-primary)` |
| Tab badge (inactive) | bg / text | `var(--sds-status-neutral-bg)` / `var(--sds-text-secondary)` |
| Tab badge (active) | bg / text | `var(--sds-interactive-primary-subtle)` / `var(--sds-interactive-primary)` |
| Warning banner | bg / border | `var(--sds-status-warning-bg)` / `var(--sds-status-warning-strong)` |
| Error banner | bg / border | `var(--sds-status-error-bg)` / `var(--sds-status-error-strong)` |
| Info banner | bg / border | `var(--sds-status-info-bg)` / `var(--sds-status-info-text)` |
| Progress bar track | background | `var(--sds-bg-subtle)` |
| Progress bar fill | background | `var(--sds-interactive-primary)` |
| Chart line | stroke | `var(--sds-interactive-primary)` |
| Chart spike threshold | stroke | `var(--sds-status-warning-text)` |
| Danger zone bg | background | `var(--sds-status-error-bg)` |
| Danger zone border | border | `var(--sds-color-red-150)` |
| Card header border | border-bottom | `var(--sds-border-subtle)` |

### Interaction Details

| Trigger | Action | Animation |
|---------|--------|-----------|
| Click tab | Switch tab content | Content cross-fades (150ms). Active tab indicator slides (200ms ease). |
| Click "Trigger Scan" | Scan starts. Info banner appears with progress bar. | Banner slides down (200ms). Progress bar animates width (real-time updates). |
| Click "Edit" | Navigates to Settings tab with form fields focused | Tab indicator slides. First field auto-focused. |
| Click "Reconnect" | Opens reconnect flow (Screen 2 variant) | Page transition |
| Click "Delete" in dropdown | Confirmation dialog opens | Dialog fades in with backdrop (200ms). Backdrop: rgba(0,0,0,0.4). |
| Type connection name in delete dialog | Confirm button enables when text matches | Button transitions from disabled to enabled (150ms). |
| Click schema row in Schemas tab | Navigate to Table Detail in Data Catalog | Page transition |
| Click time range toggle on health chart | Chart data updates | Line redraws with 300ms ease transition |
| Hover metric card | Subtle lift effect | box-shadow transition 150ms, translateY -1px |
| Click "View All" on Recent Scans | Tab switches to Scan History | Same as tab click |

### State Variations

#### Healthy Connection (default)
- Status tag: `sds-tag--success` "Active"
- No status banner
- Health chart shows flat, low-latency line
- All features fully functional

#### Degraded Connection
- Status tag: `sds-tag--warning` "Degraded"
- Warning banner visible at top
- Health chart shows intermittent spikes above threshold
- Trigger Scan button remains enabled but tooltip warns: "Scans may take longer due to connectivity issues"

#### Disconnected Connection
- Status tag: `sds-tag--error` "Disconnected"
- Error banner with "Reconnect" button
- Health chart shows gap/interruption
- "Trigger Scan" button disabled with tooltip: "Connection must be restored before scanning"
- Schemas tab shows last-known state with warning: "Data may be stale"

#### Scan In Progress
- Info banner with real-time progress bar and percentage
- "Trigger Scan" button changes to disabled "Scanning..." state
- Recent Scans card shows current scan at top with spinning indicator
- Tab badges may update as new classifications are found

#### First Load After Wizard (no scan history yet)
- Metric cards show "--" for Last Scan and Classification Coverage
- Recent Scans card: empty state — "No scans yet. Your first scan is starting now." (if Save + Start Scan was used)
- Or: "Trigger your first scan to discover and classify data." with primary CTA (if Save Only was used)

### Responsive Behavior

- **< 1200px**: Metric cards go from 4 columns to 2 columns (2x2 grid).
- **< 1024px**: Metric cards go to single column stack.
- **< 768px**: Sidebar collapses. Action buttons in page header stack vertically or collapse into a single "More" dropdown. Tabs become horizontally scrollable.
- Settings form: max-width 640px, centered, naturally responsive.

---

## 9. New Components Needed

The following components are not yet part of Software DS and will need to be designed and built for this flow:

| Component | Used In | Priority | Description |
|-----------|---------|----------|-------------|
| **Data Table** | Screens 1, 4 | Critical | Sortable, selectable rows, row hover, inline actions column, optional grouping headers, pagination. |
| **Form Inputs** | Screens 2, 4 | Critical | Text, password (with visibility toggle), select dropdown. States: default, focus, error, disabled. |
| **Alert Banner** | Screens 2, 4 | Critical | Success, error, warning, info variants. Left border accent. Optional dismiss, optional action button. |
| **Wizard Step Indicator** | Screens 2, 3 | High | 2+ step horizontal progress with connecting lines. States: completed (checkmark), active (filled), upcoming (outlined). |
| **Tree View** | Screens 3, 4 | High | Expandable/collapsible hierarchy with checkboxes. Supports indeterminate state. Database > Schema nesting. |
| **Split Panel Layout** | Screen 3 | High | Two-panel layout with configurable ratio. Optional sticky right panel. Responsive stacking. |
| **Filter Bar** | Screen 1 | Medium | Horizontal row: search input + dropdown filters + toggle buttons. Responsive stacking. |
| **Pagination** | Screens 1, 4 | Medium | Page numbers, previous/next, "Showing X-Y of Z" text. |
| **Confirmation Dialog** | Screen 4 | Medium | Modal overlay with title, description, optional input verification, cancel + confirm buttons. |
| **Switch Toggle** | Screen 4 | Medium | On/off binary toggle for settings. Label left, toggle right. |
| **Tag Input** | Screen 4 | Low | Text input that creates removable chip tags. Autocomplete suggestions. |
| **Skeleton Loader** | Screens 1, 3 | Low | Shimmer/pulse placeholder blocks for loading states. |
| **Toast Notification** | Screens 3, 4 | Low | Temporary notification after save actions. Auto-dismisses after 5 seconds. |

---

## Cross-References

| Connection Point | Target | Mechanism |
|-----------------|--------|-----------|
| Connection List > Connection Detail | Click connection name | `var(--sds-text-link)` styled name acts as navigation link |
| Connection Detail > Data Catalog Table Detail | Click schema/table in Schemas tab | Link navigates to Flow 2 Table Detail screen |
| Schema Selection > Flow 2 (Scanning) | "Save + Start Scan" CTA | Saves connection, triggers scan, redirects to Connection Detail with scan progress |
| Dashboard > Connection List | Dashboard health widget click | Navigates to Connection List, filtered to show problem connections |
| Onboarding (Flow 7) > Add Connection | Flow 7 completion | Pre-selects platform based on signup questionnaire answers |
