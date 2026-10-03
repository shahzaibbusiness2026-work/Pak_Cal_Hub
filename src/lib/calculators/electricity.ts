import {
  PROTECTED_SLABS,
  UNPROTECTED_SLABS,
  LIFELINE_SLABS,
  ELECTRICITY_CONSTANTS,
  getFixedCharges,
  DomesticConsumerCategory,
} from '../data/electricity-data';
// Re-exported so the deprecated src/lib/calculations/electricityEngine.ts can delegate to this canonical module.
export { PROTECTED_SLABS, UNPROTECTED_SLABS, LIFELINE_SLABS };
import { formatPKR, formatPercent, safeNumber, formatNumber } from '../utils/formatters';
import { CalculatorOutput, BreakdownRow } from '../../types/calculator';

/**
 * Calculates Pakistan Electricity Bill (LESCO, IESCO, K-Electric, MEPCO, etc.)
 *
 * Billing order mirrors real DISCO bills:
 *  1. Base energy charges with slab benefit (each unit block billed at its own slab rate)
 *  2. Fixed charges = per-kW rate of the consumption tier × sanctioned load (Feb 2026 regime)
 *  3. FC surcharge (Rs 3.23/unit) + FPA + QTA (user-supplied, vary per NEPRA notification) + meter rent
 *  4. Electricity Duty = 1.5% of base energy charges only, plus 1.5% on the FPA amount
 *  5. GST 18% on (energy + fixed + FC + FPA + QTA + meter + ED) — matches the real bill's
 *     two-line presentation (main GST + 18% GST on FPA)
 *  6. PTV fee Rs 35; total rounded to whole rupees
 */
