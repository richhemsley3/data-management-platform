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

  function renderDataCatalog() {
    var tables = Data.tables;

    var html = '';
    html += Components.pageHeader(
      'Data Catalog',
      tables.length + ' tables across ' + Data.connections.length + ' connections',
      Components.button(Icons.render('download', 14) + ' Export', 'secondary', 'md')
    );

    // Filter bar
    html += Components.filterBar([
      { name: 'connection', options: [
        { value: '', label: 'All Connections' },
        { value: 'conn-1', label: 'Snowflake Production' },
        { value: 'conn-2', label: 'AWS S3 Data Lake' },
        { value: 'conn-3', label: 'BigQuery Analytics' },
        { value: 'conn-4', label: 'Databricks ML Workspace' }
      ]},
      { name: 'sensitivity', options: [
        { value: '', label: 'All Sensitivity' },
        { value: 'critical', label: 'Critical' },
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' }
      ]},
      { name: 'status', options: [
        { value: '', label: 'All Status' },
        { value: 'full', label: 'Fully Classified' },
        { value: 'partial', label: 'Partially Classified' },
        { value: 'unreviewed', label: 'Unreviewed' }
      ]}
    ], 'Search tables...');

    html += Components.dataTable({
      columns: [
        { key: 'schema', label: 'Schema' },
        { key: 'name', label: 'Table', render: function(val, row) {
          return '<a data-navigate="#/catalog/' + row.id + '" style="font-weight:500;color:var(--sds-text-primary,#2C2924);cursor:pointer;">' + val + '</a>';
        }},
        { key: 'connectionName', label: 'Connection', render: function(val) {
          return '<span style="font-size:13px;color:var(--sds-text-secondary,#54514D);">' + val + '</span>';
        }},
        { key: 'columns', label: 'Columns', align: 'right' },
        { key: 'classifiedPct', label: 'Classified', render: function(val) {
          var color;
          if (val === 100) color = 'var(--sds-status-success-strong)';
          else if (val > 0) color = 'var(--sds-status-warning-strong)';
          else color = 'var(--sds-text-disabled)';
          var barHtml = '<div style="display:flex;align-items:center;gap:8px;">';
          barHtml += '<div style="width:40px;height:4px;border-radius:2px;background:var(--sds-bg-subtle);">';
          barHtml += '<div style="width:' + val + '%;height:100%;border-radius:2px;background:' + color + ';"></div>';
          barHtml += '</div>';
          barHtml += '<span style="font-size:12px;color:var(--sds-text-secondary,#54514D);">' + val + '%</span>';
          barHtml += '</div>';
          return barHtml;
        }},
        { key: 'sensitivity', label: 'Sensitivity', render: function(val) {
          return Components.sensitivityTag(val);
        }},
        { key: 'tags', label: 'Tags', render: function(val) {
          if (!val || val.length === 0) return '--';
          var t = '';
          for (var i = 0; i < val.length; i++) {
            t += categoryTag(val[i]) + ' ';
          }
          return t;
        }},
        { key: 'lastScanned', label: 'Last Scanned', render: function(val) {
          return '<span style="font-size:13px;color:var(--sds-text-tertiary,#7A756B);">' + Data.timeAgo(val) + '</span>';
        }}
      ],
      rows: tables,
      onRowClick: '#/catalog/:id'
    });

    // Pagination
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;font-size:13px;color:var(--sds-text-secondary,#54514D);">';
    html += '<span>Showing 1-' + tables.length + ' of ' + tables.length + '</span>';
    html += '<div style="display:flex;gap:4px;">';
    html += '<button class="btn btn-sm" style="background:var(--sds-interactive-primary,#013D5B);color:white;min-width:32px;">1</button>';
    html += '</div>';
    html += '</div>';

    var content = document.getElementById('content');
    content.innerHTML = html;

    // Delegated input handler for filter bar search
    content.oninput = function(e) {
      if (e.target.closest('.filter-bar input[type="text"]')) {
        var query = e.target.value.toLowerCase();
        var filtered = Data.tables.filter(function(t) {
          return t.name.toLowerCase().indexOf(query) > -1;
        });
        var tableBody = content.querySelector('.data-table tbody');
        if (tableBody) {
          if (filtered.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--sds-text-tertiary);">No tables match your search</td></tr>';
          } else {
            tableBody.innerHTML = filtered.map(function(t) {
              var row = '<tr data-navigate="#/catalog/' + t.id + '" role="link" tabindex="0">';
              row += '<td>' + (t.schema || '--') + '</td>';
              row += '<td><a data-navigate="#/catalog/' + t.id + '" style="font-weight:500;color:var(--sds-text-primary,#2C2924);cursor:pointer;">' + t.name + '</a></td>';
              row += '<td><span style="font-size:13px;color:var(--sds-text-secondary,#54514D);">' + (t.connectionName || '--') + '</span></td>';
              row += '<td style="text-align:right;">' + (t.columns || '--') + '</td>';
              var clsPct = t.classifiedPct || 0;
              var color;
              if (clsPct === 100) color = 'var(--sds-status-success-strong)';
              else if (clsPct > 0) color = 'var(--sds-status-warning-strong)';
              else color = 'var(--sds-text-disabled)';
              var barHtml = '<div style="display:flex;align-items:center;gap:8px;">';
              barHtml += '<div style="width:40px;height:4px;border-radius:2px;background:var(--sds-bg-subtle);">';
              barHtml += '<div style="width:' + clsPct + '%;height:100%;border-radius:2px;background:' + color + ';"></div>';
              barHtml += '</div>';
              barHtml += '<span style="font-size:12px;color:var(--sds-text-secondary,#54514D);">' + clsPct + '%</span>';
              barHtml += '</div>';
              row += '<td>' + barHtml + '</td>';
              row += '<td>' + Components.sensitivityTag(t.sensitivity) + '</td>';
              var tagsHtml = '--';
              if (t.tags && t.tags.length > 0) {
                tagsHtml = '';
                for (var i = 0; i < t.tags.length; i++) {
                  tagsHtml += categoryTag(t.tags[i]) + ' ';
                }
              }
              row += '<td>' + tagsHtml + '</td>';
              row += '<td><span style="font-size:13px;color:var(--sds-text-tertiary,#7A756B);">' + Data.timeAgo(t.lastScanned) + '</span></td>';
              row += '</tr>';
              return row;
            }).join('');
          }
        }
      }
    };
  }

  // ---- 10. Table Detail (/catalog/:id) ----

  function renderTableDetail(params) {
    var table = Data.getTable(params.id);
    if (!table) {
      document.getElementById('content').innerHTML = '<div class="coming-soon"><h2>Table not found</h2></div>';
      return;
    }

    var classifications = Data.getClassificationsForTable(params.id);
    var activeTab = State.get('tableDetailTab') || 'classifications';

    var html = '';
    html += Components.breadcrumb([
      { label: 'Data Catalog', href: '#/catalog' },
      { label: table.schema + '.' + table.name }
    ]);

    // Tags
    var tagsHtml = '';
    if (table.tags) {
      for (var tg = 0; tg < table.tags.length; tg++) {
        tagsHtml += categoryTag(table.tags[tg]) + ' ';
      }
    }
    tagsHtml += Components.sensitivityTag(table.sensitivity);

    html += Components.pageHeader(
      '<span style="font-family:monospace;">' + table.schema + '.' + table.name + '</span>',
      table.connectionName + ' &mdash; ' + table.columns + ' columns &mdash; ' + Data.formatNumber(table.rowCount) + ' rows'
    );
    html += '<div style="margin:-12px 0 20px 0;">' + tagsHtml + '</div>';

    // Action buttons
    html += '<div style="display:flex;gap:12px;margin-bottom:24px;">';
    if (table.sensitivity === 'critical' || table.sensitivity === 'high') {
      html += Components.button('Remediate', 'primary', 'md');
    }
    html += Components.button('Re-scan Table', 'secondary', 'md');
    html += Components.button('Review in Queue', 'secondary', 'md', 'data-navigate="#/review"');
    html += '</div>';

    // Tabs
    html += Components.tabs([
      { id: 'classifications', label: 'Classifications', badge: classifications.length },
      { id: 'access', label: 'Access' },
      { id: 'lineage', label: 'Lineage' },
      { id: 'history', label: 'History' }
    ], activeTab);

    html += '<div style="margin-top:24px;" id="table-detail-tab-content">';

    if (activeTab === 'classifications') {
      html += renderClassificationsTab(table, classifications);
    } else if (activeTab === 'access') {
      html += renderAccessTab(table);
    } else if (activeTab === 'lineage') {
      html += renderLineageTab(table);
    } else if (activeTab === 'history') {
      html += renderHistoryTab(table, classifications);
    }

    html += '</div>';

    var content = document.getElementById('content');
    content.innerHTML = html;

    // Delegated click handler for table detail actions
    content.onclick = function(e) {
      var tab = e.target.closest('.sds-tab');
      if (tab) {
        var tabId = tab.getAttribute('data-tab');
        State.set('tableDetailTab', tabId);
        renderTableDetail(params);
      }
    };
  }

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
      html += '<td><span style="font-size:13px;font-family:monospace;color:var(--sds-text-tertiary,#7A756B);">' + col.dataType + '</span></td>';

      if (cls) {
        html += '<td>' + categoryTag(cls.category) + ' <span style="font-size:12px;">' + cls.suggestedType + '</span></td>';
        html += '<td>' + confidenceBar(cls.confidence) + '</td>';
        html += '<td>' + classificationStatusTag(cls.status);
        if (cls.status === 'pending') {
          html += ' <a data-navigate="#/review" style="font-size:12px;color:var(--sds-text-link,#013D5B);cursor:pointer;">Review</a>';
        }
        html += '</td>';
        html += '<td style="font-size:13px;color:var(--sds-text-secondary,#54514D);">' + (cls.reviewer || 'Auto') + '</td>';
      } else {
        html += '<td style="color:var(--sds-text-tertiary,#7A756B);">--</td>';
        html += '<td>--</td>';
        html += '<td>' + Components.tag('Not Sensitive', 'neutral') + '</td>';
        html += '<td>--</td>';
      }
      html += '</tr>';
    }

    html += '</tbody></table>';
    return html;
  }

  function renderAccessTab(table) {
    var users = [
      { name: 'Jordan Chen', role: 'Data Engineer', access: 'Read/Write', grantedAt: '2023-06-15T09:00:00Z' },
      { name: 'Priya Sharma', role: 'Data Privacy Officer', access: 'Read Only', grantedAt: '2023-08-01T10:00:00Z' },
      { name: 'Marcus Williams', role: 'Security Analyst', access: 'Read Only', grantedAt: '2024-01-10T14:00:00Z' },
      { name: 'Analytics Team', role: 'Group', access: 'Masked Read', grantedAt: '2023-09-15T09:00:00Z' }
    ];

    return Components.dataTable({
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
  }

  function renderLineageTab(table) {
    var html = '';
    html += '<div style="padding:40px;text-align:center;">';
    html += '<div style="display:flex;align-items:center;justify-content:center;gap:32px;margin-bottom:24px;">';

    // Simple lineage diagram
    var upstream = ['raw_data.' + table.name, 'staging.' + table.name + '_staging'];
    var downstream = ['analytics.' + table.name + '_agg', 'reports.' + table.name + '_summary'];

    html += '<div style="text-align:right;">';
    html += '<div style="font-size:12px;font-weight:600;color:var(--sds-text-secondary,#54514D);margin-bottom:8px;">UPSTREAM</div>';
    for (var u = 0; u < upstream.length; u++) {
      html += '<div style="padding:8px 16px;background:var(--sds-bg-subtle,#F4F1EB);border-radius:6px;margin-bottom:4px;font-size:13px;font-family:monospace;">' + upstream[u] + '</div>';
    }
    html += '</div>';

    html += '<div style="font-size:24px;color:var(--sds-text-tertiary,#7A756B);">&rarr;</div>';

    html += '<div style="padding:12px 20px;background:var(--sds-interactive-primary,#013D5B);color:white;border-radius:8px;font-size:14px;font-weight:500;font-family:monospace;">';
    html += table.schema + '.' + table.name;
    html += '</div>';

    html += '<div style="font-size:24px;color:var(--sds-text-tertiary,#7A756B);">&rarr;</div>';

    html += '<div style="text-align:left;">';
    html += '<div style="font-size:12px;font-weight:600;color:var(--sds-text-secondary,#54514D);margin-bottom:8px;">DOWNSTREAM</div>';
    for (var d = 0; d < downstream.length; d++) {
      html += '<div style="padding:8px 16px;background:var(--sds-bg-subtle,#F4F1EB);border-radius:6px;margin-bottom:4px;font-size:13px;font-family:monospace;">' + downstream[d] + '</div>';
    }
    html += '</div>';

    html += '</div>';
    html += '</div>';
    return html;
  }

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
        { key: 'date', label: 'Date', render: function(val) { return Data.formatDateTime(val); }},
        { key: 'user', label: 'User' },
        { key: 'action', label: 'Action', render: function(val) {
          var variant = val === 'Approved' ? 'success' : val === 'Auto-classified' ? 'info' : 'neutral';
          return Components.tag(val, variant);
        }},
        { key: 'column', label: 'Column', render: function(val) {
          if (val === '--') return '--';
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
