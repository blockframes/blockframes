import { QueryFn, DocumentData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export type TypeofArray<T> = T extends (infer X)[] ? X : T;

export type Query<T> = {
  path: string;
  queryFn?: QueryFn;
} & SubQueries<TypeofArray<T>>;

export type QueryLike<T> = Query<T> | Query<T>[];
export type SubQueries<T> = {
  [K in keyof Partial<T>]: T[K] | ((entity: T) => QueryLike<T[K]>)
};

export type QueryInput<T> = QueryLike<T> | string;
export type QueryOutput<Q, T> =
  Q extends string ? Observable<T>
  : Q extends Query<infer U>[] ? Observable<U[]>
  : Q extends Query<infer V> ? Observable<V>
  : never;

export function createQuery<T>(path: string): Query<T> {
  return { path } as Query<T>;
}
export function isQueryLike<T>(query: QueryInput<T>): query is QueryLike<T> {
  return typeof query !== 'string';
}

////////////////
// DOC RIGHTS //
////////////////

export type BFDocType = 'movies' | 'templates' | 'deliveries';

export interface BFDoc extends DocumentData {
  id: string;
  _type: BFDocType;
}

export interface OrgDocRights {
  id: string;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  isAdmin: boolean;
}

export interface SharedDocRights {
  id: string;
  canCreate: [];
  canRead: [];
  canUpdate: [];
  canDelete: [];
  admins: [];
}

/**
 * Initialize the OrgDocRights with all fields set to true
 * as the organization is the owner of this document.
 */
export function initializeOwnerDocRights(id: string) {
  return {
    id,
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: true,
    isAdmin: true
  } as OrgDocRights;
}

/**
 * Initialize the SharedDocRights with empty fields as
 * it is shared with no one at the time it is created.
 */
export function initializeSharedDocRights(id: string) {
  return {
    id,
    canCreate: [],
    canRead: [],
    canUpdate: [],
    canDelete: [],
    admins: []
  } as SharedDocRights;
}
