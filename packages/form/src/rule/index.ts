import required from './required';
import notWhitespace from './not-whitespace';
import type from './type';
import range from './range';
import enumRule from './enum';
import pattern from './pattern';

export default {
  required,
  notWhitespace,
  type,
  range,
  enum: enumRule,
  pattern
};
