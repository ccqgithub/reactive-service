export const getPathField = (state: Record<string, any>, path: string): any => {
  return path.split(/[.[\]]+/).reduce((prev, key) => prev[key], state);
};

export const setPathField = (
  state: Record<string, any>,
  path: string,
  value: any
): any => {
  path.split(/[.[\]]+/).reduce((prev, key, index, array) => {
    if (array.length === index + 1) {
      prev[key] = value;
    }

    return prev[key];
  }, state);
};
