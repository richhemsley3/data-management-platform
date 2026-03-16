/* ============================================================
   State — Simple Pub/Sub Store backed by sessionStorage
   ============================================================ */

window.State = {
  _data: {},
  _listeners: {},

  _loadFromSession: function() {
    try {
      var stored = sessionStorage.getItem('beacon_state');
      if (stored) {
        this._data = JSON.parse(stored);
      }
    } catch (e) {
      this._data = {};
    }
  },

  _saveToSession: function() {
    try {
      sessionStorage.setItem('beacon_state', JSON.stringify(this._data));
    } catch (e) {
      // Silently fail if sessionStorage is unavailable
    }
  },

  get: function(key) {
    if (Object.keys(this._data).length === 0) {
      this._loadFromSession();
    }
    return this._data[key];
  },

  set: function(key, value) {
    var oldValue = this._data[key];
    this._data[key] = value;
    this._saveToSession();

    // Notify listeners
    if (this._listeners[key]) {
      var listeners = this._listeners[key].slice();
      for (var i = 0; i < listeners.length; i++) {
        try {
          listeners[i](value, oldValue, key);
        } catch (e) {
          console.error('State listener error:', e);
        }
      }
    }

    // Notify wildcard listeners
    if (this._listeners['*']) {
      var wildcardListeners = this._listeners['*'].slice();
      for (var j = 0; j < wildcardListeners.length; j++) {
        try {
          wildcardListeners[j](value, oldValue, key);
        } catch (e) {
          console.error('State wildcard listener error:', e);
        }
      }
    }
  },

  subscribe: function(key, fn) {
    if (!this._listeners[key]) {
      this._listeners[key] = [];
    }
    this._listeners[key].push(fn);

    // Return unsubscribe function
    var listeners = this._listeners[key];
    return function() {
      var idx = listeners.indexOf(fn);
      if (idx > -1) {
        listeners.splice(idx, 1);
      }
    };
  },

  // Update a subset of keys
  merge: function(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        this.set(key, obj[key]);
      }
    }
  },

  // Reset all state
  clear: function() {
    this._data = {};
    this._saveToSession();
  }
};
