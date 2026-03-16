# Design Critique: DMP UX Flows v2

Stage: Flow architecture document (pre-wireframe gate review)

---

## Overall Impression

UX Flows v2 represents a substantial leap from v1. The original 6-flow, 34-screen architecture had structural gaps that would have undermined the product's core differentiators -- most critically, the buried classification review workflow and the single-persona dashboard. V2 addresses both of these with conviction, adding the Classification Review Queue as a first-class navigation item and implementing persona-specific dashboard views. The addition of Flow 7 (onboarding) closes the time-to-value gap that would have put the product at a disadvantage against Cyera's days-to-insight positioning.

The flow architecture now supports a best-of-breed experience for the Classify and Track stages of the loop. The Discover and Remediate stages were already strong in v1 and are meaningfully improved in v2 (wizard consolidation, dry-run mode, context preservation). The Assess stage remains the weakest link -- it has improved content (risk simulation, "What Changed" summaries) but still lacks navigational independence.

The jump from 34 to 44 screens is well-managed. The 10-screen increase comes almost entirely from the onboarding flow (8) and genuinely necessary new surfaces (Review Queue, Template Gallery). Meanwhile, 5 screens were eliminated through wizard consolidation. This discipline suggests the team resisted feature creep while addressing real gaps.

**Bottom line:** V2 is ready for wireframing with targeted adjustments. The architecture is sound, the competitive positioning is strong, and the persona support is dramatically improved. The concerns below are refinements, not restructuring.

---

## Scorecard

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Visual Hierarchy** | 4/5 | The flow architecture establishes clear primary actions per screen (e.g., "Accept All Above Threshold" in Review Queue, "Save + Start Scan" as primary CTA). Dashboard view toggle creates clean persona-specific hierarchies. Concern: the Alert Ribbon, Quick Actions panel, onboarding checklist widget, and sidebar scan badge introduce four simultaneous attention-competing global elements. Wireframes will need to carefully manage the visual weight of these overlapping notification layers. |
| **Clarity** | 4/5 | Purpose and exit paths are well-defined for every screen. The "What Changed and Why" sections in the v2 document itself demonstrate a rare level of design rationale clarity. Screen inventories consistently document entry points, key content, actions, and exits. Two clarity gaps: (1) the relationship between the Review Queue and the Data Catalog Classifications tab is unclear -- are these two views of the same data, or does the Review Queue replace the in-context review? (2) The three dashboard views share one URL with client-side toggling, but bookmarking and sharing a specific view is not addressed in the flows. |
| **Consistency** | 4.5/5 | The consolidated 3-step remediation pattern (Configure > Preview > Execute) is a major consistency win -- four previously divergent sub-flows now share one pattern. Wizard consolidation (5 to 2 steps for connections, 5 to 3 for policies) creates a lean, predictable wizard pattern. The one inconsistency: onboarding screens duplicate simplified versions of Flows 1, 2, and 4 (Guided Connection Setup, Guided Classification Review, First Remediation), creating two versions of the same workflow. The relationship between the "guided" onboarding versions and the "full" versions needs explicit definition to prevent divergence during implementation. |
| **Density & Breathing Room** | 4/5 | Progressive disclosure is well-applied: Review Queue shows a sorted list with inline actions, Table Review offers batch operations, and individual column detail is available on demand. Dashboard views appropriately tune density per persona (Operations view is denser for Jordan; Executive view is sparser for Marcus). Concern: the Review Queue screen description packs significant content into one view -- queue list with column name, table, connection, suggested classification, confidence %, sample data (masked), plus filters by connection/type/confidence range, plus batch actions. At scale (10K+ pending items), this needs careful density management in wireframes. |
| **Interaction Design** | 4/5 | Context preservation across flows is the standout improvement -- remediation pre-fills from Risk Detail, simulation selections carry into remediation, inline policy creation returns to the remediation flow. The dry-run pattern gives users a safety net that competitors lack. Two interaction design gaps: (1) the inline policy creator (drawer overlay) during remediation introduces a multi-step wizard inside a drawer inside a multi-step wizard -- this nested complexity needs careful viewport management, and (2) the risk simulation drawer on Risk Detail adds interactive complexity (checkbox list with live-updating projected score) to an already tab-heavy detail page. |
| **Emotional Quality** | 4.5/5 | V2 introduces genuine emotional design moments that v1 entirely lacked. The risk score animation on dashboard entry, the celebration micro-interactions on remediation success, the confetti on onboarding completion, and the risk score "reveal" during onboarding all create emotional anchors. The "risk reduction as reward" principle is now tangibly implemented rather than theoretically stated. The one risk: overusing celebration animations could dilute their impact. The confetti on onboarding completion should be the peak -- subsequent remediation successes should use subtler celebrations (score tick-down with green flash) to avoid fatigue. |

**Overall: 4.2/5** (up from an estimated 3.5/5 for v1 -- a meaningful improvement)

---

## DMP Principle Check

