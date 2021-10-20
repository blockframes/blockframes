import { FormArraySchema, FormEntity, FormGroupSchema, FormList } from 'ng-form-factory';
import { QueryMethods, CollectionQuery, Conditions, WhereQuery, Direction, OrderByQuery, LimitQuery, StartAtQuery } from '@blockframes/admin/cms';
import { matSelect } from '../select';
import { matText } from '../text';

export const queryMethods: QueryMethods[] = ['where', 'limit', 'limitToLast', 'orderBy', 'startAt'];
export const methodSchema = matSelect<QueryMethods>({ label: 'Method', options: queryMethods });

export type CollectionQuerySchema = FormGroupSchema<CollectionQuery>;
export type CollectionQueryForm = FormEntity<CollectionQuerySchema>;

///////////
// WHERE //
///////////
const conditions: Conditions[] = ['==', '!=', 'array-contains', '<', '<=', '>', '>='];

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
export type LimitQuerySchema = FormGroupSchema<LimitQuery>;
export type LimitQueryForm = FormEntity<LimitQuerySchema>;

export const limitQuerySchema: LimitQuerySchema = {
  form: 'group',
  controls: {
    method: methodSchema,
    limit: matText({ label: 'Amount', type: 'number' }),
  }
}

export type StartAtQuerySchema = FormGroupSchema<StartAtQuery>;
export type StartAtQueryForm = FormEntity<StartAtQuerySchema>;

export const startAtQuerySchema: StartAtQuerySchema = {
  form: 'group',
  controls: {
    method: methodSchema,
    value: matText({ label: 'Value', type: 'text' })
  }
}


///////////
// QUERY //
///////////
export interface FirestoreQuerySchema extends FormArraySchema<CollectionQuery> {
  collection?: string;
}

export type FirestoreQueryForm = FormList<FirestoreQuerySchema>;

const collectionSchema = {
  where: whereQuerySchema,
  orderBy: orderByQuerySchema,
  limit: limitQuerySchema,
  limitToLast: limitQuerySchema,
  startAt: startAtQuerySchema
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