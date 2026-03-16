# UX Flow Architecture — Research-Informed Evaluation

**Date:** March 2026
**Method:** Persona-based walkthrough, competitive UX benchmarking, friction analysis
**Scope:** All 6 UX flows in the DMP data security platform
**Evaluator perspective:** User research specialist with data security domain expertise

---

## 1. Persona-Based Flow Evaluation

### 1.1 Jordan (Senior Data Engineer) — Flow-by-Flow Walkthrough

#### Flow 1: Data Source Connections
**Where it meets Jordan's needs:**
- The wizard-based connection setup (select platform, configure, test, select schemas) maps directly to how data engineers think about infrastructure. This is familiar territory — it mirrors how tools like Fivetran and Airbyte handle connector setup.
- Schema/database tree selection with checkboxes gives Jordan granular control over what gets scanned, which respects his concern about scan impact on production.
- The test connection step with specific failure reasons (auth failed, network unreachable) is exactly the feedback data engineers expect.

**Friction points:**
- **No scan scheduling controls at connection time.** Jordan's top pain point is scans slowing production queries. The flow lets him trigger or defer a scan, but there is no option to schedule scans for off-peak hours during connection setup. He has to set this up later, somewhere else — but the flows don't show where. This is a critical gap for data engineers.
- **No infrastructure-as-code path.** Jordan uses Terraform and dbt. The only path to create a connection is the UI wizard. There is no mention of API-first or IaC connection creation. For a data engineer managing 20+ connections, clicking through a wizard each time is a non-starter.
- **Missing connection health monitoring.** The Connection Detail page has tabs (Overview, Schemas, Scan History, Settings), but there is no mention of latency metrics, query impact monitoring, or connection health over time. Jordan wants Datadog-style observability for his connections — not just a green/red status badge.

**Where Jordan would get stuck:**
- After creating a connection, the flow says "Redirect to Connection Detail." But Jordan's next question is "when will this scan run, and will it affect my production workload?" The flow does not answer this. He would hunt through Settings or Scan History tabs looking for scheduling controls that may not exist.
- The empty state on Data Catalog says "Scan your connected data sources" — but a data engineer with 15 connections wants to know which connections haven't been scanned recently, not just that scanning is possible.

**What's missing:**
- Scan scheduling with cron-like controls or platform-aware scheduling (e.g., "scan during Snowflake's off-peak warehouse hours")
- Connection performance impact metrics (scan query cost, duration trends)
- Bulk connection management (import from Terraform state, CSV import)
- Webhook/notification integration for connection failures (PagerDuty, Slack, Datadog)

---

#### Flow 2: Scanning & Classification
**Where it meets Jordan's needs:**
- Scan progress view with tables scanned/total and estimated time is good operational feedback.
- Partial failure handling (results shown, failed tables listed, retry per-table) is exactly right — data engineers expect partial success and per-item retry patterns.
- Confidence-based classification with visual indicators (yellow for < 70%) aligns with Jordan's quote: "Show me the ones the system isn't sure about."

**Friction points:**
- **Classification review is not Jordan's job, but the flow puts him there.** After a scan completes, the flow routes to Data Catalog, then Table Detail, then column-level classification review. Jordan set up the connection and triggered the scan — but reviewing classifications is Priya's work. The flow does not distinguish between "scan operator" and "classification reviewer." Jordan needs a clean handoff: "Scan complete. 47 columns need classification review. Notify governance team?"
- **No scan impact visibility.** During scan progress, there is no indication of resource consumption — no Snowflake credit usage, no query count, no warehouse load. Jordan cares about this more than classification results.
- **Schema drift detection is buried.** The edge case mentions "Schema drift detected" as a banner on the connection, but schema drift is a first-class concern for data engineers. It should surface proactively, not wait for the user to visit a specific connection detail page.

**Where Jordan would get stuck:**
- The bulk accept suggestion ("Accept All Suggestions for Table") is at the table level. With 200 tables across 5 connections, Jordan would need to visit each table individually to bulk-accept. There is no global "accept all high-confidence classifications across the entire scan" action.

**What's missing:**
- Role-based flow branching: scan operators see scan results and handoff to reviewers; classification reviewers see a review queue
- Scan cost/impact reporting (credits consumed, queries run, duration vs. baseline)
- Proactive schema drift alerts (not just on-visit banners)
- Cross-table bulk classification actions filtered by confidence threshold

---

#### Flow 3: Risk Assessment
**Where it meets Jordan's needs:**
- Risk by Connection/Source breakdown lets Jordan see which of his connections are highest risk — this maps to his mental model of infrastructure.
- The staleness warning ("Risk score may be outdated — last scan was 45 days ago") is useful operational feedback.

**Friction points:**
- **Access analysis is too abstract for Jordan.** The flow shows Machine Access (services, APIs, pipelines) and Human Access (users, groups, roles). Jordan thinks in terms of Snowflake roles, AWS IAM policies, and service accounts — not generic "entities." The access analysis needs platform-specific context (e.g., "Snowflake role ANALYST_ROLE has SELECT on schema PRODUCTION.CUSTOMERS").
- **No pipeline impact context.** Jordan's primary concern is whether sensitive data flows through his pipelines unprotected. The risk assessment evaluates access patterns but does not show data lineage through ETL pipelines. If a PII column is tokenized in Snowflake but flows unmasked through a dbt model into a downstream table, that is a risk the current flow would miss.

**What's missing:**
- Pipeline/lineage-aware risk assessment (where does sensitive data flow after discovery?)
- Platform-specific access breakdown (Snowflake roles, AWS IAM, Databricks ACLs — not generic "entities")
- Connection-level risk drill-down (Jordan wants to see risk per connection, not just per regulation)

---

#### Flow 4: Remediation
**Where it meets Jordan's needs:**
- The tokenization preview (before/after sample data) is excellent — data engineers need to verify that tokenized data still works in downstream queries.
- Rollback option for tokenization addresses Jordan's fear of breaking production.
- Impact preview for data deletion (downstream pipeline dependencies) shows awareness of data engineering concerns.

