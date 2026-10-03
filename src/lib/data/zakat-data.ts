// Single source of truth for gold/silver market defaults: ./market-rates.ts (src/lib/data/)
import { DEFAULT_GOLD_24K_PER_TOLA, DEFAULT_SILVER_PER_TOLA } from './market-rates';

export interface ZakatConstants {
  goldNisabTola: number; // 7.5 tola
  goldNisabGrams: number; // 87.48 grams
  silverNisabTola: number; // 52.5 tola
  silverNisabGrams: number; // 612.36 grams
  zakatRate: number; // 2.5%
  defaultGoldPricePerTola: number; // Current 24K gold PKR rate
  defaultSilverPricePerTola: number; // Current silver PKR rate
}

export const ZAKAT_DEFAULTS: ZakatConstants = {
  goldNisabTola: 7.5,
  goldNisabGrams: 87.48,
  silverNisabTola: 52.5,
  silverNisabGrams: 612.36,
  zakatRate: 0.025, // 2.5%
  defaultGoldPricePerTola: DEFAULT_GOLD_24K_PER_TOLA, // from market-rates.ts (DB-verified benchmark)
  defaultSilverPricePerTola: DEFAULT_SILVER_PER_TOLA, // from market-rates.ts (DB-verified benchmark)
};
