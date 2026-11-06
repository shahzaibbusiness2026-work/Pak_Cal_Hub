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
      `Nisab basis used: ${nisabStandard === 'gold' ? `Gold — 7.5 Tola × ${formatPKR(goldPricePerTola)} = ${formatPKR(goldNisabValuePKR)}` : `Silver — 52.5 Tola × ${formatPKR(silverPricePerTola)} = ${formatPKR(silverNisabValuePKR)}`}. The other standard would be ${nisabStandard === 'gold' ? formatPKR(silverNisabValuePKR) : formatPKR(goldNisabValuePKR)} — scholars differ, so confirm your standard if your wealth falls between them.`,
      `Prices used: gold ${formatPKR(goldPricePerTola)}/tola and silver ${formatPKR(silverPricePerTola)}/tola (edit them to the Sarafa rates on your Zakat date).`,
    ],
  };
}

/**
 * Islamic Inheritance Distribution (Faraid according to Shariah rules)
 */
export function calculateInheritance(inputs: Record<string, any>): CalculatorOutput {
  const estateValue = Math.max(0, safeNumber(inputs.estateValue, 10000000));
  const funeralAndDebts = Math.max(0, safeNumber(inputs.debtsAndFuneral, 200000));
  const netEstate = Math.max(0, estateValue - funeralAndDebts);

  const hasSpouse = inputs.hasSpouse !== false;
  const spouseType = inputs.spouseType || 'wife'; // 'wife' or 'husband'
  const numSons = Math.max(0, safeNumber(inputs.sons, 0));
  const numDaughters = Math.max(0, safeNumber(inputs.daughters, 0));
  const hasFather = Boolean(inputs.hasFather);
  const hasMother = Boolean(inputs.hasMother);

  const hasChildren = numSons > 0 || numDaughters > 0;
  const hasSons = numSons > 0;
  const daughtersOnly = numDaughters > 0 && numSons === 0;

  if (netEstate === 0) {
    return {
      primaryResult: { id: 'netEstate', label: 'Distributable Estate', value: 'Rs. 0', type: 'currency' },
      secondaryResults: [],
      breakdown: [],
    };
  }

  // 1. Determine Initial Qur'anic Shares (Zawil-Furood)
  let spouseFraction = 0;
  if (hasSpouse) {
    if (spouseType === 'wife') {
      spouseFraction = hasChildren ? 1 / 8 : 1 / 4;
    } else {
      spouseFraction = hasChildren ? 1 / 4 : 1 / 2;
    }
  }

  let motherFraction = 0;
  if (hasMother) {
    // Umariyyatan special case: only Spouse, Mother, Father (no children)
    if (!hasChildren && hasSpouse && hasFather) {
      motherFraction = (1 - spouseFraction) / 3; // 1/3 of remainder
    } else {
      motherFraction = hasChildren ? 1 / 6 : 1 / 3;
    }
  }

  let fatherFixedFraction = 0;
  if (hasFather) {
    if (hasSons) {
      fatherFixedFraction = 1 / 6; // Fixed 1/6 when sons exist
    } else if (daughtersOnly) {
      fatherFixedFraction = 1 / 6; // Fixed 1/6 + Asabah later
    } else if (!hasChildren) {
      fatherFixedFraction = 0; // Entirely Asabah (residuary)
    }
  }

  let daughtersFixedFraction = 0;
  if (daughtersOnly) {
    daughtersFixedFraction = numDaughters === 1 ? 1 / 2 : 2 / 3;
  }

  // Calculate sum of fixed Quranic fractions
  const sumFixedFractions = spouseFraction + motherFraction + fatherFixedFraction + daughtersFixedFraction;

  let spouseAmount = 0;
  let motherAmount = 0;
  let fatherAmount = 0;
  let daughtersTotalAmount = 0;
  let sonsTotalAmount = 0;
  let eachSonShare = 0;
  let eachDaughterShare = 0;

  if (sumFixedFractions > 1) {
    // ==========================================
    // CASE A: AWL (Proportional Reduction)
    // ==========================================
    spouseAmount = (spouseFraction / sumFixedFractions) * netEstate;
    motherAmount = (motherFraction / sumFixedFractions) * netEstate;
    fatherAmount = (fatherFixedFraction / sumFixedFractions) * netEstate;
    daughtersTotalAmount = (daughtersFixedFraction / sumFixedFractions) * netEstate;
    if (numDaughters > 0) {
      eachDaughterShare = daughtersTotalAmount / numDaughters;
    }
  } else {
    // Calculate unadjusted fixed amounts
    spouseAmount = netEstate * spouseFraction;
    motherAmount = netEstate * motherFraction;
    let fatherBaseAmount = netEstate * fatherFixedFraction;
    let daughtersBaseAmount = netEstate * daughtersFixedFraction;

    const distributedFixed = spouseAmount + motherAmount + fatherBaseAmount + daughtersBaseAmount;
    const remainder = Math.max(0, netEstate - distributedFixed);

    if (hasSons) {
      // Sons & Daughters share remainder as Asabah (2:1 ratio)
      fatherAmount = fatherBaseAmount;
      const totalUnits = numSons * 2 + numDaughters * 1;
      if (totalUnits > 0) {
        const unitValue = remainder / totalUnits;
        eachSonShare = unitValue * 2;
        eachDaughterShare = unitValue * 1;
        sonsTotalAmount = eachSonShare * numSons;
        daughtersTotalAmount = eachDaughterShare * numDaughters;
      }
    } else if (daughtersOnly) {
      if (hasFather) {
        // Father takes remaining residue as Asabah
        fatherAmount = fatherBaseAmount + remainder;
        daughtersTotalAmount = daughtersBaseAmount;
        eachDaughterShare = daughtersTotalAmount / numDaughters;
      } else {
        // RADD (Surplus returned proportionally to non-spouse heirs: Mother and Daughters)
        const nonSpouseFixed = motherFraction + daughtersFixedFraction;
        if (nonSpouseFixed > 0 && remainder > 0) {
          const motherRadd = (motherFraction / nonSpouseFixed) * remainder;
          const daughtersRadd = (daughtersFixedFraction / nonSpouseFixed) * remainder;
          motherAmount += motherRadd;
          daughtersTotalAmount = daughtersBaseAmount + daughtersRadd;
          eachDaughterShare = daughtersTotalAmount / numDaughters;
        } else {
          daughtersTotalAmount = daughtersBaseAmount;
          eachDaughterShare = daughtersTotalAmount / numDaughters;
        }
      }
    } else {
      // No children
      if (hasFather) {
        // Father takes entire remainder as Asabah
        fatherAmount = fatherBaseAmount + remainder;
      } else if (hasMother && remainder > 0) {
        // Radd to Mother
        motherAmount += remainder;
      }
    }
  }

  // Round amounts cleanly
  spouseAmount = Math.round(spouseAmount);
  motherAmount = Math.round(motherAmount);
  fatherAmount = Math.round(fatherAmount);
  eachSonShare = numSons > 0 ? Math.round(eachSonShare) : 0;
  eachDaughterShare = numDaughters > 0 ? Math.round(eachDaughterShare) : 0;
  sonsTotalAmount = eachSonShare * numSons;
  daughtersTotalAmount = eachDaughterShare * numDaughters;

  const breakdown: BreakdownRow[] = [
    { label: 'Net Distributable Estate (After Debts/Funeral)', amount: formatPKR(netEstate) },
  ];

  if (hasSpouse) {
    const spouseLabel = spouseType === 'wife' ? 'Wife/Widow' : 'Husband';
    const spousePct = netEstate > 0 ? ((spouseAmount / netEstate) * 100).toFixed(2) : '0';
    breakdown.push({
      label: `${spouseLabel} Share (${spousePct}%)`,
      amount: formatPKR(spouseAmount),
    });
  }

  if (hasMother) {
    const motherPct = netEstate > 0 ? ((motherAmount / netEstate) * 100).toFixed(2) : '0';
    breakdown.push({
      label: `Mother Share (${motherPct}%)`,
      amount: formatPKR(motherAmount),
    });
  }

  if (hasFather) {
    const fatherPct = netEstate > 0 ? ((fatherAmount / netEstate) * 100).toFixed(2) : '0';
    const detail = hasSons ? '1/6 Fixed Share' : daughtersOnly ? '1/6 Fixed + Residue (Asabah)' : 'Residuary (Asabah)';
    breakdown.push({
      label: `Father Share (${fatherPct}%)`,
      detail,
      amount: formatPKR(fatherAmount),
    });
  }

  if (numSons > 0) {
    breakdown.push({
      label: `Sons (${numSons} Sons total)`,
      detail: `Each Son: ${formatPKR(eachSonShare)} (2 shares ratio)`,
      amount: formatPKR(sonsTotalAmount),
    });
  }

  if (numDaughters > 0) {
    const detail = hasSons
      ? `Each Daughter: ${formatPKR(eachDaughterShare)} (1 share ratio)`
      : numDaughters === 1
      ? `1 Daughter Fixed 1/2 Share: ${formatPKR(eachDaughterShare)}`
      : `Each Daughter (Equal 2/3 Share): ${formatPKR(eachDaughterShare)}`;

    breakdown.push({
      label: `Daughters (${numDaughters} Daughters total)`,
      detail,
      amount: formatPKR(daughtersTotalAmount),
    });
  }

  const chartData: ChartDataPoint[] = [];
  if (spouseAmount > 0) chartData.push({ name: spouseType === 'wife' ? 'Wife' : 'Husband', value: spouseAmount, color: '#ec4899' });
  if (motherAmount > 0) chartData.push({ name: 'Mother', value: motherAmount, color: '#8b5cf6' });
  if (fatherAmount > 0) chartData.push({ name: 'Father', value: fatherAmount, color: '#3b82f6' });
  if (sonsTotalAmount > 0) chartData.push({ name: 'Sons', value: sonsTotalAmount, color: '#16a34a' });
  if (daughtersTotalAmount > 0) chartData.push({ name: 'Daughters', value: daughtersTotalAmount, color: '#f59e0b' });

  return {
    primaryResult: {
      id: 'netEstate',
      label: 'Total Distributable Estate',
      value: formatPKR(netEstate),
      type: 'currency',
      highlight: true,
      color: 'success',
      subtext: sumFixedFractions > 1 ? 'Awl (Proportional Reduction Applied)' : 'Faraid Quranic Distribution',
    },
    secondaryResults: [
      { id: 'sonShare', label: numSons > 0 ? 'Per Son Share' : 'Sons', value: numSons > 0 ? formatPKR(eachSonShare) : 'None', type: 'currency' },
      { id: 'daughterShare', label: numDaughters > 0 ? 'Per Daughter Share' : 'Daughters', value: numDaughters > 0 ? formatPKR(eachDaughterShare) : 'None', type: 'currency' },
      { id: 'spouseShare', label: hasSpouse ? `${spouseType === 'wife' ? 'Wife' : 'Husband'} Total` : 'Spouse', value: hasSpouse ? formatPKR(spouseAmount) : 'None', type: 'currency' },
      { id: 'fatherShare', label: hasFather ? 'Father Total' : 'Father', value: hasFather ? formatPKR(fatherAmount) : 'None', type: 'currency' },
    ],
    breakdown,
    chartType: 'pie',
    chartData: chartData.length > 0 ? chartData : undefined,
    notes: [
      'Illustrative Hanafi distribution for the selected spouse, parents and children only. Other heirs, bequests and jurisdiction-specific rules require specialist review.',
      'If daughters exist without sons, 1 daughter receives 1/2, and 2 or more daughters receive 2/3 collectively.',
      'Sons and daughters share remaining estate in a 2:1 ratio.',
      'All funeral costs and outstanding debts must be settled prior to inheritance distribution.',
    ],
  };
}
