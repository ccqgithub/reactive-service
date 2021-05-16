# 响应式 Service

## 第一步：简单的状态共享

```tsx
const appService = {
  data: {
    loginUser: null,
    messages: []
  },

  setLoginUser(user) {
    this.data.loginUser = user;
  },

  pushMessage(msg) {
    this.data.messages.push(msg);
  }
}

function App() {
  const loginUser = service.data.loginUser;
  return (
    <>
      <div>Login User: {loginUser.name}</div>
      <LoginBox />
      <MessageBox />
    </>
  );
}

function LoginBox() {
  const loginSuccess = (user) => {
    service.setLoginUser(user);
    service.pushMessage("login success!");
  };

  //...

  return (
    <div>
      {/*...*/}
    </div>
  );
}

function MessageBox({ id }) {
  const messages = service.data.;
  return (
    <div>
      {messages.map((msg) => (
        <p>{msg}</p>
      ))}
    </div>
  );
}
```

这样达到了状态共享的目的，但是又一个问题：那就是我们改变`service.data`的时候，并不会触发组件的更新。

别急，我们看第二步。

## 第二步：数据响应

在`vue`中，因为框架本身带数据响应特性，第一步里面的例子就能够实现状态共享的目的。但是在`react`中，我们不得不借助`mobx`之类的框架。

