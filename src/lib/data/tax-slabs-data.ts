export interface TaxSlab {
  min: number;
  max: number;
  baseTax: number;
  rate: number; // percentage
  description: string;
}

/**
 * Salaried Individuals Tax Slabs — Tax Year 2027 (FY 2026-27)
 * Effective 1 July 2026 (Federal Finance Act 2026)
 */
export const SALARIED_TAX_SLABS: TaxSlab[] = [
  { min: 0, max: 600000, baseTax: 0, rate: 0, description: 'Up to Rs. 600,000 (Exempt)' },
  { min: 600000, max: 1200000, baseTax: 0, rate: 0.01, description: 'Rs. 600,000 to Rs. 1,200,000 (1% of excess over 600k)' },
  { min: 1200000, max: 2200000, baseTax: 6000, rate: 0.11, description: 'Rs. 1,200,000 to Rs. 2,200,000 (Rs. 6,000 + 11% of excess over 1.2M)' },
  { min: 2200000, max: 3200000, baseTax: 116000, rate: 0.20, description: 'Rs. 2,200,000 to Rs. 3,200,000 (Rs. 116,000 + 20% of excess over 2.2M)' },
  { min: 3200000, max: 4100000, baseTax: 316000, rate: 0.25, description: 'Rs. 3,200,000 to Rs. 4,100,000 (Rs. 316,000 + 25% of excess over 3.2M)' },
  { min: 4100000, max: 5600000, baseTax: 541000, rate: 0.29, description: 'Rs. 4,100,000 to Rs. 5,600,000 (Rs. 541,000 + 29% of excess over 4.1M)' },
  { min: 5600000, max: 7000000, baseTax: 976000, rate: 0.32, description: 'Rs. 5,600,000 to Rs. 7,000,000 (Rs. 976,000 + 32% of excess over 5.6M)' },
  { min: 7000000, max: Infinity, baseTax: 1424000, rate: 0.35, description: 'Exceeding Rs. 7,000,000 (Rs. 1,424,000 + 35% of excess over 7.0M)' },
];

/**
 * Non-Salaried & Business Individuals Tax Slabs
 */
export const NON_SALARIED_TAX_SLABS: TaxSlab[] = [
  { min: 0, max: 600000, baseTax: 0, rate: 0, description: 'Up to Rs. 600,000 (Exempt)' },
  { min: 600000, max: 1200000, baseTax: 0, rate: 0.15, description: 'Rs. 600,000 to Rs. 1,200,000 (15% of excess over 600k)' },
  { min: 1200000, max: 1600000, baseTax: 90000, rate: 0.20, description: 'Rs. 1,200,000 to Rs. 1,600,000 (Rs. 90,000 + 20% of excess over 1.2M)' },
  { min: 1600000, max: 3200000, baseTax: 170000, rate: 0.30, description: 'Rs. 1,600,000 to Rs. 3,200,000 (Rs. 170,000 + 30% of excess over 1.6M)' },
  { min: 3200000, max: 5600000, baseTax: 650000, rate: 0.40, description: 'Rs. 3,200,000 to Rs. 5,600,000 (Rs. 650,000 + 40% of excess over 3.2M)' },
  { min: 5600000, max: Infinity, baseTax: 1610000, rate: 0.45, description: 'Exceeding Rs. 5,600,000 (Rs. 1,610,000 + 45% of excess over 5.6M)' },
];

// Surcharge applies only to Non-Salaried individuals with income > 10 Million
export const NON_SALARIED_SURCHARGE_THRESHOLD = 10000000;
export const NON_SALARIED_SURCHARGE_RATE = 0.10;
export const SURCHARGE_THRESHOLD = 10000000;
export const SURCHARGE_RATE = 0.10;
