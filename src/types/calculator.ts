export type CategoryId =
  | 'salary'
  | 'tax'
  | 'electricity'
  | 'property'
  | 'education'
  | 'loans'
  | 'islamic'
  | 'business'
  | 'vehicles'
  | 'currency'
  | 'investment'
  | 'date-time'
  | 'data-tools';

export interface FieldOption {
  label: string;
  value: string | number;
}

export type InputFieldType =
  | 'number'
  | 'currency'
  | 'select'
  | 'date'
  | 'toggle'
  | 'slider'
  | 'text';

export interface InputFieldConfig {
  id: string;
  label: string;
  type: InputFieldType;
  defaultValue: any;
  placeholder?: string;
  helpText?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: FieldOption[];
  unit?: string;
  required?: boolean;
}

export interface ResultItem {
  id: string;
  label: string;
  value: string | number;
  type?: 'currency' | 'number' | 'percentage' | 'text' | 'date' | 'badge';
  highlight?: boolean;
  subtext?: string;
  color?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
  formatted?: string;
}

export interface BreakdownRow {
  label: string;
  detail?: string;
  amount: string | number;
  percentage?: number;
  isTotal?: boolean;
  isDeduction?: boolean;
}

export interface CalculatorOutput {
  primaryResult: ResultItem;
  secondaryResults?: ResultItem[];
  breakdown?: BreakdownRow[];
  chartData?: ChartDataPoint[];
  chartType?: 'pie' | 'bar' | 'line';
  notes?: string[];
  amortizationSchedule?: Array<{
    period: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface CalculatorDefinition {
  id: string;
  slug: string;
  title: string;
  shortTitle?: string;
  description: string;
  category: CategoryId;
  icon: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  formulaExplainer?: string;
  faqs?: FAQItem[];
  inputs: InputFieldConfig[];
  calculate: (inputs: Record<string, any>) => CalculatorOutput;
  featured?: boolean;
  trending?: boolean;
}

export interface CategoryDefinition {
  id: CategoryId;
  name: string;
  slug: string;
  shortDesc: string;
  description: string;
  icon: string;
  badge?: string;
  colorTheme: string;
  tools: CalculatorDefinition[];
}
