import { FieldRule } from '../types';
import { isEmptyValue } from '../util/utils';
import isType from '../util/is-type';
import format from '../util/format';

function type(
  rule: FieldRule,
  value: any,
  options: Record<string, any>
): string[] {
  const errors: string[] = [];
  const ruleType = rule.type;

  if (!ruleType) return errors;

  if (isEmptyValue(value, ruleType)) {
    return errors;
  }

  const custom = [
    'integer',
    'float',
    'array',
    'regexp',
    'object',
    'method',
    'email',
    'number',
    'date',
    'url',
    'hex'
  ];

  if (custom.indexOf(ruleType) > -1) {
    if (!isType(value, ruleType)) {
      errors.push(
        format(options.messages.types[ruleType], options.name, ruleType)
      );
    }
    // straight typeof check
  } else if (ruleType && typeof value !== ruleType) {
    errors.push(
      format(options.messages.types[ruleType], options.name, ruleType)
    );
  }

  return errors;
}

export default type;