| Principle | Status | Notes |
|-----------|--------|-------|
| **Loop continuity** | Improved, still needs work | V2 significantly strengthens loop transitions. Scan completion routes to Review Queue (Discover > Classify). Classification decisions show inline risk delta (Classify > Assess). Risk simulation carries selections into remediation (Assess > Remediate). Remediation success shows animated score reduction (Remediate > Track). Dashboard Quick Actions create a Track > Discover return path. The remaining gap: the Assess stage still has no sidebar-level navigational presence. Users thinking "I need to assess risk" must go to Dashboard and drill down. The Quick Actions panel partially mitigates this by surfacing assessment-driven actions, but the loop is not fully legible in the navigation structure. Consider whether the Risk Detail view deserves promotion or whether the dashboard Quick Actions are sufficient. |
| **Density vs. clarity** | Pass | The persona-specific dashboard views are the right solution. Jordan gets connection health and scan metrics (dense, operational). Marcus gets score, trend, and coverage (clear, summary). Priya gets review queue status and compliance cards (moderate density, governance-focused). The Review Queue itself is well-designed for Priya's needs: sorted by confidence (lowest first) with batch actions. Table Review allows Jordan-style density when reviewing all columns for one table. The dual-persona support is now a structural feature, not an afterthought. |
| **Classification confidence prominence** | Pass | This was a critical failure in v1 (confidence buried three levels deep in Data Catalog). V2 promotes confidence to a first-class sorting dimension in the Review Queue, a visual indicator per column in Table Review, and a threshold parameter in bulk actions. Low confidence (< 60%) gets a red warning badge and sorts to the top of the queue. High confidence (> 95%) is suggested for auto-accept. Confidence is now the organizing principle of the classification workflow, which is exactly right for the product's guided-classification differentiator. |
| **Risk reduction as reward** | Pass | V2 implements this principle at four touchpoints: (1) inline risk delta during classification review, (2) projected score in remediation preview, (3) animated score reduction on remediation success, (4) animated gauge on dashboard entry. The before/after pattern is consistent across simulation, preview, and completion. The onboarding Risk Score Reveal is an effective "aha" moment that demonstrates this principle during the user's first session. One enhancement: the Review Queue could show a cumulative "risk reduced during this session" metric to reward sustained classification work, not just individual decisions. |
| **Connection setup friction** | Pass | V2 reduces the connection wizard from 5 steps to 2, adds OAuth quick-connect for Snowflake and BigQuery, and introduces draft auto-save with browser close recovery. The "Save + Start Scan" primary CTA eliminates the decision point between "scan now" and "scan later." The onboarding guided connection setup further reduces friction with inline help tooltips and a reduced platform grid (top 4 only). The reconnect flow for broken connections (skip platform selection, go straight to credential re-entry) is a thoughtful addition. The remaining concern is the absence of an IaC/API path for bulk connection management, but this is a feature gap, not a flow architecture issue. |

---

## Per-Flow Critique

### Flow 1: Data Source Connections

**Strengths:**
- The wizard consolidation from 5 steps to 2 is the right call. Platform selection revealing the credential form inline mirrors the pattern data engineers expect from tools like Fivetran.
- OAuth quick-connect for Snowflake and BigQuery addresses 60% of the configuration form for those platforms -- this directly improves time-to-value.
- The degraded connection state (between active and error) prevents false-alarm disconnection badges that would erode Jordan's trust in the product's operational accuracy.
- Network error recovery is thorough: DNS failure, firewall blocks, and timeouts each get targeted guidance rather than a generic "connection failed" message.
- Draft auto-save with browser close recovery ("Resume setting up your Snowflake connection?") eliminates a real interruption-anxiety friction point.

**Concerns:**
- The schema selection step (Step 2) now does double duty: tree selection with checkboxes plus a collapsible summary panel. If the schema tree is large (50+ schemas), the collapsible summary may be pushed below the fold, defeating the purpose of inline review.
- The connection health polling with degraded state is defined in the flow, but the polling interval and transition thresholds (how many timeouts before "active" becomes "degraded"?) are not specified. These need definition before wireframing to ensure the status badges reflect reality.
- The bulk reconnect action in the Connection List (mentioned in the screen inventory) has no flow diagram path. How does bulk reconnect work -- sequential credential re-entry for each connection, or a single re-authentication that applies to all connections on the same platform?

**Suggestions:**
- Define the schema selection + summary panel layout as a side-by-side split (tree left, summary right) rather than stacked. This keeps the summary visible regardless of tree depth.
- Add a note to the screen inventory specifying whether the Connection List "classification coverage %" column is per-connection or aggregate. Per-connection is more useful for Jordan but requires a clear "N/A" state for connections that have not been scanned.
- Consider adding a "connection group" concept for organizations with 20+ connections to the same platform (e.g., multiple Snowflake accounts). The current flat list will not scale for large enterprises.

---

### Flow 2: Data Scanning & Classification

**Strengths:**
- The split into Scan Phase (Jordan) and Classification Review Phase (Priya) is the most important structural improvement in v2. This acknowledges that scan operations and classification review are different jobs, done by different people, at different times.
- The Classification Review Queue is the single most impactful addition. Sorting by confidence (lowest first) is the correct default -- it puts the items needing the most human judgment at the top. The combination of single-column, table-batch, and bulk-action review modes gives Priya appropriate tools for different scales.
- The "Accept all above 90% confidence" bulk action with a preview of affected items is well-designed. The preview step prevents blind mass-acceptance while enabling efficiency at scale.
- Schema drift detection as a named concept (with its own summary screen) elevates what was previously a buried edge case into a first-class operational concern for Jordan.
- The classification conflict resolution (warning when an override conflicts with a policy or regulation mapping) prevents downstream surprises that would erode trust in the classification workflow.

**Concerns:**
- The relationship between the Review Queue and the Data Catalog's Classifications tab is ambiguous. If Priya accepts a classification in the Review Queue, does the same column in Table Detail > Classifications tab reflect this immediately? Can Priya also accept/override/reject from the Table Detail Classifications tab, or is the Review Queue now the sole classification workflow surface? This needs explicit definition to prevent confusion during wireframing and implementation.
- The Review Queue screen inventory lists "sample (masked, click to reveal)" but does not specify what "reveal" means in terms of data access permissions. Revealing sample data is a security-sensitive action. Does revealing require additional authentication? Is the reveal logged? Is there a time-limited visibility window?
- The scan scheduling UI is mentioned ("Configure Schedule: daily/weekly + time") but the flow diagram does not show where schedule management lives after initial configuration. Can Jordan modify a schedule? Where? Connection Detail > Settings? Scans page? Both?
- The flow lacks a "classification reasoning" explanation, which was a medium-priority recommendation from the user research (rec 2.3). The Review Queue shows suggested classification and confidence but not why the system made that suggestion. This reasoning is critical for Priya's trust in the guided classification model.

