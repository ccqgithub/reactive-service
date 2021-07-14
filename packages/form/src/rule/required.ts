import * as util from '../util';
import { FieldRule } from '../types';

function required(
  rule: FieldRule,
  value: any,
  options: Record<string, any>
): string[] {
  if (!rule.required) return [];

  const errors: string[] = [];
  if (util.isEmptyValue(value, rule.type)) {
    errors.push(util.format(options.messages.required, options.name));
  }

  return errors;
}

export default required;
