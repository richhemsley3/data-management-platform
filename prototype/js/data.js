/* ============================================================
   Data — Comprehensive Mock Data for all 52 screens
   ============================================================ */

window.Data = {

  // ---- CONNECTIONS ----
  connections: [
    { id: 'conn-1', name: 'Snowflake Production', platform: 'snowflake', status: 'active', host: 'acme.snowflakecomputing.com', port: 443, schemas: 12, tables: 847, lastScan: '2024-03-12T14:30:00Z', classificationCoverage: 87, latency: 45, owner: 'Jordan Chen', createdAt: '2023-06-15T09:00:00Z', warehouse: 'COMPUTE_WH', role: 'DATA_ENGINEER' },
    { id: 'conn-2', name: 'AWS S3 Data Lake', platform: 'aws-s3', status: 'active', host: 's3.us-east-1.amazonaws.com', port: 443, schemas: 4, tables: 1203, lastScan: '2024-03-10T09:15:00Z', classificationCoverage: 72, latency: 120, owner: 'Priya Sharma', createdAt: '2023-08-22T14:30:00Z', bucket: 'acme-data-lake', region: 'us-east-1' },
    { id: 'conn-3', name: 'BigQuery Analytics', platform: 'bigquery', status: 'degraded', host: 'bigquery.googleapis.com', port: 443, schemas: 8, tables: 456, lastScan: '2024-02-28T11:00:00Z', classificationCoverage: 95, latency: 200, owner: 'Marcus Williams', createdAt: '2023-04-10T11:00:00Z', project: 'acme-analytics-prod', dataset: 'analytics' },
    { id: 'conn-4', name: 'Databricks ML Workspace', platform: 'databricks', status: 'active', host: 'acme.cloud.databricks.com', port: 443, schemas: 6, tables: 234, lastScan: '2024-03-11T16:45:00Z', classificationCoverage: 68, latency: 89, owner: 'Sarah Kim', createdAt: '2023-11-01T10:00:00Z', workspace: 'ml-production' },
    { id: 'conn-5', name: 'PostgreSQL Staging', platform: 'postgresql', status: 'error', host: 'staging-db.acme.internal', port: 5432, schemas: 3, tables: 156, lastScan: '2024-01-15T08:00:00Z', classificationCoverage: 41, latency: null, owner: 'Jordan Chen', createdAt: '2023-09-05T16:00:00Z', database: 'staging_analytics', errorMessage: 'Connection refused: authentication timeout after 30s' },
    { id: 'conn-6', name: 'Azure SQL Production', platform: 'azure-sql', status: 'active', host: 'acme-sql.database.windows.net', port: 1433, schemas: 5, tables: 312, lastScan: '2024-03-13T07:30:00Z', classificationCoverage: 91, latency: 67, owner: 'Marcus Williams', createdAt: '2023-07-19T13:00:00Z', database: 'acme_production' },
    { id: 'conn-7', name: 'Redshift DWH', platform: 'redshift', status: 'active', host: 'acme-cluster.us-west-2.redshift.amazonaws.com', port: 5439, schemas: 7, tables: 523, lastScan: '2024-03-09T22:00:00Z', classificationCoverage: 83, latency: 95, owner: 'Priya Sharma', createdAt: '2023-05-28T09:30:00Z', cluster: 'acme-prod-cluster' }
  ],

  // ---- SCANS ----
  scans: [
    { id: 'scan-1', connectionId: 'conn-1', connectionName: 'Snowflake Production', status: 'completed', progress: 100, tablesScanned: 847, tablesTotal: 847, sensitiveFound: 234, startedAt: '2024-03-12T14:00:00Z', completedAt: '2024-03-12T14:30:00Z', duration: '30m', triggeredBy: 'Scheduled', newFindings: 12 },
    { id: 'scan-2', connectionId: 'conn-2', connectionName: 'AWS S3 Data Lake', status: 'completed', progress: 100, tablesScanned: 1203, tablesTotal: 1203, sensitiveFound: 389, startedAt: '2024-03-10T08:00:00Z', completedAt: '2024-03-10T09:15:00Z', duration: '1h 15m', triggeredBy: 'Manual', newFindings: 45 },
    { id: 'scan-3', connectionId: 'conn-3', connectionName: 'BigQuery Analytics', status: 'running', progress: 64, tablesScanned: 292, tablesTotal: 456, sensitiveFound: 87, startedAt: '2024-03-14T10:00:00Z', completedAt: null, duration: null, triggeredBy: 'Manual', newFindings: 8 },
    { id: 'scan-4', connectionId: 'conn-4', connectionName: 'Databricks ML Workspace', status: 'completed', progress: 100, tablesScanned: 234, tablesTotal: 234, sensitiveFound: 56, startedAt: '2024-03-11T16:00:00Z', completedAt: '2024-03-11T16:45:00Z', duration: '45m', triggeredBy: 'Scheduled', newFindings: 3 },
    { id: 'scan-5', connectionId: 'conn-5', connectionName: 'PostgreSQL Staging', status: 'failed', progress: 15, tablesScanned: 23, tablesTotal: 156, sensitiveFound: 8, startedAt: '2024-01-15T07:45:00Z', completedAt: '2024-01-15T08:00:00Z', duration: '15m', triggeredBy: 'Scheduled', newFindings: 0, errorMessage: 'Connection lost during scan' },
    { id: 'scan-6', connectionId: 'conn-1', connectionName: 'Snowflake Production', status: 'queued', progress: 0, tablesScanned: 0, tablesTotal: 847, sensitiveFound: 0, startedAt: null, completedAt: null, duration: null, triggeredBy: 'Scheduled', newFindings: 0 },
    { id: 'scan-7', connectionId: 'conn-6', connectionName: 'Azure SQL Production', status: 'completed', progress: 100, tablesScanned: 312, tablesTotal: 312, sensitiveFound: 142, startedAt: '2024-03-13T07:00:00Z', completedAt: '2024-03-13T07:30:00Z', duration: '30m', triggeredBy: 'Manual', newFindings: 7 }
  ],

  // ---- TABLES ----
  tables: [
    { id: 'tbl-1', name: 'users', schema: 'public', connectionId: 'conn-1', connectionName: 'Snowflake Production', columns: 24, classifiedColumns: 18, classifiedPct: 75, sensitivity: 'high', rowCount: 2400000, lastScanned: '2024-03-12T14:30:00Z', tags: ['PII', 'PHI'], owner: 'Jordan Chen' },
    { id: 'tbl-2', name: 'transactions', schema: 'finance', connectionId: 'conn-1', connectionName: 'Snowflake Production', columns: 32, classifiedColumns: 28, classifiedPct: 88, sensitivity: 'critical', rowCount: 15600000, lastScanned: '2024-03-12T14:30:00Z', tags: ['PCI', 'PII'], owner: 'Marcus Williams' },
    { id: 'tbl-3', name: 'patient_records', schema: 'healthcare', connectionId: 'conn-2', connectionName: 'AWS S3 Data Lake', columns: 48, classifiedColumns: 48, classifiedPct: 100, sensitivity: 'critical', rowCount: 890000, lastScanned: '2024-03-10T09:15:00Z', tags: ['PHI', 'PII'], owner: 'Priya Sharma' },
    { id: 'tbl-4', name: 'credit_cards', schema: 'payments', connectionId: 'conn-1', connectionName: 'Snowflake Production', columns: 12, classifiedColumns: 12, classifiedPct: 100, sensitivity: 'critical', rowCount: 3200000, lastScanned: '2024-03-12T14:30:00Z', tags: ['PCI'], owner: 'Jordan Chen' },
    { id: 'tbl-5', name: 'employee_directory', schema: 'hr', connectionId: 'conn-3', connectionName: 'BigQuery Analytics', columns: 28, classifiedColumns: 25, classifiedPct: 89, sensitivity: 'high', rowCount: 45000, lastScanned: '2024-02-28T11:00:00Z', tags: ['PII'], owner: 'Sarah Kim' },
    { id: 'tbl-6', name: 'web_analytics', schema: 'marketing', connectionId: 'conn-3', connectionName: 'BigQuery Analytics', columns: 18, classifiedColumns: 8, classifiedPct: 44, sensitivity: 'medium', rowCount: 82000000, lastScanned: '2024-02-28T11:00:00Z', tags: ['PII'], owner: 'Marcus Williams' },
    { id: 'tbl-7', name: 'ml_training_data', schema: 'data_science', connectionId: 'conn-4', connectionName: 'Databricks ML Workspace', columns: 56, classifiedColumns: 32, classifiedPct: 57, sensitivity: 'high', rowCount: 5600000, lastScanned: '2024-03-11T16:45:00Z', tags: ['PII', 'PHI'], owner: 'Sarah Kim' },
    { id: 'tbl-8', name: 'order_history', schema: 'ecommerce', connectionId: 'conn-1', connectionName: 'Snowflake Production', columns: 22, classifiedColumns: 15, classifiedPct: 68, sensitivity: 'medium', rowCount: 8900000, lastScanned: '2024-03-12T14:30:00Z', tags: ['PII', 'PCI'], owner: 'Jordan Chen' },
    { id: 'tbl-9', name: 'insurance_claims', schema: 'claims', connectionId: 'conn-2', connectionName: 'AWS S3 Data Lake', columns: 36, classifiedColumns: 36, classifiedPct: 100, sensitivity: 'critical', rowCount: 1200000, lastScanned: '2024-03-10T09:15:00Z', tags: ['PHI', 'PII', 'PCI'], owner: 'Priya Sharma' },
    { id: 'tbl-10', name: 'customer_profiles', schema: 'crm', connectionId: 'conn-6', connectionName: 'Azure SQL Production', columns: 30, classifiedColumns: 26, classifiedPct: 87, sensitivity: 'high', rowCount: 1800000, lastScanned: '2024-03-13T07:30:00Z', tags: ['PII', 'CCPA'], owner: 'Marcus Williams' },
    { id: 'tbl-11', name: 'audit_logs', schema: 'system', connectionId: 'conn-1', connectionName: 'Snowflake Production', columns: 14, classifiedColumns: 6, classifiedPct: 43, sensitivity: 'low', rowCount: 45000000, lastScanned: '2024-03-12T14:30:00Z', tags: [], owner: 'Jordan Chen' },
    { id: 'tbl-12', name: 'payment_methods', schema: 'payments', connectionId: 'conn-6', connectionName: 'Azure SQL Production', columns: 16, classifiedColumns: 16, classifiedPct: 100, sensitivity: 'critical', rowCount: 2100000, lastScanned: '2024-03-13T07:30:00Z', tags: ['PCI', 'PII'], owner: 'Marcus Williams' },
    { id: 'tbl-13', name: 'session_events', schema: 'analytics', connectionId: 'conn-7', connectionName: 'Redshift DWH', columns: 20, classifiedColumns: 10, classifiedPct: 50, sensitivity: 'medium', rowCount: 120000000, lastScanned: '2024-03-09T22:00:00Z', tags: ['PII'], owner: 'Priya Sharma' },
    { id: 'tbl-14', name: 'vendor_contracts', schema: 'procurement', connectionId: 'conn-3', connectionName: 'BigQuery Analytics', columns: 24, classifiedColumns: 12, classifiedPct: 50, sensitivity: 'medium', rowCount: 8500, lastScanned: '2024-02-28T11:00:00Z', tags: ['PII'], owner: 'Sarah Kim' },
    { id: 'tbl-15', name: 'prescription_data', schema: 'pharmacy', connectionId: 'conn-2', connectionName: 'AWS S3 Data Lake', columns: 42, classifiedColumns: 42, classifiedPct: 100, sensitivity: 'critical', rowCount: 3400000, lastScanned: '2024-03-10T09:15:00Z', tags: ['PHI', 'PII'], owner: 'Priya Sharma' },
    { id: 'tbl-16', name: 'social_security_records', schema: 'compliance', connectionId: 'conn-5', connectionName: 'PostgreSQL Staging', columns: 8, classifiedColumns: 8, classifiedPct: 100, sensitivity: 'critical', rowCount: 50000, lastScanned: '2024-01-15T08:00:00Z', tags: ['PII'], owner: 'Jordan Chen' },
    { id: 'tbl-17', name: 'marketing_leads', schema: 'marketing', connectionId: 'conn-7', connectionName: 'Redshift DWH', columns: 18, classifiedColumns: 14, classifiedPct: 78, sensitivity: 'medium', rowCount: 540000, lastScanned: '2024-03-09T22:00:00Z', tags: ['PII', 'CCPA'], owner: 'Sarah Kim' }
  ],

  // ---- CLASSIFICATIONS ----
  classifications: [
    { id: 'cls-1', tableId: 'tbl-1', tableName: 'users', columnName: 'email', suggestedType: 'Email Address', category: 'PII', confidence: 98, status: 'approved', reviewer: 'Jordan Chen', reviewedAt: '2024-03-12T15:00:00Z' },
    { id: 'cls-2', tableId: 'tbl-1', tableName: 'users', columnName: 'phone_number', suggestedType: 'Phone Number', category: 'PII', confidence: 96, status: 'approved', reviewer: 'Jordan Chen', reviewedAt: '2024-03-12T15:00:00Z' },
    { id: 'cls-3', tableId: 'tbl-1', tableName: 'users', columnName: 'ssn', suggestedType: 'Social Security Number', category: 'PII', confidence: 99, status: 'approved', reviewer: 'Priya Sharma', reviewedAt: '2024-03-12T15:30:00Z' },
    { id: 'cls-4', tableId: 'tbl-2', tableName: 'transactions', columnName: 'card_number', suggestedType: 'Credit Card Number', category: 'PCI', confidence: 99, status: 'approved', reviewer: 'Marcus Williams', reviewedAt: '2024-03-12T16:00:00Z' },
    { id: 'cls-5', tableId: 'tbl-2', tableName: 'transactions', columnName: 'card_cvv', suggestedType: 'CVV', category: 'PCI', confidence: 97, status: 'pending', reviewer: null, reviewedAt: null },
    { id: 'cls-6', tableId: 'tbl-3', tableName: 'patient_records', columnName: 'diagnosis_code', suggestedType: 'Medical Diagnosis', category: 'PHI', confidence: 94, status: 'approved', reviewer: 'Priya Sharma', reviewedAt: '2024-03-10T10:00:00Z' },
    { id: 'cls-7', tableId: 'tbl-3', tableName: 'patient_records', columnName: 'patient_dob', suggestedType: 'Date of Birth', category: 'PII', confidence: 98, status: 'approved', reviewer: 'Priya Sharma', reviewedAt: '2024-03-10T10:00:00Z' },
    { id: 'cls-8', tableId: 'tbl-4', tableName: 'credit_cards', columnName: 'pan', suggestedType: 'Primary Account Number', category: 'PCI', confidence: 99, status: 'approved', reviewer: 'Jordan Chen', reviewedAt: '2024-03-12T16:30:00Z' },
    { id: 'cls-9', tableId: 'tbl-5', tableName: 'employee_directory', columnName: 'salary', suggestedType: 'Financial Amount', category: 'PII', confidence: 85, status: 'pending', reviewer: null, reviewedAt: null },
    { id: 'cls-10', tableId: 'tbl-5', tableName: 'employee_directory', columnName: 'home_address', suggestedType: 'Street Address', category: 'PII', confidence: 92, status: 'pending', reviewer: null, reviewedAt: null },
    { id: 'cls-11', tableId: 'tbl-6', tableName: 'web_analytics', columnName: 'ip_address', suggestedType: 'IP Address', category: 'PII', confidence: 99, status: 'approved', reviewer: 'Marcus Williams', reviewedAt: '2024-03-01T09:00:00Z' },
    { id: 'cls-12', tableId: 'tbl-7', tableName: 'ml_training_data', columnName: 'user_name', suggestedType: 'Full Name', category: 'PII', confidence: 88, status: 'rejected', reviewer: 'Sarah Kim', reviewedAt: '2024-03-11T17:00:00Z', rejectionReason: 'Column contains anonymized IDs, not actual names' },
    { id: 'cls-13', tableId: 'tbl-8', tableName: 'order_history', columnName: 'shipping_address', suggestedType: 'Street Address', category: 'PII', confidence: 95, status: 'approved', reviewer: 'Jordan Chen', reviewedAt: '2024-03-12T17:00:00Z' },
    { id: 'cls-14', tableId: 'tbl-9', tableName: 'insurance_claims', columnName: 'policy_holder_ssn', suggestedType: 'Social Security Number', category: 'PII', confidence: 99, status: 'approved', reviewer: 'Priya Sharma', reviewedAt: '2024-03-10T11:00:00Z' },
    { id: 'cls-15', tableId: 'tbl-9', tableName: 'insurance_claims', columnName: 'medical_record_number', suggestedType: 'Medical Record Number', category: 'PHI', confidence: 96, status: 'pending', reviewer: null, reviewedAt: null },
    { id: 'cls-16', tableId: 'tbl-10', tableName: 'customer_profiles', columnName: 'date_of_birth', suggestedType: 'Date of Birth', category: 'PII', confidence: 97, status: 'approved', reviewer: 'Marcus Williams', reviewedAt: '2024-03-13T08:00:00Z' },
    { id: 'cls-17', tableId: 'tbl-12', tableName: 'payment_methods', columnName: 'account_number', suggestedType: 'Bank Account Number', category: 'PCI', confidence: 93, status: 'pending', reviewer: null, reviewedAt: null },
    { id: 'cls-18', tableId: 'tbl-12', tableName: 'payment_methods', columnName: 'routing_number', suggestedType: 'Bank Routing Number', category: 'PCI', confidence: 91, status: 'pending', reviewer: null, reviewedAt: null },
    { id: 'cls-19', tableId: 'tbl-13', tableName: 'session_events', columnName: 'user_agent', suggestedType: 'Device Fingerprint', category: 'PII', confidence: 72, status: 'pending', reviewer: null, reviewedAt: null },
    { id: 'cls-20', tableId: 'tbl-15', tableName: 'prescription_data', columnName: 'ndc_code', suggestedType: 'Drug Code', category: 'PHI', confidence: 89, status: 'approved', reviewer: 'Priya Sharma', reviewedAt: '2024-03-10T12:00:00Z' },
    { id: 'cls-21', tableId: 'tbl-16', tableName: 'social_security_records', columnName: 'ssn_encrypted', suggestedType: 'Encrypted SSN', category: 'PII', confidence: 78, status: 'pending', reviewer: null, reviewedAt: null },
    { id: 'cls-22', tableId: 'tbl-17', tableName: 'marketing_leads', columnName: 'email_hash', suggestedType: 'Hashed Email', category: 'PII', confidence: 65, status: 'pending', reviewer: null, reviewedAt: null }
  ],

  // ---- CLASSIFICATION RULES ----
  rules: [
    { id: 'rule-1', name: 'Email Pattern', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', classificationType: 'Email Address', category: 'PII', matches: 47, status: 'active', createdBy: 'Jordan Chen', createdAt: '2023-06-20T10:00:00Z' },
    { id: 'rule-2', name: 'SSN Pattern', pattern: '^\\d{3}-\\d{2}-\\d{4}$', classificationType: 'Social Security Number', category: 'PII', matches: 12, status: 'active', createdBy: 'Priya Sharma', createdAt: '2023-07-15T14:00:00Z' },
    { id: 'rule-3', name: 'Credit Card (Luhn)', pattern: '^\\d{4}[- ]?\\d{4}[- ]?\\d{4}[- ]?\\d{4}$', classificationType: 'Credit Card Number', category: 'PCI', matches: 28, status: 'active', createdBy: 'Marcus Williams', createdAt: '2023-08-01T09:00:00Z' },
    { id: 'rule-4', name: 'Phone Number (US)', pattern: '^\\+?1?[- ]?\\(?\\d{3}\\)?[- ]?\\d{3}[- ]?\\d{4}$', classificationType: 'Phone Number', category: 'PII', matches: 35, status: 'active', createdBy: 'Jordan Chen', createdAt: '2023-06-25T11:00:00Z' },
    { id: 'rule-5', name: 'IP Address v4', pattern: '^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$', classificationType: 'IP Address', category: 'PII', matches: 89, status: 'active', createdBy: 'Sarah Kim', createdAt: '2023-09-10T16:00:00Z' },
    { id: 'rule-6', name: 'Medical Record Number', pattern: '^MRN-\\d{8,10}$', classificationType: 'Medical Record Number', category: 'PHI', matches: 15, status: 'draft', createdBy: 'Priya Sharma', createdAt: '2024-02-20T10:00:00Z' }
  ],

  // ---- POLICIES ----
  policies: [
    { id: 'pol-1', name: 'PII Tokenization - Production', description: 'Tokenize all PII fields across production databases', regulation: 'GDPR', status: 'active', appliedCount: 234, tables: 45, method: 'Tokenization', createdAt: '2023-07-01T10:00:00Z', updatedAt: '2024-03-10T09:00:00Z', owner: 'Jordan Chen', priority: 'high' },
    { id: 'pol-2', name: 'PCI Data Masking', description: 'Mask credit card and payment data in non-production environments', regulation: 'PCI DSS', status: 'active', appliedCount: 89, tables: 12, method: 'Dynamic Masking', createdAt: '2023-08-15T14:00:00Z', updatedAt: '2024-03-08T11:00:00Z', owner: 'Marcus Williams', priority: 'critical' },
    { id: 'pol-3', name: 'PHI Encryption at Rest', description: 'Encrypt all PHI data at rest with AES-256', regulation: 'HIPAA', status: 'active', appliedCount: 156, tables: 28, method: 'Encryption', createdAt: '2023-09-01T09:00:00Z', updatedAt: '2024-02-28T16:00:00Z', owner: 'Priya Sharma', priority: 'critical' },
    { id: 'pol-4', name: 'CCPA Right to Delete', description: 'Automated deletion workflow for California consumer data requests', regulation: 'CCPA', status: 'draft', appliedCount: 0, tables: 0, method: 'Data Deletion', createdAt: '2024-02-15T10:00:00Z', updatedAt: '2024-03-01T14:00:00Z', owner: 'Sarah Kim', priority: 'medium' },
    { id: 'pol-5', name: 'ML Training Data Anonymization', description: 'Anonymize PII before use in machine learning training pipelines', regulation: 'GDPR', status: 'pending_approval', appliedCount: 0, tables: 8, method: 'Anonymization', createdAt: '2024-03-05T11:00:00Z', updatedAt: '2024-03-05T11:00:00Z', owner: 'Sarah Kim', priority: 'high' }
  ],

  // ---- RISK SCORE ----
  riskScore: {
    current: 67,
    previous: 75,
    trend: [82, 79, 75, 72, 70, 67],
    breakdown: {
      unclassified: 22,
      unprotected: 18,
      policyViolations: 15,
      openRemediations: 12
    }
  },

  // ---- REGULATIONS ----
  regulations: [
    { id: 'reg-1', name: 'GDPR', fullName: 'General Data Protection Regulation', status: 'partial', compliancePct: 78, articlesTotal: 24, articlesMet: 19, lastAssessed: '2024-03-10T09:00:00Z', region: 'EU', gaps: [
      { article: 'Art. 17', title: 'Right to Erasure', status: 'gap', detail: 'Automated deletion pipeline not yet implemented for 3 data sources' },
      { article: 'Art. 20', title: 'Right to Data Portability', status: 'gap', detail: 'Export format standardization pending for BigQuery datasets' },
      { article: 'Art. 25', title: 'Data Protection by Design', status: 'partial', detail: 'ML training pipeline lacks built-in anonymization' },
      { article: 'Art. 30', title: 'Records of Processing', status: 'partial', detail: 'Processing register missing entries for 12 tables' },
      { article: 'Art. 35', title: 'Data Protection Impact Assessment', status: 'gap', detail: 'DPIA not completed for new Databricks data processing activities' }
    ]},
    { id: 'reg-2', name: 'CCPA', fullName: 'California Consumer Privacy Act', status: 'partial', compliancePct: 65, articlesTotal: 12, articlesMet: 8, lastAssessed: '2024-03-08T14:00:00Z', region: 'US-CA', gaps: [
      { article: 'Sec. 1798.105', title: 'Right to Delete', status: 'gap', detail: 'Deletion workflow not automated for S3 data lake' },
      { article: 'Sec. 1798.110', title: 'Right to Know', status: 'partial', detail: 'Data inventory incomplete for 4 connections' },
      { article: 'Sec. 1798.120', title: 'Right to Opt-Out', status: 'gap', detail: 'Opt-out signals not yet integrated with marketing databases' },
      { article: 'Sec. 1798.135', title: 'Do Not Sell', status: 'gap', detail: 'Third-party data sharing audit pending' }
    ]},
    { id: 'reg-3', name: 'HIPAA', fullName: 'Health Insurance Portability and Accountability Act', status: 'compliant', compliancePct: 94, articlesTotal: 18, articlesMet: 17, lastAssessed: '2024-03-12T10:00:00Z', region: 'US', gaps: [
      { article: '164.312(e)', title: 'Transmission Security', status: 'partial', detail: 'TLS 1.3 upgrade pending for PostgreSQL staging connection' }
    ]},
    { id: 'reg-4', name: 'PCI DSS', fullName: 'Payment Card Industry Data Security Standard', status: 'compliant', compliancePct: 91, articlesTotal: 12, articlesMet: 11, lastAssessed: '2024-03-11T16:00:00Z', region: 'Global', gaps: [
      { article: 'Req. 3.4', title: 'Render PAN Unreadable', status: 'partial', detail: 'Legacy Redshift tables contain unmasked PANs in archive schema' }
    ]}
  ],

  // ---- REMEDIATIONS ----
  remediations: [
    { id: 'rem-1', title: 'Tokenize SSN fields in Snowflake', type: 'tokenization', status: 'in_progress', priority: 'critical', items: 12, completed: 8, assignee: 'Jordan Chen', dueDate: '2024-03-20T17:00:00Z', createdAt: '2024-03-01T09:00:00Z', regulation: 'GDPR', connection: 'Snowflake Production' },
    { id: 'rem-2', title: 'Mask credit card data in staging', type: 'masking', status: 'pending', priority: 'high', items: 6, completed: 0, assignee: 'Marcus Williams', dueDate: '2024-03-25T17:00:00Z', createdAt: '2024-03-05T14:00:00Z', regulation: 'PCI DSS', connection: 'PostgreSQL Staging' },
    { id: 'rem-3', title: 'Encrypt PHI at rest in S3', type: 'encryption', status: 'completed', priority: 'critical', items: 28, completed: 28, assignee: 'Priya Sharma', dueDate: '2024-03-15T17:00:00Z', createdAt: '2024-02-15T10:00:00Z', regulation: 'HIPAA', connection: 'AWS S3 Data Lake' },
    { id: 'rem-4', title: 'Remove unmasked PANs from Redshift archive', type: 'deletion', status: 'in_progress', priority: 'high', items: 4, completed: 2, assignee: 'Priya Sharma', dueDate: '2024-03-22T17:00:00Z', createdAt: '2024-03-08T11:00:00Z', regulation: 'PCI DSS', connection: 'Redshift DWH' },
    { id: 'rem-5', title: 'Implement TLS 1.3 for staging DB', type: 'configuration', status: 'pending', priority: 'medium', items: 3, completed: 0, assignee: 'Jordan Chen', dueDate: '2024-04-01T17:00:00Z', createdAt: '2024-03-12T10:00:00Z', regulation: 'HIPAA', connection: 'PostgreSQL Staging' },
    { id: 'rem-6', title: 'Anonymize ML training data pipeline', type: 'anonymization', status: 'pending', priority: 'high', items: 8, completed: 0, assignee: 'Sarah Kim', dueDate: '2024-03-28T17:00:00Z', createdAt: '2024-03-05T11:00:00Z', regulation: 'GDPR', connection: 'Databricks ML Workspace' },
    { id: 'rem-7', title: 'Update data processing register', type: 'documentation', status: 'in_progress', priority: 'medium', items: 12, completed: 7, assignee: 'Marcus Williams', dueDate: '2024-03-30T17:00:00Z', createdAt: '2024-03-01T14:00:00Z', regulation: 'GDPR', connection: 'Multiple' },
    { id: 'rem-8', title: 'Classify unscanned BigQuery tables', type: 'classification', status: 'pending', priority: 'medium', items: 164, completed: 0, assignee: 'Sarah Kim', dueDate: '2024-04-05T17:00:00Z', createdAt: '2024-03-10T09:00:00Z', regulation: 'GDPR', connection: 'BigQuery Analytics' }
  ],

  // ---- APPROVALS (Review Queue) ----
  approvals: [
    { id: 'appr-1', type: 'classification', title: 'New sensitive fields detected in transactions table', description: '5 new columns classified as PCI in finance.transactions', items: 5, submittedBy: 'System (Auto-scan)', submittedAt: '2024-03-12T14:30:00Z', priority: 'high', status: 'pending', tableId: 'tbl-2', connectionName: 'Snowflake Production' },
    { id: 'appr-2', type: 'policy', title: 'ML Training Data Anonymization Policy', description: 'New policy to anonymize PII before ML training', items: 1, submittedBy: 'Sarah Kim', submittedAt: '2024-03-05T11:00:00Z', priority: 'medium', status: 'pending', policyId: 'pol-5', connectionName: 'Databricks ML Workspace' },
    { id: 'appr-3', type: 'remediation', title: 'Bulk tokenization of SSN fields', description: 'Apply tokenization to 12 SSN-containing columns across 8 tables', items: 12, submittedBy: 'Jordan Chen', submittedAt: '2024-03-01T09:00:00Z', priority: 'critical', status: 'pending', remediationId: 'rem-1', connectionName: 'Snowflake Production' },
    { id: 'appr-4', type: 'classification', title: 'Review auto-classified columns in patient_records', description: '8 columns automatically classified as PHI need manual verification', items: 8, submittedBy: 'System (Auto-scan)', submittedAt: '2024-03-10T09:15:00Z', priority: 'high', status: 'pending', tableId: 'tbl-3', connectionName: 'AWS S3 Data Lake' },
    { id: 'appr-5', type: 'access', title: 'Access request for credit_cards table', description: 'Data analyst requesting read access to masked credit card data', items: 1, submittedBy: 'Alex Rivera', submittedAt: '2024-03-13T10:30:00Z', priority: 'medium', status: 'pending', tableId: 'tbl-4', connectionName: 'Snowflake Production' }
  ],

  // ---- ALERTS ----
  alerts: [
    { id: 'alert-1', message: 'PostgreSQL Staging connection has been unreachable for 58 days', variant: 'error', action: 'View connection', actionRoute: '#/connections/conn-5' },
    { id: 'alert-2', message: '3 critical remediation tasks are overdue', variant: 'warning', action: 'View tasks', actionRoute: '#/remediation' }
  ],

  // ---- DASHBOARD STATS ----
  dashboardStats: {
    totalConnections: 7,
    activeConnections: 5,
    totalTables: 3231,
    classifiedTables: 2645,
    totalColumns: 29840,
    sensitiveColumns: 4210,
    pendingReviews: 42,
    openRemediations: 5,
    policiesActive: 3,
    complianceAvg: 82
  },

  // ---- ACTIVITY LOG ----
  activityLog: [
    { id: 'act-1', type: 'scan_complete', message: 'Scan completed for Snowflake Production', detail: '12 new sensitive fields detected', timestamp: '2024-03-12T14:30:00Z', user: 'System', severity: 'info' },
    { id: 'act-2', type: 'policy_violation', message: 'Policy violation: unmasked PCI data in Redshift archive', detail: '4 tables contain unmasked PANs', timestamp: '2024-03-11T09:00:00Z', user: 'System', severity: 'error' },
    { id: 'act-3', type: 'classification_approved', message: 'Jordan Chen approved 18 classifications in users table', detail: 'PII classifications for email, phone, SSN fields', timestamp: '2024-03-12T15:00:00Z', user: 'Jordan Chen', severity: 'success' },
    { id: 'act-4', type: 'remediation_progress', message: 'Priya Sharma completed PHI encryption for S3 data lake', detail: '28 tables encrypted with AES-256', timestamp: '2024-03-10T16:00:00Z', user: 'Priya Sharma', severity: 'success' },
    { id: 'act-5', type: 'connection_error', message: 'PostgreSQL Staging connection failed', detail: 'Authentication timeout after 30s', timestamp: '2024-01-15T08:00:00Z', user: 'System', severity: 'error' },
    { id: 'act-6', type: 'policy_created', message: 'Sarah Kim created new anonymization policy', detail: 'ML Training Data Anonymization pending approval', timestamp: '2024-03-05T11:00:00Z', user: 'Sarah Kim', severity: 'info' },
    { id: 'act-7', type: 'scan_started', message: 'Manual scan initiated for BigQuery Analytics', detail: '456 tables queued for scanning', timestamp: '2024-03-14T10:00:00Z', user: 'Marcus Williams', severity: 'info' },
    { id: 'act-8', type: 'connection_added', message: 'New connection added: Azure SQL Production', detail: 'Connected to acme-sql.database.windows.net', timestamp: '2024-03-13T07:00:00Z', user: 'Marcus Williams', severity: 'success' }
  ],

  // ---- USERS ----
  users: {
    current: {
      id: 'user-1',
      name: 'Jordan Chen',
      initials: 'JC',
      email: 'jordan.chen@acme.com',
      role: 'Data Engineer',
      persona: 'jordan',
      avatar: null
    },
    team: [
      { id: 'user-1', name: 'Jordan Chen', initials: 'JC', role: 'Data Engineer' },
      { id: 'user-2', name: 'Priya Sharma', initials: 'PS', role: 'Data Privacy Officer' },
      { id: 'user-3', name: 'Marcus Williams', initials: 'MW', role: 'Security Analyst' },
      { id: 'user-4', name: 'Sarah Kim', initials: 'SK', role: 'ML Engineer' },
      { id: 'user-5', name: 'Alex Rivera', initials: 'AR', role: 'Data Analyst' }
    ]
  },

  // ---- PLATFORM LOGOS ----
  platformColors: {
    'snowflake': '#29B5E8',
    'aws-s3': '#FF9900',
    'bigquery': '#4285F4',
    'databricks': '#FF3621',
    'postgresql': '#336791',
    'azure-sql': '#0078D4',
    'redshift': '#8C4FFF'
  },

  // ---- HELPER FUNCTIONS ----
  getConnection: function(id) {
    return this.connections.find(function(c) { return c.id === id; });
  },

  getTable: function(id) {
    return this.tables.find(function(t) { return t.id === id; });
  },

  getTablesForConnection: function(connId) {
    return this.tables.filter(function(t) { return t.connectionId === connId; });
  },

  getClassificationsForTable: function(tableId) {
    return this.classifications.filter(function(c) { return c.tableId === tableId; });
  },

  getScansForConnection: function(connId) {
    return this.scans.filter(function(s) { return s.connectionId === connId; });
  },

  getPendingClassifications: function() {
    return this.classifications.filter(function(c) { return c.status === 'pending'; });
  },

  formatDate: function(isoString) {
    if (!isoString) return '--';
    var d = new Date(isoString);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  },

  formatDateTime: function(isoString) {
    if (!isoString) return '--';
    var d = new Date(isoString);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var hours = d.getHours();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    var mins = d.getMinutes().toString().padStart(2, '0');
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + hours + ':' + mins + ' ' + ampm;
  },

  formatNumber: function(num) {
    if (num === null || num === undefined) return '--';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  },

  timeAgo: function(isoString) {
    if (!isoString) return '--';
    var now = new Date();
    var d = new Date(isoString);
    var diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 2592000) return Math.floor(diff / 86400) + 'd ago';
    return this.formatDate(isoString);
  }
};

