import type {FastifyInstance} from 'fastify'

/**
 * Mock JSBridge token endpoint. Mobile templates use this to simulate the
 * native token-fetch path (`webkit.messageHandlers.tokenApiDetails` /
 * `JSBridge.tokenApiDetails`). Returns a synthetic but well-shaped token
 * payload so the template's downstream logic exercises real code paths.
 */
export async function registerToken(app: FastifyInstance) {
  app.post('/token', async (req) => {
    const body = (req.body ?? {}) as Record<string, unknown>
    return {
      ok: true,
      access_token: 'MOCK_ACCESS_TOKEN_' + Date.now().toString(36),
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'openid profile',
      issued_at: new Date().toISOString(),
      echo: body,
    }
  })
}
