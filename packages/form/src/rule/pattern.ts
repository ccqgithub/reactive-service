import * as util from '../util';
import { FieldRule, FieldValue, FormData } from '../types';

function pattern(
  rule: FieldRule,
  value: FieldValue,
  source: FormData,
  options: Record<string, any>
): string[] {
  const errors = [];

  if (rule.pattern) {
    if (rule.pattern instanceof RegExp) {
      // if a RegExp instance is passed, reset `lastIndex` in case its `global`
      // flag is accidentally set to `true`, which in a validation scenario
      // is not necessary and the result might be misleading
      rule.pattern.lastIndex = 0;
      if (!rule.pattern.test(value)) {
        errors.push(
          util.format(
            options.messages.pattern.mismatch,
            options.fullField,
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
  }

  return errors;
}

export default pattern;