// ---- Normalize mock data dates to be relative to today ----
// Shifts all 2024-era dates forward so timeAgo() produces meaningful results.
(function normalizeDates() {
  var now = new Date();
  // The mock data's "present" is 2024-03-14. Compute the offset in ms.
  var mockNow = new Date('2024-03-14T12:00:00Z');
  var offsetMs = now.getTime() - mockNow.getTime();

  function shiftDate(isoString) {
    if (!isoString) return isoString;
    var d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return new Date(d.getTime() + offsetMs).toISOString();
  }

  function shiftArray(arr, fields) {
    for (var i = 0; i < arr.length; i++) {
      for (var f = 0; f < fields.length; f++) {
        if (arr[i][fields[f]]) {
          arr[i][fields[f]] = shiftDate(arr[i][fields[f]]);
        }
      }
    }
  }

  shiftArray(Data.connections, ['lastScan', 'createdAt']);
  shiftArray(Data.scans, ['startedAt', 'completedAt']);
  shiftArray(Data.tables, ['lastScanned']);
  shiftArray(Data.approvals, ['submittedAt', 'reviewedAt']);
  shiftArray(Data.remediations, ['createdAt', 'completedAt']);
  shiftArray(Data.activityLog, ['timestamp']);
  if (Data.alerts) shiftArray(Data.alerts, ['timestamp']);
})();
