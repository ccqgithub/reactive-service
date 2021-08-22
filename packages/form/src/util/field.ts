import { KeyPathValue } from '../types';

export const getPathField = <S, P extends string>(
  state: S,
  path: P
): KeyPathValue<S, P> => {
  return path
    .split(/[.[\]]+/)
    .reduce((prev, key) => prev[key], state) as KeyPathValue<S, P>;
};

export const setPathField = <S, P extends string>(
  state: S,
  path: P,
  value: KeyPathValue<S, P>
): S => {
  path.split(/[.[\]]+/).reduce((prev, key, index, array) => {
    if (array.length === index + 1) {
      prev[key] = value;
    }
    return prev[key];
  }, state);
  return state;
};