**Suggestions:**
- Add an explicit note to the screen inventory clarifying that the Review Queue is the primary classification workflow surface, and Table Detail > Classifications tab is a read-with-inline-action view. Both should allow accept/override/reject, but the Review Queue is the "inbox" and Table Detail is the "in-context" view.
- Add a "Why this classification?" expandable panel or tooltip to Review Queue items showing the reasoning: column name pattern match, sample value analysis, similar column precedent, etc. This was the researcher's rec 2.3 and is important for building trust in the guided model.
- Define scan schedule management as living in Connection Detail > Settings tab, with a shortcut accessible from the Scans page. The flow should show this explicitly.

---

### Flow 3: Risk Assessment & Scoring

**Strengths:**
- The persona-specific dashboard views (Executive, Governance, Operations) are the correct structural solution to the "one dashboard serves everyone poorly" problem identified in the research evaluation.
- The risk score animation on entry (gauge filling from 0 to current value) creates an effective emotional moment. Combined with the "What Changed?" summary for score shifts, this transforms the dashboard from a static report into a dynamic narrative.
- Risk simulation ("If I remediate these 5 items, my score would drop to X") is a genuine differentiator. No competitor offers this. It converts risk assessment from a passive observation into an interactive planning tool.
- The "Snooze with reason" pattern (requiring justification and review date, with automatic resurfacing and compliance report inclusion) adds accountability without adding friction.
- Merging Access Analysis into Risk Detail as a tab rather than a separate screen reduces navigation depth while maintaining access to the information.

**Concerns:**
- The Risk Detail page now has four tabs (Risk Factors, Access Analysis, Regulation Mapping, Recommendations) plus a Risk Simulation drawer. This is a dense detail page. If each tab contains substantial content (which it should), the page could feel overwhelming. The wireframe needs to establish clear visual hierarchy within tabs.
- The risk simulation drawer uses a checkbox list with live-updating projected score. For large datasets (hundreds of remediatable items), this list needs pagination, filtering, or grouping to remain usable. The flow does not address simulation at scale.
- The "What Changed?" summary is triggered when the score changes between visits, but the flow does not define what happens when the score changes multiple times between visits. Does the summary show all changes since last login, or only the net result? For Marcus (weekly visitor), a single net-change may obscure important fluctuations.
- The Assess stage still has no sidebar-level navigational presence. Risk assessment lives as a drill-down from Dashboard. This was the top concern in my sitemap critique, and while the dashboard views improve the situation, the fundamental problem remains: a user who thinks "I need to assess risk" has no dedicated sidebar destination.

**Suggestions:**
- Consider adding a "Risk" or "Assessment" sidebar item that surfaces the Risk Detail view without requiring Dashboard drill-down. Alternatively, if the Dashboard Quick Actions are deemed sufficient as the assessment entry point, document this explicitly as a deliberate decision with rationale.
- Define the "What Changed?" summary as showing all individual changes since last login (grouped by type) rather than just the net delta. Marcus visiting weekly needs to see "Tuesday: +5 (new PII discovered), Thursday: -8 (tokenization applied)" not just "-3."
- Add filtering or grouping to the Risk Simulation checkbox list: by connection, by classification type, by risk impact. This prevents the simulation from becoming unusable at scale.

---

### Flow 4: Remediation

**Strengths:**
- The consolidated 3-step pattern (Configure > Preview > Execute) across all four remediation types is a significant consistency improvement. The v1 approach of four different sub-flows with different step counts was a cognitive load problem waiting to happen.
- Context preservation from entry points (Risk Detail, Table Detail, Dashboard, Review Queue) is the single most impactful cross-flow improvement. Pre-filling the remediation configuration with the items and recommended action type identified upstream eliminates the frustrating re-selection that plagues competitor DSPM tools.
- Dry-run mode for all remediation types (not just tokenization) addresses the production-data anxiety that blocks remediation adoption. Making dry-run the default CTA for production targets is the right judgment call.
- The rollback flow as a first-class screen (with its own preview showing what will be reversed and risk score impact) elevates rollback from an afterthought to a trust-building feature.
- The batch remediation with per-item status tracking (queued > executing > done/failed) and individual retry for failed items handles the enterprise scale use case correctly.
- The success celebration with animated risk score reduction (78 > 65) directly implements the "risk reduction as reward" principle at the moment of action.

**Concerns:**
- The "Remediation Plan" for staged rollouts is mentioned in the "What Changed" section but does not appear in the flow diagram, screen inventory, or edge cases. This is a significant feature gap -- staged rollouts with approval gates between stages is an important enterprise need, but it is undefined in the flow architecture. Either fully define the Remediation Plan flow or explicitly defer it to a future version.
- The inline policy creator (drawer overlay) during tokenization configuration creates nested complexity: the user is in a 3-step remediation wizard, opens a drawer with a condensed 3-step policy wizard, creates the policy, returns to the remediation wizard. This is architecturally sound but interaction-heavy. The wireframe needs to ensure the drawer is wide enough for the policy wizard content and that the underlying remediation context remains visible.
- The "Request Approval" button (replacing "Execute" for users without permissions) routes to an "approval workflow (manager notification)" that is not defined in any flow. The approval workflow is one of the researcher's high-priority recommendations (rec 4.2). Its absence from the flow architecture is a gap that will surface during wireframing.
- Concurrent remediation handling (optimistic locking, "These items are being remediated by [user]") is well-thought-out but introduces a dependency on real-time collaboration infrastructure. This should be flagged as a technical complexity that could affect wireframe timelines.

