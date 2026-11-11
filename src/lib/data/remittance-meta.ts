import type { CategoryDefinition, CalculatorDefinition } from '../../types/calculator';
import { REMITTANCE_COUNTRY_OPTIONS, REMITTANCE_CURRENCY_OPTIONS } from './remittance';
import { OVERSEAS_TOOLS } from './overseas-meta';

export const OVERSEAS_CATEGORY: Omit<CategoryDefinition, 'tools'> & { tools: Omit<CalculatorDefinition, 'calculate'>[] } = {
  id: 'overseas', slug: 'overseas', name: 'Overseas Pakistanis',
  shortDesc: 'Remittance, PTA phone tax, NICOP fees, Roshan Digital Account, Umrah costs & overseas property taxes',
  description: 'Practical tools for Pakistanis abroad. Compare money transfers, work out PTA phone tax and NICOP fees, check Roshan Digital Account returns, estimate Umrah costs, and estimate overseas property taxes.',
  icon: 'DollarSign', colorTheme: 'cyan',
  tools: [{
    id: 'remittance-calculator', slug: 'remittance-calculator', category: 'overseas',
    title: 'Worldwide Remittance & Transfer Fee Calculator', shortTitle: 'Remittance Calculator', icon: 'ArrowRightLeft',
    description: 'Choose sending and receiving countries and currencies, enter transfer fees, and estimate what the recipient receives. Compare two provider quotes or use a dated indicative reference.',
    tags: ['remittance calculator', 'send money to pakistan', 'transfer fees', 'overseas pakistani', 'aed to pkr', 'sar to pkr', 'gbp to pkr', 'worldwide remittance'],
    metaTitle: 'Worldwide Remittance Calculator | Transfer Fees & Money Received',
    metaDescription: 'Calculate how much money arrives after fees. Choose countries and currencies worldwide, check indicative exchange rates, and compare entered transfer quotes.',
    featured: true, trending: true,
    formulaExplainer: 'Sender fee = fixed fee + entered amount × fee percentage. For an inclusive budget, subtract sender fees before conversion. Otherwise add them to the sender’s total payment. Recipient receives = converted principal − recipient fees. Effective rate = recipient receives ÷ total sender payment.',
    faqs: [
      { question: 'Can I change the country and currency independently?', answer: 'Yes. Choosing a country suggests a local currency, but you can change it. Pakistan and PKR are the default destination; other destinations are also available. Confirm that the chosen provider and recipient account support the route and currency.' },
      { question: 'Are the rates and provider fees live quotes?', answer: 'The reference is a daily indicative exchange rate where the source supports the pair. It is not a provider quote. Enter your actual provider rate and all fees for a transaction estimate. Fees start at zero and are not fetched from transfer companies.' },
      { question: 'Why does changing a route clear the quotes and fees?', answer: 'A quote and fee apply to a particular route and currency. Changing either clears those amounts so an old price is not accidentally applied to a different transfer.' },
      { question: 'Can I compare two transfer services?', answer: 'Choose Enter provider quote, enable a second quote, and enter each rate and fee. If sender fees are paid on top, also compare total paid because the two total budgets can differ.' },
    ],
    inputs: [
      { id: 'fromCountry', label: 'Sending Country / Territory', type: 'select', defaultValue: 'GB', options: REMITTANCE_COUNTRY_OPTIONS, helpText: 'Suggests a local currency. It does not confirm that a provider operates this route.' },
      { id: 'fromCurrency', label: 'Sending Currency', type: 'select', defaultValue: 'GBP', options: REMITTANCE_CURRENCY_OPTIONS, helpText: 'You can use a currency different from the country’s default.' },
      { id: 'toCountry', label: 'Receiving Country / Territory', type: 'select', defaultValue: 'PK', options: REMITTANCE_COUNTRY_OPTIONS },
      { id: 'toCurrency', label: 'Receiving Currency', type: 'select', defaultValue: 'PKR', options: REMITTANCE_CURRENCY_OPTIONS },
      { id: 'sendAmount', label: 'Amount in Sending Currency', type: 'number', defaultValue: 1000, min: 0, max: 1e12, step: 0.01 },
      { id: 'feeMode', label: 'How Are Sender Fees Paid?', type: 'select', defaultValue: 'included', options: [{ label: 'Within my entered budget (deduct fees first)', value: 'included' }, { label: 'On top of my entered transfer amount', value: 'on-top' }] },
      { id: 'rateMode', label: 'Exchange Rate Source', type: 'select', defaultValue: 'reference', options: [{ label: 'Daily indicative reference (estimate)', value: 'reference' }, { label: 'Enter provider quote', value: 'quote' }] },
      { id: 'providerRate', label: 'Quote A: Receiving Units per 1 Sending Unit', type: 'number', defaultValue: 0, min: 0, step: 0.000001, showWhen: [{ fieldId: 'rateMode', equals: 'quote' }], helpText: 'For GBP to PKR, enter PKR per GBP. Re-enter the quote after changing a route or currency. Same-currency transfers use 1.' },
      { id: 'senderFee', label: 'Fixed Sender Fee (Sending Currency)', type: 'number', defaultValue: 0, min: 0, step: 0.01, helpText: 'Enter the provider fee. Zero is a starting input, not a promise of a free transfer.' },
      { id: 'feePercent', label: 'Sender Fee (% of Entered Amount)', type: 'number', defaultValue: 0, min: 0, max: 100, step: 0.01, helpText: 'Added to the fixed fee. Confirm which amount your provider uses as the fee base.' },
      { id: 'recipientFee', label: 'Recipient / Intermediary Fee (Receiving Currency)', type: 'number', defaultValue: 0, min: 0, step: 0.01 },
      { id: 'compareQuote', label: 'Compare a Second Provider Quote', type: 'toggle', defaultValue: false, showWhen: [{ fieldId: 'rateMode', equals: 'quote' }] },
      { id: 'secondProviderRate', label: 'Quote B: Receiving Units per 1 Sending Unit', type: 'number', defaultValue: 0, min: 0, step: 0.000001, showWhen: [{ fieldId: 'rateMode', equals: 'quote' }, { fieldId: 'compareQuote', equals: true }] },
      { id: 'secondSenderFee', label: 'Quote B: Fixed Sender Fee (Sending Currency)', type: 'number', defaultValue: 0, min: 0, step: 0.01, showWhen: [{ fieldId: 'rateMode', equals: 'quote' }, { fieldId: 'compareQuote', equals: true }] },
      { id: 'secondFeePercent', label: 'Quote B: Sender Fee (%)', type: 'number', defaultValue: 0, min: 0, max: 100, step: 0.01, showWhen: [{ fieldId: 'rateMode', equals: 'quote' }, { fieldId: 'compareQuote', equals: true }] },
      { id: 'secondRecipientFee', label: 'Quote B: Recipient Fee (Receiving Currency)', type: 'number', defaultValue: 0, min: 0, step: 0.01, showWhen: [{ fieldId: 'rateMode', equals: 'quote' }, { fieldId: 'compareQuote', equals: true }] },
    ],
  }, ...OVERSEAS_TOOLS],
};
