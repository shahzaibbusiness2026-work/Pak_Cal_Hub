import { safeNumber, formatNumber } from '../utils/formatters';
import { CalculatorOutput, BreakdownRow } from '../../types/calculator';

/**
 * Exact Age & Date of Birth Calculator
 */
export function calculateAge(inputs: Record<string, any>): CalculatorOutput {
  const birthDateStr = inputs.birthDate || '1995-05-15';
  const targetDateStr = inputs.targetDate || new Date().toISOString().split('T')[0];

  const birthDate = new Date(birthDateStr);
  const targetDate = new Date(targetDateStr);

  if (isNaN(birthDate.getTime()) || isNaN(targetDate.getTime()) || targetDate < birthDate) {
    return {
      primaryResult: { id: 'age', label: 'Age', value: '0 Years', type: 'text' },
      secondaryResults: [],
    };
  }

  let years = targetDate.getFullYear() - birthDate.getFullYear();
  let months = targetDate.getMonth() - birthDate.getMonth();
  let days = targetDate.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    const prevMonthLastDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const diffTime = Math.abs(targetDate.getTime() - birthDate.getTime());
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalHours = totalDays * 24;

  // Next birthday calculation
  const nextBirthday = new Date(targetDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  if (nextBirthday < targetDate) {
    nextBirthday.setFullYear(targetDate.getFullYear() + 1);
  }
  const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));

  // Retirement date (Superannuation at age 60 in Pakistan Civil Service / General)
  const retirementDate = new Date(birthDate.getFullYear() + 60, birthDate.getMonth(), birthDate.getDate());

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
