/**
 * Mock Salesforce Embedded Service chat SDK.
 *
 * Pairs with the `vendor-sdk-personalized` template (preset: salesforce-chat).
 * Real Salesforce exposes `embeddedservice_bootstrap.init(orgId, app, settings)`
 * — we mirror that signature so generated templates can call it unchanged.
 *
 * The mock dispatches `cdx-vendor-sdk-ready` on load (the template listens for
 * it before calling `init`), records every init call, and shows the seeded
 * pre-chat fields in a badge so reviewers can eyeball that personalization
 * data is making it through.
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
    var origin = mockPartnerScriptOrigin('/vendors/salesforce/embedded.js')
    s.src = origin + '/vendors/_shared/mock-overlay.js'
    s.onload = cb
    document.head.appendChild(s)
  }

  loadOverlay(function () {
    var badge = window.MockOverlay.create('Salesforce')
    window.embeddedservice_bootstrap = window.embeddedservice_bootstrap || {}
    window.embeddedservice_bootstrap.init = function (orgId, app, settings) {
      window.MockOverlay.recordCall('Salesforce', 'init', {
        orgId: orgId,
        app: app,
        settings: settings || {},
      })
      var name = (settings && settings.name) || (window.PreChatFields && window.PreChatFields.name) || ''
      badge.update({userFullName: name, userGuid: orgId})
    }

    window.dispatchEvent(new CustomEvent('cdx-vendor-sdk-ready', {detail: {vendor: 'salesforce'}}))
    window.MockOverlay.recordCall('Salesforce', 'sdk-ready', {})
  })
})()
