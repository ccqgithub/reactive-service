import { isEmptyValue } from '../util';
import rules from '../rule/index.js';

function boolean(rule: any, value: any, source: any, options: any) {
  const errors: any = [];
  const validate =
    rule.required || (!rule.required && source.hasOwnProperty(rule.field));
  if (validate) {
    if (isEmptyValue(value) && !rule.required) {
      return errors;
    }
    errors.push(...rules.required(rule, value, source, options));
    if (value !== undefined) {
      errors.push(...rules.type(rule, value, source, options));
    }
  }
  return errors;
}

export default boolean;
