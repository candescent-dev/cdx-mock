import type {FastifyInstance} from 'fastify'
import {mockPartnersBaseUrl} from '../lib/partner-port.js'

/**
 * Mock endpoints for the `vendor-iframe-modal` and `mobile-vendor-iframe-modal`
 * templates (generic OIDC-bridged partner widget overlay pattern — applicable
 * to any card-marketing overlay, credit-decision widget, partner offers
 * loader, etc., regardless of vendor).
 *
 * The mock walks through the same redirect chain a real partner widget would:
 *
 *   1. Aspect             →  POST /api/widget/start
 *      (CORS check; partner must allowlist the FI's origin in production)
 *   2. /api/widget/start  →  returns { data: { authorizationUrl } } that points
 *                            at the mock FI authorization server. In production
 *                            this URL is on the FI's OIDC identity provider.
 *   3. Aspect             →  iframe.src = authorizationUrl
 *   4. /oidc-mock/authorize → renders "Signing you in as Mock User…" then
 *                             auto-redirects to redirect_uri with ?code=…&state=…
 *                             (stands in for the FI's authorization server)
 *   5. /offers/widget/callback  → mock auth-code exchange; immediate redirect
 *                                 to /offers/widget?state=…&correlationId=…
 *                                 (stands in for the partner's OIDC callback)
 *   6. /offers/widget     →  renders the actual offers widget UI with dismiss
 *                            buttons that postMessage `vendor_action` envelopes
 *                            back to the parent (the canonical generic envelope
 *                            shape the `vendor-iframe-modal` template expects
 *                            by default)
 *
 * Each page narrates the mapping back to real production layers so a partner
 * or FI reviewer can match each mock step onto its production counterpart
 * (partner edge ↔ FI API gateway ↔ FI IdP / federation ↔ FI shell).
 *
 * CORS headers are deliberately permissive (`Access-Control-Allow-Origin: *`)
 * because the mock is loopback-only. In production each partner has to
 * allowlist each FI's origin server-side.
 */
