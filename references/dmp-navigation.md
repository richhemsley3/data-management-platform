# DMP Navigation Structure

## Sidebar Hierarchy

```
SIDEBAR
├── Dashboard                    ← Default landing, risk overview
│
├── GROUP: Discovery
│   ├── Connections              ← Data source CRUD, connection health
│   ├── Data Catalog             ← Browse schemas/tables/columns + classifications
│   └── Scans                   ← Scan history, trigger scans, view results
│
├── GROUP: Protection
│   ├── Policies                 ← Tokenization policy CRUD
│   └── Remediation              ← Remediation history + execute actions
│
├── GROUP: Compliance
│   ├── Regulations              ← GDPR, HIPAA, PCI DSS mapping + status
│   └── Reports                  ← Generate/schedule compliance reports
│
└── FOOTER
    ├── Settings                 ← Account, team, integrations
    └── [Collapse toggle]
```

## Grouping Rationale

- **Discovery**: Upstream activities — connecting to data, scanning it, browsing what was found. This is where data engineers spend most time.
- **Protection**: Active security actions — defining policies and applying remediation. Shared between data engineers (execution) and governance (policy definition).
- **Compliance**: Reporting and regulation tracking. Primarily consumed by governance teams and executives.

## Page Hierarchy

| Page | Parent | Tabs/Sub-views |
|------|--------|----------------|
| Dashboard | — | Metrics, Compliance Cards, Activity Feed |
| Connections | Discovery | List → Detail (Overview, Schemas, Scan History, Settings) |
| Data Catalog | Discovery | List → Schema → Table Detail (Columns, Classifications, Access) |
| Scans | Discovery | History list, Scan Detail (Results, Errors) |
| Policies | Protection | List → Detail (Overview, Applied Data, Activity Log) |
| Remediation | Protection | History list, Action Detail (Preview, Confirmation, Result) |
| Regulations | Compliance | List → Regulation Detail (Requirements, Coverage, Gaps) |
| Reports | Compliance | List → Report Builder → Generated Report |
| Settings | Footer | Account, Team, Integrations, Notifications |
