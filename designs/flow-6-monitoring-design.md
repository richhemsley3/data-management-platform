# Flow 6: Risk Dashboard & Monitoring -- Design Specification

## Document Overview

**Flow**: Risk Dashboard & Monitoring
**Stage**: Track
**Primary personas**: Marcus (executive), Priya (compliance), Jordan (operations)
**Screens**: 6 total -- Risk Dashboard (Executive), Risk Dashboard (Governance), Risk Dashboard (Operations), Alert Ribbon (global), Reports, Universal Search (overlay)

---

## 1. Feature Requirements

### Problem Statement

Stakeholders across three distinct roles need at-a-glance risk visibility, but each requires fundamentally different information emphasis. A single dense dashboard fails all three audiences. Additionally, critical alerts must persist across page navigation, and users need a fast way to locate any entity in the system without navigating through menus.

### Users & Their Goals

| Persona | Role | Primary Goal on Dashboard |
|---------|------|--------------------------|
| Marcus | Executive / CISO | Board-ready risk posture: score, trend, coverage, compliance summary |
| Priya | Compliance Manager | Classification queue status, regulation gaps, policy coverage, audit trail |
| Jordan | Operations Engineer | Connection health, scan status, freshness, system alerts |

### Success Metrics

- Time to first insight: < 3 seconds from page load (progressive skeleton loading)
- Alert acknowledgment rate: > 90% of alerts addressed within 1 hour
- Dashboard-to-action conversion: > 60% of Quick Action clicks lead to task completion
- Search-to-result: < 500ms for first results after typing stops
- Report scheduling adoption: > 40% of compliance users set up at least one recurring report

### User Stories

1. As Marcus, I want to see my organization's risk score and 30-day trend immediately on login, so I can prepare for board conversations.
2. As Priya, I want to see how many classifications are pending review and which regulations have gaps, so I can prioritize my compliance work.
3. As Jordan, I want to see which connections are unhealthy and which scans are stale, so I can fix infrastructure issues before they affect risk scores.
4. As any user, I want persistent alerts for critical events that follow me across pages, so I never miss a risk increase or scan failure.
5. As any user, I want to press Cmd+K and search for any entity by name, so I can navigate directly without clicking through menus.
6. As Priya, I want to schedule automated compliance reports on a weekly cadence, so my audit trail stays current without manual effort.

---

## 2. Design Rationale

### Decision Table

| Decision | Chosen Approach | Alternatives Considered | Rationale |
|----------|----------------|------------------------|-----------|
| Dashboard views | Toggle tabs (Executive / Governance / Operations) | Separate pages; role-based auto-routing; single dense dashboard | Toggle tabs keep all views at the same URL, preserve shared context (alert ribbon, activity feed), and let any user switch views. Auto-routing would lock users out of cross-role visibility. |
| View toggle pattern | `sds-toggle-tabs` (pill-style) | Page tabs (underline); dropdown selector | Pill-style toggle communicates "same data, different lens" rather than "different sections." It is visually distinct from page-level tabs used elsewhere. |
| Alert persistence | Ribbon below top nav, z-800, pushes content down | Toast notifications; badge count on nav icon; in-page banner | Toasts are transient and easily missed. Badge counts require users to click. A ribbon guarantees visibility across all pages without overlaying content. |
| Search overlay | Cmd+K overlay at z-900 with grouped results | Dedicated search page; sidebar search panel; search in header bar | Overlay preserves context (user stays on current page), matches power-user expectations from tools like VS Code and Slack. Grouped results with type badges reduce cognitive load. |
| Report scheduling | Modal dialog (640px) | Full page; drawer; inline expansion | Modal keeps the user in the Reports context. A full page breaks flow. The form content fits comfortably in 640px without scrolling. |
| Risk score visualization | SVG gauge (semi-circle, 0-100) | Number only; progress bar; radial chart | Gauge provides immediate visual weight and emotional response (red/yellow/green zones). Numbers alone lack urgency. |
| Scan freshness | Heatmap (connections x time buckets) | Table with color-coded cells; bar chart per connection | Heatmap provides at-a-glance pattern recognition across many connections simultaneously. Tables require row-by-row scanning. |

---

## 3. Pattern Recommendations

| Screen | Primary Pattern | Secondary Pattern |
|--------|----------------|-------------------|
| Executive Dashboard | Metric Cards Row + Chart Cards | Quick Actions (CTA list) |
| Governance Dashboard | Data Table with Inline Actions + Metric Cards | Filter Panel (inline bar for decisions log) |
| Operations Dashboard | Data Table + Heatmap Visualization | Filter Panel (status grouping) |
| Alert Ribbon | Global Notification Bar | -- |
| Reports | CRUD Workflow (list + create modal) | Data Table with Inline Actions |
| Universal Search | Global Search (overlay) | -- |

---

## 4. Edge Cases & Considerations

| Category | Scenario | Design Response |
|----------|----------|-----------------|
| Empty state | No data at all (first-time user) | Dashboard replaced by onboarding progress tracker (Flow 7). Show skeleton that transitions to onboarding CTA. |
| Loading | Large dataset, slow API | Skeleton cards matching layout. Score loads first (< 1s), trend (< 2s), detail widgets (< 3s). Progressive disclosure. |
| Stale data | Dashboard data > 24 hours old | Yellow warning banner below view toggle: "Last updated: 26 hours ago" with Refresh button and "Re-scan recommended" CTA. Uses `--sds-status-warning-bg` and `--sds-status-warning-text`. |
| Risk spike | Score jumped 20+ points | Alert ribbon (red): specific cause message. Dashboard gauge shows before/after with highlighted delta arc. |
| Scan failure | Connection scan errored | Alert ribbon (orange): connection name + retry link. Operations view shows failed connection at top of list. |
| Compliance change | Regulation status changed to non-compliant | Alert ribbon (red): regulation name + gap detail link. Governance view highlights affected regulation card. |
| View preference | User always uses one view | Last-used view saved per user in localStorage. Loads by default on next visit. |
| Scale | 50+ connections in operations view | Group by status (error first, degraded, active). Collapse healthy groups by default. Add search/filter bar above table. |
| Report generation | Large report takes > 10 seconds | Show progress indicator in Reports list. Email download link when ready for reports exceeding 30 seconds. |
| Search: no results | Query matches nothing | Empty state: "No results for [query]. Try searching for connections, tables, columns, policies, or regulations." Show recent searches below. |
| Search: too many results | Query is broad | Cap at 10 results per type. Show "Show all N [type] results" link per group to open filtered list view. |
| Alert overflow | 5+ simultaneous alerts | Show most recent/critical alert in ribbon. Add "N more alerts" link that expands to show all. Expandable section uses slide-down animation. |
| Responsive | Tablet width (768-1024px) | Metric cards stack to 2-column grid. Activity feed moves below main content. Heatmap scrolls horizontally. |
| Responsive | Mobile width (< 768px) | Metric cards stack to single column. Toggle tabs become a dropdown selector. Charts simplify to compact sparkline variants. |

---

## 5. Detailed Screen Layouts

---

### Screen 5.1: Risk Dashboard -- Executive View

**Purpose**: Board-ready risk overview for Marcus. Shows the organization's risk posture at a glance with score, trend, coverage, compliance summary, and recommended next actions.

**Entry points**: Login (default landing), sidebar "Dashboard" nav item, view toggle from Governance/Operations.
**Exits to**: Risk Detail (Flow 3), Data Catalog (filtered to unprotected), Regulation Detail, any Quick Action target.

#### Shell & Layout

- **Shell**: Full App Shell (header 56px + sidebar 220px + content area)
- **Grid**: Content area uses a responsive grid
  - Row 1: View toggle bar (full width)
  - Row 2: 3-column metric cards grid (score gauge, trend chart, coverage donut)
  - Row 3: 2-column layout (compliance cards 2/3 width + quick actions 1/3 width)
  - Row 4: Activity feed (full width, collapsible card)
- **Content padding**: 24px

