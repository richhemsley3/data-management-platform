# Market Research: Data Security & Management Landscape

**Date:** March 2026
**Method:** Competitive analysis — web research, analyst reports, vendor documentation, user reviews
**Scope:** Data security tools (tokenization/encryption/masking), DSPM platforms, data management services

---

## Executive Summary

The data security market is converging rapidly. Three historically separate categories — data protection tools, DSPM, and data governance — are colliding as vendors race to offer unified platforms. Key signals:

- **Massive consolidation**: Google acquired Wiz ($32B), Veeam acquired Securiti ($1.7B), Rubrik acquired Laminar, Palo Alto acquired Dig Security, Commvault acquired Satori, Proofpoint acquired Normalyze — all within 18 months
- **AI is the catalyst**: GenAI adoption is forcing organizations to understand what data they have, who/what can access it, and whether it's safe for AI consumption. 60% of 2025 DSPM deployments included GenAI governance features
- **The DSPM market** is valued at ~$2B (2025), projected to reach $10B by 2030
- **No single vendor** covers discovery + classification + access governance + tokenization/encryption + remediation + risk scoring in one product with strong UX — this is the gap our product targets

---

## 1. Data Security Tools (Tokenization, Encryption, Masking)

### Landscape Overview

| Vendor | Primary Strength | Pricing Entry | Best For |
|--------|-----------------|---------------|----------|
| **Protegrity** | Vaultless tokenization, AI pipeline security | ~$15K+/yr | Enterprises with AI/analytics workloads |
| **OpenText Voltage** | Stateless FPE, mainframe support | ~$500/mo | Large enterprises with legacy + cloud |
| **Thales CipherTrust** | Broadest protection methods, HSM integration | Free Community Ed. | Regulated industries, multi-cloud |
| **Informatica** | Data masking within full data mgmt suite | ~$700K/yr (enterprise) | Existing Informatica customers |
| **comforte AG (TAMUNIO)** | Quantum-resistant tokenization, TEE sovereignty | Custom | Payments, post-quantum preparation |
| **TokenEx** | Processor-agnostic payment tokenization | $1,000/mo | E-commerce, multi-processor merchants |
| **Baffle** | No-code transparent encryption | Custom | Cloud-native DBs, rapid deployment |
| **Skyflow** | API-first privacy vault, polymorphic encryption | Custom | Fintech, AI/LLM builders |
| **VGS** | Zero Data architecture, all 4 card networks | $1,000/mo | Payment-centric fintechs |

### Key Players — Detail

#### Protegrity
- **Services:** Vaultless tokenization, format-preserving encryption, data masking, anonymization, pseudonymization, data discovery/classification, centralized policy engine
- **Differentiator:** Protectors run inside data platforms (Snowflake, BigQuery, Redshift) rather than routing data externally. November 2025 "AI Team Edition" provides Python-native security for agentic AI workflows
- **UX:** Clean dashboards, guided policy setup, minimal training needed. Some integration complexity with legacy systems
- **Integrations:** AWS, Azure, GCP, Snowflake, BigQuery, Redshift, Hadoop, SAP

#### OpenText Voltage SecureData
- **Services:** NIST-approved AES FF1 FPE, stateless tokenization, format-preserving hash, data masking, stateless key management
- **Differentiator:** Stateless key management — keys derived on demand, no storage/replication. Quantum-ready encryption. Deep mainframe (IBM z/OS) support
- **UX:** Stable and easy to administrate. Cloud-native functionality lags on-prem. Initial setup requires specialized expertise
- **Integrations:** ArcSight, AWS, Azure, Hadoop, Snowflake, Teradata, SAP, IBM z/OS

#### Thales CipherTrust
- **Services:** Vaultless/vaulted tokenization, transparent encryption (file system), database column/row encryption, dynamic/static masking, centralized key management (BYOK, HYOK), Data Protection Gateway for RESTful APIs
- **Differentiator:** Broadest range of protection methods in a single platform. FIPS 140-3 Level 3 HSM integration. Free Community Edition. Post-quantum crypto-agility roadmap
- **UX:** Single UI for multi-cloud key management. DPG deploys as Kubernetes-native container with no code changes. Learning curve for full platform
- **Integrations:** AWS, Azure, GCP, Thales Luna HSMs, Kubernetes, REST APIs