**Friction points:**
- **No dry-run for tokenization.** The edge cases mention "Offer dry-run option" but the main flow does not include it. For Jordan, a dry-run that tokenizes a sample partition or non-production copy is essential before touching production data. This should be a first-class step, not an edge case.
- **No staging/testing environment concept.** Jordan would never tokenize production data without testing first. The flow goes straight from "select columns" to "preview sample" to "apply." There is no environment selector (dev/staging/prod) or test-first workflow.

**What's missing:**
- Dry-run as a first-class remediation step (not an edge case footnote)
- Environment-aware remediation (test in staging, then promote to production)
- Remediation impact on downstream queries (will tokenized data break existing SQL?)
- Batch remediation scheduling (apply tokenization during maintenance windows)

---

#### Flow 5: Tokenization Policies
**Where it meets Jordan's needs:**
- Per-data-type token format configuration (FPE, hash, random, mask) is the right level of control for a data engineer.
- Scope controls (all matching data, specific connections, specific schemas) match how Jordan organizes his infrastructure.
- Format-preserving encryption option means tokenized data can still pass validation rules in downstream systems.

**Friction points:**
- **Policy creation is disconnected from implementation.** Jordan creates a policy, but the flow then says "Policy Created — Not Yet Applied." For a data engineer, the question is: how does this policy integrate with my existing pipeline? Is it a Snowflake masking policy? A dbt post-hook? An API call? The flow treats tokenization as a product-internal concept but does not connect it to Jordan's existing infrastructure.
- **No policy-as-code.** Jordan manages everything in Git. Tokenization policies should be exportable as YAML/JSON and version-controlled. The flow is entirely UI-driven.

**What's missing:**
- Policy export/import (YAML, JSON, Terraform)
- Integration with platform-native masking (Snowflake Dynamic Data Masking, Databricks Column Masking)
- Policy testing against sample data before activation
- Policy version control and diff view

---

#### Flow 6: Dashboard & Monitoring
**Where it meets Jordan's needs:**
- Connection-level filter to drill down is appropriate for large-scale environments.
- Activity feed (scans, classifications, remediations) gives operational visibility.

**Friction points:**
- **The dashboard is designed for Marcus, not Jordan.** Risk score, compliance cards, protection coverage donut — this is executive reporting. Jordan wants an infrastructure operations dashboard: connection health, scan status, schema drift, classification queue depth, pipeline impact. The current dashboard forces Jordan to mentally translate between "risk score 67" and "what do I need to fix in my infrastructure?"
- **No operational alerts.** The alert banner handles risk score changes, but Jordan wants infrastructure alerts: connection failures, scan timeouts, credential expirations, schema changes.

**What's missing:**
- Data engineer-specific dashboard view (connections health, scan operations, infrastructure metrics)
- Operational alerting (connection health, scan failures, credential expiry)
- Integration with existing monitoring (Datadog, PagerDuty, Slack webhooks)

---

### 1.2 Priya (Data Governance Analyst) — Flow-by-Flow Walkthrough

#### Flow 1: Data Source Connections
**Where it meets Priya's needs:**
- Priya collaborates with Jordan on connection setup but does not configure connections herself. The read-only permission model (mutation buttons disabled with "Contact admin" tooltip) appropriately separates her role.

**Friction points:**
- **No visibility into what's connected vs. what should be connected.** Priya's governance responsibility means she needs to know whether all data sources are accounted for. The connection list shows what is connected, but there is no "expected sources" or "coverage gap" view. If a new Snowflake database is created but not connected, Priya has no way to know.

**What's missing:**
- Data source coverage tracking (expected vs. connected sources)
- Notification when new connections are added (so Priya can plan classification work)

---

#### Flow 2: Scanning & Classification
**Where it meets Priya's needs:**
- Column-level classification review with accept/override/reject is the core of Priya's workflow, and the flow handles it well.
- Override with notes and audit trail directly addresses her quote: "I need to prove to auditors that every classification decision was deliberate."
- Confidence scoring with visual indicators helps her prioritize review effort.

**Friction points:**
- **No dedicated classification review queue.** Priya reviews classifications daily. The flow routes her through Data Catalog, then Table Detail, then individual columns. There is no "My Review Queue" — a prioritized list of classifications awaiting her decision, sorted by confidence (lowest first), filterable by regulation, with batch approve/reject. She has to manually navigate to each table and scan columns for pending status.
- **No classification policy templates.** Priya defines classification policies, but the flow only shows individual column-level accept/override/reject. There is no way to create rules like "any column named 'ssn' or matching pattern XXX-XX-XXXX should be classified as PII/SSN." She would have to accept the same pattern hundreds of times.
- **No audit trail for review decisions visible during review.** The flow saves classification decisions, but during review, Priya cannot see the history of a column's classification — was it previously classified differently? Who changed it? When? She needs this context to make informed decisions.
- **Missing "why" behind suggestions.** The flow shows confidence score and suggested classification but does not explain why the system suggested it. Was it pattern matching? Column name? Sample data analysis? Priya needs the reasoning to evaluate whether the suggestion is trustworthy.

**Where Priya would get stuck:**
- After a scan completes, Priya needs to know "how many classifications need my review?" The scan results summary shows sensitive columns found, but does not break these down by review status. She would visit Data Catalog, try to filter by "classification pending," and hope the filter exists.
- Cross-table consistency: if "email" is classified as PII in Table A but the system suggests "Internal" for an identical column in Table B, Priya has no way to see these inconsistencies without visiting every table.

**What's missing:**
- Dedicated classification review queue with prioritization, filtering, and batch actions
- Classification policy rules (pattern-based, column-name-based) that auto-apply across future scans
- Classification history per column (who classified it, when, previous values)
- Explanation of classification reasoning (why did the system suggest this?)
- Cross-table consistency checker (same column pattern classified differently across tables)

---

#### Flow 3: Risk Assessment
**Where it meets Priya's needs:**
- Regulation mapping (GDPR/CCPA/HIPAA/PCI-DSS requirements vs. current state) is directly useful for her compliance tracking work.
- Requirements checklist with pass/fail gives her a clear audit artifact.

