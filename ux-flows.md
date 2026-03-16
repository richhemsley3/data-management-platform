# Data Security Product — UX Flows

## Product Overview

**Product**: Standalone data security SaaS that helps companies discover, classify, and secure sensitive data across their infrastructure.

**Primary Users**:
- **Data engineers**: Manage connections, run scans, monitor infrastructure
- **Data governance team**: Define policies, review classifications, manage access rules
- **Security/compliance + executives**: Consume dashboards, risk scores, audit reports (informed stakeholders)

**Classification model**: Guided semi-automatic — system suggests, users confirm or override.

---

## Flow 1: Data Source Connections

**Goal**: Connect external data platforms (Snowflake, AWS, Databricks, etc.) so the system can scan and ingest metadata.

```mermaid
flowchart TD
    A([Start: Connections page]) --> B{Any connections exist?}
    B -->|No| C[Empty State: Connect your first data source]
    B -->|Yes| D[Connection List View]

    C --> E[Click: + Add Connection]
    D --> E

    E --> F[Step 1: Select Platform]
    F --> G[Step 2: Configure Credentials]
    G --> H[Step 3: Test Connection]

    H --> I{Test successful?}
    I -->|Yes| J[Step 4: Select Schemas/Databases to Scan]
    I -->|No| K[Error: Show failure reason + retry]
    K --> G

    J --> L[Step 5: Review & Save]
    L --> M[Connection Created — Status: Pending First Scan]
    M --> N[Redirect to Connection Detail]

    N --> O{Auto-trigger scan?}
    O -->|Yes| P[Scan begins automatically]
    O -->|No| Q[User triggers scan manually]

    D --> R[Click existing connection]
    R --> N
```

### Screen Inventory

| Screen | Purpose | Entry From | Key Content | Actions | Exits To |
|--------|---------|------------|-------------|---------|----------|
| **Connection List** | Browse all connected data sources | Sidebar nav | Table: name, platform, status, last scan, schema count | + Add Connection, filter by platform/status | Connection Detail, Add Connection |
| **Add Connection — Select Platform** | Choose which platform to connect | Connection List | Grid of platform cards (Snowflake, AWS S3, Databricks, BigQuery, Redshift, etc.) with logos | Select platform | Configure Credentials |
| **Add Connection — Configure** | Enter connection credentials | Select Platform | Platform-specific form (host, port, credentials, warehouse, etc.) | Test Connection, Back | Test result, Select Schemas |
| **Add Connection — Select Schemas** | Choose which databases/schemas to scan | Successful test | Tree view of databases → schemas → tables (checkboxes) | Select all, deselect all, search | Review & Save |
| **Add Connection — Review** | Confirm before creating | Select Schemas | Summary: platform, host, selected schemas count | Save, Back | Connection Detail |
| **Connection Detail** | View connection health, scan history, schema inventory | Connection List | Tabs: Overview, Schemas, Scan History, Settings | Edit, Delete, Trigger Scan, Disable | Schema Detail |

### Edge Cases

| Category | Scenario | Design Response |
|----------|----------|-----------------|
| Empty state | No connections yet | Guided empty state: "Connect your first data source to start discovering sensitive data" + platform logo grid |
| Error | Credentials invalid | Inline error on test step with specific failure reason (auth failed, network unreachable, etc.) |
| Error | Connection drops after setup | Status badge: "Disconnected" (error tag), banner on detail page with reconnect action |
| Permission | Read-only user views connections | See list and details, all mutation buttons disabled with tooltip "Contact admin" |
| Scale | 50+ connections | Pagination, filter by platform/status, search by name |
| Loading | Testing connection takes time | "Testing connection..." spinner with cancel option, 30s timeout |
| Destructive | Delete connection with scanned data | Confirmation: "Deleting this connection will remove 12 scanned schemas and their classifications. This can't be undone." |

---

## Flow 2: Data Scanning & Classification

**Goal**: Scan connected data sources, ingest metadata, and classify sensitive data with guided semi-automatic classification.

