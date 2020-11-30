import { firestore } from 'firebase';
import { FormArraySchema, FormEntity, FormGroupSchema, FormList } from 'ng-form-factory';
import { matSelect } from '../select';
import { matText } from '../text';

export type QueryMethods = "where" | "orderBy" | "limit" | "limitToLast";
export const queryMethods: QueryMethods[] = ['where', 'limit', 'limitToLast', 'orderBy'];
export const methodSchema = matSelect<QueryMethods>({ label: 'Method', options: queryMethods });

export interface CollectionQuery {
  method: QueryMethods;
}

export type CollectionQuerySchema = FormGroupSchema<CollectionQuery>;
export type CollectionQueryForm = FormEntity<CollectionQuerySchema>;

///////////
// WHERE //
///////////
type Conditions = firestore.WhereFilterOp | '!=';
const conditions: Conditions[] = ['==', '!=', 'array-contains', '<', '<=', '>', '>='];
export interface WhereQuery extends CollectionQuery {
  field: string;
  condition: Conditions;
  value: string | boolean | number;
}

export const isWhereQuery = (query: CollectionQuery): query is WhereQuery => query.method === 'where';

export type WhereQuerySchema = FormGroupSchema<WhereQuery>;
export type WhereQueryForm = FormEntity<WhereQuerySchema>;

export const whereQuerySchema: WhereQuerySchema = {
  form: 'group',
  controls: {
    method: methodSchema,
    field: matText({ label: 'Field' }),
    condition: matSelect<Conditions>({ label: 'Condition', options: conditions }),
    value: matText({ label: 'Value' })
  }
}

/////////////
// ORDERBY //
/////////////
type Direction = firestore.OrderByDirection;
export interface OrderByQuery extends CollectionQuery {
  field: string;
  direction: Direction
}

export type OrderByQuerySchema = FormGroupSchema<OrderByQuery>;
export type OrderByQueryForm = FormEntity<OrderByQuerySchema>;

export const orderByQuerySchema: OrderByQuerySchema = {
  form: 'group',
  controls: {
    method: methodSchema,
    field: matText({ label: 'Field' }),
    direction: matSelect<Direction>({ label: 'Direction', options: ['asc', 'desc']})
  }
}

///////////
// LIMIT //
///////////
export interface LimitQuery extends CollectionQuery {
  limit: number
}
export type LimitQuerySchema = FormGroupSchema<LimitQuery>;
export type LimitQueryForm = FormEntity<LimitQuerySchema>;

export const limitQuerySchema: LimitQuerySchema = {
  form: 'group',
  controls: {
    method: methodSchema,
    limit: matText({ label: 'Amount', type: 'number' }),
  }
}


///////////
// QUERY //
///////////

export type FirestoreQuery = CollectionQuery[];
export interface FirestoreQuerySchema extends FormArraySchema<CollectionQuery> {
  collection?: string;
}

export type FirestoreQueryForm = FormList<FirestoreQuerySchema>;

const collectionSchema = {
  where: whereQuerySchema,
  orderBy: orderByQuerySchema,
  limit: limitQuerySchema,
  limitToLast: limitQuerySchema,
}

export function firestoreQuery(params: Partial<FirestoreQuerySchema>): FirestoreQuerySchema {
  return {
    collection: params.collection,
    ...params,
    form: 'array',
    controls: [],
    factory: (query: CollectionQuery) => collectionSchema[query.method],
  }
}