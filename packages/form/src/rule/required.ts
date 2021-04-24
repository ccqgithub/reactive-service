import * as util from '../util';
import { FieldRule, FieldValue, RSFormData } from '../types';

function required(
  rule: FieldRule,
  value: FieldValue,
  source: RSFormData,
  options: Record<string, any>
): string[] {
  if (!rule.required) return [];

  const errors: string[] = [];
  if (util.isEmptyValue(value, rule.type)) {
    errors.push(util.format(options.messages.required, options.fullField));
  }

  return errors;
}

export default required;
