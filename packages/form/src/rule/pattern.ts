import * as util from '../util';
import { FieldRule } from '../types';

function pattern(
  rule: FieldRule,
  value: any,
  options: Record<string, any>
): string[] {
  if (!rule.pattern) return [];

  const errors: string[] = [];

  if (rule.pattern instanceof RegExp) {
    // if a RegExp instance is passed, reset `lastIndex` in case its `global`
    // flag is accidentally set to `true`, which in a validation scenario
    // is not necessary and the result might be misleading
    rule.pattern.lastIndex = 0;
    if (!rule.pattern.test(value)) {
      errors.push(
        util.format(
          options.messages.pattern.mismatch,
          options.name,
          value,
          rule.pattern
        )
      );
    }
  } else if (typeof rule.pattern === 'string') {
    const _pattern = new RegExp(rule.pattern);
    if (!_pattern.test(value)) {
      errors.push(
        util.format(
          options.messages.pattern.mismatch,
          options.fullField,
          value,
          rule.pattern
        )
      );
    }
  }

  return errors;
}

export default pattern;