#### Content Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────┐
│ HEADER (56px) — Logo left, [Search icon] [?] [|] [Avatar Name v] right │
├────────┬────────────────────────────────────────────────────────────────┤
│SIDEBAR │ ALERT RIBBON (if active, 40px, z-800) — full content width   │
│ 220px  ├────────────────────────────────────────────────────────────────┤
│        │ Page Header                                                    │
│ Dash   │   Title: "Risk Dashboard"                                     │
│ [act]  │   Actions: [Export v] [Schedule Report]                       │
│        │   Toggle: (Executive) (Governance) (Operations)               │
│ Token  ├────────────────────────────────────────────────────────────────┤
│  Cat   │ ┌─ Score ─────┐  ┌─ 30-Day Trend ──┐  ┌─ Coverage ────┐    │
│  Act   │ │  GAUGE      │  │  LINE CHART      │  │  DONUT CHART  │    │
│  Pol   │ │  72/100     │  │  with event      │  │  78% protected│    │
│        │ │  "Moderate" │  │  markers          │  │  22% exposed  │    │
│ Admin  │ └─────────────┘  └──────────────────┘  └───────────────┘    │
│  Con   ├────────────────────────────────────────────────────────────────┤
│  Usr   │ ┌─ Compliance Summary ────────────┐  ┌─ Quick Actions ──┐   │
│  Dom   │ │ ┌──GDPR──┐ ┌──CCPA──┐ ┌─HIPAA─┐│  │ 1. Review 42     │   │
│        │ │ │Partial │ │Complnt│ │Non-C  ││  │    classifications│   │
│        │ │ │ 3 gaps │ │ 0 gaps│ │5 gaps ││  │ 2. Remediate 5    │   │
│        │ │ └────────┘ └───────┘ └───────┘│  │    critical PII   │   │
│        │ └───────────────────────────────┘  │ 3. Re-scan         │   │
│        │                                     │    Snowflake (32d) │   │
│        │                                     └───────────────────┘   │
│        ├────────────────────────────────────────────────────────────────┤
│        │ ┌─ Activity Feed ──────────────────────────────────────────┐  │
│        │ │ Filter: [All v] [Scans] [Classifications] [Remediations]│  │
│        │ │ ┌ Scan completed · Snowflake Prod · 42 tables · 2m ago ┐│  │
│        │ │ ┌ Classification · SSN detected · users.ssn · 5m ago   ┐│  │
│        │ │ ┌ Policy change · GDPR masking updated · 1h ago        ┐│  │
│        │ │ └────────────────────────────────────── [View all ->]   ┘│  │
│        │ └──────────────────────────────────────────────────────────┘  │
└────────┴────────────────────────────────────────────────────────────────┘
```

#### Component Inventory

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| Header | `/components/header.html` | Top nav bar with logo, search icon (triggers Cmd+K), help, profile |
| Side Navigation | `/components/side-navigation.html` | Sidebar with "Dashboard" as active item |
| Toggle Tabs | `/components/tabs.html` `.sds-toggle-tabs` | Executive / Governance / Operations view switch |
| Cards | `/components/cards.html` `.sds-card` | Containers for gauge, trend, coverage, compliance, quick actions, activity feed |
| Tags | `/components/tags.html` `.sds-tag` | Compliance status tags (success/warning/error), activity type indicators |
| Badges | `/components/tags.html` `.sds-badge` | Count badges on compliance cards (gap counts) |
| Buttons | `/components/buttons.html` | Export (secondary, btn-sm), Schedule Report (primary, btn-sm), Quick Action CTAs (tertiary) |
| **New: Risk Gauge** | Custom SVG component | Semi-circle gauge, 0-100, animated fill |
| **New: Trend Line Chart** | Custom SVG component | 30-day line chart with event markers |
| **New: Coverage Donut** | Custom SVG component | Two-segment donut (protected/unprotected) |
| **New: Activity Feed** | Custom component | Time-ordered list with type icons, live-updating via WebSocket |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Page background | background | `var(--sds-bg-page)` |
| Content area background | background | `var(--sds-bg-page)` |
| Card container | background | `var(--sds-bg-card)` |
| Card container | border | `1px solid var(--sds-border-default)` |
| Card container | border-radius | `8px` |
| Card header title | color | `var(--sds-text-primary)` |
| Card header title | font | `14px / 600` |
| Card header border | border-bottom | `1px solid var(--sds-border-subtle)` |
| Card body padding | padding | `16px 20px` |
| Page title "Risk Dashboard" | color | `var(--sds-text-primary)` |
| Page title | font | `24px / 600` |
| Metric label (e.g., "Risk Score") | color | `var(--sds-text-secondary)` |
| Metric label | font | `13px / 400` |
| Metric value (e.g., "72") | color | `var(--sds-text-primary)` |
| Metric value | font | `32px / 600` |
| Toggle tabs container | background | `var(--sds-bg-subtle)` |
| Toggle tab (active) | background | `var(--sds-color-white)` |
| Toggle tab (active) | color | `var(--sds-text-primary)` |
| Toggle tab (active) | font-weight | `600` |
| Toggle tab (active) | box-shadow | `0 1px 3px rgba(0,0,0,0.08)` |
| Toggle tab (inactive) | color | `var(--sds-text-secondary)` |
| Toggle tab (inactive) | font-weight | `500` |
| Compliance tag: Compliant | class | `.sds-tag .sds-tag--success` |
| Compliance tag: Partial | class | `.sds-tag .sds-tag--warning` |
| Compliance tag: Non-compliant | class | `.sds-tag .sds-tag--error` |
| Gap count badge | class | `.sds-badge .sds-badge--error` |
| Quick action link text | color | `var(--sds-text-link)` |
| Quick action description | color | `var(--sds-text-secondary)` |
| Activity feed filter (active) | background | `var(--sds-interactive-primary-subtle)` |
| Activity feed filter (active) | color | `var(--sds-interactive-primary)` |
| Activity timestamp | color | `var(--sds-text-tertiary)` |
| Activity timestamp | font | `12px / 400` |
| Export button | class | `.btn .btn-secondary .btn-sm` |
| Schedule Report button | class | `.btn .btn-primary .btn-sm` |
| Metric cards grid gap | gap | `16px` |
| Section gap | margin-bottom | `32px` |
| Between sub-sections | margin-bottom | `24px` |

#### Risk Score Gauge -- SVG Specification

```
Type: Semi-circle arc gauge
Dimensions: 200px x 130px (including label below)
Arc: 180-degree sweep, 12px stroke width, rounded caps
Track (background): var(--sds-color-warm-gray-100) — #EBE6DD
Fill zones:
  0-30:   var(--sds-status-error-strong) — #CF6253
  31-60:  var(--sds-status-warning-strong) — #EBCE2D
  61-80:  var(--sds-color-yellow-300) — #C4AA25 (moderate)
  81-100: var(--sds-status-success-strong) — #7A9A01
Center number: 32px / 700 weight, var(--sds-text-primary)
Label below: 13px / 500, var(--sds-text-secondary), e.g., "Moderate Risk"
Animation: Arc fills from 0 to value over 800ms, ease-out
Delta indicator (when score changed):
  Arrow up/down icon, 12px
  Positive change (risk up): var(--sds-status-error-text)
  Negative change (risk down): var(--sds-status-success-text)
  Format: "+5" or "-3" next to the score
```

#### 30-Day Trend Chart -- SVG Specification

```
Type: Line chart with area fill
Dimensions: Fluid width (fills card), 180px height
X-axis: 30 days, labels at day 1, 8, 15, 22, 30
  Label font: 11px / 400, var(--sds-text-tertiary)
Y-axis: 0-100, labels at 0, 25, 50, 75, 100
  Label font: 11px / 400, var(--sds-text-tertiary)
  Grid lines: 1px, var(--sds-border-subtle), dashed
Line: 2px stroke, var(--sds-interactive-primary) — #013D5B
Area fill: linear-gradient(to bottom, rgba(1,61,91,0.12), rgba(1,61,91,0))
Event markers:
  Circle: 6px diameter, var(--sds-color-white) fill, 2px stroke var(--sds-interactive-primary)
  Hover: tooltip with event description, date
  Tooltip bg: var(--sds-text-primary) — #1C1A17
  Tooltip text: 12px / 500, var(--sds-color-white)
  Tooltip padding: 6px 10px, border-radius 6px
```

#### Protection Coverage Donut -- SVG Specification

```
Type: Donut chart (single ring)
Dimensions: 160px x 160px
Ring width: 24px
Protected segment: var(--sds-status-success-strong) — #7A9A01
Unprotected segment: var(--sds-status-error-bg) — #FFEEEB with 2px stroke var(--sds-color-red-200)
Center text:
  Percentage: 24px / 700, var(--sds-text-primary)
  Label: 12px / 400, var(--sds-text-secondary), "Protected"
