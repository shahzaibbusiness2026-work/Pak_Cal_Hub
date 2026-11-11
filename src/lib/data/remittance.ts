import data from '../../data/remittance/country-currencies.json';

export const REMITTANCE_COUNTRIES = data.countries;
export const REMITTANCE_CURRENCIES = data.currencies;
export const REMITTANCE_COUNTRY_OPTIONS = data.countries.map((country) => ({ value: country.code, label: country.name }));
export const REMITTANCE_CURRENCY_OPTIONS = data.currencies.map((currency) => ({ value: currency.code, label: `${currency.code} — ${currency.name}` }));
export const REMITTANCE_CURRENCY_CODES = new Set(data.currencies.map((currency) => currency.code));

export function formatRemittanceMoney(amount: number, currency: string): string {
  const digits = data.currencies.find((item) => item.code === currency)?.digits ?? 2;
  return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

export function roundRemittanceMoney(amount: number, currency: string): number {
  const digits = data.currencies.find((item) => item.code === currency)?.digits ?? 2;
  const factor = 10 ** digits;
  return Math.round((amount + Number.EPSILON) * factor) / factor;
}

/** Route/units changes invalidate provider quotes and fees; amount changes do not. */
export function changeRemittanceField(previous: Record<string, any>, id: string, value: any): Record<string, any> {
  const next = { ...previous, [id]: value };
  if (!['fromCountry', 'toCountry', 'fromCurrency', 'toCurrency'].includes(id) || previous[id] === value) return next;
  if (id === 'fromCountry' || id === 'toCountry') {
    const country = data.countries.find((item) => item.code === value);
    const currencyId = id === 'fromCountry' ? 'fromCurrency' : 'toCurrency';
    if (country?.currencies[0]) next[currencyId] = country.currencies[0];
  }
  for (const key of ['providerRate', 'senderFee', 'feePercent', 'recipientFee', 'secondProviderRate', 'secondSenderFee', 'secondFeePercent', 'secondRecipientFee']) next[key] = 0;
  return next;
}
