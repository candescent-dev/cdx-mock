# cdx-mock-data-apis

Lightweight mock API server for **Candescent Forge** widget and aspect development. Provides synthetic financial data for chart, chat, and OIDC demo scenarios — no Docker or external services required.

Works with the published [**`@cdx-forge/cli`**](https://www.npmjs.com/package/@cdx-forge/cli) package. See the [Forge CLI overview](https://docs.candescent.com/guides/cli/overview/) and [installation guide](https://docs.candescent.com/guides/cli/installation/).

Built with [Hono](https://hono.dev) + TypeScript. Runs on Node.js 18+. Listens on **`127.0.0.1`** only.

Part of the [**cdx-mock**](https://github.com/candescent-dev/cdx-mock) repository.

## Quick Start

```bash
pnpm install
pnpm dev        # starts with hot-reload on http://localhost:4010
```

## Endpoints

### Chart Data — `GET /api/chart-data/:dataset`

All chart endpoints return a consistent `ChartItem[]` shape:

```json
[{ "label": "Groceries", "value": 1240, "color": "#4CAF50" }]
```

Some datasets return extended responses with metadata (sources, totals, goals, etc.) alongside the `items` array.

| Dataset | Path | Scenarios | Notes |
|---|---|---|---|
| `spending` | `/api/chart-data/spending` | default, quarterly, frugal, high-roller, single-category, trending-up, trending-down | Transaction spend by category |
| `investment-portfolio` | `/api/chart-data/investment-portfolio` | default, aggressive, conservative, retirement, single, large, empty | Asset allocation |
| `net-worth` | `/api/chart-data/net-worth` | default, positive-only, debt-heavy, multi-bank, with-crypto | Multi-institution aggregation |
| `income-expense` | `/api/chart-data/income-expense` | default, tight, surplus, deficit, variable-income, multi-income | Income vs expenses |
| `savings-goals` | `/api/chart-data/savings-goals` | default, almost-done, just-started, single-goal, completed | Progress toward goals |
| `loan-breakdown` | `/api/chart-data/loan-breakdown` | default, student-heavy, mortgage-only, debt-free, payoff-plan | Debt distribution |
| `credit-score` | `/api/chart-data/credit-score` | default, excellent, poor, building | Score factors & history |

**Aliases** (backward compatibility):
- `GET /api/portfolio` → same as `investment-portfolio`
- `GET /investment-portfolio` → same as `investment-portfolio`

### Agent Chat — `POST /api/agent/chat`

```bash
curl -X POST http://localhost:4010/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "what is my balance"}'
```

Returns `{ "reply": "..." }`. Keyword matching for: balance, transfer, help, loan, savings, credit, invest, payment.

Scenarios: `default`, `echo`, `slow`, `long`, `empty`, `error`

### Protected User Profile — `GET /api/protected/user-profile`

Requires `Authorization: Bearer <any-token>` header.

```bash
curl http://localhost:4010/api/protected/user-profile \
  -H "Authorization: Bearer test-token"
```

Scenarios: `default`, `wealthy`, `minimal`, `no-auth` (401), `expired` (401)

### Account Summary — `GET /api/demo/account-summary`

General-purpose account data for SDK demo templates.

Scenarios: `default`, `business`, `empty`, `many`

### Health & Discovery

- `GET /health` — `{ "status": "ok", "uptime": ..., "version": "..." }`
- `GET /api/scenarios` — Lists all endpoints with their available scenarios (self-documenting)

## Scenario System

Switch scenarios via **query parameter** or **header**:

```bash
# Query parameter
curl "http://localhost:4010/api/chart-data/spending?scenario=high-roller"

# Header
curl http://localhost:4010/api/chart-data/spending \
  -H "X-Mock-Scenario: frugal"
```

### Global Edge-Case Scenarios

These work on **any** endpoint:

| Scenario | Behavior |
|---|---|
| `empty` | Returns `[]` |
| `error` | Returns HTTP 500 |
| `slow` | Adds ~2.5s delay |
| `malformed` | Returns `{ "data": "not an array" }` |
| `huge` | Returns 50+ items |

## Configuration

| Env Var | Default | Description |
|---|---|---|
| `PORT` | `4010` | Server port |

## Integration with Forge CLI

When this server is running on port `4010`, the **`forge`** command auto-detects it for:

1. **`forge widget create --template data-chart`** — Detects available datasets, presents a picker
2. **`forge widget create --template agent-chat`** — Defaults `agentEndpoint` to `localhost:4010`
3. **`forge widget create --template oidc-auth`** — Defaults `protectedApiUrl` to `localhost:4010`
4. **`forge widget submit`** — Warns about localhost URLs and prompts for production replacements

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start with hot-reload (tsx watch) |
| `pnpm start` | Start from built output |
| `pnpm build` | Build with tsup |
| `pnpm test` | Run smoke tests |

## License

MIT — see [LICENSE](./LICENSE).
