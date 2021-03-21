import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import Disposable from './disposable';

export type StateData = Record<string, any>;

export type StateMap<S, N> = (state: S) => N;

export type StateMutation<S, N> = (state: S) => N;

export type StateCompare<S> = (x: S, y: S) => boolean;

export default class State<S extends StateData = StateData> extends Disposable {
  state$$: BehaviorSubject<S>;

  get state(): S {
    return this.state$$.value;
  }

  constructor(initialValue: S) {
    super();
    this.state$$ = new BehaviorSubject<S>(initialValue);
  }

  protected select<N>(
    mapFn: StateMap<S, N>,
    compare: StateCompare<S> = (x, y) => x === y
  ): BehaviorSubject<N> {
    const defaultValue = mapFn(this.state);
    const subject = new BehaviorSubject(defaultValue);
    const subscription = this.state$$
      .pipe(
        distinctUntilChanged(compare),
        map((v) => mapFn(v))
      )
      .subscribe(subject);
    this.beforeDispose(() => {
      subscription.unsubscribe();
    });

    return subject;
  }

  protected setState(newState: Partial<S>): void {
    this.state$$.next({
      ...this.state,
      ...newState
    });
  }
}
