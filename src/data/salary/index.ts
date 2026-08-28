import { GovernmentType, BudgetYear, GovernmentSalaryDataset } from '../../types/government';

import federal2026 from './federal-2026.json';
import federal2025 from './federal-2025.json';
import federal2024 from './federal-2024.json';

import punjab2026 from './punjab-2026.json';
import punjab2025 from './punjab-2025.json';
import punjab2024 from './punjab-2024.json';

import sindh2026 from './sindh-2026.json';
import sindh2025 from './sindh-2025.json';
import sindh2024 from './sindh-2024.json';

import kpk2026 from './kpk-2026.json';
import kpk2025 from './kpk-2025.json';
import kpk2024 from './kpk-2024.json';

import balochistan2026 from './balochistan-2026.json';
import balochistan2025 from './balochistan-2025.json';
import balochistan2024 from './balochistan-2024.json';

const salaryDatabase: Record<string, Record<string, any>> = {
  federal: {
    '2026-27': federal2026,
    '2025-26': federal2025,
    '2024-25': federal2024,
  },
  punjab: {
    '2026-27': punjab2026,
    '2025-26': punjab2025,
    '2024-25': punjab2024,
  },
  sindh: {
    '2026-27': sindh2026,
    '2025-26': sindh2025,
    '2024-25': sindh2024,
  },
  kpk: {
    '2026-27': kpk2026,
    '2025-26': kpk2025,
    '2024-25': kpk2024,
  },
  balochistan: {
    '2026-27': balochistan2026,
    '2025-26': balochistan2025,
    '2024-25': balochistan2024,
  },
};

/**
 * Returns salary dataset for a given Government Type and Financial Budget Year
 */
export function getSalaryDataset(
  government: GovernmentType = 'federal',
  year: BudgetYear = '2026-27'
): GovernmentSalaryDataset {
  const govData = salaryDatabase[government] || salaryDatabase['federal'];
  const dataset = govData[year] || govData['2026-27'] || federal2026;
  return dataset as GovernmentSalaryDataset;
}

export const SUPPORTED_GOVERNMENTS: { label: string; value: GovernmentType }[] = [
  { label: 'Federal Government', value: 'federal' },
  { label: 'Punjab Government', value: 'punjab' },
  { label: 'Sindh Government', value: 'sindh' },
  { label: 'KPK Government', value: 'kpk' },
  { label: 'Balochistan Government', value: 'balochistan' },
];

export const SUPPORTED_BUDGET_YEARS: { label: string; value: BudgetYear }[] = [
  { label: '2026-27 (Revised Basic Pay Scales 2026)', value: '2026-27' },
  { label: '2025-26 (BPS-2022 with Adhoc 2022-25)', value: '2025-26' },
  { label: '2024-25 (BPS-2022 with Adhoc 2022-24)', value: '2024-25' },
];
