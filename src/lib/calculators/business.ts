import { formatPKR, formatPercent, safeNumber, formatNumber } from '../utils/formatters';
import { CalculatorOutput, BreakdownRow, ChartDataPoint } from '../../types/calculator';

/**
 * Profit Margin, Markup, and Revenue Calculator
 */
export function calculateProfitMargin(inputs: Record<string, any>): CalculatorOutput {
  const cost = safeNumber(inputs.cost, 15000);
  const revenue = safeNumber(inputs.revenue, 22000);

  const profit = revenue - cost;
  const marginPct = revenue > 0 ? (profit / revenue) * 100 : 0;
  const markupPct = cost > 0 ? (profit / cost) * 100 : 0;

  return {
    primaryResult: {
      id: 'profit',
      label: 'Net Profit',
      value: formatPKR(profit),
      type: 'currency',
      highlight: true,
      color: profit >= 0 ? 'success' : 'error',
      subtext: `Profit Margin: ${marginPct.toFixed(2)}%`,
    },
    secondaryResults: [
      { id: 'margin', label: 'Profit Margin', value: formatPercent(marginPct), type: 'percentage' },
      { id: 'markup', label: 'Markup Percentage', value: formatPercent(markupPct), type: 'percentage' },
      { id: 'revenue', label: 'Total Revenue', value: formatPKR(revenue), type: 'currency' },
    ],
    breakdown: [
      { label: 'Cost of Goods Sold (COGS)', amount: formatPKR(cost) },
      { label: 'Gross Sales Revenue', amount: formatPKR(revenue) },
      { label: 'Profit Margin (Profit ÷ Revenue)', amount: `${marginPct.toFixed(2)}%` },
      { label: 'Markup Rate (Profit ÷ Cost)', amount: `${markupPct.toFixed(2)}%` },
      { label: 'Total Net Profit', amount: formatPKR(profit), isTotal: true },
    ],
    chartType: 'pie',
    chartData: [
      { name: 'Cost', value: Math.round(cost), color: '#64748b' },
      { name: 'Profit', value: Math.max(0, Math.round(profit)), color: '#16a34a' },
    ],
  };
}

/**
 * Break-Even Point Analysis Calculator
 */
export function calculateBreakEven(inputs: Record<string, any>): CalculatorOutput {
  const fixedCosts = safeNumber(inputs.fixedCosts, 250000); // monthly rent, salaries, utilities
  const unitSellingPrice = safeNumber(inputs.unitPrice, 1500);
  const unitVariableCost = safeNumber(inputs.variableCost, 900); // material, direct labour

  const contributionMarginPerUnit = unitSellingPrice - unitVariableCost;
  const contributionMarginRatio = unitSellingPrice > 0 ? (contributionMarginPerUnit / unitSellingPrice) * 100 : 0;

  const breakEvenUnits = contributionMarginPerUnit > 0 ? Math.ceil(fixedCosts / contributionMarginPerUnit) : 0;
  const breakEvenRevenue = breakEvenUnits * unitSellingPrice;

  return {
    primaryResult: {
      id: 'breakEvenUnits',
      label: 'Break-Even Volume Required',
      value: `${breakEvenUnits.toLocaleString()} Units`,
      type: 'text',
      highlight: true,
      color: 'success',
      subtext: `Target Sales: ${formatPKR(breakEvenRevenue)}`,
    },
    secondaryResults: [
      { id: 'breakEvenRevenue', label: 'Break-Even Sales Revenue', value: formatPKR(breakEvenRevenue), type: 'currency' },
      { id: 'unitMargin', label: 'Unit Contribution Margin', value: formatPKR(contributionMarginPerUnit), type: 'currency' },
      { id: 'marginRatio', label: 'Contribution Ratio', value: formatPercent(contributionMarginRatio), type: 'percentage' },
    ],
    breakdown: [
      { label: 'Total Monthly Fixed Operating Costs', amount: formatPKR(fixedCosts) },
      { label: 'Unit Selling Price', amount: formatPKR(unitSellingPrice) },
      { label: 'Unit Variable Cost', amount: formatPKR(unitVariableCost) },
      { label: 'Unit Profit Contribution', amount: formatPKR(contributionMarginPerUnit) },
      { label: 'Break-Even Sales Target in PKR', amount: formatPKR(breakEvenRevenue), isTotal: true },
    ],
  };
}

/**
 * Freelancer Hourly & Monthly Target Rate Calculator
 */
export function calculateFreelancerRate(inputs: Record<string, any>): CalculatorOutput {
  const targetMonthlyPKR = safeNumber(inputs.targetMonthlyPKR, 300000); // 3 Lakh / mo
  const billableHoursPerWeek = safeNumber(inputs.billableHoursPerWeek, 25);
  const weeksPerYear = safeNumber(inputs.weeksPerYear, 48); // accounting for 4 weeks leave
  const businessExpensesMonthly = safeNumber(inputs.businessExpensesMonthly, 30000); // internet, software, electricity
  const usdPkrRate = safeNumber(inputs.usdPkrRate, 280);

  const totalMonthlyNeed = targetMonthlyPKR + businessExpensesMonthly;
  const totalAnnualNeed = totalMonthlyNeed * 12;
  const totalAnnualBillableHours = billableHoursPerWeek * weeksPerYear;

  const hourlyRatePKR = totalAnnualBillableHours > 0 ? totalAnnualNeed / totalAnnualBillableHours : 0;
  const hourlyRateUSD = usdPkrRate > 0 ? hourlyRatePKR / usdPkrRate : 0;

  return {
    primaryResult: {
      id: 'hourlyRateUSD',
      label: 'Recommended Hourly Rate (USD)',
      value: `$${hourlyRateUSD.toFixed(2)} / hr`,
      type: 'text',
      highlight: true,
      color: 'success',
      subtext: `Equivalent to Rs. ${Math.round(hourlyRatePKR).toLocaleString()} / hr`,
    },
    secondaryResults: [
      { id: 'hourlyPKR', label: 'Hourly Rate (PKR)', value: formatPKR(hourlyRatePKR), type: 'currency' },
      { id: 'annualTarget', label: 'Annual Gross Target', value: formatPKR(totalAnnualNeed), type: 'currency' },
      { id: 'billableHours', label: 'Annual Billable Hours', value: `${totalAnnualBillableHours} hrs`, type: 'text' },
    ],
    breakdown: [
      { label: 'Target Monthly Net Income', amount: formatPKR(targetMonthlyPKR) },
      { label: 'Monthly Business Expenses (Hardware, Internet, Software)', amount: formatPKR(businessExpensesMonthly) },
      { label: 'Total Annual Gross Target Needed', amount: formatPKR(totalAnnualNeed) },
      { label: `Billable Hours (${billableHoursPerWeek} hrs/week × ${weeksPerYear} weeks)`, amount: `${totalAnnualBillableHours} hours` },
      { label: `Recommended Rate in USD (at Rs. ${usdPkrRate}/$)`, amount: `$${hourlyRateUSD.toFixed(2)} / hour`, isTotal: true },
    ],
  };
}
