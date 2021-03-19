import { Observable } from 'rxjs';
import { InjectorProvide, InjectorService } from '@reactive-service/core';
import { GetService } from './types';
export declare function useGetService(): GetService;
export declare function useService(provide: InjectorProvide): InjectorService;
export declare function useServices(provides: InjectorProvide[]): InjectorService[];
export declare function useObservable<T = any>(ob$: Observable<T>, defaultValue?: unknown): any;
