import { GovernmentType, PensionRulesDataset, CommutationFactorEntry } from '../../types/government';
import commutationTable from './commutation-table.json';
import pensionRules from './pension-rules.json';

export const COMMUTATION_TABLE: CommutationFactorEntry[] = commutationTable;

export function getPensionRules(government: GovernmentType = 'federal'): PensionRulesDataset {
  const rules = (pensionRules as Record<string, any>)[government] || (pensionRules as Record<string, any>)['federal'];
  return rules as PensionRulesDataset;
}

export function getCommutationFactor(age: number): number {
  const boundedAge = Math.min(Math.max(Math.round(age), 45), 65);
  const entry = COMMUTATION_TABLE.find((item) => item.age === boundedAge);
  return entry ? entry.factor : 8.48; // fallback to age 60 standard factor
}
