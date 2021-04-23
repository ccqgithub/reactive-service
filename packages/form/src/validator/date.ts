import rules from '../rule/index.js';
import { isEmptyValue } from '../util';

function date(rule: any, value: any, source: any, options: any) {
  // console.log('integer rule called %j', rule);
  const errors: any = [];
  const validate =
    rule.required || (!rule.required && source.hasOwnProperty(rule.field));
  // console.log('validate on %s value', value);
  if (validate) {
    if (isEmptyValue(value, 'date') && !rule.required) {
      return errors;
    }
    errors.push(...rules.required(rule, value, source, options));
    if (!isEmptyValue(value, 'date')) {
      let dateObject;

      if (value instanceof Date) {
        dateObject = value;
      } else {
        dateObject = new Date(value);
      }
      errors.push(...rules.type(rule, dateObject, source, options));
      if (dateObject) {
        errors.push(
          ...rules.range(rule, dateObject.getTime(), source, options)
        );
      }
    }
  }
  return errors;
}

export default date;
