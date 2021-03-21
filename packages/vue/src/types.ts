type AnyFunction = (...args: any[]) => any;

type AnyObject = Record<string | number, any>;

export interface InjectorClass {
  new (...args: any[]): any;
  [x: number]: any;
  [y: string]: any;
}

export type InjectorProvide = string | AnyObject;

export type InjectorService = AnyObject;

export type InjectorProvider =
  | InjectorClass
  | {
      provide: InjectorProvide;
      useClass?: InjectorClass | null;
      useValue?: InjectorService | null;
      dispose?: AnyFunction | null;
    };
