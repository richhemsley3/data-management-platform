# DMP Data Security Platform — Product Context

## Product Overview

**Product**: Standalone data security SaaS that helps companies discover, classify, and secure sensitive data across their data infrastructure.

**The Five-Stage Loop**:
1. **Discover** — Connect to data platforms, scan metadata, build a data catalog
2. **Classify** — Identify sensitive data (PCI, PII, PHI) via guided semi-automatic classification (machine suggests, human confirms/overrides)
3. **Assess** — Analyze risk by evaluating machine/human access patterns, regulation requirements, and protection gaps
4. **Remediate** — Apply protection: tokenization, data masking, access revocation, data deletion, policy enforcement
5. **Track** — Monitor risk score reduction over time, generate compliance reports, alert on regressions

**Supported Data Platforms**: Snowflake, AWS (S3, RDS, Redshift), Databricks, BigQuery (extensible)

**Classification Model**: Guided semi-automatic — the system suggests classifications based on pattern matching and context analysis. Users review, confirm, override, or reject. This human-in-the-loop approach prioritizes accuracy over speed, which is a key differentiator.

## Users

**Primary Users**:
- **Data engineers**: Manage connections, configure scans, monitor infrastructure health. Expect dense, technical UIs. Connection-centric, pipeline-aware, SQL-native.
- **Data governance teams**: Define classification policies, review classifications, manage access rules, track compliance. Policy-focused, classification-driven, compliance-oriented.

**Secondary Users (informed stakeholders)**:
- **Security/compliance**: Consume risk dashboards, audit reports. Need clear severity indicators.
- **Executives**: View high-level risk scores and trends. Need one-page summaries and improvement metrics.

## Competitive Positioning

### Three Market Segments

**Data Security Tools** (tokenization, encryption, masking): Protegrity, Thales CipherTrust, Baffle, Skyflow, comforte AG. These tools excel at protection but require users to already know what data needs protecting. They have no discovery or classification.

**DSPM Platforms** (data security posture management): Cyera ($9B), Sentra, Varonis, Wiz (Google, $32B), BigID, Securiti (Veeam, $1.7B). Strong on discovery and classification but weak on integrated remediation. Most route to tickets rather than executing protection directly.

**Data Governance Services**: Collibra, Alation, Atlan, Immuta, Privacera, Snowflake Horizon, Databricks Unity Catalog. Handle cataloging and lineage but stop short of security-specific remediation.

### Five Market Gaps We Target

1. **Guided classification** — Every competitor uses fully automated classification. Users report accuracy issues. Our human-in-the-loop approach is unaddressed.
2. **Unified risk-to-remediation loop** — No vendor provides the full discover-classify-assess-remediate-track cycle in one product.
3. **Risk reduction tracking** — No competitor offers a risk score that decreases as remediation is applied, with dashboards showing improvement over time.
4. **Data engineer UX** — DSPM tools are built for security teams. Governance tools are built for stewards. Nobody builds for data engineers.
5. **Integrated remediation** — The market forces users to stitch together discovery + governance + protection from different vendors.

### Key Competitors by Feature Area

| Feature Area | Closest Competitors | Their Weakness |
|-------------|-------------------|----------------|
| Discovery & scanning | Cyera, BigID, Wiz | No guided classification |
| Classification | BigID (broadest), Cyera (fastest) | Fully automated only, accuracy issues |
| Risk assessment | Wiz (attack paths), Sentra (attack paths) | No unified risk score tracking |
| Remediation | Varonis (auto-remediation, unique) | Limited to on-prem/Microsoft, no tokenization |
| Access governance | Immuta, Privacera | No integrated discovery or risk scoring |
| Dashboard & monitoring | Varonis (4.9/5 UX), Wiz (security graph) | Security-team UX, not data-engineer UX |

## Terminology

| Internal / Technical | User-Facing Label | Description |
|---------------------|-------------------|-------------|
| Data source | Connection | External platform (Snowflake, AWS, etc.) linked to the product |
| Metadata ingestion | Scan | Process of reading schemas, tables, columns from a connection |
| Sensitivity label | Classification | PCI, PII, PHI, or custom category assigned to a column |
| Confidence score | Confidence | How certain the system is about a suggested classification (%) |
| Risk metric | Risk Score | 0-100 score reflecting unprotected sensitive data exposure |
| Protection action | Remediation | Tokenization, masking, access revocation, or deletion applied to data |
| Token format rule | Tokenization Policy | Reusable rule defining how data should be tokenized (format, scope, regulation) |
| Data inventory | Data Catalog | Browsable inventory of all scanned schemas, tables, columns |
| Regulatory mapping | Regulation | GDPR, HIPAA, PCI DSS, CCPA — mapped to classified data |
| Coverage metric | Protection Coverage | Percentage of classified sensitive data that has been remediated |

