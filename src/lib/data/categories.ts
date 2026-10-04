import type { CategoryDefinition, CalculatorDefinition, CalculatorOutput } from '../../types/calculator';
import { CATEGORIES_DATA as META_CATEGORIES } from './categories-meta';
import { DEFAULT_GOLD_24K_PER_TOLA } from './market-rates';
import {
  calculateAge,
  calculateApplianceCost,
  calculateAreaConverter,
  calculateBpsSalary,
  calculateBreakEven,
  calculateBricksRequirement,
  calculateCarDepreciation,
  calculateCementRequirement,
  calculateConstructionCost,
  calculateCurrency,
  calculateElectricityBill,
  calculateEvChargingCost,
  calculateFamilyPension,
  calculateFreelancerRate,
  calculateFreelancerTax,
  calculateFuelCost,
  calculateGoldPrice,
  calculateGpFund,
  calculateGpa,
  calculateIncomeTax,
  calculateIncrementArrears,
  calculateInflation,
  calculateInheritance,
  calculateInvestment,
  calculateLeaveEncashment,
  calculateLoanAffordability,
  calculateLoanEmi,
  calculateMdcatAggregate,
  calculatePension,
  calculateProfitMargin,
  calculatePromotionPay,
  calculatePropertyTax,
  calculateSolarSystem,
  calculateSteelRequirement,
  calculateTilesRequirement,
  calculateTokenTax,
  calculateUniversityAggregate,
  calculateZakat,
} from '../calculators';

const CALCULATE_FNS: Record<string, (inputs: Record<string, any>) => CalculatorOutput> = {
  'bps-salary-calculator': calculateBpsSalary,
  'basic-pay-calculator': calculateBpsSalary,
  'pension-calculator': calculatePension,
  'family-pension-calculator': calculateFamilyPension,
  'leave-encashment-calculator': calculateLeaveEncashment,
  'promotion-pay-calculator': calculatePromotionPay,
  'gp-fund-calculator': calculateGpFund,
  'increment-arrears-calculator': calculateIncrementArrears,
  'income-tax-calculator': calculateIncomeTax,
  'freelancer-tax-calculator': calculateFreelancerTax,
  'property-tax-calculator': calculatePropertyTax,
  'electricity-bill-calculator': calculateElectricityBill,
  'solar-system-calculator': calculateSolarSystem,
  'appliance-electricity-cost-calculator': calculateApplianceCost,
  'property-area-converter': calculateAreaConverter,
  'construction-cost-calculator': calculateConstructionCost,
  'cement-calculator': calculateCementRequirement,
  'bricks-calculator': calculateBricksRequirement,
  'steel-rebar-calculator': calculateSteelRequirement,
  'tiles-calculator': calculateTilesRequirement,
  'mdcat-aggregate-calculator': calculateMdcatAggregate,
  'university-merit-calculator': calculateUniversityAggregate,
  'gpa-calculator': calculateGpa,
  'loan-emi-calculator': calculateLoanEmi,
  'loan-affordability-calculator': calculateLoanAffordability,
  'zakat-calculator': calculateZakat,
  'islamic-inheritance-calculator': calculateInheritance,
  'profit-margin-calculator': calculateProfitMargin,
  'break-even-calculator': calculateBreakEven,
  'freelancer-hourly-rate-calculator': calculateFreelancerRate,
  'fuel-cost-calculator': calculateFuelCost,
  'ev-charging-cost-calculator': calculateEvChargingCost,
  'car-depreciation-calculator': calculateCarDepreciation,
  'token-tax-calculator': calculateTokenTax,
  'pkr-currency-converter': calculateCurrency,
  'compound-interest-calculator': calculateInvestment,
  'inflation-calculator': calculateInflation,
  'age-calculator': calculateAge,
  'gold-price-calculator': calculateGoldPrice,
};

/**
 * Full calculator definitions with live `calculate` functions attached.
 * Heavy engine imports live here — components that only need names/slugs/descriptions
 * (Navbar, SearchModal, sitemap) should import from './categories-meta' instead.
 */
export const CATEGORIES_DATA: CategoryDefinition[] = META_CATEGORIES.map((cat) => ({
  ...cat,
  tools: cat.tools.map((tool) => {
    const calculate = CALCULATE_FNS[tool.id];
    if (!calculate) throw new Error(`No calculate function registered for tool: ${tool.id}`);
    // Restore the live gold default that the meta module placeholders.
    const inputs = tool.id === 'gold-price-calculator'
      ? tool.inputs.map((i) => (i.id === 'goldRate24kPerTola' ? { ...i, defaultValue: DEFAULT_GOLD_24K_PER_TOLA } : i))
      : tool.inputs;
    return { ...tool, inputs, calculate };
  }),
}));

export const ALL_CALCULATORS: CalculatorDefinition[] = CATEGORIES_DATA.flatMap((c) => c.tools);

export function getCategoryById(id: string): CategoryDefinition | undefined {
  return CATEGORIES_DATA.find((c) => c.id === id || c.slug === id);
}

export function getCalculatorBySlug(slug: string): CalculatorDefinition | undefined {
  return ALL_CALCULATORS.find((t) => t.slug === slug || t.id === slug);
}