```mermaid
flowchart TD
    A([Start: Connection Detail or Data Catalog]) --> B[Trigger Scan]
    B --> C[Scan Running — Progress View]

    C --> D{Scan complete?}
    D -->|Yes| E[Scan Results Summary]
    D -->|Partial failure| F[Results + Error Report]
    D -->|Full failure| G[Error: Scan Failed — Retry]

    E --> H[Data Catalog Updated]
    F --> H

    H --> I[Data Catalog List View]
    I --> J[Click schema/table]
    J --> K[Table Detail View]

    K --> L[Columns with Suggested Classifications]
    L --> M{Review classifications}

    M -->|Accept suggestion| N[Classification Confirmed]
    M -->|Override| O[Select Different Classification]
    M -->|Reject| P[Mark as Not Sensitive]
    M -->|Bulk accept| Q[Accept All Suggestions for Table]

    N --> R[Classification Saved]
    O --> R
    P --> R
    Q --> R

    R --> S[Risk Score Updated]
```

### Screen Inventory

| Screen | Purpose | Entry From | Key Content | Actions | Exits To |
|--------|---------|------------|-------------|---------|----------|
| **Scan Progress** | Show real-time scan status | Trigger scan action | Progress bar, tables scanned/total, estimated time, discovered columns count | Cancel scan | Scan Results |
| **Scan Results Summary** | Overview of what was found | Scan completion | Total tables/columns scanned, sensitive columns found (by category: PCI, PII, PHI), new vs. previously classified | View Data Catalog, Re-scan | Data Catalog |
| **Data Catalog** | Browse all scanned data assets | Sidebar nav, scan results | Table: schema, table name, columns, classified columns, sensitivity level, last scanned | Filter by: connection, sensitivity, classification status, search | Table Detail |
| **Table Detail** | View columns and their classifications | Data Catalog | Column list with: name, data type, sample values (masked), suggested classification, confidence score, status (pending/confirmed/rejected) | Accept, Override, Reject classification (per column or bulk) | Data Catalog |
| **Classification Override** | Change a column's classification | Table Detail | Dropdown: PCI, PII (name, email, SSN, phone, address...), PHI, Financial, Internal, Public, Custom | Select classification, add notes | Table Detail |

### Edge Cases

| Category | Scenario | Design Response |
|----------|----------|-----------------|
| Empty state | No scans run yet | Empty state on Data Catalog: "Scan your connected data sources to discover sensitive data" + link to Connections |
| Loading | Scan takes hours on large datasets | Background scan with email notification, progress accessible from sidebar badge |
| Error | Scan fails on specific tables | Partial results shown, failed tables listed with retry per-table |
| Confidence | Low confidence classification (< 70%) | Visual indicator (yellow warning tag), prioritized in review queue |
| Scale | 10,000+ columns to review | Bulk accept suggestions above 90% confidence, filter to "needs review" only |
| Data | Sample values contain sensitive data | Mask/redact sample values by default, reveal with click + audit log |
| Conflict | Reclassifying previously confirmed column | Warning: "This column was previously classified as PII (SSN). Changing to 'Not Sensitive' will affect risk score." |
| Stale | Data source schema changed since last scan | "Schema drift detected" banner on connection, suggest re-scan |

---

## Flow 3: Risk Assessment & Scoring

**Goal**: Evaluate risk based on what sensitive data exists, who/what has access to it, and which regulations apply.

```mermaid
flowchart TD
    A([Start: Risk Dashboard]) --> B{Data classified?}
    B -->|No| C[Empty State: Complete classification first]
    B -->|Yes| D[Risk Dashboard — Overview]

    D --> E[Overall Risk Score]
    D --> F[Risk by Category: PCI / PII / PHI]
    D --> G[Risk by Connection/Source]
    D --> H[Regulation Compliance Status]

    E --> I[Click: View Risk Breakdown]
    I --> J[Risk Detail View]

    J --> K[Access Analysis]
    K --> K1[Machine Access: Services, APIs, pipelines with access]
    K --> K2[Human Access: Users, groups, roles with access]

    J --> L[Regulation Mapping]
    L --> L1[GDPR requirements vs. current state]
    L --> L2[CCPA requirements vs. current state]
    L --> L3[HIPAA requirements vs. current state]
    L --> L4[PCI-DSS requirements vs. current state]

    J --> M[Risk Factors]
    M --> M1[Unprotected sensitive columns]
    M --> M2[Overly broad access grants]
    M --> M3[Data without retention policy]
    M --> M4[Cross-region data residency violations]

    J --> N[Recommendations]
    N --> O{User acts on recommendation?}
    O -->|Yes| P[Navigate to Remediation flow]
    O -->|Defer| Q[Mark as acknowledged / snoozed]
```

### Screen Inventory

