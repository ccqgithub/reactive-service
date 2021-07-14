import { Observable } from 'rxjs';
import ValidateError from './error';

export type FieldRule = {
  type?: string;
  required?: boolean;
  len?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: string[];
  notWhitespace?: boolean;
  validator?: Validator;
  message?: string;
  messages?: Record<string, string>;
};

export type Validator = (
  rule: FieldRule,
  value: any,
  Options: Record<string, any>
) => string[] | Promise<string[]> | Observable<string[]>;

export type Values = {
  fields?: Values;
  [key: string]: any;
};

export type Schema<V extends Values> = {
  [Key in keyof V]: V[Key] extends { fields: Record<string, any> }
    ? {
        rules?: FieldRule[];
        fields:
          | Schema<V[Key]['fields']>
          | ((key: string) => Schema<V[Key]['fields']>);
      }
    : {
        rules?: FieldRule[];
        defaultValue: V[Key];
      };
};

export type Data<V extends Values> = {
  [Key in keyof V]: V[Key] extends { fields: Record<string, any> }
    ? Data
    : {
        rules?: FieldRule[];
        defaultValue: V[Key];
      };
}

type vs = {
  username: string;
  email: string;
  bag: {
    fields: {
      color: string;
    };
  };
  friends: {
    arrayFields: {
      name: string;
    };
  };
};

const s: FieldsSchema<vs> = {
  username: {
    rules: [],
    defaultValue: ''
  },
  email: {
    rules: [],
    defaultValue: ''
  },
  bag: {
    rules: [],
    fields: {
      color: {
        rules: [],
        defaultValue: ''
      }
    }
  },
  friends: {
    rules: [],
    fields: (key) => ({
      name: {
        rules: [],
        defaultValue: 'string'
      }
    })
  }
};