Legend below chart:
  Dot + label format, 12px / 400
  Protected: green-400 dot + count
  Unprotected: red-200 dot + count
Animation: Segments animate from 0 to value over 600ms, ease-out
```

#### Interaction Details

| Element | Trigger | Behavior |
|---------|---------|----------|
| Risk score gauge | Click | Navigate to Risk Detail (Flow 3) |
| Risk score gauge | Hover | Show tooltip: "Click to view risk breakdown" |
| Trend chart event marker | Hover | Show tooltip with event name, date, score change |
| Trend chart | Click on data point | Navigate to Risk Detail filtered to that date |
| Coverage donut | Click | Navigate to Data Catalog filtered to unprotected columns |
| Compliance card | Click | Navigate to Regulation Detail for that regulation |
| Quick Action item | Click | Navigate to target flow with context (e.g., Review Queue filtered to pending) |
| Quick Action item | Hover | Background changes to `var(--sds-bg-subtle)`, cursor pointer |
| Activity feed item | Click | Navigate to entity detail |
| Activity feed filter chip | Click | Toggle filter on/off. Active: `--sds-interactive-primary-subtle` bg. Multiple can be active. |
| Export button | Click | Dropdown: [PDF] [CSV] [Email]. Dropdown bg: `var(--sds-bg-elevated)`, shadow: `0 4px 12px rgba(0,0,0,0.1)` |
| View toggle tab | Click | Switch dashboard view with 200ms crossfade transition |
| Time range filter | Click | Dropdown: Last 7 days, Last 30 days, Last 90 days, Custom range |

#### State Variations

**Loading state (skeleton)**:
- Gauge card: circular skeleton pulse (180px diameter)
- Trend card: rectangular skeleton pulse (full width x 180px height)
- Coverage card: circular skeleton pulse (160px diameter)
- Compliance cards: 3 rectangular skeleton pulses in a row
- Quick actions: 3 line skeleton pulses
- Skeleton color: `var(--sds-bg-subtle)` with shimmer animation
- Shimmer: linear-gradient sweep, 1.5s duration, infinite loop
- Load order: Score (< 1s) > Trend (< 2s) > Coverage (< 2s) > Compliance (< 3s) > Activity (< 3s)

**Empty state** (no data):
- Replaced by onboarding dashboard (Flow 7)
- Centered illustration (48px icon, `var(--sds-text-disabled)`)
- Title: 18px / 600, "Connect your first data source"
- Description: 14px, `var(--sds-text-secondary)`, max-width 420px
- CTA: Primary button "Get Started"

**Error state** (API failure):
- Card shows error state with centered content
- Icon: alert-triangle, 32px, `var(--sds-status-error-text)`
- Message: 14px, `var(--sds-text-secondary)`, "Unable to load risk data"
- CTA: Secondary button "Retry"

#### Responsive Behavior

- **>= 1280px**: 3-column metric cards, 2-column compliance + quick actions
- **1024-1279px**: 3-column metric cards (compressed), compliance cards wrap to 2 rows
- **768-1023px**: 2-column metric cards (gauge + trend on row 1, coverage on row 2 full width). Quick actions move below compliance (full width). Sidebar collapses to 56px.
- **< 768px**: Single column stack. Toggle tabs become a dropdown selector. Gauge and donut render at 120px. Sidebar hidden behind hamburger menu.

---

### Screen 5.2: Risk Dashboard -- Governance View

**Purpose**: Compliance and classification focus for Priya. Surfaces pending classification reviews, regulation compliance gaps, policy coverage, and an audit trail of recent decisions.

**Entry points**: View toggle from Executive/Operations.
**Exits to**: Classification Review Queue (Flow 2), Regulation Detail, Reports.

#### Shell & Layout

- **Shell**: Full App Shell (same as Executive)
- **Grid**: Content area
  - Row 1: View toggle bar (shared with Executive)
  - Row 2: 4-column metric summary cards
  - Row 3: 2-column layout (regulation compliance cards 2/3 + quick actions 1/3)
  - Row 4: 2-column layout (policy coverage matrix 1/2 + recent decisions log 1/2)
  - Row 5: Activity feed (full width, same component as Executive)

#### Content Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────┐
│ HEADER (56px)                                                           │
├────────┬────────────────────────────────────────────────────────────────┤
│SIDEBAR │ ALERT RIBBON (if active)                                      │
│        ├────────────────────────────────────────────────────────────────┤
│        │ Page Header                                                    │
│        │   Title: "Risk Dashboard"                                     │
│        │   Actions: [Export v] [Schedule Report]                       │
│        │   Toggle: (Executive) [Governance] (Operations)               │
│        ├────────────────────────────────────────────────────────────────┤
│        │ ┌──Pending──┐ ┌──High Conf─┐ ┌──Low Conf──┐ ┌──Policies──┐ │
│        │ │ Review    │ │ Auto-      │ │ Needs      │ │ Active     │ │
│        │ │ Queue     │ │ approved   │ │ Review     │ │ Policies   │ │
│        │ │ 42        │ │ 128        │ │ 42         │ │ 8 / 12     │ │
│        │ └───────────┘ └────────────┘ └────────────┘ └────────────┘ │
│        ├────────────────────────────────────────────────────────────────┤
│        │ ┌─ Regulation Compliance ──────────┐  ┌─ Quick Actions ──┐   │
│        │ │ ┌─────────────────────────────┐  │  │                   │   │
│        │ │ │ GDPR          [Partial]     │  │  │ 1. Review 42      │   │
│        │ │ │ 3 gaps · Last audit: Mar 1  │  │  │    pending items  │   │
│        │ │ │ Articles: 5, 6, 17, 25      │  │  │                   │   │
│        │ │ │ [View gaps ->]              │  │  │ 2. Fix 3 GDPR     │   │
│        │ │ ├─────────────────────────────┤  │  │    gaps            │   │
│        │ │ │ CCPA         [Compliant]    │  │  │                   │   │
│        │ │ │ 0 gaps · Last audit: Mar 5  │  │  │ 3. Generate       │   │
│        │ │ │ [View details ->]           │  │  │    compliance rpt │   │
│        │ │ ├─────────────────────────────┤  │  │                   │   │
│        │ │ │ HIPAA      [Non-compliant]  │  │  └───────────────────┘   │
│        │ │ │ 5 gaps · Last audit: Feb 20 │  │                          │
│        │ │ │ [View gaps ->]              │  │                          │
│        │ │ └─────────────────────────────┘  │                          │
│        │ └──────────────────────────────────┘                          │
│        ├────────────────────────────────────────────────────────────────┤
│        │ ┌─ Policy Coverage ───────────┐ ┌─ Recent Decisions ───────┐ │
│        │ │ POLICY        SCOPE   STATUS│ │ ┌ SSN masking approved   │ │
│        │ │ PII Masking   12 col  Active│ │ │ by Priya · 2h ago      │ │
│        │ │ Email Encrypt 8 col   Active│ │ ├ CC# rejected (low conf)│ │
│        │ │ SSN Tokenize  3 col   Draft │ │ │ by Priya · 3h ago      │ │
│        │ │ Phone Hash    5 col   Active│ │ ├ Address auto-approved  │ │
│        │ │ [View all policies ->]      │ │ │ system · 4h ago        │ │
│        │ └─────────────────────────────┘ └──────────────────────────┘ │
│        ├────────────────────────────────────────────────────────────────┤
│        │ Activity Feed (same component as Executive view)              │
└────────┴────────────────────────────────────────────────────────────────┘
```

#### Component Inventory

All components from Executive view plus:

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| Cards (metric) | `.sds-card` | 4 summary metrics in a row |
| Cards (regulation) | `.sds-card` with bordered header | Regulation compliance detail cards, stacked vertically |
| Tags | `.sds-tag--success`, `.sds-tag--warning`, `.sds-tag--error` | Compliance status per regulation |
| Badges | `.sds-badge--error` | Gap count per regulation |
| Data table (mini) | Custom table following DS patterns | Policy coverage matrix, recent decisions log |
| Dots | `.sds-dot` | Status indicators in policy coverage table |

#### Token References

All Executive view tokens apply, plus:

