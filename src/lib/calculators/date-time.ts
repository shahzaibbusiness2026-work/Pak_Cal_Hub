import { safeNumber, formatNumber } from '../utils/formatters';
import { CalculatorOutput, BreakdownRow } from '../../types/calculator';
import { invalidInput } from './validation';

/**
 * Exact Age & Date of Birth Calculator
 */
export function calculateAge(inputs: Record<string, any>): CalculatorOutput {
  const birthDateStr = inputs.birthDate || '1995-05-15';
  const targetDateStr = inputs.targetDate || new Date().toISOString().split('T')[0];

  const birthDate = new Date(`${birthDateStr}T00:00:00Z`);
  const targetDate = new Date(`${targetDateStr}T00:00:00Z`);

  if (isNaN(birthDate.getTime()) || isNaN(targetDate.getTime()) || targetDate < birthDate) {
    return invalidInput('Enter valid dates with the target date on or after the birth date.');
  }

  // Clamp anniversaries to month end, so Jan 31 -> Feb 28 is one month.
  const anniversary = (monthOffset: number) => {
    const first = new Date(Date.UTC(birthDate.getUTCFullYear(), birthDate.getUTCMonth() + monthOffset, 1));
    const lastDay = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
    first.setUTCDate(Math.min(birthDate.getUTCDate(), lastDay));
    return first;
  };
  let wholeMonths = (targetDate.getUTCFullYear() - birthDate.getUTCFullYear()) * 12 + targetDate.getUTCMonth() - birthDate.getUTCMonth();
  if (anniversary(wholeMonths) > targetDate) wholeMonths--;
  const years = Math.floor(wholeMonths / 12);
  const months = wholeMonths % 12;
  const days = Math.floor((targetDate.getTime() - anniversary(wholeMonths).getTime()) / 86400000);

  const diffTime = Math.abs(targetDate.getTime() - birthDate.getTime());
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalHours = totalDays * 24;

  // Next birthday calculation
  let nextBirthday = anniversary((targetDate.getUTCFullYear() - birthDate.getUTCFullYear()) * 12);
  if (nextBirthday < targetDate) {
    nextBirthday = anniversary((targetDate.getUTCFullYear() + 1 - birthDate.getUTCFullYear()) * 12);
  }
  const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));

  // Retirement date (Superannuation at age 60 in Pakistan Civil Service / General)
  const retirementDate = anniversary(60 * 12);

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
      { id: 'retirement', label: 'Superannuation (Age 60)', value: retirementDate.toISOString().split('T')[0], type: 'date' },
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
