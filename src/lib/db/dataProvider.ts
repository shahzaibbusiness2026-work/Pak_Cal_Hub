import { prisma, isDatabaseConnected, checkDatabaseConnection } from './prisma';
import { getSalaryDataset } from '../../data/salary';
import { getTaxDataset } from '../../data/tax';
import { getPensionRules, COMMUTATION_TABLE } from '../../data/pension';

export interface MarketRateRecord {
  id?: string;
  key: string;
  category: string;
  label: string;
  value: number;
  unit: string;
  status: string;
  source?: string;
  sourceUrl?: string;
  verifiedAt?: Date | null;
  updatedAt?: Date;
  updatedBy?: string;
  notes?: string;
}

export const DEFAULT_MARKET_RATES: MarketRateRecord[] = [
  { key: 'petrol', category: 'fuel', label: 'Petrol (Super RON-92)', value: 254.63, unit: 'PKR / Litre', status: 'PUBLISHED', source: 'OGRA Notification No. OGRA-10-11(8)/2026', sourceUrl: 'https://ogra.org.pk', notes: 'August 2026 2nd Fortnight' },
  { key: 'diesel', category: 'fuel', label: 'High Speed Diesel (HSD)', value: 258.40, unit: 'PKR / Litre', status: 'PUBLISHED', source: 'OGRA Notification No. OGRA-10-11(8)/2026', sourceUrl: 'https://ogra.org.pk', notes: 'August 2026 2nd Fortnight' },
  { key: 'cng', category: 'fuel', label: 'CNG (Region I/II)', value: 215.00, unit: 'PKR / kg', status: 'PUBLISHED', source: 'All Pakistan CNG Association', notes: 'Average Retail' },
  { key: 'gold_24k_tola', category: 'gold', label: 'Gold 24K (per Tola)', value: 242000, unit: 'PKR / Tola (11.66g)', status: 'PUBLISHED', source: 'All Pakistan Sarafa Gems and Jewellers Association', sourceUrl: 'https://apsja.com.pk' },
  { key: 'gold_22k_tola', category: 'gold', label: 'Gold 22K (per Tola)', value: 221833, unit: 'PKR / Tola', status: 'PUBLISHED', source: 'Sarafa Association Bullion Rate' },
  { key: 'gold_21k_tola', category: 'gold', label: 'Gold 21K (per Tola)', value: 211750, unit: 'PKR / Tola', status: 'PUBLISHED', source: 'Sarafa Association Bullion Rate' },
  { key: 'gold_18k_tola', category: 'gold', label: 'Gold 18K (per Tola)', value: 181500, unit: 'PKR / Tola', status: 'PUBLISHED', source: 'Sarafa Association Bullion Rate' },
  { key: 'silver_tola', category: 'gold', label: 'Silver (per Tola)', value: 2850, unit: 'PKR / Tola', status: 'PUBLISHED', source: 'Sarafa Association Bullion Rate' },
  { key: 'usd_pkr', category: 'currency', label: 'US Dollar (USD / PKR)', value: 280.50, unit: 'PKR / USD', status: 'PUBLISHED', source: 'State Bank of Pakistan Interbank Closing', sourceUrl: 'https://sbp.org.pk' },
  { key: 'aed_pkr', category: 'currency', label: 'UAE Dirham (AED / PKR)', value: 76.40, unit: 'PKR / AED', status: 'PUBLISHED', source: 'State Bank of Pakistan Interbank Closing' },
  { key: 'sar_pkr', category: 'currency', label: 'Saudi Riyal (SAR / PKR)', value: 74.80, unit: 'PKR / SAR', status: 'PUBLISHED', source: 'State Bank of Pakistan Interbank Closing' },
  { key: 'gbp_pkr', category: 'currency', label: 'British Pound (GBP / PKR)', value: 357.00, unit: 'PKR / GBP', status: 'PUBLISHED', source: 'State Bank of Pakistan Interbank Closing' },
  { key: 'eur_pkr', category: 'currency', label: 'Euro (EUR / PKR)', value: 302.80, unit: 'PKR / EUR', status: 'PUBLISHED', source: 'State Bank of Pakistan Interbank Closing' },
  { key: 'cad_pkr', category: 'currency', label: 'Canadian Dollar (CAD / PKR)', value: 204.50, unit: 'PKR / CAD', status: 'PUBLISHED', source: 'State Bank of Pakistan Interbank Closing' },
  { key: 'steel_grade60', category: 'construction', label: 'Deformed Steel Bar Grade-60', value: 255000, unit: 'PKR / Ton', status: 'PUBLISHED', source: 'Pakistan Steel Re-rolling Mills Association' },
  { key: 'cement_bag', category: 'construction', label: 'Portland Cement (50kg Bag)', value: 1450, unit: 'PKR / 50kg Bag', status: 'PUBLISHED', source: 'All Pakistan Cement Manufacturers Association' },
];

/**
 * Gets all market rates with fail-safe fallback and status filtering
 */
export async function getMarketRates(includeAllStatus = false): Promise<MarketRateRecord[]> {
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
  category?: string,
  adminUser = 'Admin',
  source = 'Manual Admin Update'
) {
  const existing = await prisma.marketRate.findUnique({ where: { key } });
  const previousVal = existing ? existing.value : value;
  const changeAmount = value - previousVal;
  const changePct = previousVal > 0 ? (changeAmount / previousVal) * 100 : 0;

  const result = await prisma.marketRate.upsert({
    where: { key },
    update: {
      value,
      ...(label && { label }),
      ...(unit && { unit }),
      ...(category && { category }),
      updatedBy: adminUser,
      verifiedAt: new Date(),
      source,
    },
    create: {
      key,
      category: category || 'general',
      label: label || key,
      value,
      unit: unit || 'PKR',
      status: 'PUBLISHED',
      updatedBy: adminUser,
      verifiedAt: new Date(),
      source,
    },
  });

  if (Math.abs(changeAmount) > 0.001) {
    await prisma.priceHistory.create({
      data: {
        marketRateId: result.id,
        rateKey: key,
        previousVal,
        newVal: value,
        changeAmount,
        changePct,
        source,
      },
    });
  }

  await prisma.adminAuditLog.create({
    data: {
      action: 'UPDATE_MARKET_RATE',
      targetTable: 'MarketRate',
      details: JSON.stringify({ key, previousVal, newVal: value, changePct }),
      adminUser,
    },
  });

  return result;
}

/**
 * Returns database health and live statistics with rich diagnostic error messages
 */
export async function getDatabaseStatus() {
  const check = await checkDatabaseConnection();

  if (!check.connected) {
    return {
      connected: false,
      driver: check.driver,
      host: check.host,
      reason: check.reason,
      hasPlaceholder: check.hasPlaceholder,
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
      driver: check.driver,
      host: check.host,
      reason: check.reason,
      hasPlaceholder: false,
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
      driver: check.driver,
      host: check.host,
      reason: err.message,
      hasPlaceholder: false,
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
