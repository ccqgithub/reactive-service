# Reactive Service

> 一个`简单的`、`现代的`前端状态管理工具，也是一个非常全面的前端状态管理方案。

## 特性

- 功能全面，一下解决前端状态管理的几乎所有痛点。
- Typescript支持，智能提示。
- 数据流监控方便，便于调试。
- 自由、简单、规范，读完文档之后使用起来不用烧脑。
- 不限技术栈，支持纯JS、React、Vue、小程序等各种项目（各个版本核心理念一样，使用起来会有不同的Api包）。

## 安装、使用

```sh
npm i @reactive-service/react -S

# or
yarn add @reactive-service/react
```

```js
import {
  config,
  Injector,
  Inject,
  InjectionToken,
  Service,
  withInjector,
  ServiceInjector,
  useRSRef,
  useValueRef,
  useService,
  useBehaviorRef,
  useGetService,
  useListenValue,
  useObservableError,
  useObservableRef
} from '@reactive-service/react';
```

## 核心概念

- [分治：高内聚、低耦合](./docs/concept/dar.md)。
- [IoC：控制反转](./docs/concept/ioc.md)。
- [DI：依赖注入](./docs/concept/di.md)。
- [Observable：可观察数据流](./docs/design.md)。

## React 相关

- [Hooks 优化](./docs/react/hooks.md)。

## 快速开始

- [Get Start](./docs/get-start.md)。

## API

- [API](./docs/api.md)。

## Todos

- 功能完善。
- 文档完善。
- 添加测试用例。
- 添加Examples。
- Pure JS版本: `@reactive-service/js`。
- Vue版本: `@reactive-service/vue`。
- 小程序版本: `@reactive-service/mp`。
