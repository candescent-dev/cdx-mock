/**
 * Mock Google Tag Manager loader.
 *
 * Pairs with the `tag-manager` template. Real GTM is a 2-stage script: the
 * inline bootstrap pushes to `dataLayer` and injects this file via a
 * `<script src=".../gtm.js?id=GTM-...">` tag. We mirror that surface so the
 * generated template runs end-to-end without contacting Google.
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
    var origin = mockPartnerScriptOrigin('/vendors/gtm/gtm.js')
    s.src = origin + '/vendors/_shared/mock-overlay.js'
    s.onload = cb
    document.head.appendChild(s)
  }

  function readContainerId() {
    // Production GTM uses `document.currentScript`, but the real GTM bootstrap
    // also calls `f.parentNode.insertBefore(j, f)` which leaves jsdom without a
    // `currentScript` in some async paths. Fall back to scanning every script
    // in the document for one whose URL points at this loader and read `?id=`.
    var script = document.currentScript
    if (!script || !script.src) {
      var scripts = Array.prototype.slice.call(document.scripts)
      for (var i = scripts.length - 1; i >= 0; i--) {
        var src = scripts[i] && scripts[i].src
        if (src && /\/vendors\/gtm\/gtm\.js(?:\?|$)/.test(src)) {
          script = scripts[i]
          break
        }
      }
    }
    if (!script || !script.src) return ''
    try {
      var u = new URL(script.src)
      return u.searchParams.get('id') || ''
    } catch (e) {
      return ''
    }
  }

  loadOverlay(function () {
    var containerId = readContainerId()
    var badge = window.MockOverlay.create('GTM')
    badge.update({userFullName: containerId || '(no id)'})

    window.dataLayer = window.dataLayer || []
    var originalPush = window.dataLayer.push.bind(window.dataLayer)
    window.dataLayer.push = function () {
      var args = Array.prototype.slice.call(arguments)
      window.MockOverlay.recordCall('GTM', 'dataLayer.push', args)
      return originalPush.apply(null, args)
    }

    window.MockOverlay.recordCall('GTM', 'init', {containerId: containerId})
    window.dataLayer.push({event: 'mock_gtm_loaded', containerId: containerId})
  })
})()
