import { prisma, isDatabaseConnected } from './prisma';
import { getSalaryDataset } from '../../data/salary';
import { getPensionRules as getLocalPensionRules, COMMUTATION_TABLE } from '../../data/pension';
import { getTaxDataset } from '../../data/tax';
import { GovernmentType, BudgetYear, TaxYear } from '../../types/government';
import { PROTECTED_SLABS, UNPROTECTED_SLABS, DiscoProvider } from '../calculations/electricityEngine';

export interface MarketRateItem {
  id?: string;
  key: string;
  category: string;
  label: string;
  value: number;
  unit: string;
  status?: string;
  source?: string;
  sourceUrl?: string;
  verifiedAt?: Date | string;
  updatedAt?: Date | string;
  updatedBy?: string;
  notes?: string;
}

export const DEFAULT_MARKET_RATES: MarketRateItem[] = [
  { key: 'petrol', category: 'fuel', label: 'Petrol (Super RON-92)', value: 254.63, unit: 'PKR / Litre', status: 'PUBLISHED', source: 'OGRA Notification No. OGRA-10-11(8)/2026', sourceUrl: 'https://ogra.org.pk' },
  { key: 'diesel', category: 'fuel', label: 'High Speed Diesel (HSD)', value: 258.40, unit: 'PKR / Litre', status: 'PUBLISHED', source: 'OGRA Notification No. OGRA-10-11(8)/2026', sourceUrl: 'https://ogra.org.pk' },
  { key: 'cng', category: 'fuel', label: 'CNG (Region I / II)', value: 215.00, unit: 'PKR / kg', status: 'PUBLISHED', source: 'All Pakistan CNG Association (APCNGA)' },
  { key: 'gold_24k_tola', category: 'gold', label: 'Gold 24K (per Tola)', value: 242000, unit: 'PKR / Tola (11.66g)', status: 'PUBLISHED', source: 'All Pakistan Sarafa Gems and Jewellers Association', sourceUrl: 'https://apsja.com.pk' },
  { key: 'gold_22k_tola', category: 'gold', label: 'Gold 22K (per Tola)', value: 221833, unit: 'PKR / Tola', status: 'PUBLISHED', source: 'Sarafa Market Benchmark' },
  { key: 'gold_21k_tola', category: 'gold', label: 'Gold 21K (per Tola)', value: 211750, unit: 'PKR / Tola', status: 'PUBLISHED', source: 'Sarafa Market Benchmark' },
  { key: 'gold_18k_tola', category: 'gold', label: 'Gold 18K (per Tola)', value: 181500, unit: 'PKR / Tola', status: 'PUBLISHED', source: 'Sarafa Market Benchmark' },
  { key: 'silver_tola', category: 'gold', label: 'Silver (per Tola)', value: 2850, unit: 'PKR / Tola', status: 'PUBLISHED', source: 'Sarafa Market Benchmark' },
  { key: 'usd_pkr', category: 'currency', label: 'US Dollar (USD / PKR)', value: 280.50, unit: 'PKR / USD', status: 'PUBLISHED', source: 'State Bank of Pakistan Interbank Closing', sourceUrl: 'https://sbp.org.pk' },
  { key: 'aed_pkr', category: 'currency', label: 'UAE Dirham (AED / PKR)', value: 76.40, unit: 'PKR / AED', status: 'PUBLISHED', source: 'State Bank of Pakistan Interbank Closing' },
  { key: 'sar_pkr', category: 'currency', label: 'Saudi Riyal (SAR / PKR)', value: 74.80, unit: 'PKR / SAR', status: 'PUBLISHED', source: 'State Bank of Pakistan Interbank Closing' },
  { key: 'gbp_pkr', category: 'currency', label: 'British Pound (GBP / PKR)', value: 357.00, unit: 'PKR / GBP', status: 'PUBLISHED', source: 'State Bank of Pakistan Interbank Closing' },
  { key: 'eur_pkr', category: 'currency', label: 'Euro (EUR / PKR)', value: 302.80, unit: 'PKR / EUR', status: 'PUBLISHED', source: 'State Bank of Pakistan Interbank Closing' },
  { key: 'cad_pkr', category: 'currency', label: 'Canadian Dollar (CAD / PKR)', value: 204.50, unit: 'PKR / CAD', status: 'PUBLISHED', source: 'State Bank of Pakistan Interbank Closing' },
  { key: 'cement_bag', category: 'construction', label: 'Cement (per 50kg Bag)', value: 1480, unit: 'PKR / Bag', status: 'PUBLISHED', source: 'Pakistan Bureau of Statistics (PBS)' },
  { key: 'steel_ton', category: 'construction', label: 'Deformed Steel Rebar Grade 60', value: 268000, unit: 'PKR / Ton', status: 'PUBLISHED', source: 'Pakistan Steel Re-Rolling Mills Association' },
  { key: 'bricks_1000', category: 'construction', label: 'Red Clay Bricks (Awwal)', value: 21000, unit: 'PKR / 1,000 Bricks', status: 'PUBLISHED', source: 'Market Survey' },
];

