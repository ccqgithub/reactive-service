import { of, timer } from 'rxjs'
import { delay } from 'rxjs/operators';

export const test = (delay = 2000) => {
  return timer(delay);
}

export const login = ({ username = '' }) => {
  const user = {
    id: new Date().getTime(),
    username
  }
  return of(user).pipe(delay(1000));
}