| Screen | Purpose | Entry From | Key Content | Actions | Exits To |
|--------|---------|------------|-------------|---------|----------|
| **Risk Dashboard** | High-level risk overview | Sidebar nav (home/default) | Risk score (0-100), trend chart, breakdown by category (PCI/PII/PHI), top risks, compliance status cards | Filter by time range, connection, regulation | Risk Detail, Remediation |
| **Risk Detail** | Deep dive into specific risk area | Risk Dashboard drill-down | Risk factors list, affected tables/columns, access analysis, regulation gaps | Remediate, Acknowledge, Snooze | Remediation, Access Analysis |
| **Access Analysis** | Who/what has access to sensitive data | Risk Detail | Two tabs: Machine Access (services, roles, read/write) and Human Access (users, groups, permissions) | Revoke access (→ Remediation), Export report | Remediation |
| **Regulation Mapping** | Compliance status per regulation | Risk Dashboard | Regulation cards: GDPR, CCPA, HIPAA, PCI-DSS — each showing requirements met/unmet, affected data | View requirements, Generate compliance report | Risk Detail |

### Risk Score Model (UX perspective)

| Score Range | Label | Color Token | Indicator |
|-------------|-------|-------------|-----------|
| 0–25 | Low Risk | `--sds-status-success-*` | Green |
| 26–50 | Moderate Risk | `--sds-status-warning-*` | Yellow |
| 51–75 | High Risk | `--sds-status-error-*` (lighter) | Orange (use red-300) |
| 76–100 | Critical Risk | `--sds-status-error-*` | Red |

### Edge Cases

| Category | Scenario | Design Response |
|----------|----------|-----------------|
| Empty state | No classified data yet | Dashboard shows 0 score with "Complete data classification to see your risk assessment" CTA |
| Loading | Risk calculation processing | "Calculating risk score..." with skeleton cards, partial results as available |
| Change | Risk score changed since last visit | Trend indicator: "↑ 12 points since last week" with sparkline |
| Conflict | Regulation requirements conflict | Show both, flag conflict: "GDPR requires deletion, HIPAA requires 6-year retention" |
| Staleness | Data hasn't been scanned in 30+ days | Warning banner: "Risk score may be outdated — last scan was 45 days ago" + Re-scan CTA |
| Executive view | Leadership wants summary, not details | Dashboard top section is the executive summary — no drill-down needed for high-level view |

---

## Flow 4: Remediation

**Goal**: Apply fixes to reduce risk — tokenize data, revoke access, delete data, or apply policies.

```mermaid
flowchart TD
    A([Start: From Risk Detail or Recommendation]) --> B[Remediation Options]

    B --> C{Remediation type?}

    C -->|Tokenize| D[Select Tokenization Policy]
    D --> D1[Choose existing policy or create new]
    D1 --> D2[Map columns to token format]
    D2 --> D3[Preview: Before/After sample data]
    D3 --> D4[Apply Tokenization]
    D4 --> D5{Success?}
    D5 -->|Yes| E[Risk Score Reduced — Success]
    D5 -->|No| F[Error: Rollback + Show Reason]

    C -->|Revoke Access| G[Access Revocation]
    G --> G1[Select users/machines/roles to revoke]
    G1 --> G2[Impact Preview: Who/what loses access]
    G2 --> G3[Confirm Revocation]
    G3 --> E

    C -->|Delete Data| H[Data Deletion]
    H --> H1[Select tables/columns to delete]
    H1 --> H2[Impact Preview: Downstream dependencies]
    H2 --> H3[Confirm Deletion — requires typed confirmation]
    H3 --> E

    C -->|Apply Policy| I[Policy Application]
    I --> I1[Select governance/regulation policy]
    I1 --> I2[Preview affected data and changes]
    I2 --> I3[Apply Policy]
    I3 --> E

    E --> J[Remediation History Updated]
    J --> K[Risk Dashboard Reflects Change]
```

### Screen Inventory

