/**
 * Mock script-with-config SDK.
 *
 * Pairs with the `vendor-script-with-config` template (presets:
 * script-config-retail, script-config-business). The real loader reads
 * `window.NCR_LIVE_AGENT_CSS_URL` and `window.NCR_LIVE_AGENT_CONTENT_URL`
 * before bootstrapping. This mock honors the same globals so templates can
 * pass mock URLs and watch them actually be consumed.
 */
(function () {
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

  function loadOverlay(cb) {
    if (window.MockOverlay) return cb();
    var s = document.createElement('script');
    var origin = mockPartnerScriptOrigin('/vendors/script-config/aspect.js');
    s.src = origin + '/vendors/_shared/mock-overlay.js';
    s.onload = cb;
    document.head.appendChild(s);
  }

  function loadCss(href) {
    if (!href) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
  }

  loadOverlay(function () {
    var badge = window.MockOverlay.create('Script Config');
    var partner = 'script-config';
    var cssUrl = window.NCR_LIVE_AGENT_CSS_URL;
    var contentUrl = window.NCR_LIVE_AGENT_CONTENT_URL;
    loadCss(cssUrl);
    window.MockOverlay.recordCall(partner, 'auto-bootstrap', {
      cssUrl: cssUrl || null,
      contentUrl: contentUrl || null,
    });

    if (!contentUrl) {
      badge.panel('Script Config (mock)', 'No NCR_LIVE_AGENT_CONTENT_URL set; nothing to load.');
      return;
    }

    var iframe = document.createElement('iframe');
    iframe.src = contentUrl;
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.cssText = 'position:absolute;left:-9999px;top:-9999px;border:0';
    iframe.setAttribute('data-mock-script-config', '1');
    document.body.appendChild(iframe);

    window.addEventListener('message', function (ev) {
      if (!ev.data || ev.data.source !== 'mock-sso-handoff') return;
      window.MockOverlay.recordCall(partner, 'sso-handoff-received', ev.data);
      badge.panel('Script Config SSO handoff', ev.data);
    });
  });
})();
