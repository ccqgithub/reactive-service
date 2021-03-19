import { Observable } from 'rxjs';

export default function combineAnyLatest(
  sources: Observable<any>[] = []
): Observable<any[]> {
  return new Observable<any[]>((observer) => {
    let complete = 0;
    const values = sources.map(() => undefined);
    const subscriptions = sources.map((source, index) => {
      return source.subscribe({
        next: (v) => {
          values[index] = v;
          observer.next(values);
        },
        error: (err) => observer.error(err),
        complete: () => {
          complete++;
          if (complete === sources.length) {
            observer.complete();
          }
        }
      });
    });

    return () => {
      subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
    };
  });
}
