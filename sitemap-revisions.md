# Sitemap Revisions — Based on UX Flows v2 & User Research Evaluation

**Date:** March 2026
**Purpose:** Identify gaps between the current sitemap (built from v1 flows) and the refined UX flows (v2), cross-referenced against the user researcher's 40+ friction points and priority recommendations. This document provides the Information Architect with specific, actionable changes.

---

## 1. Sitemap Gaps

The current sitemap was built from the original 6-flow architecture (34 screens). UX flows v2 expanded to 7 flows (44 screens). The following gaps exist.

### 1.1 New Pages/Views Added in v2 — Missing from Sitemap

| New Page/View | Flow | Type | Why It Exists |
|--------------|------|------|---------------|
| **Classification Review Queue** | Flow 2 | Sidebar nav item (list view) | Priya's primary daily workflow. Surfaces all pending classifications sorted by confidence, with batch actions. The single biggest UX addition in v2. |
| **Table Review** | Flow 2 | Sub-view of Review Queue | Batch review of all columns in one table with inline accept/override/reject. Accessible by grouping in Review Queue. |
| **Schema Drift Summary** | Flow 2 | Summary view (post-scan) | Surfaces new/dropped/modified schema elements after re-scans. Appears between Scan Summary and Review Queue. |
| **Risk Simulation** | Flow 3 | Drawer/panel on Risk Detail | "What-if" score modeling. User selects remediatable items, sees projected score impact before committing. |
| **Dry Run Results** | Flow 4 | Results view (modal/panel) | Validation without execution for all remediation types. Shows simulated results with no actual data modification. |
| **Rollback Preview** | Flow 4 | Confirmation view | Dedicated screen for rollback decisions, showing what will be reversed and risk score impact. Previously just an option; now first-class. |
| **Template Gallery** | Flow 5 | Card grid (empty state / creation entry) | Pre-built policy templates (PCI, GDPR, HIPAA, General PII) as starting points for policy creation. |
| **Inline Policy Creator** | Flow 5 | Drawer overlay | Condensed policy wizard accessible from Remediation Flow 4 without leaving remediation context. |
| **Policy Version Diff** | Flow 5 | Diff view | Side-by-side comparison of policy versions. Accessible from Policy Detail > Versions tab. |
| **Risk Dashboard — Executive View** | Flow 6 | Dashboard variant | Marcus-optimized: score, trend, coverage %, compliance summary, quick actions. |
| **Risk Dashboard — Governance View** | Flow 6 | Dashboard variant | Priya-optimized: review queue summary, regulation cards with gap counts, policy coverage, recent decisions. |
| **Risk Dashboard — Operations View** | Flow 6 | Dashboard variant | Jordan-optimized: connection health, scan status, freshness heatmap, system alerts. |
| **Alert Ribbon** | Flow 6 | Global element | Persistent cross-page notification ribbon below top nav for risk increases, scan failures, compliance changes. |
| **Welcome Screen** | Flow 7 | Welcome/choice | First-time persona selection: Data Engineer / Governance Analyst / Security Leader. |
| **Onboarding Dashboard** | Flow 7 | Dashboard (simplified) | Progress tracker with 5-step checklist. Replaces standard dashboard for new users. |
| **Guided Connection Setup** | Flow 7 | Wizard (simplified) | Reduced version of Flow 1 wizard with educational tooltips. |
| **First Scan Progress** | Flow 7 | Progress + education | Scan progress with explanatory tooltips about what the scan is doing. |
| **Guided Classification Review** | Flow 7 | Guided review | Top 5 classifications only, with coach marks explaining the review workflow. |
| **Risk Score Reveal** | Flow 7 | Celebration | Animated gauge filling to first risk score. The onboarding "aha" moment. |
| **First Remediation** | Flow 7 | Guided action | Pre-selected top risk item with simplified remediation and guided explanations. |
| **Onboarding Complete** | Flow 7 | Celebration + transition | Confetti animation, full dashboard reveal, dismissible checklist for remaining tasks. |

### 1.2 Pages Combined or Removed in v2

