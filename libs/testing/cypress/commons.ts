import { WhereFilterOp } from 'firebase/firestore';

export interface UpdateParameters {
  docPath: string;
  field: string;
  value: unknown;
}

export interface QueryParameters {
  collection: string;
  field: string;
  operator: WhereFilterOp;
  value: unknown;
}