**Friction points:**
- **Compliance reporting requires leaving the risk flow.** Priya needs to generate compliance reports from the regulation mapping, but the report generation is in a separate Reports section. She has to leave her risk analysis context to generate the artifact she needs.
- **No custom regulation support is visible.** The flow shows four regulations (GDPR, CCPA, HIPAA, PCI-DSS). Priya's healthcare company may have state-level requirements, contractual obligations, or internal policies that need tracking. The regulation mapping does not show how custom frameworks are handled.
- **Gap analysis is not actionable.** The regulation detail shows requirements met/unmet, but the gap from "unmet" to "what specific remediation closes this gap" requires too many clicks: Regulation Detail, identify gap, find affected data, navigate to Remediation, select action. This multi-hop journey loses context at every step.

**What's missing:**
- In-context report generation from regulation detail (without navigating away)
- Custom regulation framework creation and tracking
- Direct "close this gap" action from regulation requirements (one click to remediation with context pre-filled)
- Compliance trend over time per regulation (are we getting more compliant?)

---

#### Flow 4: Remediation
**Where it meets Priya's needs:**
- Audit trail for every remediation action (immutable audit log entry) satisfies her compliance requirement.
- "Request approval" flow for users without remediation permissions supports governance approval workflows.

**Friction points:**
- **No approval workflow for remediation.** Priya may need to approve remediations before they execute — especially tokenization of production data. The flow mentions "Request approval" as a permissions-based state, but there is no approval queue, notification system, or multi-person sign-off workflow. In regulated environments (HIPAA, PCI), remediation changes need formal approval.
- **Remediation history lacks compliance context.** The remediation history shows date, type, applied by, affected data, risk impact, status. For Priya's audit purposes, it also needs: which regulation requirement this addresses, who approved it, and which compliance gap it closes.

**What's missing:**
- Approval workflow for remediations (request, review, approve/reject, execute)
- Compliance context on remediation actions (which regulation requirement does this address?)
- Remediation-to-compliance mapping (this tokenization action closes HIPAA requirement X)

---

#### Flow 5: Tokenization Policies
**Where it meets Priya's needs:**
- Regulation mapping on policies (GDPR, CCPA, HIPAA, PCI-DSS) connects policy to compliance purpose.
- Classification-based scope (which data types are covered) aligns with how Priya thinks about governance.

**Friction points:**
- **Policy creation requires technical knowledge Priya may not have.** Token format selection (FPE, hash, random, mask) with preservation rules (format-preserving, length, character set) requires understanding of tokenization mechanics. Priya knows she needs to protect SSNs for HIPAA compliance, but choosing between FPE and hash-based tokenization is a data engineering decision, not a governance decision. The flow does not offer regulation-aware defaults.
- **No policy effectiveness tracking.** After creating and applying a policy, Priya needs to know: is this policy actually reducing our risk? How many columns does it cover? Has coverage changed since last month? The Policy Detail shows "Applied Data" but not effectiveness metrics.

**What's missing:**
- Regulation-aware policy templates (e.g., "HIPAA PHI Protection" pre-configured with appropriate token formats)
- Policy effectiveness dashboard (coverage, risk reduction, compliance impact)
- Separation of policy intent (what to protect and why) from policy implementation (how to tokenize)

---

#### Flow 6: Dashboard & Monitoring
**Where it meets Priya's needs:**
- Compliance status cards per regulation give her a quick daily health check.
- Report generation and scheduling (PDF, email) supports her weekly reporting workflow.

**Friction points:**
- **No classification-centric dashboard section.** The dashboard focuses on risk score, protection coverage, and compliance status. Priya's daily concern is classification status: how many columns are pending review? How many were classified this week? What is the classification accuracy over time? She has to go to Data Catalog and manually assess the classification workload.
- **Scheduled reports are basic.** The flow mentions daily/weekly/monthly scheduled email reports, but Priya needs different reports for different audiences: detailed compliance report for auditors, summary for Marcus, classification progress for her own tracking. The flow does not show report customization or audience targeting.

**What's missing:**
- Classification workload dashboard (pending reviews, reviewed this week, accuracy metrics)
- Audience-specific report templates (auditor, executive, self)
- Classification velocity metrics (time from scan to classification completion)

---

### 1.3 Marcus (VP Security) — Flow-by-Flow Walkthrough

#### Flow 1: Data Source Connections
**Relevance:** Low. Marcus does not interact with connections directly.

**What's missing:** A connection summary on the dashboard ("15 data sources connected, 2 with errors") so Marcus knows the platform is healthy without visiting the Connections page.

---

#### Flow 2: Scanning & Classification
**Relevance:** Low. Marcus does not review individual classifications.

**What's missing:** A classification completeness metric on the dashboard ("92% of discovered sensitive data has been classified") so Marcus can report on program maturity.

---

#### Flow 3: Risk Assessment
**Where it meets Marcus's needs:**
- Risk score (0-100) with trend is exactly what Marcus asked for: "one number that tells me if we're more secure."
- Risk by category (PCI/PII/PHI) gives him board-ready segmentation.
- Compliance status cards give quick regulation health check.

**Friction points:**
- **No board-ready export from the risk dashboard.** Marcus needs to extract a one-page summary for board presentations. The flow mentions "Export report" and "Executive Summary PDF" but these are in the Reports section under Compliance. The most natural action is to export directly from the dashboard, not navigate to a separate Reports page.
- **No benchmarking or external context.** Marcus presents to a board that asks "how do we compare to peers?" The risk score is internal — there is no industry benchmark, peer comparison, or maturity model contextualization. Marcus cannot answer "is a score of 67 good or bad for a company our size?"
- **Risk score lacks business context.** A score of 67 means nothing without context. What is driving it? What would it take to get to 50? The flow shows risk factors but does not provide a clear "if you do X and Y, your score drops to Z" roadmap.

**Where Marcus would get stuck:**
- Marcus visits weekly and wants to see "what changed since my last visit?" The trend line shows a 30-day view, but there is no "changes since last login" summary or weekly digest.

