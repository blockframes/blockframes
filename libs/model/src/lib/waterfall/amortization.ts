import { DocumentMeta } from '../meta';
import { AmortizationStatus } from '../static';

export interface Amortization {
  _meta?: DocumentMeta;
  id: string;
  waterfallId: string;
  name: string;
  contractIds: string[];
  status: AmortizationStatus;
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
