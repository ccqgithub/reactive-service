import React, { forwardRef } from 'react';
import hoistStatics from 'hoist-non-react-statics';
import { InjectionProvider } from '@reactive-service/core';
import { ServiceInjector } from './context';

/* 
一般测试，或者封装路由组件列表时使用，因为路由列表时显式添加provider不太方便
const WrrappedComponent = () => {};
export default withInjector({
  providers: []
}) 
*/
const withInjector = (args: { providers: InjectionProvider[] }) => {
  return <P extends Record<string, any>>(
    Component: React.ComponentType<P>
  ): ReturnType<typeof forwardRef> => {
    const displayName =
      'withInjector(' + (Component.displayName || Component.name) + ')';

    const Comp = forwardRef((props, ref) => {
      return (
        <ServiceInjector providers={args.providers}>
          <Component ref={ref} {...(props as P)}></Component>
        </ServiceInjector>
      );
    });

    Comp.displayName = displayName;

    return hoistStatics(Comp, Component);
  };
};

export default withInjector;
