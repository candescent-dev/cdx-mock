/**
 * Mock embedded service chat SDK.
 *
 * Pairs with the `vendor-sdk-personalized` template (preset: embedded-service-chat).
 * Exposes `mockEmbeddedChat.init(orgId, app, settings)` — same arity as production
 * embedded-service chat SDKs so Forge-generated templates can call it unchanged.
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
    var origin = mockPartnerScriptOrigin('/vendors/embedded-service-chat/embedded.js')
    s.src = origin + '/vendors/_shared/mock-overlay.js'
    s.onload = cb
    document.head.appendChild(s)
  }

  loadOverlay(function () {
    var partner = 'embedded-service-chat'
    var badge = window.MockOverlay.create('Embedded Service')
    window.mockEmbeddedChat = window.mockEmbeddedChat || {}
    window.mockEmbeddedChat.init = function (orgId, app, settings) {
      window.MockOverlay.recordCall(partner, 'init', {
        orgId: orgId,
        app: app,
        settings: settings || {},
      })
      var name = (settings && settings.name) || (window.PreChatFields && window.PreChatFields.name) || ''
      badge.update({userFullName: name, userGuid: orgId})
    }

    window.dispatchEvent(new CustomEvent('cdx-vendor-sdk-ready', {detail: {vendor: partner}}))
    window.MockOverlay.recordCall(partner, 'sdk-ready', {})
  })
})()
