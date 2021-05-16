# 依赖注入

## 什么是依赖注入？

- `依赖项`：是指`某个类`或`某个组件`执行其功能所需的`服务或对象`。为了便于描述，我们后面都统称为`服务`。
- `依赖项注入（DI）`：是一种设计模式，在这种设计模式中，类和组件会`从外部源请求依赖项`而不是`自己创建`它们。

一个简单的例子，就是[`Context Api`](https://zh-hans.reactjs.org/docs/context.html)，子组件需要某个服务的时候，从`context`获取就行，至于是哪个`Provider`提供的，完全由父组件控制。

事实上，`@reactive-service/react`的依赖注入正是通过`Context Api`来实现的，只是在这基础上扩展了一套使用方式而已。

## 定义服务

一般来说，一个服务可以是任意值。

但是为了更全面的依赖注入功能，我们先使用`类`作为示例。最好有一个`dispose`方法，用来执行服务实例销毁工作（之后会介绍具体细节）。

在实际项目中，带`状态管理`的服务我们都推荐使用使用前面介绍的[响应式 Service](./service.md)。

```ts
// services/test-a.service.ts
export default class TestAService {
  data = null;

  setData(d) {
    this.data = d;
  }

  getData() {
    return this.data;
  }

  dispose() {
    this.data = null;
  }
}
```

## 服务注入器：注入服务

你可以在你的组件树中的任何地方，提供一个`服务注入器`，这个注入器负责向子孙组件提供一系列服务。

子孙组件使用注入器提供的一个服务时，注入器先检查这个服务有没有实例，没有则创建一个实例，有则返回已有实例。

注入器卸载(unmount)时，它会负责自己提供的所有服务的实例销毁工作，子孙组件不必操心。

> 注意：我们提供 providers 的时候，不能使用内联的方式`providers={[TestService]}`，而是应该定义一个引用变量`useRef([TestAService])`。因为`ServiceInjector`接收到不同的`providers`的时候，会创建一个新的注入器，这样子组件使用到的服务就会发生意想不到的改变！

```tsx
// components/parent.tsx
import { ServiceInjector } from "@reactive-service/react";
import Child from "components/child";
import TestAService from "services/test-a.service";

export default function Parent() {
  const providers = useRef([TestAService]);

  return (
    // 在这里注入 TestAService 服务
    <ServiceInjector providers={providers.current}>
      <Child />
      <Child />
    </ServiceInjector>
  )
}
```

## 使用服务

```tsx
// components/child.tsx
import React, { useCallback } from "react";
import { useService } from "@reactive-service/react";
import TestAService from "services/test-a.service";

export default function Child() {
  // 获取父注入器提供的 TestAService 的实例
  const testAService = useService(TestAService);
  console.log(testAService.getData());

  const setData = useCallback((v) => {
    testAService.setData(v);
  }, [testAService]);

  //...
  return (<div>{...}</div>);
}
```

## 一个注入器可以提供多个服务，子孙节点也可以使用同一个服务的不同实例

`useService`使用的服务来自于`最近`一个`提供了该服务`的注入器。

注入器也是树状的，如果最近一个注入器没有提供该服务，则会请求父注入器，直到没有父注入器为止。

```tsx
export default function Parent() {
  // 使用服务的同时，也可以提供服务
  const testAService = useService(TestAService);
  const providersA = useRef([TestAService, TestBService]);
  const providersB = useRef([TestAService]);

  return (
    <ServiceInjector providers={providersA.current}>
      <Child />
      <Child />

      <ServiceInjector providers={providersB.current}>
        <Child />
      </ServiceInjector>

    </ServiceInjector>
  )
}
```

## 可选的服务

默认情况下，调用`useService`的时候，如果请求的服务没有在任何父注入器中提供，则会抛出一个异常。

但可以设置第二个参数`{ optional: true }`，来让服务提供可选。

```tsx
export default function Test() {
  const testService = useService(TestService, { optional: true });
  if (testService) {
    console.log(testService.getData());
  } else {
    ///
  }

  //...
  return (<div>{...}</div>);
}
```

## 替代类：useClass

上面的`providers={[ TestAService ]}` 是一个简写，内部会转换成`providers={[ { provide: TestAService, useClass: TestAService } ]}`。

`提供者(provide)`和`实际创建实例的类(useClass)`可以不是同一个类。

```tsx
function ParentA() {
  return (
    <ServiceInjector 
      providers={[
        {
          provide: Logger,
          useClass: LoggerA
        }
      ]}
    >
      <Child />
    </ServiceInjector>
  )
}

function ParentB() {
  return (
    // 在这里注入 TestAService 服务
    <ServiceInjector 
      providers={[
        {
          provide: Logger,
          useClass: LoggerB
        }
      ]}
    >
      <Child />
    </ServiceInjector>
  )
}

function Child() {
  const loggerService = useService(Logger);

  //...
  return (<div>{...}</div>);
}
```

当这个`Child`组件被`ParentA`包裹时，`loggerService`为`LoggerA`的实例。被`ParentB`包裹时，`loggerService`则为`LoggerB`的实例。

这样，`Child`能够被更好地复用，如果想让它使用同一个服务的不同变体时，只需要给它提供不同的服务即可，而不需要改动`Child`组件本身。

> 注：useClass 应该是 provide 类的扩展，也就是说应该满足 `useClass extends provide`。

## 在服务类中,也能使用其他被提供的服务服务

```tsx
// components/parent.tsx
import { ServiceInjector } from "@reactive-service/react";
import Child from "components/child";
import RequestService from "services/request.service.ts";
import LoggerService from "services/logger.service.ts";

<ServiceInjector providers={[RequestService, LoggerService]}>
  <Child />
  <Child />
</ServiceInjector>
```

```ts
// services/logger.service.ts
import { InjectionContext } from "@reactive-servic/react";
import RequestService from "services/request.service.ts";

export default class LoggerService {
  reqService: RequestService = null;

  constructor({ useService }: InjectionContext) {
    this.reqService = useService(RequestService);
  }

  log(msg) {
    //...
    this.reqService.send('/log', { msg });
  }
}
```

这里的`useService`逻辑和组件里的`useService`一样。

## 更多

- [下一步](./service.md)
- [api](./api)
