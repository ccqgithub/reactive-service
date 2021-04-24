import * as util from '../util';
import { FieldRule, FieldValue, RSFormData } from '../types';

function notWhitespace(
  rule: FieldRule,
  value: FieldValue,
  source: RSFormData,
  options: Record<string, any>
): string[] {
  if (!rule.notWhitespace) return [];

  const errors: string[] = [];
  if (/^\s+$/.test(value) || value === '') {
    errors.push(util.format(options.messages.notWhitespace, options.fullField));
  }

  return errors;
}

export default notWhitespace;