**What's missing:**
- One-click board summary export directly from dashboard (not from a separate Reports page)
- "What changed" weekly summary (since last visit or since a chosen date)
- Risk score roadmap ("do these 3 things to reduce your score by 15 points")
- Industry benchmarking or maturity model context
- Stakeholder-specific dashboard views (executive view vs. operational view)

---

#### Flow 4: Remediation
**Relevance:** Marcus does not execute remediations but needs to track progress.

**Friction points:**
- **Remediation progress is not visible from the dashboard.** Marcus tracks remediation in spreadsheets today because his current tools do not show progress. The DMP dashboard shows remediation as an activity feed item, but there is no "remediation velocity" or "open remediations" metric on the main dashboard. This is a missed opportunity to solve his exact pain point.

**What's missing:**
- Remediation progress metrics on dashboard (open vs. closed, velocity trend, SLA compliance)
- Assignee tracking (who owns each remediation? Are they on track?)

---

#### Flow 5: Tokenization Policies
**Relevance:** Low. Marcus does not create policies.

**What's missing:** A policy coverage summary ("12 active policies covering 89% of sensitive data") on the dashboard.

---

#### Flow 6: Dashboard & Monitoring
**Where it meets Marcus's needs:**
- Default landing page with risk overview is correct — Marcus should never have to navigate to find the summary.
- Time range selector (7d/30d/90d) supports his weekly and monthly review cadence.

**Friction points:**
- **Dashboard tries to serve everyone and serves no one perfectly.** The dashboard has risk score, protection coverage, compliance cards, top risks, and activity feed. For Marcus, protection coverage and activity feed are noise — he wants risk score, trend, compliance status, and remediation progress. For Jordan, risk score and compliance cards are noise — he wants connection health, scan status, and infrastructure metrics. A single dashboard layout cannot serve both well.
- **No narrative mode.** Marcus presents to a board. He needs the dashboard to tell a story: "Here's where we were, here's what we did, here's where we are." The dashboard shows a snapshot and a trend line, but not a narrative of actions taken and their impact.

**What's missing:**
- Role-based dashboard views (executive view, operations view, governance view)
- Narrative/story mode for board presentations ("this quarter we protected 45,000 PII columns, reducing risk by 23 points")
- Customizable dashboard layout (drag-and-drop widgets per user role)

---

## 2. Competitive UX Gap Analysis

### 2.1 Where Competitors Do Better

#### Varonis (4.9/5 UX) — Remediation Experience
**What they do better:** Varonis is the only DSPM that auto-remediates risk without user intervention. Their MDDR managed service offers a 30-minute ransomware SLA. When Varonis finds stale permissions, it removes them automatically. Our flow requires the user to navigate to Risk Detail, choose a remediation option, configure it, preview it, confirm it, and wait for execution. This multi-step process is thorough but slow.

**What we should adopt:** Offer an "auto-remediate low-risk findings" mode for non-destructive actions (revoking stale access, applying existing policies to new data). Keep the multi-step confirmation flow for high-risk actions (tokenization, deletion) but let low-hanging fruit be handled automatically. This creates a two-tier remediation UX: automated for routine actions, guided for consequential ones.

#### Cyera — Time-to-Value and Discovery UX
**What they do better:** Cyera achieves time-to-value in days with agentless deployment. Their classification happens automatically with 95% precision, meaning the first meaningful insight appears within hours of connecting a data source. Our flow requires: connect (wizard), scan (wait), then manual classification review before any risk assessment appears. The time from "first login" to "first actionable insight" in our flow could be days or weeks, depending on classification review speed.

**What we should adopt:** Offer an "instant insights" mode where the system runs discovery and classification automatically, providing an immediate risk snapshot using high-confidence classifications only. Let users refine through guided classification afterward. The first dashboard should populate within hours of the first connection, not wait for manual classification review. Our guided classification remains a differentiator for accuracy, but it should not be a bottleneck to initial value.

#### Wiz — Security Graph and Context
**What they do better:** Wiz's security graph connects data risk to identity misconfigurations and real attack paths in a single visual. When a user sees a risk in Wiz, they immediately understand the full blast radius: this S3 bucket has PII, is publicly readable, and is accessed by a compromised IAM role. Our Risk Detail shows risk factors in a list format — unprotected columns, broad access, missing retention policy — but does not connect them into an attack path narrative.

**What we should adopt:** Add a visual risk topology that shows the relationship between sensitive data, access patterns, and protection gaps. Instead of listing risk factors, show them as a graph: "Column CUSTOMERS.SSN (PII) is accessible by 14 users and 3 services, is not tokenized, and is required by HIPAA. Impact: breach exposure for 2.3M records." This contextual risk view would differentiate us from both Wiz (which lacks remediation) and Varonis (which lacks graph-based visualization).

#### Atlan — Consumer-Grade UX and Time-to-Production
**What they do better:** Atlan deploys in 4-6 weeks vs. 3-9 months for legacy tools. Their UX is described as "the kind of tool people want to use" with Amazon-like search and filtering. HelloFresh grew from 10% to 500+ monthly active users in 3 months. Our flows are functional but not delightful — they follow standard enterprise SaaS patterns (wizard, list, detail, form) without the consumer-grade polish that drives adoption.

**What we should adopt:** Three specific Atlan patterns: (1) Universal search that works across all entities (connections, tables, columns, policies, regulations) from a single search bar. Our flows require users to navigate to specific sections before searching. (2) Active metadata — automatically surfacing relevant context based on what the user is doing, not requiring them to navigate to it. (3) Collaborative annotations — letting users tag, comment, and discuss classifications inline rather than in a separate audit trail.

#### Sentra — Data Lineage Visualization
**What they do better:** Sentra's DataTreks feature provides interactive maps showing sensitive data movement through ETL, migrations, and AI pipelines. Our flows treat each data source as static — scanned, classified, assessed — but do not show where data flows after discovery. For Jordan, understanding that a PII column in Snowflake feeds an unmasked dbt model that populates a BI dashboard is critical risk context.