| Element | Property | Token |
|---------|----------|-------|
| Metric card value (pending count) | color | `var(--sds-status-warning-text)` when > 0 |
| Metric card value (healthy) | color | `var(--sds-status-success-text)` |
| Regulation card | background | `var(--sds-bg-card)` |
| Regulation card gap count | class | `.sds-badge .sds-badge--error` when gaps > 0 |
| Regulation card "View gaps" link | color | `var(--sds-text-link)` |
| Policy table header | background | `var(--sds-bg-subtle)` |
| Policy table header text | color | `var(--sds-text-secondary)` |
| Policy table header text | font | `12px / 600` |
| Policy table row border | border-bottom | `1px solid var(--sds-border-subtle)` |
| Policy status: Active | class | `.sds-tag .sds-tag--success` |
| Policy status: Draft | class | `.sds-tag .sds-tag--neutral` |
| Policy status: Inactive | class | `.sds-tag .sds-tag--warning` |
| Decision log: approved | icon color | `var(--sds-status-success-text)` |
| Decision log: rejected | icon color | `var(--sds-status-error-text)` |
| Decision log: auto-approved | icon color | `var(--sds-status-info-text)` |
| Decision log timestamp | color | `var(--sds-text-tertiary)` |
| Decision log user name | color | `var(--sds-text-primary)` |
| Decision log user name | font-weight | `500` |

#### Interaction Details

| Element | Trigger | Behavior |
|---------|---------|----------|
| Pending Review metric card | Click | Navigate to Classification Review Queue (Flow 2) |
| Regulation card | Click anywhere | Navigate to Regulation Detail |
| Regulation "View gaps" link | Click | Navigate to Regulation Detail, gaps tab active |
| Policy row | Click | Navigate to Policy Detail |
| Recent decision row | Click | Navigate to Classification Detail for that item |
| Quick Action: review pending | Click | Navigate to Review Queue filtered to pending |
| Quick Action: fix gaps | Click | Navigate to Remediation (Flow 4) filtered to GDPR |
| Quick Action: generate report | Click | Open Report Scheduling modal with Compliance Audit template pre-selected |

#### State Variations

Same skeleton and error patterns as Executive view. Additionally:

**Empty classification queue**:
- Pending count shows "0" in `var(--sds-status-success-text)`
- Card shows checkmark icon and "All caught up" message

**No regulations configured**:
- Regulation section shows empty state card
- "No regulations configured. Add your first compliance framework."
- CTA: "Add Regulation" (primary button)

---

### Screen 5.3: Risk Dashboard -- Operations View

**Purpose**: Infrastructure health monitoring for Jordan. Shows connection status, scan progress, scan freshness across all connections, and system alerts.

**Entry points**: View toggle from Executive/Governance.
**Exits to**: Connection Detail (Flow 1), Scan Progress (Flow 2).

#### Shell & Layout

- **Shell**: Full App Shell (same shell)
- **Grid**: Content area
  - Row 1: View toggle bar (shared)
  - Row 2: 4-column metric summary cards
  - Row 3: Connection health table (full width card)
  - Row 4: 2-column layout (scan freshness heatmap 2/3 + quick actions 1/3)
  - Row 5: System alerts list (full width card)

