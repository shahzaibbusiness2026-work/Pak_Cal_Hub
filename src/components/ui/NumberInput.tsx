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

    // Strip leading zero when user types over a default 0 (e.g., "05" -> "5")
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
    // Select text on focus so first keystroke immediately replaces existing value / default 0
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
        <label htmlFor={id} className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          {label}
        </label>
        {wordPreview && (
          <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
            {wordPreview}
          </span>
        )}
      </div>

      <div className="relative flex items-center rounded-xl shadow-xs">
        {isCurrency && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 z-10">
            <span className="text-sm font-bold text-slate-500">Rs.</span>
          </div>
        )}

        <input
          type="number"
          id={id}
          name={id}
          value={value ?? ''}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder || (isCurrency ? '0' : '')}
          aria-label={label}
          className={`block w-full rounded-xl border border-slate-300 bg-white py-2.5 text-base sm:text-sm font-semibold text-slate-900 shadow-xs transition-all focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white ${
            isCurrency ? 'pl-11 pr-22' : unit ? 'pl-3.5 pr-22' : 'px-3.5 pr-22'
          }`}
        />

        {/* Stepper +/- quick action buttons inside input */}
        <div className="absolute right-1.5 flex items-center gap-1">
          {unit && !isCurrency && (
            <span className="text-xs font-semibold text-slate-400 mr-1 hidden sm:inline">{unit}</span>
          )}
          <button
            type="button"
            onClick={() => handleStep(-stepAmount)}
            disabled={!canDecrement}
            aria-label={`Decrease ${label} by ${stepAmount}`}
            className="flex h-8 w-8 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-all touch-manipulation"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleStep(stepAmount)}
            disabled={!canIncrement}
            aria-label={`Increase ${label} by ${stepAmount}`}
            className="flex h-8 w-8 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-all touch-manipulation"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Add Preset Chips for Currency */}
      {isCurrency && numValue > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[10px] text-slate-400 font-medium">Add:</span>
          {numValue < 1000000 && (
            <>
              <button
                type="button"
                onClick={() => handleStep(10000)}
                className="rounded-md bg-slate-100 px-2 py-1 text-[11px] sm:text-[10px] font-semibold text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 dark:bg-slate-800 dark:text-slate-400 active:scale-95 transition-all touch-manipulation"
              >
                +10k
              </button>
              <button
                type="button"
                onClick={() => handleStep(50000)}
                className="rounded-md bg-slate-100 px-2 py-1 text-[11px] sm:text-[10px] font-semibold text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 dark:bg-slate-800 dark:text-slate-400 active:scale-95 transition-all touch-manipulation"
              >
                +50k
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => handleStep(100000)}
            className="rounded-md bg-slate-100 px-2 py-1 text-[11px] sm:text-[10px] font-semibold text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 dark:bg-slate-800 dark:text-slate-400 active:scale-95 transition-all touch-manipulation"
          >
            +1 Lakh
          </button>
          {numValue >= 500000 && (
            <button
              type="button"
              onClick={() => handleStep(1000000)}
              className="rounded-md bg-slate-100 px-2 py-1 text-[11px] sm:text-[10px] font-semibold text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 dark:bg-slate-800 dark:text-slate-400 active:scale-95 transition-all touch-manipulation"
            >
              +10 Lakh
            </button>
          )}
        </div>
      )}

      {helpText && <p className="text-xs text-slate-500 dark:text-slate-400">{helpText}</p>}
    </div>
  );
}
