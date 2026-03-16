# Flow 7: Onboarding & First-Time Experience -- Design Specification

## Document Info

| Field | Value |
|-------|-------|
| Flow | 7 -- Onboarding & First-Time Experience |
| Version | 1.0 |
| Date | 2026-03-14 |
| Design System | Software DS (semantic tokens: `--sds-*`) |
| Primary Persona | Jordan (Data Engineer), with handoff moments for Priya and Marcus |
| Target | First risk score visible within 30 minutes |

---

## 1. Feature Requirements

### Problem Statement

New users signing up for the data security platform face a cold-start problem: no data sources connected, no scans run, no risk scores calculated. Without guided onboarding, time-to-first-value stretches from minutes to weeks. The onboarding flow must compress the full product lifecycle (connect, scan, classify, assess, act) into a guided 30-minute experience that delivers an immediate, tangible result -- the user's first risk score.

### Users

| Persona | Role | Onboarding Goal |
|---------|------|-----------------|
| **Jordan** | Data Engineer | Connect a data source, run a scan, see classifications working. Wants technical credibility fast. |
| **Priya** | Governance Analyst | Understand classification quality, review a few items, confirm the system is trustworthy. |
| **Marcus** | Security Leader / Executive | See the risk score, understand what it means, decide whether to invest team time. Needs value proof before committing. |

### Success Metrics

| Metric | Target |
|--------|--------|
| Time to first risk score | < 30 minutes (OAuth path < 20 min) |
| Onboarding completion rate | > 70% complete all 5 steps |
| Abandonment recovery | > 50% of users who leave mid-flow return within 24 hours |
| Marcus demo-to-real conversion | > 40% connect real data after demo |
| Skip-to-dashboard rate | < 15% (indicates onboarding is perceived as valuable) |

### User Stories

1. As a **new user**, I want to select my role so the onboarding experience is tailored to my priorities.
2. As **Jordan**, I want to connect a data source in under 5 minutes so I can see the platform working on real data.
3. As **Priya**, I want to review a small set of classifications with clear explanations so I can trust the system's accuracy.
4. As **Marcus**, I want to see a realistic demo dashboard immediately so I can evaluate the product without waiting for setup.
5. As **any user**, I want to skip onboarding at any point and return later without losing progress.
6. As a **returning user**, I want to resume onboarding where I left off so I do not repeat completed steps.

---

## 2. Design Rationale

| Decision | Chosen Approach | Alternatives Considered | Rationale |
|----------|----------------|------------------------|-----------|
| Onboarding structure | Linear 5-step wizard with skip capability | Free exploration with checklist; video walkthrough; interactive tutorial overlay | Linear flow provides clear progress and reduces decision fatigue. Skip capability respects expert users. Checklist alone lacks the guided momentum needed for 30-min target. |
| Persona selection | Card-based selection on Welcome screen | Survey/questionnaire; auto-detect from sign-up metadata; skip persona entirely | Cards are visually clear and fast (one click). Auto-detection is unreliable at sign-up. Survey adds friction. |
| Marcus path | Pre-loaded sample data demo environment | Recorded video demo; static screenshots; no special path | Interactive demo with real UI components lets Marcus explore at his own pace and builds confidence in the product's real capabilities. |
| guidedMode architecture | Shared components with boolean flag | Separate onboarding-only components; iframe-embedded tutorials; modal overlay system | Shared components mean zero maintenance divergence. Users see the real product from day one, just simplified. Reduces engineering cost and ensures consistency. |
| Progress tracking | Illustrated 5-step horizontal bar | Vertical stepper; circular progress; percentage bar | Horizontal bar is scannable, shows both completed and upcoming steps, and fits naturally below the header. Illustrations add delight. |
| Celebration moments | Micro-animations at each step + confetti at completion | Sound effects; points/gamification; no celebrations | Subtle animations reinforce progress without being patronizing. Confetti at the final moment creates a memorable "aha" transition. |
| Low-risk path | Monitoring setup instead of remediation | Show remediation anyway with sample data; skip step 5 entirely | Monitoring setup is genuinely useful for low-risk users and avoids a forced, artificial remediation. |

---

## 3. Pattern Recommendations

| Screen | Primary Pattern | Secondary Pattern | Rationale |
|--------|----------------|-------------------|-----------|
| Welcome | Empty State (centered) | -- | Clean, focused entry point. No data to display yet. Persona cards as the primary CTA. |
| Onboarding Dashboard | Dashboard (simplified) | CRUD Workflow (step cards) | Hub-and-spoke model. Step cards act as entry points to each sub-flow. |
| Guided Connection Setup | CRUD Workflow (create form) | Filter Panel (platform quick-select) | Wizard-style form with reduced options. Platform grid acts as a visual filter. |
| First Scan Progress | Progress + Education | -- | Real-time progress with educational annotations. No user action needed. |
| Guided Classification Review | Master-Detail View | Data Table with Inline Actions | Left list of 5 items, right detail panel with classification reasoning. Coach marks on first item. |
| Risk Score Reveal | Dashboard (executive) | -- | Single-metric hero with explanation panel. The dramatic reveal moment. |
| First Remediation | CRUD Workflow (guided action) | -- | Three-step guided flow: select action, preview impact, execute. |
| Recommended Monitoring Setup | CRUD Workflow (multi-step form) | -- | Three sequential configuration cards. Each card is a mini-form. |
| Marcus Demo | Dashboard (executive) + Master-Detail | -- | Full dashboard with sample data. Guided clickthrough overlay. |
| Onboarding Complete | Empty State (celebration) | -- | Transition screen. Full dashboard revealed behind confetti. |

---

## 4. Edge Cases & Considerations

| Category | Scenario | Design Response |
|----------|----------|-----------------|
| **Abandonment** | User closes browser mid-onboarding | Progress auto-saved. On return: resume banner at top of dashboard -- "Welcome back! You were on step 3. [Resume] [Start over]". Banner uses `--sds-status-info-bg` background. |
| **Skip all** | Expert user clicks "Skip to Dashboard" on Welcome | Full dashboard loads immediately. Onboarding checklist appears as a dismissible widget in the bottom-right corner. Widget uses `--sds-bg-elevated` with `--sds-border-default` border and subtle shadow. |
| **Large dataset** | First scan takes > 15 minutes | After 2 minutes on progress screen, show "Move to background" option. User can explore platform while scan runs. Notification badge appears on scan step when complete. |
| **No sensitive data** | Scan finds zero sensitive items | Special empty state: "No sensitive data detected in scanned schemas." Suggest adding more schemas or connections. Risk score shows 0 (Low) with positive messaging. |
| **Connection failure** | OAuth or credential error on first try | Encouraging error state: "That did not work, but it is common during first setup." Expandable troubleshooting checklist with top 3 causes for that platform. Retry button stays prominent. |
| **Multiple users** | Second team member signs up after Jordan completes setup | New user skips to step 3 (review) since connection and scan already exist. Progress bar shows steps 1-2 as completed by teammate. |
| **Demo to real** | Marcus transitions from demo to real data | Demo data is clearly labeled with `sds-tag--info` tags reading "Sample Data". On connecting real data, demo data hides (not deletes). Toggle in Settings to show/hide demo data. |
| **Low risk score** | First risk score is 0-25 | Step 5 routes to Recommended Monitoring Setup instead of First Remediation. Positive messaging celebrates good security posture. |
| **Browser resize** | User resizes below 1024px during onboarding | Sidebar collapses automatically. Content area remains usable. On mobile (< 768px), wizard steps stack vertically. Coach marks reposition to bottom sheets. |
| **Accessibility** | Screen reader user navigates onboarding | All progress steps have `aria-label` with completion state. Coach marks are announced via `aria-live="polite"`. Celebrations respect `prefers-reduced-motion`. |

---

## 5. Detailed Screen Layouts

---

### Screen 1: Welcome

**Purpose**: First impression after sign-up. Establishes product value, collects persona selection, and offers an escape hatch for expert users.

#### Shell & Layout

