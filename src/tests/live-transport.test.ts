import assert from 'node:assert/strict';
import { fetchJson, LiveFetchError, validateSourceTime } from '../lib/sync/live/http';
import { fetchLiveFx } from '../lib/sync/live/fxLive';
import { fetchLiveFuel } from '../lib/sync/live/fuelLive';

async function main() {
  const originalFetch = globalThis.fetch;
  try {
    let calls = 0;
    globalThis.fetch = async () => {
      calls++;
      return calls === 1 ? new Response('', { status: 503 }) : Response.json({ price: 362 });
    };
    assert.deepEqual(await fetchJson('https://example.test/retry'), { price: 362 });
    assert.equal(calls, 2, 'Transient HTTP failures must retry');

    calls = 0;
    globalThis.fetch = async () => { calls++; return new Response('', { status: 404 }); };
    await assert.rejects(fetchJson('https://example.test/missing'), (error: unknown) => error instanceof LiveFetchError && error.kind === 'http-status');
    assert.equal(calls, 1, '404 must not retry');

    calls = 0;
    globalThis.fetch = async () => { calls++; return new Response('<html>Error</html>'); };
    await assert.rejects(fetchJson('https://example.test/html'), (error: unknown) => error instanceof LiveFetchError && error.kind === 'invalid-json');
    assert.equal(calls, 1, 'Invalid JSON must not retry');

    calls = 0;
    globalThis.fetch = async () => { calls++; return Response.json({ rate: 276.7 }); };
    const concurrent = await Promise.all([fetchJson('https://example.test/shared'), fetchJson('https://example.test/shared')]);
    assert.equal(calls, 1, 'Gold and FX requests must share an in-flight FX fetch');
    assert.deepEqual(concurrent[0], concurrent[1]);

    globalThis.fetch = async (_input, options) => new Response(new ReadableStream({
      start(controller) {
        options?.signal?.addEventListener('abort', () => controller.error(new DOMException('Aborted body', 'AbortError')), { once: true });
      },
    }));
    await assert.rejects(fetchJson('https://example.test/slow-body', { timeoutMs: 20, retries: 0 }), (error: unknown) => error instanceof LiveFetchError && error.kind === 'timeout');
  } finally {
    globalThis.fetch = originalFetch;
  }
  const now = new Date('2026-11-06T00:00:00Z');
  assert.throws(() => validateSourceTime('2026-10-01', 'Stale spot', 7, now), LiveFetchError);
  assert.throws(() => validateSourceTime('2027-01-01', 'Future spot', 7, now), LiveFetchError);
  await assert.rejects(fetchLiveFx(async () => ({ rates: { PKR: 276.7, GBP: 0.74, EUR: 0.89, AED: 3.67, SAR: 3.75, CAD: 1.4, AUD: 1.43, CNY: 6.69, QAR: 3.64, KWD: 0.31, JPY: 158, TRY: 44 }, time_last_update_utc: '2026-10-01' }), now), LiveFetchError);
  await assert.rejects(fetchLiveFuel(async () => ({ prices: [{ slug: 'petrol', price_pkr: 362, effective_date: '2026-11-05' }, { slug: 'diesel', price_pkr: 387.81, effective_date: '2026-11-04' }] }), now), LiveFetchError);
  console.log('PASS: API retries, in-flight deduplication, body timeout, invalid JSON, source freshness, and mismatched fuel dates.');
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
