# apis

## 概览

```tsx
import { Service, ServiceInjector, useService, useBehavior, useObservable, useObservableError, useSubscribe, Injector, InjectionToken, config } from '@reactive-service/react';
```

## Service

`Service`基类，一个内置的服务类，能够很好第跟`rxjs`和`依赖注入`结合使用。

```tsx
import { Service } from "@reactive-service/react";

type State = {
  loginUser: User | null;
}
type Actions = {
  login: LoginParams;
}
type Events = {
  notify: string;
}

export default class AppService<
  State,
  Actions,
  Events
> {
  testService: TestService;

  constructor({ userService: getService }) {
    super({
      state: {
        loginUser: null;
      },
      actions: ['login'],
      events: ['notify']
    });
  }

  // 类里面也能获取已经注入的 service
  this.testService = getService(TestService);
}
```

这样的服务类实例`service`具有以下属性和方法：

- `service.state`: 服务当前状态（如`service.state.loginUser`）。
- `service.$s`: 服务的可观察状态，是一个[`BehaviorSubject`](https://rxjs-dev.firebaseapp.com/guide/subject#behaviorsubject)实例，（如`service.$s.loginUser`）。
- `service.$a`: 服务的Actions，是一个[`Subject`](https://rxjs.dev/guide/subject)实例，（如`service.$a.login`）。
- `service.$e`: 服务的Events，是一个[`Subject`](https://rxjs.dev/guide/subject)实例，（如`service.$e.notify`）。
- `service.subscribe(...args)`: 辅助方法，用来在`service`内部订阅[`Observable`](https://rxjs.dev/guide/observable)，通过它产生的订阅，会在`service`销毁时自动取消订阅。
- `service.dispose()`: 销毁`service`，如果使用依赖注入，一般不需要主动调用，注入器会自动管理。
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
```

## ServiceInjector

依赖注入器，用来在组件树中的某处注入服务，供子节点使用。

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

在组件中使用服务。

默认情况下，如果请求的`service`没有被祖先注入过，则会抛出异常。可以传入`{ optional: true }`参数来让注入可选，这样没有提供时不会抛出异常，而是返回`null`。

```tsx
import { useService } from "@reactive-service/react";

function Child() {
  // appService 不会为 null
  const appService = useService(AppService);
  // logger 可能为 null
  const logger = useService(Logger, { optional: true });
  if (logger) {
    //
  }
  //...
}
```

## useBehavior

订阅`BehaviorSubject`的值作为组件状态（对于上面`Service`中的`state`）。

```tsx
import { useService, useBehavior } from "@reactive-service/react";

function Child() {
  const appService = useService(AppService);
  const loginUser = useBehavior(appService.$s.loginUser);
  
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

- `useSubscribe(observable, { next: (v) => {}, error: (err) => {}, complete: () => {} })`

订阅`observable`。

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

用来注入`非class`的值，比如一个简单的对象，字符串等。

```ts
// base-url-token.ts
import { ServiceInjector InjectionToken } from "@reactive-service/react";

const Token = new InjectionToken<string>("/test");;

export default Token;
```

```tsx
import { ServiceInjector InjectionToken, useService } from "@reactive-service/react";
import BaseUrlToken from './base-url-token';

function Component() {
  const [providers] = useState(() => [BaseUrlToken]);

  return (
    <ServiceInjector providers={providers}>
      {/* ... */}
    </ServiceInjector>
  );
}

function Child() {
  const baseUrl = useService(BaseUrlToken);
  
  //...
}
```

## config

内部配置：

- `logLevel`： 错误等级，`info`、`warn`、`error`、`never`。
- `log`: `log`函数。

```tsx
import { config } from "@reactive-service/react";

config({
  logLevel: process.env.NODE_ENV === 'development' ? 'info' : 'error',
  log: (msg, type = 'info') => {
    console && console[type] && console[type](msg);
  }
});
```
