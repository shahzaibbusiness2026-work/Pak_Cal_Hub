import assert from 'node:assert/strict';
import { calculateRemittance } from '../lib/calculators/remittance';
import { changeRemittanceField, REMITTANCE_COUNTRIES, REMITTANCE_CURRENCIES, formatRemittanceMoney } from '../lib/data/remittance';
import { createRemittanceReferenceService } from '../lib/sync/live/remittanceRates';
import { fetchLiveFx } from '../lib/sync/live/fxLive';
import { GET } from '../app/api/remittance-rate/route';

const secondary = (result: ReturnType<typeof calculateRemittance>, id: string) => result.secondaryResults?.find((item) => item.id === id)?.value;
const inputs = { fromCountry: 'US', toCountry: 'PK', fromCurrency: 'USD', toCurrency: 'PKR', sendAmount: 1000, rateMode: 'quote', providerRate: 280, senderFee: 10, feePercent: 1, recipientFee: 100 };

async function main() {
  // Budget 1,000: sender fee 10 + 1% x 1,000 = 20; (1,000 - 20) x 280 - 100 = 274,300.
  const included = calculateRemittance(inputs);
  assert.equal(included.primaryResult.value, 'PKR 274,300.00');
  assert.equal(secondary(included, 'senderPays'), 'USD 1,000.00');
  assert.equal(secondary(included, 'senderFees'), 'USD 20.00');
  const onTop = calculateRemittance({ ...inputs, feeMode: 'on-top' });
  assert.equal(onTop.primaryResult.value, 'PKR 279,900.00');
  assert.equal(secondary(onTop, 'senderPays'), 'USD 1,020.00');
  const comparison = calculateRemittance({ ...inputs, compareQuote: true, secondProviderRate: 281, secondSenderFee: 5, secondFeePercent: 0, secondRecipientFee: 0 });
  assert.equal(secondary(comparison, 'quoteBReceived'), 'PKR 279,595.00');
  assert.equal(secondary(comparison, 'quoteDifference'), 'PKR 5,295.00');
  assert.equal(calculateRemittance({ ...inputs, senderFee: 1001 }).primaryResult.id, 'invalid');
  assert.equal(calculateRemittance({ ...inputs, recipientFee: 999999 }).primaryResult.id, 'invalid');
  assert.equal(calculateRemittance({ ...inputs, providerRate: 0 }).primaryResult.id, 'invalid');
  assert.equal(calculateRemittance({ ...inputs, sendAmount: NaN }).primaryResult.id, 'invalid');
  assert.equal(calculateRemittance({ ...inputs, fromCurrency: 'XYZ' }).primaryResult.id, 'invalid');
  assert.equal(calculateRemittance({ ...inputs, fromCountry: 'ZZ' }).primaryResult.id, 'invalid');
  assert.equal(calculateRemittance({ ...inputs, sendAmount: 0, senderFee: 0, feePercent: 0, recipientFee: 0 }).primaryResult.value, 'PKR 0.00');
  assert.equal(calculateRemittance({ ...inputs, fromCurrency: 'EUR', toCurrency: 'EUR', providerRate: 0, senderFee: 5, feePercent: 0, recipientFee: 1 }).primaryResult.value, 'EUR 994.00');

  // Worldwide cross-pair example unrelated to PKR: GBP -> JPY, 500 x 190 = 95,000.
  const cross = calculateRemittance({ fromCountry: 'GB', toCountry: 'JP', fromCurrency: 'GBP', toCurrency: 'JPY', sendAmount: 500, rateMode: 'reference', referenceRate: 190, referenceAsOf: '2026-11-11T00:00:00Z' });
  assert.equal(cross.primaryResult.value, 'JPY 95,000');
  const missing = calculateRemittance({ fromCurrency: 'VND', toCurrency: 'PKR', rateMode: 'reference' });
  assert.equal(missing.primaryResult.id, 'invalid', 'missing references must not silently become USD rates');
  assert.equal(formatRemittanceMoney(1.2345, 'KWD'), 'KWD 1.235');
  assert.equal(formatRemittanceMoney(123.5, 'JPY'), 'JPY 124');
  assert(REMITTANCE_COUNTRIES.length >= 249 && REMITTANCE_CURRENCIES.length >= 150);
  assert.equal(new Set(REMITTANCE_COUNTRIES.map((item) => item.code)).size, REMITTANCE_COUNTRIES.length);
  assert(REMITTANCE_COUNTRIES.every((country) => country.currencies.every((code) => REMITTANCE_CURRENCIES.some((item) => item.code === code))));

  // Country choice suggests currency; manual currency changes remain possible.
  const changed = changeRemittanceField({ ...inputs, secondProviderRate: 281 }, 'fromCountry', 'AE');
  assert.equal(changed.fromCurrency, 'AED');
  assert.equal(changed.providerRate, 0);
  assert.equal(changed.senderFee, 0);
  assert.equal(changed.secondProviderRate, 0);
  assert.equal(changeRemittanceField(changed, 'fromCurrency', 'USD').fromCurrency, 'USD');
  assert.equal(changeRemittanceField(inputs, 'sendAmount', 2000).providerRate, 280);

  // Full FX snapshots support currencies beyond the existing 12-currency widget.
  const upstream = { PKR: 280, USD: 1, GBP: .8, EUR: 1, AED: 3.67, SAR: 3.75, CAD: 1.4, AUD: 1.5, CNY: 7, QAR: 3.64, KWD: .3, JPY: 150, TRY: 40, CHF: .9, VND: 25000 };
  const snapshot = await fetchLiveFx(async () => ({ rates: upstream, time_last_update_utc: 'Wed, 11 Nov 2026 00:00:00 GMT' }), new Date('2026-11-11T00:30:00Z'));
  assert.equal(snapshot.fx.VND, 280 / 25000);
  assert.equal(snapshot.fx.PKR, 1);
  let calls = 0;
  let now = Date.parse('2026-11-11T00:30:00Z');
  const service = createRemittanceReferenceService(async () => { calls++; return snapshot; }, () => now);
  const [a, b] = await Promise.all([service('GBP', 'JPY'), service('VND', 'PKR')]);
  assert.equal(calls, 1, 'parallel pairs share one upstream request');
  assert.equal(a.rate, (280 / .8) / (280 / 150));
  assert.equal(b.rate, 280 / 25000);
  await service('EUR', 'JPY');
  assert.equal(calls, 1, 'reuse the hourly snapshot');
  now += 3600001;
  await service('EUR', 'JPY');
  assert.equal(calls, 2);
  await assert.rejects(service('KPW', 'PKR'), /unavailable/);
  const invalidResponse = await GET(new Request('http://localhost/api/remittance-rate?from=XYZ&to=PKR'));
  assert.equal(invalidResponse.status, 400);
  const sameResponse = await GET(new Request('http://localhost/api/remittance-rate?from=USD&to=USD'));
  assert.equal(sameResponse.status, 200);
  assert.equal((await sameResponse.json()).rate, 1);
  console.log('PASS: Worldwide remittance math, included/on-top fees, two quotes, precision, route changes, cross rates, hourly caching and unsupported pairs.');
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
