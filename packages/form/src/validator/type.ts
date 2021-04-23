import rules from '../rule/index';
import { isEmptyValue } from '../util';

function type(rule: any, value: any, source: any, options: any) {
  const ruleType = rule.type;
  const errors: any = [];
  const validate =
    rule.required || (!rule.required && source.hasOwnProperty(rule.field));
  if (validate) {
    if (isEmptyValue(value, ruleType) && !rule.required) {
      return errors;
    }
    errors.push(...rules.required(rule, value, source, options));
    if (!isEmptyValue(value, ruleType)) {
      errors.push(...rules.type(rule, value, source, options));
    }
  }
  return errors;
}

export default type;
