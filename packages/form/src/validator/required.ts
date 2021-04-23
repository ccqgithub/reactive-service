import rules from '../rule/index';

function required(rule: any, value: any, source: any, options: any) {
  const errors: any = [];
  errors.push(...rules.required(rule, value, source, options));
  return errors;
}

export default required;
