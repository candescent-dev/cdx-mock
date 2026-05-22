import type {FastifyInstance} from 'fastify'

/**
 * Mock SSO handoff target. Some vendor templates create a hidden iframe and
 * point it at an IdP handoff URL. This route serves an obviously-mock HTML
 * page that records the request and posts a "logged in" message back to the
 * parent window so the e2e harness can assert the iframe actually loaded.
 */
export async function registerSsoHandoff(app: FastifyInstance) {
  app.get('/sso/handoff', async (req, reply) => {
    const app_code = (req.query as Record<string, string>).app_code ?? 'EXAMPLE'
    reply.type('text/html').send(`<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Mock SSO Handoff</title></head>
<body style="font:14px system-ui,sans-serif;color:#1e293b;background:#f8fafc;padding:24px">
  <h1 style="margin:0 0 12px;font-size:18px">MOCK · SSO handoff for <code>${app_code}</code></h1>
  <p>This frame represents a successful SSO redirect. In production your IdP handoff endpoint would render here; in mock-mode we acknowledge the request and notify the parent.</p>
  <pre id="payload" style="background:#0f172a;color:#e2e8f0;padding:12px;border-radius:8px"></pre>
  <script>
    var msg = {
      source: 'mock-sso-handoff',
      type: 'sso-token',
      app_code: ${JSON.stringify(app_code)},
      status: 'ok',
      access_token: 'MOCK_SSO_TOKEN_' + Math.random().toString(36).slice(2, 10),
      at: new Date().toISOString(),
    };
    document.getElementById('payload').textContent = JSON.stringify(msg, null, 2);
    try { parent.postMessage(msg, '*'); } catch (e) { console.error('postMessage failed', e); }
  </script>
</body>
</html>`)
  })
}
