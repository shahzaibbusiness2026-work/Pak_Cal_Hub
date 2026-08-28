import { ZAKAT_DEFAULTS } from '../data/zakat-data';
import { formatPKR, formatPercent, safeNumber, formatNumber } from '../utils/formatters';
import { CalculatorOutput, BreakdownRow, ChartDataPoint } from '../../types/calculator';

/**
 * Comprehensive Islamic Zakat & Nisab Calculator
 */
export function calculateZakat(inputs: Record<string, any>): CalculatorOutput {
  const goldPricePerTola = safeNumber(inputs.goldPricePerTola, ZAKAT_DEFAULTS.defaultGoldPricePerTola);
  const silverPricePerTola = safeNumber(inputs.silverPricePerTola, ZAKAT_DEFAULTS.defaultSilverPricePerTola);
  const nisabStandard = inputs.nisabStandard || 'silver'; // silver (majority consensus) vs gold

  // Assets
  const goldTolas = safeNumber(inputs.goldTolas, 0);
  const silverTolas = safeNumber(inputs.silverTolas, 0);
  const cashInHand = safeNumber(inputs.cashInHand, 0);
  const bankBalance = safeNumber(inputs.bankBalance, 0);
  const businessStockValue = safeNumber(inputs.businessStockValue, 0);
  const sharesAndInvestments = safeNumber(inputs.sharesAndInvestments, 0);
  const loanedMoneyReceivable = safeNumber(inputs.loanedMoneyReceivable, 0);

  // Liabilities (Short-term immediate debts)
  const immediateDebts = safeNumber(inputs.immediateDebts, 0);
  const unpaidBills = safeNumber(inputs.unpaidBills, 0);

  // Asset values in PKR
  const goldValuePKR = goldTolas * goldPricePerTola;
  const silverValuePKR = silverTolas * silverPricePerTola;
  const totalGrossAssets =
    goldValuePKR +
    silverValuePKR +
    cashInHand +
    bankBalance +
    businessStockValue +
    sharesAndInvestments +
    loanedMoneyReceivable;

  const totalLiabilities = immediateDebts + unpaidBills;
  const netZakatableWealth = Math.max(0, totalGrossAssets - totalLiabilities);

  // Nisab threshold values
  const silverNisabValuePKR = ZAKAT_DEFAULTS.silverNisabTola * silverPricePerTola;
  const goldNisabValuePKR = ZAKAT_DEFAULTS.goldNisabTola * goldPricePerTola;
  const effectiveNisabThreshold = nisabStandard === 'gold' ? goldNisabValuePKR : silverNisabValuePKR;

  const isEligibleToPay = netZakatableWealth >= effectiveNisabThreshold;
  const zakatPayable = isEligibleToPay ? netZakatableWealth * ZAKAT_DEFAULTS.zakatRate : 0;

  const breakdown: BreakdownRow[] = [
    { label: `Gold Asset (${goldTolas} Tola)`, amount: formatPKR(goldValuePKR) },
    { label: `Silver Asset (${silverTolas} Tola)`, amount: formatPKR(silverValuePKR) },
    { label: 'Cash in Hand & Bank Balances', amount: formatPKR(cashInHand + bankBalance) },
    { label: 'Business Inventory / Merchandise', amount: formatPKR(businessStockValue) },
    { label: 'Tradable Shares & Mutual Funds', amount: formatPKR(sharesAndInvestments) },
    { label: 'Debts & Immediate Liabilities Deducted', amount: formatPKR(totalLiabilities), isDeduction: true },
    { label: 'Net Zakatable Wealth', amount: formatPKR(netZakatableWealth), isTotal: true },
  ];

  const chartData: ChartDataPoint[] = [];
  if (goldValuePKR > 0) chartData.push({ name: 'Gold', value: Math.round(goldValuePKR), color: '#eab308' });
  if (cashInHand + bankBalance > 0) chartData.push({ name: 'Cash & Bank', value: Math.round(cashInHand + bankBalance), color: '#16a34a' });
  if (businessStockValue > 0) chartData.push({ name: 'Business Stock', value: Math.round(businessStockValue), color: '#3b82f6' });
  if (sharesAndInvestments > 0) chartData.push({ name: 'Investments', value: Math.round(sharesAndInvestments), color: '#8b5cf6' });

  return {
    primaryResult: {
      id: 'zakatDue',
      label: 'Zakat Payable (2.5%)',
      value: formatPKR(zakatPayable),
      type: 'currency',
      highlight: true,
      color: isEligibleToPay ? 'success' : 'info',
      subtext: isEligibleToPay
        ? `Nisab Threshold Met (${formatPKR(effectiveNisabThreshold)})`
        : `Below Nisab (${formatPKR(effectiveNisabThreshold)}) - No Zakat Due`,
    },
    secondaryResults: [
      { id: 'netWealth', label: 'Net Zakatable Wealth', value: formatPKR(netZakatableWealth), type: 'currency' },
      { id: 'nisabValue', label: `Nisab Threshold (${nisabStandard === 'gold' ? '7.5 Tola Gold' : '52.5 Tola Silver'})`, value: formatPKR(effectiveNisabThreshold), type: 'currency' },
      { id: 'status', label: 'Zakat Obligation', value: isEligibleToPay ? 'Fard (Obligatory)' : 'Not Applicable', type: 'badge' },
    ],
    breakdown,
    chartType: 'pie',
    chartData: chartData.length > 0 ? chartData : undefined,
    notes: [
      'Zakat is 2.5% (1/40th) on net zakatable wealth held for one full lunar year (Hawl).',
      'The Silver Nisab standard (52.5 Tola = ~Rs. 170,000) is the preferred standard by the majority of contemporary scholars for cash, commercial goods, and combined wealth to maximize benefit for the poor.',
    ],
  };
}

