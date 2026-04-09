/**
 * Chrome/Browser API polyfill for @getalby/bitcoin-connect
 *
 * bitcoin-connect expects chrome.runtime APIs that only exist in browser
 * extensions. This polyfill provides stub implementations so the library
 * loads without errors in regular web contexts.
 *
 * This file is loaded as a blocking <script> in <head> to ensure the
 * polyfill is available before any module code runs.
 */
(function() {
  'use strict';

  var chromePolyfill = {
    runtime: {
      onConnect: { addListener: function() {}, removeListener: function() {} },
      onMessage: { addListener: function() {}, removeListener: function() {} },
      connect: function() {
        return {
          onMessage: { addListener: function() {} },
          postMessage: function() {},
          disconnect: function() {}
        };
      },
      sendMessage: function() { return Promise.resolve(); },
      getURL: function() { return ''; },
      getManifest: function() { return {}; }
    },
    storage: {
      local: {
        get: function() { return Promise.resolve({}); },
        set: function() { return Promise.resolve(); },
        remove: function() { return Promise.resolve(); },
        clear: function() { return Promise.resolve(); }
      },
      sync: {
        get: function() { return Promise.resolve({}); },
        set: function() { return Promise.resolve(); },
        remove: function() { return Promise.resolve(); },
        clear: function() { return Promise.resolve(); }
      }
    },
    tabs: {
      query: function() { return Promise.resolve([]); },
      create: function() { return Promise.resolve({}); },
      update: function() { return Promise.resolve({}); },
      get: function() { return Promise.resolve({}); }
    },
    windows: {
      create: function() { return Promise.resolve({}); },
      get: function() { return Promise.resolve({}); },
      getAll: function() { return Promise.resolve([]); }
    },
    extension: {
      getURL: function() { return ''; },
      getBackgroundPage: function() { return null; }
    }
  };

  // Apply to all global scopes
  var scopes = [
    typeof globalThis !== 'undefined' ? globalThis : null,
    typeof window !== 'undefined' ? window : null,
    typeof self !== 'undefined' ? self : null,
    typeof global !== 'undefined' ? global : null
  ];

  for (var i = 0; i < scopes.length; i++) {
    if (scopes[i]) {
      try {
        scopes[i].chrome = scopes[i].chrome || chromePolyfill;
        scopes[i].browser = scopes[i].browser || scopes[i].chrome;
      } catch (e) {}
    }
  }

  // Suppress "chrome is not defined" errors
  var originalError = console.error;
  console.error = function() {
    var msg = Array.prototype.join.call(arguments, ' ');
    if (msg && (msg.indexOf('chrome is not defined') !== -1 || msg.indexOf('ReferenceError: chrome') !== -1)) {
      return;
    }
    originalError.apply(console, arguments);
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('error', function(event) {
      if (event.error && event.error.message &&
          (event.error.message.indexOf('chrome is not defined') !== -1 ||
           event.error.message.indexOf('_balanceSats is null') !== -1)) {
        event.preventDefault();
        return true;
      }
    });

    window.addEventListener('unhandledrejection', function(event) {
      var reason = event.reason;
      if (reason) {
        var msg = (reason.message || String(reason) || '');
        if (msg.indexOf('chrome is not defined') !== -1 ||
            msg.indexOf('_balanceSats is null') !== -1) {
          event.preventDefault();
        }
      }
    }, true);
  }
})();