| Screen | Purpose | Entry From | Key Content | Actions | Exits To |
|--------|---------|------------|-------------|---------|----------|
| **Remediation Options** | Choose how to address a risk | Risk Detail recommendation | Cards for each option: Tokenize, Revoke Access, Delete Data, Apply Policy — each with description and affected item count | Select remediation type | Type-specific flow |
| **Tokenize — Configure** | Map columns to tokenization | Remediation Options | Column list, token format selector (per column or bulk), policy selector | Preview, Apply | Token Preview |
| **Tokenize — Preview** | See before/after of tokenization | Configure step | Side-by-side: original value → tokenized value for sample rows | Apply, Back, Edit | Apply result |
| **Revoke Access — Select** | Choose what access to revoke | Remediation Options | Table of current access grants: entity (user/service), permission level, data scope | Select grants to revoke, Select all | Impact Preview |
| **Revoke Access — Impact** | Understand consequences | Select step | List of affected entities, what they'll lose access to, downstream impact | Confirm, Back | Success |
| **Delete Data — Confirm** | Confirm destructive deletion | Remediation Options | Affected tables/columns, dependency warnings, typed confirmation ("delete") | Type confirmation + Delete, Cancel | Success |
| **Remediation Success** | Acknowledge risk reduction | Any remediation completion | Updated risk score (before → after), what was changed, audit trail entry | View Risk Dashboard, Remediate More | Risk Dashboard |
| **Remediation History** | Audit trail of all remediations | Sidebar nav or Risk Dashboard | Table: date, type, applied by, affected data, risk impact, status | Filter, Export | Remediation Detail |

### Edge Cases

| Category | Scenario | Design Response |
|----------|----------|-----------------|
| Destructive | Deleting data that's referenced elsewhere | Impact preview: "3 downstream pipelines reference this table. Deletion may break them." Block or require override |
| Destructive | Tokenizing production data | Preview step is mandatory. Show "This will modify production data" warning. Offer dry-run option |
| Rollback | Tokenization fails mid-process | Automatic rollback, error report: which columns succeeded/failed, retry failed only |
| Permission | User can view risks but not remediate | Remediation buttons show "Request approval" instead of direct action |
| Batch | 500+ columns need tokenization | Bulk policy application, progress bar, background processing with notification |
| Audit | Compliance requires who did what | Every remediation action creates an immutable audit log entry |
| Undo | User wants to reverse a remediation | Tokenization: detokenize option. Access revocation: re-grant option. Deletion: not reversible (warned upfront) |

---

## Flow 5: Tokenization Policy Management

**Goal**: Define and manage tokenization policies that map token configuration rules to regulations and business governance.

```mermaid
flowchart TD
    A([Start: Policies page]) --> B{Any policies exist?}
    B -->|No| C[Empty State: Create your first policy]
    B -->|Yes| D[Policy List View]

    C --> E[+ Create Policy]
    D --> E
    D --> F[Click existing policy]
    F --> G[Policy Detail View]

    E --> H[Step 1: Policy Basics]
    H --> H1[Name, description, regulation mapping]

    H1 --> I[Step 2: Classification Rules]
    I --> I1[Which data classifications does this cover? PCI / PII / PHI / Custom]

    I1 --> J[Step 3: Token Configuration]
    J --> J1[Token format per data type: FPE, hash, random, mask]
    J --> J2[Preservation rules: format-preserving, length, character set]

    J2 --> K[Step 4: Scope]
    K --> K1[Apply to: all matching data, specific connections, specific schemas]

    K1 --> L[Step 5: Review & Create]
    L --> M[Policy Created — Not Yet Applied]
    M --> G

    G --> N{Policy actions}
    N -->|Apply| O[Select target data → Apply Policy flow]
    N -->|Edit| P[Edit policy settings]
    N -->|Clone| Q[Duplicate as new policy]
    N -->|Disable| R[Disable policy — data remains tokenized]
    N -->|Delete| S[Confirm deletion — must detokenize first]
```

### Screen Inventory

| Screen | Purpose | Entry From | Key Content | Actions | Exits To |
|--------|---------|------------|-------------|---------|----------|
| **Policy List** | Browse all tokenization policies | Sidebar nav | Table: name, regulation, classifications covered, scope, status (active/draft/disabled), applied to (count) | + Create Policy, filter by regulation/status | Policy Detail, Create Policy |
| **Create Policy — Basics** | Name and map to regulation | Policy List | Form: name, description, regulation dropdown (GDPR, CCPA, HIPAA, PCI-DSS, Custom), priority level | Next, Cancel | Classification Rules |
| **Create Policy — Classifications** | Define which data types | Basics step | Checkbox groups: PCI (card number, CVV, expiry), PII (name, SSN, email, phone, address), PHI (diagnosis, prescription, MRN), Custom | Next, Back | Token Configuration |
| **Create Policy — Token Config** | Configure tokenization rules | Classifications step | Per data-type config: token format (FPE, hash, random, mask), preservation rules, reversibility setting | Next, Back | Scope |
| **Create Policy — Scope** | Define where policy applies | Token Config step | Radio: All matching data / Specific connections (multi-select) / Specific schemas (tree select) | Next, Back | Review |
| **Create Policy — Review** | Confirm before creation | Scope step | Summary of all settings, estimated affected columns count | Create Policy, Back | Policy Detail |
| **Policy Detail** | View and manage a policy | Policy List | Tabs: Overview (settings summary), Applied Data (tables/columns using this policy), Activity Log (changes, applications) | Apply, Edit, Clone, Disable, Delete | Apply flow, Edit flow |

