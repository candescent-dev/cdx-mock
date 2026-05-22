import type {FastifyInstance} from 'fastify'
import {existsSync} from 'node:fs'
import {dirname, resolve} from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'

/**
 * Gallery route: serves a single page that runs every (template, preset)
 * combo from the built `cdx-forge-cli` against this mock partner server.
 *
 *   GET  /gallery                     — index of every template × preset
 *   GET  /gallery/run/:template/:preset?platform=web|mobile
 *                                    — runs one combo in an isolated frame
 *
 * The route lazy-imports the CLI dist so the mock server can boot
 * without it. If the build is missing we render a friendly error page.
 */
function resolveCliAspectDist(): string {
  const env = process.env.FORGE_CLI_DIST?.trim()
  if (env) return resolve(env)
  const HERE = dirname(fileURLToPath(import.meta.url))
  // routes/ → repo root → public-github-repos → <code root> → cdx-forge-cli/dist/lib/aspect
  return resolve(HERE, '..', '..', '..', 'cdx-forge-cli', 'dist', 'lib', 'aspect')
}

export async function registerGallery(app: FastifyInstance) {
  const CLI_DIST = resolveCliAspectDist()
  const TEMPLATES_PATH = resolve(CLI_DIST, 'templates.js')
  const PRESETS_PATH = resolve(CLI_DIST, 'presets.js')

  app.get('/gallery', async (_req, reply) => {
    const cli = await loadCli()
    if (!cli) {
      reply.type('text/html').send(buildMissingDistPage())
      return
    }

    reply.type('text/html').send(buildIndexPage(cli))
  })

  app.get<{
    Params: {template: string; preset: string}
    Querystring: {platform?: string}
  }>('/gallery/run/:template/:preset', async (req, reply) => {
    const cli = await loadCli()
    if (!cli) {
      reply.type('text/html').send(buildMissingDistPage())
      return
    }

    const {template: templateId, preset: presetId} = req.params
    const platform = req.query.platform === 'mobile' ? 'mobile' : 'web'
    const tpl = cli.templates.find((t) => t.id === templateId)
    if (!tpl) {
      reply.code(404).type('text/html').send(`<h1>Unknown template: ${escape(templateId)}</h1>`)
      return
    }

    const preset = presetId === '_none'
      ? undefined
      : cli.presets.find((p) => p.id === presetId)
    if (presetId !== '_none' && !preset) {
      reply.code(404).type('text/html').send(`<h1>Unknown preset: ${escape(presetId)}</h1>`)
      return
    }

    const opts = preset ? {...preset.options} : {}
    let html: string
    try {
      if (platform === 'mobile') {
        html = cli.generateMobileForTemplate(tpl, 'Hello!', opts)
      } else {
        const code = tpl.generate('Hello!', opts)
        html = buildWebRunPage(tpl.id, presetId, code)
      }
    } catch (err) {
      reply
        .code(500)
        .type('text/html')
        .send(`<h1>Failed to render ${escape(templateId)}/${escape(presetId)}</h1><pre>${escape(String(err))}</pre>`)
      return
    }

    reply.type('text/html').send(html)
  })

  async function loadCli(): Promise<CliBundle | null> {
    if (!existsSync(TEMPLATES_PATH) || !existsSync(PRESETS_PATH)) return null
    const t = (await import(pathToFileURL(TEMPLATES_PATH).href)) as unknown as TemplatesModule
    const p = (await import(pathToFileURL(PRESETS_PATH).href)) as unknown as PresetsModule
    return {
      templates: t.templates,
      presets: p.presets,
      generateMobileForTemplate: t.generateMobileForTemplate,
    }
  }
}

interface TemplateLike {
  id: string
  name?: string
  category: string
  contextMethod?: string
  platform?: 'web' | 'mobile' | 'both'
  description?: string
  generate(message: string, options?: Record<string, unknown>): string
  generateMobile?(message: string, options?: Record<string, unknown>): string
}

interface PresetLike {
  id: string
  label?: string
  description?: string
  templates: readonly string[]
  options: Record<string, unknown>
  notes?: string
}