- **Shell**: Content-only (no sidebar, no header). Full-viewport centered layout.
- **Grid**: Single column, max-width 720px, centered horizontally and vertically.
- **Background**: `var(--sds-bg-surface)` (#FAF8F5) -- warm, approachable first impression.

#### Content Hierarchy

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                    [Logo Mark + Wordmark]                     │
│                         "Beacon"                             │
│                                                              │
│               ─────────── 32px gap ───────────               │
│                                                              │
│          "See your data risk score in 30 minutes"            │
│     "Connect a data source, discover what is sensitive,      │
│         and get your first security risk score."             │
│                                                              │
│               ─────────── 32px gap ───────────               │
│                                                              │
│     "I am a..."                                              │
│                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│  │  [Icon]      │ │  [Icon]      │ │  [Icon]      │         │
│  │              │ │              │ │              │         │
│  │ Data         │ │ Governance   │ │ Security     │         │
│  │ Engineer     │ │ Analyst      │ │ Leader       │         │
│  │              │ │              │ │              │         │
│  │ "Connect and │ │ "Classify    │ │ "Understand  │         │
│  │  scan data   │ │  and govern  │ │  risk and    │         │
│  │  sources"    │ │  sensitive   │ │  drive       │         │
│  │              │ │  data"       │ │  strategy"   │         │
│  └──────────────┘ └──────────────┘ └──────────────┘         │
│                                                              │
│               ─────────── 24px gap ───────────               │
│                                                              │
│              "Already know the product?"                     │
│              [Skip to Dashboard →]                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### Component Inventory

| Component | DS Reference | Notes |
|-----------|-------------|-------|
| Logo mark | Header component logo mark (`header-logo-mark`, 28x28px) | Scaled up to 48x48px for welcome screen. Background: `--sds-interactive-primary`. |
| Wordmark | `header-logo-text` pattern | Scaled to 20px / 600 weight. |
| Persona cards | `sds-card` (body-only variant) | 3-column grid, 16px gap. Interactive: clickable with hover state. Each card 200px wide. |
| Skip link | Tertiary button pattern (`btn-tertiary`) | Small size, centered below cards. |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Page background | background | `var(--sds-bg-surface)` |
| Headline | color | `var(--sds-text-primary)` |
| Headline | font | 28px / 700 |
| Subheadline | color | `var(--sds-text-secondary)` |
| Subheadline | font | 16px / 400, line-height 1.5 |
| "I am a..." label | color | `var(--sds-text-secondary)` |
| "I am a..." label | font | 14px / 500 |
| Persona card | background | `var(--sds-bg-card)` |
| Persona card | border | 1px solid `var(--sds-border-default)` |
| Persona card | border-radius | 8px |
| Persona card (hover) | border-color | `var(--sds-border-strong)` |
| Persona card (hover) | background | `var(--sds-bg-subtle)` |
| Persona card (selected) | border-color | `var(--sds-interactive-primary)` |
| Persona card (selected) | border-width | 2px |
| Persona card (selected) | background | `var(--sds-interactive-primary-subtle)` |
| Card icon container | background | `var(--sds-interactive-primary-subtle)` |
| Card icon container | size | 48x48px, border-radius 12px |
| Card icon | color (stroke) | `var(--sds-interactive-primary)` |
| Card icon | size | 24x24px |
| Card title | font | 16px / 600, `var(--sds-text-primary)` |
| Card description | font | 13px / 400, `var(--sds-text-secondary)` |
| Card internal padding | padding | 20px |
| Card gap (between icon and text) | gap | 16px |
| Skip link | color | `var(--sds-text-link)` |
| Skip link | font | 13px / 500 |
| "Already know..." text | font | 13px / 400, `var(--sds-text-tertiary)` |

#### Interaction Details

| Interaction | Behavior |
|-------------|----------|
| Page load | Cards fade in with staggered 100ms delay (left to right). Logo scales from 0.8 to 1.0 over 300ms with ease-out. |
| Card hover | Border transitions to `--sds-border-strong`. Background transitions to `--sds-bg-subtle`. Transition: 150ms ease. Card translates Y -2px. |
| Card click | Card gets selected state (blue border, blue-tinted background). After 300ms delay, auto-navigates to Onboarding Dashboard. |
| Skip link hover | Text underlines. Standard tertiary button hover behavior. |
| Skip link click | Navigates directly to full dashboard with onboarding checklist widget. |

#### State Variations

| State | Description |
|-------|-------------|
| **Default** | Three cards displayed, none selected. Skip link visible below. |
| **Card hovered** | Single card shows hover styling. Others remain default. |
| **Card selected** | Selected card shows blue border + subtle blue background. Brief pulse animation (scale 1.0 to 1.02 to 1.0 over 200ms). |
| **Loading (post-selection)** | Selected card shows a subtle loading spinner in place of the icon (16px, `--sds-interactive-primary` color). Other cards fade to 50% opacity. Navigates after dashboard data loads. |

#### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| >= 1024px | Three cards in a row, centered. Max-width 720px. |
| 768-1023px | Three cards in a row, reduced card width (180px each). |
| < 768px | Cards stack vertically, full width. Max-width 360px. Skip link moves below cards with 16px top margin. |

---

### Screen 2: Onboarding Dashboard

**Purpose**: Central hub during onboarding. Shows progress through the 5-step flow, highlights the current step, and previews what is coming next.

#### Shell & Layout

- **Shell**: Full app shell (header + simplified sidebar). `guidedMode` active on sidebar.
- **Sidebar (guidedMode)**: Shows only "Getting started" (active), "Connections", and "Dashboard" nav items. All other nav items hidden. Group labels hidden.
- **Grid**: Sidebar (220px) + Content area (flex, padding 24px).
- **Content max-width**: 960px within the content area.

#### Content Hierarchy

```
┌──────────────────────────────────────────────────────────────────────┐
│ Header (56px): Logo + Help + Profile                                │
├────────────┬─────────────────────────────────────────────────────────┤
│ Sidebar    │ Content Area                                           │
│ (220px)    │                                                        │
│            │  Page Title: "Getting Started"                         │
│ Getting    │  Subtitle: "Complete these 5 steps to see your         │
│ started    │            first risk score"                           │
│ (active)   │                                                        │
│            │  ┌─────────────────────────────────────────────────┐   │
│ ─────────  │  │  Progress Tracker (5 steps)                     │   │
│ Connections│  │  [1:Connect]─[2:Scan]─[3:Review]─[4:Risk]─[5:Act]│  │
│            │  │   ●────────○────────○────────○────────○         │   │
│            │  │  "Step 1 of 5"                                  │   │
│            │  └─────────────────────────────────────────────────┘   │
│            │                                                        │
│            │  ──────────── 24px gap ────────────                    │
│            │                                                        │
│            │  ┌─────────────────────────────────────────────────┐   │
│            │  │  Current Step Card                              │   │
│            │  │  ┌─────────┐                                    │   │
│            │  │  │  Icon   │  "Connect Your First Data Source"  │   │
│            │  │  │  48x48  │  "Link a Snowflake, AWS, Databricks│   │
│            │  │  │         │   or BigQuery account to start     │   │
│            │  │  └─────────┘   discovering sensitive data."     │   │
│            │  │                                                 │   │
│            │  │  [Start Step 1 (primary)]  [Skip (tertiary)]    │   │
│            │  │                                                 │   │
│            │  │  Estimated time: ~3-8 minutes                   │   │
│            │  └─────────────────────────────────────────────────┘   │
│            │                                                        │
│            │  ──────────── 16px gap ────────────                    │
│            │                                                        │
│            │  ┌─────────────────────────────────────────────────┐   │
│            │  │  Coming Up Next (collapsed preview)             │   │
│            │  │  Step 2: "Run your first scan" ── ~5 min        │   │
│            │  │  Step 3: "Review classifications" ── ~3 min     │   │
│            │  └─────────────────────────────────────────────────┘   │
│            │                                                        │
└────────────┴─────────────────────────────────────────────────────────┘
```

#### Component Inventory

| Component | DS Reference | guidedMode Differences |
|-----------|-------------|----------------------|
| Header | `/components/header.html` | No differences. Standard header with logo, help, profile. |
| Side navigation | `/components/side-navigation.html` | Reduced to 3 items: Getting started (active), Connections, Dashboard. No group labels. No footer items. No collapse toggle. |
| Progress tracker | New component (onboarding-specific) | 5-step horizontal bar with icons, labels, and connecting lines. Step states: completed (green check), current (blue filled circle), upcoming (gray hollow circle). |
| Current step card | `sds-card` (body-only, large) | Large card with icon, title, description, and action buttons. Unique to onboarding. |
| Coming up next | `sds-card` (body-only, compact) | Muted card showing next 2 steps as a preview list. |
| Primary button | `btn btn-primary btn-md` | Standard primary button for "Start Step N". |
| Tertiary button | `btn btn-tertiary btn-md` | Skip action for current step. |

#### Progress Tracker -- Detailed Specification

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐         │
│  │ Icon │────│ Icon │────│ Icon │────│ Icon │────│ Icon │         │
│  │ 32px │    │ 32px │    │ 32px │    │ 32px │    │ 32px │         │
│  └──────┘    └──────┘    └──────┘    └──────┘    └──────┘         │
│  Connect      Scan       Review       Risk        Act              │
│                                                                     │
│  Step states:                                                       │
│  ● Completed: green-400 bg, white checkmark icon                    │
│  ● Current:   blue-750 bg, white step icon                          │
│  ○ Upcoming:  warm-gray-100 bg, warm-gray-400 step icon             │
│                                                                     │
│  Connecting lines:                                                  │
│  ── Completed segment: green-400, 2px solid                         │
│  ── Upcoming segment:  warm-gray-150, 2px solid                     │
│                                                                     │
│  Step labels:                                                       │
│  Completed: 12px / 500, --sds-text-secondary                       │
│  Current:   12px / 600, --sds-text-primary                          │
│  Upcoming:  12px / 400, --sds-text-tertiary                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Content area | background | `var(--sds-bg-page)` |
| Page title | font | 24px / 600, `var(--sds-text-primary)` |
| Subtitle | font | 14px / 400, `var(--sds-text-secondary)` |
| Progress tracker container | background | `var(--sds-bg-card)` |
| Progress tracker container | border | 1px solid `var(--sds-border-default)` |
| Progress tracker container | border-radius | 8px |
| Progress tracker container | padding | 24px |
| Step circle (completed) | background | `var(--sds-status-success-strong)` (#7A9A01) |
| Step circle (current) | background | `var(--sds-interactive-primary)` (#013D5B) |
| Step circle (upcoming) | background | `var(--sds-status-neutral-bg)` |
| Step circle (upcoming) | border | 2px solid `var(--sds-border-default)` |
| Step icon (completed) | color | `var(--sds-color-white)` |
| Step icon (current) | color | `var(--sds-text-on-primary)` |
| Step icon (upcoming) | color | `var(--sds-text-disabled)` |
| Connecting line (done) | color | `var(--sds-status-success-strong)` |
| Connecting line (pending) | color | `var(--sds-border-default)` |
| "Step N of 5" label | font | 13px / 500, `var(--sds-text-tertiary)` |
| Current step card | background | `var(--sds-bg-card)` |
| Current step card | border | 1px solid `var(--sds-border-default)` |
| Current step card | padding | 24px |
| Step card icon container | background | `var(--sds-interactive-primary-subtle)` |
| Step card icon container | size | 48x48px, border-radius 12px |
| Step card title | font | 18px / 600, `var(--sds-text-primary)` |
| Step card description | font | 14px / 400, `var(--sds-text-secondary)`, max-width 480px |
| Estimated time | font | 12px / 400, `var(--sds-text-tertiary)` |
| Coming up card | background | `var(--sds-bg-subtle)` |
| Coming up card | border | 1px solid `var(--sds-border-subtle)` |
| Coming up step label | font | 13px / 500, `var(--sds-text-secondary)` |
| Coming up time estimate | font | 12px / 400, `var(--sds-text-tertiary)` |

#### Interaction Details

| Interaction | Behavior |
|-------------|----------|
| Page load | Progress tracker animates in: circles appear left-to-right with 80ms stagger, then connecting lines draw between them over 200ms. |
| Step completion | Completed step circle transitions from blue to green with a brief scale-up (1.0 to 1.2 to 1.0, 300ms). Checkmark icon fades in. Connecting line to next step animates from gray to green (left to right, 400ms). |
| "Start Step N" click | Primary button shows loading spinner. Navigates to step-specific screen. |
| "Skip" click | Current step card slides out left. Next step card slides in from right. Progress tracker updates: skipped step shows a dash icon in a neutral circle. |
| Completed step click (in progress tracker) | Navigates back to that step's result/summary view. |

#### State Variations

| State | Layout Change |
|-------|---------------|
| **Step 1 (initial)** | Progress bar shows 0/5. Current card: "Connect Your First Data Source". Coming up shows steps 2-3. |
| **Step 3 (mid-flow)** | Steps 1-2 green. Step 3 blue. Coming up shows steps 4-5. |
| **Step 5 (final)** | Steps 1-4 green. Step 5 blue. Coming up section hidden. |
| **All complete** | All 5 steps green. Current step card replaced with "All steps complete!" celebration card with "Go to Dashboard" primary CTA. |
| **Returning user** | Resume banner appears above page title: "Welcome back! You were on step N." Info-style background (`--sds-status-info-bg`). |

#### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| >= 1280px | Full layout as described. Sidebar expanded. |
| 1024-1279px | Sidebar collapsed (56px icons only). Content area expands. |
| 768-1023px | Sidebar hidden. Hamburger menu in header. Progress tracker wraps: step labels hidden, icons only. |
| < 768px | Single column. Progress tracker becomes vertical stepper. Current step card full-width. |

---

### Screen 3: Guided Connection Setup

**Purpose**: Simplified version of the Flow 1 connection wizard. Reduces platform options to top 4 and adds helper text to every field.

#### Shell & Layout

- **Shell**: Full app shell (header + simplified sidebar from onboarding dashboard).
- **Grid**: Sidebar (220px) + Content area with wizard centered, max-width 640px.
- **Navigation context**: Breadcrumb reads "Getting started > Connect data source".

#### Content Hierarchy

```
┌──────────────────────────────────────────────────────────────────────┐
│ Header (56px)                                                       │
├────────────┬─────────────────────────────────────────────────────────┤
│ Sidebar    │                                                        │
│ (guided)   │  Breadcrumb: Getting started > Connect data source     │
│            │  Page Title: "Connect Your First Data Source"           │
│            │  Subtitle: "Choose a platform and enter your           │
│            │             credentials. We will test the connection    │
│            │             automatically."                            │
│            │                                                        │
│            │  ─── Mini Progress: Step 1 of 5 ───                    │
│            │                                                        │
│            │  ┌─────────────────────────────────────────────────┐   │
│            │  │  Platform Quick-Select (2x2 grid)              │   │
│            │  │  ┌────────────┐  ┌────────────┐                │   │
│            │  │  │ Snowflake  │  │ AWS S3     │                │   │
│            │  │  │ [logo]     │  │ [logo]     │                │   │
│            │  │  └────────────┘  └────────────┘                │   │
│            │  │  ┌────────────┐  ┌────────────┐                │   │
│            │  │  │ Databricks │  │ BigQuery   │                │   │
│            │  │  │ [logo]     │  │ [logo]     │                │   │
│            │  │  └────────────┘  └────────────┘                │   │
│            │  │                                                 │   │
│            │  │  [Other platforms → (tertiary link)]            │   │
│            │  └─────────────────────────────────────────────────┘   │
│            │                                                        │
│            │  ─── After platform selection: ───                     │
│            │                                                        │
│            │  ┌─────────────────────────────────────────────────┐   │
│            │  │  Connection Form                                │   │
│            │  │                                                 │   │
│            │  │  [Coach Mark on first field]                    │   │
│            │  │  "This is where you will enter the details      │   │
│            │  │   from your Snowflake account."                 │   │
│            │  │                                                 │   │
│            │  │  Connection name*                               │   │
│            │  │  ┌──────────────────────────────────────────┐   │   │
│            │  │  │ My Snowflake                             │   │   │
│            │  │  └──────────────────────────────────────────┘   │   │
│            │  │  Helper: "A friendly name to identify this      │   │
│            │  │           connection later"                     │   │
│            │  │                                                 │   │
│            │  │  Account URL*                                   │   │
│            │  │  ┌──────────────────────────────────────────┐   │   │
│            │  │  │ https://                                 │   │   │
│            │  │  └──────────────────────────────────────────┘   │   │
│            │  │  Helper: "Found in Snowflake under Admin >      │   │
│            │  │           Accounts"                             │   │
│            │  │                                                 │   │
│            │  │  ... additional fields per platform ...          │   │
│            │  │                                                 │   │
│            │  │  ── OR ──                                       │   │
│            │  │  [Connect with OAuth (primary, large)]          │   │
│            │  │  "Fastest option -- one click to connect"       │   │
│            │  │                                                 │   │
│            │  │  [Test Connection (primary)] [Cancel (secondary)]│   │
│            │  └─────────────────────────────────────────────────┘   │
│            │                                                        │
│            │  ┌─────────────────────────────────────────────────┐   │
│            │  │  Troubleshooting (expanded by default           │   │
│            │  │  in guidedMode)                                 │   │
│            │  │  - "Make sure your IP is whitelisted"           │   │
│            │  │  - "Check that the service account has          │   │
│            │  │     read permissions"                           │   │
│            │  │  - "Verify the account URL format"              │   │
│            │  └─────────────────────────────────────────────────┘   │
│            │                                                        │
└────────────┴─────────────────────────────────────────────────────────┘
```

#### Component Inventory

| Component | DS Reference | guidedMode Differences |
|-----------|-------------|----------------------|
| Header | `/components/header.html` | Standard. |
| Side navigation | `/components/side-navigation.html` | Reduced items (same as Onboarding Dashboard). |
| Breadcrumb | Page header pattern from page-designer SKILL | Standard breadcrumb: 13px, `--sds-text-link`. |
| Platform cards | `sds-card` (body-only) | 2x2 grid of selectable cards. Each shows platform logo (32x32) and name. |
| Form fields | Form Section pattern from page-designer SKILL | Every field has helper text (not just error text). Field labels 13px/500. |
| Coach mark | New component (onboarding-specific) | Pointed tooltip with blue-tinted background. Arrow points to the target element. Dismiss button (X) and "Got it" text link. |
| OAuth button | `btn btn-primary btn-lg` | Large primary button, full-width within the form card. |
| Troubleshooting panel | `sds-card` (header + body) | `sds-card-header` with title "Common issues". Body contains a checklist. Expanded by default in guidedMode. |

#### Coach Mark Specification

```
┌──────────────────────────────────────────────┐
│  ▲ (arrow pointing to target element)        │
│                                              │
│  [info icon] This is where you will enter    │
│  the details from your Snowflake account.    │
│  Each field has a helper tip below it.       │
│                                              │
│                              [Got it]   [X]  │
└──────────────────────────────────────────────┘
```

| Property | Value | Token |
|----------|-------|-------|
| Background | `var(--sds-status-info-bg)` (#EBF4F5) |
| Border | 1px solid `var(--sds-color-blue-200)` |
| Border-radius | 8px |
| Padding | 16px |
| Text | 13px / 400, `var(--sds-status-info-text)` (#0C4A69) |
| Arrow | 12px equilateral triangle, same background color |
| "Got it" link | 13px / 500, `var(--sds-text-link)` |
| Dismiss (X) | 14px, `var(--sds-text-tertiary)`, hover: `var(--sds-text-secondary)` |
| Shadow | 0 4px 12px rgba(0, 0, 0, 0.08) |
| Max-width | 320px |
| z-index | 1000 |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Page background | background | `var(--sds-bg-page)` |
| Breadcrumb | color | `var(--sds-text-link)` |
| Breadcrumb separator | color | `var(--sds-text-disabled)` |
| Page title | font | 24px / 600, `var(--sds-text-primary)` |
| Platform card | background | `var(--sds-bg-card)` |
| Platform card | border | 1px solid `var(--sds-border-default)` |
| Platform card (hover) | border-color | `var(--sds-border-strong)` |
| Platform card (selected) | border-color | `var(--sds-interactive-primary)` |
| Platform card (selected) | background | `var(--sds-interactive-primary-subtle)` |
| Platform name | font | 14px / 500, `var(--sds-text-primary)` |
| Form card | background | `var(--sds-bg-card)` |
| Form card | border | 1px solid `var(--sds-border-default)` |
| Form card | padding | 24px |
| Field label | font | 13px / 500, `var(--sds-text-primary)` |
| Input border | border | 1px solid `var(--sds-border-default)` |
| Input border (focus) | border-color | `var(--sds-border-focus)` |
| Input text | font | 14px / 400, `var(--sds-text-primary)` |
| Helper text | font | 12px / 400, `var(--sds-text-tertiary)` |
| Error text | font | 12px / 400, `var(--sds-status-error-text)` |
| "OR" divider | color | `var(--sds-text-disabled)` |
| "OR" divider line | color | `var(--sds-border-subtle)` |
| OAuth hint text | font | 12px / 400, `var(--sds-text-tertiary)` |
| Troubleshooting card | background | `var(--sds-bg-card)` |
| Troubleshooting title | font | 14px / 600, `var(--sds-text-primary)` |
| Troubleshooting item | font | 13px / 400, `var(--sds-text-secondary)` |

#### Interaction Details

| Interaction | Behavior |
|-------------|----------|
| Platform card click | Card receives selected state. Form section slides in below with 300ms ease transition. Coach mark appears pointing at the first field after 500ms delay. |
| Coach mark dismiss | Coach mark fades out (200ms). Does not reappear for this user. |
| OAuth button click | Opens OAuth popup. Main page shows "Waiting for authorization..." with a subtle spinner. On success: connection test runs automatically. |
| "Test Connection" click | Button shows inline spinner. Disabled state while testing (2-5 seconds). On success: green check animation, "Connection successful!" message, auto-advance to step 2 after 1.5s. On failure: error message appears below button with troubleshooting suggestions. |
| Form field focus | Border transitions to `--sds-border-focus`. Label transitions to `--sds-interactive-primary`. |
| Connection success | Micro-celebration: green checkmark scales in (0 to 1.0, 300ms spring animation). "Connection successful!" text fades in. Step 1 in progress tracker transitions to complete (green). Auto-navigates to scan progress after 1.5s. |

#### State Variations

| State | Description |
|-------|-------------|
| **Platform selection** | 2x2 grid visible. No form. Coach mark hidden. |
| **Form visible** | Platform selected (highlighted). Form card slides in. Coach mark on first field. |
| **OAuth flow** | OAuth button shows spinner. Other form fields grayed out. |
| **Testing connection** | "Test Connection" button disabled with spinner. Form fields disabled. |
| **Success** | Green check animation. Success message. Auto-advance countdown. |
| **Error** | Red error banner below form with icon. Troubleshooting checklist highlighted. Retry button enabled. Error text uses `var(--sds-status-error-text)` on `var(--sds-status-error-bg)` background. |

#### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| >= 1024px | Full layout. Platform grid 2x2. Form max-width 640px centered. |
| 768-1023px | Sidebar collapsed. Platform grid 2x2. Form full-width within content. |
| < 768px | Platform grid 1x2 (two columns, two rows). Form fields full-width. OAuth button full-width. |

---

### Screen 4: First Scan Progress

**Purpose**: Shows scan progress with educational tooltips explaining what the system is doing. Builds anticipation for classification results.

#### Shell & Layout

- **Shell**: Full app shell (header + simplified sidebar).
- **Grid**: Sidebar (220px) + Content area, centered max-width 640px.

#### Content Hierarchy

```
┌──────────────────────────────────────────────────────────────────────┐
│ Header (56px)                                                       │
├────────────┬─────────────────────────────────────────────────────────┤
│ Sidebar    │                                                        │
│ (guided)   │  Breadcrumb: Getting started > Scanning                │
│            │  Page Title: "Scanning Your Data"                      │
│            │  Subtitle: "We are analyzing your connected source     │
│            │             to discover and classify sensitive data."   │
│            │                                                        │
│            │  ─── Mini Progress: Step 2 of 5 ───                    │
│            │                                                        │
│            │  ┌─────────────────────────────────────────────────┐   │
│            │  │  Scan Progress Card                             │   │
│            │  │                                                 │   │
│            │  │  [Animated progress bar ████████░░░░░ 65%]      │   │
│            │  │                                                 │   │
│            │  │  Current phase: "Analyzing column patterns..."  │   │
│            │  │                                                 │   │
│            │  │  ┌───────────────────────────────────────────┐  │   │
│            │  │  │  Educational Tooltip                      │  │   │
│            │  │  │  [lightbulb icon]                         │  │   │
│            │  │  │  "Pattern analysis looks at column names, │  │   │
│            │  │  │   data types, and sample values to        │  │   │
│            │  │  │   identify fields like email addresses,   │  │   │
│            │  │  │   phone numbers, and social security      │  │   │
│            │  │  │   numbers."                               │  │   │
│            │  │  └───────────────────────────────────────────┘  │   │
│            │  │                                                 │   │
│            │  │  Phase timeline:                                │   │
│            │  │  ✓ Discovering tables... (23 found)             │   │
│            │  │  ✓ Analyzing column patterns... (142 columns)   │   │
│            │  │  ● Identifying sensitive data...                │   │
│            │  │  ○ Calculating confidence scores...             │   │
│            │  │                                                 │   │
│            │  │  Estimated time remaining: ~3 minutes           │   │
│            │  └─────────────────────────────────────────────────┘   │
│            │                                                        │
│            │  ┌─────────────────────────────────────────────────┐   │
│            │  │  Discovery Stats (live updating)                │   │
│            │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐       │   │
│            │  │  │ Tables   │ │ Columns  │ │ Sensitive│       │   │
│            │  │  │ 23       │ │ 142      │ │ 12       │       │   │
│            │  │  └──────────┘ └──────────┘ └──────────┘       │   │
│            │  └─────────────────────────────────────────────────┘   │
│            │                                                        │
└────────────┴─────────────────────────────────────────────────────────┘
```

#### Component Inventory

| Component | DS Reference | guidedMode Differences |
|-----------|-------------|----------------------|
| Progress bar | New component | Horizontal bar, 8px height, rounded ends. Fill uses gradient from `--sds-interactive-primary` to `--sds-color-blue-400`. Background: `--sds-bg-subtle`. |
| Educational tooltip | New component (onboarding-specific) | Info-styled card that changes content as each scan phase begins. Uses lightbulb icon. |
| Phase timeline | New component | Vertical list with phase status icons (check, spinner, hollow circle). |
| Metric cards | Metric Cards Row from page-designer SKILL | 3-column grid. Values animate upward as scan discovers more items. |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Progress bar track | background | `var(--sds-bg-subtle)` |
| Progress bar fill | background | linear-gradient(90deg, `var(--sds-interactive-primary)`, `var(--sds-color-blue-400)`) |
| Progress bar | height | 8px, border-radius 4px |
| Progress percentage | font | 24px / 600, `var(--sds-text-primary)` |
| Current phase text | font | 14px / 500, `var(--sds-text-primary)` |
| Educational tooltip | background | `var(--sds-status-info-bg)` |
| Educational tooltip | border | 1px solid `var(--sds-color-blue-200)` |
| Educational tooltip | border-radius | 8px |
| Educational tooltip text | font | 13px / 400, `var(--sds-status-info-text)` |
| Lightbulb icon | color | `var(--sds-color-blue-450)` |
| Phase completed icon (check) | color | `var(--sds-status-success-strong)` |
| Phase active icon (spinner) | color | `var(--sds-interactive-primary)` |
| Phase pending icon (circle) | color | `var(--sds-text-disabled)` |
| Phase text (completed) | font | 13px / 400, `var(--sds-text-secondary)` |
| Phase text (active) | font | 13px / 500, `var(--sds-text-primary)` |
| Phase text (pending) | font | 13px / 400, `var(--sds-text-disabled)` |
| Phase count (parenthetical) | font | 13px / 400, `var(--sds-text-tertiary)` |
| Time remaining | font | 12px / 400, `var(--sds-text-tertiary)` |
| Metric card label | font | 13px / 400, `var(--sds-text-secondary)` |
| Metric card value | font | 24px / 600, `var(--sds-text-primary)` |
| Metric card (sensitive) value | color | `var(--sds-status-warning-text)` when > 0 |

#### Interaction Details

| Interaction | Behavior |
|-------------|----------|
| Progress bar | Smooth animation. Fill width updates every 2 seconds. Uses CSS transition (width 1s ease). |
| Phase transition | When a phase completes, its icon transitions from spinner to green check (scale animation 0 to 1.0, 200ms). Next phase's icon activates with spinner. Educational tooltip content cross-fades (200ms). |
| Metric values | Numbers count up using an animated counter (requestAnimationFrame). Duration: 500ms per increment. |
| Large dataset (> 2 min) | "This is taking longer than expected" info banner appears. "Move to background" secondary button appears below progress card. Click navigates to Onboarding Dashboard with a scan-in-progress indicator on step 2. |
| Scan complete | Progress bar fills to 100%. Brief pause (500ms). Celebration: green check scales in over progress bar. Discovery stats finalize. "Continue to Review" primary button appears. Auto-advance after 2s. |

#### State Variations

| State | Description |
|-------|-------------|
| **Phase 1: Discovering** | Progress 0-25%. Educational tip about table discovery. |
| **Phase 2: Analyzing** | Progress 25-60%. Educational tip about pattern analysis. |
| **Phase 3: Identifying** | Progress 60-85%. Educational tip about sensitivity detection. |
| **Phase 4: Scoring** | Progress 85-100%. Educational tip about confidence scoring. |
| **Complete** | All phases checked. "Continue" button visible. |
| **Background** | User navigated away. Notification appears when complete. |
| **Error** | Scan error banner at top. Retry button. Details in collapsible panel. |

#### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| >= 1024px | Full layout. Metric cards 3-column. |
| 768-1023px | Sidebar collapsed. Metric cards 3-column. |
| < 768px | Metric cards stack to 1-column. Educational tooltip full-width. |

---

### Screen 5: Guided Classification Review

**Purpose**: Teach the classification review workflow using the top 5 highest-confidence suggestions. Coach marks explain the interface on the first item.

#### Shell & Layout

- **Shell**: Full app shell (header + simplified sidebar).
- **Grid**: Sidebar (220px) + Split view: review list (320px left) + detail panel (flex right).
- **Pattern**: Master-Detail View.

#### Content Hierarchy

```
┌──────────────────────────────────────────────────────────────────────┐
│ Header (56px)                                                       │
├────────────┬─────────┬──────────────────────────────────────────────┤
│ Sidebar    │ Review  │ Detail Panel                                 │
│ (guided)   │ Queue   │                                              │
│            │ (320px) │ Classification: "Email Address"              │
│            │         │ Field: users.email_address                   │
│            │ ┌─────┐ │ Source: Snowflake > analytics_db             │
│            │ │ 1   │ │                                              │
│            │ │ ●   │ │ ┌────────────────────────────────────────┐   │
│            │ │Email│ │ │ Coach Mark (first item only)            │   │
│            │ │ 98% │ │ │ "This is a classification suggestion.  │   │
│            │ └─────┘ │ │  The confidence score tells you how     │   │
│            │ ┌─────┐ │ │  certain the system is. You can accept, │   │
│            │ │ 2   │ │ │  override, or reject each one."         │   │
│            │ │Phone│ │ └────────────────────────────────────────┘   │
│            │ │ 95% │ │                                              │
│            │ └─────┘ │ Confidence: ████████████████░░ 98%           │
│            │ ┌─────┐ │ ┌────────────────────────────────────────┐   │
│            │ │ 3   │ │ │ Classification Reasoning                │   │
│            │ │SSN  │ │ │ (shown by default in guidedMode)        │   │
│            │ │ 92% │ │ │                                         │   │
│            │ └─────┘ │ │ - Column name matches "email" pattern   │   │
│            │ ┌─────┐ │ │ - Data type: VARCHAR(255)               │   │
│            │ │ 4   │ │ │ - Sample values match email regex       │   │
│            │ │DOB  │ │ │ - 99.2% of values are valid emails      │   │
│            │ │ 88% │ │ └────────────────────────────────────────┘   │
│            │ └─────┘ │                                              │
│            │ ┌─────┐ │ Sample Data Preview:                        │
│            │ │ 5   │ │ ┌────────────────────────────────────────┐   │
│            │ │Addr │ │ │ j.smith@company.com                    │   │
│            │ │ 82% │ │ │ alice.jones@example.org                │   │
│            │ │     │ │ │ bob.wilson@enterprise.io               │   │
│            │ └─────┘ │ │ ...3 more values                       │   │
│            │         │ └────────────────────────────────────────┘   │
│            │ ─────── │                                              │
│            │ 1 of 5  │ [Accept (primary)] [Override] [Reject]      │
│            │ reviewed│                                              │
│            │         │ ┌────────────────────────────────────────┐   │
│            │         │ │ Explanation Panel                      │   │
│            │         │ │ Accept: confirms the classification    │   │
│            │         │ │ Override: change to a different type   │   │
│            │         │ │ Reject: mark as not sensitive          │   │
│            │         │ └────────────────────────────────────────┘   │
│            │         │                                              │
└────────────┴─────────┴──────────────────────────────────────────────┘
```

#### Component Inventory

| Component | DS Reference | guidedMode Differences |
|-----------|-------------|----------------------|
| Review list | Master-Detail list pattern | Limited to 5 items (full product shows all). Each item shows classification type, field name snippet, and confidence percentage. |
| Detail panel | Master-Detail detail pattern | Classification reasoning section shown expanded by default (collapsed in full product). Explanation panel for actions visible (hidden in full product). |
| Coach mark | Same as connection setup coach mark | Appears on the first item only, pointing to the confidence score and action buttons. |
| Confidence bar | New component | Horizontal bar similar to progress bar. Fill color maps to confidence level. |
| Action buttons | `btn btn-primary btn-md` (Accept), `btn btn-secondary btn-md` (Override), `btn btn-danger-outline btn-md` (Reject) | Same as full product. |
| Tags | `sds-tag` variants | Classification type tags (e.g., `sds-tag--error` for PII, `sds-tag--warning` for financial). |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Review list background | background | `var(--sds-bg-surface)` |
| Review list border-right | border | 1px solid `var(--sds-border-default)` |
| List item | padding | 12px 16px |
| List item (active) | background | `var(--sds-nav-item-active-bg)` |
| List item (active) | border-left | 3px solid `var(--sds-interactive-primary)` |
| List item classification type | font | 14px / 500, `var(--sds-text-primary)` |
| List item field name | font | 12px / 400, `var(--sds-text-tertiary)` |
| List item confidence | font | 12px / 600 |
| Confidence >= 90% | color | `var(--sds-status-success-text)` |
| Confidence 70-89% | color | `var(--sds-status-warning-text)` |
| Confidence < 70% | color | `var(--sds-status-error-text)` |
| Detail panel | background | `var(--sds-bg-page)` |
| Detail panel | padding | 24px |
| Classification title | font | 20px / 600, `var(--sds-text-primary)` |
| Field path | font | 13px / 400, `var(--sds-text-link)` (monospace) |
| Source path | font | 12px / 400, `var(--sds-text-tertiary)` |
| Confidence bar track | background | `var(--sds-bg-subtle)` |
| Confidence bar fill (high) | background | `var(--sds-status-success-strong)` |
| Confidence bar fill (medium) | background | `var(--sds-status-warning-strong)` |
| Confidence bar fill (low) | background | `var(--sds-status-error-strong)` |
| Reasoning card | background | `var(--sds-bg-subtle)` |
| Reasoning card | border | 1px solid `var(--sds-border-subtle)` |
| Reasoning card | border-radius | 8px |
| Reasoning card | padding | 16px |
| Reasoning items | font | 13px / 400, `var(--sds-text-secondary)` |
| Sample data card | background | `var(--sds-bg-card)` |
| Sample data card | border | 1px solid `var(--sds-border-default)` |
| Sample data values | font | 13px / 400, monospace, `var(--sds-text-primary)` |
| Explanation panel | background | `var(--sds-status-info-bg)` |
| Explanation panel text | font | 12px / 400, `var(--sds-status-info-text)` |
| Review counter | font | 13px / 500, `var(--sds-text-tertiary)` |

#### Interaction Details

| Interaction | Behavior |
|-------------|----------|
| First item load | Coach mark appears after 500ms, pointing to confidence score. Second coach mark appears after dismissing first, pointing to action buttons. |
| List item click | Detail panel cross-fades to new item (200ms). Active item gets blue left-border and active background. |
| Accept click | Item in list transitions: green check appears next to classification type. List item slides up slightly. Next item auto-selects. Brief green flash on the detail panel header (200ms). |
| Override click | Override dropdown appears below button: list of alternative classification types. Selecting one behaves like Accept but with the new type. |
| Reject click | Confirmation dialog: "Are you sure this field is not sensitive?" with "Reject" danger button and "Cancel" secondary. On confirm: item gets strikethrough styling and moves to end of list. |
| All 5 reviewed | Completion animation: "All classifications reviewed!" message with green check. 3-column stats appear: N accepted, N overridden, N rejected. "Continue to Risk Score" primary button. Auto-advance after 2s. |

#### State Variations

| State | Description |
|-------|-------------|
| **First item** | Coach marks visible. First item active in list. Full detail panel shown. |
| **Mid-review** | Some items show green checks. Active item highlighted. Coach marks dismissed. |
| **All reviewed** | All items show status icons. Completion message in detail panel. Continue button visible. |
| **Override active** | Dropdown visible with classification type options. Other buttons disabled. |

#### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| >= 1280px | Full split view: sidebar + list + detail. |
| 1024-1279px | Sidebar collapsed. List (280px) + detail panel. |
| 768-1023px | List hidden by default. Item cards shown vertically. Tap card to expand detail inline. |
| < 768px | Full-width card stack. Each classification is a card with expandable detail. Action buttons fixed at bottom of viewport. |

---

### Screen 6: Risk Score Reveal

**Purpose**: The "aha moment." Dramatically reveals the user's first risk score with an animated gauge, explanation, and improvement suggestions.

#### Shell & Layout

- **Shell**: Full app shell (header + simplified sidebar).
- **Grid**: Sidebar (220px) + Content area, centered max-width 800px.
- **This is the guidedMode version of Flow 3's Executive Risk Dashboard.**

#### Content Hierarchy

```
┌──────────────────────────────────────────────────────────────────────┐
│ Header (56px)                                                       │
├────────────┬─────────────────────────────────────────────────────────┤
│ Sidebar    │                                                        │
│ (guided)   │  Page Title: "Your Risk Score"                         │
│            │  ─── Mini Progress: Step 4 of 5 ───                    │
│            │                                                        │
│            │  ┌─────────────────────────────────────────────────┐   │
│            │  │  Risk Score Gauge (centered)                    │   │
│            │  │                                                 │   │
│            │  │            ┌──────────┐                         │   │
│            │  │           /            \                        │   │
│            │  │          │      67      │                       │   │
│            │  │          │    HIGH      │                       │   │
│            │  │           \   RISK     /                        │   │
│            │  │            └──────────┘                         │   │
│            │  │                                                 │   │
│            │  │  Semi-circular gauge, 240px diameter             │   │
│            │  │  Needle animates from 0 to score value           │   │
│            │  │                                                 │   │
│            │  │  Scale: 0 (Low) ── 25 ── 50 ── 75 ── 100 (Critical)│
│            │  │  Colors: green ── yellow ── orange ── red        │   │
│            │  └─────────────────────────────────────────────────┘   │
│            │                                                        │
│            │  ┌─────────────────────────────────────────────────┐   │
│            │  │  Score Explanation Panel                        │   │
│            │  │                                                 │   │
│            │  │  "Your score is 67 (High Risk) because:"       │   │
│            │  │                                                 │   │
│            │  │  ┌────────┐ 12 unprotected PII fields           │   │
│            │  │  │ ██████ │ in 3 tables                         │   │
│            │  │  └────────┘                                     │   │
│            │  │  ┌────────┐ 4 fields with public access         │   │
│            │  │  │ ████   │ that contain sensitive data          │   │
│            │  │  └────────┘                                     │   │
│            │  │  ┌────────┐ No encryption detected on            │   │
│            │  │  │ ██     │ 2 database connections                │   │
│            │  │  └────────┘                                     │   │
│            │  └─────────────────────────────────────────────────┘   │
│            │                                                        │
│            │  ┌─────────────────────────────────────────────────┐   │
│            │  │  Improvement Suggestions                        │   │
│            │  │                                                 │   │
│            │  │  "Addressing the top issue could reduce your    │   │
│            │  │   score by an estimated 15 points."             │   │
│            │  │                                                 │   │
│            │  │  [Take Action (primary)]   [View Details        │   │
│            │  │                             (tertiary)]         │   │
│            │  └─────────────────────────────────────────────────┘   │
│            │                                                        │
└────────────┴─────────────────────────────────────────────────────────┘
```

#### Risk Score Gauge -- Detailed Specification

```
Gauge: Semi-circular arc, 240px diameter, 12px stroke width.

Arc segments (gradient stops):
  0-25:   --sds-status-success-strong (#7A9A01)
  25-50:  --sds-status-warning-strong (#EBCE2D)
  50-75:  --sds-color-red-350 (#E57D6E)
  75-100: --sds-status-error-strong (#CF6253)

Needle:
  Color: --sds-text-primary
  Width: 3px
  Length: 100px (from center to arc)
  Tip: small circle, 6px diameter, --sds-interactive-primary

Center text:
  Score value: 48px / 700, --sds-text-primary
  Risk label:  14px / 600, color matches arc segment at score position

Score labels at base of arc:
  "0" (left):   12px / 400, --sds-text-tertiary
  "100" (right): 12px / 400, --sds-text-tertiary

Animation:
  1. Arc draws in from left to right (0.8s, ease-out)
  2. 400ms pause (anticipation)
  3. Needle sweeps from 0 to score value (1.2s, cubic-bezier(0.34, 1.56, 0.64, 1))
  4. Score number counts up from 0 to value (synced with needle)
  5. Risk label fades in (200ms) after needle reaches position
  6. Score explanation panel slides up from bottom (300ms, ease-out)
```

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Gauge background circle | stroke | `var(--sds-bg-subtle)` |
| Score value | font | 48px / 700, `var(--sds-text-primary)` |
| Risk label "LOW" | color | `var(--sds-status-success-text)` |
| Risk label "MODERATE" | color | `var(--sds-status-warning-text)` |
| Risk label "HIGH" | color | `var(--sds-color-red-500)` |
| Risk label "CRITICAL" | color | `var(--sds-status-error-text)` |
| Explanation panel | background | `var(--sds-bg-card)` |
| Explanation panel | border | 1px solid `var(--sds-border-default)` |
| Explanation panel | padding | 24px |
| Explanation headline | font | 16px / 600, `var(--sds-text-primary)` |
| Risk factor bars | background (track) | `var(--sds-bg-subtle)` |
| Risk factor bars | background (fill) | `var(--sds-status-error-strong)` |
| Risk factor text | font | 14px / 400, `var(--sds-text-secondary)` |
| Improvement suggestion | background | `var(--sds-status-info-bg)` |
| Improvement suggestion | border | 1px solid `var(--sds-color-blue-200)` |
| Improvement text | font | 14px / 400, `var(--sds-status-info-text)` |
| Estimated reduction | font | 14px / 600, `var(--sds-status-success-text)` |

#### Interaction Details

| Interaction | Behavior |
|-------------|----------|
| Page load | Gauge animation sequence (described above). Total duration: ~3 seconds. User watches the score build up with anticipation. |
| "Take Action" click | Navigates to First Remediation screen (if score >= 26) or Recommended Monitoring Setup (if score 0-25). |
| "View Details" click | Navigates to full risk dashboard detail view (guidedMode). |
| Risk factor hover | Factor row highlights with `--sds-bg-subtle` background. Tooltip shows detailed breakdown. |
| `prefers-reduced-motion` | Gauge appears instantly at final value. No sweep animation. Score number appears without counting. |

#### State Variations

| State | Description |
|-------|-------------|
| **Animating** | Gauge drawing, needle sweeping. No interaction available. |
| **Score revealed (0-25 Low)** | Green gauge segment. Positive messaging: "Your data is in good shape." CTA: "Set Up Monitoring". |
| **Score revealed (26-50 Moderate)** | Yellow gauge segment. Neutral messaging. CTA: "Take Action". |
| **Score revealed (51-75 High)** | Orange/red gauge segment. Actionable messaging. CTA: "Take Action" (emphasized). |
| **Score revealed (76-100 Critical)** | Deep red gauge segment. Urgent but not alarming messaging. CTA: "Take Action Now". |

#### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| >= 1024px | Full layout. Gauge 240px diameter. |
| 768-1023px | Sidebar collapsed. Gauge 200px diameter. |
| < 768px | Gauge 180px diameter. Explanation panel cards stack vertically. |

---

### Screen 7: First Remediation

**Purpose**: Demonstrate the remediate-to-improve loop. The top recommended action is pre-selected, preview shows key metrics, and execution is guided.

#### Shell & Layout

- **Shell**: Full app shell (header + simplified sidebar).
- **Grid**: Sidebar (220px) + Content area. Three-step wizard within content, max-width 720px.

#### Content Hierarchy

```
┌──────────────────────────────────────────────────────────────────────┐
│ Header (56px)                                                       │
├────────────┬─────────────────────────────────────────────────────────┤
│ Sidebar    │                                                        │
│ (guided)   │  Breadcrumb: Getting started > Take action             │
│            │  Page Title: "Take Your First Action"                  │
│            │  Subtitle: "Let us fix the top risk factor to lower    │
│            │             your score."                               │
│            │  ─── Mini Progress: Step 5 of 5 ───                    │
│            │                                                        │
│            │  ┌─────────────────────────────────────────────────┐   │
│            │  │  Sub-step Tabs:                                 │   │
│            │  │  [1. Select Action] [2. Preview] [3. Execute]   │   │
│            │  └─────────────────────────────────────────────────┘   │
│            │                                                        │
│            │  ── Tab 1: Select Action ──                            │
│            │  ┌─────────────────────────────────────────────────┐   │
│            │  │  Recommended Action (pre-selected)              │   │
│            │  │  ┌─ selected ─────────────────────────────────┐ │   │
│            │  │  │ Apply masking to 12 PII fields             │ │   │
│            │  │  │ in users, transactions, contacts tables     │ │   │
│            │  │  │ Estimated score reduction: -15 points       │ │   │
│            │  │  │ Tag: [sds-tag--success "Recommended"]       │ │   │
│            │  │  └────────────────────────────────────────────┘ │   │
│            │  │                                                 │   │
│            │  │  ┌─ optional ─────────────────────────────────┐ │   │
│            │  │  │ Restrict public access on 4 fields         │ │   │
│            │  │  │ Estimated score reduction: -8 points        │ │   │
│            │  │  └────────────────────────────────────────────┘ │   │
│            │  │                                                 │   │
│            │  │  [Continue to Preview (primary)]                │   │
│            │  └─────────────────────────────────────────────────┘   │
│            │                                                        │
│            │  ── Tab 2: Preview (after clicking Continue) ──        │
│            │  ┌─────────────────────────────────────────────────┐   │
│            │  │  Impact Preview (simplified in guidedMode)      │   │
│            │  │                                                 │   │
│            │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐     │   │
│            │  │  │ Fields   │  │ Tables   │  │ Score    │     │   │
│            │  │  │ affected │  │ affected │  │ impact   │     │   │
│            │  │  │ 12       │  │ 3        │  │ -15 pts  │     │   │
│            │  │  └──────────┘  └──────────┘  └──────────┘     │   │
│            │  │                                                 │   │
│            │  │  [Coach mark: "Preview shows what will change   │   │
│            │  │   before you apply the action. Nothing has      │   │
│            │  │   changed yet."]                                │   │
│            │  │                                                 │   │
│            │  │  [Execute Action (primary)] [Back (secondary)]  │   │
│            │  └─────────────────────────────────────────────────┘   │
│            │                                                        │
│            │  ── Tab 3: Execute (after clicking Execute) ──         │
│            │  ┌─────────────────────────────────────────────────┐   │
│            │  │  Execution Progress                             │   │
│            │  │  [████████████████████████████ 100%]             │   │
│            │  │                                                 │   │
│            │  │  ✓ Action applied successfully                  │   │
│            │  │                                                 │   │
│            │  │  Score Update Animation:                        │   │
│            │  │  67 ──→ 52 (animated counter)                   │   │
│            │  │  [Mini gauge showing decrease]                  │   │
│            │  │                                                 │   │
│            │  │  "Your risk score decreased by 15 points!"      │   │
│            │  │                                                 │   │
│            │  │  [Complete Onboarding (primary)]                │   │
│            │  └─────────────────────────────────────────────────┘   │
│            │                                                        │
└────────────┴─────────────────────────────────────────────────────────┘
```

#### Component Inventory

| Component | DS Reference | guidedMode Differences |
|-----------|-------------|----------------------|
| Sub-step tabs | `sds-tabs` (page tabs pattern) | 3 tabs. In guidedMode: tabs are non-clickable until their step is reached (disabled state). |
| Action cards | `sds-card` (body-only) | Selectable radio-card pattern. Recommended action pre-selected with `sds-tag--success "Recommended"` tag. |
| Metric cards | Metric Cards Row from page-designer SKILL | 3-column, simplified (only key metrics in guidedMode). |
| Coach mark | Onboarding coach mark component | Appears on preview tab explaining what preview means. |
| Progress bar | Same as scan progress bar | For execution progress. |
| Score delta animation | New component | Shows old score, arrow, new score with animated transition. |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Sub-step tabs | (see tabs component spec) | Standard `sds-tabs` tokens. Disabled tabs use `--sds-text-disabled`. |
| Action card (default) | border | 1px solid `var(--sds-border-default)` |
| Action card (selected) | border | 2px solid `var(--sds-interactive-primary)` |
| Action card (selected) | background | `var(--sds-interactive-primary-subtle)` |
| "Recommended" tag | class | `sds-tag sds-tag--success` |
| Score reduction text | color | `var(--sds-status-success-text)` |
| Score reduction text | font | 14px / 600 |
| Execution success icon | color | `var(--sds-status-success-strong)` |
| Score delta (old score) | font | 24px / 400, `var(--sds-text-tertiary)` with strikethrough |
| Score delta (arrow) | color | `var(--sds-status-success-text)` |
| Score delta (new score) | font | 24px / 700, `var(--sds-status-success-text)` |
| Success message | font | 16px / 600, `var(--sds-text-primary)` |

#### Interaction Details

| Interaction | Behavior |
|-------------|----------|
| Page load | Tab 1 active. Recommended action pre-selected with blue border. |
| Action card click | Selected state toggles. Only one action selectable at a time. |
| "Continue to Preview" | Tab 2 activates. Preview metrics animate in (count up). Coach mark appears after 500ms. |
| "Execute Action" | Confirmation dialog: "Apply masking to 12 fields?" with "Execute" primary and "Cancel" secondary. On confirm: tab 3 activates, progress bar animates. |
| Execution complete | Progress bar fills. Green check. Score delta animation: old score fades + strikethrough, arrow appears, new score counts in. Duration: 1.5s total. |
| "Complete Onboarding" | Navigates to Onboarding Complete screen. |

#### State Variations

| State | Description |
|-------|-------------|
| **Tab 1: Selection** | Action cards visible. "Continue" button active only when an action is selected. |
| **Tab 2: Preview** | Metrics visible. Coach mark on first visit. "Execute" button prominent. |
| **Tab 3: Executing** | Progress bar animating. All other elements disabled. |
| **Tab 3: Complete** | Green check. Score delta visible. "Complete Onboarding" button. |
| **Execution error** | Error banner in tab 3. "Retry" button. Error details expandable. |

#### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| >= 1024px | Full layout. Metric cards 3-column. |
| 768-1023px | Sidebar collapsed. Metric cards 3-column. |
| < 768px | Tabs switch to vertical stepper layout. Metric cards 1-column. Action cards full-width. |

---

### Screen 8: Recommended Monitoring Setup

**Purpose**: For low-risk scores (0-25). Guides the user through setting up monitoring instead of remediation.

#### Shell & Layout

- **Shell**: Full app shell (header + simplified sidebar).
- **Grid**: Sidebar (220px) + Content area. Three sequential configuration cards, max-width 640px.

#### Content Hierarchy

```
┌──────────────────────────────────────────────────────────────────────┐
│ Header (56px)                                                       │
├────────────┬─────────────────────────────────────────────────────────┤
│ Sidebar    │                                                        │
│ (guided)   │  Page Title: "Set Up Monitoring"                       │
│            │  Subtitle: "Your data is in good shape. Let us make    │
│            │             sure it stays that way."                   │
│            │  ─── Mini Progress: Step 5 of 5 ───                    │
│            │                                                        │
│            │  ┌─────────────────────────────────────────────────┐   │
│            │  │  Step A: Schedule Weekly Re-Scan                │   │
│            │  │                                                 │   │
│            │  │  "Automatically re-scan your connected sources  │   │
│            │  │   weekly to detect new sensitive data."         │   │
│            │  │                                                 │   │
│            │  │  Schedule: [Weekly ▼]  Day: [Monday ▼]         │   │
│            │  │  Time: [9:00 AM ▼]                              │   │
│            │  │                                                 │   │
│            │  │  [✓ Configured]  or  [Skip this step]          │   │
│            │  └─────────────────────────────────────────────────┘   │
│            │                                                        │
│            │  ┌─────────────────────────────────────────────────┐   │
│            │  │  Step B: Set Alert Threshold                    │   │
│            │  │                                                 │   │
│            │  │  "Get notified if your risk score goes above    │   │
│            │  │   a threshold."                                 │   │
│            │  │                                                 │   │
│            │  │  Alert if score exceeds: [25 ─────●──── 100]    │   │
│            │  │  Currently set to: 25                           │   │
│            │  │                                                 │   │
│            │  │  Notify via: [✓ Email] [✓ In-app]               │   │
│            │  │                                                 │   │
│            │  │  [✓ Configured]  or  [Skip this step]          │   │
│            │  └─────────────────────────────────────────────────┘   │
│            │                                                        │
│            │  ┌─────────────────────────────────────────────────┐   │
│            │  │  Step C: Set Dashboard Preference               │   │
│            │  │                                                 │   │
│            │  │  "Choose your default dashboard view."          │   │
│            │  │                                                 │   │
│            │  │  [Operations (recommended)] [Governance]        │   │
│            │  │  [Executive]                                    │   │
│            │  │                                                 │   │
│            │  │  [✓ Configured]  or  [Skip this step]          │   │
│            │  └─────────────────────────────────────────────────┘   │
│            │                                                        │
│            │  [Complete Onboarding (primary)]                       │
│            │                                                        │
└────────────┴─────────────────────────────────────────────────────────┘
```

#### Component Inventory

| Component | DS Reference | guidedMode Differences |
|-----------|-------------|----------------------|
| Configuration cards | `sds-card` (header + body) | Three sequential cards. Each has a title, description, form controls, and configured/skip actions. |
| Dropdown selects | Form Section pattern | Standard select inputs with `--sds-border-default` border. |
| Range slider | New component | Horizontal slider for alert threshold. Track: `--sds-bg-subtle`. Fill: `--sds-interactive-primary`. Thumb: 16px circle, white bg, `--sds-interactive-primary` border. |
| Toggle tabs | `sds-toggle-tabs` | For dashboard view preference (Operations / Governance / Executive). |
| Checkboxes | Form Section pattern | For notification channel selection. |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| Card | background | `var(--sds-bg-card)` |
| Card | border | 1px solid `var(--sds-border-default)` |
| Card | border-radius | 8px |
| Card | padding | 24px |
| Card step label | font | 12px / 600, `var(--sds-text-tertiary)`, uppercase |
| Card title | font | 16px / 600, `var(--sds-text-primary)` |
| Card description | font | 14px / 400, `var(--sds-text-secondary)` |
| Configured indicator | color | `var(--sds-status-success-text)` |
| Configured indicator | font | 13px / 500 |
| "Skip this step" link | color | `var(--sds-text-link)` |
| "Skip this step" link | font | 13px / 400 |
| Select inputs | border | 1px solid `var(--sds-border-default)` |
| Select inputs (focus) | border-color | `var(--sds-border-focus)` |
| Slider track | background | `var(--sds-bg-subtle)` |
| Slider fill | background | `var(--sds-interactive-primary)` |
| Slider thumb | background | `var(--sds-color-white)` |
| Slider thumb | border | 2px solid `var(--sds-interactive-primary)` |
| Slider value label | font | 14px / 600, `var(--sds-text-primary)` |
| Card gap (between cards) | gap | 16px |

#### Interaction Details

| Interaction | Behavior |
|-------------|----------|
| Card completion | When a card's form is filled, "Configured" indicator appears with green check. Card header gets a subtle green-tinted left border (3px, `--sds-status-success-strong`). |
| "Skip this step" | Card collapses to header-only with "Skipped" neutral label. Can be re-expanded. |
| Slider drag | Value label updates in real-time. Snap to increments of 5. |
| Toggle tab click | Standard toggle tab behavior. "Recommended" badge on Operations view. |
| "Complete Onboarding" | Enabled once at least 1 of 3 cards is configured. Navigates to Onboarding Complete. |

#### State Variations

| State | Description |
|-------|-------------|
| **Initial** | All three cards expanded with default values. |
| **Partially configured** | Some cards show "Configured", others still editable. |
| **All configured** | All cards show green indicators. "Complete Onboarding" button is prominent. |
| **All skipped** | All cards collapsed. Warning text: "You have skipped all monitoring steps. You can set these up later from Settings." |

#### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| >= 1024px | Full layout. Cards max-width 640px. |
| 768-1023px | Sidebar collapsed. Cards full-width within content. |
| < 768px | Cards full-width. Toggle tabs stack if needed. |

---

### Screen 9: Marcus Demo

**Purpose**: Interactive walkthrough with pre-loaded sample data for the Security Leader persona. Shows realistic dashboard without requiring real data setup.

#### Shell & Layout

- **Shell**: Full app shell (header + sidebar). Sidebar shows full navigation but with demo data context.
- **Grid**: Standard dashboard layout matching Flow 3 Executive Risk Dashboard.
- **Overlay**: Guided clickthrough overlay with numbered steps.

#### Content Hierarchy

```
┌──────────────────────────────────────────────────────────────────────┐
│ Header (56px) + [Demo Mode Banner: "Sample Data Environment"]       │
├────────────┬─────────────────────────────────────────────────────────┤
│ Sidebar    │                                                        │
│ (full nav) │  ┌───────────────────────────────────────────────────┐ │
│            │  │ Guided Overlay Step 1 of 4                        │ │
│            │  │ "This is your risk score. Click it to see         │ │
│            │  │  what drives it."                                 │ │
│            │  │ [Next →]                                [1/4]     │ │
│            │  └───────────────────────────────────────────────────┘ │
│ Dashboard  │                                                        │
│ (active)   │  Page Title: "Risk Dashboard"                         │
│            │  Tag: [sds-tag--info "Sample Data"]                   │
│            │                                                        │
│            │  ┌────────────────────────────────────────────┐       │
│            │  │  Risk Score Gauge: 62 (High Risk)          │       │
│            │  │  [highlighted / pulsing border for step 1]  │       │
│            │  └────────────────────────────────────────────┘       │
│            │                                                        │
│            │  ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│            │  │ 3        │ │ 87%      │ │ 14       │             │
│            │  │ Connected│ │ Coverage │ │ Policies │             │
│            │  │ Sources  │ │          │ │ Active   │             │
│            │  └──────────┘ └──────────┘ └──────────┘             │
│            │                                                        │
│            │  ┌────────────────────────────────────────────┐       │
│            │  │  Risk Trend Chart (30 days sample data)     │       │
│            │  │  Shows realistic downward trend              │       │
│            │  └────────────────────────────────────────────┘       │
│            │                                                        │
│            │  ┌────────────────────────────────────────────┐       │
│            │  │  Compliance Cards (SOC 2, GDPR, HIPAA)     │       │
│            │  │  Sample compliance status                    │       │
│            │  └────────────────────────────────────────────┘       │
│            │                                                        │
│            │  ── After guided tour ──                               │
│            │  ┌────────────────────────────────────────────┐       │
│            │  │  "Ready to connect your own data?"          │       │
│            │  │  [Connect My Data (primary)]                │       │
│            │  │  [Invite My Team (secondary)]               │       │
│            │  │  [Keep Exploring (tertiary)]                 │       │
│            │  └────────────────────────────────────────────┘       │
│            │                                                        │
└────────────┴─────────────────────────────────────────────────────────┘
```

#### Demo Mode Banner Specification

```
┌──────────────────────────────────────────────────────────────────────┐
│ [info icon] You are viewing sample data. Connect your own data to   │
│ see real results.                               [Connect Data →]    │
└──────────────────────────────────────────────────────────────────────┘
```

| Property | Value | Token |
|----------|-------|-------|
| Background | `var(--sds-status-info-bg)` |
| Border-bottom | 1px solid `var(--sds-color-blue-200)` |
| Height | 40px |
| Text | 13px / 400, `var(--sds-status-info-text)` |
| Link | 13px / 500, `var(--sds-text-link)` |
| Icon | 16px, `var(--sds-color-blue-450)` |
| Padding | 0 20px |

#### Guided Overlay Step Specification

```
┌──────────────────────────────────────────────────────────┐
│  Step 1 of 4                              [X close]     │
│                                                          │
│  "This is your risk score. Click it to see what          │
│   drives it."                                            │
│                                                          │
│  [← Back]                              [Next →]         │
│                                                          │
│  ● ○ ○ ○  (step indicator dots)                         │
└──────────────────────────────────────────────────────────┘
```

| Property | Value | Token |
|----------|-------|-------|
| Background | `var(--sds-bg-elevated)` |
| Border | 1px solid `var(--sds-border-default)` |
| Border-radius | 12px |
| Shadow | 0 8px 24px rgba(0, 0, 0, 0.12) |
| Padding | 20px 24px |
| Max-width | 360px |
| Step label | 11px / 600, uppercase, `var(--sds-text-tertiary)` |
| Body text | 14px / 400, `var(--sds-text-primary)`, line-height 1.5 |
| "Next" button | `btn btn-primary btn-sm` |
| "Back" button | `btn btn-tertiary btn-sm` |
| Step dots (active) | 8px circle, `var(--sds-interactive-primary)` |
| Step dots (inactive) | 8px circle, `var(--sds-border-default)` |
| Close (X) | 14px, `var(--sds-text-tertiary)` |
| Backdrop | rgba(0, 0, 0, 0.3) with cutout around target element |
| z-index | 2000 |

#### Guided Tour Steps

| Step | Target Element | Overlay Text | Action |
|------|---------------|--------------|--------|
| 1 | Risk Score Gauge | "This is your risk score. It shows your overall data security posture. Click it to see what drives it." | Click gauge to drill in |
| 2 | Risk Detail (after drill-in) | "Each risk factor shows what is contributing to your score. The top factors have the biggest impact." | Observe risk factors |
| 3 | Remediation simulation | "Taking action on a risk factor reduces your score. This simulation shows the impact of applying masking." | Watch score decrease animation |
| 4 | Dashboard overview | "This is your command center. You will see real-time changes as your team connects data and applies protections." | Tour complete |

#### Token References

| Element | Property | Token |
|---------|----------|-------|
| "Sample Data" tags | class | `sds-tag sds-tag--info` |
| All dashboard components | (same as Flow 3 executive dashboard) | Standard tokens. No differences except "Sample Data" tags on each card. |
| Highlighted element (during tour) | border | 2px solid `var(--sds-interactive-primary)` with 4px offset |
| Highlighted element | box-shadow | 0 0 0 4px `var(--sds-interactive-primary-subtle)` |
| CTA card (post-tour) | background | `var(--sds-bg-card)` |
| CTA card | border | 1px solid `var(--sds-border-default)` |
| CTA card | padding | 32px, text-align center |
| CTA headline | font | 20px / 600, `var(--sds-text-primary)` |

#### Interaction Details

| Interaction | Behavior |
|-------------|----------|
| Page load | Demo banner visible. Dashboard loads with sample data. After 1s, first guided overlay step appears with backdrop. |
| "Next" click | Overlay repositions to next target element. Backdrop cutout animates to new position (300ms ease). |
| Target element click (when prompted) | Triggers the drill-in navigation. Overlay follows. |
| "X" close on overlay | "Exit guided tour? You can restart it from the help menu." confirmation. On confirm: overlay dismisses, free exploration enabled. |
| "Connect My Data" (post-tour CTA) | Navigates to Onboarding Dashboard step 1. Demo data persists but is labeled. |
| "Invite My Team" | Opens invite team modal (email input + role selector). |
| "Keep Exploring" | Dismisses CTA card. Free exploration of sample data dashboard. |

#### State Variations

| State | Description |
|-------|-------------|
| **Guided tour active** | Overlay visible. Backdrop dims non-target elements. Step N of 4 shown. |
| **Free exploration** | No overlay. Demo banner remains. All dashboard interactions work with sample data. |
| **Post-tour CTA** | After completing all 4 steps, CTA card appears centered in content area. |
| **Transitioning to real** | On "Connect My Data": demo banner updates to "Setting up real data..." and navigates to connection setup. |

#### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| >= 1280px | Full dashboard layout with guided overlay positioned adjacent to targets. |
| 1024-1279px | Sidebar collapsed. Overlay repositions to fit. |
| < 1024px | Guided overlay becomes a bottom sheet (full-width, slides up from bottom). Target element scrolls into view. |

---

### Screen 10: Onboarding Complete

**Purpose**: Celebration screen marking the transition from guided onboarding to the full product experience. Confetti animation, full dashboard reveal, and optional next-step checklist.

#### Shell & Layout

- **Shell**: Full app shell (header + full sidebar now visible). Transition from simplified sidebar to full sidebar.
- **Grid**: Sidebar (220px, full navigation) + Content area (full dashboard).
- **Overlay**: Confetti animation layer + completion card overlay.

#### Content Hierarchy

```
┌──────────────────────────────────────────────────────────────────────┐
│ Header (56px)                                                       │
├────────────┬─────────────────────────────────────────────────────────┤
│ Sidebar    │                                                        │
│ (FULL nav  │  ── Confetti animation layer (z-index: 3000) ──       │
│  now       │                                                        │
│  revealed) │  ┌─────────────────────────────────────────────────┐   │
│            │  │  Completion Card (centered overlay)              │   │
│ Getting    │  │                                                 │   │
│ started    │  │         [Celebration icon / illustration]       │   │
│            │  │                64x64px                           │   │
│ ─────────  │  │                                                 │   │
│ Dashboard  │  │  "You are all set!"                             │   │
│ Data       │  │                                                 │   │
│ catalog    │  │  "You have connected your first data source,    │   │
│ Protection │  │   reviewed classifications, and seen your       │   │
│ policies   │  │   risk score. Your data security journey        │   │
│ Activity   │  │   starts now."                                  │   │
│            │  │                                                 │   │
│ ─────────  │  │  ┌───────────────────────────────────────────┐  │   │
│ Connections│  │  │  Stats Summary                             │  │   │
│ Users      │  │  │  ┌────────┐ ┌────────┐ ┌────────┐        │  │   │
│ Settings   │  │  │  │ 1      │ │ 23     │ │ 52     │        │  │   │
│            │  │  │  │ Source │ │ Tables │ │ Risk   │        │  │   │
│            │  │  │  │ Connected│ │ Scanned│ │ Score │        │  │   │
│            │  │  │  └────────┘ └────────┘ └────────┘        │  │   │
│            │  │  └───────────────────────────────────────────┘  │   │
│            │  │                                                 │   │
│            │  │  [Explore Dashboard (primary, large)]           │   │
│            │  │                                                 │   │
│            │  └─────────────────────────────────────────────────┘   │
│            │                                                        │
│            │  ── After dismissing overlay: Full dashboard visible ── │
│            │                                                        │
│            │  ┌─────────────────────────────────────────────────┐   │
│            │  │  Onboarding Checklist Widget                    │   │
│            │  │  (bottom-right corner, dismissible)             │   │
│            │  │                                                 │   │
│            │  │  Optional next steps:                           │   │
│            │  │  ☐ Invite team members                          │   │
│            │  │  ☐ Create first policy                          │   │
│            │  │  ☐ Schedule recurring scans                     │   │
│            │  │  ☐ Set up compliance report                     │   │
│            │  │                                                 │   │
│            │  │  [Dismiss]                                      │   │
│            │  └─────────────────────────────────────────────────┘   │
│            │                                                        │
└────────────┴─────────────────────────────────────────────────────────┘
```

#### Confetti Animation Specification

```
Confetti layer: full viewport overlay, pointer-events: none
Duration: 3 seconds, then fades out (500ms)
Particle count: 80-120
Particle shapes: rectangles (8x4px) and circles (6px)
Particle colors:
  - --sds-color-blue-300 (#77B2C7)
  - --sds-color-green-300 (#98B43B)
  - --sds-color-yellow-200 (#EBCE2D)
  - --sds-color-brand-pacific (#A6CBD6)
  - --sds-color-brand-sky (#C0EAF2)
Origin: top-center of viewport
Fall pattern: gravity simulation with lateral drift and rotation
prefers-reduced-motion: confetti replaced with a brief green flash
  on the completion card border (200ms)
z-index: 3000
```

#### Completion Card Specification

| Property | Value | Token |
|----------|-------|-------|
| Background | `var(--sds-bg-elevated)` |
| Border | 1px solid `var(--sds-border-default)` |
| Border-radius | 16px |
| Shadow | 0 12px 32px rgba(0, 0, 0, 0.12) |
| Padding | 40px |
| Max-width | 480px |
| Text-align | center |
| z-index | 2500 |
| Backdrop | rgba(0, 0, 0, 0.2) |

| Content Element | Property | Token |
|-----------------|----------|-------|
| Celebration icon | size | 64x64px |
| Celebration icon container | background | `var(--sds-status-success-bg)` |
| Celebration icon container | border-radius | 16px |
| Celebration icon | color | `var(--sds-status-success-strong)` |
| Headline "You are all set!" | font | 24px / 700, `var(--sds-text-primary)` |
| Body text | font | 14px / 400, `var(--sds-text-secondary)`, max-width 360px, line-height 1.5 |
| Stats labels | font | 12px / 400, `var(--sds-text-tertiary)` |
| Stats values | font | 20px / 600, `var(--sds-text-primary)` |
| Stats card | background | `var(--sds-bg-subtle)` |
| Stats card | border-radius | 8px |
| Stats card | padding | 16px |
| "Explore Dashboard" button | class | `btn btn-primary btn-lg` |

#### Onboarding Checklist Widget Specification

```
Position: fixed, bottom-right corner
  bottom: 24px, right: 24px
Size: 320px wide, auto height
```

| Property | Value | Token |
|----------|-------|-------|
| Background | `var(--sds-bg-elevated)` |
| Border | 1px solid `var(--sds-border-default)` |
| Border-radius | 12px |
| Shadow | 0 4px 16px rgba(0, 0, 0, 0.1) |
| Padding | 16px 20px |
| Header | "Optional next steps" -- 13px / 600, `var(--sds-text-primary)` |
| Checklist item | 13px / 400, `var(--sds-text-secondary)` |
| Checklist item (completed) | strikethrough, `var(--sds-text-disabled)` |
| Checkbox (unchecked) | border: 1.5px solid `var(--sds-border-strong)`, 16x16px, border-radius 4px |
| Checkbox (checked) | background: `var(--sds-interactive-primary)`, white check icon |
| "Dismiss" link | 12px / 400, `var(--sds-text-tertiary)` |
| z-index | 100 |

#### Interaction Details

| Interaction | Behavior |
|-------------|----------|
| Page load | Sidebar transitions from simplified (3 items) to full navigation over 500ms (items fade in top-to-bottom with 60ms stagger). Simultaneously, confetti fires. Completion card fades in (300ms) centered over the content area. |
| Confetti | Runs for 3 seconds, then fades out (500ms). Does not block interaction with completion card. |
| "Explore Dashboard" click | Completion card scales down and fades out (300ms). Full dashboard is revealed underneath. Onboarding checklist widget slides in from bottom-right (300ms ease-out). |
| Checklist item click | Opens the relevant screen/modal for that task (e.g., clicking "Invite team members" opens an invite modal). |
| "Dismiss" click | Widget slides down and fades out. Does not reappear. User can re-access from Settings > Onboarding. |
| Widget collapse | Widget can be collapsed to just a small "Onboarding" pill at bottom-right. Click to expand. |

#### State Variations

| State | Description |
|-------|-------------|
| **Celebration** | Confetti active. Completion card visible. Dashboard visible behind backdrop. |
| **Dashboard revealed** | Card dismissed. Full dashboard visible. Checklist widget in bottom-right. |
| **Checklist active** | Widget expanded, showing 4 optional items. Items can be checked off. |
| **Checklist dismissed** | Widget hidden. Full clean dashboard experience. |

#### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| >= 1024px | Full layout. Completion card centered. Widget bottom-right. |
| 768-1023px | Sidebar collapsed. Completion card centered. Widget bottom-right. |
| < 768px | Completion card nearly full-width (16px margin). Widget becomes a full-width bottom bar. Confetti particle count reduced to 40-60. |

---

## 6. New Components Required

The following components are identified as needed for this flow and do not exist in the current Software DS component library:

| Component | Used In | Description | Priority |
|-----------|---------|-------------|----------|
| **Progress Tracker** | Onboarding Dashboard, mini-progress on all step screens | 5-step horizontal bar with illustrated icons, connecting lines, and completion states (completed/current/upcoming). | High |
| **Coach Mark** | Guided Connection Setup, Guided Classification Review, First Remediation | Pointed tooltip with info-styled background, arrow pointing to target element, dismiss button. Configurable position (top/bottom/left/right). | High |
| **Risk Score Gauge** | Risk Score Reveal, Marcus Demo | Semi-circular gauge with colored arc segments, animated needle, center score display. Configurable score range and thresholds. | High |
| **Guided Overlay** | Marcus Demo | Spotlight overlay with backdrop, step counter, navigation buttons, positioned adjacent to target element. Step indicator dots. | Medium |
| **Confetti Animation** | Onboarding Complete | Canvas-based particle system with configurable colors, particle count, and duration. Respects `prefers-reduced-motion`. | Medium |
| **Checklist Widget** | Onboarding Complete | Fixed-position card with checkbox items, collapsible to a pill, dismissible. Persists across page navigations. | Medium |
| **Range Slider** | Recommended Monitoring Setup | Horizontal slider with track, fill, thumb, value label, and snap-to-increment behavior. | Low |
| **Score Delta** | First Remediation | Old-to-new score comparison with animated counter, strikethrough on old value, and directional arrow. | Low |

Use the `/component-builder` skill to design each of these components before implementation.

---

## 7. guidedMode vs Full Product -- Comprehensive Comparison

| Aspect | guidedMode (true) | Full Product (false) |
|--------|-------------------|---------------------|
| **Sidebar navigation** | 3 items visible (Getting started, Connections, Dashboard) | Full navigation with all groups and items |
| **Connection platforms** | Top 4 only (Snowflake, AWS, Databricks, BigQuery) | All supported platforms |
| **Form helper text** | Shown on every field | Shown only on complex fields |
| **Troubleshooting** | Expanded by default | Collapsed by default |
| **Scan progress** | Educational tooltips per phase | Phase names only, no tooltips |
| **Background scan option** | Hidden for first scan | Available immediately |
| **Classification queue** | Limited to top 5 items | Full queue with pagination |
| **Classification reasoning** | Shown expanded by default | Collapsed by default |
| **Coach marks** | Shown on first interaction with each section | Never shown |
| **Risk dashboard** | Executive view only, no view toggle | All views with toggle tabs |
| **Risk gauge** | Animated reveal with anticipation build | Static gauge (or subtle animation) |
| **Remediation** | Top action pre-selected, simplified preview | Full action list, detailed preview with all metrics |
| **Celebrations** | Micro-animations at each step, confetti at end | No celebrations |
| **Progress tracker** | Visible on all step screens | Not present |

---

## 8. Accessibility Requirements

| Requirement | Implementation |
|-------------|---------------|
| **Progress tracker** | Each step is a list item with `aria-label="Step N: [name], [status]"`. Current step: `aria-current="step"`. |
| **Coach marks** | Announced via `aria-live="polite"` region. Focus moves to coach mark on appearance. "Got it" button receives focus. Esc key dismisses. |
| **Guided overlay** | Focus trapped within overlay card. Esc closes. Background elements get `aria-hidden="true"`. Step changes announced via `aria-live`. |
| **Risk gauge animation** | `prefers-reduced-motion`: gauge appears at final state, no sweep. Score announced via `aria-live="assertive"`. |
| **Confetti** | Canvas layer has `aria-hidden="true"`. `prefers-reduced-motion`: replaced with static color flash. |
| **Persona cards** | Cards are buttons with `role="radio"` in a `role="radiogroup"`. `aria-checked` on selected card. |
| **Keyboard navigation** | All interactive elements reachable via Tab. Arrow keys navigate within groups (persona cards, action cards, tabs). Enter/Space activates. |
| **Color contrast** | All text meets WCAG 2.1 AA contrast ratios. Status colors are never used as the sole indicator (always paired with text or icon). |
| **Screen reader flow** | Logical reading order matches visual layout. Breadcrumbs, page title, progress indicator, then content. |

---

## 9. Transition Architecture

| From | To | Transition |
|------|-----|-----------|
| Welcome (card click) | Onboarding Dashboard | Fade out welcome (200ms), fade in dashboard (300ms). |
| Dashboard (Start step) | Step screen | Content area cross-fade (200ms). Sidebar remains. Breadcrumb updates. |
| Step screen (completion) | Dashboard (next step) | Content area slide-left (300ms). Progress tracker updates. |
| Step screen (Skip) | Dashboard (next step) | Same as completion but with neutral (not celebration) transition. |
| Risk Score Reveal (Take Action) | First Remediation or Monitoring Setup | Content area cross-fade (200ms). |
| Any step (back/breadcrumb) | Onboarding Dashboard | Content area slide-right (300ms). |
| Marcus Demo (Connect My Data) | Onboarding Dashboard Step 1 | Demo banner fades. Content cross-fades. |
| Onboarding Complete (Explore) | Full Dashboard | Completion card scales out. Dashboard reveals. Sidebar transitions. |
| Full Dashboard (checklist item) | Relevant screen | Standard navigation transition. Checklist widget remains visible. |

All transitions use `cubic-bezier(0.4, 0, 0.2, 1)` easing (Material Design standard ease).

---

## 10. Data Requirements

| Screen | Data Needed | Source |
|--------|-------------|--------|
| Welcome | User name (for greeting on subsequent screens) | Sign-up session |
| Onboarding Dashboard | Onboarding progress state (0-5 steps, timestamps) | Backend: onboarding_progress table |
| Guided Connection Setup | Available platform list, OAuth availability flags | Backend: platforms API |
| First Scan Progress | Real-time scan progress (phase, percentage, counts) | WebSocket: scan_progress channel |
| Guided Classification Review | Top 5 classification suggestions with confidence, reasoning, sample data | Backend: classifications API (sorted by confidence desc, limit 5) |
| Risk Score Reveal | Calculated risk score, risk factors with contribution weights | Backend: risk_score API |
| First Remediation | Available actions with estimated impact scores | Backend: remediation_actions API |
| Monitoring Setup | Current scan schedule (if any), current alert thresholds | Backend: settings API |
| Marcus Demo | Pre-loaded sample dataset (static, shipped with product) | Frontend: embedded JSON fixtures |
| Onboarding Complete | Onboarding summary stats (sources, tables, score) | Backend: onboarding_summary API |
