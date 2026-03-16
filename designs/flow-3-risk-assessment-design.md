# Flow 3: Risk Assessment & Scoring -- Design Specification

**Version**: 1.0
**Date**: 2026-03-14
**Stage**: Assess
**Design System**: Software DS (Beacon)

---

## Table of Contents

1. [Feature Requirements](#1-feature-requirements)
2. [Design Rationale](#2-design-rationale)
3. [Pattern Recommendations](#3-pattern-recommendations)
4. [Edge Cases & Considerations](#4-edge-cases--considerations)
5. [Screen Specifications](#5-screen-specifications)
   - 5.1 Risk Dashboard (3 view variants)
   - 5.2 Risk Detail
   - 5.3 Risk Simulation (Drawer)
   - 5.4 Regulation Detail

---

## 1. Feature Requirements

### Problem Statement

Organizations managing sensitive data across multiple cloud platforms lack a unified view of their risk posture. Security leaders need executive summaries, compliance officers need regulation-level detail, and technical operators need connection-level health metrics. Existing tools force all personas through one lens, leading to dashboard abandonment or shadow tooling.

### Users

| Persona | Role | Primary Need |
|---------|------|-------------|
| **Marcus** (Executive) | CISO / VP Security | At-a-glance risk posture, board-ready metrics, trend over time |
| **Priya** (Governance) | Compliance Officer | Regulation gap analysis, review queues, audit evidence |
| **Jordan** (Technical) | Data Engineer / Security Analyst | Connection health, scan freshness, access anomaly drill-down |

### Success Metrics

- **Adoption**: 80%+ of users visit the Risk Dashboard at least weekly within 60 days of onboarding
- **Time-to-insight**: Users identify top risk factor in under 10 seconds from dashboard load
- **Remediation rate**: 40%+ of identified risks enter remediation flow within 7 days
- **Simulation usage**: 25%+ of remediation actions are preceded by a simulation preview

### User Stories

1. As Marcus, I want to see a single risk score with trend direction so I can brief the board in 30 seconds.
2. As Priya, I want to see regulation-specific compliance gaps so I can prioritize remediation by regulatory deadline.
3. As Jordan, I want to see which connections have stale scans so I can trigger re-scans before risk scores drift.
4. As any user, I want to simulate remediation impact so I can prioritize the highest-value fixes.
5. As Priya, I want to snooze a risk with a reason and review date so acknowledged risks remain auditable.
6. As Marcus, I want to export a board-ready PDF with risk score, trend, and top 3 risks.

---

## 2. Design Rationale

### Decision Table

| Decision | Chosen Approach | Alternatives Considered | Why |
|----------|----------------|------------------------|-----|
| **Persona views** | Toggle tabs on single dashboard | Separate pages per persona; Role-based default with no toggle | Single page with toggle preserves shared mental model. Users see the same URL, reducing confusion in cross-functional meetings. Toggle tabs (`sds-toggle-tabs`) are already in the DS. |
| **Risk score visualization** | Animated SVG arc gauge (0-100) | Numeric-only display; Circular donut; Traffic-light grid | Arc gauge creates visceral "speedometer" moment. Animation from 0 to current value on load makes score changes tangible. Color zones map to severity without needing labels. |
| **Risk simulation** | Right-side drawer panel | Full-page modal; Inline expansion; Separate page | Drawer keeps dashboard context visible. User can compare current vs. projected score side-by-side. Avoids full navigation away, matching the in-context drill-down pattern that competitors lack. |
| **Risk Detail structure** | Tabbed detail view (4 tabs) | Accordion sections; Single scrolling page; Split view | Tabs reduce vertical scroll for dense content. Each tab serves a distinct task. Tab pattern (`sds-tabs`) is established in the DS. |
| **What Changed summary** | Itemized list with clickable links | Net delta only; Collapsed summary with expand; Toast notification | Itemized changes give actionable context. Each line links to its source, reducing navigation friction. Net-only summaries hide important offsetting changes. |
| **Score model colors** | 4-zone gradient (green/yellow/orange/red) | 3-zone; 5-zone; Single color with opacity | 4 zones match industry mental models (low/moderate/high/critical). Maps cleanly to existing DS status tokens. |

---

## 3. Pattern Recommendations

| Screen | Primary Pattern | Secondary Pattern | DS Reference |
|--------|----------------|-------------------|-------------|
| Risk Dashboard | **Dashboard** -- Metric cards + charts + feed | Filter Panel (time range), Toggle Tabs (persona views) | Cards, Toggle Tabs, Tags |
| Risk Detail | **Detail View with Tabs** -- Tabbed content sections | Data Table with Inline Actions (risk factors, access analysis) | Tabs, Cards, Tags, Buttons |
| Risk Simulation | **Interactive Panel (Drawer)** -- Filterable checklist with live preview | Filter Panel (connection, classification, action type), Bulk Operations (checkbox selection) | Cards, Buttons |
| Regulation Detail | **Detail View** -- Requirements checklist with evidence | Data Lineage (gap analysis), Import/Export (report generation) | Cards, Tags, Buttons |

---

## 4. Edge Cases & Considerations

| Category | Scenario | Design Response |
|----------|----------|-----------------|
| **Empty state** | No classified data yet | Gauge at 0 with 3-step CTA: "1. Connect data source 2. Run scan 3. Review classifications." Progress indicator shows completed steps. Uses DS empty-state pattern: 48px muted icon, 18px/600 title, 14px description, primary CTA button. |
| **Loading** | Risk recalculating after classification changes | Gauge shows pulse animation over current value, "Recalculating..." label in `--sds-text-tertiary`. Partial results remain visible. Full update resolves within seconds. |
| **Score jump up** | Risk increased significantly since last visit | Alert banner at top of content area using `--sds-status-error-bg` background. "Risk score increased by 23 points" with expandable "What Changed" section. Persists until dismissed or all items addressed. |
| **Score drop** | Risk decreased after remediation | Celebratory micro-interaction: score ticks down with green flash using `--sds-status-success-strong`. "What Changed" shows each remediation action and its point impact. |
| **Staleness** | Data older than 30 days | Warning banner using `--sds-status-warning-bg`: "Risk score based on data from 45 days ago. Re-scan recommended." Includes tertiary button "Re-scan now." |
| **Regulation conflict** | Requirements from two regulations conflict | Flag in Regulation Detail using `--sds-status-error-bg` tag: "Conflict detected." Description explains the specific conflict with link to resolution guidance. |
| **Snooze expiry** | Snoozed risk reaches its review date | Item resurfaces in Top Risks table with `sds-tag--warning` badge "Snooze expired." Notification sent to original snoozer. |
| **Read-only user** | User without remediation permissions | All data visible. Remediate/Snooze/Acknowledge buttons render as disabled (`--sds-text-disabled`) with tooltip "Request access from your administrator." |
| **Unsupported platform** | Platform-specific access not yet available | Falls back to generic access labels. Info tag `sds-tag--info`: "Platform-specific access details coming soon for [platform]." |
| **First score** | First risk score ever calculated during onboarding | Animated transition from empty gauge (0) to scored state. Celebratory or alerting animation depending on score zone. |

---

## 5. Screen Specifications

---

### 5.1 Risk Dashboard

**Purpose**: At-a-glance risk posture for the entire organization. Default landing page after login. Three persona-specific view variants toggled via a view selector, sharing the same URL and data -- different emphasis.

#### 5.1.0 Shell & Layout

**Shell**: Full App Shell (header + sidebar + content area)

```
+----------------------------------------------------------+
| Header (56px) -- full width                              |
+----------+-----------------------------------------------+
| Sidebar  | Content Area                                  |
| 220px    | padding: 24px                                 |
|          | max-width: none (fluid)                       |
|          |                                               |
+----------+-----------------------------------------------+
```

**Token references for shell**:
- Header background: `var(--sds-bg-page)` (#FFFFFF)
- Header border-bottom: 1px solid `var(--sds-color-warm-gray-100)` (#EBE6DD)
- Header height: 56px
- Sidebar background: `var(--sds-nav-sidebar-bg)` (#FAF8F5)
- Sidebar border-right: 1px solid `var(--sds-color-warm-gray-150)` (#E0DCD3)
- Sidebar width: 220px (expanded) / 56px (collapsed)
- Content area background: `var(--sds-bg-page)` (#FFFFFF)
- Content area padding: 24px

**Components used**:
- Header component (`/components/header.html`)
- Side Navigation component (`/components/side-navigation.html`) -- "Risk Assessment" item active in sidebar under "Assess" group

**Responsive behavior**:
- >= 1440px: All 4 metric cards in single row; charts 2-up grid
- 1024-1439px: Metric cards 2x2 grid; charts stack vertically
- 768-1023px: Sidebar collapses to 56px icon-only; metric cards 2x2
- < 768px: Sidebar hidden (hamburger trigger); metric cards stack 1-up; charts full-width

---

#### 5.1.1 Content Hierarchy -- All Views (Shared Elements)

The following elements appear in all three persona views. Persona-specific content follows in sections 5.1.2, 5.1.3, and 5.1.4.

```
+---------------------------------------------------------------+
| Page Header                                                    |
| "Risk Assessment"                    [Time Range v] [Export v] |
|                                                                |
| [Executive] [Governance] [Technical]   <-- Toggle Tabs         |
+---------------------------------------------------------------+
|                                                                |
| +--Risk Score Gauge--+  +--What Changed?------------------+   |
| |                    |  | Risk increased by 8 points        |  |
| |     [SVG ARC]      |  | + 3 from 12 new PII columns      |  |
| |       62           |  | + 2 from 4 new access grants      |  |
| |    High Risk       |  | - 1 from 2 columns tokenized      |  |
| |  30-day trend ~    |  | + 4 from stale scan on Snowflake  |  |
| +--------------------+  +----------------------------------+   |
|                                                                |
| [PERSONA-SPECIFIC CONTENT AREA -- see 5.1.2/5.1.3/5.1.4]     |
|                                                                |
+---------------------------------------------------------------+
```

##### Section 1: Page Header

```
1. Page Header
   - Title: "Risk Assessment"
     Font: 24px / 600 weight
     Color: var(--sds-text-primary)
   - Right-aligned actions:
     [Time Range dropdown (secondary btn-sm)]: "Last 30 days" default
     [Export dropdown (secondary btn-sm)]: "Export" with icon
   - Below title (16px gap):
     Toggle Tabs (sds-toggle-tabs component)
     Options: "Executive" | "Governance" | "Technical"
     Default: based on user role, falls back to Executive
```

**Token references**:
- Title: `var(--sds-text-primary)` / 24px / font-weight 600
- Toggle tabs container: `var(--sds-bg-subtle)` (#F4F1EB) background, 8px radius, 3px padding
- Toggle tab inactive: `var(--sds-text-secondary)` (#54514D), 13px/500, transparent background
- Toggle tab active: `var(--sds-text-primary)` (#1C1A17), 13px/600, `var(--sds-color-white)` background, `box-shadow: 0 1px 3px rgba(0,0,0,0.08)`
- Toggle tab hover (inactive): `var(--sds-text-primary)`, `var(--sds-color-warm-gray-100)` background
- Gap between title and toggle tabs: 16px
- Gap between header block and content: 24px

**Components**:
- Toggle Tabs (`/components/tabs.html` -- `.sds-toggle-tabs` variant)
- Buttons (`/components/buttons.html` -- `.btn-secondary.btn-sm`)

##### Section 2: Risk Score Gauge + What Changed (2-column layout)

This section uses a 2-column layout: gauge on left (360px fixed width), What Changed on right (flexible).

```
+-----------360px-----------+  +-------flex-1---------+
|                           |  |                      |
|  RISK SCORE GAUGE (SVG)  |  |  WHAT CHANGED CARD   |
|                           |  |                      |
+---------------------------+  +----------------------+
```

Gap between columns: 24px.

###### Risk Score Gauge Card

**Container**: `sds-card` with body only (no header divider).
- Background: `var(--sds-bg-card)` (#FFFFFF)
- Border: 1px solid `var(--sds-border-default)` (#E0DCD3)
- Border-radius: 8px
- Padding: 24px (custom, larger than default card body)
- Width: 360px fixed
- Min-height: 280px

**SVG Gauge Specification**:

```
Viewbox: 0 0 240 160
Arc: Semi-circle (180 degrees), stroke-based
Center: (120, 140)
Radius: 100
Stroke-width: 20
Stroke-linecap: round

Background track:
  Color: var(--sds-color-warm-gray-100) (#EBE6DD)
  Full 180-degree arc from left to right

Color zones (4 segments within the background track):
  0-25%   (0-45 deg):    var(--sds-color-green-400)  #7A9A01
  25-50%  (45-90 deg):   var(--sds-color-yellow-300) #C4AA25
  50-75%  (90-135 deg):  var(--sds-color-red-250)    #EEA79E
  75-100% (135-180 deg): var(--sds-color-red-500)    #BF5547

Value arc (overlay):
  Draws from 0 to [current value / 100 * 180] degrees
  Color: matches the zone the needle tip falls in
  Stroke-width: 20
  Stroke-linecap: round

Needle indicator:
  Small circle (r=6) at the tip of the value arc
  Fill: white
  Stroke: 2px, same color as current zone
  Drop shadow: 0 1px 3px rgba(0,0,0,0.15)

Animation on load:
  Duration: 1200ms
  Easing: cubic-bezier(0.4, 0, 0.2, 1)
  Animates stroke-dashoffset from full to calculated value
  Score number counts up in sync (0 to current value)
```

**Score display (below arc center)**:

```
Score number:
  Font: 48px / 700 weight
  Color: matches current zone color
  Position: centered below arc, y-offset from center

Score label:
  Font: 14px / 500 weight
  Color: var(--sds-text-secondary) (#54514D)
  Text: "Low Risk" | "Moderate Risk" | "High Risk" | "Critical Risk"
  Position: directly below score number, 4px gap
```

**Score-to-color mapping**:

| Range | Label | Score color | Arc color |
|-------|-------|------------|-----------|
| 0-25 | Low Risk | `var(--sds-color-green-500)` #62800B | `var(--sds-color-green-400)` #7A9A01 |
| 26-50 | Moderate Risk | `var(--sds-color-yellow-500)` #8A7515 | `var(--sds-color-yellow-300)` #C4AA25 |
| 51-75 | High Risk | `var(--sds-color-red-400)` #DB7060 | `var(--sds-color-red-250)` #EEA79E |
| 76-100 | Critical Risk | `var(--sds-color-red-500)` #BF5547 | `var(--sds-color-red-500)` #BF5547 |

**30-day trend sparkline (below score label)**:

```
SVG sparkline:
  Width: 120px
  Height: 32px
  Stroke: 1.5px
  Color: var(--sds-color-warm-gray-400) (#948E85)
  Fill: none
  Data points: 30 (one per day)
  Animation: draws left-to-right over 800ms, 400ms delay after gauge

Trend indicator (right of sparkline):
  Arrow icon: 12x12px
  Up arrow: var(--sds-color-red-450) #CF6253 (risk increasing = bad)
  Down arrow: var(--sds-color-green-400) #7A9A01 (risk decreasing = good)
  Flat dash: var(--sds-color-warm-gray-400)
  Delta text: "+8" or "-3" or "0"
  Font: 13px / 600 weight
  Color: matches arrow color
```

**Recalculating state**:
- Gauge value shows current value but with 50% opacity
- Pulse animation: opacity oscillates 0.5 to 1.0 over 1.5s, infinite
- Label below score: "Recalculating..." in `var(--sds-text-tertiary)` (#6B6760), 13px/400
- Pulse keyframes: `@keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }`

**Click behavior**: Clicking anywhere on the gauge card navigates to Risk Detail view.

###### What Changed Card

**Visibility**: Only appears when risk score has changed since user's last visit. When no change, this column shows "Score stable -- no changes since your last visit" in muted text.

**Container**: `sds-card` with header (bordered) + body.
- Card title: "What Changed" (14px/600, `--sds-text-primary`)
- Header action: tertiary button "Dismiss" (13px, `--sds-color-blue-750`)

**Body content -- itemized change list**:

```
Each change item:
+----------------------------------------------------------+
| [+/-] [icon] Description text                     [link] |
+----------------------------------------------------------+

Layout: flex column, 8px gap between items

Each item:
  - Delta indicator: "+3" or "-1"
    Positive (risk up): var(--sds-color-red-450) #CF6253
    Negative (risk down): var(--sds-color-green-400) #7A9A01
    Font: 13px / 600 weight / monospace
    Width: 32px fixed (right-aligned within)
  - Description text:
    Font: 13px / 400
    Color: var(--sds-text-secondary) (#54514D)
    Example: "from 12 new PII columns discovered"
  - Link icon (right):
    Chevron-right icon, 14px
    Color: var(--sds-text-tertiary) (#6B6760)
    Hover: var(--sds-text-primary) (#1C1A17)

Divider between items: 1px solid var(--sds-border-subtle) (#EBE6DD)

Item hover: background var(--sds-bg-subtle) (#F4F1EB), border-radius 6px
Item click: navigates to the source (e.g., the specific scan result, access grant, etc.)
```

**Net summary (card footer)**:
- Footer with top border `var(--sds-border-subtle)`
- Left: "Net change: +8 points" in 13px/600, color matches direction (red for up, green for down)
- Right: tertiary link "View full history"

**Components**: `sds-card` with `.sds-card-header--bordered`, `.sds-card-body`, `.sds-card-footer`

---

#### 5.1.2 Executive View (Marcus)

Below the shared gauge + What Changed section, the Executive view shows:

```
+---------------------------------------------------------------+
| SECTION 3: Metric Cards (4-up grid)                           |
| +--------+ +--------+ +--------+ +--------+                  |
| |Protect.|  |Connec- |  |Compli.|  |Open   |                  |
| |Coverage|  |tions   |  |Score  |  |Risks  |                  |
| | 73.2%  |  | 12/12  |  | 4/6   |  |  47   |                  |
| +--------+ +--------+ +--------+ +--------+                  |
+---------------------------------------------------------------+
| SECTION 4: Two-column layout                                  |
| +--Protection Coverage Donut--+  +--Compliance Summary-----+  |
| |        [SVG DONUT]          |  |  GDPR       [====] 85%  |  |
| |   Protected  Unprotected    |  |  HIPAA      [===]  72%  |  |
| |   Excluded                  |  |  PCI DSS    [=====] 94% |  |
| +-----------------------------+  +  SOX        [==]   58%  |  |
|                                  +--------------------------+  |
+---------------------------------------------------------------+
| SECTION 5: Top Risks Table                                     |
| Rank | Risk Factor        | Score | Trend | Status   | Action |
|------|--------------------|-------|-------|----------|--------|
|  1   | Unprotected PII... |  18   |  +3   | Active   | View   |
|  2   | Broad admin access |  14   |  0    | Active   | View   |
+---------------------------------------------------------------+
```

##### Section 3: Metric Cards

**Layout**: 4-column CSS Grid, `gap: 16px`. Cards fill available width equally.

Each card uses the `sds-card` component (body only, no header):

```
Card structure:
  Background: var(--sds-bg-card) (#FFFFFF)
  Border: 1px solid var(--sds-border-default) (#E0DCD3)
  Border-radius: 8px
  Padding: 16px 20px

  Label:
    Font: 13px / 400
    Color: var(--sds-text-secondary) (#54514D)
    Margin-bottom: 4px

  Value:
    Font: 28px / 700 weight
    Color: var(--sds-text-primary) (#1C1A17)

  Subtext (optional):
    Font: 12px / 400
    Color: var(--sds-text-tertiary) (#6B6760)
    Margin-top: 2px
```

**Card definitions**:

| Card | Label | Value example | Value color | Subtext |
|------|-------|--------------|-------------|---------|
| Protection Coverage | "Protection Coverage" | "73.2%" | `--sds-text-primary` | "of sensitive columns" |
| Connections Healthy | "Connection Health" | "12/12" | `--sds-status-success-text` (#62800B) | "all connections active" |
| Compliance Score | "Regulation Compliance" | "4/6" | `--sds-status-warning-text` (#8A7515) if <100%, `--sds-status-success-text` if 100% | "regulations met" |
| Open Risks | "Open Risk Items" | "47" | `--sds-status-error-text` (#BF5547) if >0 | "3 critical, 12 high" |

**Click behavior**: Each card is clickable (cursor: pointer, hover background `var(--sds-bg-subtle)`). Links to relevant drill-down.

##### Section 4: Two-Column Charts

**Layout**: 2-column CSS Grid, `gap: 24px`.

###### Protection Coverage Donut (left column)

**Container**: `sds-card` with `.sds-card-header--bordered` + `.sds-card-body`
- Title: "Protection Coverage"
- Header action: tertiary link "View catalog"

**SVG Donut Specification**:

```
Viewbox: 0 0 200 200
Center: (100, 100)
Outer radius: 80
Inner radius: 55 (donut thickness: 25)

Segments (clockwise from 12 o'clock):
  Protected:   var(--sds-color-green-400) #7A9A01
  Unprotected: var(--sds-color-red-400)   #DB7060
  Excluded:    var(--sds-color-warm-gray-200) #D0CBC3

Center text:
  Percentage: "73%" -- 24px / 700 / var(--sds-text-primary)
  Label: "protected" -- 12px / 400 / var(--sds-text-tertiary)

Animation:
  Segments grow from 0 on load over 800ms
  Easing: cubic-bezier(0.4, 0, 0.2, 1)

Hover on segment:
  Segment expands outward by 4px (radius increases)
  Tooltip appears: "Protected: 1,247 columns (73.2%)"
  Tooltip style:
    Background: var(--sds-color-warm-gray-900) (#1C1A17)
    Text: white, 12px/500
    Padding: 6px 12px
    Border-radius: 6px
    Box-shadow: 0 2px 8px rgba(0,0,0,0.15)
```

**Legend (below donut, inside card body)**:

```
Layout: horizontal flex, gap: 20px, centered

Each legend item:
  [dot 8px] [label] [value]
  Dot: border-radius 50%, color matches segment
  Label: 13px / 400 / var(--sds-text-secondary)
  Value: 13px / 600 / var(--sds-text-primary)

  Example:
  [green dot] Protected  1,247
  [red dot]   Unprotected  342
  [gray dot]  Excluded      112
```

**Click behavior**: Clicking donut or "View catalog" navigates to Data Catalog filtered by protection status.

###### Compliance Summary Card (right column)

**Container**: `sds-card` with `.sds-card-header--bordered` + `.sds-card-body`
- Title: "Compliance Summary"
- Header action: tertiary link "View all"

**Body content -- regulation progress bars**:

```
Each regulation row:
  Layout: flex, align-items center, gap 12px
  Margin-bottom: 12px (last item: 0)

  Regulation name:
    Font: 13px / 500
    Color: var(--sds-text-primary)
    Width: 80px fixed, flex-shrink 0

  Progress bar:
    Height: 8px
    Background track: var(--sds-color-warm-gray-100) (#EBE6DD)
    Border-radius: 4px
    Flex: 1

    Fill:
      Border-radius: 4px
      Width: [percentage]%
      Color by threshold:
        >= 90%: var(--sds-color-green-400) #7A9A01
        70-89%: var(--sds-color-yellow-300) #C4AA25
        < 70%:  var(--sds-color-red-400)    #DB7060
      Transition: width 600ms cubic-bezier(0.4, 0, 0.2, 1)

  Percentage:
    Font: 13px / 600
    Color: matches fill color
    Width: 40px fixed, text-align right

Row hover: background var(--sds-bg-subtle), border-radius 4px, padding 4px 8px (offset margins)
Row click: navigates to Regulation Detail for that regulation
```

##### Section 5: Top Risks Table

**Container**: `sds-card` with `.sds-card-header--bordered` + `.sds-card-body` (no body padding -- table fills edge to edge).
- Title: "Top Risk Factors"
- Header action: tertiary link "View all risks"

**Data table specification**:

```
Table:
  Width: 100%
  Border-collapse: collapse

  Header row:
    Background: var(--sds-bg-subtle) (#F4F1EB)
    Font: 12px / 600 / uppercase
    Color: var(--sds-text-secondary) (#54514D)
    Letter-spacing: 0.3px
    Padding: 10px 16px
    Border-bottom: 1px solid var(--sds-border-default) (#E0DCD3)

  Body rows:
    Font: 13px / 400
    Color: var(--sds-text-secondary) (#54514D)
    Padding: 12px 16px
    Border-bottom: 1px solid var(--sds-border-subtle) (#EBE6DD)
    Hover: background var(--sds-color-warm-gray-025) (#FAF8F5)
    Cursor: pointer (entire row is clickable)

Columns:
  | Column       | Width    | Content                              |
  |-------------|----------|--------------------------------------|
  | Rank         | 48px     | Number, 13px/600, --sds-text-primary |
  | Risk Factor  | flex     | Text, 13px/500, --sds-text-primary   |
  | Impact Score | 80px     | Number with bar, right-aligned       |
  | Trend        | 64px     | Delta with arrow icon                |
  | Status       | 100px    | sds-tag component                    |
  | Action       | 80px     | Tertiary button "View"               |

Impact Score mini-bar:
  Inline horizontal bar behind the number
  Height: 4px, below the number text
  Background: matches score zone color at 20% opacity
  Fill: matches score zone color

Trend column:
  Arrow + delta text (same style as gauge trend)

Status column tags:
  Active:    sds-tag--error "Active"
  Snoozed:   sds-tag--warning "Snoozed"
  Resolved:  sds-tag--success "Resolved"
  Accepted:  sds-tag--neutral "Accepted"
```

**Footer**: `sds-card-footer` with "Showing 5 of 47" (left) and pagination controls (right).

**Click behavior**: Row click navigates to Risk Detail for that risk factor.

---

#### 5.1.3 Governance View (Priya)

Below the shared gauge + What Changed section, the Governance view replaces the Executive sections with:

```
+---------------------------------------------------------------+
| SECTION 3: Metric Cards (4-up grid)                           |
| +--------+ +--------+ +--------+ +--------+                  |
| |Regulat.|  |Classif.|  |Review |  |Snoozed|                  |
| |Gaps    |  |Gaps    |  |Queue  |  |Items  |                  |
| |  12    |  |  34    |  |   7   |  |  15   |                  |
| +--------+ +--------+ +--------+ +--------+                  |
+---------------------------------------------------------------+
| SECTION 4: Regulation Cards (2x2 or 3-up grid)               |
| +--GDPR----------------+ +--HIPAA--------------+             |
| | Status: 85% compliant | | Status: 72% compliant|            |
| | Requirements: 42/49   | | Requirements: 31/43  |            |
| | Gaps: 7               | | Gaps: 12             |            |
| | [View details]        | | [View details]       |            |
| +-----------------------+ +---------------------+             |
| +--PCI DSS--------------+ +--SOX-----------------+           |
| | Status: 94% compliant | | Status: 58% compliant|            |
| +-----------------------+ +---------------------+             |
+---------------------------------------------------------------+
| SECTION 5: Classification Gap Analysis Table                   |
| Data Source  | Unclassified Cols | Last Scanned | Action       |
|-------------|-------------------|--------------|--------------|
| Snowflake   | 234               | 2 days ago   | Review       |
+---------------------------------------------------------------+
```

##### Section 3: Governance Metric Cards

Same card pattern as Executive view (Section 5.1.2, Section 3), but different metrics:

| Card | Label | Value color | Subtext |
|------|-------|-------------|---------|
| Regulation Gaps | "Regulation Gaps" | `--sds-status-error-text` if >0 | "across 6 regulations" |
| Classification Gaps | "Unclassified Columns" | `--sds-status-warning-text` if >0 | "pending review" |
| Review Queue | "Review Queue" | `--sds-status-info-text` (#0C4A69) | "items awaiting review" |
| Snoozed Items | "Snoozed Risks" | `--sds-text-secondary` | "3 expiring this week" (warning color if any expiring soon) |

##### Section 4: Regulation Cards

**Layout**: CSS Grid, `grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))`, `gap: 20px`.

Each regulation card uses `sds-card` with `.sds-card-header--bordered` + `.sds-card-body` + `.sds-card-footer`:

```
Card header:
  Title: Regulation name (e.g., "GDPR") -- 14px/600
  Right: Compliance percentage tag
    >= 90%: sds-tag--success "85%"
    70-89%: sds-tag--warning "72%"
    < 70%:  sds-tag--error "58%"

Card body:
  3 rows of key-value pairs:
    Layout: flex, justify-content space-between
    Key: 13px/400, var(--sds-text-secondary)
    Value: 13px/600, var(--sds-text-primary)

    Row 1: "Requirements met" / "42 of 49"
    Row 2: "Gaps identified" / "7"
    Row 3: "Last assessed" / "Mar 12, 2026"
    Gap between rows: 8px

Card footer:
  Right-aligned tertiary link: "View details" (navigates to Regulation Detail)
```

##### Section 5: Classification Gap Analysis Table

Same table structure as Top Risks Table (see Section 5.1.2, Section 5) with different columns:

| Column | Width | Content |
|--------|-------|---------|
| Data Source | flex | Connection icon + name, 13px/500 |
| Unclassified Columns | 160px | Count, right-aligned |
| Last Scanned | 120px | Relative time, `--sds-text-tertiary` |
| Freshness | 100px | Tag: "Fresh" (success) / "Stale" (warning) / "Expired" (error) |
| Action | 80px | Tertiary button "Review" |

---

#### 5.1.4 Technical View (Jordan)

Below the shared gauge + What Changed section, the Technical view replaces the Executive sections with:

```
+---------------------------------------------------------------+
| SECTION 3: Metric Cards (4-up grid)                           |
| +--------+ +--------+ +--------+ +--------+                  |
| |Connect.|  |Scan    |  |Access |  |Anomal. |                 |
| |Health  |  |Fresh.  |  |Grants |  |Detect. |                 |
| | 11/12  |  | 87%    |  | 1,234 |  |   8    |                 |
| +--------+ +--------+ +--------+ +--------+                  |
+---------------------------------------------------------------+
| SECTION 4: Scan Freshness Heatmap                             |
| +------+----+----+----+----+----+----+----+                   |
| |Connec.| D1 | D2 | D3 | D4 | D5 | D6 | D7|                  |
| +------+----+----+----+----+----+----+----+                   |
| |Snowfl.| ## | ## | ## | ## | ## | ## | ## |                   |
| |AWS S3 | ## | ## | ## | ## | ## | ## | ## |                   |
| |BigQry | ## | ## | ## | ## | ## | ## | ## |                   |
| +------+----+----+----+----+----+----+----+                   |
+---------------------------------------------------------------+
| SECTION 5: Two-column layout                                   |
| +--Access Anomalies--------+ +--Connection Status----------+  |
| | User      | Action | Time | | Connection | Status | Last  | |
| |-----------|--------|------| | |------------|--------|-------| |
| | admin@... | GRANT  | 2h   | | Snowflake  | OK     | 5m    | |
| +--------------------------+ +-----------------------------+   |
+---------------------------------------------------------------+
```

##### Section 3: Technical Metric Cards

| Card | Label | Value color | Subtext |
|------|-------|-------------|---------|
| Connection Health | "Connection Health" | Green if all healthy, red if any failing | "1 connection failing" or "all healthy" |
| Scan Freshness | "Scan Freshness" | Yellow if <100%, green at 100% | "across 12 connections" |
| Access Grants | "Total Access Grants" | `--sds-text-primary` | "142 with broad access" (error color if high) |
| Anomalies Detected | "Anomalies (7 days)" | `--sds-status-error-text` if >0 | "8 unusual access patterns" |

##### Section 4: Scan Freshness Heatmap

**Container**: `sds-card` with `.sds-card-header--bordered` + `.sds-card-body`.
- Title: "Scan Freshness"
- Header action: dropdown for time range ("7 days" | "14 days" | "30 days")

**SVG Heatmap Specification**:

```
Layout: CSS Grid rendered as SVG or HTML table
Rows: One per connection (data source)
Columns: One per time bucket (day)

Cell specification:
  Size: 36px x 36px
  Border-radius: 4px
  Gap: 3px
  Border: 1px solid var(--sds-color-warm-gray-100)

Cell colors (based on hours since last scan):
  < 24 hours:    var(--sds-color-green-100)  #E2EDCC (light green)
  24-48 hours:   var(--sds-color-green-250)  #AAC267 (medium green)
  48-72 hours:   var(--sds-color-yellow-100) #F7EC88 (light yellow)
  72-168 hours:  var(--sds-color-yellow-300) #C4AA25 (yellow)
  > 168 hours:   var(--sds-color-red-200)    #F2BDB6 (light red)
  No scan:       var(--sds-color-warm-gray-100) #EBE6DD (gray)

Row labels (left):
  Connection name: 13px / 400 / var(--sds-text-secondary)
  Width: 140px fixed

Column labels (top):
  Day labels: "Mon" "Tue" etc. or date format
  Font: 11px / 600 / var(--sds-text-tertiary)
  Text-align: center

Cell hover:
  Border: 2px solid var(--sds-border-focus) (#013D5B)
  Tooltip: "Snowflake Prod: Last scanned 4 hours ago (Mar 13, 2:15 PM)"
  Tooltip style matches gauge tooltip specification

Cell click:
  Navigates to the specific scan result for that connection + time bucket
```

**Legend (below heatmap)**:

```
Horizontal flex, gap: 16px
[color block 12x12] Label -- for each freshness tier
Font: 11px / 400 / var(--sds-text-tertiary)
```

##### Section 5: Access Anomalies + Connection Status (2-column)

Two `sds-card` components side by side in a 2-column grid (gap: 24px).

**Access Anomalies Card**:
- Title: "Access Anomalies (7 days)"
- Header action: tertiary "View all"
- Body: compact data table

| Column | Width | Content |
|--------|-------|---------|
| User | flex | Email/username, 13px/400, truncate with ellipsis |
| Action | 100px | "GRANT" / "REVOKE" / "ESCALATE" -- tag style |
| Timestamp | 80px | Relative time, `--sds-text-tertiary` |
| Severity | 80px | `sds-tag--error` "High" / `sds-tag--warning` "Medium" |

Row click: navigates to Risk Detail > Access Analysis tab filtered to that user.

**Connection Status Card**:
- Title: "Connection Status"
- Header action: tertiary "Manage connections"
- Body: compact status list

```
Each connection row:
  Layout: flex, align-items center, gap 12px
  Padding: 8px 0
  Border-bottom: 1px solid var(--sds-border-subtle)

  Status dot: sds-dot component
    Healthy: sds-dot--success
    Warning: sds-dot--warning
    Error:   sds-dot--error

  Connection name: 13px / 500 / var(--sds-text-primary)
  Platform icon: 16x16px, left of name

  Last checked: right-aligned
    Font: 12px / 400
    Color: var(--sds-text-tertiary)
    Example: "5m ago"
```

---

#### 5.1.5 Activity Feed (All Views)

Below the persona-specific content, all views share a live activity feed:

**Container**: `sds-card` with `.sds-card-header--bordered` + `.sds-card-body`.
- Title: "Recent Activity"
- Header actions: filter dropdown ("All" | "Risk changes" | "Access" | "Scans") + tertiary "View all"

**Feed items**:

```
Each item:
  Layout: flex, gap 12px
  Padding: 10px 0
  Border-bottom: 1px solid var(--sds-border-subtle)

  Left: Category tag (sds-tag component)
    Risk Change:   sds-tag--error
    Access:        sds-tag--warning
    Scan:          sds-tag--info
    Remediation:   sds-tag--success
    System:        sds-tag--neutral

  Center (flex: 1):
    Description: 13px / 400 / var(--sds-text-secondary)
    Example: "New sensitive field detected in Finance Transactions"

  Right:
    Timestamp: 12px / 400 / var(--sds-text-tertiary)
    Example: "2 hours ago"

Feed shows 5 items by default.
Footer: "View all activity" tertiary link, right-aligned.
```

---

#### 5.1.6 Dashboard State Variations

**Empty state** (no classified data):

```
Full content area replaced by centered empty state:
  Icon: 48px, muted (shield icon with question mark)
    Color: var(--sds-color-warm-gray-300) at 50% opacity
  Title: "Calculate your first risk score"
    Font: 18px / 600 / var(--sds-text-primary)
    Margin-top: 16px
  Description: "Connect a data source, run a scan, and review
    classifications to generate your organization's risk score."
    Font: 14px / 400 / var(--sds-text-secondary)
    Max-width: 420px
    Margin-top: 8px
    Text-align: center
  Progress steps:
    3 horizontal steps with connecting lines
    Step 1: "Connect" -- check icon if done, number if not
    Step 2: "Scan" -- check icon if done, number if not
    Step 3: "Classify" -- check icon if done, number if not
    Active step: var(--sds-interactive-primary)
    Completed: var(--sds-status-success-strong)
    Pending: var(--sds-color-warm-gray-300)
  CTA: Primary button "Connect data source"
    Component: .btn-primary.btn-md
```

**Loading state**:

```
Skeleton pattern:
  - Gauge card: circular skeleton pulse
  - Metric cards: rectangular skeleton blocks (match card dimensions)
  - Tables: 5 rows of skeleton bars
  - Skeleton color: var(--sds-color-warm-gray-100)
  - Pulse animation: opacity 0.4 to 1.0, 1.5s, ease-in-out, infinite
```

**Error state**:

```
Alert banner at top of content area:
  Background: var(--sds-status-error-bg) (#FFEEEB)
  Border: 1px solid var(--sds-color-red-200) (#F2BDB6)
  Border-radius: 8px
  Padding: 12px 16px
  Icon: alert-triangle, 16px, var(--sds-status-error-text)
  Text: "Unable to load risk data. Please try again."
    Font: 13px / 500 / var(--sds-status-error-text)
  Action: tertiary button "Retry" right-aligned
```

---

### 5.2 Risk Detail

**Purpose**: Deep dive into a specific risk area or the overall risk breakdown. Reached by clicking the risk score gauge, a row in the Top Risks table, or any drill-down link. Tabbed layout with 4 content tabs.

#### Shell & Layout

Same Full App Shell as Dashboard. Breadcrumb navigation added.

#### Content Hierarchy

```
+---------------------------------------------------------------+
| Breadcrumb: Risk Assessment > Risk Detail                      |
| Title: "Risk Detail: Unprotected PII in Snowflake Prod"       |
|                                    [Snooze] [Acknowledge]      |
|                                                                |
| Tabs: Risk Factors | Access Analysis | Regulation Map | Recs  |
+---------------------------------------------------------------+
| [TAB CONTENT -- see below]                                     |
+---------------------------------------------------------------+
```

##### Page Header

```
Breadcrumb:
  "Risk Assessment" (link) > "Risk Detail"
  Font: 13px / 400
  Link color: var(--sds-text-link) (#013D5B)
  Separator: " > " in var(--sds-text-tertiary)
  Margin-bottom: 4px

Title:
  Font: 24px / 600 / var(--sds-text-primary)
  Margin-bottom: 8px

Subtitle (risk score inline):
  Risk score badge: tag showing impact score
    sds-tag--error (if high/critical), sds-tag--warning (moderate), sds-tag--success (low)
    Example: sds-tag--error "Impact: 18 points"
  Font: 13px inline with subtitle text

Right-aligned actions:
  [Snooze (secondary btn-md)] [Acknowledge (secondary btn-md)]
  Both use .btn-secondary.btn-md from /components/buttons.html

Page Tabs (sds-tabs component):
  "Risk Factors" | "Access Analysis" | "Regulation Mapping" | "Recommendations"
  Uses .sds-tabs from /components/tabs.html
  Active tab: .is-active with blue-750 underline
  Badge counts on each tab: sds-tab-badge
    Risk Factors: count of open items
    Access Analysis: count of access entries
    Regulation Mapping: count of applicable regulations
    Recommendations: count of recommendations
```

##### Tab 1: Risk Factors

```
+---------------------------------------------------------------+
| Filter bar: [Classification type v] [Severity v] [Source v]   |
+---------------------------------------------------------------+
| Risk factor list (data table):                                 |
| [ ] | Factor               | Classification | Sev. | Source   |
|-----|----------------------|----------------|------|----------|
| [ ] | SSN column unmasked  | PII - SSN      | Crit | Snowfl.  |
| [ ] | Email in plaintext   | PII - Email    | High | BigQry   |
| [ ] | CC number exposed    | PCI - PAN      | Crit | AWS RDS  |
+---------------------------------------------------------------+
| Bulk action bar (appears when rows selected):                  |
| X selected   [Remediate] [Simulate] [Snooze] [Acknowledge]   |
+---------------------------------------------------------------+
```

**Filter bar** (above table):
- Layout: flex, gap 12px
- 3 dropdown filters: `.btn-secondary.btn-sm`
- Filter chips appear below when active: `--sds-interactive-primary-subtle` background, `--sds-interactive-primary` text, 13px, pill shape, with "x" dismiss

**Table specification**: Same base table style as dashboard Top Risks table.

| Column | Width | Content |
|--------|-------|---------|
| Checkbox | 40px | Checkbox input |
| Risk Factor | flex | 13px/500, `--sds-text-primary`, truncate at 2 lines |
| Classification | 140px | `sds-tag` with classification type |
| Severity | 80px | `sds-tag`: Critical (error), High (error lighter), Medium (warning), Low (success) |
| Source | 120px | Connection name with platform icon |
| Impact | 64px | Score number, right-aligned |

**Bulk action toolbar** (appears on selection):
- Slides down from below filter bar
- Background: `var(--sds-interactive-primary-subtle)` (#D9EBED)
- Padding: 8px 16px
- Border-radius: 8px
- Content: "[count] selected" + action buttons
- Buttons: `.btn-sm` -- Remediate (primary), Simulate (secondary), Snooze (secondary), Acknowledge (secondary)
- Delete/dismiss: `.btn-danger-outline.btn-sm`

##### Tab 2: Access Analysis

```
+---------------------------------------------------------------+
| Platform selector: [All Platforms v]                           |
+---------------------------------------------------------------+
| Platform-specific access table:                                |
|                                                                |
| For Snowflake:                                                 |
| Role          | Type    | Privileges      | Scope   | Risk    |
|---------------|---------|-----------------|---------|---------|
| ACCOUNTADMIN  | System  | FULL            | Global  | Crit    |
| SYSADMIN      | System  | DDL, DML        | Global  | High    |
| ANALYST_ROLE  | Custom  | SELECT          | DB: fin | Low     |
|                                                                |
| For AWS:                                                       |
| IAM Policy    | Type    | Actions         | Resource| Risk    |
|---------------|---------|-----------------|---------|---------|
| AdminAccess   | Managed | s3:*, rds:*     | *       | Crit    |
+---------------------------------------------------------------+
```

**Platform selector**: Toggle tabs (`.sds-toggle-tabs`) showing available platforms.

**Access tables**: Same base table style. Each platform has custom columns showing native access identifiers.

**Snowflake columns**: Role | Role Type | Privileges | Scope | Risk Level
**AWS columns**: IAM Policy | Policy Type | Actions | Resource | Risk Level
**Databricks columns**: Workspace | Permission | Cluster Access | Risk Level
**BigQuery columns**: Dataset | IAM Binding | Authorized Views | Risk Level

Each access entry has a "docs" icon link (12px, `--sds-text-link`) pointing to the source platform's documentation for that permission type.

**Unsupported platform fallback**: Info banner using `--sds-status-info-bg` and `--sds-status-info-text`: "Platform-specific access details coming soon for [platform]. Showing generic access information."

##### Tab 3: Regulation Mapping

```
+---------------------------------------------------------------+
| Regulation cards in a list:                                    |
|                                                                |
| +--GDPR------------------------------------------------------+|
| | Status: sds-tag--success "Compliant"  or  --error "Gaps"  ||
| | Requirements: 42/49 met                                     ||
| | +--Requirement checklist (collapsed by default)----------+ ||
| | | [x] Article 5 - Data minimization          PASS        | ||
| | | [ ] Article 17 - Right to erasure          FAIL        | ||
| | | [x] Article 25 - Data protection by design PASS        | ||
| | +-------------------------------------------------------+ ||
| | [View regulation detail]                                    ||
| +-------------------------------------------------------------+|
+---------------------------------------------------------------+
```

Each regulation uses `sds-card` with expandable checklist:

**Card header**: Regulation name + status tag
**Card body**: Summary stats (requirements met / total) + expandable checklist
**Checklist items**:
- Pass: green check icon (16px), `--sds-status-success-text`, text in `--sds-text-primary`
- Fail: red x icon (16px), `--sds-status-error-text`, text in `--sds-text-primary`
- Each item clickable to navigate to evidence

**Card footer**: Tertiary link "View regulation detail" navigates to Regulation Detail screen.

##### Tab 4: Recommendations

```
+---------------------------------------------------------------+
| Prioritized recommendation list:                               |
|                                                                |
| +--Recommendation 1---------------------------------------+   |
| | Priority: sds-tag--error "Critical"                      |   |
| | "Tokenize 234 PII columns in Snowflake Prod"            |   |
| | Impact: -12 risk points   Effort: Medium                 |   |
| | [Remediate] [Simulate]                                   |   |
| +----------------------------------------------------------+   |
| +--Recommendation 2---------------------------------------+   |
| | Priority: sds-tag--warning "High"                        |   |
| | "Revoke ACCOUNTADMIN from 3 non-admin users"             |   |
| | Impact: -8 risk points   Effort: Low                     |   |
| | [Remediate] [Simulate]                                   |   |
| +----------------------------------------------------------+   |
+---------------------------------------------------------------+
```

Each recommendation uses `sds-card` (body only):

```
Card padding: 16px 20px

Priority tag: top-right, sds-tag component
  Critical: sds-tag--error
  High:     sds-tag--warning
  Medium:   sds-tag--info
  Low:      sds-tag--neutral

Title:
  Font: 14px / 600 / var(--sds-text-primary)
  Margin-bottom: 8px

Description:
  Font: 13px / 400 / var(--sds-text-secondary)
  Margin-bottom: 12px

Impact + Effort row:
  Layout: flex, gap 24px
  "Impact: -12 risk points" -- 13px/500, green color (var(--sds-status-success-text))
  "Effort: Medium" -- 13px/400, var(--sds-text-tertiary)

Actions:
  Layout: flex, gap 8px, margin-top 12px
  [Remediate] -- btn-primary btn-sm
  [Simulate] -- btn-secondary btn-sm

Card margin-bottom: 12px between cards
```

**Simulate click**: Opens the Risk Simulation drawer (see Section 5.3) pre-populated with this recommendation's items.

**Remediate click**: Navigates to Remediation flow (Flow 4) with full context carried over.

#### State Variations

**Loading**: Skeleton pattern matching tab content structure
**Error**: Error banner at top of tab content area (same style as dashboard error)
**Empty tab**: Centered message "No [tab content type] found" with relevant CTA

---

### 5.3 Risk Simulation (Drawer)

**Purpose**: Preview the impact of remediating selected items before committing. Launched from Risk Detail "Simulate" buttons. Renders as a right-side drawer panel overlaying the content area.

#### Shell & Layout

**Drawer panel (right-side overlay)**:

```
+----------+-------------------------------------------+
| Sidebar  | Content Area (dimmed)  | Simulation Drawer |
| 220px    |                        | 480px             |
|          |                        |                   |
+----------+-------------------------------------------+
```

**Drawer specification**:

```
Position: fixed, right: 0, top: 56px (below header), bottom: 0
Width: 480px
Background: var(--sds-bg-card) (#FFFFFF)
Border-left: 1px solid var(--sds-border-default) (#E0DCD3)
Box-shadow: -4px 0 24px rgba(0,0,0,0.08)
Z-index: 100
Overflow-y: auto

Animation (open):
  Slides in from right
  Duration: 300ms
  Easing: cubic-bezier(0.4, 0, 0.2, 1)
  Content area dims to rgba(0,0,0,0.15) backdrop

Animation (close):
  Slides out to right
  Duration: 200ms
  Backdrop fades out
```

#### Content Hierarchy

```
+---Simulation Drawer (480px)---------------------------+
| HEADER                                                 |
| "Risk Simulation"                          [X close]  |
+-------------------------------------------------------+
| SCORE COMPARISON                                       |
| Current: 62      -->      Projected: 47               |
| [gauge mini]              [gauge mini]                 |
|               Delta: -15 points                        |
+-------------------------------------------------------+
| FILTERS                                                |
| [Connection v] [Classification v] [Action type v]     |
| Active filters: [Snowflake x] [PII x]                |
+-------------------------------------------------------+
| ITEM CHECKLIST                                         |
| [x] Tokenize SSN columns (12 cols)           -4 pts  |
| [x] Mask email addresses (8 cols)             -3 pts  |
| [ ] Revoke broad access grants (4 grants)     -5 pts  |
| [ ] Apply retention policy (Finance DB)       -3 pts  |
+-------------------------------------------------------+
| ITEMIZED IMPACT                                        |
| Change breakdown:                                      |
| -4  Tokenization of PII columns                       |
| -3  Email masking applied                              |
+-------------------------------------------------------+
| FOOTER                                                 |
| [Cancel (secondary)]  [Proceed to Remediate (primary)] |
+-------------------------------------------------------+
```

##### Drawer Header

```
Layout: flex, justify-content space-between, align-items center
Padding: 16px 24px
Border-bottom: 1px solid var(--sds-border-default)
Background: var(--sds-bg-card)
Position: sticky, top: 0

Title: "Risk Simulation"
  Font: 18px / 600 / var(--sds-text-primary)

Close button: btn-tertiary icon-only (X icon)
  Size: 32px x 32px
  Icon: 16px
  Hover: var(--sds-bg-subtle) background
```

##### Score Comparison Section

```
Padding: 24px
Background: var(--sds-bg-surface) (#FAF8F5)
Border-bottom: 1px solid var(--sds-border-subtle)

Layout: 3-column flex
  Left: "Current" section
    Label: 12px / 600 / uppercase / var(--sds-text-tertiary)
    Score: 32px / 700 / color matches current zone
    Mini gauge: 80px wide, simplified arc (same zone colors)

  Center: Arrow indicator
    Right-pointing arrow icon: 24px
    Color: var(--sds-text-tertiary)
    Delta below arrow: "-15 points"
    Font: 14px / 600
    Color: var(--sds-status-success-text) (green, because decrease is good)

  Right: "Projected" section
    Label: 12px / 600 / uppercase / var(--sds-text-tertiary)
    Score: 32px / 700 / color matches projected zone
    Mini gauge: 80px wide, same as current but showing projected value
    Dashed stroke style for projected arc (to differentiate from "actual")

Projected score updates in real-time as user checks/unchecks items.
Animation: number and gauge animate on change (300ms transition)
```

##### Filter Section

```
Padding: 16px 24px
Border-bottom: 1px solid var(--sds-border-subtle)

Filter dropdowns: 3 side-by-side
  .btn-secondary.btn-sm
  Options:
    Connection: All / [each connection name]
    Classification: All / PII / PCI / PHI / Financial / Custom
    Action type: All / Tokenize / Mask / Revoke / Delete / Policy

Active filter chips (below dropdowns, 8px gap above):
  Background: var(--sds-interactive-primary-subtle) (#D9EBED)
  Text: var(--sds-interactive-primary) (#013D5B)
  Font: 12px / 500
  Padding: 3px 8px 3px 10px
  Border-radius: 12px
  Dismiss "x": 12px icon, hover darkens

Filter preset links (below chips):
  "Quick filters:" label in 12px / var(--sds-text-tertiary)
  Links: "All PCI in Snowflake" | "All unprotected PII"
  Style: tertiary link, 12px, var(--sds-text-link)
  Click: populates filters and checks matching items
```

##### Item Checklist

```
Padding: 0 24px
Max-height: calc(100vh - [header + score + filters + footer])
Overflow-y: auto

Select all row:
  Padding: 12px 0
  Border-bottom: 1px solid var(--sds-border-default)
  Checkbox + "Select all ([count] items)" -- 13px / 500 / var(--sds-text-primary)

Each item:
  Padding: 10px 0
  Border-bottom: 1px solid var(--sds-border-subtle)
  Layout: flex, align-items flex-start, gap 12px

  Checkbox: 16px x 16px
    Unchecked border: var(--sds-border-strong) (#D0CBC3)
    Checked: var(--sds-interactive-primary) fill, white checkmark
    Focus: var(--sds-border-focus) ring

  Content (flex: 1):
    Title: 13px / 500 / var(--sds-text-primary)
      Example: "Tokenize SSN columns"
    Detail: 12px / 400 / var(--sds-text-tertiary)
      Example: "12 columns in Snowflake Prod > FINANCE_DB"

  Impact (right-aligned):
    Font: 13px / 600
    Color: var(--sds-status-success-text) (#62800B) for negative (reduction)
    Example: "-4 pts"

  Item hover: background var(--sds-bg-subtle), border-radius 4px
  Checked items: subtle green-tinted background var(--sds-status-success-bg) (#F4FAEB)
```

##### Itemized Impact Section

```
Padding: 16px 24px
Border-top: 1px solid var(--sds-border-default)
Background: var(--sds-bg-surface)

Title: "Impact Breakdown"
  Font: 13px / 600 / var(--sds-text-primary)
  Margin-bottom: 8px

Each impact line (only for checked items):
  Layout: flex, gap 8px
  Delta: 13px / 600 / monospace / var(--sds-status-success-text)
    Width: 40px, right-aligned
  Description: 13px / 400 / var(--sds-text-secondary)
  Gap between lines: 4px

Updates in real-time as items are checked/unchecked.
```

##### Drawer Footer

```
Position: sticky, bottom: 0
Padding: 16px 24px
Border-top: 1px solid var(--sds-border-default)
Background: var(--sds-bg-card)

Layout: flex, justify-content flex-end, gap 12px

Buttons:
  [Cancel] -- .btn-secondary.btn-md
  [Proceed to Remediate] -- .btn-primary.btn-md

Cancel: closes drawer, no state change
Proceed: navigates to Remediation flow (Flow 4)
  Carries over: checked items, filter selections, projected score
```

#### State Variations

**Empty (no items match filters)**: Centered message in checklist area: "No items match your filters. Try adjusting your criteria." with "Clear filters" tertiary link.

**Loading**: Skeleton blocks in checklist area while items load.

**All items selected**: "Select all" checkbox checked, score comparison shows maximum possible reduction.

**No items selected**: Projected score equals current score, delta shows "0 points", "Proceed to Remediate" button disabled (`--sds-text-disabled`, cursor: not-allowed).

---

### 5.4 Regulation Detail

**Purpose**: Per-regulation compliance deep dive. Shows requirements checklist with pass/fail status, evidence links, gap analysis, and remediation suggestions. Reached from dashboard Compliance Summary cards or Risk Detail Regulation Mapping tab.

#### Shell & Layout

Same Full App Shell. Breadcrumb shows: Risk Assessment > Regulation Detail.

#### Content Hierarchy

```
+---------------------------------------------------------------+
| Breadcrumb: Risk Assessment > GDPR                             |
| Title: "GDPR Compliance"                                      |
| Subtitle: General Data Protection Regulation                   |
|                                    [Generate Report] [Export]  |
+---------------------------------------------------------------+
| Summary Cards (3-up):                                          |
| +----------+ +----------+ +----------+                        |
| |Compliance|  |Require-  |  |Gaps     |                        |
| |Score     |  |ments Met |  |Identified|                       |
| | 85%      |  | 42/49    |  |  7      |                        |
| +----------+ +----------+ +----------+                        |
+---------------------------------------------------------------+
| Requirements Checklist Card:                                   |
| +--Requirements--(42/49 met)-------- [Filter: All v]---------+|
| |                                                             ||
| | [x] Art. 5(1)(c) - Data minimization               PASS   ||
| |     Evidence: Classification scan covers 98% of columns    ||
| |                                                             ||
| | [ ] Art. 17 - Right to erasure                      FAIL   ||
| |     Gap: No automated deletion workflow configured          ||
| |     Suggestion: "Configure retention policies..."          ||
| |     [Remediate gap]                                         ||
| |                                                             ||
| | [!] Art. 17 conflicts with HIPAA 45 CFR 164.530   CONFLICT||
| |     Resolution: Manual review required                      ||
| |     [View guidance]                                         ||
| +-------------------------------------------------------------+|
+---------------------------------------------------------------+
| Gap Analysis Card:                                             |
| +--Gap Analysis---[By severity v]---------[Remediate all]----+|
| | Gap                    | Severity | Affected Data | Action  ||
| |------------------------|----------|---------------|---------|
| | No erasure workflow    | Critical | All PII       | Fix     ||
| | Consent not tracked    | High     | Marketing DB  | Fix     ||
| +-------------------------------------------------------------+|
+---------------------------------------------------------------+
| Affected Data Inventory Card:                                  |
| +--Affected Data---[Export]---------------------------------+  |
| | Data Source  | Table       | Columns | Classification     |  |
| |--------------|-------------|---------|-------------------|  |
| | Snowflake    | users       | 12      | PII, PCI          |  |
| | BigQuery     | transactions| 8       | PCI, Financial    |  |
| +------------------------------------------------------------+  |
+---------------------------------------------------------------+
```

##### Page Header

```
Breadcrumb:
  "Risk Assessment" (link) > "GDPR"
  Same styling as Risk Detail breadcrumb

Title: "GDPR Compliance"
  Font: 24px / 600 / var(--sds-text-primary)

Subtitle: "General Data Protection Regulation"
  Font: 14px / 400 / var(--sds-text-secondary)
  Margin-top: 4px

Right-aligned actions:
  [Generate Report] -- btn-primary btn-md with document icon
  [Export] -- btn-secondary btn-md with download icon
```

##### Summary Cards (3-up grid)

Same metric card pattern as dashboard. Gap: 16px. `grid-template-columns: repeat(3, 1fr)`.

| Card | Label | Value | Color logic |
|------|-------|-------|-------------|
| Compliance Score | "Compliance Score" | "85%" | Green >=90%, yellow 70-89%, red <70% |
| Requirements Met | "Requirements Met" | "42 of 49" | `--sds-text-primary` |
| Gaps Identified | "Gaps Identified" | "7" | `--sds-status-error-text` if >0, `--sds-status-success-text` if 0 |

##### Requirements Checklist Card

**Container**: `sds-card` with `.sds-card-header--bordered` + `.sds-card-body`.
- Title: "Requirements" + `sds-tab-badge` showing "42/49 met"
- Header action: Filter dropdown ("All" | "Passing" | "Failing" | "Conflicts")

**Checklist items**:

```
Each requirement:
  Padding: 12px 0
  Border-bottom: 1px solid var(--sds-border-subtle)

  Status icon (left, 20px):
    PASS:     green check circle -- fill var(--sds-status-success-strong) (#7A9A01)
    FAIL:     red x circle -- fill var(--sds-status-error-strong) (#CF6253)
    CONFLICT: yellow warning triangle -- fill var(--sds-status-warning-strong) (#EBCE2D)

  Requirement text:
    Title: 13px / 500 / var(--sds-text-primary)
      Format: "Art. [number] - [short name]"
    Status tag (right): sds-tag component
      PASS: sds-tag--success
      FAIL: sds-tag--error
      CONFLICT: sds-tag--warning

  Expanded content (below title, 8px padding-left for indent):
    PASS items:
      Evidence text: 12px / 400 / var(--sds-text-tertiary)
      Link to evidence: "View scan results" -- tertiary link

    FAIL items:
      Gap description: 12px / 400 / var(--sds-status-error-text)
      Suggestion: 12px / 400 / var(--sds-text-secondary)
      Action: btn-secondary btn-sm "Remediate gap"

    CONFLICT items:
      Conflict description: 12px / 400 / var(--sds-status-warning-text)
      Background: var(--sds-status-warning-bg) (#FCF9D9)
      Padding: 8px 12px, border-radius 6px
      Link: "View guidance" -- tertiary link
```

Items are expandable/collapsible. Default: FAIL and CONFLICT items expanded, PASS items collapsed.

##### Gap Analysis Card

**Container**: `sds-card` with `.sds-card-header--bordered` + `.sds-card-body`.
- Title: "Gap Analysis"
- Header actions: Sort dropdown ("By severity" | "By affected data volume" | "By effort") + "Remediate all" primary btn-sm

**Table columns**:

| Column | Width | Content |
|--------|-------|---------|
| Gap | flex | 13px/500, `--sds-text-primary` |
| Severity | 80px | `sds-tag`: Critical (error), High (warning), Medium (info) |
| Affected Data | 120px | Count of affected columns/tables |
| Effort | 80px | "Low" / "Medium" / "High" in `--sds-text-tertiary` |
| Action | 64px | Tertiary button "Fix" -- navigates to Remediation |

##### Affected Data Inventory Card

**Container**: `sds-card` with `.sds-card-header--bordered` + `.sds-card-body`.
- Title: "Affected Data"
- Header action: "Export" secondary btn-sm

Standard data table with columns:

| Column | Width | Content |
|--------|-------|---------|
| Data Source | 140px | Platform icon + connection name |
| Table/Schema | flex | Full path, 13px/400 |
| Columns | 80px | Count, right-aligned |
| Classifications | 160px | Multiple `sds-tag` components |
| Protection Status | 120px | `sds-tag--success` "Protected" / `sds-tag--error` "Unprotected" |

#### State Variations

**Loading**: Skeleton blocks matching section structure.

**Empty (no requirements data)**: "No compliance data available for [regulation]. Configure regulation requirements to begin tracking." with CTA.

**All passing**: Celebratory state -- compliance score card gets a subtle green border (`var(--sds-status-success-strong)`), requirements checklist defaults to all collapsed.

**Error (report generation fails)**: Toast notification at bottom-right: "Report generation failed. Please try again." with error styling.

---

## Component Inventory Summary

| Component | DS Source | Used In |
|-----------|----------|---------|
| Header | `/components/header.html` | All screens (shell) |
| Side Navigation | `/components/side-navigation.html` | All screens (shell) |
| Toggle Tabs | `/components/tabs.html` (`.sds-toggle-tabs`) | Dashboard persona toggle, Access Analysis platform toggle |
| Page Tabs | `/components/tabs.html` (`.sds-tabs`) | Risk Detail |
| Cards | `/components/cards.html` (`.sds-card`) | All screens -- metric cards, chart containers, content panels |
| Tags | `/components/tags.html` (`.sds-tag`) | All screens -- status indicators, severity labels, classification labels |
| Badges | `/components/tags.html` (`.sds-badge`) | Tab counts, notification counts |
| Status Dots | `/components/tags.html` (`.sds-dot`) | Connection status, access status |
| Buttons (Primary) | `/components/buttons.html` (`.btn-primary`) | CTAs: Remediate, Generate Report, Deploy |
| Buttons (Secondary) | `/components/buttons.html` (`.btn-secondary`) | Filters, Export, Snooze, Acknowledge |
| Buttons (Tertiary) | `/components/buttons.html` (`.btn-tertiary`) | View links, Dismiss, inline actions |
| Buttons (Danger) | `/components/buttons.html` (`.btn-danger-outline`) | Destructive bulk actions |

### New Components Needed

| Component | Description | Recommendation |
|-----------|-------------|----------------|
| **SVG Gauge** | Semi-circle arc gauge with animated fill, color zones, and needle | Custom component. Build with SVG `<path>` elements and CSS animations. No DS equivalent exists. |
| **SVG Donut Chart** | Segmented donut with hover expansion, center text, and legend | Custom component. Pure SVG with JS event handlers for interaction. |
| **Sparkline** | 30-point line chart with trend indicator | Custom component. Lightweight SVG `<polyline>`. |
| **Heatmap Grid** | Connections x time matrix with color-coded cells | Custom component. CSS Grid with dynamic cell coloring. |
| **Drawer Panel** | Right-side overlay panel with sticky header/footer | Custom component. Fixed positioning with slide animation. Consider making this a reusable DS component. |
| **Progress Bar** | Horizontal bar with fill, used in compliance percentages | Custom component. Simple CSS with dynamic width. |
| **Checklist** | Expandable requirement items with pass/fail/conflict states | Custom component. Builds on card + tag patterns. |
| **Filter Chips** | Removable pill-shaped active filter indicators | Uses `--sds-interactive-primary-subtle` tokens. Could extend tag component. |
| **Skeleton Loader** | Pulsing placeholder blocks for loading states | Custom component. Generic enough to add to DS. |
| **Alert Banner** | Dismissible banner for score changes, staleness warnings, errors | Custom component. Uses status token sets. |

---

## Token Reference Quick Index

### Backgrounds

| Usage | Token | Value |
|-------|-------|-------|
| Page | `--sds-bg-page` | #FFFFFF |
| Surface (cards on colored bg) | `--sds-bg-surface` | #FAF8F5 |
| Card | `--sds-bg-card` | #FFFFFF |
| Subtle (table headers, inactive) | `--sds-bg-subtle` | #F4F1EB |
| Sidebar | `--sds-nav-sidebar-bg` | #FAF8F5 |

### Text

| Usage | Token | Value |
|-------|-------|-------|
| Primary (titles, values) | `--sds-text-primary` | #1C1A17 |
| Secondary (body, descriptions) | `--sds-text-secondary` | #54514D |
| Tertiary (timestamps, help) | `--sds-text-tertiary` | #6B6760 |
| Disabled | `--sds-text-disabled` | #B0ABA2 |
| Links | `--sds-text-link` | #013D5B |
| On primary (white on blue) | `--sds-text-on-primary` | #FFFFFF |

### Borders

| Usage | Token | Value |
|-------|-------|-------|
| Default (cards, dividers) | `--sds-border-default` | #E0DCD3 |
| Subtle (row separators) | `--sds-border-subtle` | #EBE6DD |
| Strong (filter chip borders) | `--sds-border-strong` | #D0CBC3 |
| Focus ring | `--sds-border-focus` | #013D5B |

### Status Colors

| Status | Background | Text | Strong |
|--------|-----------|------|--------|
| Success | `--sds-status-success-bg` #F4FAEB | `--sds-status-success-text` #62800B | `--sds-status-success-strong` #7A9A01 |
| Warning | `--sds-status-warning-bg` #FCF9D9 | `--sds-status-warning-text` #8A7515 | `--sds-status-warning-strong` #EBCE2D |
| Error | `--sds-status-error-bg` #FFEEEB | `--sds-status-error-text` #BF5547 | `--sds-status-error-strong` #CF6253 |
| Info | `--sds-status-info-bg` #EBF4F5 | `--sds-status-info-text` #0C4A69 | -- |
| Neutral | `--sds-status-neutral-bg` #EBE6DD | `--sds-status-neutral-text` #54514D | -- |

### Interactive

| Usage | Token | Value |
|-------|-------|-------|
| Primary (buttons, active tabs) | `--sds-interactive-primary` | #013D5B |
| Primary hover | `--sds-interactive-primary-hover` | #05314D |
| Primary active | `--sds-interactive-primary-active` | #032740 |
| Primary subtle (selected bg) | `--sds-interactive-primary-subtle` | #D9EBED |

### Risk Score Zone Colors

| Zone | Arc/Gauge | Score Number | DS Token Basis |
|------|----------|-------------|----------------|
| Low (0-25) | #7A9A01 | #62800B | `--sds-color-green-400` / `--sds-color-green-500` |
| Moderate (26-50) | #C4AA25 | #8A7515 | `--sds-color-yellow-300` / `--sds-color-yellow-500` |
| High (51-75) | #EEA79E | #DB7060 | `--sds-color-red-250` / `--sds-color-red-400` |
| Critical (76-100) | #BF5547 | #BF5547 | `--sds-color-red-500` / `--sds-status-error-text` |

---

## Interaction Summary

### Animations

| Element | Trigger | Duration | Easing | Description |
|---------|---------|----------|--------|-------------|
| Risk gauge fill | Page load | 1200ms | cubic-bezier(0.4, 0, 0.2, 1) | Arc draws from 0 to value, score counts up |
| Score number | Page load | 1200ms | Synced with gauge | Counts from 0 to current score |
| Sparkline draw | Page load (400ms delay) | 800ms | ease-out | Line draws left to right |
| Donut segments | Page load | 800ms | cubic-bezier(0.4, 0, 0.2, 1) | Segments grow from 0 |
| Recalculating pulse | Classification change | 1500ms loop | ease-in-out | Opacity 0.5 to 1.0 |
| Score change (delta) | Value update | 600ms | ease-out | Number ticks to new value, color transitions |
| Drawer open | Simulate click | 300ms | cubic-bezier(0.4, 0, 0.2, 1) | Slides in from right |
| Drawer close | Cancel/close click | 200ms | ease-in | Slides out to right |
| Simulation score update | Checkbox toggle | 300ms | ease-out | Number and mini gauge animate to new projected value |
| Celebratory flash | Score drops | 400ms | ease-out | Green flash on gauge area |
| Critical glow | Score in 76-100 | 2000ms loop | ease-in-out | Subtle red glow pulse around gauge |

### Keyboard Navigation

| Context | Key | Action |
|---------|-----|--------|
| Toggle tabs | Arrow Left/Right | Move between persona views |
| Page tabs | Arrow Left/Right | Move between detail tabs |
| Data tables | Arrow Up/Down | Move between rows |
| Data tables | Enter | Activate row (same as click) |
| Drawer | Escape | Close drawer |
| Checkboxes | Space | Toggle check state |
| Filter dropdown | Enter | Open/confirm dropdown |

### Accessibility Requirements

- All charts include `aria-label` with textual equivalent of the visual data
- Gauge: `role="img"` with `aria-label="Risk score: 62 out of 100, High Risk"`
- Donut: `role="img"` with `aria-label="Protection coverage: 73% protected, 20% unprotected, 7% excluded"`
- Heatmap: Rendered as HTML table with proper `<th>` scope attributes for screen readers
- Color is never the sole indicator -- all status uses icon + text + color
- Focus management: drawer traps focus when open, returns focus to trigger on close
- All interactive elements have `:focus-visible` outline using `var(--sds-border-focus)`
- Minimum contrast ratios: 4.5:1 for text, 3:1 for large text and UI components
