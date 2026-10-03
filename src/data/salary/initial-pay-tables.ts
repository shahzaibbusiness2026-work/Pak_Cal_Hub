/**
 * Frozen "initial of pay scale" tables used as the computation base for allowances
 * that are legally defined on the *initial* (minimum) of an older pay scale —
 * NOT on the employee's current running basic pay.
 *
 * - BPS_2017_MINIMUM: initial (minimum) of Revised Basic Pay Scales 2017.
 *   Corroborated against the notified BPS-2017 pay chart (e.g. BPS-1: 9,130,
 *   BPS-5: 10,260, BPS-16: 18,910, BPS-17: 30,370, BPS-18: 38,350, BPS-19: 59,210).
 *   Used by: federal DRA-2021 (25%) and DRA-2022 (15%) — Finance Division
 *   OM No.14(1)R-3/2021-324 (08-07-2021) and OM F.No.14(1)R-3/2021-69 (23-02-2022):
 *   "@ 25% / 15% of the basic pay of Basic Pay Scales 2017", BPS 1–19, frozen.
 * - BPS_2022_MINIMUM: initial of Revised Basic Pay Scales 2022.
 *   Sourced from this repo's federal-2024.json (verified against the Finance
 *   Division BPS-2022 notification). Reserved for entries with
 *   appliesTo: 'initial2022' (none active yet).
 */
export const BPS_2017_MINIMUM: Record<number, number> = {
  1: 9130,
  2: 9310,
  3: 9610,
  4: 9900,
  5: 10260,
  6: 10620,
  7: 10990,
  8: 11380,
  9: 11770,
  10: 12160,
  11: 12570,
  12: 13320,
  13: 14260,
  14: 15180,
  15: 16120,
  16: 18910,
  17: 30370,
  18: 38350,
  19: 59210,
  20: 69090,
  21: 76270,
  22: 82380,
};

export const BPS_2022_MINIMUM: Record<number, number> = {
  1: 13550,
  2: 13960,
  3: 14590,
  4: 15200,
  5: 15880,
  6: 16540,
  7: 17220,
  8: 18060,
  9: 18950,
  10: 19820,
  11: 20900,
  12: 22530,
  13: 24740,
  14: 26920,
  15: 29100,
  16: 33650,
  17: 45070,
  18: 57540,
  19: 86900,
  20: 105820,
  21: 115240,
  22: 122190,
};

/** BPS 1–19 scope list (federal DRA-2021/2022 admissibility). */
export const BPS_1_TO_19: number[] = Array.from({ length: 19 }, (_, i) => i + 1);
