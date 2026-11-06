// Optional real-network check, separate from deterministic `npm test`.
import assert from 'node:assert/strict';
import { GET } from '../app/api/rates/live/route';

async function main() {
  const started = Date.now();
  const response = await GET();
  assert.equal(response.status, 200);
  const data = await response.json();
  if (Object.keys(data.upstreamErrors || {}).length) console.error('Upstream diagnostics:', data.upstreamErrors);
  for (const key of ['petrol', 'diesel', 'gold24kTola', 'silverTola', 'usdPkr']) {
    assert(Number.isFinite(data[key]) && data[key] > 0, `${key}: invalid price`);
    assert.equal(data.liveByRate[key], true, `${key}: upstream failed; serving fallback`);
    assert(Number.isFinite(Date.parse(data.asOfByRate[key])), `${key}: missing source date`);
  }
  console.log(JSON.stringify({ status: 'PASS', elapsedMs: Date.now() - started, petrol: data.petrol, diesel: data.diesel, indicativeGoldPerTola: data.gold24kTola, liveByRate: data.liveByRate, sourceDates: data.asOfByRate }, null, 2));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