不过`mobx`也有它的缺点，在这里就不一一叙述了，我们直接讲解我们的方式：[`rxjs`](https://rxjs-dev.firebaseapp.com/guide/overview) + [`hooks`](https://zh-hans.reactjs.org/docs/hooks-intro.html)的组合。

在`rxjs`中，有一个叫做[`BehaviorSubject`](https://rxjs-dev.firebaseapp.com/guide/subject#behaviorsubject)的类，它有以下的特性：

- 保持最近的状态：每个观察者订阅它的时候，会得到它最近的值。
- 推送新的状态：每当它接收一个新的值时，会将新的值推送给所有订阅了它的观察者。

这是不是和`state`很像？没错，其实它就是一个天然的`state`好助手，借助`hooks`，我们能够这样使用。

```tsx
const appService = {
  data: {
    loginUser: new BehaviorSubject(null),
    messages: new BehaviorSubject([]),
  },

  setLoginUser(user) {
    this.data.loginUser.next(user);
  },

  pushMessage(msg) {
    this.data.messages.next([
      ...this.data.messages.value,
      msg
    ]);
  }
}

// 组件安装时订阅，卸载时取消订阅
const useBehavior = (subject) => {
  const [state, setState] = useState(subject.value);
  useEffect(() => {
    const subscription = subject.subscribe((v) => {
      setState(v);
    });
    return () => {
      subscription.unsubscribe();
    }
  }, [subject]);
}

function App() {
  const loginUser = useBehavior(service.data.loginUser);
  return (
    <>
      <div>Login User: {loginUser.name}</div>
      <LoginBox />
      <MessageBox />
    </>
  );
}

function LoginBox() {
  const loginSuccess = (user) => {
    service.setLoginUser(user);
    service.pushMessage("login success!");
  };

  //...

  return (
    <div>
      {/*...*/}
    </div>
  );
}

function MessageBox({ id }) {
  const messages = useBehavior(service.data.messages);
  return (
    <div>
      {messages.map((msg) => (
        <p>{msg}</p>
      ))}
    </div>
  );
}
```

这样，我们轻易就实现了`mobx`的功能，使用起来还很简单（前提是熟悉rxjs，当然你可能觉得学习rxjs很麻烦，但是rxjs的好处远远不止这里，后面会有更多介绍）。

这种做法与[`redux`](https://github.com/reduxjs/redux)和[`unstated-next`](https://github.com/jamiebuilds/unstated-next)之类的工具比起来，有如下好处：

- 没有复杂的概念，使用简单，只要会用`rxjs`就很容易理解。
- 状态更加细粒度，`一个状态`的改变并不会触发`整个组件树`的更新，只会更新`订阅了它`的组件。

## 第三步：异步数据处理

上面介绍的状态共享只是rxjs的一个功能，通过其它方式很容易实现。而rxjs的真正精髓，是在异步数据流的处理方面。

想象这样一个复杂场景：用户下拉搜索框，需要实现以下几个功能。

1. 需要一个[`debounce`](https://www.lodashjs.com/docs/lodash.debounce)功能，输入很频繁的时候，只有200ms内没有新的输入，才向服务器提交请求。
2. 加载过程中显示loading。
3. 下拉列表中需要显示用户的`公司信息`和`财务信息`，但是因为某种原因`公司信息`和`财务信息`都要调另外的接口。
4. 新一个请求发出时，如果旧一个请求还没返回值，则需要终止旧的请求，或者忽略旧的请求返回的值。
5. 如果请求过程中发生错误，则重试一次。

如果不借助工具，实现这样一个看似简单实则麻烦的功能，我们可能会要废好多脑细胞，定义很多变量，写很多绕来绕去的代码。

但是，借助rxjs，却很简单：

```tsx
import { zip } from "rxjs";
import { debounceTime, tap, switchMap, map, retry, catchError } from "rxjs/operators";

function Search() {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [serach$] = useState(() => {
    return new Subject();
  }); 

  // 注：这里的 api 都返回 observable
  useEffect(() => {
    const subscription = serach$.pipe(
      // debounce 200ms
      debounceTime(200),
      // set loading
      tap(() => {
        setLoading(true)
      }),
      // get users
      switchMap((keyword) => {
        return api.searchUsers({ keyword });
      }),
      // `公司信息`和`财务信息`
      switchMap((users) => {
        const ids = users.map(item => item.id);
        return zip(
          api.getUsersCompanyInfos({ ids }),
          api.getUsersFinanceinfos({ ids }),
        ).pipe(
          map([companyInfos, financeInfos] => {
            // 将`公司信息`和`财务信息` 拼入用户列表
            const newUsers = mergeInfosToUsers(companyInfos, financeInfos);
            return newUsers;
          })
        )
      }),
      // 求过程中发生错误，则重试一次
      retry(1),
      // 错误处理
      catchError((error, caught) => {
        console.log(error);
        setLoading(false);
        return caught;
      })
    ).subscribe({
      // 请求成功
      next: (users) => {
        setLoading(false);
        setUsers(users);
      }
    });

    return () => {
      subscription.unsubscribe();
    }
  }, [serach$]);

  return (
    <div>
      <input value={value} onChange={(e) => {
        setValue(e.target.value);
        serach$.next(e.target.value);
      }} />
      {/*...*/}
    </div>
  )
}
```

这就实现了上面我们描述的功能，代码清晰易懂，这就是rxjs在处理异步数据流中的魅力。那当然，这些知识rxjs的部分功能，更多的用法请阅读[文档](https://rxjs-dev.firebaseapp.com/guide/overview)。

## 第四步：将异步数据流操作组合进service

```tsx
class AppService {
  subscriptions = [];

  data = {
    loginUser: new BehaviorSubject(null),
    messages: new BehaviorSubject([])
  }

  actions = {
    login: new Subject(),
    pushMessage: new Subject()
  }

  consturctor() {
    const subscription = this.actions.login.pipe(
      switchMap((params) => {
        return api.login(params);
      })
    ).subscribe({
      next: (user) => {
        this.data.loginUser.next(user);
        this.actions.pushMessage.next("login suecess");
      }
    })

    const subscription2 = this.actions.pushMessage.subscribe({
      next: (msg) => {
        this.data.messages.next([
          ...this.data.messages.value,
          msg
        ])
      }
    })

    this.subscriptions.push(subscription, subscription2);
  }

  dispose() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }
}

const appService = new AppService();

function App() {
  const loginUser = useBehavior(appService.data.loginUser);
  // app 卸载时，销毁service，清理订阅等
  useEffect(() => {
    return () => {
      appService.dispose();
    }
  }, []);

  return (
    <>
      <div>Login User: {loginUser.name}</div>
      <LoginBox />
      <MessageBox />
    </>
  );
}
```

## 第五步：规范 service

在上面我们将 `状态响应`和`异步数据流控制`组合在了一起，基本上就实现了我们需要的所有数据管理功能。

但是，看起来还稍微有点凌乱，需要加以规范和约束。

经过思考以往的项目经验，我发现一个`service`需要对外暴露的部分，只包括下面几个：

- State：能订阅的状态值，既保持最近一次的值，又能够接收新的值，典型的普通状态值。
- Event：能订阅的事件（或通知），我们不需要知道以前的值，只需要我们订阅后的值，比如消息通知的处理。
- Action：外界想`service`传递数据，通知`service`改变。

这样，我们就能完成`UI`层和`Service`层的解耦：

- `UI`：只关心从何处订阅数据(`State`和`Event`)，以及向何处发出`Action`。
- `Service`：写`service`的时候我们只关心数据结构和数据逻辑的定义、处理，不用过多关心`UI`层的具体实现。

## 第六步：工具实现

基于以上，我们定义了一个`Service`基类，来帮助管理，直接看具体使用。如果在`typescript`项目中使用，有很完善的类型提示。

首先，安装：

```sh
npm i rxjs @reactive-service/react
```

使用：

```tsx
// services/app.ts
import { Service } from "@reactive-service/react";

type AppServiceState = {
  loginUser: {
    id: string;
    name: string;
  } | null,
  messages: string[];
};

type AppServiceEvents = {
  error: Error;
}

type AppServiceActions = {
  login: {
    username: string;
    password: string;
  }
}

export class AppService extends Service<
  AppServiceState,
  AppServiceEvents,
  AppServiceActions
> {
  constructor() {
    // 初始化
    super({
      state: {
        loginUser: null,
        messages: []
      },
      events: ['error'],
      actions: ['setLoginUser']
    });

    // 异步数据了处理
    this.subscribe(
      this.$.setLoginUser.pipe(
        //...
      )
    )
  }
}

const appService = new AppService();
```

```tsx
import { useBehavior, useSubscribe } from '@reactive-service/react';

// App.tsx
function App() {
  // 订阅 state
  const loginUser = useBehavior(appService.$$.loginUser);

  // 订阅通知
  useSubscribe(appService.$e.notify, {
    next: (notify) => {
      alert(notify);
    }
  });

  // 发送action
  const login = (params) => {
    appService.$.login.next(params);
  }

  // app 卸载时，销毁service，清理订阅等
  useEffect(() => {
    return () => {
      appService.dispose();
    }
  }, []);

  return (
    <>
      <div>Login User: {loginUser.name}</div>
      <LoginBox />
      <MessageBox />
    </>
  );
}
```

这样创建的`service`实例会暴露以下几个方法：

- `service.$$`: state集合。
- `service.$e`: events集合。
- `service.$`: actions集合。

更多详细信息，请看[apis]();

## 第七步：service的组织、安装、与卸载。

一些很简单的组件和项目，可能没必要用到我们介绍的service，或者一个service整个应用使用就够了。

但是稍微复杂一点的项目，一个service肯定是不够用的，可能会有全局service，局部service等，这就涉及到了service的 安装、卸载、共享等操作。

一个service应该在何处安装，在何处卸载，在组件之间怎么共享？

这部分功能请阅读[依赖注入]()章节。
