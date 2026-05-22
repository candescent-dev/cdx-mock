# Candescent Forge local mocks

Local-only mock servers for [**`@cdx-forge/cli`**](https://www.npmjs.com/package/@cdx-forge/cli) widget and aspect development. No Docker or external services required.

| Package | Default port | Purpose |
|---------|--------------|---------|
| [`cdx-mock-data-apis`](./cdx-mock-data-apis) | `4010` | Mock Core-style REST (charts, agent chat, protected profile, account summary) |
| [`cdx-mock-partners`](./cdx-mock-partners) | `4011` | Mock third-party partner SDKs, SSO handoffs, OIDC widget flows, `/gallery` |

## Quick start

Run both servers in separate terminals:

```bash
cd cdx-mock-data-apis && pnpm install && pnpm dev
```

```bash
cd cdx-mock-partners && pnpm install && pnpm start
```

Then use Forge (`forge widget create`, `forge aspect preview`, etc.). The CLI defaults to `http://localhost:4010` and `http://localhost:4011`.

## Publishing layout

These packages can live in **one monorepo** (this folder) or as **two separate repos** on [candescent-dev](https://github.com/candescent-dev):

- [cdx-mock-data-apis](https://github.com/candescent-dev/cdx-mock-data-apis)
- [cdx-mock-partners](https://github.com/candescent-dev/cdx-mock-partners)

## Third-party names

Partner mocks reference vendor product names (e.g. Glia, Salesforce, Five9, UJET, Google Tag Manager) only to simulate integration shapes for local development. They are **unofficial stubs**, not affiliated with or endorsed by those vendors, and do not include proprietary SDK code.

## License

MIT — see `LICENSE` in each package directory.
