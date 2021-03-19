import { BehaviorSubject, Observable } from 'rxjs';
import Disposable from './disposable';
export declare type StateData = Record<string, any>;
export declare type StateMutation<S> = (state: S) => S;
export default class State<S extends StateData = StateData> extends Disposable {
    private readonly _state$$;
    name?: string;
    state$$: BehaviorSubject<S>;
    get state(): S;
    constructor(initialValue: S);
    protected select<N = any>(mapFn: (state: S) => N): BehaviorSubject<N>;
    protected selectAsObservable<N = any>(mapFn: (state: S) => N): Observable<N>;
    protected setState(newState: S): void;
    protected setState(mutation: StateMutation<S>): void;
}
