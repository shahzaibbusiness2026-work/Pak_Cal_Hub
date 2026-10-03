import { BudgetYear, GPFRateConfig } from '../../types/government';
import gpfRates from './gpf-rates.json';

export function getGpfConfig(year: BudgetYear = '2026-27'): GPFRateConfig {
  const dataset = (gpfRates.rates as Record<string, any>)[year] || gpfRates.rates['2026-27'];
  return dataset as GPFRateConfig;
}
