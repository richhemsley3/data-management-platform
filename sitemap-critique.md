# Design Critique: DMP Sitemap & Information Architecture

Stage: Information architecture document (pre-implementation)

---

## Overall Impression

This is a well-considered, mature IA that maps cleanly to the product's five-stage loop and serves its three distinct personas without collapsing into a one-size-fits-all structure. The grouping rationale is unusually thorough for this stage -- most sitemaps assert groupings without defending them, and this document does the opposite, which will prevent costly rearrangements later. The primary weakness is a structural gap between classification (buried inside Data Catalog) and risk assessment (owned entirely by Dashboard), which breaks the loop at precisely the point where user trust is built or lost.

---

## Scorecard

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Navigational Hierarchy** | 4/5 | Three groups plus standalone Dashboard is clean and scannable. Depth is well-controlled (max 4 levels). The Risk Detail view living under Dashboard rather than having its own navigational presence is the one hierarchy question. |
| **Clarity** | 4/5 | Labels are strong -- "Connections" over "Data Sources," "Remediation" over "Actions." Grouping rationale is exceptionally well-documented. The Assess stage of the loop has no explicit label anywhere in the sidebar, which could confuse users looking for risk assessment as a discrete activity. |
| **Consistency** | 5/5 | Naming patterns are uniform (noun labels for sidebar items, verb-noun for actions). Tab structures follow a predictable pattern across all detail pages. URL conventions are clean and RESTful. Breadcrumb rules are clearly defined. |
| **Information Density** | 4/5 | 8 sidebar items is appropriately lean. Tab counts are reasonable (2-5 per page). The Page Inventory table reveals a heavy modal layer -- 13+ modal flows -- which could create density problems at the interaction level even though the navigation layer is sparse. |
| **Interaction Design** | 3/5 | Cross-flow navigation is well-mapped, but the heavy reliance on modals for multi-step workflows (both wizards are 5-step modals, all 4 remediation types are modals) risks feeling constrained on smaller viewports and obscures the user's position in the overall loop. Deep linking stops at modals, which means critical workflows cannot be bookmarked or shared. |
| **Emotional Quality** | 4/5 | The structure projects competence and order. The Dashboard-first landing with empty-state onboarding is welcoming. The grouping into Discovery/Protection/Compliance tells a story of progressive mastery. The gap is that the "reward" moment -- risk reduction -- lives only in the Dashboard, making it easy to miss during deep workflow sessions. |

**Overall: 4/5**

---

## DMP Principle Check

| Principle | Status | Notes |
|-----------|--------|-------|
| **Loop continuity** | Needs work | The five-stage loop (Discover, Classify, Assess, Remediate, Track) maps to the IA as follows: Discover = Connections + Scans, Classify = Data Catalog (Classifications tab), Assess = Dashboard + Risk Detail, Remediate = Remediation + Policies, Track = Dashboard. The problem is that Classify and Assess have no sidebar-level presence of their own. Classification is a tab inside Table Detail (three levels deep), and Assessment is a drill-down from Dashboard. The cross-flow navigation map covers the transitions well, but a user who thinks "I need to assess risk" has no obvious place to click. The loop is structurally present but not navigationally legible. |
| **Density vs. clarity** | Pass | The dual-persona support is thoughtful. Jordan (data engineer) owns Connections and Scans with dense, technical detail pages. Priya (governance analyst) owns Classification, Policies, and Regulations with more guided workflows. The toggle tabs (Grid/List for catalog, status filters for lists) allow each persona to tune density. The one concern is that Table Detail serves both personas (Columns tab for Jordan, Classifications tab for Priya) without any indication of which tab is the "starting point" for each role. |
| **Classification confidence prominence** | Needs work | Classification lives as a tab within Table Detail, which is already two navigation levels deep from the sidebar (Data Catalog > Table > Classifications tab). Confidence scores, the most trust-critical element in the product, have no navigational surface area above the table-cell level. There is no "Classification Review" queue or inbox -- a governance analyst must browse the catalog, find tables with pending classifications, open each one, and navigate to the Classifications tab. This buries the product's key differentiator. |
| **Risk reduction as reward** | Needs work | The Dashboard includes Risk Score + Trend and Protection Coverage, which are the right containers for celebrating progress. However, the Remediation Success modal offers only two exits: "View dashboard" and "Remediate more." There is no inline before/after risk score comparison at the point of remediation completion. The reward is deferred to a separate page rather than delivered at the moment of action. The Remediation History page also lacks any aggregate "risk reduced" metric -- it is a log, not a scorecard. |
| **Connection setup friction** | Pass | The 5-step wizard is well-structured: Select Platform, Configure Credentials, Test Connection, Select Schemas, Review & Save. Step 3 (Test Connection) is correctly positioned as a discrete step rather than an inline action, giving it the prominence the skill definition calls for. The empty-state onboarding path (Dashboard empty state > "Connect your first data source" CTA > Connection list > Add Connection) is clear and low-friction. One minor note: the wizard is a modal, which means a test failure cannot easily link to documentation or troubleshooting without dismissing the modal context. |

