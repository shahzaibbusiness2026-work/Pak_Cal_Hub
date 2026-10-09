import { CalculatorOutput } from '../../types/calculator';

/* ------------------------------------------------------------------ */
/* Age Calculator — exact age, totals, next birthday                    */
/* ------------------------------------------------------------------ */

function parseDate(value: any): Date | null {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function calculateAgeExact(inputs: Record<string, any>): CalculatorOutput {
  const dob = parseDate(inputs.dob);
  const asOf = parseDate(inputs.asOf) || new Date();
  if (!dob || dob > asOf) {
    return {
      primaryResult: { id: 'age', label: 'Exact Age', value: 'Check dates', type: 'text', highlight: true, color: 'warning', subtext: 'Date of birth must be before the "as of" date.' },
      breakdown: [{ label: 'What happened', amount: 'Date of birth is missing or after the as-of date', isTotal: true }],
      notes: ['Only the dates you enter are used — nothing is stored.'],
    };
  }

  let years = asOf.getFullYear() - dob.getFullYear();
  let anchor = new Date(dob);
  anchor.setFullYear(dob.getFullYear() + years);
  if (anchor > asOf) {
    years -= 1;
    anchor = new Date(dob);
    anchor.setFullYear(dob.getFullYear() + years);
  }
  let months = 0;
  while (addMonths(anchor, months + 1) <= asOf) months += 1;
  const monthAnchor = addMonths(anchor, months);
  const days = Math.round((asOf.getTime() - monthAnchor.getTime()) / 86400000);

  const totalDays = Math.floor((asOf.getTime() - dob.getTime()) / 86400000);
  const totalMonths = years * 12 + months;

  const nextBirthday = new Date(dob);
  nextBirthday.setFullYear(asOf.getFullYear());
  if (nextBirthday < asOf) nextBirthday.setFullYear(asOf.getFullYear() + 1);
  const daysToBirthday = Math.round((nextBirthday.getTime() - asOf.getTime()) / 86400000);
  const weekday = dob.toLocaleDateString('en-GB', { weekday: 'long' });

  return {
    primaryResult: {
      id: 'age',
      label: 'Exact Age',
      value: `${years} years, ${months} months, ${days} days`,
      type: 'text',
      highlight: true,
      subtext: daysToBirthday === 0 ? 'Birthday is today — congratulations!' : `Next birthday in ${daysToBirthday} day${daysToBirthday === 1 ? '' : 's'} (turning ${years + 1}).`,
    },
    secondaryResults: [
      { id: 'totalDays', label: 'Total days lived', value: totalDays.toLocaleString('en-PK'), type: 'text' },
      { id: 'totalMonths', label: 'Total months', value: totalMonths.toLocaleString('en-PK'), type: 'text' },
      { id: 'bornWeekday', label: 'Born on a', value: weekday, type: 'text' },
      { id: 'totalWeeks', label: 'Total weeks', value: Math.floor(totalDays / 7).toLocaleString('en-PK'), type: 'text' },
    ],
    breakdown: [
      { label: 'Date of birth', amount: dob.toLocaleDateString('en-GB') },
      { label: 'Age as of', amount: asOf.toLocaleDateString('en-GB') },
      { label: 'Years completed', amount: String(years) },
      { label: 'Extra months', amount: String(months) },
      { label: 'Extra days', amount: String(days) },
      { label: 'Days until next birthday', amount: String(daysToBirthday), isTotal: true },
    ],
    notes: [
      'Age is counted the official way: completed years, then completed months, then remaining days — the same method NADRA, FPSC and boards use.',
      'For CSS and government jobs, eligibility is usually judged on a fixed cut-off date — set "as of" to that date (for CSS: 31 December before the exam year) or use the dedicated CSS Age Eligibility tool.',
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Percentage Calculator — percent of, what-percent, marks, change    */
/* ------------------------------------------------------------------ */

function gradeBand(pct: number): string {
  if (pct >= 80) return 'A-One (indicative board band)';
  if (pct >= 70) return 'A';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  if (pct >= 40) return 'D';
  if (pct >= 33) return 'E — pass';
  return 'Below the usual 33% pass line';
}

export function calculatePercentage(inputs: Record<string, any>): CalculatorOutput {
  const mode = inputs.mode || 'percent-of';
  const x = Number(inputs.valueX) || 0;
  const y = Number(inputs.valueY) || 0;

  if (mode === 'marks') {
    const obtained = Number(inputs.obtained) || 0;
    const total = Number(inputs.totalMarks) || 0;
    if (total <= 0) {
      return { primaryResult: { id: 'pct', label: 'Percentage', value: 'Enter total marks', type: 'text', highlight: true, color: 'warning' }, breakdown: [{ label: 'Total marks', amount: 'Must be above zero', isTotal: true }], notes: [] };
    }
    const pct = (obtained / total) * 100;
    return {
      primaryResult: { id: 'pct', label: 'Your Percentage', value: `${pct.toFixed(2)}%`, type: 'text', highlight: true, subtext: gradeBand(pct) },
      secondaryResults: [
        { id: 'fraction', label: 'Marks', value: `${obtained} / ${total}`, type: 'text' },
        { id: 'lost', label: 'Marks lost', value: String(Math.max(total - obtained, 0)), type: 'text' },
      ],
      breakdown: [
        { label: 'Obtained marks', amount: String(obtained) },
        { label: 'Total marks', amount: String(total) },
        { label: 'Percentage', amount: `${pct.toFixed(4)}%`, isTotal: true },
      ],
      notes: ['Grade bands are the common BISE-style bands (80+ A-One, 70+ A, 60+ B, 50+ C, 40+ D, 33+ pass) and are indicative — your board/university may band differently. Divisions on older board results: 60%+ First, 45%+ Second, 33%+ Third.'],
    };
  }

  if (mode === 'what-percent') {
    if (y === 0) return { primaryResult: { id: 'pct', label: 'Percentage', value: 'Cannot divide by zero', type: 'text', highlight: true, color: 'warning' }, breakdown: [], notes: [] };
    const pct = (x / y) * 100;
    return {
      primaryResult: { id: 'pct', label: `${x} is what percent of ${y}?`, value: `${pct.toFixed(2)}%`, type: 'text', highlight: true },
      breakdown: [
        { label: 'Part', amount: String(x) },
        { label: 'Whole', amount: String(y) },
        { label: 'Percentage', amount: `${pct.toFixed(4)}%`, isTotal: true },
      ],
      notes: ['Formula: (part ÷ whole) × 100.'],
    };
  }

  if (mode === 'change') {
    if (x === 0) return { primaryResult: { id: 'pct', label: 'Percentage Change', value: 'Old value cannot be zero', type: 'text', highlight: true, color: 'warning' }, breakdown: [], notes: [] };
    const change = ((y - x) / Math.abs(x)) * 100;
    const rising = change >= 0;
    return {
      primaryResult: { id: 'pct', label: 'Percentage Change', value: `${rising ? '+' : ''}${change.toFixed(2)}%`, type: 'text', highlight: true, subtext: rising ? 'Increase' : 'Decrease' },
      breakdown: [
        { label: 'Old value', amount: String(x) },
        { label: 'New value', amount: String(y) },
        { label: 'Difference', amount: String(y - x) },
        { label: 'Change', amount: `${change.toFixed(4)}%`, isTotal: true },
      ],
      notes: ['Formula: ((new − old) ÷ old) × 100. Useful for price changes, salary increases and bill comparisons.'],
    };
  }

  // percent-of (default)
  const result = (x / 100) * y;
  return {
    primaryResult: { id: 'pct', label: `${x}% of ${y}`, value: result.toLocaleString('en-PK', { maximumFractionDigits: 2 }), type: 'text', highlight: true },
    secondaryResults: [
      { id: 'remaining', label: 'Remaining after taking it', value: (y - result).toLocaleString('en-PK', { maximumFractionDigits: 2 }), type: 'text' },
    ],
    breakdown: [
      { label: 'Percent', amount: `${x}%` },
      { label: 'Of value', amount: String(y) },
      { label: 'Result', amount: result.toLocaleString('en-PK', { maximumFractionDigits: 4 }), isTotal: true },
    ],
    notes: ['Formula: (percent ÷ 100) × value.'],
  };
}

/* ------------------------------------------------------------------ */
/* Hijri ↔ Gregorian converter — tabular (civil) Islamic calendar     */
/* ------------------------------------------------------------------ */

const ISLAMIC_EPOCH_JDN = 1948440; // 16 July 622 CE (Julian), civil epoch
const HIJRI_MONTHS = ['Muharram', 'Safar', 'Rabiʿ al-Awwal', 'Rabiʿ al-Thani', 'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaʿban', 'Ramadan', 'Shawwal', 'Dhul-Qaʿdah', 'Dhul-Hijjah'];

function gregToJdn(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const y2 = y + 4800 - a;
  const m2 = m + 12 * a - 3;
  return d + Math.floor((153 * m2 + 2) / 5) + 365 * y2 + Math.floor(y2 / 4) - Math.floor(y2 / 100) + Math.floor(y2 / 400) - 32045;
}

function jdnToGreg(jdn: number): { y: number; m: number; d: number } {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const dd = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * dd) / 4);
  const mm = Math.floor((5 * e + 2) / 153);
  return {
    d: e - Math.floor((153 * mm + 2) / 5) + 1,
    m: mm + 3 - 12 * Math.floor(mm / 10),
    y: 100 * b + dd - 4800 + Math.floor(mm / 10),
  };
}

function islamicToJdn(y: number, m: number, d: number): number {
  return d + Math.ceil(29.5 * (m - 1)) + (y - 1) * 354 + Math.floor((3 + 11 * y) / 30) + ISLAMIC_EPOCH_JDN - 1;
}

function jdnToIslamic(jdn: number): { y: number; m: number; d: number } {
  const days = jdn - ISLAMIC_EPOCH_JDN;
  const y = Math.floor((30 * days + 10646) / 10631);
  const m = Math.min(12, Math.ceil((jdn - (29 + islamicToJdn(y, 1, 1))) / 29.5) + 1);
  const d = jdn - islamicToJdn(y, m, 1) + 1;
  return { y, m, d };
}

function hijriString(y: number, m: number, d: number): string {
  return `${d} ${HIJRI_MONTHS[m - 1]} ${y} AH`;
}

export function calculateHijriConverter(inputs: Record<string, any>): CalculatorOutput {
  const direction = inputs.direction || 'greg-to-hijri';
  const todayJdn = gregToJdn(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());
  const todayHijri = jdnToIslamic(todayJdn);

  if (direction === 'hijri-to-greg') {
    const hy = Math.round(Number(inputs.hijriYear) || 0);
    const hm = Math.round(Number(inputs.hijriMonth) || 0);
    const hd = Math.round(Number(inputs.hijriDay) || 0);
    if (hy < 1 || hm < 1 || hm > 12 || hd < 1 || hd > 30) {
      return {
        primaryResult: { id: 'greg', label: 'Gregorian Date', value: 'Enter a valid Hijri date', type: 'text', highlight: true, color: 'warning' },
        breakdown: [{ label: 'Valid range', amount: 'Year ≥ 1 AH, month 1–12, day 1–30', isTotal: true }],
        notes: [],
      };
    }
    const g = jdnToGreg(islamicToJdn(hy, hm, hd));
    const gStr = `${g.d}/${g.m}/${g.y}`;
    return {
      primaryResult: { id: 'greg', label: `${hijriString(hy, hm, hd)} in Gregorian`, value: gStr, type: 'text', highlight: true, subtext: 'Tabular (calculated) Islamic calendar.' },
      secondaryResults: [{ id: 'todayHijri', label: 'Today in Hijri', value: hijriString(todayHijri.y, todayHijri.m, todayHijri.d), type: 'text' }],
      breakdown: [
        { label: 'Hijri date entered', amount: hijriString(hy, hm, hd) },
        { label: 'Gregorian equivalent', amount: gStr, isTotal: true },
      ],
      notes: ['Conversions use the tabular (civil) Islamic calendar. Pakistan\'s official Hijri dates are announced by the Ruet-e-Hilal Committee on moon sighting and can differ by one day — especially for Ramadan and Eid.'],
    };
  }

  const date = parseDate(inputs.gregDate);
  if (!date) {
    return {
      primaryResult: { id: 'hijri', label: 'Hijri Date', value: 'Pick a date', type: 'text', highlight: true, color: 'warning' },
      breakdown: [],
      notes: [],
    };
  }
  const h = jdnToIslamic(gregToJdn(date.getFullYear(), date.getMonth() + 1, date.getDate()));
  return {
    primaryResult: {
      id: 'hijri',
      label: 'Hijri Date',
      value: hijriString(h.y, h.m, h.d),
      type: 'text',
      highlight: true,
      subtext: `${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} in the tabular Islamic calendar.`,
    },
    secondaryResults: [
      { id: 'todayHijri', label: 'Today in Hijri', value: hijriString(todayHijri.y, todayHijri.m, todayHijri.d), type: 'text' },
      { id: 'hijriYear', label: 'Hijri year', value: `${h.y} AH`, type: 'text' },
    ],
    breakdown: [
      { label: 'Gregorian date', amount: date.toLocaleDateString('en-GB') },
      { label: 'Hijri day', amount: String(h.d) },
      { label: 'Hijri month', amount: HIJRI_MONTHS[h.m - 1] },
      { label: 'Hijri year', amount: `${h.y} AH`, isTotal: true },
    ],
    notes: ['Conversions use the tabular (civil) Islamic calendar. Pakistan\'s official Hijri dates are announced by the Ruet-e-Hilal Committee on moon sighting and can differ by one day — especially for Ramadan, Eid-ul-Fitr and Eid-ul-Adha.'],
  };
}

/* ------------------------------------------------------------------ */
/* Tenant Electricity Bill Splitter — sub-meter sharing                */
/* ------------------------------------------------------------------ */

export function calculateTenantBillSplitter(inputs: Record<string, any>): CalculatorOutput {
  const totalBill = Math.max(Number(inputs.totalBill) || 0, 0);
  const totalUnits = Math.max(Number(inputs.totalUnits) || 0, 0);
  const tenants = Math.min(Math.max(Math.round(Number(inputs.tenantsCount) || 2), 1), 6);
  const readings: number[] = [];
  for (let i = 1; i <= 6; i += 1) readings.push(Math.max(Number(inputs[`tenant${i}Units`]) || 0, 0));
  const usedReadings = readings.slice(0, tenants);
  const meteredUnits = usedReadings.reduce((s, n) => s + n, 0);

  if (totalBill <= 0 || totalUnits <= 0) {
    return {
      primaryResult: { id: 'share', label: 'Bill Split', value: 'Enter the bill first', type: 'text', highlight: true, color: 'warning' },
      breakdown: [{ label: 'Needed', amount: 'Total bill amount (Rs) and total units from the main meter', isTotal: true }],
      notes: [],
    };
  }

  const ratePerUnit = totalBill / totalUnits;
  const sharedUnits = totalUnits - meteredUnits;

  if (sharedUnits < 0) {
    return {
      primaryResult: {
        id: 'share',
        label: 'Readings Exceed the Main Meter',
        value: `${meteredUnits.toLocaleString('en-PK')} vs ${totalUnits.toLocaleString('en-PK')} units`,
        type: 'text',
        highlight: true,
        color: 'warning',
        subtext: 'Sub-meter readings add up to more than the main meter — re-check the readings before splitting.',
      },
      breakdown: [
        { label: 'Main meter units', amount: totalUnits },
        { label: 'Sub-meters total', amount: meteredUnits },
        { label: 'Difference', amount: meteredUnits - totalUnits, isTotal: true },
      ],
      notes: ['A small excess can come from reading dates not matching the billing cycle. Large excesses usually mean a misread digit.'],
    };
  }

  const sharedPerTenant = tenants > 0 ? sharedUnits / tenants : 0;
  const rows: { label: string; amount: number }[] = [
    { label: 'Total bill (main meter)', amount: Math.round(totalBill) },
    { label: 'Total units (main meter)', amount: totalUnits },
    { label: 'Average cost per unit', amount: Math.round(ratePerUnit * 100) / 100 },
    { label: 'Common/shared units (split equally)', amount: Math.round(sharedUnits * 10) / 10 },
  ];
  usedReadings.forEach((units, i) => {
    const share = (units + sharedPerTenant) * ratePerUnit;
    rows.push({ label: `Portion ${String.fromCharCode(65 + i)} — ${units} units + ${Math.round(sharedPerTenant * 10) / 10} shared`, amount: Math.round(share) });
  });

  const firstShare = (usedReadings[0] + sharedPerTenant) * ratePerUnit;

  return {
    primaryResult: {
      id: 'share',
      label: 'Portion A Pays',
      value: `Rs ${Math.round(firstShare).toLocaleString('en-PK')}`,
      type: 'text',
      highlight: true,
      subtext: `At Rs ${ratePerUnit.toFixed(2)} per unit (bill ÷ units); shared units split equally between ${tenants} portion${tenants > 1 ? 's' : ''}. Full split is in the breakdown.`,
    },
    secondaryResults: usedReadings.slice(1).map((units, i) => ({
      id: `share${i + 2}`,
      label: `Portion ${String.fromCharCode(66 + i)} pays`,
      value: `Rs ${Math.round((units + sharedPerTenant) * ratePerUnit).toLocaleString('en-PK')}`,
      type: 'text' as const,
    })),
    breakdown: rows,
    notes: [
      'Method: the bill\'s own average rate (total bill ÷ total units) is applied to each portion, and units not covered by any sub-meter (common lights, motor, losses) are split equally — so the shares always add back to the exact bill.',
      'This average-rate method is the fairest simple approach for shared homes, but slabs mean the heaviest user\'s marginal units cost more. For slab-exact splits, run each portion through the Electricity Bill Calculator at its own units and share the remainder proportionally.',
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Prize Bond Draw Schedule — official calendar guide, never results  */
/* ------------------------------------------------------------------ */

const PRIZE_BOND_INFO: Record<string, { label: string; months: string; drawsPerYear: number; firstPrize: string }> = {
  '100': { label: 'Rs 100 Prize Bond', months: 'February, May, August, November', drawsPerYear: 4, firstPrize: 'Rs 700,000' },
  '200': { label: 'Rs 200 Prize Bond', months: 'March, June, September, December', drawsPerYear: 4, firstPrize: 'Rs 750,000' },
  '750': { label: 'Rs 750 Prize Bond', months: 'January, April, July, October', drawsPerYear: 4, firstPrize: 'Rs 1,500,000' },
  '1500': { label: 'Rs 1,500 Prize Bond', months: 'February, May, August, November', drawsPerYear: 4, firstPrize: 'Rs 3,000,000' },
  '7500': { label: 'Rs 7,500 Prize Bond', months: 'February, May, August, November', drawsPerYear: 4, firstPrize: 'Rs 15,000,000' },
  '15000': { label: 'Rs 15,000 Prize Bond', months: 'March, June, September, December', drawsPerYear: 4, firstPrize: 'Rs 30,000,000' },
  '25000-premium': { label: 'Rs 25,000 Premium Prize Bond', months: 'March, June, September, December', drawsPerYear: 4, firstPrize: 'Rs 30,000,000' },
  '40000-premium': { label: 'Rs 40,000 Premium Prize Bond', months: 'March, June, September, December', drawsPerYear: 4, firstPrize: 'Rs 80,000,000' },
};

export function calculatePrizeBondGuide(inputs: Record<string, any>): CalculatorOutput {
  const denom = inputs.denomination || '750';
  const info = PRIZE_BOND_INFO[denom] || PRIZE_BOND_INFO['750'];
  const number = String(inputs.bondNumber || '').replace(/\D/g, '');
  const numberValid = number.length === 6;

  return {
    primaryResult: {
      id: 'nextDraw',
      label: `${info.label} — Draw Months`,
      value: info.months,
      type: 'text',
      highlight: true,
      subtext: `${info.drawsPerYear} draws a year. Exact dates are announced in the official draw calendar — check winning numbers only on the official National Savings result.`,
    },
    secondaryResults: [
      { id: 'firstPrize', label: 'First prize', value: info.firstPrize, type: 'text' },
      { id: 'numberCheck', label: 'Your bond number format', value: number ? (numberValid ? `${number} — valid 6-digit format` : `${number} — must be 6 digits`) : 'Not entered', type: 'text' },
    ],
    breakdown: [
      { label: 'Denomination', amount: info.label },
      { label: 'Draw months', amount: info.months },
      { label: 'Draws per year', amount: info.drawsPerYear },
      { label: 'First prize', amount: info.firstPrize, isTotal: true },
    ],
    notes: [
      'Pak Calc Hub does not publish or predict winning numbers. After each draw, check your number in the official result gazette on savings.gov.pk (National Savings) — that is the only authoritative source.',
      'Draw months follow the recurring National Savings quarterly pattern; exact dates and cities are gazetted in the annual draw calendar and can shift for public holidays.',
      'Prize claims: winning bonds are claimed at State Bank of Pakistan offices or designated bank branches within six years of the draw, with tax withheld on winnings (higher for non-filers).',
    ],
  };
}
