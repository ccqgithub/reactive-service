import * as util from '../util';
import { FieldRule } from '../types';

/* eslint max-len:0 */

const pattern = {
  // http://emailregex.com/
  email:
    // eslint-disable-next-line no-useless-escape
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  url: new RegExp(
    '^(?!mailto:)(?:(?:http|https|ftp)://|//)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-*)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-*)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$',
    'i'
  ),
  hex: /^#?([a-f0-9]{6}|[a-f0-9]{3})$/i
};

const types = {
  integer(value: any) {
    return types.number(value) && parseInt(value, 10) === value;
  },
  float(value: any) {
    return types.number(value) && !types.integer(value);
  },
  array(value: any) {
    return Array.isArray(value);
  },
  regexp(value: any) {
    if (value instanceof RegExp) {
      return true;
    }
    try {
      return !!new RegExp(value);
    } catch (e) {
      return false;
    }
  },
  date(value: any) {
    return (
      typeof value.getTime === 'function' &&
      typeof value.getMonth === 'function' &&
      typeof value.getYear === 'function' &&
      !isNaN(value.getTime())
    );
  },
  number(value: any) {
    if (isNaN(value)) {
      return false;
    }
    return typeof value === 'number';
  },
  object(value: any) {
    return typeof value === 'object' && !types.array(value);
  },
  method(value: any) {
    return typeof value === 'function';
  },
  email(value: any) {
    return (
      typeof value === 'string' &&
      !!value.match(pattern.email) &&
      value.length < 255
    );
  },
  url(value: any) {
    return typeof value === 'string' && !!value.match(pattern.url);
  },
  hex(value: any) {
    return typeof value === 'string' && !!value.match(pattern.hex);
  }
};

function type(
  rule: FieldRule,
  value: any,
  options: Record<string, any>
): string[] {
  const errors: string[] = [];
  const ruleType = rule.type;

  if (!ruleType) return errors;

  if (util.isEmptyValue(value, rule.type)) {
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
    if (!(types as any)[ruleType](value)) {
      errors.push(
        util.format(options.messages.types[ruleType], options.name, ruleType)
      );
    }
    // straight typeof check
  } else if (ruleType && typeof value !== ruleType) {
    errors.push(
      util.format(options.messages.types[ruleType], options.name, ruleType)
    );
  }

  return errors;
}

export default type;
