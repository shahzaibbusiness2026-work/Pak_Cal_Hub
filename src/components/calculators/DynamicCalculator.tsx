'use client';

import React, { useState, useMemo } from 'react';
import { CalculatorDefinition, CalculatorOutput } from '../../types/calculator';
import { getCalculatorBySlug } from '../../lib/data/categories';
import { formatPKR } from '../../lib/utils/formatters';
import NumberInput from '../ui/NumberInput';
import ResultCard from '../ui/ResultCard';
import BreakdownTable from '../ui/BreakdownTable';
import ChartView from '../ui/ChartView';
import ExportActionButtons from '../ui/ExportActionButtons';
import { HelpCircle, ChevronDown, RefreshCw, Calculator, Info } from 'lucide-react';

interface DynamicCalculatorProps {
  slug: string;
}

export default function DynamicCalculator({ slug }: DynamicCalculatorProps) {
  const calculator = getCalculatorBySlug(slug);

  // Initialize input state with defaults
  const initialValues = useMemo(() => {
    if (!calculator) return {};
    const vals: Record<string, any> = {};
    calculator.inputs.forEach((field) => {
      vals[field.id] = field.defaultValue;
    });
    return vals;
  }, [calculator]);

  const [inputs, setInputs] = useState<Record<string, any>>(initialValues);

  if (!calculator) {
    return <div className="p-4 text-center text-slate-500">Calculator not found</div>;
  }

  const handleFieldChange = (id: string, value: any) => {
    setInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleReset = () => {
    setInputs(initialValues);
  };

  // Reactive calculation execution
  const results: CalculatorOutput = useMemo(() => {
    try {
      return calculator.calculate(inputs);
    } catch (err) {
      console.error('Calculation error:', err);
      return {
        primaryResult: { id: 'err', label: 'Calculation Error', value: 'Invalid Inputs', type: 'text' },
      };
    }
  }, [calculator, inputs]);

  const resultSummaryString = `${results.primaryResult.label}: ${results.primaryResult.value}${
    results.secondaryResults
      ? '\n' + results.secondaryResults.map((r) => `${r.label}: ${r.value}`).join('\n')
      : ''
  }`;

  return (
    <div className="space-y-8">
      {/* Interactive Calculator Workspace Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Input Form (5 cols on Desktop) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <Calculator className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Enter Parameters
              </h2>
            </div>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-800 dark:hover:text-emerald-400"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {calculator.inputs.map((field) => {
              if (field.type === 'number' || field.type === 'currency') {
                return (
                  <NumberInput
                    key={field.id}
                    id={field.id}
                    label={field.label}
                    value={inputs[field.id]}
                    onChange={(val) => handleFieldChange(field.id, val)}
                    type={field.type}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    unit={field.unit}
                    helpText={field.helpText}
                  />
                );
              }

              if (field.type === 'select') {
                return (
                  <div key={field.id} className="flex flex-col gap-1.5">
                    <label
                      htmlFor={field.id}
                      className="text-sm font-semibold text-slate-800 dark:text-slate-200"
                    >
                      {field.label}
                    </label>
                    <select
                      id={field.id}
                      value={inputs[field.id] ?? ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-xs focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                      {field.options?.map((opt) => (
                        <option key={String(opt.value)} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {field.helpText && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {field.helpText}
                      </p>
                    )}
                  </div>
                );
              }

              if (field.type === 'toggle') {
                const checked = Boolean(inputs[field.id]);
                return (
                  <div
                    key={field.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 dark:border-slate-800"
                  >
                    <label
                      htmlFor={field.id}
                      className="cursor-pointer text-sm font-semibold text-slate-800 dark:text-slate-200"
                    >
                      {field.label}
                    </label>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={checked}
                      onClick={() => handleFieldChange(field.id, !checked)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        checked ? 'bg-emerald-800' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          checked ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              }

              if (field.type === 'date') {
                return (
                  <div key={field.id} className="flex flex-col gap-1.5">
                    <label
                      htmlFor={field.id}
                      className="text-sm font-semibold text-slate-800 dark:text-slate-200"
                    >
                      {field.label}
                    </label>
                    <input
                      type="date"
                      id={field.id}
                      value={inputs[field.id] || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-xs focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>

        {/* Right Column: Dynamic Results & Visual Breakdowns (7 cols on Desktop) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Main Key Result Card */}
          <ResultCard
            primary={results.primaryResult}
            secondaries={results.secondaryResults}
          />

          {/* Export and Action Buttons */}
          <ExportActionButtons
            title={calculator.title}
            resultSummary={resultSummaryString}
          />

          {/* Visual Distribution Chart */}
          {results.chartData && results.chartData.length > 0 && (
            <ChartView data={results.chartData} />
          )}

          {/* Breakdown Table */}
          {results.breakdown && results.breakdown.length > 0 && (
            <BreakdownTable rows={results.breakdown} />
          )}

          {/* Amortization Schedule (Loans / Financing) */}
          {results.amortizationSchedule && results.amortizationSchedule.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-800/50">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Year-by-Year Amortization Schedule
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="border-b border-slate-100 bg-slate-50/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/30">
                    <tr>
                      <th className="px-4 py-2.5">Year</th>
                      <th className="px-4 py-2.5">Annual Payment</th>
                      <th className="px-4 py-2.5">Principal Paid</th>
                      <th className="px-4 py-2.5">Mark-up / Profit</th>
                      <th className="px-4 py-2.5 text-right">Remaining Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {results.amortizationSchedule.map((row) => (
                      <tr key={row.period} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">
                          Year {row.period}
                        </td>
                        <td className="px-4 py-2.5 font-medium">{formatPKR(row.payment)}</td>
                        <td className="px-4 py-2.5 font-medium text-emerald-800 dark:text-emerald-400">
                          {formatPKR(row.principal)}
                        </td>
                        <td className="px-4 py-2.5 font-medium text-red-600 dark:text-red-400">
                          {formatPKR(row.interest)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold text-slate-900 dark:text-white">
                          {formatPKR(row.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Legal / Policy Notes */}
          {results.notes && results.notes.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 mb-1">
                <Info className="h-3.5 w-3.5 text-emerald-800 dark:text-emerald-400" />
                <span>Notes & Official Reference:</span>
              </div>
              <ul className="list-disc pl-4 space-y-1">
                {results.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
