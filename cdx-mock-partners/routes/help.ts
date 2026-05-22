import type {FastifyInstance} from 'fastify'

/**
 * Mock help / chat target for the `floating-action-button` template. The
 * template opens this URL in a new tab when the user clicks the FAB. We serve
 * a tiny page so reviewers can confirm navigation actually fires (vs. e.g. a
 * blocked popup).
 */
export async function registerHelp(app: FastifyInstance) {
  app.get('/help', async (_req, reply) => {
    reply.type('text/html').send(`<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Mock · Help</title></head>
<body style="font:14px system-ui,sans-serif;color:#1e293b;background:#f8fafc;padding:24px;max-width:520px">
  <h1 style="margin:0 0 12px;font-size:18px">MOCK · Help center</h1>
  <p>This page stands in for whatever help / chat URL a real aspect would open. Clicking the floating-action-button opens this URL in a new tab.</p>
  <p style="opacity:.7">Path: <code>/help</code></p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0" />
  <p style="margin:0 0 8px;font-weight:600">Simulated next step</p>
  <p id="help-next" style="margin:0 0 12px;color:#475569;display:none">In production this might deep-link to FAQs, start a co-browse session, or hand off to authenticated support.</p>
  <button type="button" id="help-demo-btn" style="padding:8px 14px;border-radius:8px;border:1px solid #cbd5e1;background:#fff;cursor:pointer;font:inherit">
    Reveal typical post-navigation content
  </button>
  <script>
    document.getElementById('help-demo-btn').addEventListener('click', function () {
      document.getElementById('help-next').style.display = 'block';
      this.textContent = 'Done — refresh to reset';
      this.disabled = true;
    });
  </script>
</body>
</html>`)
  })
}
