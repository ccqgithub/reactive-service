# IoC：控制反转

我们写一个功能时，如果依赖其他的功能，一般是自己创建一个依赖的实例：

```js
import Auth from './deps/auth';
import Api from './deps/api';

export class Test {
  constructor() {
    this.auth = new Auth();
    this.api = new Api();
    //...
    this.auth.config(config);
    const loginUser = this.auth.login({
      //...
    });
    const someData = this.api.getSomeData({
      token: loginUser.token
    });
  }
}
```

这个类的其他依赖运行的时候，可能都需要特定的环境，比如依赖登录用户的token，比如每个环境调用不用的接口等。

如果我们想单独测试这个类的时候怎么办？可以这样：

- 在类里面加`if`语句，通过传入参数判断环境。
- 设置`process.env.NODE_ENV`之内的便利，依赖于编译环境去判断。

```js
//...

export class Test {
  constructor() {
    this.auth = new Auth();
    this.api = new Api();

    if (process.env.NODE_ENV === 'Test') {
      const loginUser = TestUser;
    } else {
      //...
      this.auth.config(config);
      const loginUser = this.auth.login({
        //...
      });
    }

    const someData = this.api.getSomeData({
      token: loginUser.token
    });
  }
}
```

这样虽然可以达到效果，但过于繁琐。

还有，如果`Api`发布了一个新的版本，我们这个`Test`类需要用到这个新的版本，但是旧的版本不能直接改，怎么办？

我们不得不去修改这个Test类，将其中的`this.api = new Api();`改为`this.api = new ApiV2();`

有没有好的解决方法？有，那就我们不把依赖跟Test绑死，而是让外部去提供：

```js
export class Test {
  constructor(auth, api) {
    this.auth = auth;
    this.api = api;
    //...
    const loginUser = this.auth.login({
      //...
    });
    const someData = this.api.getSomeData({
      token: loginUser.token
    });
  }
}
```

这样的话，测试的时候，我们可以自己Mocl一个`auth`实例传进去，而不用在`Test`内部加一堆逻辑判断。

发布新版`Api`的时候, 我们直接传进去一个新的`apiV2`实例就行了，不用动`Test`的任何代码。

如此这样，我们将依赖交给外部使用者去提供，而不是自己去创建依赖的方式，就成为`控制反转IOC`。

它有几个优点：

- 便于单元测试：模拟依赖，传入。
- 便于复用：根据不同用途传入不同依赖实例就行。

但也有一个缺点，那就是对于调用者来说比较麻烦，因为要去给它创建依赖。

但这个缺点是可以解决的，方案就是[依赖注入DI](./di.md)。
