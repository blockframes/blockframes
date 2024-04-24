import { DocumentMeta } from '../meta';
import { AmortizationStatus } from '../static';

export interface Amortization {
  _meta?: DocumentMeta;
  id: string;
  waterfallId: string;
  name: string;
  contractIds: string[];
  status: AmortizationStatus;
  filmCost: number;
  financing: number;
  poolName: string;
}

export function createAmortization(params: Partial<Amortization>): Amortization {
  return {
    id: '',
    status: 'draft',
    name: '',
    waterfallId: '',
    contractIds: [],
    filmCost: 0,
    financing: 0,
    poolName: '',
    ...params
  };
}
