# cdx-mock

Local HTTP mocks for [**Candescent Forge**](https://docs.candescent.com/guides/cli/overview/) widget and aspect development: synthetic REST data on port **4010** and partner SDK / OIDC stubs on **4011**. Use alongside the published [**`@cdx-forge/cli`**](https://www.npmjs.com/package/@cdx-forge/cli) package — no Docker or external services required.

**Docs:** [Forge CLI overview](https://docs.candescent.com/guides/cli/overview/)

## Install Forge CLI

Forge is distributed on **npm** and **Homebrew** (there is no public Forge source repository):

```bash
# Homebrew (macOS / Linux)
brew tap candescent-dev/forge
brew install forge-cli

# npm / pnpm
npm install -g @cdx-forge/cli
```

Install guide: [Forge CLI installation](https://docs.candescent.com/guides/cli/installation/)

## Mock servers

| Package | Port | Purpose |
|---------|------|---------|
| [`cdx-mock-data-apis`](./cdx-mock-data-apis) | `4010` | Mock Core-style REST (charts, agent chat, protected profile, account summary) |
| [`cdx-mock-partners`](./cdx-mock-partners) | `4011` | Mock partner SDKs, SSO handoffs, OIDC widget flows, optional `/gallery` |

Clone this repository, then run each server in its own terminal:

```bash
git clone https://github.com/candescent-dev/cdx-mock.git
cd cdx-mock/cdx-mock-data-apis && pnpm install && pnpm dev
```

```bash
cd cdx-mock/cdx-mock-partners && pnpm install && pnpm start
```

The Forge CLI defaults to `http://localhost:4010` and `http://localhost:4011` when creating widgets and previewing aspects.

## Third-party names

Partner mocks reference vendor product names (e.g. Glia, Salesforce, Five9, UJET, Google Tag Manager) only to simulate integration shapes for local development. They are **unofficial stubs**, not affiliated with or endorsed by those vendors, and do not include proprietary SDK code.

## License

MIT — see `LICENSE` in each package directory.
