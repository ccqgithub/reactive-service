import { Observable } from 'rxjs';
import { InjectProvide, InjectService } from '@reactive-service/core';
import { GetService } from './types';
export declare function useGetService(): GetService;
export declare function useService<S extends InjectService = InjectService>(provide: InjectProvide): S;
export declare function useServices(provides: InjectProvide[]): InjectService[];
export declare function useObservable<T = any>(ob$: Observable<T>, defaultValue?: T): any;
export declare function useObservableError<T = any>(ob$: Observable<T>, onlyAfter?: boolean): any;
