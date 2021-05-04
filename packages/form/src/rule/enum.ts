import * as util from '../util';
import { FieldRule, RSFormData } from '../types';

const ENUM = 'enum';

function enumerable(
  rule: FieldRule,
  value: any,
  source: RSFormData,
  options: Record<string, any>
): string[] {
  if (!rule[ENUM] || !Array.isArray(rule[ENUM])) return [];

  const errors: string[] = [];
  if ((rule[ENUM] as string[]).indexOf(value) === -1) {
    errors.push(
      util.format(
        options.messages[ENUM],
        options.fullField,
        (rule[ENUM] as string[]).join(', ')
      )
    );
  }

  return errors;
}

export default enumerable;
