import {
  combineLatest,
  Observable,
  OperatorFunction,
  of,
  from
} from 'rxjs';
import { map, startWith, switchMap, tap } from 'rxjs/operators';

type QueryMap<T> = Record<string, (data: Entity<T>) => any>
type Entity<T> = T extends Array<infer I> ? I : T;
type GetSnapshot<F extends (...data: any) => any> = 
  F extends (...data: any) => Observable<infer I> ? I
  : F extends (...data: any) => Promise<infer J> ? J
  : ReturnType<F>;
type Join<T, Query extends QueryMap<T>> = T & { [key in keyof Query]?: GetSnapshot<Query[key]> };
type Jointure<T, Query extends QueryMap<any>> = T extends Array<infer I>
  ? Join<I, Query>[]
  : Join<T, Query>;

interface JoinWithOptions {
  /** If set to false, the subqueries will be filled with undefined and hydrated as they come through */
  shouldAwait?: boolean;
}
  
export function joinWith<T, Query extends QueryMap<T>>(queries: Query, options: JoinWithOptions = {}): OperatorFunction<T, Jointure<T, Query>> {
  const shouldAwait = options.shouldAwait ?? true;
  const runQuery = (entity: Entity<T>) => {
    const obs = [];
    for (const key in queries) {
      // Transform return value into an observable
      let result: any = queries[key](entity);
      if (!(result instanceof Observable)) {
        if (result instanceof Promise) {
          result = from(result);
        } else {
          result = of(result);
        }
      }
      // Hydrate the entity with the data
      let observe: Observable<any>;
      if (shouldAwait) {
        observe = result.pipe(
          tap(result => (entity as any)[key] = result),
        );
      } else {
        observe = result.pipe(
          startWith(undefined),
          tap(result => (entity as any)[key] = result),
        );
      }
      obs.push(observe);
    }
    if (!obs.length) return of(entity);
    return combineLatest(obs).pipe(
      map(() => entity as any),
    );
  }
  
  return switchMap((data: T) => {
    return Array.isArray(data)
      ? combineLatest(data.map(runQuery))
      : runQuery(data as Entity<T>);
  });
}