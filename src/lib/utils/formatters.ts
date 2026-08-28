/**
 * Formats a number in Pakistani Currency (PKR) with Rs. prefix
 */
export function formatPKR(
  amount: number | string | undefined | null,
  options: {
    showDecimals?: boolean;
    compact?: boolean;
    includeSymbol?: boolean;
  } = {}
): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return 'Rs. 0';
  }

  const val = typeof amount === 'string' ? parseFloat(amount) : amount;
  const isNegative = val < 0;
  const absVal = Math.abs(val);
  const prefix = options.includeSymbol !== false ? 'Rs. ' : '';
  const sign = isNegative ? '-' : '';

  if (options.compact) {
    if (absVal >= 1000000000) {
      return `${sign}${prefix}${(absVal / 1000000000).toFixed(2)} Arab`;
    }
    if (absVal >= 10000000) {
      return `${sign}${prefix}${(absVal / 10000000).toFixed(2)} Crore`;
    }
    if (absVal >= 100000) {
      return `${sign}${prefix}${(absVal / 100000).toFixed(2)} Lakh`;
    }
    if (absVal >= 1000) {
      return `${sign}${prefix}${(absVal / 1000).toFixed(1)}k`;
    }
  }

  // South Asian Number System Grouping (e.g., 12,34,567.89)
  const parts = absVal.toFixed(options.showDecimals ? 2 : 0).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1] ? `.${parts[1]}` : '';

  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInteger =
    otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  return `${sign}${prefix}${formattedInteger}${decimalPart}`;
}

/**
 * Returns human-friendly Pakistani denomination word helper
 * e.g., 2500000 -> "25 Lakh / 2.5 Million"
 */
export function getPKRWordRepresentation(val: number): string {
  if (!val || val <= 0) return '';
  if (val >= 1000000000) {
    const arab = (val / 1000000000).toFixed(2);
    return `${arab} Arab (Billion)`;
  }
  if (val >= 10000000) {
    const crore = (val / 10000000).toFixed(2);
    const million = (val / 1000000).toFixed(2);
    return `${crore} Crore (${million} Million)`;
  }
  if (val >= 100000) {
    const lakh = (val / 100000).toFixed(2);
    return `${lakh} Lakh (${(val / 1000).toFixed(0)}k)`;
  }
  if (val >= 1000) {
    return `${(val / 1000).toFixed(1)} Thousand`;
  }
  return '';
}

/**
 * Formats a plain number with commas
 */
export function formatNumber(
  val: number | string | undefined | null,
  decimals: number = 2
): string {
  if (val === undefined || val === null || isNaN(Number(val))) return '0';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  return new Intl.NumberFormat('en-PK', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: Number.isInteger(num) ? 0 : Math.min(2, decimals),
  }).format(num);
}

/**
 * Formats a percentage
 */
export function formatPercent(
  val: number | string | undefined | null,
  decimals: number = 2
): string {
  if (val === undefined || val === null || isNaN(Number(val))) return '0%';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  return `${num.toFixed(decimals)}%`;
}

/**
 * Parses user input string safely into number
 */
export function safeNumber(val: any, fallback: number = 0): number {
  if (val === undefined || val === null || val === '') return fallback;
  const parsed = typeof val === 'number' ? val : parseFloat(String(val).replace(/,/g, ''));
  return isNaN(parsed) ? fallback : parsed;
}