---

## What's Working Well

**1. Grouping rationale is a strategic asset, not just documentation.**
The "Alternatives Considered" section for each group transforms this from a simple sitemap into a decision record. When future product managers propose moving Scans into a standalone group or renaming Protection to Security, this document provides the reasoning to evaluate the change. This is rare and valuable.

**2. The Dashboard as a standalone item above groups is the correct call.**
Placing Dashboard outside any group recognizes that it aggregates across the entire loop. The alternatives-considered note (rejecting a "Monitor" group) shows the team resisted the temptation to over-categorize. This keeps the most important page one click away at all times.

**3. URL structure supports deep linking and shareability.**
Tab-level URLs (e.g., `/connections/:id/schemas`, `/regulations/:id/gaps`) mean that a governance analyst can share a direct link to a regulation's gaps tab in Slack, and the recipient lands exactly where needed. This is a significant collaboration enabler that many enterprise products get wrong.

**4. Sidebar item count is disciplined.**
At 8 items with room for 2 more, the sidebar avoids the common enterprise trap of growing to 15+ items. The scalability assessment (Section 8) explicitly defines when a redesign is triggered, which prevents gradual bloat.

**5. Cross-flow navigation map is comprehensive and bidirectional.**
The "From > To > Trigger > Navigation Type" table in Section 9 covers 15 cross-flow paths. Critically, it includes return paths (Remediation Success > Dashboard), not just forward paths. This prevents dead-end screens.

**6. Labeling choices favor user mental models over internal terminology.**
"Connections" instead of "Data Sources," "Scans" instead of "Metadata Ingestion," "Remediation" instead of "Protection Actions." The terminology table in the product context document maps internal to external terms, and the sidebar consistently uses the external terms.

---

## Areas for Improvement

### 1. The Assess stage is invisible in the navigation

**What I see:** The five-stage loop is Discover > Classify > Assess > Remediate > Track. In the sidebar, Discover maps to the Discovery group, Remediate maps to Protection, and Track maps to Dashboard/Compliance. But "Assess" has no navigational home. Risk assessment lives as a drill-down from Dashboard (Risk Detail), which is a child view, not a peer destination.

**Why it matters:** A governance analyst whose primary job is risk assessment has to start at the Dashboard and drill down to find risk details. There is no "Risk Assessment" or "Risk" sidebar item that says "your work lives here." This forces assessment-focused users to navigate through an executive-oriented summary page (Dashboard) to reach their operational workspace. It also means the loop has a perceptual gap: users can see Discover and Remediate in the sidebar, but Assess is absorbed into the Dashboard.

**Suggestion:** Consider adding a "Risk" or "Assessment" item, either as a standalone sidebar entry or within a renamed group. One option: rename "Protection" to "Risk & Protection" and add a "Risk Assessment" page that surfaces the top risks table and risk detail views without requiring Dashboard drill-down. Alternatively, keep the current structure but add a persistent "Risk Score" indicator in the sidebar header or topbar so that risk assessment has navigational presence without adding a new page.

### 2. Classification review has no dedicated workflow surface

**What I see:** Classification review -- the product's primary differentiator -- requires navigating Data Catalog > find a table > open Table Detail > switch to Classifications tab. There is no queue, inbox, or filtered view that shows "here are all the classifications awaiting your review."

**Why it matters:** Priya (governance analyst) needs to review machine-suggested classifications daily. The current IA requires her to browse the entire catalog and manually identify which tables have pending classifications. At scale (thousands of tables across multiple connections), this becomes untenable. It also undermines the "guided semi-automatic" value proposition -- the system suggests, but the human cannot efficiently find the suggestions.

**Suggestion:** Add a "Classification Review" view, either as a sub-view within Data Catalog (e.g., a toggle tab: "All / Pending Review") or as a dedicated page under Discovery. This view should show a prioritized list of pending classifications sorted by confidence score (lowest confidence first, since those need the most human judgment). Each row should link directly to the Classifications tab of the relevant table. This is arguably the most important quick win for the product's competitive positioning.

### 3. Modal-heavy workflow architecture creates fragility

**What I see:** The Page Inventory lists 13+ modal-based workflows: Add Connection (5-step), Create Policy (5-step), Scan Progress, Scan Results Summary, Classification Override, four Remediation type flows, Remediation Options, Remediation Success, Delete Confirmations, and Schedule Report. Modals are the dominant interaction pattern for all creation and action workflows.