/**
 * Fetches all PUBLISHED market rates from PostgreSQL database, or falls back to defaults if DB is unavailable.
 */
export async function getMarketRates(includeAllStatus: boolean = false): Promise<MarketRateItem[]> {
  try {
    const connected = await isDatabaseConnected();
    if (!connected) return DEFAULT_MARKET_RATES;

    const whereClause = includeAllStatus ? {} : { status: 'PUBLISHED' };
    const dbRates = await prisma.marketRate.findMany({
      where: whereClause,
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
      status: r.status,
      source: r.source,
      sourceUrl: r.sourceUrl,
      verifiedAt: r.verifiedAt,
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
 * Upserts a market rate in PostgreSQL and writes an audit log + price history record
 */
export async function updateMarketRate(
  key: string,
  value: number,
  label?: string,
  unit?: string,
  category: string = 'general',
  status: string = 'PUBLISHED',
  source?: string,
  sourceUrl?: string,
  updatedBy: string = 'Admin'
) {
  const existing = DEFAULT_MARKET_RATES.find((r) => r.key === key);
  const finalLabel = label || existing?.label || key;
  const finalUnit = unit || existing?.unit || 'PKR';
  const finalCategory = existing?.category || category;
  const finalSource = source || existing?.source || 'Admin Update';

  let prevVal = existing ? existing.value : value;
  try {
    const dbExisting = await prisma.marketRate.findUnique({ where: { key } });
    if (dbExisting) prevVal = dbExisting.value;
  } catch (e) {}

  const result = await prisma.marketRate.upsert({
    where: { key },
    update: {
      value,
      label: finalLabel,
      unit: finalUnit,
      category: finalCategory,
      status,
      source: finalSource,
      sourceUrl: sourceUrl || null,
      verifiedAt: new Date(),
      updatedBy,
    },
    create: {
      key,
      value,
      label: finalLabel,
      unit: finalUnit,
      category: finalCategory,
      status,
      source: finalSource,
      sourceUrl: sourceUrl || null,
      verifiedAt: new Date(),
      updatedBy,
    },
  });

  // Record Price History if price changed
  if (prevVal !== value) {
    const changeAmt = value - prevVal;
    const changePct = prevVal > 0 ? (changeAmt / prevVal) * 100 : 0;
    try {
      await prisma.priceHistory.create({
        data: {
          marketRateId: result.id,
          rateKey: key,
          previousVal: prevVal,
          newVal: value,
          changeAmount: changeAmt,
          changePct,
          source: finalSource,
        },
      });
    } catch (e) {}
  }

  // Create Audit Log
  try {
    await prisma.adminAuditLog.create({
      data: {
        action: 'UPDATE_MARKET_RATE',
        targetTable: 'MarketRate',
        details: `Updated ${key} (${finalLabel}) to ${value} ${finalUnit} (Status: ${status}) by ${updatedBy}`,
        adminUser: updatedBy,
      },
    });
  } catch (e) {}

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
      host: process.env.DATABASE_URL ? 'Configured (Awaiting Valid Password in .env)' : 'Not Configured',
      counts: {
        marketRates: DEFAULT_MARKET_RATES.length,
        salaryScales: 15,
        taxSlabs: 36,
        pensionRules: 5,
        electricityTariffs: 11,
      },
      fallbackActive: true,
    };
  }

  try {
    const [marketRatesCount, salaryCount, taxCount, pensionCount, tariffCount] = await Promise.all([
      prisma.marketRate.count(),
      prisma.governmentSalaryScale.count(),
      prisma.taxSlab.count(),
      prisma.pensionRule.count(),
      prisma.electricityTariff.count(),
    ]);

    return {
      connected: true,
      driver: 'Supabase PostgreSQL (Prisma ORM)',
      host: 'Connected to Supabase Transaction Pooler',
      counts: {
        marketRates: marketRatesCount,
        salaryScales: salaryCount,
        taxSlabs: taxCount,
        pensionRules: pensionCount,
        electricityTariffs: tariffCount,
      },
      fallbackActive: false,
    };
  } catch (err: any) {
    return {
      connected: false,
      driver: 'Supabase PostgreSQL (Prisma ORM)',
      host: 'Connection Error',
      counts: {
        marketRates: DEFAULT_MARKET_RATES.length,
        salaryScales: 15,
        taxSlabs: 36,
        pensionRules: 5,
        electricityTariffs: 11,
      },
      fallbackActive: true,
      error: err.message,
    };
  }
}
