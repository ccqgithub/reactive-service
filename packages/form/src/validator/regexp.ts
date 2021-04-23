import rules from '../rule/index.js';
import { isEmptyValue } from '../util';

function regexp(rule: any, value: any, source: any, options: any) {
  const errors: any = [];
  const validate =
    rule.required || (!rule.required && source.hasOwnProperty(rule.field));
  if (validate) {
    if (isEmptyValue(value) && !rule.required) {
      return errors;
    }
    errors.push(...rules.required(rule, value, source, options));
    if (!isEmptyValue(value)) {
      errors.push(...rules.type(rule, value, source, options));
    }
  }
  return errors;
}

export default regexp;
