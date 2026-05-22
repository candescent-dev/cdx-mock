/**
 * Shared helper for every mock vendor SDK.
 *
 *   const badge = MockOverlay.create('Glia');
 *   MockOverlay.recordCall('Glia', 'init', { userGuid: '...' });
 *   badge.update({ userFullName: '...' });
 *   badge.panel('Title', payload);  // optional programmatic panel body
 *
 * **Interactivity:** each pill is clickable (keyboard: Enter / Space). It opens
 * a fixed panel that explains what the real integration does, offers one-click
 * “simulated” actions (recorded on `window.__mockPartnerCalls`), and lists the
 * live call log for that vendor. Escape closes any open mock panel.
 *
 * Implementation notes:
 *  - We capture the script's origin synchronously at parse time. Doing it
 *    later (e.g. inside a callback) would lose `document.currentScript`, and
 *    falling back to `document.scripts.pop()` is unreliable inside hosts like
 *    the OLB playground that inject many scripts of their own.
 *  - The badge is inline-styled in addition to using the optional stylesheet,
 *    so it stays visible even if the CSS fails to load (CSP, COEP, slow net,
 *    or a host page with aggressive global resets).
 */
(function () {
  if (window.MockOverlay) return;

  // Capture once at parse time. When this file is injected with `async`,
  // `document.currentScript` is null — scan for our own URL (same fix as partner SDKs).
  var SELF_ORIGIN = (function () {
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i--) {
      var src = scripts[i].src || '';
      if (src.indexOf('/vendors/_shared/mock-overlay.js') !== -1) {
        try {
          return new URL(src).origin;
        } catch (e) {
          /* fall through */
        }
      }
    }
    var s = document.currentScript;
    if (s && s.src) {
      try {
        return new URL(s.src).origin;
      } catch (e2) {
        /* fall through */
      }
    }
    return '';
  })();

  function ensureCss() {
    if (document.getElementById('mock-overlay-css')) return;
    if (!SELF_ORIGIN) return;
    var link = document.createElement('link');
    link.id = 'mock-overlay-css';
    link.rel = 'stylesheet';
    link.href = SELF_ORIGIN + '/vendors/_shared/mock-overlay.css';
    document.head.appendChild(link);
  }

  function recordCall(vendor, fn, args) {
    window.__mockPartnerCalls = window.__mockPartnerCalls || [];
    window.__mockPartnerCalls.push({ partner: vendor, fn: fn, args: args, at: Date.now() });
  }

  /** Map badge label (2nd arg to create) → partner keys used in recordCall(). */
  var PARTNER_CALL_KEYS = {
    'Glia': ['Glia'],
    'Link Live': ['Link Live'],
    'GTM': ['GTM'],
    'Acquire': ['Acquire'],
    'Five9': ['Five9'],
    'Salesforce': ['Salesforce'],
    'UJET (mobile)': ['UJET'],
    'Salesforce (mobile)': ['Salesforce-mobile'],
  };

  function callKeysForBadge(vendor) {
    if (PARTNER_CALL_KEYS[vendor]) return PARTNER_CALL_KEYS[vendor];
    return [vendor.split(/\s+/)[0]];
  }

  function filterCalls(vendor) {
    var keys = callKeysForBadge(vendor);
    return (window.__mockPartnerCalls || []).filter(function (c) {
      return keys.indexOf(c.partner) !== -1;
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function cssEscape(s) {
    if (window.CSS && CSS.escape) return CSS.escape(s);
    return String(s).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
  }

  function appendWhenReady(el) {
    if (document.body) {
      document.body.appendChild(el);
      return;
    }
    document.addEventListener('DOMContentLoaded', function once() {
      document.removeEventListener('DOMContentLoaded', once);
      document.body.appendChild(el);
    });
  }

  var BADGE_STYLE = [
    'position:fixed', 'bottom:24px', 'right:24px', 'z-index:2147483647',
    'padding:10px 14px', 'border-radius:999px', 'background:#0f172a',
    'color:#f8fafc', "font:600 12px/1.2 system-ui,-apple-system,BlinkMacSystemFont,sans-serif",
    'box-shadow:0 8px 24px rgba(0,0,0,0.25)', 'pointer-events:auto', 'cursor:pointer',
    'max-width:80vw', 'white-space:nowrap', 'overflow:hidden', 'text-overflow:ellipsis',
    'border:none', 'text-align:left',
  ].join(';');

  var PANEL_STYLE = [
    'position:fixed',
    'bottom:80px',
    'right:24px',
    'width:min(380px,calc(100vw - 48px))',
    'max-height:min(72vh,520px)',
    'overflow:auto',
    'z-index:2147483646',
    'padding:0',
    'border-radius:12px',
    'background:#ffffff',
    'color:#0f172a',
    "font:13px/1.45 system-ui,-apple-system,BlinkMacSystemFont,sans-serif",
    'border:1px solid #e2e8f0',
    'box-shadow:0 16px 40px rgba(0,0,0,0.16)',
    'display:none',
  ].join(';');

  var HEAD_STYLE = [
    'display:flex', 'align-items:center', 'justify-content:space-between',
    'gap:8px', 'padding:12px 14px', 'border-bottom:1px solid #e2e8f0',
    'background:#f8fafc', 'position:sticky', 'top:0', 'z-index:1',
  ].join(';');

  var BTN_ROW = 'display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 0;';

  function playbookHtml(vendor) {
    var blocks = {
      'Glia': {
        title: 'Glia — what happens in production',
        body:
          '<p style="margin:0 0 10px;color:#475569">The real SDK mounts a launcher and chat UI. Visitors tap to start a session; the bank may pass identity from <code>dbk.sessionInfo()</code> for routing.</p>' +
          '<p style="margin:0 0 10px;color:#475569"><strong>In this mock:</strong> the pill only proves the script loaded. Use the buttons below to append fake vendor calls the way a real widget would after user action.</p>',
        actions:
          '<button type="button" data-mock-simulate="glia-init" style="padding:6px 10px;border-radius:8px;border:1px solid #cbd5e1;background:#fff;cursor:pointer;font:inherit">Simulate: open launcher</button>' +
          '<button type="button" data-mock-simulate="glia-identify" style="padding:6px 10px;border-radius:8px;border:1px solid #cbd5e1;background:#fff;cursor:pointer;font:inherit">Simulate: identify visitor</button>',
      },
      'Link Live': {
        title: 'Link Live — what happens in production',
        body:
          '<p style="margin:0 0 10px;color:#475569">Retail / business chat loads CSS + config, embeds a hidden SSO iframe, then receives a token via <code>postMessage</code> to attach the authenticated widget.</p>' +
          '<p style="margin:0 0 10px;color:#475569"><strong>In this mock:</strong> when the handoff iframe completes, this panel can also show the payload (see programmatic <code>badge.panel</code> from the SDK).</p>',
        actions:
          '<button type="button" data-mock-simulate="linklive-engage" style="padding:6px 10px;border-radius:8px;border:1px solid #cbd5e1;background:#fff;cursor:pointer;font:inherit">Simulate: widget engaged</button>',
      },
      'GTM': {
        title: 'Google Tag Manager — what happens in production',
        body:
          '<p style="margin:0 0 10px;color:#475569">GTM injects the container bootstrap; tags fire on <code>dataLayer.push</code> events (page views, conversions, marketing pixels).</p>' +
          '<p style="margin:0 0 10px;color:#475569"><strong>In this mock:</strong> pushes are recorded on the call log.</p>',
        actions:
          '<button type="button" data-mock-simulate="gtm-pageview" style="padding:6px 10px;border-radius:8px;border:1px solid #cbd5e1;background:#fff;cursor:pointer;font:inherit">Simulate: page_view</button>' +
          '<button type="button" data-mock-simulate="gtm-conv" style="padding:6px 10px;border-radius:8px;border:1px solid #cbd5e1;background:#fff;cursor:pointer;font:inherit">Simulate: conversion</button>',
      },
      'Acquire': {
        title: 'Acquire — what happens in production',
        body:
          '<p style="margin:0 0 10px;color:#475569">Acquire boots co-browse / chat with your account id; agents may escalate or take control per vendor rules.</p>',
        actions:
          '<button type="button" data-mock-simulate="acquire-session" style="padding:6px 10px;border-radius:8px;border:1px solid #cbd5e1;background:#fff;cursor:pointer;font:inherit">Simulate: session requested</button>',
      },
      'Five9': {
        title: 'Five9 — what happens in production',
        body:
          '<p style="margin:0 0 10px;color:#475569"><code>Five9ChatPlugin</code> receives queue + pre-chat fields, then the visitor taps to start a queue session.</p>',
        actions:
          '<button type="button" data-mock-simulate="five9-start" style="padding:6px 10px;border-radius:8px;border:1px solid #cbd5e1;background:#fff;cursor:pointer;font:inherit">Simulate: startChat()</button>',
      },
      'Salesforce': {
        title: 'Salesforce Embedded Service — what happens in production',
        body:
          '<p style="margin:0 0 10px;color:#475569"><code>embeddedservice_bootstrap.init</code> registers org + deployment; pre-chat fields personalize routing and screen-pop.</p>',
        actions:
          '<button type="button" data-mock-simulate="sf-open" style="padding:6px 10px;border-radius:8px;border:1px solid #cbd5e1;background:#fff;cursor:pointer;font:inherit">Simulate: open embedded chat</button>',
      },
      'UJET (mobile)': {
        title: 'UJET (mobile) — what happens in production',
        body:
          '<p style="margin:0 0 10px;color:#475569">The native app passes a token via JSBridge; the WebView loads UJET and calls <code>UJETMobile.bootstrap</code> with tenant + token.</p>',
        actions:
          '<button type="button" data-mock-simulate="ujet-boot" style="padding:6px 10px;border-radius:8px;border:1px solid #cbd5e1;background:#fff;cursor:pointer;font:inherit">Simulate: bootstrap again</button>',
      },
      'Salesforce (mobile)': {
        title: 'Salesforce mobile chat — what happens in production',
        body:
          '<p style="margin:0 0 10px;color:#475569">Same as web embedded chat but entry is <code>SalesforceMobileChat.init(org, app, token)</code> after the bridge returns credentials.</p>',
        actions:
          '<button type="button" data-mock-simulate="sfm-init" style="padding:6px 10px;border-radius:8px;border:1px solid #cbd5e1;background:#fff;cursor:pointer;font:inherit">Simulate: init again</button>',
      },
    };
    var pb = blocks[vendor];
    if (!pb) {
      return {
        title: escapeHtml(vendor) + ' — mock preview',
        body: '<p style="margin:0;color:#475569">No scripted playbook for this vendor label yet. The call log below still shows everything recorded for matching <code>recordCall</code> vendors.</p>',
        actions: '',
      };
    }
    return { title: pb.title, body: pb.body, actions: pb.actions };
  }

  function callsLogHtml(vendor) {
    var rows = filterCalls(vendor).slice(-40);
    var txt = rows.length ? JSON.stringify(rows, null, 2) : '(no calls yet — use “Simulate” buttons above)';
    return '<h4 style="margin:16px 0 6px;font:600 11px/1.2 system-ui,sans-serif;text-transform:uppercase;letter-spacing:.06em;color:#64748b">Recorded calls (last 40)</h4>' +
      '<pre style="margin:0;padding:10px;border-radius:8px;background:#0f172a;color:#e2e8f0;font:11px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;word-break:break-word;max-height:200px;overflow:auto">' +
      escapeHtml(txt) + '</pre>';
  }

  function runSimulate(vendor, action) {
    if (action === 'glia-init' && window.GliaMock && typeof window.GliaMock.init === 'function') {
      window.GliaMock.init({ mockPreview: true });
    } else if (action === 'glia-init') {
      recordCall('Glia', 'simulate-open-launcher', { source: 'mock-panel' });
    }
    if (action === 'glia-identify' && window.GliaMock && typeof window.GliaMock.identify === 'function') {
      window.GliaMock.identify({ userFullName: 'Preview User', source: 'mock-panel' });
    } else if (action === 'glia-identify') {
      recordCall('Glia', 'simulate-identify', { userFullName: 'Preview User' });
    }
    if (action === 'linklive-engage') {
      recordCall('Link Live', 'simulate-widget-engaged', { source: 'mock-panel' });
    }
    if (action === 'gtm-pageview') {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'mock_page_view', source: 'mock-panel' });
      recordCall('GTM', 'dataLayer.push', { event: 'mock_page_view' });
    }
    if (action === 'gtm-conv') {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'mock_conversion', source: 'mock-panel' });
      recordCall('GTM', 'dataLayer.push', { event: 'mock_conversion' });
    }
    if (action === 'acquire-session') {
      recordCall('Acquire', 'simulate-session-request', { source: 'mock-panel' });
    }
    if (action === 'five9-start') {
      try {
        if (typeof window.Five9ChatPlugin === 'function') {
          var inst = window.Five9ChatPlugin({ fields: window.PreChatFields || {} });
          if (inst && typeof inst.startChat === 'function') inst.startChat();
        } else {
          recordCall('Five9', 'startChat', { source: 'mock-panel-fallback' });
        }
      } catch (e) {
        recordCall('Five9', 'startChat-error', { message: String(e && e.message ? e.message : e) });
      }
    }
    if (action === 'sf-open') {
      recordCall('Salesforce', 'simulate-open-embedded-chat', { source: 'mock-panel' });
    }
    if (action === 'ujet-boot' && window.UJETMobile && typeof window.UJETMobile.bootstrap === 'function') {
      window.UJETMobile.bootstrap({ source: 'mock-panel-replay', token: '(preview)' });
    } else if (action === 'ujet-boot') {
      recordCall('UJET', 'simulate-bootstrap', { source: 'mock-panel' });
    }
    if (action === 'sfm-init' && window.SalesforceMobileChat && typeof window.SalesforceMobileChat.init === 'function') {
      window.SalesforceMobileChat.init(window.VendorOrgId || '00DMOCK', window.VendorAppName || 'mock', window.VendorAuthToken || '(preview)');
    } else if (action === 'sfm-init') {
      recordCall('Salesforce-mobile', 'simulate-init', { source: 'mock-panel' });
    }
  }

  function bindSimulateClicks(panelRoot, vendor, refreshFn) {
    panelRoot.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('[data-mock-simulate]') : null;
      if (!btn || !panelRoot.contains(btn)) return;
      var act = btn.getAttribute('data-mock-simulate') || '';
      runSimulate(vendor, act);
      if (typeof refreshFn === 'function') refreshFn();
    });
  }

  if (!window.__mockOverlayEscBound) {
    window.__mockOverlayEscBound = true;
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var panels = document.querySelectorAll('[data-mock-partner-panel]');
      for (var i = 0; i < panels.length; i++) {
        panels[i].style.display = 'none';
      }
      var badges = document.querySelectorAll('[data-mock-partner]');
      for (var j = 0; j < badges.length; j++) {
        badges[j].setAttribute('aria-expanded', 'false');
      }
    });
  }

  function create(vendor) {
    ensureCss();
    var selector = '[data-mock-partner="' + cssEscape(vendor) + '"]';
    var el = document.querySelector(selector);
    if (!el) {
      el = document.createElement('button');
      el.type = 'button';
      el.setAttribute('data-mock-partner', vendor);
      el.setAttribute('style', BADGE_STYLE);
      el.textContent = 'MOCK \u00b7 ' + vendor;
      el.setAttribute('aria-label', 'Open mock interaction preview for ' + vendor);
      el.setAttribute('aria-expanded', 'false');
      el.setAttribute('title', 'Click: preview how this integration behaves');
      appendWhenReady(el);
    }

    var panel = null;

    function ensurePanel() {
      if (panel) return panel;
      var existing = document.querySelector('[data-mock-partner-panel="' + cssEscape(vendor) + '"]');
      if (existing) {
        panel = existing;
        return panel;
      }
      panel = document.createElement('aside');
      panel.setAttribute('data-mock-partner-panel', vendor);
      panel.setAttribute('style', PANEL_STYLE);
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-label', 'Mock preview for ' + vendor);
      appendWhenReady(panel);
      return panel;
    }

    function renderDefaultBody() {
      var p = ensurePanel();
      var pb = playbookHtml(vendor);
      var closeBtn =
        '<button type="button" data-mock-panel-close="1" style="border:none;background:transparent;cursor:pointer;font:20px/1 system-ui;padding:0 4px;color:#64748b;line-height:1" aria-label="Close mock panel">\u00d7</button>';
      p.innerHTML =
        '<div style="' + HEAD_STYLE + '">' +
        '<span style="font:600 12px/1.2 system-ui,sans-serif;color:#0f172a">' + escapeHtml(pb.title) + '</span>' +
        closeBtn +
        '</div>' +
        '<div style="padding:14px 16px 16px">' +
        pb.body +
        (pb.actions ? '<div style="' + BTN_ROW + '">' + pb.actions + '</div>' : '') +
        '<div data-mock-calls-region>' + callsLogHtml(vendor) + '</div>' +
        '</div>';

      function wireClose() {
        var c = p.querySelector('[data-mock-panel-close]');
        if (c) {
          c.addEventListener('click', function () {
            p.style.display = 'none';
            el.setAttribute('aria-expanded', 'false');
          });
        }
      }
      wireClose();

      function refreshCallsOnly() {
        var region = p.querySelector('[data-mock-calls-region]');
        if (region) region.innerHTML = callsLogHtml(vendor);
      }
      bindSimulateClicks(p, vendor, function () {
        refreshCallsOnly();
      });
    }

    function showPanel() {
      var p = ensurePanel();
      p.style.display = 'block';
      el.setAttribute('aria-expanded', 'true');
    }

    function hidePanel() {
      if (!panel) return;
      panel.style.display = 'none';
      el.setAttribute('aria-expanded', 'false');
    }

    function toggleFromBadge() {
      var p = ensurePanel();
      var open = p.style.display === 'block';
      if (open) {
        hidePanel();
        return;
      }
      renderDefaultBody();
      showPanel();
    }

    if (!el.__mockBadgeWired) {
      el.__mockBadgeWired = true;
      el.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggleFromBadge();
      });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleFromBadge();
        }
      });
    }

    return {
      update: function (extras) {
        var label = 'MOCK \u00b7 ' + vendor;
        if (extras && extras.userFullName) label += ' \u00b7 ' + extras.userFullName;
        if (extras && extras.userGuid) label += ' \u00b7 ' + String(extras.userGuid).slice(0, 8) + '\u2026';
        el.textContent = label;
      },
      panel: function (title, payload) {
        var p = ensurePanel();
        var body = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
        var closeBtn =
          '<button type="button" data-mock-panel-close="1" style="border:none;background:transparent;cursor:pointer;font:20px/1 system-ui;padding:0 4px;color:#64748b;line-height:1" aria-label="Close mock panel">\u00d7</button>';
        p.innerHTML =
          '<div style="' + HEAD_STYLE + '">' +
          '<span style="font:600 12px/1.2 system-ui,sans-serif;color:#0f172a">' + escapeHtml(title) + '</span>' +
          closeBtn +
          '</div>' +
          '<div style="padding:14px 16px 16px">' +
          '<pre style="margin:0;padding:10px;border-radius:8px;background:#f8fafc;font:11px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;word-break:break-word">' +
          escapeHtml(body) + '</pre>' +
          '<p style="margin:12px 0 0"><button type="button" data-mock-back-preview="1" style="padding:6px 10px;border-radius:8px;border:1px solid #cbd5e1;background:#fff;cursor:pointer;font:inherit">' +
          'Back to interactive preview</button></p>' +
          '<div data-mock-calls-region>' + callsLogHtml(vendor) + '</div>' +
          '</div>';
        var c = p.querySelector('[data-mock-panel-close]');
        if (c) {
          c.addEventListener('click', function () {
            p.style.display = 'none';
            el.setAttribute('aria-expanded', 'false');
          });
        }
        var b = p.querySelector('[data-mock-back-preview]');
        if (b) {
          b.addEventListener('click', function () {
            renderDefaultBody();
            showPanel();
          });
        }
        bindSimulateClicks(p, vendor, function () {
          var region = p.querySelector('[data-mock-calls-region]');
          if (region) region.innerHTML = callsLogHtml(vendor);
        });
        showPanel();
      },
      element: el,
    };
  }

  window.MockOverlay = { create: create, recordCall: recordCall, origin: SELF_ORIGIN };
})();
