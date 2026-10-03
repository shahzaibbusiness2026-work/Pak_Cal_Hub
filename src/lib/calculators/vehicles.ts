import { formatPKR, safeNumber } from '../utils/formatters';
import { CalculatorOutput } from '../../types/calculator';

/**
 * Fuel Cost, Trip Expense & Cost per Kilometer Calculator
 */
export function calculateFuelCost(inputs: Record<string, any>): CalculatorOutput {
  const distanceKm = safeNumber(inputs.distanceKm, 380); // e.g. Lahore to Islamabad
  const fuelAverageKmPerLiter = safeNumber(inputs.fuelAverageKmPerLiter, 14.5); // 14.5 km/L
  // Petroleum Division / OGRA notified RON-92 Motor Spirit price (3 Oct 2026 notification): Rs. 392.76/L
  // Source of truth: src/lib/sync/fuel.ts LATEST_FEED_FUEL (manually verified 2026-10-04)
  const fuelPricePerLiter = safeNumber(inputs.fuelPricePerLiter, 392.76);
  const roundTrip = inputs.roundTrip === true;

  const effectiveDistance = roundTrip ? distanceKm * 2 : distanceKm;
  const litersConsumed = fuelAverageKmPerLiter > 0 ? effectiveDistance / fuelAverageKmPerLiter : 0;
  const totalFuelCost = litersConsumed * fuelPricePerLiter;
  const costPerKm = effectiveDistance > 0 ? totalFuelCost / effectiveDistance : 0;

  return {
    primaryResult: {
      id: 'totalFuelCost',
      label: 'Estimated Fuel Cost',
      value: formatPKR(totalFuelCost),
      type: 'currency',
      highlight: true,
      color: 'success',
      subtext: `Rs. ${costPerKm.toFixed(2)} / km | ${litersConsumed.toFixed(2)} Litres`,
    },
    secondaryResults: [
      { id: 'liters', label: 'Fuel Required', value: `${litersConsumed.toFixed(2)} Litres`, type: 'text' },
      { id: 'costPerKm', label: 'Running Cost per KM', value: formatPKR(costPerKm), type: 'currency' },
      { id: 'distance', label: 'Total Distance', value: `${effectiveDistance} km`, type: 'text' },
    ],
    breakdown: [
      { label: `Journey Distance (${roundTrip ? 'Round Trip' : 'One Way'})`, amount: `${effectiveDistance} km` },
      { label: 'Vehicle Fuel Average', amount: `${fuelAverageKmPerLiter} km / Litre` },
      { label: 'Fuel Rate (Petrol RON-92, OGRA)', amount: `Rs. ${fuelPricePerLiter.toFixed(2)} / Litre` },
      { label: 'Fuel Required for Journey', amount: `${litersConsumed.toFixed(2)} Litres` },
      { label: 'Total Estimated Fuel Expense', amount: formatPKR(totalFuelCost), isTotal: true },
    ],
    notes: [
      "Default price: Rs. 392.76/L for RON-92 Motor Spirit per the Petroleum Division / OGRA notification of 3 October 2026 (see src/lib/sync/fuel.ts). Enter today's pump price for the most accurate estimate.",
    ],
  };
}

/**
 * Provincial Vehicle Token Tax & FBR Section 231B Withholding Tax Calculator
 * Punjab / ICT price-based schedules (Finance Bill / Finance Act 2026), Sindh / KP / Balochistan fixed slabs.
 * VERIFY: provincial schedules change with each budget — confirm against the Excise & Taxation schedule before paying.
 */
