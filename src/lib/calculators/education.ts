import { formatPercent, safeNumber, formatNumber } from '../utils/formatters';
import { CalculatorOutput, BreakdownRow } from '../../types/calculator';
import { PAK_UNIVERSITY_FORMULAS } from '../data/universities-data';

/**
 * Clamp a component percentage into [0, 100] and record a visible warning
 * when the entered marks/total were inconsistent (e.g. full marks typed
 * against a Part-I total).
 */
function clampComponentPct(
  rawPct: number,
  componentName: string,
  obtained: number,
  total: number,
  warnings: string[]
): number {
  if (rawPct > 100) {
    warnings.push(
      `⚠️ ${componentName} was ${rawPct.toFixed(1)}% (${obtained}/${total}) — capped at 100%. ` +
      `Please check that obtained marks and total marks use the same basis.`
    );
    return 100;
  }
  if (rawPct < 0) {
    warnings.push(`⚠️ ${componentName} was negative — treated as 0%.`);
    return 0;
  }
  return rawPct;
}

/**
 * F.Sc scope guard: warn when the entered F.Sc total does not match the
 * university's official marks basis (full HSSC = 1,100 vs Part-I ≈ 520/550).
 */
function fscScopeWarning(
  formula: { shortName: string; fscBasis: 'full' | 'part1' },
  fscTotal: number
): string | null {
  if (formula.fscBasis === 'full' && fscTotal > 0 && fscTotal <= 600) {
    return (
      `⚠️ F.Sc scope: ${formula.shortName} uses FULL HSSC marks (out of 1,100), ` +
      `but the entered F.Sc total is ${fscTotal}. The percentage below was computed on the ` +
      `entered total — re-enter your full HSSC obtained/total marks for an exact aggregate.`
    );
  }
  if (formula.fscBasis === 'part1' && fscTotal > 600) {
    return (
      `⚠️ F.Sc scope: ${formula.shortName} uses HSSC Part-I marks (out of ~520/550), ` +
      `but the entered F.Sc total is ${fscTotal}. The percentage below was computed on the ` +
      `entered total — re-enter your Part-I obtained/total marks for an exact aggregate.`
    );
  }
  return null;
}

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

  const warnings: string[] = [];
  const matricPct = clampComponentPct(
    matricTotal > 0 ? (matricObtained / matricTotal) * 100 : 0, 'Matric', matricObtained, matricTotal, warnings
  );
  const fscPct = clampComponentPct(
    fscTotal > 0 ? (fscObtained / fscTotal) * 100 : 0, 'F.Sc', fscObtained, fscTotal, warnings
  );
  const mdcatPct = clampComponentPct(
    mdcatTotal > 0 ? (mdcatObtained / mdcatTotal) * 100 : 0, 'MDCAT', mdcatObtained, mdcatTotal, warnings
  );

  const matricWeightage = (matricPct * 10) / 100;
  const fscWeightage = (fscPct * 40) / 100;
  const mdcatWeightage = (mdcatPct * 50) / 100;

  const totalAggregate = matricWeightage + fscWeightage + mdcatWeightage;

  // PM&DC eligibility: 55% MDCAT for MBBS / 50% for BDS AND >= 60% in HSSC Pre-Medical
  const hsscRequirementMet = fscPct >= 60;
  const isEligibleForMbbs = mdcatPct >= 55 && hsscRequirementMet; // 55% MDCAT + 60% HSSC for MBBS
  const isEligibleForBds = mdcatPct >= 50 && hsscRequirementMet;  // 50% MDCAT + 60% HSSC for BDS

  let subtext: string;
  if (isEligibleForMbbs) {
    subtext = 'Eligible for MBBS & BDS Admissions';
  } else if (isEligibleForBds) {
    subtext = 'Eligible for BDS Admissions';
  } else if (!hsscRequirementMet && mdcatPct >= 50) {
    subtext = 'Not Eligible — PM&DC requires ≥60% in HSSC Pre-Medical';
  } else {
    subtext = 'MDCAT Score Below 55% Cut-off';
  }

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
      subtext,
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
      'PM&DC additionally requires at least 60% marks in HSSC (Pre-Medical) for MBBS/BDS eligibility — checked above.',
      ...warnings,
    ],
  };
}

/**
 * Calculates University Entry Test & Admission Aggregate (MDCAT, ECAT, NUST, FAST, COMSATS, etc.)
 */