**What we should adopt:** Add lineage awareness to the Data Catalog and Risk Assessment flows. When viewing a classified column, show where that data flows downstream. When assessing risk, factor in downstream exposure — a tokenized column that feeds an untokenized downstream table is still a risk.

### 2.2 Where We Are Already Ahead

1. **Guided classification is unmatched.** No competitor offers human-in-the-loop classification with confidence-based review queuing. BigID's natural language classifiers and Cyera's AI-native classification are fully automated. Our guided approach directly addresses the accuracy complaints users report about automated tools. This is a genuine market gap.

2. **Unified risk-to-remediation loop.** No competitor provides discover, classify, assess, remediate, and track in a single product. Varonis auto-remediates but lacks guided classification. Cyera discovers and classifies but routes remediation to external tools. Our five-stage loop is architecturally unique.

3. **Risk reduction tracking.** No competitor shows a risk score that decreases as remediations are applied. This is a unique value proposition, especially for Marcus and board-level reporting. The trend line showing improvement over time is a competitive differentiator.

4. **Integrated tokenization.** DSPM platforms do not tokenize. Protection tools do not discover. We do both. The ability to go from "this column is PII" to "this column is tokenized" in a single product eliminates the multi-vendor stitching problem.

5. **Remediation preview with rollback.** Our before/after tokenization preview and rollback capability goes beyond what Varonis offers for auto-remediation. This gives data engineers confidence to act, which is a significant adoption driver.

### 2.3 Competitor UX Patterns to Adopt

| Pattern | Source | Application in DMP | Priority |
|---------|--------|--------------------|----------|
| Auto-remediation for low-risk findings | Varonis | Two-tier remediation: automated routine actions, guided consequential actions | High |
| Instant risk insights on first connection | Cyera | Populate dashboard with auto-classified high-confidence findings before manual review | High |
| Security graph / attack path visualization | Wiz | Visual risk topology connecting data, access, and protection gaps | Medium |
| Universal search across all entities | Atlan | Single search bar accessible from any page, searching connections, tables, policies, regulations | High |
| Data lineage in catalog and risk views | Sentra | Show downstream data flow for classified columns; factor lineage into risk scoring | Medium |
| Consumer-grade search and filtering | Atlan | Amazon-style faceted search in Data Catalog (by sensitivity, regulation, status, connection) | Medium |
| Natural language classifier creation | BigID | Let governance analysts define classification rules in plain English | Low |
| Active metadata surfacing | Atlan | Contextual suggestions and related information surfaced automatically, not navigated to | Medium |

---

## 3. Friction Points & Recommendations

### 3.1 Flow 1: Data Source Connections

| # | Friction Point | Severity | Recommendation |
|---|----------------|----------|----------------|
| 1.1 | No scan scheduling during connection setup | High | Add a "Scan Schedule" step to the connection wizard after schema selection. Offer presets (off-peak hours, weekends, custom cron) and a "scan now" option. This is the first thing a data engineer will look for. |
| 1.2 | No infrastructure-as-code path | Medium | Provide a Terraform provider and REST API for connection management. Show API/Terraform snippets on the connection creation confirmation screen. |
| 1.3 | 5-step wizard is heavy for experienced users | Low | Add a "quick connect" option for users who know their credentials: single-form connection creation with platform-specific defaults. Keep the wizard for first-time setup. |
| 1.4 | No connection health trending | Medium | Add latency, uptime, and scan duration trends to Connection Detail. Data engineers expect observability dashboards for infrastructure components. |
| 1.5 | Schema selection tree does not show sensitivity indicators | Medium | After the first scan, show sensitivity badges on the schema tree (e.g., "12 sensitive columns detected") to help users understand what they are connecting. |

**Missing feedback loop:** After creating a connection and triggering a scan, the user is left on Connection Detail with no clear indication of "what happens next." Add a progress tracker: "Connection created. Scan running. Classification review available in ~15 minutes."

---

### 3.2 Flow 2: Scanning & Classification

| # | Friction Point | Severity | Recommendation |
|---|----------------|----------|----------------|
| 2.1 | No dedicated classification review queue | Critical | Build a standalone "Review Queue" page accessible from the sidebar under Discovery. Show all pending classifications, sorted by confidence (lowest first), filterable by connection, regulation, and data type. Support batch accept/reject. This is Priya's primary workflow and it is currently buried inside Data Catalog navigation. |
| 2.2 | No role-based handoff between scan and classification | High | After scan completion, show role-appropriate next steps. For data engineers: "Scan complete. 47 columns need classification. Notify governance team?" For governance analysts: notification badge on Review Queue showing pending items. |
| 2.3 | No explanation for classification suggestions | Medium | Show reasoning for each suggestion: "Classified as PII/Email because: column name contains 'email', 92% of values match email pattern, similar column in same schema classified as PII/Email." This builds trust in the guided classification model. |
| 2.4 | No cross-table consistency view | Medium | Add a "Classification Consistency" view that groups columns with similar patterns across tables and flags inconsistencies. Priya can then bulk-align classifications. |
| 2.5 | Bulk accept is per-table only | High | Add global bulk actions: "Accept all suggestions above 95% confidence across all tables" with a confirmation summary showing what will be accepted. |
| 2.6 | No classification rules for recurring patterns | High | Let governance analysts create classification rules (regex pattern, column name match, or sample value match) that auto-apply to future scans. This reduces repetitive review work. |

**Missing feedback loop:** After classifying a column, there is no confirmation of what changed in the risk score. Add an inline micro-update: "Classification confirmed. Risk score for this table: 72 -> 68." This makes classification feel consequential and rewarding.

---

### 3.3 Flow 3: Risk Assessment