| Removed/Combined | Original Sitemap Entry | What Happened |
|-----------------|----------------------|---------------|
| **Step 1: Select Platform** + **Step 2: Configure Credentials** | `CONN_ADD_1`, `CONN_ADD_2` | Combined into a single step: "Select Platform + Configure." Platform card click reveals credential form inline. |
| **Step 5: Review & Save** | `CONN_ADD_5` | Merged into the schema selection step via a collapsible summary panel. No dedicated review page. |
| **Remediation Options modal** | `REM_OPTIONS` | Removed as separate screen. Action type selection merged into the Configure Remediation step. |
| **Step 1: Policy Basics** + **Step 2: Classification Rules** | `POL_CREATE_1`, `POL_CREATE_2` | Combined into "Basics + Classifications" — one step covering name, regulation, and classification scope. |

**Net result:** The connection wizard goes from 5 steps to 2. The policy wizard goes from 5 steps to 3. The remediation entry point is simplified from a separate options modal to an inline type selector.

### 1.3 New Navigation Items

| Item | Location | Type |
|------|----------|------|
| **Review Queue** | Sidebar > Discovery group (4th item) | Sidebar nav item |
| **Alert Ribbon** | Global, below top nav bar | Persistent global element |
| **Sidebar Scan Badge** | Badge overlay on Scans nav item | Dynamic badge indicator |
| **Onboarding Checklist** | Dismissible floating widget | Temporary global element |
| **Dashboard View Toggle** | Within Dashboard page header | Tertiary navigation (Executive / Governance / Operations) |

### 1.4 New Modal/Overlay Flows

| Modal/Overlay | Entry Point | Type |
|--------------|-------------|------|
| **Inline Policy Creator** | Remediation > Configure > "Create New Policy" during tokenize | Drawer overlay |
| **Dry Run Results** | Remediation > Preview Impact > "Dry Run" | Modal/panel |
| **Rollback Preview** | Remediation Detail > "Rollback" | Modal/confirmation |
| **Risk Simulation** | Risk Detail > "Simulate" | Drawer panel |
| **Scan Schedule Configuration** | Connection Detail > Settings tab, or Scan trigger | Modal/form |
| **Policy Version Diff** | Policy Detail > Versions tab > Compare | Side-by-side view |

### 1.5 New Tabs on Existing Detail Pages

| Page | New Tab | Purpose |
|------|---------|---------|
| **Table Detail** | Lineage | Data flow context for classified columns (mentioned in v2 screen inventory) |
| **Table Detail** | History | Classification history per column — who changed what, when |
| **Policy Detail** | Versions | Version history with diff capability. Replaces implicit edit history |

---

## 2. User Research Alignment

Cross-referencing the researcher's numbered recommendations against the current sitemap.

### 2.1 Recommendations That Require Sitemap Changes

| Rec # | Recommendation | Sitemap Change Needed |
|-------|---------------|----------------------|
| **2.1** | Dedicated classification review queue | **Add** Review Queue as a sidebar nav item under Discovery. This is the researcher's #1 critical finding. The sitemap has no equivalent page. v2 already adds this. |
| **6.1** | Role-based dashboard views | **Modify** Dashboard to support view toggle (Executive/Governance/Operations). The sitemap shows Dashboard as a single page with fixed sub-views (Risk Score, Coverage, Compliance, Top Risks, Activity Feed). Needs restructuring into three configurable layouts. |
| **6.4** | Universal search across all entities | **Add** global search as a persistent element in the top navigation. Not in the current sitemap at all. Requires a search results page or overlay. |
| **6.6** | Onboarding progress checklist for new accounts | **Add** the entire Flow 7 onboarding sequence (Welcome, Onboarding Dashboard, guided steps, celebrations). The sitemap only has a Dashboard empty state — not a full onboarding flow. |
| **3.4** | Risk simulation ("what-if" score modeling) | **Add** Risk Simulation as a drawer/panel accessible from Risk Detail. Not represented in sitemap. |
| **4.1** | Dry-run mode for all remediation types | **Add** Dry Run Results as a modal/view in the remediation flow. Not in sitemap. |
| **5.4** | Policy templates | **Add** Template Gallery as an entry point for policy creation. Not in sitemap. |
| **6.3** | Board summary export directly from dashboard | **Modify** Dashboard to include direct export/report generation. Currently report generation is only accessible via Reports page. |
| **1.1** | Scan scheduling during connection setup | **Modify** Connection Detail > Settings tab or Add Connection wizard to include scan schedule configuration. The sitemap's Connection Detail has a Settings tab but no indication of scheduling controls. |

### 2.2 Recommendations Already Addressed by the Sitemap

