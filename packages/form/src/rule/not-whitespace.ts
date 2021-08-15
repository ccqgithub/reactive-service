import { FieldRule } from '../types';
import format from '../util/format';

function notWhitespace(
  rule: FieldRule,
  value: any,
  options: Record<string, any>
): string[] {
  if (!rule.notWhitespace) return [];

  const errors: string[] = [];
  if (/^\s+$/.test(value) || value === '') {
    errors.push(format(options.messages.notWhitespace, options.name));
  }

  return errors;
}

export default notWhitespace;
