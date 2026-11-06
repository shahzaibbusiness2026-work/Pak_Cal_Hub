import { CalculatorDefinition, CalculatorOutput } from '../../types/calculator';

export function invalidInput(message: string): CalculatorOutput {
  return {
    primaryResult: { id: 'invalid', label: 'Check Your Inputs', value: message, type: 'text', color: 'error' },
  };
}

// Validate the registered form contract before executing any calculator.
export function validatedCalculator(tool: CalculatorDefinition): CalculatorDefinition['calculate'] {
  const calculate = tool.calculate;
  return (provided) => {
    const inputs = { ...provided };
    for (const field of tool.inputs) {
      if (field.showWhen?.some((rule) =>
        ('equals' in rule && (inputs[rule.fieldId] ?? tool.inputs.find((f) => f.id === rule.fieldId)?.defaultValue) !== rule.equals) ||
        ('notEquals' in rule && (inputs[rule.fieldId] ?? tool.inputs.find((f) => f.id === rule.fieldId)?.defaultValue) === rule.notEquals)
      )) continue;
      const value = inputs[field.id] ?? field.defaultValue;
      if (value === '' && (field.required || ['number', 'currency', 'date', 'select'].includes(field.type))) return invalidInput(`Enter ${field.label.toLowerCase()}.`);
      if (field.type === 'number' || field.type === 'currency') {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) return invalidInput(`${field.label} must be a finite number.`);
        if (numeric < (field.min ?? 0)) return invalidInput(`${field.label} must be at least ${field.min ?? 0}.`);
        if (field.max !== undefined && numeric > field.max) return invalidInput(`${field.label} must be at most ${field.max}.`);
        inputs[field.id] = numeric;
      } else if (field.type === 'select') {
        const option = field.options?.find((item) => String(item.value) === String(value));
        if (!option) return invalidInput(`Choose a valid ${field.label.toLowerCase()}.`);
        inputs[field.id] = option.value;
      } else if (field.type === 'date') {
        const parsed = new Date(`${value}T00:00:00Z`);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value)) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
          return invalidInput(`Enter a valid ${field.label.toLowerCase()}.`);
        }
        inputs[field.id] = value;
      } else {
        inputs[field.id] = value;
      }
    }
    return calculate(inputs);
  };
}
