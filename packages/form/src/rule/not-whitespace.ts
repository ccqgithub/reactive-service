import * as util from '../util';
import { FieldRule, RSFormData } from '../types';

function notWhitespace(
  rule: FieldRule,
  value: any,
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