/**
 * Islamic Inheritance Distribution (Faraid according to Shariah rules)
 */
export function calculateInheritance(inputs: Record<string, any>): CalculatorOutput {
  const estateValue = safeNumber(inputs.estateValue, 10000000); // Rs 1 Crore
  const funeralAndDebts = safeNumber(inputs.debtsAndFuneral, 200000);
  const netEstate = Math.max(0, estateValue - funeralAndDebts);

  const hasSpouse = inputs.hasSpouse !== false;
  const spouseType = inputs.spouseType || 'wife'; // wife or husband
  const numSons = safeNumber(inputs.sons, 2);
  const numDaughters = safeNumber(inputs.daughters, 2);
  const hasFather = inputs.hasFather === true;
  const hasMother = inputs.hasMother === true;

  const hasChildren = numSons > 0 || numDaughters > 0;

  let spouseShareAmount = 0;
  let fatherShareAmount = 0;
  let motherShareAmount = 0;

  // 1. Mother Share: 1/6 if children or multiple siblings exist, else 1/3
  if (hasMother) {
    const motherFraction = hasChildren ? 1 / 6 : 1 / 3;
    motherShareAmount = netEstate * motherFraction;
  }

  // 2. Father Share: 1/6 if children exist
  if (hasFather) {
    const fatherFraction = hasChildren ? 1 / 6 : 1 / 3;
    fatherShareAmount = netEstate * fatherFraction;
  }

  // 3. Spouse Share
  if (hasSpouse) {
    if (spouseType === 'wife') {
      // Wife gets 1/8 if children, 1/4 if no children
      const wifeFraction = hasChildren ? 1 / 8 : 1 / 4;
      spouseShareAmount = netEstate * wifeFraction;
    } else {
      // Husband gets 1/4 if children, 1/2 if no children
      const husbandFraction = hasChildren ? 1 / 4 : 1 / 2;
      spouseShareAmount = netEstate * husbandFraction;
    }
  }

  const distributedFixed = spouseShareAmount + fatherShareAmount + motherShareAmount;
  const remainingForChildren = Math.max(0, netEstate - distributedFixed);

  // Residuary Shares (Asabah): Son receives 2 parts, Daughter receives 1 part (Quran 4:11)
  const totalChildUnits = numSons * 2 + numDaughters * 1;
  let eachSonShare = 0;
  let eachDaughterShare = 0;

  if (totalChildUnits > 0) {
    const unitValue = remainingForChildren / totalChildUnits;
    eachSonShare = unitValue * 2;
    eachDaughterShare = unitValue * 1;
  }

  const breakdown: BreakdownRow[] = [
    { label: 'Net Distributable Estate (After Debts/Funeral)', amount: formatPKR(netEstate) },
  ];

  if (hasSpouse) {
    breakdown.push({
      label: `${spouseType === 'wife' ? 'Wife/Widow' : 'Husband'} Share (${hasChildren ? (spouseType === 'wife' ? '1/8' : '1/4') : (spouseType === 'wife' ? '1/4' : '1/2')})`,
      amount: formatPKR(spouseShareAmount),
    });
  }
  if (hasMother) breakdown.push({ label: 'Mother Share (1/6)', amount: formatPKR(motherShareAmount) });
  if (hasFather) breakdown.push({ label: 'Father Share (1/6)', amount: formatPKR(fatherShareAmount) });

  if (numSons > 0) {
    breakdown.push({
      label: `Sons (${numSons} Sons total)`,
      detail: `Each Son gets 2 shares: ${formatPKR(eachSonShare)}`,
      amount: formatPKR(eachSonShare * numSons),
    });
  }

  if (numDaughters > 0) {
    breakdown.push({
      label: `Daughters (${numDaughters} Daughters total)`,
      detail: `Each Daughter gets 1 share: ${formatPKR(eachDaughterShare)}`,
      amount: formatPKR(eachDaughterShare * numDaughters),
    });
  }

  return {
    primaryResult: {
      id: 'netEstate',
      label: 'Total Distributed Estate',
      value: formatPKR(netEstate),
      type: 'currency',
      highlight: true,
      color: 'success',
    },
    secondaryResults: [
      { id: 'sonShare', label: numSons > 0 ? 'Share per Son' : 'Sons', value: numSons > 0 ? formatPKR(eachSonShare) : 'N/A', type: 'currency' },
      { id: 'daughterShare', label: numDaughters > 0 ? 'Share per Daughter' : 'Daughters', value: numDaughters > 0 ? formatPKR(eachDaughterShare) : 'N/A', type: 'currency' },
      { id: 'spouseShare', label: hasSpouse ? `${spouseType === 'wife' ? 'Wife' : 'Husband'} Share` : 'Spouse', value: hasSpouse ? formatPKR(spouseShareAmount) : 'N/A', type: 'currency' },
    ],
    breakdown,
    notes: [
      'Calculated strictly under Islamic Faraid jurisprudence based on Surah An-Nisa (4:11-12).',
      'All debts, funeral expenses, and valid bequests (up to 1/3rd to non-heirs) must be settled before inheritance distribution.',
    ],
  };
}
