import { Service } from '@reactive-service/react';
import { map } from 'rxjs/operators';

type State = {
  notify: any;
  error: Error | null;
};

type Actions = {
  notify: any;
}

export default class MessageService extends Service<State, Actions> {
  constructor() {
    super({
      state: {
        notify: null,
        error: null
      },
      actions: ['notify']
    });

    this.initNotify();
  }

  initNotify() {
    this.subscribe(
      this.$.notify.pipe(
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