export function calculateUniversityAggregate(inputs: Record<string, any>): CalculatorOutput {
  const universityId = inputs.university || 'pmdc-mdcat';

  const formula = PAK_UNIVERSITY_FORMULAS.find(f => f.id === universityId) || PAK_UNIVERSITY_FORMULAS[0];

  if (universityId === 'pmdc-mdcat') {
    // Route through the official PM&DC calculator; flag F.Sc scope mismatch
    // (this tool's shared F.Sc fields default to Part-I scale, PM&DC needs full HSSC).
    const result = calculateMdcatAggregate(inputs);
    const scopeNote = fscScopeWarning(
      { shortName: formula.shortName, fscBasis: formula.fscBasis },
      safeNumber(inputs.fscTotal, 1100)
    );
    if (scopeNote) {
      result.notes = [scopeNote, ...(result.notes || [])];
    }
    return result;
  }

  const matricObtained = safeNumber(inputs.matricObtained, 1020);
  const matricTotal = safeNumber(inputs.matricTotal, 1100);
  const fscObtained = safeNumber(inputs.fscObtained, 480);
  const fscTotal = safeNumber(inputs.fscTotal, 520);
  const testObtained = safeNumber(inputs.testObtained, 172);
  const testTotal = safeNumber(inputs.testTotal, 200);

  const warnings: string[] = [];
  const scopeNote = fscScopeWarning(
    { shortName: formula.shortName, fscBasis: formula.fscBasis },
    fscTotal
  );
  if (scopeNote) warnings.push(scopeNote);

  const matricPct = clampComponentPct(
    matricTotal > 0 ? (matricObtained / matricTotal) * 100 : 0, 'Matric', matricObtained, matricTotal, warnings
  );
  const fscPct = clampComponentPct(
    fscTotal > 0 ? (fscObtained / fscTotal) * 100 : 0, 'F.Sc', fscObtained, fscTotal, warnings
  );
  const testPct = clampComponentPct(
    testTotal > 0 ? (testObtained / testTotal) * 100 : 0, 'Entry Test', testObtained, testTotal, warnings
  );

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

  // Only show component shares that actually carry weight (hide 0% rows)
  const secondaryResults = [];
  if (formula.matricWeight > 0) {
    secondaryResults.push({ id: 'matricWeight', label: `Matric Share (${formula.matricWeight}%)`, value: `${matricWeightage.toFixed(2)}%`, type: 'text' as const });
  }
  if (formula.fscWeight > 0) {
    secondaryResults.push({ id: 'fscWeight', label: `F.Sc Share (${formula.fscWeight}%)`, value: `${fscWeightage.toFixed(2)}%`, type: 'text' as const });
  }
  if (formula.testWeight > 0) {
    secondaryResults.push({ id: 'testWeight', label: `Entry Test Share (${formula.testWeight}%)`, value: `${testWeightage.toFixed(2)}%`, type: 'text' as const });
  }

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
    secondaryResults,
    breakdown,
    notes: [
      formula.description,
      'Aggregate calculation compliant with official admissions policy for the current academic session.',
      ...warnings,
    ],
  };
}

/** HEC 4.00 grading scale — letter grade to grade points */
const HEC_GRADE_POINTS: Record<string, number> = {
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'C-': 1.7,
  'D+': 1.3,
  'D': 1.0,
  'F': 0.0,
};

interface ParsedCourse {
  label: string;
  credits: number;
  gpa: number;
}

/**
 * Parse a compact course list like "3:A, 4:B+, 2:3.7" into course entries.
 * Each entry is "credits:grade" where grade is an HEC letter grade or a 0–4 GPA number.
 */
function parseCourseList(raw: string): { courses: ParsedCourse[]; errors: string[] } {
  const courses: ParsedCourse[] = [];
  const errors: string[] = [];

  const entries = raw.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
  entries.forEach((entry, i) => {
    const m = entry.match(/^(\d+(?:\.\d+)?)\s*:\s*([A-Fa-f][+-]?|\d+(?:\.\d+)?)$/);
    if (!m) {
      errors.push(`Entry ${i + 1} ("${entry}") is not in "credits:grade" format — skipped.`);
      return;
    }
    const credits = parseFloat(m[1]);
    const gradeToken = m[2].toUpperCase();

    let gpa: number | null = null;
    if (HEC_GRADE_POINTS[gradeToken] !== undefined) {
      gpa = HEC_GRADE_POINTS[gradeToken];
    } else {
      const n = parseFloat(gradeToken);
      if (!isNaN(n) && n >= 0 && n <= 4) gpa = n;
    }

    if (!(credits > 0)) {
      errors.push(`Entry ${i + 1} ("${entry}"): credit hours must be greater than 0 — skipped.`);
      return;
    }
    if (gpa === null) {
      errors.push(`Entry ${i + 1} ("${entry}"): unknown grade "${m[2]}" (use A..F or 0–4) — skipped.`);
      return;
    }
    courses.push({ label: entry, credits, gpa });
  });

  return { courses, errors };
}