**Suggestions:**
- Either define the Remediation Plan (staged rollout) as a named screen with a flow diagram, or explicitly mark it as "v3 / post-launch" in the flow document. Do not leave it as an undefined mention.
- Define the approval workflow at the flow level: Where does the approval request appear? Is there an Approvals tab on the Remediation page? How is the approver notified? What does the approval review screen show? This is needed before wireframing.
- Add a note to the inline policy creator specifying a minimum drawer width (e.g., 480px) and clarifying that the remediation context panel remains visible alongside the drawer. If the viewport cannot accommodate both, define the fallback behavior (full-screen overlay? separate tab?).

---

### Flow 5: Tokenization Policy Management

**Strengths:**
- The wizard consolidation from 5 steps to 3 is appropriate. Combining policy basics with classification selection is natural grouping, and the "Scope + Review" final step with impact preview makes policy creation feel connected to the broader system.
- Policy templates (PCI Compliance, GDPR PII Protection, HIPAA PHI Security, General PII) directly address the researcher's rec 5.1 and 5.4. Templates as a starting point rather than a constraint is the right design posture -- all fields remain editable.
- The impact preview ("N columns match, projected risk score change") during policy creation is a strong feedback mechanism. It transforms policy creation from abstract configuration into a quantifiable action.
- Policy versioning with diff view provides the audit trail governance teams need. "Edit creates new version" rather than "edit overwrites" is the correct pattern for regulated environments.
- The inline policy creator from the Remediation flow is a smart context-preservation pattern. Auto-selecting the newly created policy upon return to remediation eliminates a re-selection step.
- Policy testing against sample data before activation builds confidence and reduces rollback frequency. This directly addresses the researcher's rec 5.3.

**Concerns:**
- The Template Gallery appears in two contexts: as the empty-state display on the Policies page, and as an entry point during policy creation. The flow should clarify whether the Template Gallery is a persistent page (accessible from navigation) or only appears contextually. The sitemap revisions suggest `/policies/templates` as a standalone URL, but the flow diagram shows it only in the empty state and creation entry paths.
- The "Toggle active/disabled" pattern on Policy Detail replaces the previous "Disable" action. This is simpler, but the flow needs to address what happens to actively tokenized data when a policy is disabled. Does tokenization persist? Are new columns no longer protected? Is there a grace period? The edge case mentions "confirmation if active policies affected" but does not specify the impact on existing data.
- The policy creation flow does not explicitly show the regulation-aware defaults the researcher recommended (rec 5.1). Templates provide pre-configured settings, but within the wizard, there is no guidance like "For HIPAA PHI, we recommend format-preserving encryption." The token format selection (Step 2) still requires technical knowledge that Priya may lack.

**Suggestions:**
- Add regulation-aware default recommendations within Step 2 (Token Configuration). When a user selects HIPAA in Step 1, Step 2 should pre-select recommended token formats with a "Recommended for HIPAA" badge, while still allowing override. This bridges the gap between template convenience and custom configuration.
- Clarify the Template Gallery's persistence: recommend it as an inline section on the Policies list page (not a standalone route) that appears in the empty state and is accessible via a "Start from template" option in the creation flow. A standalone `/policies/templates` page is over-investment for 4-5 templates.
- Define the impact of disabling an active policy: existing tokenization persists (data remains protected), but new matching columns discovered in future scans are not automatically protected. Show this explicitly in the disable confirmation.

---

### Flow 6: Risk Dashboard & Monitoring

**Strengths:**
- The three persona-specific dashboard modes are the right structural solution. The view toggle (Executive / Governance / Operations) avoids the complexity of separate pages while giving each persona an optimized layout. User preference persistence (last-used view loads by default) prevents daily friction.
- The Quick Actions panel ("Review 42 pending classifications," "Remediate 5 critical PII columns," "Re-scan Snowflake -- last scan 32 days ago") transforms the dashboard from a passive report into an active command center. One-click navigation with preserved context is excellent interaction design.
- The persistent Alert Ribbon below the top nav addresses the cross-page notification gap. Alerts for risk increases, scan failures, and compliance changes persist until addressed, ensuring Marcus sees critical information even on non-dashboard pages.
- The dashboard loading skeleton (score loads first, then trend, then detail widgets) addresses perceived performance and establishes visual hierarchy through progressive rendering.
- The activity feed with filtering by type and live WebSocket updating replaces the need for a separate activity page -- this is the right density-management decision.

**Concerns:**
- Four global attention-competing elements (Alert Ribbon, sidebar scan badge, onboarding checklist widget, Quick Actions panel) could create visual noise. The wireframe needs to define clear layering: which elements are persistent vs. dismissible, which compete for the same viewport space, and how they coexist on smaller screens.
- The scheduled report delivery setup (template, frequency, recipients, format) is described but not shown in the flow diagram. Where does the report scheduling configuration live? Is it a modal from the Dashboard export button? A section within the Reports page? A dedicated screen? The screen inventory shows "Reports" as both a sidebar item and a dashboard export target, but the scheduling workflow is underspecified.
- The "Governance View" includes a "Review Queue Summary -- N items pending, breakdown by confidence" widget that duplicates information available in the Review Queue itself. If Priya clicks this widget, does it navigate to the Review Queue or expand in-place? The relationship between dashboard summary widgets and their source pages needs consistent definition.
- The Operations View for Jordan includes "Scan Freshness Heatmap." Heatmaps are a specific visualization pattern that requires careful design -- what are the axes? Time vs. connection? Schema vs. last-scan-date? This needs definition before wireframing.

