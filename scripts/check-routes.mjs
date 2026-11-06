import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const origin = process.env.TEST_APP_URL || 'http://localhost:3100';
const manifest = JSON.parse(readFileSync('.next/prerender-manifest.json', 'utf8'));
const routes = Object.keys(manifest.routes).filter((route) => !route.startsWith('/_'));
let next = 0;
const failures = [];
await Promise.all(Array.from({ length: 4 }, async () => {
  while (next < routes.length) {
    const route = routes[next++];
    const response = await fetch(`${origin}${route}`, { signal: AbortSignal.timeout(20000) });
    if (!response.ok) failures.push(`${route}: ${response.status}`);
  }
}));
assert.deepEqual(failures, []);
const badCategory = await fetch(`${origin}/electricity/income-tax-calculator`);
assert.equal(badCategory.status, 404, 'Wrong category must not serve an unrelated calculator');
for (const path of ['/api/admin/rates', '/api/admin/seed', '/api/admin/connect', '/api/admin/automation']) {
  const response = await fetch(`${origin}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  assert([401, 503].includes(response.status), `${path}: unauthenticated mutation was not blocked`);
}
const response = await fetch(`${origin}/api/rates/live`, { signal: AbortSignal.timeout(15000) });
assert.equal(response.status, 200);
const data = await response.json();
for (const key of ['petrol', 'gold24kTola']) assert.equal(data.liveByRate[key], true, `${key}: expected real upstream response`);
console.log(`PASS: ${routes.length} generated routes, wrong-category 404, 4 protected mutations, and live gold/petrol endpoint.`);
console.log(JSON.stringify({ petrol: data.petrol, indicativeGoldPerTola: data.gold24kTola, liveByRate: data.liveByRate }));