#### Baffle
- **Services:** No-code field-level encryption (AES-256), FPE, tokenization, masking, RBAC, BYOK support, multi-tenant isolation
- **Differentiator:** True no-code — protection applied transparently with zero application changes. Data protected even from database admins. Supports vector databases for GenAI workloads. Deploys in hours
- **UX:** The no-code approach is the primary differentiator. Existing queries and analytics continue to work through transparent proxy
- **Integrations:** AWS, Azure, GCP, PostgreSQL, MySQL, Snowflake, vector databases

#### Skyflow
- **Services:** Polymorphic encryption, tokenization, masking, redaction, PII/PCI/PHI vaulting, fine-grained access control, LLM data protection
- **Differentiator:** API-first data privacy vault — sensitive data isolated in purpose-built vault. Patented polymorphic encryption supports operations on encrypted data without decryption. Strong AI-era positioning with LLM data redaction
- **UX:** Developer-first with client/server SDKs, clean REST interface, 70+ pre-built connectors. Every action logged and auditable
- **Integrations:** PostgreSQL, MySQL, MongoDB, Snowflake, Databricks, BigQuery, Redshift, AWS, Azure

#### comforte AG (TAMUNIO)
- **Services:** Tokenization, FPE, AI-powered discovery/classification, masking, centralized key management, unstructured data protection
- **Differentiator:** Quantum-resistant pseudonymization via proprietary FAST algorithm. Data Sovereignty Zones using hardware-isolated TEEs with confidential computing. Strong payments focus (ACI partnership for PCI DSS v4.0)
- **UX:** Cloud-native, fully API-driven, auto-scaling. Centralized monitoring and SIEM integration
- **Integrations:** Entrust nShield HSMs, ACI Worldwide, SIEM systems, cross-cloud

### UX Comparison — Data Security Tools

| Dimension | Protegrity | Thales | Baffle | Skyflow |
|-----------|-----------|--------|--------|---------|
| Setup complexity | Moderate | High (full), Low (DPG) | Very low | Low |
| Code changes required | SDK/API calls | Varies by method | None | API calls |
| Dashboard quality | High | Moderate | Basic | High |
| Developer experience | Good | Good (API gateway) | Excellent | Excellent |
| Time to deploy | Weeks | Days–Weeks | Hours | Weeks |

### Implications for Our Product

**Opportunity:** These tools excel at protection (tokenization, encryption, masking) but are weak on discovery, classification, and risk assessment. They require users to already know what data needs protecting. Our product fills the upstream gap — discovering sensitive data, classifying it, assessing risk, and then routing to the appropriate protection method.

**Integration play:** Rather than building tokenization/encryption from scratch, partner with or integrate these tools as remediation backends. Protegrity (cloud-native tokenization), Baffle (no-code encryption), or Skyflow (vault-based) could serve as remediation actions triggered by our risk engine.

---

## 2. DSPM Platforms

### Market Context

- Market size: ~$2B (2025), projected $10B by 2030 (CAGR 25-38%)
- Gartner projects adoption past 20% by 2026
- Major consolidation: most pure-play DSPM startups have been acquired by platform vendors
- AI data security (AI-SPM) is now a standard module

### Landscape Overview

| Vendor | Status | Strongest In | Cloud Coverage |
|--------|--------|-------------|----------------|
| **Cyera** | Independent ($9B valuation) | AI-native classification, GenAI governance | AWS/Azure/GCP/SaaS/On-prem |
| **Normalyze** | → Proofpoint (2024) | Human risk + data risk correlation | Multi-cloud/SaaS/On-prem |
| **Laminar** | → Rubrik (2023) | Backup + DSPM unification | AWS/Azure/GCP/Snowflake/M365 |
| **Dig Security** | → Palo Alto (2023) | Code-to-cloud attack context | AWS/Azure/GCP |
| **Sentra** | Independent | Attack path analysis, data lineage | IaaS/PaaS/SaaS/On-prem |
| **Securiti** | → Veeam ($1.7B, 2025) | Privacy-by-design, AI governance | 200+ platforms |
| **BigID** | Independent | Classification depth, 100+ languages | Broadest source coverage |
| **Wiz** | → Google ($32B, 2026) | Security graph, attack paths | AWS/Azure/GCP |
| **Varonis** | Public (VRNS) | Automated remediation, MDDR | M365/Azure/Salesforce/Snowflake |
| **OneTrust** | Independent | Privacy/GRC extension into DSPM | 200+ connectors |

