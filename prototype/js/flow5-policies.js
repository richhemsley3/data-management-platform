/* ============================================================
   Flow 5 — Tokenization Policy Management
   Routes: /policies, /policies/templates, /policies/create,
           /policies/create/tokens, /policies/create/scope,
           /policies/:id, /policies/:id/diff
   ============================================================ */

(function() {

  // ---- Template Data ----
  var templates = [
    {
      id: 'tpl-pci',
      title: 'PCI DSS Compliance',
      description: 'Format-preserving encryption for card numbers. Reversible tokenization with audit logging.',
      regulation: 'PCI DSS',
      icon: 'shield',
      classifications: ['PAN', 'CVV'],
      config: [
        { label: 'Token format', value: 'FPE' },
        { label: 'Reversibility', value: 'Yes' },
        { label: 'Regulation defaults', value: 'PCI DSS' }
      ]
    },
    {
      id: 'tpl-gdpr',
      title: 'GDPR PII Protection',
      description: 'Hash-based pseudonymization for personal identifiers. Irreversible by default for GDPR compliance.',
      regulation: 'GDPR',
      icon: 'shield',
      classifications: ['Email', 'Full Name', 'SSN'],
      config: [
        { label: 'Token format', value: 'Hash (SHA-256)' },
        { label: 'Reversibility', value: 'No' },
        { label: 'Regulation defaults', value: 'GDPR' }
      ]
    },
    {
      id: 'tpl-hipaa',
      title: 'HIPAA PHI Security',
      description: 'Format-preserving encryption for health identifiers. Reversible tokenization for authorized clinical access.',
      regulation: 'HIPAA',
      icon: 'shield',
      classifications: ['MRN', 'Diagnosis', 'SSN'],
      config: [
        { label: 'Token format', value: 'FPE' },
        { label: 'Reversibility', value: 'Yes' },
        { label: 'Regulation defaults', value: 'HIPAA' }
      ]
    },
    {
      id: 'tpl-general',
      title: 'General PII',
      description: 'Balanced defaults for common PII data types. Suitable for general data protection requirements.',
      regulation: 'None',
      icon: 'shield',
      classifications: ['Email', 'Phone', 'Address'],
      config: [
        { label: 'Token format', value: 'FPE' },
        { label: 'Reversibility', value: 'Configurable' },
        { label: 'Regulation defaults', value: 'None' }
      ]
    },
    {
      id: 'tpl-blank',
      title: 'Blank Policy',
      description: 'Start from scratch with an empty configuration. Full control over every setting.',
      regulation: null,
      icon: 'plus',
      classifications: [],
      config: [],
      isBlank: true
    }
  ];

  // ---- Classification options for wizard ----
  var classificationGroups = [
    {
      category: 'PCI',
      items: [
        { id: 'pan', label: 'PAN (Primary Account Number)' },
        { id: 'cvv', label: 'CVV / CVC' },
        { id: 'cardholder-name', label: 'Cardholder Name' },
        { id: 'expiry', label: 'Expiration Date' }
      ]
    },
    {
      category: 'PII',
      items: [
        { id: 'ssn', label: 'Social Security Number' },
        { id: 'email', label: 'Email Address' },
        { id: 'phone', label: 'Phone Number' },
        { id: 'full-name', label: 'Full Name' },
        { id: 'address', label: 'Street Address' },
        { id: 'dob', label: 'Date of Birth' }
      ]
    },
    {
      category: 'PHI',
      items: [
        { id: 'mrn', label: 'Medical Record Number' },
        { id: 'diagnosis', label: 'Diagnosis Code' },
        { id: 'prescription', label: 'Prescription Data' }
      ]
    }
  ];

  // ---- Token format options ----
  var tokenFormats = [
    { value: 'fpe', label: 'Format-Preserving Encryption (FPE)' },
    { value: 'hash', label: 'SHA-256 Hash' },
    { value: 'random', label: 'Random Token' },
    { value: 'mask', label: 'Character Masking' }
  ];

  var preservationOptions = [
    { value: 'none', label: 'No preservation' },
    { value: 'first4', label: 'Preserve first 4 characters' },
    { value: 'last4', label: 'Preserve last 4 characters' },
    { value: 'first4-last4', label: 'Preserve first 4 and last 4' }
  ];

  // ---- Mock version data ----
  var policyVersions = {
    'pol-1': [
      { version: 3, changes: 'Updated FPE preservation rules', author: 'Priya Sharma', date: '2024-03-10T09:00:00Z', current: true },
      { version: 2, changes: 'Added Email classification', author: 'Jordan Chen', date: '2024-03-05T14:00:00Z', current: false },
      { version: 1, changes: 'Initial policy creation', author: 'Jordan Chen', date: '2024-02-20T10:00:00Z', current: false }
    ],
    'pol-2': [
      { version: 2, changes: 'Changed masking format for CVV', author: 'Marcus Williams', date: '2024-03-08T11:00:00Z', current: true },
      { version: 1, changes: 'Initial policy creation', author: 'Marcus Williams', date: '2024-02-15T09:00:00Z', current: false }
    ],
    'pol-3': [
      { version: 1, changes: 'Initial policy creation', author: 'Priya Sharma', date: '2024-02-01T10:00:00Z', current: true }
    ]
  };

  // ---- Mock applied data ----
  var policyAppliedData = {
    'pol-1': [
      { connection: 'Snowflake Production', schema: 'public', table: 'users', column: 'email', tokenized: 'Yes' },
      { connection: 'Snowflake Production', schema: 'public', table: 'users', column: 'phone_number', tokenized: 'Yes' },
      { connection: 'Snowflake Production', schema: 'public', table: 'users', column: 'ssn', tokenized: 'Yes' },
      { connection: 'Snowflake Production', schema: 'finance', table: 'transactions', column: 'card_number', tokenized: 'Yes' },
      { connection: 'BigQuery Analytics', schema: 'marketing', table: 'web_analytics', column: 'ip_address', tokenized: 'Pending' },
      { connection: 'Azure SQL Production', schema: 'crm', table: 'customer_profiles', column: 'date_of_birth', tokenized: 'Yes' }
    ],
    'pol-2': [
      { connection: 'Snowflake Production', schema: 'finance', table: 'transactions', column: 'card_cvv', tokenized: 'Yes' },
      { connection: 'Snowflake Production', schema: 'payments', table: 'credit_cards', column: 'pan', tokenized: 'Yes' },
      { connection: 'Azure SQL Production', schema: 'payments', table: 'payment_methods', column: 'account_number', tokenized: 'Pending' }
    ],
    'pol-3': [
      { connection: 'AWS S3 Data Lake', schema: 'healthcare', table: 'patient_records', column: 'diagnosis_code', tokenized: 'Yes' },
      { connection: 'AWS S3 Data Lake', schema: 'healthcare', table: 'patient_records', column: 'patient_dob', tokenized: 'Yes' },
      { connection: 'AWS S3 Data Lake', schema: 'pharmacy', table: 'prescription_data', column: 'ndc_code', tokenized: 'Yes' }
    ]
  };

  // ---- Mock activity log per policy ----
  var policyActivity = {
    'pol-1': [
      { date: '2024-03-10T09:00:00Z', event: 'Policy updated', user: 'Priya Sharma', detail: 'v2 \u2192 v3' },
      { date: '2024-03-08T14:00:00Z', event: 'Applied to 12 columns', user: 'System', detail: 'Auto-enforcement' },
      { date: '2024-03-05T14:00:00Z', event: 'Policy updated', user: 'Jordan Chen', detail: 'v1 \u2192 v2' },
      { date: '2024-03-01T10:00:00Z', event: 'Status changed to Active', user: 'Jordan Chen', detail: 'Draft \u2192 Active' },
      { date: '2024-02-20T10:00:00Z', event: 'Policy created', user: 'Jordan Chen', detail: 'Draft' }
    ],
    'pol-2': [
      { date: '2024-03-08T11:00:00Z', event: 'Policy updated', user: 'Marcus Williams', detail: 'v1 \u2192 v2' },
      { date: '2024-03-01T09:00:00Z', event: 'Status changed to Active', user: 'Marcus Williams', detail: 'Draft \u2192 Active' },
      { date: '2024-02-15T09:00:00Z', event: 'Policy created', user: 'Marcus Williams', detail: 'Draft' }
    ],
    'pol-3': [
      { date: '2024-02-28T16:00:00Z', event: 'Applied to 28 tables', user: 'System', detail: 'Auto-enforcement' },
      { date: '2024-02-15T10:00:00Z', event: 'Status changed to Active', user: 'Priya Sharma', detail: 'Draft \u2192 Active' },
      { date: '2024-02-01T10:00:00Z', event: 'Policy created', user: 'Priya Sharma', detail: 'Draft' }
    ]
  };

  // ---- Helper: policy classifications display ----
  function getPolicyClassifications(policy) {
    var map = {
      'pol-1': ['Email', 'Phone', 'SSN', 'IP Address'],
      'pol-2': ['PAN', 'CVV', 'Bank Account'],
      'pol-3': ['MRN', 'Diagnosis', 'DOB', 'Prescription'],
      'pol-4': ['Email', 'Phone', 'Address'],
      'pol-5': ['Full Name', 'Email', 'SSN']
    };
    return map[policy.id] || ['PII'];
  }

  // ---- Helper: policy scope display ----
  function getPolicyScope(policy) {
    var map = {
      'pol-1': 'All matching',
      'pol-2': 'Specific connections',
      'pol-3': 'Specific connections',
      'pol-4': 'All matching',
      'pol-5': 'Specific schemas'
    };
    return map[policy.id] || 'All matching';
  }

  // ---- Helper: policy token config ----
  function getPolicyTokenConfig(policy) {
    var configs = {
      'pol-1': [
        { classification: 'Email', format: 'Hash', preservation: 'None', reversible: 'No' },
        { classification: 'Phone', format: 'FPE', preservation: 'Last 4', reversible: 'Yes' },
        { classification: 'SSN', format: 'FPE', preservation: 'Last 4', reversible: 'Yes' },
        { classification: 'IP Address', format: 'Random', preservation: 'None', reversible: 'No' }
      ],
      'pol-2': [
        { classification: 'PAN', format: 'FPE', preservation: 'First 4 / Last 4', reversible: 'Yes' },
        { classification: 'CVV', format: 'Random', preservation: 'None', reversible: 'No' },
        { classification: 'Bank Account', format: 'FPE', preservation: 'Last 4', reversible: 'Yes' }
      ],
      'pol-3': [
        { classification: 'MRN', format: 'FPE', preservation: 'None', reversible: 'Yes' },
        { classification: 'Diagnosis', format: 'Hash', preservation: 'None', reversible: 'No' },
        { classification: 'DOB', format: 'Mask', preservation: 'None', reversible: 'No' },
        { classification: 'Prescription', format: 'Hash', preservation: 'None', reversible: 'No' }
      ]
    };
    return configs[policy.id] || [];
  }

  // ---- Wizard steps definition ----
  var wizardSteps = [
    { label: 'Define Basics' },
    { label: 'Configure Tokens' },
    { label: 'Set Scope' },
    { label: 'Review & Activate' }
  ];

  // ================================================================
  // SCREEN 1: Policy List
  // ================================================================
  function renderPolicyList() {
    var content = document.getElementById('content');
    if (!content) return;

    var policies = Data.policies;
    var html = '';

    // Page header
    html += Components.pageHeader(
      'Policies',
      null,
      Components.button('Start from Template', 'secondary', 'md', 'data-navigate="#/policies/templates"') +
      Components.button('<span class="btn-icon">' + Icons.plus + '</span> Create Policy', 'primary', 'md', 'data-navigate="#/policies/create"')
    );

    // Filter bar
    html += Components.filterBar(
      [
        {
          name: 'regulation',
          options: [
            { value: '', label: 'All Regulations' },
            { value: 'gdpr', label: 'GDPR' },
            { value: 'pci', label: 'PCI DSS' },
            { value: 'hipaa', label: 'HIPAA' },
            { value: 'ccpa', label: 'CCPA' }
          ]
        },
        {
          name: 'status',
          options: [
            { value: '', label: 'All Statuses' },
            { value: 'active', label: 'Active' },
            { value: 'draft', label: 'Draft' },
            { value: 'pending_approval', label: 'Pending Approval' }
          ]
        }
      ],
      'Search policies...'
    );

    // Data table
    html += Components.dataTable({
      columns: [
        {
          key: 'name',
          label: 'Policy Name',
          width: '25%',
          render: function(val) {
            return '<span style="color:var(--sds-text-link);font-weight:500;">' + val + '</span>';
          }
        },
        {
          key: 'regulation',
          label: 'Regulation',
          width: '12%'
        },
        {
          key: 'classifications',
          label: 'Classifications',
          width: '22%',
          render: function(val, row) {
            var cls = getPolicyClassifications(row);
            var tags = '';
            for (var i = 0; i < cls.length && i < 3; i++) {
              tags += Components.tag(cls[i], 'info') + ' ';
            }
            if (cls.length > 3) {
              tags += Components.tag('+' + (cls.length - 3), 'neutral');
            }
            return tags;
          }
        },
        {
          key: 'scope',
          label: 'Scope',
          width: '14%',
          render: function(val, row) {
            return getPolicyScope(row);
          }
        },
        {
          key: 'status',
          label: 'Status',
          width: '12%',
          render: function(val) {
            return Components.statusTag(val);
          }
        },
        {
          key: 'appliedCount',
          label: 'Applied',
          width: '8%',
          render: function(val) {
            return val > 0 ? Data.formatNumber(val) : '--';
          }
        },
        {
          key: 'updatedAt',
          label: 'Last Modified',
          width: '12%',
          render: function(val) {
            return Data.formatDate(val);
          }
        }
      ],
      rows: policies,
      onRowClick: '#/policies/:id'
    });

    content.innerHTML = html;
  }

  // ================================================================
  // SCREEN 2: Template Gallery
  // ================================================================
  function renderTemplateGallery() {
    var content = document.getElementById('content');
    if (!content) return;

    var html = '';

    // Breadcrumb
    html += Components.breadcrumb([
      { label: 'Policies', href: '#/policies' },
      { label: 'Choose a template' }
    ]);

    // Page header
    html += '<div class="page-header" style="margin-bottom:8px;">';
    html += '<div>';
    html += '<h1 class="page-title">Choose a template</h1>';
    html += '<div class="page-subtitle" style="max-width:520px;margin-top:8px;">Start with a pre-built template to get compliant protection in minutes. All settings can be customized in the wizard.</div>';
    html += '</div>';
    html += '</div>';

    // Card grid
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;margin-top:24px;">';

    for (var i = 0; i < templates.length; i++) {
      var tpl = templates[i];
      html += renderTemplateCard(tpl);
    }

    html += '</div>';

    content.innerHTML = html;

    // Click handlers for template cards
    content.onclick = function(e) {
      var card = e.target.closest('[data-template-id]');
      if (card) {
        Router.navigate('#/policies/create');
      }
    };
  }

  function renderTemplateCard(tpl) {
    var borderStyle = tpl.isBlank ? 'border:1px dashed var(--sds-border-default);' : '';
    var html = '<div class="sds-card" style="cursor:pointer;transition:box-shadow 150ms ease,border-color 150ms ease;' + borderStyle + '" data-template-id="' + tpl.id + '">';

    // Card body
    html += '<div class="sds-card-body" style="padding:20px;">';

    // Icon
    var iconBg = tpl.isBlank ? 'var(--sds-bg-subtle)' : 'var(--sds-interactive-primary-subtle, #D9EBED)';
    var iconColor = tpl.isBlank ? 'var(--sds-text-tertiary)' : 'var(--sds-interactive-primary, #013D5B)';
    html += '<div style="width:40px;height:40px;border-radius:8px;background:' + iconBg + ';color:' + iconColor + ';display:flex;align-items:center;justify-content:center;margin-bottom:16px;">';
    html += Icons.render(tpl.icon, 20);
    html += '</div>';

    // Title
    html += '<div style="font-size:16px;font-weight:600;color:var(--sds-text-primary);margin-bottom:8px;">' + tpl.title + '</div>';

    // Description
    html += '<div style="font-size:13px;color:var(--sds-text-secondary);line-height:1.5;margin-bottom:12px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">' + tpl.description + '</div>';

    // Classification tags
    if (tpl.classifications.length > 0) {
      html += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">';
      for (var j = 0; j < tpl.classifications.length; j++) {
        html += Components.tag(tpl.classifications[j], 'info');
      }
      html += '</div>';
    }

    // Config summary
    if (tpl.config.length > 0) {
      html += '<div style="font-size:12px;color:var(--sds-text-tertiary);line-height:1.6;">';
      html += '<div style="margin-bottom:4px;">Pre-configured:</div>';
      for (var k = 0; k < tpl.config.length; k++) {
        html += '<div>\u2022 ' + tpl.config[k].label + ': ' + tpl.config[k].value + '</div>';
      }
      html += '</div>';
    }

    html += '</div>';

    // Footer
    html += '<div class="sds-card-footer" style="padding:12px 20px;border-top:1px solid var(--sds-border-subtle);">';
    if (tpl.isBlank) {
      html += '<span style="font-size:13px;font-weight:500;color:var(--sds-text-link);display:flex;align-items:center;gap:6px;">Start blank <span style="display:inline-flex;">' + Icons.render('arrow-right', 14) + '</span></span>';
    } else {
      html += '<span style="font-size:13px;font-weight:500;color:var(--sds-text-link);display:flex;align-items:center;gap:6px;">Use this template <span style="display:inline-flex;">' + Icons.render('arrow-right', 14) + '</span></span>';
    }
    html += '</div>';

    html += '</div>';
    return html;
  }

  // ================================================================
  // SCREEN 3: Create Policy — Basics + Classifications (Step 1)
  // ================================================================
  function renderCreatePolicyBasics() {
    var content = document.getElementById('content');
    if (!content) return;

    var html = '';

    // Wizard steps
    html += Components.wizardSteps(wizardSteps, 0);

    // Step header
    html += '<div style="max-width:720px;margin:0 auto 32px;">';
    html += '<div style="font-size:13px;font-weight:500;color:var(--sds-text-tertiary);margin-bottom:4px;">Step 1 of 4</div>';
    html += '<h2 style="font-size:22px;font-weight:600;color:var(--sds-text-primary);margin:0 0 8px;">Policy basics & classifications</h2>';
    html += '<p style="font-size:14px;color:var(--sds-text-secondary);margin:0;">Name your policy, select a regulation, and choose which data classifications to protect.</p>';
    html += '</div>';

    // Form
    html += '<div style="max-width:720px;margin:0 auto;">';

    // Basics section
    html += '<div style="margin-bottom:32px;">';
    html += Components.formGroup(
      'Policy name <span style="color:var(--sds-status-error-text);">*</span>',
      Components.formInput('policyName', '', 'e.g., PCI Card Data Protection')
    );
    html += Components.formGroup(
      'Description',
      '<textarea class="form-input" name="description" rows="3" placeholder="Describe what this policy protects and why..." style="resize:vertical;"></textarea>'
    );

    // Regulation + Priority row
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">';
    html += Components.formGroup(
      'Regulation',
      Components.formSelect('regulation', [
        { value: '', label: 'Select regulation...' },
        { value: 'pci-dss', label: 'PCI DSS' },
        { value: 'gdpr', label: 'GDPR' },
        { value: 'hipaa', label: 'HIPAA' },
        { value: 'ccpa', label: 'CCPA' },
        { value: 'custom', label: 'Custom' }
      ]),
      'Selecting a regulation will pre-fill token configuration defaults.'
    );
    html += Components.formGroup(
      'Priority',
      Components.formSelect('priority', [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'critical', label: 'Critical' }
      ], 'medium')
    );
    html += '</div>';
    html += '</div>';

    // Classifications section
    html += '<div style="margin-bottom:32px;">';
    html += '<div style="font-size:16px;font-weight:600;color:var(--sds-text-primary);margin-bottom:4px;">Data classifications <span style="color:var(--sds-status-error-text);">*</span></div>';
    html += '<div style="font-size:14px;color:var(--sds-text-secondary);margin-bottom:16px;">Select which classifications this policy will protect.</div>';

    for (var g = 0; g < classificationGroups.length; g++) {
      var group = classificationGroups[g];
      html += '<div style="border:1px solid var(--sds-border-subtle);border-radius:8px;margin-bottom:12px;overflow:hidden;">';

      // Group header
      html += '<div style="background:var(--sds-bg-subtle);padding:8px 16px;font-size:12px;font-weight:600;color:var(--sds-text-secondary);text-transform:uppercase;letter-spacing:0.5px;">' + group.category + '</div>';

      // Group items
      html += '<div style="padding:12px 16px;">';
      for (var ci = 0; ci < group.items.length; ci++) {
        var item = group.items[ci];
        html += '<label style="display:flex;align-items:center;gap:8px;padding:6px 0;font-size:14px;color:var(--sds-text-primary);cursor:pointer;">';
        html += '<input type="checkbox" name="classification" value="' + item.id + '" style="width:16px;height:16px;accent-color:var(--sds-interactive-primary, #013D5B);">';
        html += item.label;
        html += '</label>';
      }
      html += '</div>';
      html += '</div>';
    }

    html += '</div>';

    // Wizard footer
    html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:16px 0;border-top:1px solid var(--sds-border-subtle);margin-top:24px;">';
    html += Components.button('Cancel', 'tertiary', 'md', 'data-navigate="#/policies"');
    html += Components.button('Next', 'primary', 'md', 'data-navigate="#/policies/create/tokens"');
    html += '</div>';

    html += '</div>';

    content.innerHTML = html;
  }

  // ================================================================
  // SCREEN 4: Create Policy — Token Configuration (Step 2)
  // ================================================================
  function renderCreatePolicyTokens() {
    var content = document.getElementById('content');
    if (!content) return;

    var html = '';

    // Wizard steps
    html += Components.wizardSteps(wizardSteps, 1);

    // Step header
    html += '<div style="margin-bottom:24px;">';
    html += '<div style="font-size:13px;font-weight:500;color:var(--sds-text-tertiary);margin-bottom:4px;">Step 2 of 4</div>';
    html += '<h2 style="font-size:22px;font-weight:600;color:var(--sds-text-primary);margin:0 0 8px;">Token configuration</h2>';
    html += '<p style="font-size:14px;color:var(--sds-text-secondary);margin:0;">Configure tokenization rules for each classification. Test with sample data before proceeding.</p>';
    html += '</div>';

    // Split layout
    html += '<div style="display:grid;grid-template-columns:1fr 380px;gap:24px;align-items:start;">';

    // Left: Configuration cards
    html += '<div>';

    // Regulation info panel
    html += '<div style="background:var(--sds-status-info-bg, #EBF4F5);border-left:3px solid var(--sds-status-info-text, #0C4A69);border-radius:0 6px 6px 0;padding:16px;margin-bottom:24px;">';
    html += '<div style="display:flex;align-items:flex-start;gap:8px;">';
    html += '<span style="color:var(--sds-status-info-text, #0C4A69);flex-shrink:0;margin-top:1px;">' + Icons.render('info', 16) + '</span>';
    html += '<div style="font-size:13px;color:var(--sds-status-info-text, #0C4A69);line-height:1.5;">';
    html += '<strong>PCI DSS Requirements</strong><br>';
    html += 'The following defaults satisfy PCI DSS:<br>';
    html += '\u2022 Requirement 3.4: Render PAN unreadable<br>';
    html += '\u2022 Requirement 3.5: Protect cryptographic keys<br><br>';
    html += 'Defaults have been pre-filled. You can override any setting below.';
    html += '</div></div></div>';

    // PAN config card
    html += renderClassificationConfigCard('PAN (Primary Account Number)', 'PCI', 'fpe', 'first4-last4', true);

    // CVV config card
    html += renderClassificationConfigCard('CVV / CVC', 'PCI', 'random', 'none', false);

    // Email config card
    html += renderClassificationConfigCard('Email Address', 'PII', 'hash', 'none', false);

    html += '</div>';

    // Right: Test panel (sticky)
    html += '<div style="position:sticky;top:24px;">';
    html += renderTestPanel();
    html += '</div>';

    html += '</div>';

    // Wizard footer
    html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:16px 0;border-top:1px solid var(--sds-border-subtle);margin-top:24px;">';
    html += '<div>' + Components.button('Cancel', 'tertiary', 'md', 'data-navigate="#/policies"') + '</div>';
    html += '<div style="display:flex;gap:8px;">';
    html += Components.button('Back', 'secondary', 'md', 'data-navigate="#/policies/create"');
    html += Components.button('Next', 'primary', 'md', 'data-navigate="#/policies/create/scope"');
    html += '</div>';
    html += '</div>';

    content.innerHTML = html;

    // Wire up "Run test" button
    setupTestPanel(content);
  }

  function renderClassificationConfigCard(title, category, defaultFormat, defaultPreservation, defaultReversible) {
    var html = '';
    html += Components.card({
      title: '<span style="display:flex;align-items:center;gap:8px;">' + title + ' ' + Components.tag(category, 'info') + '</span>',
      bordered: true,
      body: (function() {
        var body = '';

        // Token format
        body += Components.formGroup(
          'Token format',
          Components.formSelect('tokenFormat', tokenFormats, defaultFormat),
          formatHelpText(defaultFormat)
        );

        // Preservation rules
        body += Components.formGroup(
          'Preservation rules',
          Components.formSelect('preservation', preservationOptions, defaultPreservation)
        );

        // Reversibility
        body += '<div class="form-group">';
        body += '<label class="form-label">Reversibility</label>';
        body += '<label style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:14px;color:var(--sds-text-primary);cursor:pointer;">';
        body += '<input type="radio" name="reversible-' + category + '" ' + (defaultReversible ? 'checked' : '') + ' style="accent-color:var(--sds-interactive-primary, #013D5B);">';
        body += 'Reversible \u2014 can be detokenized';
        body += '</label>';
        body += '<label style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:14px;color:var(--sds-text-primary);cursor:pointer;">';
        body += '<input type="radio" name="reversible-' + category + '" ' + (!defaultReversible ? 'checked' : '') + ' style="accent-color:var(--sds-interactive-primary, #013D5B);">';
        body += 'Irreversible \u2014 one-way transformation';
        body += '</label>';
        body += '</div>';

        return body;
      })()
    });
    html += '<div style="margin-bottom:24px;"></div>';
    return html;
  }

  function formatHelpText(format) {
    var texts = {
      'fpe': 'Maintains the original format and character set of the data.',
      'hash': 'Produces a fixed-length hash. Original data cannot be recovered.',
      'random': 'Replaces with a random token of the same type.',
      'mask': 'Replaces characters with masking symbols (e.g., X).'
    };
    return texts[format] || '';
  }

  function renderTestPanel() {
    var html = '';
    html += Components.card({
      title: '<span style="display:flex;align-items:center;justify-content:space-between;width:100%;">Token Format Test ' + Components.button('Clear', 'tertiary', 'sm', 'data-test-clear') + '</span>',
      bordered: true,
      body: (function() {
        var body = '';

        // Classification select
        body += Components.formGroup(
          'Classification',
          Components.formSelect('testClassification', [
            { value: 'pan', label: 'PAN (Primary Account Number)' },
            { value: 'cvv', label: 'CVV / CVC' },
            { value: 'email', label: 'Email Address' }
          ])
        );

        // Sample data
        body += Components.formGroup(
          'Sample data',
          '<textarea class="form-input" id="test-sample-data" rows="3" placeholder="Enter sample data to test..." style="font-family:\'SF Mono\',Menlo,monospace;font-size:13px;background:var(--sds-bg-subtle);">4532-1234-5678-9012</textarea>'
        );

        // Run test button
        body += '<div style="margin-bottom:16px;">';
        body += Components.button('Run test', 'primary', 'sm', 'data-test-run');
        body += '</div>';

        // Divider
        body += '<div style="border-top:1px solid var(--sds-border-subtle);padding-top:16px;margin-top:8px;">';
        body += '<div style="font-size:12px;font-weight:600;color:var(--sds-text-tertiary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Tokenized output</div>';

        // Output area
        body += '<div id="test-output" style="background:var(--sds-status-success-bg, #F4FAEB);border:1px solid var(--sds-border-subtle);border-radius:6px;padding:12px;font-family:\'SF Mono\',Menlo,monospace;font-size:13px;color:var(--sds-status-success-text, #62800B);min-height:40px;">4532-XXXX-XXXX-9012</div>';

        // Summary
        body += '<div style="margin-top:12px;font-size:12px;color:var(--sds-text-tertiary);line-height:1.6;">';
        body += 'Format: FPE<br>';
        body += 'Characters preserved: first 4, last 4<br>';
        body += 'Reversible: Yes';
        body += '</div>';

        body += '</div>';

        return body;
      })()
    });
    return html;
  }

  function setupTestPanel(content) {
    content.onclick = function(e) {
      var runBtn = e.target.closest('[data-test-run]');
      if (runBtn) {
        var output = document.getElementById('test-output');
        if (output) {
          var sample = document.getElementById('test-sample-data');
          var sampleVal = sample ? sample.value : '';
          if (sampleVal) {
            // Simulate tokenization
            var tokenized = sampleVal.replace(/\d/g, function(d, i) {
              if (i < 4 || i > sampleVal.length - 5) return d;
              return 'X';
            });
            output.textContent = tokenized;
            output.style.background = 'var(--sds-status-success-bg, #F4FAEB)';
            output.style.color = 'var(--sds-status-success-text, #62800B)';
          }
        }
      }

      var clearBtn = e.target.closest('[data-test-clear]');
      if (clearBtn) {
        var sampleEl = document.getElementById('test-sample-data');
        if (sampleEl) sampleEl.value = '';
        var outputEl = document.getElementById('test-output');
        if (outputEl) outputEl.textContent = '';
      }
    };
  }

  // ================================================================
  // SCREEN 5: Create Policy — Scope + Review (Step 3)
  // ================================================================
  function renderCreatePolicyScope() {
    var content = document.getElementById('content');
    if (!content) return;

    var html = '';

    // Wizard steps
    html += Components.wizardSteps(wizardSteps, 2);

    // Step header
    html += '<div style="max-width:800px;margin:0 auto 32px;">';
    html += '<div style="font-size:13px;font-weight:500;color:var(--sds-text-tertiary);margin-bottom:4px;">Step 3 of 4</div>';
    html += '<h2 style="font-size:22px;font-weight:600;color:var(--sds-text-primary);margin:0 0 8px;">Set scope</h2>';
    html += '<p style="font-size:14px;color:var(--sds-text-secondary);margin:0;">Define where this policy will be enforced.</p>';
    html += '</div>';

    html += '<div style="max-width:800px;margin:0 auto;">';

    // Scope section
    html += '<div style="margin-bottom:32px;">';
    html += '<div style="font-size:16px;font-weight:600;color:var(--sds-text-primary);margin-bottom:4px;">Scope</div>';
    html += '<div style="font-size:14px;color:var(--sds-text-secondary);margin-bottom:16px;">Define where this policy will be enforced.</div>';

    // Radio options
    html += '<div style="display:flex;flex-direction:column;gap:12px;">';

    // All matching
    html += '<label style="display:flex;gap:10px;padding:12px 16px;border:1px solid var(--sds-border-default);border-radius:8px;cursor:pointer;background:var(--sds-bg-card);">';
    html += '<input type="radio" name="scope" value="all" checked style="accent-color:var(--sds-interactive-primary, #013D5B);margin-top:2px;">';
    html += '<div>';
    html += '<div style="font-size:14px;font-weight:500;color:var(--sds-text-primary);">All matching classifications</div>';
    html += '<div style="font-size:13px;color:var(--sds-text-tertiary);margin-top:2px;">Apply to every connection where matching data classifications are found.</div>';
    html += '</div>';
    html += '</label>';

    // Specific connections
    html += '<label style="display:flex;gap:10px;padding:12px 16px;border:1px solid var(--sds-border-default);border-radius:8px;cursor:pointer;background:var(--sds-bg-card);">';
    html += '<input type="radio" name="scope" value="connections" style="accent-color:var(--sds-interactive-primary, #013D5B);margin-top:2px;">';
    html += '<div>';
    html += '<div style="font-size:14px;font-weight:500;color:var(--sds-text-primary);">Specific connections</div>';
    html += '<div style="font-size:13px;color:var(--sds-text-tertiary);margin-top:2px;">Choose which connections this policy applies to.</div>';
    html += '</div>';
    html += '</label>';

    // Specific schemas
    html += '<label style="display:flex;gap:10px;padding:12px 16px;border:1px solid var(--sds-border-default);border-radius:8px;cursor:pointer;background:var(--sds-bg-card);">';
    html += '<input type="radio" name="scope" value="schemas" style="accent-color:var(--sds-interactive-primary, #013D5B);margin-top:2px;">';
    html += '<div>';
    html += '<div style="font-size:14px;font-weight:500;color:var(--sds-text-primary);">Specific schemas</div>';
    html += '<div style="font-size:13px;color:var(--sds-text-tertiary);margin-top:2px;">Select individual schemas where this policy will be enforced.</div>';
    html += '</div>';
    html += '</label>';

    html += '</div>';
    html += '</div>';

    // Impact preview
    html += '<div style="margin-bottom:32px;">';
    html += '<div style="font-size:16px;font-weight:600;color:var(--sds-text-primary);margin-bottom:16px;">Projected impact</div>';

    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:16px;">';
    html += Components.statCard('Matching columns', '234', 'Across 3 connections');
    html += '<div class="sds-card"><div class="stat-card">';
    html += '<div class="stat-card-label">Risk score change</div>';
    html += '<div class="stat-card-value" style="color:var(--sds-status-success-text, #62800B);">-12 pts</div>';
    html += '<div class="stat-card-subtitle">67 \u2192 55</div>';
    html += '</div></div>';
    html += '<div class="sds-card"><div class="stat-card">';
    html += '<div class="stat-card-label">Already covered</div>';
    html += '<div class="stat-card-value" style="color:var(--sds-status-warning-text, #8A7515);">12</div>';
    html += '<div class="stat-card-subtitle">Overlap with existing policies</div>';
    html += '</div></div>';
    html += '</div>';

    // Overlap warning
    html += '<div style="background:var(--sds-status-warning-bg, #FCF9D9);border-left:3px solid var(--sds-status-warning-strong, #C4AA25);border-radius:0 6px 6px 0;padding:12px 16px;font-size:13px;color:var(--sds-status-warning-text, #8A7515);display:flex;align-items:flex-start;gap:8px;">';
    html += '<span style="flex-shrink:0;margin-top:1px;">' + Icons.render('warning', 16) + '</span>';
    html += '<span>12 columns already covered by "PCI Data Masking". This policy will take precedence due to higher priority.</span>';
    html += '</div>';

    html += '</div>';

    // Wizard footer
    html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:16px 0;border-top:1px solid var(--sds-border-subtle);margin-top:24px;">';
    html += '<div>' + Components.button('Cancel', 'tertiary', 'md', 'data-navigate="#/policies"') + '</div>';
    html += '<div style="display:flex;gap:8px;">';
    html += Components.button('Back', 'secondary', 'md', 'data-navigate="#/policies/create/tokens"');
    html += Components.button('Next', 'primary', 'md', 'data-navigate="#/policies/create/review"');
    html += '</div>';
    html += '</div>';

    html += '</div>';

    content.innerHTML = html;
  }

  function renderSummaryRow(label, value) {
    return '<div style="display:flex;gap:8px;padding:4px 0;font-size:13px;">' +
      '<div style="color:var(--sds-text-tertiary);min-width:100px;">' + label + '</div>' +
      '<div style="color:var(--sds-text-primary);">' + value + '</div>' +
      '</div>';
  }

  function renderConfigSummaryRow(classification, format, preservation, reversible) {
    return '<div style="display:grid;grid-template-columns:2fr 1.5fr 1.5fr 1fr;gap:8px;font-size:13px;color:var(--sds-text-primary);padding:8px 0;border-bottom:1px solid var(--sds-border-subtle);">' +
      '<div>' + classification + '</div><div>' + format + '</div><div>' + preservation + '</div><div>' + reversible + '</div>' +
      '</div>';
  }

  // ================================================================
  // SCREEN 6: Create Policy — Review & Activate (Step 4)
  // ================================================================
  function renderCreatePolicyReview() {
    var content = document.getElementById('content');
    if (!content) return;

    var html = '';

    // Wizard steps
    html += Components.wizardSteps(wizardSteps, 3);

    // Step header
    html += '<div style="max-width:800px;margin:0 auto 32px;">';
    html += '<div style="font-size:13px;font-weight:500;color:var(--sds-text-tertiary);margin-bottom:4px;">Step 4 of 4</div>';
    html += '<h2 style="font-size:22px;font-weight:600;color:var(--sds-text-primary);margin:0 0 8px;">Review & activate</h2>';
    html += '<p style="font-size:14px;color:var(--sds-text-secondary);margin:0;">Review your policy configuration and activate it when ready.</p>';
    html += '</div>';

    html += '<div style="max-width:800px;margin:0 auto;">';

    // Summary card — Basics (step 1)
    html += '<div style="background:var(--sds-bg-surface, #FAF8F5);border:1px solid var(--sds-border-subtle);border-radius:8px;padding:16px 20px;margin-bottom:12px;">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">';
    html += '<div style="font-size:14px;font-weight:600;color:var(--sds-text-primary);">Policy Basics</div>';
    html += '<a style="font-size:12px;color:var(--sds-text-link);text-decoration:none;cursor:pointer;" data-navigate="#/policies/create">Edit</a>';
    html += '</div>';
    html += renderSummaryRow('Name', 'PCI Card Data Protection');
    html += renderSummaryRow('Description', 'Tokenize all PCI fields across production databases');
    html += renderSummaryRow('Regulation', 'PCI DSS');
    html += renderSummaryRow('Classifications', '<span style="display:inline-flex;gap:4px;">' + Components.tag('PAN', 'info') + Components.tag('CVV', 'info') + Components.tag('Email', 'info') + '</span>');
    html += '</div>';

    // Summary card — Token Config (step 2)
    html += '<div style="background:var(--sds-bg-surface, #FAF8F5);border:1px solid var(--sds-border-subtle);border-radius:8px;padding:16px 20px;margin-bottom:12px;">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">';
    html += '<div style="font-size:14px;font-weight:600;color:var(--sds-text-primary);">Token Configuration</div>';
    html += '<a style="font-size:12px;color:var(--sds-text-link);text-decoration:none;cursor:pointer;" data-navigate="#/policies/create/tokens">Edit</a>';
    html += '</div>';
    html += '<div style="display:grid;grid-template-columns:2fr 1.5fr 1.5fr 1fr;gap:8px;font-size:12px;color:var(--sds-text-tertiary);font-weight:600;padding-bottom:8px;border-bottom:1px solid var(--sds-border-subtle);">';
    html += '<div>Classification</div><div>Format</div><div>Preservation</div><div>Reversible</div>';
    html += '</div>';
    html += renderConfigSummaryRow('PAN', 'FPE', 'First 4 / Last 4', 'Yes');
    html += renderConfigSummaryRow('CVV', 'Random', 'None', 'No');
    html += renderConfigSummaryRow('Email', 'Hash', 'None', 'No');
    html += '</div>';

    // Summary card — Scope (step 3)
    html += '<div style="background:var(--sds-bg-surface, #FAF8F5);border:1px solid var(--sds-border-subtle);border-radius:8px;padding:16px 20px;margin-bottom:24px;">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">';
    html += '<div style="font-size:14px;font-weight:600;color:var(--sds-text-primary);">Scope</div>';
    html += '<a style="font-size:12px;color:var(--sds-text-link);text-decoration:none;cursor:pointer;" data-navigate="#/policies/create/scope">Edit</a>';
    html += '</div>';
    html += renderSummaryRow('Scope', 'All matching classifications');
    html += renderSummaryRow('Connections', '3 connections');
    html += renderSummaryRow('Schemas', '5 schemas');
    html += '</div>';

    // Impact Preview
    html += '<div style="margin-bottom:32px;">';
    html += '<div style="font-size:16px;font-weight:600;color:var(--sds-text-primary);margin-bottom:16px;">Impact Preview</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">';
    html += Components.statCard('Columns affected', '234', 'Across 3 connections');
    html += '<div class="sds-card"><div class="stat-card">';
    html += '<div class="stat-card-label">Risk score change</div>';
    html += '<div class="stat-card-value" style="color:var(--sds-status-success-text, #62800B);">-12 pts</div>';
    html += '<div class="stat-card-subtitle">67 \u2192 55</div>';
    html += '</div></div>';
    html += '<div class="sds-card"><div class="stat-card">';
    html += '<div class="stat-card-label">Policy overlap</div>';
    html += '<div class="stat-card-value" style="color:var(--sds-status-warning-text, #8A7515);">12</div>';
    html += '<div class="stat-card-subtitle">Columns already covered</div>';
    html += '</div></div>';
    html += '</div>';
    html += '</div>';

    // Wizard footer
    html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:16px 0;border-top:1px solid var(--sds-border-subtle);margin-top:24px;">';
    html += '<div>' + Components.button('Cancel', 'tertiary', 'md', 'data-navigate="#/policies"') + '</div>';
    html += '<div style="display:flex;gap:8px;">';
    html += Components.button('Back', 'secondary', 'md', 'data-navigate="#/policies/create/scope"');
    html += Components.button('Activate Policy', 'primary', 'md', 'data-navigate="#/policies"');
    html += '</div>';
    html += '</div>';

    html += '</div>';

    content.innerHTML = html;
  }

  // ================================================================
  // SCREEN 7: Policy Detail
  // ================================================================
  function renderPolicyDetail(params) {
    var content = document.getElementById('content');
    if (!content) return;

    var policy = Data.policies.find(function(p) { return p.id === params.id; });
    if (!policy) {
      content.innerHTML = Components.emptyState(Icons.shield, 'Policy not found', 'The requested policy does not exist.', Components.button('Back to Policies', 'primary', 'md', 'data-navigate="#/policies"'));
      return;
    }

    var activeTab = State.get('policyDetailTab') || 'overview';
    var html = '';

    // Breadcrumb
    html += Components.breadcrumb([
      { label: 'Policies', href: '#/policies' },
      { label: policy.name }
    ]);

    // Page header with status and actions
    html += '<div class="page-header">';
    html += '<div style="display:flex;align-items:center;gap:12px;">';
    html += '<h1 class="page-title">' + policy.name + '</h1>';
    html += Components.statusTag(policy.status);
    html += '</div>';
    html += '<div class="flex items-center gap-12">';
    html += Components.button('Delete', 'danger', 'md', 'data-action="delete-policy"');
    html += Components.button('Clone', 'tertiary', 'md');
    html += Components.button('Edit', 'secondary', 'md');
    html += Components.button('Apply to Data', 'primary', 'md');
    html += '</div>';
    html += '</div>';

    // Tabs
    var appliedData = policyAppliedData[policy.id] || [];
    var versions = policyVersions[policy.id] || [];
    html += Components.tabs([
      { id: 'overview', label: 'Overview' },
      { id: 'applied', label: 'Applied Data', badge: appliedData.length },
      { id: 'versions', label: 'Versions', badge: versions.length },
      { id: 'activity', label: 'Activity Log' }
    ], activeTab);

    // Tab content
    html += '<div style="margin-top:24px;">';
    if (activeTab === 'overview') {
      html += renderPolicyOverviewTab(policy);
    } else if (activeTab === 'applied') {
      html += renderPolicyAppliedTab(policy);
    } else if (activeTab === 'versions') {
      html += renderPolicyVersionsTab(policy);
    } else if (activeTab === 'activity') {
      html += renderPolicyActivityTab(policy);
    }
    html += '</div>';

    content.innerHTML = html;

    // Tab click handler and delete button handler
    content.onclick = function(e) {
      var tab = e.target.closest('.sds-tab');
      if (tab) {
        var tabId = tab.getAttribute('data-tab');
        if (tabId) {
          State.set('policyDetailTab', tabId);
          renderPolicyDetail(params);
        }
        return;
      }

      // Delete button handler
      var deleteBtn = e.target.closest('[data-action="delete-policy"]');
      if (deleteBtn) {
        showPolicyDeleteConfirmation(policy);
      }
    };
  }

  function showPolicyDeleteConfirmation(policy) {
    var overlay = document.getElementById('overlay-container');
    if (!overlay) return;

    var appliedData = policyAppliedData[policy.id] || [];
    var appliedCount = appliedData.length;

    var message = 'Are you sure you want to delete <strong>' + policy.name + '</strong>? This will remove ' + appliedCount + ' applied data mappings and all version history. This action cannot be undone.';

    overlay.innerHTML = Components.confirmModal('Delete Policy', message, policy.name, 'data-action="confirm-delete-policy"');

    // The global [data-confirm-input] listener in app.js handles enable/disable.
    // Wire up the confirm action button.
    overlay.addEventListener('click', function(e) {
      var confirmBtn = e.target.closest('[data-action="confirm-delete-policy"]');
      if (confirmBtn && !confirmBtn.disabled) {
        overlay.innerHTML = '';
        Router.navigate('#/policies');
      }
    });
  }

  function renderPolicyOverviewTab(policy) {
    var html = '';

    // Status section
    var isActive = policy.status === 'active';
    html += '<div class="sds-card" style="margin-bottom:24px;">';
    html += '<div class="sds-card-body" style="display:flex;justify-content:space-between;align-items:center;">';
    html += '<div>';
    html += '<div style="font-size:14px;font-weight:600;color:var(--sds-text-primary);margin-bottom:4px;">Policy status</div>';
    if (isActive) {
      html += '<div style="font-size:13px;color:var(--sds-text-secondary);">This policy is actively enforced on ' + policy.appliedCount + ' columns across ' + Math.max(1, Math.floor(policy.appliedCount / 80)) + ' connections.</div>';
    } else {
      html += '<div style="font-size:13px;color:var(--sds-text-secondary);">This policy is not currently enforced.</div>';
    }
    html += '</div>';

    // Toggle switch
    html += '<div style="display:flex;align-items:center;gap:8px;">';
    html += '<span style="font-size:13px;color:' + (isActive ? 'var(--sds-status-success-text, #62800B)' : 'var(--sds-text-tertiary)') + ';font-weight:500;">' + (isActive ? 'Active' : 'Inactive') + '</span>';
    html += '<label class="form-toggle"><input type="checkbox"' + (isActive ? ' checked' : '') + '><span class="form-toggle-slider"></span></label>';
    html += '</div>';

    html += '</div></div>';

    // Metric cards
    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px;">';
    html += Components.statCard('Protected columns', Data.formatNumber(policy.appliedCount), 'Across all connections');
    html += Components.statCard('Risk reduction', '-47 pts', 'Since policy applied', { direction: 'down', value: '47 pts' });
    html += Components.statCard('Last enforced', Data.timeAgo(policy.updatedAt), 'Automatic enforcement');
    html += '</div>';

    // Configuration summary
    html += Components.card({
      title: 'Policy Configuration',
      bordered: true,
      body: (function() {
        var body = '';

        body += renderSummaryRow('Name', policy.name);
        body += renderSummaryRow('Description', policy.description);
        body += renderSummaryRow('Regulation', policy.regulation || '--');
        body += renderSummaryRow('Priority', policy.priority ? (policy.priority.charAt(0).toUpperCase() + policy.priority.slice(1)) : '--');
        body += renderSummaryRow('Scope', getPolicyScope(policy));
        body += renderSummaryRow('Owner', policy.owner);
        body += renderSummaryRow('Created', Data.formatDate(policy.createdAt));

        var versions = policyVersions[policy.id] || [];
        if (versions.length > 0) {
          body += renderSummaryRow('Version', 'v' + versions[0].version + ' (latest)');
        }

        return body;
      })()
    });

    html += '<div style="margin-top:24px;"></div>';

    // Token configuration table
    var tokenConfig = getPolicyTokenConfig(policy);
    if (tokenConfig.length > 0) {
      html += Components.card({
        title: 'Token Configuration',
        bordered: true,
        body: (function() {
          var body = '';
          body += '<div style="display:grid;grid-template-columns:2fr 1.5fr 1.5fr 1fr;gap:8px;font-size:12px;color:var(--sds-text-tertiary);font-weight:600;padding-bottom:8px;border-bottom:1px solid var(--sds-border-subtle);">';
          body += '<div>Classification</div><div>Format</div><div>Preservation</div><div>Reversible</div>';
          body += '</div>';
          for (var i = 0; i < tokenConfig.length; i++) {
            var tc = tokenConfig[i];
            body += renderConfigSummaryRow(tc.classification, tc.format, tc.preservation, tc.reversible);
          }
          return body;
        })()
      });
    }

    return html;
  }

  function renderPolicyAppliedTab(policy) {
    var applied = policyAppliedData[policy.id] || [];

    if (applied.length === 0) {
      return Components.emptyState(
        Icons.shield,
        'No applied data',
        'This policy has not been applied to any data yet.',
        Components.button('Apply to Data', 'primary', 'md')
      );
    }

    return Components.dataTable({
      columns: [
        { key: 'connection', label: 'Connection', width: '20%' },
        { key: 'schema', label: 'Schema', width: '18%' },
        { key: 'table', label: 'Table', width: '22%' },
        { key: 'column', label: 'Column', width: '22%', render: function(val) {
          return '<code style="font-size:12px;background:var(--sds-bg-subtle);padding:2px 6px;border-radius:3px;">' + val + '</code>';
        }},
        { key: 'tokenized', label: 'Tokenized', width: '12%', render: function(val) {
          var variant = val === 'Yes' ? 'success' : 'warning';
          return Components.tag(val, variant);
        }}
      ],
      rows: applied
    });
  }

  function renderPolicyVersionsTab(policy) {
    var versions = policyVersions[policy.id] || [];
    var html = '';

    html += Components.dataTable({
      columns: [
        { key: 'version', label: 'Version', width: '10%', render: function(val, row) {
          var weight = row.current ? 'font-weight:600;' : '';
          return '<span style="' + weight + '">v' + val + (row.current ? ' (current)' : '') + '</span>';
        }},
        { key: 'changes', label: 'Changes', width: '40%' },
        { key: 'author', label: 'Author', width: '20%' },
        { key: 'date', label: 'Date', width: '18%', render: function(val) {
          return Data.formatDate(val);
        }},
        { key: 'compare', label: '', width: '12%', align: 'right', render: function(val, row) {
          if (!row.current && versions.length > 1) {
            return '<a style="font-size:12px;color:var(--sds-text-link);text-decoration:none;cursor:pointer;" data-navigate="#/policies/' + policy.id + '/diff">Compare</a>';
          }
          return '';
        }}
      ],
      rows: versions
    });

    if (versions.length > 1) {
      html += '<div style="margin-top:16px;">';
      html += Components.button('Compare versions', 'secondary', 'md', 'data-navigate="#/policies/' + policy.id + '/diff"');
      html += '</div>';
    }

    return html;
  }

  function renderPolicyActivityTab(policy) {
    var activities = policyActivity[policy.id] || [];

    return Components.dataTable({
      columns: [
        { key: 'date', label: 'Date', width: '18%', render: function(val) {
          return Data.formatDateTime(val);
        }},
        { key: 'event', label: 'Event', width: '35%', render: function(val) {
          return '<span style="font-weight:500;">' + val + '</span>';
        }},
        { key: 'user', label: 'User', width: '22%' },
        { key: 'detail', label: 'Detail', width: '25%', render: function(val) {
          return '<span style="color:var(--sds-text-tertiary);">' + val + '</span>';
        }}
      ],
      rows: activities
    });
  }

  // ================================================================
  // SCREEN 7: Policy Version Diff
  // ================================================================
  function renderPolicyDiff(params) {
    var content = document.getElementById('content');
    if (!content) return;

    var policy = Data.policies.find(function(p) { return p.id === params.id; });
    if (!policy) {
      content.innerHTML = Components.emptyState(Icons.shield, 'Policy not found', 'The requested policy does not exist.');
      return;
    }

    var versions = policyVersions[policy.id] || [];
    if (versions.length < 2) {
      content.innerHTML = Components.emptyState(Icons.shield, 'Not enough versions', 'At least two versions are needed for comparison.', Components.button('Back to Policy', 'primary', 'md', 'data-navigate="#/policies/' + policy.id + '"'));
      return;
    }

    var html = '';

    // Breadcrumb
    html += Components.breadcrumb([
      { label: 'Policies', href: '#/policies' },
      { label: policy.name, href: '#/policies/' + policy.id },
      { label: 'Compare Versions' }
    ]);

    // Page header with version pickers
    html += '<div class="page-header">';
    html += '<div>';
    html += '<h1 class="page-title">Compare versions</h1>';
    html += '</div>';
    html += '<div class="flex items-center gap-12">';
    html += Components.button('Revert to v' + versions[1].version, 'secondary', 'md');
    html += Components.button('Close', 'tertiary', 'md', 'data-navigate="#/policies/' + policy.id + '"');
    html += '</div>';
    html += '</div>';

    // Version pickers
    html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">';
    html += '<div>';
    html += Components.formSelect('diffVersionLeft', versions.map(function(v) {
      return { value: 'v' + v.version, label: 'Version ' + v.version };
    }), 'v' + versions[1].version);
    html += '</div>';
    html += '<span style="font-size:14px;font-weight:500;color:var(--sds-text-disabled);">vs</span>';
    html += '<div>';
    html += Components.formSelect('diffVersionRight', versions.map(function(v) {
      return { value: 'v' + v.version, label: 'Version ' + v.version };
    }), 'v' + versions[0].version);
    html += '</div>';
    html += '</div>';

    // Diff content (side by side)
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0;border:1px solid var(--sds-border-default);border-radius:8px;overflow:hidden;">';

    // Left column header
    html += '<div style="background:var(--sds-bg-subtle);padding:12px 16px;border-bottom:1px solid var(--sds-border-default);border-right:1px solid var(--sds-border-default);">';
    html += '<div style="font-size:13px;font-weight:600;color:var(--sds-text-secondary);">Version ' + versions[1].version + '</div>';
    html += '<div style="font-size:12px;color:var(--sds-text-tertiary);">' + Data.formatDate(versions[1].date) + ', ' + versions[1].author + '</div>';
    html += '</div>';

    // Right column header
    html += '<div style="background:var(--sds-bg-subtle);padding:12px 16px;border-bottom:1px solid var(--sds-border-default);">';
    html += '<div style="font-size:13px;font-weight:600;color:var(--sds-text-secondary);">Version ' + versions[0].version + ' (current)</div>';
    html += '<div style="font-size:12px;color:var(--sds-text-tertiary);">' + Data.formatDate(versions[0].date) + ', ' + versions[0].author + '</div>';
    html += '</div>';

    // Basics section
    html += renderDiffSectionHeader('Basics');
    html += renderDiffRow('Name', policy.name, policy.name, false);
    html += renderDiffRow('Regulation', policy.regulation, policy.regulation, false);
    html += renderDiffRow('Priority', 'Medium', 'High', true);

    // Token Config section
    html += renderDiffSectionHeader('Token Configuration');
    html += renderDiffRow('PAN Format', 'FPE', 'FPE', false);
    html += renderDiffRow('PAN Preservation', 'Last 4', 'First 4 / Last 4', true);
    html += renderDiffRow('PAN Reversible', 'Yes', 'Yes', false);
    html += renderDiffRow('CVV Format', 'Random', 'Random', false);
    html += renderDiffRow('CVV Reversible', 'No', 'No', false);

    // Scope section
    html += renderDiffSectionHeader('Scope');
    html += renderDiffRow('Scope', 'All matching', 'All matching', false);

    html += '</div>';

    content.innerHTML = html;
  }

  function renderDiffSectionHeader(title) {
    return '<div style="padding:8px 16px;background:var(--sds-bg-subtle);font-size:12px;font-weight:600;color:var(--sds-text-tertiary);text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid var(--sds-border-default);border-right:1px solid var(--sds-border-default);">' + title + '</div>' +
      '<div style="padding:8px 16px;background:var(--sds-bg-subtle);font-size:12px;font-weight:600;color:var(--sds-text-tertiary);text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid var(--sds-border-default);">' + title + '</div>';
  }

  function renderDiffRow(label, oldVal, newVal, changed) {
    var leftBg = changed ? 'background:var(--sds-status-error-bg, #FFEEEB);' : '';
    var rightBg = changed ? 'background:var(--sds-status-success-bg, #F4FAEB);' : '';

    var html = '';
    // Left cell
    html += '<div style="padding:8px 16px;border-bottom:1px solid var(--sds-border-subtle);border-right:1px solid var(--sds-border-default);' + leftBg + '">';
    html += '<div style="font-size:12px;color:var(--sds-text-tertiary);">' + label + '</div>';
    html += '<div style="font-size:13px;color:var(--sds-text-primary);margin-top:2px;">' + oldVal + '</div>';
    if (changed) {
      html += '<div style="font-size:11px;color:var(--sds-status-error-text, #BF5547);margin-top:4px;">\u25B2 changed</div>';
    }
    html += '</div>';

    // Right cell
    html += '<div style="padding:8px 16px;border-bottom:1px solid var(--sds-border-subtle);' + rightBg + '">';
    html += '<div style="font-size:12px;color:var(--sds-text-tertiary);">' + label + '</div>';
    html += '<div style="font-size:13px;color:var(--sds-text-primary);margin-top:2px;">' + newVal + '</div>';
    if (changed) {
      html += '<div style="font-size:11px;color:var(--sds-status-success-text, #62800B);margin-top:4px;">\u25B2 changed</div>';
    }
    html += '</div>';

    return html;
  }

  // ================================================================
  // Register Routes
  // ================================================================
  Router.register('/policies', renderPolicyList);
  Router.register('/policies/templates', renderTemplateGallery);
  Router.register('/policies/create', renderCreatePolicyBasics);
  Router.register('/policies/create/tokens', renderCreatePolicyTokens);
  Router.register('/policies/create/scope', renderCreatePolicyScope);
  Router.register('/policies/create/review', renderCreatePolicyReview);
  Router.register('/policies/:id/diff', renderPolicyDiff);
  Router.register('/policies/:id', renderPolicyDetail);

})();
