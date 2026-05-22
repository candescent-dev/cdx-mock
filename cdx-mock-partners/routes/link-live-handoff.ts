import type {FastifyInstance} from 'fastify'
import {mockPartnersBaseUrl} from '../lib/partner-port.js'

/**
 * Mock content / config endpoint for the `vendor-script-with-config` template
 * (Link Live preset). The real per-tenant config is a JSON document that the
 * vendor SDK reads off `window.AspectConfigContent`. We return shape-correct
 * placeholders for `retail` and `business` flavors so previews work end-to-end.
 */
function variantPayload(variant: string): Record<string, unknown> | undefined {
  const base = mockPartnersBaseUrl()
  const handoff = (code: string) => `${base}/sso/handoff?app_code=${code}`

  if (variant === 'retail') {
    return {
      flavor: 'retail',
      sso: {
        provider: 'mock-fmis',
        handoffUrl: handoff('RETAIL'),
      },
      features: {
        preChat: true,
        coBrowse: false,
      },
    }
  }
  if (variant === 'business') {
    return {
      flavor: 'business',
      sso: {
        provider: 'mock-fmis',
        handoffUrl: handoff('BUSINESS'),
      },
      features: {
        preChat: true,
        coBrowse: true,
        escalation: true,
      },
    }
  }
  return undefined
}

const ALLOWED_VARIANTS = ['retail', 'business'] as const

export async function registerLinkLiveHandoff(app: FastifyInstance) {
  app.get<{Params: {variant: string}}>('/link-live/handoff/:variant', async (req, reply) => {
    const variant = req.params.variant
    const payload = variantPayload(variant)
    if (!payload) {
      reply.code(404).send({ok: false, error: `unknown variant: ${variant}`, allowed: [...ALLOWED_VARIANTS]})
      return
    }

    reply.type('application/json').send(payload)
  })
}
