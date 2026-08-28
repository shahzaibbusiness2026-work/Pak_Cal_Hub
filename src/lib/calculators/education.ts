import { formatPercent, safeNumber, formatNumber } from '../utils/formatters';
import { CalculatorOutput, BreakdownRow } from '../../types/calculator';
import { PAK_UNIVERSITY_FORMULAS } from '../data/universities-data';

/**
 * Calculates Official PM&DC MDCAT Aggregate (50% MDCAT + 40% F.Sc + 10% Matric)
 */
export function calculateMdcatAggregate(inputs: Record<string, any>): CalculatorOutput {
  const matricObtained = safeNumber(inputs.matricObtained, 1040);
  const matricTotal = safeNumber(inputs.matricTotal, 1100);
  const fscObtained = safeNumber(inputs.fscObtained, 1010);
  const fscTotal = safeNumber(inputs.fscTotal, 1100);
  const mdcatObtained = safeNumber(inputs.mdcatObtained || inputs.testObtained, 175);
  const mdcatTotal = safeNumber(inputs.mdcatTotal || inputs.testTotal, 200);

  const matricPct = matricTotal > 0 ? (matricObtained / matricTotal) * 100 : 0;
  const fscPct = fscTotal > 0 ? (fscObtained / fscTotal) * 100 : 0;
  const mdcatPct = mdcatTotal > 0 ? (mdcatObtained / mdcatTotal) * 100 : 0;

  const matricWeightage = (matricPct * 10) / 100;
  const fscWeightage = (fscPct * 40) / 100;
  const mdcatWeightage = (mdcatPct * 50) / 100;

  const totalAggregate = matricWeightage + fscWeightage + mdcatWeightage;
  const isEligibleForMbbs = mdcatPct >= 55; // 55% passing requirement for MBBS
  const isEligibleForBds = mdcatPct >= 50;  // 50% passing requirement for BDS

  const breakdown: BreakdownRow[] = [
    { label: `Matric / SSC (${matricObtained}/${matricTotal} = ${matricPct.toFixed(2)}%)`, detail: 'Weightage: 10%', amount: `${matricWeightage.toFixed(3)}%` },
    { label: `F.Sc Pre-Medical (${fscObtained}/${fscTotal} = ${fscPct.toFixed(2)}%)`, detail: 'Weightage: 40%', amount: `${fscWeightage.toFixed(3)}%` },
    { label: `MDCAT Entry Test (${mdcatObtained}/${mdcatTotal} = ${mdcatPct.toFixed(2)}%)`, detail: 'Weightage: 50%', amount: `${mdcatWeightage.toFixed(3)}%` },
    { label: 'Final PM&DC Admission Merit Aggregate', amount: `${totalAggregate.toFixed(4)}%`, isTotal: true },
  ];

  return {
    primaryResult: {
      id: 'aggregate',
      label: 'MDCAT Merit Aggregate Score',
      value: `${totalAggregate.toFixed(4)}%`,
      type: 'percentage',
      highlight: true,
      color: totalAggregate >= 88 ? 'success' : totalAggregate >= 75 ? 'info' : 'warning',
      subtext: isEligibleForMbbs ? 'Eligible for MBBS & BDS Admissions' : isEligibleForBds ? 'Eligible for BDS Admissions' : 'MDCAT Score Below 55% Cut-off',
    },
    secondaryResults: [
      { id: 'mdcatShare', label: 'MDCAT Share (50%)', value: `${mdcatWeightage.toFixed(3)}%`, type: 'text' },
      { id: 'fscShare', label: 'F.Sc Share (40%)', value: `${fscWeightage.toFixed(3)}%`, type: 'text' },
      { id: 'matricShare', label: 'Matric Share (10%)', value: `${matricWeightage.toFixed(3)}%`, type: 'text' },
      { id: 'testPct', label: 'MDCAT Test %', value: `${mdcatPct.toFixed(1)}%`, type: 'percentage' },
    ],
    breakdown,
    notes: [
      'Official Pakistan Medical & Dental Council (PM&DC) admission formula: 50% MDCAT + 40% F.Sc Pre-Medical + 10% Matric.',
      'Minimum qualifying marks: 55% in MDCAT for MBBS and 50% for BDS admissions.',
    ],
  };
}

/**
 * Calculates University Entry Test & Admission Aggregate (MDCAT, ECAT, NUST, FAST, COMSATS, etc.)
 */