export async function registerWidgetStart(app: FastifyInstance) {
  // ---- Step 1+2: POST /api/widget/start ----
  app.post('/api/widget/start', async (req, reply) => {
    const base = mockPartnersBaseUrl()
    const correlationId = (req.headers['x-cdx-correlation-id'] as string | undefined) ?? null
    const auth = (req.headers['authorization'] as string | undefined) ?? null
    const origin = (req.headers['origin'] as string | undefined) ?? null
    const sanitizedCorrelationId = (correlationId ?? '').slice(0, 128).replace(/[^A-Za-z0-9._-]/g, '')

    // Synthesize a mock OIDC `state` token. In production the partner generates
    // this server-side, persists it (correlated with the FI's session), and
    // validates it on the callback. We just round-trip it through the chain so
    // the demo shows the full flow without persistence.
    const state = `mock_state_${Math.random().toString(36).slice(2, 12)}`
    const authorizeUrl = new URL(`${base}/oidc-mock/authorize`)
    authorizeUrl.searchParams.set('client_id', 'mock-fi-client-id')
    authorizeUrl.searchParams.set('redirect_uri', `${base}/offers/widget/callback`)
    authorizeUrl.searchParams.set('response_type', 'code')
    authorizeUrl.searchParams.set('scope', 'openid')
    authorizeUrl.searchParams.set('state', state)
    if (sanitizedCorrelationId) authorizeUrl.searchParams.set('correlationId', sanitizedCorrelationId)

    reply.header('Access-Control-Allow-Origin', origin ?? '*')
    reply.header('Access-Control-Allow-Credentials', 'true')
    reply.header('Vary', 'Origin')
    reply.header('Cache-Control', 'no-store')
    return {
      success: true,
      data: {
        authorizationUrl: authorizeUrl.toString(),
      },
      // Echoed for debuggability — never echo back the bearer token in production.
      _mock: {
        correlationId,
        seenOrigin: origin,
        seenAuthHeader: auth ? auth.replace(/Bearer\s+.+/i, 'Bearer ***') : null,
        at: new Date().toISOString(),
        nextStep: 'Set iframe.src to data.authorizationUrl; the mock OIDC chain will redirect through /oidc-mock/authorize → /offers/widget/callback → /offers/widget.',
      },
    }
  })

  app.options('/api/widget/start', async (req, reply) => {
    const origin = (req.headers['origin'] as string | undefined) ?? '*'
    reply
      .header('Access-Control-Allow-Origin', origin)
      .header('Access-Control-Allow-Credentials', 'true')
      .header('Access-Control-Allow-Methods', 'POST, OPTIONS')
      .header('Access-Control-Allow-Headers', 'authorization, content-type, x-cdx-correlation-id')
      .header('Vary', 'Origin')
      .code(204)
      .send()
  })

  // ---- Step 4: /oidc-mock/authorize — mock FI authorization server ----
  app.get<{
    Querystring: {
      client_id?: string
      redirect_uri?: string
      state?: string
      correlationId?: string
    }
  }>('/oidc-mock/authorize', async (req, reply) => {
    const q = req.query
    const clientId = (q.client_id ?? '').slice(0, 128)
    const rawRedirectUri = q.redirect_uri ?? ''
    const state = (q.state ?? '').slice(0, 128).replace(/[^A-Za-z0-9._-]/g, '')
    const correlationId = (q.correlationId ?? '').slice(0, 128).replace(/[^A-Za-z0-9._-]/g, '')

    // The redirect_uri is partner-controlled; we validate it points back at our
    // mock partner host so a misconfigured snippet can't bounce the user off to
    // an arbitrary URL via this mock page. In production the FI's IdP applies
    // its own redirect_uri allowlist (per registered OIDC client).
    const base = mockPartnersBaseUrl()
    let redirectUri = `${base}/offers/widget/callback`
    try {
      const parsed = new URL(rawRedirectUri)
      if (parsed.origin === new URL(base).origin) redirectUri = parsed.href
    } catch {
      // Fall through to the default.
    }

    const code = `mock_code_${Math.random().toString(36).slice(2, 12)}`
    const callbackUrl = new URL(redirectUri)
    callbackUrl.searchParams.set('code', code)
    if (state) callbackUrl.searchParams.set('state', state)
    if (correlationId) callbackUrl.searchParams.set('correlationId', correlationId)

    reply.type('text/html').send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Mock FI Authorization Server</title>
  <style>
    body { margin:0; font:14px/1.5 system-ui,sans-serif; color:#0f172a; background:#f8fafc; min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; }
    .card { background:#fff; max-width:520px; width:100%; border-radius:16px; padding:24px; box-shadow:0 16px 40px rgba(0,0,0,.08); }
    h1 { margin:0 0 6px; font-size:16px; }
    .pill { display:inline-block; padding:2px 8px; border-radius:999px; font-size:11px; font-weight:600; background:#fef3c7; color:#92400e; margin-bottom:12px; }
    .spinner { display:inline-block; width:14px; height:14px; border:2px solid #cbd5e1; border-top-color:#0ea5e9; border-radius:50%; animation:spin .8s linear infinite; vertical-align:middle; margin-right:8px; }
    @keyframes spin { to { transform:rotate(360deg); } }
    p { margin:0 0 8px; color:#475569; font-size:13px; }
    .map { margin:16px 0 0; padding:12px; background:#f1f5f9; border-radius:8px; }
    .map h2 { margin:0 0 6px; font-size:12px; font-weight:600; color:#0f172a; text-transform:uppercase; letter-spacing:.04em; }
    .map ul { margin:0; padding-left:18px; font-size:12px; color:#334155; line-height:1.55; }
    .map code { background:#fff; padding:1px 5px; border-radius:3px; font:11.5px ui-monospace,Menlo,monospace; }
  </style>
</head>
<body>
  <div class="card">
    <span class="pill">MOCK · FI Authorization Server</span>
    <h1><span class="spinner"></span>Signing you in as Mock User…</h1>
    <p>This mock page stands in for the FI's OIDC authorization server. In production, the partner's <code>widget/start</code> response points the iframe here; the user authenticates against your FI's IdP; the IdP redirects back to the partner's callback with an authorization code.</p>
    <div class="map">
      <h2>Production mapping</h2>
      <ul>
        <li>This page → <strong>FI identity provider</strong> (OIDC authorization server)</li>
        <li>The partner's OIDC client must be registered <em>per FI</em> on the IdP, with this exact <code>redirect_uri</code> on the allowlist.</li>
        <li>For partner-bridged offer flows: this is the FI-specific authorization server that the partner's <code>widget/start</code> redirects to.</li>
      </ul>
    </div>
    <p style="margin-top:12px;font-size:12px;color:#64748b">
      Auto-redirecting to the partner's callback in ~800 ms with <code>code=${code}</code>${state ? `, <code>state=${state}</code>` : ''}…
    </p>
  </div>
  <script>
    // No CSP-incompatible inline handler — addEventListener via DOMContentLoaded.
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(function () { window.location.replace(${JSON.stringify(callbackUrl.toString())}); }, 800);
    });
  </script>
</body>
</html>`)
  })

  // ---- Step 5: /offers/widget/callback — mock partner OIDC callback ----
  app.get<{
    Querystring: {
      code?: string
      state?: string
      correlationId?: string
    }
  }>('/offers/widget/callback', async (req, reply) => {
    const code = (req.query.code ?? '').slice(0, 64).replace(/[^A-Za-z0-9._-]/g, '')
    const state = (req.query.state ?? '').slice(0, 128).replace(/[^A-Za-z0-9._-]/g, '')
    const correlationId = (req.query.correlationId ?? '').slice(0, 128).replace(/[^A-Za-z0-9._-]/g, '')

    // In production the partner exchanges the auth code for tokens here
    // (server-to-server with the FI's token endpoint), drops a session cookie,
    // then renders or redirects to the actual widget. We skip the token
    // exchange (this is loopback only) and redirect straight to the widget.
    const widgetUrl = new URL(`${mockPartnersBaseUrl()}/offers/widget`)
    if (state) widgetUrl.searchParams.set('state', state)
    if (correlationId) widgetUrl.searchParams.set('correlationId', correlationId)
    if (code) widgetUrl.searchParams.set('exchanged', code.slice(0, 10) + '…')

    reply.redirect(widgetUrl.toString(), 302)
  })

  // ---- Step 6: /offers/widget — partner widget UI ----
  app.get<{Querystring: {correlationId?: string; state?: string; exchanged?: string}}>(
    '/offers/widget',
    async (req, reply) => {
      const correlationId = (req.query.correlationId ?? '').slice(0, 128).replace(/[^A-Za-z0-9._-]/g, '')
      const state = (req.query.state ?? '').slice(0, 128).replace(/[^A-Za-z0-9._-]/g, '')
      const exchanged = (req.query.exchanged ?? '').slice(0, 32).replace(/[^A-Za-z0-9._…-]/g, '')
      reply.type('text/html').send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Mock Offers Widget</title>
  <style>
    body { margin:0; font:14px/1.5 system-ui,sans-serif; color:#0f172a; background:linear-gradient(180deg,#0ea5e9,#0369a1); min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; }
    .card { background:#fff; max-width:520px; width:100%; border-radius:16px; padding:24px; box-shadow:0 24px 60px rgba(0,0,0,.25); }
    h1 { margin:0 0 8px; font-size:18px; }
    .pill { display:inline-block; padding:2px 8px; border-radius:999px; font-size:11px; font-weight:600; background:#dcfce7; color:#166534; margin-bottom:10px; }
    p.lead { margin:0 0 16px; color:#475569; font-size:13px; line-height:1.45; }
    .actions { display:flex; gap:8px; flex-wrap:wrap; }
    button { padding:10px 14px; border-radius:10px; border:1px solid #cbd5e1; background:#f8fafc; color:#0f172a; cursor:pointer; font:inherit; font-weight:600; }
    button.primary { background:#0ea5e9; color:#fff; border-color:#0ea5e9; }
    .meta { margin-top:14px; padding:10px; background:#f1f5f9; border-radius:8px; font-size:11.5px; color:#334155; font-family:ui-monospace,Menlo,monospace; word-break:break-all; line-height:1.55; }
    .meta strong { color:#0f172a; font-family:system-ui,sans-serif; font-size:11px; text-transform:uppercase; letter-spacing:.04em; }
  </style>
</head>
<body>
  <div class="card">
    <span class="pill">MOCK · Partner offers widget (post-OIDC)</span>
    <h1>Welcome — here are your pre-approved offers</h1>
    <p class="lead">This page stands in for a real partner widget after the OIDC chain completes. The Aspect template renders it inside a sandboxed iframe; the buttons below post <code>vendor_action</code> envelopes (the canonical generic shape the template validates against by default). <strong>Every allowlisted action dismisses the overlay</strong> — the action string flows through to the host as the <code>reason</code> on the <code>cdx-aspect:overlay-dismissed</code> CustomEvent, so FI consumers route on it (e.g. <code>oidc_complete</code> → navigate to /offers, <code>remind_later</code> → set a snooze cookie).</p>
    <div class="actions">
      <button class="primary" data-action="oidc_complete">See my offers (oidc_complete)</button>
      <button data-action="close">Close</button>
      <button data-action="remind_later">Remind later</button>
      <button data-action="no_thanks">No thanks</button>
      <button data-action="no_offers">No offers</button>
      <button data-action="show_loading">Show loading</button>
    </div>
    <div class="meta">
      <strong>OIDC chain trace</strong><br>
      correlationId: ${correlationId || '(none)'}<br>
      state: ${state || '(none)'}<br>
      exchangedCode: ${exchanged || '(skipped — mock did not exchange the code)'}
    </div>
  </div>
  <script>
    function post(action) {
      try {
        parent.postMessage({ type: 'vendor_action', action: action }, '*');
      } catch (e) { console.error('postMessage failed', e); }
    }
    document.addEventListener('DOMContentLoaded', function () {
      document.querySelectorAll('button[data-action]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var action = btn.getAttribute('data-action');
          post(action);
        });
      });
    });
  </script>
</body>
</html>`)
    },
  )
}
