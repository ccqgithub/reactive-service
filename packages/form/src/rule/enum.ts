import * as util from '../util';
import { Rule } from '../types';

const ENUM = 'enum';

/**
 *  Rule for validating a value exists in an enumerable list.
 *
 *  @param rule The validation rule.
 *  @param value The value of the field on the source object.
 *  @param source The source object being validated.
 *  @param errors An array of errors that this rule may add
 *  validation errors to.
 *  @param options The validation options.
 *  @param options.messages The validation messages.
 */
function enumerable(
  rule: Rule,
  value: any,
  source: any,
  errors: any,
  options: any
): void {
  rule[ENUM] = Array.isArray(rule[ENUM]) ? rule[ENUM] : [];
  if (rule[ENUM].indexOf(value) === -1) {
    errors.push(
      util.format(options.messages[ENUM], rule.fullField, rule[ENUM].join(', '))
    );
  }
}

export default enumerable;
