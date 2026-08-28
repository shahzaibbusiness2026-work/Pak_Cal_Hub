import { prisma, isDatabaseConnected } from './prisma';
import { getSalaryDataset } from '../../data/salary';
import { getPensionRules as getLocalPensionRules, COMMUTATION_TABLE } from '../../data/pension';
import { getTaxDataset } from '../../data/tax';
import { GovernmentType, BudgetYear, TaxYear } from '../../types/government';

export interface MarketRateItem {
  id?: string;
  key: string;
  category: string;
  label: string;
  value: number;
  unit: string;
  updatedAt?: Date | string;
  updatedBy?: string;
  notes?: string;
}

export const DEFAULT_MARKET_RATES: MarketRateItem[] = [
  { key: 'petrol', category: 'fuel', label: 'Petrol (Super)', value: 254.63, unit: 'PKR / Litre', notes: 'August 2026 OGRA notification' },
  { key: 'diesel', category: 'fuel', label: 'High Speed Diesel (HSD)', value: 258.40, unit: 'PKR / Litre', notes: 'August 2026 OGRA notification' },
  { key: 'cng', category: 'fuel', label: 'CNG (Region I/II)', value: 215.00, unit: 'PKR / kg', notes: 'Average station retail rate' },
  { key: 'gold_24k_tola', category: 'gold', label: 'Gold 24K (per Tola)', value: 242000, unit: 'PKR / Tola (11.66g)', notes: 'All Pakistan Sarafa Gems and Jewellers Association' },
  { key: 'gold_22k_tola', category: 'gold', label: 'Gold 22K (per Tola)', value: 221833, unit: 'PKR / Tola', notes: '22 Karat Jewelry benchmark' },
  { key: 'silver_tola', category: 'gold', label: 'Silver (per Tola)', value: 2850, unit: 'PKR / Tola', notes: 'Silver market rate' },
  { key: 'usd_pkr', category: 'currency', label: 'US Dollar (USD / PKR)', value: 280.50, unit: 'PKR / USD', notes: 'State Bank Interbank closing rate' },
  { key: 'gbp_pkr', category: 'currency', label: 'British Pound (GBP / PKR)', value: 357.00, unit: 'PKR / GBP', notes: 'SBP benchmark rate' },
  { key: 'eur_pkr', category: 'currency', label: 'Euro (EUR / PKR)', value: 302.80, unit: 'PKR / EUR', notes: 'SBP benchmark rate' },
  { key: 'sar_pkr', category: 'currency', label: 'Saudi Riyal (SAR / PKR)', value: 74.80, unit: 'PKR / SAR', notes: 'Interbank closing rate' },
  { key: 'aed_pkr', category: 'currency', label: 'UAE Dirham (AED / PKR)', value: 76.40, unit: 'PKR / AED', notes: 'Interbank closing rate' },
  { key: 'cement_bag', category: 'construction', label: 'Cement (per 50kg Bag)', value: 1480, unit: 'PKR / Bag', notes: 'Average OPC 50kg retail rate' },
  { key: 'steel_ton', category: 'construction', label: 'Deformed Steel Rebar Grade 60', value: 268000, unit: 'PKR / Metric Ton', notes: 'Grade 60 structural steel' },
  { key: 'bricks_1000', category: 'construction', label: 'Red Clay Bricks (Awwal)', value: 21000, unit: 'PKR / 1,000 Bricks', notes: 'First-class kiln bricks' },
];

/**
 * Fetches all market rates from PostgreSQL database, or falls back to defaults if DB is unavailable.
 */
export async function getMarketRates(): Promise<MarketRateItem[]> {
  try {
    const connected = await isDatabaseConnected();
    if (!connected) return DEFAULT_MARKET_RATES;

    const dbRates = await prisma.marketRate.findMany({
      orderBy: { category: 'asc' },
    });

    if (!dbRates || dbRates.length === 0) {
      return DEFAULT_MARKET_RATES;
    }

    return dbRates.map((r: any) => ({
      id: r.id,
      key: r.key,
      category: r.category,
      label: r.label,
      value: r.value,
      unit: r.unit,
      updatedAt: r.updatedAt,
      updatedBy: r.updatedBy || 'Admin',
      notes: r.notes || undefined,
    }));
  } catch (err) {
    console.warn('Database offline or unconfigured, using fallback market rates.');
    return DEFAULT_MARKET_RATES;
  }
}

/**
 * Gets a specific rate by key (e.g. 'petrol') with fallback
 */
export async function getMarketRateValue(key: string, defaultValue: number): Promise<number> {
  try {
    const rates = await getMarketRates();
    const item = rates.find((r) => r.key === key);
    return item ? item.value : defaultValue;
  } catch (err) {
    return defaultValue;
  }
}

/**
 * Upserts a market rate in PostgreSQL and writes an audit log
 */
export async function updateMarketRate(
  key: string,
  value: number,
  label?: string,
  unit?: string,
  category: string = 'general',
  updatedBy: string = 'Admin'
) {
  const existing = DEFAULT_MARKET_RATES.find((r) => r.key === key);
  const finalLabel = label || existing?.label || key;
  const finalUnit = unit || existing?.unit || 'PKR';
  const finalCategory = existing?.category || category;

  const result = await prisma.marketRate.upsert({
    where: { key },
    update: {
      value,
      label: finalLabel,
      unit: finalUnit,
      category: finalCategory,
      updatedBy,
    },
    create: {
      key,
      value,
      label: finalLabel,
      unit: finalUnit,
      category: finalCategory,
      updatedBy,
    },
  });

  // Create Audit Log
  await prisma.adminAuditLog.create({
    data: {
      action: 'UPDATE_MARKET_RATE',
      targetTable: 'MarketRate',
      details: `Updated ${key} (${finalLabel}) to ${value} ${finalUnit} by ${updatedBy}`,
      adminUser: updatedBy,
    },
  });

  return result;
}

/**
 * Returns database health and live statistics
 */
export async function getDatabaseStatus() {
  const isConnected = await isDatabaseConnected();
  if (!isConnected) {
    return {
      connected: false,
      driver: 'Supabase PostgreSQL (Prisma ORM)',
      host: process.env.DATABASE_URL ? 'Configured (Awaiting Valid Password)' : 'Not Configured',
      counts: {
        marketRates: 0,
        salaryScales: 0,
        taxSlabs: 0,
        pensionRules: 0,
      },
      fallbackActive: true,
    };
  }

  try {
    const [marketRatesCount, salaryCount, taxCount, pensionCount] = await Promise.all([
      prisma.marketRate.count(),
      prisma.governmentSalaryScale.count(),
      prisma.taxSlab.count(),
      prisma.pensionRule.count(),
    ]);

    return {
      connected: true,
      driver: 'Supabase PostgreSQL (Prisma ORM)',
      host: 'Connected to Supabase Pooler',
      counts: {
        marketRates: marketRatesCount,
        salaryScales: salaryCount,
        taxSlabs: taxCount,
        pensionRules: pensionCount,
      },
      fallbackActive: false,
    };
  } catch (err: any) {
    return {
      connected: false,
      driver: 'Supabase PostgreSQL (Prisma ORM)',
      host: 'Connection Error',
      counts: {
        marketRates: 0,
        salaryScales: 0,
        taxSlabs: 0,
        pensionRules: 0,
      },
      fallbackActive: true,
      error: err.message,
    };
  }
}