| Rec # | Recommendation | How the Sitemap Addresses It |
|-------|---------------|------------------------------|
| **3.2** | Prioritized recommended actions with risk impact | Risk Detail already has a Recommendations tab (`RISK_TAB_RECS`). v2 enhances content but no structural change needed. |
| **3.3** | Acknowledge/snooze with accountability | Risk Detail already exists with appropriate tabs. Snooze is a feature within the page, not a structural change. |
| **4.3** | Success screen drives next action | Remediation Success modal (`REM_SUCCESS`) already exists. v2 enhances content (score animation, next recommendation) but no new page needed. |
| **4.5** | Remediation history with compliance linkage | Remediation History List (`REM_LIST`) already exists. Adding a compliance impact column is a content change, not structural. |
| **5.2** | Policy effectiveness dashboard | Policy Detail (`POL_DETAIL`) with its tabs can accommodate effectiveness metrics. No new page needed — content enhancement to existing Overview tab. |
| **6.5** | Activity feed filtering and grouping | Activity feed is a section within Dashboard. Filtering is a feature addition, not a structural change. |

### 2.3 Recommendations That Need New Pages, Tabs, or Navigation Paths

| Rec # | Recommendation | Structural Need |
|-------|---------------|-----------------|
| **2.3** | Classification reasoning explanation | New content panel within Review Queue item detail or Table Detail column expansion. Could be a popover or expandable row — not a full page. |
| **2.4** | Cross-table classification consistency checker | New sub-view or tab within Review Queue. Could be a filter/mode toggle: "Show inconsistencies." |
| **2.6** | Classification rules for recurring patterns | New page or section: **Classification Rules** management. Could live as a tab on Review Queue or as a settings sub-page. Needs IA decision. |
| **3.1** | Risk topology graph (visual risk context) | New visualization mode within Risk Detail. Could be a tab addition or a toggle between list and graph views on Risk Factors tab. |
| **3.5** | Platform-specific access display | Content enhancement within Risk Detail > Access Analysis tab. No structural change needed, but tab content changes significantly. |
| **4.2** | Approval workflow for remediation | New page: **Approval Queue** for pending remediation approvals. Could be a tab on Remediation page or a standalone view. Needs IA decision on placement. |
| **4.4** | Scheduled remediation execution | Enhancement to remediation Configure step — add scheduling option. No new page, but a new modal for schedule configuration. |
| **5.1** | Regulation-aware policy defaults | Content enhancement to policy wizard. Template Gallery (added in v2) partially addresses this. |
| **6.2** | "What changed since last visit" dashboard summary | New dashboard section/card. Not a new page — a content addition to all three dashboard views. |
| **1.2** | Terraform provider and API for connections | Content additions to Settings > API tab and Connection confirmation screen. No new pages. |
| **1.4** | Connection health trending | Content enhancement to Connection Detail > Overview tab. No structural change. |

---

## 3. Proposed Sitemap Updates

### Add

| Page/View | Parent | Type | URL | Rationale |
|-----------|--------|------|-----|-----------|
| **Review Queue** | Discovery (sidebar) | List/queue view | `/review-queue` | Researcher rec 2.1 (Critical). v2 Flow 2. Priya's primary workflow. |
| **Review Queue > Table Review** | Review Queue | Sub-view | `/review-queue/:tableId` | v2 Flow 2. Batch review of all columns in a table. |
| **Risk Simulation** | Risk Detail | Drawer/panel | No separate URL (drawer on `/dashboard/risk/:riskId`) | Researcher rec 3.4. v2 Flow 3. |
| **Dry Run Results** | Remediation flow | Modal | No separate URL (modal within remediation) | Researcher rec 4.1. v2 Flow 4. |
| **Rollback Preview** | Remediation Detail | Modal/confirmation | No separate URL | v2 Flow 4. First-class rollback experience. |
| **Template Gallery** | Policies | Card grid (empty state + creation entry) | `/policies/templates` or inline on `/policies` empty state | Researcher rec 5.4. v2 Flow 5. |
| **Inline Policy Creator** | Remediation (tokenize) | Drawer overlay | No separate URL | v2 Flow 5. Context-preserving policy creation. |
| **Policy Version Diff** | Policy Detail | Sub-view | `/policies/:policyId/versions/:versionId` | v2 Flow 5. Audit trail for policy changes. |
| **Schema Drift Summary** | Scan Detail | Summary view | `/scans/:scanId/drift` or section within scan detail | v2 Flow 2. Schema change detection. |
| **Global Search** | Top navigation | Global overlay/page | `/search?q=` | Researcher rec 6.4. Universal search across all entities. |
| **Welcome Screen** | Root (pre-dashboard) | Welcome page | `/welcome` | v2 Flow 7. First-time persona selection. |
| **Onboarding Dashboard** | Root | Dashboard variant | `/onboarding` | v2 Flow 7. 5-step progress tracker. |
| **Guided Connection Setup** | Onboarding | Simplified wizard | `/onboarding/connect` | v2 Flow 7. |
| **First Scan Progress** | Onboarding | Progress view | `/onboarding/scan` | v2 Flow 7. |
| **Guided Classification Review** | Onboarding | Guided review | `/onboarding/classify` | v2 Flow 7. |
| **Risk Score Reveal** | Onboarding | Celebration | `/onboarding/risk-score` | v2 Flow 7. |
| **First Remediation** | Onboarding | Guided action | `/onboarding/remediate` | v2 Flow 7. |
| **Onboarding Complete** | Onboarding | Celebration | `/onboarding/complete` | v2 Flow 7. |
| **Alert Ribbon** | Global | Persistent element | No URL (global component) | v2 Flow 6. Cross-page persistent alerts. |

