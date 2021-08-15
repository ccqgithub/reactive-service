import format from '../util/format';
import { isEmptyValue } from '../util/utils';
import { FieldRule } from '../types';

function required(
  rule: FieldRule,
  value: any,
  options: Record<string, any>
): string[] {
  if (!rule.required) return [];

  const errors: string[] = [];
  if (isEmptyValue(value, rule.type)) {
    errors.push(format(options.messages.required, options.name));
  }

  return errors;
}

export default required;
