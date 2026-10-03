/**
 * HTTP helper for the live rate pipeline.
 *
 * Used by src/lib/sync/live/* fetchers to poll free, no-key public APIs
 * (fuel prices, precious-metal spot, FX). Never used for anything the user
 * pays for or authenticates to — no credentials involved.
 */

export class LiveFetchError extends Error {
  /** Machine-readable failure class for logging / freshness reporting. */
  readonly kind:
    | 'timeout'
    | 'network'
    | 'http-status'
    | 'invalid-json'
    | 'validation';

  constructor(kind: LiveFetchError['kind'], message: string) {
    super(message);
    this.name = 'LiveFetchError';
    this.kind = kind;
  }
}

export interface FetchJsonOptions {
  /** Per-attempt timeout in ms. Default 12000. */
  timeoutMs?: number;
  /** Extra full retries after the first attempt fails. Default 1. */
  retries?: number;
  /** Retried on timeout/network/5xx only — never on 4xx or bad payloads. */
  userAgent?: string;
}

const DEFAULT_UA =
  'PakCalHub-LiveRateSync/1.0 (+https://github.com/shahzaibbusiness2026-work/Pak_Cal_Hub; contact: admin)';

/**
 * Fetch JSON with a hard timeout and one retry. Throws LiveFetchError with a
 * descriptive message — callers decide whether to fall back to stored values.
 */
export async function fetchJson<T>(
  url: string,
  options: FetchJsonOptions = {}
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? 12000;
  const retries = options.retries ?? 1;
  const userAgent = options.userAgent ?? DEFAULT_UA;

  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'User-Agent': userAgent,
        },
      });
      clearTimeout(timer);

      if (!res.ok) {
        // 4xx = our fault or gone — retrying won't help.
        if (res.status >= 400 && res.status < 500) {
          throw new LiveFetchError(
            'http-status',
            `GET ${url} -> HTTP ${res.status} (client error, not retried)`
          );
        }
        throw new LiveFetchError('http-status', `GET ${url} -> HTTP ${res.status}`);
      }

      const text = await res.text();
      try {
        return JSON.parse(text) as T;
      } catch {
        throw new LiveFetchError(
          'invalid-json',
          `GET ${url} -> response is not valid JSON (first 120 chars: ${text.slice(0, 120)})`
        );
      }
    } catch (err) {
      clearTimeout(timer);
      if (err instanceof LiveFetchError) {
        // Retry only transient classes; 4xx/invalid-json fail fast.
        if (err.kind === 'http-status' || err.kind === 'invalid-json') throw err;
        lastError = err;
      } else if (err instanceof Error && err.name === 'AbortError') {
        lastError = new LiveFetchError('timeout', `GET ${url} -> timed out after ${timeoutMs}ms`);
      } else {
        lastError =
          err instanceof Error
            ? new LiveFetchError('network', `GET ${url} -> network error: ${err.message}`)
            : new LiveFetchError('network', `GET ${url} -> unknown network error`);
      }
      // fall through to retry
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new LiveFetchError('network', `GET ${url} -> failed after ${retries + 1} attempts`);
}
