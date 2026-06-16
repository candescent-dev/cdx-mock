import type {FastifyInstance} from 'fastify'
import {registerSsoHandoff} from './sso-handoff.js'
import {registerToken} from './token.js'
import {registerAuth} from './auth.js'
import {registerHelp} from './help.js'
import {registerScriptConfigHandoff} from './script-config-handoff.js'
import {registerWidgetStart} from './widget-start.js'
import {registerGallery} from './gallery.js'

export async function registerRoutes(app: FastifyInstance) {
  await registerSsoHandoff(app)
  await registerToken(app)
  await registerAuth(app)
  await registerHelp(app)
  await registerScriptConfigHandoff(app)
  await registerWidgetStart(app)
  await registerGallery(app)
}