**Why it matters:** Five-step wizard modals are difficult on viewports below 1024px, especially when steps require reviewing data tables (Step 4: Select Schemas) or complex configuration (Step 3: Token Configuration in the policy wizard). Modals cannot be deep-linked, bookmarked, or shared -- so a data engineer halfway through a connection setup who gets interrupted cannot save a URL and return. Modals also trap the user: if a Test Connection fails and the engineer needs to check documentation, they must either dismiss the modal (losing progress) or open a new browser tab.

**Suggestion:** Consider promoting the two 5-step wizards (Add Connection and Create Policy) from modals to full-page flows with their own URL routes (e.g., `/connections/new/step/1`). This enables deep linking, better viewport flexibility, and contextual help without modal conflicts. Keep shorter flows (Classification Override, Delete Confirmation, Remediation single-step actions) as modals where the lightweight pattern is appropriate. The URL conventions document already has `/connections/new` and `/policies/new` -- extend these with step segments.

### 4. Remediation detail is a side panel while everything else is a full page

**What I see:** The Page Inventory specifies "Remediation Detail Panel" as a side panel, while every other detail view (Connection Detail, Table Detail, Scan Detail, Policy Detail, Regulation Detail, Risk Detail) is a full page.

**Why it matters:** This inconsistency breaks the pattern users will learn from every other detail view. A user who clicks a row in any other list expects a full page; clicking a row in Remediation History produces a side panel. Side panels also have less space for the information that remediation detail needs to show: affected columns, before/after states, rollback options, and audit trails.

**Suggestion:** Either promote Remediation Detail to a full page with tabs (e.g., Overview, Affected Data, Audit Log) to match the pattern of every other detail view, or explicitly document why the side panel is the correct pattern here (e.g., users need to see the list and detail simultaneously for comparison). If the side panel is intentional, consider applying it to at least one other detail view so it becomes a recognized pattern rather than an exception.

### 5. No explicit onboarding path beyond the empty state

**What I see:** The Dashboard empty state shows three steps: Connect, Scan, Review. The Connection List and Data Catalog also have empty states. But the onboarding path is limited to empty-state CTAs -- there is no progressive onboarding that guides users through the full loop on their first use.

**Why it matters:** The five-stage loop is the product's core mental model, but a new user's first experience only covers the first two stages (Connect and Scan). After the initial scan completes, the user lands in the Data Catalog with no guidance toward Classification review, Risk Assessment, or Remediation. The loop is structurally complete but experientially incomplete for new users.

**Suggestion:** Consider a lightweight onboarding checklist that persists in the Dashboard until all five stages have been completed at least once: (1) Connect a data source, (2) Run your first scan, (3) Review classifications, (4) Check your risk score, (5) Apply your first remediation. This makes the loop tangible during onboarding without adding permanent IA complexity.

---

## Competitive Comparison

### vs. Cyera's Unified Console

Cyera presents discovery, risk, and remediation in a single console view with minimal navigation depth. Their approach prioritizes speed-to-insight: a user sees classified data, risk context, and enforcement options on the same screen. The DMP sitemap takes a more segmented approach, separating Discovery, Protection, and Compliance into distinct groups. This is appropriate for the DMP's more complex workflow (guided classification adds a step Cyera skips), but the DMP should learn from Cyera's ability to show risk context alongside data discovery. Currently, the DMP requires navigating from Data Catalog to Dashboard to see risk implications of what was discovered -- Cyera would show them inline.

### vs. Varonis's Data-Centric Navigation

Varonis organizes navigation around data objects rather than workflow stages. Users find a data store, see its access patterns, and remediate from there. The DMP's workflow-stage grouping (Discovery > Protection > Compliance) is more pedagogically clear -- it teaches the loop -- but Varonis's object-centric approach may be more efficient for repeat users who already know the loop and just want to act on a specific table. The DMP's cross-flow navigation (Table Detail > Remediation Options) partially addresses this, but it requires the user to know that remediation actions live in the Table Detail context. Varonis makes this more discoverable. The DMP should also note that Varonis's 4.9/5 UX rating on Gartner Peer Insights sets a high bar; the IA needs to translate into an implementation that matches that polish.

### vs. Wiz's Security Graph Approach

Wiz's security graph visualization connects data sensitivity to identity, misconfiguration, and attack paths in a single visual model. This is fundamentally different from the DMP's list-and-detail IA pattern. The DMP does not currently include any graph or relationship visualization in its IA -- the Risk Detail page uses tabs (Access Analysis, Regulation Mapping, Risk Factors, Recommendations) rather than a connected graph. For the DMP's current scope (focused on data security rather than full cloud security), the tabbed approach is appropriate and simpler to implement. However, as the product scales to show relationships between connections, classifications, access patterns, and regulations, a graph view could become necessary. The IA should plan for this as a potential future addition to the Dashboard or as a standalone view.

