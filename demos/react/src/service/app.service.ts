import { debounceTime, filter, switchMap, catchError, retry, tap } from 'rxjs/operators';
import { Service } from '@reactive-service/react';
import * as API from '../lib/api';
import { Subject } from 'rxjs';

interface AppState {
  loginUser: Record<string, any> | null;
  isLogging: Boolean;
}

export default class AppService extends Service<AppState> {
  $login = new Subject<any>();

  loginUser$$ = this.select((state) => state.loginUser);

  isLogging$$ = this.select((state) => state.isLogging);

  message$ = new Subject<any>();

  constructor() {
    super({
      loginUser: null,
      isLogging: false
    });

    this.initActions();
    this.initSources();
  }

  initActions() {
    const $login = this.$login.pipe(
      filter((v) => {
        if (!v.username || !v.password) {
          alert('参数错误');
          return false;
        }
        return true;
      }),
      debounceTime(500),
      tap(() => {
        this.setState((state) => {
          return {
            ...state,
            isLogging: true
          }
        });
      }),
      switchMap((v) => {
        return API.login(v).pipe(retry(2));
      }),
      tap((v) => {
        this.setState((state) => {
          return {
            ...state,
            isLogging: false,
            loginUser: v
          }
        });
        console.log('success')
      }),
      catchError((err, caught) => {
        this.setState((state) => {
          return {
            ...state,
            isLogging: false
          }
        });
        console.log('error')
        console.error(err);
        return caught;
      }),
    );
    this.subscribe($login);
  }

  initSources() {
    const timer = setInterval(() => {
      const date = new Date();
      const message = `Now is ${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
      this.message$.next(message);
    }, 5000);
    this.beforeDispose(() => {
      clearInterval(timer);
    });
  }
}