### Modify

| Existing Page | Change | Rationale |
|--------------|--------|-----------|
| **Dashboard** | Add view toggle: Executive / Governance / Operations. Each view has different widget layout. Add "Quick Actions" panel. Add direct "Generate Report" / "Export Board Summary" action. Add "What Changed" summary section. | Researcher recs 6.1, 6.2, 6.3. v2 Flow 6. |
| **Dashboard sub-views** | Restructure from fixed sections (Risk Score, Coverage, Compliance, Top Risks, Activity Feed) to three view-dependent layouts. Executive: score + trend + coverage + compliance + quick actions. Governance: review queue summary + regulation cards + policy coverage + recent decisions + quick actions. Operations: connection health + scan status + freshness heatmap + system alerts + quick actions. | v2 Flow 6. All three personas identified dashboard friction (researcher sections 1.1/1.2/1.3 Flow 6). |
| **Add Connection Wizard** | Reduce from 5 steps to 2: (1) Select Platform + Configure, (2) Select Schemas + Review Summary. Add OAuth quick-connect path. Add scan scheduling option. | v2 Flow 1. Researcher rec 1.1, 1.3. |
| **Connection Detail** | Add "degraded" connection state handling. Add reconnect flow for broken connections. Add health metrics (latency, uptime) to Overview tab. | v2 Flow 1. Researcher rec 1.4. |
| **Table Detail tabs** | Add **Lineage** tab and **History** tab to existing Columns / Classifications / Access. | v2 Flow 2 screen inventory. Researcher mentions lineage as medium priority (competitive gap with Sentra). |
| **Policy Detail tabs** | Add **Versions** tab to existing Overview / Applied Data / Activity Log. | v2 Flow 5. Policy versioning with diff view. |
| **Create Policy Wizard** | Reduce from 5 steps to 3: (1) Basics + Classifications, (2) Token Configuration with test panel, (3) Scope + Review with impact preview. Add template selection as entry point. | v2 Flow 5. Researcher rec 5.1, 5.4. |
| **Scan Detail** | Add Schema Drift section/tab for re-scans showing new/dropped/modified elements. | v2 Flow 2. |
| **Remediation flows** | Replace Remediation Options modal with inline type selector in Configure step. Add Dry Run as a first-class option in Preview. Add batch progress tracking for large remediations. | v2 Flow 4. Researcher rec 4.1. |
| **Remediation History** | Add compliance impact column. Add originating-flow filter (from risk / from review queue / from dashboard). | Researcher rec 4.5. v2 Flow 4. |
| **Settings** | Consider adding **Scan Scheduling** controls (if not housed in Connection Detail > Settings). Consider adding **Classification Rules** management (if not placed under Review Queue). | Researcher recs 1.1, 2.6. Placement TBD — see Open Questions. |
| **Dashboard empty state** | Replace simple empty state with full onboarding flow (Flow 7) that guides through all 5 stages. | v2 Flow 7. Researcher rec 6.6. |

### Remove

