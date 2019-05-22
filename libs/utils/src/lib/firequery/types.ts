import { QueryFn } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export type TypeofArray<T> = T extends (infer X)[] ? X : T;

export type Query<T> = {
  path: string;
  queryFn?: QueryFn;
} & SubQueries<TypeofArray<T>>;

export type QueryLike<T> = Query<T> | Query<T>[];
export type SubQueries<T> = {
  [K in keyof Partial<T>]: T[K] | ((entity: T) => QueryLike<T[K]>)
}

export type QueryInput<T> = QueryLike<T> | string;
export type QueryOutput<Q, T> =
  Q extends string ? Observable<T> :
  Q extends Query<(infer U)>[] ? Observable<U[]> :
  Q extends Query<(infer V)> ? Observable<V> :
  never;

export function createQuery<T>(path: string): Query<T> {
  return { path } as Query<T>;
}
export function isQueryLike<T>(query: QueryInput<T>): query is QueryLike<T> {
  return typeof query !== 'string'
}