### Edge Cases

| Category | Scenario | Design Response |
|----------|----------|-----------------|
| Empty state | No policies yet | "Create your first tokenization policy to start protecting sensitive data. Policies define how data is tokenized based on classification and regulation." |
| Conflict | Two policies cover same column with different rules | Warning: "Column X matches both 'GDPR PII Policy' and 'PCI Compliance Policy'. Higher priority policy will apply." Show priority order |
| Regulation | New regulation added (e.g., state-level privacy law) | Policy creation supports "Custom" regulation with free-text name |
| Edit | Editing an active policy | Warning: "This policy is applied to 234 columns. Changes will take effect on next scan." Option to apply immediately |
| Delete | Deleting policy with applied tokenization | Block: "Detokenize 234 columns before deleting this policy, or transfer them to another policy." |
| Clone | Common workflow — base new policy on existing | Pre-fill all fields from source, change name to "Copy of [original]" |
| Versioning | Need to track policy changes over time | Activity log tab shows all edits with diff view |

---

## Flow 6: Risk Dashboard & Monitoring

**Goal**: Provide at-a-glance risk visibility with trends, drill-downs, and alerts for security/compliance and executive stakeholders.

```mermaid
flowchart TD
    A([Start: Dashboard — Default landing page]) --> B[Risk Overview]

    B --> C[Overall Risk Score with Trend]
    B --> D[Protection Coverage: Protected vs Unprotected]
    B --> E[Compliance Status Cards per Regulation]
    B --> F[Top Risks Requiring Attention]
    B --> G[Recent Activity Feed]

    C --> H[Click score → Risk Detail breakdown]

    D --> I[Click coverage → Data Catalog filtered to unprotected]

    E --> J[Click regulation → Regulation Detail]
    J --> J1[Requirements checklist: met/unmet]
    J --> J2[Affected data inventory]
    J --> J3[Generate compliance report]

    F --> K[Click risk → Risk Detail with remediation options]

    G --> L[Activity: scans, classifications, remediations, policy changes]

    B --> M[Time Range Selector: 7d / 30d / 90d / Custom]
    M --> N[Dashboard refreshes with historical data]

    B --> O[Export / Schedule Report]
    O --> P[PDF report generation]
    O --> Q[Scheduled email reports: daily/weekly/monthly]
```

### Screen Inventory

| Screen | Purpose | Entry From | Key Content | Actions | Exits To |
|--------|---------|------------|-------------|---------|----------|
| **Risk Dashboard** | Default landing page, executive summary | Login, sidebar nav | Risk score (large), trend sparkline, protection coverage donut, compliance cards, top risks list, activity feed | Time range filter, Export report, Schedule report | All other sections via drill-down |
| **Protection Coverage** | Sensitive data protected vs. not | Dashboard drill-down | Donut chart: protected/unprotected/partially protected, breakdowns by category (PCI/PII/PHI), table of unprotected items | Filter, Remediate unprotected | Data Catalog, Remediation |
| **Regulation Detail** | Compliance status for one regulation | Dashboard compliance card | Requirements checklist with pass/fail, affected data, gap analysis, remediation suggestions | Generate report, Remediate gaps | Remediation, Report |
| **Reports** | Generate and schedule compliance reports | Dashboard export | Report templates: Executive Summary, Compliance Audit, Risk Trend, Remediation History | Generate now, Schedule recurring | PDF download, Email config |

### Key Metrics

| Metric | Visualization | Meaning |
|--------|---------------|---------|
| **Risk Score** | Large number (0-100) with trend arrow | Overall risk posture — lower is better |
| **Protection Coverage** | Donut chart (%) | % of sensitive data that has remediation applied |
| **Sensitive Data Volume** | Number + breakdown | Total sensitive columns discovered, by category |
| **Compliance Score** | Per-regulation gauge | % of regulation requirements met |
| **Remediation Velocity** | Line chart over time | How fast risks are being addressed |
| **Open Risks** | Count with severity breakdown | Risks identified but not yet remediated |

### Edge Cases

