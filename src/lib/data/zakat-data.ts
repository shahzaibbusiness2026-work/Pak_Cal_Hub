export interface ZakatConstants {
  goldNisabTola: number; // 7.5 tola
  goldNisabGrams: number; // 87.48 grams
  silverNisabTola: number; // 52.5 tola
  silverNisabGrams: number; // 612.36 grams
  zakatRate: number; // 2.5%
  defaultGoldPricePerTola: number; // Current approximate 24K gold PKR rate
  defaultSilverPricePerTola: number; // Current approximate silver PKR rate
}

export const ZAKAT_DEFAULTS: ZakatConstants = {
  goldNisabTola: 7.5,
  goldNisabGrams: 87.48,
  silverNisabTola: 52.5,
  silverNisabGrams: 612.36,
  zakatRate: 0.025, // 2.5%
  defaultGoldPricePerTola: 475000, // PKR ~475k per tola (August 2026 Sarafa rate benchmark)
  defaultSilverPricePerTola: 6800,  // PKR ~6,800 per tola (August 2026 Sarafa silver benchmark)
};