| # | Friction Point | Severity | Recommendation |
|---|----------------|----------|----------------|
| 3.1 | Risk factors are listed, not contextualized | High | Replace the risk factor list with a risk topology graph showing relationships between sensitive data, access patterns, and protection gaps. Show blast radius for each risk. |
| 3.2 | No "what should I do first?" guidance | High | Add a "Recommended Actions" section that prioritizes remediations by risk impact and effort. "Tokenize 3 PII columns in PRODUCTION.CUSTOMERS to reduce risk by 8 points" is more actionable than "3 unprotected PII columns." |
| 3.3 | Acknowledge/snooze lacks accountability | Medium | When a risk is snoozed, require a reason and set a re-evaluation date. Show snoozed risks in a separate tab so they are not forgotten. Track snooze patterns for governance reporting. |
| 3.4 | No risk simulation | Medium | Add a "what-if" simulator: "If you tokenize all PII columns in Connection X, your risk score would drop from 67 to 52." This gives Marcus his roadmap and gives Jordan motivation to act. |
| 3.5 | Access analysis lacks platform specificity | Medium | Show access in platform-native terms: Snowflake roles and grants, AWS IAM policies, Databricks ACLs. Generic "user/service" labels lose critical context. |

**Missing feedback loop:** Risk assessment does not communicate the urgency or trajectory of risk. Add a "risk velocity" indicator: "Risk is increasing by 3 points/week due to new unclassified data." This creates urgency without alarm fatigue.

---

### 3.4 Flow 4: Remediation

| # | Friction Point | Severity | Recommendation |
|---|----------------|----------|----------------|
| 4.1 | No dry-run mode | High | Promote dry-run from edge case to primary flow step. Before "Apply Tokenization," add "Run Test" that tokenizes a sample (first 100 rows or a non-production copy) and shows results. |
| 4.2 | No approval workflow | High | Add multi-step approval: requester proposes remediation, approver reviews impact preview, approver confirms. This is required for HIPAA/PCI-regulated environments. |
| 4.3 | Success screen does not drive the next action | Medium | After remediation success, show: "Risk score reduced: 67 -> 59. Next recommended action: Revoke stale access to PRODUCTION.PAYMENTS (est. -4 points)." This keeps the momentum of the five-stage loop. |
| 4.4 | No scheduling for remediation execution | Medium | Allow users to schedule remediation for a specific maintenance window rather than executing immediately. Data engineers need this for production systems. |
| 4.5 | Remediation history lacks compliance linkage | Medium | Add a "compliance impact" column to remediation history showing which regulation requirements each action addresses. |

**Missing feedback loop:** The remediation flow ends with "Risk Dashboard Reflects Change" but does not celebrate the improvement. Add an explicit "score reduction" animation and connect it to the broader trend: "Your team has reduced risk by 23 points this month."

**Disconnected handoff:** The path from Risk Detail to Remediation loses context. When a user clicks "Remediate" from a risk recommendation, the remediation flow should pre-fill the affected data, suggested action, and expected impact — not start from a blank remediation options screen.

---

### 3.5 Flow 5: Tokenization Policies

| # | Friction Point | Severity | Recommendation |
|---|----------------|----------|----------------|
| 5.1 | Token format selection requires technical knowledge | High | Offer regulation-aware defaults: "For HIPAA PHI, we recommend format-preserving encryption to maintain data utility for analytics." Let governance analysts choose the regulation and purpose; let the system recommend the token format. |
| 5.2 | Policies are disconnected from risk impact | Medium | Show a "Coverage & Impact" section on Policy Detail: how many columns this policy protects, what risk reduction it provides, which compliance gaps it closes. |
| 5.3 | No policy testing workflow | Medium | Before activating a policy, let users test it against sample data to verify that tokenized output meets their requirements. |
| 5.4 | No policy templates | Medium | Provide pre-built policy templates for common regulations (HIPAA PHI, PCI cardholder data, GDPR personal data) with recommended configurations. Users clone and customize. |
| 5.5 | 5-step wizard for simple policies | Low | For straightforward policies (e.g., "tokenize all SSNs with FPE"), offer a quick-create form alongside the full wizard. |

**Disconnected handoff:** Policy creation and policy application are separate flows. After creating a policy, the user sees "Not Yet Applied" and must separately navigate to apply it. Consider adding "Apply now to matching data?" as a final creation step.

---

### 3.6 Flow 6: Dashboard & Monitoring

| # | Friction Point | Severity | Recommendation |
|---|----------------|----------|----------------|
| 6.1 | Single dashboard serves all personas poorly | Critical | Implement role-based dashboard views. Executive view: risk score, trend, compliance status, remediation velocity. Operations view: connection health, scan status, classification queue depth. Governance view: classification completeness, compliance coverage, review queue status. |
| 6.2 | No "what changed" summary | High | Add a "since your last visit" section at the top of the dashboard showing key changes: new risks, completed remediations, classification progress, connection issues. |
| 6.3 | Board summary requires navigating to Reports | Medium | Add a "Generate Board Summary" button directly on the dashboard that produces a one-page PDF of the current state. Do not require Marcus to find the Reports section. |
| 6.4 | No universal search | High | Add a persistent search bar in the top navigation that searches across all entities: connections, tables, columns, policies, regulations, remediations. This is table stakes for modern SaaS (cf. Atlan, Slack, Notion). |
| 6.5 | Activity feed is chronological only | Low | Add filtering and grouping to the activity feed: by type (scans, classifications, remediations), by user, by connection. Allow muting low-value events. |
| 6.6 | No onboarding progress tracking for new users | Medium | For new accounts, replace the standard dashboard with a getting-started checklist: connect first source, run first scan, review first classification, apply first remediation. Show progress as percentage. Track time-to-first-value. |

**Missing feedback loop:** The dashboard does not communicate momentum. Add a "This Month's Progress" section showing remediations completed, risk points reduced, and classifications reviewed. This gamifies the five-stage loop and gives teams a sense of achievement.

---

### 3.7 Cross-Flow Disconnections

