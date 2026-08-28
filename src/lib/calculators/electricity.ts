import { PROTECTED_SLABS, UNPROTECTED_SLABS, ELECTRICITY_CONSTANTS, getFixedCharges } from '../data/electricity-data';
import { formatPKR, formatPercent, safeNumber, formatNumber } from '../utils/formatters';
import { CalculatorOutput, BreakdownRow } from '../../types/calculator';

/**
 * Calculates Pakistan Electricity Bill (LESCO, IESCO, K-Electric, MEPCO, etc.)
 */
export function calculateElectricityBill(inputs: Record<string, any>): CalculatorOutput {
  const units = safeNumber(inputs.units, 280);
  const isProtected = inputs.consumerType === 'protected' && units <= 200;
  const includeTaxes = inputs.includeTaxes !== false;

  const slabs = isProtected ? PROTECTED_SLABS : UNPROTECTED_SLABS;

  let energyCost = 0;
  let remainingUnits = units;
  let slabBreakdownDetails: Array<{ slab: string; unitsInSlab: number; rate: number; cost: number }> = [];

  for (let i = 0; i < slabs.length; i++) {
    const slab = slabs[i];
    const prevMax = i === 0 ? 0 : slabs[i - 1].max;
    const slabCapacity = slab.max === Infinity ? Infinity : slab.max - prevMax;

    if (remainingUnits > 0) {
      const unitsInThisSlab = Math.min(remainingUnits, slabCapacity);
      const costForThisSlab = unitsInThisSlab * slab.rate;
      energyCost += costForThisSlab;
      slabBreakdownDetails.push({
        slab: `${slab.min} - ${slab.max === Infinity ? 'Above' : slab.max} units`,
        unitsInSlab: unitsInThisSlab,
        rate: slab.rate,
        cost: costForThisSlab,
      });
      remainingUnits -= unitsInThisSlab;
    }
  }

  // 2026 Fixed Monthly Charges
  const fixedCharges = getFixedCharges(units, isProtected);

  // Surcharges and Adjustments
  const fcSurcharge = units * ELECTRICITY_CONSTANTS.fcSurchargePerUnit;
  const fpaEstimate = units * ELECTRICITY_CONSTANTS.fpaPerUnitEstimate;
  const qta = units * ELECTRICITY_CONSTANTS.quarterlyTariffAdjustment;
  const baseTotal = energyCost + fixedCharges + fcSurcharge + fpaEstimate + qta;

  // Taxes
  let electricityDuty = 0;
  let gst = 0;
  let tvFee = 0;

  if (includeTaxes) {
    electricityDuty = baseTotal * ELECTRICITY_CONSTANTS.electricityDutyPct;
    // GST applies on total bill for unprotected consumption
    gst = (baseTotal + electricityDuty) * (!isProtected && units > 200 ? ELECTRICITY_CONSTANTS.generalSalesTaxPct : 0.0);
    tvFee = ELECTRICITY_CONSTANTS.tvFee;
  }

  const totalBill = baseTotal + electricityDuty + gst + tvFee;
  const effectiveCostPerUnit = units > 0 ? totalBill / units : 0;

  const breakdown: BreakdownRow[] = [
    { label: `Base Energy Charges (${units} Units consumed)`, amount: formatPKR(energyCost) },
    ...(fixedCharges > 0 ? [{ label: 'Fixed Monthly Meter Charges', amount: formatPKR(fixedCharges) }] : []),
    { label: 'Financing Cost (FC) Surcharge', amount: formatPKR(fcSurcharge) },
    { label: 'Fuel Price Adjustment (FPA)', amount: formatPKR(fpaEstimate) },
    { label: 'Quarterly Tariff Adjustment (QTA)', amount: formatPKR(qta) },
    { label: 'Electricity Duty (1.5%)', amount: formatPKR(electricityDuty) },
    ...(gst > 0 ? [{ label: 'General Sales Tax (GST 18%)', amount: formatPKR(gst) }] : []),
    { label: 'PTV License Fee', amount: formatPKR(tvFee) },
    { label: 'Total Estimated Electricity Bill', amount: formatPKR(totalBill), isTotal: true },
  ];

  return {
    primaryResult: {
      id: 'totalBill',
      label: 'Estimated Total Bill',
      value: formatPKR(totalBill),
      type: 'currency',
      highlight: true,
      color: 'warning',
      subtext: `Avg Rate: Rs. ${effectiveCostPerUnit.toFixed(1)} / unit`,
    },
    secondaryResults: [
      { id: 'units', label: 'Units Consumed', value: `${units} kWh`, type: 'text' },
      { id: 'energyCharges', label: 'Base Energy Cost', value: formatPKR(energyCost), type: 'currency' },
      { id: 'taxesAndSurcharges', label: 'Taxes & Surcharges', value: formatPKR(totalBill - energyCost), type: 'currency' },
      { id: 'consumerCategory', label: 'Category', value: isProtected ? 'Protected' : 'Unprotected', type: 'badge' },
    ],
    breakdown,
    chartType: 'pie',
    chartData: [
      { name: 'Base Energy', value: Math.round(energyCost), color: '#3b82f6' },
      { name: 'Surcharges (FC/QTA/FPA)', value: Math.round(fcSurcharge + fpaEstimate + qta), color: '#f59e0b' },
      { name: 'Govt Taxes & GST', value: Math.round(electricityDuty + gst + tvFee), color: '#ef4444' },
    ],
    notes: [
      'Calculated as per NEPRA domestic tariff schedule for LESCO, IESCO, K-Electric, FESCO, MEPCO, GEPCO, etc.',
      'Protected status applies to consumers consuming under 200 units continuously for 6 months.',
    ],
  };
}

