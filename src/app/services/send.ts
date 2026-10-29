import { Observable, from, map } from 'rxjs';

export function send<T>(request: PromiseLike<{ data: T | null; error: unknown }>): Observable<T> {
  return from(request).pipe(map(({ data, error }) => {
    if (error || data === null) throw error;
    return data;
  }));
}