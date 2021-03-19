import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import Disposable from './disposable';

export type StateData = Record<string, any>;

export type StateMutation<S> = (state: S) => S;

export default class State<S extends StateData = StateData> extends Disposable {
  private readonly _state$$: BehaviorSubject<S>;

  name?: string;

  state$$: BehaviorSubject<S>;

  get state(): S {
    return this._state$$.getValue();
  }

  constructor(initialValue: S) {
    super();
    this._state$$ = new BehaviorSubject<S>(initialValue);
    this.state$$ = this.select<S>((state$$) => state$$);
  }

  protected select<N = any>(mapFn: (state: S) => N): BehaviorSubject<N> {
    const newValue$$ = new BehaviorSubject<N>(mapFn(this.state));
    const subscription = this._state$$
      .pipe(
        map((state: S) => mapFn(state)),
        distinctUntilChanged()
      )
      .subscribe(newValue$$);
    this.beforeDispose(subscription.unsubscribe);
    return newValue$$;
  }

  protected selectAsObservable<N = any>(mapFn: (state: S) => N): Observable<N> {
    return this._state$$.asObservable().pipe(
      map((state: S) => mapFn(state)),
      distinctUntilChanged()
    );
  }

  protected setState(newState: S): void;
  protected setState(mutation: StateMutation<S>): void;
  protected setState(stateOrMutation: S | StateMutation<S>): void {
    const newState =
      typeof stateOrMutation === 'function'
        ? (stateOrMutation as StateMutation<S>)(this.state)
        : stateOrMutation;

    this._state$$.next({
      ...this.state,
      ...newState
    });
  }
}
