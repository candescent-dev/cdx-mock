import {afterAll, beforeAll, describe, expect, it} from 'vitest'
import {buildServer} from '../server.js'
import type {FastifyInstance} from 'fastify'

let app: FastifyInstance

beforeAll(async () => {
  app = await buildServer()
  await app.ready()
})

afterAll(async () => {
  await app?.close()
})

describe('cdx-mock-partners', () => {
  it('responds to /health', async () => {
    const resp = await app.inject({method: 'GET', url: '/health'})
    expect(resp.statusCode).toBe(200)
    const body = resp.json() as {ok: boolean; name: string}
    expect(body).toMatchObject({ok: true, name: 'cdx-mock-partners'})
  })

  it('lists vendors covering every Phase-4 template family', async () => {
    const resp = await app.inject({method: 'GET', url: '/vendors'})
    expect(resp.statusCode).toBe(200)
    const list = resp.json() as Array<{id: string; templateId: string}>
    const byId = (id: string) => list.find((v) => v.id === id)

    expect(byId('glia')).toMatchObject({templateId: 'vendor-script-loader'})
    expect(byId('link-live')).toMatchObject({templateId: 'vendor-script-with-config'})
    expect(byId('gtm')).toMatchObject({templateId: 'tag-manager'})
    expect(byId('salesforce')).toMatchObject({templateId: 'vendor-sdk-personalized'})
    expect(byId('five9')).toMatchObject({templateId: 'vendor-sdk-personalized'})
    expect(byId('acquire')).toMatchObject({templateId: 'vendor-sdk-personalized'})
    expect(byId('ujet-mobile')).toMatchObject({templateId: 'mobile-vendor-chat-jsbridge'})
    expect(byId('salesforce-mobile')).toMatchObject({templateId: 'mobile-vendor-chat-jsbridge'})
    expect(byId('offers-widget')).toMatchObject({templateId: 'vendor-iframe-modal'})
    expect(byId('offers-widget-mobile')).toMatchObject({templateId: 'mobile-vendor-iframe-modal'})
  })

  it('serves the Glia mock SDK as JS', async () => {
    const resp = await app.inject({method: 'GET', url: '/vendors/glia/sdk.js'})
    expect(resp.statusCode).toBe(200)
    expect(resp.body).toContain('GliaMock')
    expect(resp.body).toContain("window.MockOverlay.create('Glia')")
  })

  it('serves the Link Live mock SDK as JS', async () => {
    const resp = await app.inject({method: 'GET', url: '/vendors/link-live/aspect.js'})
    expect(resp.statusCode).toBe(200)
    expect(resp.body).toContain('NCR_LIVE_AGENT_CSS_URL')
    expect(resp.body).toContain('NCR_LIVE_AGENT_CONTENT_URL')
  })

  it('renders the SSO handoff page with the requested app_code', async () => {
    const resp = await app.inject({method: 'GET', url: '/sso/handoff?app_code=TEST123'})
    expect(resp.statusCode).toBe(200)
    expect(resp.body).toContain('TEST123')
    expect(resp.body).toContain('mock-sso-handoff')
    expect(resp.body).toContain("type: 'sso-token'")
    expect(resp.body).toContain('MOCK_SSO_TOKEN_')
  })

  it('serves the GTM mock SDK', async () => {
    const resp = await app.inject({method: 'GET', url: '/vendors/gtm/gtm.js'})
    expect(resp.statusCode).toBe(200)
    expect(resp.body).toContain("MockOverlay.create('GTM')")
    expect(resp.body).toContain('window.dataLayer')
    expect(resp.body).toContain('mock_gtm_loaded')
  })

  it('serves the Salesforce embedded mock SDK with embeddedservice_bootstrap.init', async () => {
    const resp = await app.inject({method: 'GET', url: '/vendors/salesforce/embedded.js'})
    expect(resp.statusCode).toBe(200)
    expect(resp.body).toContain('embeddedservice_bootstrap')
    expect(resp.body).toContain('cdx-vendor-sdk-ready')
  })

  it('serves the Five9 mock SDK exposing Five9ChatPlugin', async () => {
    const resp = await app.inject({method: 'GET', url: '/vendors/five9/chat.js'})
    expect(resp.statusCode).toBe(200)
    expect(resp.body).toContain('Five9ChatPlugin')
  })

  it('serves the Acquire mock SDK exposing AcquireApp.init', async () => {
    const resp = await app.inject({method: 'GET', url: '/vendors/acquire/widget.js'})
    expect(resp.statusCode).toBe(200)
    expect(resp.body).toContain('AcquireApp.init')
  })

  it('serves the UJET mobile mock SDK that listens for cdx-mobile-vendor-ready', async () => {
    const resp = await app.inject({method: 'GET', url: '/vendors/ujet/mobile.js'})
    expect(resp.statusCode).toBe(200)
    expect(resp.body).toContain('UJETMobile')
    expect(resp.body).toContain('cdx-mobile-vendor-ready')
  })

  it('serves the Salesforce mobile mock SDK that listens for cdx-mobile-vendor-ready', async () => {
    const resp = await app.inject({method: 'GET', url: '/vendors/salesforce/mobile.js'})
    expect(resp.statusCode).toBe(200)
    expect(resp.body).toContain('SalesforceMobileChat')
    expect(resp.body).toContain('cdx-mobile-vendor-ready')
  })

  it('serves the help-icon SVG', async () => {
    const resp = await app.inject({method: 'GET', url: '/vendors/_shared/help-icon.svg'})
    expect(resp.statusCode).toBe(200)
    expect(resp.body).toContain('<svg')
  })

  it('renders the /help page for floating-action-button targets', async () => {
    const resp = await app.inject({method: 'GET', url: '/help'})
    expect(resp.statusCode).toBe(200)
    expect(resp.body).toContain('Help center')
  })

  it('returns retail and business JSON config for /link-live/handoff/:variant', async () => {
    const retail = await app.inject({method: 'GET', url: '/link-live/handoff/retail'})
    expect(retail.statusCode).toBe(200)
    const retailBody = retail.json() as {flavor: string; features: {coBrowse: boolean}}
    expect(retailBody.flavor).toBe('retail')
    expect(retailBody.features.coBrowse).toBe(false)

    const business = await app.inject({method: 'GET', url: '/link-live/handoff/business'})
    expect(business.statusCode).toBe(200)
    const businessBody = business.json() as {flavor: string; features: {coBrowse: boolean}}
    expect(businessBody.flavor).toBe('business')
    expect(businessBody.features.coBrowse).toBe(true)

    const unknown = await app.inject({method: 'GET', url: '/link-live/handoff/personal'})
    expect(unknown.statusCode).toBe(404)
  })

  it('returns a synthetic JSBridge token from POST /token', async () => {
    const resp = await app.inject({method: 'POST', url: '/token', payload: {action: 'getToken'}})
    expect(resp.statusCode).toBe(200)
    const body = resp.json() as {ok: boolean; access_token: string; echo: unknown}
    expect(body.ok).toBe(true)
    expect(body.access_token).toMatch(/^MOCK_ACCESS_TOKEN_/)
    expect(body.echo).toEqual({action: 'getToken'})
  })

  it('returns an OIDC-toolkit-shaped response from /auth/authorize', async () => {
    const resp = await app.inject({
      method: 'GET',
      url: '/auth/authorize?client_id=demo&redirect_uri=http://localhost/callback',
    })
    expect(resp.statusCode).toBe(200)
    const body = resp.json() as {ok: boolean; code: string; authorizationCode: string; redirectUrl: string}
    expect(body.ok).toBe(true)
    expect(body.code).toMatch(/^MOCK_CODE_/)
    expect(body.code).toBe(body.authorizationCode)
    expect(body.redirectUrl).toContain('code=' + body.code)
  })

  // ---- vendor-iframe-modal full OIDC redirect chain (steps 1-6 in template-families.md) ----

  describe('vendor-iframe-modal OIDC chain', () => {
    it('POST /api/widget/start returns an authorize URL on the mock IdP', async () => {
      const resp = await app.inject({
        method: 'POST',
        url: '/api/widget/start',
        headers: {
          'content-type': 'application/json',
          origin: 'http://localhost:3000',
          'x-cdx-correlation-id': 'aspect_test_abc123',
          authorization: 'Bearer test-token-value',
        },
        payload: {returnUrl: 'http://localhost:3000/'},
      })
      expect(resp.statusCode).toBe(200)
      // CORS headers must be present and Origin-specific (per FI provisioning).
      expect(resp.headers['access-control-allow-origin']).toBe('http://localhost:3000')
      expect(resp.headers['access-control-allow-credentials']).toBe('true')
      expect(resp.headers['vary']).toBe('Origin')

      const body = resp.json() as {
        success: boolean
        data: {authorizationUrl: string}
        _mock: {correlationId: string; seenAuthHeader: string}
      }
      expect(body.success).toBe(true)
      expect(body.data.authorizationUrl).toContain('/oidc-mock/authorize')
      expect(body.data.authorizationUrl).toContain('state=')
      expect(body.data.authorizationUrl).toContain('correlationId=aspect_test_abc123')
      // Bearer token must be redacted in the echo.
      expect(body._mock.seenAuthHeader).toBe('Bearer ***')
      expect(body._mock.correlationId).toBe('aspect_test_abc123')
    })

    it('OPTIONS preflight returns Origin-specific CORS headers', async () => {
      const resp = await app.inject({
        method: 'OPTIONS',
        url: '/api/widget/start',
        headers: {
          origin: 'http://localhost:3000',
          'access-control-request-method': 'POST',
        },
      })
      expect(resp.statusCode).toBe(204)
      expect(resp.headers['access-control-allow-origin']).toBe('http://localhost:3000')
      expect(resp.headers['access-control-allow-methods']).toContain('POST')
      expect(resp.headers['access-control-allow-headers']).toContain('authorization')
      expect(resp.headers['access-control-allow-headers']).toContain('x-cdx-correlation-id')
    })

    it('GET /oidc-mock/authorize renders the mock FI auth page that redirects to the partner callback', async () => {
      const resp = await app.inject({
        method: 'GET',
        url: '/oidc-mock/authorize?client_id=mock-fi-client-id&redirect_uri=http://localhost:4011/offers/widget/callback&state=abc&correlationId=aspect_test',
      })
      expect(resp.statusCode).toBe(200)
      expect(resp.body).toContain('Signing you in as Mock User')
      expect(resp.body).toContain('FI Authorization Server')
      // Auto-redirect target carries the synthesized code, the original state, and the correlation id.
      expect(resp.body).toMatch(/window\.location\.replace\("[^"]*code=mock_code_/)
      expect(resp.body).toContain('state=abc')
      expect(resp.body).toContain('correlationId=aspect_test')
      // CSP-friendly: no inline onclick / onerror handlers in the emitted page.
      expect(resp.body).not.toMatch(/onclick\s*=\s*"/)
    })

    it('GET /oidc-mock/authorize falls back to the canonical callback when redirect_uri is malicious', async () => {
      // An attacker-supplied redirect_uri that points off-host must be ignored
      // — the mock IdP's redirect_uri allowlist mirrors the real IdP behavior.
      const resp = await app.inject({
        method: 'GET',
        url: '/oidc-mock/authorize?redirect_uri=https://evil.example.com/steal',
      })
      expect(resp.statusCode).toBe(200)
      expect(resp.body).not.toContain('evil.example.com')
      expect(resp.body).toContain('/offers/widget/callback')
    })

    it('GET /offers/widget/callback 302s to the offers widget with the chain context', async () => {
      const resp = await app.inject({
        method: 'GET',
        url: '/offers/widget/callback?code=mock_code_xyz&state=abc&correlationId=aspect_test',
      })
      expect(resp.statusCode).toBe(302)
      const location = resp.headers['location'] as string
      expect(location).toContain('/offers/widget')
      expect(location).toContain('state=abc')
      expect(location).toContain('correlationId=aspect_test')
      expect(location).toContain('exchanged=mock_code_')
    })

    it('GET /offers/widget renders the widget UI with vendor_action dismiss buttons', async () => {
      const resp = await app.inject({
        method: 'GET',
        url: '/offers/widget?correlationId=aspect_test&state=abc&exchanged=mock_code_x',
      })
      expect(resp.statusCode).toBe(200)
      expect(resp.body).toContain('Partner offers widget (post-OIDC)')
      expect(resp.body).toContain("data-action=\"oidc_complete\"")
      expect(resp.body).toContain("data-action=\"close\"")
      expect(resp.body).toContain("data-action=\"remind_later\"")
      // Mock widget posts the canonical generic envelope shape; the template
      // accepts this by default. Partner-specific envelope types must be
      // explicitly opted in at submission time via --allowed-message-types.
      expect(resp.body).toContain("type: 'vendor_action'")
      // OIDC chain trace must surface every step's context for reviewers.
      expect(resp.body).toContain('correlationId: aspect_test')
      expect(resp.body).toContain('state: abc')
      expect(resp.body).toContain('exchangedCode: mock_code_x')
    })
  })
})
