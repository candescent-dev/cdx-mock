# cdx-mock-partners

Local **Fastify** server on **`http://localhost:4011`** by default (or the next free port if `4011` is busy). Serves mock partner / vendor SDK scripts and a few dynamic routes for use with the published [**`@cdx-forge/cli`**](https://www.npmjs.com/package/@cdx-forge/cli) package.

Forge aspect presets point at `http://localhost:4011/…`. If this server binds to another port (e.g. `4012`), use **`GET /vendors`** for URLs that match the actual port, or set **`MOCK_PARTNERS_STRICT_PORT=1`** to fail fast instead.

All data is **synthetic**. The server listens on **`127.0.0.1`** only.

Partner mocks use generic integration labels and simulate common vendor API shapes for local development. They are **unofficial stubs**, not affiliated with any third-party vendor, and do not ship proprietary SDK code.

Part of the [**cdx-mock**](https://github.com/candescent-dev/cdx-mock) repository. See also [`cdx-mock-data-apis`](../cdx-mock-data-apis) (`:4010`).

## Install Forge CLI

```bash
brew tap candescent-dev/forge && brew install forge-cli
# or: npm install -g @cdx-forge/cli
```

[Forge CLI overview](https://docs.candescent.com/guides/cli/overview/) · [Installation](https://docs.candescent.com/guides/cli/installation/)

## Run

```bash
pnpm install
pnpm start
# → http://localhost:4011/health
# → http://localhost:4011/vendors
```

| Variable | Default | Description |
|----------|---------|-------------|
| `MOCK_PARTNERS_PORT` | `4011` | Preferred listen port (`MOCK_VENDORS_PORT` is a legacy alias) |
| `MOCK_PARTNERS_STRICT_PORT` | off | Exit on `EADDRINUSE` instead of scanning the next ports |
| `LOG_LEVEL` | `info` | Fastify log level |

Unless **`MOCK_PARTNERS_STRICT_PORT=1`**, the server tries ports **`MOCK_PARTNERS_PORT` … +63** on `127.0.0.1` until one is free. **`GET /vendors`** and script-config handoff JSON reflect the bound port.

### MOCK pill missing in Forge preview

Partner SDKs are usually injected with **`async`**, so **`document.currentScript` is `null`**. Guessing the script URL from `document.scripts` can select the wrong script (e.g. Forge preview `/aspect.js` on `:3456`). The mocks then load `mock-overlay.js` from the preview origin instead of the mock server, and the **MOCK · …** badge does not appear. Bundled SDKs locate their own path (e.g. `/vendors/engagement-script-loader/sdk.js`) to resolve the correct origin.

### Port already in use

With strict mode, or if every port in the scan range is taken, stop the old listener (`lsof -nP -iTCP:4011 | grep LISTEN`) or set a free **`MOCK_PARTNERS_PORT`**. **`forge aspect preview`** probes **`:4011` first** — align presets or stop duplicate mock processes if you rely on defaults.

## Template gallery (optional)

**`GET /gallery`** runs every aspect `(template, preset)` from the **installed** Forge CLI package (`dist/lib/aspect/templates.js`, `presets.js`). The Forge CLI is not published as source; install it from npm or Homebrew first.

```bash
npm install -g @cdx-forge/cli
export FORGE_CLI_DIST="$(npm root -g)/@cdx-forge/cli/dist/lib/aspect"
pnpm start
# → http://localhost:4011/gallery
```

If you use **pnpm** globally: `export FORGE_CLI_DIST="$(pnpm root -g)/@cdx-forge/cli/dist/lib/aspect"`.

You can also set **`FORGE_CLI_DIST`** to any directory that already contains `templates.js` and `presets.js`.

## API surface

| Route | Purpose |
|--------|---------|
| `GET /health` | Liveness — `{ ok, name: 'cdx-mock-partners', port }` |
| `GET /vendors` | JSON catalog of mock vendors |
| `GET /vendors/<vendor>/<file>` | Static mock SDKs under `public/` |
| `GET /sso/handoff?app_code=X` | Fake SSO page for `hidden-iframe-sso` |
| `POST /token` | Fake JSBridge token for mobile templates |
| `GET /auth/authorize?...` | OIDC-toolkit-shaped mock |
| `GET /help` | Help page for floating-action-button |
| `GET /script-config/handoff/:variant` | JSON config for script-config retail/business presets |
| `GET /gallery`, `GET /gallery/run/...` | Template × preset runner (requires Forge CLI install) |

## Programmatic use

```typescript
import {buildServer, setPartnerListenPort} from 'cdx-mock-partners'

const app = await buildServer()
const port = 4011
await app.listen({port, host: '127.0.0.1'})
setPartnerListenPort(port)
```

## Mock SDK conventions

1. Auto-bootstrap on load (same as real SDKs).
2. Show a **MOCK · \<vendor\>** badge via `public/_shared/mock-overlay.js`.
3. Record calls on `window.__mockPartnerCalls` for local testing.

Vendor catalog ids align with Forge aspect preset ids (`engagement-script-loader`, `script-config-retail`, etc.) and are listed in `server.ts` (`listVendors()`).

## License

MIT — see [LICENSE](./LICENSE).
