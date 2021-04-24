import { Service, Inject } from '@reactive-service/react';
import { map, switchMap } from 'rxjs/operators';
import { login, User } from '../api/test';
import MessageService from './message.service';

type State = {
  loginUser: User | null;
};

type Actions = {
  login: {
    username: string;
    password: string;
  },
  logout: undefined;
}

export default class AppService extends Service<State, Actions> {
  messageService: MessageService;

  constructor(@Inject(MessageService) messageService: MessageService) {
    super({
      state: {
        loginUser: null
      },
      actions: ['login', 'logout']
    });

    this.messageService = messageService;
    this.initLogin();
  }

  initLogin() {
    this.subscribe(
      this.$.login.pipe(
        switchMap((v) => {
          return login(v.username, v.password);
        }),
        map(v => {
          this.$$.loginUser.next(v.result);
          this.messageService.$$.notify.next('登录成功！');
        })
      ),
      {
        error: (err: any) => {
          this.messageService.$.notify.next(new Error(err + ''));
        }
      }
    )
  }
}