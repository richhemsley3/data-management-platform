/* ============================================================
   Flow 6 — Reports & Universal Search
   Routes: /reports
   Global: Cmd+K / Ctrl+K search overlay
   ============================================================ */

(function() {

  // ---- Mock Report Data (dates shifted relative to today) ----
  var _rptBaseDate = new Date('2024-03-14T00:00:00Z');
  var _rptNow = new Date();
  var _rptOffset = _rptNow.getTime() - _rptBaseDate.getTime();

  function _shiftDate(isoStr) {
    var d = new Date(new Date(isoStr).getTime() + _rptOffset);
    return d.toISOString();
  }

  function _monthYear(isoStr) {
    var d = new Date(isoStr);
    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return months[d.getMonth()] + ' ' + d.getFullYear();
  }

  var _rpt1Date = _shiftDate('2024-03-13T09:00:00Z');
  var _rpt3Date = _shiftDate('2024-02-28T09:00:00Z');

  var reports = [
    { id: 'rpt-1', name: 'Executive Summary — ' + _monthYear(_rpt1Date), type: 'Executive Summary', date: _rpt1Date, format: 'PDF', size: '2.4 MB' },
    { id: 'rpt-2', name: 'HIPAA Compliance Audit Q1', type: 'Compliance Audit', date: _shiftDate('2024-03-10T14:00:00Z'), format: 'PDF', size: '5.1 MB' },
    { id: 'rpt-3', name: 'Risk Trend — ' + _monthYear(_rpt3Date), type: 'Risk Trend', date: _rpt3Date, format: 'CSV', size: '890 KB' },
    { id: 'rpt-4', name: 'PCI DSS Compliance Status', type: 'Compliance Audit', date: _shiftDate('2024-03-08T16:00:00Z'), format: 'PDF', size: '3.7 MB' }
  ];

  var schedules = [
    { id: 'sch-1', name: 'Weekly Executive Summary', template: 'Executive Summary', frequency: 'Weekly', day: 'Monday', time: '9:00 AM', recipients: 'marcus@acme.com, board@acme.com', nextRun: _shiftDate('2024-03-18T09:00:00Z'), status: 'active' },
    { id: 'sch-2', name: 'Monthly HIPAA Audit', template: 'Compliance Audit', frequency: 'Monthly', day: '1st', time: '8:00 AM', recipients: 'priya@acme.com, compliance@acme.com', nextRun: _shiftDate('2024-04-01T08:00:00Z'), status: 'active' }
  ];

  var reportTemplates = [
    { id: 'tmpl-1', name: 'Executive Summary', description: 'High-level risk posture, compliance status, and key metrics for leadership review.', icon: 'chart' },
    { id: 'tmpl-2', name: 'Compliance Audit', description: 'Detailed compliance assessment against selected regulations with gap analysis.', icon: 'shield' },
    { id: 'tmpl-3', name: 'Risk Trend', description: 'Risk score trends over time with contributing factors and remediation progress.', icon: 'scan' },
    { id: 'tmpl-4', name: 'Custom', description: 'Build a custom report by selecting specific data sources, metrics, and date ranges.', icon: 'settings' }
  ];

  // ---- Reports Page ----
  function renderReports() {
    var content = document.getElementById('content');
    if (!content) return;

    var activeTab = State.get('reportsTab') || 'generated';

    var actions = Components.button(Icons.render('plus', 14) + ' Generate Report', 'primary', 'md', 'data-action="generate-report"') +
      ' ' + Components.button(Icons.render('clock', 14) + ' Schedule Report', 'secondary', 'md', 'data-action="schedule-report"');

    var html = Components.pageHeader('Reports', 'Generate, schedule, and manage risk and compliance reports', actions);

    // Tabs
    html += Components.tabs([
      { id: 'generated', label: 'Generated', badge: reports.length },
      { id: 'scheduled', label: 'Scheduled', badge: schedules.length },
      { id: 'templates', label: 'Templates' }
    ], activeTab);

    // Tab content
    html += '<div class="tab-content" style="margin-top:20px;">';

    if (activeTab === 'generated') {
      html += renderGeneratedTab();
    } else if (activeTab === 'scheduled') {
      html += renderScheduledTab();
    } else if (activeTab === 'templates') {
      html += renderTemplatesTab();
    }

    html += '</div>';
    content.innerHTML = html;

    // Click handler for tabs, action buttons, and template selection
    content.onclick = function(e) {
      var tab = e.target.closest('.sds-tab');
      if (tab) {
        var tabId = tab.getAttribute('data-tab');
        if (tabId) {
          State.set('reportsTab', tabId);
          renderReports();
        }
        return;
      }

      var tmplBtn = e.target.closest('[data-action="use-template"]');
      if (tmplBtn) {
        var templateName = tmplBtn.getAttribute('data-template');
        openGenerateModal(templateName);
        return;
      }

      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      var action = btn.getAttribute('data-action');
      if (action === 'generate-report') {
        openGenerateModal();
      } else if (action === 'schedule-report') {
        openScheduleModal();
      }
    };
  }

  // ---- Generated Tab ----
  function renderGeneratedTab() {
    return Components.card({
      body: Components.dataTable({
        columns: [
          { key: 'name', label: 'Report Name', render: function(val) {
            return '<span style="font-weight:500;color:var(--sds-text-primary);">' + val + '</span>';
          }},
          { key: 'type', label: 'Type' },
          { key: 'date', label: 'Generated', render: function(val) {
            return Data.formatDateTime(val);
          }},
          { key: 'format', label: 'Format', render: function(val) {
            var variant = val === 'PDF' ? 'info' : 'neutral';
            return Components.tag(val, variant);
          }},
          { key: 'size', label: 'Size' },
          { key: 'id', label: '', align: 'right', render: function(val) {
            return '<button class="btn btn-tertiary btn-sm" title="Download">' + Icons.render('download', 16) + ' Download</button>';
          }}
        ],
        rows: reports
      })
    });
  }

  // ---- Scheduled Tab ----
  function renderScheduledTab() {
    return Components.card({
      body: Components.dataTable({
        columns: [
          { key: 'name', label: 'Report Name', render: function(val) {
            return '<span style="font-weight:500;color:var(--sds-text-primary);">' + val + '</span>';
          }},
          { key: 'frequency', label: 'Frequency', render: function(val) {
            var variant = val === 'Weekly' ? 'info' : val === 'Monthly' ? 'warning' : 'neutral';
            return Components.tag(val, variant);
          }},
          { key: 'nextRun', label: 'Next Run', render: function(val) {
            return Data.formatDateTime(val);
          }},
          { key: 'recipients', label: 'Recipients', render: function(val) {
            var emails = val.split(', ');
            var html = '';
            for (var i = 0; i < emails.length; i++) {
              html += '<span style="display:inline-block;background:var(--sds-interactive-primary-subtle,#D9EBED);color:var(--sds-interactive-primary,#013D5B);font-size:12px;font-weight:500;padding:2px 8px;border-radius:4px;margin:1px 4px 1px 0;">' + emails[i] + '</span>';
            }
            return html;
          }},
          { key: 'status', label: 'Status', render: function(val) {
            return Components.statusTag(val);
          }},
          { key: 'id', label: '', align: 'right', render: function(val, row) {
            return Components.iconButton('more-vertical', 'title="Actions"');
          }}
        ],
        rows: schedules
      })
    });
  }

  // ---- Templates Tab ----
  function renderTemplatesTab() {
    var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;">';

    for (var i = 0; i < reportTemplates.length; i++) {
      var tmpl = reportTemplates[i];
      html += '<div class="sds-card" style="cursor:pointer;" data-action="use-template" data-template="' + tmpl.name + '">';
      html += '<div class="sds-card-body" style="padding:24px;">';
      html += '<div style="margin-bottom:12px;color:var(--sds-text-tertiary);">' + Icons.render(tmpl.icon, 28) + '</div>';
      html += '<div style="font-size:16px;font-weight:600;color:var(--sds-text-primary);margin-bottom:8px;">' + tmpl.name + '</div>';
      html += '<div style="font-size:13px;color:var(--sds-text-secondary);line-height:1.5;">' + tmpl.description + '</div>';
      html += '<div style="margin-top:16px;">' + Components.button('Use Template', 'secondary', 'sm', 'data-action="use-template" data-template="' + tmpl.name + '"') + '</div>';
      html += '</div></div>';
    }

    html += '</div>';

    // Template click handler is now handled by the combined content.onclick in renderReports

    return html;
  }

  // ---- Generate Report Modal ----
  function openGenerateModal(preselectedTemplate) {
    var overlay = document.getElementById('overlay-container');
    if (!overlay) return;

    var templateOptions = [
      { value: '', label: 'Select a template...' },
      { value: 'Executive Summary', label: 'Executive Summary' },
      { value: 'Compliance Audit', label: 'Compliance Audit' },
      { value: 'Risk Trend', label: 'Risk Trend' },
      { value: 'Custom', label: 'Custom' }
    ];

    var connectionOptions = [
      { value: 'all', label: 'All Connections' }
    ];
    for (var i = 0; i < Data.connections.length; i++) {
      connectionOptions.push({ value: Data.connections[i].id, label: Data.connections[i].name });
    }

    var body = '';
    body += Components.formGroup('Template', Components.formSelect('template', templateOptions, preselectedTemplate || ''));
    var _today = new Date();
    var _dateTo = _today.toISOString().slice(0, 10);
    var _dateFrom = new Date(_today.getTime() - 42 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    body += Components.formGroup('Date Range',
      '<div style="display:flex;gap:8px;align-items:center;">' +
        Components.formInput('date-from', _dateFrom, '', 'date') +
        '<span style="color:var(--sds-text-tertiary);">to</span>' +
        Components.formInput('date-to', _dateTo, '', 'date') +
      '</div>'
    );
    body += Components.formGroup('Format',
      '<div style="display:flex;gap:16px;">' +
        '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:14px;"><input type="radio" name="format" value="PDF" checked> PDF</label>' +
        '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:14px;"><input type="radio" name="format" value="CSV"> CSV</label>' +
      '</div>'
    );
    body += Components.formGroup('Connection Scope', Components.formSelect('scope', connectionOptions, 'all'));

    var footer = Components.button('Cancel', 'secondary', 'md', 'data-modal-close') + ' ' +
      Components.button('Generate Report', 'primary', 'md', 'data-action="confirm-generate"');

    overlay.innerHTML = Components.modal('Generate Report', body, footer);

    // Generate confirm handler
    overlay.addEventListener('click', function(e) {
      if (e.target.closest('[data-action="confirm-generate"]')) {
        overlay.innerHTML = '';
        // Show success banner
        var content = document.getElementById('content');
        if (content) {
          var banner = document.createElement('div');
          banner.className = 'alert-ribbon alert-ribbon--success';
          banner.style.cssText = 'position:relative;top:auto;left:auto;right:auto;margin-bottom:16px;border-radius:8px;';
          banner.innerHTML = '<div class="alert-ribbon-content">\u2713 Report generated successfully</div><button class="alert-ribbon-dismiss" onclick="this.parentElement.remove()">\u2715</button>';
          content.insertBefore(banner, content.firstChild);
        }
      }
    });
  }

  // ---- Schedule Report Modal ----
  function openScheduleModal() {
    var overlay = document.getElementById('overlay-container');
    if (!overlay) return;

    var templateOptions = [
      { value: 'Executive Summary', label: 'Executive Summary' },
      { value: 'Compliance Audit', label: 'Compliance Audit' },
      { value: 'Risk Trend', label: 'Risk Trend' },
      { value: 'Custom', label: 'Custom' }
    ];

    var dayOptions = [
      { value: 'Monday', label: 'Monday' },
      { value: 'Tuesday', label: 'Tuesday' },
      { value: 'Wednesday', label: 'Wednesday' },
      { value: 'Thursday', label: 'Thursday' },
      { value: 'Friday', label: 'Friday' },
      { value: 'Saturday', label: 'Saturday' },
      { value: 'Sunday', label: 'Sunday' }
    ];

    var timeOptions = [];
    for (var h = 6; h <= 18; h++) {
      var hour = h > 12 ? h - 12 : h;
      var ampm = h >= 12 ? 'PM' : 'AM';
      timeOptions.push({ value: h + ':00', label: hour + ':00 ' + ampm });
      timeOptions.push({ value: h + ':30', label: hour + ':30 ' + ampm });
    }

    var body = '';
    body += Components.formGroup('Report Name', Components.formInput('report-name', '', 'e.g., Weekly GDPR Compliance Report'));

    body += Components.formGroup('Template', Components.formSelect('template', templateOptions, 'Executive Summary'));

    body += Components.formGroup('Frequency',
      '<div style="display:flex;gap:16px;">' +
        '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:14px;"><input type="radio" name="frequency" value="daily"> Daily</label>' +
        '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:14px;"><input type="radio" name="frequency" value="weekly" checked> Weekly</label>' +
        '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:14px;"><input type="radio" name="frequency" value="monthly"> Monthly</label>' +
      '</div>'
    );

    body += Components.formGroup('Day & Time',
      '<div style="display:flex;gap:8px;align-items:center;">' +
        Components.formSelect('day', dayOptions, 'Monday') +
        '<span style="color:var(--sds-text-tertiary);">at</span>' +
        Components.formSelect('time', timeOptions, '9:00') +
      '</div>'
    );

    body += Components.formGroup('Recipients',
      '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;">' +
        '<span style="display:inline-flex;align-items:center;gap:4px;background:var(--sds-interactive-primary-subtle,#D9EBED);color:var(--sds-interactive-primary,#013D5B);font-size:13px;font-weight:500;padding:4px 8px;border-radius:4px;">priya@acme.com <span style="cursor:pointer;opacity:0.7;">&times;</span></span>' +
        '<span style="display:inline-flex;align-items:center;gap:4px;background:var(--sds-interactive-primary-subtle,#D9EBED);color:var(--sds-interactive-primary,#013D5B);font-size:13px;font-weight:500;padding:4px 8px;border-radius:4px;">marcus@acme.com <span style="cursor:pointer;opacity:0.7;">&times;</span></span>' +
      '</div>' +
      Components.formInput('add-recipient', '', 'Add recipient email...')
    );

    body += Components.formGroup('Format',
      '<div style="display:flex;gap:16px;">' +
        '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:14px;"><input type="radio" name="sched-format" value="PDF" checked> PDF</label>' +
        '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:14px;"><input type="radio" name="sched-format" value="CSV"> CSV</label>' +
      '</div>'
    );

    // Next 3 scheduled dates preview (computed dynamically)
    var _schedNow = new Date();
    // Find next Monday from today
    var _nextMon = new Date(_schedNow);
    var _dow = _nextMon.getDay(); // 0=Sun
    var _daysUntilMon = (1 - _dow + 7) % 7;
    if (_daysUntilMon === 0) _daysUntilMon = 7; // if today is Monday, next Monday
    _nextMon.setDate(_nextMon.getDate() + _daysUntilMon);

    var _schedDays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    var _schedMonths = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    body += '<div style="background:var(--sds-bg-subtle,#F4F1EB);border-radius:6px;padding:12px 16px;margin-top:4px;">';
    body += '<div style="font-size:12px;font-weight:600;color:var(--sds-text-tertiary);text-transform:uppercase;letter-spacing:0.4px;margin-bottom:8px;">Next 3 scheduled dates</div>';
    body += '<div style="font-size:13px;color:var(--sds-text-secondary);line-height:1.8;">';
    for (var _si = 0; _si < 3; _si++) {
      var _sd = new Date(_nextMon);
      _sd.setDate(_sd.getDate() + _si * 7);
      body += (_si + 1) + '. ' + _schedDays[_sd.getDay()] + ', ' + _schedMonths[_sd.getMonth()] + ' ' + _sd.getDate() + ', ' + _sd.getFullYear() + ' at 9:00 AM';
      if (_si < 2) body += '<br>';
    }
    body += '</div></div>';

    var footer = Components.button('Cancel', 'secondary', 'md', 'data-modal-close') + ' ' +
      Components.button('Save Schedule', 'primary', 'md', 'data-action="confirm-schedule"');

    // Render modal using Components.modal() for proper a11y attributes
    var modalHtml = Components.modal('Schedule Report', body, footer);
    // Widen the modal for the schedule form
    modalHtml = modalHtml.replace('<div class="modal" role="dialog"', '<div class="modal" role="dialog" style="max-width:640px;"');

    overlay.innerHTML = modalHtml;

    // Confirm handler
    overlay.addEventListener('click', function(e) {
      if (e.target.closest('[data-action="confirm-schedule"]')) {
        overlay.innerHTML = '';
        // Show success banner
        var content = document.getElementById('content');
        if (content) {
          var banner = document.createElement('div');
          banner.className = 'alert-ribbon alert-ribbon--success';
          banner.style.cssText = 'position:relative;top:auto;left:auto;right:auto;margin-bottom:16px;border-radius:8px;';
          banner.innerHTML = '<div class="alert-ribbon-content">\u2713 Schedule saved successfully</div><button class="alert-ribbon-dismiss" onclick="this.parentElement.remove()">\u2715</button>';
          content.insertBefore(banner, content.firstChild);
        }
      }
    });
  }

  // ---- Universal Search ----
  var searchHasOpened = false;
  var recentSearches = ['snowflake', 'users.ssn', 'GDPR'];
  var suggestedSearches = ['Unprotected PII columns', 'Failed connections', 'Pending classifications'];

  function openSearch() {
    var overlay = document.getElementById('overlay-container');
    if (!overlay) return;

    var html = '<div class="search-overlay-backdrop" style="position:fixed;top:0;left:0;right:0;bottom:0;background:var(--sds-bg-overlay, rgba(0,0,0,0.4));z-index:900;display:flex;justify-content:center;padding-top:15vh;" data-search-backdrop>';
    html += '<div class="search-panel" style="width:600px;max-height:70vh;background:var(--sds-bg-elevated,#fff);border:1px solid var(--sds-border-default,#E0DCD3);border-radius:12px;box-shadow:0 16px 48px rgba(0,0,0,0.2),0 4px 16px rgba(0,0,0,0.1);display:flex;flex-direction:column;overflow:hidden;align-self:flex-start;">';

    // Search input area
    html += '<div style="padding:16px 20px;border-bottom:1px solid var(--sds-border-subtle,#E0DCD3);display:flex;align-items:center;gap:10px;">';
    html += '<span style="color:var(--sds-text-tertiary,#948E85);flex-shrink:0;">' + Icons.render('search', 18) + '</span>';
    html += '<input type="text" id="universal-search-input" placeholder="Search connections, tables, policies..." style="flex:1;border:none;outline:none;font-size:16px;color:var(--sds-text-primary,#1C1A17);background:transparent;" autocomplete="off">';
    html += '<span style="font-size:12px;color:var(--sds-text-tertiary,#948E85);white-space:nowrap;flex-shrink:0;padding:2px 6px;border:1px solid var(--sds-border-default,#E0DCD3);border-radius:4px;background:var(--sds-bg-card,#fff);">Esc</span>';
    html += '</div>';

    // Results container
    html += '<div id="search-results" role="listbox" style="overflow-y:auto;flex:1;">';
    html += renderSearchEmpty();
    html += '</div>';

    // Keyboard hints bar
    html += '<div style="padding:10px 20px;border-top:1px solid var(--sds-border-subtle,#E0DCD3);background:var(--sds-bg-subtle,#F4F1EB);display:flex;gap:16px;align-items:center;flex-shrink:0;">';
    html += '<span style="font-size:12px;color:var(--sds-text-tertiary,#948E85);display:flex;align-items:center;gap:4px;">';
    html += '<kbd style="background:var(--sds-bg-card,#fff);border:1px solid var(--sds-border-default,#E0DCD3);padding:2px 6px;border-radius:4px;font-size:11px;font-weight:600;font-family:inherit;">&uarr;&darr;</kbd> Navigate</span>';
    html += '<span style="font-size:12px;color:var(--sds-text-tertiary,#948E85);display:flex;align-items:center;gap:4px;">';
    html += '<kbd style="background:var(--sds-bg-card,#fff);border:1px solid var(--sds-border-default,#E0DCD3);padding:2px 6px;border-radius:4px;font-size:11px;font-weight:600;font-family:inherit;">Enter</kbd> Select</span>';
    html += '<span style="font-size:12px;color:var(--sds-text-tertiary,#948E85);display:flex;align-items:center;gap:4px;">';
    html += '<kbd style="background:var(--sds-bg-card,#fff);border:1px solid var(--sds-border-default,#E0DCD3);padding:2px 6px;border-radius:4px;font-size:11px;font-weight:600;font-family:inherit;">Esc</kbd> Close</span>';
    html += '</div>';

    html += '</div></div>';

    overlay.innerHTML = html;

    // Focus input
    var input = document.getElementById('universal-search-input');
    if (input) {
      input.focus();

      // Pre-populate with "snow" to demonstrate search (first open only)
      if (!searchHasOpened) {
        searchHasOpened = true;
        setTimeout(function() {
          input.value = 'snow';
          performSearch('snow');
        }, 100);
      }

      // Search on input
      input.addEventListener('input', function() {
        var query = input.value.trim();
        var results = document.getElementById('search-results');
        if (!results) return;

        if (query.length === 0) {
          results.innerHTML = renderSearchEmpty();
        } else {
          performSearch(query);
        }
      });
    }

    // Close on backdrop click
    overlay.addEventListener('click', function(e) {
      if (e.target.matches('[data-search-backdrop]')) {
        closeSearch();
      }
    });

    // Close on Escape, navigate with arrows
    var searchKeyHandler = function(e) {
      if (e.key === 'Escape') {
        closeSearch();
        document.removeEventListener('keydown', searchKeyHandler, true);
        e.stopPropagation();
        e.preventDefault();
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        navigateResults(e.key === 'ArrowDown' ? 1 : -1);
      }
      if (e.key === 'Enter') {
        var highlighted = document.querySelector('.search-result-item.highlighted');
        if (highlighted) {
          e.preventDefault();
          var route = highlighted.getAttribute('data-navigate');
          if (route) {
            closeSearch();
            Router.navigate(route);
          }
        }
      }
    };
    document.addEventListener('keydown', searchKeyHandler, true);
  }

  function closeSearch() {
    var overlay = document.getElementById('overlay-container');
    if (overlay) overlay.innerHTML = '';
  }

  var highlightedIndex = -1;

  function navigateResults(direction) {
    var items = document.querySelectorAll('.search-result-item');
    if (items.length === 0) return;

    // Remove current highlight
    if (highlightedIndex >= 0 && highlightedIndex < items.length) {
      items[highlightedIndex].classList.remove('highlighted');
      items[highlightedIndex].style.background = '';
    }

    highlightedIndex += direction;
    if (highlightedIndex < 0) highlightedIndex = items.length - 1;
    if (highlightedIndex >= items.length) highlightedIndex = 0;

    items[highlightedIndex].classList.add('highlighted');
    items[highlightedIndex].style.background = 'var(--sds-interactive-primary-subtle,#D9EBED)';
    items[highlightedIndex].setAttribute('aria-selected', 'true');
    items[highlightedIndex].focus();
    items[highlightedIndex].scrollIntoView({ block: 'nearest' });
  }

  function renderSearchEmpty() {
    var html = '<div style="padding:8px 0;">';

    // Recent searches
    html += '<div style="padding:8px 20px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;color:var(--sds-text-tertiary,#948E85);">Recent Searches</div>';
    for (var i = 0; i < recentSearches.length; i++) {
      html += '<div class="search-result-item" role="option" tabindex="-1" data-search-result style="padding:10px 20px;cursor:pointer;display:flex;align-items:center;gap:10px;" data-recent-query="' + recentSearches[i] + '">';
      html += '<span style="color:var(--sds-text-disabled,#B0ABA2);">' + Icons.render('clock', 14) + '</span>';
      html += '<span style="font-size:14px;color:var(--sds-text-primary,#1C1A17);">' + recentSearches[i] + '</span>';
      html += '</div>';
    }

    // Suggested searches
    html += '<div style="padding:8px 20px;margin-top:8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;color:var(--sds-text-tertiary,#948E85);">Suggested</div>';
    for (var j = 0; j < suggestedSearches.length; j++) {
      html += '<div class="search-result-item" role="option" tabindex="-1" data-search-result style="padding:10px 20px;cursor:pointer;display:flex;align-items:center;gap:10px;" data-recent-query="' + suggestedSearches[j] + '">';
      html += '<span style="color:var(--sds-text-disabled,#B0ABA2);">' + Icons.render('search', 14) + '</span>';
      html += '<span style="font-size:14px;color:var(--sds-text-primary,#1C1A17);">' + suggestedSearches[j] + '</span>';
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  function performSearch(query) {
    var results = document.getElementById('search-results');
    if (!results) return;

    highlightedIndex = -1;
    var lowerQuery = query.toLowerCase();

    // Search across data categories
    var matchedConnections = Data.connections.filter(function(c) {
      return c.name.toLowerCase().indexOf(lowerQuery) !== -1;
    });
    var matchedTables = Data.tables.filter(function(t) {
      return t.name.toLowerCase().indexOf(lowerQuery) !== -1;
    });
    var matchedPolicies = Data.policies.filter(function(p) {
      return p.name.toLowerCase().indexOf(lowerQuery) !== -1;
    });
    var matchedRegulations = Data.regulations.filter(function(r) {
      return r.name.toLowerCase().indexOf(lowerQuery) !== -1 || r.fullName.toLowerCase().indexOf(lowerQuery) !== -1;
    });

    var totalResults = matchedConnections.length + matchedTables.length + matchedPolicies.length + matchedRegulations.length;

    if (totalResults === 0) {
      results.innerHTML = '<div style="text-align:center;padding:40px 20px;">' +
        '<div style="font-size:16px;font-weight:500;color:var(--sds-text-primary,#1C1A17);margin-bottom:8px;">No results for "' + escapeHtml(query) + '"</div>' +
        '<div style="font-size:14px;color:var(--sds-text-secondary,#54514D);">Try searching for connections, tables, policies, or regulations.</div>' +
        '</div>';
      return;
    }

    var html = '<div style="padding:8px 0;">';

    // Connections
    if (matchedConnections.length > 0) {
      html += renderSearchGroup('Connections', matchedConnections.length, 'connections');
      var showConns = matchedConnections.slice(0, 5);
      for (var c = 0; c < showConns.length; c++) {
        var conn = showConns[c];
        html += renderSearchResultItem(
          Icons.render('connections', 16),
          highlightMatch(conn.name, query),
          conn.platform + ' &middot; ' + conn.tables + ' tables',
          Components.statusTag(conn.status),
          '#/connections/' + conn.id
        );
      }
      if (matchedConnections.length > 5) {
        html += '<div style="padding:8px 20px 8px 52px;"><a style="font-size:13px;font-weight:500;color:var(--sds-text-link,#013D5B);cursor:pointer;text-decoration:none;" data-navigate="#/connections">Show all ' + matchedConnections.length + ' connection results</a></div>';
      }
    }

    // Tables
    if (matchedTables.length > 0) {
      html += renderSearchGroup('Tables', matchedTables.length, 'tables');
      var showTables = matchedTables.slice(0, 5);
      for (var t = 0; t < showTables.length; t++) {
        var tbl = showTables[t];
        html += renderSearchResultItem(
          Icons.render('table', 16),
          highlightMatch(tbl.name, query),
          tbl.connectionName + ' &middot; ' + tbl.schema,
          Components.tag(tbl.sensitivity, tbl.sensitivity === 'critical' ? 'error' : tbl.sensitivity === 'high' ? 'warning' : 'neutral'),
          '#/catalog/' + tbl.id
        );
      }
      if (matchedTables.length > 5) {
        html += '<div style="padding:8px 20px 8px 52px;"><a style="font-size:13px;font-weight:500;color:var(--sds-text-link,#013D5B);cursor:pointer;text-decoration:none;" data-navigate="#/catalog">Show all ' + matchedTables.length + ' table results</a></div>';
      }
    }

    // Policies
    if (matchedPolicies.length > 0) {
      html += renderSearchGroup('Policies', matchedPolicies.length, 'policies');
      var showPols = matchedPolicies.slice(0, 5);
      for (var p = 0; p < showPols.length; p++) {
        var pol = showPols[p];
        html += renderSearchResultItem(
          Icons.render('shield', 16),
          highlightMatch(pol.name, query),
          pol.regulation + ' &middot; ' + pol.method,
          Components.statusTag(pol.status),
          '#/policies/' + pol.id
        );
      }
    }

    // Regulations
    if (matchedRegulations.length > 0) {
      html += renderSearchGroup('Regulations', matchedRegulations.length, 'regulations');
      var showRegs = matchedRegulations.slice(0, 5);
      for (var r = 0; r < showRegs.length; r++) {
        var reg = showRegs[r];
        html += renderSearchResultItem(
          Icons.render('document', 16),
          highlightMatch(reg.name, query),
          reg.fullName + ' &middot; ' + reg.compliancePct + '% compliant',
          Components.statusTag(reg.status),
          '#/regulations/' + reg.id
        );
      }
    }

    html += '</div>';
    results.innerHTML = html;

    // Event delegation for hover and click on result items
    results.addEventListener('mouseenter', function(e) {
      var item = e.target.closest('[data-search-result]');
      if (!item) return;
      // Clear previous highlights
      var allItems = results.querySelectorAll('.search-result-item.highlighted');
      for (var k = 0; k < allItems.length; k++) {
        allItems[k].classList.remove('highlighted');
        allItems[k].style.background = '';
      }
      item.style.background = 'var(--sds-bg-subtle,#F4F1EB)';
    }, true);
    results.addEventListener('mouseleave', function(e) {
      var item = e.target.closest('[data-search-result]');
      if (!item) return;
      if (!item.classList.contains('highlighted')) {
        item.style.background = '';
      }
    }, true);
    results.addEventListener('click', function(e) {
      var item = e.target.closest('[data-search-result]');
      if (!item) return;
      var route = item.getAttribute('data-navigate');
      if (route) {
        closeSearch();
        Router.navigate(route);
      }
      // Handle recent/suggested query clicks
      var recentQuery = item.getAttribute('data-recent-query');
      if (recentQuery) {
        var input = document.getElementById('universal-search-input');
        if (input) {
          input.value = recentQuery;
          input.dispatchEvent(new Event('input'));
        }
      }
    });
  }

  function renderSearchGroup(label, count, type) {
    return '<div style="padding:8px 20px;display:flex;align-items:center;gap:8px;">' +
      '<span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;color:var(--sds-text-tertiary,#948E85);">' + label + '</span>' +
      '<span class="sds-badge sds-badge--neutral" style="font-size:11px;">' + count + '</span>' +
      '</div>';
  }

  function renderSearchResultItem(icon, name, context, statusHtml, route) {
    var attrs = route ? ' data-navigate="' + route + '"' : '';
    return '<div class="search-result-item" role="option" tabindex="-1" data-search-result style="padding:10px 20px;cursor:pointer;display:flex;align-items:center;gap:10px;"' + attrs + '>' +
      '<span style="color:var(--sds-text-tertiary,#948E85);flex-shrink:0;">' + icon + '</span>' +
      '<div style="flex:1;min-width:0;">' +
        '<div style="font-size:14px;font-weight:500;color:var(--sds-text-primary,#1C1A17);">' + name + '</div>' +
        '<div style="font-size:12px;color:var(--sds-text-secondary,#54514D);margin-top:2px;">' + context + '</div>' +
      '</div>' +
      '<div style="flex-shrink:0;">' + statusHtml + '</div>' +
    '</div>';
  }

  function highlightMatch(text, query) {
    var lowerText = text.toLowerCase();
    var lowerQuery = query.toLowerCase();
    var idx = lowerText.indexOf(lowerQuery);
    if (idx === -1) return escapeHtml(text);

    var before = text.substring(0, idx);
    var match = text.substring(idx, idx + query.length);
    var after = text.substring(idx + query.length);
    return escapeHtml(before) + '<strong>' + escapeHtml(match) + '</strong>' + escapeHtml(after);
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ---- Global Cmd+K Keyboard Listener ----
  document.addEventListener('keydown', function(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      var overlay = document.getElementById('overlay-container');
      // Toggle: if search is already open, close it
      if (overlay && overlay.querySelector('.search-overlay-backdrop')) {
        closeSearch();
      } else {
        openSearch();
      }
    }
  });

  // ---- Settings Page ----
  function renderSettings() {
    var content = document.getElementById('content');
    if (!content) return;

    var activeTab = State.get('settingsTab') || 'general';

    var html = Components.pageHeader('Settings');

    // Tabs
    html += Components.tabs([
      { id: 'general', label: 'General' },
      { id: 'notifications', label: 'Notifications' },
      { id: 'integrations', label: 'Integrations' },
      { id: 'team', label: 'Team' }
    ], activeTab);

    html += '<div class="tab-content" style="margin-top:24px;">';

    if (activeTab === 'general') {
      html += renderSettingsGeneralTab();
    } else if (activeTab === 'notifications') {
      html += Components.emptyState(Icons.render('bell', 48), 'Notifications', 'Configure email notifications for scan completions, policy violations, and approval requests');
    } else if (activeTab === 'integrations') {
      html += Components.emptyState(Icons.render('connections', 48), 'Integrations', 'Connect with SIEM, ticketing, and workflow tools');
    } else if (activeTab === 'team') {
      html += Components.emptyState(Icons.render('users', 48), 'Team', 'Manage team members, roles, and permissions');
    }

    html += '</div>';
    content.innerHTML = html;

    // Tab click handler and save button handler
    content.onclick = function(e) {
      var tab = e.target.closest('.sds-tab');
      if (tab) {
        var tabId = tab.getAttribute('data-tab');
        if (tabId) {
          State.set('settingsTab', tabId);
          renderSettings();
        }
        return;
      }

      // Save Changes button feedback
      var saveBtn = e.target.closest('[data-action="save-settings"]');
      if (saveBtn) {
        var originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '\u2713 Saved';
        saveBtn.disabled = true;
        setTimeout(function() {
          saveBtn.innerHTML = originalText;
          saveBtn.disabled = false;
        }, 2000);
      }
    };
  }

  function renderSettingsGeneralTab() {
    var html = '';
    html += '<div style="max-width:640px;">';

    html += Components.formGroup('Organization Name', Components.formInput('orgName', 'Acme Corp', ''));

    html += Components.formGroup('Default Scan Schedule',
      Components.formSelect('scanSchedule', [
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' }
      ], 'weekly')
    );

    html += Components.formGroup('Data Retention',
      Components.formSelect('dataRetention', [
        { value: '30', label: '30 days' },
        { value: '60', label: '60 days' },
        { value: '90', label: '90 days' },
        { value: '180', label: '180 days' },
        { value: '365', label: '365 days' }
      ], '90')
    );

    // Risk Score Thresholds
    html += '<div class="form-group">';
    html += '<label class="form-label">Risk Score Thresholds</label>';
    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">';

    html += '<div>';
    html += '<div style="font-size:12px;color:var(--sds-text-tertiary);margin-bottom:4px;">Low</div>';
    html += Components.formInput('thresholdLow', '0\u201325', '');
    html += '</div>';

    html += '<div>';
    html += '<div style="font-size:12px;color:var(--sds-text-tertiary);margin-bottom:4px;">Medium</div>';
    html += Components.formInput('thresholdMedium', '26\u201350', '');
    html += '</div>';

    html += '<div>';
    html += '<div style="font-size:12px;color:var(--sds-text-tertiary);margin-bottom:4px;">High</div>';
    html += Components.formInput('thresholdHigh', '51\u201375', '');
    html += '</div>';

    html += '<div>';
    html += '<div style="font-size:12px;color:var(--sds-text-tertiary);margin-bottom:4px;">Critical</div>';
    html += Components.formInput('thresholdCritical', '76\u2013100', '');
    html += '</div>';

    html += '</div>';
    html += '</div>';

    html += Components.formGroup('Auto-approve classifications above',
      Components.formInput('autoApproveThreshold', '95%', '', 'text'),
      'Classifications with confidence scores above this threshold will be auto-approved.'
    );

    html += '<div style="padding-top:16px;border-top:1px solid var(--sds-border-subtle);margin-top:24px;">';
    html += Components.button('Save Changes', 'primary', 'md', 'data-action="save-settings"');
    html += '</div>';

    html += '</div>';
    return html;
  }

  // ---- Register Routes ----
  Router.register('/reports', renderReports);
  Router.register('/settings', renderSettings);

})();
