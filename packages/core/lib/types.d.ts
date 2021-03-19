declare type AnyFunction = (...args: any[]) => any;
declare type AnyObject = Record<string | number, any>;
export interface InjectorClass {
    new (...args: any[]): any;
    [x: number]: any;
    [y: string]: any;
}
export declare type InjectorProvide = string | AnyObject;
export declare type InjectorService = AnyObject;
export declare type InjectorProvider = InjectorClass | {
    provide: InjectorProvide;
    useClass?: InjectorClass | null;
    useValue?: InjectorService | null;
    dispose?: AnyFunction | null;
};
export {};
