const formatRegExp = /%[sdj%]/g;

export default function format(
  f: ((...args: any[]) => string) | string,
  ...args: any[]
): string {
  let i = 0;
  const len = args.length;

  if (typeof f === 'function') {
    return f(...args);
  }

  const str = f.replace(formatRegExp, (x: string): string => {
    if (x === '%%') {
      return '%';
    }
    if (i >= len) {
      return x;
    }
    switch (x) {
      case '%s':
        return `${args[i++]}`;
      case '%d':
        return `${args[i++]}`;
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
