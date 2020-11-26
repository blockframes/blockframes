import { FormArraySchema, FormEntity, FormGroupSchema, FormList } from 'ng-form-factory';
import { matSelect } from '../select';
import { matText } from '../text';

export interface CollectionQuery {
  method: 'where' | 'orderBy';
  field: string;
  condition: '==' | '!=' | 'array-contains';
  value: string;
}

export type CollectionQuerySchema = FormGroupSchema<CollectionQuery>;
export type CollectionQueryForm = FormEntity<CollectionQuerySchema>;

export const collectionQuerySchema: CollectionQuerySchema = {
  form: 'group',
  controls: {
    method: matSelect({ label: 'Method', options: ['where', 'orderBy'] }),
    field: matText({ label: 'Field' }),
    condition: matSelect({ label: 'Condition', options: ['==', '!=', 'array-contains'] }),
    value: matText({ label: 'Value' })
  }
}


export type FirestoreQuery = CollectionQuery[];
export interface FirestoreQuerySchema extends FormArraySchema<CollectionQuery> {
  collection?: string;
}

export type FirestoreQueryForm = FormList<FirestoreQuerySchema>;



export function firestoreQuery(params: Partial<FirestoreQuerySchema>): FirestoreQuerySchema {
  return {
    collection: params.collection,
    ...params,
    form: 'array',
    controls: [],
    factory: collectionQuerySchema,
  }
}