/**
 * Solar System Size, Generation, and ROI Payback Calculator
 * Calibrated for NEPRA Prosumer Regulations 2026 (Net Billing vs Grandfathered Net Metering)
 */
export function calculateSolarSystem(inputs: Record<string, any>): CalculatorOutput {
  const monthlyBill = safeNumber(inputs.monthlyBill, 45000);
  const monthlyUnits = safeNumber(inputs.monthlyUnits, 800);
  const panelWattage = safeNumber(inputs.panelWattage, 585); // 585W Tier 1 N-type TopCon panels
  const systemType = inputs.systemType || 'on-grid'; // on-grid, hybrid, off-grid
  const billingRegime = inputs.billingRegime || 'net-billing'; // 'net-billing' (New 2026 rules) vs 'grandfathered' (Pre-Feb 2026 1:1)

  // Sizing: In Pakistan, 1 kW of solar produces approx 115 units (kWh) per month (3.8-4.2 peak sun hours daily)
  const unitsPerKwMonth = 115;
  const targetUnits = monthlyUnits > 0 ? monthlyUnits : (monthlyBill / 48);
  const recommendedKw = Math.ceil((targetUnits / unitsPerKwMonth) * 10) / 10;

  // Number of panels
  const totalWatts = recommendedKw * 1000;
  const panelCount = Math.ceil(totalWatts / panelWattage);
  const actualKw = (panelCount * panelWattage) / 1000;
  const expectedMonthlyGeneration = actualKw * unitsPerKwMonth;

  // Capital Cost Estimation in Pakistan (~Rs 115k/kW on-grid, ~Rs 170k/kW hybrid with lithium backup)
  let costPerKw = 115000;
  if (systemType === 'hybrid') costPerKw = 170000;
  if (systemType === 'off-grid') costPerKw = 190000;

  // Licensing fee (~Rs 1,000/kW for new net billing prosumers)
  const licensingFee = billingRegime === 'net-billing' ? actualKw * 1000 : 0;
  const totalSystemCost = (actualKw * costPerKw) + licensingFee;

  // Savings modeling:
  // Retail grid tariff ~Rs. 48/unit
  // Net Billing buyback rate ~Rs. 10.00/unit (NEPRA Prosumer Regulations 2026)
  const retailTariff = 48;
  const exportBuybackRate = safeNumber(inputs.customBuybackRate, 10.20);

  let monthlySavings = 0;
  if (billingRegime === 'grandfathered' || systemType === 'off-grid') {
    // 1:1 retail offset
    monthlySavings = expectedMonthlyGeneration * retailTariff;
  } else {
    // 2026 Net Billing: ~55% daytime direct self-consumption (saving retail tariff Rs 48), ~45% exported surplus (sold at Rs 10.20)
    const selfConsumedUnits = expectedMonthlyGeneration * 0.55;
    const exportedUnits = expectedMonthlyGeneration * 0.45;
    monthlySavings = (selfConsumedUnits * retailTariff) + (exportedUnits * exportBuybackRate);
  }

  const annualSavings = monthlySavings * 12;
  const paybackYears = annualSavings > 0 ? totalSystemCost / annualSavings : 0;
  const twentyFiveYearReturn = (annualSavings * 25) - totalSystemCost;

  return {
    primaryResult: {
      id: 'systemSize',
      label: 'Recommended Solar System Size',
      value: `${actualKw.toFixed(2)} kW`,
      type: 'text',
      highlight: true,
      color: 'success',
      subtext: `${panelCount} Panels (${panelWattage}W TopCon N-Type)`,
    },
    secondaryResults: [
      { id: 'totalCost', label: 'Estimated Total Setup Cost', value: formatPKR(totalSystemCost), type: 'currency' },
      { id: 'monthlySavings', label: 'Monthly Electricity Savings', value: formatPKR(monthlySavings), type: 'currency', color: 'success' },
      { id: 'payback', label: 'ROI Payback Period', value: `${paybackYears.toFixed(1)} Years`, type: 'text' },
      { id: 'regime', label: 'Metering Framework', value: billingRegime === 'net-billing' ? '2026 Net Billing' : '1:1 Net Metering', type: 'badge' },
    ],
    breakdown: [
      { label: `Recommended Solar System Capacity`, amount: `${actualKw.toFixed(2)} kW (${systemType.toUpperCase()})` },
      { label: `Solar Panels Required (${panelWattage}W)`, amount: `${panelCount} Panels` },
      { label: 'Recommended Inverter Size', amount: `${Math.ceil(actualKw)} kW On-Grid Inverter` },
      { label: 'Expected Monthly Energy Generation', amount: `${Math.round(expectedMonthlyGeneration)} kWh (Units)` },
      { label: `Applicable Compensation Model`, detail: billingRegime === 'net-billing' ? `Net Billing (Rs ${exportBuybackRate}/unit export)` : '1:1 Grandfathered Net Metering', amount: billingRegime === 'net-billing' ? 'Net Billing' : '1:1 Offset' },
      { label: 'Annual Electricity Bill Savings', amount: formatPKR(annualSavings) },
      { label: 'Total Estimated System Cost (inc. Licensing)', amount: formatPKR(totalSystemCost) },
      { label: '25-Year Net Financial Benefit', amount: formatPKR(twentyFiveYearReturn), isTotal: true },
    ],
    notes: [
      billingRegime === 'net-billing'
        ? 'Under NEPRA Prosumer Regulations 2026, new applicants operate under Net Billing (surplus exported units sold to DISCO at buyback rate, while self-consumption saves full retail tariff).'
        : 'Grandfathered agreements signed prior to 9 Feb 2026 enjoy full 1:1 unit net metering exchange.',
      'Average solar generation in Pakistan is modeled at 115 units/kW/month (4.0 daily peak sun hours).',
    ],
  };
}