**Suggestions:**
- Define a visual hierarchy for global elements: Alert Ribbon (highest priority, red/orange, always visible when active), sidebar scan badge (medium priority, passive indicator), onboarding checklist (lowest priority, dismissible, only for new users). Ensure Quick Actions panel does not visually compete with the Alert Ribbon by placing them in distinct viewport zones.
- Specify the Scan Freshness Heatmap: recommend a connection-by-time matrix where rows are connections and cells are colored by days since last scan (green < 7 days, yellow 7-30 days, red > 30 days). This is the most natural representation for Jordan's mental model.
- Define report scheduling as a modal accessed from both the Dashboard export button and the Reports page. Same UI, two entry points. The modal should show existing schedules and allow creating new ones.

---

### Flow 7: Onboarding & First-Time Experience

**Strengths:**
- The 30-minute time-to-value target is ambitious and well-justified. The timing estimates (22-32 minutes) demonstrate that the target is achievable. This directly competes with Cyera's days-to-insight positioning by providing a meaningful first result in a single session.
- Persona selection on the Welcome screen (Data Engineer / Governance Analyst / Security Leader) sets the right defaults without locking users into a track. The persona choice affects dashboard view default, navigation emphasis, and help text -- appropriate personalization without restriction.
- The guided classification review (top 5 highest-confidence items with coach marks) is an effective teaching moment. Showing only 5 items prevents overwhelm while demonstrating the full accept/override/reject workflow.
- The Risk Score Reveal as the "aha" moment (animated gauge filling from 0 to score, with explanation of what drives it) is emotionally effective. This is the moment when the product's value proposition becomes tangible.
- The progressive optional tasks after onboarding completion (invite team, create policy, schedule scans, set up reports) maintain momentum without forcing a linear path.
- The abandonment recovery ("Welcome back! You were setting up your first connection. Resume?") prevents the common enterprise SaaS problem of onboarding drop-off.

**Concerns:**
- The onboarding flow creates simplified versions of Flows 1, 2, and 4 (Guided Connection Setup, Guided Classification Review, First Remediation). These parallel implementations risk diverging from their full counterparts during development. The wireframe phase needs to establish whether these are the same components with a "guided mode" flag, or distinct screens. The former is architecturally cleaner; the latter is simpler to build but harder to maintain.
- The "Expert user" edge case ("I know what I'm doing" link) hides educational tooltips and coach marks but still requires wizard steps. Jordan, the primary data engineer persona, may want to skip onboarding entirely and go straight to the full product. The flow should accommodate a "Skip onboarding, go to Dashboard" path from the Welcome screen, not just step-level skipping.
- The Marcus (Security Leader) path after persona selection leads to the Executive dashboard view with an "invite team member" prompt. But Marcus's team members (Jordan and Priya) are the ones who need to do the actual setup. The onboarding flow for Marcus effectively dead-ends at "invite people who can actually use this." Consider adding a "Watch a 2-minute overview" or "View sample data demo" path for Marcus so his first session has substance.
- The First Remediation step auto-selects the top recommended action. If the scan found only low-risk data (score 0-25), the flow branches to "show recommended monitoring setup" -- but this alternative path is not detailed. What does "recommended monitoring setup" entail? Scheduled scans? Alert configuration? Dashboard view preference? This needs definition.

**Suggestions:**
- Implement onboarding screens as the same components used in Flows 1, 2, and 4 with a `guidedMode` flag that enables educational tooltips, coach marks, and simplified content. This prevents component divergence and ensures that improvements to the full flows automatically improve the onboarding experience.
- Add a "Skip to Dashboard" option on the Welcome screen for expert users. The onboarding checklist widget appears on the Dashboard regardless, so they can return to any step later.
- Define the Marcus onboarding path beyond "invite team." Options: (1) interactive demo with sample data showing the five-stage loop, (2) pre-built sample dashboard showing what the product looks like with data, (3) short video walkthrough. Marcus's first session should demonstrate value, even if he is not the one who will configure the product.
- Define the "recommended monitoring setup" for low-risk scores: scheduled weekly re-scan, alert configuration for risk increases above 5 points, dashboard preference saved. This turns the low-risk path into a meaningful setup step rather than a dead end.

---

## Research Alignment Check

### Friction Points Addressed in v2

