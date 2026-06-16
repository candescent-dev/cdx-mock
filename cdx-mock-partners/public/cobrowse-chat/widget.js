/**
 * Mock co-browse chat SDK.
 *
 * Pairs with the `vendor-sdk-personalized` template (preset: cobrowse-chat).
 * Real co-browse SDKs expose `AcquireApp.init(account, options)` — we mirror that.
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
    var origin = mockPartnerScriptOrigin('/vendors/cobrowse-chat/widget.js')
    s.src = origin + '/vendors/_shared/mock-overlay.js'
    s.onload = cb
    document.head.appendChild(s)
  }

  loadOverlay(function () {
    var partner = 'cobrowse-chat'
    var badge = window.MockOverlay.create('Co-browse Chat')
    window.AcquireApp = window.AcquireApp || {}
    window.AcquireApp.init = function (account, options) {
      window.MockOverlay.recordCall(partner, 'init', {account: account, options: options || {}})
      var name = (options && options.name) || (window.PreChatFields && window.PreChatFields.name) || ''
      badge.update({userFullName: name})
    }

    window.dispatchEvent(new CustomEvent('cdx-vendor-sdk-ready', {detail: {vendor: partner}}))
    window.MockOverlay.recordCall(partner, 'sdk-ready', {})
  })
})()
