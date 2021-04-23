import rules from '../rule/index';
import { isEmptyValue } from '../util';

function string(rule: any, value: any, source: any, options: any) {
  const errors: any = [];
  const validate =
    rule.required || (!rule.required && source.hasOwnProperty(rule.field));
  if (validate) {
    if (isEmptyValue(value, 'string') && !rule.required) {
      return errors;
    }
    errors.push(...rules.required(rule, value, source, options));
    if (!isEmptyValue(value, 'string')) {
      errors.push(...rules.type(rule, value, source, options));
      errors.push(...rules.range(rule, value, source, options));
      errors.push(...rules.pattern(rule, value, source, options));
      if (rule.whitespace === true) {
        errors.push(...rules.whitespace(rule, value, source, options));
      }
    }
  }
  return errors;
}

export default string;
