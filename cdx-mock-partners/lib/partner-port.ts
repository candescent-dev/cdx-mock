/**
 * Effective listen port for the mock server (after bind) and base URLs for
 * `/vendors` catalog + Link Live JSON. Forge presets default to :4011; when
 * that port is busy we advance and callers must use the URLs we advertise.
 */
const DEFAULT_PORT = 4011

let effectiveListenPort: number | null = null

export function getPreferredPortFromEnv(): number {
  const raw = process.env.MOCK_PARTNERS_PORT ?? process.env.MOCK_VENDORS_PORT ?? String(DEFAULT_PORT)
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_PORT
}

/** If set, fail on EADDRINUSE instead of scanning for the next free port. */
export function isStrictPartnerPort(): boolean {
  const v = (process.env.MOCK_PARTNERS_STRICT_PORT ?? '').toLowerCase()
  return v === '1' || v === 'true' || v === 'yes'
}

export function setPartnerListenPort(port: number): void {
  effectiveListenPort = port
}

/** Port bound by this process, or env preferred before listen completes. */
export function getPartnerPort(): number {
  if (effectiveListenPort != null) return effectiveListenPort
  return getPreferredPortFromEnv()
}

export function mockPartnersBaseUrl(): string {
  return `http://localhost:${getPartnerPort()}`
}

export function isEaddrinuse(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as NodeJS.ErrnoException).code === 'EADDRINUSE'
  )
}