| Researcher Rec | Status in v2 | Quality of Implementation |
|----------------|-------------|--------------------------|
| **2.1** Dedicated classification review queue (Critical) | Fully addressed | Excellent. Review Queue is a sidebar nav item with confidence sorting, batch actions, and three review modes (single, table, bulk). This was the #1 research finding and v2 treats it accordingly. |
| **6.1** Role-based dashboard views (Critical) | Fully addressed | Strong. Three persona-specific views with view toggle, user preference persistence. Each view surfaces the right metrics for its persona. |
| **4.3** Success screen drives next action | Fully addressed | Strong. Remediation success shows animated score reduction and offers "Remediate More" with a next recommendation. |
| **2.2** Role-based scan-to-classification handoff | Addressed | Good. Flow 2 is split into Scan Phase (Jordan) and Classification Phase (Priya) with a clear handoff via Review Queue CTA on Scan Summary. |
| **2.5** Global bulk classification above confidence threshold | Fully addressed | Strong. "Accept all above 90% confidence" is a first-class action with preview. |
| **1.1** Scan scheduling | Addressed | Good. Scan scheduling added to Flow 2 with daily/weekly configuration. Placement in Connection Detail > Settings is a sensible location. |
| **3.4** Risk simulation | Fully addressed | Excellent. Interactive drawer with checkbox list and live-updating projected score. No competitor has this. |
| **4.1** Dry-run mode for remediation | Fully addressed | Strong. All four remediation types support dry-run. Dry-run is the default CTA for production targets. |
| **6.6** Onboarding progress checklist | Fully addressed | Excellent. Full Flow 7 with 8 screens, 30-minute target, persona selection, guided steps, and celebration moments. Goes well beyond a simple checklist. |
| **6.2** "What changed" dashboard summary | Fully addressed | Strong. "What Changed?" summary triggered by score shifts, explaining the reasons with links to affected items. |
| **5.4** Policy templates | Fully addressed | Good. Four pre-built templates with editable fields. Template Gallery as empty state and creation entry point. |
| **3.3** Snooze with accountability | Fully addressed | Strong. Requires reason and review date. Auto-resurfaces. Included in compliance reports. |
| **6.3** Board summary from dashboard | Addressed | Good. Export button on dashboard with report generation. Executive view generates executive report by default. |
| **1.3** Quick-connect for experienced users | Fully addressed | Strong. OAuth quick-connect for Snowflake and BigQuery. Wizard reduced to 2 steps. |
| **3.2** Prioritized recommendations with risk impact | Addressed | Good. Risk Detail > Recommendations tab with context-preserving navigation to Remediation. |
| **5.3** Policy testing workflow | Fully addressed | Good. Test panel in Token Configuration step showing live preview of tokenized output. |
| **4.5** Remediation history with compliance linkage | Partially addressed | The remediation history is filterable by originating flow, but the explicit "compliance impact column" showing which regulation requirement each action addresses is not detailed in the screen inventory. |
| **1.4** Connection health trending | Addressed | Good. Connection Detail > Overview tab includes health metrics and latency chart. Degraded state added. |

### Friction Points NOT Addressed in v2

| Researcher Rec | Priority | Gap |
|----------------|----------|-----|
| **2.3** Classification reasoning explanation | Medium | The Review Queue shows suggested classification and confidence but does not explain why the system made that suggestion. This reasoning is critical for trust in the guided classification model. The researcher specifically recommended showing whether the suggestion was based on pattern matching, column name, or sample data analysis. |
| **2.4** Cross-table classification consistency checker | Medium | No "show inconsistencies" view exists. Priya cannot see that "email" is classified as PII in Table A but "Internal" in Table B without visiting both tables. This undermines classification quality at scale. |
| **2.6** Classification rules for recurring patterns | High | No ability to create rules like "any column named 'ssn' should be classified as PII/SSN." Priya must accept the same pattern individually across hundreds of columns. This was a high-priority recommendation that limits scalability of the guided classification model. |
| **4.2** Approval workflow for remediation | High | "Request Approval" button exists but the approval workflow (queue, notification, review, approve/reject) is undefined. This is required for HIPAA/PCI regulated environments and was the researcher's high-priority rec. |
| **4.4** Scheduled remediation execution | Medium | Users cannot schedule remediation for a maintenance window. Remediation executes immediately or as a dry-run. Data engineers working with production systems need this. |
| **3.1** Risk topology graph | Medium | Risk factors remain in a list/tab format. No visual graph connecting data, access, and protection gaps. This limits our competitive response to Wiz's security graph. |
| **3.5** Platform-specific access display | Medium | Access Analysis tab does not specify whether it shows platform-native terms (Snowflake roles, AWS IAM) or generic labels. The researcher emphasized that generic "user/service" labels lose critical context for data engineers. |
| **1.2** Terraform/API for connections | Medium | No IaC path. UI wizard is the only connection creation method. Jordan managing 20+ connections needs programmatic access. |
| **6.5** Activity feed filtering | Low | Actually addressed: v2 adds filtering by type and live WebSocket updating. This one is resolved. |

### New Issues Introduced by v2

1. **Onboarding parallel implementation risk.** Flow 7 creates simplified versions of Flows 1, 2, and 4. These parallel implementations could diverge from their full counterparts, creating inconsistency and maintenance burden. This was not a concern in v1 because onboarding did not exist.

2. **Global element proliferation.** V2 adds four new global elements (Alert Ribbon, sidebar scan badge, onboarding checklist widget, Quick Actions panel). These did not exist in v1. Managing their visual coexistence across all pages is a new complexity.

3. **Nested drawer complexity.** The inline policy creator (drawer within remediation wizard) introduces a UI complexity that did not exist in v1. Multi-step wizards inside drawers inside multi-step wizards require careful viewport management.

4. **Dashboard URL bookmarkability.** Three dashboard views sharing one URL with client-side toggling means users cannot bookmark or share a specific view without query parameter support. V1's single dashboard did not have this problem.

---

## Sitemap Critique Follow-Up

### Assess Stage Navigational Presence

**Original concern:** The Assess stage has no sidebar-level navigational home. Risk assessment lives as a drill-down from Dashboard.

**V2 status: Partially addressed.** The Dashboard now has three persona-specific views, and the Quick Actions panel surfaces assessment-driven actions proactively. The Risk Simulation drawer adds interactive assessment capability. However, the fundamental issue remains: "Assess" has no sidebar item. The Dashboard absorbs assessment, which works for Marcus (who lives on the Dashboard) but creates an extra navigation step for Priya and Jordan who may want to go directly to risk details. The Quick Actions panel is the primary mitigation, and it may be sufficient in practice, but the architectural asymmetry persists (Discover has 4 sidebar items, Assess has 0).

