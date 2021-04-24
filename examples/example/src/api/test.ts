import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

export type Todo = {
  id: number;
  name: string;
  description: string;
}

export type User = {
  id: number;
  username: string;
  password: string;
}

const USER: User = {
  id: 1,
  username: 'test',
  password: '123456'
};

const TODO_LIST: Todo[] = [];
let TODO_ID = 0;
for (let i = 1; i <= 1000; i++) {
  TODO_ID++;
  TODO_LIST.push({
    id: TODO_ID,
    name: `name-${TODO_ID}`,
    description: `description ${TODO_ID}`
  });
}

export const login = (username: string, password: string) => {
  if (username !== USER.username || password !== USER.password) {
    return of({
      result: null,
      error: {
        message: '用户名或密码不对'
      }
    }).pipe(
      delay(2000)
    );
  }

  return of({ result: USER, error: null }).pipe(delay(2000));
}

export const userEdit = (id: number, { name }: { name: string }) => {
  USER.username = name;
  return of({ result: USER, error: null }).pipe(delay(2000));
}

export const todoList = (page = 1, size = 10) => {
  const start = (page - 1) * size;
  const totalPage = Math.ceil(TODO_LIST.length / size);
  const list = TODO_LIST.slice(start, start + size);

  const data = {
    result: {
      page,
      size,
      totalPage,
      list
    },
    error: null
  }

  return of(data).pipe(delay(2000));
}

export const todoInfo = (id: number) => {
  const info = TODO_LIST.find((item) => item.id === id);
  const data = {
    result: info,
    error: null
  }

  return of(data).pipe(delay(2000));
}

export const todoAdd = ({ name, description }: Pick<Todo, 'name' | 'description'>) => {
  const info: Todo = {
    id: ++TODO_ID,
    name,
    description
  };

  TODO_LIST.push(info);

  const data = {
    result: info,
    error: null
  }

  return of(data).pipe(delay(2000));
}

export const todoDel = (id: number) => {
  const i = TODO_LIST.findIndex((item) => item.id === id);
  TODO_LIST.splice(i, 1);

  const data = {
    result: true,
    error: null
  }

  return of(data).pipe(delay(2000));
}

export const todoEdit = (id: number, { name, description } : Pick<Todo, 'name' | 'description'>) => {
  const find = TODO_LIST.find((item) => item.id === id);
  if (!find) throw new Error('error');
  find.name = name;
  find.description = description;

  const data = {
    result: find,
    error: null
  }

  return of(data).pipe(delay(2000));
}