/* ============================================================
   Components — Reusable HTML Render Functions
   All functions return HTML strings.
   ============================================================ */

window.Components = {

  // ---- Page Header ----
  pageHeader: function(title, subtitle, actions) {
    var html = '<div class="page-header">';
    html += '<div>';
    html += '<h1 class="page-title">' + title + '</h1>';
    if (subtitle) {
      html += '<div class="page-subtitle">' + subtitle + '</div>';
    }
    html += '</div>';
    if (actions) {
      html += '<div class="flex items-center gap-12">' + actions + '</div>';
    }
    html += '</div>';
    return html;
  },

  // ---- Breadcrumb ----
  breadcrumb: function(items) {
    var html = '<nav class="breadcrumb" aria-label="Breadcrumb">';
    for (var i = 0; i < items.length; i++) {
      if (i > 0) {
        html += '<span class="separator">/</span>';
      }
      if (items[i].href && i < items.length - 1) {
        html += '<a href="' + items[i].href + '" data-navigate="' + items[i].href + '">' + items[i].label + '</a>';
      } else {
        html += '<span class="text-secondary">' + items[i].label + '</span>';
      }
    }
    html += '</nav>';
    return html;
  },

  // ---- Data Table ----
  dataTable: function(config) {
    var columns = config.columns || [];
    var rows = config.rows || [];
    var onRowClick = config.onRowClick || null;

    var html = '<table class="data-table">';

    // Header
    html += '<thead><tr>';
    for (var c = 0; c < columns.length; c++) {
      var col = columns[c];
      var thStyle = col.width ? ' style="width:' + col.width + '"' : '';
      var thClass = col.align === 'right' ? ' class="col-actions"' : '';
      html += '<th' + thStyle + thClass + '>' + (col.label || '') + '</th>';
    }
    html += '</tr></thead>';

    // Body
    html += '<tbody>';
    if (rows.length === 0) {
      html += '<tr><td colspan="' + columns.length + '" style="text-align:center;padding:40px;color:var(--sds-text-tertiary);">No data available</td></tr>';
    }
    for (var r = 0; r < rows.length; r++) {
      var row = rows[r];
      var trAttrs = '';
      if (onRowClick) {
        var route = typeof onRowClick === 'function' ? onRowClick(row) : onRowClick.replace(':id', row.id);
        trAttrs = ' data-navigate="' + route + '"';
      }
      if (trAttrs) {
        trAttrs += ' role="link" tabindex="0"';
      }
      html += '<tr' + trAttrs + '>';
      for (var cc = 0; cc < columns.length; cc++) {
        var column = columns[cc];
        var tdClass = column.align === 'right' ? ' class="col-actions"' : '';
        if (column.className) {
          tdClass = ' class="' + column.className + '"';
        }
        var cellValue = '';
        if (column.render) {
          cellValue = column.render(row[column.key], row);
        } else {
          cellValue = row[column.key] !== undefined && row[column.key] !== null ? row[column.key] : '--';
        }
        html += '<td' + tdClass + '>' + cellValue + '</td>';
      }
      html += '</tr>';
    }
    html += '</tbody></table>';

    return html;
  },

  // ---- Card ----
  card: function(config) {
    var html = '<div class="sds-card">';

    if (config.title || config.actions) {
      html += '<div class="sds-card-header' + (config.bordered !== false ? ' sds-card-header--bordered' : '') + '">';
      html += '<h3 class="sds-card-title">' + (config.title || '') + '</h3>';
      if (config.actions) {
        html += '<div class="sds-card-actions">' + config.actions + '</div>';
      }
      html += '</div>';
    }

    if (config.body) {
      html += '<div class="sds-card-body">' + config.body + '</div>';
    }

    if (config.footer) {
      html += '<div class="sds-card-footer">' + config.footer + '</div>';
    }

    html += '</div>';
    return html;
  },

  // ---- Tabs ----
  tabs: function(tabs, activeId, onChangeAttr) {
    var attr = onChangeAttr || 'data-tab';
    var html = '<div class="sds-tabs" role="tablist">';
    for (var i = 0; i < tabs.length; i++) {
      var tab = tabs[i];
      var isActive = tab.id === activeId;
      html += '<button class="sds-tab' + (isActive ? ' active' : '') + '" role="tab" aria-selected="' + isActive + '" ' + attr + '="' + tab.id + '">';
      html += tab.label;
      if (tab.badge !== undefined && tab.badge !== null) {
        html += ' <span class="sds-tab-badge">' + tab.badge + '</span>';
      }
      html += '</button>';
    }
    html += '</div>';
    return html;
  },

  // ---- Toggle Tabs ----
  toggleTabs: function(options, activeId) {
    var html = '<div class="sds-toggle-tabs" role="tablist">';
    for (var i = 0; i < options.length; i++) {
      var opt = options[i];
      var isActive = opt.id === activeId;
      html += '<button class="sds-toggle-tab' + (isActive ? ' active' : '') + '" role="tab" aria-selected="' + isActive + '" data-toggle="' + opt.id + '">';
      html += opt.label;
      html += '</button>';
    }
    html += '</div>';
    return html;
  },

  // ---- Tag ----
  tag: function(text, variant) {
    variant = variant || 'neutral';
    return '<span class="sds-tag sds-tag--' + variant + '">' + text + '</span>';
  },

  // ---- Badge ----
  badge: function(count, variant) {
    variant = variant || 'neutral';
    return '<span class="sds-badge sds-badge--' + variant + '">' + count + '</span>';
  },

  // ---- Dot ----
  dot: function(variant) {
    variant = variant || 'neutral';
    return '<span class="sds-dot sds-dot--' + variant + '"></span>';
  },

  // ---- Button ----
  button: function(text, variant, size, attrs) {
    variant = variant || 'primary';
    size = size || 'md';
    attrs = attrs || '';
    return '<button class="btn btn-' + variant + ' btn-' + size + '" ' + attrs + '>' + text + '</button>';
  },

  // ---- Form Group ----
  formGroup: function(label, inputHtml, help) {
    var html = '<div class="form-group">';
    if (label) {
      html += '<label class="form-label">' + label + '</label>';
    }
    html += inputHtml;
    if (help) {
      html += '<div class="form-help">' + help + '</div>';
    }
    html += '</div>';
    return html;
  },

  // ---- Form Input ----
  formInput: function(name, value, placeholder, type) {
    type = type || 'text';
    value = value || '';
    placeholder = placeholder || '';
    return '<input class="form-input" type="' + type + '" name="' + name + '" value="' + value + '" placeholder="' + placeholder + '">';
  },

  // ---- Form Select ----
  formSelect: function(name, options, selected) {
    var html = '<select class="form-select" name="' + name + '">';
    for (var i = 0; i < options.length; i++) {
      var opt = options[i];
      var val = typeof opt === 'object' ? opt.value : opt;
      var label = typeof opt === 'object' ? opt.label : opt;
      var sel = val === selected ? ' selected' : '';
      html += '<option value="' + val + '"' + sel + '>' + label + '</option>';
    }
    html += '</select>';
    return html;
  },

  // ---- Wizard Steps ----
  wizardSteps: function(steps, currentIndex) {
    var html = '<div class="wizard-steps">';
    for (var i = 0; i < steps.length; i++) {
      var state = 'pending';
      if (i < currentIndex) state = 'complete';
      if (i === currentIndex) state = 'active';

      var stepAttrs = '';
      if (state === 'complete' && steps[i].route) {
        stepAttrs = ' data-navigate="' + steps[i].route + '" tabindex="0" role="link" aria-label="Go back to ' + steps[i].label + '"';
      }
      html += '<div class="wizard-step wizard-step--' + state + '"' + stepAttrs + '>';
      html += '<div class="wizard-step-number">';
      if (state === 'complete') {
        html += '<svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9l3.5 3.5L14 5"/></svg>';
      } else {
        html += (i + 1);
      }
      html += '</div>';
      html += '<span class="wizard-step-label">' + steps[i].label + '</span>';
      html += '</div>';

      if (i < steps.length - 1) {
        var connState = i < currentIndex ? 'complete' : 'pending';
        html += '<div class="wizard-step-connector wizard-step-connector--' + connState + '"></div>';
      }
    }
    html += '</div>';
    return html;
  },

  // ---- Filter Bar ----
  filterBar: function(filters, searchPlaceholder) {
    var html = '<div class="filter-bar">';
    html += '<input class="search-input" type="text" placeholder="' + (searchPlaceholder || 'Search...') + '" aria-label="Search">';
    if (filters) {
      for (var i = 0; i < filters.length; i++) {
        var f = filters[i];
        html += '<select class="filter-select" name="' + (f.name || '') + '">';
        for (var j = 0; j < f.options.length; j++) {
          var opt = f.options[j];
          var val = typeof opt === 'object' ? opt.value : opt;
          var label = typeof opt === 'object' ? opt.label : opt;
          html += '<option value="' + val + '">' + label + '</option>';
        }
        html += '</select>';
      }
    }
    html += '</div>';
    return html;
  },

  // ---- Modal ----
  modal: function(title, body, footer) {
    var html = '<div class="modal-backdrop" data-modal-backdrop>';
    html += '<div class="modal" role="dialog" aria-modal="true">';
    html += '<div class="modal-header">';
    html += '<h3>' + title + '</h3>';
    html += '<button class="modal-close" data-modal-close aria-label="Close">' + Icons.close + '</button>';
    html += '</div>';
    html += '<div class="modal-body">' + body + '</div>';
    if (footer) {
      html += '<div class="modal-footer">' + footer + '</div>';
    }
    html += '</div></div>';
    return html;
  },

  // ---- Drawer ----
  drawer: function(title, body, position) {
    var posClass = position === 'left' ? ' style="left:0;right:auto;border-left:none;border-right:1px solid var(--sds-border-default);"' : '';
    var html = '<div class="drawer open" role="dialog" aria-modal="true"' + posClass + '>';
    html += '<div class="drawer-header">';
    html += '<h3 class="drawer-title">' + title + '</h3>';
    html += '<button class="modal-close" data-drawer-close aria-label="Close">' + Icons.close + '</button>';
    html += '</div>';
    html += '<div class="drawer-body">' + body + '</div>';
    html += '</div>';
    return html;
  },

  // ---- Progress Bar ----
  progressBar: function(percent, variant) {
    var fillClass = 'progress-bar-fill';
    if (variant) fillClass += ' progress-bar-fill--' + variant;
    return '<div class="progress-bar"><div class="' + fillClass + '" style="width:' + percent + '%"></div></div>';
  },

  // ---- Empty State ----
  emptyState: function(icon, title, desc, actionHtml) {
    var html = '<div class="empty-state">';
    if (icon) {
      html += '<div class="empty-state-icon">' + icon + '</div>';
    }
    html += '<div class="empty-state-title">' + title + '</div>';
    if (desc) {
      html += '<div class="empty-state-desc">' + desc + '</div>';
    }
    if (actionHtml) {
      html += actionHtml;
    }
    html += '</div>';
    return html;
  },

  // ---- Alert Ribbon ----
  alertRibbon: function(message, variant, actionHtml) {
    variant = variant || 'info';
    var html = '<div class="alert-ribbon alert-ribbon--' + variant + '" role="alert">';
    html += '<span>' + message + '</span>';
    if (actionHtml) {
      html += actionHtml;
    }
    html += '<button class="alert-ribbon-close" data-alert-dismiss aria-label="Dismiss alert">' + Icons.close + '</button>';
    html += '</div>';
    return html;
  },

  // ---- Stat Card ----
  statCard: function(label, value, subtitle, trend) {
    var html = '<div class="sds-card"><div class="stat-card">';
    html += '<div class="stat-card-label">' + label + '</div>';
    html += '<div class="stat-card-value">' + value + '</div>';
    if (subtitle) {
      html += '<div class="stat-card-subtitle">' + subtitle + '</div>';
    }
    if (trend) {
      var trendClass = trend.direction === 'down' ? 'stat-card-trend--down' : 'stat-card-trend--up';
      var arrow = trend.direction === 'down' ? '&darr;' : '&uarr;';
      html += '<div class="stat-card-trend ' + trendClass + '">' + arrow + ' ' + trend.value + '</div>';
    }
    html += '</div></div>';
    return html;
  },

  // ---- Status Dot ----
  statusDot: function(status) {
    var map = {
      'active': 'success',
      'connected': 'success',
      'completed': 'success',
      'approved': 'success',
      'compliant': 'success',
      'degraded': 'warning',
      'partial': 'warning',
      'pending': 'warning',
      'pending_approval': 'warning',
      'running': 'info',
      'in_progress': 'info',
      'queued': 'info',
      'draft': 'neutral',
      'inactive': 'neutral',
      'error': 'error',
      'failed': 'error',
      'critical': 'error',
      'rejected': 'error'
    };
    var variant = map[status] || 'neutral';
    return '<span class="sds-dot sds-dot--' + variant + '"></span>';
  },

  // ---- Status Tag ----
  statusTag: function(status) {
    var map = {
      'active': { label: 'Active', variant: 'success' },
      'connected': { label: 'Connected', variant: 'success' },
      'completed': { label: 'Completed', variant: 'success' },
      'approved': { label: 'Approved', variant: 'success' },
      'compliant': { label: 'Compliant', variant: 'success' },
      'degraded': { label: 'Degraded', variant: 'warning' },
      'partial': { label: 'Partial', variant: 'warning' },
      'pending': { label: 'Pending', variant: 'warning' },
      'pending_approval': { label: 'Pending Approval', variant: 'warning' },
      'running': { label: 'Running', variant: 'info' },
      'in_progress': { label: 'In Progress', variant: 'info' },
      'queued': { label: 'Queued', variant: 'info' },
      'draft': { label: 'Draft', variant: 'neutral' },
      'inactive': { label: 'Inactive', variant: 'neutral' },
      'error': { label: 'Error', variant: 'error' },
      'failed': { label: 'Failed', variant: 'error' },
      'critical': { label: 'Critical', variant: 'error' },
      'rejected': { label: 'Rejected', variant: 'error' }
    };
    var info = map[status] || { label: status, variant: 'neutral' };
    return this.tag(info.label, info.variant);
  },

  // ---- Filter Pills ----
  filterPills: function(activeFilters) {
    // activeFilters = [{label: 'Status: Active', key: 'status'}, ...]
    if (!activeFilters || activeFilters.length === 0) return '';
    var html = '<div class="filter-active-pills">';
    for (var i = 0; i < activeFilters.length; i++) {
      var f = activeFilters[i];
      html += '<span class="filter-pill">';
      html += f.label;
      html += '<button class="filter-pill-remove" data-filter-remove="' + f.key + '" aria-label="Remove filter: ' + f.label + '">&times;</button>';
      html += '</span>';
    }
    html += '</div>';
    return html;
  },

  // ---- Skeleton Loading ----
  skeleton: function(type, count) {
    // type = 'card' | 'table-row' | 'text' | 'chart'
    count = count || 1;
    var html = '';
    for (var i = 0; i < count; i++) {
      if (type === 'card') {
        html += '<div class="skeleton skeleton-card"><div class="skeleton-line skeleton-line--title"></div><div class="skeleton-line skeleton-line--value"></div><div class="skeleton-line skeleton-line--subtitle"></div></div>';
      } else if (type === 'table-row') {
        html += '<div class="skeleton skeleton-table-row"><div class="skeleton-line" style="width:30%"></div><div class="skeleton-line" style="width:20%"></div><div class="skeleton-line" style="width:25%"></div><div class="skeleton-line" style="width:15%"></div></div>';
      } else if (type === 'text') {
        html += '<div class="skeleton skeleton-text"><div class="skeleton-line" style="width:' + (70 + Math.random() * 30) + '%"></div></div>';
      } else if (type === 'chart') {
        html += '<div class="skeleton skeleton-chart"></div>';
      }
    }
    return html;
  },

  // ---- No Results ----
  noResults: function(message) {
    message = message || 'No items match your filters. Try adjusting your search or clearing filters.';
    return '<div class="no-results"><div class="no-results-icon">' + (Icons.search || '') + '</div><div class="no-results-text">' + message + '</div></div>';
  },

  // ---- Icon Button (helper) ----
  iconButton: function(iconName, attrs, label) {
    attrs = attrs || '';
    label = label || iconName;
    return '<button class="btn btn-tertiary btn-sm btn-icon-only" aria-label="' + label + '" ' + attrs + '><span class="btn-icon">' + (Icons[iconName] || '') + '</span></button>';
  },

  // ---- Sensitivity Tag (shared helper) ----
  sensitivityTag: function(level) {
    var map = {
      'critical': { label: 'Critical', variant: 'error' },
      'high': { label: 'High', variant: 'error' },
      'medium': { label: 'Medium', variant: 'warning' },
      'low': { label: 'Low', variant: 'success' },
      'none': { label: 'None', variant: 'neutral' }
    };
    var info = map[level] || { label: level || 'None', variant: 'neutral' };
    return this.tag(info.label, info.variant);
  },

  // ---- Confirmation Modal (type-to-confirm pattern) ----
  confirmModal: function(title, message, confirmText, onConfirmAttr) {
    var body = '<p class="confirm-modal-message">' + message + '</p>';
    body += '<div class="form-group" style="margin-bottom:0;">';
    body += '<label class="form-label" for="confirm-input">Type <strong>' + confirmText + '</strong> to confirm</label>';
    body += '<input class="form-input" type="text" id="confirm-input" data-confirm-input placeholder="' + confirmText + '">';
    body += '</div>';

    var footer = '<button class="btn btn-secondary btn-md" data-modal-close>Cancel</button>';
    footer += '<button class="btn btn-danger btn-md is-disabled" data-confirm-action ' + (onConfirmAttr || '') + ' disabled>Delete</button>';

    return this.modal(title, body, footer);
  }
};
