import { TaxYear, TaxYearDataset } from '../../types/government';
import tax2027 from './tax-year-2027.json';
import tax2026 from './tax-year-2026.json';
import tax2025 from './tax-year-2025.json';

const taxDatabase: Record<string, TaxYearDataset> = {
  '2026-27': tax2027 as TaxYearDataset,
  '2025-26': tax2026 as TaxYearDataset,
  '2024-25': tax2025 as TaxYearDataset,
};

export function getTaxDataset(taxYear: TaxYear = '2026-27'): TaxYearDataset {
  return taxDatabase[taxYear] || tax2027;
}

export const SUPPORTED_TAX_YEARS: { label: string; value: TaxYear }[] = [
  { label: 'Tax Year 2027 (FY 2026-27 — Finance Act 2026)', value: '2026-27' },
  { label: 'Tax Year 2026 (FY 2025-26 — Finance Act 2025)', value: '2025-26' },
  { label: 'Tax Year 2025 (FY 2024-25 — Finance Act 2024)', value: '2024-25' },
];
