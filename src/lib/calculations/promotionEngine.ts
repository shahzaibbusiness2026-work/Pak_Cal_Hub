import { GovernmentType, BudgetYear } from '../../types/government';
import { CalculatorOutput, BreakdownRow, ChartDataPoint } from '../../types/calculator';
import { getSalaryDataset } from '../../data/salary';
import { formatPKR, safeNumber } from '../utils/formatters';

export interface PromotionEngineInputs {
  government?: GovernmentType;
  year?: BudgetYear;
  currentBps?: number | string;
  promotedBps?: number | string;
  currentBasic?: number | string;
}

/**
 * Pure calculation engine for Promotion Pay Fixation under FR-22(a)(i)
 */
export function calculatePromotion(inputs: PromotionEngineInputs): CalculatorOutput {
  const govType: GovernmentType = (inputs.government as GovernmentType) || 'federal';
  const budgetYear: BudgetYear = (inputs.year as BudgetYear) || '2026-27';
  const currentBps = Math.min(Math.max(safeNumber(inputs.currentBps, 16), 1), 21);
  const promotedBps = Math.min(Math.max(safeNumber(inputs.promotedBps, currentBps + 1), currentBps + 1), 22);

  const dataset = getSalaryDataset(govType, budgetYear);
  const currentScale = dataset.scales[currentBps] || dataset.scales[16];
  const promotedScale = dataset.scales[promotedBps] || dataset.scales[17];

  const currentBasic = Math.max(safeNumber(inputs.currentBasic, currentScale.minPay + currentScale.increment * 5), currentScale.minPay);

  // FR-22(a)(i) Formula: Add 1 premature increment in lower scale
  const prematureIncrement = currentScale.increment;
  const payPlusPremature = currentBasic + prematureIncrement;

  // Next higher stage in promoted scale
  let newBasic = promotedScale.minPay;
  let stageInNewScale = 0;

  if (payPlusPremature <= promotedScale.minPay) {
    newBasic = promotedScale.minPay;
    stageInNewScale = 0;
  } else {
    for (let s = 0; s <= promotedScale.stages; s++) {
      const stagePay = promotedScale.minPay + s * promotedScale.increment;
      if (stagePay >= payPlusPremature) {
        newBasic = stagePay;
        stageInNewScale = s;
        break;
      }
      if (s === promotedScale.stages) {
        newBasic = promotedScale.maxPay;
        stageInNewScale = promotedScale.stages;
      }
    }
  }

  const basicPayGain = newBasic - currentBasic;

  const breakdown: BreakdownRow[] = [
    { label: `Current Scale (BPS-${currentBps}) Running Basic Pay`, amount: formatPKR(currentBasic) },
    { label: `One Premature Increment in Lower Scale (BPS-${currentBps})`, amount: `+${formatPKR(prematureIncrement)}` },
    { label: 'Hypothetical Benchmark Pay for Fixation', amount: formatPKR(payPlusPremature) },
    { label: `Promoted Scale (BPS-${promotedBps}) Minimum Pay`, amount: formatPKR(promotedScale.minPay) },
    {
      label: `Fixed Basic Pay in Higher Scale (BPS-${promotedBps}, Stage ${stageInNewScale})`,
      amount: formatPKR(newBasic),
      highlight: true,
    } as any,
    { label: 'Immediate Net Monthly Basic Pay Increase', amount: `+${formatPKR(basicPayGain)}`, isTotal: true },
  ];

  const chartData: ChartDataPoint[] = [
    { name: 'Current Basic Pay', value: currentBasic, color: '#3b82f6' },
    { name: 'Promotional Increase', value: basicPayGain, color: '#16a34a' },
  ];

  return {
    primaryResult: {
      id: 'newBasic',
      label: 'New Fixed Basic Pay in Higher Scale',
      value: formatPKR(newBasic),
      type: 'currency',
      highlight: true,
      subtext: `BPS-${currentBps} ➔ BPS-${promotedBps} (Stage ${stageInNewScale}) | Immediate Increase: +${formatPKR(basicPayGain)}/mo`,
      color: 'success',
    },
    secondaryResults: [
      { id: 'payGain', label: 'Monthly Basic Gain', value: `+${formatPKR(basicPayGain)}`, type: 'currency' },
      { id: 'newStage', label: 'Stage in Promoted Scale', value: `Stage ${stageInNewScale}`, type: 'number' },
      { id: 'premature', label: 'Premature Increment Granted', value: formatPKR(prematureIncrement), type: 'currency' },
    ],
    breakdown,
    chartType: 'pie',
    chartData,
    notes: [
      `Official Rule: Fundamental Rule FR-22(a)(i) governing pay fixation on promotion.`,
      `One premature annual increment is granted in the lower scale prior to fixation in higher scale.`,
      `Governed by ${dataset.governmentName} (${dataset.scaleTitle}).`,
    ],
  };
}
