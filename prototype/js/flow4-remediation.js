/* ============================================================
   Flow 4: Remediation — All 11 screens
   Registers routes for remediation history, configuration wizard,
   preview, dry run, execution, success, detail, rollback,
   approval request, approval review, and approval queue.
   ============================================================ */

(function() {

  // ---- Helper: content container ----
  function getContent() {
    return document.getElementById('content');
  }

  // ---- Helper: pending approval count ----
  function getPendingApprovalCount() {
    return Data.approvals.filter(function(a) {
      return a.status === 'pending' && a.type === 'remediation';
    }).length;
  }

  // ---- Helper: all pending approvals (across types) ----
  function getAllPendingApprovals() {
    return Data.approvals.filter(function(a) { return a.status === 'pending'; });
  }

  // ---- Helper: remediation type label ----
  function typeLabel(type) {
    var map = {
      'tokenization': 'Tokenize',
      'masking': 'Mask',
      'encryption': 'Encrypt',
      'deletion': 'Delete',
      'anonymization': 'Anonymize',
      'configuration': 'Configure',
      'documentation': 'Document',
      'classification': 'Classify',
      'revoke_access': 'Revoke Access',
      'apply_policy': 'Apply Policy'
    };
    return map[type] || type;
  }

  // ---- Helper: risk impact display ----
  function riskImpactDisplay(points) {
    if (!points && points !== 0) return '--';
    var sign = points < 0 ? '' : '+';
    var color = points < 0 ? 'var(--sds-status-success-text)' : 'var(--sds-status-error-text)';
    return '<span style="color:' + color + ';font-weight:500;">' + sign + points + ' pts</span>';
  }

  // ---- Helper: status tag for remediation ----
  function remStatusTag(status) {
    var map = {
      'completed': { label: 'Completed', variant: 'success' },
      'in_progress': { label: 'In Progress', variant: 'info' },
      'pending': { label: 'Pending', variant: 'warning' },
      'pending_approval': { label: 'Pending Approval', variant: 'warning' },
      'failed': { label: 'Failed', variant: 'error' },
      'scheduled': { label: 'Scheduled', variant: 'neutral' },
      'rolled_back': { label: 'Rolled Back', variant: 'info' },
      'cancelled': { label: 'Cancelled', variant: 'neutral' }
    };
    var info = map[status] || { label: status, variant: 'neutral' };
    return Components.tag(info.label, info.variant);
  }

  // ---- Helper: expiry display ----
  function expiryDisplay(submittedAt, daysAllowed) {
    daysAllowed = daysAllowed || 7;
    var submitted = new Date(submittedAt);
    var expiry = new Date(submitted.getTime() + daysAllowed * 86400000);
    var now = new Date();
    var remaining = Math.max(0, Math.ceil((expiry - now) / 86400000));
    if (remaining <= 0) return '<span style="color:var(--sds-status-error-text);">Expired</span>';
    if (remaining <= 1) return '<span style="color:var(--sds-status-error-text);">&lt; 1d left</span>';
    if (remaining <= 3) return '<span style="color:var(--sds-status-warning-text);">' + remaining + 'd left</span>';
    return '<span style="color:var(--sds-text-tertiary);">' + remaining + 'd left</span>';
  }

  // ---- Mock affected items for wizard ----
  var affectedItems = [
    { id: 'ai-1', path: 'public.users.ssn', type: 'SSN', sensitivity: 'critical', table: 'users', schema: 'public', column: 'ssn', checked: true },
    { id: 'ai-2', path: 'public.users.email', type: 'Email Address', sensitivity: 'high', table: 'users', schema: 'public', column: 'email', checked: true },
    { id: 'ai-3', path: 'public.users.phone_number', type: 'Phone Number', sensitivity: 'high', table: 'users', schema: 'public', column: 'phone_number', checked: true },
    { id: 'ai-4', path: 'finance.transactions.card_number', type: 'Credit Card', sensitivity: 'critical', table: 'transactions', schema: 'finance', column: 'card_number', checked: true },
    { id: 'ai-5', path: 'finance.transactions.card_cvv', type: 'CVV', sensitivity: 'critical', table: 'transactions', schema: 'finance', column: 'card_cvv', checked: true },
    { id: 'ai-6', path: 'healthcare.patient_records.diagnosis_code', type: 'Medical Diagnosis', sensitivity: 'critical', table: 'patient_records', schema: 'healthcare', column: 'diagnosis_code', checked: true },
    { id: 'ai-7', path: 'healthcare.patient_records.patient_dob', type: 'Date of Birth', sensitivity: 'high', table: 'patient_records', schema: 'healthcare', column: 'patient_dob', checked: true },
    { id: 'ai-8', path: 'payments.credit_cards.pan', type: 'PAN', sensitivity: 'critical', table: 'credit_cards', schema: 'payments', column: 'pan', checked: true },
    { id: 'ai-9', path: 'hr.employee_directory.salary', type: 'Financial Amount', sensitivity: 'high', table: 'employee_directory', schema: 'hr', column: 'salary', checked: true },
    { id: 'ai-10', path: 'hr.employee_directory.home_address', type: 'Street Address', sensitivity: 'high', table: 'employee_directory', schema: 'hr', column: 'home_address', checked: true },
    { id: 'ai-11', path: 'ecommerce.order_history.shipping_address', type: 'Street Address', sensitivity: 'medium', table: 'order_history', schema: 'ecommerce', column: 'shipping_address', checked: true },
    { id: 'ai-12', path: 'crm.customer_profiles.date_of_birth', type: 'Date of Birth', sensitivity: 'high', table: 'customer_profiles', schema: 'crm', column: 'date_of_birth', checked: true }
  ];

  // ---- Mock before/after data for preview ----
  var beforeAfterSamples = [
    { column: 'ssn', before: '123-45-6789', after: 'tok_a8f2...x9d1' },
    { column: 'ssn', before: '987-65-4321', after: 'tok_c3e7...k2m8' },
    { column: 'ssn', before: '456-78-9012', after: 'tok_f1b4...p5q3' },
    { column: 'email', before: 'john.doe@example.com', after: 'tok_e2d1...m4n7' },
    { column: 'email', before: 'jane.smith@acme.com', after: 'tok_g5h8...q1r3' },
    { column: 'phone_number', before: '(555) 123-4567', after: 'tok_j6k9...s2t5' }
  ];

  // ---- Mock dry run results ----
  var dryRunResults = [
    { column: 'ssn', table: 'users', result: 'tok_a8f2...x9d1', status: 'success' },
    { column: 'email', table: 'users', result: 'tok_e2d1...m4n7', status: 'success' },
    { column: 'phone_number', table: 'users', result: '--', status: 'fail', error: 'Format mismatch: non-standard phone format detected' },
    { column: 'card_number', table: 'transactions', result: 'tok_k3l6...u8v1', status: 'success' },
    { column: 'card_cvv', table: 'transactions', result: 'tok_m7n0...w4x2', status: 'success' },
    { column: 'diagnosis_code', table: 'patient_records', result: 'tok_p1q4...y6z8', status: 'success' },
    { column: 'patient_dob', table: 'patient_records', result: 'tok_r5s8...a2b9', status: 'success' },
    { column: 'pan', table: 'credit_cards', result: 'tok_d3e6...c4f7', status: 'success' },
    { column: 'salary', table: 'employee_directory', result: 'tok_g9h2...e5i8', status: 'success' },
    { column: 'home_address', table: 'employee_directory', result: 'tok_j1k4...f7l0', status: 'success' },
    { column: 'shipping_address', table: 'order_history', result: 'tok_m3n6...g8p1', status: 'success' },
    { column: 'date_of_birth', table: 'customer_profiles', result: 'tok_q5r8...h0s3', status: 'success' }
  ];

  // ---- Mock execution items ----
  var executionItems = [
    { name: 'users.ssn', status: 'done', duration: '0.8s' },
    { name: 'users.email', status: 'done', duration: '1.2s' },
    { name: 'users.phone_number', status: 'done', duration: '0.9s' },
    { name: 'transactions.card_number', status: 'done', duration: '1.5s' },
    { name: 'transactions.card_cvv', status: 'done', duration: '0.7s' },
    { name: 'patient_records.diagnosis_code', status: 'done', duration: '2.1s' },
    { name: 'patient_records.patient_dob', status: 'done', duration: '0.6s' },
    { name: 'credit_cards.pan', status: 'done', duration: '1.8s' },
    { name: 'employee_directory.salary', status: 'executing', duration: '' },
    { name: 'employee_directory.home_address', status: 'queued', duration: '' },
    { name: 'order_history.shipping_address', status: 'queued', duration: '' },
    { name: 'customer_profiles.date_of_birth', status: 'queued', duration: '' }
  ];

  // ---- Wizard Steps Definition ----
  var wizardSteps = [
    { label: 'Configure' },
    { label: 'Preview' },
    { label: 'Execute' }
  ];

  // ---- Mock remediation history rows ----
  var historyRows = [
    { id: 'rem-h1', date: '2024-03-14T14:34:00Z', type: 'tokenization', user: 'Jordan Chen', items: 12, riskImpact: -13, status: 'completed', connection: 'Snowflake Production' },
    { id: 'rem-h2', date: '2024-03-13T10:15:00Z', type: 'revoke_access', user: 'Priya Sharma', items: 5, riskImpact: -8, status: 'completed', connection: 'BigQuery Analytics' },
    { id: 'rem-h3', date: '2024-03-15T09:00:00Z', type: 'tokenization', user: 'Jordan Chen', items: 20, riskImpact: -15, status: 'scheduled', connection: 'Snowflake Production' },
    { id: 'rem-h4', date: '2024-03-12T16:00:00Z', type: 'deletion', user: 'Jordan Chen', items: 3, riskImpact: -5, status: 'rolled_back', connection: 'Redshift DWH' },
    { id: 'rem-h5', date: '2024-03-11T09:30:00Z', type: 'masking', user: 'Marcus Williams', items: 8, riskImpact: -6, status: 'completed', connection: 'Azure SQL Production' },
    { id: 'rem-h6', date: '2024-03-10T14:00:00Z', type: 'encryption', user: 'Priya Sharma', items: 28, riskImpact: -18, status: 'completed', connection: 'AWS S3 Data Lake' },
    { id: 'rem-h7', date: '2024-03-09T11:00:00Z', type: 'tokenization', user: 'Sarah Kim', items: 6, riskImpact: -4, status: 'failed', connection: 'Databricks ML Workspace' },
    { id: 'rem-h8', date: '2024-03-08T15:30:00Z', type: 'anonymization', user: 'Sarah Kim', items: 15, riskImpact: -10, status: 'pending_approval', connection: 'Databricks ML Workspace' }
  ];

  // ---- Mock approval queue rows ----
  var approvalRows = [
    { id: 'appr-r1', date: '2024-03-14T14:30:00Z', requestor: 'Jordan Chen', type: 'tokenization', scope: 12, riskImpact: -13, status: 'pending', priority: 'urgent', connection: 'Snowflake Production', notes: 'Customer PII risk identified. Need to tokenize SSN and email columns for CCPA compliance deadline.' },
    { id: 'appr-r2', date: '2024-03-13T09:00:00Z', requestor: 'Alex Rivera', type: 'revoke_access', scope: 5, riskImpact: -8, status: 'pending', priority: 'normal', connection: 'BigQuery Analytics', notes: 'Revoking access for former contractor accounts.' },
    { id: 'appr-r3', date: '2024-03-10T11:00:00Z', requestor: 'Jordan Chen', type: 'tokenization', scope: 30, riskImpact: -22, status: 'pending', priority: 'normal', connection: 'Snowflake Production', notes: 'Bulk tokenization across multiple schemas.' }
  ];


  // ============================================================
  // 1. Remediation History (/remediation)
  // ============================================================
  function renderRemediationHistory() {
    var content = getContent();
    if (!content) return;

    var activeTab = State.get('remediationTab') || 'history';
    var pendingCount = approvalRows.filter(function(a) { return a.status === 'pending'; }).length;

    var html = '';

    // Page header
    html += Components.pageHeader(
      'Remediation',
      null,
      Components.button('New Remediation', 'primary', 'md', 'data-navigate="#/remediation/configure"')
    );

    // Tabs
    html += Components.tabs([
      { id: 'history', label: 'History' },
      { id: 'approvals', label: 'Approvals', badge: pendingCount > 0 ? pendingCount : null }
    ], activeTab, 'data-rem-tab');

    // Tab content
    if (activeTab === 'history') {
      html += renderHistoryTab();
    } else {
      html += renderApprovalsTabContent();
    }

    content.innerHTML = html;

    // Tab switching
    content.onclick = function(e) {
      var tab = e.target.closest('[data-rem-tab]');
      if (tab) {
        var tabId = tab.getAttribute('data-rem-tab');
        State.set('remediationTab', tabId);
        renderRemediationHistory();
      }
    };
  }

  function renderHistoryTab() {
    var html = '';

    // Filter bar
    html += Components.filterBar([
      { name: 'type', options: [
        { value: '', label: 'All Types' },
        { value: 'tokenization', label: 'Tokenize' },
        { value: 'masking', label: 'Mask' },
        { value: 'deletion', label: 'Delete' },
        { value: 'encryption', label: 'Encrypt' },
        { value: 'anonymization', label: 'Anonymize' }
      ]},
      { name: 'status', options: [
        { value: '', label: 'All Statuses' },
        { value: 'completed', label: 'Completed' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'pending', label: 'Pending' },
        { value: 'failed', label: 'Failed' },
        { value: 'scheduled', label: 'Scheduled' }
      ]}
    ], 'Search remediations...');

    // History table
    if (historyRows.length === 0) {
      html += Components.emptyState(
        Icons.wrench,
        'No remediations yet',
        'Remediations you execute will appear here.',
        Components.button('Start a Remediation', 'primary', 'md', 'data-navigate="#/remediation/configure"')
      );
    } else {
      html += Components.dataTable({
        columns: [
          { key: 'date', label: 'Date', width: '160px', render: function(val) { return Data.formatDateTime(val); } },
          { key: 'type', label: 'Type', render: function(val) { return typeLabel(val); } },
          { key: 'user', label: 'User' },
          { key: 'items', label: 'Items', width: '80px' },
          { key: 'riskImpact', label: 'Risk Impact', width: '110px', render: function(val) { return riskImpactDisplay(val); } },
          { key: 'connection', label: 'Connection' },
          { key: 'status', label: 'Status', width: '140px', render: function(val) { return remStatusTag(val); } }
        ],
        rows: historyRows,
        onRowClick: function(row) { return '#/remediation/' + row.id; }
      });
    }

    return html;
  }

  function renderApprovalsTabContent() {
    var html = '';

    // Filter bar
    html += Components.filterBar([
      { name: 'status', options: [
        { value: '', label: 'All Statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' }
      ]}
    ], 'Search approvals...');

    if (approvalRows.length === 0) {
      html += Components.emptyState(
        Icons.check,
        'No pending approvals',
        'Approval requests will appear here when submitted.'
      );
    } else {
      html += Components.dataTable({
        columns: [
          { key: 'date', label: 'Request Date', width: '150px', render: function(val) { return Data.formatDateTime(val); } },
          { key: 'requestor', label: 'Requestor' },
          { key: 'type', label: 'Action Type', render: function(val) { return typeLabel(val); } },
          { key: 'scope', label: 'Scope', width: '80px', render: function(val) { return val + ' items'; } },
          { key: 'riskImpact', label: 'Risk Impact', width: '100px', render: function(val) { return riskImpactDisplay(val); } },
          { key: 'status', label: 'Status', width: '130px', render: function(val, row) {
            var tag = remStatusTag(val);
            if (row.priority === 'urgent') {
              tag = Components.tag('Urgent', 'warning') + ' ' + tag;
            }
            return tag;
          }},
          { key: 'date', label: 'Time Left', width: '100px', render: function(val) { return expiryDisplay(val); } }
        ],
        rows: approvalRows,
        onRowClick: function(row) { return '#/remediation/approval/' + row.id; }
      });
    }

    return html;
  }


  // ============================================================
  // 2. Configure Remediation (/remediation/configure)
  // ============================================================
  function renderConfigureRemediation() {
    var content = getContent();
    if (!content) return;

    var activeAction = State.get('remActionType') || 'tokenize';

    var html = '';

    // Breadcrumb
    html += Components.breadcrumb([
      { label: 'Remediation', href: '#/remediation' },
      { label: 'Configure Remediation' }
    ]);

    // Page header
    html += Components.pageHeader(
      'Configure Remediation',
      null,
      Components.button('Cancel', 'secondary', 'md', 'data-navigate="#/remediation"')
    );

    // Wizard stepper
    html += Components.wizardSteps(wizardSteps, 0);

    // Context banner
    html += '<div class="sds-card" style="background:var(--sds-status-info-bg);border:1px solid var(--sds-color-blue-200,#b3d4fc);margin-bottom:20px;">';
    html += '<div class="sds-card-body" style="display:flex;align-items:center;gap:10px;padding:14px 20px;">';
    html += '<span style="color:var(--sds-status-info-text);">' + Icons.info + '</span>';
    html += '<div>';
    html += '<div style="font-weight:500;color:var(--sds-text-primary);">Pre-filled from: Customer PII Risk</div>';
    html += '<div style="color:var(--sds-text-secondary);font-size:13px;">12 columns across 3 tables selected</div>';
    html += '</div>';
    html += '</div></div>';

    // 2-column layout
    html += '<div style="display:grid;grid-template-columns:1.5fr 1fr;gap:24px;">';

    // LEFT: Configuration form
    html += '<div>';

    // Action Type section
    html += '<div style="margin-bottom:24px;">';
    html += '<div style="font-size:16px;font-weight:600;color:var(--sds-text-primary);margin-bottom:12px;">Action Type</div>';
    html += Components.toggleTabs([
      { id: 'tokenize', label: 'Tokenize' },
      { id: 'revoke', label: 'Revoke Access' },
      { id: 'delete', label: 'Delete Data' },
      { id: 'apply_policy', label: 'Apply Policy' }
    ], activeAction);
    html += '</div>';

    // Type-specific configuration
    html += '<div style="margin-bottom:24px;">';
    html += '<div style="font-size:16px;font-weight:600;color:var(--sds-text-primary);margin-bottom:12px;">Configuration</div>';

    if (activeAction === 'tokenize') {
      html += Components.formGroup('Tokenization Policy',
        Components.formSelect('policy', [
          { value: 'pol-1', label: 'PII Tokenization - Production' },
          { value: 'pol-2', label: 'PCI Data Masking' },
          { value: 'pol-3', label: 'PHI Encryption at Rest' }
        ], 'pol-1'),
        '<a href="#" style="color:var(--sds-text-link);font-size:13px;">+ Create new policy</a>'
      );
      html += Components.formGroup('Token Format',
        Components.formSelect('format', [
          { value: 'prefix', label: 'Prefixed token (tok_xxxx)' },
          { value: 'uuid', label: 'UUID format' },
          { value: 'hash', label: 'SHA-256 hash' }
        ], 'prefix')
      );
      html += Components.formGroup('Preserve Format',
        '<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;"><input type="checkbox" checked> Maintain original data length where possible</label>'
      );
    } else if (activeAction === 'revoke') {
      html += Components.formGroup('Revoke From',
        Components.formSelect('grant_type', [
          { value: 'role', label: 'All non-essential roles' },
          { value: 'user', label: 'Specific users' },
          { value: 'group', label: 'Specific groups' }
        ], 'role')
      );
      html += Components.formGroup('Keep Access For',
        Components.formSelect('keep_access', [
          { value: 'admin', label: 'Data Admins only' },
          { value: 'owner', label: 'Data Owner + Admins' },
          { value: 'custom', label: 'Custom selection...' }
        ], 'owner')
      );
    } else if (activeAction === 'delete') {
      html += '<div class="sds-card" style="background:var(--sds-status-error-bg);border-left:4px solid var(--sds-status-error-strong);margin-bottom:16px;">';
      html += '<div class="sds-card-body" style="padding:14px 20px;color:var(--sds-status-error-text);font-size:14px;">';
      html += Icons.warning + ' <strong>Deletion is permanent and cannot be reversed.</strong> This will remove the selected data from the source.';
      html += '</div></div>';
      html += Components.formGroup('Deletion Scope',
        Components.formSelect('scope', [
          { value: 'data', label: 'Data only (preserve schema)' },
          { value: 'column', label: 'Column + data' },
          { value: 'table', label: 'Entire table' }
        ], 'data')
      );
      html += Components.formGroup('Confirmation',
        '<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;"><input type="checkbox"> I understand this action is irreversible</label>'
      );
    } else if (activeAction === 'apply_policy') {
      html += Components.formGroup('Policy to Apply',
        Components.formSelect('apply_pol', [
          { value: 'pol-1', label: 'PII Tokenization - Production' },
          { value: 'pol-2', label: 'PCI Data Masking' },
          { value: 'pol-3', label: 'PHI Encryption at Rest' },
          { value: 'pol-5', label: 'ML Training Data Anonymization' }
        ], 'pol-1')
      );
      html += Components.formGroup('Override Existing Policy',
        '<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;"><input type="checkbox"> Override if a different policy is already applied</label>'
      );
    }
    html += '</div>';

    // Schedule section
    html += '<div style="margin-bottom:24px;">';
    html += '<div style="font-size:16px;font-weight:600;color:var(--sds-text-primary);margin-bottom:12px;">Schedule</div>';
    html += '<div style="display:flex;flex-direction:column;gap:10px;">';
    html += '<label style="display:flex;align-items:center;gap:8px;font-size:14px;cursor:pointer;"><input type="radio" name="schedule" value="now" checked> Execute now</label>';
    html += '<label style="display:flex;align-items:center;gap:8px;font-size:14px;cursor:pointer;"><input type="radio" name="schedule" value="later"> Schedule for later</label>';
    html += '</div>';
    html += '</div>';

    html += '</div>'; // end LEFT column

    // RIGHT: Affected items
    html += '<div>';
    html += Components.card({
      title: 'Affected Items',
      actions: Components.badge(affectedItems.length, 'info'),
      body: (function() {
        var b = '<input class="form-input" type="text" placeholder="Search items..." style="margin-bottom:12px;">';
        b += '<div style="max-height:400px;overflow-y:auto;">';
        for (var i = 0; i < affectedItems.length; i++) {
          var item = affectedItems[i];
          b += '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--sds-border-subtle);">';
          b += '<input type="checkbox"' + (item.checked ? ' checked' : '') + '>';
          b += '<div style="flex:1;min-width:0;">';
          b += '<div style="font-size:13px;color:var(--sds-text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + item.path + '</div>';
          b += '<div style="font-size:12px;color:var(--sds-text-tertiary);">' + item.type + '</div>';
          b += '</div>';
          b += Components.sensitivityTag(item.sensitivity);
          b += '</div>';
        }
        b += '</div>';
        return b;
      })(),
      footer: '<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;">' +
        '<a href="#" style="color:var(--sds-text-link);">Select all</a>' +
        '<a href="#" style="color:var(--sds-text-link);">Remove selected</a>' +
        '</div>'
    });
    html += '</div>'; // end RIGHT column

    html += '</div>'; // end 2-column grid

    // Sticky footer
    html += '<div class="wizard-footer" style="display:flex;justify-content:flex-end;gap:12px;padding:20px 0;margin-top:24px;border-top:1px solid var(--sds-border-default);">';
    html += Components.button('Cancel', 'secondary', 'md', 'data-navigate="#/remediation"');
    html += Components.button('Preview Impact', 'primary', 'md', 'data-navigate="#/remediation/preview"');
    html += '</div>';

    content.innerHTML = html;

    // Toggle tab switching for action type
    content.onclick = function(e) {
      var toggle = e.target.closest('[data-toggle]');
      if (toggle) {
        State.set('remActionType', toggle.getAttribute('data-toggle'));
        renderConfigureRemediation();
      }
    };
  }


  // ============================================================
  // 3. Preview Impact (/remediation/preview)
  // ============================================================
  function renderPreviewImpact() {
    var content = getContent();
    if (!content) return;

    var currentScore = Data.riskScore.current; // 67
    var projectedScore = 52;
    var delta = currentScore - projectedScore;

    var html = '';

    // Breadcrumb
    html += Components.breadcrumb([
      { label: 'Remediation', href: '#/remediation' },
      { label: 'Configure', href: '#/remediation/configure' },
      { label: 'Preview Impact' }
    ]);

    // Page header
    html += Components.pageHeader(
      'Preview Impact',
      null,
      Components.button('Edit Configuration', 'secondary', 'md', 'data-navigate="#/remediation/configure"')
    );

    // Wizard stepper
    html += Components.wizardSteps(wizardSteps, 1);

    // Warning banner
    html += '<div style="background:var(--sds-status-warning-bg);border-left:4px solid var(--sds-status-warning-strong);padding:14px 20px;border-radius:6px;margin-bottom:20px;display:flex;align-items:flex-start;gap:10px;">';
    html += '<span style="color:var(--sds-status-warning-text);flex-shrink:0;margin-top:1px;">' + Icons.warning + '</span>';
    html += '<div style="color:var(--sds-status-warning-text);font-size:14px;">';
    html += '<strong>This will modify production data in Snowflake Production.</strong><br>';
    html += 'Consider running a dry run first to validate the changes.';
    html += '</div></div>';

    // Risk Score Projection Card
    html += Components.card({
      title: 'Risk Score Projection',
      body: '<div style="display:flex;align-items:center;justify-content:center;gap:40px;padding:24px 0;">' +
        '<div style="text-align:center;">' +
          '<div style="font-size:12px;color:var(--sds-text-tertiary);margin-bottom:8px;">Current Risk Score</div>' +
          '<div style="font-size:48px;font-weight:700;color:var(--sds-status-error-text);">' + currentScore + '</div>' +
        '</div>' +
        '<div style="color:var(--sds-text-tertiary);font-size:32px;">' + Icons.render('arrow-right', 32) + '</div>' +
        '<div style="text-align:center;">' +
          '<div style="font-size:12px;color:var(--sds-text-tertiary);margin-bottom:8px;">Projected Risk Score</div>' +
          '<div style="font-size:48px;font-weight:700;color:var(--sds-status-warning-text);">' + projectedScore + '</div>' +
        '</div>' +
        '<div style="text-align:center;">' +
          '<span style="display:inline-block;background:var(--sds-status-success-bg);color:var(--sds-status-success-text);padding:6px 14px;border-radius:20px;font-size:14px;font-weight:600;">&darr; ' + delta + ' points</span>' +
          '<div style="font-size:13px;color:var(--sds-status-success-text);margin-top:6px;">Risk reduced by ' + Math.round((delta / currentScore) * 100) + '%</div>' +
        '</div>' +
      '</div>'
    });

    // Summary Card
    html += Components.card({
      body: '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;padding:4px 0;">' +
        '<div><div style="font-size:12px;color:var(--sds-text-secondary);margin-bottom:4px;">Action</div><div style="font-weight:500;">Tokenize</div></div>' +
        '<div><div style="font-size:12px;color:var(--sds-text-secondary);margin-bottom:4px;">Items</div><div style="font-weight:500;">12 columns</div></div>' +
        '<div><div style="font-size:12px;color:var(--sds-text-secondary);margin-bottom:4px;">Tables</div><div style="font-weight:500;">3 tables</div></div>' +
        '<div><div style="font-size:12px;color:var(--sds-text-secondary);margin-bottom:4px;">Connection</div><div style="font-weight:500;">Snowflake Production</div></div>' +
      '</div>'
    });

    // Before/After Comparison
    html += Components.card({
      title: 'Before / After Comparison',
      body: '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0;">' +
        '<div>' +
          '<div style="background:var(--sds-bg-subtle);padding:10px 16px;font-size:12px;font-weight:600;color:var(--sds-text-secondary);border-bottom:1px solid var(--sds-border-subtle);">Before (Current Data)</div>' +
          (function() {
            var s = '';
            for (var i = 0; i < beforeAfterSamples.length; i++) {
              var row = beforeAfterSamples[i];
              s += '<div style="padding:10px 16px;border-bottom:1px solid var(--sds-border-subtle);font-size:13px;color:var(--sds-text-secondary);">';
              s += '<span style="color:var(--sds-text-tertiary);font-size:11px;">' + row.column + ':</span> ' + row.before;
              s += '</div>';
            }
            return s;
          })() +
        '</div>' +
        '<div style="border-left:1px solid var(--sds-border-default);">' +
          '<div style="background:var(--sds-status-info-bg);padding:10px 16px;font-size:12px;font-weight:600;color:var(--sds-status-info-text);border-bottom:1px solid var(--sds-border-subtle);">After (Tokenized)</div>' +
          (function() {
            var s = '';
            for (var i = 0; i < beforeAfterSamples.length; i++) {
              var row = beforeAfterSamples[i];
              s += '<div style="padding:10px 16px;border-bottom:1px solid var(--sds-border-subtle);font-size:13px;color:var(--sds-status-info-text);background:var(--sds-status-info-bg);">';
              s += '<span style="color:var(--sds-text-tertiary);font-size:11px;">' + row.column + ':</span> ' + row.after;
              s += '</div>';
            }
            return s;
          })() +
        '</div>' +
      '</div>'
    });

    // Affected Items Table
    html += '<div style="margin-top:20px;">';
    html += Components.card({
      title: 'Affected Items',
      body: Components.dataTable({
        columns: [
          { key: 'column', label: 'Column' },
          { key: 'table', label: 'Table' },
          { key: 'type', label: 'Type' },
          { key: 'sensitivity', label: 'Sensitivity', render: function(val) { return Components.sensitivityTag(val); } },
          { key: 'status', label: 'Action', render: function() { return Components.tag('Will tokenize', 'info'); } }
        ],
        rows: affectedItems.map(function(item) {
          return { column: item.column, table: item.table, type: item.type, sensitivity: item.sensitivity };
        })
      })
    });
    html += '</div>';

    // Sticky footer
    html += '<div class="wizard-footer" style="display:flex;justify-content:flex-end;gap:12px;padding:20px 0;margin-top:24px;border-top:1px solid var(--sds-border-default);">';
    html += Components.button('Back', 'secondary', 'md', 'data-navigate="#/remediation/configure"');
    html += Components.button('Dry Run', 'secondary', 'md', 'data-navigate="#/remediation/dryrun"');
    html += Components.button('Execute', 'primary', 'md', 'data-navigate="#/remediation/execute"');
    html += '</div>';

    content.innerHTML = html;
  }


  // ============================================================
  // 4. Dry Run Results (/remediation/dryrun)
  // ============================================================
  function renderDryRunResults() {
    var content = getContent();
    if (!content) return;

    var totalTested = dryRunResults.length;
    var wouldSucceed = dryRunResults.filter(function(r) { return r.status === 'success'; }).length;
    var wouldFail = dryRunResults.filter(function(r) { return r.status === 'fail'; }).length;
    var hasFails = wouldFail > 0;

    var html = '';

    // Breadcrumb
    html += Components.breadcrumb([
      { label: 'Remediation', href: '#/remediation' },
      { label: 'Configure', href: '#/remediation/configure' },
      { label: 'Preview', href: '#/remediation/preview' },
      { label: 'Dry Run Results' }
    ]);

    // Page header
    html += Components.pageHeader('Dry Run Results');

    // Status banner
    var bannerBg = hasFails ? 'var(--sds-status-warning-bg)' : 'var(--sds-status-success-bg)';
    var bannerBorder = hasFails ? 'var(--sds-status-warning-strong)' : 'var(--sds-status-success-strong)';
    var bannerTextColor = hasFails ? 'var(--sds-status-warning-text)' : 'var(--sds-status-success-text)';
    var bannerIcon = hasFails ? Icons.warning : Icons.check;
    var bannerMessage = hasFails
      ? 'Dry run completed with warnings. ' + wouldFail + ' item(s) would fail. No data was modified.'
      : 'Dry run completed successfully. No data was modified.';

    html += '<div style="background:' + bannerBg + ';border-left:4px solid ' + bannerBorder + ';padding:14px 20px;border-radius:6px;margin-bottom:20px;display:flex;align-items:center;gap:10px;">';
    html += '<span style="color:' + bannerTextColor + ';">' + bannerIcon + '</span>';
    html += '<div style="color:' + bannerTextColor + ';font-size:14px;">' + bannerMessage + '</div>';
    html += '</div>';

    // Metric cards
    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px;">';
    html += Components.statCard('Items Tested', totalTested);
    html += '<div class="sds-card"><div class="stat-card">';
    html += '<div class="stat-card-label">Would Succeed</div>';
    html += '<div class="stat-card-value" style="color:var(--sds-status-success-text);">' + wouldSucceed + '</div>';
    html += '</div></div>';
    html += '<div class="sds-card"><div class="stat-card">';
    html += '<div class="stat-card-label">Would Fail</div>';
    html += '<div class="stat-card-value" style="color:' + (wouldFail > 0 ? 'var(--sds-status-error-text)' : 'var(--sds-text-primary)') + ';">' + wouldFail + '</div>';
    html += '</div></div>';
    html += '</div>';

    // Results table
    html += Components.card({
      title: 'Results',
      body: Components.dataTable({
        columns: [
          { key: 'column', label: 'Column' },
          { key: 'table', label: 'Table' },
          { key: 'result', label: 'Simulated Result' },
          { key: 'status', label: 'Status', width: '160px', render: function(val, row) {
            if (val === 'success') {
              return Components.tag('Would succeed', 'success');
            }
            return Components.tag('Would fail', 'error') +
              (row.error ? '<div style="font-size:12px;color:var(--sds-status-error-text);margin-top:4px;">' + row.error + '</div>' : '');
          }}
        ],
        rows: dryRunResults
      })
    });

    // Sticky footer
    html += '<div class="wizard-footer" style="display:flex;justify-content:flex-end;gap:12px;padding:20px 0;margin-top:24px;border-top:1px solid var(--sds-border-default);">';
    html += Components.button('Back to Configure', 'secondary', 'md', 'data-navigate="#/remediation/configure"');
    html += Components.button('Proceed for Real', 'primary', 'md', 'data-navigate="#/remediation/execute"');
    html += '</div>';

    content.innerHTML = html;
  }


  // ============================================================
  // 5. Execution Progress (/remediation/execute)
  // ============================================================
  function renderExecutionProgress() {
    var content = getContent();
    if (!content) return;

    var doneCount = executionItems.filter(function(i) { return i.status === 'done'; }).length;
    var total = executionItems.length;
    var percent = Math.round((doneCount / total) * 100);
    // Simulate 73% for prototype
    var displayPercent = 73;
    var displayDone = 8;

    var html = '';

    // Breadcrumb
    html += Components.breadcrumb([
      { label: 'Remediation', href: '#/remediation' },
      { label: 'Executing' }
    ]);

    // Page header
    html += Components.pageHeader('Remediation in Progress');

    // Centered content
    html += '<div style="max-width:720px;margin:0 auto;">';

    // Progress card
    html += Components.card({
      body: '<div style="padding:24px;">' +
        '<div style="font-size:14px;color:var(--sds-text-secondary);margin-bottom:16px;">Tokenizing 12 columns across 3 tables</div>' +
        Components.progressBar(displayPercent) +
        '<div style="display:flex;justify-content:space-between;margin-top:12px;">' +
          '<span style="font-size:16px;font-weight:600;color:var(--sds-text-primary);">' + displayDone + ' of ' + total + ' (' + displayPercent + '%)</span>' +
          '<span style="font-size:13px;color:var(--sds-text-tertiary);">Elapsed: 1m 23s &nbsp;&middot;&nbsp; Est. remaining: ~45s</span>' +
        '</div>' +
      '</div>'
    });

    // Per-item status list
    html += Components.card({
      title: 'Item Status',
      body: (function() {
        var s = '';
        for (var i = 0; i < executionItems.length; i++) {
          var item = executionItems[i];
          var icon = '';
          var statusTag = '';
          var durationText = '';

          if (item.status === 'done') {
            icon = '<span style="color:var(--sds-status-success-strong);">' + Icons.check + '</span>';
            statusTag = Components.tag('Done', 'success');
            durationText = '<span style="font-size:12px;color:var(--sds-text-tertiary);">' + item.duration + '</span>';
          } else if (item.status === 'executing') {
            icon = '<span style="color:var(--sds-interactive-primary);animation:spin 1s linear infinite;display:inline-block;">' + Icons.refresh + '</span>';
            statusTag = Components.tag('Executing', 'info');
          } else if (item.status === 'failed') {
            icon = '<span style="color:var(--sds-status-error-strong);">' + Icons.close + '</span>';
            statusTag = Components.tag('Failed', 'error');
          } else {
            icon = '<span style="color:var(--sds-text-disabled);">' + Icons.clock + '</span>';
            statusTag = Components.tag('Queued', 'neutral');
          }

          s += '<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--sds-border-subtle);">';
          s += '<span style="width:18px;height:18px;flex-shrink:0;">' + icon + '</span>';
          s += '<span style="flex:1;font-size:13px;color:var(--sds-text-primary);">' + item.name + '</span>';
          s += statusTag;
          s += durationText;
          s += '</div>';
        }
        return s;
      })()
    });

    // Footer
    html += '<div style="display:flex;justify-content:flex-end;gap:12px;padding:20px 0;">';
    html += Components.button('Cancel Remediation', 'secondary', 'md', 'data-navigate="#/remediation"');
    html += Components.button('View Results', 'primary', 'md', 'data-navigate="#/remediation/success"');
    html += '</div>';

    html += '</div>'; // end centered

    // Add spinning animation
    html += '<style>@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }</style>';

    content.innerHTML = html;

    // Auto-navigate to success after 5 seconds
    setTimeout(function() {
      Router.navigate('#/remediation/success');
    }, 5000);
  }


  // ============================================================
  // 6. Remediation Success (/remediation/success)
  // ============================================================
  function renderRemediationSuccess() {
    var content = getContent();
    if (!content) return;

    var beforeScore = Data.riskScore.current; // 67
    var afterScore = 52;
    var delta = beforeScore - afterScore;
    var pctReduction = Math.round((delta / beforeScore) * 100);

    var html = '';

    // Centered celebration
    html += '<div style="max-width:640px;margin:60px auto;text-align:center;">';

    // Animated checkmark
    html += '<div style="width:80px;height:80px;margin:0 auto 24px;background:var(--sds-status-success-bg);border-radius:50%;display:flex;align-items:center;justify-content:center;animation:scaleIn 0.3s ease-out;">';
    html += '<svg width="40" height="40" viewBox="0 0 18 18" fill="none" stroke="var(--sds-status-success-strong)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation:drawCheck 0.4s 0.3s ease-out both;"><path d="M4 9l3.5 3.5L14 5"/></svg>';
    html += '</div>';

    // Title
    html += '<h1 style="font-size:28px;font-weight:700;color:var(--sds-text-primary);margin-bottom:32px;animation:fadeSlideUp 0.2s 0.7s ease-out both;">Remediation Complete</h1>';

    // Risk Score Animation
    html += '<div style="display:flex;align-items:center;justify-content:center;gap:32px;margin-bottom:16px;animation:fadeSlideUp 0.2s 0.9s ease-out both;">';
    html += '<div>';
    html += '<div style="font-size:12px;color:var(--sds-text-tertiary);margin-bottom:4px;">Before</div>';
    html += '<div class="score-before" style="font-size:48px;font-weight:700;color:var(--sds-status-error-text);">' + beforeScore + '</div>';
    html += '</div>';
    html += '<div style="font-size:32px;color:var(--sds-text-tertiary);">' + Icons.render('arrow-right', 28) + '</div>';
    html += '<div>';
    html += '<div style="font-size:12px;color:var(--sds-text-tertiary);margin-bottom:4px;">After</div>';
    html += '<div class="score-after" style="font-size:48px;font-weight:700;color:var(--sds-status-warning-text);">' + afterScore + '</div>';
    html += '</div>';
    html += '</div>';

    // Delta badge
    html += '<div style="margin-bottom:32px;animation:fadeSlideUp 0.2s 1.1s ease-out both;">';
    html += '<span style="display:inline-block;background:var(--sds-status-success-bg);color:var(--sds-status-success-text);padding:8px 20px;border-radius:24px;font-size:15px;font-weight:600;">&darr; ' + delta + ' points</span>';
    html += '<div style="font-size:14px;color:var(--sds-status-success-text);margin-top:8px;font-weight:500;">Risk reduced by ' + pctReduction + '%</div>';
    html += '</div>';

    // What Changed Summary
    html += '<div style="animation:fadeSlideUp 0.2s 1.3s ease-out both;">';
    html += Components.card({
      title: 'What Changed',
      body: '<div style="text-align:left;padding:4px 0;">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
          '<div><span style="font-size:13px;color:var(--sds-text-secondary);">Items</span><div style="font-weight:500;">12 columns tokenized</div></div>' +
          '<div><span style="font-size:13px;color:var(--sds-text-secondary);">Tables</span><div style="font-weight:500;">3 tables affected</div></div>' +
          '<div><span style="font-size:13px;color:var(--sds-text-secondary);">Connection</span><div style="font-weight:500;">Snowflake Production</div></div>' +
          '<div><span style="font-size:13px;color:var(--sds-text-secondary);">Duration</span><div style="font-weight:500;">2m 15s</div></div>' +
        '</div>' +
        '<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--sds-border-subtle);">' +
          '<span style="font-size:13px;color:var(--sds-text-secondary);">Audit log entry: </span>' +
          '<a href="#/remediation/rem-h1" style="color:var(--sds-text-link);font-size:13px;">#4521</a>' +
        '</div>' +
      '</div>'
    });
    html += '</div>';

    // Action buttons
    html += '<div style="display:flex;flex-direction:column;align-items:center;gap:12px;margin-top:32px;animation:fadeSlideUp 0.2s 1.5s ease-out both;">';
    html += Components.button('Return to Dashboard', 'primary', 'lg', 'data-navigate="#/dashboard"');
    html += Components.button('Remediate More', 'secondary', 'md', 'data-navigate="#/remediation/configure"');
    html += Components.button('View History', 'tertiary', 'md', 'data-navigate="#/remediation"');
    html += '</div>';

    html += '</div>'; // end centered

    // Animations
    html += '<style>';
    html += '@keyframes scaleIn { from { transform: scale(0); } to { transform: scale(1); } }';
    html += '@keyframes drawCheck { from { stroke-dasharray: 24; stroke-dashoffset: 24; } to { stroke-dasharray: 24; stroke-dashoffset: 0; } }';
    html += '@keyframes fadeSlideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }';
    html += '</style>';

    content.innerHTML = html;
  }


  // ============================================================
  // 7. Remediation Detail (/remediation/:id)
  // ============================================================
  function renderRemediationDetail(params) {
    var content = getContent();
    if (!content) return;

    var id = params.id;
    // Find in mock history or fall back to Data.remediations
    var rem = null;
    for (var i = 0; i < historyRows.length; i++) {
      if (historyRows[i].id === id) { rem = historyRows[i]; break; }
    }
    if (!rem) {
      for (var j = 0; j < Data.remediations.length; j++) {
        if (Data.remediations[j].id === id) {
          var dr = Data.remediations[j];
          rem = {
            id: dr.id,
            date: dr.createdAt,
            type: dr.type,
            user: dr.assignee,
            items: dr.items,
            riskImpact: -13,
            status: dr.status,
            connection: dr.connection
          };
          break;
        }
      }
    }
    if (!rem) {
      rem = historyRows[0]; // Fallback to first mock item
    }

    var title = typeLabel(rem.type) + ' ' + rem.items + ' columns';
    var canRollback = rem.status === 'completed' && rem.type !== 'deletion';

    var html = '';

    // Breadcrumb
    html += Components.breadcrumb([
      { label: 'Remediation', href: '#/remediation' },
      { label: title }
    ]);

    // Page header
    html += '<div class="page-header">';
    html += '<div style="display:flex;align-items:center;gap:12px;">';
    html += '<h1 class="page-title">' + title + '</h1>';
    html += remStatusTag(rem.status);
    html += '</div>';
    if (canRollback) {
      html += '<div>' + Components.button('Rollback', 'secondary', 'md', 'data-navigate="#/remediation/' + rem.id + '/rollback" style="border-color:var(--sds-status-error-strong);color:var(--sds-status-error-text);"') + '</div>';
    }
    html += '</div>';

    // Metadata Card
    html += Components.card({
      body: '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0;">' +
        '<div style="padding:16px;border-right:1px solid var(--sds-border-subtle);border-bottom:1px solid var(--sds-border-subtle);">' +
          '<div style="font-size:12px;color:var(--sds-text-tertiary);margin-bottom:4px;">Executed by</div>' +
          '<div style="font-weight:500;">' + rem.user + '</div>' +
        '</div>' +
        '<div style="padding:16px;border-right:1px solid var(--sds-border-subtle);border-bottom:1px solid var(--sds-border-subtle);">' +
          '<div style="font-size:12px;color:var(--sds-text-tertiary);margin-bottom:4px;">Date</div>' +
          '<div style="font-weight:500;">' + Data.formatDateTime(rem.date) + '</div>' +
        '</div>' +
        '<div style="padding:16px;border-bottom:1px solid var(--sds-border-subtle);">' +
          '<div style="font-size:12px;color:var(--sds-text-tertiary);margin-bottom:4px;">Duration</div>' +
          '<div style="font-weight:500;">2m 15s</div>' +
        '</div>' +
        '<div style="padding:16px;border-right:1px solid var(--sds-border-subtle);">' +
          '<div style="font-size:12px;color:var(--sds-text-tertiary);margin-bottom:4px;">Connection</div>' +
          '<div style="font-weight:500;">' + rem.connection + '</div>' +
        '</div>' +
        '<div style="padding:16px;border-right:1px solid var(--sds-border-subtle);">' +
          '<div style="font-size:12px;color:var(--sds-text-tertiary);margin-bottom:4px;">Action Type</div>' +
          '<div style="font-weight:500;">' + typeLabel(rem.type) + '</div>' +
        '</div>' +
        '<div style="padding:16px;">' +
          '<div style="font-size:12px;color:var(--sds-text-tertiary);margin-bottom:4px;">Risk Impact</div>' +
          '<div style="font-weight:500;">' + riskImpactDisplay(rem.riskImpact) + ' <span style="font-size:12px;color:var(--sds-text-tertiary);">(67 &rarr; 52)</span></div>' +
        '</div>' +
      '</div>'
    });

    // Approval Chain (conditional)
    if (rem.status === 'completed' || rem.status === 'pending_approval') {
      html += Components.card({
        title: 'Approval Chain',
        body: '<div style="padding:8px 0;">' +
          '<div style="display:flex;align-items:flex-start;gap:12px;padding:8px 0;">' +
            '<div style="width:10px;height:10px;border-radius:50%;background:var(--sds-status-success-strong);margin-top:4px;flex-shrink:0;"></div>' +
            '<div><div style="font-weight:500;">Requested by Jordan Chen</div><div style="font-size:12px;color:var(--sds-text-tertiary);">Mar 14, 1:20 PM</div></div>' +
          '</div>' +
          '<div style="border-left:2px solid var(--sds-border-default);margin-left:4px;height:16px;"></div>' +
          '<div style="display:flex;align-items:flex-start;gap:12px;padding:8px 0;">' +
            '<div style="width:10px;height:10px;border-radius:50%;background:var(--sds-status-success-strong);margin-top:4px;flex-shrink:0;"></div>' +
            '<div><div style="font-weight:500;">Approved by Priya Sharma</div><div style="font-size:12px;color:var(--sds-text-tertiary);">Mar 14, 2:30 PM</div><div style="font-size:13px;color:var(--sds-text-secondary);margin-top:4px;font-style:italic;">"Reviewed impact. Approved."</div></div>' +
          '</div>' +
        '</div>'
      });
    }

    // Affected Items Table
    html += Components.card({
      title: 'Affected Items',
      body: Components.dataTable({
        columns: [
          { key: 'column', label: 'Column' },
          { key: 'table', label: 'Table' },
          { key: 'sensitivity', label: 'Sensitivity', render: function(val) { return Components.sensitivityTag(val); } },
          { key: 'result', label: 'Result', render: function() { return typeLabel(rem.type); } },
          { key: 'status', label: 'Status', render: function() { return Components.tag('Succeeded', 'success'); } }
        ],
        rows: affectedItems.slice(0, rem.items).map(function(item) {
          return { column: item.column, table: item.table, sensitivity: item.sensitivity };
        })
      })
    });

    // Rollback Info Card
    html += '<div style="margin-top:20px;">';
    if (canRollback) {
      html += Components.card({
        title: 'Rollback Availability',
        body: '<div style="padding:4px 0;">' +
          '<div style="font-size:13px;color:var(--sds-text-secondary);margin-bottom:8px;">Rollback available until: <strong>Apr 13, 2026</strong></div>' +
          '<div style="font-size:14px;color:var(--sds-text-primary);margin-bottom:16px;">Rolling back will detokenize all ' + rem.items + ' columns and increase the risk score by ' + Math.abs(rem.riskImpact) + ' points.</div>' +
          Components.button('Preview Rollback', 'secondary', 'md', 'data-navigate="#/remediation/' + rem.id + '/rollback" style="border-color:var(--sds-status-error-strong);color:var(--sds-status-error-text);"') +
        '</div>'
      });
    } else if (rem.type === 'deletion') {
      html += Components.card({
        title: 'Rollback Availability',
        body: '<div style="font-size:14px;color:var(--sds-text-tertiary);font-style:italic;">Rollback not available. Deletion is permanent.</div>'
      });
    }
    html += '</div>';

    content.innerHTML = html;
  }


  // ============================================================
  // 8. Rollback Preview (/remediation/:id/rollback)
  // ============================================================
  function renderRollbackPreview(params) {
    var content = getContent();
    if (!content) return;

    var id = params.id;
    var currentScore = 52;
    var afterRollback = Data.riskScore.current; // 67
    var delta = afterRollback - currentScore;

    var html = '';

    // Breadcrumb
    html += Components.breadcrumb([
      { label: 'Remediation', href: '#/remediation' },
      { label: 'Detail', href: '#/remediation/' + id },
      { label: 'Rollback Preview' }
    ]);

    // Page header
    html += Components.pageHeader('Rollback Preview');

    // Centered content
    html += '<div style="max-width:720px;margin:0 auto;">';

    // Warning banner
    html += '<div style="background:var(--sds-status-warning-bg);border-left:4px solid var(--sds-status-warning-strong);padding:14px 20px;border-radius:6px;margin-bottom:20px;display:flex;align-items:flex-start;gap:10px;">';
    html += '<span style="color:var(--sds-status-warning-text);flex-shrink:0;margin-top:1px;">' + Icons.warning + '</span>';
    html += '<div style="color:var(--sds-status-warning-text);font-size:14px;">';
    html += '<strong>Rolling back will reverse the tokenization of 12 columns.</strong><br>';
    html += 'Original data will be exposed in the source system.';
    html += '</div></div>';

    // Risk Score Impact Card
    html += Components.card({
      title: 'Risk Score Impact',
      body: '<div style="display:flex;align-items:center;justify-content:center;gap:40px;padding:24px 0;">' +
        '<div style="text-align:center;">' +
          '<div style="font-size:12px;color:var(--sds-text-tertiary);margin-bottom:8px;">Current Score</div>' +
          '<div style="font-size:48px;font-weight:700;color:var(--sds-status-warning-text);">' + currentScore + '</div>' +
        '</div>' +
        '<div style="color:var(--sds-text-tertiary);font-size:32px;">' + Icons.render('arrow-right', 28) + '</div>' +
        '<div style="text-align:center;">' +
          '<div style="font-size:12px;color:var(--sds-text-tertiary);margin-bottom:8px;">After Rollback</div>' +
          '<div style="font-size:48px;font-weight:700;color:var(--sds-status-error-text);">' + afterRollback + '</div>' +
        '</div>' +
        '<div style="text-align:center;">' +
          '<span style="display:inline-block;background:var(--sds-status-error-bg);color:var(--sds-status-error-text);padding:6px 14px;border-radius:20px;font-size:14px;font-weight:600;">&uarr; +' + delta + ' points</span>' +
          '<div style="font-size:13px;color:var(--sds-status-error-text);margin-top:6px;">Risk will increase by ' + Math.round((delta / currentScore) * 100) + '%</div>' +
        '</div>' +
      '</div>'
    });

    // What Will Be Reversed
    html += Components.card({
      title: 'What Will Be Reversed',
      body: '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0;">' +
        '<div>' +
          '<div style="background:var(--sds-bg-subtle);padding:10px 16px;font-size:12px;font-weight:600;color:var(--sds-text-secondary);border-bottom:1px solid var(--sds-border-subtle);">Before Rollback (Tokenized)</div>' +
          '<div style="padding:10px 16px;border-bottom:1px solid var(--sds-border-subtle);font-size:13px;color:var(--sds-text-secondary);">tok_a8f2...x9d1</div>' +
          '<div style="padding:10px 16px;border-bottom:1px solid var(--sds-border-subtle);font-size:13px;color:var(--sds-text-secondary);">tok_e2d1...m4n7</div>' +
          '<div style="padding:10px 16px;font-size:13px;color:var(--sds-text-secondary);">tok_j6k9...s2t5</div>' +
        '</div>' +
        '<div style="border-left:1px solid var(--sds-border-default);">' +
          '<div style="background:var(--sds-status-warning-bg);padding:10px 16px;font-size:12px;font-weight:600;color:var(--sds-status-warning-text);border-bottom:1px solid var(--sds-border-subtle);">After Rollback (Original Data)</div>' +
          '<div style="padding:10px 16px;border-bottom:1px solid var(--sds-border-subtle);font-size:13px;color:var(--sds-status-warning-text);background:var(--sds-status-warning-bg);">123-45-6789</div>' +
          '<div style="padding:10px 16px;border-bottom:1px solid var(--sds-border-subtle);font-size:13px;color:var(--sds-status-warning-text);background:var(--sds-status-warning-bg);">john.doe@example.com</div>' +
          '<div style="padding:10px 16px;font-size:13px;color:var(--sds-status-warning-text);background:var(--sds-status-warning-bg);">(555) 123-4567</div>' +
        '</div>' +
      '</div>'
    });

    // Affected Items Summary
    html += Components.card({
      body: '<div style="padding:4px 0;">' +
        '<div style="font-size:14px;color:var(--sds-text-primary);margin-bottom:8px;">12 columns across 3 tables will be detokenized</div>' +
        '<div style="font-size:13px;color:var(--sds-text-secondary);">Connection: Snowflake Production</div>' +
        '<div style="font-size:13px;color:var(--sds-text-secondary);">Originally remediated by: Jordan Chen on Mar 14</div>' +
      '</div>'
    });

    // Rollback reason + footer
    html += '<div style="margin-top:20px;">';
    html += Components.formGroup('Rollback Reason (optional)',
      '<textarea class="form-input" rows="3" placeholder="Optional: explain why this rollback is needed." style="resize:vertical;"></textarea>'
    );
    html += '</div>';

    html += '<div style="display:flex;justify-content:flex-end;gap:12px;padding:20px 0;margin-top:8px;border-top:1px solid var(--sds-border-default);">';
    html += Components.button('Cancel', 'secondary', 'md', 'data-navigate="#/remediation/' + id + '"');
    html += Components.button('Confirm Rollback', 'primary', 'md', 'data-navigate="#/remediation" style="background:var(--sds-status-error-strong);border-color:var(--sds-status-error-strong);"');
    html += '</div>';

    html += '</div>'; // end centered

    content.innerHTML = html;
  }


  // ============================================================
  // 9. Approval Request (/remediation/approval/request)
  // ============================================================
  function renderApprovalRequest() {
    var content = getContent();
    if (!content) return;

    var html = '';

    // Breadcrumb
    html += Components.breadcrumb([
      { label: 'Remediation', href: '#/remediation' },
      { label: 'Preview', href: '#/remediation/preview' },
      { label: 'Request Approval' }
    ]);

    // Page header
    html += Components.pageHeader('Request Approval');

    // Centered content
    html += '<div style="max-width:640px;margin:0 auto;">';

    // Remediation Summary Card
    html += Components.card({
      title: 'Remediation Summary',
      body: '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:4px 0;">' +
        '<div><span style="font-size:13px;color:var(--sds-text-secondary);">Action</span><div style="font-weight:500;">Tokenize 12 columns</div></div>' +
        '<div><span style="font-size:13px;color:var(--sds-text-secondary);">Connection</span><div style="font-weight:500;">Snowflake Production</div></div>' +
        '<div><span style="font-size:13px;color:var(--sds-text-secondary);">Risk Impact</span><div style="font-weight:500;">' + riskImpactDisplay(-15) + ' <span style="font-size:12px;color:var(--sds-text-tertiary);">(67 &rarr; 52)</span></div></div>' +
        '<div><span style="font-size:13px;color:var(--sds-text-secondary);">Schedule</span><div style="font-weight:500;">Immediate</div></div>' +
        '<div><span style="font-size:13px;color:var(--sds-text-secondary);">Dry-run Status</span><div style="font-weight:500;">' + Components.tag('Passed (11/12)', 'success') + '</div></div>' +
      '</div>'
    });

    // Approver section
    html += Components.card({
      title: 'Approver',
      body: Components.formGroup('Approver (auto-assigned based on data owner)',
        Components.formSelect('approver', [
          { value: 'user-2', label: 'Priya Sharma - Data Privacy Officer' },
          { value: 'user-3', label: 'Marcus Williams - Security Analyst' },
          { value: 'user-4', label: 'Sarah Kim - ML Engineer' }
        ], 'user-2')
      )
    });

    // Request Details
    html += Components.card({
      title: 'Request Details',
      body: (function() {
        var b = '';
        b += '<div style="margin-bottom:16px;">';
        b += '<div style="font-size:13px;font-weight:500;color:var(--sds-text-primary);margin-bottom:8px;">Priority</div>';
        b += '<div style="display:flex;gap:20px;">';
        b += '<label style="display:flex;align-items:center;gap:8px;font-size:14px;cursor:pointer;"><input type="radio" name="priority" value="normal" checked> Normal</label>';
        b += '<label style="display:flex;align-items:center;gap:8px;font-size:14px;cursor:pointer;color:var(--sds-status-warning-text);"><input type="radio" name="priority" value="urgent"> Urgent</label>';
        b += '</div></div>';
        b += Components.formGroup('Notes for Approver',
          '<textarea class="form-input" rows="4" placeholder="Explain the business justification..." style="resize:vertical;"></textarea>'
        );
        b += '<div style="font-size:12px;color:var(--sds-text-tertiary);margin-top:8px;">Request will expire in 7 days if not reviewed.</div>';
        return b;
      })()
    });

    // Footer
    html += '<div style="display:flex;justify-content:flex-end;gap:12px;padding:20px 0;margin-top:8px;border-top:1px solid var(--sds-border-default);">';
    html += Components.button('Cancel', 'secondary', 'md', 'data-navigate="#/remediation/preview"');
    html += Components.button('Submit Request', 'primary', 'md', 'data-navigate="#/remediation"');
    html += '</div>';

    html += '</div>'; // end centered

    content.innerHTML = html;
  }


  // ============================================================
  // 10. Approval Review (/remediation/approval/:id)
  // ============================================================
  function renderApprovalReview(params) {
    var content = getContent();
    if (!content) return;

    var id = params.id;
    var approval = null;
    for (var i = 0; i < approvalRows.length; i++) {
      if (approvalRows[i].id === id) { approval = approvalRows[i]; break; }
    }
    if (!approval) {
      // Also check Data.approvals
      for (var j = 0; j < Data.approvals.length; j++) {
        if (Data.approvals[j].id === id) {
          var da = Data.approvals[j];
          approval = {
            id: da.id,
            date: da.submittedAt,
            requestor: da.submittedBy,
            type: 'tokenization',
            scope: da.items,
            riskImpact: -13,
            status: da.status,
            priority: da.priority === 'critical' ? 'urgent' : 'normal',
            connection: da.connectionName,
            notes: da.description
          };
          break;
        }
      }
    }
    if (!approval) {
      approval = approvalRows[0]; // Fallback
    }

    var isUrgent = approval.priority === 'urgent';

    var html = '';

    // Urgent ribbon
    if (isUrgent) {
      html += Components.alertRibbon(
        'Urgent approval request from ' + approval.requestor,
        'warning'
      );
    }

    // Breadcrumb
    html += Components.breadcrumb([
      { label: 'Remediation', href: '#/remediation' },
      { label: 'Approvals', href: '#/remediation' },
      { label: 'Review' }
    ]);

    // Page header
    html += '<div class="page-header">';
    html += '<div style="display:flex;align-items:center;gap:12px;">';
    html += '<h1 class="page-title">Approval Review</h1>';
    if (isUrgent) html += Components.tag('Urgent', 'warning');
    html += Components.tag('Under Review', 'info');
    html += '</div></div>';
    html += '<div class="page-subtitle" style="margin-top:-8px;margin-bottom:20px;">Requested by ' + approval.requestor + ' on ' + Data.formatDateTime(approval.date) + '</div>';

    // Requestor Notes Card
    if (approval.notes) {
      html += Components.card({
        title: 'Requestor Notes',
        body: '<div style="font-size:14px;color:var(--sds-text-primary);line-height:1.6;">' + approval.notes + '</div>'
      });
    }

    // Impact Preview
    html += Components.card({
      title: 'Impact Preview',
      body: '<div style="display:flex;align-items:center;gap:24px;padding:16px 0;">' +
        '<div>' +
          '<span style="font-size:13px;color:var(--sds-text-secondary);">Risk Score</span>' +
          '<div style="font-weight:600;font-size:18px;">' +
            '<span style="color:var(--sds-status-error-text);">67</span>' +
            ' <span style="color:var(--sds-text-tertiary);">&rarr;</span> ' +
            '<span style="color:var(--sds-status-warning-text);">52</span>' +
            ' <span style="font-size:13px;color:var(--sds-status-success-text);">(' + approval.riskImpact + ' pts)</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;border-top:1px solid var(--sds-border-subtle);padding-top:16px;">' +
        '<div><span style="font-size:12px;color:var(--sds-text-secondary);">Action</span><div style="font-weight:500;">' + typeLabel(approval.type) + '</div></div>' +
        '<div><span style="font-size:12px;color:var(--sds-text-secondary);">Items</span><div style="font-weight:500;">' + approval.scope + ' columns</div></div>' +
        '<div><span style="font-size:12px;color:var(--sds-text-secondary);">Connection</span><div style="font-weight:500;">' + approval.connection + '</div></div>' +
      '</div>'
    });

    // Affected Data Inventory
    html += Components.card({
      title: 'Affected Data',
      body: Components.dataTable({
        columns: [
          { key: 'column', label: 'Column' },
          { key: 'table', label: 'Table' },
          { key: 'schema', label: 'Schema' },
          { key: 'sensitivity', label: 'Sensitivity', render: function(val) { return Components.sensitivityTag(val); } },
          { key: 'type', label: 'Data Type' }
        ],
        rows: affectedItems.slice(0, approval.scope).map(function(item) {
          return { column: item.column, table: item.table, schema: item.schema, sensitivity: item.sensitivity, type: item.type };
        })
      })
    });

    // Dry Run Results
    html += '<div style="margin-top:20px;">';
    html += '<div class="sds-card" style="border-left:4px solid var(--sds-status-success-strong);">';
    html += '<div class="sds-card-body" style="padding:16px 20px;">';
    html += '<div style="font-weight:500;margin-bottom:4px;">Dry Run: Passed</div>';
    html += '<div style="font-size:13px;color:var(--sds-text-secondary);">11 of 12 items would succeed. 1 item would fail: orders.phone_number (format error)</div>';
    html += '</div></div>';
    html += '</div>';

    // Decision Section
    html += '<div style="margin-top:20px;">';
    html += Components.card({
      title: 'Decision',
      body: '<div style="margin-bottom:16px;">' +
        '<textarea class="form-input" rows="3" placeholder="Add a comment (required for reject or request changes)..." style="resize:vertical;"></textarea>' +
      '</div>'
    });
    html += '</div>';

    // Sticky action footer
    html += '<div style="position:sticky;bottom:0;background:var(--sds-bg-page);border-top:1px solid var(--sds-border-default);padding:16px 0;margin-top:24px;display:flex;gap:12px;justify-content:flex-end;">';
    html += Components.button('Request Changes', 'secondary', 'md', 'data-navigate="#/remediation"');
    html += Components.button('Reject', 'primary', 'md', 'data-navigate="#/remediation" style="background:var(--sds-status-error-strong);border-color:var(--sds-status-error-strong);"');
    html += Components.button('Approve', 'primary', 'md', 'data-navigate="#/remediation"');
    html += '</div>';

    content.innerHTML = html;
  }


  // ============================================================
  // 11. Approval Queue (/remediation/approvals)
  // ============================================================
  function renderApprovalQueue() {
    // Redirect to the main remediation page with approvals tab active
    State.set('remediationTab', 'approvals');
    renderRemediationHistory();
  }


  // ============================================================
  // Route Registration
  // ============================================================
  Router.register('/remediation', renderRemediationHistory);
  Router.register('/remediation/configure', renderConfigureRemediation);
  Router.register('/remediation/preview', renderPreviewImpact);
  Router.register('/remediation/dryrun', renderDryRunResults);
  Router.register('/remediation/execute', renderExecutionProgress);
  Router.register('/remediation/success', renderRemediationSuccess);
  Router.register('/remediation/approval/request', renderApprovalRequest);
  Router.register('/remediation/approvals', renderApprovalQueue);
  Router.register('/remediation/approval/:id', renderApprovalReview);
  Router.register('/remediation/:id/rollback', renderRollbackPreview);
  Router.register('/remediation/:id', renderRemediationDetail);

})();
