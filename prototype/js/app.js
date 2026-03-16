/* ============================================================
   App — Entry Point
   Renders sidebar, sets up navigation, starts router
   ============================================================ */

(function() {

  // ---- Sidebar Navigation Structure ----
  var navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', route: '#/dashboard' },
    { group: 'Discovery' },
    { id: 'connections', label: 'Connections', icon: 'connections', route: '#/connections' },
    { id: 'catalog', label: 'Data Catalog', icon: 'catalog', route: '#/catalog' },
    { id: 'scans', label: 'Scans', icon: 'scan', route: '#/scans' },
    { id: 'review', label: 'Review Queue', icon: 'review', route: '#/review', badgeKey: 'pendingReviews' },
    { group: 'Protection' },
    { id: 'policies', label: 'Policies', icon: 'shield', route: '#/policies' },
    { id: 'remediation', label: 'Remediation', icon: 'wrench', route: '#/remediation', badgeKey: 'openRemediations' },
    { group: 'Compliance' },
    { id: 'regulations', label: 'Regulations', icon: 'document', route: '#/regulations' },
    { id: 'reports', label: 'Reports', icon: 'chart', route: '#/reports' }
  ];

  var footerItems = [
    { id: 'settings', label: 'Settings', icon: 'settings', route: '#/settings' }
  ];

  // ---- Render Sidebar ----
  function renderSidebar() {
    var sidebar = document.getElementById('app-sidebar');
    if (!sidebar) return;

    var html = '';

    // Main nav items
    for (var i = 0; i < navItems.length; i++) {
      var item = navItems[i];
      if (item.group) {
        html += '<div class="sidenav-group-label">' + item.group + '</div>';
      } else {
        html += renderNavItem(item);
      }
    }

    // Spacer
    html += '<div class="sidenav-spacer"></div>';

    // Footer
    html += '<div class="sidenav-footer">';
    for (var f = 0; f < footerItems.length; f++) {
      html += renderNavItem(footerItems[f]);
    }
    // Collapse toggle
    html += '<div class="sidenav-collapse" id="sidebar-toggle" title="Collapse sidebar" role="button" aria-label="Collapse sidebar" aria-expanded="true">';
    html += '<svg viewBox="0 0 16 16"><path d="M10 4l-4 4 4 4"/><path d="M14 4l-4 4 4 4"/></svg>';
    html += '</div>';
    html += '</div>';

    sidebar.innerHTML = html;
  }

  function renderNavItem(item) {
    var currentRoute = (location.hash || '#/dashboard').replace('#', '');
    var itemRoute = item.route.replace('#', '');
    var isActive = currentRoute === itemRoute || currentRoute.indexOf(itemRoute + '/') === 0;

    var html = '<a class="sidenav-item' + (isActive ? ' active' : '') + '" data-navigate="' + item.route + '" data-nav-id="' + item.id + '">';
    html += '<span class="sidenav-icon">' + (Icons[item.icon] || '') + '</span>';
    html += '<span class="sidenav-item-label">' + item.label + '</span>';

    if (item.badgeKey) {
      var badgeCount = getBadgeCount(item.badgeKey);
      if (badgeCount > 0) {
        html += '<span class="sidenav-item-badge">' + badgeCount + '</span>';
      }
    }

    html += '</a>';
    return html;
  }

  function getBadgeCount(key) {
    if (key === 'pendingReviews') return Data.approvals.filter(function(a) { return a.status === 'pending'; }).length;
    if (key === 'openRemediations') return Data.remediations.filter(function(r) { return r.status !== 'completed'; }).length;
    return 0;
  }

  // ---- Update Active Nav ----
  function updateActiveNav() {
    var sidebar = document.getElementById('app-sidebar');
    if (!sidebar) return;

    var currentRoute = (location.hash || '#/dashboard').replace('#', '');
    var items = sidebar.querySelectorAll('.sidenav-item');

    for (var i = 0; i < items.length; i++) {
      var navRoute = (items[i].getAttribute('data-navigate') || '').replace('#', '');
      var isActive = currentRoute === navRoute || currentRoute.indexOf(navRoute + '/') === 0;
      if (isActive) {
        items[i].classList.add('active');
      } else {
        items[i].classList.remove('active');
      }
    }
  }

  // ---- Sidebar Collapse ----
  function setupSidebarToggle() {
    document.addEventListener('click', function(e) {
      var toggle = e.target.closest('#sidebar-toggle');
      if (toggle) {
        var sidebar = document.getElementById('app-sidebar');
        if (sidebar) {
          sidebar.classList.toggle('is-collapsed');
          var isCollapsed = sidebar.classList.contains('is-collapsed');
          State.set('sidebarCollapsed', isCollapsed);
          toggle.setAttribute('aria-expanded', !isCollapsed);
        }
      }
    });

    // Restore collapsed state
    if (State.get('sidebarCollapsed')) {
      var sidebar = document.getElementById('app-sidebar');
      if (sidebar) sidebar.classList.add('is-collapsed');
    }
  }

  // ---- Delegated Click Handler for data-navigate ----
  function setupNavigation() {
    document.addEventListener('click', function(e) {
      var target = e.target.closest('[data-navigate]');
      if (target) {
        e.preventDefault();
        var route = target.getAttribute('data-navigate');
        if (route) {
          Router.navigate(route);
        }
      }
    });

    // Keyboard activation for data-navigate elements (Enter/Space on table rows etc.)
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        var target = e.target.closest('[data-navigate][tabindex]');
        if (target) {
          e.preventDefault();
          var route = target.getAttribute('data-navigate');
          if (route) {
            Router.navigate(route);
          }
        }
      }
    });
  }

  // ---- Alert Ribbon ----
  var currentAlertIndex = 0;

  function setupAlertRibbon() {
    var ribbon = document.getElementById('alert-ribbon');
    if (!ribbon) return;

    if (Data.alerts && Data.alerts.length > 0) {
      showAlert(ribbon, 0);
    }

    // Dismiss, prev, next handlers
    document.addEventListener('click', function(e) {
      if (e.target.closest('[data-alert-dismiss]')) {
        ribbon.setAttribute('hidden', '');
        ribbon.className = 'alert-ribbon';
      }
      if (e.target.closest('[data-alert-prev]')) {
        currentAlertIndex = (currentAlertIndex - 1 + Data.alerts.length) % Data.alerts.length;
        showAlert(ribbon, currentAlertIndex);
      }
      if (e.target.closest('[data-alert-next]')) {
        currentAlertIndex = (currentAlertIndex + 1) % Data.alerts.length;
        showAlert(ribbon, currentAlertIndex);
      }
    });
  }

  function showAlert(ribbon, index) {
    var alert = Data.alerts[index];
    currentAlertIndex = index;
    ribbon.removeAttribute('hidden');

    var actionHtml = alert.action ? '<a class="alert-ribbon-action" data-navigate="' + alert.actionRoute + '">' + alert.action + '</a>' : '';
    var totalAlerts = Data.alerts.length;

    var html = '<div class="alert-ribbon alert-ribbon--' + alert.variant + '">';
    html += '<div class="alert-ribbon-content">';
    html += '<span>' + alert.message + '</span> ' + actionHtml;
    html += '</div>';
    html += '<div class="alert-ribbon-controls">';
    if (totalAlerts > 1) {
      html += '<span class="alert-ribbon-count">' + (index + 1) + ' of ' + totalAlerts + '</span>';
      html += '<button class="alert-ribbon-nav" data-alert-prev aria-label="Previous alert">\u2039</button>';
      html += '<button class="alert-ribbon-nav" data-alert-next aria-label="Next alert">\u203A</button>';
    }
    html += '<button class="alert-ribbon-dismiss" data-alert-dismiss aria-label="Dismiss alert">\u2715</button>';
    html += '</div>';
    html += '</div>';

    ribbon.innerHTML = html;
    ribbon.className = 'alert-ribbon alert-ribbon--' + alert.variant;
  }

  // ---- Modal/Drawer Close Handlers ----
  function setupOverlayHandlers() {
    document.addEventListener('click', function(e) {
      // Close modal on backdrop click
      if (e.target.matches('[data-modal-backdrop]')) {
        var overlay = document.getElementById('overlay-container');
        if (overlay) overlay.innerHTML = '';
      }
      // Close modal on close button
      if (e.target.closest('[data-modal-close]')) {
        var overlay2 = document.getElementById('overlay-container');
        if (overlay2) overlay2.innerHTML = '';
      }
      // Close drawer
      if (e.target.closest('[data-drawer-close]')) {
        var overlay3 = document.getElementById('overlay-container');
        if (overlay3) overlay3.innerHTML = '';
      }
    });

    // Escape key closes overlays
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        var overlay = document.getElementById('overlay-container');
        if (overlay && overlay.innerHTML) {
          overlay.innerHTML = '';
        }
      }
    });

    // Global confirm modal input validation
    document.addEventListener('input', function(e) {
      if (e.target.matches('[data-confirm-input]')) {
        var expectedText = e.target.placeholder || '';
        var actionBtn = document.querySelector('[data-confirm-action]');
        if (actionBtn) {
          if (e.target.value === expectedText) {
            actionBtn.disabled = false;
            actionBtn.classList.remove('is-disabled');
          } else {
            actionBtn.disabled = true;
            actionBtn.classList.add('is-disabled');
          }
        }
      }
    });
  }

  // ---- Tab Click Handlers ----
  function setupTabHandlers() {
    document.addEventListener('click', function(e) {
      // Page tabs
      var tab = e.target.closest('.sds-tab');
      if (tab && tab.closest('.sds-tabs')) {
        var tabs = tab.closest('.sds-tabs').querySelectorAll('.sds-tab');
        for (var i = 0; i < tabs.length; i++) {
          tabs[i].classList.remove('active');
          tabs[i].setAttribute('aria-selected', 'false');
        }
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
      }

      // Toggle tabs
      var toggleTab = e.target.closest('.sds-toggle-tab');
      if (toggleTab && toggleTab.closest('.sds-toggle-tabs')) {
        var toggleTabs = toggleTab.closest('.sds-toggle-tabs').querySelectorAll('.sds-toggle-tab');
        for (var j = 0; j < toggleTabs.length; j++) {
          toggleTabs[j].classList.remove('active');
          toggleTabs[j].setAttribute('aria-selected', 'false');
        }
        toggleTab.classList.add('active');
        toggleTab.setAttribute('aria-selected', 'true');
      }
    });
  }

  // ---- Initialize ----
  function init() {
    renderSidebar();
    setupNavigation();
    setupSidebarToggle();
    setupAlertRibbon();
    setupOverlayHandlers();
    setupTabHandlers();

    // Update sidebar on route changes
    State.subscribe('currentRoute', function() {
      updateActiveNav();
    });

    // Start router
    Router.start();
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
