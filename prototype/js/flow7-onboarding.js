/* ============================================================
   Flow 7 — Onboarding & First-Time Experience
   10 screens: Welcome through Onboarding Complete
   ============================================================ */

(function() {

  // ---- Interval cleanup ----
  var scanInterval = null;
  function clearScanInterval() {
    if (scanInterval) {
      clearInterval(scanInterval);
      scanInterval = null;
    }
  }

  // Clean up interval on route change
  State.subscribe('currentRoute', function() { clearScanInterval(); });

  // ---- Confetti celebration colors (token references) ----
  var CONFETTI_COLORS = [
    '#77B2C7', /* --sds-color-blue-300 */
    '#98B43B', /* --sds-color-green-300 */
    '#EBCE2D', /* --sds-color-yellow-200 */
    '#A6CBD6', /* --sds-color-blue-200 */
    '#C0EAF2'  /* --sds-color-sky-100 */
  ];

  // ---- Onboarding State Helpers ----
  var onboardingState = {
    persona: null,
    currentStep: 0,
    completedSteps: [],
    selectedPlatform: null,
    reviewedItems: [],
    remediationTab: 0,
    demoTourStep: 0,
    demoTourActive: false,
    monitoringConfigured: { schedule: false, alerts: false, dashboard: false }
  };

  function getOnboardingState() {
    var stored = State.get('onboarding');
    if (stored) {
      for (var k in stored) {
        if (stored.hasOwnProperty(k)) onboardingState[k] = stored[k];
      }
    }
    return onboardingState;
  }

  function saveOnboardingState() {
    State.set('onboarding', onboardingState);
  }

  // ---- Onboarding Steps Definition ----
  var steps = [
    { label: 'Connect', icon: 'connections', description: 'Connect Your First Data Source', detail: 'Link a Snowflake, AWS, Databricks, or BigQuery account to start discovering sensitive data.', time: '~3-8 minutes', route: '/onboarding/connect' },
    { label: 'Scan', icon: 'scan', description: 'Run Your First Scan', detail: 'Automatically discover tables, columns, and sensitive data patterns across your connected source.', time: '~5 minutes', route: '/onboarding/scan' },
    { label: 'Review', icon: 'review', description: 'Review Classifications', detail: 'Verify the top classification suggestions to ensure accuracy and build trust in the system.', time: '~3 minutes', route: '/onboarding/review' },
    { label: 'Risk', icon: 'shield', description: 'See Your Risk Score', detail: 'Get your first data security risk score with a clear breakdown of what drives it.', time: '~1 minute', route: '/onboarding/score' },
    { label: 'Act', icon: 'wrench', description: 'Take Action', detail: 'Apply your first remediation action or set up monitoring to maintain your security posture.', time: '~2 minutes', route: '/onboarding/remediate' }
  ];

  // ---- Mini Progress Bar (used on step screens) ----
  function renderMiniProgress(currentIndex) {
    var html = '<div class="onb-mini-progress">';
    html += '<span style="font-size:13px;font-weight:500;color:var(--sds-text-tertiary);">Step ' + (currentIndex + 1) + ' of 5</span>';
    html += '<div style="display:flex;gap:4px;margin-top:6px;">';
    for (var i = 0; i < 5; i++) {
      var color = i < currentIndex ? 'var(--sds-status-success-strong)' : (i === currentIndex ? 'var(--sds-interactive-primary)' : 'var(--sds-border-default)');
      html += '<div style="flex:1;height:4px;border-radius:2px;background:' + color + ';"></div>';
    }
    html += '</div></div>';
    return html;
  }

  // ---- Progress Tracker (5 steps) ----
  function renderProgressTracker(currentIndex) {
    var html = '<div style="background:var(--sds-bg-card);border:1px solid var(--sds-border-default);border-radius:8px;padding:24px;">';
    html += '<div style="display:flex;align-items:flex-start;justify-content:center;gap:0;">';

    for (var i = 0; i < steps.length; i++) {
      var state = 'upcoming';
      if (onboardingState.completedSteps.indexOf(i) > -1) state = 'complete';
      else if (i === currentIndex) state = 'current';

      var circleSize = 32;
      var circleBg, circleColor, iconSvg;

      if (state === 'complete') {
        circleBg = 'var(--sds-status-success-strong)';
        circleColor = 'var(--sds-text-on-primary, white)';
        iconSvg = '<svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="' + circleColor + '" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9l3.5 3.5L14 5"/></svg>';
      } else if (state === 'current') {
        circleBg = 'var(--sds-interactive-primary)';
        circleColor = 'var(--sds-text-on-primary, white)';
        iconSvg = '<span style="color:' + circleColor + ';display:flex;align-items:center;justify-content:center;width:18px;height:18px;">' + (Icons[steps[i].icon] || '') + '</span>';
      } else {
        circleBg = 'var(--sds-status-neutral-bg)';
        circleColor = 'var(--sds-text-disabled)';
        iconSvg = '<span style="color:' + circleColor + ';display:flex;align-items:center;justify-content:center;width:18px;height:18px;">' + (Icons[steps[i].icon] || '') + '</span>';
      }

      var labelFont = state === 'current' ? 'font-weight:600;color:var(--sds-text-primary);' : (state === 'complete' ? 'font-weight:500;color:var(--sds-text-secondary);' : 'font-weight:400;color:var(--sds-text-tertiary);');

      html += '<div style="display:flex;flex-direction:column;align-items:center;min-width:80px;">';
      html += '<div style="width:' + circleSize + 'px;height:' + circleSize + 'px;border-radius:50%;background:' + circleBg + ';display:flex;align-items:center;justify-content:center;' + (state === 'upcoming' ? 'border:2px solid var(--sds-border-default);' : '') + '">';
      html += iconSvg;
      html += '</div>';
      html += '<span style="font-size:12px;margin-top:8px;' + labelFont + '">' + steps[i].label + '</span>';
      html += '</div>';

      if (i < steps.length - 1) {
        var lineColor = (state === 'complete') ? 'var(--sds-status-success-strong)' : 'var(--sds-border-default)';
        html += '<div style="flex:1;height:2px;background:' + lineColor + ';margin-top:16px;min-width:40px;max-width:80px;"></div>';
      }
    }

    html += '</div>';
    html += '<div style="text-align:center;margin-top:12px;font-size:13px;font-weight:500;color:var(--sds-text-tertiary);">Step ' + (currentIndex + 1) + ' of 5</div>';
    html += '</div>';
    return html;
  }

  // ---- Coach Mark Helper ----
  function renderCoachMark(text, id) {
    return '<div class="onb-coach-mark" id="coach-' + (id || 'default') + '" style="background:var(--sds-status-info-bg);border:1px solid var(--sds-color-blue-200, #A6CBD6);border-radius:8px;padding:16px;margin:12px 0;max-width:420px;position:relative;box-shadow:0 4px 12px rgba(0,0,0,0.08);">' +
      '<div style="display:flex;gap:10px;align-items:flex-start;">' +
        '<span style="color:var(--sds-color-blue-450, #4F8AA0);flex-shrink:0;margin-top:1px;">' + Icons.info + '</span>' +
        '<div style="flex:1;">' +
          '<div style="font-size:13px;color:var(--sds-status-info-text, #0C4A69);line-height:1.5;">' + text + '</div>' +
          '<div style="margin-top:8px;text-align:right;">' +
            '<button class="onb-coach-dismiss btn btn-tertiary btn-sm" data-coach="' + (id || 'default') + '" style="font-size:13px;font-weight:500;color:var(--sds-text-link);">Got it</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  // ---- Platform data (colors from Data.platformColors) ----
  var platforms = [
    { id: 'snowflake', name: 'Snowflake', color: Data.platformColors['snowflake'] },
    { id: 'aws-s3', name: 'AWS S3', color: Data.platformColors['aws-s3'] },
    { id: 'bigquery', name: 'BigQuery', color: Data.platformColors['bigquery'] },
    { id: 'databricks', name: 'Databricks', color: Data.platformColors['databricks'] }
  ];

  // ---- Classification review items ----
  var reviewItems = [
    { id: 'r1', type: 'Email Address', field: 'users.email', source: 'Snowflake > public', confidence: 98, category: 'PII', reasoning: ['Column name matches "email" pattern', 'Data type: VARCHAR(255)', 'Sample values match email regex', '99.2% of values are valid emails'], samples: ['j.smith@company.com', 'alice.jones@example.org', 'bob.wilson@enterprise.io'] },
    { id: 'r2', type: 'Phone Number', field: 'users.phone_number', source: 'Snowflake > public', confidence: 96, category: 'PII', reasoning: ['Column name contains "phone"', 'Data type: VARCHAR(20)', 'Values match US phone pattern', '94.8% match rate'], samples: ['+1 (555) 234-5678', '555-867-5309', '+1-555-123-4567'] },
    { id: 'r3', type: 'Social Security Number', field: 'users.ssn', source: 'Snowflake > public', confidence: 99, category: 'PII', reasoning: ['Column name is "ssn"', 'Data type: VARCHAR(11)', 'Values match XXX-XX-XXXX pattern', '100% format compliance'], samples: ['***-**-1234', '***-**-5678', '***-**-9012'] },
    { id: 'r4', type: 'Date of Birth', field: 'employee_directory.dob', source: 'BigQuery > hr', confidence: 88, category: 'PII', reasoning: ['Column name contains "dob"', 'Data type: DATE', 'All values are valid dates', 'Age range 18-85 years'], samples: ['1985-03-15', '1992-11-28', '1978-07-04'] },
    { id: 'r5', type: 'Street Address', field: 'customer_profiles.home_address', source: 'Azure SQL > crm', confidence: 92, category: 'PII', reasoning: ['Column name contains "address"', 'Data type: VARCHAR(500)', 'Values contain street numbers and names', 'US address patterns detected'], samples: ['123 Main St, Suite 100', '456 Oak Avenue', '789 Elm Blvd, Apt 3B'] }
  ];


  /* ================================================================
     SCREEN 1: Welcome
     ================================================================ */
  function renderWelcome() {
    var content = document.getElementById('content');
    var sidebar = document.getElementById('app-sidebar');
    var header = document.querySelector('.app-header');
    var alertRibbon = document.getElementById('alert-ribbon');

    // Hide sidebar and header for welcome screen
    if (sidebar) sidebar.style.display = 'none';
    if (header) header.style.display = 'none';
    if (alertRibbon) alertRibbon.setAttribute('hidden', '');

    var html = '<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:var(--sds-bg-surface);padding:40px 20px;">';
    html += '<div style="max-width:720px;width:100%;text-align:center;">';

    // Logo
    html += '<div style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;background:var(--sds-interactive-primary);border-radius:12px;margin-bottom:12px;">';
    html += '<svg viewBox="0 0 16 16" width="28" height="28" fill="#FFFFFF"><path d="M8 1L2 4.5v7L8 15l6-3.5v-7L8 1z"/></svg>';
    html += '</div>';
    html += '<div style="font-size:20px;font-weight:600;color:var(--sds-text-primary);margin-bottom:32px;">Beacon</div>';

    // Headline
    html += '<h1 style="font-size:24px;font-weight:700;color:var(--sds-text-primary);margin:0 0 12px 0;line-height:1.3;">See your data risk score in 30 minutes</h1>';
    html += '<p style="font-size:16px;color:var(--sds-text-secondary);line-height:1.5;margin:0 auto 32px auto;max-width:480px;">Connect a data source, discover what is sensitive, and get your first security risk score.</p>';

    // Persona label
    html += '<div style="font-size:14px;font-weight:500;color:var(--sds-text-secondary);margin-bottom:16px;">I am a...</div>';

    // Persona cards
    var personas = [
      { id: 'jordan', icon: 'connections', title: 'Data Engineer', desc: 'Connect and scan data sources', name: 'Jordan' },
      { id: 'priya', icon: 'review', title: 'Governance Analyst', desc: 'Classify and govern sensitive data', name: 'Priya' },
      { id: 'marcus', icon: 'shield', title: 'Security Leader', desc: 'Understand risk and drive strategy', name: 'Marcus' }
    ];

    html += '<div style="display:grid;grid-template-columns:repeat(3, 200px);gap:16px;justify-content:center;margin-bottom:24px;">';
    for (var i = 0; i < personas.length; i++) {
      var p = personas[i];
      html += '<div class="onb-persona-card" data-persona="' + p.id + '" style="background:var(--sds-bg-card);border:1px solid var(--sds-border-default);border-radius:8px;padding:20px;cursor:pointer;transition:all 150ms ease;text-align:left;">';

      // Icon container
      html += '<div style="width:48px;height:48px;border-radius:12px;background:var(--sds-interactive-primary-subtle, rgba(1,61,91,0.08));display:flex;align-items:center;justify-content:center;margin-bottom:16px;">';
      html += '<span style="color:var(--sds-interactive-primary);display:flex;align-items:center;justify-content:center;width:24px;height:24px;">' + Icons.render(p.icon, 24) + '</span>';
      html += '</div>';

      html += '<div style="font-size:16px;font-weight:600;color:var(--sds-text-primary);margin-bottom:4px;">' + p.title + '</div>';
      html += '<div style="font-size:13px;color:var(--sds-text-secondary);line-height:1.4;">' + p.desc + '</div>';
      html += '</div>';
    }
    html += '</div>';

    // Skip link
    html += '<div style="font-size:13px;color:var(--sds-text-tertiary);">Already know the product?</div>';
    html += '<a data-navigate="#/dashboard" class="onb-skip-link" style="font-size:13px;font-weight:500;color:var(--sds-text-link);cursor:pointer;text-decoration:none;">Skip to Dashboard &rarr;</a>';

    html += '</div></div>';
    content.innerHTML = html;

    // Event: persona card click
    content.onclick = function(e) {
      var card = e.target.closest('[data-persona]');
      if (card) {
        var persona = card.getAttribute('data-persona');
        onboardingState.persona = persona;
        onboardingState.currentStep = 0;
        saveOnboardingState();

        // Visual feedback
        var cards = content.querySelectorAll('.onb-persona-card');
        for (var j = 0; j < cards.length; j++) {
          cards[j].style.opacity = cards[j] === card ? '1' : '0.5';
          cards[j].style.borderColor = cards[j] === card ? 'var(--sds-interactive-primary)' : 'var(--sds-border-default)';
          cards[j].style.background = cards[j] === card ? 'var(--sds-interactive-primary-subtle, rgba(1,61,91,0.06))' : 'var(--sds-bg-card)';
        }

        // Navigate based on persona
        setTimeout(function() {
          if (persona === 'marcus') {
            Router.navigate('/onboarding/demo');
          } else {
            Router.navigate('/onboarding/dashboard');
          }
        }, 300);
      }

      // Coach mark dismiss
      if (e.target.closest('.onb-coach-dismiss')) {
        var mark = e.target.closest('.onb-coach-mark');
        if (mark) mark.style.display = 'none';
      }
    };
  }


  /* ================================================================
     SCREEN 2: Onboarding Dashboard
     ================================================================ */
  function renderOnboardingDashboard() {
    restoreShell();
    var content = document.getElementById('content');
    var ob = getOnboardingState();
    var stepIdx = ob.currentStep || 0;

    var html = '';
    html += Components.pageHeader('Getting Started', 'Complete these 5 steps to see your first risk score');
    html += '<div style="max-width:960px;margin-top:24px;">';

    // Progress Tracker
    html += renderProgressTracker(stepIdx);

    html += '<div style="height:24px;"></div>';

    // Current step card
    var step = steps[stepIdx];
    html += '<div style="background:var(--sds-bg-card);border:1px solid var(--sds-border-default);border-radius:8px;padding:24px;">';
    html += '<div style="display:flex;gap:20px;align-items:flex-start;">';

    // Step icon
    html += '<div style="width:48px;height:48px;border-radius:12px;background:var(--sds-interactive-primary-subtle, rgba(1,61,91,0.08));display:flex;align-items:center;justify-content:center;flex-shrink:0;">';
    html += '<span style="color:var(--sds-interactive-primary);display:flex;align-items:center;justify-content:center;width:24px;height:24px;">' + Icons.render(step.icon, 24) + '</span>';
    html += '</div>';

    html += '<div style="flex:1;">';
    html += '<h2 style="font-size:18px;font-weight:600;color:var(--sds-text-primary);margin:0 0 8px 0;">' + step.description + '</h2>';
    html += '<p style="font-size:14px;color:var(--sds-text-secondary);margin:0 0 16px 0;max-width:480px;line-height:1.5;">' + step.detail + '</p>';

    html += '<div style="display:flex;gap:12px;align-items:center;">';
    html += Components.button('Start Step ' + (stepIdx + 1), 'primary', 'md', 'data-navigate="#' + step.route + '"');
    html += '<span style="font-size:12px;color:var(--sds-text-tertiary);">Estimated time: ' + step.time + '</span>';
    html += '</div>';
    html += '</div></div></div>';

    // Coming up next
    var upcomingSteps = [];
    for (var i = stepIdx + 1; i < steps.length && upcomingSteps.length < 2; i++) {
      upcomingSteps.push({ index: i, step: steps[i] });
    }

    if (upcomingSteps.length > 0) {
      html += '<div style="height:16px;"></div>';
      html += '<div style="background:var(--sds-bg-subtle);border:1px solid var(--sds-border-subtle, var(--sds-border-default));border-radius:8px;padding:16px 20px;">';
      html += '<div style="font-size:13px;font-weight:600;color:var(--sds-text-tertiary);margin-bottom:12px;">COMING UP NEXT</div>';
      for (var u = 0; u < upcomingSteps.length; u++) {
        var us = upcomingSteps[u];
        if (u > 0) html += '<div style="border-top:1px solid var(--sds-border-default);margin:8px 0;"></div>';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;">';
        html += '<span style="font-size:13px;font-weight:500;color:var(--sds-text-secondary);">Step ' + (us.index + 1) + ': ' + us.step.description + '</span>';
        html += '<span style="font-size:12px;color:var(--sds-text-tertiary);">' + us.step.time + '</span>';
        html += '</div>';
      }
      html += '</div>';
    }

    html += '</div>';
    content.innerHTML = html;
  }


  /* ================================================================
     SCREEN 3: Guided Connection Setup
     ================================================================ */
  function renderGuidedConnection() {
    restoreShell();
    var content = document.getElementById('content');
    var ob = getOnboardingState();

    var html = '';
    html += Components.breadcrumb([
      { label: 'Getting started', href: '#/onboarding/dashboard' },
      { label: 'Connect data source' }
    ]);
    html += Components.pageHeader('Connect Your First Data Source', 'Choose a platform and enter your credentials. We will test the connection automatically.');
    html += '<div style="max-width:640px;margin-top:8px;">';
    html += renderMiniProgress(0);
    html += '<div style="height:20px;"></div>';

    // Platform quick-select
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">';
    for (var i = 0; i < platforms.length; i++) {
      var pl = platforms[i];
      var isSelected = ob.selectedPlatform === pl.id;
      var borderStyle = isSelected ? '2px solid var(--sds-interactive-primary)' : '1px solid var(--sds-border-default)';
      var bgStyle = isSelected ? 'var(--sds-interactive-primary-subtle, rgba(1,61,91,0.06))' : 'var(--sds-bg-card)';

      html += '<div class="onb-platform-card" data-platform="' + pl.id + '" style="background:' + bgStyle + ';border:' + borderStyle + ';border-radius:8px;padding:16px;cursor:pointer;transition:all 150ms ease;display:flex;align-items:center;gap:12px;">';
      html += '<div style="width:32px;height:32px;border-radius:8px;background:' + pl.color + ';display:flex;align-items:center;justify-content:center;">';
      html += '<span style="color:white;font-size:12px;font-weight:700;">' + pl.name.charAt(0) + '</span>';
      html += '</div>';
      html += '<span style="font-size:14px;font-weight:500;color:var(--sds-text-primary);">' + pl.name + '</span>';
      html += '</div>';
    }
    html += '</div>';

    // Connection form (shown when platform selected)
    if (ob.selectedPlatform) {
      var platName = ob.selectedPlatform.charAt(0).toUpperCase() + ob.selectedPlatform.slice(1);
      for (var p = 0; p < platforms.length; p++) {
        if (platforms[p].id === ob.selectedPlatform) platName = platforms[p].name;
      }

      html += renderCoachMark('This is where you will enter the details from your ' + platName + ' account. Each field has a helper tip below it.', 'connection');

      html += '<div style="background:var(--sds-bg-card);border:1px solid var(--sds-border-default);border-radius:8px;padding:24px;margin-bottom:16px;">';

      html += Components.formGroup('Connection name *', Components.formInput('conn_name', '', 'My ' + platName), 'A friendly name to identify this connection later');
      html += '<div style="height:12px;"></div>';
      html += Components.formGroup('Account URL *', Components.formInput('account_url', '', 'https://'), 'Found in ' + platName + ' under Admin > Accounts');
      html += '<div style="height:12px;"></div>';
      html += Components.formGroup('Username *', Components.formInput('username', '', 'service_account'), 'The service account with read-only access');
      html += '<div style="height:12px;"></div>';
      html += Components.formGroup('Password *', Components.formInput('password', '', '', 'password'), 'Service account password or API key');

      // OR divider
      html += '<div style="display:flex;align-items:center;gap:12px;margin:20px 0;">';
      html += '<div style="flex:1;height:1px;background:var(--sds-border-subtle, var(--sds-border-default));"></div>';
      html += '<span style="font-size:13px;color:var(--sds-text-disabled);font-weight:500;">OR</span>';
      html += '<div style="flex:1;height:1px;background:var(--sds-border-subtle, var(--sds-border-default));"></div>';
      html += '</div>';

      html += '<button class="btn btn-primary btn-lg" style="width:100%;" data-action="oauth">Connect with OAuth</button>';
      html += '<div style="font-size:12px;color:var(--sds-text-tertiary);text-align:center;margin-top:8px;">Fastest option &mdash; one click to connect</div>';

      html += '<div style="height:20px;"></div>';
      html += '<div style="display:flex;gap:12px;">';
      html += Components.button('Test Connection', 'primary', 'md', 'data-action="test-connection"');
      html += Components.button('Cancel', 'secondary', 'md', 'data-navigate="#/onboarding/dashboard"');
      html += '</div>';

      html += '</div>';

      // Troubleshooting panel
      html += '<div style="background:var(--sds-bg-card);border:1px solid var(--sds-border-default);border-radius:8px;padding:20px;">';
      html += '<div style="font-size:14px;font-weight:600;color:var(--sds-text-primary);margin-bottom:12px;">Common issues</div>';
      html += '<ul style="margin:0;padding-left:20px;font-size:13px;color:var(--sds-text-secondary);line-height:1.8;">';
      html += '<li>Make sure your IP is whitelisted in ' + platName + '</li>';
      html += '<li>Check that the service account has read permissions</li>';
      html += '<li>Verify the account URL format matches the example</li>';
      html += '</ul>';
      html += '</div>';
    }

    html += '</div>';
    content.innerHTML = html;

    // Events
    content.onclick = function(e) {
      // Platform selection
      var platCard = e.target.closest('[data-platform]');
      if (platCard) {
        onboardingState.selectedPlatform = platCard.getAttribute('data-platform');
        saveOnboardingState();
        renderGuidedConnection();
        return;
      }

      // Test connection / OAuth
      if (e.target.closest('[data-action="test-connection"]') || e.target.closest('[data-action="oauth"]')) {
        var btn = e.target.closest('.btn');
        if (btn) {
          btn.textContent = 'Connecting...';
          btn.disabled = true;
        }
        setTimeout(function() {
          onboardingState.completedSteps.push(0);
          onboardingState.currentStep = 1;
          saveOnboardingState();
          Router.navigate('/onboarding/scan');
        }, 1500);
        return;
      }

      // Coach dismiss
      if (e.target.closest('.onb-coach-dismiss')) {
        var mark = e.target.closest('.onb-coach-mark');
        if (mark) mark.style.display = 'none';
      }
    };
  }


  /* ================================================================
     SCREEN 4: First Scan Progress
     ================================================================ */
  function renderFirstScanProgress() {
    restoreShell();
    var content = document.getElementById('content');

    var html = '';
    html += Components.breadcrumb([
      { label: 'Getting started', href: '#/onboarding/dashboard' },
      { label: 'Scanning' }
    ]);
    html += Components.pageHeader('Scanning Your Data', 'We are analyzing your connected source to discover and classify sensitive data.');
    html += '<div style="max-width:640px;margin-top:8px;">';
    html += renderMiniProgress(1);
    html += '<div style="height:20px;"></div>';

    // Scan progress card
    html += '<div style="background:var(--sds-bg-card);border:1px solid var(--sds-border-default);border-radius:8px;padding:24px;">';

    // Progress bar
    html += '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;">';
    html += '<span style="font-size:14px;font-weight:500;color:var(--sds-text-primary);">Scanning...</span>';
    html += '<span id="scan-pct" style="font-size:24px;font-weight:600;color:var(--sds-text-primary);">0%</span>';
    html += '</div>';
    html += '<div style="background:var(--sds-bg-subtle);height:8px;border-radius:4px;overflow:hidden;">';
    html += '<div id="scan-bar" style="height:100%;border-radius:4px;background:linear-gradient(90deg, var(--sds-interactive-primary), var(--sds-color-blue-400, #5E96AB));width:0%;transition:width 1s ease;"></div>';
    html += '</div>';

    // Current phase
    html += '<div id="scan-phase" style="font-size:14px;font-weight:500;color:var(--sds-text-primary);margin-top:16px;">Discovering tables...</div>';

    // Educational tooltip
    var eduTexts = [
      'Table discovery scans your connected schemas to find all available data tables and their structures.',
      'Pattern analysis looks at column names, data types, and sample values to identify fields like email addresses, phone numbers, and social security numbers.',
      'Sensitivity detection applies classification rules and machine learning models to determine which fields contain sensitive information.',
      'Confidence scoring calculates how certain the system is about each classification based on multiple signals.'
    ];

    html += '<div id="scan-edu" style="background:var(--sds-status-info-bg);border:1px solid var(--sds-color-blue-200, #A6CBD6);border-radius:8px;padding:16px;margin-top:16px;">';
    html += '<div style="display:flex;gap:10px;">';
    html += '<span style="color:var(--sds-color-blue-450, #4F8AA0);flex-shrink:0;margin-top:1px;">' + Icons.info + '</span>';
    html += '<span id="scan-edu-text" style="font-size:13px;color:var(--sds-status-info-text, #0C4A69);line-height:1.5;">' + eduTexts[0] + '</span>';
    html += '</div></div>';

    // Phase timeline
    var phases = ['Discovering tables...', 'Analyzing column patterns...', 'Identifying sensitive data...', 'Calculating confidence scores...'];
    html += '<div style="margin-top:20px;">';
    for (var i = 0; i < phases.length; i++) {
      html += '<div id="phase-' + i + '" style="display:flex;align-items:center;gap:10px;padding:6px 0;font-size:13px;">';
      html += '<span class="phase-icon" style="width:18px;height:18px;display:flex;align-items:center;justify-content:center;color:var(--sds-text-disabled);">';
      html += '<svg viewBox="0 0 18 18" width="14" height="14"><circle cx="9" cy="9" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
      html += '</span>';
      html += '<span class="phase-text" style="color:var(--sds-text-disabled);">' + phases[i] + '</span>';
      html += '<span class="phase-count" style="color:var(--sds-text-tertiary);"></span>';
      html += '</div>';
    }
    html += '</div>';

    html += '<div id="scan-time" style="font-size:12px;color:var(--sds-text-tertiary);margin-top:12px;">Estimated time remaining: ~5 minutes</div>';
    html += '</div>';

    // Discovery stats
    html += '<div style="height:16px;"></div>';
    html += '<div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;">';
    var statLabels = ['Tables', 'Columns', 'Sensitive'];
    var statIds = ['scan-tables', 'scan-columns', 'scan-sensitive'];
    for (var s = 0; s < 3; s++) {
      html += '<div style="background:var(--sds-bg-card);border:1px solid var(--sds-border-default);border-radius:8px;padding:16px;text-align:center;">';
      html += '<div style="font-size:13px;color:var(--sds-text-secondary);margin-bottom:4px;">' + statLabels[s] + '</div>';
      html += '<div id="' + statIds[s] + '" style="font-size:24px;font-weight:600;color:var(--sds-text-primary);' + (s === 2 ? 'color:var(--sds-status-warning-text);' : '') + '">0</div>';
      html += '</div>';
    }
    html += '</div>';

    // Continue button (hidden initially)
    html += '<div id="scan-complete-btn" style="display:none;margin-top:20px;text-align:center;">';
    html += Components.button('Continue to Review', 'primary', 'md', 'data-navigate="#/onboarding/review"');
    html += '</div>';

    html += '</div>';
    content.innerHTML = html;

    // Animate scan progress
    var progress = 0;
    var phaseThresholds = [25, 60, 85, 100];
    var phaseCounts = ['23 found', '142 columns', '12 sensitive', 'complete'];
    var tableCount = 0, colCount = 0, sensCount = 0;

    clearScanInterval();
    scanInterval = setInterval(function() {
      progress += Math.random() * 8 + 2;
      if (progress > 100) progress = 100;

      var bar = document.getElementById('scan-bar');
      var pct = document.getElementById('scan-pct');
      if (bar) bar.style.width = Math.round(progress) + '%';
      if (pct) pct.textContent = Math.round(progress) + '%';

      // Update phases
      for (var pi = 0; pi < phaseThresholds.length; pi++) {
        var phaseEl = document.getElementById('phase-' + pi);
        if (!phaseEl) continue;
        var icon = phaseEl.querySelector('.phase-icon');
        var text = phaseEl.querySelector('.phase-text');
        var count = phaseEl.querySelector('.phase-count');

        if (progress >= phaseThresholds[pi]) {
          // Completed
          if (icon) icon.innerHTML = '<span style="color:var(--sds-status-success-strong);">' + Icons.check + '</span>';
          if (text) text.style.color = 'var(--sds-text-secondary)';
          if (count) { count.textContent = '(' + phaseCounts[pi] + ')'; count.style.color = 'var(--sds-text-tertiary)'; }
        } else if (pi === 0 || progress >= phaseThresholds[pi - 1]) {
          // Active
          if (icon) icon.innerHTML = '<span style="color:var(--sds-interactive-primary);animation:onb-spin 1s linear infinite;">&#8635;</span>';
          if (text) { text.style.color = 'var(--sds-text-primary)'; text.style.fontWeight = '500'; }
        }
      }

      // Update stats
      var tEl = document.getElementById('scan-tables');
      var cEl = document.getElementById('scan-columns');
      var sEl = document.getElementById('scan-sensitive');
      if (progress < 30) { tableCount = Math.min(23, Math.round(progress * 0.9)); }
      else { tableCount = 23; }
      if (progress > 25) { colCount = Math.min(142, Math.round((progress - 25) * 2.4)); }
      if (progress > 60) { sensCount = Math.min(12, Math.round((progress - 60) * 0.48)); }
      if (tEl) tEl.textContent = tableCount;
      if (cEl) cEl.textContent = colCount;
      if (sEl) sEl.textContent = sensCount;

      // Update edu text
      var eduEl = document.getElementById('scan-edu-text');
      if (eduEl) {
        var eduIdx = 0;
        if (progress >= 85) eduIdx = 3;
        else if (progress >= 60) eduIdx = 2;
        else if (progress >= 25) eduIdx = 1;
        eduEl.textContent = eduTexts[eduIdx];
      }

      // Phase label
      var phaseLabel = document.getElementById('scan-phase');
      if (phaseLabel) {
        if (progress >= 85) phaseLabel.textContent = 'Calculating confidence scores...';
        else if (progress >= 60) phaseLabel.textContent = 'Identifying sensitive data...';
        else if (progress >= 25) phaseLabel.textContent = 'Analyzing column patterns...';
        else phaseLabel.textContent = 'Discovering tables...';
      }

      // Time estimate
      var timeEl = document.getElementById('scan-time');
      if (timeEl) {
        var remaining = Math.max(0, Math.round((100 - progress) / 10));
        timeEl.textContent = remaining > 0 ? 'Estimated time remaining: ~' + remaining + ' minutes' : 'Almost done...';
      }

      // Complete
      if (progress >= 100) {
        clearScanInterval();
        if (phaseLabel) phaseLabel.textContent = 'Scan complete!';
        if (timeEl) timeEl.textContent = '';
        var completeBtn = document.getElementById('scan-complete-btn');
        if (completeBtn) completeBtn.style.display = 'block';

        onboardingState.completedSteps.push(1);
        onboardingState.currentStep = 2;
        saveOnboardingState();

        // Auto-advance after 2s
        setTimeout(function() {
          Router.navigate('/onboarding/review');
        }, 2000);
      }
    }, 800);
  }


  /* ================================================================
     SCREEN 5: Guided Classification Review
     ================================================================ */
  function renderGuidedReview() {
    restoreShell();
    var content = document.getElementById('content');
    var ob = getOnboardingState();
    var reviewed = ob.reviewedItems || [];
    var activeIdx = 0;
    for (var r = 0; r < reviewItems.length; r++) {
      if (reviewed.indexOf(reviewItems[r].id) === -1) { activeIdx = r; break; }
      if (r === reviewItems.length - 1) activeIdx = r;
    }

    function renderReviewScreen(selectedIdx) {
      var html = '';
      html += Components.breadcrumb([
        { label: 'Getting started', href: '#/onboarding/dashboard' },
        { label: 'Review classifications' }
      ]);
      html += Components.pageHeader('Review Classifications', reviewed.length + ' of ' + reviewItems.length + ' reviewed');
      html += renderMiniProgress(2);
      html += '<div style="height:16px;"></div>';

      html += '<div style="display:grid;grid-template-columns:280px 1fr;gap:0;border:1px solid var(--sds-border-default);border-radius:8px;overflow:hidden;min-height:480px;">';

      // Left: review list
      html += '<div style="background:var(--sds-bg-surface);border-right:1px solid var(--sds-border-default);">';
      for (var li = 0; li < reviewItems.length; li++) {
        var item = reviewItems[li];
        var isActive = li === selectedIdx;
        var isReviewed = reviewed.indexOf(item.id) > -1;

        html += '<div class="onb-review-item" data-review-idx="' + li + '" style="padding:12px 16px;cursor:pointer;border-left:3px solid ' + (isActive ? 'var(--sds-interactive-primary)' : 'transparent') + ';background:' + (isActive ? 'var(--sds-nav-item-active-bg, rgba(1,61,91,0.06))' : 'transparent') + ';' + (li < reviewItems.length - 1 ? 'border-bottom:1px solid var(--sds-border-default);' : '') + '">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;">';
        html += '<span style="font-size:14px;font-weight:500;color:var(--sds-text-primary);">';
        if (isReviewed) html += '<span style="color:var(--sds-status-success-strong);margin-right:6px;">' + Icons.check + '</span>';
        html += item.type + '</span>';

        var confColor = item.confidence >= 90 ? 'var(--sds-status-success-text)' : (item.confidence >= 70 ? 'var(--sds-status-warning-text)' : 'var(--sds-status-error-text)');
        html += '<span style="font-size:12px;font-weight:600;color:' + confColor + ';">' + item.confidence + '%</span>';
        html += '</div>';
        html += '<div style="font-size:12px;color:var(--sds-text-tertiary);margin-top:2px;">' + item.field + '</div>';
        html += '</div>';
      }

      html += '<div style="padding:12px 16px;font-size:13px;font-weight:500;color:var(--sds-text-tertiary);border-top:1px solid var(--sds-border-default);">' + reviewed.length + ' of ' + reviewItems.length + ' reviewed</div>';
      html += '</div>';

      // Right: detail panel
      var sel = reviewItems[selectedIdx];
      html += '<div style="background:var(--sds-bg-page);padding:24px;">';
      html += '<div style="font-size:20px;font-weight:600;color:var(--sds-text-primary);margin-bottom:4px;">' + sel.type + '</div>';
      html += '<div style="font-size:13px;color:var(--sds-text-link);font-family:monospace;margin-bottom:4px;">' + sel.field + '</div>';
      html += '<div style="font-size:12px;color:var(--sds-text-tertiary);margin-bottom:16px;">' + sel.source + '</div>';

      // Coach mark on first item
      if (selectedIdx === 0 && reviewed.length === 0) {
        html += renderCoachMark('This is a classification suggestion. The confidence score tells you how certain the system is. You can accept, override, or reject each one.', 'review');
      }

      // Confidence bar
      html += '<div style="margin-bottom:16px;">';
      html += '<div style="font-size:13px;font-weight:500;color:var(--sds-text-secondary);margin-bottom:6px;">Confidence</div>';
      var barColor = sel.confidence >= 90 ? 'var(--sds-status-success-strong)' : (sel.confidence >= 70 ? 'var(--sds-status-warning-strong, #EBCE2D)' : 'var(--sds-status-error-strong)');
      html += '<div style="display:flex;align-items:center;gap:12px;">';
      html += '<div style="flex:1;background:var(--sds-bg-subtle);height:8px;border-radius:4px;overflow:hidden;">';
      html += '<div style="width:' + sel.confidence + '%;height:100%;background:' + barColor + ';border-radius:4px;"></div>';
      html += '</div>';
      html += '<span style="font-size:14px;font-weight:600;color:' + confColor + ';">' + sel.confidence + '%</span>';
      html += '</div></div>';

      // Classification reasoning
      html += '<div style="background:var(--sds-bg-subtle);border:1px solid var(--sds-border-subtle, var(--sds-border-default));border-radius:8px;padding:16px;margin-bottom:16px;">';
      html += '<div style="font-size:13px;font-weight:600;color:var(--sds-text-primary);margin-bottom:8px;">Classification Reasoning</div>';
      html += '<ul style="margin:0;padding-left:18px;font-size:13px;color:var(--sds-text-secondary);line-height:1.8;">';
      for (var ri = 0; ri < sel.reasoning.length; ri++) {
        html += '<li>' + sel.reasoning[ri] + '</li>';
      }
      html += '</ul></div>';

      // Sample data
      html += '<div style="background:var(--sds-bg-card);border:1px solid var(--sds-border-default);border-radius:8px;padding:16px;margin-bottom:20px;">';
      html += '<div style="font-size:13px;font-weight:600;color:var(--sds-text-primary);margin-bottom:8px;">Sample Data Preview</div>';
      for (var si = 0; si < sel.samples.length; si++) {
        html += '<div style="font-size:13px;font-family:monospace;color:var(--sds-text-primary);padding:4px 0;' + (si < sel.samples.length - 1 ? 'border-bottom:1px solid var(--sds-border-default);' : '') + '">' + sel.samples[si] + '</div>';
      }
      html += '</div>';

      // Action buttons
      if (reviewed.indexOf(sel.id) === -1) {
        html += '<div style="display:flex;gap:12px;">';
        html += Components.button('Accept', 'primary', 'md', 'data-review-action="accept" data-review-id="' + sel.id + '"');
        html += Components.button('Override', 'secondary', 'md', 'data-review-action="override" data-review-id="' + sel.id + '"');
        html += '<button class="btn btn-md" style="border:1px solid var(--sds-status-error-strong);color:var(--sds-status-error-text);background:transparent;" data-review-action="reject" data-review-id="' + sel.id + '">Reject</button>';
        html += '</div>';

        // Explanation
        html += '<div style="background:var(--sds-status-info-bg);border:1px solid var(--sds-color-blue-200, #A6CBD6);border-radius:8px;padding:12px 16px;margin-top:12px;font-size:12px;color:var(--sds-status-info-text, #0C4A69);line-height:1.5;">';
        html += '<strong>Accept:</strong> confirms the classification &nbsp;&middot;&nbsp; <strong>Override:</strong> change to a different type &nbsp;&middot;&nbsp; <strong>Reject:</strong> mark as not sensitive';
        html += '</div>';
      } else {
        html += '<div style="display:flex;align-items:center;gap:8px;padding:12px 0;">';
        html += '<span style="color:var(--sds-status-success-strong);">' + Icons.check + '</span>';
        html += '<span style="font-size:14px;font-weight:500;color:var(--sds-status-success-text);">Reviewed</span>';
        html += '</div>';
      }

      html += '</div>'; // detail panel
      html += '</div>'; // grid

      // All reviewed: show continue
      if (reviewed.length >= reviewItems.length) {
        html += '<div style="text-align:center;margin-top:20px;padding:24px;background:var(--sds-bg-card);border:1px solid var(--sds-border-default);border-radius:8px;">';
        html += '<div style="color:var(--sds-status-success-strong);margin-bottom:8px;">' + Icons.render('check', 32) + '</div>';
        html += '<div style="font-size:16px;font-weight:600;color:var(--sds-text-primary);margin-bottom:16px;">All classifications reviewed!</div>';
        html += Components.button('Continue to Risk Score', 'primary', 'md', 'data-navigate="#/onboarding/score"');
        html += '</div>';
      }

      return html;
    }

    content.innerHTML = renderReviewScreen(activeIdx);

    content.onclick = function(e) {
      // Switch review item
      var itemEl = e.target.closest('[data-review-idx]');
      if (itemEl) {
        var idx = parseInt(itemEl.getAttribute('data-review-idx'), 10);
        content.innerHTML = renderReviewScreen(idx);
        return;
      }

      // Review actions
      var actionBtn = e.target.closest('[data-review-action]');
      if (actionBtn) {
        var rid = actionBtn.getAttribute('data-review-id');
        if (reviewed.indexOf(rid) === -1) {
          reviewed.push(rid);
          onboardingState.reviewedItems = reviewed;
          saveOnboardingState();
        }

        // Find next unreviewed
        var nextIdx = -1;
        for (var ni = 0; ni < reviewItems.length; ni++) {
          if (reviewed.indexOf(reviewItems[ni].id) === -1) { nextIdx = ni; break; }
        }

        if (reviewed.length >= reviewItems.length) {
          onboardingState.completedSteps.push(2);
          onboardingState.currentStep = 3;
          saveOnboardingState();
          content.innerHTML = renderReviewScreen(reviewItems.length - 1);

          // Auto-advance
          setTimeout(function() {
            Router.navigate('/onboarding/score');
          }, 2000);
        } else {
          content.innerHTML = renderReviewScreen(nextIdx >= 0 ? nextIdx : 0);
        }
        return;
      }

      // Coach dismiss
      if (e.target.closest('.onb-coach-dismiss')) {
        var mark = e.target.closest('.onb-coach-mark');
        if (mark) mark.style.display = 'none';
      }
    };
  }


  /* ================================================================
     SCREEN 6: Risk Score Reveal  -- THE "AHA" MOMENT
     ================================================================ */
  function renderRiskScoreReveal() {
    restoreShell();
    var content = document.getElementById('content');
    var score = Data.riskScore.current; // 67

    var html = '';
    html += Components.pageHeader('Your Risk Score');
    html += '<div style="max-width:800px;margin-top:8px;">';
    html += renderMiniProgress(3);
    html += '<div style="height:24px;"></div>';

    // Gauge card
    html += '<div style="background:var(--sds-bg-card);border:1px solid var(--sds-border-default);border-radius:8px;padding:40px 24px;text-align:center;">';
    html += '<div id="score-gauge-container">' + Charts.gauge(score, 240) + '</div>';

    // Risk label
    var riskLabel, riskColor;
    if (score <= 25) { riskLabel = 'LOW RISK'; riskColor = 'var(--sds-status-success-text)'; }
    else if (score <= 50) { riskLabel = 'MODERATE RISK'; riskColor = 'var(--sds-status-warning-text)'; }
    else if (score <= 75) { riskLabel = 'HIGH RISK'; riskColor = 'var(--sds-color-red-500, #BF5547)'; }
    else { riskLabel = 'CRITICAL RISK'; riskColor = 'var(--sds-status-error-text)'; }

    html += '<div style="font-size:14px;font-weight:600;color:' + riskColor + ';margin-top:8px;letter-spacing:1px;">' + riskLabel + '</div>';
    html += '</div>';

    // Score explanation
    html += '<div style="height:16px;"></div>';
    html += '<div style="background:var(--sds-bg-card);border:1px solid var(--sds-border-default);border-radius:8px;padding:24px;">';
    html += '<div style="font-size:16px;font-weight:600;color:var(--sds-text-primary);margin-bottom:16px;">Your score is ' + score + ' (' + riskLabel.replace(' RISK', '') + ' Risk) because:</div>';

    var factors = [
      { label: '12 unprotected PII fields in 3 tables', weight: 35, points: Data.riskScore.breakdown.unprotected },
      { label: '4 fields with public access that contain sensitive data', weight: 25, points: Data.riskScore.breakdown.policyViolations },
      { label: 'No encryption detected on 2 database connections', weight: 20, points: Data.riskScore.breakdown.unclassified },
      { label: '5 open remediation tasks past due', weight: 15, points: Data.riskScore.breakdown.openRemediations }
    ];

    for (var f = 0; f < factors.length; f++) {
      html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">';
      html += '<div style="width:80px;flex-shrink:0;">';
      html += '<div style="background:var(--sds-bg-subtle);height:8px;border-radius:4px;overflow:hidden;">';
      html += '<div style="width:' + factors[f].weight + '%;height:100%;background:var(--sds-status-error-strong);border-radius:4px;"></div>';
      html += '</div></div>';
      html += '<span style="font-size:14px;color:var(--sds-text-secondary);line-height:1.4;">' + factors[f].label + '</span>';
      html += '</div>';
    }
    html += '</div>';

    // Improvement suggestion
    html += '<div style="height:16px;"></div>';
    html += '<div style="background:var(--sds-status-info-bg);border:1px solid var(--sds-color-blue-200, #A6CBD6);border-radius:8px;padding:20px 24px;">';
    html += '<div style="font-size:14px;color:var(--sds-status-info-text, #0C4A69);line-height:1.5;margin-bottom:16px;">';
    html += 'Addressing the top issue could reduce your score by an estimated <strong style="color:var(--sds-status-success-text);">15 points</strong>.';
    html += '</div>';
    html += '<div style="display:flex;gap:12px;">';

    if (score > 25) {
      html += Components.button('Take Action', 'primary', 'md', 'data-navigate="#/onboarding/remediate"');
    } else {
      html += Components.button('Set Up Monitoring', 'primary', 'md', 'data-navigate="#/onboarding/monitor"');
    }
    html += Components.button('Set Up Monitoring', 'secondary', 'md', 'data-navigate="#/onboarding/monitor"');
    html += '</div>';
    html += '</div>';

    html += '</div>';
    content.innerHTML = html;

    // Mark step complete
    if (onboardingState.completedSteps.indexOf(3) === -1) {
      onboardingState.completedSteps.push(3);
      onboardingState.currentStep = 4;
      saveOnboardingState();
    }
  }


  /* ================================================================
     SCREEN 7: First Remediation
     ================================================================ */
  function renderFirstRemediation() {
    restoreShell();
    var content = document.getElementById('content');
    var ob = getOnboardingState();
    var currentTab = ob.remediationTab || 0;

    var html = '';
    html += Components.breadcrumb([
      { label: 'Getting started', href: '#/onboarding/dashboard' },
      { label: 'Take action' }
    ]);
    html += Components.pageHeader('Take Your First Action', 'Let us fix the top risk factor to lower your score.');
    html += '<div style="max-width:720px;margin-top:8px;">';
    html += renderMiniProgress(4);
    html += '<div style="height:20px;"></div>';

    // Sub-step tabs
    var tabLabels = ['1. Select Action', '2. Preview', '3. Execute'];
    html += '<div style="display:flex;border-bottom:2px solid var(--sds-border-default);margin-bottom:24px;">';
    for (var t = 0; t < tabLabels.length; t++) {
      var isActive = t === currentTab;
      var isDisabled = t > currentTab;
      html += '<div style="padding:10px 20px;font-size:14px;font-weight:' + (isActive ? '600' : '500') + ';color:' + (isDisabled ? 'var(--sds-text-disabled)' : (isActive ? 'var(--sds-interactive-primary)' : 'var(--sds-text-secondary)')) + ';border-bottom:2px solid ' + (isActive ? 'var(--sds-interactive-primary)' : 'transparent') + ';margin-bottom:-2px;cursor:' + (isDisabled ? 'default' : 'pointer') + ';">' + tabLabels[t] + '</div>';
    }
    html += '</div>';

    // Tab content
    if (currentTab === 0) {
      // Tab 1: Select Action
      html += '<div style="background:var(--sds-interactive-primary-subtle, rgba(1,61,91,0.06));border:2px solid var(--sds-interactive-primary);border-radius:8px;padding:20px;margin-bottom:12px;cursor:pointer;" data-action-card="mask">';
      html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;">';
      html += '<div>';
      html += '<div style="font-size:15px;font-weight:600;color:var(--sds-text-primary);margin-bottom:4px;">Apply masking to 12 PII fields</div>';
      html += '<div style="font-size:13px;color:var(--sds-text-secondary);">in users, transactions, contacts tables</div>';
      html += '</div>';
      html += Components.tag('Recommended', 'success');
      html += '</div>';
      html += '<div style="font-size:14px;font-weight:600;color:var(--sds-status-success-text);margin-top:8px;">Estimated score reduction: -15 points</div>';
      html += '</div>';

      html += '<div style="background:var(--sds-bg-card);border:1px solid var(--sds-border-default);border-radius:8px;padding:20px;margin-bottom:20px;cursor:pointer;" data-action-card="access">';
      html += '<div style="font-size:15px;font-weight:600;color:var(--sds-text-primary);margin-bottom:4px;">Restrict public access on 4 fields</div>';
      html += '<div style="font-size:13px;color:var(--sds-text-secondary);">Remove public read access from sensitive columns</div>';
      html += '<div style="font-size:14px;font-weight:600;color:var(--sds-status-success-text);margin-top:8px;">Estimated score reduction: -8 points</div>';
      html += '</div>';

      html += Components.button('Continue to Preview', 'primary', 'md', 'data-rem-tab="1"');

    } else if (currentTab === 1) {
      // Tab 2: Preview
      html += '<div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;margin-bottom:16px;">';
      var previewStats = [
        { label: 'Fields affected', value: '12' },
        { label: 'Tables affected', value: '3' },
        { label: 'Score impact', value: '-15 pts' }
      ];
      for (var ps = 0; ps < previewStats.length; ps++) {
        html += '<div style="background:var(--sds-bg-card);border:1px solid var(--sds-border-default);border-radius:8px;padding:16px;text-align:center;">';
        html += '<div style="font-size:13px;color:var(--sds-text-secondary);margin-bottom:4px;">' + previewStats[ps].label + '</div>';
        html += '<div style="font-size:24px;font-weight:600;color:' + (ps === 2 ? 'var(--sds-status-success-text)' : 'var(--sds-text-primary)') + ';">' + previewStats[ps].value + '</div>';
        html += '</div>';
      }
      html += '</div>';

      html += renderCoachMark('Preview shows what will change before you apply the action. Nothing has changed yet.', 'preview');

      html += '<div style="display:flex;gap:12px;margin-top:16px;">';
      html += Components.button('Execute Action', 'primary', 'md', 'data-rem-tab="2"');
      html += Components.button('Back', 'secondary', 'md', 'data-rem-tab="0"');
      html += '</div>';

    } else if (currentTab === 2) {
      // Tab 3: Execute
      html += '<div style="background:var(--sds-bg-card);border:1px solid var(--sds-border-default);border-radius:8px;padding:24px;text-align:center;">';

      html += '<div style="color:var(--sds-status-success-strong);margin-bottom:12px;">' + Icons.render('check', 32) + '</div>';
      html += '<div style="font-size:16px;font-weight:600;color:var(--sds-text-primary);margin-bottom:20px;">Action applied successfully!</div>';

      // Score delta
      html += '<div style="display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:16px;">';
      html += '<span style="font-size:24px;font-weight:400;color:var(--sds-text-tertiary);text-decoration:line-through;">67</span>';
      html += '<span style="color:var(--sds-status-success-text);font-size:20px;">&rarr;</span>';
      html += '<span style="font-size:24px;font-weight:700;color:var(--sds-status-success-text);">52</span>';
      html += '</div>';

      // Mini gauge
      html += '<div style="display:flex;justify-content:center;margin-bottom:16px;">' + Charts.gauge(52, 120) + '</div>';

      html += '<div style="font-size:16px;font-weight:600;color:var(--sds-text-primary);margin-bottom:20px;">Your risk score decreased by 15 points!</div>';

      html += Components.button('Complete Onboarding', 'primary', 'md', 'data-navigate="#/onboarding/complete"');
      html += '</div>';
    }

    html += '</div>';
    content.innerHTML = html;

    content.onclick = function(e) {
      var tabBtn = e.target.closest('[data-rem-tab]');
      if (tabBtn) {
        var tabIdx = parseInt(tabBtn.getAttribute('data-rem-tab'), 10);
        onboardingState.remediationTab = tabIdx;
        saveOnboardingState();

        if (tabIdx === 2) {
          // Simulate execution
          onboardingState.remediationTab = 2;
          onboardingState.completedSteps.push(4);
          onboardingState.currentStep = 5;
          saveOnboardingState();
        }

        renderFirstRemediation();
        return;
      }

      // Coach dismiss
      if (e.target.closest('.onb-coach-dismiss')) {
        var mark = e.target.closest('.onb-coach-mark');
        if (mark) mark.style.display = 'none';
      }
    };
  }


  /* ================================================================
     SCREEN 8: Recommended Monitoring Setup
     ================================================================ */
  function renderMonitoringSetup() {
    restoreShell();
    var content = document.getElementById('content');
    var ob = getOnboardingState();
    var mc = ob.monitoringConfigured;

    var html = '';
    html += Components.pageHeader('Set Up Monitoring', 'Your data is in good shape. Let us make sure it stays that way.');
    html += '<div style="max-width:640px;margin-top:8px;">';
    html += renderMiniProgress(4);
    html += '<div style="height:20px;"></div>';

    // Step A: Schedule
    html += '<div style="background:var(--sds-bg-card);border:1px solid var(--sds-border-default);border-radius:8px;padding:24px;margin-bottom:16px;' + (mc.schedule ? 'border-left:3px solid var(--sds-status-success-strong);' : '') + '">';
    html += '<div style="font-size:12px;font-weight:600;color:var(--sds-text-tertiary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Step A</div>';
    html += '<div style="font-size:16px;font-weight:600;color:var(--sds-text-primary);margin-bottom:8px;">Schedule Weekly Re-Scan</div>';
    html += '<div style="font-size:14px;color:var(--sds-text-secondary);margin-bottom:16px;">Automatically re-scan your connected sources weekly to detect new sensitive data.</div>';

    html += '<div style="display:flex;gap:12px;margin-bottom:12px;">';
    html += Components.formGroup('Frequency', Components.formSelect('freq', [{ value: 'weekly', label: 'Weekly' }, { value: 'daily', label: 'Daily' }, { value: 'monthly', label: 'Monthly' }], 'weekly'));
    html += Components.formGroup('Day', Components.formSelect('day', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], 'Monday'));
    html += Components.formGroup('Time', Components.formSelect('time', ['9:00 AM', '12:00 PM', '6:00 PM', '11:00 PM'], '9:00 AM'));
    html += '</div>';

    if (mc.schedule) {
      html += '<div style="font-size:13px;font-weight:500;color:var(--sds-status-success-text);display:flex;align-items:center;gap:6px;">' + Icons.check + ' Configured</div>';
    } else {
      html += '<div style="display:flex;gap:12px;">';
      html += Components.button('Configure', 'primary', 'sm', 'data-monitor-config="schedule"');
      html += '<button class="btn btn-tertiary btn-sm" style="font-size:13px;color:var(--sds-text-link);">Skip this step</button>';
      html += '</div>';
    }
    html += '</div>';

    // Step B: Alert threshold
    html += '<div style="background:var(--sds-bg-card);border:1px solid var(--sds-border-default);border-radius:8px;padding:24px;margin-bottom:16px;' + (mc.alerts ? 'border-left:3px solid var(--sds-status-success-strong);' : '') + '">';
    html += '<div style="font-size:12px;font-weight:600;color:var(--sds-text-tertiary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Step B</div>';
    html += '<div style="font-size:16px;font-weight:600;color:var(--sds-text-primary);margin-bottom:8px;">Set Alert Threshold</div>';
    html += '<div style="font-size:14px;color:var(--sds-text-secondary);margin-bottom:16px;">Get notified if your risk score goes above a threshold.</div>';

    html += '<div style="margin-bottom:12px;">';
    html += '<label style="font-size:13px;font-weight:500;color:var(--sds-text-primary);display:block;margin-bottom:8px;">Alert if score exceeds: <strong id="threshold-val">25</strong></label>';
    html += '<input type="range" min="10" max="100" value="25" step="5" style="width:100%;accent-color:var(--sds-interactive-primary);" id="threshold-slider">';
    html += '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--sds-text-tertiary);margin-top:4px;"><span>10</span><span>100</span></div>';
    html += '</div>';

    html += '<div style="margin-bottom:12px;font-size:13px;color:var(--sds-text-secondary);">Notify via:</div>';
    html += '<div style="display:flex;gap:16px;margin-bottom:12px;">';
    html += '<label style="display:flex;align-items:center;gap:6px;font-size:13px;color:var(--sds-text-primary);cursor:pointer;"><input type="checkbox" checked> Email</label>';
    html += '<label style="display:flex;align-items:center;gap:6px;font-size:13px;color:var(--sds-text-primary);cursor:pointer;"><input type="checkbox" checked> In-app</label>';
    html += '</div>';

    if (mc.alerts) {
      html += '<div style="font-size:13px;font-weight:500;color:var(--sds-status-success-text);display:flex;align-items:center;gap:6px;">' + Icons.check + ' Configured</div>';
    } else {
      html += '<div style="display:flex;gap:12px;">';
      html += Components.button('Configure', 'primary', 'sm', 'data-monitor-config="alerts"');
      html += '<button class="btn btn-tertiary btn-sm" style="font-size:13px;color:var(--sds-text-link);">Skip this step</button>';
      html += '</div>';
    }
    html += '</div>';

    // Step C: Dashboard preference
    html += '<div style="background:var(--sds-bg-card);border:1px solid var(--sds-border-default);border-radius:8px;padding:24px;margin-bottom:20px;' + (mc.dashboard ? 'border-left:3px solid var(--sds-status-success-strong);' : '') + '">';
    html += '<div style="font-size:12px;font-weight:600;color:var(--sds-text-tertiary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Step C</div>';
    html += '<div style="font-size:16px;font-weight:600;color:var(--sds-text-primary);margin-bottom:8px;">Set Dashboard Preference</div>';
    html += '<div style="font-size:14px;color:var(--sds-text-secondary);margin-bottom:16px;">Choose your default dashboard view.</div>';

    html += Components.toggleTabs([
      { id: 'operations', label: 'Operations' },
      { id: 'governance', label: 'Governance' },
      { id: 'executive', label: 'Executive' }
    ], 'operations');

    html += '<div style="height:12px;"></div>';

    if (mc.dashboard) {
      html += '<div style="font-size:13px;font-weight:500;color:var(--sds-status-success-text);display:flex;align-items:center;gap:6px;">' + Icons.check + ' Configured</div>';
    } else {
      html += '<div style="display:flex;gap:12px;">';
      html += Components.button('Configure', 'primary', 'sm', 'data-monitor-config="dashboard"');
      html += '<button class="btn btn-tertiary btn-sm" style="font-size:13px;color:var(--sds-text-link);">Skip this step</button>';
      html += '</div>';
    }
    html += '</div>';

    // Complete button
    html += Components.button('Complete Onboarding', 'primary', 'lg', 'data-navigate="#/onboarding/complete" style="width:100%;"');

    html += '</div>';
    content.innerHTML = html;

    // Slider event
    var slider = document.getElementById('threshold-slider');
    var valDisplay = document.getElementById('threshold-val');
    if (slider && valDisplay) {
      slider.addEventListener('input', function() {
        valDisplay.textContent = slider.value;
      });
    }

    // Configure events
    content.onclick = function(e) {
      var configBtn = e.target.closest('[data-monitor-config]');
      if (configBtn) {
        var key = configBtn.getAttribute('data-monitor-config');
        onboardingState.monitoringConfigured[key] = true;
        if (!onboardingState.completedSteps) onboardingState.completedSteps = [];
        if (onboardingState.completedSteps.indexOf(4) === -1) {
          onboardingState.completedSteps.push(4);
        }
        onboardingState.currentStep = 5;
        saveOnboardingState();
        renderMonitoringSetup();
        return;
      }

      // Coach dismiss
      if (e.target.closest('.onb-coach-dismiss')) {
        var mark = e.target.closest('.onb-coach-mark');
        if (mark) mark.style.display = 'none';
      }
    };
  }


  /* ================================================================
     SCREEN 9: Marcus Demo
     ================================================================ */
  function renderMarcusDemo() {
    restoreShell();
    var content = document.getElementById('content');
    var ob = getOnboardingState();
    var tourStep = ob.demoTourStep || 0;
    var tourActive = ob.demoTourActive !== false;

    // Demo mode banner
    var alertRibbon = document.getElementById('alert-ribbon');
    if (alertRibbon) {
      alertRibbon.removeAttribute('hidden');
      alertRibbon.className = 'alert-ribbon alert-ribbon--info';
      alertRibbon.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;width:100%;padding:0 20px;height:40px;">' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
          '<span style="color:var(--sds-color-blue-450, #4F8AA0);">' + Icons.info + '</span>' +
          '<span style="font-size:13px;color:var(--sds-status-info-text, #0C4A69);">You are viewing sample data. Connect your own data to see real results.</span>' +
        '</div>' +
        '<a data-navigate="#/onboarding/dashboard" style="font-size:13px;font-weight:500;color:var(--sds-text-link);cursor:pointer;text-decoration:none;">Connect Data &rarr;</a>' +
      '</div>';
    }

    var html = '';
    html += '<div style="position:relative;">';

    // Dashboard content
    html += Components.pageHeader('Risk Dashboard', '', Components.tag('Sample Data', 'info'));

    // Risk gauge + stats
    html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:16px;margin-top:20px;">';

    // Gauge card
    html += '<div style="grid-column:span 1;background:var(--sds-bg-card);border:1px solid var(--sds-border-default);border-radius:8px;padding:20px;text-align:center;" id="demo-gauge">';
    html += Charts.gauge(62, 140);
    html += '</div>';

    // Stat cards
    var demoStats = [
      { label: 'Connected Sources', value: '3' },
      { label: 'Classification Coverage', value: '87%' },
      { label: 'Policies Active', value: '14' }
    ];
    for (var ds = 0; ds < demoStats.length; ds++) {
      html += '<div style="background:var(--sds-bg-card);border:1px solid var(--sds-border-default);border-radius:8px;padding:20px;">';
      html += '<div style="font-size:13px;color:var(--sds-text-secondary);margin-bottom:4px;">' + demoStats[ds].label + '</div>';
      html += '<div style="font-size:24px;font-weight:600;color:var(--sds-text-primary);">' + demoStats[ds].value + '</div>';
      html += '</div>';
    }
    html += '</div>';

    // Risk trend
    html += '<div style="margin-top:16px;">';
    html += Components.card({
      title: 'Risk Score Trend (30 days)',
      actions: Components.tag('Sample Data', 'info'),
      body: '<div style="padding:8px 0;">' + Charts.sparkline([78, 75, 72, 70, 68, 65, 63, 62], 600, 80) + '</div>'
    });
    html += '</div>';

    // Compliance cards
    html += '<div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:16px;margin-top:16px;">';
    var complianceItems = [
      { name: 'SOC 2', pct: 89, color: '#7A9A01' }, /* token: --sds-status-success-strong — SVG stroke */
      { name: 'GDPR', pct: 78, color: '#C4AA25' }, /* token: --sds-status-warning-strong — SVG stroke */
      { name: 'HIPAA', pct: 94, color: '#7A9A01' } /* token: --sds-status-success-strong — SVG stroke */
    ];
    for (var ci = 0; ci < complianceItems.length; ci++) {
      html += '<div style="background:var(--sds-bg-card);border:1px solid var(--sds-border-default);border-radius:8px;padding:20px;">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">';
      html += '<span style="font-size:14px;font-weight:600;color:var(--sds-text-primary);">' + complianceItems[ci].name + '</span>';
      html += Components.tag('Sample Data', 'info');
      html += '</div>';
      html += Charts.progressRing(complianceItems[ci].pct, 60, complianceItems[ci].color);
      html += '</div>';
    }
    html += '</div>';

    // Guided overlay (tour)
    if (tourActive && tourStep < 4) {
      var tourSteps = [
        { text: 'This is your risk score. It shows your overall data security posture at a glance.', target: 'gauge' },
        { text: 'Each risk factor shows what is contributing to your score. The top factors have the biggest impact.', target: 'stats' },
        { text: 'The trend chart shows how your score changes over time as your team takes action.', target: 'trend' },
        { text: 'This is your command center. You will see real-time changes as your team connects data and applies protections.', target: 'overview' }
      ];
      var ts = tourSteps[tourStep];

      html += '<div style="position:fixed;inset:0;background:var(--sds-bg-overlay, rgba(0,0,0,0.3));z-index:2000;pointer-events:auto;"></div>';
      html += '<div style="position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);background:var(--sds-bg-elevated, #fff);border:1px solid var(--sds-border-default);border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.12);padding:20px 24px;max-width:360px;z-index:2001;">';

      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">';
      html += '<span style="font-size:11px;font-weight:600;text-transform:uppercase;color:var(--sds-text-tertiary);letter-spacing:0.5px;">Step ' + (tourStep + 1) + ' of 4</span>';
      html += '<button data-tour-action="close" style="background:none;border:none;color:var(--sds-text-tertiary);cursor:pointer;font-size:14px;">' + Icons.close + '</button>';
      html += '</div>';

      html += '<div style="font-size:14px;color:var(--sds-text-primary);line-height:1.5;margin-bottom:16px;">' + ts.text + '</div>';

      html += '<div style="display:flex;justify-content:space-between;align-items:center;">';
      html += '<div style="display:flex;gap:4px;">';
      for (var d = 0; d < 4; d++) {
        html += '<div style="width:8px;height:8px;border-radius:50%;background:' + (d === tourStep ? 'var(--sds-interactive-primary)' : 'var(--sds-border-default)') + ';"></div>';
      }
      html += '</div>';
      html += '<div style="display:flex;gap:8px;">';
      if (tourStep > 0) {
        html += '<button class="btn btn-tertiary btn-sm" data-tour-action="back">&larr; Back</button>';
      }
      html += '<button class="btn btn-primary btn-sm" data-tour-action="next">' + (tourStep === 3 ? 'Finish' : 'Next &rarr;') + '</button>';
      html += '</div>';
      html += '</div>';

      html += '</div>';
    }

    // Post-tour CTA
    if (!tourActive || tourStep >= 4) {
      html += '<div style="margin-top:24px;background:var(--sds-bg-card);border:1px solid var(--sds-border-default);border-radius:8px;padding:32px;text-align:center;">';
      html += '<div style="font-size:20px;font-weight:600;color:var(--sds-text-primary);margin-bottom:12px;">Ready to connect your own data?</div>';
      html += '<div style="display:flex;gap:12px;justify-content:center;margin-top:16px;">';
      html += Components.button('Connect My Data', 'primary', 'md', 'data-navigate="#/onboarding/dashboard"');
      html += Components.button('Keep Exploring', 'tertiary', 'md', 'data-navigate="#/dashboard"');
      html += '</div>';
      html += '</div>';
    }

    html += '</div>';
    content.innerHTML = html;

    // Tour events
    content.onclick = function(e) {
      var tourBtn = e.target.closest('[data-tour-action]');
      if (tourBtn) {
        var action = tourBtn.getAttribute('data-tour-action');
        if (action === 'next') {
          onboardingState.demoTourStep = (onboardingState.demoTourStep || 0) + 1;
          if (onboardingState.demoTourStep >= 4) {
            onboardingState.demoTourActive = false;
          }
          saveOnboardingState();
          renderMarcusDemo();
        } else if (action === 'back') {
          onboardingState.demoTourStep = Math.max(0, (onboardingState.demoTourStep || 0) - 1);
          saveOnboardingState();
          renderMarcusDemo();
        } else if (action === 'close') {
          onboardingState.demoTourActive = false;
          saveOnboardingState();
          renderMarcusDemo();
        }
        return;
      }
    };
  }


  /* ================================================================
     SCREEN 10: Onboarding Complete
     ================================================================ */
  function renderOnboardingComplete() {
    restoreShell();
    var content = document.getElementById('content');

    // Confetti CSS
    var style = document.createElement('style');
    style.id = 'onb-confetti-style';
    style.textContent = '@keyframes onb-confetti-fall{0%{transform:translateY(-20px) rotate(0deg);opacity:1;}' +
      '100%{transform:translateY(100vh) rotate(720deg);opacity:0;}}' +
      '@keyframes onb-spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}' +
      '.onb-confetti-piece{position:fixed;top:-10px;z-index:3000;pointer-events:none;animation:onb-confetti-fall 3s ease-in forwards;}';
    if (!document.getElementById('onb-confetti-style')) {
      document.head.appendChild(style);
    }

    // Generate confetti
    var confettiColors = CONFETTI_COLORS;
    var confettiHtml = '';
    for (var c = 0; c < 80; c++) {
      var left = Math.random() * 100;
      var delay = Math.random() * 1.5;
      var color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      var size = Math.random() > 0.5 ? 'width:8px;height:4px;border-radius:1px;' : 'width:6px;height:6px;border-radius:50%;';
      confettiHtml += '<div class="onb-confetti-piece" style="left:' + left + '%;animation-delay:' + delay.toFixed(1) + 's;background:' + color + ';' + size + '"></div>';
    }

    var html = confettiHtml;

    // Completion card overlay
    html += '<div style="position:fixed;inset:0;background:var(--sds-bg-overlay, rgba(0,0,0,0.2));z-index:2500;display:flex;align-items:center;justify-content:center;" id="onb-completion-overlay">';
    html += '<div style="background:var(--sds-bg-elevated, #fff);border:1px solid var(--sds-border-default);border-radius:16px;box-shadow:0 12px 32px rgba(0,0,0,0.12);padding:40px;max-width:480px;width:100%;text-align:center;">';

    // Celebration icon
    html += '<div style="width:64px;height:64px;border-radius:16px;background:var(--sds-status-success-bg, #F4FAEB);display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px;">';
    html += '<span style="color:var(--sds-status-success-strong);display:flex;align-items:center;justify-content:center;">' + Icons.render('check', 32) + '</span>';
    html += '</div>';

    html += '<h2 style="font-size:24px;font-weight:700;color:var(--sds-text-primary);margin:0 0 12px 0;">You\'re all set!</h2>';
    html += '<p style="font-size:14px;color:var(--sds-text-secondary);line-height:1.5;max-width:360px;margin:0 auto 24px auto;">You have connected your first data source, reviewed classifications, and seen your risk score. Your data security journey starts now.</p>';

    // Stats summary
    html += '<div style="background:var(--sds-bg-subtle);border-radius:8px;padding:16px;display:grid;grid-template-columns:repeat(3, 1fr);gap:8px;margin-bottom:24px;">';
    var summaryStats = [
      { label: 'Source Connected', value: '1' },
      { label: 'Tables Scanned', value: '23' },
      { label: 'Risk Score', value: '52' }
    ];
    for (var ss = 0; ss < summaryStats.length; ss++) {
      html += '<div>';
      html += '<div style="font-size:20px;font-weight:600;color:var(--sds-text-primary);">' + summaryStats[ss].value + '</div>';
      html += '<div style="font-size:12px;color:var(--sds-text-tertiary);">' + summaryStats[ss].label + '</div>';
      html += '</div>';
    }
    html += '</div>';

    html += '<button class="btn btn-primary btn-lg" id="onb-explore-btn" style="width:100%;">Explore Dashboard</button>';
    html += '</div></div>';

    // Optional next steps (hidden initially)
    html += '<div id="onb-checklist" style="display:none;position:fixed;bottom:24px;right:24px;width:320px;background:var(--sds-bg-elevated, #fff);border:1px solid var(--sds-border-default);border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,0.1);padding:16px 20px;z-index:100;">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">';
    html += '<span style="font-size:13px;font-weight:600;color:var(--sds-text-primary);">Optional next steps</span>';
    html += '<button id="onb-checklist-dismiss" style="background:none;border:none;color:var(--sds-text-tertiary);cursor:pointer;font-size:12px;">Dismiss</button>';
    html += '</div>';

    var nextStepsList = [
      { label: 'Invite team members', route: '#/settings' },
      { label: 'Create first policy', route: '#/policies' },
      { label: 'Schedule recurring scans', route: '#/scans' },
      { label: 'Set up compliance report', route: '#/reports' }
    ];
    for (var ns = 0; ns < nextStepsList.length; ns++) {
      html += '<label style="display:flex;align-items:center;gap:8px;padding:6px 0;font-size:13px;color:var(--sds-text-secondary);cursor:pointer;">';
      html += '<input type="checkbox" style="width:16px;height:16px;accent-color:var(--sds-interactive-primary);">';
      html += '<a data-navigate="' + nextStepsList[ns].route + '" style="color:var(--sds-text-secondary);text-decoration:none;cursor:pointer;">' + nextStepsList[ns].label + '</a>';
      html += '</label>';
    }
    html += '</div>';

    content.innerHTML = html;

    // Events
    var exploreBtn = document.getElementById('onb-explore-btn');
    if (exploreBtn) {
      exploreBtn.addEventListener('click', function() {
        var overlay = document.getElementById('onb-completion-overlay');
        if (overlay) overlay.style.display = 'none';

        // Remove confetti
        var pieces = document.querySelectorAll('.onb-confetti-piece');
        for (var p = 0; p < pieces.length; p++) {
          pieces[p].remove();
        }

        // Show checklist
        var checklist = document.getElementById('onb-checklist');
        if (checklist) checklist.style.display = 'block';

        // Navigate to dashboard
        Router.navigate('/dashboard');
      });
    }

    var dismissBtn = document.getElementById('onb-checklist-dismiss');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', function() {
        var checklist = document.getElementById('onb-checklist');
        if (checklist) checklist.style.display = 'none';
      });
    }

    // Auto-remove confetti after 3.5s
    setTimeout(function() {
      var pieces = document.querySelectorAll('.onb-confetti-piece');
      for (var p = 0; p < pieces.length; p++) {
        pieces[p].style.opacity = '0';
      }
    }, 3500);
  }


  /* ================================================================
     Shell Helpers
     ================================================================ */
  function restoreShell() {
    var sidebar = document.getElementById('app-sidebar');
    var header = document.querySelector('.app-header');
    if (sidebar) sidebar.style.display = '';
    if (header) header.style.display = '';
  }


  /* ================================================================
     Register Routes
     ================================================================ */
  Router.register('/onboarding', renderWelcome);
  Router.register('/onboarding/dashboard', renderOnboardingDashboard);
  Router.register('/onboarding/connect', renderGuidedConnection);
  Router.register('/onboarding/scan', renderFirstScanProgress);
  Router.register('/onboarding/review', renderGuidedReview);
  Router.register('/onboarding/score', renderRiskScoreReveal);
  Router.register('/onboarding/remediate', renderFirstRemediation);
  Router.register('/onboarding/monitor', renderMonitoringSetup);
  Router.register('/onboarding/demo', renderMarcusDemo);
  Router.register('/onboarding/complete', renderOnboardingComplete);

})();
