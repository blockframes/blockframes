import { DocumentMeta } from '../meta';

export interface Amortization {
  _meta?: DocumentMeta;
  id: string;
  waterfallId: string;
  name: string;
  contractIds: string[];
  status: string; // TODO #9753 Create a type for this
}

export function createAmortization(params: Partial<Amortization>): Amortization {
  return {
    id: '',
    status: 'draft',
    name: '',
    waterfallId: '',
    contractIds: [],
    ...params
  };
}