### vs. Atlan's Consumer-Grade Navigation

Atlan is the UX benchmark in the adjacent data governance space, described as "the type of tool people want to use." Their approach features search-driven navigation, minimal sidebar items, and a consumer-grade feel with fast filtering. The DMP's IA is more structured (groups, tabs, breadcrumbs) which is appropriate for a security product where users need predictable paths and audit trails. However, the DMP could learn from Atlan's search-first philosophy. The current IA has no global search mentioned in the sitemap. For a product managing potentially thousands of tables across multiple connections, a global search (or command palette) that can find any table, column, policy, or regulation by name would significantly reduce navigation friction, especially for repeat users.

---

## Quick Wins

1. **Add a "Pending Review" filter to Data Catalog.** A simple toggle tab (All / Pending Review) on the Data Catalog page would surface classifications awaiting human confirmation without adding a new page. This directly supports the guided classification differentiator and gives Priya a daily workflow entry point.

2. **Add a global search or command palette to the navigation.** A search icon in the sidebar header or a keyboard shortcut (Cmd+K) that opens a search overlay would let users jump to any entity (connection, table, policy, regulation) without navigating the hierarchy. This is a standard pattern (Atlan, Linear, Notion) that dramatically improves efficiency for power users.

3. **Show a risk score delta on the Remediation Success modal.** When a remediation completes, display "Risk score: 72 > 64 (-8)" alongside the success message. This delivers the "risk reduction as reward" principle at the moment of action, not deferred to the Dashboard. Requires only a single API call to the risk engine.

4. **Add a "Classification Review" count badge to the Data Catalog sidebar item.** Display a small count badge (e.g., "12") next to "Data catalog" in the sidebar showing the number of pending classifications. This pattern (similar to unread email counts) creates a natural pull toward the review workflow and makes the classification backlog visible at all times.

5. **Document a global search / command palette in the IA.** Even if not built immediately, reserving the pattern in the IA document prevents future navigation additions from conflicting with it. Add a section to the navigation structure describing the search overlay, its scope (all entities), and its keyboard shortcut.

---

## Structural Risks

**1. Classification volume scaling.** The current IA assumes classification review happens at the table level (open Table Detail, review columns). When the product supports hundreds of connections with thousands of tables, each containing dozens of classifiable columns, the table-by-table review pattern will not scale. The IA will need a dedicated classification workflow surface -- likely a queue-based view with bulk actions, sorting by confidence, and filtering by classification type. Planning for this now (even as a reserved sidebar item) would prevent a disruptive IA change later.

**2. Modal depth could compound.** The IA allows modal-from-modal flows: Table Detail > Remediation Options (modal) > Tokenize Flow (modal with sub-steps). If future features add more modal layers (e.g., a confirmation dialog within a remediation flow), the stacking will create usability and accessibility problems. Consider establishing a maximum modal depth rule (e.g., no more than 2 levels) in the IA document.

**3. The Dashboard is load-bearing for too many concerns.** The Dashboard currently owns: executive summary (Marcus), risk assessment entry (Priya), onboarding (Jordan), risk detail drill-down, compliance status overview, and activity feed. As the product grows, each of these functions may need more space. The IA should identify which Dashboard responsibilities could graduate to their own pages. Risk Detail is already a sub-page; Activity Feed could become a standalone notifications/activity page; Compliance Status could merge into the Regulations page.

**4. Two sidebar slots is not much runway.** With 8 of 10 recommended slots filled, the product has room for only 2 more items before triggering a redesign. Foreseeable additions include: Alerts/Notifications, Audit Logs, Classification Queue, Risk Assessment, and Data Lineage. That is 5 candidates for 2 slots. The scalability assessment in Section 8 addresses this, but the recommended mitigations (tabs within Settings, tabs within Table Detail) may not be appropriate for all candidates. Consider whether collapsible sidebar groups should be the default scalability pattern rather than a last resort.

**5. No role-based navigation adaptation.** The IA serves Jordan (data engineer), Priya (governance analyst), and Marcus (executive) through the same navigation structure. As the product matures, these personas may need different default views, different sidebar item ordering, or different landing pages. The IA does not address role-based navigation, and adding it later would require rethinking the sidebar active-state rules, default landing page logic, and breadcrumb generation. Consider at minimum documenting role-based landing pages (Marcus always lands on Dashboard; Jordan could land on Connections) as a planned extension point.

---

## Next Steps

- Use `/page-designer` to design the Classification Review queue view identified as the top structural gap.
- Use `/component-builder` to spec the risk score delta component for the Remediation Success modal.
- Use `/design-reviewer` to audit the sidebar navigation against Software DS spacing and active-state tokens once implementation begins.
