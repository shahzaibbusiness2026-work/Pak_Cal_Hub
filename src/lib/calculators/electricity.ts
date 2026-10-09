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
 * Billing order mirrors real DISCO bills (validated to the rupee against a
 * MEPCO Sep-2026 bill: 412 units unprotected, and a LESCO Apr-2026 bill):
 *  1. Base energy charges: unprotected consumers above 200 units are billed
 *     ALL units at the single marginal slab rate (no slab benefit) — verified:
 *     412 x Rs. 38.95 = Rs. 16,047.40 on the MEPCO bill. Protected, lifeline,
 *     and unprotected <= 200 units use telescopic slab rollup.
 *  2. Fixed charges = per-kW rate of the consumption tier x sanctioned load (Feb 2026 regime)
 *  3. FC surcharge (Rs 3.23/unit) + QTA (user-supplied, may be negative) + meter rent
 *  4. FPA block on fpaUnits (FPA is billed 2-3 months late on that month's units):
 *     FPA energy + 1.5% ED on FPA + 18% GST on (FPA energy + FPA ED) + other FPA charges
 *  5. Electricity Duty = 1.5% of (base energy charges + QTA) — verified on two real bills
 *  6. Main GST 18% on (energy + fixed + FC + QTA + meter + ED) — FPA excluded from
 *     the main base; FPA carries its own GST line (verified)
 *  7. TV fee (input, default Rs. 0 — being phased out); total rounded to whole rupees
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

  // Unprotected consumers above 200 units lose slab benefit: the entire consumption
  // is billed at the single marginal slab rate (NEPRA domestic tariff design).
  const useFlatMarginalRate = category === 'unprotected' && units > 200;

  let energyCost = 0;
  let marginalRate = 0;
  let slabBreakdownDetails: Array<{ slab: string; unitsInSlab: number; rate: number; cost: number }> = [];

  if (useFlatMarginalRate) {
    const slab = slabs.find((s) => units >= s.min && units <= s.max) || slabs[slabs.length - 1];
    marginalRate = slab.rate;
    energyCost = units * marginalRate;
    slabBreakdownDetails.push({
      slab: `Unprotected above 200 units: single slab rate (no slab benefit)`,
      unitsInSlab: units,
      rate: marginalRate,
      cost: energyCost,
    });
  } else {
    let remainingUnits = units;
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
  }

  // Fixed charges: per-kW of sanctioned load (post Feb-2026 regime); lifeline exempt
  const sanctionedLoadKw = Math.max(0, safeNumber(inputs.sanctionedLoadKw, 2));
  const fixedCharges = getFixedCharges(units, category, sanctionedLoadKw);

  // Surcharges and adjustments — user-supplied, because FPA/QTA vary monthly/quarterly per NEPRA.
  // QTA may be negative (downward quarterly adjustment) — do NOT clamp at zero.
  const fpaRate = Math.max(0, safeNumber(inputs.fpaRate, 0));
  // fpaUnits <= 0 means "same as current-month units" (the common case when FPA is current).
  const fpaUnitsRaw = Math.floor(safeNumber(inputs.fpaUnits, 0));
  const fpaUnits = fpaUnitsRaw > 0 ? fpaUnitsRaw : units;
  const fpaOther = Math.max(0, safeNumber(inputs.fpaOther, 0));
  const qtaRate = safeNumber(inputs.qtaRate, 0);
  const meterRent = Math.max(0, safeNumber(inputs.meterRent, ELECTRICITY_CONSTANTS.meterRentDefault));
  const tvFeeInput = Math.max(0, safeNumber(inputs.tvFee, 0));
  const fcSurcharge = units * ELECTRICITY_CONSTANTS.fcSurchargePerUnit;
  const fpaEnergy = fpaUnits * fpaRate;
  const qtaCharges = units * qtaRate;

  // Taxes
  let electricityDuty = 0;
  let edOnFpa = 0;
  let gst = 0;
  let gstOnFpa = 0;
  let tvFee = 0;

  if (includeTaxes) {
    // Verified on real bills: ED = 1.5% x (variable energy charges + QTA); FC surcharge excluded.
    electricityDuty = (energyCost + qtaCharges) * ELECTRICITY_CONSTANTS.electricityDutyPct;
    edOnFpa = fpaEnergy * ELECTRICITY_CONSTANTS.electricityDutyPct;
    tvFee = tvFeeInput;
    if (!isTaxExempt) {
      // Main GST base excludes FPA (FPA carries its own GST line) — verified on real bills.
      const gstBase = energyCost + fixedCharges + fcSurcharge + qtaCharges + meterRent + electricityDuty;
      gst = gstBase * ELECTRICITY_CONSTANTS.generalSalesTaxPct;
      gstOnFpa = (fpaEnergy + edOnFpa) * ELECTRICITY_CONSTANTS.generalSalesTaxPct;
    }
  }

  const totalFpa = fpaEnergy + edOnFpa + gstOnFpa + fpaOther;
  // Real DISCO bills round the two subtotals (current bill and total FPA) to whole
  // rupees before adding them — verified on the MEPCO Sep-2026 bill:
  // round(21,628.43) + round(3,090.71) = 21,628 + 3,091 = 24,719.
  const currentBillExFpa =
    energyCost + fixedCharges + fcSurcharge + qtaCharges + meterRent + electricityDuty + gst + tvFee;
  const totalBill = Math.round(currentBillExFpa) + Math.round(totalFpa);
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
    ...(qtaCharges !== 0 ? [{ label: `Quarterly Tariff Adjustment (QTA @ Rs. ${qtaRate.toFixed(2)}/unit)`, amount: formatPKR(qtaCharges) }] : []),
    ...(fpaEnergy > 0 || fpaOther > 0
      ? [
          { label: `Fuel Price Adjustment — energy (${fpaUnits} units @ Rs. ${fpaRate.toFixed(2)}/unit)`, amount: formatPKR(fpaEnergy) },
          ...(edOnFpa > 0 ? [{ label: 'Electricity Duty on FPA (1.5%)', amount: formatPKR(edOnFpa) }] : []),
          ...(gstOnFpa > 0 ? [{ label: 'GST on FPA (18%)', amount: formatPKR(gstOnFpa) }] : []),
          ...(fpaOther > 0 ? [{ label: 'Other FPA charges (e.g. income tax on FPA, as per bill)', amount: formatPKR(fpaOther) }] : []),
        ]
      : []),
    { label: 'Meter Rent', amount: formatPKR(meterRent) },
    { label: 'Electricity Duty (1.5% of energy + QTA)', amount: formatPKR(electricityDuty) },
    ...(gst > 0 ? [{ label: 'General Sales Tax (GST 18%)', amount: formatPKR(gst) }] : []),
    ...(tvFee > 0 ? [{ label: 'PTV License Fee', amount: formatPKR(tvFee) }] : []),
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
      { name: 'Surcharges (FC/QTA/FPA)', value: Math.round(fcSurcharge + qtaCharges + totalFpa), color: '#f59e0b' },
      { name: 'Govt Taxes & GST', value: Math.round(electricityDuty + gst + tvFee), color: '#ef4444' },
    ],
    notes: [
      'Calculated as per NEPRA uniform domestic Schedule of Tariff, Calendar Year 2026 (effective 1 Jan 2026) — applies to LESCO, IESCO, K-Electric, FESCO, MEPCO, GEPCO, etc.',
      'Unprotected consumers above 200 units are billed all units at the single marginal slab rate (no slab benefit) — this is why bills jump sharply past 200 units.',
      'Fixed charges are billed per kW of sanctioned load (Feb 2026 regime); check the sanctioned load printed on your bill. Lifeline consumers (≤ 100 units) pay no fixed charge.',
      'Protected status applies to consumers using under 200 units continuously for 6 months.',
      'FPA is billed 2–3 months late on that month\u2019s units — enter the FPA units and rate from your bill (0 = excluded). QTA can be negative.',
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

  // Itemised CAPEX — anchored so the lines sum exactly to costPerKw.
  const panelCostPerKw = 62000;
  const inverterCostPerKw = systemType === 'on-grid' ? 28000 : systemType === 'hybrid' ? 38000 : 30000;
  const batteryCostPerKw = systemType === 'hybrid' ? 45000 : systemType === 'off-grid' ? 73000 : 0;
  const structureCostPerKw = 8000;
  const wiringCostPerKw = 7000;
  const installCostPerKw = Math.max(costPerKw - panelCostPerKw - inverterCostPerKw - batteryCostPerKw - structureCostPerKw - wiringCostPerKw, 0);
  const panelUnitPrice = Math.round(panelCostPerKw * (panelWattage / 1000));
  const capexRows: { label: string; amount: number }[] = [
    { label: `Solar panels — ${panelCount} × ${panelWattage}W Tier-1 N-type @ Rs ${panelUnitPrice.toLocaleString('en-PK')}/panel`, amount: Math.round(panelCostPerKw * actualKw) },
    { label: systemType === 'on-grid' ? `On-grid inverter (${Math.ceil(actualKw)} kW class, net-billing ready)` : systemType === 'hybrid' ? `Hybrid inverter (${Math.ceil(actualKw)} kW class)` : `Off-grid inverter (${Math.ceil(actualKw)} kW class)`, amount: Math.round(inverterCostPerKw * actualKw) },
    ...(batteryCostPerKw > 0 ? [{ label: systemType === 'hybrid' ? 'Lithium battery backup (hybrid storage share)' : 'Battery bank (off-grid storage share)', amount: Math.round(batteryCostPerKw * actualKw) }] : []),
    { label: 'Galvanised mounting structure', amount: Math.round(structureCostPerKw * actualKw) },
    { label: 'DC/AC cabling, breakers & safety protection', amount: Math.round(wiringCostPerKw * actualKw) },
    { label: 'Installation, testing & commissioning labour', amount: Math.round(installCostPerKw * actualKw) },
    ...(licensingFee > 0 ? [{ label: 'Net-billing licence fee (@ Rs 1,000/kW)', amount: Math.round(licensingFee) }] : []),
  ];

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
      ...capexRows,
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