| Page/View | Reason |
|-----------|--------|
| **CONN_ADD_1 (Step 1: Select Platform)** | Combined with Step 2 into single "Select Platform + Configure" step. |
| **CONN_ADD_2 (Step 2: Configure Credentials)** | Combined with Step 1 (see above). |
| **CONN_ADD_5 (Step 5: Review & Save)** | Merged into schema selection step as collapsible summary panel. |
| **REM_OPTIONS (Remediation Options modal)** | Action type selection merged into Configure Remediation step. No separate options screen. |
| **POL_CREATE_1 (Step 1: Policy Basics)** | Combined with Step 2 into "Basics + Classifications." |
| **POL_CREATE_2 (Step 2: Classification Rules)** | Combined with Step 1 (see above). |

### Reparent

| Item | Current Parent | New Parent | Reason |
|------|---------------|------------|--------|
| No reparenting needed at the navigation group level. | — | — | The v2 sidebar structure keeps the same groups (Discovery, Protection, Compliance). Review Queue is added within Discovery, which is the correct group per the five-stage loop (Classify is part of Discovery). |

**Note on Review Queue placement:** The researcher and v2 flows both place Review Queue under Discovery. This makes sense because classification is part of the Discover/Classify stages, and Review Queue is tightly coupled with Data Catalog and Scans. An alternative placement under Protection was considered but rejected — classification review precedes remediation and is not a protection action.

---

## 4. Updated Navigation Structure

### 4.1 Revised Sidebar

```
SIDEBAR (220px expanded / 56px collapsed)
│
├── Dashboard                         icon: grid-2x2       standalone, no group
│   (View toggle inside page: Executive / Governance / Operations)
│
├── GROUP: Discovery                  11px uppercase label
│   ├── Connections                   icon: plug-zap
│   ├── Data catalog                  icon: database
│   ├── Scans                         icon: scan-search     (badge: running scan count)
│   └── Review queue                  icon: clipboard-check  (badge: pending count) ← NEW
│
├── GROUP: Protection                 11px uppercase label
│   ├── Policies                      icon: shield-check
│   └── Remediation                   icon: wrench
│
├── GROUP: Compliance                 11px uppercase label
│   ├── Regulations                   icon: scale
│   └── Reports                       icon: file-bar-chart
│
├── ─── spacer ───
│
└── FOOTER (pinned to bottom)
    ├── Settings                      icon: settings
    └── [Collapse toggle]             icon: panel-left-close / panel-left-open

GLOBAL ELEMENTS (not in sidebar)
├── Top nav: Universal search bar                            ← NEW
├── Alert ribbon: below top nav, persistent until addressed  ← NEW
└── Onboarding checklist: dismissible widget (new users)     ← NEW
```

**Sidebar item count:** 9 items (Dashboard + 7 section items + Settings). Within the recommended max of 10.

### 4.2 Updated Page Tabs

| Page | Tabs (updated) | Changes from Current |
|------|----------------|---------------------|
| Connection detail | Overview, Schemas, Scan history, Settings | No change. Scheduling lives within Settings tab. |
| Table detail | Columns, Classifications, Access, Lineage, History | **+2 tabs** (Lineage, History). 5 of 6 max. |
| Scan detail | Results, Errors, Schema drift | **+1 tab** (Schema drift, shown only for re-scans). 3 of 6 max. |
| Policy detail | Overview, Applied data, Versions, Activity log | **+1 tab** (Versions, replacing implicit edit history). 4 of 6 max. |
| Regulation detail | Requirements, Coverage, Gaps | No change. |
| Risk detail | Access analysis, Regulation mapping, Risk factors, Recommendations | No change. Risk Simulation is a drawer, not a tab. |
| Settings | Account, Team, Integrations, Notifications, API | No change (5 of 6 max). |

### 4.3 Updated Toggle Tabs

| Page | Toggle | Options | Changes |
|------|--------|---------|---------|
| Dashboard | View mode | Executive / Governance / Operations | **New toggle** — replaces single layout |
| Connection list | Status filter | All / Active / Degraded / Error | **Added** "Degraded" option |
| Data catalog | View mode | Grid / List | No change |
| Review queue | Confidence filter | All / Low (< 60%) / Medium (60-90%) / High (> 90%) | **New toggle** |
| Review queue | Group by | None / Connection / Table / Classification type | **New toggle** |
| Remediation history | Status filter | All / Pending / Completed / Failed / Rolled back | **Added** "Rolled back" option |
| Policy list | Status filter | All / Active / Draft / Disabled | No change |
| Risk detail > Access analysis | Access type | Machine access / Human access | No change |

