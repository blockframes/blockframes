export interface Link {
  text: string;
  path: string;
  type: 'basic' | 'flat' | 'stroked';
  color: 'primary' | 'accent' | 'warn' | '';
}

export type QueryMethods = "where" | "orderBy" | "limit" | "limitToLast" | "startAt";
export interface CollectionQuery {
  method: QueryMethods;
}

export type Conditions = "<" | "<=" | "==" | ">=" | ">" | "array-contains" | "in" | "array-contains-any" | '!=';
export interface WhereQuery extends CollectionQuery {
  field: string;
  condition: Conditions;
  value: string | boolean | number;
}

export type Direction = "desc" | "asc";
export interface OrderByQuery extends CollectionQuery {
  field: string;
  direction: Direction
}

export interface LimitQuery extends CollectionQuery {
  limit: number
}

export interface StartAtQuery extends CollectionQuery {
  value: string | boolean | number;
}

export type FirestoreQuery = CollectionQuery[];