interface TemplatesModule {
  templates: TemplateLike[]
  generateMobileForTemplate: (
    t: TemplateLike,
    message: string,
    options?: Record<string, unknown>,
  ) => string
}

interface PresetsModule {
  presets: ReadonlyArray<PresetLike>
}

interface CliBundle {
  templates: TemplateLike[]
  presets: ReadonlyArray<PresetLike>
  generateMobileForTemplate: TemplatesModule['generateMobileForTemplate']
}

function buildIndexPage(cli: CliBundle): string {
  const rows = cli.templates.flatMap((t) => {
    const platform = t.platform ?? 'both'
    const compatible = cli.presets.filter((p) => p.templates.includes(t.id))
    const presetEntries = compatible.length > 0 ? compatible : [null]
    return presetEntries.map((p) => ({tpl: t, preset: p, platform}))
  })

  const cards = rows
    .map(({tpl, preset, platform}) => {
      const presetId = preset?.id ?? '_none'
      const presetLabel = preset?.label ?? '(no preset / built-in defaults)'
      const presetNotes = preset?.notes ?? preset?.description ?? ''
      const canWeb = platform === 'web' || platform === 'both'
      const canMobile = platform === 'mobile' || platform === 'both'
      const links = [
        canWeb
          ? `<a class="btn" target="run" href="/gallery/run/${tpl.id}/${presetId}?platform=web">▶ Run web</a>`
          : '',
        canMobile
          ? `<a class="btn" target="run" href="/gallery/run/${tpl.id}/${presetId}?platform=mobile">▶ Run mobile</a>`
          : '',
      ]
        .filter(Boolean)
        .join(' ')

      return `<article class="card">
  <header>
    <span class="badge platform-${platform}">${platform}</span>
    <span class="badge category-${tpl.category}">${tpl.category}</span>
    ${tpl.contextMethod ? `<span class="badge method">${tpl.contextMethod}</span>` : ''}
  </header>
  <h3>${escape(tpl.name ?? tpl.id)}</h3>
  <p class="tid"><code>${tpl.id}</code> &nbsp;·&nbsp; preset: <code>${presetId}</code></p>
  ${tpl.description ? `<p class="desc">${escape(tpl.description)}</p>` : ''}
  <p class="preset-label">${escape(presetLabel)}</p>
  ${presetNotes ? `<p class="preset-notes">${escape(presetNotes)}</p>` : ''}
  <div class="actions">${links}</div>
</article>`
    })
    .join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Aspect Template Gallery</title>
  <style>
    :root { color-scheme: light dark; }
    body { margin:0; font:14px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; background:#f5f7fa; color:#1e293b; }
    header.top { padding:18px 24px; background:#0f172a; color:#e2e8f0; }
    header.top h1 { margin:0; font-size:18px; }
    header.top p { margin:4px 0 0; opacity:.75; font-size:13px; }
    main { display:grid; grid-template-columns: 1fr 2fr; height: calc(100vh - 64px); }
    .list { overflow:auto; padding:16px; border-right:1px solid #e2e8f0; background:#fff; }
    .runner { background:#fff; }
    .runner iframe { width:100%; height:100%; border:0; }
    .card { background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:12px; margin:0 0 12px; box-shadow:0 1px 2px rgba(15,23,42,0.04); }
    .card header { display:flex; gap:6px; margin-bottom:6px; flex-wrap:wrap; }
    .badge { display:inline-block; padding:2px 8px; border-radius:999px; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.04em; }
    .platform-web { background:#dbeafe; color:#1e40af; }
    .platform-mobile { background:#fce7f3; color:#9d174d; }
    .platform-both { background:#dcfce7; color:#166534; }
    .category-context-less { background:#f1f5f9; color:#334155; }
    .category-context-aware { background:#fef3c7; color:#92400e; }
    .badge.method { background:#ede9fe; color:#5b21b6; }
    h3 { margin:6px 0 4px; font-size:15px; }
    .tid { margin:0 0 6px; font-size:12px; color:#64748b; }
    .tid code { background:#f1f5f9; padding:1px 4px; border-radius:3px; }
    .desc { margin:6px 0; font-size:12.5px; color:#475569; }
    .preset-label { margin:6px 0 2px; font-size:12.5px; font-weight:600; }
    .preset-notes { margin:0 0 8px; font-size:12px; color:#64748b; font-style:italic; }
    .actions { display:flex; gap:6px; }
    .btn { display:inline-block; padding:6px 10px; background:#0ea5e9; color:#fff; border-radius:6px; text-decoration:none; font-size:12.5px; font-weight:600; }
    .btn:hover { background:#0284c7; }
    .empty { padding:32px; text-align:center; color:#64748b; }
    @media (max-width: 900px) { main { grid-template-columns: 1fr; height: auto; } .runner { height: 600px; } }
  </style>
</head>
<body>
  <header class="top">
    <h1>Aspect Template Gallery</h1>
    <p>Every <code>(template, preset)</code> combo shipped by <code>cdx-forge-cli</code>, running against this local mock server. Click ▶ Run to render in the right pane.</p>
  </header>
  <main>
    <section class="list">
      ${cards || '<p class="empty">No templates loaded.</p>'}
    </section>
    <section class="runner">
      <iframe name="run" src="about:blank" sandbox="allow-scripts allow-same-origin allow-popups allow-forms"></iframe>
    </section>
  </main>
</body>
</html>`
}

function buildWebRunPage(templateId: string, presetId: string, code: string): string {
  // Wrap the generated snippet in a minimal HTML host that emulates `dbk.*`.
  // The snippet runs as if it had been injected into a banking page; the page
  // also renders a small breadcrumb so reviewers know what they're looking at.
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escape(templateId)} · ${escape(presetId)}</title>
  <style>
    body { margin:0; font:14px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; color:#1e293b; }
    .crumb { padding:8px 14px; background:#0f172a; color:#e2e8f0; font-size:12px; }
    .crumb code { background:rgba(255,255,255,0.08); padding:1px 5px; border-radius:3px; }
    main { padding:0; min-height:calc(100vh - 32px); position:relative; }
    .stage {
      padding:32px;
      background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
      min-height: calc(100vh - 32px);
    }
    .stage h2 { margin:0 0 8px; font-size:16px; color:#475569; font-weight:600; }
    .stage p { margin:0 0 16px; font-size:13px; color:#64748b; }
    #mainApplication { background:#fff; border:1px dashed #cbd5e1; border-radius:8px; padding:24px; min-height:200px; }
  </style>
</head>
<body>
  <div class="crumb">▶ <code>${escape(templateId)}</code> &nbsp;·&nbsp; preset <code>${escape(presetId)}</code></div>
  <main>
    <div class="stage">
      <h2>Mock banking page</h2>
      <p>The aspect runs as if it were injected into a real DBK page. Look for vendor mock badges (bottom-right) and DOM nodes the snippet creates.</p>
      <div id="mainApplication">Stand-in banking content. Aspects can read or modify this region.</div>
    </div>
  </main>
  <script>
    // Stub the platform globals the templates rely on. This mirrors what the
    // OLB playground / WebView would expose, so the same generated code runs
    // unmodified.
    window.dbk = {
      loadScript: function (url) {
        var s = document.createElement('script');
        s.src = url; s.async = true;
        document.head.appendChild(s);
      },
      sessionInfo: function () {
        return { userFullName: 'Mock User', userGuid: '00000000-0000-0000-0000-000000000000' };
      },
      isWebview: function () { return false; },
    };
  </script>
  <script>
${code}
  </script>
</body>
</html>`
}

function buildMissingDistPage(): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Gallery — build needed</title></head>
<body style="font:14px system-ui,sans-serif;padding:24px;max-width:600px;color:#1e293b">
  <h1 style="margin:0 0 8px">Gallery is offline</h1>
  <p>The gallery imports built templates + presets from <code>cdx-forge-cli/dist</code>, but no build was found.</p>
  <p>Build the CLI (sibling checkout next to <code>public-github-repos</code>), or set <code>FORGE_CLI_DIST</code> to the folder containing <code>templates.js</code> and <code>presets.js</code>:</p>
  <pre style="background:#0f172a;color:#e2e8f0;padding:12px;border-radius:6px">cd ../cdx-forge-cli &amp;&amp; pnpm build</pre>
  <p>Then refresh this page.</p>
</body></html>`
}

function escape(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
