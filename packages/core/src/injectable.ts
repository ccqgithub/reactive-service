import Injector from './injector';
import { AnyConstructor } from './types';

export interface Injectable {
  providedIn?: 'root' | 'any' | null;
}

export const Injectable = (args: Injectable = {}) => {
  return (constructor: AnyConstructor) => {
    return class extends constructor {
      $_providedIn: 'root' | 'any' | null = 'any';
    }
  };
};
