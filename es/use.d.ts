import { Observable } from 'rxjs';
import Service from './service';
export declare type GetService = (name: string) => Service<any>;
export declare function useGetService(): GetService;
export declare function useService(name: string): Service<any>;
export declare function useServices(names: string[]): Record<string, Service<any>>;
declare type SubscribeFunc = (ob$: Observable<any>, ...args: any[]) => void;
export declare function useSubscribe(): SubscribeFunc;
declare type ComputeFunc = (arg: {
    getService: ReturnType<typeof useGetService>;
}) => any;
export declare function useCompute(computeFunc: ComputeFunc): any;
export {};
