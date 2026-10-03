import React from 'react';

/**
 * Shared form-field wrapper: accessible <label> + control + optional help text.
 * Keeps every calculator input's markup, spacing and dark-mode styling identical.
 */
export default function FieldShell({
  id,
  label,
  helpText,
  children,
}: {
  id: string;
  label: string;
  helpText?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      {children}
      {helpText && <p className="form-help mt-0.5">{helpText}</p>}
    </div>
  );
}