### Key Players — Detail

#### Cyera — The Pure-Play Leader
- **Capabilities:** AI-native discovery/classification (95% precision), agentless scanning, real-time policy enforcement, Omni DLP, DSPM for AI (prompt monitoring, response data leakage detection)
- **Differentiator:** Purpose-built AI-native platform housing DSPM + DLP + DAG + GenAI governance. Fastest-growing pure-play data security company. Partnered with Cohesity for integrated DSPM
- **UX:** Agentless deployment with rapid time-to-value. API and CI/CD integrations supporting policy-as-code. Unified console for discovery, risk, and remediation
- **Funding:** $400M at $9B valuation (Blackstone, January 2026). Previously $540M Series E at $6B (June 2025)
- **Classification:** DataDNA technology combines pattern matching with IAM/network policy context. 100+ data types

#### Sentra — The Independent Contender
- **Capabilities:** Unified DSPM + DAG + DDR. ML-powered BERT-based classification. DataTreks: interactive maps tracking sensitive data movement through ETL, migrations, AI pipelines. Custom classifiers. On-prem scanners. 100+ file format support
- **Differentiator:** Attack path analysis combining vulnerability, permission, and data sensitivity to model breach routes. DataTreks data lineage visualization is unique. Petabyte-scale continuous discovery
- **UX:** Agentless onboarding with zero production impact. 20+ prebuilt integrations (Datadog, Trellix, Jira). Automated Jira masking workflows
- **Classification:** BERT-based LLM classification for structured, unstructured, audio, and video content

#### Varonis — The Remediation Pioneer
- **Capabilities:** Auto-discovers, maps, monitors, and protects data. Autonomous removal of stale permissions. MDDR: 24/7 managed service with 30-minute ransomware SLA. DSPM + classification + DAG + DDR + DLP + AI security + identity protection
- **Differentiator:** The only DSPM that automatically remediates risk, not just identifies it. MDDR managed service is unique. First data security platform with FedRAMP authorization. First to support MCP for AI orchestration
- **UX:** 4.9/5 on Gartner Peer Insights (highest rated). Microsoft Purview DSPM integration. MCP Server enabling AI-powered orchestration
- **Recent:** Acquired AllTrue.ai ($150M, early 2026) for AI Trust/Risk/Security Management

#### Wiz (now Google Cloud) — The Cloud Security Graph
- **Capabilities:** Agentless discovery with built-in/custom classifiers. Graph-based attack path analysis. Data Access Governance combining sensitivity with CIEM. AI & data pipeline security. FedRAMP moderate authorization
- **Differentiator:** Only DSPM built on a cloud-native security graph connecting data risk to identity, misconfigurations, and real attack paths. Unified CNAPP + DSPM
- **UX:** Single security graph connecting code, cloud, and runtime. Immediate actionability through attack path context
- **Pricing:** Semi-transparent — Wiz Essential $24K/yr (100 workloads), Wiz Advanced $38K/yr (100 workloads)

#### BigID — The Classification Engine
- **Capabilities:** Discovery across hundreds of sources. Patented AI classification with thousands of pre-trained classifiers in 100+ languages. Natural language classifiers for business users. Identity-based classification mapping data to individuals. Agentic AI-guided remediation
- **Differentiator:** Most mature and comprehensive discovery/classification engine. Bridges DSPM and privacy governance. Enterprise-grade scale
- **UX:** Natural language classifier creation for business users. Microsoft Purview integration. Some user reviews note occasional classification inaccuracies
- **Pricing:** Reported as the most expensive DSPM option

#### Securiti (now Veeam) — The Privacy Pioneer
- **Capabilities:** Data Command Center with unified graph. Discovery across 200+ platforms. Data lineage, access intelligence, AI risk analysis. Automated DDR. PrivacyOps connecting data mapping, AI model inventory, and policy automation
- **Differentiator:** Top-rated DSPM by GigaOm (5/5 technical rating, two consecutive years). Strongest privacy-by-design orientation. Now combined with Veeam's 550,000+ customer base
- **UX:** Hybrid deployment (SaaS + customer environment processing). Extensive out-of-the-box integrations. Centralized command center UI

### UX Comparison — DSPM Platforms