### 4.4 New Breadcrumb Paths

| Current Page | Breadcrumb Path |
|-------------|-----------------|
| Review queue | Review queue |
| Review queue > Table review | Review queue > {Table Name} |
| Policy detail > Versions tab | Policies > {Policy Name} > Versions |
| Policy version diff | Policies > {Policy Name} > Versions > v{N} vs v{M} |
| Onboarding (any step) | Onboarding > {Step Name} |
| Search results | Search > "{Query}" |

### 4.5 New URL Structure

```
/review-queue                                    Classification Review Queue
/review-queue/:tableId                           Table Review (all columns for one table)

/onboarding                                      Onboarding Dashboard (progress tracker)
/onboarding/connect                              Guided Connection Setup
/onboarding/scan                                 First Scan Progress
/onboarding/classify                             Guided Classification Review
/onboarding/risk-score                           Risk Score Reveal
/onboarding/remediate                            First Remediation
/onboarding/complete                             Onboarding Complete
/welcome                                         Welcome Screen (persona selection)

/search                                          Search results (query via ?q= parameter)

/policies/templates                              Template Gallery
/policies/:policyId/versions                     Policy Versions tab
/policies/:policyId/versions/:versionId          Policy Version Diff

/scans/:scanId/drift                             Schema Drift Summary

/catalog/:connId/:schema/:table/lineage          Table Detail > Lineage tab
/catalog/:connId/:schema/:table/history          Table Detail > History tab
```

**Updated connection wizard URLs:** Since wizard steps are managed client-side within the modal, no URL changes needed despite step consolidation.

---

## 5. Cross-Flow Navigation Updates

### 5.1 Complete Updated Navigation Map (42 paths from v2 + researcher-identified additions)

The v2 flows define 42 cross-flow navigation paths. The following table includes all 42 plus additional paths implied by the researcher's recommendations.

| # | From | To | Trigger | Context Passed | New in v2? |
|---|------|-----|---------|---------------|------------|
| 1 | Dashboard (empty) | Onboarding | First login | Persona selection | Yes |
| 2 | Dashboard | Connections List | Quick Action / Connection health widget | Filter to problem connections | Enhanced |
| 3 | Dashboard | Data Catalog | Click protection coverage donut | Filter: unprotected items | Same |
| 4 | Dashboard | Risk Detail | Click risk score or top risk item | Risk item ID | Same |
| 5 | Dashboard | Remediation | Quick Action "Remediate N items" | Pre-selected items + action type | Yes |
| 6 | Dashboard | Review Queue | Quick Action or Governance view widget | Filter to latest scan | Yes |
| 7 | Dashboard | Regulation Detail | Click compliance card | Regulation ID | Same |
| 8 | Dashboard | Reports | Export button | Current view + time range | Enhanced |
| 9 | Onboarding | Connection Setup (guided) | Step 1 CTA | Persona context | Yes |
| 10 | Onboarding | Scan Progress | Auto-triggered after connection | Connection ID | Yes |
| 11 | Onboarding | Review Queue (guided) | Step 3 CTA | Top 5 items, coach marks | Yes |
| 12 | Onboarding | Dashboard | Onboarding complete | First risk score | Yes |
| 13 | Connection List | Connection Detail | Click row | Connection ID | Same |
| 14 | Connection List | Add Connection | "+ Add Connection" | None | Same |
| 15 | Connection Detail | Scan Progress | "Trigger Scan" or auto-trigger | Connection ID, schemas | Same |
| 16 | Connection Detail | Data Catalog | Click schema/table | Filter: this connection | Same |
| 17 | Connection Detail | Reconnect flow | "Reconnect" on error state | Connection ID, pre-filled host | Yes |
| 18 | Scan Progress | Scan Summary | Scan completion | Scan results | Same |
| 19 | Scan Summary | Review Queue | "Review N classifications" CTA | Filter: this scan | Yes |
| 20 | Scan Summary | Data Catalog | "View Data Catalog" | Filter: this scan | Same |
| 21 | Review Queue | Table Review | Group by table click | Table ID | Yes |
| 22 | Review Queue | Remediation | "Remediate Now" on high-sensitivity | Column ID, recommended action | Yes |
| 23 | Review Queue | Risk Dashboard | Back / sidebar nav | Auto-refreshed score | Yes |
| 24 | Data Catalog | Table Detail | Click table row | Table ID | Same |
| 25 | Table Detail | Remediation | "Tokenize" / "Revoke Access" | Column ID, classification, action | Same |
| 26 | Table Detail | Policy Detail | Click applied policy | Policy ID | Same |
| 27 | Risk Detail | Remediation | Click recommendation | Risk item, affected items, action | Enhanced |
| 28 | Risk Detail | Risk Simulation | "Simulate" | Remediatable items list | Yes |
| 29 | Risk Simulation | Remediation | "Proceed to Remediate" | Pre-selected items from sim | Yes |
| 30 | Remediation Configure | Inline Policy Creator | "Create New Policy" (tokenize) | Returns with new policy | Yes |
| 31 | Remediation Success | Dashboard | "Return to Dashboard" | Updated score, delta | Enhanced |
| 32 | Remediation Success | Remediation Configure | "Remediate More" | Reset | Same |
| 33 | Remediation Success | Remediation History | "View History" | Latest entry highlighted | Same |
| 34 | Remediation History | Remediation Detail | Click entry | Remediation ID | Same |
| 35 | Remediation Detail | Rollback Preview | "Rollback" action | Items, projected score | Yes |
| 36 | Policy List | Policy Detail | Click row | Policy ID | Same |
| 37 | Policy List | Create Policy / Template Gallery | "+ Create" or template card | Template pre-fill | Enhanced |
| 38 | Policy Detail | Remediation | "Apply Policy" | Policy ID, matching columns | Same |
| 39 | Policy Detail | Data Catalog | "Applied Data" tab, click column | Filter: this policy | Yes |
| 40 | Regulation Detail | Remediation | "Remediate Gaps" | Gap items, regulation context | Enhanced |
| 41 | Regulation Detail | Reports | "Generate Compliance Report" | Regulation, current status | Same |
| 42 | Any page (Alert Ribbon) | Source flow | Click alert action | Alert context | Yes |

