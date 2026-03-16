/* ============================================================
   Flow 3 — Risk Assessment & Scoring
   Routes: /dashboard, /dashboard/risk/:id, /regulations, /regulations/:id
   ============================================================ */

(function() {

  // ---- Module state ----
  var activeView = 'executive';
  var activeRiskTab = 'factors';

  // ---- Risk items for detail/simulation ----
  var riskItems = [
    { id: 'risk-1', factor: 'Unprotected PII columns in Snowflake Production', classification: 'PII', severity: 'critical', source: 'Snowflake Production', impact: 18, trend: '+3', status: 'active', columns: 12, action: 'Tokenize sensitive columns' },
    { id: 'risk-2', factor: 'Broad admin access grants across platforms', classification: 'Access', severity: 'critical', source: 'Multiple', impact: 14, trend: '0', status: 'active', columns: 4, action: 'Revoke unnecessary privileges' },
    { id: 'risk-3', factor: 'Stale scan data on BigQuery Analytics', classification: 'Scan', severity: 'high', source: 'BigQuery Analytics', impact: 12, trend: '+4', status: 'active', columns: 456, action: 'Re-scan connection' },
    { id: 'risk-4', factor: 'Unmasked credit card PANs in Redshift archive', classification: 'PCI', severity: 'critical', source: 'Redshift DWH', impact: 11, trend: '-1', status: 'active', columns: 8, action: 'Apply masking policy' },
    { id: 'risk-5', factor: 'ML training data contains PHI without anonymization', classification: 'PHI', severity: 'high', source: 'Databricks ML Workspace', impact: 9, trend: '+2', status: 'active', columns: 24, action: 'Configure anonymization pipeline' }
  ];

  // ---- What Changed items ----
  var whatChanged = [
    { delta: '+3', description: 'from 12 new PII columns discovered', route: '#/scans' },
    { delta: '+2', description: 'from 4 new broad access grants', route: '#/review' },
    { delta: '-1', description: 'from 2 columns tokenized', route: '#/remediation' },
    { delta: '+4', description: 'from stale scan on BigQuery', route: '#/connections/conn-3' }
  ];

  // ---- Simulation items ----
  var simulationItems = [
    { id: 'sim-1', title: 'Tokenize SSN columns', detail: '12 columns in Snowflake Prod > FINANCE_DB', impact: -4, checked: true },
    { id: 'sim-2', title: 'Mask email addresses', detail: '8 columns across 3 schemas', impact: -3, checked: true },
    { id: 'sim-3', title: 'Revoke broad access grants', detail: '4 admin grants on production databases', impact: -5, checked: false },
    { id: 'sim-4', title: 'Apply retention policy', detail: 'Finance DB archive tables', impact: -3, checked: false },
    { id: 'sim-5', title: 'Encrypt PHI at rest', detail: '6 tables in AWS S3 Data Lake', impact: -4, checked: false },
    { id: 'sim-6', title: 'Anonymize ML training data', detail: '24 columns in Databricks workspace', impact: -3, checked: false }
  ];

  // ---- Access anomalies mock data ----
  var accessAnomalies = [
    { user: 'admin@acme.com', action: 'GRANT', timestamp: '2024-03-14T08:00:00Z', severity: 'high' },
    { user: 'dev-service@acme.com', action: 'ESCALATE', timestamp: '2024-03-13T22:30:00Z', severity: 'high' },
    { user: 'analyst@acme.com', action: 'GRANT', timestamp: '2024-03-13T14:15:00Z', severity: 'medium' },
    { user: 'etl-bot@acme.com', action: 'GRANT', timestamp: '2024-03-12T11:00:00Z', severity: 'medium' },
    { user: 'intern@acme.com', action: 'ESCALATE', timestamp: '2024-03-11T09:45:00Z', severity: 'high' }
  ];

  // ---- Recommendations for Risk Detail ----
  var recommendations = [
    { id: 'rec-1', title: 'Tokenize 234 PII columns in Snowflake Production', description: 'Apply format-preserving tokenization to all SSN, email, and phone number columns across production schemas.', priority: 'critical', impact: -12, effort: 'Medium' },
    { id: 'rec-2', title: 'Revoke ACCOUNTADMIN from 3 non-admin users', description: 'Three service accounts have ACCOUNTADMIN privileges that exceed their operational requirements.', priority: 'high', impact: -8, effort: 'Low' },
    { id: 'rec-3', title: 'Mask credit card PANs in Redshift archive', description: 'Legacy archive tables contain unmasked primary account numbers. Apply dynamic masking policy.', priority: 'critical', impact: -6, effort: 'Medium' },
    { id: 'rec-4', title: 'Configure anonymization for ML training pipeline', description: 'Databricks ML workspace ingests raw PHI data without anonymization. Set up PII stripping in the ETL stage.', priority: 'high', impact: -5, effort: 'High' },
    { id: 'rec-5', title: 'Re-scan BigQuery Analytics', description: 'Scan data is 14 days stale. Initiate a fresh classification scan to update risk scoring.', priority: 'medium', impact: -4, effort: 'Low' }
  ];


  // ============================================================
  // DASHBOARD
  // ============================================================

  function renderDashboard() {
    var content = document.getElementById('content');
    if (!content) return;

    var html = '';

    // Page Header
    html += Components.pageHeader(
      'Risk Assessment',
      null,
      Components.button('Last 30 days ' + Icons.render('chevron-down', 12), 'secondary', 'sm') +
      ' ' +
      Components.button(Icons.render('download', 14) + ' Export', 'secondary', 'sm')
    );

    // Toggle Tabs
    html += '<div style="margin-bottom:24px;">';
    html += Components.toggleTabs([
      { id: 'executive', label: 'Executive' },
      { id: 'governance', label: 'Governance' },
      { id: 'operations', label: 'Operations' }
    ], activeView);
    html += '</div>';

    // Risk Score Gauge + What Changed (2-column)
    html += '<div style="display:grid;grid-template-columns:360px 1fr;gap:24px;margin-bottom:24px;">';

    // Gauge card
    html += '<div class="sds-card" style="cursor:pointer;" data-navigate="#/dashboard/risk/overview">';
    html += '<div class="sds-card-body" style="text-align:center;padding:24px;">';
    html += Charts.gauge(Data.riskScore.current, 180);
    html += '<div style="margin-top:8px;">' + Charts.sparkline(Data.riskScore.trend, 120, 32) + '</div>';
    html += '<div style="margin-top:4px;font-size:13px;font-weight:600;color:var(--sds-status-error-strong);">';
    html += '&darr; ' + (Data.riskScore.previous - Data.riskScore.current) + ' pts';
    html += '</div>';
    html += '</div></div>';

    // What Changed card
    html += Components.card({
      title: 'What Changed',
      actions: Components.button('Dismiss', 'tertiary', 'sm'),
      body: renderWhatChanged(),
      footer: '<div style="display:flex;justify-content:space-between;align-items:center;">' +
        '<span style="font-size:13px;font-weight:600;color:var(--sds-status-error-strong);">Net change: +8 points</span>' +
        '<a class="link" data-navigate="#/dashboard/risk/overview" style="font-size:13px;">View full history</a>' +
        '</div>'
    });

    html += '</div>';

    // Persona-specific content
    if (activeView === 'executive') {
      html += renderExecutiveView();
    } else if (activeView === 'governance') {
      html += renderGovernanceView();
    } else {
      html += renderOperationsView();
    }

    // Activity Feed (all views)
    html += renderActivityFeed();

    content.innerHTML = html;

    // Toggle tab click handler
    content.onclick = function(e) {
      var toggle = e.target.closest('[data-toggle]');
      if (toggle) {
        activeView = toggle.getAttribute('data-toggle');
        renderDashboard();
        return;
      }

      // Activity feed filter click handler
      var filterLink = e.target.closest('[data-activity-filter]');
      if (filterLink) {
        var filterId = filterLink.getAttribute('data-activity-filter');
        activeActivityFilter = filterId;

        // Update active styles on filter links
        var allFilters = content.querySelectorAll('[data-activity-filter]');
        for (var i = 0; i < allFilters.length; i++) {
          var isActive = allFilters[i].getAttribute('data-activity-filter') === filterId;
          allFilters[i].style.color = isActive ? 'var(--sds-interactive-primary)' : 'var(--sds-text-secondary)';
          allFilters[i].style.fontWeight = isActive ? '600' : '400';
        }

        // Re-render only the feed items
        var feedContainer = document.getElementById('activity-feed-items');
        if (feedContainer) {
          feedContainer.innerHTML = renderActivityFeedItems(filterId);
        }
      }
    };
  }

  // ---- What Changed list ----
  function renderWhatChanged() {
    var html = '<div style="display:flex;flex-direction:column;gap:0;">';
    for (var i = 0; i < whatChanged.length; i++) {
      var item = whatChanged[i];
      var isPositive = item.delta.charAt(0) === '+';
      var color = isPositive ? 'var(--sds-status-error-strong)' : 'var(--sds-status-success-strong)';
      html += '<div style="display:flex;align-items:center;gap:12px;padding:10px 0;' +
        (i < whatChanged.length - 1 ? 'border-bottom:1px solid var(--sds-border-subtle);' : '') +
        'cursor:pointer;" data-navigate="' + item.route + '">';
      html += '<span style="font-size:13px;font-weight:600;font-family:monospace;color:' + color + ';width:32px;text-align:right;">' + item.delta + '</span>';
      html += '<span style="font-size:13px;color:var(--sds-text-secondary);flex:1;">' + item.description + '</span>';
      html += '<span style="color:var(--sds-text-secondary);">' + Icons.render('chevron-right', 14) + '</span>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  // ============================================================
  // EXECUTIVE VIEW
  // ============================================================

  function renderExecutiveView() {
    var stats = Data.dashboardStats;
    var html = '';

    // Stat cards (4-up)
    html += '<div class="stat-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;">';

    var protPct = ((stats.classifiedTables / stats.totalTables) * 100).toFixed(1);
    html += Components.statCard('Protection Coverage', protPct + '%', 'of sensitive columns', { direction: 'up', value: '2.1%' });

    var connHealthy = Data.connections.filter(function(c) { return c.status === 'active'; }).length;
    html += Components.statCard('Connection Health', connHealthy + '/' + stats.totalConnections, connHealthy === stats.totalConnections ? 'all connections active' : (stats.totalConnections - connHealthy) + ' connection(s) failing');

    var regsMet = Data.regulations.filter(function(r) { return r.compliancePct >= 90; }).length;
    html += Components.statCard('Regulation Compliance', regsMet + '/' + Data.regulations.length, 'regulations met');

    var openRems = Data.remediations.filter(function(r) { return r.status !== 'completed'; }).length;
    html += Components.statCard('Open Risk Items', openRems, '2 critical, 3 high');

    html += '</div>';

    // Two-column charts
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;">';

    // Protection Coverage Donut
    html += Components.card({
      title: 'Protection Coverage',
      actions: '<a class="link" data-navigate="#/catalog" style="font-size:13px;">View catalog</a>',
      body: Charts.donut([
        { label: 'Protected', value: 1247, color: ChartColors.success },
        { label: 'Unprotected', value: 342, color: ChartColors.error },
        { label: 'Excluded', value: 112, color: ChartColors.disabled }
      ], 160)
    });

    // Compliance Summary
    html += Components.card({
      title: 'Compliance Summary',
      actions: '<a class="link" data-navigate="#/regulations" style="font-size:13px;">View all</a>',
      body: renderComplianceBars()
    });

    html += '</div>';

    // Top Risks Table
    html += renderTopRisksTable();

    // Quick Actions
    html += renderQuickActions();

    return html;
  }

  function renderComplianceBars() {
    var html = '';
    for (var i = 0; i < Data.regulations.length; i++) {
      var reg = Data.regulations[i];
      var barColor;
      if (reg.compliancePct >= 90) barColor = 'var(--sds-status-success-strong)';
      else if (reg.compliancePct >= 70) barColor = 'var(--sds-status-warning-strong)';
      else barColor = 'var(--sds-status-error-strong)';

      html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;cursor:pointer;padding:4px 0;border-radius:4px;" data-navigate="#/regulations/' + reg.id + '">';
      html += '<span style="font-size:13px;font-weight:500;color:var(--sds-text-primary);width:80px;flex-shrink:0;">' + reg.name + '</span>';
      html += '<div style="flex:1;height:8px;background:var(--sds-border-subtle);border-radius:4px;overflow:hidden;">';
      html += '<div style="width:' + reg.compliancePct + '%;height:100%;background:' + barColor + ';border-radius:4px;transition:width 600ms;"></div>';
      html += '</div>';
      html += '<span style="font-size:13px;font-weight:600;color:' + barColor + ';width:40px;text-align:right;">' + reg.compliancePct + '%</span>';
      html += '</div>';
    }
    return html;
  }

  function renderTopRisksTable() {
    var html = Components.card({
      title: 'Top Risk Factors',
      actions: '<a class="link" data-navigate="#/dashboard/risk/overview" style="font-size:13px;">View all risks</a>',
      body: Components.dataTable({
        columns: [
          { key: 'rank', label: 'Rank', width: '48px', render: function(v, row) {
            return '<span style="font-weight:600;">' + v + '</span>';
          }},
          { key: 'factor', label: 'Risk Factor', render: function(v) {
            return '<span style="font-weight:500;color:var(--sds-text-primary);">' + v + '</span>';
          }},
          { key: 'impact', label: 'Impact', width: '80px', render: function(v) {
            return '<span style="font-weight:600;">' + v + '</span>';
          }},
          { key: 'trend', label: 'Trend', width: '64px', render: function(v) {
            if (v === '0') return '<span style="color:var(--sds-text-tertiary);">&mdash; 0</span>';
            var isUp = v.charAt(0) === '+';
            return '<span style="color:' + (isUp ? 'var(--sds-status-error-strong)' : 'var(--sds-status-success-strong)') + ';">' + (isUp ? '&uarr;' : '&darr;') + ' ' + v + '</span>';
          }},
          { key: 'severity', label: 'Severity', width: '100px', render: function(v) {
            var map = { critical: 'error', high: 'warning', medium: 'info', low: 'success' };
            return Components.tag(v.charAt(0).toUpperCase() + v.slice(1), map[v] || 'neutral');
          }},
          { key: 'action', label: 'Action', width: '80px', align: 'right', render: function(v, row) {
            return '<a class="link" data-navigate="#/dashboard/risk/' + row.id + '" style="font-size:13px;">View</a>';
          }}
        ],
        rows: riskItems.map(function(r, i) {
          return { id: r.id, rank: i + 1, factor: r.factor, impact: r.impact, trend: r.trend, severity: r.severity, action: r.action };
        })
      }),
      footer: '<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;color:var(--sds-text-secondary);">' +
        '<span>Showing 5 of 47</span>' +
        '</div>'
    });
    return '<div style="margin-bottom:24px;">' + html + '</div>';
  }

  function renderQuickActions() {
    var actions = [
      { label: 'Review Queue', description: Data.dashboardStats.pendingReviews + ' items pending', icon: 'review', route: '#/review' },
      { label: 'Remediation', description: Data.remediations.filter(function(r) { return r.status !== 'completed'; }).length + ' open tasks', icon: 'wrench', route: '#/remediation' },
      { label: 'Connections', description: Data.connections.length + ' data sources', icon: 'connections', route: '#/connections' }
    ];

    var html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px;">';
    for (var i = 0; i < actions.length; i++) {
      var a = actions[i];
      html += '<div class="sds-card" style="cursor:pointer;transition:background 0.15s;" data-navigate="' + a.route + '">';
      html += '<div class="sds-card-body" style="display:flex;align-items:center;gap:12px;padding:16px 20px;">';
      html += '<span style="color:var(--sds-interactive-primary);">' + Icons.render(a.icon, 20) + '</span>';
      html += '<div>';
      html += '<div style="font-size:14px;font-weight:600;color:var(--sds-text-primary);">' + a.label + '</div>';
      html += '<div style="font-size:12px;color:var(--sds-text-secondary);">' + a.description + '</div>';
      html += '</div>';
      html += '<span style="margin-left:auto;color:var(--sds-text-secondary);">' + Icons.render('chevron-right', 14) + '</span>';
      html += '</div></div>';
    }
    html += '</div>';
    return html;
  }


  // ============================================================
  // GOVERNANCE VIEW
  // ============================================================

  function renderGovernanceView() {
    var html = '';

    // Governance stat cards
    var totalGaps = 0;
    for (var g = 0; g < Data.regulations.length; g++) {
      totalGaps += Data.regulations[g].gaps.length;
    }
    var pendingCls = Data.getPendingClassifications().length;
    var reviewQueue = Data.approvals.filter(function(a) { return a.status === 'pending'; }).length;

    html += '<div class="stat-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px;">';
    html += Components.statCard('Regulation Gaps', totalGaps, 'across ' + Data.regulations.length + ' regulations');
    html += Components.statCard('Unclassified Columns', pendingCls, 'pending review');
    html += Components.statCard('Review Queue', reviewQueue, 'items awaiting review');
    html += '</div>';

    // Regulation cards
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px;margin-bottom:24px;">';
    for (var i = 0; i < Data.regulations.length; i++) {
      var reg = Data.regulations[i];
      var tagVariant = reg.compliancePct >= 90 ? 'success' : (reg.compliancePct >= 70 ? 'warning' : 'error');

      html += Components.card({
        title: reg.name,
        actions: Components.tag(reg.compliancePct + '%', tagVariant),
        body: '<div style="display:flex;flex-direction:column;gap:8px;">' +
          '<div style="display:flex;justify-content:space-between;"><span style="font-size:13px;color:var(--sds-text-secondary);">Requirements met</span><span style="font-size:13px;font-weight:600;color:var(--sds-text-primary);">' + reg.articlesMet + ' of ' + reg.articlesTotal + '</span></div>' +
          '<div style="display:flex;justify-content:space-between;"><span style="font-size:13px;color:var(--sds-text-secondary);">Gaps identified</span><span style="font-size:13px;font-weight:600;color:var(--sds-text-primary);">' + reg.gaps.length + '</span></div>' +
          '<div style="display:flex;justify-content:space-between;"><span style="font-size:13px;color:var(--sds-text-secondary);">Last assessed</span><span style="font-size:13px;font-weight:600;color:var(--sds-text-primary);">' + Data.formatDate(reg.lastAssessed) + '</span></div>' +
          '</div>',
        footer: '<div style="text-align:right;"><a class="link" data-navigate="#/regulations/' + reg.id + '" style="font-size:13px;">View details</a></div>'
      });
    }
    html += '</div>';

    // Classification Gap Analysis Table
    html += '<div style="margin-bottom:24px;">';
    html += Components.card({
      title: 'Classification Gap Analysis',
      body: Components.dataTable({
        columns: [
          { key: 'name', label: 'Data Source', render: function(v, row) {
            return Components.statusDot(row.status) + ' <span style="font-weight:500;">' + v + '</span>';
          }},
          { key: 'unclassified', label: 'Unclassified Columns', width: '160px', render: function(v) {
            return '<span style="font-weight:600;">' + v + '</span>';
          }},
          { key: 'lastScan', label: 'Last Scanned', width: '120px', render: function(v) {
            return '<span style="color:var(--sds-text-secondary);">' + Data.timeAgo(v) + '</span>';
          }},
          { key: 'freshness', label: 'Freshness', width: '100px', render: function(v, row) {
            var d = new Date(row.lastScan);
            var days = Math.floor((new Date() - d) / 86400000);
            if (days <= 7) return Components.tag('Fresh', 'success');
            if (days <= 30) return Components.tag('Stale', 'warning');
            return Components.tag('Expired', 'error');
          }},
          { key: 'action', label: '', width: '80px', align: 'right', render: function() {
            return Components.button('Review', 'tertiary', 'sm');
          }}
        ],
        rows: Data.connections.map(function(c) {
          var totalCols = c.tables * 15; // approximate
          var unclassified = Math.round(totalCols * (1 - c.classificationCoverage / 100));
          return { id: c.id, name: c.name, status: c.status, unclassified: unclassified, lastScan: c.lastScan, freshness: '' };
        })
      })
    });
    html += '</div>';

    return html;
  }


  // ============================================================
  // OPERATIONS / TECHNICAL VIEW
  // ============================================================

  function renderOperationsView() {
    var html = '';

    // Operations stat cards
    var connHealthy = Data.connections.filter(function(c) { return c.status === 'active'; }).length;
    var totalConns = Data.connections.length;
    var freshScans = Data.scans.filter(function(s) { return s.status === 'completed'; }).length;
    var freshPct = Math.round((freshScans / Data.scans.length) * 100);

    html += '<div class="stat-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;">';
    html += Components.statCard('Connection Health', connHealthy + '/' + totalConns, connHealthy < totalConns ? (totalConns - connHealthy) + ' connection(s) failing' : 'all healthy');
    html += Components.statCard('Scan Freshness', freshPct + '%', 'across ' + totalConns + ' connections');
    html += Components.statCard('Total Access Grants', '1,234', '142 with broad access');
    html += Components.statCard('Anomalies (7 days)', '8', '8 unusual access patterns');
    html += '</div>';

    // Scan Freshness Heatmap
    var heatmapRows = Data.connections.map(function(c) { return { label: c.name.length > 16 ? c.name.substring(0, 16) + '...' : c.name }; });
    var heatmapCols = [
      { label: '<24h' },
      { label: '1-3d' },
      { label: '3-7d' },
      { label: '7-14d' },
      { label: '14-30d' }
    ];
    // Generate heatmap cell data based on scan freshness
    var heatmapCells = [];
    for (var h = 0; h < Data.connections.length; h++) {
      var conn = Data.connections[h];
      var row = [];
      var scanDate = conn.lastScan ? new Date(conn.lastScan) : null;
      var now = new Date();
      var hoursSinceScan = scanDate ? Math.floor((now - scanDate) / 3600000) : 999;
      // Simulate scan counts across time buckets
      if (hoursSinceScan < 24) { row = [3, 2, 1, 0, 0]; }
      else if (hoursSinceScan < 72) { row = [0, 3, 2, 1, 0]; }
      else if (hoursSinceScan < 168) { row = [0, 0, 4, 2, 1]; }
      else if (hoursSinceScan < 720) { row = [0, 0, 0, 2, 5]; }
      else { row = [0, 0, 0, 0, 8]; }
      heatmapCells.push(row);
    }

    html += '<div style="margin-bottom:24px;">';
    html += Components.card({
      title: 'Scan Freshness',
      actions: Components.button('7 days ' + Icons.render('chevron-down', 12), 'secondary', 'sm'),
      body: Charts.heatmap({
        rows: heatmapRows,
        cols: heatmapCols,
        cells: heatmapCells
      })
    });
    html += '</div>';

    // Two-column: Access Anomalies + Connection Status
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;">';

    // Access Anomalies
    html += Components.card({
      title: 'Access Anomalies (7 days)',
      actions: '<a class="link" style="font-size:13px;">View all</a>',
      body: Components.dataTable({
        columns: [
          { key: 'user', label: 'User', render: function(v) {
            return '<span style="font-size:13px;">' + v + '</span>';
          }},
          { key: 'action', label: 'Action', width: '100px', render: function(v) {
            var variant = v === 'ESCALATE' ? 'error' : 'warning';
            return Components.tag(v, variant);
          }},
          { key: 'timestamp', label: 'Time', width: '80px', render: function(v) {
            return '<span style="color:var(--sds-text-secondary);font-size:12px;">' + Data.timeAgo(v) + '</span>';
          }},
          { key: 'severity', label: 'Severity', width: '80px', render: function(v) {
            return Components.tag(v.charAt(0).toUpperCase() + v.slice(1), v === 'high' ? 'error' : 'warning');
          }}
        ],
        rows: accessAnomalies
      })
    });

    // Connection Status
    var connHtml = '';
    for (var c = 0; c < Data.connections.length; c++) {
      var co = Data.connections[c];
      connHtml += '<div style="display:flex;align-items:center;gap:12px;padding:8px 0;' + (c < Data.connections.length - 1 ? 'border-bottom:1px solid var(--sds-border-subtle);' : '') + '">';
      connHtml += Components.statusDot(co.status);
      connHtml += '<span style="font-size:13px;font-weight:500;color:var(--sds-text-primary);flex:1;">' + co.name + '</span>';
      connHtml += '<span style="font-size:12px;color:var(--sds-text-secondary);">' + Data.timeAgo(co.lastScan) + '</span>';
      connHtml += '</div>';
    }

    html += Components.card({
      title: 'Connection Status',
      actions: '<a class="link" data-navigate="#/connections" style="font-size:13px;">Manage connections</a>',
      body: connHtml
    });

    html += '</div>';

    // System Alerts
    html += '<div style="margin-bottom:24px;">';
    for (var a = 0; a < Data.alerts.length; a++) {
      html += Components.alertRibbon(Data.alerts[a].message, Data.alerts[a].variant,
        Data.alerts[a].action ? '<a class="link" data-navigate="' + Data.alerts[a].actionRoute + '" style="font-weight:600;color:inherit;text-decoration:underline;margin-left:8px;">' + Data.alerts[a].action + '</a>' : ''
      );
    }
    html += '</div>';

    return html;
  }


  // ============================================================
  // ACTIVITY FEED (shared)
  // ============================================================

  var activityTypeMap = {
    'scan_complete': { label: 'Scan', variant: 'info', filter: 'scans' },
    'policy_violation': { label: 'Risk', variant: 'error', filter: 'other' },
    'classification_approved': { label: 'Review', variant: 'success', filter: 'classifications' },
    'remediation_progress': { label: 'Remediation', variant: 'success', filter: 'remediations' },
    'connection_error': { label: 'System', variant: 'error', filter: 'other' },
    'policy_created': { label: 'Policy', variant: 'info', filter: 'other' },
    'scan_started': { label: 'Scan', variant: 'info', filter: 'scans' },
    'connection_added': { label: 'System', variant: 'success', filter: 'other' }
  };

  var activeActivityFilter = 'all';

  function renderActivityFeedItems(filter) {
    var items = Data.activityLog;
    if (filter && filter !== 'all') {
      items = items.filter(function(act) {
        var info = activityTypeMap[act.type];
        return info && info.filter === filter;
      });
    }
    items = items.slice(0, 8);

    if (items.length === 0) {
      return '<div style="padding:24px;text-align:center;color:var(--sds-text-tertiary);font-size:13px;">No activity items match this filter.</div>';
    }

    var feedHtml = '';
    for (var i = 0; i < items.length; i++) {
      var act = items[i];
      var info = activityTypeMap[act.type] || { label: 'System', variant: 'neutral' };

      feedHtml += '<div style="display:flex;align-items:center;gap:12px;padding:10px 0;' + (i < items.length - 1 ? 'border-bottom:1px solid var(--sds-border-subtle);' : '') + '">';
      feedHtml += Components.tag(info.label, info.variant);
      feedHtml += '<span style="font-size:13px;color:var(--sds-text-secondary);flex:1;">' + act.message + '</span>';
      feedHtml += '<span style="font-size:12px;color:var(--sds-text-secondary);white-space:nowrap;">' + Data.timeAgo(act.timestamp) + '</span>';
      feedHtml += '</div>';
    }
    return feedHtml;
  }

  function renderActivityFeed() {
    var filters = [
      { id: 'all', label: 'All' },
      { id: 'scans', label: 'Scans' },
      { id: 'classifications', label: 'Classifications' },
      { id: 'remediations', label: 'Remediations' }
    ];

    var filterHtml = '<div style="display:flex;gap:16px;align-items:center;">';
    for (var f = 0; f < filters.length; f++) {
      var fl = filters[f];
      var isActive = fl.id === activeActivityFilter;
      filterHtml += '<a class="link" data-activity-filter="' + fl.id + '" style="font-size:13px;cursor:pointer;text-decoration:none;' +
        (isActive ? 'color:var(--sds-interactive-primary);font-weight:600;' : 'color:var(--sds-text-secondary);font-weight:400;') +
        '">' + fl.label + '</a>';
    }
    filterHtml += '</div>';

    return '<div style="margin-bottom:24px;">' + Components.card({
      title: 'Recent Activity',
      actions: filterHtml,
      body: '<div id="activity-feed-items">' + renderActivityFeedItems(activeActivityFilter) + '</div>'
    }) + '</div>';
  }


  // ============================================================
  // RISK DETAIL
  // ============================================================

  function renderRiskDetail(params) {
    var content = document.getElementById('content');
    if (!content) return;

    var riskId = params.id;
    var risk = null;
    for (var i = 0; i < riskItems.length; i++) {
      if (riskItems[i].id === riskId) { risk = riskItems[i]; break; }
    }

    var title = risk ? risk.factor : 'Overall Risk Breakdown';
    var impactTag = risk ? Components.tag('Impact: ' + risk.impact + ' points', risk.severity === 'critical' ? 'error' : 'warning') : '';

    var html = '';

    // Breadcrumb
    html += Components.breadcrumb([
      { label: 'Dashboard', href: '#/dashboard' },
      { label: 'Risk Detail' }
    ]);

    // Page header
    html += '<div style="margin-bottom:8px;">';
    html += Components.pageHeader(
      title,
      impactTag,
      Components.button('Snooze', 'secondary', 'md') + ' ' + Components.button('Acknowledge', 'secondary', 'md')
    );
    html += '</div>';

    // Tabs
    html += Components.tabs([
      { id: 'factors', label: 'Risk Factors', badge: riskItems.length },
      { id: 'access', label: 'Access Analysis', badge: accessAnomalies.length },
      { id: 'regulations', label: 'Regulation Mapping', badge: Data.regulations.length },
      { id: 'recommendations', label: 'Recommendations', badge: recommendations.length }
    ], activeRiskTab, 'data-risk-tab');

    // Tab content
    html += '<div style="margin-top:20px;">';
    if (activeRiskTab === 'factors') {
      html += renderRiskFactorsTab();
    } else if (activeRiskTab === 'access') {
      html += renderAccessAnalysisTab();
    } else if (activeRiskTab === 'regulations') {
      html += renderRegulationMappingTab();
    } else {
      html += renderRecommendationsTab();
    }
    html += '</div>';

    content.innerHTML = html;

    // Tab click handler
    content.onclick = function(e) {
      var tab = e.target.closest('[data-risk-tab]');
      if (tab) {
        activeRiskTab = tab.getAttribute('data-risk-tab');
        renderRiskDetail(params);
      }
      // Simulate button handler
      var simBtn = e.target.closest('[data-simulate]');
      if (simBtn) {
        openSimulationDrawer();
      }
    };
  }

  // ---- Risk Factors Tab ----
  function renderRiskFactorsTab() {
    var html = '';

    html += Components.dataTable({
      columns: [
        { key: 'factor', label: 'Risk Factor', render: function(v) {
          return '<span style="font-weight:500;color:var(--sds-text-primary);">' + v + '</span>';
        }},
        { key: 'classification', label: 'Classification', width: '140px', render: function(v) {
          return Components.tag(v, 'neutral');
        }},
        { key: 'severity', label: 'Severity', width: '80px', render: function(v) {
          var map = { critical: 'error', high: 'warning', medium: 'info', low: 'success' };
          return Components.tag(v.charAt(0).toUpperCase() + v.slice(1), map[v] || 'neutral');
        }},
        { key: 'source', label: 'Source', width: '160px', render: function(v) {
          return '<span style="font-size:13px;color:var(--sds-text-secondary);">' + v + '</span>';
        }},
        { key: 'impact', label: 'Impact', width: '64px', align: 'right', render: function(v) {
          return '<span style="font-weight:600;">' + v + '</span>';
        }}
      ],
      rows: riskItems
    });

    return html;
  }

  // ---- Access Analysis Tab ----
  function renderAccessAnalysisTab() {
    var accessData = [
      { role: 'ACCOUNTADMIN', type: 'System', privileges: 'FULL', scope: 'Global', riskLevel: 'critical' },
      { role: 'SYSADMIN', type: 'System', privileges: 'DDL, DML', scope: 'Global', riskLevel: 'high' },
      { role: 'SECURITYADMIN', type: 'System', privileges: 'MANAGE GRANTS', scope: 'Global', riskLevel: 'high' },
      { role: 'ANALYST_ROLE', type: 'Custom', privileges: 'SELECT', scope: 'DB: finance', riskLevel: 'low' },
      { role: 'ETL_SERVICE', type: 'Custom', privileges: 'SELECT, INSERT', scope: 'DB: staging', riskLevel: 'medium' },
      { role: 'ML_ENGINEER', type: 'Custom', privileges: 'SELECT, CREATE TABLE', scope: 'DB: data_science', riskLevel: 'medium' }
    ];

    var html = '';

    html += '<div style="margin-bottom:16px;">';
    html += Components.toggleTabs([
      { id: 'snowflake', label: 'Snowflake' },
      { id: 'aws', label: 'AWS S3' },
      { id: 'bigquery', label: 'BigQuery' },
      { id: 'databricks', label: 'Databricks' }
    ], 'snowflake');
    html += '</div>';

    html += Components.dataTable({
      columns: [
        { key: 'role', label: 'Role', render: function(v) {
          return '<span style="font-weight:500;color:var(--sds-text-primary);font-family:monospace;font-size:12px;">' + v + '</span>';
        }},
        { key: 'type', label: 'Role Type', width: '100px' },
        { key: 'privileges', label: 'Privileges', width: '160px', render: function(v) {
          return '<span style="font-family:monospace;font-size:12px;">' + v + '</span>';
        }},
        { key: 'scope', label: 'Scope', width: '120px' },
        { key: 'riskLevel', label: 'Risk Level', width: '100px', render: function(v) {
          var map = { critical: 'error', high: 'warning', medium: 'info', low: 'success' };
          return Components.tag(v.charAt(0).toUpperCase() + v.slice(1), map[v] || 'neutral');
        }}
      ],
      rows: accessData
    });

    return html;
  }

  // ---- Regulation Mapping Tab ----
  function renderRegulationMappingTab() {
    var html = '';

    for (var i = 0; i < Data.regulations.length; i++) {
      var reg = Data.regulations[i];
      var statusVariant = reg.compliancePct >= 90 ? 'success' : (reg.compliancePct >= 70 ? 'warning' : 'error');
      var statusLabel = reg.compliancePct >= 90 ? 'Compliant' : 'Gaps';

      var bodyHtml = '<div style="font-size:13px;color:var(--sds-text-secondary);margin-bottom:12px;">' + reg.articlesMet + ' of ' + reg.articlesTotal + ' requirements met</div>';

      // Show gaps as a checklist
      for (var j = 0; j < reg.gaps.length; j++) {
        var gap = reg.gaps[j];
        var isPass = gap.status === 'met';
        var iconColor = isPass ? 'var(--sds-status-success-strong)' : 'var(--sds-status-error-strong)';
        var icon = isPass ? Icons.check : Icons.close;

        bodyHtml += '<div style="display:flex;align-items:flex-start;gap:8px;padding:6px 0;border-top:1px solid var(--sds-border-subtle);">';
        bodyHtml += '<span style="color:' + iconColor + ';flex-shrink:0;width:16px;height:16px;margin-top:1px;">' + icon + '</span>';
        bodyHtml += '<div style="flex:1;">';
        bodyHtml += '<span style="font-size:13px;font-weight:500;color:var(--sds-text-primary);">' + gap.article + ' - ' + gap.title + '</span>';
        bodyHtml += '<div style="font-size:12px;color:var(--sds-text-secondary);margin-top:2px;">' + gap.detail + '</div>';
        bodyHtml += '</div>';
        bodyHtml += '<span>' + Components.tag(gap.status === 'gap' ? 'Fail' : 'Partial', gap.status === 'gap' ? 'error' : 'warning') + '</span>';
        bodyHtml += '</div>';
      }

      html += '<div style="margin-bottom:16px;">';
      html += Components.card({
        title: reg.name + ' (' + reg.fullName + ')',
        actions: Components.tag(statusLabel, statusVariant),
        body: bodyHtml,
        footer: '<div style="text-align:right;"><a class="link" data-navigate="#/regulations/' + reg.id + '" style="font-size:13px;">View regulation detail</a></div>'
      });
      html += '</div>';
    }

    return html;
  }

  // ---- Recommendations Tab ----
  function renderRecommendationsTab() {
    var html = '';

    for (var i = 0; i < recommendations.length; i++) {
      var rec = recommendations[i];
      var priorityMap = { critical: 'error', high: 'warning', medium: 'info', low: 'neutral' };

      html += '<div class="sds-card" style="margin-bottom:12px;">';
      html += '<div class="sds-card-body" style="padding:16px 20px;">';

      html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">';
      html += '<div style="font-size:14px;font-weight:600;color:var(--sds-text-primary);">' + rec.title + '</div>';
      html += Components.tag(rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1), priorityMap[rec.priority] || 'neutral');
      html += '</div>';

      html += '<div style="font-size:13px;color:var(--sds-text-secondary);margin-bottom:12px;">' + rec.description + '</div>';

      html += '<div style="display:flex;gap:24px;margin-bottom:12px;">';
      html += '<span style="font-size:13px;font-weight:500;color:var(--sds-status-success-text);">Impact: ' + rec.impact + ' risk points</span>';
      html += '<span style="font-size:13px;color:var(--sds-text-secondary);">Effort: ' + rec.effort + '</span>';
      html += '</div>';

      html += '<div style="display:flex;gap:8px;">';
      html += Components.button('Remediate', 'primary', 'sm', 'data-navigate="#/remediation"');
      html += Components.button('Simulate', 'secondary', 'sm', 'data-simulate');
      html += '</div>';

      html += '</div></div>';
    }

    return html;
  }


  // ============================================================
  // SIMULATION DRAWER
  // ============================================================

  function openSimulationDrawer() {
    var overlay = document.getElementById('overlay-container');
    if (!overlay) return;

    var currentScore = Data.riskScore.current;
    var checkedImpact = 0;
    for (var c = 0; c < simulationItems.length; c++) {
      if (simulationItems[c].checked) checkedImpact += simulationItems[c].impact;
    }
    var projectedScore = Math.max(0, currentScore + checkedImpact);
    var delta = projectedScore - currentScore;

    var body = '';

    // Score comparison
    body += '<div style="background:var(--sds-bg-surface);padding:24px;border-bottom:1px solid var(--sds-border-subtle);">';
    body += '<div style="display:flex;align-items:center;justify-content:space-around;">';
    body += '<div style="text-align:center;">';
    body += '<div style="font-size:12px;font-weight:600;text-transform:uppercase;color:var(--sds-text-secondary);margin-bottom:8px;">Current</div>';
    body += Charts.gauge(currentScore, 100);
    body += '</div>';
    body += '<div style="text-align:center;">';
    body += '<div style="color:var(--sds-text-secondary);margin-bottom:4px;">' + Icons.render('arrow-right', 24) + '</div>';
    body += '<div style="font-size:14px;font-weight:600;color:var(--sds-status-success-text);">' + delta + ' points</div>';
    body += '</div>';
    body += '<div style="text-align:center;">';
    body += '<div style="font-size:12px;font-weight:600;text-transform:uppercase;color:var(--sds-text-secondary);margin-bottom:8px;">Projected</div>';
    body += Charts.gauge(projectedScore, 100);
    body += '</div>';
    body += '</div></div>';

    // Item checklist
    body += '<div style="padding:0 24px;">';
    body += '<div style="padding:12px 0;border-bottom:1px solid var(--sds-border-default);font-size:13px;font-weight:500;color:var(--sds-text-primary);">Select items to simulate (' + simulationItems.length + ' items)</div>';

    for (var i = 0; i < simulationItems.length; i++) {
      var item = simulationItems[i];
      var bgColor = item.checked ? 'var(--sds-status-success-bg)' : 'transparent';

      body += '<div style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid var(--sds-border-subtle);background:' + bgColor + ';border-radius:4px;" data-sim-item="' + i + '">';
      body += '<input type="checkbox" ' + (item.checked ? 'checked' : '') + ' style="margin-top:2px;cursor:pointer;" data-sim-check="' + i + '">';
      body += '<div style="flex:1;">';
      body += '<div style="font-size:13px;font-weight:500;color:var(--sds-text-primary);">' + item.title + '</div>';
      body += '<div style="font-size:12px;color:var(--sds-text-secondary);">' + item.detail + '</div>';
      body += '</div>';
      body += '<span style="font-size:13px;font-weight:600;color:var(--sds-status-success-text);">' + item.impact + ' pts</span>';
      body += '</div>';
    }
    body += '</div>';

    // Impact breakdown
    body += '<div style="padding:16px 24px;border-top:1px solid var(--sds-border-default);background:var(--sds-bg-surface);">';
    body += '<div style="font-size:13px;font-weight:600;color:var(--sds-text-primary);margin-bottom:8px;">Impact Breakdown</div>';
    for (var j = 0; j < simulationItems.length; j++) {
      if (simulationItems[j].checked) {
        body += '<div style="display:flex;gap:8px;margin-bottom:4px;">';
        body += '<span style="font-size:13px;font-weight:600;font-family:monospace;color:var(--sds-status-success-text);width:40px;text-align:right;">' + simulationItems[j].impact + '</span>';
        body += '<span style="font-size:13px;color:var(--sds-text-secondary);">' + simulationItems[j].title + '</span>';
        body += '</div>';
      }
    }
    body += '</div>';

    // Footer
    body += '<div style="padding:16px 24px;border-top:1px solid var(--sds-border-default);display:flex;justify-content:flex-end;gap:12px;position:sticky;bottom:0;background:var(--sds-bg-card);">';
    body += Components.button('Cancel', 'secondary', 'md', 'data-drawer-close');
    body += Components.button('Proceed to Remediate', 'primary', 'md', 'data-navigate="#/remediation"');
    body += '</div>';

    overlay.innerHTML = Components.drawer('Risk Simulation', body);

    // Checkbox interaction
    overlay.addEventListener('change', function(e) {
      var check = e.target.closest('[data-sim-check]');
      if (check) {
        var idx = parseInt(check.getAttribute('data-sim-check'), 10);
        simulationItems[idx].checked = check.checked;
        openSimulationDrawer(); // re-render
      }
    });
  }


  // ============================================================
  // REGULATIONS LIST
  // ============================================================

  function renderRegulations() {
    var content = document.getElementById('content');
    if (!content) return;

    var html = '';
    html += Components.pageHeader('Regulations', 'Compliance status across all applicable regulations');

    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px;margin-top:24px;">';
    for (var i = 0; i < Data.regulations.length; i++) {
      var reg = Data.regulations[i];
      var statusVariant = reg.compliancePct >= 90 ? 'success' : (reg.compliancePct >= 70 ? 'warning' : 'error');

      var bodyHtml = '<div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">';
      bodyHtml += Charts.progressRing(reg.compliancePct, 60, reg.compliancePct >= 90 ? ChartColors.success : (reg.compliancePct >= 70 ? ChartColors.warning : ChartColors.error));
      bodyHtml += '<div>';
      bodyHtml += '<div style="font-size:14px;font-weight:600;color:var(--sds-text-primary);">' + reg.fullName + '</div>';
      bodyHtml += '<div style="font-size:12px;color:var(--sds-text-secondary);">Region: ' + reg.region + '</div>';
      bodyHtml += '</div>';
      bodyHtml += '</div>';

      bodyHtml += '<div style="display:flex;flex-direction:column;gap:6px;">';
      bodyHtml += '<div style="display:flex;justify-content:space-between;font-size:13px;"><span style="color:var(--sds-text-secondary);">Requirements</span><span style="font-weight:600;color:var(--sds-text-primary);">' + reg.articlesMet + ' / ' + reg.articlesTotal + '</span></div>';
      bodyHtml += '<div style="display:flex;justify-content:space-between;font-size:13px;"><span style="color:var(--sds-text-secondary);">Gaps</span><span style="font-weight:600;color:' + (reg.gaps.length > 0 ? 'var(--sds-status-error-strong)' : 'var(--sds-status-success-text)') + ';">' + reg.gaps.length + '</span></div>';
      bodyHtml += '<div style="display:flex;justify-content:space-between;font-size:13px;"><span style="color:var(--sds-text-secondary);">Last assessed</span><span style="color:var(--sds-text-secondary);">' + Data.formatDate(reg.lastAssessed) + '</span></div>';
      bodyHtml += '</div>';

      html += Components.card({
        title: reg.name,
        actions: Components.statusTag(reg.status),
        body: bodyHtml,
        footer: '<div style="text-align:right;"><a class="link" data-navigate="#/regulations/' + reg.id + '" style="font-size:13px;">View details ' + Icons.render('chevron-right', 12) + '</a></div>'
      });
    }
    html += '</div>';

    content.innerHTML = html;
  }


  // ============================================================
  // REGULATION DETAIL
  // ============================================================

  function renderRegulationDetail(params) {
    var content = document.getElementById('content');
    if (!content) return;

    var regId = params.id;
    var reg = null;
    for (var i = 0; i < Data.regulations.length; i++) {
      if (Data.regulations[i].id === regId) { reg = Data.regulations[i]; break; }
    }
    if (!reg) {
      content.innerHTML = '<div class="coming-soon"><h2>Regulation not found</h2></div>';
      return;
    }

    var html = '';

    // Breadcrumb
    html += Components.breadcrumb([
      { label: 'Regulations', href: '#/regulations' },
      { label: reg.name }
    ]);

    // Page header
    html += Components.pageHeader(
      reg.name + ' Compliance',
      reg.fullName,
      Components.button(Icons.render('document', 14) + ' Generate Report', 'primary', 'md') +
      ' ' +
      Components.button(Icons.render('download', 14) + ' Export', 'secondary', 'md')
    );

    // Summary cards (3-up)
    var scoreBgColor = reg.compliancePct >= 90 ? 'var(--sds-status-success-text)' : (reg.compliancePct >= 70 ? 'var(--sds-status-warning-text)' : 'var(--sds-status-error-strong)');

    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:24px 0;">';
    html += Components.statCard('Compliance Score', reg.compliancePct + '%', reg.compliancePct >= 90 ? 'Compliant' : 'Gaps remain');
    html += Components.statCard('Requirements Met', reg.articlesMet + ' of ' + reg.articlesTotal, 'total requirements');
    html += Components.statCard('Gaps Identified', reg.gaps.length, reg.gaps.length > 0 ? 'require attention' : 'all clear');
    html += '</div>';

    // Requirements Checklist
    var checklistHtml = '';
    var passCount = reg.articlesMet;
    var totalReqs = reg.articlesTotal;

    // Show passed requirements (simulated)
    for (var p = 0; p < passCount - reg.gaps.length; p++) {
      checklistHtml += '<div style="display:flex;align-items:flex-start;gap:10px;padding:12px 0;border-bottom:1px solid var(--sds-border-subtle);">';
      checklistHtml += '<span style="color:var(--sds-status-success-strong);flex-shrink:0;width:16px;height:16px;margin-top:1px;">' + Icons.check + '</span>';
      checklistHtml += '<div style="flex:1;">';
      checklistHtml += '<span style="font-size:13px;font-weight:500;color:var(--sds-text-primary);">Requirement ' + (p + 1) + '</span>';
      checklistHtml += '<div style="font-size:12px;color:var(--sds-text-secondary);margin-top:2px;">Requirement met. Evidence verified.</div>';
      checklistHtml += '</div>';
      checklistHtml += Components.tag('Pass', 'success');
      checklistHtml += '</div>';
    }

    // Show failing/partial requirements (actual gaps)
    for (var g = 0; g < reg.gaps.length; g++) {
      var gap = reg.gaps[g];
      var gapIcon = gap.status === 'gap' ? Icons.close : Icons.warning;
      var gapColor = gap.status === 'gap' ? 'var(--sds-status-error-strong)' : 'var(--sds-status-warning-strong)';
      var gapTag = gap.status === 'gap' ? Components.tag('Fail', 'error') : Components.tag('Partial', 'warning');

      checklistHtml += '<div style="display:flex;align-items:flex-start;gap:10px;padding:12px 0;border-bottom:1px solid var(--sds-border-subtle);">';
      checklistHtml += '<span style="color:' + gapColor + ';flex-shrink:0;width:16px;height:16px;margin-top:1px;">' + gapIcon + '</span>';
      checklistHtml += '<div style="flex:1;">';
      checklistHtml += '<span style="font-size:13px;font-weight:500;color:var(--sds-text-primary);">' + gap.article + ' - ' + gap.title + '</span>';
      checklistHtml += '<div style="font-size:12px;color:var(--sds-text-secondary);margin-top:2px;">' + gap.detail + '</div>';
      checklistHtml += '</div>';
      checklistHtml += gapTag;
      checklistHtml += '</div>';
    }

    html += '<div style="margin-bottom:24px;">';
    html += Components.card({
      title: 'Requirements <span class="sds-tab-badge" style="font-size:12px;padding:2px 8px;border-radius:10px;background:var(--sds-border-subtle);color:var(--sds-text-secondary);margin-left:8px;">' + reg.articlesMet + '/' + reg.articlesTotal + ' met</span>',
      body: checklistHtml
    });
    html += '</div>';

    // Gap Analysis Table
    if (reg.gaps.length > 0) {
      html += '<div style="margin-bottom:24px;">';
      html += Components.card({
        title: 'Gap Analysis',
        actions: Components.button('Remediate all', 'primary', 'sm', 'data-navigate="#/remediation"'),
        body: Components.dataTable({
          columns: [
            { key: 'article', label: 'Article', width: '100px', render: function(v) {
              return '<span style="font-weight:600;font-size:13px;">' + v + '</span>';
            }},
            { key: 'title', label: 'Gap', render: function(v) {
              return '<span style="font-weight:500;color:var(--sds-text-primary);">' + v + '</span>';
            }},
            { key: 'status', label: 'Severity', width: '100px', render: function(v) {
              return v === 'gap' ? Components.tag('Critical', 'error') : Components.tag('Medium', 'warning');
            }},
            { key: 'detail', label: 'Detail', render: function(v) {
              return '<span style="font-size:12px;color:var(--sds-text-secondary);">' + v + '</span>';
            }},
            { key: 'action', label: '', width: '80px', align: 'right', render: function() {
              return Components.button('Fix', 'tertiary', 'sm', 'data-navigate="#/remediation"');
            }}
          ],
          rows: reg.gaps
        })
      });
      html += '</div>';
    }

    // Affected Data Inventory
    var affectedTables = Data.tables.filter(function(t) {
      // Find tables with tags related to this regulation
      if (reg.name === 'GDPR' || reg.name === 'CCPA') return t.tags.indexOf('PII') > -1;
      if (reg.name === 'HIPAA') return t.tags.indexOf('PHI') > -1;
      if (reg.name === 'PCI DSS') return t.tags.indexOf('PCI') > -1;
      return false;
    });

    html += '<div style="margin-bottom:24px;">';
    html += Components.card({
      title: 'Affected Data Inventory',
      actions: Components.button(Icons.render('download', 14) + ' Export', 'secondary', 'sm'),
      body: Components.dataTable({
        columns: [
          { key: 'connectionName', label: 'Data Source', render: function(v) {
            return '<span style="font-weight:500;">' + v + '</span>';
          }},
          { key: 'name', label: 'Table', render: function(v, row) {
            return '<span style="font-family:monospace;font-size:12px;">' + row.schema + '.' + v + '</span>';
          }},
          { key: 'columns', label: 'Columns', width: '80px' },
          { key: 'tags', label: 'Classification', width: '140px', render: function(v) {
            return v.map(function(t) { return Components.tag(t, 'neutral'); }).join(' ');
          }},
          { key: 'sensitivity', label: 'Sensitivity', width: '100px', render: function(v) {
            var map = { critical: 'error', high: 'warning', medium: 'info', low: 'success' };
            return Components.tag(v.charAt(0).toUpperCase() + v.slice(1), map[v] || 'neutral');
          }}
        ],
        rows: affectedTables.slice(0, 8),
        onRowClick: function(row) { return '#/catalog/' + row.id; }
      }),
      footer: '<div style="font-size:13px;color:var(--sds-text-secondary);">Showing ' + Math.min(8, affectedTables.length) + ' of ' + affectedTables.length + ' affected tables</div>'
    });
    html += '</div>';

    content.innerHTML = html;
  }


  // ============================================================
  // REGISTER ROUTES
  // ============================================================

  Router.register('/dashboard', renderDashboard);
  Router.register('/dashboard/risk/:id', renderRiskDetail);
  Router.register('/regulations', renderRegulations);
  Router.register('/regulations/:id', renderRegulationDetail);

})();
