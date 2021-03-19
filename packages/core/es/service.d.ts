import { Observable } from 'rxjs';
import { InjectorProvide, InjectorProvider } from './types';
import State, { StateData } from './state';
export default class Service<S extends StateData = StateData> extends State<S> {
    private $_injector;
    constructor(initialState: S, providers?: InjectorProvider[]);
    subscribe(ob$: Observable<any>, ...args: any[]): void;
    getService(provide: InjectorProvide): Record<string, any>;
}