export function calculateTokenTax(inputs: Record<string, any>): CalculatorOutput {
  const engineCapacityCc = safeNumber(inputs.engineCapacityCc, 1300); // 1300cc
  const isFiler = inputs.isFiler !== false;
  const province = inputs.province || 'punjab';
  const invoiceValue = Math.max(0, safeNumber(inputs.invoiceValue, 4000000)); // invoice / market value for price-based schedules & 231B

  // 1. Provincial Token Tax (FY 2026-27)
  let annualTokenTax = 0;
  let tokenTaxLabel = '';

  if (province === 'punjab') {
    // Punjab Finance Bill 2026: up to 1000cc Rs. 20,000 lifetime; 1001-2000cc 0.3%/yr; above 2000cc 0.4%/yr of invoice value
    if (engineCapacityCc <= 1000) {
      annualTokenTax = 20000;
      tokenTaxLabel = 'Punjab Lifetime Token Tax (up to 1000cc — one-time, not annual)';
    } else if (engineCapacityCc <= 2000) {
      annualTokenTax = Math.round(invoiceValue * 0.003);
      tokenTaxLabel = 'Punjab Annual Token Tax (0.30% of invoice value — 1001 to 2000cc)';
    } else {
      annualTokenTax = Math.round(invoiceValue * 0.004);
      tokenTaxLabel = 'Punjab Annual Token Tax (0.40% of invoice value — above 2000cc)';
    }
  } else if (province === 'ict') {
    // Islamabad Capital Territory (Finance Act 2026, from 1 July 2026): up to 1000cc Rs. 20,000; 1001-2000cc 0.25%/yr; above 2000cc 0.35%/yr
    if (engineCapacityCc <= 1000) {
      annualTokenTax = 20000;
      tokenTaxLabel = 'ICT Token Tax (up to 1000cc — one-time Rs. 20,000)';
    } else if (engineCapacityCc <= 2000) {
      annualTokenTax = Math.round(invoiceValue * 0.0025);
      tokenTaxLabel = 'ICT Annual Token Tax (0.25% of invoice value — 1001 to 2000cc)';
    } else {
      annualTokenTax = Math.round(invoiceValue * 0.0035);
      tokenTaxLabel = 'ICT Annual Token Tax (0.35% of invoice value — above 2000cc)';
    }
  } else if (province === 'sindh') {
    // VERIFY against Sindh Excise schedule: fixed slabs corroborated within 1,500 / 2,000–4,500 / 5,000–7,000 bands
    if (engineCapacityCc <= 1000) annualTokenTax = 1500;
    else if (engineCapacityCc <= 1300) annualTokenTax = 2000;
    else if (engineCapacityCc <= 1600) annualTokenTax = 3000;
    else if (engineCapacityCc <= 2000) annualTokenTax = 4500;
    else if (engineCapacityCc <= 2500) annualTokenTax = 5000;
    else annualTokenTax = 7000;
    tokenTaxLabel = 'Sindh Annual Token Tax (fixed engine-size slab — verify locally)';
  } else if (province === 'kpk') {
    // KP Schedule (Finance Act 2025; Finance Act 2026 made no change): flat yearly amounts
    if (engineCapacityCc <= 1000) annualTokenTax = 2000;
    else if (engineCapacityCc <= 1300) annualTokenTax = 3000;
    else if (engineCapacityCc <= 1500) annualTokenTax = 4000;
    else if (engineCapacityCc <= 2500) annualTokenTax = 5000;
    else annualTokenTax = 8000;
    tokenTaxLabel = 'KPK Annual Token Tax (fixed engine-size slab)';
  } else {
    // Balochistan: VERIFY — publicly available ranges are Rs. 1,000–1,100/yr (up to 1000cc), Rs. 1,400–1,700/yr (1001–2000cc), Rs. 2,000/yr (above 2000cc)
    if (engineCapacityCc <= 1000) annualTokenTax = 1100;
    else if (engineCapacityCc <= 1600) annualTokenTax = 1550;
    else if (engineCapacityCc <= 2000) annualTokenTax = 1700;
    else annualTokenTax = 2000;
    tokenTaxLabel = 'Balochistan Annual Token Tax (fixed engine-size slab — verify locally)';
  }

  // 2. FBR Section 231B Withholding Tax — % of vehicle VALUE by engine band (one-time, adjustable under s.168).
  // Rates corroborated from FBR's 231B exemption-order schedule (TY2027): 0.5/1/1.5/2/3/5/7/9/12%.
  const wht231BBands: Array<[number, number]> = [
    [850, 0.005],
    [1000, 0.01],
    [1300, 0.015],
    [1600, 0.02],
    [1800, 0.03],
    [2000, 0.05],
    [2500, 0.07],
    [3000, 0.09],
    [Infinity, 0.12],
  ];
  let whtRate = 0.12;
  for (const [bandMax, rate] of wht231BBands) {
    if (engineCapacityCc <= bandMax) {
      whtRate = rate;
      break;
    }
  }
  // VERIFY: s.231B(1A) non-ATL treatment — 4% flat reported in FBR orders; confirm on the challan.
  const effectiveWhtRate = isFiler ? whtRate : 0.04;
  const advanceTax231B = Math.round(invoiceValue * effectiveWhtRate);

  const totalPayable = annualTokenTax + advanceTax231B;

  const provinceName = { punjab: 'Punjab', ict: 'Islamabad (ICT)', sindh: 'Sindh', kpk: 'Khyber Pakhtunkhwa', balochistan: 'Balochistan' }[province as string] || 'Punjab';

  return {
    primaryResult: {
      id: 'totalTokenTax',
      label: 'Token Tax + FBR 231B Advance Tax',
      value: formatPKR(totalPayable),
      type: 'currency',
      highlight: true,
      color: 'warning',
      subtext: `${engineCapacityCc}cc ${provinceName} (${isFiler ? 'Active Filer' : 'Non-Filer'})`,
    },
    secondaryResults: [
      { id: 'tokenTax', label: 'Provincial Motor Vehicle Tax', value: formatPKR(annualTokenTax), type: 'currency' },
      { id: 'fbrAdvanceTax', label: `FBR Section 231B WHT (${(effectiveWhtRate * 100).toFixed(2)}% of value)`, value: formatPKR(advanceTax231B), type: 'currency' },
      { id: 'status', label: 'Taxpayer Status', value: isFiler ? 'Filer' : 'Non-Filer', type: 'badge' },
    ],
    breakdown: [
      { label: `Engine Capacity (${engineCapacityCc} CC)`, amount: `${engineCapacityCc} cc` },
      { label: `Vehicle Invoice / Market Value`, amount: formatPKR(invoiceValue) },
      { label: tokenTaxLabel, amount: formatPKR(annualTokenTax) },
      { label: `FBR Section 231B Withholding Tax (${(effectiveWhtRate * 100).toFixed(2)}% of Rs. ${invoiceValue.toLocaleString()} — one-time at registration, adjustable)`, amount: formatPKR(advanceTax231B) },
      { label: 'Total Excise Challan Payable', amount: formatPKR(totalPayable), isTotal: true },
    ],
    notes: [
      'Provincial token tax is paid to the Excise & Taxation Department (e.g., Punjab rates from the Punjab Finance Bill 2026; ICT rates from Finance Act 2026 effective 1 July 2026). Punjab offers a 10% rebate if the full year is paid by 31 August — verify the current-year window.',
      'Section 231B withholding tax is collected once at vehicle registration / purchase of a new vehicle and is adjustable against final income tax liability under Section 168 — it is not a recurring annual tax.',
      'Provincial schedules change with each budget — verify your exact amount on e-Pay Punjab / the ICT PAK App / your provincial excise portal before paying.',
    ],
  };
}