export function calculateElectricityBill(inputs: Record<string, any>): CalculatorOutput {
  const units = Math.max(0, Math.floor(safeNumber(inputs.units, 280)));
  const requestedType = inputs.consumerType || 'unprotected';
  // Lifeline status only holds up to 100 units; protected only up to 200 units.
  const isLifeline = requestedType === 'lifeline' && units <= 100;
  const isProtected = !isLifeline && requestedType === 'protected' && units <= 200;
  const category: DomesticConsumerCategory = isLifeline ? 'lifeline' : isProtected ? 'protected' : 'unprotected';
  const includeTaxes = inputs.includeTaxes !== false;
  const isTaxExempt = inputs.isTaxExempt === true;

  const slabs = isLifeline ? LIFELINE_SLABS : isProtected ? PROTECTED_SLABS : UNPROTECTED_SLABS;

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

  // Fixed charges: per-kW of sanctioned load (post Feb-2026 regime); lifeline exempt
  const sanctionedLoadKw = Math.max(0, safeNumber(inputs.sanctionedLoadKw, 2));
  const fixedCharges = getFixedCharges(units, category, sanctionedLoadKw);

  // Surcharges and adjustments — user-supplied, because FPA/QTA vary monthly/quarterly per NEPRA
  const fpaRate = Math.max(0, safeNumber(inputs.fpaRate, 0));
  const qtaRate = Math.max(0, safeNumber(inputs.qtaRate, 0));
  const meterRent = Math.max(0, safeNumber(inputs.meterRent, ELECTRICITY_CONSTANTS.meterRentDefault));
  const fcSurcharge = units * ELECTRICITY_CONSTANTS.fcSurchargePerUnit;
  const fpaCharges = units * fpaRate;
  const qtaCharges = units * qtaRate;

  // Taxes
  let electricityDuty = 0;
  let edOnFpa = 0;
  let gst = 0;
  let tvFee = 0;

  if (includeTaxes) {
    electricityDuty = energyCost * ELECTRICITY_CONSTANTS.electricityDutyPct;
    edOnFpa = fpaCharges * ELECTRICITY_CONSTANTS.electricityDutyPct;
    tvFee = ELECTRICITY_CONSTANTS.tvFee;
    if (!isTaxExempt) {
      const gstBase =
        energyCost + fixedCharges + fcSurcharge + fpaCharges + qtaCharges + meterRent + electricityDuty + edOnFpa;
      gst = gstBase * ELECTRICITY_CONSTANTS.generalSalesTaxPct;
    }
  }

  const totalBill = Math.round(
    energyCost + fixedCharges + fcSurcharge + fpaCharges + qtaCharges + meterRent + electricityDuty + edOnFpa + gst + tvFee
  );
  const effectiveCostPerUnit = units > 0 ? totalBill / units : 0;
  const categoryLabel = isLifeline ? 'Lifeline' : isProtected ? 'Protected' : 'Unprotected';

  const breakdown: BreakdownRow[] = [
    ...slabBreakdownDetails.map((d) => ({
      label: `Energy: ${d.unitsInSlab} units @ Rs. ${d.rate.toFixed(2)} (${d.slab})`,
      amount: formatPKR(d.cost),
    })),
    { label: `Base Energy Charges (${units} Units consumed)`, amount: formatPKR(energyCost) },
    ...(fixedCharges > 0
      ? [{ label: `Fixed Charges (${sanctionedLoadKw} kW sanctioned load)`, amount: formatPKR(fixedCharges) }]
      : []),
    { label: 'Financing Cost (FC) Surcharge @ Rs. 3.23/unit', amount: formatPKR(fcSurcharge) },
    ...(fpaCharges > 0 ? [{ label: `Fuel Price Adjustment (FPA @ Rs. ${fpaRate.toFixed(2)}/unit)`, amount: formatPKR(fpaCharges) }] : []),
    ...(qtaCharges > 0 ? [{ label: `Quarterly Tariff Adjustment (QTA @ Rs. ${qtaRate.toFixed(2)}/unit)`, amount: formatPKR(qtaCharges) }] : []),
    { label: 'Meter Rent', amount: formatPKR(meterRent) },
    { label: 'Electricity Duty (1.5% of base energy)', amount: formatPKR(electricityDuty) },
    ...(edOnFpa > 0 ? [{ label: 'Electricity Duty on FPA (1.5%)', amount: formatPKR(edOnFpa) }] : []),
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
      { id: 'consumerCategory', label: 'Category', value: categoryLabel, type: 'badge' },
    ],
    breakdown,
    chartType: 'pie',
    chartData: [
      { name: 'Base Energy', value: Math.round(energyCost), color: '#3b82f6' },
      { name: 'Surcharges (FC/QTA/FPA)', value: Math.round(fcSurcharge + fpaCharges + qtaCharges), color: '#f59e0b' },
      { name: 'Govt Taxes & GST', value: Math.round(electricityDuty + edOnFpa + gst + tvFee), color: '#ef4444' },
    ],
    notes: [
      'Calculated as per NEPRA uniform domestic Schedule of Tariff, Calendar Year 2026 (effective 1 Jan 2026) — applies to LESCO, IESCO, K-Electric, FESCO, MEPCO, GEPCO, etc.',
      'Fixed charges are billed per kW of sanctioned load (Feb 2026 regime); check the sanctioned load printed on your bill. Lifeline consumers (≤ 100 units) pay no fixed charge.',
      'Protected status applies to consumers using under 200 units continuously for 6 months.',
      'FPA and QTA change monthly/quarterly per NEPRA notifications — enter the latest values from your bill (0 = excluded).',
    ],
  };
}

/**
 * Solar System Size, Generation, and ROI Payback Calculator
 * Calibrated for NEPRA Prosumer Regulations 2026 (Net Billing vs Grandfathered Net Metering)
 */
export function calculateSolarSystem(inputs: Record<string, any>): CalculatorOutput {
  const monthlyBill = safeNumber(inputs.monthlyBill, 45000);
  // Default 0 = auto-estimate monthly units from the bill (monthlyBill / Rs 48 average unit rate).
  const monthlyUnits = safeNumber(inputs.monthlyUnits, 0);
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
  // Net Billing buyback rate Rs. 10.20/unit (NEPRA Prosumer Regulations 2026)
  const retailTariff = 48;
  const exportBuybackRate = safeNumber(inputs.customBuybackRate, 10.20);
  // Share of generation consumed directly during daytime (rest is exported at the buyback rate)
  const selfConsumptionShare = Math.min(Math.max(safeNumber(inputs.selfConsumptionPct, 55), 0), 100) / 100;

  let monthlySavings = 0;
  if (billingRegime === 'grandfathered' || systemType === 'off-grid') {
    // 1:1 retail offset
    monthlySavings = expectedMonthlyGeneration * retailTariff;
  } else {
    // 2026 Net Billing: daytime direct self-consumption saves the retail tariff (Rs 48),
    // exported surplus is sold at Rs 10.20/unit
    const selfConsumedUnits = expectedMonthlyGeneration * selfConsumptionShare;
    const exportedUnits = expectedMonthlyGeneration * (1 - selfConsumptionShare);
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