| Dimension | Cyera | Sentra | Varonis | Wiz | BigID |
|-----------|-------|--------|---------|-----|-------|
| Time to value | Days | Days | Weeks | Days | Weeks |
| Dashboard clarity | High | High | High | Very high | Moderate |
| Remediation depth | Policy enforcement | Jira workflows | Automated actions | Attack path context | Ticketing-based |
| Non-technical user access | Moderate | Moderate | Good | Limited | Good (natural lang.) |
| Data lineage visualization | Basic | Excellent (DataTreks) | Moderate | Graph-based | Basic |

### Implications for Our Product

**Opportunity:** DSPM platforms are strong on discovery and classification but often weak on:
1. **Guided classification** — Most rely on fully automated classification with limited human-in-the-loop refinement. Our semi-automatic, guided approach (machine suggests, human confirms/adjusts) addresses the accuracy gap users report
2. **Tokenization/encryption as remediation** — DSPM tools alert on risk but rarely execute protection. They route to tickets or external tools. Direct remediation (tokenize, mask, revoke access) is a differentiator only Varonis partially addresses
3. **Risk scoring with business context** — Most provide severity ratings but not a unified risk score that tracks reduction over time. Our risk assessment → score → remediation → score improvement loop is distinctive
4. **UX for non-security users** — Data engineers and governance teams (our primary users) are underserved. Most DSPM tools are built for security teams

**Competitive positioning:** We sit between DSPM (discovery/classification) and data protection tools (tokenization/encryption), with unique strengths in guided classification, integrated remediation, and risk-reduction tracking.

---

## 3. Data Management & Governance Services

### Landscape Overview

| Platform | Primary Focus | Deployment Speed | Pricing Range | Best For |
|----------|--------------|-----------------|---------------|----------|
| **Collibra** | Enterprise governance & compliance | 3–9 months | ~$170K+/yr | Regulated enterprises |
| **Alation** | Data catalog & discovery | ~5 months | ~$198K+/yr | Data democratization |
| **Atlan** | Active metadata & modern governance | 4–6 weeks | Custom (lower TCO) | Modern data stack teams |
| **Informatica IDMC** | Full-spectrum data management | Varies | $50K–$2M+/yr | Complex hybrid estates |
| **Immuta** | Data access governance | Weeks | ~$60K+/yr | Strict access control |
| **Privacera** | Multi-cloud access governance + AI | Weeks | Custom | Multi-cloud + GenAI governance |
| **Monte Carlo** | Data observability | Days–weeks | $5K–$15K/mo | Data quality monitoring |
| **Satori** | Data access security (proxy) | Days | ~$95K/yr avg | Self-service secure data access |
| **Snowflake Horizon** | Native platform governance | Immediate | Included | Snowflake-centric environments |
| **Databricks Unity Catalog** | Unified data + AI governance | Immediate | Included | Lakehouse-centric environments |

### Key Players — Detail

#### Collibra — The Enterprise Standard
- **Services:** Data cataloging, governance workflows, lineage, quality, AI governance, semantic layer, unstructured data governance, policy management, business glossary
- **Differentiator:** Most comprehensive enterprise governance platform. Deep, policy-driven governance with automated validation. 100+ native integrations. "Collibra Everywhere" browser extension
- **UX:** Steep learning curve. Best suited for organizations with dedicated governance teams. 87% satisfaction (259 reviews)
- **Pricing:** ~$170K+/yr for core platform. Lineage, quality, and connectors priced separately. Deployment takes months to years

#### Alation — The Search-Driven Catalog
- **Services:** Data catalog, governance, lineage (column-level), data quality (Open Data Quality Framework), SQL editor (Compose), ALLIE AI curation, agentic workflows
- **Differentiator:** Pioneered the data catalog market. Natural language search. Collaborative, search-driven approach. 250+ enterprise customers
- **UX:** Intuitive, search-driven interface for analysts/BI developers. "Alation Anywhere" brings catalog context into daily tools. Moderate learning curve
- **Pricing:** ~$198K+/yr (25 Creator users min). Mid-sized enterprise TCO ~$413K. ROI at ~21 months

