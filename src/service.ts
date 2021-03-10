import { Subject, BehaviorSubject, ReplaySubject, Observable } from 'rxjs';
import { observable as mObservable, runInAction } from 'mobx';
import Provider, { ProviderConfigs } from './provider';
import { AnyFunction } from './types';

export type ServiceSource =
  | Subject<any>
  | BehaviorSubject<any>
  | ReplaySubject<any>;

export type ServiceSources = {
  [key: string]: ServiceSource;
};

export type ServiceActions = {
  [key: string]: Subject<any>;
};

export type ServiceState = Record<string, unknown>;

export type SourceConfig = {
  type: 'normal' | 'behavior' | 'replay';
  default?($data: ServiceState): any;
  params?: {
    bufferSize?: number;
    windowTime?: number;
  };
};

export type SourceConfigs = {
  [key: string]: 'normal' | 'behavior' | 'replay' | SourceConfig;
};

export type ServiceConfigs<S extends ServiceState> = {
  providers?: ProviderConfigs;
  state?: S;
  sources?: SourceConfigs;
  actions?: string[];
};

// Service 服务基类
export default class Service<S extends ServiceState = ServiceState> {
  // clear 时清理的回调函数
  private $_clearCallbacks: AnyFunction[] = [];
  // service provider
  private $_serviceProvider: Provider;
  // data
  readonly state: S;
  // sources
  sources: ServiceSources = {};
  // actions
  actions: ServiceActions = {};

  constructor(parentProvider: Provider | null = null) {
    // setup options
    const {
      providers = {},
      state = {} as S,
      sources = {},
      actions = []
    }: ServiceConfigs<S> = this.setup();
    // services
    this.$_serviceProvider = new Provider(providers, parentProvider);
    // data
    this.state = mObservable(state);
    // sources
    Object.keys(sources).forEach((key) => {
      const source = sources[key];
      const conf = typeof source === 'string' ? { type: source } : source;
      let params, val, vals;
      switch (conf.type) {
        // subject, no default value
        case 'normal':
          this.sources[key] = new Subject();
          break;
        // save last value
        case 'behavior':
          if (typeof conf.default === 'function') {
            val = conf.default(this.state);
          } else {
            val = conf.default;
          }
          this.sources[key] = new BehaviorSubject(val);
          break;
        // replay values
        case 'replay':
          params = conf.params || {};
          if (typeof conf.default === 'function') {
            vals = conf.default(this.state);
          } else {
            vals = conf.default || [];
          }
          if (!Array.isArray(vals)) {
            throw new Error('Default value for replay sourc must be an array!');
          }
          this.sources[key] = new ReplaySubject(
            params.bufferSize,
            params.windowTime
          );
          vals.forEach((v) => {
            this.sources[key].next(v);
          });
          break;
      }
    });
    // actions
    actions.forEach((key) => {
      this.actions[key] = new Subject();
    });
  }

  protected setup(): ServiceConfigs<S> {
    return {
      providers: {},
      state: {
        // key: value
      } as S,
      sources: {
        // a: 'normal',
        // b: {
        //   type: 'behavior',
        //   default({ $data }) {
        //     return $data.b;
        //   }
        // },
        // c: {
        //   type: 'replay',
        //   default: () => [1, 2, 3],
        //   params: {
        //     bufferSize: 3,
        //     windowTime: 2000
        //   }
        // }
      },
      actions: [
        // 'a',
        // 'b'
      ]
    };
  }

  getState(): S {
    return this.state;
  }

  mutation(fn: (state: S) => void): void {
    runInAction(() => {
      fn(this.state);
    });
  }

  subscribe(ob$: Observable<any>, ...args: any[]): void {
    const subscription = ob$.subscribe(...args);
    this.beforeClear(() => {
      subscription.unsubscribe();
    });
  }

  useService(name: string): Service<S> {
    const provider = this.$_serviceProvider;
    return provider.get(name);
  }

  // 添加清理回调
  beforeClear(fn: AnyFunction): void {
    this.$_clearCallbacks.push(fn);
  }

  // 服务类不再使用时，清理
  // 主要用于清理长时间订阅等工作
  // 子类的这个方法里需要调用`super.clear()`
  dispose(): void {
    // clear service
    this.$_serviceProvider && this.$_serviceProvider.dispose();
    // clear other callbacks
    this.$_clearCallbacks.forEach((fn) => {
      fn();
    });
    this.$_clearCallbacks = [];
  }
}
