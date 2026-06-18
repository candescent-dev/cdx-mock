/**
 * Mock mobile chat SDK (JSBridge).
 *
 * Pairs with the `mobile-vendor-chat-jsbridge` template (preset: mobile-chat-jsbridge).
 * The template fetches a token via JSBridge (or falls back to /token) and then
 * loads this script. Once loaded, the template fires `cdx-mobile-vendor-ready`
 * which our mock listens for and records.
 */
(function () {
  var pending = []
  var partner = 'mobile-chat-jsbridge'

  function record(vendor, fn, args) {
    if (window.MockOverlay) {
      window.MockOverlay.recordCall(vendor, fn, args)
    } else {
      pending.push([vendor, fn, args])
    }
  }

  window.UJETMobile = {
    ready: false,
    bootstrap: function (config) {
      record(partner, 'bootstrap', config || {})
      this.ready = true
    },
  }

  window.addEventListener('cdx-mobile-vendor-ready', function (event) {
    var detail = (event && event.detail) || {}
    record(partner, 'sdk-ready', {
      app: detail.app,
      org: detail.org,
      source: detail.source,
      hasToken: Boolean(detail.token),
    })
    window.UJETMobile.bootstrap({app: detail.app, token: detail.token, source: detail.source})
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
    var origin = mockPartnerScriptOrigin('/vendors/mobile-chat-jsbridge/mobile.js')
    s.src = origin + '/vendors/_shared/mock-overlay.js'
    s.onload = cb
    document.head.appendChild(s)
  }

  loadOverlay(function () {
    window.MockOverlay.create('Mobile Chat')
    window.MockOverlay.recordCall(partner, 'sdk-loaded', {})
    while (pending.length > 0) {
      var c = pending.shift()
      window.MockOverlay.recordCall(c[0], c[1], c[2])
    }
  })
})()
