'use client';

import React from 'react';
import { getPKRWordRepresentation } from '../../lib/utils/formatters';
import { Plus, Minus } from 'lucide-react';

interface NumberInputProps {
  id: string;
  label: string;
  value: any;
  onChange: (val: any) => void;
  type?: 'number' | 'currency';
  placeholder?: string;
  helpText?: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  showWordPreview?: boolean;
}

export default function NumberInput({
  id,
  label,
  value,
  onChange,
  type = 'number',
  placeholder,
  helpText,
  min,
  max,
  step = 1,
  unit,
  showWordPreview = true,
}: NumberInputProps) {
  const isCurrency = type === 'currency';
  const numValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, '')) || 0;
  const wordPreview = isCurrency && showWordPreview ? getPKRWordRepresentation(numValue) : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawVal = e.target.value;

    if (/^0[0-9]+/.test(rawVal)) {
      rawVal = rawVal.replace(/^0+/, '');
    }

    if (rawVal === '') {
      onChange('');
      return;
    }

    const parsed = parseFloat(rawVal);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleBlur = () => {
    if (value === '' || value === undefined || value === null) {
      onChange(min !== undefined ? min : 0);
    }
  };

  const handleStep = (delta: number) => {
    const current = numValue;
    const effectiveMin = min !== undefined ? min : 0;
    const effectiveMax = max !== undefined ? max : Infinity;
    const nextVal = Math.min(effectiveMax, Math.max(effectiveMin, current + delta));
    onChange(nextVal);
  };

  const canDecrement = numValue > (min !== undefined ? min : 0);
  const canIncrement = max === undefined || numValue < max;
  const stepAmount = step || (isCurrency ? 1000 : 1);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
          {label}
        </label>
        {wordPreview && (
          <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md">
            {wordPreview}
          </span>
        )}
      </div>

      <div className="relative flex items-center rounded-xl shadow-xs">
        {isCurrency && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 z-10">
            <span className="text-sm font-bold font-mono text-slate-400">Rs.</span>
          </div>
        )}

        <input
          id={id}
          type="number"
          value={value === 0 && placeholder ? '' : value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder || (isCurrency ? '0' : 'Enter amount')}
          min={min}
          max={max}
          step={step}
          className={`w-full rounded-xl border border-slate-300 bg-white py-2.5 sm:py-3 text-base sm:text-lg font-bold font-mono tabular-nums text-slate-900 shadow-xs transition-all focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white ${
            isCurrency ? 'pl-11 pr-24' : unit ? 'pl-4 pr-24' : 'px-4 pr-20'
          }`}
        />

        {/* Increment / Decrement Stepper Buttons */}
        <div className="absolute right-1.5 flex items-center gap-1 z-10">
          <button
            type="button"
            onClick={() => handleStep(-stepAmount)}
            disabled={!canDecrement}
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-all"
            aria-label="Decrease"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleStep(stepAmount)}
            disabled={!canIncrement}
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-all"
            aria-label="Increase"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {helpText && (
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
          {helpText}
        </p>
      )}
    </div>
  );
}
