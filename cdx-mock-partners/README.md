# cdx-mock-partners

Local **Fastify** server on **`http://localhost:4011`** by default (or the next free port if `4011` is busy) that serves static **mock partner / vendor SDK** assets and a few dynamic routes. It pairs with the published **[`@cdx-forge/cli`](https://www.npmjs.com/package/@cdx-forge/cli)** package: Forge aspect presets point at `http://localhost:4011/…`; if this server auto-advances to e.g. `4012`, use **`GET /vendors`** for URLs that match the bound port, or set **`MOCK_PARTNERS_STRICT_PORT=1`** to fail fast instead.

This repo is the public companion to **internal** CSV/analysis tooling; it contains **no** customer data — only synthetic mocks. Listens on **`127.0.0.1`** only.

Partner mocks reference vendor product names (Glia, Salesforce, Five9, UJET, Google Tag Manager, etc.) only to simulate integration APIs for local development. They are **unofficial stubs**, not affiliated with those vendors, and do not ship proprietary SDK code.

## Related repos

| Repo | Role |
|------|------|
| [`cdx-mock-data-apis`](../cdx-mock-data-apis) | Mock **Core-style REST** data on `:4010` |
| **`cdx-mock-partners`** (this package) | Mock **third-party scripts**, SSO handoff HTML, JSBridge token, `/gallery` |

## Run

```bash
pnpm install
pnpm start
# → http://localhost:4011/health
# → http://localhost:4011/vendors
```

- **Preferred port:** `MOCK_PARTNERS_PORT` (default `4011`). **`MOCK_VENDORS_PORT`** is still read if `MOCK_PARTNERS_PORT` is unset (older docs/scripts).
- **Port busy:** unless **`MOCK_PARTNERS_STRICT_PORT=1`**, the server tries **`MOCK_PARTNERS_PORT` … +63** on `127.0.0.1` until `listen` succeeds (same idea as the Forge CLI’s free-port helper). **`GET /vendors`** and Link Live JSON use the **actual** bound port.
- **Fail fast on conflict:** `MOCK_PARTNERS_STRICT_PORT=1 pnpm start` keeps the previous behavior (exit with `EADDRINUSE` + stderr hints).

### MOCK pill missing in Forge preview

Partner SDKs are usually injected with **`async`**. In that case **`document.currentScript` is `null`**, and guessing the script URL from `document.scripts` can point at the **wrong** script (e.g. Forge’s `/aspect.js` on `:3456`). The mocks then try to load `mock-overlay.js` from the **preview origin** instead of the mock server origin, and the **MOCK · …** pill never appears. The bundled SDKs scan for their own path (e.g. `/vendors/glia/sdk.js`) to resolve the correct origin.

### `EADDRINUSE` (strict mode or no free port in range)

With **`MOCK_PARTNERS_STRICT_PORT=1`**, or if **every** port in the scan window is taken, startup fails like before. Then either stop the old listener (`lsof -nP -iTCP:4011 | grep LISTEN`) or pick a free **`MOCK_PARTNERS_PORT`**. With default (non-strict) behavior, a busy preferred port is resolved automatically; **`forge aspect preview`** still probes **`:4011` first** — if you rely on presets without overrides, stop the duplicate mock or align the CLI’s mock detection with your port.

## Template gallery

`/gallery` loads built **`cdx-forge-cli`** templates from `dist/lib/aspect` (`templates.js`, `presets.js`).

1. Check out the **Forge CLI** (`cdx-forge-cli` / `@cdx-forge/cli` source) as a **sibling** of your `code` root (same layout as Candescent’s monorepo: `code/cdx-forge-cli`, `code/public-github-repos/cdx-mock-partners`).
2. `cd cdx-forge-cli && pnpm install && pnpm build`
3. Start this server, then open **`http://localhost:4011/gallery`**.

Or set **`FORGE_CLI_DIST`** to the directory that already contains `templates.js` and `presets.js` (typically `…/cdx-forge-cli/dist/lib/aspect`).

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
| `GET /link-live/handoff/:variant` | JSON config for Link Live presets |
| `GET /gallery`, `GET /gallery/run/...` | Template × preset runner |

## Programmatic use

```typescript
import {buildServer, setPartnerListenPort} from 'cdx-mock-partners'

const app = await buildServer()
const port = 4011
await app.listen({port, host: '127.0.0.1'})
setPartnerListenPort(port) // so GET /vendors + Link Live JSON use the same origin
```

Used by Candescent’s **dbk-dx-analysis** e2e harness (`pnpm test`, `verify-mock-coverage`) via a `file:` dependency.

## Mock SDK conventions

1. Auto-bootstrap on load (same as real SDKs).
2. Show a **MOCK · \<vendor\>** badge via `public/_shared/mock-overlay.js`; badge opens an interactive panel.
3. Record calls on `window.__mockPartnerCalls` for tests.

See the original vendor table in `server.ts` (`listVendors()`) for ids and template pairings.
