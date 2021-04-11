# 快速开始

## 说明

为了更好的开发体验，教程用 `Typescript`举例，但是这在开发中并不是必须的。

下面用`@reactive-service/react`举例，但是本工具不局限于`React`项目，也有其他版本。

## 安装

```sh
npm i @reactive-service/react -S

# or
yarn add @reactive-service/react
```

## 定义Service类

```ts
// ./service/geo.service.ts
import { bindCallback } from "rxjs";
import { catchError, filter, switchMap, tap } from "rxjs/operators";
import { Service } from "@reactive-service/react";

// 定义状态 State类型
export type GeoServiceState = {
  info: {
    support: boolean;
    permission: boolean;
    loading: boolean;
    error: Error | null;
    latitude: number | null;
    longitude: number | null;
  };
};

// 定义 Action类型
export type GeoServiceActions = {
  refresh: undefined;
};

// 定义类
export default class GeoService extends Service<
  GeoServiceState,
  GeoServiceActions
> {
  displayName = "GeoService";

  constructor() {
    super({
      state: {
        info: {
          support: "geolocation" in window.navigator,
          permission: true,
          loading: false,
          error: null,
          latitude: null,
          longitude: null,
        },
      },
      actions: ["refresh"],
    });

    this.initRefresh();
  }

  initRefresh() {
    // 定义action处理管道
    const refresh$ = this.$.refresh.pipe(
      filter(() => {
        if (!this.state.info.support) {
          this.$$.info.next({
            ...this.state.info,
            error: new Error("Geolocation not available!"),
          });
          return false;
        }
        return true;
      }),
      tap(() => {
        this.$$.info.next({
          ...this.state.info,
          loading: true,
        });
      }),
      switchMap((v) => {
        // get geo
        const ob = bindCallback(navigator.geolocation.getCurrentPosition)();
        return ob.pipe(
          catchError((error) => {
            let msg =
              error.code === 2
                ? "Newwork error. Geolocation is disabled."
                : "Geolocation is not enabled. Please enable to get spaces location.";
            throw new Error(msg);
          })
        );
      }),
      tap((position) => {
        const {
          coords: { latitude, longitude },
        } = position;
        this.$$.info.next({
          ...this.state.info,
          loading: false,
          error: null,
          permission: true,
          latitude,
          longitude,
        });
      }),
      catchError((error, caught) => {
        this.$$.info.next({
          ...this.state.info,
          loading: false,
          error: new Error(error.message || error),
          permission: false,
          latitude: null,
          longitude: null,
        });
        return caught;
      })
    );
    this.subscribe(refresh$);
  }
}
```

## 注入依赖，提供服务

> `ServiceInjector` 是一个`依赖注入器`，通过它向子组件提供依赖，以后子组件使用到相应的实例的时候，都由这个注入器提供。

```tsx
// ./Index.tsx
import { ServiceInjector } from '@reactive-service/react';
import GeoService from './service/geo.service.ts';
import App from './App';

ReactDOM.render(
  <ServiceInjector providers={[GeoService]}>
    <App />
  </ServiceInjector>,
  document.getElementById('root')
);
```

## 提取依赖，使用服务

> `ServiceInjector` 是一个`依赖注入器`，通过它向子组件提供依赖，以后子组件使用到相应的实例的时候，都由这个注入器提供。

```tsx
// ./components/AnyChild.tsx
import { useCallback } from 'react';
import { useService, useBehaviorRef, ServiceInjector } from '@reactive-service/react';
import GeoService from './service/geo.service.ts';
import OtherService from './service/other.service.ts';
import ChildOfChild from './components/ChildOfChild';

export default function AnyChild() {
  // 获取服务实例
  const geoService = useService(GeoService);
  // 监听服务状态
  const { value: geoInfo } = useBehaviorRef(geoService.$$.info);
  // 向服务发送Action
  const refreshGeo = useCallback(() => {
    geoService.$.refresh.next();
  }, [geoService]);

  return (
    <div>
      <p>Current GPS is: </p>
      <p>- latitude: {geoInfo.latitude}</p>
      <p>- longitude: {geoInfo.longitude}</p>
      <p>
        <button onClick={refreshGeo}>刷新GPS</button>  
      </p>
      {* 子组件也可以为子组件的子组件提供服务 *}
      <ServiceInjector providers={[GeoService, OtherService]}>
        <ChildOfChild />
      </ServiceInjector>
    </div>
  );
}
```

```tsx
// ./components/ChildOfChild.tsx
import { useService, useBehaviorRef, ServiceInjector } from '@reactive-service/react';
import GeoService from './service/geo.service.ts';
import OtherService from './service/other.service.ts';

export default function ChildOfChild() {
  // 获取服务实例
  const otherService = useService(OtherService);
  const geoService = useService(GeoService);
  // 监听服务状态
  const geoRef = useBehaviorRef(geoService.$$.info);
  const someRef = useBehaviorRef(otherService.$$.some);
  // ...
}
```

**注意**：上面`AnyChild`组件中的`geoService`，和`ChildOfChild`组件中的`geoService`实例并不是同一个，前者是由`./Index.tsx`中的注入器实例化的，后者是由`./AnyChild.tsx`中的注入器实例化的。
