import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import {dirname, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {
  getPartnerPort,
  getPreferredPortFromEnv,
  isEaddrinuse,
  isStrictPartnerPort,
  mockPartnersBaseUrl,
  setPartnerListenPort,
} from './lib/partner-port.js'
import {registerRoutes} from './routes/index.js'

const HERE = dirname(fileURLToPath(import.meta.url))

const PORT_SCAN_MAX = 64

/**
 * Mock partner HTTP server (Fastify). Complements the `:4010` Core mock data APIs.
 *
 * Package: `cdx-mock-partners` (public Candescent repo). The server exposes:
 *   GET  /health                     — liveness probe used by `forge aspect preview`
 *   GET  /vendors                    — JSON catalog of available mock vendors
 *   GET  /vendors/<vendor>/<file>    — static mock SDK assets
 *   GET  /sso/handoff                — fake SSO landing page for hidden-iframe-sso
 *   POST /token                      — fake JSBridge token endpoint for mobile templates
 *   POST /api/widget/start           — fake partner widget/start endpoint for vendor-iframe-modal
 *                                      (returns an authorize URL on the mock IdP, not directly the widget)
 *   GET  /oidc-mock/authorize        — fake FI authorization server; auto-redirects to the partner callback
 *   GET  /offers/widget/callback     — fake partner OIDC callback (skips the token exchange)
 *   GET  /offers/widget              — the partner widget UI with dismiss buttons
 *   GET  /auth/authorize             — mirrors the OIDC toolkit on :9000 for offline use
 *
 * Every mock SDK records its calls into `window.__mockPartnerCalls` for local
 * testing and automation.
 */
export async function buildServer() {
  const app = Fastify({logger: {level: process.env.LOG_LEVEL ?? 'info'}})

  await app.register(fastifyStatic, {
    root: resolve(HERE, 'public'),
    prefix: '/vendors/',
    decorateReply: false,
    setHeaders(res) {
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Cache-Control', 'no-cache')
    },
  })

  await registerRoutes(app)

  app.get('/health', async (_req, reply) => {
    reply.header('Access-Control-Allow-Origin', '*')
    reply.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
    return {ok: true, name: 'cdx-mock-partners', port: getPartnerPort()}
  })

  app.options('/health', async (_req, reply) => {
    reply.header('Access-Control-Allow-Origin', '*')
    reply.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
    return reply.code(204).send()
  })

  app.get('/vendors', async () => listVendors())

  return app
}

interface VendorCatalogEntry {
  id: string
  description: string
  scriptPath: string
  cssPath?: string
  /** Auto-suggested template id this vendor mock pairs with */
  templateId: string
  /** Suggested defaults to feed `forge aspect preview` */
  defaults: Record<string, string>
}

function listVendors(): VendorCatalogEntry[] {
  const b = mockPartnersBaseUrl()
  const scriptConfigScript = `${b}/vendors/script-config/aspect.js`
  const scriptConfigCss = `${b}/vendors/script-config/aspect.css`
  return [
    {
      id: 'engagement-script-loader',
      description: 'Engagement script loader (single-script bootstrap pattern)',
      scriptPath: '/vendors/engagement-script-loader/sdk.js',
      cssPath: '/vendors/engagement-script-loader/sdk.css',
      templateId: 'vendor-script-loader',
      defaults: {vendorScriptUrl: `${b}/vendors/engagement-script-loader/sdk.js`},
    },
    {
      id: 'script-config-retail',
      description: 'Script-with-config chat (retail — CSS URL + content URL globals + script bootstrap)',
      scriptPath: '/vendors/script-config/aspect.js',
      cssPath: '/vendors/script-config/aspect.css',
      templateId: 'vendor-script-with-config',
      defaults: {
        vendorScriptUrl: scriptConfigScript,
        cssUrl: scriptConfigCss,
        contentUrl: `${b}/script-config/handoff/retail`,
      },
    },
    {
      id: 'script-config-business',
      description: 'Script-with-config chat (business — CSS URL + content URL globals + script bootstrap)',
      scriptPath: '/vendors/script-config/aspect.js',
      cssPath: '/vendors/script-config/aspect.css',
      templateId: 'vendor-script-with-config',
      defaults: {
        vendorScriptUrl: scriptConfigScript,
        cssUrl: scriptConfigCss,
        contentUrl: `${b}/script-config/handoff/business`,
      },
    },
    {
      id: 'tag-manager-mock',
      description: 'Tag manager bootstrap (dataLayer + script tag injection)',
      scriptPath: '/vendors/tag-manager-mock/gtm.js',
      templateId: 'tag-manager',
      defaults: {
        vendorScriptUrl: `${b}/vendors/tag-manager-mock/gtm.js`,
        gtmContainerId: 'GTM-MOCK000',
      },
    },
    {
      id: 'embedded-service-chat',
      description: 'Embedded service chat (personalized, web)',
      scriptPath: '/vendors/embedded-service-chat/embedded.js',
      templateId: 'vendor-sdk-personalized',
      defaults: {
        vendorScriptUrl: `${b}/vendors/embedded-service-chat/embedded.js`,
        vendorOrgId: '00DMOCKEMBEDDED0',
        vendorAppName: 'MockSupportApp',
        vendorInitFn: 'mockEmbeddedChat.init',
      },
    },
    {
      id: 'contact-center-chat',
      description: 'Contact center chat plugin (personalized, web)',
      scriptPath: '/vendors/contact-center-chat/chat.js',
      templateId: 'vendor-sdk-personalized',
      defaults: {
        vendorScriptUrl: `${b}/vendors/contact-center-chat/chat.js`,
        vendorAppName: 'MockSupportQueue',
        vendorInitFn: 'mockContactCenter',
      },
    },
    {
      id: 'cobrowse-chat',
      description: 'Co-browse chat (personalized, web)',
      scriptPath: '/vendors/cobrowse-chat/widget.js',
      templateId: 'vendor-sdk-personalized',
      defaults: {
        vendorScriptUrl: `${b}/vendors/cobrowse-chat/widget.js`,
        vendorAppName: 'mock-account',
        vendorInitFn: 'mockCobrowse.init',
      },
    },
    {
      id: 'mobile-chat-jsbridge',
      description: 'Mobile chat (JSBridge token + WebView SDK)',
      scriptPath: '/vendors/mobile-chat-jsbridge/mobile.js',
      templateId: 'mobile-vendor-chat-jsbridge',
      defaults: {
        vendorScriptUrl: `${b}/vendors/mobile-chat-jsbridge/mobile.js`,
        vendorAppName: 'mock-mobile-tenant',
        tokenEndpoint: `${b}/token`,
      },
    },
    {
      id: 'mobile-embedded-chat',
      description: 'Mobile embedded chat (JSBridge token + WebView SDK)',
      scriptPath: '/vendors/mobile-embedded-chat/mobile.js',
      templateId: 'mobile-vendor-chat-jsbridge',
      defaults: {
        vendorScriptUrl: `${b}/vendors/mobile-embedded-chat/mobile.js`,
        vendorOrgId: '00DMOCKEMBEDDED0',
        vendorAppName: 'MockMobileApp',
        tokenEndpoint: `${b}/token`,
      },
    },
    {
      id: 'offers-widget',
      description:
        'OIDC-bridged partner widget overlay (generic offers / card-marketing / credit-decision pattern). '
        + 'POST /api/widget/start → iframe lands on /oidc-mock/authorize → callback → /offers/widget.',
      scriptPath: '/api/widget/start',
      templateId: 'vendor-iframe-modal',
      defaults: {
        widgetStartUrl: `${b}/api/widget/start`,
      },
    },
    {
      id: 'offers-widget-mobile',
      description:
        'Mobile OIDC vendor widget overlay (JSBridge token + iframe WebView). '
        + 'Same redirect chain as `offers-widget` but auth comes from the native bridge, not cookies.',
      scriptPath: '/api/widget/start',
      templateId: 'mobile-vendor-iframe-modal',
      defaults: {
        widgetStartUrl: `${b}/api/widget/start`,
        tokenEndpoint: `${b}/token`,
      },
    },
  ]
}

function listenErrorHint(port: number, err: unknown): string {
  if (!isEaddrinuse(err)) return ''
  return (
    `\nAnother process is already bound to 127.0.0.1:${port} (often a previous cdx-mock-partners tab).\n`
    + `  • Stop the old server, or find it:  lsof -nP -iTCP:${port} | grep LISTEN\n`
    + `  • Or use a different port:  MOCK_PARTNERS_PORT=4012 pnpm start\n`
    + `    (then point Forge URLs at http://127.0.0.1:4012/… or set the same in presets.)\n`
    + `  • Or unset strict mode (default): omit MOCK_PARTNERS_STRICT_PORT so the next free port is used.\n`
  )
}

async function listenLoopbackWithPortFallback(app: Awaited<ReturnType<typeof buildServer>>): Promise<number> {
  const preferred = getPreferredPortFromEnv()
  const strict = isStrictPartnerPort()
  const ceiling = preferred + PORT_SCAN_MAX

  for (let port = preferred; port < ceiling; port++) {
    try {
      await app.listen({port, host: '127.0.0.1'})
      setPartnerListenPort(port)
      return port
    } catch (err) {
      if (!isEaddrinuse(err)) throw err
      if (strict) throw err
    }
  }

  throw new Error(`No free TCP port on 127.0.0.1 in range ${preferred}–${ceiling - 1}`)
}

async function main() {
  const app = await buildServer()
  const preferred = getPreferredPortFromEnv()
  try {
    const port = await listenLoopbackWithPortFallback(app)
    if (!isStrictPartnerPort() && port !== preferred) {
      app.log.warn(`Port ${preferred} in use — listening on ${port} (GET /vendors defaults match this port)`)
    }
    app.log.info(`cdx-mock-partners listening on http://localhost:${port}`)
    app.log.info(`  GET /health        → liveness probe`)
    app.log.info(`  GET /vendors       → vendor catalog`)
    app.log.info(`  GET /vendors/<id>  → static mock assets`)
  } catch (err) {
    app.log.error(err)
    const hint = listenErrorHint(preferred, err)
    if (hint) process.stderr.write(hint)
    process.exit(1)
  }
}

const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`
if (isMain) {
  void main()
}

export {
  getPartnerPort,
  getPreferredPortFromEnv,
  mockPartnersBaseUrl,
  setPartnerListenPort,
} from './lib/partner-port.js'
