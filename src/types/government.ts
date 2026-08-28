export type GovernmentType = 'federal' | 'punjab' | 'sindh' | 'kpk' | 'balochistan';

export type BudgetYear = '2026-27' | '2025-26' | '2024-25';

export type TaxYear = '2026-27' | '2025-26' | '2024-25';

export interface BpsGradeData {
  bps: number;
  minPay: number;
  increment: number;
  maxPay: number;
  stages: number;
  frozenHraBigCity: number;
  frozenHraOtherCity: number;
  conveyanceAllowance: number;
  medicalAllowance: number;
}

export interface AdhocReliefConfig {
  id: string;
  name: string;
  rate: number; // e.g. 0.07 for 7%, 0.15 for 15%
  appliesTo: 'basic' | 'runningBasic' | 'runningBasicPlusDRA';
  bpsCondition?: {
    min?: number;
    max?: number;
    rate?: number;
  }[];
}

export interface SpecialAllowanceConfig {
  id: string;
  name: string;
  rate?: number; // e.g. 0.25 for 25% DRA / Executive allowance
  fixedAmount?: number;
  applicableBps?: number[];
  appliesTo?: 'initial2017' | 'initial2022' | 'runningBasic';
}

export interface GovernmentSalaryDataset {
  government: GovernmentType;
  governmentName: string;
  year: BudgetYear;
  scaleTitle: string;
  effectiveDate: string;
  notificationNumber: string;
  scales: Record<number, BpsGradeData>;
  adhocReliefs: AdhocReliefConfig[];
  specialAllowances?: SpecialAllowanceConfig[];
  minimumWage: number;
  notes: string[];
}

export interface CommutationFactorEntry {
  age: number;
  factor: number;
}

export interface PensionRulesDataset {
  government: GovernmentType;
  governmentName: string;
  minimumPension: number;
  familyPensionRate: number; // e.g. 0.75 for 75%
  familyPensionLifetimeWidow: boolean;
  familyPensionLifetimeUnmarriedDaughter: boolean;
  commutationMaxPercent: number; // e.g. 35
  gratuityFormulaFactor: number;
  voluntaryRetirementMinYears: number;
  superannuationAge: number;
  post2024Scheme: {
    enabled: boolean;
    employeeContributionRate: number; // e.g. 0.10
    governmentContributionRate: number; // e.g. 0.12
    vpsNominalGrowthRate: number; // e.g. 0.12
  };
  notes: string[];
}

export interface TaxBracket {
  min: number;
  max: number;
  fixedTax: number;
  rate: number;
  rateLabel: string;
}

export interface TaxYearDataset {
  taxYear: TaxYear;
  assessmentYear: string;
  actTitle: string;
  salariedSlabs: TaxBracket[];
  nonSalariedSlabs: TaxBracket[];
  surcharge: {
    threshold: number;
    rate: number;
    appliesToSalaried: boolean;
  };
  freelancerExportTax: {
    psebRate: number; // e.g. 0.0025 for 0.25%
    generalRate: number; // e.g. 0.0125 for 1.25%
    section: string;
  };
  propertyTax: {
    sellerFilerRate: number; // e.g. 0.0275
    sellerNonFilerRate: number; // e.g. 0.10
    buyerFilerRate: number; // e.g. 0.015
    buyerNonFilerRate: number; // e.g. 0.105
  };
  notes: string[];
}

export interface GPFRateConfig {
  financialYear: BudgetYear;
  profitRate: number; // e.g. 12.05
  mandatoryDeductions: {
    bps1To15Rate: number; // 0.05
    bps16To22Rate: number; // 0.08
  };
  benevolentFundRate: number; // 0.02
  benevolentFundMax: number; // 2500
  groupInsurance: {
    bps1To15: number; // 350
    bps16To22: number; // 700
  };
}
