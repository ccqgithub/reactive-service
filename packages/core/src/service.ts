import { BehaviorSubject, Observable, Subject } from 'rxjs';
import Disposable from './disposable';
import Injector from './injector';
import { debug, empty } from './util';
import {
  InjectProvider,
  InjectProvide,
  InjectService,
  InjectClass
} from './types';

export type ServiceState = Record<string, any>;
export type ServiceSources<S> = Record<
  keyof S,
  BehaviorSubject<any> | Subject<any>
>;
export type ServiceActions<AK extends string> = Record<AK, Observable<any>>;
export type ServiceOptions<S, AK extends string> = {
  state?: S;
  actions?: AK[];
  providers?: InjectProvider[];
};

// Service 服务基类
export default class Service<
  S extends ServiceState = ServiceState,
  AK extends string = string
> extends Disposable implements InjectClass {
  private $_injector: Injector;
  $_parentInjector?: InjectClass['$_parentInjector'];
  $_getParentInjector?: InjectClass['$_getParentInjector'];

  // displayName, for debug
  displayName = '';
  // notify sources
  $$: ServiceSources<S> = {} as ServiceSources<S>;
  // actions
  $: ServiceActions<AK> = {} as ServiceActions<AK>;
  // state
  get state(): S {
    const state = {} as S;
    (Object.keys(this.$$) as (keyof S)[]).forEach((key) => {
      if (this.$$[key] instanceof BehaviorSubject) {
        state[key] = (this.$$[key] as BehaviorSubject<any>).value;
      }
    });
    return state;
  }

  constructor(args: ServiceOptions<S, AK> = {}) {
    super();
    // provide services
    this.$_injector = new Injector(
      args.providers || [],
      Injector.getParentInjector(this)
    );
    this.beforeDispose(() => {
      this.$_injector.dispose();
    });
    // displayName
    if (!this.displayName) {
      this.displayName = this.constructor.name;
      debug(
        `[Service ${this.displayName}]: For better debugging, you'd better add an attribute 'displayName' to each service class.`,
        'warn'
      );
    }
    // init state
    const initialState = (args.state || {}) as S;
    (Object.keys(initialState) as (keyof S)[]).forEach((key) => {
      if (initialState[key] === undefined || initialState[key] === empty) {
        this.$$[key] = new Subject();
      } else {
        this.$$[key] = new BehaviorSubject(initialState[key]);
      }
    });
    // init actions
    const actions = args.actions || [];
    actions.forEach((key) => {
      this.$[key] = new Subject();
    });
    // debugs: update state
    Object.keys(this.$$).forEach((key) => {
      this.useSubscribe(this.$$[key], {
        next: (v: any) => {
          debug(
            `[Service ${this.displayName}]: set new state [${key}].`,
            'info'
          );
          debug(v, 'info');
        }
      });
    });
    // debugs: new action
    (Object.keys(this.$) as AK[]).forEach((key) => {
      this.useSubscribe(this.$[key], {
        next: (v: any) => {
          debug(
            `[Service ${this.displayName}]: receive new action [${key}].`,
            'info'
          );
          debug(v, 'info');
        }
      });
    });
  }

  useService<S extends InjectService = InjectService>(
    provide: InjectProvide
  ): S {
    const injector = this.$_injector;
    return injector.get<S>(provide);
  }

  useSubscribe<T = any>(ob: Observable<T>, ...args: any[]): void {
    const subscription = ob.subscribe(...args);
    this.beforeDispose(() => {
      subscription.unsubscribe();
    });
  }
}
