/**
 * SINGLE SOURCE OF TRUTH — Precious-metal market defaults & gold unit constants.
 *
 * Why this file exists: gold/silver default rates were previously hardcoded in
 * several places with conflicting values (e.g. 475,000 vs 242,000 per tola).
 * All engines and UI defaults must read from here.
 *
 * The rate values below mirror the DB-verified benchmarks in
 * src/lib/db/dataProvider.ts DEFAULT_MARKET_RATES (keys 'gold_24k_tola' /
 * 'silver_tola'), which are kept current by the gold sync pipeline and can be
 * updated by admins via the admin panel. Pure calculator engines are
 * synchronous, so they use these constants as defaults; server-side code that
 * needs the live DB value should call dataProvider.getMarketRateValue()
 * ('gold_24k_tola' / 'silver_tola') with these constants as fallback.
 */

// Pakistan Sarafa standard: 1 tola = 11.6638 grams (exact trade standard)
export const GRAMS_PER_TOLA = 11.6638;
export const MASHA_PER_TOLA = 12;
export const RATTI_PER_TOLA = 96;
export const GRAMS_PER_TROY_OUNCE = 31.1035;

// DB-verified default market rates (PKR) — see dataProvider DEFAULT_MARKET_RATES.
// Manually verified 2026-10-04 (APSGJA rates reported 2 Oct 2026).
export const DEFAULT_GOLD_24K_PER_TOLA = 440636;
export const DEFAULT_SILVER_PER_TOLA = 6528;
export const DEFAULT_MAKING_CHARGES_PER_GRAM = 2500;

/** Sync getters so other modules can reuse the single source without importing raw constants. */
export function getDefaultGoldRate24kPerTola(): number {
  return DEFAULT_GOLD_24K_PER_TOLA;
}
export function getDefaultSilverRatePerTola(): number {
  return DEFAULT_SILVER_PER_TOLA;
}

export const PURITY_FACTORS: Record<string, number> = {
  '24k': 1.0,        // 99.9% pure bar / bullion
  '22k': 22 / 24,    // 91.6% standard Pakistani jewelry
  '21k': 21 / 24,    // 87.5% Gulf jewelry
  '18k': 18 / 24,    // 75.0% diamond-studded settings
};

export type GoldWeightUnit = 'tola' | 'gram' | '10gram' | 'masha' | 'ratti' | 'ounce';

/**
 * Convert any supported weight unit to grams.
 * THE canonical conversion — every gold calculator must use this (no local copies).
 */
export function goldWeightToGrams(quantity: number, unit: GoldWeightUnit | string): number {
  const qty = Math.max(0, quantity || 0);
  switch (unit) {
    case 'tola':
      return qty * GRAMS_PER_TOLA;
    case '10gram':
      return qty * 10;
    case 'gram':
      return qty;
    case 'masha':
      return (qty / MASHA_PER_TOLA) * GRAMS_PER_TOLA;
    case 'ratti':
      return (qty / RATTI_PER_TOLA) * GRAMS_PER_TOLA;
    case 'ounce':
      return qty * GRAMS_PER_TROY_OUNCE;
    default:
      return qty * GRAMS_PER_TOLA;
  }
}

export interface GoldValuation {
  grams: number;
  tolas: number;
  purityFactor: number;
  rate24kPerTola: number;
  metalValue: number;
  makingCharges: number;
  total: number;
}

/**
 * THE canonical gold valuation math — metal value + making charges.
 * Both the UI gold calculator (data-tools) and the legacy engine
 * (calculations/goldEngine) delegate to this. Do not re-implement elsewhere.
 */
export function computeGoldValuation(opts: {
  quantity: number;
  unit?: GoldWeightUnit | string;
  purity?: string;
  rate24kPerTola?: number;
  makingChargesPerGram?: number;
  makingChargesPercent?: number;
}): GoldValuation {
  const grams = goldWeightToGrams(opts.quantity, opts.unit || 'tola');
  const purityFactor = PURITY_FACTORS[opts.purity || '24k'] ?? 1.0;
  const rate24k = opts.rate24kPerTola && opts.rate24kPerTola > 0
    ? opts.rate24kPerTola
    : DEFAULT_GOLD_24K_PER_TOLA;

  const metalValue = grams * (rate24k / GRAMS_PER_TOLA) * purityFactor;

  let makingCharges = 0;
  if (opts.makingChargesPerGram && opts.makingChargesPerGram > 0) {
    makingCharges = grams * opts.makingChargesPerGram;
  } else if (opts.makingChargesPercent && opts.makingChargesPercent > 0) {
    makingCharges = metalValue * (opts.makingChargesPercent / 100);
  }

  return {
    grams,
    tolas: grams / GRAMS_PER_TOLA,
    purityFactor,
    rate24kPerTola: rate24k,
    metalValue,
    makingCharges,
    total: metalValue + makingCharges,
  };
}
