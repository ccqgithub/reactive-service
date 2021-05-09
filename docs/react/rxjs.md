# RxJS

先了解[RxJS](https://rxjs-dev.firebaseapp.com/guide/overview)的几个重要概念：

- [Observable](https://rxjs-dev.firebaseapp.com/guide/observable)：可订阅的数据源，类似`Promise`，不过比`Promise`更加强大。它有`Promise`没有的两个属性：`发送多个值`和`取消订阅`。
- `observer`：观察者，订阅了`Observable`的消费者对象，接受`Observable`的如下消息：
  - `next`：接收一个新数据。
  - `complete`：接收完成消息。
  - `error`：接收错误消息。
- `Observable.subscribe(observer)`: 订阅，观察者`observer`向`Observable`订阅数据。
- `Subscription`: 订阅对象：订阅`subscribe`的上下文，可以用它来取消订阅（`Subscription.unsubscribe()`）。

## Observable

先来看一个`Observable`例子：

```js
import { Observable } from 'rxjs';

// 定义一个Observable
const observable = new Observable((observer) => {
  let i = 0;
  const timer = setInterval(() => {
    // 发送数据
    observer.next(i++);
    if (i === 100) {
       observer.complete();
    }
    // or some contidions:
    // observer.error(new Error('message'));
  }, 1000);
 
  // 取消订阅时执行的函数
  return function unsubscribe() {
    console.log("clear timer");
    clearInterval(timer);
  }
});

// 订阅 Observable
const subscription = Observable.subscribe({
  next: (v) => {
    console.log(v);
  },
  complete: () => {
    console.log("complete");
  },
  error: (err) => {
    console.log(err);
  }
});

// 取消订阅
setTimeout(() => {
  subscription.unsubscribe();
}, 5000);

// 上面输出：
// 0
// 1
// 2
// 3
// 4
// clear timer
```