## Navigation Structure

```
SIDEBAR
├── Dashboard                    ← Risk Dashboard (default landing)
├── GROUP: Discovery
│   ├── Connections              ← Data source management
│   ├── Data Catalog             ← Browse scanned data + classifications
│   └── Scans                   ← Scan history + trigger new scans
├── GROUP: Protection
│   ├── Policies                 ← Tokenization policy management
│   └── Remediation              ← Remediation history + actions
├── GROUP: Compliance
│   ├── Regulations              ← Regulation mapping + status
│   └── Reports                  ← Generate/schedule compliance reports
└── FOOTER
    ├── Settings                 ← Account, team, integrations
    └── [Collapse toggle]
```

## UX Flow Summaries

**Flow 1 — Connections**: Multi-step wizard (select platform → configure credentials → test → select schemas → review & save). Success redirects to Connection Detail with option to auto-trigger first scan.

**Flow 2 — Scanning & Classification**: Triggered from Connection Detail or Data Catalog. Shows scan progress, then results summary. Users navigate to Table Detail to review column-level classifications (accept, override, reject). Bulk actions available.

**Flow 3 — Risk Assessment**: Automatically recalculates after classification changes. Risk Dashboard shows overall score (0-100), protection coverage donut, compliance cards per regulation, top unprotected risks table, and 30-day trend. Drill-down to risk detail with remediation recommendations.

**Flow 4 — Remediation**: Entry from risk detail, table detail, or dashboard. Four action types: tokenize, revoke access, delete data, apply policy. Each shows preview → confirmation → execution → result with rollback option for tokenization.

**Flow 5 — Tokenization Policies**: CRUD for reusable tokenization rules. Create wizard: name → select classifications → choose token format → set scope → review. Policies applied from Policy Detail or during remediation.

**Flow 6 — Dashboard & Monitoring**: Default landing page. Four sections: score + trend, protection coverage, compliance status, activity feed. Drill-downs to every other area. Alert banner for risk increases.

### Cross-Flow Navigation

| From | To | Trigger |
|------|-----|---------|
| Dashboard | Connections | Empty state CTA |
| Dashboard | Data Catalog | Click protection coverage |
| Dashboard | Remediation | Click "Remediate" on a risk |
| Data Catalog → Table Detail | Remediation | "Tokenize" / "Revoke Access" on column |
| Risk Detail | Remediation | Click recommendation |
| Remediation completion | Dashboard | Return after success |
| Policy Detail | Remediation | "Apply Policy" action |
| Connection Detail | Data Catalog | Click schema/table |

## Status Token Mapping

| State | Token | Usage |
|-------|-------|-------|
| Connection active | `--sds-status-success-*` | Healthy connection badge |
| Connection error | `--sds-status-error-*` | Disconnected/failed badge |
| Scan running | `--sds-status-info-*` | In-progress indicator |
| Classification pending | `--sds-status-warning-*` | Needs human confirmation |
| Classification confirmed | `--sds-status-success-*` | Accepted classification |
| Risk: Low (0-25) | `--sds-status-success-*` | Green risk indicator |
| Risk: Moderate (26-50) | `--sds-status-warning-*` | Yellow risk indicator |
| Risk: High (51-75) | `--sds-status-error-*` | Orange/red risk indicator |
| Risk: Critical (76-100) | `--sds-status-error-*` | Red risk indicator |
| Remediation applied | `--sds-status-success-*` | Protected badge |
| Remediation failed | `--sds-status-error-*` | Failed badge |
| Policy active | `--sds-status-success-*` | Active policy badge |
| Policy draft | `--sds-status-neutral-*` | Not yet applied |
| Policy disabled | `--sds-status-warning-*` | Paused policy |
| Regulation compliant | `--sds-status-success-*` | Requirements met |
| Regulation non-compliant | `--sds-status-error-*` | Requirements not met |
| Regulation partial | `--sds-status-warning-*` | Some requirements unmet |

## User Personas (Sketches)

**Persona 1: Jordan — Senior Data Engineer**
Manages data infrastructure across Snowflake and AWS. Responsible for connecting platforms, ensuring scans run, and troubleshooting failures. Cares about: connection health, scan reliability, pipeline impact. Doesn't want to learn "security tool" UX — expects infrastructure-style dashboards.

**Persona 2: Priya — Data Governance Analyst**
Defines data classification policies and reviews machine-suggested classifications. Tracks compliance against HIPAA and GDPR. Cares about: classification accuracy, regulation coverage, audit trails. Wants clear workflow for reviewing classifications — not a firehose of alerts.

**Persona 3: Marcus — VP of Security (Executive Stakeholder)**
Consumes risk dashboards and compliance reports. Reports to the board on data security posture. Cares about: risk score trends, protection coverage %, compliance status. Needs one-page summaries, not operational detail.