#### Content Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────┐
│ HEADER (56px)                                                           │
├────────┬────────────────────────────────────────────────────────────────┤
│SIDEBAR │ ALERT RIBBON (if active)                                      │
│        ├────────────────────────────────────────────────────────────────┤
│        │ Page Header                                                    │
│        │   Title: "Risk Dashboard"                                     │
│        │   Actions: [Export v] [Schedule Report]                       │
│        │   Toggle: (Executive) (Governance) [Operations]               │
│        ├────────────────────────────────────────────────────────────────┤
│        │ ┌─Connections─┐ ┌─Active Scns┐ ┌─Stale (30d+)┐ ┌─Failures─┐│
│        │ │ Total       │ │ Running    │ │ Overdue     │ │ Last 24h │ │
│        │ │ 24          │ │ 3          │ │ 5           │ │ 2        │ │
│        │ │ 22 healthy  │ │ 1 queued   │ │             │ │          │ │
│        │ └─────────────┘ └────────────┘ └─────────────┘ └──────────┘ │
│        ├────────────────────────────────────────────────────────────────┤
│        │ ┌─ Connection Health ──────────────────────────────────────┐  │
│        │ │ [Search connections...] [Filter: All v] [Group by: Status]│ │
│        │ │ ┌──────────────────────────────────────────────────────┐ │  │
│        │ │ │ NAME          PLATFORM   STATUS    LAST SCAN  TABLES │ │  │
│        │ │ │ Snowflake Prd Snowflake  ● Error   2h ago     142   │ │  │
│        │ │ │ Postgres Dev  PostgreSQL ● Degraded 1d ago     38   │ │  │
│        │ │ │ ─── Healthy (20) ──────────────── [Expand v] ────── │ │  │
│        │ │ │ BigQuery Prod BigQuery   ● Active  30m ago     89   │ │  │
│        │ │ └──────────────────────────────────────────────────────┘ │  │
│        │ └──────────────────────────────────────────────────────────┘  │
│        ├────────────────────────────────────────────────────────────────┤
│        │ ┌─ Scan Freshness Heatmap ─────────────┐ ┌─ Quick Actions ┐  │
│        │ │           <24h  1-7d  7-14d 14-30d 30d+│ │                │  │
│        │ │ Snowflake  [##]  [  ]  [  ]  [  ]  [  ]│ │ 1. Reconnect   │  │
│        │ │ Postgres   [  ]  [##]  [  ]  [  ]  [  ]│ │    Snowflake   │  │
│        │ │ BigQuery   [##]  [  ]  [  ]  [  ]  [  ]│ │                │  │
│        │ │ Redshift   [  ]  [  ]  [  ]  [##]  [  ]│ │ 2. Re-scan     │  │
│        │ │ S3 Bucket  [  ]  [  ]  [  ]  [  ]  [##]│ │    Redshift    │  │
│        │ │                                         │ │                │  │
│        │ │ Legend: [■ Fresh] [■ Aging] [■ Stale]  │ │ 3. View 2      │  │
│        │ │         [■ Critical]                    │ │    failures    │  │
│        │ └─────────────────────────────────────────┘ └────────────────┘ │
│        ├────────────────────────────────────────────────────────────────┤
│        │ ┌─ System Alerts ──────────────────────────────────────────┐  │
│        │ │ ┌ ▲ Scan failed · Snowflake Prod · timeout · 2h ago    ┐│  │
│        │ │ │   [Retry] [View details]                              ││  │
│        │ │ ├ ▲ Schema drift · Postgres Dev · 3 new columns · 1d   ┐│  │
│        │ │ │   [Review changes] [Dismiss]                          ││  │
│        │ │ └────────────────────────────────────────────────────────┘│  │
│        │ └──────────────────────────────────────────────────────────┘  │
└────────┴────────────────────────────────────────────────────────────────┘
```

#### Scan Freshness Heatmap -- SVG Specification

```
Type: Grid heatmap (CSS Grid or SVG rect elements)
Dimensions: Fluid width (fills 2/3 card), auto height based on connection count
Y-axis: Connection names, grouped by platform
  Label font: 13px / 400, var(--sds-text-primary)
  Group header font: 11px / 600, var(--sds-text-tertiary), uppercase
  Platform icon: 16px, inline before group header
X-axis: Time buckets
  Headers: "<24h", "1-7d", "7-14d", "14-30d", "30d+"
  Header font: 11px / 600, var(--sds-text-tertiary)
Cell dimensions: 48px x 32px, 2px gap between cells, 4px border-radius
Cell colors:
  Fresh (< 7 days):    var(--sds-status-success-bg) — #F4FAEB, border: 1px solid var(--sds-color-green-200)
  Aging (7-14 days):   var(--sds-status-warning-bg) — #FCF9D9, border: 1px solid var(--sds-color-yellow-200)
  Stale (14-30 days):  var(--sds-color-yellow-100) — #F7EC88, border: 1px solid var(--sds-color-yellow-300)
  Critical (30+ days): var(--sds-status-error-bg) — #FFEEEB, border: 1px solid var(--sds-color-red-200)
  No data:             var(--sds-bg-subtle) — #F4F1EB, border: 1px solid var(--sds-border-subtle)
Cell hover:
  Darken cell background slightly (mix 10% black)
  Show tooltip:
    Background: var(--sds-text-primary) — #1C1A17
    Text: 12px / 400, var(--sds-color-white)
    Padding: 8px 12px, border-radius: 6px
    Content: "Last scan: Mar 12, 9:42 AM\n42 tables · 18 sensitive columns"
Cell click: Navigate to Connection Detail for that connection
Legend:
  Positioned below heatmap, left-aligned
  Format: colored square (12px) + label (12px / 400, var(--sds-text-secondary))
  Items: Fresh, Aging, Stale, Critical
  Gap between legend items: 16px
```

#### Component Inventory

All shared components plus:

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| Cards (metric) | `.sds-card` | 4 summary metric cards |
| Data table | DS table patterns | Connection health table with status dots, sortable columns |
| Dots | `.sds-dot` | Connection status: `.sds-dot--success` (Active), `.sds-dot--warning` (Degraded), `.sds-dot--error` (Error) |
| Tags | `.sds-tag` | Scan status tags |
| **New: Heatmap** | Custom SVG/CSS Grid component | Scan freshness visualization |
| **New: System Alert Item** | Custom component | Alert with icon, message, timestamp, action buttons |

#### Token References (Operations-specific)

| Element | Property | Token |
|---------|----------|-------|
| Connection table header | background | `var(--sds-bg-subtle)` |
| Connection table header text | color | `var(--sds-text-secondary)` |
| Connection table header text | font | `12px / 600` |
| Connection table row hover | background | `var(--sds-color-warm-gray-050)` |
| Connection table row border | border-bottom | `1px solid var(--sds-border-subtle)` |
| Connection table cell text | color | `var(--sds-text-secondary)` |
| Connection table cell text | font | `13px / 400` |
| Connection name (link) | color | `var(--sds-text-link)` |
| Status dot: Active | class | `.sds-dot .sds-dot--success` |
| Status dot: Degraded | class | `.sds-dot .sds-dot--warning` |
| Status dot: Error | class | `.sds-dot .sds-dot--error` |
| Grouped section header ("Healthy (20)") | color | `var(--sds-text-tertiary)` |
| Grouped section header | font | `12px / 600` |
| Grouped section header | border | `1px solid var(--sds-border-subtle)` top and bottom |
| Stale metric card value | color | `var(--sds-status-warning-text)` |
| Failure metric card value | color | `var(--sds-status-error-text)` |
| System alert: error icon | color | `var(--sds-status-error-text)` |
| System alert: warning icon | color | `var(--sds-status-warning-text)` |
| System alert background | background | `var(--sds-bg-card)` |
| System alert border-left (error) | border-left | `3px solid var(--sds-status-error-strong)` |
| System alert border-left (warning) | border-left | `3px solid var(--sds-status-warning-strong)` |
| System alert message | color | `var(--sds-text-primary)` |
| System alert message | font | `13px / 500` |
| System alert detail | color | `var(--sds-text-secondary)` |
| System alert detail | font | `12px / 400` |
| System alert timestamp | color | `var(--sds-text-tertiary)` |
| Retry button | class | `.btn .btn-secondary .btn-sm` |
| View details link | class | `.btn .btn-tertiary .btn-sm` |

#### Interaction Details

| Element | Trigger | Behavior |
|---------|---------|----------|
| Connection row | Click | Navigate to Connection Detail (Flow 1) |
| Connection row | Hover | Row background: `var(--sds-color-warm-gray-050)` |
| Healthy group header | Click | Expand/collapse group. Chevron rotates 90 degrees over 200ms. |
| Heatmap cell | Click | Navigate to Connection Detail for that connection |
| Heatmap cell | Hover | Show tooltip with last scan date, table count, sensitive column count |
| System alert "Retry" | Click | Trigger re-scan. Button shows loading spinner. Alert updates on completion. |
| System alert "Dismiss" | Click | Alert fades out (200ms opacity transition), removed from list |
| Quick Action: reconnect | Click | Navigate to Connection Detail with reconnect modal open |
| Quick Action: re-scan | Click | Trigger scan and navigate to Scan Progress (Flow 2) |
| Quick Action: view failures | Click | Scroll to System Alerts section, highlight failure entries |
| Search connections input | Type | Filter connection table in real-time (debounced 200ms) |
| Filter dropdown | Click | Options: All, Active, Degraded, Error. Filters table rows. |
| Group by dropdown | Click | Options: Status (default), Platform, Last Scan Date. Regroups table. |

#### State Variations

**No connections**:
- Connection health section shows empty state
- "No data sources connected. Add your first connection to start monitoring."
- CTA: "Add Connection" primary button

**All connections healthy**:
- Failures metric card shows "0" in `var(--sds-status-success-text)` with checkmark icon
- System alerts card shows: "No active alerts" with green checkmark

---

### Screen 5.4: Alert Ribbon (Global Component)

**Purpose**: Persistent, cross-page notification bar that appears below the header when critical events occur. Ensures alerts are visible regardless of which page the user is on.

**Entry points**: Auto-triggered by system events (risk increase, scan failure, compliance change, pending approvals).
**Exits to**: Varies by alert type (Risk Detail, Connection Detail, Regulation Detail, Approval Review).

#### Shell & Layout

- **Position**: Below header (56px), above sidebar + content area
- **Z-index**: `z-800` (above sidebar z-600, below search overlay z-900)
- **Behavior**: Pushes content down (not overlay). Content area adjusts height.
- **Width**: Full viewport width (spans both sidebar and content area)
- **Height**: 40px (single alert), expands to accommodate multiple alerts

#### Content Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────┐
│ HEADER (56px, z-700)                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│ ALERT RIBBON (40px, z-800)                                              │
│ [Icon] Risk score increased by 12 points (Critical PII exposed)         │
│        · 5 minutes ago · [View Details ->]                    [x close] │
├────────┬────────────────────────────────────────────────────────────────┤
│SIDEBAR │ Content area (pushed down by ribbon height)                   │
│        │                                                                │
```

**Multi-alert expanded state**:
```
┌─────────────────────────────────────────────────────────────────────────┐
│ ALERT RIBBON                                                            │
│ [!] Risk score increased by 12 points · 5m ago · [View ->]     [x]     │
│ [!] Scan failed: Snowflake Prod · timeout · 2h ago · [Retry ->][x]     │
│ [!] HIPAA status changed to Non-compliant · 1h ago · [View ->] [x]     │
│                                                     [2 more alerts v]   │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Component Inventory

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| **New: Alert Ribbon** | Custom global component | Persistent notification bar |
| Buttons | `.btn .btn-tertiary .btn-sm` | "View Details" action link |
| Icon Button | `.btn .btn-tertiary .btn-sm .btn-icon-only` | Close/dismiss button |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| **Critical alert (risk increase, compliance failure)** | | |
| Background | background | `var(--sds-status-error-bg)` -- #FFEEEB |
| Left accent border | border-left | `4px solid var(--sds-status-error-strong)` -- #CF6253 |
| Icon | color | `var(--sds-status-error-text)` -- #BF5547 |
| Message text | color | `var(--sds-text-primary)` -- #1C1A17 |
| Message text | font | `13px / 500` |
| Timestamp | color | `var(--sds-text-tertiary)` |
| Timestamp | font | `12px / 400` |
| Action link | color | `var(--sds-text-link)` -- #013D5B |
| Dismiss button icon | color | `var(--sds-text-secondary)` |
| **Warning alert (scan failure, degraded connection)** | | |
| Background | background | `var(--sds-status-warning-bg)` -- #FCF9D9 |
| Left accent border | border-left | `4px solid var(--sds-status-warning-strong)` -- #EBCE2D |
| Icon | color | `var(--sds-status-warning-text)` -- #8A7515 |
| **Info alert (pending approvals, scheduled maintenance)** | | |
| Background | background | `var(--sds-status-info-bg)` -- #EBF4F5 |
| Left accent border | border-left | `4px solid var(--sds-interactive-primary)` -- #013D5B |
| Icon | color | `var(--sds-status-info-text)` -- #0C4A69 |
| **Ribbon container** | | |
| Ribbon height | height | `40px` per alert |
| Ribbon padding | padding | `0 20px` (matches header padding) |
| Ribbon layout | display | `flex`, `align-items: center`, `gap: 8px` |
| Ribbon separator | border-bottom | `1px solid var(--sds-border-subtle)` between stacked alerts |
| "N more alerts" link | color | `var(--sds-text-link)` |
| "N more alerts" link | font | `12px / 500` |

#### Interaction Details

| Element | Trigger | Behavior |
|---------|---------|----------|
| Alert ribbon | Appears | Slide-down animation: 300ms, ease-out. Content below shifts down. |
| Action link ("View Details") | Click | Navigate to source entity (Risk Detail, Connection Detail, etc.) with context. |
| Dismiss button (x) | Click | Alert fades out (200ms), ribbon collapses (200ms). If last alert, ribbon fully removes and content shifts up. |
| "N more alerts" | Click | Ribbon expands to show all alerts. Slide-down animation 200ms. |
| Alert auto-resolution | System | When underlying issue resolves (e.g., scan succeeds after failure), alert fades out automatically with a brief "Resolved" state (green bg, 2s visible, then removes). |
| Ribbon on page navigation | Navigate | Ribbon persists. State stored in global application state (not page-level). |

#### State Variations

**No alerts**: Ribbon is not rendered. Content area starts at normal position below header.

**Single alert**: 40px ribbon, single row.

**Multiple alerts (2-3)**: All visible, stacked. Each 40px. Content pushed down accordingly.

**Many alerts (4+)**: Show top 3, then "N more alerts" expandable link. Expanded shows all.

**Alert resolved**: Brief transition state -- background changes to `var(--sds-status-success-bg)`, message prefix changes to "Resolved:", holds for 2 seconds, then fades out.

#### Responsive Behavior

- **>= 768px**: Full message + timestamp + action link + dismiss on one row
- **< 768px**: Message truncated with ellipsis. Action link becomes icon-only. Timestamp hidden. Tap ribbon to expand full message.

---

### Screen 5.5: Reports

**Purpose**: Generate, schedule, and manage risk and compliance reports. Provides both on-demand generation and automated recurring delivery.

**Entry points**: Dashboard "Schedule Report" button, sidebar "Reports" nav item (under administration group), Dashboard export actions.
**Exits to**: PDF/Email delivery, back to Dashboard.

#### Shell & Layout

- **Shell**: Full App Shell
- **Grid**: Content area
  - Page header with title and "Create Report" action
  - Page tabs: Scheduled | Generated | Templates
  - Tab content area

#### Content Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────┐
│ HEADER (56px)                                                           │
├────────┬────────────────────────────────────────────────────────────────┤
│SIDEBAR │ Page Header                                                    │
│        │   Title: "Reports"                                            │
│        │   Actions: [+ Create Report (primary)]                        │
│        ├────────────────────────────────────────────────────────────────┤
│        │ Tabs: [Scheduled] | Generated | Templates                     │
│        ├────────────────────────────────────────────────────────────────┤
│        │ ┌─ Scheduled Reports Table ────────────────────────────────┐  │
│        │ │ REPORT NAME     TEMPLATE       FREQUENCY  NEXT RUN  ACTS│  │
│        │ │ Weekly GDPR     Compliance     Weekly     Mar 17    [..]│  │
│        │ │   Recipients: priya@co, marcus@co                        │  │
│        │ │ Daily Risk      Exec Summary   Daily      Mar 15    [..]│  │
│        │ │   Recipients: marcus@co                                  │  │
│        │ │ Monthly Full    Risk Trend     Monthly    Apr 1     [..]│  │
│        │ │   Recipients: team-leads@co                              │  │
│        │ └──────────────────────────────────────────────────────────┘  │
│        │                                                                │
│        │ --- "Generated" tab content ---                               │
│        │ ┌─ Generated Reports Table ────────────────────────────────┐  │
│        │ │ REPORT NAME     GENERATED      BY        FORMAT    ACTS  │  │
│        │ │ Exec Summary    Mar 14, 9am    Marcus    PDF     [DL][.]│  │
│        │ │ Compliance Aud  Mar 10, 2pm    Priya     PDF     [DL][.]│  │
│        │ │ Risk Trend      Mar 7, 11am    System    CSV     [DL][.]│  │
│        │ └──────────────────────────────────────────────────────────┘  │
└────────┴────────────────────────────────────────────────────────────────┘
```

#### Report Scheduling Modal -- Specification

```
Trigger: "Create Report" button or "Schedule Report" from dashboard
Type: Modal dialog (centered, z-1000)
Width: 640px
Max height: 80vh (scrollable body if needed)
Backdrop: rgba(0, 0, 0, 0.5)

┌─ Schedule Report ──────────────────────────────────────┐
│ [x close]                                               │
│                                                         │
│ Report Name                                             │
│ [Weekly GDPR Compliance Report_______________]          │
│                                                         │
│ Template                                                │
│ [v Executive Summary                        ]           │
│   Options: Executive Summary, Compliance Audit,         │
│            Risk Trend, Custom                           │
│                                                         │
│ Frequency                                               │
│ ( ) Daily   (x) Weekly   ( ) Monthly                    │
│                                                         │
│ Day & Time                                              │
│ [v Monday] at [v 9:00 AM]                              │
│                                                         │
│ Recipients                                              │
│ [priya@company.com] [x]  [marcus@company.com] [x]      │
│ [Add recipient... (autocomplete)______________]         │
│                                                         │
│ Format                                                  │
│ (x) PDF   ( ) CSV                                       │
│                                                         │
│ ┌─ Next 3 scheduled dates ─────────────────────┐       │
│ │ 1. Monday, March 17, 2026 at 9:00 AM         │       │
│ │ 2. Monday, March 24, 2026 at 9:00 AM         │       │
│ │ 3. Monday, March 31, 2026 at 9:00 AM         │       │
│ └───────────────────────────────────────────────┘       │
│                                                         │
│                          [Cancel (secondary)] [Save (primary)]│
└─────────────────────────────────────────────────────────┘
```

#### Component Inventory

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| Header | `/components/header.html` | Top nav |
| Side Navigation | `/components/side-navigation.html` | Sidebar |
| Page Tabs | `/components/tabs.html` `.sds-tabs` | Scheduled / Generated / Templates |
| Cards | `.sds-card` | Table containers |
| Buttons | `.btn .btn-primary .btn-md` | "Create Report" |
| Buttons | `.btn .btn-secondary .btn-sm` | Cancel, Download |
| Buttons | `.btn .btn-tertiary .btn-sm` | Row actions (Edit, Delete) |
| Buttons | `.btn .btn-danger-outline .btn-sm` | Delete confirmation |
| Tags | `.sds-tag` | Format tags (PDF, CSV), frequency tags |
| **New: Schedule Modal** | Custom modal component | Report scheduling form |
| **New: Recipient Input** | Custom component | Email autocomplete with team member suggestions |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Modal backdrop | background | `rgba(0, 0, 0, 0.5)` |
| Modal container | background | `var(--sds-bg-elevated)` |
| Modal container | border-radius | `12px` |
| Modal container | box-shadow | `0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)` |
| Modal header title | color | `var(--sds-text-primary)` |
| Modal header title | font | `18px / 600` |
| Modal header padding | padding | `20px 24px` |
| Modal header | border-bottom | `1px solid var(--sds-border-subtle)` |
| Modal body padding | padding | `24px` |
| Modal footer padding | padding | `16px 24px` |
| Modal footer | border-top | `1px solid var(--sds-border-subtle)` |
| Modal footer | display | `flex`, `justify-content: flex-end`, `gap: 8px` |
| Form field label | color | `var(--sds-text-primary)` |
| Form field label | font | `13px / 500` |
| Form field label | margin-bottom | `4px` |
| Form input border | border | `1px solid var(--sds-border-default)` |
| Form input border (focus) | border | `1px solid var(--sds-border-focus)` |
| Form input border (focus) | box-shadow | `0 0 0 3px var(--sds-interactive-primary-subtle)` |
| Form input | padding | `8px 12px` |
| Form input | border-radius | `6px` |
| Form input | font | `14px / 400` |
| Form input text | color | `var(--sds-text-primary)` |
| Form input placeholder | color | `var(--sds-text-disabled)` |
| Form select | Same as input, plus chevron icon right-aligned |
| Radio button (active) | border-color | `var(--sds-interactive-primary)` |
| Radio button (active) | dot color | `var(--sds-interactive-primary)` |
| Recipient chip | background | `var(--sds-interactive-primary-subtle)` |
| Recipient chip | color | `var(--sds-interactive-primary)` |
| Recipient chip | font | `13px / 500` |
| Recipient chip | padding | `4px 8px` |
| Recipient chip | border-radius | `4px` |
| Recipient chip remove (x) | color | `var(--sds-interactive-primary)` |
| Next dates preview | background | `var(--sds-bg-subtle)` |
| Next dates preview | border-radius | `6px` |
| Next dates preview | padding | `12px 16px` |
| Next dates text | color | `var(--sds-text-secondary)` |
| Next dates text | font | `13px / 400` |
| Field gap | gap | `16px` (vertical between fields) |
| Help text | color | `var(--sds-text-tertiary)` |
| Help text | font | `12px / 400` |
| Error text | color | `var(--sds-status-error-text)` |
| Error text | font | `12px / 400` |
| Report table format tag: PDF | class | `.sds-tag .sds-tag--info` |
| Report table format tag: CSV | class | `.sds-tag .sds-tag--neutral` |
| Report table frequency tag: Daily | class | `.sds-tag .sds-tag--neutral` |
| Report table frequency tag: Weekly | class | `.sds-tag .sds-tag--info` |
| Report table frequency tag: Monthly | class | `.sds-tag .sds-tag--purple` |
| Download icon button | class | `.btn .btn-tertiary .btn-sm .btn-icon-only` |

#### Interaction Details

| Element | Trigger | Behavior |
|---------|---------|----------|
| "Create Report" button | Click | Open Schedule Modal with slide-up animation (300ms, ease-out). Backdrop fades in (200ms). |
| Modal close (x) | Click | Modal slides down (200ms), backdrop fades out (200ms). Unsaved changes trigger confirmation dialog. |
| Modal backdrop | Click | Same as close button (with unsaved changes confirmation). |
| Escape key | Keydown | Same as close button. |
| Template selector | Change | Updates preview section. If "Custom" selected, show additional configuration fields. |
| Frequency radio | Change | Day/time picker updates. Daily: time only. Weekly: day + time. Monthly: day-of-month + time. |
| Recipients autocomplete | Type | Show dropdown of matching team members after 2 characters. Dropdown bg: `var(--sds-bg-elevated)`, shadow: `0 4px 12px rgba(0,0,0,0.1)`. |
| Recipient added | Enter or click suggestion | Email appears as chip. Input clears. "Next 3 dates" section updates. |
| Recipient chip remove | Click x | Chip removed with 150ms fade animation. |
| Save button | Click | Validate all fields. Show inline errors for empty required fields. On success: modal closes, toast appears "Report scheduled successfully", table updates with new row. |
| Report row actions (...) | Click | Dropdown: Edit, Pause/Resume, Delete. |
| Report row "Edit" | Click | Reopen Schedule Modal with pre-filled values. |
| Report row "Delete" | Click | Confirmation dialog: "Delete this scheduled report? This action cannot be undone." with Cancel (secondary) and Delete (danger) buttons. |
| Download button (generated tab) | Click | Browser downloads the file. |
| Tab switch | Click | Content crossfades (200ms). Active tab underline animates position. |

#### State Variations

**Empty (no scheduled reports)**:
- Table replaced with centered empty state
- Icon: calendar, 48px, muted
- Title: "No scheduled reports"
- Description: "Set up automated reports to keep your team informed."
- CTA: "Schedule Your First Report" (primary)

**Generating report (loading)**:
- Row shows spinner icon replacing format tag
- Text: "Generating..." in `var(--sds-text-tertiary)` italicized

**Validation error in modal**:
- Invalid email: red border on input, error message below: "Enter a valid email address"
- Missing required field: red border, error message: "This field is required"
- Error message color: `var(--sds-status-error-text)`

---

### Screen 5.6: Universal Search (Overlay)

**Purpose**: Global search accessible from any page via Cmd+K or search icon. Allows users to find any entity (connections, tables, columns, policies, regulations, remediations) without navigating through menus.

**Entry points**: Cmd+K keyboard shortcut (any page), search icon in header.
**Exits to**: Entity detail page for clicked result. Esc returns to previous page.

#### Shell & Layout

- **Type**: Overlay (not a page -- rendered on top of current page)
- **Z-index**: `z-900` (above alert ribbon z-800, below modals z-1000)
- **Backdrop**: Semi-transparent, covers entire viewport
- **Search panel**: Centered, fixed width, vertically positioned at 20% from top

#### Content Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     BACKDROP (z-900)                                    │
│               rgba(0, 0, 0, 0.4) overlay                               │
│                                                                         │
│         ┌─ Search Panel (600px wide) ─────────────────────┐            │
│         │                                                   │            │
│         │ [🔍] Search connections, tables, policies...      │            │
│         │                                                   │            │
│         │ ── Results ──────────────────────────────────────│            │
│         │                                                   │            │
│         │ CONNECTIONS (3)                                    │            │
│         │ ┌ 🗄 Snowflake Production                        │            │
│         │ │   Snowflake · 142 tables · Active              │            │
│         │ ├ 🗄 Snowflake Staging                           │            │
│         │ │   Snowflake · 38 tables · Active               │            │
│         │ ├ 🗄 Snowflake Dev                               │            │
│         │ │   Snowflake · 12 tables · Degraded             │            │
│         │                                                   │            │
│         │ TABLES (12)                                       │            │
│         │ ┌ 📋 users · Snowflake Prod                      │            │
│         │ │   42 columns · 8 sensitive · Scanned           │            │
│         │ ├ 📋 snowflake_usage · Snowflake Prod            │            │
│         │ │   15 columns · 0 sensitive · Scanned           │            │
│         │ │   [Show all 12 table results ->]               │            │
│         │                                                   │            │
│         │ COLUMNS (47)                                      │            │
│         │ ┌ 📊 users.email · Snowflake Prod                │            │
│         │ │   PII · Email · Protected                      │            │
│         │ ├ 📊 users.ssn · Snowflake Prod                  │            │
│         │ │   PII · SSN · Unprotected                      │            │
│         │ │   [Show all 47 column results ->]              │            │
│         │                                                   │            │
│         │ ── Keyboard ─── ↑↓ Navigate · Enter Select · Esc Close ──│  │
│         └───────────────────────────────────────────────────┘            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Empty state (no query)**:
```
┌─ Search Panel ────────────────────────────────────┐
│ [🔍] Search connections, tables, policies...       │
│                                                     │
│ RECENT SEARCHES                                     │
│   snowflake                                         │
│   users.ssn                                         │
│   GDPR                                              │
│                                                     │
│ SUGGESTED                                           │
│   Unprotected PII columns                           │
│   Failed connections                                │
│   Pending classifications                           │
└─────────────────────────────────────────────────────┘
```

**No results state**:
```
┌─ Search Panel ────────────────────────────────────┐
│ [🔍] xyznoexist                                    │
│                                                     │
│        No results for "xyznoexist"                 │
│                                                     │
│        Try searching for connections, tables,       │
│        columns, policies, or regulations.           │
└─────────────────────────────────────────────────────┘
```

#### Component Inventory

| Component | DS Reference | Usage |
|-----------|-------------|-------|
| **New: Search Overlay** | Custom overlay component | Full search experience |
| Tags | `.sds-tag--sm` | Status tags on results (Active, Protected, PII) |
| Badges | `.sds-badge--neutral` | Result count per type group |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Backdrop | background | `rgba(0, 0, 0, 0.4)` |
| Search panel | background | `var(--sds-bg-elevated)` |
| Search panel | border | `1px solid var(--sds-border-default)` |
| Search panel | border-radius | `12px` |
| Search panel | box-shadow | `0 16px 48px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.1)` |
| Search panel | width | `600px` |
| Search panel | max-height | `70vh` |
| Search panel | overflow-y | `auto` (results area scrollable) |
| Search input container | padding | `16px 20px` |
| Search input container | border-bottom | `1px solid var(--sds-border-subtle)` |
| Search icon | color | `var(--sds-text-tertiary)` |
| Search icon | size | `18px` |
| Search input | font | `16px / 400` |
| Search input | color | `var(--sds-text-primary)` |
| Search input placeholder | color | `var(--sds-text-disabled)` |
| Search input | border | none (borderless within panel) |
| Search input | background | transparent |
| Results area padding | padding | `8px 0` |
| Type group header | padding | `8px 20px` |
| Type group header | font | `11px / 600`, uppercase, `letter-spacing: 0.4px` |
| Type group header | color | `var(--sds-text-tertiary)` |
| Type group count badge | class | `.sds-badge .sds-badge--neutral .sds-badge--sm` |
| Result item | padding | `10px 20px` |
| Result item (hover) | background | `var(--sds-bg-subtle)` |
| Result item (keyboard focused) | background | `var(--sds-interactive-primary-subtle)` |
| Result item (keyboard focused) | outline | none (background serves as indicator) |
| Result item name | font | `14px / 500` |
| Result item name | color | `var(--sds-text-primary)` |
| Result item name (matched text) | font-weight | `700` (bold the matching substring) |
| Result item context | font | `12px / 400` |
| Result item context | color | `var(--sds-text-secondary)` |
| Result type icon | size | `16px` |
| Result type icon | color | `var(--sds-text-tertiary)` |
| Result status tag | class | `.sds-tag .sds-tag--sm` (variant per status) |
| "Show all N results" link | color | `var(--sds-text-link)` |
| "Show all N results" link | font | `13px / 500` |
| "Show all N results" link | padding | `8px 20px 8px 52px` (indented to align with result names) |
| Keyboard hint bar | padding | `10px 20px` |
| Keyboard hint bar | border-top | `1px solid var(--sds-border-subtle)` |
| Keyboard hint bar | background | `var(--sds-bg-subtle)` |
| Keyboard hint text | font | `12px / 400` |
| Keyboard hint text | color | `var(--sds-text-tertiary)` |
| Keyboard hint key | background | `var(--sds-bg-card)` |
| Keyboard hint key | border | `1px solid var(--sds-border-default)` |
| Keyboard hint key | padding | `2px 6px` |
| Keyboard hint key | border-radius | `4px` |
| Keyboard hint key | font | `11px / 600` |
| Recent searches header | Same as type group header |
| Recent search item | Same as result item styling |
| Recent search item icon | clock icon, 14px, `var(--sds-text-disabled)` |
| Suggested searches | Same as result item styling |
| No results message | color | `var(--sds-text-secondary)` |
| No results message | font | `14px / 400` |
| No results title | font | `16px / 500` |
| No results title | color | `var(--sds-text-primary)` |
| No results | text-align | center, padding `40px 20px` |

#### Interaction Details

| Element | Trigger | Behavior |
|---------|---------|----------|
| Cmd+K (or Ctrl+K) | Keydown (global) | Open search overlay. Panel scales up from 95% to 100% over 200ms (ease-out). Backdrop fades in (150ms). Input auto-focused. |
| Search icon in header | Click | Same as Cmd+K |
| Search input | Type | Debounced search (200ms delay). Results update below input. Loading indicator: subtle spinner right-aligned in input. |
| Result item | Click | Navigate to entity detail page. Search overlay closes. Previous page context preserved in browser history. |
| Result item | Hover | Background: `var(--sds-bg-subtle)`. Cursor: pointer. |
| Arrow Up/Down keys | Keydown | Navigate between results. Highlighted item gets `var(--sds-interactive-primary-subtle)` background. Scrolls into view if needed. |
| Enter key | Keydown (with result highlighted) | Navigate to highlighted result's detail page. |
| Escape key | Keydown | Close search overlay. Panel scales to 95% and fades out (150ms). Backdrop fades out (150ms). Focus returns to previous element. |
| Backdrop | Click | Close search overlay (same as Escape). |
| "Show all N results" | Click | Close overlay, navigate to filtered list view for that entity type with search query pre-applied. |
| Recent search item | Click | Populate input with that query, trigger search. |
| Clear input (x button, visible when input has value) | Click | Clear input, show recent/suggested searches. |

#### State Variations

**Initial open (no query)**: Shows recent searches (from localStorage, max 5) and suggested searches (system-generated based on pending items).

**Typing (loading)**: Subtle spinner (16px) appears at right edge of input. Previous results remain visible until new results arrive.

**Results populated**: Grouped by type, max 5 per group (10 if only one type matches). Each group shows count badge.

**No results**: Centered message with search tips.

**Error (search API failure)**: "Search is temporarily unavailable. Please try again." with Retry link.

#### Responsive Behavior

- **>= 768px**: 600px panel centered
- **< 768px**: Panel expands to full width with 16px margin. Keyboard hint bar hidden. Panel positioned at top of viewport (not 20% offset).

---

## 6. New Components Required

The following components need to be designed and built (not currently in Software DS):

| Component | Priority | Used In |
|-----------|----------|---------|
| Risk Gauge (SVG) | High | Executive Dashboard |
| Trend Line Chart (SVG) | High | Executive Dashboard |
| Donut Chart (SVG) | High | Executive Dashboard |
| Sparkline (SVG, inline) | Medium | Metric cards (compact trend indicator) |
| Heatmap Grid | High | Operations Dashboard |
| Alert Ribbon | High | Global (all pages) |
| Activity Feed | High | All dashboard views |
| Search Overlay | High | Global (all pages) |
| Report Schedule Modal | Medium | Reports page |
| Recipient Input (autocomplete) | Medium | Report Schedule Modal |
| Quick Actions Panel | Medium | All dashboard views |
| Skeleton Loader | Medium | All dashboard views (loading state) |

---

## 7. Z-Index Stack Reference

| Layer | Z-Index | Element |
|-------|---------|---------|
| Modal dialogs, drawers | `z-1000` | Report scheduling modal, confirmation dialogs |
| Universal Search overlay | `z-900` | Search panel + backdrop |
| Alert Ribbon | `z-800` | Persistent notification bar |
| Top navigation (header) | `z-700` | Header bar |
| Sidebar navigation | `z-600` | Side navigation panel |
| Page content | `z-0` | Dashboard cards, tables, charts |

---

## 8. Animation & Transition Summary

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| Gauge arc fill | 800ms | ease-out | Risk score gauge on load |
| Donut segment fill | 600ms | ease-out | Coverage donut on load |
| Skeleton shimmer | 1500ms | linear, infinite | Loading skeleton pulse |
| View toggle crossfade | 200ms | ease | Dashboard view switching |
| Alert ribbon slide-down | 300ms | ease-out | Alert appearing |
| Alert ribbon collapse | 200ms | ease | Alert dismissed |
| Search overlay open | 200ms | ease-out | Panel scale 95% to 100% + backdrop fade |
| Search overlay close | 150ms | ease-in | Panel scale to 95% + backdrop fade |
| Modal open | 300ms | ease-out | Slide-up + backdrop fade |
| Modal close | 200ms | ease-in | Slide-down + backdrop fade |
| Tooltip appear | 150ms | ease-out | Hover tooltips on charts |
| Table row hover | 120ms | ease | Background color transition |
| Button state change | 150ms | ease | All button hover/active states |
| Heatmap group expand | 200ms | ease | Chevron rotation + group expand |
| Alert resolution | 2000ms hold | -- | Green "Resolved" state before fadeout |

---

## 9. Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| Keyboard navigation | All interactive elements reachable via Tab. Dashboard cards: Tab between cards, Enter to drill-down. |
| View toggle | `role="tablist"` with `role="tab"` children. `aria-selected` on active tab. Arrow keys to switch. |
| Alert ribbon | `role="alert"` with `aria-live="assertive"`. Dismiss button labeled "Dismiss alert". |
| Search overlay | `role="dialog"` with `aria-modal="true"`. Input has `aria-label="Search"`. Results use `role="listbox"` with `role="option"` items. |
| Charts | SVG charts include `role="img"` with `aria-label` describing the data (e.g., "Risk score: 72 out of 100, moderate risk"). |
| Heatmap | Each cell has `aria-label` with connection name, time bucket, and freshness status. |
| Color contrast | All text meets WCAG AA (4.5:1 for normal text, 3:1 for large text). Status colors are supplemented with text labels/icons, never color alone. |
| Focus management | Search overlay traps focus within panel. Modal traps focus within dialog. Alert ribbon does not trap focus. |
| Screen reader | Skeleton loaders have `aria-busy="true"`. Metric cards have `aria-label` with full context (e.g., "Risk score: 72, increased 5 points"). |
| Reduced motion | `@media (prefers-reduced-motion: reduce)`: disable gauge animation, chart animations, skeleton shimmer. Transitions reduce to 0ms. |