| Disconnection | Impact | Recommendation |
|---------------|--------|----------------|
| Scan completion does not notify classification reviewers | Priya has no way to know new classifications are waiting | Add notification system: email, in-app badge on Review Queue, optional Slack integration |
| Remediation success does not update the dashboard in real-time | Marcus checking the dashboard after a remediation may see stale data | Real-time score recalculation and dashboard refresh after remediation completion |
| Classification changes do not trigger risk recalculation visibly | Users accept classifications but do not see risk impact immediately | Show inline risk impact preview during classification review |
| Policy creation does not connect to remediation | A policy is created but sits dormant until separately applied | Add "Apply to existing matching data?" as a policy creation completion step |
| Risk recommendations do not carry context to remediation | Clicking "Remediate" from Risk Detail starts a fresh remediation flow | Pre-fill remediation options with the risk context: affected data, recommended action, expected impact |
| Connection setup does not inform governance about coverage | New connections are invisible to governance analysts | Notify governance team when new connections are added, include in coverage tracking |

---

## 4. Strategic UX Recommendations

### 4.1 Create Competitive Advantage Against Cyera, Varonis, and Wiz

**Against Cyera (rapid time-to-value):**
Implement an "Instant Insights" onboarding mode. When a user connects their first data source, immediately run automated classification on high-confidence patterns (credit card numbers, SSNs, email addresses) and populate the dashboard with a preliminary risk score. Display this within hours, not days. Overlay a banner: "This is your estimated risk based on automated analysis. Refine accuracy through guided classification." This matches Cyera's speed while preserving our guided classification differentiator. The user gets immediate value AND better long-term accuracy.

**Against Varonis (automated remediation):**
Implement two-tier remediation. Tier 1 (automated): non-destructive, low-risk actions execute automatically — revoke stale access older than 90 days, apply existing policies to newly discovered matching data, flag stale credentials. Tier 2 (guided): consequential actions go through the current multi-step flow with preview, confirmation, and rollback. This matches Varonis's automation for routine work while providing superior guided remediation for high-stakes changes. Critically, both tiers feed into the risk score trend, so Marcus sees continuous improvement.

**Against Wiz (contextual security graph):**
Build a "Risk Context" view that visualizes the relationship between sensitive data, access patterns, pipeline flows, and protection gaps. This does not need to replicate Wiz's full cloud security graph (which includes infrastructure misconfigurations we do not cover). Focus on data-centric context: "This PII column is accessed by 3 services and 12 users, flows through 2 pipelines into a BI dashboard, and is covered by HIPAA. Tokenizing it reduces risk by 8 points and closes 1 compliance gap." This is more actionable than Wiz's generic attack paths because it connects directly to remediation.

### 4.2 Serve Data Engineers AND Governance Analysts Without Compromise

**Principle: Shared data model, separate experiences.**

Both personas work with the same underlying data (connections, classifications, risk scores, remediations), but they enter at different points and need different views.

**Implementation:**
1. **Role-aware navigation.** On first login, ask the user's role (data engineer, governance analyst, executive, or custom). Adjust the sidebar default section, dashboard layout, and notification preferences accordingly. Do not lock features — let users access everything, but optimize the default experience.

2. **Dedicated workspaces.** Data engineers get an "Infrastructure" workspace: connection health, scan operations, schema changes, pipeline impact. Governance analysts get a "Classification & Compliance" workspace: review queue, compliance coverage, regulation tracking, audit trail. Executives get a "Risk Overview" workspace: score, trend, compliance, remediation progress.

3. **Contextual handoffs.** When a data engineer completes a scan, show "Notify governance team for classification review?" When a governance analyst classifies data, show the risk score impact. When either initiates remediation, route to the appropriate level of technical detail.

4. **Shared activity feed with role-filtered defaults.** Everyone sees the same activity log, but data engineers see scan and connection events by default; governance analysts see classification and compliance events; executives see remediation and risk score events.

### 4.3 Make the Five-Stage Loop Feel Continuous and Rewarding

The current flows treat each stage as a separate section of the application. The sidebar groups them under "Discovery," "Protection," and "Compliance," which fragments the loop into disconnected pages. To make the loop feel continuous:

**1. Progress ring on the dashboard.** Show a five-segment progress ring (Discover, Classify, Assess, Remediate, Track) that fills as the organization progresses through each stage. Each segment shows completion percentage. This gives the loop a visual identity and creates a completion incentive.

**2. Contextual next-step prompts.** After every significant action, suggest the next stage:
- After connecting: "Scan now to discover sensitive data" (Discover complete, advance to Classify)
- After classifying: "Your risk score updated. Review your risk assessment" (Classify complete, advance to Assess)
- After assessing: "3 high-impact remediations recommended" (Assess complete, advance to Remediate)
- After remediating: "Risk reduced by 12 points. View your progress trend" (Remediate complete, advance to Track)
- While tracking: "2 new connections added since last scan. Re-scan to update discovery" (Track loops back to Discover)

**3. Score animation on remediation.** When a remediation succeeds, animate the risk score change (67 transitioning to 59) with a brief celebration state. This makes the cause-and-effect tangible and motivates continued remediation.

**4. Weekly progress digest.** Send a weekly email summarizing loop progress: "This week: 3 new connections discovered, 147 columns classified, risk score reduced by 9 points, 2 compliance gaps closed." This keeps the loop top-of-mind even when users are not actively in the product.

### 4.4 Reduce Time-to-Value (Target: 4-6 Weeks to Match Atlan)

**Current bottlenecks to value:**
1. Connection wizard (5 steps) — could be 2 steps for known platforms
2. Scan wait time — depends on data volume, no user control
3. Classification review — manual, column-by-column, no batching beyond table level
4. Risk score only appears after classification — could appear sooner with auto-classification

**Recommendations to accelerate:**
1. **First connection in under 5 minutes.** Offer OAuth-based connection for Snowflake and Databricks (no manual credential entry). Auto-detect available schemas. Default to "scan all" with opt-out.

2. **First insight in under 1 hour.** Run automated classification on the first scan with high-confidence patterns. Populate dashboard with preliminary risk score. Show "estimated" badge until guided classification refines it.

3. **First remediation in under 1 day.** After the first scan, proactively suggest one high-impact, low-effort remediation: "We found 3 columns with credit card numbers accessible by 14 users. Tokenize them now?" Pre-fill the remediation flow with context.

