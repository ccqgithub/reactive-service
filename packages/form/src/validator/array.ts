import rules from '../rule/index';

function array(rule: any, value: any, source: any, options: any): string[] {
  const errors: string[] = [];
  const validate =
    rule.required || (!rule.required && source.hasOwnProperty(rule.field));
  if (validate) {
    if ((value === undefined || value === null) && !rule.required) {
      return errors;
    }
    errors.push(...rules.required(rule, value, source, options));
    if (value !== undefined && value !== null) {
      errors.push(...rules.type(rule, value, source, options));
      errors.push(...rules.range(rule, value, source, options));
    }
  }
  return errors;
}

export default array;
