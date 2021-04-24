import { Service, Inject } from '@reactive-service/react';
import { map, switchMap, tap } from 'rxjs/operators';
import { todoList, todoAdd, todoDel, Todo } from '../api/test';
import MessageService from './message.service';

type State = {
  list: Todo[];
  page: number;
  size: number;
  loading: boolean;
};

type Actions = {
  add: {
    name: string;
    description: string;
  },
  del: number;
  nextPage: undefined;
}

export default class TodosService extends Service<State, Actions> {
  messageService: MessageService;

  constructor(@Inject(MessageService) messageService: MessageService) {
    super({
      state: {
        list: [],
        page: 0,
        size: 10,
        loading: false
      },
      actions: ['add', 'del', 'nextPage']
    });

    this.messageService = messageService;
    this.init();
  }

  init() {
    this.subscribe(
      this.$.nextPage.pipe(
        tap(() => {
          this.$$.loading.next(true);
        }),
        switchMap((v) => {
          return todoList(this.state.page + 1, this.state.size);
        }),
        map(v => {
          this.$$.loading.next(false);
          this.$$.page.next(v.result.page);
          this.$$.list.next([...this.state.list, ...v.result.list])
        })
      ),
      {
        error: (err: any) => {
          this.$$.loading.next(false);
          this.messageService.$.notify.next(new Error(err));
        }
      }
    )
  }
}