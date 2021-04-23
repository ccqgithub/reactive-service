import rules from '../rule/index.js';
import { isEmptyValue } from '../util';

function pattern(rule: any, value: any, source: any, options: any) {
  const errors: any = [];
  const validate =
    rule.required || (!rule.required && source.hasOwnProperty(rule.field));
  if (validate) {
    if (isEmptyValue(value, 'string') && !rule.required) {
      return errors;
    }
    errors.push(...rules.required(rule, value, source, options));
    if (!isEmptyValue(value, 'string')) {
      errors.push(...rules.pattern(rule, value, source, options));
    }
  }
  return errors;
}

export default pattern;
