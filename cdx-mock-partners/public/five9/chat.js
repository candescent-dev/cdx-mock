/**
 * Mock Five9 chat plugin.
 *
 * Pairs with the `vendor-sdk-personalized` template (preset: five9). Real Five9
 * exposes `Five9ChatPlugin(config)` as a global function; we mirror that and
 * record the config (which carries the user identity from `dbk.sessionInfo()`).
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
    var origin = mockPartnerScriptOrigin('/vendors/five9/chat.js')
    s.src = origin + '/vendors/_shared/mock-overlay.js'
    s.onload = cb
    document.head.appendChild(s)
  }

  loadOverlay(function () {
    var badge = window.MockOverlay.create('Five9')
    window.Five9ChatPlugin = function (config) {
      window.MockOverlay.recordCall('Five9', 'init', config || {})
      var fields = (config && config.fields) || (window.PreChatFields || {})
      badge.update({userFullName: fields.name || '(anon)'})
      return {
        startChat: function () {
          window.MockOverlay.recordCall('Five9', 'startChat', {})
        },
      }
    }

    window.dispatchEvent(new CustomEvent('cdx-vendor-sdk-ready', {detail: {vendor: 'five9'}}))
    window.MockOverlay.recordCall('Five9', 'sdk-ready', {})
  })
})()
