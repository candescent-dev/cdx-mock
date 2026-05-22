/**
 * Mock Glia chat-bubble SDK.
 *
 * Pairs with the `vendor-script-loader` template. The real SDK is a single
 * script that auto-bootstraps on load and exposes a small global API. This
 * mock mirrors that surface (auto-bootstrap + identifiable badge) and records
 * every call into `window.__mockPartnerCalls` for e2e assertions.
 */
(function () {
  /**
   * Forge / OLB inject this file with `async`; then `document.currentScript` is null
   * and `document.scripts.pop()` may be another script (e.g. preview `/aspect.js`),
   * which would load mock-overlay from the wrong origin and the MOCK pill never appears.
   */
  function mockPartnerScriptOrigin(pathFragment) {
    var scripts = document.getElementsByTagName('script');
    for (var j = scripts.length - 1; j >= 0; j--) {
      var href = scripts[j].src || '';
      if (pathFragment && href.indexOf(pathFragment) !== -1) {
        try {
          return new URL(href).origin;
        } catch (e) {}
      }
    }
    try {
      var cs = document.currentScript;
      if (cs && cs.src) return new URL(cs.src).origin;
    } catch (e2) {}
    return '';
  }

  var SDK_ORIGIN = mockPartnerScriptOrigin('/vendors/glia/sdk.js');

  function loadCss(href) {
    if (!href) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
  }

  function loadOverlay(cb) {
    if (window.MockOverlay) return cb();
    var s = document.createElement('script');
    s.src = SDK_ORIGIN + '/vendors/_shared/mock-overlay.js';
    s.onload = cb;
    s.onerror = function () {
      console.warn('[mock-glia] failed to load mock-overlay.js — check cdx-mock-partners is running:', s.src);
    };
    document.head.appendChild(s);
  }

  loadOverlay(function () {
    loadCss(SDK_ORIGIN + '/vendors/glia/sdk.css');

    var badge = window.MockOverlay.create('Glia');

    if (!document.querySelector('[data-mock-glia-bubble]')) {
      var bubble = document.createElement('button');
      bubble.type = 'button';
      bubble.setAttribute('data-mock-glia-bubble', '');
      bubble.setAttribute('aria-label', 'Mock Glia chat launcher');
      bubble.textContent = 'G';
      bubble.addEventListener('click', function () {
        window.MockOverlay.recordCall('Glia', 'launcher-click', {});
        badge.update({ lastInteraction: 'launcher' });
      });
      document.body.appendChild(bubble);
    }

    window.MockOverlay.recordCall('Glia', 'auto-bootstrap', {
      stagingFlag: window.NCR_LIVE_AGENT_IS_GLIA_STAGING_SITE === true,
    });

    window.GliaMock = {
      init: function (opts) {
        window.MockOverlay.recordCall('Glia', 'init', opts || {});
        badge.update(opts || {});
      },
      identify: function (user) {
        window.MockOverlay.recordCall('Glia', 'identify', user || {});
        badge.update(user || {});
      },
    };
  });
})();
