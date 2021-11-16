import {
  combineLatest,
  Observable,
  OperatorFunction,
  of,
  from
} from 'rxjs';

import { debounceTime, map, startWith, switchMap, tap } from 'rxjs/operators';
import { jsonDateReviver } from './utils';

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
  /** Used to trigger change detection too often */
  debounceTime?: number;
}

/**
 * Operator that join the source with sub queries.
 * There are two stategies :
 * 1. `shouldAwait: true`: Await all subqueries to emit once before emitting a next value
 * 2. `shouldAwait: false`: Emit the source and hydrate it with the subqueries along the way
 * @example
 * ```typescript
 * of({ docUrl: '...' }).valueChanges().pipe(
 *   joinWith({
 *     doc: source => fetch(docUrl).then(res => res.json()),
 *   }, { shouldAwait: true })
 * ).subscribe(res => console.log(res.subQuery))
 * ```
 * @param queries A map of subqueries to apply. Each query can return a static value, Promise or Observable
 * @param options Strategy to apply on the joinWith
 */
export function joinWith<T, Query extends QueryMap<T>>(queries: Query, options: JoinWithOptions = {}): OperatorFunction<T, Jointure<T, Query>> {
  const shouldAwait = options.shouldAwait ?? false;
  const debounce = options.debounceTime ?? 100;
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
      map(() => {
        if (!entity) return entity;
        return JSON.parse(JSON.stringify(entity), jsonDateReviver) as any
      }),
    );
  }

  return switchMap((data: T | T[]) => {
    if (Array.isArray(data)) {
      if (!data.length) return of([]);
      const queries = (data as Entity<T>[]).map(runQuery);
      // Apply debounce if there
      const allQueries = combineLatest(queries).pipe(debounceTime(debounce));
      return shouldAwait
        ? allQueries
        : allQueries.pipe(startWith(data));
    }
    return runQuery(data as Entity<T>);
  });
}
