import { Service } from '../reactive-service';

export default class MessageService extends Service {
  constructor() {
    super({
      state: {
        message: null
      },
      actions: ['notify']
    });

    this.useSubscribe(this.$.notify, (msg) => {
      this.$$.message.next(msg);
    });
  }
}