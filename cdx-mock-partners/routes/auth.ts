import type {FastifyInstance} from 'fastify'

/**
 * Mirrors the response shape of the OIDC Toolkit (`localhost:9000/api/auth/authorize`)
 * so the Forge CLI `oidc-snippet` aspect template can run end-to-end
 * against this mock server when the toolkit is not running.
 */
export async function registerAuth(app: FastifyInstance) {
  app.get('/auth/authorize', async (req) => {
    const q = req.query as Record<string, string>
    const code = 'MOCK_CODE_' + Math.random().toString(36).slice(2, 12)
    return {
      ok: true,
      code,
      authorizationCode: code,
      redirectUrl: (q.redirect_uri ?? 'http://localhost/callback') + '?code=' + encodeURIComponent(code),
      issued_at: new Date().toISOString(),
      client_id: q.client_id ?? 'MOCK_CLIENT_ID',
    }
  })
}