#### Atlan — The Modern Challenger
- **Services:** Active metadata management, automated lineage (column-level), intelligent search, governance/compliance automation, data quality monitoring, AI governance, open API
- **Differentiator:** Active metadata engine parses real query activity continuously, eliminating manual catalog curation. Deploys to production in 4–6 weeks vs. 3–9 months for legacy. Gartner MQ Leader 2026
- **UX:** Consumer-grade, collaborative UX. Described as "the type of tool people want to use." Amazon-like search/filtering. Low learning curve. HelloFresh grew from 10% to 500+ monthly active users in 3 months
- **Pricing:** Custom; positioned as more cost-effective than Collibra/Alation

#### Immuta — The Access Governor
- **Services:** Data access governance, policy management (ABAC/RBAC/purpose-based), dynamic masking, discovery/classification, compliance frameworks, real-time monitoring, data marketplace, GenAI security
- **Differentiator:** Purpose-built for access governance at scale. Claims 100x faster data access, 75x fewer policies. Natural language policy authoring. Two-time Snowflake Data Security Partner of the Year
- **UX:** No-code policy creation. Cross-platform unified policy management. Pre-built compliance templates (HIPAA, GDPR, CCPA)
- **Pricing:** ~$5,000/mo per user

#### Privacera — The Apache Ranger Creators
- **Services:** Sensitive data discovery/classification, fine-grained access control (ABAC/TBAC/RBAC), masking, compliance automation, auditing, AI governance (PAIG)
- **Differentiator:** Founded by creators of Apache Ranger and Apache Atlas. PAIG is industry's first AI data security governance with real-time vector DB query filtering. Highest scores in GigaOm Radar for DAG 2025
- **UX:** Centralized policy management across 20+ cloud sources. Integration with existing catalogs and IAM systems
- **Pricing:** Custom enterprise; free trial on AWS Marketplace

#### Snowflake Horizon & Databricks Unity Catalog — The Platform Natives
- **Snowflake Horizon:** Governance built into the data platform — dynamic masking, row access policies, tag-based masking, AI-generated descriptions. Limitation: governance stops at Snowflake's boundary
- **Databricks Unity Catalog:** Centralized catalog with fine-grained access control, lineage, quality, metrics, AI governance. Open-sourced. Full Iceberg support. IDC MarketScape Leader 2025-2026. Limitation: strongest within Databricks ecosystem

### UX Comparison — Data Governance

| Dimension | Collibra | Alation | Atlan | Immuta | Privacera |
|-----------|---------|---------|-------|--------|-----------|
| Learning curve | Steep | Moderate | Low | Moderate | Moderate |
| Time to production | 3–9 months | ~5 months | 4–6 weeks | Weeks | Weeks |
| Target persona | Governance officers | Analysts, BI | Data engineers | Security, governance | Security, governance |
| UX satisfaction | 87% | 88% | Highest (Gartner) | Good | Good |
| Access governance depth | Moderate | Basic | Basic | Deep | Deep |

### Implications for Our Product

**Opportunity:** Data governance platforms handle cataloging and lineage but stop short of security-specific remediation. They know where data lives but can't protect it. Our product complements these platforms by:
1. **Connecting to their catalogs** — import existing classifications from Collibra/Alation/Atlan rather than re-discovering
2. **Adding security-specific risk assessment** — governance tools assess policy compliance, not security risk from machine/human access patterns
3. **Executing protection** — governance tools can flag sensitive data; we can tokenize, mask, or revoke access

**Integration strategy:** Position as a security overlay that reads from governance catalogs and writes remediation actions back. Key integrations: Snowflake Horizon, Databricks Unity Catalog, Immuta, Privacera.

---

## 4. Cross-Segment Analysis

### Feature Comparison: Our Product vs. Market

| Capability | Data Protection Tools | DSPM Platforms | Data Governance | **Our Product** |
|-----------|----------------------|---------------|-----------------|-----------------|
| Data discovery | ❌ | ✅ | ✅ | ✅ |
| Automated classification | ❌ | ✅ | ⚠️ Metadata-level | ✅ Guided semi-auto |
| Risk assessment | ❌ | ⚠️ Severity ratings | ❌ | ✅ Unified risk score |
| Tokenization | ✅ | ❌ | ❌ | ✅ |
| Encryption | ✅ | ❌ | ❌ | ✅ |
| Data masking | ✅ | ⚠️ Some | ⚠️ Via integration | ✅ |
| Access revocation | ❌ | ⚠️ Varonis only | ⚠️ Immuta/Privacera | ✅ |
| Risk score tracking | ❌ | ❌ | ❌ | ✅ |
| Remediation execution | ❌ | ⚠️ Alerting only | ❌ | ✅ Direct actions |
| Multi-platform connectors | ⚠️ Limited | ✅ | ✅ | ✅ Snowflake/AWS/Databricks |

