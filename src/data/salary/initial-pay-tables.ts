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
 *   Verified against the official BPS-2022 chart reproduced in the Finance Division
 *   notification "Revision of Basic Pay Scales-2026" dated 21-07-2026.
 *   Used by: federal DRA-2026 (15% of basic pay as on 30-06-2022) — OM No. 14(2)R-3/2025.
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
  2: 13820,
  3: 14260,
  4: 14690,
  5: 15230,
  6: 15760,
  7: 16310,
  8: 16890,
  9: 17470,
  10: 18050,
  11: 18650,
  12: 19770,
  13: 21160,
  14: 22530,
  15: 23920,
  16: 28070,
  17: 45070,
  18: 56880,
  19: 87840,
  20: 102470,
  21: 113790,
  22: 122190,
};

/** BPS 1–19 scope list (federal DRA-2021/2022 admissibility). */
export const BPS_1_TO_19: number[] = Array.from({ length: 19 }, (_, i) => i + 1);