4. **Full deployment in 4-6 weeks.** Provide a deployment checklist with time estimates: Week 1: connect all sources, Week 2: initial scan and auto-classification, Week 3: guided classification review, Week 4: first remediation round, Week 5-6: policy creation, compliance mapping, and reporting setup. Track progress against this checklist on the dashboard.

5. **Adoption metrics.** Track time-to-first-connection, time-to-first-scan, time-to-first-classification, time-to-first-remediation, time-to-first-report. Set internal benchmarks and alert customer success when a deployment stalls.

---

## 5. Priority Matrix

### Critical Priority (Do First)

| # | Recommendation | UX Impact | Competitive Differentiation | Implementation Effort |
|---|---------------|-----------|----------------------------|----------------------|
| 2.1 | Dedicated classification review queue | High | High — no competitor has guided classification UX | Medium |
| 6.1 | Role-based dashboard views | High | High — addresses market gap #4 (data engineer UX) | Medium |
| 4.3 | Next-step prompts after remediation (risk score change + next action) | High | High — makes the five-stage loop tangible, unique to us | Low |
| 2.2 | Role-based scan-to-classification handoff with notifications | High | Medium — basic workflow, but competitors lack it due to auto-classification | Low |

### High Priority (Do Soon)

| # | Recommendation | UX Impact | Competitive Differentiation | Implementation Effort |
|---|---------------|-----------|----------------------------|----------------------|
| 1.1 | Scan scheduling during connection setup | High | Medium — operational table stakes for data engineers | Low |
| 2.5 | Global bulk classification actions (above confidence threshold) | High | High — enables scalable guided classification | Medium |
| 2.6 | Classification rules for recurring patterns | High | High — evolves guided classification from reactive to proactive | Medium |
| 3.2 | Prioritized recommended actions with risk impact estimates | High | High — connects risk assessment to remediation with ROI | Medium |
| 3.4 | Risk simulation ("what-if" score modeling) | High | High — unique, no competitor offers this | Medium |
| 4.1 | Dry-run mode for remediation (first-class, not edge case) | High | Medium — builds confidence for data engineer adoption | Medium |
| 4.2 | Approval workflow for remediation | High | Medium — required for regulated environments | High |
| 6.2 | "What changed since last visit" dashboard summary | High | Medium — improves executive experience | Low |
| 6.4 | Universal search across all entities | High | Medium — table stakes for modern SaaS | Medium |
| 6.6 | Onboarding progress checklist for new accounts | High | High — accelerates time-to-value, competes with Cyera | Low |

### Medium Priority (Do Next Quarter)

| # | Recommendation | UX Impact | Competitive Differentiation | Implementation Effort |
|---|---------------|-----------|----------------------------|----------------------|
| 2.3 | Classification reasoning explanation | Medium | High — builds trust in guided classification model | Medium |
| 2.4 | Cross-table classification consistency checker | Medium | Medium — improves classification quality | Medium |
| 3.1 | Risk topology graph (visual risk context) | Medium | High — competes with Wiz's security graph | High |
| 3.5 | Platform-specific access display (Snowflake roles, AWS IAM) | Medium | Medium — improves data engineer experience | Medium |
| 4.4 | Scheduled remediation execution (maintenance windows) | Medium | Medium — data engineer operational need | Medium |
| 5.1 | Regulation-aware policy defaults and templates | Medium | Medium — reduces governance analyst friction | Low |
| 5.2 | Policy effectiveness dashboard (coverage, risk reduction) | Medium | Medium — connects policies to outcomes | Medium |
| 6.3 | Board summary export directly from dashboard | Medium | Medium — quality-of-life for Marcus persona | Low |
| -- | Instant insights mode (auto-classify high-confidence on first scan) | High | High — matches Cyera's time-to-value | High |
| -- | Two-tier remediation (automated routine + guided consequential) | High | High — matches Varonis's auto-remediation | High |

### Lower Priority (Backlog)

| # | Recommendation | UX Impact | Competitive Differentiation | Implementation Effort |
|---|---------------|-----------|----------------------------|----------------------|
| 1.2 | Terraform provider and API for connection management | Medium | Medium — IaC for data engineers | High |
| 1.3 | Quick-connect single-form option for experienced users | Low | Low — convenience improvement | Low |
| 1.4 | Connection health trending (latency, uptime) | Medium | Low — operational polish | Medium |
| 5.5 | Quick-create form for simple policies | Low | Low — convenience improvement | Low |
| 6.5 | Activity feed filtering and grouping | Low | Low — usability polish | Low |
| -- | Data lineage in catalog and risk views | Medium | High — competes with Sentra's DataTreks | High |
| -- | Industry benchmarking for risk score context | Medium | Medium — executive-facing enhancement | High |
| -- | Narrative/story mode for board presentations | Medium | Medium — executive-facing enhancement | Medium |
| -- | Progress ring visualization for the five-stage loop | Medium | High — makes the loop a visual brand element | Medium |

---

## Summary of Top Findings

**The most critical gap in the current UX flows is the absence of a dedicated classification review queue.** The guided semi-automatic classification model is our primary differentiator, but the UX for actually performing classification review is buried inside Data Catalog navigation. Priya — the persona who uses this daily — must navigate through multiple screens to find pending classifications. This is equivalent to building a best-in-class email system but hiding the inbox inside the contacts page.

**The second most critical gap is the single-persona dashboard.** The dashboard tries to serve Marcus (executive), Priya (governance), and Jordan (operations) with one layout. All three personas identified friction with the current dashboard design. Role-based views are not a nice-to-have — they determine whether each persona considers this product useful on day one.

**The third most critical gap is the disconnect between flow stages.** The five-stage loop is architecturally sound but feels like five separate products stitched together in the sidebar. Users complete an action in one stage and receive no guidance on what comes next. Adding contextual next-step prompts after every significant action transforms the UX from a tool collection into a continuous security improvement workflow. This is low effort and high impact.

**The strongest competitive advantage in the current flows** is the remediation experience: preview with before/after, rollback capability, and risk score update after completion. No competitor offers this level of guided remediation for data security. The recommendation is to amplify this advantage with dry-run mode, risk simulation, and the two-tier automated/guided approach rather than building net-new features first.
