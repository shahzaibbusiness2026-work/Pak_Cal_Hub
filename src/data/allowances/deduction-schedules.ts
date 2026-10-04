/**
 * Verified statutory deduction schedules for federal civil servants.
 *
 * - GP_FUND_SLABS: minimum monthly GP Fund subscription (Rs./month) by BPS.
 *   Finance Division (Regulations Wing) O.M. No. F.1(5)-Reg.7/87(Vol.1)-485/05
 *   dated 18-08-2005, w.e.f. 01-09-2005. No federal revision found since.
 *   These are MINIMUM rates — subscribers may elect a higher subscription.
 * - GI_SLABS: Group Insurance monthly contribution by monthly pay band.
 *   Third Schedule to the FEBF & GI Rules (rule 6A), revised vide Establishment
 *   Division S.R.O. No. 21(1)/96 dated 28-12-1995, w.e.f. 01-01-1996.
 *   Each entry: [payUpperBound, monthlyContribution]. Last entry covers all higher pay.
 * - BENEVOLENT_FUND_CAP: Rs. 155/month (2% of pay, capped).
 *   Third Schedule to the FEBF & GI Act 1969, w.e.f. 01-12-2003 (Act IV of 2005).
 *   The 2022 amendment did not change rates. No later revision found.
 */

export const GP_FUND_SLABS: Record<number, number> = {
  1: 100, 2: 170, 3: 180, 4: 190, 5: 210, 6: 220,
  7: 230, 8: 250, 9: 260, 10: 280, 11: 300, 12: 520,
  13: 560, 14: 620, 15: 670, 16: 760, 17: 1000, 18: 1290,
  19: 1700, 20: 1970, 21: 2190, 22: 2410,
};

/** [payUpperBoundInclusive, monthlyContributionRs] — sorted ascending. */
export const GI_SLABS: Array<[number, number]> = [
  [1500, 24.5], [2000, 29.75], [2500, 35.0], [3000, 40.25], [3500, 45.5],
  [4000, 50.75], [4500, 56.0], [5000, 61.25], [5500, 66.5], [6000, 71.75],
  [6500, 77.0], [7000, 82.25], [7500, 87.5], [8000, 92.75], [8500, 98.0],
  [9000, 103.25], [9500, 108.5], [10000, 113.75], [10500, 119.0],
  [11000, 124.25], [11500, 129.5], [12000, 134.75], [12500, 140.0],
  [13000, 145.25], [13500, 150.5], [14000, 155.75], [14500, 161.0],
  [15000, 166.25], [15500, 171.5], [16000, 176.75],
  [Number.POSITIVE_INFINITY, 182.0],
];

export const BENEVOLENT_FUND_RATE = 0.02;
export const BENEVOLENT_FUND_CAP = 155;

/** GP Fund minimum monthly subscription for a BPS grade. */
export function getGpFundSlab(bps: number): number {
  return GP_FUND_SLABS[bps] ?? 100;
}

/** Group Insurance monthly contribution for a given monthly basic pay. */
export function getGroupInsurance(basicPay: number): number {
  for (const [upper, contribution] of GI_SLABS) {
    if (basicPay <= upper) return contribution;
  }
  return 182.0;
}

/** Benevolent Fund monthly deduction: 2% of basic pay, capped at Rs. 155. */
export function getBenevolentFund(basicPay: number): number {
  return Math.min(Math.round(basicPay * BENEVOLENT_FUND_RATE), BENEVOLENT_FUND_CAP);
}
