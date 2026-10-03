import { safeNumber, formatNumber } from '../utils/formatters';
import { CalculatorOutput, BreakdownRow } from '../../types/calculator';

/**
 * Parse a 'YYYY-MM-DD' string as a LOCAL date (not UTC — avoids day-shift
 * in non-PKT timezones). Returns null for invalid input.
 */
function parseLocalDate(str: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(str || '').trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const date = new Date(y, mo, d);
  if (isNaN(date.getTime())) return null;
  // Reject rolled-over dates like 2024-02-30
  if (date.getFullYear() !== y || date.getMonth() !== mo || date.getDate() !== d) return null;
  return date;
}

/** Local YYYY-MM-DD string for a Date (avoids UTC toISOString day-shift). */
function toLocalDateString(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function localToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Exact Age & Date of Birth Calculator.
 *
 * Leap-day births (Feb 29): in non-leap years the birthday is treated as
 * Feb 28 for BOTH the Y/M/D age math and the next-birthday countdown, so the
 * two stay consistent (previously the Y/M/D math used Feb 29 components while
 * JS rolled the anniversary to Mar 1 — a 2-day error).
 */
export function calculateAge(inputs: Record<string, any>): CalculatorOutput {
  const birthDateStr = inputs.birthDate || '1995-05-15';
  const targetDateStr = inputs.targetDate || toLocalDateString(localToday());

  const birthDate = parseLocalDate(birthDateStr);
  const targetDate = parseLocalDate(targetDateStr) || localToday();

  if (!birthDate || !targetDate || targetDate < birthDate) {
    return {
      primaryResult: { id: 'age', label: 'Age', value: '0 Years', type: 'text' },
      secondaryResults: [],
    };
  }

  const isLeapDayBirth = birthDate.getMonth() === 1 && birthDate.getDate() === 29;
  // Effective birth month/day for anniversary math (Feb 28 in non-leap years)
  const effMonth = birthDate.getMonth();
  const effDay = isLeapDayBirth && !isLeapYear(targetDate.getFullYear()) ? 28 : birthDate.getDate();

  let years = targetDate.getFullYear() - birthDate.getFullYear();
  let months = targetDate.getMonth() - effMonth;
  let days = targetDate.getDate() - effDay;

  if (days < 0) {
    months--;
    const prevMonthLastDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  // Total days via UTC-normalized diff (immune to DST shifts)
  const diffTime = Math.abs(
    Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()) -
    Date.UTC(birthDate.getFullYear(), birthDate.getMonth(), birthDate.getDate())
  );
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalHours = totalDays * 24;

  // Next birthday calculation (leap-day births: Feb 28 in non-leap years)
  const anniversaryFor = (year: number): Date => {
    const day = isLeapDayBirth && !isLeapYear(year) ? 28 : birthDate.getDate();
    return new Date(year, birthDate.getMonth(), day);
  };
  let nextBirthday = anniversaryFor(targetDate.getFullYear());
  const targetDayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  if (nextBirthday.getTime() < targetDayStart.getTime()) {
    nextBirthday = anniversaryFor(targetDate.getFullYear() + 1);
  }
  const daysUntilBirthday = Math.round((nextBirthday.getTime() - targetDayStart.getTime()) / (1000 * 60 * 60 * 24));

  // Retirement date (Superannuation at age 60 in Pakistan Civil Service / General)
  const retireYear = birthDate.getFullYear() + 60;
  const retireDay = isLeapDayBirth && !isLeapYear(retireYear) ? 28 : birthDate.getDate();
  const retirementDate = new Date(retireYear, birthDate.getMonth(), retireDay);

  return {
    primaryResult: {
      id: 'exactAge',
      label: 'Exact Chronological Age',
      value: `${years} Years, ${months} Months, ${days} Days`,
      type: 'text',
      highlight: true,
      color: 'success',
      subtext: `${totalDays.toLocaleString()} Days Lived`,
    },
    secondaryResults: [
      { id: 'nextBday', label: 'Days until Next Birthday', value: `${daysUntilBirthday} Days`, type: 'text', color: 'info' },
      { id: 'totalWeeks', label: 'Total Weeks', value: `${totalWeeks.toLocaleString()} Weeks`, type: 'text' },
      { id: 'totalHours', label: 'Total Hours', value: `${totalHours.toLocaleString()} Hours`, type: 'text' },
      { id: 'retirement', label: 'Superannuation (Age 60)', value: toLocalDateString(retirementDate), type: 'date' },
    ],
    breakdown: [
      { label: 'Completed Years', amount: `${years} Years` },
      { label: 'Completed Months', amount: `${months} Months` },
      { label: 'Remaining Days', amount: `${days} Days` },
      { label: 'Total Lifespan in Days', amount: `${totalDays.toLocaleString()} Days` },
      { label: 'Total Lifespan in Hours', amount: `${totalHours.toLocaleString()} Hours` },
      { label: 'Days Remaining to Next Birthday', amount: `${daysUntilBirthday} Days` },
    ],
  };
}
