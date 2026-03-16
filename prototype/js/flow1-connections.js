/* ============================================================
   Flow 1: Data Source Connections
   Screens: Connection List, Add Connection, Select Schemas,
            Connection Detail
   ============================================================ */

(function() {

  // ---- Platform metadata ----
  var platforms = [
    { id: 'snowflake',   name: 'Snowflake',   oauth: true },
    { id: 'aws-s3',      name: 'AWS S3',       oauth: false },
    { id: 'bigquery',    name: 'BigQuery',     oauth: true },
    { id: 'databricks',  name: 'Databricks',   oauth: false },
    { id: 'postgresql',  name: 'PostgreSQL',   oauth: false },
    { id: 'azure-sql',   name: 'Azure SQL',    oauth: false },
    { id: 'redshift',    name: 'Redshift',     oauth: false }
  ];

  function platformName(id) {
    for (var i = 0; i < platforms.length; i++) {
      if (platforms[i].id === id) return platforms[i].name;
    }
    return id;
  }

  function platformDot(platformId) {
    var color = Data.platformColors[platformId] || '#6B6760'; /* token: --sds-text-tertiary — platform brand colors require hex for inline styles */
    return '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + color + ';margin-right:8px;flex-shrink:0;"></span>';
  }

  function platformIcon(platformId, size) {
    size = size || 32;
    var color = Data.platformColors[platformId] || '#6B6760'; /* token: --sds-text-tertiary — platform brand colors require hex */
    return '<span style="display:inline-flex;align-items:center;justify-content:center;width:' + size + 'px;height:' + size + 'px;border-radius:6px;background:' + color + '15;color:' + color + ';font-weight:700;font-size:' + Math.round(size * 0.38) + 'px;">' + platformName(platformId).substring(0, 2).toUpperCase() + '</span>';
  }

  // ---- Mock schema data for wizard ----
  var mockSchemas = [
    {
      db: 'PROD_DB',
      schemas: [
        { name: 'PUBLIC', tables: 42 },
        { name: 'ANALYTICS', tables: 18 },
        { name: 'FINANCE', tables: 24 },
        { name: 'STAGING', tables: 6 }
      ]
    },
    {
      db: 'DEV_DB',
      schemas: [
        { name: 'PUBLIC', tables: 12 },
        { name: 'SANDBOX', tables: 3 },
        { name: 'TESTING', tables: 8 }
      ]
    },
    {
      db: 'ARCHIVE_DB',
      schemas: [
        { name: 'HISTORICAL', tables: 31 },
        { name: 'BACKUP', tables: 15 }
      ]
    }
  ];


  // ================================================================
  // Screen 1: Connection List
  // ================================================================
  function renderConnectionList() {
    var connections = Data.connections;

    // Aggregate health counts
    var activeCount = 0, degradedCount = 0, errorCount = 0;
    for (var i = 0; i < connections.length; i++) {
      if (connections[i].status === 'active') activeCount++;
      else if (connections[i].status === 'degraded') degradedCount++;
      else if (connections[i].status === 'error') errorCount++;
    }

    var html = '';

    // Page header
    html += Components.pageHeader(
      'Connections',
      null,
      Components.button('<span class="btn-icon">' + Icons.plus + '</span> Add Connection', 'primary', 'md', 'data-navigate="#/connections/add"')
    );

    // Health summary bar
    html += '<div class="health-summary-bar" style="display:flex;align-items:center;gap:16px;margin-bottom:16px;font-size:13px;font-weight:500;">';
    html += '<span style="color:var(--sds-status-success-text,#62800B);">' + Icons.render('check', 14) + ' ' + activeCount + ' Active</span>';
    html += '<span style="color:var(--sds-text-tertiary,#6B6760);">&middot;</span>';
    html += '<span style="color:var(--sds-status-warning-text,#8A7515);">' + Icons.render('warning', 14) + ' ' + degradedCount + ' Degraded</span>';
    html += '<span style="color:var(--sds-text-tertiary,#6B6760);">&middot;</span>';
    html += '<span style="color:var(--sds-status-error-text,#BF5547);">' + Icons.render('error', 14) + ' ' + errorCount + ' Error</span>';
    html += '</div>';

    // Filter bar
    html += Components.filterBar(
      [
        {
          name: 'platform',
          options: [
            { value: '', label: 'All Platforms' },
            { value: 'snowflake', label: 'Snowflake' },
            { value: 'aws-s3', label: 'AWS S3' },
            { value: 'bigquery', label: 'BigQuery' },
            { value: 'databricks', label: 'Databricks' },
            { value: 'postgresql', label: 'PostgreSQL' },
            { value: 'azure-sql', label: 'Azure SQL' },
            { value: 'redshift', label: 'Redshift' }
          ]
        },
        {
          name: 'status',
          options: [
            { value: '', label: 'All Statuses' },
            { value: 'active', label: 'Active' },
            { value: 'degraded', label: 'Degraded' },
            { value: 'error', label: 'Error' }
          ]
        }
      ],
      'Search connections...'
    );

    // Data table
    html += Components.dataTable({
      columns: [
        {
          key: 'name',
          label: 'Name',
          width: '',
          render: function(val, row) {
            return '<div style="display:flex;align-items:center;">' + platformDot(row.platform) + '<span style="color:var(--sds-text-link,#013D5B);font-weight:500;">' + val + '</span></div>';
          }
        },
        {
          key: 'platform',
          label: 'Platform',
          width: '140px',
          render: function(val) {
            return platformName(val);
          }
        },
        {
          key: 'status',
          label: 'Status',
          width: '120px',
          render: function(val) {
            return Components.statusTag(val);
          }
        },
        {
          key: 'schemas',
          label: 'Schemas',
          width: '90px',
          render: function(val) {
            return val;
          }
        },
        {
          key: 'tables',
          label: 'Tables',
          width: '90px',
          render: function(val) {
            return Data.formatNumber(val);
          }
        },
        {
          key: 'classificationCoverage',
          label: 'Classification',
          width: '140px',
          render: function(val) {
            var variant = val >= 80 ? 'success' : (val >= 50 ? '' : 'warning');
            return '<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:13px;min-width:32px;">' + val + '%</span>' + Components.progressBar(val, variant) + '</div>';
          }
        },
        {
          key: 'lastScan',
          label: 'Last Scan',
          width: '120px',
          render: function(val) {
            return '<span style="color:var(--sds-text-secondary,#54514D);">' + Data.timeAgo(val) + '</span>';
          }
        },
        {
          key: 'actions',
          label: '',
          width: '48px',
          align: 'right',
          render: function(val, row) {
            return Components.iconButton('more-vertical', 'title="Actions" data-action-row="' + row.id + '"');
          }
        }
      ],
      rows: connections,
      onRowClick: '#/connections/:id'
    });

    // Pagination info
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;font-size:13px;color:var(--sds-text-tertiary,#6B6760);">';
    html += '<span>Showing 1\u2013' + connections.length + ' of ' + connections.length + '</span>';
    html += '</div>';

    var content = document.getElementById('content');
    content.innerHTML = html;

    // Wire up filter bar search
    var searchInput = content.querySelector('.filter-bar input[type="text"]');
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        var query = this.value.toLowerCase();
        var filtered = Data.connections.filter(function(c) {
          return c.name.toLowerCase().indexOf(query) > -1;
        });
        var tableBody = content.querySelector('.data-table tbody');
        if (tableBody) {
          if (filtered.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--sds-text-tertiary);">No connections match your search</td></tr>';
          } else {
            tableBody.innerHTML = filtered.map(function(c) {
              var row = '<tr data-navigate="#/connections/' + c.id + '" role="link" tabindex="0">';
              row += '<td><div style="display:flex;align-items:center;">' + platformDot(c.platform) + '<span style="color:var(--sds-text-link,#013D5B);font-weight:500;">' + c.name + '</span></div></td>';
              row += '<td>' + platformName(c.platform) + '</td>';
              row += '<td>' + Components.statusTag(c.status) + '</td>';
              row += '<td>' + c.schemas + '</td>';
              row += '<td>' + Data.formatNumber(c.tables) + '</td>';
              var variant = c.classificationCoverage >= 80 ? 'success' : (c.classificationCoverage >= 50 ? '' : 'warning');
              row += '<td><div style="display:flex;align-items:center;gap:8px;"><span style="font-size:13px;min-width:32px;">' + c.classificationCoverage + '%</span>' + Components.progressBar(c.classificationCoverage, variant) + '</div></td>';
              row += '<td><span style="color:var(--sds-text-secondary,#54514D);">' + Data.timeAgo(c.lastScan) + '</span></td>';
              row += '<td class="col-actions">' + Components.iconButton('more-vertical', 'title="Actions" data-action-row="' + c.id + '"') + '</td>';
              row += '</tr>';
              return row;
            }).join('');
          }
        }
      });
    }
  }


  // ================================================================
  // Screen 2: Add Connection
  // ================================================================
  function renderAddConnection() {
    var html = '';

    // Breadcrumb
    html += Components.breadcrumb([
      { label: 'Connections', href: '#/connections' },
      { label: 'Add Connection' }
    ]);

    // Wizard steps
    html += '<div style="margin:16px 0 24px;">';
    html += Components.wizardSteps([
      { label: 'Configure' },
      { label: 'Select Schemas' }
    ], 0);
    html += '</div>';

    // Page header
    html += Components.pageHeader(
      'Add Connection',
      null,
      Components.button('Cancel', 'tertiary', 'md', 'data-navigate="#/connections"')
    );

    // Platform selection grid
    html += '<div style="max-width:720px;">';
    html += '<h3 style="font-size:16px;font-weight:600;color:var(--sds-text-primary,#1C1A17);margin-bottom:16px;">Choose a platform</h3>';
    html += '<div class="platform-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;">';

    for (var i = 0; i < platforms.length; i++) {
      var p = platforms[i];
      var color = Data.platformColors[p.id] || '#6B6760';
      html += '<div class="platform-card" data-platform="' + p.id + '" style="';
      html += 'background:var(--sds-bg-card,#fff);border:1px solid var(--sds-border-default,#E0DCD3);';
      html += 'border-radius:8px;padding:16px;cursor:pointer;text-align:center;';
      html += 'transition:border-color 0.15s ease,box-shadow 0.15s ease;position:relative;">';
      if (p.oauth) {
        html += '<span style="position:absolute;top:8px;right:8px;color:var(--sds-status-info-text,#1565C0);font-size:12px;" title="OAuth available">&#9889;</span>';
      }
      html += platformIcon(p.id, 32);
      html += '<div style="font-size:13px;font-weight:500;color:var(--sds-text-primary,#1C1A17);margin-top:8px;">' + p.name + '</div>';
      html += '</div>';
    }

    html += '</div>'; // end grid

    // Credential form area (hidden initially)
    html += '<div id="credential-form-area"></div>';
    html += '</div>'; // end max-width wrapper

    document.getElementById('content').innerHTML = html;

    // Wire up platform card clicks
    var cards = document.querySelectorAll('.platform-card');
    for (var c = 0; c < cards.length; c++) {
      cards[c].addEventListener('click', function() {
        var pid = this.getAttribute('data-platform');
        selectPlatform(pid);
      });
    }
  }

  function selectPlatform(pid) {
    // Update card states
    var cards = document.querySelectorAll('.platform-card');
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      if (card.getAttribute('data-platform') === pid) {
        card.style.border = '2px solid var(--sds-interactive-primary,#013D5B)';
        card.style.background = 'var(--sds-color-blue-025,#F2F7F7)';
        card.style.boxShadow = '0 0 0 3px var(--sds-interactive-primary-subtle,#B8D4E3)';
        card.style.opacity = '1';
      } else {
        card.style.border = '1px solid var(--sds-border-default,#E0DCD3)';
        card.style.background = 'var(--sds-bg-card,#fff)';
        card.style.boxShadow = 'none';
        card.style.opacity = '0.6';
      }
    }

    // Build credential form
    var pName = platformName(pid);
    var isOAuth = false;
    for (var j = 0; j < platforms.length; j++) {
      if (platforms[j].id === pid) { isOAuth = platforms[j].oauth; break; }
    }

    var formHtml = '';
    formHtml += '<hr style="border:none;border-top:1px solid var(--sds-border-subtle,#F0EDE6);margin:24px 0;">';
    formHtml += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">';
    formHtml += platformIcon(pid, 24);
    formHtml += '<span style="font-size:16px;font-weight:600;color:var(--sds-text-primary,#1C1A17);">' + pName + '</span>';
    formHtml += '</div>';

    if (isOAuth) {
      formHtml += Components.button('Quick Connect with OAuth', 'secondary', 'lg', 'style="width:100%;height:48px;" id="btn-oauth"');
      formHtml += '<div style="display:flex;align-items:center;gap:16px;margin:20px 0;">';
      formHtml += '<div style="flex:1;height:1px;background:var(--sds-border-subtle,#F0EDE6);"></div>';
      formHtml += '<span style="font-size:12px;font-weight:500;color:var(--sds-text-tertiary,#6B6760);background:var(--sds-bg-page,#FAF8F5);padding:0 12px;">or enter credentials manually</span>';
      formHtml += '<div style="flex:1;height:1px;background:var(--sds-border-subtle,#F0EDE6);"></div>';
      formHtml += '</div>';
    }

    formHtml += Components.formGroup('Connection Name', Components.formInput('conn-name', '', 'e.g. Production Data Warehouse'), 'A display name to identify this connection');
    formHtml += Components.formGroup('Host / Account URL', Components.formInput('host', '', 'e.g. acme.snowflakecomputing.com'), null);
    formHtml += '<div style="display:grid;grid-template-columns:3fr 1fr;gap:12px;">';
    formHtml += Components.formGroup('Username', Components.formInput('username', '', 'Enter username'));
    formHtml += Components.formGroup('Port', Components.formInput('port', pid === 'postgresql' ? '5432' : '443', ''));
    formHtml += '</div>';
    formHtml += Components.formGroup('Password', Components.formInput('password', '', 'Enter password', 'password'));

    if (pid === 'snowflake') {
      formHtml += Components.formGroup('Warehouse', Components.formInput('warehouse', '', 'e.g. COMPUTE_WH'), 'The default warehouse for queries');
      formHtml += Components.formGroup('Role (optional)', Components.formInput('role', '', 'e.g. DATA_ENGINEER'), 'Leave blank to use default role');
    }

    formHtml += '<div style="margin-top:24px;display:flex;gap:12px;align-items:center;" id="test-btn-area">';
    formHtml += Components.button('Test Connection', 'primary', 'md', 'id="btn-test-connection"');
    formHtml += '</div>';

    formHtml += '<div id="test-result-area" style="margin-top:16px;"></div>';

    document.getElementById('credential-form-area').innerHTML = formHtml;

    // Wire up test connection button
    var testBtn = document.getElementById('btn-test-connection');
    if (testBtn) {
      testBtn.addEventListener('click', function() {
        simulateTestConnection();
      });
    }
  }

  function simulateTestConnection() {
    var testBtn = document.getElementById('btn-test-connection');
    var resultArea = document.getElementById('test-result-area');

    // Show loading
    testBtn.disabled = true;
    testBtn.textContent = 'Testing...';

    resultArea.innerHTML = '<div style="font-size:13px;color:var(--sds-text-tertiary,#6B6760);">Connecting to host...</div>';

    // Simulate success after 1.5s
    setTimeout(function() {
      testBtn.disabled = false;
      testBtn.textContent = 'Re-test';
      testBtn.className = 'btn btn-secondary btn-md';

      var successHtml = '';
      successHtml += '<div style="background:var(--sds-status-success-bg,#F0F4E4);border-left:3px solid var(--sds-status-success-strong,#7A9A01);padding:12px 16px;border-radius:0 6px 6px 0;display:flex;align-items:center;gap:8px;margin-bottom:16px;">';
      successHtml += '<span style="color:var(--sds-status-success-text,#62800B);">' + Icons.render('check', 16) + '</span>';
      successHtml += '<span style="font-size:13px;font-weight:500;color:var(--sds-status-success-text,#62800B);">Connection successful</span>';
      successHtml += '</div>';

      successHtml += Components.button('Continue to Schema Selection <span class="btn-icon" style="margin-left:4px;">' + Icons['arrow-right'] + '</span>', 'primary', 'md', 'data-navigate="#/connections/add/schemas"');

      resultArea.innerHTML = successHtml;
    }, 1500);
  }


  // ================================================================
  // Screen 3: Select Schemas
  // ================================================================
  function renderSelectSchemas() {
    var html = '';

    // Breadcrumb
    html += Components.breadcrumb([
      { label: 'Connections', href: '#/connections' },
      { label: 'Add Connection', href: '#/connections/add' },
      { label: 'Select Schemas' }
    ]);

    // Wizard steps (step 2 active)
    html += '<div style="margin:16px 0 24px;">';
    html += Components.wizardSteps([
      { label: 'Configure' },
      { label: 'Select Schemas' }
    ], 1);
    html += '</div>';

    // Split layout
    html += '<div style="display:flex;border:1px solid var(--sds-border-default,#E0DCD3);border-radius:8px;overflow:hidden;min-height:500px;">';

    // Left panel - schema tree
    html += '<div style="flex:0 0 60%;padding:24px;background:var(--sds-bg-page,#FAF8F5);overflow-y:auto;">';
    html += '<h3 style="font-size:16px;font-weight:600;color:var(--sds-text-primary,#1C1A17);margin-bottom:16px;">Select schemas to scan</h3>';
    html += '<input class="search-input" type="text" placeholder="Search databases and schemas..." style="width:100%;margin-bottom:12px;">';

    // Select all
    html += '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--sds-border-subtle,#F0EDE6);margin-bottom:8px;">';
    html += '<input type="checkbox" id="select-all-schemas" style="width:16px;height:16px;cursor:pointer;">';
    html += '<label for="select-all-schemas" style="font-size:13px;font-weight:500;color:var(--sds-text-primary,#1C1A17);cursor:pointer;">Select all</label>';
    html += '</div>';

    // Schema tree
    for (var d = 0; d < mockSchemas.length; d++) {
      var db = mockSchemas[d];
      html += '<div class="schema-db-node" data-db="' + d + '">';

      // Database row
      html += '<div class="schema-db-header" data-db-toggle="' + d + '" style="display:flex;align-items:center;gap:8px;padding:8px 0;cursor:pointer;border-radius:6px;transition:background 0.12s;">';
      html += '<span class="db-chevron" style="color:var(--sds-text-tertiary,#6B6760);transition:transform 0.15s;display:inline-flex;transform:rotate(90deg);">' + Icons.render('chevron-right', 14) + '</span>';
      html += '<span style="color:var(--sds-text-secondary,#54514D);">' + Icons.render('database', 16) + '</span>';
      html += '<span style="font-size:14px;font-weight:500;color:var(--sds-text-primary,#1C1A17);">' + db.db + '</span>';
      html += '</div>';

      // Schema children
      html += '<div class="schema-children" data-db-children="' + d + '">';
      for (var s = 0; s < db.schemas.length; s++) {
        var schema = db.schemas[s];
        var isChecked = (d === 0 && s <= 2) ? ' checked' : ''; // Pre-check first 3 schemas
        html += '<div style="display:flex;align-items:center;gap:8px;padding:6px 0 6px 32px;">';
        html += '<input type="checkbox" class="schema-checkbox" data-db="' + d + '" data-schema="' + s + '" data-name="' + schema.name + '" data-tables="' + schema.tables + '"' + isChecked + ' style="width:16px;height:16px;cursor:pointer;">';
        html += '<span style="color:var(--sds-text-tertiary,#6B6760);">' + Icons.render('table', 14) + '</span>';
        html += '<span style="font-size:13px;color:var(--sds-text-secondary,#54514D);">' + schema.name + '</span>';
        html += ' ' + Components.badge(schema.tables, 'neutral');
        html += '</div>';
      }
      html += '</div>'; // end children
      html += '</div>'; // end db node
    }

    html += '</div>'; // end left panel

    // Vertical divider
    html += '<div style="width:1px;background:var(--sds-border-default,#E0DCD3);"></div>';

    // Right panel - summary
    html += '<div style="flex:0 0 calc(40% - 1px);padding:24px;background:var(--sds-bg-surface,#F7F5F0);display:flex;flex-direction:column;">';

    // Connection info
    html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:24px;">';
    html += platformIcon('snowflake', 20);
    html += '<div>';
    html += '<div style="font-size:14px;font-weight:600;color:var(--sds-text-primary,#1C1A17);">Snowflake</div>';
    html += '<div style="font-size:12px;color:var(--sds-text-tertiary,#6B6760);overflow:hidden;text-overflow:ellipsis;">acme.snowflakecomputing.com</div>';
    html += '</div>';
    html += '</div>';

    // Selection stats
    html += '<div style="margin-bottom:16px;">';
    html += '<div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;color:var(--sds-text-tertiary,#6B6760);margin-bottom:4px;">Selected</div>';
    html += '<div id="schema-selected-count" style="font-size:20px;font-weight:600;color:var(--sds-text-primary,#1C1A17);">3 schemas, 84 tables</div>';
    html += '</div>';

    // Scan estimate
    html += '<div style="margin-bottom:16px;">';
    html += '<div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;color:var(--sds-text-tertiary,#6B6760);margin-bottom:4px;">Estimated scan time</div>';
    html += '<div id="schema-scan-estimate" style="font-size:16px;font-weight:500;color:var(--sds-text-primary,#1C1A17);">~15 minutes</div>';
    html += '<div style="font-size:12px;color:var(--sds-text-tertiary,#6B6760);margin-top:4px;">Initial scans are the longest. Subsequent scans are incremental.</div>';
    html += '</div>';

    // Selected schemas list
    html += '<div style="margin-bottom:16px;">';
    html += '<div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;color:var(--sds-text-tertiary,#6B6760);margin-bottom:8px;">Schemas included</div>';
    html += '<div id="schema-selected-list" style="max-height:200px;overflow-y:auto;"></div>';
    html += '</div>';

    // Divider
    html += '<div style="border-top:1px solid var(--sds-border-subtle,#F0EDE6);margin:auto 0 0 0;padding-top:24px;">';
    html += '<div style="display:flex;gap:12px;justify-content:flex-end;">';
    html += Components.button('Back', 'tertiary', 'md', 'data-navigate="#/connections/add"');
    html += Components.button('Save Only', 'secondary', 'md', 'data-navigate="#/connections/conn-1"');
    html += Components.button('Save + Start Scan', 'primary', 'md', 'data-navigate="#/connections/conn-1"');
    html += '</div>';
    html += '</div>';

    html += '</div>'; // end right panel
    html += '</div>'; // end split layout

    document.getElementById('content').innerHTML = html;

    // Wire up interactions
    setupSchemaInteractions();
  }

  function setupSchemaInteractions() {
    // Toggle database expand/collapse
    var dbHeaders = document.querySelectorAll('.schema-db-header');
    for (var i = 0; i < dbHeaders.length; i++) {
      dbHeaders[i].addEventListener('click', function(e) {
        // Don't toggle if clicking a checkbox
        if (e.target.type === 'checkbox') return;
        var dbIdx = this.getAttribute('data-db-toggle');
        var children = document.querySelector('[data-db-children="' + dbIdx + '"]');
        var chevron = this.querySelector('.db-chevron');
        if (children.style.display === 'none') {
          children.style.display = 'block';
          chevron.style.transform = 'rotate(90deg)';
        } else {
          children.style.display = 'none';
          chevron.style.transform = 'rotate(0deg)';
        }
      });
    }

    // Update summary on checkbox changes
    var checkboxes = document.querySelectorAll('.schema-checkbox');
    for (var c = 0; c < checkboxes.length; c++) {
      checkboxes[c].addEventListener('change', updateSchemaSummary);
    }

    // Select all
    var selectAll = document.getElementById('select-all-schemas');
    if (selectAll) {
      selectAll.addEventListener('change', function() {
        var cbs = document.querySelectorAll('.schema-checkbox');
        for (var j = 0; j < cbs.length; j++) {
          cbs[j].checked = this.checked;
        }
        updateSchemaSummary();
      });
    }

    // Initial summary
    updateSchemaSummary();
  }

  function updateSchemaSummary() {
    var checkboxes = document.querySelectorAll('.schema-checkbox:checked');
    var schemaCount = checkboxes.length;
    var tableCount = 0;
    var listHtml = '';

    for (var i = 0; i < checkboxes.length; i++) {
      var tables = parseInt(checkboxes[i].getAttribute('data-tables'), 10);
      var name = checkboxes[i].getAttribute('data-name');
      tableCount += tables;

      listHtml += '<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;">';
      listHtml += '<span style="font-size:13px;font-weight:500;color:var(--sds-text-primary,#1C1A17);">' + name + '</span>';
      listHtml += '<span style="font-size:13px;color:var(--sds-text-tertiary,#6B6760);">(' + tables + ' tables)</span>';
      listHtml += '</div>';
    }

    var countEl = document.getElementById('schema-selected-count');
    if (countEl) {
      countEl.textContent = schemaCount + ' schema' + (schemaCount !== 1 ? 's' : '') + ', ' + tableCount + ' tables';
    }

    var estimateEl = document.getElementById('schema-scan-estimate');
    if (estimateEl) {
      var mins = Math.max(5, Math.round(tableCount * 0.18));
      estimateEl.textContent = '~' + mins + ' minutes';
    }

    var listEl = document.getElementById('schema-selected-list');
    if (listEl) {
      listEl.innerHTML = listHtml || '<div style="font-size:13px;color:var(--sds-text-tertiary,#6B6760);">No schemas selected</div>';
    }
  }


  // ================================================================
  // Screen 4: Connection Detail
  // ================================================================
  function renderConnectionDetail(params) {
    var conn = Data.getConnection(params.id);
    if (!conn) {
      document.getElementById('content').innerHTML = Components.emptyState(
        Icons.render('error', 48),
        'Connection not found',
        'The connection you are looking for does not exist.',
        Components.button('Back to Connections', 'primary', 'md', 'data-navigate="#/connections"')
      );
      return;
    }

    var tables = Data.getTablesForConnection(conn.id);
    var scans = Data.getScansForConnection(conn.id);
    var pName = platformName(conn.platform);

    var html = '';

    // Breadcrumb
    html += Components.breadcrumb([
      { label: 'Connections', href: '#/connections' },
      { label: conn.name }
    ]);

    // Page header with status
    var headerLeft = '<div style="display:flex;align-items:center;gap:10px;">' +
      platformIcon(conn.platform, 24) +
      '<span style="font-size:24px;font-weight:600;color:var(--sds-text-primary,#1C1A17);">' + conn.name + '</span> ' +
      Components.statusTag(conn.status) +
      '</div>';

    var headerActions = Components.button('Delete', 'danger', 'sm', 'data-action="delete-connection"') + ' ' +
      Components.button('<span class="btn-icon">' + Icons.edit + '</span> Edit', 'secondary', 'sm', 'id="btn-edit-conn"') + ' ' +
      Components.button('Trigger Scan', 'primary', 'sm', conn.status === 'error' ? 'disabled title="Connection must be restored before scanning"' : '') + ' ' +
      Components.iconButton('more-vertical', 'title="More actions"');

    html += '<div class="page-header" style="margin-top:8px;">';
    html += '<div>' + headerLeft + '</div>';
    html += '<div class="flex items-center gap-12">' + headerActions + '</div>';
    html += '</div>';

    // Status banner for error/degraded
    if (conn.status === 'error') {
      html += '<div style="background:var(--sds-status-error-bg,#FDF0EE);border-left:3px solid var(--sds-status-error-strong,#CF6253);padding:12px 16px;border-radius:0 6px 6px 0;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;">';
      html += '<div style="display:flex;align-items:center;gap:8px;">';
      html += '<span style="color:var(--sds-status-error-text,#BF5547);">' + Icons.render('error', 16) + '</span>';
      html += '<span style="font-size:13px;color:var(--sds-text-primary,#1C1A17);">' + (conn.errorMessage || 'Connection lost. Unable to reach the data source.') + '</span>';
      html += '</div>';
      html += Components.button('Reconnect', 'secondary', 'sm', 'data-navigate="#/connections/add"');
      html += '</div>';
    } else if (conn.status === 'degraded') {
      html += '<div style="background:var(--sds-status-warning-bg,#FDF8E8);border-left:3px solid var(--sds-status-warning-strong,#C4AA25);padding:12px 16px;border-radius:0 6px 6px 0;margin-bottom:16px;display:flex;align-items:center;gap:8px;">';
      html += '<span style="color:var(--sds-status-warning-text,#8A7515);">' + Icons.render('warning', 16) + '</span>';
      html += '<span style="font-size:13px;color:var(--sds-text-primary,#1C1A17);">Intermittent connectivity detected. Scans may experience delays.</span>';
      html += '</div>';
    }

    // Tabs
    html += '<div id="detail-tabs">';
    html += Components.tabs([
      { id: 'overview', label: 'Overview' },
      { id: 'schemas', label: 'Schemas', badge: conn.schemas },
      { id: 'scan-history', label: 'Scan History' },
      { id: 'settings', label: 'Settings' }
    ], 'overview');
    html += '</div>';

    // Tab content area
    html += '<div id="detail-tab-content" style="margin-top:24px;"></div>';

    var content = document.getElementById('content');
    content.innerHTML = html;

    // Delegated click handler for connection detail actions
    content.onclick = function(e) {
      var deleteBtn = e.target.closest('[data-action="delete-connection"]');
      if (deleteBtn) {
        e.preventDefault();
        var overlay = document.getElementById('overlay-container');
        if (overlay) {
          overlay.innerHTML = Components.confirmModal(
            'Delete Connection',
            'This will permanently remove <strong>' + conn.name + '</strong> and all associated scan data. This action cannot be undone.',
            conn.name,
            'data-navigate="#/connections"'
          );
          // Wire up confirm input validation
          var confirmInput = overlay.querySelector('[data-confirm-input]');
          var confirmBtn = overlay.querySelector('[data-confirm-action]');
          if (confirmInput && confirmBtn) {
            confirmInput.addEventListener('input', function() {
              if (this.value === conn.name) {
                confirmBtn.disabled = false;
                confirmBtn.classList.remove('is-disabled');
              } else {
                confirmBtn.disabled = true;
                confirmBtn.classList.add('is-disabled');
              }
            });
          }
        }
        return;
      }
    };

    // Wire up tab switching
    var tabBtns = document.querySelectorAll('#detail-tabs .sds-tab');
    for (var t = 0; t < tabBtns.length; t++) {
      tabBtns[t].addEventListener('click', function() {
        var tabId = this.getAttribute('data-tab');
        // Update active states
        var allTabs = document.querySelectorAll('#detail-tabs .sds-tab');
        for (var a = 0; a < allTabs.length; a++) {
          allTabs[a].classList.toggle('active', allTabs[a].getAttribute('data-tab') === tabId);
        }
        renderDetailTab(tabId, conn, tables, scans);
      });
    }

    // Render default tab
    renderDetailTab('overview', conn, tables, scans);
  }

  function renderDetailTab(tabId, conn, tables, scans) {
    var container = document.getElementById('detail-tab-content');
    if (!container) return;

    switch (tabId) {
      case 'overview':
        renderOverviewTab(container, conn, tables, scans);
        break;
      case 'schemas':
        renderSchemasTab(container, conn, tables);
        break;
      case 'scan-history':
        renderScanHistoryTab(container, conn, scans);
        break;
      case 'settings':
        renderSettingsTab(container, conn);
        break;
    }
  }

  function renderOverviewTab(container, conn, tables, scans) {
    var html = '';

    // Metric cards row
    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;">';
    html += Components.statCard('Connection Status', Components.statusTag(conn.status));
    html += Components.statCard('Last Scan', Data.timeAgo(conn.lastScan));
    html += Components.statCard('Schemas Scanned', conn.schemas.toString());
    html += Components.statCard('Classification Coverage', conn.classificationCoverage + '%');
    html += '</div>';

    // Connection health card with sparkline
    var latencyData = conn.latency ? [
      conn.latency * 0.8,
      conn.latency * 1.1,
      conn.latency * 0.9,
      conn.latency * 1.3,
      conn.latency * 0.95,
      conn.latency * 1.05,
      conn.latency * 0.85,
      conn.latency * 1.2,
      conn.latency * 0.9,
      conn.latency * 1.0
    ] : [];

    html += Components.card({
      title: 'Connection Health',
      bordered: true,
      actions: Components.toggleTabs([
        { id: '24h', label: '24h' },
        { id: '7d', label: '7d' },
        { id: '30d', label: '30d' }
      ], '24h'),
      body: '<div style="display:flex;align-items:center;gap:24px;padding:16px 0;">' +
        '<div>' +
        '<div style="font-size:13px;color:var(--sds-text-secondary,#54514D);margin-bottom:4px;">Avg Latency</div>' +
        '<div style="font-size:24px;font-weight:600;color:var(--sds-text-primary,#1C1A17);">' + (conn.latency ? conn.latency + 'ms' : '--') + '</div>' +
        '</div>' +
        '<div>' +
        '<div style="font-size:13px;color:var(--sds-text-secondary,#54514D);margin-bottom:4px;">Uptime</div>' +
        '<div style="font-size:24px;font-weight:600;color:var(--sds-text-primary,#1C1A17);">' + (conn.status === 'error' ? '--' : '99.8%') + '</div>' +
        '</div>' +
        '<div style="flex:1;">' +
        (latencyData.length > 0 ? Charts.sparkline(latencyData, 300, 48) : '<span style="color:var(--sds-text-tertiary,#6B6760);">No data available</span>') +
        '</div>' +
        '</div>'
    });

    html += '<div style="height:24px;"></div>';

    // Recent scans card
    var recentScans = scans.slice(0, 3);
    var recentScansBody = '';

    if (recentScans.length === 0) {
      recentScansBody = '<div style="padding:24px;text-align:center;color:var(--sds-text-tertiary,#6B6760);font-size:13px;">No scans yet. Trigger your first scan to discover and classify data.</div>';
    } else {
      recentScansBody = Components.dataTable({
        columns: [
          {
            key: 'startedAt',
            label: 'Date',
            render: function(val) {
              return '<span style="color:var(--sds-text-secondary,#54514D);">' + Data.formatDateTime(val) + '</span>';
            }
          },
          {
            key: 'duration',
            label: 'Duration',
            width: '100px',
            render: function(val) {
              return val || '--';
            }
          },
          {
            key: 'tablesScanned',
            label: 'Tables',
            width: '80px',
            render: function(val, row) {
              return val + ' / ' + row.tablesTotal;
            }
          },
          {
            key: 'newFindings',
            label: 'New Findings',
            width: '110px',
            render: function(val) {
              return val > 0 ? Components.badge(val, 'info') : '0';
            }
          },
          {
            key: 'status',
            label: 'Status',
            width: '100px',
            render: function(val) {
              return Components.statusTag(val);
            }
          }
        ],
        rows: recentScans
      });
    }

    html += Components.card({
      title: 'Recent Scans',
      bordered: true,
      actions: '<a style="font-size:13px;color:var(--sds-text-link,#013D5B);cursor:pointer;text-decoration:none;" id="link-view-all-scans">View All</a>',
      body: recentScansBody
    });

    html += '<div style="height:24px;"></div>';

    // Recent activity
    var connActivity = Data.activityLog.filter(function(a) {
      return a.message.indexOf(conn.name) > -1;
    }).slice(0, 5);

    if (connActivity.length > 0) {
      var activityBody = '<div style="padding:4px 0;">';
      for (var i = 0; i < connActivity.length; i++) {
        var act = connActivity[i];
        var severityColor = act.severity === 'error' ? 'var(--sds-status-error-text,#BF5547)' :
          act.severity === 'success' ? 'var(--sds-status-success-text,#62800B)' :
          'var(--sds-text-tertiary,#6B6760)';

        activityBody += '<div style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid var(--sds-border-subtle,#F0EDE6);">';
        activityBody += '<span style="color:' + severityColor + ';margin-top:2px;">' + Icons.render('clock', 14) + '</span>';
        activityBody += '<div style="flex:1;">';
        activityBody += '<div style="font-size:13px;color:var(--sds-text-primary,#1C1A17);">' + act.message + '</div>';
        activityBody += '<div style="font-size:12px;color:var(--sds-text-tertiary,#6B6760);margin-top:2px;">' + Data.timeAgo(act.timestamp) + '</div>';
        activityBody += '</div>';
        activityBody += '</div>';
      }
      activityBody += '</div>';

      html += Components.card({
        title: 'Recent Activity',
        bordered: true,
        body: activityBody
      });
    }

    container.innerHTML = html;

    // Wire up "View All" link
    var viewAllLink = document.getElementById('link-view-all-scans');
    if (viewAllLink) {
      viewAllLink.addEventListener('click', function() {
        var scanTab = document.querySelector('[data-tab="scan-history"]');
        if (scanTab) scanTab.click();
      });
    }
  }

  function renderSchemasTab(container, conn, tables) {
    var html = '';

    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">';
    html += '<h3 style="font-size:16px;font-weight:600;color:var(--sds-text-primary,#1C1A17);">Schemas</h3>';
    html += Components.button('Edit Schema Selection', 'secondary', 'sm', '');
    html += '</div>';

    // Group tables by schema
    var schemaMap = {};
    for (var i = 0; i < tables.length; i++) {
      var schema = tables[i].schema;
      if (!schemaMap[schema]) {
        schemaMap[schema] = [];
      }
      schemaMap[schema].push(tables[i]);
    }

    var schemaNames = Object.keys(schemaMap);

    if (schemaNames.length === 0) {
      html += '<div style="padding:40px;text-align:center;color:var(--sds-text-tertiary,#6B6760);font-size:13px;">No tables found for this connection.</div>';
    } else {
      for (var s = 0; s < schemaNames.length; s++) {
        var sName = schemaNames[s];
        var sTables = schemaMap[sName];

        html += '<div style="margin-bottom:16px;">';
        html += '<div style="display:flex;align-items:center;gap:8px;padding:10px 0;border-bottom:1px solid var(--sds-border-subtle,#F0EDE6);">';
        html += '<span style="color:var(--sds-text-secondary,#54514D);">' + Icons.render('database', 16) + '</span>';
        html += '<span style="font-size:14px;font-weight:500;color:var(--sds-text-primary,#1C1A17);">' + sName + '</span>';
        html += Components.badge(sTables.length, 'neutral');

        // Classification coverage for schema
        var totalCols = 0, classifiedCols = 0;
        for (var t = 0; t < sTables.length; t++) {
          totalCols += sTables[t].columns;
          classifiedCols += sTables[t].classifiedColumns;
        }
        var schemaPct = totalCols > 0 ? Math.round((classifiedCols / totalCols) * 100) : 0;
        html += '<span style="margin-left:auto;font-size:12px;color:var(--sds-text-tertiary,#6B6760);">' + schemaPct + '% classified</span>';
        html += '</div>';

        // Tables in schema
        for (var tt = 0; tt < sTables.length; tt++) {
          var tbl = sTables[tt];
          html += '<div style="display:flex;align-items:center;gap:8px;padding:8px 0 8px 28px;border-bottom:1px solid var(--sds-border-subtle,#F0EDE6);cursor:pointer;transition:background 0.12s;" data-navigate="#/catalog/' + tbl.id + '">';
          html += '<span style="color:var(--sds-text-tertiary,#6B6760);">' + Icons.render('table', 14) + '</span>';
          html += '<span style="font-size:13px;color:var(--sds-text-link,#013D5B);font-weight:500;">' + tbl.name + '</span>';
          html += '<span style="font-size:12px;color:var(--sds-text-tertiary,#6B6760);">' + tbl.columns + ' cols</span>';
          html += '<span style="margin-left:auto;">' + Components.progressBar(tbl.classifiedPct, tbl.classifiedPct >= 80 ? 'success' : '') + '</span>';
          html += '<span style="font-size:12px;color:var(--sds-text-secondary,#54514D);min-width:36px;text-align:right;">' + tbl.classifiedPct + '%</span>';
          if (tbl.tags && tbl.tags.length > 0) {
            for (var tg = 0; tg < tbl.tags.length; tg++) {
              html += ' ' + Components.tag(tbl.tags[tg], 'neutral');
            }
          }
          html += '</div>';
        }

        html += '</div>';
      }
    }

    container.innerHTML = html;
  }

  function renderScanHistoryTab(container, conn, scans) {
    var html = '';

    html += '<h3 style="font-size:16px;font-weight:600;color:var(--sds-text-primary,#1C1A17);margin-bottom:16px;">Scan History</h3>';

    if (scans.length === 0) {
      html += '<div style="padding:40px;text-align:center;color:var(--sds-text-tertiary,#6B6760);font-size:13px;">No scans have been run for this connection yet.</div>';
    } else {
      // Sort scans newest first
      var sortedScans = scans.slice().sort(function(a, b) {
        return new Date(b.startedAt || 0) - new Date(a.startedAt || 0);
      });

      html += Components.dataTable({
        columns: [
          {
            key: 'id',
            label: 'Scan ID',
            width: '100px',
            render: function(val) {
              return '<span style="font-family:monospace;font-size:12px;color:var(--sds-text-secondary,#54514D);">' + val + '</span>';
            }
          },
          {
            key: 'startedAt',
            label: 'Started',
            render: function(val) {
              return Data.formatDateTime(val);
            }
          },
          {
            key: 'duration',
            label: 'Duration',
            width: '100px',
            render: function(val) {
              return val || '--';
            }
          },
          {
            key: 'tablesScanned',
            label: 'Tables',
            width: '100px',
            render: function(val, row) {
              return val + ' / ' + row.tablesTotal;
            }
          },
          {
            key: 'newFindings',
            label: 'New Findings',
            width: '110px',
            render: function(val) {
              if (val > 0) return Components.badge(val, 'info');
              return '0';
            }
          },
          {
            key: 'status',
            label: 'Status',
            width: '110px',
            render: function(val) {
              return Components.statusTag(val);
            }
          },
          {
            key: 'triggeredBy',
            label: 'Triggered By',
            width: '110px',
            render: function(val) {
              return '<span style="color:var(--sds-text-secondary,#54514D);">' + val + '</span>';
            }
          }
        ],
        rows: sortedScans
      });
    }

    container.innerHTML = html;
  }

  function renderSettingsTab(container, conn) {
    var html = '';

    html += '<div style="max-width:640px;">';

    // Section 1: Connection Details
    html += '<h3 style="font-size:16px;font-weight:600;color:var(--sds-text-primary,#1C1A17);margin-bottom:16px;">Connection Details</h3>';
    html += Components.formGroup('Connection Name', Components.formInput('conn-name', conn.name, ''));
    html += Components.formGroup('Host', Components.formInput('host', conn.host, ''));
    html += Components.formGroup('Port', Components.formInput('port', conn.port.toString(), ''));
    html += Components.formGroup('Owner', Components.formInput('owner', conn.owner || '', ''));

    html += '<div style="display:flex;gap:12px;margin-top:16px;margin-bottom:32px;">';
    html += Components.button('Update Credentials', 'primary', 'sm', '');
    html += Components.button('Test Connection', 'secondary', 'sm', '');
    html += '</div>';

    // Section 2: Scan Schedule
    html += '<h3 style="font-size:16px;font-weight:600;color:var(--sds-text-primary,#1C1A17);margin-bottom:16px;">Scan Schedule</h3>';
    html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">';
    html += '<label style="font-size:13px;font-weight:500;color:var(--sds-text-primary,#1C1A17);">Enable scheduled scans</label>';
    html += '<label class="form-toggle"><input type="checkbox" checked><span class="form-toggle-slider"></span></label>';
    html += '</div>';
    html += Components.formGroup('Frequency', Components.formSelect('frequency', [
      { value: 'daily', label: 'Daily' },
      { value: 'weekly', label: 'Weekly' },
      { value: 'custom', label: 'Custom cron' }
    ], 'daily'));
    html += '<div style="font-size:13px;color:var(--sds-text-tertiary,#6B6760);margin-bottom:32px;">Next scheduled scan: Tomorrow at 2:00 AM UTC</div>';

    // Section 3: Environment Tags
    html += '<h3 style="font-size:16px;font-weight:600;color:var(--sds-text-primary,#1C1A17);margin-bottom:16px;">Environment Tags</h3>';
    html += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">';
    html += Components.tag('Production', 'neutral') + ' ';
    html += '</div>';
    html += Components.formGroup('', Components.formInput('tags', '', 'Add a tag...'), 'Press Enter to add');
    html += '<div style="margin-bottom:32px;"></div>';

    // Section 4: Danger Zone
    html += '<div style="background:var(--sds-status-error-bg,#FDF0EE);border:1px solid var(--sds-color-red-150,#F0C0B8);border-radius:8px;padding:20px;">';
    html += '<h3 style="font-size:16px;font-weight:600;color:var(--sds-text-primary,#1C1A17);margin-bottom:16px;">Danger Zone</h3>';

    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">';
    html += '<div><div style="font-size:13px;font-weight:500;color:var(--sds-text-primary,#1C1A17);">Disable Connection</div><div style="font-size:12px;color:var(--sds-text-secondary,#54514D);">Pauses all scans and disables connectivity.</div></div>';
    html += Components.button('Disable', 'secondary', 'sm', '');
    html += '</div>';

    html += '<div style="display:flex;justify-content:space-between;align-items:center;">';
    html += '<div><div style="font-size:13px;font-weight:500;color:var(--sds-text-primary,#1C1A17);">Delete Connection</div><div style="font-size:12px;color:var(--sds-text-secondary,#54514D);">Permanently removes this connection and all associated data.</div></div>';
    html += Components.button('Delete', 'danger', 'sm', 'id="btn-delete-conn"');
    html += '</div>';

    html += '</div>'; // end danger zone
    html += '</div>'; // end max-width

    container.innerHTML = html;

    // Wire up delete button to show confirmation modal
    var deleteBtn = document.getElementById('btn-delete-conn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', function() {
        showDeleteConfirmation(conn);
      });
    }
  }

  function showDeleteConfirmation(conn) {
    var overlay = document.getElementById('overlay-container');
    if (!overlay) return;

    var body = '<div style="margin-bottom:16px;">';
    var connTables = Data.getTablesForConnection(conn.id);
    var totalClassifications = 0;
    for (var c = 0; c < connTables.length; c++) {
      totalClassifications += connTables[c].classifiedColumns || 0;
    }
    body += '<p style="font-size:13px;color:var(--sds-text-secondary,#54514D);margin-bottom:12px;">Are you sure you want to delete <strong>' + conn.name + '</strong>? This will remove <strong>' + Data.formatNumber(conn.tables) + ' tables</strong> and <strong>' + Data.formatNumber(totalClassifications) + ' classifications</strong>.</p>';
    body += '<p style="font-size:13px;color:var(--sds-text-secondary,#54514D);margin-bottom:16px;">This action cannot be undone.</p>';
    body += Components.formGroup('Type the connection name to confirm', Components.formInput('confirm-name', '', conn.name));
    body += '</div>';

    var footer = Components.button('Cancel', 'secondary', 'md', 'data-modal-close') + ' ' +
      Components.button('Delete Connection', 'danger', 'md', 'disabled id="btn-confirm-delete"');

    overlay.innerHTML = Components.modal('Delete Connection', body, footer);

    // Wire up confirm input
    var confirmInput = overlay.querySelector('input[name="confirm-name"]');
    var confirmBtn = document.getElementById('btn-confirm-delete');
    if (confirmInput && confirmBtn) {
      confirmInput.addEventListener('input', function() {
        confirmBtn.disabled = this.value !== conn.name;
      });
    }

    // Wire up confirm delete action
    if (confirmBtn) {
      confirmBtn.addEventListener('click', function() {
        if (!confirmBtn.disabled) {
          overlay.innerHTML = '';
          Router.navigate('#/connections');
        }
      });
    }
  }


  // ================================================================
  // Register Routes
  // ================================================================
  Router.register('/connections', renderConnectionList);
  Router.register('/connections/add', renderAddConnection);
  Router.register('/connections/add/schemas', renderSelectSchemas);
  Router.register('/connections/:id', renderConnectionDetail);

})();
