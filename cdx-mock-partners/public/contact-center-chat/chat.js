/**
 * Mock contact center chat plugin.
 *
 * Pairs with the `vendor-sdk-personalized` template (preset: contact-center-chat).
 * Real contact center SDKs expose `Five9ChatPlugin(config)` as a global function;
 * we mirror that and record the config (which carries the user identity from
 * `dbk.sessionInfo()`).
 */
(function () {
  function mockPartnerScriptOrigin(pathFragment) {
    var scripts = document.getElementsByTagName('script')
    for (var j = scripts.length - 1; j >= 0; j--) {
      var href = scripts[j].src || ''
      if (pathFragment && href.indexOf(pathFragment) !== -1) {
        try {
          return new URL(href).origin
        } catch (e) {}
      }
    }
    try {
      var cs = document.currentScript
      if (cs && cs.src) return new URL(cs.src).origin
    } catch (e2) {}
    return ''
  }

  function loadOverlay(cb) {
    if (window.MockOverlay) return cb()
    var s = document.createElement('script')
    var origin = mockPartnerScriptOrigin('/vendors/contact-center-chat/chat.js')
    s.src = origin + '/vendors/_shared/mock-overlay.js'
    s.onload = cb
    document.head.appendChild(s)
  }

  loadOverlay(function () {
    var partner = 'contact-center-chat'
    var badge = window.MockOverlay.create('Contact Center')
    window.Five9ChatPlugin = function (config) {
      window.MockOverlay.recordCall(partner, 'init', config || {})
      var fields = (config && config.fields) || (window.PreChatFields || {})
      badge.update({userFullName: fields.name || '(anon)'})
      return {
        startChat: function () {
          window.MockOverlay.recordCall(partner, 'startChat', {})
        },
      }
    }

    window.dispatchEvent(new CustomEvent('cdx-vendor-sdk-ready', {detail: {vendor: partner}}))
    window.MockOverlay.recordCall(partner, 'sdk-ready', {})
  })
})()