### 5.2 Additional Paths Identified by User Research (Not in v2)

| # | From | To | Trigger | Source |
|---|------|-----|---------|--------|
| 43 | Dashboard (any view) | Board Summary PDF | "Generate Board Summary" button | Researcher rec 6.3 |
| 44 | Review Queue | Classification Rules | "Create Rule" from recurring pattern | Researcher rec 2.6 (if Classification Rules becomes a page) |
| 45 | Review Queue | Consistency View | "Show inconsistencies" filter/mode | Researcher rec 2.4 |
| 46 | Remediation Configure | Approval Queue | "Request Approval" (insufficient permissions) | Researcher rec 4.2 |
| 47 | Global Search | Any entity detail | Click search result | Researcher rec 6.4 |
| 48 | Connection Detail | Scan Schedule modal | "Schedule Scan" in Settings tab | Researcher rec 1.1 |

### 5.3 Paths Removed from Sitemap

| Path | Reason |
|------|--------|
| Dashboard > Connection List (empty state CTA) | Replaced by Onboarding flow (path #1). Dashboard empty state no longer just has a CTA — it triggers Flow 7. |

---

## 6. Risks & Open Questions

### 6.1 Conflicting Recommendations

| Conflict | Details | Suggested Resolution |
|----------|---------|---------------------|
| **Review Queue placement** | The researcher recommends Review Queue as a sidebar item under Discovery. v2 agrees. However, the sitemap's grouping rationale says Discovery maps to "Discover + Classify" stages, and Review Queue is firmly in the Classify stage. If a future "Classify" group is created, Review Queue would need to move. | Keep Review Queue under Discovery for now. The five-stage loop treats Discover and Classify as tightly coupled. Revisit if the sidebar ever splits Discovery into separate Discover/Classify groups. |
| **Classification Rules location** | Researcher rec 2.6 calls for classification rules (pattern-based auto-apply). This could be: (a) a tab on Review Queue, (b) a section in Settings, or (c) a standalone sidebar item. v2 does not specify. | Recommend placing as a tab within Review Queue. Classification rules are tightly coupled to the review workflow and governed by Priya. Settings placement would bury it. Standalone sidebar item would push sidebar to 10 items. |
| **Approval Queue for remediation** | Researcher rec 4.2 calls for approval workflows. This could be: (a) a tab on the Remediation page, (b) a standalone page, or (c) a notification-based workflow without a dedicated page. v2 mentions "Request approval" as a permission state but does not define an approval queue. | Recommend adding an "Approvals" tab to the Remediation page. This keeps related functionality together without adding a sidebar item. Approval notifications should also surface in the Alert Ribbon. |
| **Scan scheduling location** | Researcher rec 1.1 wants scheduling in the connection wizard. v2 adds scan scheduling to Flow 2 but houses it in Connection Detail > Settings or as a separate configure step. The sitemap's connection wizard is being reduced from 5 to 2 steps — adding scheduling back would add a step or complicate the second step. | Keep scheduling out of the wizard. Place it in Connection Detail > Settings tab (accessible immediately after connection creation) and in a "Schedule" action on the Scans page. The wizard should optimize for speed; scheduling is a post-setup configuration. |

### 6.2 Scalability Concerns

| Concern | Details |
|---------|---------|
| **Sidebar item count at 9** | Adding Review Queue brings the sidebar to 9 items (of 10 max). Only 1 slot remains before a redesign trigger. Upcoming features mentioned in the sitemap's scalability section (Alerts/Notifications center, Audit Logs, Data Lineage) would each require a sidebar slot. If any two ship, a redesign is needed. |
| **Table Detail tabs at 5** | Adding Lineage and History tabs brings Table Detail to 5 of 6 max. Only 1 slot remains. If data quality or data profiling features are added later, Table Detail tabs will need restructuring. |
| **Onboarding flow URL depth** | The onboarding URLs (`/onboarding/connect`, `/onboarding/scan`, etc.) create a parallel URL hierarchy. If onboarding ever needs to support multiple onboarding tracks (e.g., different flows for different personas), the URL structure may need nesting or query parameters. |
| **Dashboard view toggle vs. separate pages** | The three dashboard views share a URL (`/dashboard`) with view state managed client-side or via query parameter. This means bookmarking and sharing a specific view requires query param support (`/dashboard?view=operations`). If views diverge significantly over time, they may need separate URLs. |

### 6.3 Open Questions for the IA

1. **Should Classification Rules be a tab on Review Queue, a section in Settings, or a standalone page?** The researcher identifies this as High priority (rec 2.6). v2 does not specify placement. The IA should decide based on information scent — where would Priya look for this?

2. **Should the Approval Queue for remediation be a tab on Remediation or a standalone page?** If approval workflows become complex (multi-step, multi-approver), a tab may not be sufficient. The IA should assess based on expected approval volume and complexity.

3. **Should Global Search have its own results page (`/search?q=`) or be an overlay/dropdown?** Atlan uses an overlay pattern. A full page allows for richer filtering. The IA should decide based on expected search complexity and cross-entity result types.

4. **Should the onboarding flow have separate URLs or be client-side state?** Separate URLs allow deep-linking and resumption but create a parallel URL hierarchy. Client-side state keeps URLs simple but loses bookmarkability. The IA should align with the existing convention (wizards are client-side, but onboarding steps are more page-like than wizard steps).

5. **Should Template Gallery be a standalone page (`/policies/templates`) or an inline section on the Policies list page?** If templates grow beyond 4-5 options, a standalone page may be warranted. If they remain few, inline display on the empty state + a "Start from template" option in the creation flow is sufficient.

6. **How should the "What Changed" summary on the Dashboard be handled for users who visit multiple times per day?** The researcher recommends "since your last visit" (rec 6.2), but frequent visitors may see minimal changes. Consider a configurable lookback period (1 day, 7 days, 30 days) rather than strictly last-visit tracking.

7. **Where does data lineage live long-term?** v2 adds a Lineage tab to Table Detail. The researcher (citing Sentra's DataTreks) suggests lineage could become a major feature. If it does, it may need a standalone sidebar item under Discovery. The IA should plan for this escalation path.

---

## Summary of Changes

| Category | Count |
|----------|-------|
| Pages/views to add | 18 (8 from onboarding, 10 from v2 flow enhancements) |
| Pages/views to remove | 6 (wizard step consolidations, options modal) |
| Pages to modify | 10 (dashboard, connection wizard, table detail, policy wizard, scan detail, remediation flows, etc.) |
| New sidebar items | 1 (Review Queue) |
| New global elements | 3 (Search bar, Alert Ribbon, Onboarding Checklist) |
| New tabs on existing pages | 4 (Table Detail +2, Scan Detail +1, Policy Detail +1) |
| New cross-flow paths | 12 (paths 5-6, 9-12, 17, 19, 21-23, 28-30, 35, 42) |
| Net screen count change | +10 (34 to 44) |
