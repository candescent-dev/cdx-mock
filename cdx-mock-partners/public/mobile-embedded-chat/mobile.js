/**
 * Mock mobile embedded chat SDK (JSBridge).
 *
 * Pairs with the `mobile-vendor-chat-jsbridge` template (preset: mobile-embedded-chat).
 * Same shape as `mobile-chat-jsbridge/mobile.js` — listens for
 * `cdx-mobile-vendor-ready` and records the token + tenant.
 */
(function () {
  var pending = []
  var partner = 'mobile-embedded-chat'

  function record(vendor, fn, args) {
    if (window.MockOverlay) {
      window.MockOverlay.recordCall(vendor, fn, args)
    } else {
      pending.push([vendor, fn, args])
    }
  }

  window.SalesforceMobileChat = {
    init: function (orgId, app, token) {
      record(partner, 'init', {orgId: orgId, app: app, hasToken: Boolean(token)})
    },
  }

  window.addEventListener('cdx-mobile-vendor-ready', function (event) {
    var detail = (event && event.detail) || {}
    window.SalesforceMobileChat.init(detail.org, detail.app, detail.token)
  })

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
    var origin = mockPartnerScriptOrigin('/vendors/mobile-embedded-chat/mobile.js')
    s.src = origin + '/vendors/_shared/mock-overlay.js'
    s.onload = cb
    document.head.appendChild(s)
  }

  loadOverlay(function () {
    window.MockOverlay.create('Mobile Embedded')
    window.MockOverlay.recordCall(partner, 'sdk-loaded', {})
    while (pending.length > 0) {
      var c = pending.shift()
      window.MockOverlay.recordCall(c[0], c[1], c[2])
    }
  })
})()
