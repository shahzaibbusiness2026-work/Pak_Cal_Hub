import { formatPKR, formatPercent, safeNumber, formatNumber } from '../utils/formatters';
import { CalculatorOutput, BreakdownRow, ChartDataPoint } from '../../types/calculator';

/**
 * Compound Interest, Mutual Funds & SIP Investment Growth Calculator
 */
export function calculateInvestment(inputs: Record<string, any>): CalculatorOutput {
  const initialPrincipal = safeNumber(inputs.initialPrincipal, 100000); // 1 Lakh initial
  const monthlyDeposit = safeNumber(inputs.monthlyDeposit, 25000); // 25k/mo SIP
  const annualReturnPct = safeNumber(inputs.annualReturnPct, 15.0); // e.g. 15% mutual funds / PSX
  const tenureYears = safeNumber(inputs.tenureYears, 10); // 10 years

  const monthlyRate = annualReturnPct / 12 / 100;
  const totalMonths = tenureYears * 12;

  // Future Value of Initial Principal: P * (1 + r)^n
  const fvPrincipal = initialPrincipal * Math.pow(1 + monthlyRate, totalMonths);

  // Future Value of Monthly SIP Series: PMT * [((1 + r)^n - 1) / r]
  let fvMonthly = 0;
  if (monthlyRate > 0) {
    fvMonthly = monthlyDeposit * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
  } else {
    fvMonthly = monthlyDeposit * totalMonths;
  }

  const totalFutureValue = fvPrincipal + fvMonthly;
  const totalInvested = initialPrincipal + monthlyDeposit * totalMonths;
  const totalWealthGain = totalFutureValue - totalInvested;

  const chartData: ChartDataPoint[] = [
    { name: 'Total Amount Invested', value: Math.round(totalInvested), color: '#3b82f6' },
    { name: 'Compound Wealth Gain', value: Math.round(totalWealthGain), color: '#16a34a' },
  ];

  return {
    primaryResult: {
      id: 'futureValue',
      label: 'Estimated Future Wealth (Maturity)',
      value: formatPKR(totalFutureValue),
      type: 'currency',
      highlight: true,
      color: 'success',
      subtext: `Total Profit: ${formatPKR(totalWealthGain)}`,
    },
    secondaryResults: [
      { id: 'invested', label: 'Total Capital Invested', value: formatPKR(totalInvested), type: 'currency' },
      { id: 'gain', label: 'Wealth Generated', value: formatPKR(totalWealthGain), type: 'currency', color: 'success' },
      { id: 'multiple', label: 'Wealth Multiplier', value: `${(totalFutureValue / totalInvested).toFixed(2)}x`, type: 'text' },
    ],
    breakdown: [
      { label: 'Initial Lump Sum Invested', amount: formatPKR(initialPrincipal) },
      { label: `Monthly SIP Contributions (${totalMonths} Months)`, amount: formatPKR(monthlyDeposit * totalMonths) },
      { label: 'Total Invested Capital Outlay', amount: formatPKR(totalInvested) },
      { label: `Compound Returns (${annualReturnPct}% per annum)`, amount: formatPKR(totalWealthGain) },
      { label: 'Total Estimated Maturity Value', amount: formatPKR(totalFutureValue), isTotal: true },
    ],
    chartType: 'pie',
    chartData,
  };
}

/**
 * Inflation & PKR Purchasing Power Erosion Calculator
 */
export function calculateInflation(inputs: Record<string, any>): CalculatorOutput {
  const currentAmount = safeNumber(inputs.currentAmount, 1000000); // 10 Lakh
  const annualInflationPct = safeNumber(inputs.annualInflationPct, 11.1); // 11.1% (June/July 2026 PBS/SBP headline CPI rate)
  const years = safeNumber(inputs.years, 5);

  // Future equivalent cost needed to buy today's basket: P * (1 + i)^n
  const futureEquivalentCost = currentAmount * Math.pow(1 + annualInflationPct / 100, years);

  // Purchasing power of today's money after n years: P / (1 + i)^n
  const futurePurchasingPower = currentAmount / Math.pow(1 + annualInflationPct / 100, years);
  const purchasingPowerLostPct = ((currentAmount - futurePurchasingPower) / currentAmount) * 100;

  return {
    primaryResult: {
      id: 'futureCost',
      label: `Cost of Basket in ${years} Years`,
      value: formatPKR(futureEquivalentCost),
      type: 'currency',
      highlight: true,
      color: 'warning',
      subtext: `At ${annualInflationPct}% annual inflation`,
    },
    secondaryResults: [
      { id: 'realValue', label: `Today's ${formatPKR(currentAmount)} Value in ${years} Yrs`, value: formatPKR(futurePurchasingPower), type: 'currency', color: 'error' },
      { id: 'lostPct', label: 'Purchasing Power Eroded', value: formatPercent(purchasingPowerLostPct), type: 'percentage' },
    ],
    breakdown: [
      { label: 'Current Purchasing Basket Value', amount: formatPKR(currentAmount) },
      { label: 'Assumed Annual Inflation Rate', amount: `${annualInflationPct}% per year` },
      { label: `Future Cost to Buy Same Goods after ${years} Years`, amount: formatPKR(futureEquivalentCost) },
      { label: `Residual Purchasing Value of ${formatPKR(currentAmount)}`, amount: formatPKR(futurePurchasingPower), isTotal: true },
    ],
  };
}
