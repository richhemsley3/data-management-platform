/* ============================================================
   Flow 2 — Data Scanning & Classification
   Routes: /scans, /scans/:id, /scans/:id/summary,
           /review, /review/table/:id,
           /review/rules, /review/rules/create, /review/rules/:id,
           /catalog, /catalog/:id
   ============================================================ */

(function() {

  // ---- Helpers ----

  function confidenceBar(confidence) {
    var variant, label;
    if (confidence < 60) {
      variant = 'error';
      label = 'Low';
    } else if (confidence < 90) {
      variant = 'warning';
      label = '';
    } else {
      variant = 'success';
      label = 'High';
    }
    var colorMap = { error: 'var(--sds-status-error-strong)', warning: 'var(--sds-status-warning-strong)', success: 'var(--sds-status-success-strong)' };
    var html = '<div style="display:flex;align-items:center;gap:8px;">';
    html += '<div style="width:60px;height:6px;border-radius:3px;background:var(--sds-bg-subtle);">';
    html += '<div style="width:' + confidence + '%;height:100%;border-radius:3px;background:' + colorMap[variant] + ';"></div>';
    html += '</div>';
    html += '<span style="font-size:12px;font-weight:500;">' + confidence + '%</span>';
    if (label) {
      html += Components.tag(label, variant);
    }
    html += '</div>';
    return html;
  }

  function categoryTag(category) {
    var variantMap = { 'PII': 'error', 'PCI': 'warning', 'PHI': 'info' };
    return Components.tag(category, variantMap[category] || 'neutral');
  }

  function classificationStatusTag(status) {
    var map = {
      'approved': { label: 'Confirmed', variant: 'success' },
      'pending': { label: 'Pending', variant: 'warning' },
      'rejected': { label: 'Rejected', variant: 'error' },
      'overridden': { label: 'Overridden', variant: 'info' }
    };
    var info = map[status] || { label: status, variant: 'neutral' };
    return Components.tag(info.label, info.variant);
  }

  // ---- 1. Scans List (/scans) ----

  function renderScansList() {
    var scans = Data.scans;
    var html = '';

    html += Components.pageHeader(
      'Scans',
      scans.length + ' scan records',
      Components.button(Icons.render('plus', 14) + ' New Scan', 'primary', 'md', 'data-navigate="#/connections"')
    );

    // Filter bar
    html += Components.filterBar([], 'Search scans...');

    html += Components.dataTable({
      columns: [
        { key: 'connectionName', label: 'Connection', width: '22%' },
        { key: 'status', label: 'Status', width: '12%', render: function(val, row) {
          if (val === 'running') {
            return Components.statusTag(val) + '<div style="margin-top:4px;">' + Components.progressBar(row.progress, 'info') + '</div>';
          }
          return Components.statusTag(val);
        }},
        { key: 'tablesScanned', label: 'Tables', render: function(val, row) {
          return Data.formatNumber(val) + ' / ' + Data.formatNumber(row.tablesTotal);
        }},
        { key: 'sensitiveFound', label: 'Sensitive Found', render: function(val) {
          return val > 0 ? '<span style="font-weight:500;color:var(--sds-status-error-strong);">' + val + '</span>' : '0';
        }},
        { key: 'duration', label: 'Duration', render: function(val) { return val || '--'; }},
        { key: 'triggeredBy', label: 'Triggered By' },
        { key: 'startedAt', label: 'Started', render: function(val) {
          return Data.formatDateTime(val);
        }},
        { key: 'id', label: '', align: 'right', render: function(val, row) {
          if (row.status === 'running') {
            return '<a data-navigate="#/scans/' + val + '" style="color:var(--sds-text-link);font-size:13px;cursor:pointer;">View Progress</a>';
          }
          if (row.status === 'completed') {
            return '<a data-navigate="#/scans/' + val + '/summary" style="color:var(--sds-text-link);font-size:13px;cursor:pointer;">View Summary</a>';
          }
          return '';
        }}
      ],
      rows: scans,
      onRowClick: function(row) {
        if (row.status === 'running') return '#/scans/' + row.id;
        if (row.status === 'completed') return '#/scans/' + row.id + '/summary';
        return null;
      }
    });

    var content = document.getElementById('content');
    content.innerHTML = html;

    // Delegated input handler for filter bar search
    content.oninput = function(e) {
      if (e.target.closest('.filter-bar input[type="text"]')) {
        var query = e.target.value.toLowerCase();
        var filtered = Data.scans.filter(function(s) {
          return s.connectionName.toLowerCase().indexOf(query) > -1;
        });
        var tableBody = content.querySelector('.data-table tbody');
        if (tableBody) {
          if (filtered.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--sds-text-tertiary);">No scans match your search</td></tr>';
          } else {
            tableBody.innerHTML = filtered.map(function(s) {
              var rowRoute = null;
              if (s.status === 'running') rowRoute = '#/scans/' + s.id;
              else if (s.status === 'completed') rowRoute = '#/scans/' + s.id + '/summary';
              var trAttrs = rowRoute ? ' data-navigate="' + rowRoute + '" role="link" tabindex="0"' : '';
              var row = '<tr' + trAttrs + '>';
              row += '<td>' + s.connectionName + '</td>';
              if (s.status === 'running') {
                row += '<td>' + Components.statusTag(s.status) + '<div style="margin-top:4px;">' + Components.progressBar(s.progress, 'info') + '</div></td>';
              } else {
                row += '<td>' + Components.statusTag(s.status) + '</td>';
              }
              row += '<td>' + Data.formatNumber(s.tablesScanned) + ' / ' + Data.formatNumber(s.tablesTotal) + '</td>';
              row += '<td>' + (s.sensitiveFound > 0 ? '<span style="font-weight:500;color:var(--sds-status-error-strong);">' + s.sensitiveFound + '</span>' : '0') + '</td>';
              row += '<td>' + (s.duration || '--') + '</td>';
              row += '<td>' + s.triggeredBy + '</td>';
              row += '<td>' + Data.formatDateTime(s.startedAt) + '</td>';
              var actionHtml = '';
              if (s.status === 'running') {
                actionHtml = '<a data-navigate="#/scans/' + s.id + '" style="color:var(--sds-text-link);font-size:13px;cursor:pointer;">View Progress</a>';
              } else if (s.status === 'completed') {
                actionHtml = '<a data-navigate="#/scans/' + s.id + '/summary" style="color:var(--sds-text-link);font-size:13px;cursor:pointer;">View Summary</a>';
              }
              row += '<td class="col-actions">' + actionHtml + '</td>';
              row += '</tr>';
              return row;
            }).join('');
          }
        }
      }
    };
  }

  // ---- 2. Scan Progress (/scans/:id) ----

  function renderScanProgress(params) {
    var scan = Data.scans.find(function(s) { return s.id === params.id; });
    if (!scan) {
      document.getElementById('content').innerHTML = '<div class="coming-soon"><h2>Scan not found</h2></div>';
      return;
    }

    var html = '';
    html += Components.breadcrumb([
      { label: 'Scans', href: '#/scans' },
      { label: 'Scan Progress' }
    ]);

    html += Components.pageHeader(
      'Scanning ' + scan.connectionName,
      (scan.triggeredBy === 'Manual' ? 'Manual scan' : 'Scheduled scan') + ' started ' + Data.formatDateTime(scan.startedAt)
    );

    // Progress Card
    var progressCard = '';
    progressCard += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">';
    progressCard += '<div style="flex:1;margin-right:24px;">';
    progressCard += '<div style="height:8px;border-radius:4px;background:var(--sds-bg-subtle,#F4F1EB);overflow:hidden;">';
    progressCard += '<div style="height:100%;border-radius:4px;background:var(--sds-interactive-primary,#013D5B);width:' + scan.progress + '%;transition:width 0.6s ease-out;"></div>';
    progressCard += '</div>';
    progressCard += '</div>';
    progressCard += '<span style="font-size:24px;font-weight:600;">' + scan.progress + '%</span>';
    progressCard += '</div>';

    // Metrics grid
    progressCard += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">';
    var metrics = [
      { label: 'Tables scanned', value: Data.formatNumber(scan.tablesScanned) + ' / ' + Data.formatNumber(scan.tablesTotal) },
      { label: 'Columns discovered', value: scan.status === 'running' ? Data.formatNumber(scan.tablesScanned * 18) : Data.formatNumber(scan.tablesScanned * 20) },
      { label: 'Elapsed time', value: scan.duration || '14m 22s' },
      { label: 'Estimated remaining', value: scan.status === 'running' ? '~' + Math.round((100 - scan.progress) / 5) + 'm' : '--' }
    ];
    for (var m = 0; m < metrics.length; m++) {
      progressCard += '<div>';
      progressCard += '<div style="font-size:13px;color:var(--sds-text-secondary,#54514D);">' + metrics[m].label + '</div>';
      progressCard += '<div style="font-size:20px;font-weight:600;">' + metrics[m].value + '</div>';
      progressCard += '</div>';
    }
    progressCard += '</div>';

    html += '<div style="max-width:640px;">';
    html += Components.card({ body: progressCard });

    // Live Discovery Feed
    var feedItems = [
      { schema: 'analytics.events', cols: 42 },
      { schema: 'analytics.sessions', cols: 28 },
      { schema: 'finance.transactions', cols: 31 },
      { schema: 'hr.employees', cols: 18 },
      { schema: 'marketing.campaigns', cols: 14 },
      { schema: 'payments.orders', cols: 22 }
    ];

    var feedBody = '';
    feedBody += '<div style="max-height:240px;overflow-y:auto;">';
    for (var f = 0; f < feedItems.length; f++) {
      feedBody += '<div style="display:flex;justify-content:space-between;padding:10px 0;' + (f < feedItems.length - 1 ? 'border-bottom:1px solid var(--sds-border-subtle,#E8E4DC);' : '') + '">';
      feedBody += '<span style="font-size:13px;font-weight:500;">' + feedItems[f].schema + '</span>';
      feedBody += '<span style="font-size:13px;color:var(--sds-text-secondary,#54514D);">' + feedItems[f].cols + ' columns</span>';
      feedBody += '</div>';
    }
    feedBody += '</div>';

    html += '<div style="margin-top:16px;">';
    html += Components.card({ title: 'Recent Discoveries', body: feedBody });
    html += '</div>';

    // Action buttons
    html += '<div style="display:flex;gap:12px;margin-top:24px;">';
    html += Components.button('Cancel Scan', 'secondary', 'md', 'id="cancel-scan-btn"');
    html += Components.button('Move to Background', 'secondary', 'md', 'id="bg-scan-btn"');
    html += '</div>';
    html += '</div>';

    var content = document.getElementById('content');
    content.innerHTML = html;

    // Delegated click handler for scan progress actions
    content.onclick = function(e) {
      if (e.target.closest('#cancel-scan-btn')) {
        var overlay = document.getElementById('overlay-container');
        overlay.innerHTML = Components.modal(
          'Cancel Scan',
          '<p style="font-size:14px;">Cancel this scan? Partial results will be discarded.</p>',
          Components.button('Keep Running', 'secondary', 'md', 'data-modal-close') + ' ' +
          Components.button('Cancel Scan', 'primary', 'md', 'data-navigate="#/scans"')
        );
      }
    };
  }

  // ---- 3. Scan Summary (/scans/:id/summary) ----

  function renderScanSummary(params) {
    var scan = Data.scans.find(function(s) { return s.id === params.id; });
    if (!scan) {
      document.getElementById('content').innerHTML = '<div class="coming-soon"><h2>Scan not found</h2></div>';
      return;
    }

    var html = '';
    html += Components.breadcrumb([
      { label: 'Scans', href: '#/scans' },
      { label: 'Scan Summary' }
    ]);

    html += Components.pageHeader(
      'Scan Complete: ' + scan.connectionName,
      'Completed ' + Data.formatDateTime(scan.completedAt || scan.startedAt),
      Components.button('View Review Queue', 'primary', 'md', 'data-navigate="#/review"') + ' ' +
      Components.button('Re-scan', 'secondary', 'md')
    );

    // Metric cards
    var totalColumns = scan.tablesScanned * 19;
    var schemaChanges = scan.newFindings;
    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;">';
    html += Components.statCard('Total Tables', Data.formatNumber(scan.tablesScanned));
    html += Components.statCard('Total Columns', Data.formatNumber(totalColumns));
    html += Components.statCard('Sensitive Columns', '<span style="color:var(--sds-status-warning-strong);">' + scan.sensitiveFound + '</span>');
    html += Components.statCard('New Findings', '<span style="color:var(--sds-interactive-primary);">' + schemaChanges + '</span>');
    html += '</div>';

    // Sensitivity Breakdown
    var piiCount = Math.round(scan.sensitiveFound * 0.54);
    var pciCount = Math.round(scan.sensitiveFound * 0.24);
    var phiCount = scan.sensitiveFound - piiCount - pciCount;

    var breakdownBody = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">';
    var cats = [
      { tag: 'PII', count: piiCount, variant: 'error' },
      { tag: 'PCI', count: pciCount, variant: 'warning' },
      { tag: 'PHI', count: phiCount, variant: 'info' }
    ];
    for (var c = 0; c < cats.length; c++) {
      breakdownBody += '<div style="padding:16px;border:1px solid var(--sds-border-subtle,#E8E4DC);border-radius:8px;text-align:center;">';
      breakdownBody += Components.tag(cats[c].tag, cats[c].variant);
      breakdownBody += '<div style="font-size:20px;font-weight:600;margin-top:8px;">' + cats[c].count + '</div>';
      breakdownBody += '<div style="font-size:13px;color:var(--sds-text-tertiary,#7A756B);">' + Math.round(cats[c].count / scan.sensitiveFound * 100) + '% of sensitive</div>';
      breakdownBody += '</div>';
    }
    breakdownBody += '</div>';

    html += Components.card({ title: 'Sensitivity Breakdown', body: breakdownBody, bordered: true });

    // Classification Status
    var autoClassified = Math.round(scan.sensitiveFound * 0.6);
    var pending = Math.round(scan.sensitiveFound * 0.35);
    var previous = scan.sensitiveFound - autoClassified - pending;

    var statusBody = '';
    var totalSens = scan.sensitiveFound || 1;
    statusBody += '<div style="height:12px;border-radius:6px;display:flex;overflow:hidden;background:var(--sds-bg-subtle);margin-bottom:16px;">';
    statusBody += '<div style="width:' + (autoClassified / totalSens * 100) + '%;background:var(--sds-status-success-strong);"></div>';
    statusBody += '<div style="width:' + (pending / totalSens * 100) + '%;background:var(--sds-status-warning-strong);"></div>';
    statusBody += '<div style="width:' + (previous / totalSens * 100) + '%;background:var(--sds-text-disabled);"></div>';
    statusBody += '</div>';
    statusBody += '<div style="display:flex;gap:24px;font-size:13px;color:var(--sds-text-secondary,#54514D);">';
    statusBody += '<span>' + Components.dot('success') + ' Auto-classified: ' + autoClassified + '</span>';
    statusBody += '<span>' + Components.dot('warning') + ' Pending review: ' + pending + '</span>';
    statusBody += '<span>' + Components.dot('neutral') + ' Previously classified: ' + previous + '</span>';
    statusBody += '</div>';

    html += '<div style="margin-top:16px;">';
    html += Components.card({ title: 'Classification Status', body: statusBody, bordered: true });
    html += '</div>';

    // CTA
    html += '<div style="margin-top:24px;text-align:center;">';
    html += Components.button(Icons.render('review', 14) + ' Review ' + pending + ' Pending Classifications', 'primary', 'md', 'data-navigate="#/review"');
    html += '</div>';

    document.getElementById('content').innerHTML = html;
  }

  // ---- 4. Review Queue (/review) ----

  function renderReviewQueue() {
    var activeTab = State.get('reviewTab') || 'queue';
    var pendingClassifications = Data.getPendingClassifications();
    var rules = Data.rules;

    var html = '';
    html += Components.pageHeader(
      'Classification Review',
      pendingClassifications.length + ' items pending review',
      Components.button('Accept All Above 90%', 'primary', 'md', 'id="bulk-accept-btn"')
    );

    // Tabs
    var inconsistencyCount = 3;
    html += Components.tabs([
      { id: 'queue', label: 'Queue', badge: pendingClassifications.length },
      { id: 'rules', label: 'Rules', badge: rules.length },
      { id: 'consistency', label: 'Consistency', badge: inconsistencyCount }
    ], activeTab);

    html += '<div style="margin-top:24px;" id="review-tab-content">';

    if (activeTab === 'queue') {
      html += renderQueueTab(pendingClassifications);
    } else if (activeTab === 'rules') {
      html += renderRulesTab(rules);
    } else if (activeTab === 'consistency') {
      html += renderConsistencyTab();
    }

    html += '</div>';

    var content = document.getElementById('content');
    content.innerHTML = html;

    // Delegated click handler for review queue actions
    content.onclick = function(e) {
      // Tab switching
      var tab = e.target.closest('.sds-tab');
      if (tab) {
        var tabId = tab.getAttribute('data-tab');
        State.set('reviewTab', tabId);
        renderReviewQueue();
        return;
      }

      // Bulk accept modal
      if (e.target.closest('#bulk-accept-btn')) {
        var above90 = pendingClassifications.filter(function(c) { return c.confidence >= 90; });
        var overlay = document.getElementById('overlay-container');
        var modalBody = '';
        modalBody += '<div style="margin-bottom:16px;">';
        modalBody += '<label style="font-size:14px;font-weight:500;">Accept all above confidence threshold:</label>';
        modalBody += '<div style="display:flex;align-items:center;gap:12px;margin-top:12px;">';
        modalBody += '<input type="range" min="50" max="100" value="90" style="flex:1;" id="threshold-slider">';
        modalBody += '<span id="threshold-value" style="font-size:16px;font-weight:600;min-width:42px;">90%</span>';
        modalBody += '</div>';
        modalBody += '</div>';
        modalBody += '<div style="padding:16px;background:var(--sds-bg-subtle,#F4F1EB);border-radius:8px;font-size:14px;">';
        modalBody += '<strong id="accept-count">' + above90.length + '</strong> columns will be accepted as suggested.';
        modalBody += '</div>';

        overlay.innerHTML = Components.modal(
          'Bulk Accept Classifications',
          modalBody,
          Components.button('Cancel', 'secondary', 'md', 'data-modal-close') + ' ' +
          Components.button('Confirm', 'primary', 'md', 'data-modal-close')
        );

        // Wire slider via overlay oninput (modal is outside content)
        overlay.oninput = function(ev) {
          if (ev.target.id === 'threshold-slider') {
            var val = parseInt(ev.target.value);
            document.getElementById('threshold-value').textContent = val + '%';
            var count = pendingClassifications.filter(function(c) { return c.confidence >= val; }).length;
            document.getElementById('accept-count').textContent = count;
          }
        };
        return;
      }

      // Expand reasoning rows
      var expandBtn = e.target.closest('[data-expand-row]');
      if (expandBtn) {
        var rowId = expandBtn.getAttribute('data-expand-row');
        var el = document.getElementById('reasoning-' + rowId);
        if (el) {
          el.style.display = el.style.display === 'none' ? 'table-row' : 'none';
          expandBtn.classList.toggle('expanded');
        }
      }
    };
  }

  function renderQueueTab(pendingClassifications) {
    var html = '';

    // Filter bar
    html += Components.filterBar([
      { name: 'connection', options: [
        { value: '', label: 'All Connections' },
        { value: 'conn-1', label: 'Snowflake Production' },
        { value: 'conn-2', label: 'AWS S3 Data Lake' },
        { value: 'conn-3', label: 'BigQuery Analytics' }
      ]},
      { name: 'type', options: [
        { value: '', label: 'All Types' },
        { value: 'PII', label: 'PII' },
        { value: 'PCI', label: 'PCI' },
        { value: 'PHI', label: 'PHI' }
      ]},
      { name: 'confidence', options: [
        { value: '', label: 'All Confidence' },
        { value: 'low', label: 'Low (< 60%)' },
        { value: 'medium', label: 'Medium (60-90%)' },
        { value: 'high', label: 'High (> 90%)' }
      ]}
    ], 'Search columns...');

    // Review progress
    var totalCls = Data.classifications.length;
    var reviewedCount = totalCls - pendingClassifications.length;
    var progressPct = Math.round(reviewedCount / totalCls * 100);
    html += '<div style="margin:16px 0;">';
    html += '<div style="font-size:13px;color:var(--sds-text-secondary,#54514D);margin-bottom:6px;">' + reviewedCount + ' of ' + totalCls + ' reviewed</div>';
    html += Components.progressBar(progressPct, 'success');
    html += '</div>';

    // Sort pending by confidence ascending
    var sorted = pendingClassifications.slice().sort(function(a, b) { return a.confidence - b.confidence; });

    // Build table manually for expandable rows
    html += '<table class="data-table">';
    html += '<thead><tr>';
    html += '<th style="width:30px;"></th>';
    html += '<th>Column</th>';
    html += '<th>Table</th>';
    html += '<th>Connection</th>';
    html += '<th>Classification</th>';
    html += '<th>Confidence</th>';
    html += '<th style="width:200px;" class="col-actions">Actions</th>';
    html += '</tr></thead>';
    html += '<tbody>';

    for (var i = 0; i < sorted.length; i++) {
      var cls = sorted[i];
      var table = Data.getTable(cls.tableId);
      var connName = table ? table.connectionName : '--';

      html += '<tr>';
      html += '<td><button style="background:none;border:none;cursor:pointer;padding:4px;" data-expand-row="' + cls.id + '">' + Icons['chevron-right'] + '</button></td>';
      html += '<td><code style="font-size:13px;font-weight:500;">' + cls.columnName + '</code></td>';
      html += '<td style="color:var(--sds-text-secondary,#54514D);">' + cls.tableName + '</td>';
      html += '<td style="font-size:13px;color:var(--sds-text-secondary,#54514D);">' + connName + '</td>';
      html += '<td>' + categoryTag(cls.category) + ' <span style="font-size:12px;">' + cls.suggestedType + '</span></td>';
      html += '<td>' + confidenceBar(cls.confidence) + '</td>';
      html += '<td class="col-actions">';
      html += '<div style="display:flex;gap:4px;">';
      html += '<button class="btn btn-sm" style="background:var(--sds-status-success-bg,#E8F5E9);color:var(--sds-status-success-text,#4A7A0B);">Accept</button>';
      html += '<button class="btn btn-tertiary btn-sm">Override</button>';
      html += '<button class="btn btn-tertiary btn-sm" style="color:var(--sds-status-error-text,#BF5547);">Reject</button>';
      html += '</div>';
      html += '</td>';
      html += '</tr>';

      // Expandable reasoning row
      html += '<tr id="reasoning-' + cls.id + '" style="display:none;">';
      html += '<td colspan="7" style="padding:16px 20px 16px 48px;background:var(--sds-bg-surface,#F9F8F5);">';
      html += '<div style="font-size:13px;font-weight:500;margin-bottom:12px;">Classification Reasoning</div>';
      html += '<div style="display:flex;flex-direction:column;gap:8px;">';
      var signals = [
        { label: 'Column name match', pct: 35 },
        { label: 'Data pattern match', pct: 45 },
        { label: 'Sample value match', pct: 20 }
      ];
      for (var s = 0; s < signals.length; s++) {
        html += '<div style="display:flex;align-items:center;gap:12px;">';
        html += '<span style="font-size:13px;color:var(--sds-text-secondary,#54514D);width:140px;">' + signals[s].label + ': ' + signals[s].pct + '%</span>';
        html += '<div style="flex:1;height:4px;border-radius:2px;background:var(--sds-bg-subtle);">';
        html += '<div style="height:100%;width:' + signals[s].pct + '%;border-radius:2px;background:var(--sds-interactive-primary);"></div>';
        html += '</div>';
        html += '</div>';
      }
      html += '</div>';
      html += '<div style="font-size:13px;color:var(--sds-text-secondary,#54514D);margin-top:12px;">';
      html += 'Similar: 3 other tables have a column named \'' + cls.columnName + '\' classified as ' + cls.category;
      html += '</div>';
      html += '</td>';
      html += '</tr>';
    }

    html += '</tbody></table>';

    return html;
  }

  function renderRulesTab(rules) {
    var html = '';

    html += '<div style="display:flex;justify-content:flex-end;margin-bottom:16px;">';
    html += Components.button(Icons.render('plus', 14) + ' Create Rule', 'primary', 'md', 'data-navigate="#/review/rules/create"');
    html += '</div>';

    html += Components.dataTable({
      columns: [
        { key: 'name', label: 'Rule Name', render: function(val, row) {
          return '<a data-navigate="#/review/rules/' + row.id + '" style="font-weight:500;color:var(--sds-text-primary,#2C2924);cursor:pointer;">' + val + '</a>';
        }},
        { key: 'pattern', label: 'Pattern', render: function(val) {
          return '<code style="font-size:12px;background:var(--sds-bg-subtle,#F4F1EB);padding:2px 6px;border-radius:3px;">' + val + '</code>';
        }},
        { key: 'classificationType', label: 'Classification', render: function(val, row) {
          return categoryTag(row.category);
        }},
        { key: 'matches', label: 'Matches', render: function(val) {
          return '<span style="font-weight:500;">' + val + '</span>';
        }},
        { key: 'status', label: 'Status', render: function(val) {
          if (val === 'active') return Components.dot('success') + ' Active';
          return Components.dot('neutral') + ' Draft';
        }},
        { key: 'createdBy', label: 'Created By' }
      ],
      rows: rules,
      onRowClick: '#/review/rules/:id'
    });

    return html;
  }

  function renderConsistencyTab() {
    var html = '';

    var inconsistencies = [
      { columnName: 'email', tables: ['users', 'customer_profiles', 'marketing_leads'], classification: 'Email Address', issue: 'Classified as PII in 2 tables, unclassified in 1' },
      { columnName: 'phone_number', tables: ['users', 'employee_directory'], classification: 'Phone Number', issue: 'Different classification types applied (PII vs uncategorized)' },
      { columnName: 'date_of_birth', tables: ['patient_records', 'customer_profiles', 'employee_directory'], classification: 'Date of Birth', issue: 'Classified in 2 tables, pending in 1' }
    ];

    if (inconsistencies.length === 0) {
      html += Components.emptyState(
        Icons.render('check', 48),
        'No inconsistencies found',
        'All same-name columns are classified consistently.'
      );
      return html;
    }

    html += '<div style="margin-bottom:16px;font-size:14px;color:var(--sds-text-secondary,#54514D);">';
    html += inconsistencies.length + ' column names have inconsistent classifications across tables';
    html += '</div>';

    for (var i = 0; i < inconsistencies.length; i++) {
      var item = inconsistencies[i];
      var body = '';
      body += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">';
      body += '<code style="font-size:14px;font-weight:500;">' + item.columnName + '</code>';
      body += categoryTag('PII');
      body += '</div>';
      body += '<div style="font-size:13px;color:var(--sds-text-secondary,#54514D);margin-bottom:12px;">' + item.issue + '</div>';
      body += '<div style="font-size:13px;">Found in: ';
      for (var t = 0; t < item.tables.length; t++) {
        if (t > 0) body += ', ';
        body += '<span style="font-weight:500;">' + item.tables[t] + '</span>';
      }
      body += '</div>';

      var footer = Components.button('Resolve', 'primary', 'sm') + ' ' + Components.button('Ignore', 'tertiary', 'sm');

      html += '<div style="margin-bottom:12px;">';
      html += Components.card({
        body: body,
        footer: footer,
        bordered: true
      });
      html += '</div>';
    }

    return html;
  }

  // ---- 5. Table Review (/review/table/:id) ----

  function renderTableReview(params) {
    var table = Data.getTable(params.id);
    if (!table) {
      document.getElementById('content').innerHTML = '<div class="coming-soon"><h2>Table not found</h2></div>';
      return;
    }

    var classifications = Data.getClassificationsForTable(params.id);
    var pendingCount = classifications.filter(function(c) { return c.status === 'pending'; }).length;

    var html = '';
    html += Components.breadcrumb([
      { label: 'Review Queue', href: '#/review' },
      { label: 'Table Review' }
    ]);

    html += Components.pageHeader(
      '<span style="font-family:monospace;">' + table.schema + '.' + table.name + '</span>',
      table.columns + ' columns &mdash; ' + pendingCount + ' pending review',
      Components.button('Accept All Above 90%', 'primary', 'md', 'id="table-bulk-btn"') + ' ' +
      Components.button('Back to Queue', 'secondary', 'md', 'data-navigate="#/review"')
    );

    // Build column data - mix real classifications with synthetic unclassified columns
    var dataTypes = ['VARCHAR', 'INT', 'DECIMAL', 'TIMESTAMP', 'BOOLEAN', 'TEXT', 'BIGINT', 'DATE'];
    var columnNames = ['id', 'created_at', 'updated_at', 'status', 'description', 'amount', 'notes', 'region', 'type', 'metadata'];
    var allColumns = [];

    // Add real classifications
    for (var c = 0; c < classifications.length; c++) {
      allColumns.push({
        name: classifications[c].columnName,
        dataType: 'VARCHAR',
        classification: classifications[c],
        hasSuggestion: true
      });
    }

    // Add synthetic unclassified columns to fill
    var remaining = table.columns - classifications.length;
    for (var r = 0; r < Math.min(remaining, columnNames.length); r++) {
      allColumns.push({
        name: columnNames[r],
        dataType: dataTypes[r % dataTypes.length],
        classification: null,
        hasSuggestion: false
      });
    }

    html += '<table class="data-table">';
    html += '<thead><tr>';
    html += '<th style="width:30px;"><input type="checkbox" id="select-all-cols"></th>';
    html += '<th>Column</th>';
    html += '<th>Data Type</th>';
    html += '<th>Classification</th>';
    html += '<th>Confidence</th>';
    html += '<th>Status</th>';
    html += '<th class="col-actions">Actions</th>';
    html += '</tr></thead>';
    html += '<tbody>';

    for (var i = 0; i < allColumns.length; i++) {
      var col = allColumns[i];
      var cls = col.classification;
      html += '<tr>';
      html += '<td><input type="checkbox" class="col-checkbox"></td>';
      html += '<td><code style="font-size:13px;font-weight:500;">' + col.name + '</code></td>';
      html += '<td><span style="font-size:13px;font-family:monospace;color:var(--sds-text-tertiary,#7A756B);">' + col.dataType + '</span></td>';
      if (cls) {
        html += '<td>' + categoryTag(cls.category) + ' <span style="font-size:12px;">' + cls.suggestedType + '</span></td>';
        html += '<td>' + confidenceBar(cls.confidence) + '</td>';
        html += '<td>' + classificationStatusTag(cls.status) + '</td>';
        html += '<td class="col-actions">';
        if (cls.status === 'pending') {
          html += '<div style="display:flex;gap:4px;">';
          html += '<button class="btn btn-sm" style="background:var(--sds-status-success-bg,#E8F5E9);color:var(--sds-status-success-text,#4A7A0B);">Accept</button>';
          html += '<button class="btn btn-tertiary btn-sm">Override</button>';
          html += '<button class="btn btn-tertiary btn-sm" style="color:var(--sds-status-error-text,#BF5547);">Reject</button>';
          html += '</div>';
        } else {
          html += '--';
        }
        html += '</td>';
      } else {
        html += '<td><span style="color:var(--sds-text-tertiary,#7A756B);">--</span></td>';
        html += '<td>--</td>';
        html += '<td>' + Components.tag('Not Sensitive', 'neutral') + '</td>';
        html += '<td class="col-actions"><button class="btn btn-tertiary btn-sm">Mark as Sensitive</button></td>';
      }
      html += '</tr>';
    }

    html += '</tbody></table>';

    document.getElementById('content').innerHTML = html;
  }

  // ---- 6. Classification Rules List (/review/rules) ----

  function renderRulesList() {
    State.set('reviewTab', 'rules');
    renderReviewQueue();
  }

  // ---- 7. Create Rule (/review/rules/create) ----

  function renderCreateRule() {
    var html = '';
    html += Components.breadcrumb([
      { label: 'Review Queue', href: '#/review' },
      { label: 'Rules', href: '#/review/rules' },
      { label: 'Create Rule' }
    ]);

    html += Components.pageHeader('Create Classification Rule');

    html += '<div style="max-width:640px;">';

    // Form Card
    var formBody = '';
    formBody += Components.formGroup('Rule Name *',
      Components.formInput('ruleName', '', 'e.g., SSN Column Pattern'),
      ''
    );

    formBody += Components.formGroup('Pattern Type *',
      '<div style="display:flex;flex-direction:column;gap:8px;">' +
        '<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;">' +
          '<input type="radio" name="patternType" value="column_name" checked> Column name pattern' +
          '<span style="font-size:12px;color:var(--sds-text-tertiary,#7A756B);">&mdash; Match columns by name</span>' +
        '</label>' +
        '<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;">' +
          '<input type="radio" name="patternType" value="regex"> Regex pattern' +
          '<span style="font-size:12px;color:var(--sds-text-tertiary,#7A756B);">&mdash; Match using regular expressions</span>' +
        '</label>' +
        '<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;">' +
          '<input type="radio" name="patternType" value="sample"> Sample value match' +
          '<span style="font-size:12px;color:var(--sds-text-tertiary,#7A756B);">&mdash; Match based on data patterns</span>' +
        '</label>' +
      '</div>'
    );

    formBody += Components.formGroup('Pattern *',
      '<input class="form-input" type="text" name="pattern" placeholder="e.g., *ssn* or ^\\d{3}-\\d{2}-\\d{4}$" style="font-family:monospace;">',
      'Enter a pattern to match against column names or data values'
    );

    formBody += Components.formGroup('Classification to Apply *',
      Components.formSelect('classification', [
        { value: '', label: 'Select classification...' },
        { value: 'PII', label: 'PII - Personally Identifiable Information' },
        { value: 'PCI', label: 'PCI - Payment Card Industry' },
        { value: 'PHI', label: 'PHI - Protected Health Information' },
        { value: 'custom', label: 'Custom...' }
      ])
    );

    formBody += Components.formGroup('Scope',
      '<div style="display:flex;flex-direction:column;gap:8px;">' +
        '<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;">' +
          '<input type="radio" name="scope" value="all" checked> All connections' +
        '</label>' +
        '<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;">' +
          '<input type="radio" name="scope" value="specific"> Specific connections' +
        '</label>' +
        '<div id="scope-connections" style="display:none;padding-left:24px;margin-top:4px;">' +
          '<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;">' +
            '<input type="checkbox"> Snowflake Production' +
          '</label>' +
          '<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;">' +
            '<input type="checkbox"> AWS S3 Data Lake' +
          '</label>' +
          '<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;">' +
            '<input type="checkbox"> BigQuery Analytics' +
          '</label>' +
        '</div>' +
      '</div>'
    );

    formBody += '<div style="margin-top:8px;">';
    formBody += '<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;">';
    formBody += '<input type="checkbox" checked> Auto-apply to future scan results';
    formBody += '</label>';
    formBody += '<div style="font-size:12px;color:var(--sds-text-tertiary,#7A756B);margin-left:24px;margin-top:4px;">When enabled, this rule will automatically suggest classifications for matching columns in future scans.</div>';
    formBody += '</div>';

    html += Components.card({ body: formBody });

    // Live Preview Card
    var previewBody = '';
    previewBody += '<div style="font-size:13px;color:var(--sds-text-tertiary,#7A756B);padding:24px;text-align:center;">';
    previewBody += 'Enter a pattern above to preview matching columns';
    previewBody += '</div>';

    html += '<div style="margin-top:16px;">';
    html += Components.card({ title: 'Live Preview', body: previewBody, bordered: true });
    html += '</div>';

    // Action buttons
    html += '<div style="display:flex;justify-content:space-between;margin-top:24px;">';
    html += Components.button('Cancel', 'secondary', 'md', 'data-navigate="#/review/rules"');
    html += '<div style="display:flex;gap:12px;">';
    html += Components.button('Test Rule', 'secondary', 'md');
    html += Components.button('Save Rule', 'primary', 'md', 'data-navigate="#/review/rules"');
    html += '</div>';
    html += '</div>';

    html += '</div>';

    var content = document.getElementById('content');
    content.innerHTML = html;

    // Delegated change handler for scope radio toggle
    content.onchange = function(e) {
      if (e.target.name === 'scope') {
        var connEl = document.getElementById('scope-connections');
        if (connEl) {
          connEl.style.display = e.target.value === 'specific' ? 'block' : 'none';
        }
      }
    };
  }

  // ---- 8. Rule Detail (/review/rules/:id) ----

  function renderRuleDetail(params) {
    var rule = Data.rules.find(function(r) { return r.id === params.id; });
    if (!rule) {
      document.getElementById('content').innerHTML = '<div class="coming-soon"><h2>Rule not found</h2></div>';
      return;
    }

    var html = '';
    html += Components.breadcrumb([
      { label: 'Review Queue', href: '#/review' },
      { label: 'Rules', href: '#/review/rules' },
      { label: rule.name }
    ]);

    // Header with status
    var statusHtml = rule.status === 'active'
      ? Components.dot('success') + ' <span style="font-size:14px;color:var(--sds-text-secondary,#54514D);">Active</span>'
      : Components.dot('neutral') + ' <span style="font-size:14px;color:var(--sds-text-secondary,#54514D);">Draft</span>';

    html += Components.pageHeader(
      rule.name + '&nbsp;&nbsp;' + statusHtml,
      '',
      Components.button('Edit Rule', 'secondary', 'md') + ' ' +
      Components.button(rule.status === 'active' ? 'Pause' : 'Resume', 'secondary', 'md') + ' ' +
      Components.button('Delete', 'secondary', 'md', 'style="color:var(--sds-status-error-text,#BF5547);"')
    );

    // Effectiveness Metric Cards
    var confirmed = Math.round(rule.matches * 0.55);
    var rejected = Math.round(rule.matches * 0.08);
    var suggestions = rule.matches - rejected;
    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;">';
    html += Components.statCard('Total Matches', rule.matches);
    html += Components.statCard('Suggestions Generated', '<span style="color:var(--sds-interactive-primary);">' + suggestions + '</span>');
    html += Components.statCard('Confirmed', '<span style="color:var(--sds-status-success-strong);">' + confirmed + '</span>');
    html += Components.statCard('Rejected', '<span style="color:var(--sds-status-error-strong);">' + rejected + '</span>');
    html += '</div>';

    // Rule Definition Card
    var defBody = '<div style="display:grid;grid-template-columns:140px 1fr;gap:12px 24px;font-size:13px;">';
    var defs = [
      { label: 'Pattern Type', value: 'Column name pattern' },
      { label: 'Pattern', value: '<code style="background:var(--sds-bg-subtle,#F4F1EB);padding:2px 6px;border-radius:3px;">' + rule.pattern + '</code>' },
      { label: 'Classification', value: categoryTag(rule.category) + ' ' + rule.classificationType },
      { label: 'Scope', value: 'All connections' },
      { label: 'Auto-apply', value: 'Yes' },
      { label: 'Created', value: Data.formatDate(rule.createdAt) + ' by ' + rule.createdBy }
    ];
    for (var d = 0; d < defs.length; d++) {
      defBody += '<div style="font-weight:500;color:var(--sds-text-secondary,#54514D);">' + defs[d].label + '</div>';
      defBody += '<div>' + defs[d].value + '</div>';
    }
    defBody += '</div>';

    html += Components.card({ title: 'Rule Definition', body: defBody, bordered: true });

    // Matched Columns Card
    var matchedCols = [];
    // Find classifications that might match this rule
    var allCls = Data.classifications;
    for (var mc = 0; mc < allCls.length; mc++) {
      if (allCls[mc].category === rule.category) {
        matchedCols.push(allCls[mc]);
      }
    }
    // Limit to first 10
    matchedCols = matchedCols.slice(0, 10);

    var matchBody = Components.dataTable({
      columns: [
        { key: 'columnName', label: 'Column', render: function(val) {
          return '<code style="font-size:13px;font-weight:500;">' + val + '</code>';
        }},
        { key: 'tableName', label: 'Table' },
        { key: 'status', label: 'Status', render: function(val) {
          return classificationStatusTag(val);
        }},
        { key: 'confidence', label: 'Confidence', render: function(val) {
          return '<span style="font-size:12px;color:var(--sds-text-secondary,#54514D);">' + val + '%</span>';
        }}
      ],
      rows: matchedCols
    });

    html += '<div style="margin-top:16px;">';
    html += Components.card({
      title: 'Matched Columns ' + Components.badge(matchedCols.length, 'neutral'),
      body: matchBody,
      footer: '<a data-navigate="#/review" style="color:var(--sds-text-link,#013D5B);font-size:13px;cursor:pointer;">View all matches in Queue</a>',
      bordered: true
    });
    html += '</div>';

    document.getElementById('content').innerHTML = html;
  }

  // ---- 9. Data Catalog (/catalog) ----

  // Helper: render a catalog table row as HTML string
  function catalogTableRow(t) {
    var row = '<tr data-navigate="#/catalog/' + t.id + '" role="link" tabindex="0">';
    // Table name (bold) + schema.connection breadcrumb
    row += '<td>';
    row += '<div><a data-navigate="#/catalog/' + t.id + '" style="font-weight:600;color:var(--sds-text-primary);cursor:pointer;font-size:14px;">' + t.name + '</a></div>';
    row += '<div style="font-size:12px;color:var(--sds-text-tertiary);margin-top:2px;">' + t.schema + ' &middot; ' + t.connectionName + '</div>';
    row += '</td>';
    // Classification badges
    row += '<td>';
    if (t.tags && t.tags.length > 0) {
      for (var i = 0; i < t.tags.length; i++) {
        row += categoryTag(t.tags[i]) + ' ';
      }
    } else {
      row += '<span style="color:var(--sds-text-disabled);">--</span>';
    }
    row += '</td>';
    // Classification coverage bar
    var clsPct = t.classifiedPct || 0;
    var clsColor;
    if (clsPct === 100) clsColor = 'var(--sds-status-success-strong)';
    else if (clsPct >= 70) clsColor = 'var(--sds-status-warning-strong)';
    else if (clsPct > 0) clsColor = 'var(--sds-status-error-strong)';
    else clsColor = 'var(--sds-text-disabled)';
    row += '<td>';
    row += '<div style="display:flex;align-items:center;gap:8px;">';
    row += '<div style="width:48px;height:6px;border-radius:3px;background:var(--sds-bg-subtle);">';
    row += '<div style="width:' + clsPct + '%;height:100%;border-radius:3px;background:' + clsColor + ';"></div>';
    row += '</div>';
    row += '<span style="font-size:12px;font-weight:500;color:var(--sds-text-secondary);">' + clsPct + '%</span>';
    row += '</div>';
    row += '</td>';
    // Sensitivity
    row += '<td>' + Components.sensitivityTag(t.sensitivity) + '</td>';
    // Owner
    row += '<td style="font-size:13px;color:var(--sds-text-secondary);">' + (t.owner || '--') + '</td>';
    // Last scanned
    row += '<td style="font-size:13px;color:var(--sds-text-tertiary);white-space:nowrap;">' + Data.timeAgo(t.lastScanned) + '</td>';
    // Row count
    row += '<td style="text-align:right;font-variant-numeric:tabular-nums;font-size:13px;">' + Data.formatNumber(t.rowCount) + '</td>';
    row += '</tr>';
    return row;
  }

  // Helper: filter tables based on current filter state
  function filterCatalogTables(query, connectionFilter, sensitivityFilter, statusFilter) {
    return Data.tables.filter(function(t) {
      // Text search
      if (query) {
        var q = query.toLowerCase();
        var matchesText = t.name.toLowerCase().indexOf(q) > -1 ||
          t.schema.toLowerCase().indexOf(q) > -1 ||
          t.connectionName.toLowerCase().indexOf(q) > -1 ||
          (t.owner && t.owner.toLowerCase().indexOf(q) > -1) ||
          (t.tags && t.tags.join(' ').toLowerCase().indexOf(q) > -1);
        if (!matchesText) return false;
      }
      // Connection filter
      if (connectionFilter && t.connectionId !== connectionFilter) return false;
      // Sensitivity filter
      if (sensitivityFilter && t.sensitivity !== sensitivityFilter) return false;
      // Classification status filter
      if (statusFilter) {
        if (statusFilter === 'full' && t.classifiedPct !== 100) return false;
        if (statusFilter === 'partial' && (t.classifiedPct === 0 || t.classifiedPct === 100)) return false;
        if (statusFilter === 'unreviewed' && t.classifiedPct > 0) return false;
      }
      return true;
    });
  }

  // Helper: build tree data grouped by Connection > Schema > Table
  function buildCatalogTree() {
    var tree = {};
    var tables = Data.tables;
    for (var i = 0; i < tables.length; i++) {
      var t = tables[i];
      if (!tree[t.connectionId]) {
        tree[t.connectionId] = { name: t.connectionName, id: t.connectionId, schemas: {} };
      }
      if (!tree[t.connectionId].schemas[t.schema]) {
        tree[t.connectionId].schemas[t.schema] = [];
      }
      tree[t.connectionId].schemas[t.schema].push(t);
    }
    return tree;
  }

  // Helper: render the tree panel HTML
  function renderTreePanel() {
    var tree = buildCatalogTree();
    var connIds = Object.keys(tree).sort(function(a, b) {
      return tree[a].name.localeCompare(tree[b].name);
    });

    var html = '';
    html += '<div id="catalog-tree-panel" style="width:260px;min-width:260px;background:var(--sds-bg-surface);border:1px solid var(--sds-border-subtle);border-radius:8px;overflow:hidden;display:flex;flex-direction:column;max-height:calc(100vh - 180px);position:sticky;top:16px;">';

    // Tree header
    html += '<div style="padding:12px 16px;border-bottom:1px solid var(--sds-border-subtle);display:flex;align-items:center;justify-content:space-between;">';
    html += '<span style="font-size:13px;font-weight:600;color:var(--sds-text-primary);display:flex;align-items:center;gap:6px;">' + Icons.render('folder', 14) + ' Browse</span>';
    html += '<button id="tree-collapse-all" style="font-size:11px;color:var(--sds-text-link);background:none;border:none;cursor:pointer;padding:2px 4px;">Collapse All</button>';
    html += '</div>';

    // Tree body (scrollable)
    html += '<div style="overflow-y:auto;padding:8px 0;flex:1;">';

    for (var ci = 0; ci < connIds.length; ci++) {
      var conn = tree[connIds[ci]];
      var schemaKeys = Object.keys(conn.schemas).sort();
      var connTableCount = 0;
      for (var sk = 0; sk < schemaKeys.length; sk++) {
        connTableCount += conn.schemas[schemaKeys[sk]].length;
      }

      // Connection node (level 0)
      html += '<div class="tree-node tree-connection" data-conn-id="' + conn.id + '">';
      html += '<div class="tree-item tree-item-conn" data-tree-toggle="conn-' + conn.id + '" style="display:flex;align-items:center;gap:6px;padding:6px 12px;cursor:pointer;font-size:13px;font-weight:600;color:var(--sds-text-primary);user-select:none;" role="treeitem">';
      html += '<span class="tree-chevron" style="transition:transform 0.15s;display:inline-flex;color:var(--sds-text-tertiary);">▶</span>';
      html += '<span style="display:inline-flex;color:var(--sds-text-tertiary);">' + Icons.render('connections', 14) + '</span>';
      html += '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="' + conn.name + '">' + conn.name + '</span>';
      html += '<span style="font-size:11px;font-weight:500;color:var(--sds-text-tertiary);background:var(--sds-bg-subtle);border-radius:8px;padding:1px 6px;">' + connTableCount + '</span>';
      html += '</div>';

      // Schema children (level 1)
      html += '<div class="tree-children" id="tree-conn-' + conn.id + '" style="display:none;padding-left:12px;">';
      for (var si = 0; si < schemaKeys.length; si++) {
        var schemaName = schemaKeys[si];
        var schemaTables = conn.schemas[schemaName];

        html += '<div class="tree-node tree-schema">';
        html += '<div class="tree-item tree-item-schema" data-tree-toggle="schema-' + conn.id + '-' + schemaName + '" style="display:flex;align-items:center;gap:6px;padding:5px 12px;cursor:pointer;font-size:12px;font-weight:500;color:var(--sds-text-secondary);user-select:none;" role="treeitem">';
        html += '<span class="tree-chevron" style="transition:transform 0.15s;display:inline-flex;color:var(--sds-text-tertiary);font-size:10px;">▶</span>';
        html += '<span style="display:inline-flex;color:var(--sds-text-tertiary);">' + Icons.render('folder', 12) + '</span>';
        html += '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + schemaName + '</span>';
        html += '<span style="font-size:10px;font-weight:500;color:var(--sds-text-tertiary);">' + schemaTables.length + '</span>';
        html += '</div>';

        // Table children (level 2)
        html += '<div class="tree-children" id="tree-schema-' + conn.id + '-' + schemaName + '" style="display:none;padding-left:12px;">';
        // Sort tables alphabetically
        schemaTables.sort(function(a, b) { return a.name.localeCompare(b.name); });
        for (var ti = 0; ti < schemaTables.length; ti++) {
          var tbl = schemaTables[ti];
          var sensColor = tbl.sensitivity === 'critical' ? 'var(--sds-status-error-strong)' :
                          tbl.sensitivity === 'high' ? 'var(--sds-status-warning-strong)' :
                          tbl.sensitivity === 'medium' ? 'var(--sds-status-info-strong)' : 'var(--sds-text-disabled)';
          html += '<div class="tree-item tree-item-table" data-navigate="#/catalog/' + tbl.id + '" style="display:flex;align-items:center;gap:6px;padding:4px 12px 4px 18px;cursor:pointer;font-size:12px;color:var(--sds-text-secondary);user-select:none;border-radius:4px;" role="treeitem">';
          html += '<span style="width:6px;height:6px;border-radius:50%;background:' + sensColor + ';flex-shrink:0;"></span>';
          html += '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:\'SF Mono\',Menlo,monospace;">' + tbl.name + '</span>';
          if (tbl.tags && tbl.tags.length > 0) {
            html += '<span style="font-size:9px;font-weight:600;color:var(--sds-status-error-text);background:var(--sds-status-error-bg);border-radius:3px;padding:1px 4px;">' + tbl.tags[0] + '</span>';
          }
          html += '</div>';
        }
        html += '</div>'; // schema children
        html += '</div>'; // schema node
      }
      html += '</div>'; // conn children
      html += '</div>'; // conn node
    }

    html += '</div>'; // tree body
    html += '</div>'; // tree panel

    return html;
  }

  // Wire up tree expand/collapse behavior
  function wireTreePanel() {
    var panel = document.getElementById('catalog-tree-panel');
    if (!panel) return;

    // Toggle expand/collapse on click
    panel.addEventListener('click', function(e) {
      var toggleItem = e.target.closest('[data-tree-toggle]');
      if (toggleItem) {
        var targetId = 'tree-' + toggleItem.getAttribute('data-tree-toggle');
        var children = document.getElementById(targetId);
        var chevron = toggleItem.querySelector('.tree-chevron');
        if (children) {
          var isOpen = children.style.display !== 'none';
          children.style.display = isOpen ? 'none' : 'block';
          if (chevron) {
            chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(90deg)';
          }
        }
      }
    });

    // Hover effect for table items
    panel.addEventListener('mouseover', function(e) {
      var item = e.target.closest('.tree-item-table');
      if (item) item.style.background = 'var(--sds-bg-subtle)';
    });
    panel.addEventListener('mouseout', function(e) {
      var item = e.target.closest('.tree-item-table');
      if (item) item.style.background = 'transparent';
    });

    // Collapse all button
    var collapseBtn = document.getElementById('tree-collapse-all');
    if (collapseBtn) {
      collapseBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        var allChildren = panel.querySelectorAll('.tree-children');
        var allChevrons = panel.querySelectorAll('.tree-chevron');
        for (var i = 0; i < allChildren.length; i++) {
          allChildren[i].style.display = 'none';
        }
        for (var j = 0; j < allChevrons.length; j++) {
          allChevrons[j].style.transform = 'rotate(0deg)';
        }
      });
    }
  }

  function renderDataCatalog() {
    var tables = Data.tables;

    // Compute stats
    var totalAssets = tables.length;
    var classifiedCount = 0;
    var pendingCount = Data.getPendingClassifications().length;
    var connectionSet = {};
    for (var s = 0; s < tables.length; s++) {
      if (tables[s].classifiedPct === 100) classifiedCount++;
      connectionSet[tables[s].connectionId] = true;
    }
    var classifiedPct = totalAssets > 0 ? Math.round((classifiedCount / totalAssets) * 100) : 0;
    var connCount = Object.keys(connectionSet).length;

    var html = '';

    // Layout: tree panel + main content
    html += '<div style="display:flex;gap:20px;align-items:flex-start;">';

    // Tree panel (left)
    html += renderTreePanel();

    // Main content (right)
    html += '<div style="flex:1;min-width:0;">';

    // Search-first hero section
    html += '<div style="text-align:center;padding:32px 0 28px 0;">';
    html += '<h1 style="font-size:28px;font-weight:700;color:var(--sds-text-primary);margin-bottom:8px;">Data Catalog</h1>';
    html += '<p style="font-size:15px;color:var(--sds-text-secondary);margin-bottom:24px;">' + totalAssets + ' tables across ' + connCount + ' connections</p>';
    // Large centered search bar
    html += '<div style="max-width:600px;margin:0 auto;position:relative;">';
    html += '<input id="catalog-search" class="form-input" type="text" placeholder="Search tables, schemas, connections, owners..." style="height:48px;font-size:16px;padding:0 16px 0 44px;border-radius:10px;border:1.5px solid var(--sds-border-strong);box-shadow:0 2px 8px rgba(0,0,0,0.06);">';
    html += '<div style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--sds-text-tertiary);pointer-events:none;">' + Icons.render('search', 18) + '</div>';
    html += '</div>';
    html += '</div>';

    // Quick stats row
    html += '<div class="grid-4" style="margin-bottom:24px;">';
    html += Components.statCard('Total Assets', totalAssets, 'Tables discovered');
    html += Components.statCard('Classified', classifiedPct + '%', classifiedCount + ' of ' + totalAssets + ' tables');
    html += Components.statCard('Connections', connCount, 'Active data sources');
    html += Components.statCard('Pending Reviews', pendingCount, 'Classifications awaiting review');
    html += '</div>';

    // Browse paths as clickable cards
    html += '<div style="margin-bottom:28px;">';
    html += '<h3 style="font-size:14px;font-weight:600;color:var(--sds-text-secondary);text-transform:uppercase;letter-spacing:0.3px;margin-bottom:12px;">Browse By</h3>';
    html += '<div class="grid-4" style="gap:12px;">';
    // By Connection
    html += '<div class="sds-card" style="cursor:pointer;padding:16px 20px;" onclick="document.querySelector(\'#catalog-filter-connection\').value=\'conn-1\';document.querySelector(\'#catalog-filter-connection\').dispatchEvent(new Event(\'change\'));">';
    html += '<div style="display:flex;align-items:center;gap:10px;">';
    html += '<div style="width:32px;height:32px;border-radius:8px;background:var(--sds-status-info-bg);display:flex;align-items:center;justify-content:center;color:var(--sds-status-info-text);">' + Icons.render('connections', 16) + '</div>';
    html += '<div><div style="font-weight:600;font-size:14px;color:var(--sds-text-primary);">By Connection</div>';
    html += '<div style="font-size:12px;color:var(--sds-text-tertiary);">' + connCount + ' sources</div></div>';
    html += '</div></div>';
    // By Classification
    html += '<div class="sds-card" style="cursor:pointer;padding:16px 20px;" onclick="document.querySelector(\'#catalog-filter-status\').value=\'full\';document.querySelector(\'#catalog-filter-status\').dispatchEvent(new Event(\'change\'));">';
    html += '<div style="display:flex;align-items:center;gap:10px;">';
    html += '<div style="width:32px;height:32px;border-radius:8px;background:var(--sds-status-success-bg);display:flex;align-items:center;justify-content:center;color:var(--sds-status-success-text);">' + Icons.render('shield', 16) + '</div>';
    html += '<div><div style="font-weight:600;font-size:14px;color:var(--sds-text-primary);">By Classification</div>';
    html += '<div style="font-size:12px;color:var(--sds-text-tertiary);">' + classifiedCount + ' fully classified</div></div>';
    html += '</div></div>';
    // By Sensitivity
    var criticalCount = tables.filter(function(t) { return t.sensitivity === 'critical'; }).length;
    html += '<div class="sds-card" style="cursor:pointer;padding:16px 20px;" onclick="document.querySelector(\'#catalog-filter-sensitivity\').value=\'critical\';document.querySelector(\'#catalog-filter-sensitivity\').dispatchEvent(new Event(\'change\'));">';
    html += '<div style="display:flex;align-items:center;gap:10px;">';
    html += '<div style="width:32px;height:32px;border-radius:8px;background:var(--sds-status-error-bg);display:flex;align-items:center;justify-content:center;color:var(--sds-status-error-text);">' + Icons.render('scan', 16) + '</div>';
    html += '<div><div style="font-weight:600;font-size:14px;color:var(--sds-text-primary);">By Sensitivity</div>';
    html += '<div style="font-size:12px;color:var(--sds-text-tertiary);">' + criticalCount + ' critical tables</div></div>';
    html += '</div></div>';
    // Unclassified
    var unclassifiedCount = tables.filter(function(t) { return t.classifiedPct === 0; }).length;
    html += '<div class="sds-card" style="cursor:pointer;padding:16px 20px;" onclick="document.querySelector(\'#catalog-filter-status\').value=\'unreviewed\';document.querySelector(\'#catalog-filter-status\').dispatchEvent(new Event(\'change\'));">';
    html += '<div style="display:flex;align-items:center;gap:10px;">';
    html += '<div style="width:32px;height:32px;border-radius:8px;background:var(--sds-status-warning-bg);display:flex;align-items:center;justify-content:center;color:var(--sds-status-warning-text);">' + Icons.render('review', 16) + '</div>';
    html += '<div><div style="font-weight:600;font-size:14px;color:var(--sds-text-primary);">Unclassified</div>';
    html += '<div style="font-size:12px;color:var(--sds-text-tertiary);">' + unclassifiedCount + ' need attention</div></div>';
    html += '</div></div>';
    html += '</div>'; // grid
    html += '</div>'; // browse section

    // Recently scanned section
    var recentTables = tables.slice().sort(function(a, b) {
      return new Date(b.lastScanned) - new Date(a.lastScanned);
    }).slice(0, 4);
    html += '<div style="margin-bottom:28px;">';
    html += '<h3 style="font-size:14px;font-weight:600;color:var(--sds-text-secondary);text-transform:uppercase;letter-spacing:0.3px;margin-bottom:12px;">Recently Scanned</h3>';
    html += '<div class="grid-4" style="gap:12px;">';
    for (var rt = 0; rt < recentTables.length; rt++) {
      var rTbl = recentTables[rt];
      html += '<div class="sds-card" data-navigate="#/catalog/' + rTbl.id + '" style="padding:16px 20px;">';
      html += '<div style="font-weight:600;font-size:14px;font-family:\'SF Mono\',Menlo,monospace;color:var(--sds-text-primary);margin-bottom:4px;">' + rTbl.name + '</div>';
      html += '<div style="font-size:12px;color:var(--sds-text-tertiary);margin-bottom:8px;">' + rTbl.schema + ' &middot; ' + rTbl.connectionName + '</div>';
      html += '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">';
      if (rTbl.tags) {
        for (var rtg = 0; rtg < rTbl.tags.length; rtg++) {
          html += categoryTag(rTbl.tags[rtg]);
        }
      }
      html += Components.sensitivityTag(rTbl.sensitivity);
      html += '</div>';
      html += '<div style="font-size:11px;color:var(--sds-text-tertiary);margin-top:8px;">' + Data.timeAgo(rTbl.lastScanned) + '</div>';
      html += '</div>';
    }
    html += '</div>';
    html += '</div>';

    // Filter bar for the full table
    html += '<div style="display:flex;gap:12px;align-items:center;margin-bottom:16px;padding:12px 16px;background:var(--sds-bg-surface);border-radius:8px;border:1px solid var(--sds-bg-subtle);">';
    html += '<select class="filter-select" id="catalog-filter-connection" style="font-size:13px;height:36px;padding:0 28px 0 10px;border:1px solid var(--sds-border-strong);border-radius:6px;background:var(--sds-bg-card) url(\"data:image/svg+xml,%3Csvg width=\'10\' height=\'6\' viewBox=\'0 0 10 6\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1l4 4 4-4\' stroke=\'%236B6760\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E\") no-repeat right 10px center;appearance:none;color:var(--sds-text-primary);cursor:pointer;width:auto;">';
    html += '<option value="">All Connections</option>';
    for (var ci = 0; ci < Data.connections.length; ci++) {
      html += '<option value="' + Data.connections[ci].id + '">' + Data.connections[ci].name + '</option>';
    }
    html += '</select>';
    html += '<select class="filter-select" id="catalog-filter-sensitivity" style="font-size:13px;height:36px;padding:0 28px 0 10px;border:1px solid var(--sds-border-strong);border-radius:6px;background:var(--sds-bg-card) url(\"data:image/svg+xml,%3Csvg width=\'10\' height=\'6\' viewBox=\'0 0 10 6\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1l4 4 4-4\' stroke=\'%236B6760\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E\") no-repeat right 10px center;appearance:none;color:var(--sds-text-primary);cursor:pointer;width:auto;">';
    html += '<option value="">All Sensitivity</option>';
    html += '<option value="critical">Critical</option>';
    html += '<option value="high">High</option>';
    html += '<option value="medium">Medium</option>';
    html += '<option value="low">Low</option>';
    html += '</select>';
    html += '<select class="filter-select" id="catalog-filter-status" style="font-size:13px;height:36px;padding:0 28px 0 10px;border:1px solid var(--sds-border-strong);border-radius:6px;background:var(--sds-bg-card) url(\"data:image/svg+xml,%3Csvg width=\'10\' height=\'6\' viewBox=\'0 0 10 6\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1l4 4 4-4\' stroke=\'%236B6760\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E\") no-repeat right 10px center;appearance:none;color:var(--sds-text-primary);cursor:pointer;width:auto;">';
    html += '<option value="">All Classification Status</option>';
    html += '<option value="full">Fully Classified</option>';
    html += '<option value="partial">Partially Classified</option>';
    html += '<option value="unreviewed">Unclassified</option>';
    html += '</select>';
    html += '<div style="flex:1;"></div>';
    html += '<span id="catalog-result-count" style="font-size:13px;color:var(--sds-text-tertiary);">' + tables.length + ' tables</span>';
    html += Components.button(Icons.render('download', 14) + ' Export', 'secondary', 'sm');
    html += '</div>';

    // Data table
    html += '<table class="data-table" id="catalog-table">';
    html += '<thead><tr>';
    html += '<th>Table</th>';
    html += '<th>Classification</th>';
    html += '<th>Coverage</th>';
    html += '<th>Sensitivity</th>';
    html += '<th>Owner</th>';
    html += '<th>Last Scanned</th>';
    html += '<th style="text-align:right;">Rows</th>';
    html += '</tr></thead>';
    html += '<tbody id="catalog-table-body">';
    for (var ti = 0; ti < tables.length; ti++) {
      html += catalogTableRow(tables[ti]);
    }
    html += '</tbody></table>';

    // Pagination
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;font-size:13px;color:var(--sds-text-secondary);">';
    html += '<span>Showing 1-' + tables.length + ' of ' + tables.length + '</span>';
    html += '</div>';

    html += '</div>'; // close main content flex child
    html += '</div>'; // close flex layout wrapper

    var content = document.getElementById('content');
    content.innerHTML = html;

    // Wire up tree panel
    wireTreePanel();

    // Wire up live filtering
    function applyFilters() {
      var query = (document.getElementById('catalog-search') || {}).value || '';
      var conn = (document.getElementById('catalog-filter-connection') || {}).value || '';
      var sens = (document.getElementById('catalog-filter-sensitivity') || {}).value || '';
      var stat = (document.getElementById('catalog-filter-status') || {}).value || '';
      var filtered = filterCatalogTables(query, conn, sens, stat);
      var tbody = document.getElementById('catalog-table-body');
      var countEl = document.getElementById('catalog-result-count');
      if (tbody) {
        if (filtered.length === 0) {
          tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:48px;color:var(--sds-text-tertiary);">No tables match your filters</td></tr>';
        } else {
          tbody.innerHTML = filtered.map(catalogTableRow).join('');
        }
      }
      if (countEl) {
        countEl.textContent = filtered.length + ' table' + (filtered.length !== 1 ? 's' : '');
      }
    }

    // Search input
    var searchEl = document.getElementById('catalog-search');
    if (searchEl) searchEl.addEventListener('input', applyFilters);
    // Filter dropdowns
    var filterIds = ['catalog-filter-connection', 'catalog-filter-sensitivity', 'catalog-filter-status'];
    for (var fi = 0; fi < filterIds.length; fi++) {
      var filterEl = document.getElementById(filterIds[fi]);
      if (filterEl) filterEl.addEventListener('change', applyFilters);
    }
  }

  // ---- 10. Table Detail (/catalog/:id) ----

  function renderTableDetail(params) {
    var table = Data.getTable(params.id);
    if (!table) {
      document.getElementById('content').innerHTML = '<div class="coming-soon"><h2>Table not found</h2></div>';
      return;
    }

    var classifications = Data.getClassificationsForTable(params.id);
    var activeTab = State.get('tableDetailTab') || 'overview';

    var html = '';

    // Breadcrumb
    html += Components.breadcrumb([
      { label: 'Data Catalog', href: '#/catalog' },
      { label: table.schema + '.' + table.name }
    ]);

    // Header with table name, connection breadcrumb, badges, sensitivity
    html += '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px;">';
    html += '<div>';
    html += '<h1 style="font-size:24px;font-weight:700;font-family:\'SF Mono\',Menlo,monospace;color:var(--sds-text-primary);margin-bottom:6px;">' + table.schema + '.' + table.name + '</h1>';
    html += '<div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--sds-text-secondary);margin-bottom:10px;">';
    html += '<span>' + table.connectionName + '</span>';
    html += '<span style="color:var(--sds-text-disabled);">/</span>';
    html += '<span>' + table.schema + '</span>';
    html += '</div>';
    html += '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">';
    if (table.tags) {
      for (var tg = 0; tg < table.tags.length; tg++) {
        html += categoryTag(table.tags[tg]);
      }
    }
    html += Components.sensitivityTag(table.sensitivity);
    html += '</div>';
    html += '</div>';
    // Action buttons
    html += '<div style="display:flex;gap:8px;">';
    if (table.sensitivity === 'critical' || table.sensitivity === 'high') {
      html += Components.button('Remediate', 'primary', 'sm');
    }
    html += Components.button('Re-scan', 'secondary', 'sm');
    html += Components.button('Review', 'secondary', 'sm', 'data-navigate="#/review"');
    html += '</div>';
    html += '</div>';

    // Summary cards row — 6 metric cards
    html += '<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin-bottom:24px;">';
    // Columns
    html += '<div class="sds-card"><div style="padding:14px 16px;">';
    html += '<div style="font-size:12px;font-weight:500;color:var(--sds-text-tertiary);margin-bottom:4px;">Columns</div>';
    html += '<div style="font-size:20px;font-weight:700;color:var(--sds-text-primary);font-variant-numeric:tabular-nums;">' + table.columns + '</div>';
    html += '</div></div>';
    // Classified %
    html += '<div class="sds-card"><div style="padding:14px 16px;">';
    html += '<div style="font-size:12px;font-weight:500;color:var(--sds-text-tertiary);margin-bottom:4px;">Classified</div>';
    html += '<div style="font-size:20px;font-weight:700;color:var(--sds-text-primary);font-variant-numeric:tabular-nums;">' + table.classifiedPct + '%</div>';
    html += '</div></div>';
    // Rows
    html += '<div class="sds-card"><div style="padding:14px 16px;">';
    html += '<div style="font-size:12px;font-weight:500;color:var(--sds-text-tertiary);margin-bottom:4px;">Rows</div>';
    html += '<div style="font-size:20px;font-weight:700;color:var(--sds-text-primary);font-variant-numeric:tabular-nums;">' + Data.formatNumber(table.rowCount) + '</div>';
    html += '</div></div>';
    // Sensitivity
    html += '<div class="sds-card"><div style="padding:14px 16px;">';
    html += '<div style="font-size:12px;font-weight:500;color:var(--sds-text-tertiary);margin-bottom:4px;">Sensitivity</div>';
    html += '<div style="margin-top:4px;">' + Components.sensitivityTag(table.sensitivity) + '</div>';
    html += '</div></div>';
    // Owner
    html += '<div class="sds-card"><div style="padding:14px 16px;">';
    html += '<div style="font-size:12px;font-weight:500;color:var(--sds-text-tertiary);margin-bottom:4px;">Owner</div>';
    html += '<div style="font-size:14px;font-weight:600;color:var(--sds-text-primary);">' + (table.owner || '--') + '</div>';
    html += '</div></div>';
    // Last scanned
    html += '<div class="sds-card"><div style="padding:14px 16px;">';
    html += '<div style="font-size:12px;font-weight:500;color:var(--sds-text-tertiary);margin-bottom:4px;">Last Scanned</div>';
    html += '<div style="font-size:14px;font-weight:600;color:var(--sds-text-primary);">' + Data.timeAgo(table.lastScanned) + '</div>';
    html += '</div></div>';
    html += '</div>';

    // Tabs — flush, no gap
    html += Components.tabs([
      { id: 'overview', label: 'Overview' },
      { id: 'columns', label: 'Columns', badge: table.columns },
      { id: 'lineage', label: 'Lineage' },
      { id: 'access', label: 'Access' },
      { id: 'activity', label: 'Activity' }
    ], activeTab);

    // Tab content — directly below tabs, no extra margin
    html += '<div id="table-detail-tab-content" style="padding-top:20px;">';

    if (activeTab === 'overview') {
      html += renderOverviewTab(table, classifications);
    } else if (activeTab === 'columns') {
      html += renderClassificationsTab(table, classifications);
    } else if (activeTab === 'lineage') {
      html += renderLineageTab(table);
    } else if (activeTab === 'access') {
      html += renderAccessTab(table);
    } else if (activeTab === 'activity') {
      html += renderHistoryTab(table, classifications);
    }

    html += '</div>';

    var content = document.getElementById('content');
    content.innerHTML = html;

    // Delegated click handler for tabs
    content.addEventListener('click', function(e) {
      var tab = e.target.closest('.sds-tab');
      if (tab) {
        var tabId = tab.getAttribute('data-tab');
        State.set('tableDetailTab', tabId);
        renderTableDetail(params);
      }
    });
  }

  // ---- Overview Tab ----
  function renderOverviewTab(table, classifications) {
    var html = '';

    // Classification summary
    var approved = 0, pending = 0, rejected = 0;
    for (var ci = 0; ci < classifications.length; ci++) {
      if (classifications[ci].status === 'approved') approved++;
      else if (classifications[ci].status === 'pending') pending++;
      else if (classifications[ci].status === 'rejected') rejected++;
    }

    html += '<div class="grid-2" style="gap:20px;margin-bottom:24px;">';

    // Classification breakdown card
    html += Components.card({
      title: 'Classification Summary',
      body: (function() {
        var b = '';
        b += '<div style="display:flex;gap:24px;margin-bottom:16px;">';
        b += '<div><div style="font-size:24px;font-weight:700;color:var(--sds-status-success-text);">' + approved + '</div><div style="font-size:12px;color:var(--sds-text-tertiary);">Approved</div></div>';
        b += '<div><div style="font-size:24px;font-weight:700;color:var(--sds-status-warning-text);">' + pending + '</div><div style="font-size:12px;color:var(--sds-text-tertiary);">Pending</div></div>';
        b += '<div><div style="font-size:24px;font-weight:700;color:var(--sds-status-error-text);">' + rejected + '</div><div style="font-size:12px;color:var(--sds-text-tertiary);">Rejected</div></div>';
        b += '<div><div style="font-size:24px;font-weight:700;color:var(--sds-text-tertiary);">' + (table.columns - classifications.length) + '</div><div style="font-size:12px;color:var(--sds-text-tertiary);">Not Classified</div></div>';
        b += '</div>';
        b += '<div style="margin-bottom:8px;font-size:13px;font-weight:500;color:var(--sds-text-secondary);">Coverage</div>';
        b += Components.progressBar(table.classifiedPct, table.classifiedPct === 100 ? 'success' : table.classifiedPct >= 70 ? null : 'warning');
        b += '<div style="font-size:12px;color:var(--sds-text-tertiary);margin-top:4px;">' + table.classifiedColumns + ' of ' + table.columns + ' columns classified (' + table.classifiedPct + '%)</div>';
        return b;
      })(),
      bordered: true
    });

    // Sensitive data categories card
    html += Components.card({
      title: 'Data Categories',
      body: (function() {
        var b = '';
        if (!table.tags || table.tags.length === 0) {
          b += '<div style="color:var(--sds-text-tertiary);font-size:14px;">No sensitive categories detected</div>';
        } else {
          var catDescriptions = {
            'PII': 'Personally Identifiable Information',
            'PCI': 'Payment Card Industry Data',
            'PHI': 'Protected Health Information',
            'CCPA': 'California Consumer Privacy Act'
          };
          for (var ct = 0; ct < table.tags.length; ct++) {
            b += '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;' + (ct > 0 ? 'border-top:1px solid var(--sds-border-subtle);' : '') + '">';
            b += categoryTag(table.tags[ct]);
            b += '<span style="font-size:13px;color:var(--sds-text-secondary);">' + (catDescriptions[table.tags[ct]] || table.tags[ct]) + '</span>';
            b += '</div>';
          }
        }
        return b;
      })(),
      bordered: true
    });

    html += '</div>';

    // Top classified columns preview
    if (classifications.length > 0) {
      var previewCls = classifications.slice(0, 5);
      html += Components.card({
        title: 'Top Classified Columns',
        actions: '<a data-tab="columns" class="sds-tab" role="tab" style="border:none;font-size:13px;color:var(--sds-text-link);cursor:pointer;padding:0;">View all columns</a>',
        body: (function() {
          var b = '<table class="data-table"><thead><tr><th>Column</th><th>Classification</th><th>Category</th><th>Confidence</th><th>Status</th></tr></thead><tbody>';
          for (var pc = 0; pc < previewCls.length; pc++) {
            var cls = previewCls[pc];
            b += '<tr>';
            b += '<td><code style="font-size:13px;font-weight:500;">' + cls.columnName + '</code></td>';
            b += '<td style="font-size:13px;">' + cls.suggestedType + '</td>';
            b += '<td>' + categoryTag(cls.category) + '</td>';
            b += '<td>' + confidenceBar(cls.confidence) + '</td>';
            b += '<td>' + classificationStatusTag(cls.status) + '</td>';
            b += '</tr>';
          }
          b += '</tbody></table>';
          return b;
        })(),
        bordered: true
      });
    }

    return html;
  }

  // ---- Columns Tab (classifications) ----
  function renderClassificationsTab(table, classifications) {
    var html = '';

    // Build column data
    var dataTypes = ['VARCHAR', 'INT', 'DECIMAL', 'TIMESTAMP', 'BOOLEAN', 'TEXT', 'BIGINT', 'DATE'];
    var syntheticNames = ['id', 'created_at', 'updated_at', 'status', 'description', 'amount', 'notes', 'region', 'type', 'metadata', 'is_active', 'version'];
    var allColumns = [];

    for (var c = 0; c < classifications.length; c++) {
      allColumns.push({
        name: classifications[c].columnName,
        dataType: 'VARCHAR',
        cls: classifications[c]
      });
    }
    var remaining = Math.min(table.columns - classifications.length, syntheticNames.length);
    for (var r = 0; r < remaining; r++) {
      allColumns.push({
        name: syntheticNames[r],
        dataType: dataTypes[r % dataTypes.length],
        cls: null
      });
    }

    html += '<table class="data-table">';
    html += '<thead><tr>';
    html += '<th>Column</th>';
    html += '<th>Data Type</th>';
    html += '<th>Classification</th>';
    html += '<th>Confidence</th>';
    html += '<th>Status</th>';
    html += '<th>Classified By</th>';
    html += '</tr></thead>';
    html += '<tbody>';

    for (var i = 0; i < allColumns.length; i++) {
      var col = allColumns[i];
      var cls = col.cls;

      html += '<tr>';
      html += '<td><code style="font-size:13px;font-weight:500;">' + col.name + '</code></td>';
      html += '<td><span style="font-size:13px;font-family:\'SF Mono\',Menlo,monospace;color:var(--sds-text-tertiary);">' + col.dataType + '</span></td>';

      if (cls) {
        html += '<td>' + categoryTag(cls.category) + ' <span style="font-size:12px;">' + cls.suggestedType + '</span></td>';
        html += '<td>' + confidenceBar(cls.confidence) + '</td>';
        html += '<td>' + classificationStatusTag(cls.status);
        if (cls.status === 'pending') {
          html += ' <a data-navigate="#/review" style="font-size:12px;color:var(--sds-text-link);cursor:pointer;">Review</a>';
        }
        html += '</td>';
        html += '<td style="font-size:13px;color:var(--sds-text-secondary);">' + (cls.reviewer || 'Auto') + '</td>';
      } else {
        html += '<td style="color:var(--sds-text-tertiary);">--</td>';
        html += '<td>--</td>';
        html += '<td>' + Components.tag('Not Sensitive', 'neutral') + '</td>';
        html += '<td>--</td>';
      }
      html += '</tr>';
    }

    html += '</tbody></table>';
    return html;
  }

  // ---- Access Tab ----
  function renderAccessTab(table) {
    var users = [
      { name: 'Jordan Chen', role: 'Data Engineer', access: 'Read/Write', grantedAt: '2023-06-15T09:00:00Z' },
      { name: 'Priya Sharma', role: 'Data Privacy Officer', access: 'Read Only', grantedAt: '2023-08-01T10:00:00Z' },
      { name: 'Marcus Williams', role: 'Security Analyst', access: 'Read Only', grantedAt: '2024-01-10T14:00:00Z' },
      { name: 'Analytics Team', role: 'Group', access: 'Masked Read', grantedAt: '2023-09-15T09:00:00Z' }
    ];

    var html = '';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">';
    html += '<div style="font-size:14px;color:var(--sds-text-secondary);">' + users.length + ' users and groups have access</div>';
    html += Components.button('Request Access', 'secondary', 'sm');
    html += '</div>';

    html += Components.dataTable({
      columns: [
        { key: 'name', label: 'User / Group', render: function(val) { return '<span style="font-weight:500;">' + val + '</span>'; }},
        { key: 'role', label: 'Role' },
        { key: 'access', label: 'Access Level', render: function(val) {
          var variant = val === 'Read/Write' ? 'warning' : val === 'Read Only' ? 'success' : 'info';
          return Components.tag(val, variant);
        }},
        { key: 'grantedAt', label: 'Granted', render: function(val) { return Data.formatDate(val); }}
      ],
      rows: users
    });

    return html;
  }

  // ---- Lineage Tab (Interactive SVG) ----
  function renderLineageTab(table) {
    // Build lineage data using real Data.tables references where possible
    var allTables = Data.tables;
    var currentConn = Data.getConnection(table.connectionId);

    // Find related tables for upstream/downstream (from same or different connections)
    var upstreamNodes = [];
    var downstreamNodes = [];

    // Synthetic upstream: raw/staging versions
    var upstreamDefs = [
      { name: 'raw_' + table.name, schema: 'raw_data', connName: table.connectionName, connId: table.connectionId, tags: [], columns: ['*'] },
      { name: table.name + '_staging', schema: 'staging', connName: table.connectionName, connId: table.connectionId, tags: table.tags || [], columns: [] }
    ];
    // Try to find a real table from a different connection as a third upstream
    for (var ui = 0; ui < allTables.length; ui++) {
      if (allTables[ui].id !== table.id && allTables[ui].connectionId !== table.connectionId && upstreamNodes.length < 1) {
        upstreamDefs.push({
          id: allTables[ui].id,
          name: allTables[ui].name,
          schema: allTables[ui].schema,
          connName: allTables[ui].connectionName,
          connId: allTables[ui].connectionId,
          tags: allTables[ui].tags || [],
          columns: []
        });
        break;
      }
    }
    upstreamNodes = upstreamDefs;

    // Synthetic downstream: agg/report/summary
    var downstreamDefs = [
      { name: table.name + '_agg', schema: 'analytics', connName: table.connectionName, connId: table.connectionId, tags: [], columns: [] },
      { name: table.name + '_report', schema: 'reports', connName: 'Redshift DWH', connId: 'conn-7', tags: [], columns: [] }
    ];
    // Find a real downstream table
    for (var di = 0; di < allTables.length; di++) {
      if (allTables[di].id !== table.id && allTables[di].connectionId === table.connectionId && allTables[di].id !== table.id && downstreamDefs.length < 3) {
        var alreadyUsed = false;
        for (var chk = 0; chk < upstreamDefs.length; chk++) {
          if (upstreamDefs[chk].id === allTables[di].id) { alreadyUsed = true; break; }
        }
        if (!alreadyUsed) {
          downstreamDefs.push({
            id: allTables[di].id,
            name: allTables[di].name,
            schema: allTables[di].schema,
            connName: allTables[di].connectionName,
            connId: allTables[di].connectionId,
            tags: allTables[di].tags || [],
            columns: []
          });
          break;
        }
      }
    }
    downstreamNodes = downstreamDefs;

    // Column-level lineage data (synthetic but realistic)
    var classificationCols = Data.getClassificationsForTable(table.id);
    var columnFlows = [];
    var sensitiveColNames = [];
    for (var cfi = 0; cfi < classificationCols.length && cfi < 3; cfi++) {
      sensitiveColNames.push(classificationCols[cfi].columnName);
      columnFlows.push({
        colName: classificationCols[cfi].columnName,
        category: classificationCols[cfi].category,
        upIdx: cfi % upstreamNodes.length,
        downIdx: cfi % downstreamNodes.length
      });
    }

    // SVG dimensions
    var svgW = 1100, svgH = 520;
    var nodeW = 220, nodeH = 80;
    var centerX = svgW / 2, centerY = svgH / 2;
    var leftX = 60, rightX = svgW - nodeW - 60;

    // Compute node positions
    var upPositions = [];
    var upSpacing = Math.min(110, (svgH - 60) / upstreamNodes.length);
    var upStartY = centerY - ((upstreamNodes.length - 1) * upSpacing) / 2 - nodeH / 2;
    for (var up = 0; up < upstreamNodes.length; up++) {
      upPositions.push({ x: leftX, y: upStartY + up * upSpacing });
    }

    var downPositions = [];
    var downSpacing = Math.min(110, (svgH - 60) / downstreamNodes.length);
    var downStartY = centerY - ((downstreamNodes.length - 1) * downSpacing) / 2 - nodeH / 2;
    for (var dp = 0; dp < downstreamNodes.length; dp++) {
      downPositions.push({ x: rightX, y: downStartY + dp * downSpacing });
    }

    var centerNodeX = centerX - nodeW / 2;
    var centerNodeY = centerY - nodeH / 2;

    var html = '';
    html += '<div style="background:var(--sds-bg-surface);border:1px solid var(--sds-border-subtle);border-radius:8px;padding:16px;overflow-x:auto;">';

    // Legend
    html += '<div style="display:flex;align-items:center;gap:16px;margin-bottom:12px;font-size:12px;color:var(--sds-text-tertiary);">';
    html += '<span style="font-weight:600;color:var(--sds-text-secondary);">Lineage</span>';
    html += '<span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:2px;background:var(--sds-interactive-primary);display:inline-block;"></span> Current table</span>';
    html += '<span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:2px;background:var(--sds-bg-subtle);border:1px solid var(--sds-border-strong);display:inline-block;"></span> Related table</span>';
    html += '<span style="display:inline-flex;align-items:center;gap:4px;"><svg width="20" height="8"><line x1="0" y1="4" x2="16" y2="4" stroke="var(--sds-status-error-strong)" stroke-width="1.5" stroke-dasharray="3,2"/><polygon points="14,1 20,4 14,7" fill="var(--sds-status-error-strong)"/></svg> Sensitive column flow</span>';
    html += '</div>';

    html += '<svg width="' + svgW + '" height="' + svgH + '" viewBox="0 0 ' + svgW + ' ' + svgH + '" xmlns="http://www.w3.org/2000/svg" style="display:block;min-width:' + svgW + 'px;">';

    // Defs: arrowhead markers
    html += '<defs>';
    html += '<marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--sds-border-strong)"/></marker>';
    html += '<marker id="arrow-sensitive" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--sds-status-error-strong)"/></marker>';
    html += '</defs>';

    // Draw connector lines from upstream to center
    for (var li = 0; li < upPositions.length; li++) {
      var fromX = upPositions[li].x + nodeW;
      var fromY = upPositions[li].y + nodeH / 2;
      var toX = centerNodeX;
      var toY = centerNodeY + nodeH / 2;
      var cpx1 = fromX + 60;
      var cpx2 = toX - 60;
      html += '<path d="M ' + fromX + ' ' + fromY + ' C ' + cpx1 + ' ' + fromY + ' ' + cpx2 + ' ' + toY + ' ' + toX + ' ' + toY + '" fill="none" stroke="var(--sds-border-strong)" stroke-width="1.5" marker-end="url(#arrow)"/>';
    }

    // Draw connector lines from center to downstream
    for (var ri = 0; ri < downPositions.length; ri++) {
      var dfromX = centerNodeX + nodeW;
      var dfromY = centerNodeY + nodeH / 2;
      var dtoX = downPositions[ri].x;
      var dtoY = downPositions[ri].y + nodeH / 2;
      var dcpx1 = dfromX + 60;
      var dcpx2 = dtoX - 60;
      html += '<path d="M ' + dfromX + ' ' + dfromY + ' C ' + dcpx1 + ' ' + dfromY + ' ' + dcpx2 + ' ' + dtoY + ' ' + dtoX + ' ' + dtoY + '" fill="none" stroke="var(--sds-border-strong)" stroke-width="1.5" marker-end="url(#arrow)"/>';
    }

    // Draw column-level lineage lines (dashed, colored)
    for (var clf = 0; clf < columnFlows.length; clf++) {
      var flow = columnFlows[clf];
      var colOffset = (clf + 1) * 12;
      // Upstream to center
      var ufx = upPositions[flow.upIdx].x + nodeW;
      var ufy = upPositions[flow.upIdx].y + nodeH / 2 + colOffset;
      var ucx = centerNodeX;
      var ucy = centerNodeY + nodeH / 2 + colOffset;
      html += '<path d="M ' + ufx + ' ' + ufy + ' C ' + (ufx + 50) + ' ' + ufy + ' ' + (ucx - 50) + ' ' + ucy + ' ' + ucx + ' ' + ucy + '" fill="none" stroke="var(--sds-status-error-strong)" stroke-width="1" stroke-dasharray="4,3" marker-end="url(#arrow-sensitive)" opacity="0.7"/>';
      // Label on the line
      var labelX = (ufx + ucx) / 2;
      var labelY = (ufy + ucy) / 2 - 6;
      html += '<text x="' + labelX + '" y="' + labelY + '" font-size="10" fill="var(--sds-status-error-text)" text-anchor="middle" font-family="\'SF Mono\',Menlo,monospace">' + flow.colName + '</text>';

      // Center to downstream
      var dcfx = centerNodeX + nodeW;
      var dcfy = centerNodeY + nodeH / 2 + colOffset;
      var ddtx = downPositions[flow.downIdx].x;
      var ddty = downPositions[flow.downIdx].y + nodeH / 2 + colOffset;
      html += '<path d="M ' + dcfx + ' ' + dcfy + ' C ' + (dcfx + 50) + ' ' + dcfy + ' ' + (ddtx - 50) + ' ' + ddty + ' ' + ddtx + ' ' + ddty + '" fill="none" stroke="var(--sds-status-error-strong)" stroke-width="1" stroke-dasharray="4,3" marker-end="url(#arrow-sensitive)" opacity="0.7"/>';
    }

    // Draw upstream nodes
    for (var un = 0; un < upstreamNodes.length; un++) {
      var uNode = upstreamNodes[un];
      var ux = upPositions[un].x, uy = upPositions[un].y;
      var clickAttr = uNode.id ? ' data-navigate="#/catalog/' + uNode.id + '" style="cursor:pointer;"' : '';
      html += '<g' + clickAttr + '>';
      html += '<rect x="' + ux + '" y="' + uy + '" width="' + nodeW + '" height="' + nodeH + '" rx="6" fill="var(--sds-bg-card)" stroke="var(--sds-border-strong)" stroke-width="1"/>';
      html += '<text x="' + (ux + 12) + '" y="' + (uy + 22) + '" font-size="12" font-weight="600" fill="var(--sds-text-primary)" font-family="\'SF Mono\',Menlo,monospace">' + uNode.name + '</text>';
      html += '<text x="' + (ux + 12) + '" y="' + (uy + 38) + '" font-size="10" fill="var(--sds-text-tertiary)">' + uNode.schema + ' &middot; ' + uNode.connName + '</text>';
      // Tags
      var uTagX = ux + 12;
      for (var utg = 0; utg < uNode.tags.length && utg < 3; utg++) {
        var tagColor = uNode.tags[utg] === 'PII' ? 'var(--sds-status-error-bg)' : uNode.tags[utg] === 'PCI' ? 'var(--sds-status-warning-bg)' : 'var(--sds-status-info-bg)';
        var tagText = uNode.tags[utg] === 'PII' ? 'var(--sds-status-error-text)' : uNode.tags[utg] === 'PCI' ? 'var(--sds-status-warning-text)' : 'var(--sds-status-info-text)';
        html += '<rect x="' + uTagX + '" y="' + (uy + 50) + '" width="30" height="16" rx="3" fill="' + tagColor + '"/>';
        html += '<text x="' + (uTagX + 15) + '" y="' + (uy + 62) + '" font-size="9" font-weight="600" fill="' + tagText + '" text-anchor="middle">' + uNode.tags[utg] + '</text>';
        uTagX += 36;
      }
      html += '</g>';
    }

    // Draw center node (highlighted)
    html += '<rect x="' + centerNodeX + '" y="' + centerNodeY + '" width="' + nodeW + '" height="' + nodeH + '" rx="6" fill="var(--sds-interactive-primary)" stroke="var(--sds-interactive-primary)" stroke-width="2"/>';
    html += '<text x="' + (centerNodeX + nodeW / 2) + '" y="' + (centerNodeY + 24) + '" font-size="13" font-weight="700" fill="white" text-anchor="middle" font-family="\'SF Mono\',Menlo,monospace">' + table.name + '</text>';
    html += '<text x="' + (centerNodeX + nodeW / 2) + '" y="' + (centerNodeY + 42) + '" font-size="10" fill="rgba(255,255,255,0.75)" text-anchor="middle">' + table.schema + ' &middot; ' + table.connectionName + '</text>';
    // Tags on center node
    var cTagX = centerNodeX + nodeW / 2 - ((table.tags ? table.tags.length : 0) * 18);
    if (table.tags) {
      for (var ctg = 0; ctg < table.tags.length; ctg++) {
        html += '<rect x="' + cTagX + '" y="' + (centerNodeY + 52) + '" width="30" height="16" rx="3" fill="rgba(255,255,255,0.2)"/>';
        html += '<text x="' + (cTagX + 15) + '" y="' + (centerNodeY + 64) + '" font-size="9" font-weight="600" fill="white" text-anchor="middle">' + table.tags[ctg] + '</text>';
        cTagX += 36;
      }
    }

    // Draw downstream nodes
    for (var dn = 0; dn < downstreamNodes.length; dn++) {
      var dNode = downstreamNodes[dn];
      var dx = downPositions[dn].x, dy = downPositions[dn].y;
      var dClickAttr = dNode.id ? ' data-navigate="#/catalog/' + dNode.id + '" style="cursor:pointer;"' : '';
      html += '<g' + dClickAttr + '>';
      html += '<rect x="' + dx + '" y="' + dy + '" width="' + nodeW + '" height="' + nodeH + '" rx="6" fill="var(--sds-bg-card)" stroke="var(--sds-border-strong)" stroke-width="1"/>';
      html += '<text x="' + (dx + 12) + '" y="' + (dy + 22) + '" font-size="12" font-weight="600" fill="var(--sds-text-primary)" font-family="\'SF Mono\',Menlo,monospace">' + dNode.name + '</text>';
      html += '<text x="' + (dx + 12) + '" y="' + (dy + 38) + '" font-size="10" fill="var(--sds-text-tertiary)">' + dNode.schema + ' &middot; ' + dNode.connName + '</text>';
      // Tags
      var dTagX = dx + 12;
      for (var dtg = 0; dtg < dNode.tags.length && dtg < 3; dtg++) {
        var dTagColor = dNode.tags[dtg] === 'PII' ? 'var(--sds-status-error-bg)' : dNode.tags[dtg] === 'PCI' ? 'var(--sds-status-warning-bg)' : 'var(--sds-status-info-bg)';
        var dTagTextCol = dNode.tags[dtg] === 'PII' ? 'var(--sds-status-error-text)' : dNode.tags[dtg] === 'PCI' ? 'var(--sds-status-warning-text)' : 'var(--sds-status-info-text)';
        html += '<rect x="' + dTagX + '" y="' + (dy + 50) + '" width="30" height="16" rx="3" fill="' + dTagColor + '"/>';
        html += '<text x="' + (dTagX + 15) + '" y="' + (dy + 62) + '" font-size="9" font-weight="600" fill="' + dTagTextCol + '" text-anchor="middle">' + dNode.tags[dtg] + '</text>';
        dTagX += 36;
      }
      html += '</g>';
    }

    // Column labels at upstream labels area
    html += '<text x="' + (leftX + nodeW / 2) + '" y="20" font-size="11" font-weight="600" fill="var(--sds-text-tertiary)" text-anchor="middle" letter-spacing="0.5">UPSTREAM</text>';
    html += '<text x="' + (centerX) + '" y="20" font-size="11" font-weight="600" fill="var(--sds-text-tertiary)" text-anchor="middle" letter-spacing="0.5">CURRENT</text>';
    html += '<text x="' + (rightX + nodeW / 2) + '" y="20" font-size="11" font-weight="600" fill="var(--sds-text-tertiary)" text-anchor="middle" letter-spacing="0.5">DOWNSTREAM</text>';

    html += '</svg>';
    html += '</div>';

    // Column-level lineage detail table
    if (columnFlows.length > 0) {
      html += '<div style="margin-top:20px;">';
      html += Components.card({
        title: 'Sensitive Column Lineage',
        body: (function() {
          var b = '<table class="data-table"><thead><tr><th>Column</th><th>Category</th><th>Upstream Source</th><th>Downstream Target</th></tr></thead><tbody>';
          for (var cf = 0; cf < columnFlows.length; cf++) {
            var fl = columnFlows[cf];
            b += '<tr>';
            b += '<td><code style="font-size:13px;font-weight:500;">' + fl.colName + '</code></td>';
            b += '<td>' + categoryTag(fl.category) + '</td>';
            b += '<td style="font-size:13px;font-family:\'SF Mono\',Menlo,monospace;color:var(--sds-text-secondary);">' + upstreamNodes[fl.upIdx].schema + '.' + upstreamNodes[fl.upIdx].name + '</td>';
            b += '<td style="font-size:13px;font-family:\'SF Mono\',Menlo,monospace;color:var(--sds-text-secondary);">' + downstreamNodes[fl.downIdx].schema + '.' + downstreamNodes[fl.downIdx].name + '</td>';
            b += '</tr>';
          }
          b += '</tbody></table>';
          return b;
        })(),
        bordered: true
      });
      html += '</div>';
    }

    return html;
  }

  // ---- Activity Tab ----
  function renderHistoryTab(table, classifications) {
    var history = [
      { date: '2024-03-12T15:00:00Z', user: 'Jordan Chen', action: 'Approved', column: 'email', previous: 'Pending', newVal: 'Confirmed (PII)' },
      { date: '2024-03-12T15:00:00Z', user: 'Jordan Chen', action: 'Approved', column: 'phone_number', previous: 'Pending', newVal: 'Confirmed (PII)' },
      { date: '2024-03-12T14:30:00Z', user: 'System', action: 'Auto-classified', column: 'ssn', previous: '--', newVal: 'Pending (PII, 99%)' },
      { date: '2024-03-12T14:30:00Z', user: 'System', action: 'Scan completed', column: '--', previous: '--', newVal: table.columns + ' columns discovered' },
      { date: '2024-03-10T09:15:00Z', user: 'System', action: 'Scan started', column: '--', previous: '--', newVal: '--' }
    ];

    return Components.dataTable({
      columns: [
        { key: 'date', label: 'Date', render: function(val) { return '<span style="white-space:nowrap;">' + Data.formatDateTime(val) + '</span>'; }},
        { key: 'user', label: 'User', render: function(val) { return '<span style="font-weight:500;">' + val + '</span>'; }},
        { key: 'action', label: 'Action', render: function(val) {
          var variant = val === 'Approved' ? 'success' : val === 'Auto-classified' ? 'info' : 'neutral';
          return Components.tag(val, variant);
        }},
        { key: 'column', label: 'Column', render: function(val) {
          if (val === '--') return '<span style="color:var(--sds-text-tertiary);">--</span>';
          return '<code style="font-size:13px;">' + val + '</code>';
        }},
        { key: 'previous', label: 'Previous' },
        { key: 'newVal', label: 'New Value' }
      ],
      rows: history
    });
  }

  // ---- Register Routes ----

  Router.register('/scans', renderScansList);
  Router.register('/scans/:id', renderScanProgress);
  Router.register('/scans/:id/summary', renderScanSummary);
  Router.register('/review', renderReviewQueue);
  Router.register('/review/table/:id', renderTableReview);
  Router.register('/review/rules', renderRulesList);
  Router.register('/review/rules/create', renderCreateRule);
  Router.register('/review/rules/:id', renderRuleDetail);
  Router.register('/catalog', renderDataCatalog);
  Router.register('/catalog/:id', renderTableDetail);

})();
