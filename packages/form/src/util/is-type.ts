import * as pattern from './patterns';

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
  function(value: any) {
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

export default function isType(value: any, type: string) {
  const typeValidate = (types as any)[type];
  if (!typeValidate) return false;
  return typeValidate(value);
}
