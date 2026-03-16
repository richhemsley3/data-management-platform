/* ============================================================
   Router — Hash-based Router with pattern matching
   ============================================================ */

window.Router = {
  routes: [],
  _started: false,

  register: function(pattern, handler) {
    this.routes.push({
      pattern: pattern,
      handler: handler,
      regex: this._patternToRegex(pattern),
      paramNames: this._extractParams(pattern)
    });
  },

  _patternToRegex: function(pattern) {
    var regexStr = pattern
      .replace(/:[a-zA-Z_]+/g, '([^/]+)')
      .replace(/\//g, '\\/');
    return new RegExp('^' + regexStr + '$');
  },

  _extractParams: function(pattern) {
    var params = [];
    var matches = pattern.match(/:[a-zA-Z_]+/g);
    if (matches) {
      for (var i = 0; i < matches.length; i++) {
        params.push(matches[i].substring(1));
      }
    }
    return params;
  },

  navigate: function(hash) {
    if (hash.charAt(0) !== '#') {
      hash = '#' + hash;
    }
    location.hash = hash;
  },

  current: function() {
    var hash = location.hash.replace('#', '') || '/dashboard';
    return this.match(hash);
  },

  match: function(hash) {
    if (hash.charAt(0) === '#') {
      hash = hash.substring(1);
    }

    for (var i = 0; i < this.routes.length; i++) {
      var route = this.routes[i];
      var match = hash.match(route.regex);
      if (match) {
        var params = {};
        for (var j = 0; j < route.paramNames.length; j++) {
          params[route.paramNames[j]] = decodeURIComponent(match[j + 1]);
        }
        return {
          pattern: route.pattern,
          hash: hash,
          params: params,
          handler: route.handler
        };
      }
    }

    return null;
  },

  _handleRoute: function() {
    var hash = location.hash.replace('#', '') || '/dashboard';
    var matched = this.match(hash);

    // Restore app shell if hidden (e.g., by onboarding)
    var sidebar = document.getElementById('app-sidebar');
    var header = document.querySelector('.app-header');
    if (sidebar && sidebar.style.display === 'none') sidebar.style.display = '';
    if (header && header.style.display === 'none') header.style.display = '';

    // Update active state
    State.set('currentRoute', hash);

    if (matched) {
      try {
        matched.handler(matched.params);
      } catch (e) {
        console.error('Route handler error:', e);
        this._showError(hash, e);
      }
    } else {
      this._showComingSoon(hash);
    }
  },

  _showComingSoon: function(hash) {
    var content = document.getElementById('content');
    if (content) {
      content.innerHTML =
        '<div class="coming-soon">' +
          '<div class="coming-soon-icon">' + (Icons.dashboard || '') + '</div>' +
          '<h2>Screen coming soon</h2>' +
          '<p>This screen is not yet implemented.</p>' +
          '<p style="margin-top: 8px;"><code>' + hash + '</code></p>' +
        '</div>';
    }
  },

  _showError: function(hash, error) {
    var content = document.getElementById('content');
    if (content) {
      content.innerHTML =
        '<div class="coming-soon">' +
          '<div class="coming-soon-icon">' + (Icons.error || '') + '</div>' +
          '<h2>Something went wrong</h2>' +
          '<p>' + (error.message || 'Unknown error') + '</p>' +
          '<p style="margin-top: 8px;"><code>' + hash + '</code></p>' +
        '</div>';
    }
  },

  start: function() {
    if (this._started) return;
    this._started = true;

    var self = this;
    window.addEventListener('hashchange', function() {
      self._handleRoute();
    });

    // Handle initial route
    if (!location.hash || location.hash === '#') {
      location.hash = '#/dashboard';
    } else {
      this._handleRoute();
    }
  }
};