/**
 * Calculates GPA / CGPA and Percentage Conversion.
 * Reads the user's course list from `inputs.courseList` (compact "credits:grade"
 * text). Falls back to a legacy `inputs.courses` array if provided. There are
 * NO hardcoded sample courses in the math path — with no valid input the tool
 * reports "Incomplete Input" instead of a fake number.
 */
export function calculateGpa(inputs: Record<string, any>): CalculatorOutput {
  const raw = String(inputs.courseList ?? '').trim();

  let courses: ParsedCourse[] = [];
  let errors: string[] = [];

  if (raw) {
    const parsed = parseCourseList(raw);
    courses = parsed.courses;
    errors = parsed.errors;
  } else if (Array.isArray(inputs.courses) && inputs.courses.length > 0) {
    // Legacy array input path (kept for API compatibility)
    inputs.courses.forEach((c: any, i: number) => {
      const credits = safeNumber(c?.credits, 0);
      const gpa = safeNumber(c?.gpa, -1);
      if (credits > 0 && gpa >= 0 && gpa <= 4) {
        courses.push({ label: `Course ${i + 1}`, credits, gpa });
      } else {
        errors.push(`Course ${i + 1} has invalid credits/grade — skipped.`);
      }
    });
  }

  if (courses.length === 0) {
    return {
      primaryResult: {
        id: 'gpa',
        label: 'Calculated GPA / CGPA',
        value: '—',
        type: 'text',
        highlight: true,
        color: 'warning',
        subtext: 'Incomplete Input — Enter Your Courses Above',
      },
      secondaryResults: [],
      breakdown: errors.length > 0
        ? errors.map((e) => ({ label: `⚠️ ${e}`, amount: '' }))
        : [{ label: 'No valid courses entered yet', amount: 'Enter e.g. 3:A, 4:B+, 2:C' }],
      notes: [
        'Enter each course as credits:grade, separated by commas — e.g. "3:A, 4:B+, 3:C".',
        'Grades follow the HEC 4.00 scale: A=4.0, A-=3.7, B+=3.3, B=3.0, B-=2.7, C+=2.3, C=2.0, C-=1.7, D+=1.3, D=1.0, F=0.0 (or type the GPA number directly, e.g. 3:3.7).',
      ],
    };
  }

  // Weighted average: Σ(credits × grade points) / Σcredits (HEC 4.00 scale)
  let totalPoints = 0;
  let totalCredits = 0;
  for (const c of courses) {
    totalPoints += c.credits * c.gpa;
    totalCredits += c.credits;
  }

  const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
  const equivalentPercentage = (gpa / 4.0) * 100;

  const breakdown: BreakdownRow[] = courses.map((c, i) => ({
    label: `Course ${i + 1} — ${c.credits} credit hrs × ${c.label.split(':')[1]?.trim() ?? ''} (${c.gpa.toFixed(1)})`,
    amount: `${(c.credits * c.gpa).toFixed(2)} pts`,
  }));
  breakdown.push(
    { label: 'Total Enrolled Credit Hours', amount: `${totalCredits} Credits` },
    { label: 'Earned Quality Points', amount: totalPoints.toFixed(2) },
    { label: 'Calculated Grade Point Average (GPA)', amount: `${gpa.toFixed(2)} / 4.00`, isTotal: true },
  );

  const notes = [
    'Calculated in accordance with Higher Education Commission (HEC) Pakistan 4.0 grading guidelines.',
    'HEC publishes no official linear %↔GPA conversion — the equivalent percentage is a rough guide only.',
  ];
  if (errors.length > 0) {
    notes.push('⚠️ Some entries were skipped:', ...errors.map((e) => `• ${e}`));
  }

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
      { id: 'percentage', label: 'Approx. Equivalent Percentage', value: `${equivalentPercentage.toFixed(1)}%`, type: 'percentage' },
      { id: 'totalCredits', label: 'Total Credit Hours', value: `${totalCredits}`, type: 'text' },
      { id: 'qualityPoints', label: 'Total Quality Points', value: totalPoints.toFixed(2), type: 'text' },
    ],
    breakdown,
    notes,
  };
}
