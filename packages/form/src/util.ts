const formatRegExp = /%[sdj%]/g;

export const warning = (): void => {};

export function format(
  f: ((...args: any[]) => string) | string,
  ...args: any[]
): any {
  let i = 0;
  const len = args.length;

  if (typeof f === 'function') {
    return f(...args);
  }

  if (typeof f === 'string') {
    const str = f.replace(formatRegExp, (x: string): string => {
      if (x === '%%') {
        return '%';
      }
      if (i >= len) {
        return x;
      }
      switch (x) {
        case '%s':
          return args[i++];
        case '%d':
          return args[i++];
        case '%j':
          try {
            return JSON.stringify(args[i++]);
          } catch (_) {
            return '[Circular]';
          }
        default:
          return x;
      }
    });
    return str;
  }
  return f;
}

function isNativeStringType(type?: string) {
  return (
    type === 'string' ||
    type === 'url' ||
    type === 'hex' ||
    type === 'email' ||
    type === 'date' ||
    type === 'pattern'
  );
}

export function isEmptyValue(value: unknown, type?: string): boolean {
  if (value === undefined || value === null) {
    return true;
  }
  if (type === 'array' && Array.isArray(value) && !value.length) {
    return true;
  }
  if (isNativeStringType(type) && typeof value === 'string' && !value) {
    return true;
  }
  return false;
}
