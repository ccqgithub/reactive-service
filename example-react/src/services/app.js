import { switchMap, tap } from 'rxjs/operators';
import { Service } from '../reactive-service';
import * as apis from '../api/apis';
import MessageService from './message';

export default class AppService extends Service {
  constructor() {
    super({
      state: {
        loginUser: null,
        isLogging: false,
        isEditing: false,
        message: null
      },
      actions: ['login', 'userEdit']
    });

    const msgService = this.useService(MessageService);

    // login
    const login$ = this.$.login.pipe(
      tap(() => this.$$.isLogging.next(true)),
      switchMap((v) => apis.login(v)),
      tap(() => this.$$.isLogging.next(false)),
      tap((v) => {
        if (v.error) {
          this.$$.message.next(v.error.message);
          return;
        }
        this.$$.loginUser.next(v.result);
        this.$$.message.next('登录成功！');
      })
    );
    this.useSubscribe(login$);

    // user edit
    const edit$ = this.$.login.pipe(
      tap(() => this.$$.isEditing.next(true)),
      switchMap((v) => apis.userEdit(v)),
      tap(() => this.$$.isEditing.next(false)),
      tap((v) => {
        if (v.error) {
          this.$$.message.next(v.error.message);
          return;
        }
        this.$$.loginUser.next(v.result);
        this.$$.message.next('登录成功！');
      })
    );
    this.useSubscribe(edit$);
  }
}