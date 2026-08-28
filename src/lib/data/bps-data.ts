export interface BpsScale {
  bps: number;
  minPay: number;
  increment: number;
  maxPay: number;
  stages: number;
  medicalAllowance: number;
  conveyanceAllowance: number;
  frozenHraBigCity: number;   // Frozen rupee HRA for specified big cities
  frozenHraOtherCity: number; // Frozen rupee HRA for other stations
  houseRentBigCityPct?: number;
  houseRentOtherCityPct?: number;
}

/**
 * Revised Basic Pay Scales 2026 (Federal & Provincial Framework)
 * Effective 1 July 2026 (Finance Division OM No. F.1(2)IMP/2026, 21 July 2026)
 * Merged ARA-2022 (15%) + ARA-2025 (10%) into basic pay.
 */
export const BPS_SCALES_2026: Record<number, BpsScale> = {
  1: { bps: 1, minPay: 16280, increment: 520, maxPay: 31880, stages: 30, medicalAllowance: 3500, conveyanceAllowance: 2678, frozenHraBigCity: 3996, frozenHraOtherCity: 2664 },
  2: { bps: 2, minPay: 16770, increment: 590, maxPay: 34470, stages: 30, medicalAllowance: 3500, conveyanceAllowance: 2678, frozenHraBigCity: 4212, frozenHraOtherCity: 2808 },
  3: { bps: 3, minPay: 17480, increment: 700, maxPay: 38480, stages: 30, medicalAllowance: 3500, conveyanceAllowance: 2678, frozenHraBigCity: 4428, frozenHraOtherCity: 2952 },
  4: { bps: 4, minPay: 18180, increment: 820, maxPay: 42780, stages: 30, medicalAllowance: 3500, conveyanceAllowance: 2678, frozenHraBigCity: 4725, frozenHraOtherCity: 3150 },
  5: { bps: 5, minPay: 18890, increment: 920, maxPay: 46490, stages: 30, medicalAllowance: 3500, conveyanceAllowance: 2898, frozenHraBigCity: 5049, frozenHraOtherCity: 3366 },
  6: { bps: 6, minPay: 19600, increment: 1030, maxPay: 50500, stages: 30, medicalAllowance: 3500, conveyanceAllowance: 2898, frozenHraBigCity: 5373, frozenHraOtherCity: 3582 },
  7: { bps: 7, minPay: 20310, increment: 1150, maxPay: 54810, stages: 30, medicalAllowance: 3500, conveyanceAllowance: 2898, frozenHraBigCity: 5724, frozenHraOtherCity: 3816 },
  8: { bps: 8, minPay: 21320, increment: 1280, maxPay: 59720, stages: 30, medicalAllowance: 3500, conveyanceAllowance: 2898, frozenHraBigCity: 6102, frozenHraOtherCity: 4068 },
  9: { bps: 9, minPay: 22320, increment: 1400, maxPay: 64320, stages: 30, medicalAllowance: 3500, conveyanceAllowance: 2898, frozenHraBigCity: 6507, frozenHraOtherCity: 4338 },
  10: { bps: 10, minPay: 23320, increment: 1550, maxPay: 69820, stages: 30, medicalAllowance: 3500, conveyanceAllowance: 2898, frozenHraBigCity: 6939, frozenHraOtherCity: 4626 },
  11: { bps: 11, minPay: 24350, increment: 1700, maxPay: 75350, stages: 30, medicalAllowance: 3500, conveyanceAllowance: 4284, frozenHraBigCity: 7425, frozenHraOtherCity: 4950 },
  12: { bps: 12, minPay: 26150, increment: 1900, maxPay: 83150, stages: 30, medicalAllowance: 3500, conveyanceAllowance: 4284, frozenHraBigCity: 8208, frozenHraOtherCity: 5472 },
  13: { bps: 13, minPay: 28390, increment: 2100, maxPay: 91390, stages: 30, medicalAllowance: 3500, conveyanceAllowance: 4284, frozenHraBigCity: 9180, frozenHraOtherCity: 6120 },
  14: { bps: 14, minPay: 30630, increment: 2340, maxPay: 100830, stages: 30, medicalAllowance: 3500, conveyanceAllowance: 4284, frozenHraBigCity: 10233, frozenHraOtherCity: 6822 },
  15: { bps: 15, minPay: 32850, increment: 2600, maxPay: 110850, stages: 30, medicalAllowance: 3500, conveyanceAllowance: 4284, frozenHraBigCity: 11367, frozenHraOtherCity: 7578 },
  16: { bps: 16, minPay: 39470, increment: 2960, maxPay: 128270, stages: 30, medicalAllowance: 4000, conveyanceAllowance: 7500, frozenHraBigCity: 14364, frozenHraOtherCity: 9576 },
  17: { bps: 17, minPay: 54140, increment: 4100, maxPay: 136140, stages: 20, medicalAllowance: 4000, conveyanceAllowance: 7500, frozenHraBigCity: 19413, frozenHraOtherCity: 12942 },
  18: { bps: 18, minPay: 68340, increment: 5350, maxPay: 175340, stages: 20, medicalAllowance: 4000, conveyanceAllowance: 7500, frozenHraBigCity: 25758, frozenHraOtherCity: 17172 },
  19: { bps: 19, minPay: 105530, increment: 5750, maxPay: 220530, stages: 20, medicalAllowance: 4000, conveyanceAllowance: 7500, frozenHraBigCity: 37746, frozenHraOtherCity: 25164 },
  20: { bps: 20, minPay: 129720, increment: 8050, maxPay: 242420, stages: 14, medicalAllowance: 4000, conveyanceAllowance: 0, frozenHraBigCity: 46143, frozenHraOtherCity: 30762 },
  21: { bps: 21, minPay: 144230, increment: 8860, maxPay: 268270, stages: 14, medicalAllowance: 4000, conveyanceAllowance: 0, frozenHraBigCity: 52623, frozenHraOtherCity: 35082 },
  22: { bps: 22, minPay: 146770, increment: 10470, maxPay: 293350, stages: 14, medicalAllowance: 4000, conveyanceAllowance: 0, frozenHraBigCity: 59373, frozenHraOtherCity: 39582 },
};

// Aliased for backwards compatibility
export const BPS_SCALES_2022 = BPS_SCALES_2026;

// Ad-hoc Relief Allowances under RBPS-2026 framework
export const ADHOC_ALLOWANCES = {
  adhoc2026: 0.07, // 7% Ad-hoc Relief Allowance 2026 on RBPS-2026 Running Basic Pay
  adhoc2022: 0,    // Merged into basic pay in RBPS-2026
  adhoc2023: 0,    // Merged into basic pay in RBPS-2026
  adhoc2024: 0,    // Merged into basic pay in RBPS-2026
};

// GP Fund Profit Rate Schedule
export const GP_FUND_RATES = {
  fy2022_23: 14.22,
  fy2023_24: 13.97,
  fy2024_25: 12.46,
  fy2025_26: 12.05, // Current official benchmark
};