export function calculateUniversityAggregate(inputs: Record<string, any>): CalculatorOutput {
  const universityId = inputs.university || 'pmdc-mdcat';
  if (universityId === 'pmdc-mdcat') {
    return calculateMdcatAggregate(inputs);
  }

  const matricObtained = safeNumber(inputs.matricObtained, 1020);
  const matricTotal = safeNumber(inputs.matricTotal, 1100);
  const fscObtained = safeNumber(inputs.fscObtained, 480);
  const fscTotal = safeNumber(inputs.fscTotal, 520);
  const testObtained = safeNumber(inputs.testObtained, 172);
  const testTotal = safeNumber(inputs.testTotal, 200);

  const formula = PAK_UNIVERSITY_FORMULAS.find(f => f.id === universityId) || PAK_UNIVERSITY_FORMULAS[0];

  const matricPct = matricTotal > 0 ? (matricObtained / matricTotal) * 100 : 0;
  const fscPct = fscTotal > 0 ? (fscObtained / fscTotal) * 100 : 0;
  const testPct = testTotal > 0 ? (testObtained / testTotal) * 100 : 0;

  const matricWeightage = (matricPct * formula.matricWeight) / 100;
  const fscWeightage = (fscPct * formula.fscWeight) / 100;
  const testWeightage = (testPct * formula.testWeight) / 100;

  const totalAggregate = matricWeightage + fscWeightage + testWeightage;

  const breakdown: BreakdownRow[] = [
    { label: `Matric / SSC (${matricObtained}/${matricTotal} = ${matricPct.toFixed(2)}%)`, detail: `Weight: ${formula.matricWeight}%`, amount: `${matricWeightage.toFixed(3)}%` },
    { label: `F.Sc / HSSC (${fscObtained}/${fscTotal} = ${fscPct.toFixed(2)}%)`, detail: `Weight: ${formula.fscWeight}%`, amount: `${fscWeightage.toFixed(3)}%` },
  ];

  if (formula.testWeight > 0) {
    breakdown.push({
      label: `Entry Test (${testObtained}/${testTotal} = ${testPct.toFixed(2)}%)`,
      detail: `Weight: ${formula.testWeight}%`,
      amount: `${testWeightage.toFixed(3)}%`,
    });
  }

  breakdown.push({
    label: `Final Admission Aggregate Score`,
    amount: `${totalAggregate.toFixed(4)}%`,
    isTotal: true,
  });

  return {
    primaryResult: {
      id: 'aggregate',
      label: 'Calculated Aggregate Score',
      value: `${totalAggregate.toFixed(4)}%`,
      type: 'percentage',
      highlight: true,
      color: totalAggregate >= 85 ? 'success' : totalAggregate >= 70 ? 'info' : 'warning',
      subtext: formula.name,
    },
    secondaryResults: [
      { id: 'matricWeight', label: `Matric Share (${formula.matricWeight}%)`, value: `${matricWeightage.toFixed(2)}%`, type: 'text' },
      { id: 'fscWeight', label: `F.Sc Share (${formula.fscWeight}%)`, value: `${fscWeightage.toFixed(2)}%`, type: 'text' },
      { id: 'testWeight', label: `Entry Test Share (${formula.testWeight}%)`, value: `${testWeightage.toFixed(2)}%`, type: 'text' },
    ],
    breakdown,
    notes: [
      formula.description,
      'Aggregate calculation compliant with official admissions policy for the current academic session.',
    ],
  };
}

/**
 * Calculates GPA / CGPA and Percentage Conversion
 */
export function calculateGpa(inputs: Record<string, any>): CalculatorOutput {
  const courses: Array<{ credits: number; gpa: number }> = inputs.courses || [
    { credits: 3, gpa: 3.7 },
    { credits: 4, gpa: 4.0 },
    { credits: 3, gpa: 3.3 },
    { credits: 3, gpa: 3.7 },
    { credits: 2, gpa: 4.0 },
  ];

  let totalPoints = 0;
  let totalCredits = 0;

  for (const c of courses) {
    totalPoints += safeNumber(c.credits) * safeNumber(c.gpa);
    totalCredits += safeNumber(c.credits);
  }

  const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
  const equivalentPercentage = (gpa / 4.0) * 100;

  return {
    primaryResult: {
      id: 'gpa',
      label: 'Calculated GPA / CGPA',
      value: gpa.toFixed(2),
      type: 'text',
      highlight: true,
      color: gpa >= 3.5 ? 'success' : gpa >= 3.0 ? 'info' : 'warning',
      subtext: `Out of 4.00 Scale`,
    },
    secondaryResults: [
      { id: 'percentage', label: 'Equivalent Percentage', value: `${equivalentPercentage.toFixed(1)}%`, type: 'percentage' },
      { id: 'totalCredits', label: 'Total Credit Hours', value: `${totalCredits}`, type: 'text' },
      { id: 'qualityPoints', label: 'Total Quality Points', value: totalPoints.toFixed(2), type: 'text' },
    ],
    breakdown: [
      { label: 'Total Enrolled Credit Hours', amount: `${totalCredits} Credits` },
      { label: 'Earned Quality Points', amount: totalPoints.toFixed(2) },
      { label: 'Calculated Grade Point Average (GPA)', amount: `${gpa.toFixed(2)} / 4.00`, isTotal: true },
    ],
    notes: [
      'Calculated in accordance with Higher Education Commission (HEC) Pakistan 4.0 grading guidelines.',
    ],
  };
}