| Category | Scenario | Design Response |
|----------|----------|-----------------|
| Empty state | Brand new account, no data | Onboarding dashboard: Step 1: Connect data source, Step 2: Run first scan, Step 3: Review classifications → progress tracker |
| Staleness | Dashboard data is old | "Last updated 3 hours ago" timestamp + refresh button. Warning banner if > 24 hours |
| Alert | Risk score jumped significantly | Alert banner at top: "Risk score increased by 23 points since yesterday due to 4 new unprotected PII columns" |
| Executive | CEO wants one-page summary | Export → Executive Summary PDF: risk score, coverage %, top 3 risks, compliance status, 30-day trend |
| Trend | Risk going up over time | Trend line turns red with callout: "Risk trending up — 12 new sensitive columns discovered, 0 remediated this week" |
| Scale | Enterprise with 50+ connections | Dashboard aggregates across all connections, with connection-level filter to drill down |

---

## Complete Screen Map

### Primary Navigation (Sidebar)

```
SIDEBAR
├── Dashboard                    ← Risk Dashboard (default landing)
│
├── GROUP: Discovery
│   ├── Connections              ← Data source management
│   ├── Data Catalog             ← Browse scanned data + classifications
│   └── Scans                    ← Scan history + trigger new scans
│
├── GROUP: Protection
│   ├── Policies                 ← Tokenization policy management
│   └── Remediation              ← Remediation history + actions
│
├── GROUP: Compliance
│   ├── Regulations              ← Regulation mapping + status
│   └── Reports                  ← Generate/schedule compliance reports
│
├── ─── spacer ───
│
└── FOOTER
    ├── Settings                 ← Account, team, integrations
    └── [Collapse toggle]
```

### Cross-Flow Navigation

| From | To | Trigger |
|------|-----|---------|
| Dashboard → Connections | "Connect your first data source" CTA | Empty state |
| Dashboard → Data Catalog | Click protection coverage | Drill-down |
| Dashboard → Risk Detail | Click risk score or top risk | Drill-down |
| Dashboard → Remediation | Click "Remediate" on a risk | Action |
| Data Catalog → Table Detail | Click table row | Navigation |
| Table Detail → Remediation | "Tokenize" / "Revoke Access" on classified column | Action |
| Risk Detail → Remediation | Click recommendation | Action |
| Remediation → Dashboard | Completion success screen | Return |
| Policy List → Remediation | "Apply Policy" on policy detail | Action |
| Connection Detail → Data Catalog | Click schema/table | Navigation |

---

## Status Token Mapping

| Flow State | Token | Usage |
|------------|-------|-------|
| Connection active | `--sds-status-success-*` | Healthy connection badge |
| Connection error | `--sds-status-error-*` | Disconnected/failed badge |
| Scan running | `--sds-status-info-*` | In-progress scan indicator |
| Classification pending review | `--sds-status-warning-*` | Needs human confirmation |
| Classification confirmed | `--sds-status-success-*` | Accepted classification |
| Risk: Low (0-25) | `--sds-status-success-*` | Green risk indicator |
| Risk: Moderate (26-50) | `--sds-status-warning-*` | Yellow risk indicator |
| Risk: High (51-75) | `--sds-status-error-*` | Orange/red risk indicator |
| Risk: Critical (76-100) | `--sds-status-error-*` | Red risk indicator |
| Remediation applied | `--sds-status-success-*` | Protected/remediated badge |
| Remediation failed | `--sds-status-error-*` | Failed remediation badge |
| Policy active | `--sds-status-success-*` | Active policy badge |
| Policy draft | `--sds-status-neutral-*` | Not yet applied |
| Policy disabled | `--sds-status-warning-*` | Paused policy |
| Regulation compliant | `--sds-status-success-*` | Requirements met |
| Regulation non-compliant | `--sds-status-error-*` | Requirements not met |
| Regulation partial | `--sds-status-warning-*` | Some requirements unmet |

---

## Next Steps

- **Navigation structure**: Use `/information-architect` to validate the sidebar grouping and page hierarchy
- **Screen sketches**: Use `/wireframe-agent` to sketch key screens (Dashboard, Data Catalog, Policy Detail)
- **Page specs**: Use `/page-designer` to create detailed layout specs with Software DS tokens
- **Feature design**: Use `/product-designer` for deep dives on specific features (e.g., classification review UX, risk scoring model)
- **Copy**: Use `/content-copy-designer` for empty states, error messages, and status labels