### Market Gaps — Our Opportunities

1. **Guided classification with human refinement** — Every DSPM tool uses fully automated classification. Users report accuracy issues (especially BigID). Our guided semi-automatic approach where machine suggests and human confirms is unaddressed in market

2. **Unified risk-to-remediation loop** — No vendor provides a continuous cycle of: discover → classify → assess risk → remediate → measure improvement. DSPM tools stop at discovery/alerting. Protection tools only execute if you tell them what to protect

3. **Risk reduction tracking** — No competitor offers a risk score that decreases as remediation actions are taken, with dashboards showing improvement over time. This is a unique value proposition for executive stakeholders

4. **Data engineer-friendly UX** — DSPM tools target security teams. Governance tools target stewards. Our primary users (data engineers, governance teams) need a different UX that speaks their language — connection-centric, pipeline-aware, SQL-native

5. **Integrated remediation** — The market forces users to stitch together DSPM (discovery) + governance (access) + protection (tokenization) from different vendors. A single product that discovers, classifies, and then directly tokenizes, masks, or revokes is differentiated

### Competitive Threats

1. **Cyera's expansion** — At $9B valuation with massive funding, Cyera is rapidly adding DLP, DAG, and GenAI governance. If they add native tokenization/remediation, they become our closest competitor

2. **Platform vendor lock-in** — Snowflake Horizon and Databricks Unity Catalog are "good enough" native governance for single-platform shops. Our value is strongest in multi-platform environments

3. **Wiz + Google Cloud** — With Google's $32B backing, Wiz could expand from CNAPP-DSPM into remediation. Their security graph approach is compelling

4. **Varonis automated remediation** — Varonis is the only vendor that currently auto-remediates. Their MDDR managed service and 4.9/5 user ratings set a high bar. However, they're strongest in on-prem/Microsoft environments, not cloud data platforms

### Strategic Recommendations

1. **Differentiate on the loop:** Discovery → Classification → Risk Score → Remediation → Score Improvement. No one owns this end-to-end cycle

2. **Lead with guided classification:** Position the human-in-the-loop approach as a feature, not a limitation. Accuracy > speed for compliance-critical data

3. **Integrate, don't compete** with governance catalogs (Collibra, Alation, Atlan) and data platforms (Snowflake, Databricks). We complement them rather than replace them

4. **Target multi-platform environments** where native governance tools fall short — organizations running Snowflake AND Databricks AND AWS S3

5. **Build for data engineers first** — The UX gap in the market is clear. Security tools have security UX. Governance tools have steward UX. Nobody has built data-security tooling with a data engineering UX

---

## 5. Consolidation Map (2023–2026)

| Acquirer | Target | Year | Price | Category |
|----------|--------|------|-------|----------|
| Google | Wiz | 2026 | $32B | CNAPP + DSPM |
| Veeam | Securiti | 2025 | $1.7B | DSPM + Privacy |
| Commvault | Satori | 2025 | Undisclosed | Data access security |
| Proofpoint | Normalyze | 2024 | Undisclosed | DSPM |
| Palo Alto Networks | Dig Security | 2023 | ~$400M | DSPM |
| Rubrik | Laminar | 2023 | ~$200-250M | DSPM |
| Varonis | AllTrue.ai | 2026 | $150M | AI Trust/Risk |
| Palo Alto Networks | Protect AI | 2025 | ~$650-700M | AI/ML Security |

**Implication:** The window for independent DSPM startups is closing. Remaining independents (Cyera, Sentra, BigID) are either at scale or niche. New entrants need to differentiate beyond pure DSPM — our remediation-integrated approach does this.

---

## Questions for Further Research

1. What are the actual classification accuracy rates across DSPM platforms? Can we benchmark our guided approach against fully automated tools?
2. How do enterprises currently stitch together discovery + governance + protection? What are the pain points in that workflow?
3. What's the typical deployment timeline for DSPM tools in organizations matching our target profile?
4. How are Snowflake and Databricks customers currently solving cross-platform governance?
5. What pricing model best fits our target market — per-data-store, per-TB scanned, or platform subscription?