/**
 * Appliance Electricity Cost Calculator
 */
export function calculateApplianceCost(inputs: Record<string, any>): CalculatorOutput {
  const wattage = safeNumber(inputs.wattage, 1500); // 1.5 Ton Inverter AC ~ 1500W
  const hoursDaily = safeNumber(inputs.hoursDaily, 8);
  const daysMonthly = safeNumber(inputs.daysMonthly, 30);
  const unitRate = safeNumber(inputs.unitRate, 50); // Rs. 50 / unit average

  const dailyUnits = (wattage * hoursDaily) / 1000;
  const monthlyUnits = dailyUnits * daysMonthly;
  const monthlyCost = monthlyUnits * unitRate;
  const annualCost = monthlyCost * 12;

  return {
    primaryResult: {
      id: 'monthlyCost',
      label: 'Monthly Running Cost',
      value: formatPKR(monthlyCost),
      type: 'currency',
      highlight: true,
      color: 'warning',
      subtext: `${monthlyUnits.toFixed(1)} Units/month`,
    },
    secondaryResults: [
      { id: 'dailyCost', label: 'Daily Cost', value: formatPKR(monthlyCost / 30), type: 'currency' },
      { id: 'dailyUnits', label: 'Daily Consumption', value: `${dailyUnits.toFixed(2)} Units (kWh)`, type: 'text' },
      { id: 'annualCost', label: 'Annual Cost', value: formatPKR(annualCost), type: 'currency' },
    ],
    breakdown: [
      { label: 'Appliance Power Rating', amount: `${wattage} Watts` },
      { label: 'Daily Usage Duration', amount: `${hoursDaily} Hours / day` },
      { label: 'Monthly Power Consumption', amount: `${monthlyUnits.toFixed(1)} kWh (Units)` },
      { label: 'Electricity Tariff Rate', amount: `Rs. ${unitRate} / Unit` },
      { label: 'Monthly Electricity Cost', amount: formatPKR(monthlyCost), isTotal: true },
    ],
  };
}
