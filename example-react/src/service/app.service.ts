import { Service, Inject } from '@reactive-service/react';
import { map } from 'rxjs/operators';
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
  }

  initLogin() {
    this.subscribe(
      this.$.login.pipe(
        map(v => {
          this.$$.notify.next(v);
        })
      ),
      {
        error: (err: any) => {
          this.$$.error.next(new Error(err + ''));
        }
      }
    )
  }
}