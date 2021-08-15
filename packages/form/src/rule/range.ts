import { FieldRule } from '../types';
import format from '../util/format';

function range(
  rule: FieldRule,
  value: any,
  options: Record<string, any>
): string[] {
  const errors: string[] = [];

  const len = typeof rule.len === 'number';
  const min = typeof rule.min === 'number';
  const max = typeof rule.max === 'number';

  if (!len && !min && !max) return errors;

  // 正则匹配码点范围从U+010000一直到U+10FFFF的文字（补充平面Supplementary Plane）
  const spRegexp = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
  let val = value;
  let key = null;
  const num = typeof value === 'number';
  const str = typeof value === 'string';
  const arr = Array.isArray(value);
  if (num) {
    key = 'number';
  } else if (str) {
    key = 'string';
  } else if (arr) {
    key = 'array';
  }
  // if the value is not of a supported type for range validation
  // the validation rule rule should use the
  // type property to also test for a particular type
  if (!key) {
    return errors;
  }

  if (arr) {
    val = value.length;
  }
  if (str) {
    // 处理码点大于U+010000的文字length属性不准确的bug，如"𠮷𠮷𠮷".lenght !== 3
    val = value.replace(spRegexp, '_').length;
  }
  if (len) {
    if (val !== rule.len) {
      errors.push(format(options.messages[key].len, options.name, rule.len));
    }
  } else if (min && !max && val < (rule.min as number)) {
    errors.push(format(options.messages[key].min, options.name, rule.min));
  } else if (max && !min && val > (rule.max as number)) {
    errors.push(format(options.messages[key].max, options.name, rule.max));
  } else if (
    min &&
    max &&
    (val < (rule.min as number) || val > (rule.max as number))
  ) {
    errors.push(
      format(options.messages[key].range, options.name, rule.min, rule.max)
    );
  }

  return errors;
}

export default range;
