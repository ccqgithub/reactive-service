import rules from '../rule/index.js';
import { FieldRule, FieldValue, FormData } from '../types';

function any(
  rule: FieldRule,
  value: FieldValue,
  source: FormData,
  options: Record<string, any>
): string[] {
  const errors: string[] = [];
  if (rule.required) {
    errors.push(...rules.required(rule, value, source, options));
  }
  return errors;
}

export default any;