**Recommendation:** Accept this as a deliberate trade-off. Adding a Risk/Assessment sidebar item would push the sidebar to 10 items and create redundancy with the Dashboard. Instead, ensure that Dashboard Quick Actions consistently surface assessment entry points, and add a keyboard shortcut or global search path to Risk Detail.

### Classification Review Dedicated Surface

**Original concern:** Classification review is buried inside Data Catalog > Table Detail > Classifications tab, three levels deep.

**V2 status: Fully addressed.** The Review Queue is a dedicated sidebar navigation item under Discovery, with its own URL (`/review-queue`), badge showing pending count, and three review modes. This is the strongest single improvement in v2. The original concern has been resolved comprehensively.

### Modal Reliance

**Original concern:** 13+ modal-based workflows, including two 5-step wizard modals, create fragility on smaller viewports and prevent deep linking.

**V2 status: Improved but not fully resolved.** Wizard step counts are reduced (connections from 5 to 2, policies from 5 to 3), which reduces the modal complexity significantly. However, the flows do not explicitly state whether these wizards are modals or full-page flows. The screen inventory uses "Wizard" as a page type, and the sitemap revisions note that "wizard steps are managed client-side within the modal, no URL changes needed." This means the modal pattern persists, just with fewer steps. The addition of the inline policy creator (drawer within remediation) adds a new layer of modal/overlay complexity.

**Recommendation:** During wireframing, make a definitive decision: are the connection and policy wizards modals or full-page flows? For a 2-step wizard, a modal is acceptable. For the 3-step policy wizard with test panel and impact preview, a full-page flow with its own URL may be more appropriate. The remediation 3-step flow should also be evaluated -- "Configure > Preview > Execute" with type-specific content could benefit from full-page treatment.

### Global Search

**Original concern:** No global search or command palette in the navigation.

**V2 status: Addressed at the architectural level.** The updated navigation structure includes "Universal search bar" in the top nav as a new global element. The sitemap revisions define `/search?q=` as a URL. However, the search functionality does not appear in any flow diagram, and there is no screen inventory entry for search results. Search is declared but not designed.

**Recommendation:** Add a search results screen to the Flow 6 screen inventory, defining: what entity types are searchable (connections, tables, columns, policies, regulations, remediations), how results are grouped and ranked, and what the result item layout shows. This does not need a full flow, but it needs enough definition for wireframing.

---

## Competitive Position Assessment

### vs. Cyera (time-to-value, unified console)

**After v2:** The gap has narrowed significantly. Cyera's days-to-insight advantage is challenged by our 30-minute onboarding flow that delivers a risk score in a single session. Cyera achieves this through fully automated classification; we achieve it through guided classification of the top 5 items plus auto-acceptance of high-confidence findings. Our approach sacrifices some speed for accuracy, but the onboarding flow makes this trade-off invisible to new users -- they see a risk score within 30 minutes regardless.

**Remaining gap:** Cyera's unified console shows discovery, risk, and remediation on the same screen with minimal navigation depth. Our architecture separates these into distinct flows with cross-flow navigation. For repeat users who know the product, our navigation may feel like more clicks to achieve the same outcome. The Quick Actions panel partially mitigates this by surfacing cross-flow actions on the Dashboard.

**Recommendation:** Monitor whether Quick Actions adequately replaces Cyera's in-context remediation. If wireframe testing reveals too many clicks to go from "see a risk" to "fix it," consider adding inline remediation shortcuts directly on dashboard risk widgets.

### vs. Varonis (auto-remediation, 4.9/5 UX)

**After v2:** Our remediation flow is now competitive in terms of user experience quality. The 3-step pattern, dry-run mode, context preservation, rollback as a first-class screen, and risk score celebration animation match Varonis's standard for remediation UX polish. The gap is strategic, not UX: Varonis auto-remediates (no user action needed for routine actions), while our flow requires user-initiated remediation for everything.

**Remaining gap:** The researcher recommended a two-tier remediation model (automated for routine, guided for consequential). V2 does not implement this. All remediations are user-initiated. This means our remediation velocity will be lower than Varonis's for organizations with large volumes of routine risk items (stale permissions, unprotected low-sensitivity data).

**Recommendation:** Defer auto-remediation to post-launch, but design the remediation flow architecture to accommodate it. Specifically, add a "Remediation Rules" concept (similar to classification rules) where users can define conditions for automatic remediation (e.g., "auto-revoke access grants older than 90 days for non-production schemas"). This can be wireframed as a future tab on the Remediation page without blocking the current flow design.

### vs. Wiz (security graph, attack path context)

**After v2:** Our Risk Detail with four tabs (Risk Factors, Access Analysis, Regulation Mapping, Recommendations) plus the Risk Simulation drawer provides comprehensive risk analysis, but in a list/tab format rather than Wiz's graph visualization. The Risk Simulation is a genuine differentiator that Wiz lacks -- the ability to preview score impact before acting.

**Remaining gap:** No graph or relationship visualization. Risk factors are presented as independent items rather than connected attack paths. The researcher recommended a risk topology view (rec 3.1), which v2 does not implement. For users coming from Wiz, our tab-based approach may feel less sophisticated.

**Recommendation:** Plan for a "Risk Graph" view as a future addition to the Risk Detail page (a fifth tab or a toggle between "List" and "Graph" modes). For the initial wireframe, the tab-based approach is sufficient and lower-risk to implement. The Risk Simulation drawer is our near-term competitive response to Wiz's attack path visualization.

### vs. Atlan (consumer-grade UX, low learning curve)

