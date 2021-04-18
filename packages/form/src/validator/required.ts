import rules from '../rule/index';

function required(
  rule: any,
  value: any,
  callback: any,
  source: any,
  options: any
) {
  const errors: any = [];
  const type = Array.isArray(value) ? 'array' : typeof value;
  rules.required(rule, value, source, errors, options, type);
  callback(errors);
}

export default required;
