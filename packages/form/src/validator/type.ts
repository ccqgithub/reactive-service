import rules from '../rule/index';
import { isEmptyValue } from '../util';

function type(rule: any, value: any, callback: any, source: any, options: any) {
  const ruleType = rule.type;
  const errors: any = [];
  const validate =
    rule.required || (!rule.required && source.hasOwnProperty(rule.field));
  if (validate) {
    if (isEmptyValue(value, ruleType) && !rule.required) {
      return callback();
    }
    rules.required(rule, value, source, errors, options, ruleType);
    if (!isEmptyValue(value, ruleType)) {
      rules.type(rule, value, source, errors, options);
    }
  }
  callback(errors);
}

export default type;