**After v2:** Our onboarding flow directly targets Atlan's learning-curve advantage. Persona selection, guided steps, coach marks, and celebration moments create a consumer-grade first experience. The 30-minute time-to-value target is faster than Atlan's 4-6 week deployment for full production use.

**Remaining gap:** Atlan's ongoing UX quality -- Amazon-like search, active metadata surfacing, collaborative annotations -- goes beyond onboarding. Our flows use standard enterprise SaaS patterns (list, detail, wizard, modal) for day-to-day use. The universal search is declared but not designed. Active metadata (contextual suggestions based on user activity) is not in v2.

**Recommendation:** Universal search is the highest-priority Atlan-competitive feature. Design the search results screen during wireframing with faceted filtering across all entity types. Active metadata and collaborative annotations can be deferred to post-launch without competitive damage.

---

## Risk Assessment

### Biggest Remaining Risks Before Wireframes

1. **Approval workflow is undefined but required.** The "Request Approval" button exists in the remediation flow, but the approval workflow (queue, notification, review screen, approve/reject) is not designed. For HIPAA- and PCI-regulated enterprises -- our primary target market -- remediation approval workflows are not optional. Starting wireframes without this defined will result in either a bolt-on design later or a gap in the first release.

2. **Classification rules are absent.** The researcher identified classification rules (rec 2.6) as high priority. Without the ability to create rules for recurring patterns ("any column named 'ssn' is PII/SSN"), the guided classification model does not scale. At 10K+ columns, reviewing each individually is untenable. This directly threatens our core differentiator.

3. **Onboarding-to-full-product component divergence.** If onboarding screens are built as separate components from their full-flow counterparts, maintenance cost doubles and UX consistency erodes over time. The architectural decision (shared components with `guidedMode` flag vs. separate screens) must be made before wireframing.

4. **Global element visual layering is untested.** Four new global elements (Alert Ribbon, scan badge, onboarding checklist, Quick Actions) competing for attention is a density problem that can only be validated through visual design. Paper-thin wireframes will not reveal the conflict; high-fidelity mockups are needed for this specific concern.

5. **Search is declared but not designed.** Universal search appears in the navigation structure but has no screen inventory, flow diagram, or result layout definition. If wireframing begins without search design, it will be added as an afterthought, which is the opposite of Atlan's search-first approach.

---

## Final Recommendations

Ranked by priority -- these are the five things to address before wireframing begins.

### 1. Define the Approval Workflow for Remediation

**Priority: Blocking.** The remediation flow includes a "Request Approval" button that routes to an undefined approval workflow. Define the following before wireframing:
- Where does the approval request surface? (Recommendation: "Approvals" tab on the Remediation page)
- What does the approver review? (Impact preview, affected data, risk score change)
- How is the approver notified? (Alert Ribbon + email)
- What are the approval states? (Requested > Under Review > Approved/Rejected > Executed)

Add this as a sub-flow of Flow 4 with its own screen inventory entries.

### 2. Add Classification Rules to Flow 2

**Priority: High.** Without classification rules for recurring patterns, the guided classification model does not scale beyond initial scans. Define:
- Where do classification rules live? (Recommendation: tab within Review Queue, accessible to Priya)
- What can a rule specify? (Column name pattern, regex, sample value match, classification to apply)
- How are rules applied? (Auto-applied to future scans, existing unreviewed matches flagged for confirmation)
- How do rules interact with manual reviews? (Rules suggest, users still confirm -- maintaining the "guided" model)

This can be a lightweight addition to the Flow 2 screen inventory without a full flow diagram.

### 3. Add Classification Reasoning to Review Queue Items

**Priority: High.** The researcher's rec 2.3 (medium priority) becomes high priority for wireframing because the Review Queue is the primary daily workflow for Priya. Every Review Queue item should show (on expand or tooltip) why the system suggested this classification:
- Pattern match type (column name, data pattern, sample values)
- Confidence score breakdown (which signals contributed how much)
- Similar classifications (precedent from other tables)

Without this, Priya must blindly trust or distrust each suggestion, which undermines the "guided" in "guided semi-automatic classification."

### 4. Design the Search Results Screen

**Priority: High.** Universal search is in the navigation structure but has no screen definition. Before wireframing, define:
- Searchable entity types (connections, tables, columns, policies, regulations, remediations)
- Result grouping (by type, with count badges)
- Result item layout (entity name, type icon, parent context, status badge)
- Keyboard shortcut (Cmd+K)
- Search behavior (overlay with results, or navigate to `/search?q=`)

This can be a single screen inventory entry added to Flow 6, not a separate flow.

### 5. Resolve Onboarding Component Architecture

**Priority: Medium-High.** Before wireframing, make a binding decision: are onboarding screens (Guided Connection Setup, Guided Classification Review, First Remediation) the same components as their full-flow counterparts with a `guidedMode` flag, or separate screens? Document the decision and its implications:
- Shared components: lower maintenance, automatic consistency, but requires conditional logic in every shared component
- Separate screens: simpler initial build, but divergence risk over time and double the wireframe work

**Recommendation:** Shared components with `guidedMode`. The wireframe should show one version with annotations for guided-mode differences (educational tooltips, reduced content, coach marks).

---

## Next Steps

- Use `/page-designer` to design the Classification Review Queue, Risk Dashboard (all three views), and Remediation Success screens first -- these are the highest-impact screens and the ones most likely to reveal the global element layering concerns.
- Use `/component-builder` to spec the Risk Score Animation, Alert Ribbon, and Quick Actions Panel as shared components before individual page design begins.
- Use `/information-architect` to validate the approval workflow placement and classification rules location within the sitemap.
- Use `/qa-specialist` to define test scenarios for the onboarding flow timing targets (30-minute time-to-value) once wireframes are ready.
