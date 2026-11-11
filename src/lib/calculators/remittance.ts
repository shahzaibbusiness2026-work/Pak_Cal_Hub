import { CalculatorOutput } from '../../types/calculator';
import { BASELINE_FX_RATES } from './currency';
import { invalidInput } from './validation';
import { REMITTANCE_COUNTRIES, REMITTANCE_CURRENCY_CODES, formatRemittanceMoney as money, roundRemittanceMoney as round } from '../data/remittance';

interface Quote { received: number; paid: number; principal: number; fee: number; recipientFee: number; rate: number; }

function transfer(amount: number, rate: number, fixedFee: number, percentage: number, recipientFee: number, included: boolean, from: string, to: string): Quote | null {
  const fee = round(fixedFee + amount * percentage / 100, from);
  const principal = round(included ? amount - fee : amount, from);
  const grossReceived = round(principal * rate, to);
  if (principal < 0 || recipientFee > grossReceived) return null;
  const result = { received: round(grossReceived - recipientFee, to), paid: round(included ? amount : amount + fee, from), principal, fee, recipientFee, rate };
  return Object.values(result).every(Number.isFinite) ? result : null;
}

export function calculateRemittance(inputs: Record<string, any>): CalculatorOutput {
  const from = String(inputs.fromCurrency ?? 'GBP');
  const to = String(inputs.toCurrency ?? 'PKR');
  const fromCountry = REMITTANCE_COUNTRIES.find((item) => item.code === (inputs.fromCountry ?? 'GB'));
  const toCountry = REMITTANCE_COUNTRIES.find((item) => item.code === (inputs.toCountry ?? 'PK'));
  if (!fromCountry || !toCountry || !REMITTANCE_CURRENCY_CODES.has(from) || !REMITTANCE_CURRENCY_CODES.has(to)) return invalidInput('Choose valid countries and currencies.');
  const numeric = (id: string, fallback = 0) => Number(inputs[id] ?? fallback);
  const amount = numeric('sendAmount', 1000);
  const fee = numeric('senderFee');
  const percent = numeric('feePercent');
  const recipientFee = numeric('recipientFee');
  const included = inputs.feeMode !== 'on-top';
  const usingQuote = inputs.rateMode === 'quote';
  const sameCurrency = from === to;
  if (![amount, fee, percent, recipientFee].every((value) => Number.isFinite(value) && value >= 0) || percent > 100) return invalidInput('Enter non-negative amounts and a fee percentage from 0 to 100.');

  const savedRate = (currency: string) => currency === 'PKR' ? 1 : BASELINE_FX_RATES[currency]?.rateInPKR;
  const sourceReference = Number(inputs.referenceRate);
  const hasCurrentReference = sourceReference > 0 && Number.isFinite(sourceReference) && typeof inputs.referenceAsOf === 'string' && Number.isFinite(Date.parse(inputs.referenceAsOf));
  const savedFrom = savedRate(from);
  const savedTo = savedRate(to);
  const reference = sameCurrency ? 1 : hasCurrentReference ? sourceReference : savedFrom && savedTo ? savedFrom / savedTo : undefined;
  const rate = sameCurrency ? 1 : usingQuote ? numeric('providerRate') : reference;
  if (!rate || !Number.isFinite(rate) || rate <= 0) return invalidInput(usingQuote ? `Enter your provider's quote: ${to} received for 1 ${from}.` : `A reference for ${from}/${to} is unavailable. Choose “Enter provider quote” and enter the actual rate.`);
  const a = transfer(amount, rate, fee, percent, recipientFee, included, from, to);
  if (!a) return invalidInput('Fees exceed the amount available, or the amount is too large. Check the fees and their currencies.');
  const effective = a.paid > 0 ? a.received / a.paid : 0;
  const rateLabel = sameCurrency ? 'Same-currency transfer; rate fixed at 1' : usingQuote ? 'Entered provider quote' : hasCurrentReference ? 'Daily indicative exchange-rate reference' : 'Bundled reference snapshot (reviewed 5 Nov 2026)';
  const breakdown: NonNullable<CalculatorOutput['breakdown']> = [
    { label: 'Sending country / chosen currency', amount: `${fromCountry.name} / ${from}` },
    { label: 'Receiving country / chosen currency', amount: `${toCountry.name} / ${to}` },
    { label: included ? 'Total sending budget (fees included)' : 'Transfer amount before sender fees', amount: money(amount, from) },
    { label: `Sender fees (${percent}% of entered amount + fixed fee)`, amount: money(a.fee, from), isDeduction: included },
    { label: 'Amount exchanged after sender fees', amount: money(a.principal, from) },
    { label: 'Exchange rate', amount: `1 ${from} = ${rate.toLocaleString('en-US', { maximumSignificantDigits: 10 })} ${to}` },
    { label: 'Rate source', amount: rateLabel },
    { label: `Recipient / intermediary deduction (${to})`, amount: money(recipientFee, to), isDeduction: true },
    { label: 'Total sender pays', amount: money(a.paid, from) },
    { label: 'Recipient receives (estimate)', amount: money(a.received, to), isTotal: true },
  ];
  const secondaries: NonNullable<CalculatorOutput['secondaryResults']> = [
    { id: 'senderPays', label: `Total Paid (${from})`, value: money(a.paid, from), type: 'text' },
    { id: 'senderFees', label: `Sender Fees (${from})`, value: money(a.fee, from), type: 'text' },
    { id: 'effectiveRate', label: `Net ${to} per ${from} Paid`, value: effective.toLocaleString('en-US', { maximumSignificantDigits: 8 }), type: 'text' },
  ];
  if (reference && !sameCurrency) {
    const difference = round(a.principal * (reference - rate), to);
    secondaries.push({ id: 'rateDifference', label: `FX Difference vs Reference (${to})`, value: money(difference, to), type: 'text', subtext: 'Positive = less received at the entered rate; negative = more. Excludes fees.' });
    breakdown.push({ label: 'Reference rate for comparison (not a guaranteed transfer quote)', amount: `1 ${from} = ${reference.toLocaleString('en-US', { maximumSignificantDigits: 10 })} ${to}` });
  }
  if (usingQuote && inputs.compareQuote === true) {
    const secondRate = sameCurrency ? 1 : numeric('secondProviderRate');
    const secondFee = numeric('secondSenderFee');
    const secondPercent = numeric('secondFeePercent');
    const secondRecipientFee = numeric('secondRecipientFee');
    if (![secondRate, secondFee, secondPercent, secondRecipientFee].every((value) => Number.isFinite(value) && value >= 0) || secondRate <= 0 || secondPercent > 100) return invalidInput('Enter a positive rate and valid fees for quote B.');
    const b = transfer(amount, secondRate, secondFee, secondPercent, secondRecipientFee, included, from, to);
    if (!b) return invalidInput('Quote B fees exceed the available transfer amount.');
    secondaries.push(
      { id: 'quoteBReceived', label: `Quote B Receives (${to})`, value: money(b.received, to), type: 'text' },
      { id: 'quoteBPaid', label: `Quote B Total Paid (${from})`, value: money(b.paid, from), type: 'text' },
      { id: 'quoteDifference', label: `Received Difference: B − A (${to})`, value: money(round(b.received - a.received, to), to), type: 'text' },
    );
    breakdown.push({ label: 'Quote B effective delivery rate after all entered fees', amount: `${(b.paid > 0 ? b.received / b.paid : 0).toLocaleString('en-US', { maximumSignificantDigits: 8 })} ${to} per ${from} paid` });
  }
  const notes = [
    'Fees default to zero. Enter all applicable provider and recipient/intermediary charges before comparing offers. This calculator does not fetch provider fees, transfer speed or corridor availability.',
    'Country selection suggests a local currency; you can choose another currency. A listed country or currency does not establish that a transfer is available, permitted or supported by any provider.',
    `Fixed sender fees are in ${from}; recipient fees are in ${to}. Percentage fees are calculated on the entered amount. Select whether sender fees are included in your budget or paid on top.`,
    'Exchange-rate references are indicative and updated daily, not guaranteed bank or transfer quotes. Results are rounded to the selected currency precision.',
    'When comparing quotes with sender fees paid on top, compare total paid as well as the amount received; the two total budgets may differ.',
  ];
  if (hasCurrentReference && !sameCurrency) notes.push(`Reference source timestamp: ${inputs.referenceAsOf}. Rates by ExchangeRate-API.`);
  if (!hasCurrentReference && !sameCurrency && reference) notes.push('Current reference unavailable: using the explicitly labelled bundled snapshot for comparison. Enter a current provider quote for your transaction.');
  if (!fromCountry.currencies.includes(from) || !toCountry.currencies.includes(to)) notes.push('At least one chosen currency differs from the country’s listed local currencies. Confirm the receiving account and provider support it.');
  return {
    primaryResult: { id: 'remittanceReceived', label: usingQuote && inputs.compareQuote ? 'Quote A: Recipient Receives (Estimate)' : 'Recipient Receives (Estimate)', value: money(a.received, to), type: 'text', highlight: true, color: 'success', subtext: `${fromCountry.name} → ${toCountry.name} | ${rateLabel}` },
    secondaryResults: secondaries,
    breakdown,
    notes,
  };
}
