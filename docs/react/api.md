# apis

## 概览

```tsx
import { Service, ServiceInjector, useService, useBehavior, useObservable, useObservableError, useSubscribe, withInjector, Injector, InjectionToken, config } from '@reactive-service/react';
```

## Service

继承`Service`基类，创建一个服务类。

```tsx
import { Service } from "@reactive-service/react";

type AppServiceState = {
  loginUser: User | null;
}
type AppServiceActions = {
  login: LoginParams;
}
type AppServiceEvents = {
  notify: string;
}

export default class AppService<
  AppServiceState,
  AppServiceActions,
  AppServiceEvents
> {
  testService: TestService;

  constructor({ userService }) {
    super({
      state: {
        loginUser: null;
      },
      actions: ['login'],
      events: ['notify']
    });
  }

  // 类里面也能获取已经注入的 service
  this.testService = userService(TestService);
}
```

这样的服务类实例`service`具有以下属性和方法：

- `service.state`: 服务当前状态（如`service.state.loginUser`）。
- `service.$$`: 服务的可观察状态，是一个[`BehaviorSubject`](https://rxjs-dev.firebaseapp.com/guide/subject#behaviorsubject)实例，（如`service.$$.loginUser`）。
- `service.$`: 服务的Actions，是一个[`Subject`](https://rxjs.dev/guide/subject)实例，（如`service.$.login`）。
- `service.$e`: 服务的Events，是一个[`Subject`](https://rxjs.dev/guide/subject)实例，（如`service.$e.notify`）。
- `service.subscribe(...args)`: 辅助方法，用来在`service`内部订阅[`Observable`](https://rxjs.dev/guide/observable)，通过它产生的订阅，会在`service`销毁时取消订阅。
- `service.dispose()`: 销毁`service`。
- `service.beforeDispose(fn)`: 添加一个销毁函数，这个函数`fn`会在`service`销毁时执行。

service.subscribe 参数：

```tsx
service.subscribe({
  next: (value) => {
    ///
  },
  error: (error) => {

  },
  complete: () => {
    //
  }
});

service.subscribe(nextFn?, errorFn?, completeFn?);
```

## ServiceInjector

```tsx
import { ServiceInjector } from "@reactive-service/react";

function Component() {
  const providers = useState(() => {
    return [
      Logger,
      {
        provide: Logger,
        useClass: Logger
      },
      {
        provide: Logger,
        useValue: new Logger(),
        dispose: (logger) => {
          logger.dispose();
        }
      },
      {
        provide: OldLogger,
        useExisting: NewLogger
      },
      {
        provide: Logger,
        useFactory: ({ useService }) => {
          const otherService = useService(OtherService);
          const logger = new Logger();
          logger.init(otherService.state.xxx);
          return logger;
        },
        dispose: (logger) => {
          logger.dispose();
        }
      },
    ];
  });

  return (
    <ServiceInjector providers={providers}>
      {
        //...children
      }
    </ServiceInjector> 
  )
}
```

> `providers` 不能使用内联的方式`providers={[]}`, 因为这样每次渲染都会更新`providers`, 从而使子组件得到的实例产生不必要的更新。

## useService

```tsx
import { useService } from "@reactive-service/react";

function Child() {
  const appService = useService(AppService);
  const logger = useService(Logger, { optional: true });
  //...
}
```

> 默认情况下，如果请求的`service`没有被祖先注入过，则会抛出异常。可以传入`{ optional: true }`参数来让注入可选，这样没有提供时不会抛出异常，而是返回`null`。

## useBehavior

订阅`BehaviorSubject`的值作为组件状态。

```tsx
import { useService, useBehavior } from "@reactive-service/react";

function Child() {
  const appService = useService(AppService);
  const loginUser = useBehavior(appService.$$.loginUser);
  
  return (
    <div>{username: loginUser.name}</div>
  );
}
```

## useObservable(observable, defaultValue)

订阅`Observable`的值作为组件状态。

```tsx
import { useService, useObservable } from "@reactive-service/react";

function Child() {
  const appService = useService(AppService);
  const lastNotify = useObservable(appService.$e.notify, null);
  
  return (
    <div>{lastNotify: lastNotify}</div>
  );
}
```

## useObservableError(observable, defaultValue, opts = { onlyAfter: true })

订阅`Observable`的`error`作为组件状态。`defaultValue`为没有错误时的默认值。

如果`onlyAfter`为`true`，并且错误在订阅之前产生，则忽略该错误。

```tsx
import { useService, useObservableError } from "@reactive-service/react";

function Child() {
  const appService = useService(AppService);
  const lastError = useObservableError(appService.$e.notify, null, { onlyAfter: true });
  
  return (
    <div>{error: lastError.message}</div>
  );
}
```

## useSubscribe

- `useSubscribe(observable, (v) => {}, (err) => {}, () => {})`
- `useSubscribe(observable, { next: (v) => {}, error: (err) => {}, complete: () => {} })`

订阅`observable`。

## withInjector({ providers: providers })(Component)

一般测试，或者封装路由组件列表时使用，因为路由列表时显式添加provider不太方便

```tsx
import { withInjector } from "@reactive-service/react";

const WrrappedComponent = () => {};
export default withInjector({
  providers: [
    ...providers
  ]
})(WrrappedComponent);
```

## Injector

用来在非组件的情况下使用，比如单元测试。

```tsx
import { Injector } from "@reactive-service/react";

class TestService {
  constructor({ useService }) {
    const depService = useService(DepService);
  }
}

const injector = new Injector({
  providers: [ DepService, TestService ]
});

const testService = injector.get(TestService);
```

## InjectionToken

```tsx
import { ServiceInjector InjectionToken } from "@reactive-service/react";

function Component() {
  const BaseUrlToken = useState(() => {
    const token = new InjectionToken<string>("/xxx");
    return token;
  });
  const [providers] = useState(() => [BaseUrlToken]);

  return (
    <ServiceInjector providers={providers}>
      {/* ... */}
    </ServiceInjector>
  );
}
```

## config

```tsx
import { config } from "@reactive-service/react";

config({
  logLevel: process.env.NODE_ENV === 'development' ? 'info' : 'error',
  log: (msg, type = 'info') => {
    console && console[type] && console[type](msg);
  }
});
```

内部配置：

- `logLevel`： 错误等级，`info`、`warn`、`error`、`never`。
- `log`: `log`函数。
