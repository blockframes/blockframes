import { DocumentMeta } from './meta';
import type { MovieCurrency } from './static/types';

export interface Income {
  _meta?: DocumentMeta;
  id: string;
  /** TermId linked to this income */
  termId: string;
  /** The contract that created this income */
  contractId: string;
  price: number;
  currency: MovieCurrency;
  offerId?: string;
  titleId?: string;
  status: 'pending' | 'processed';
  date: Date;
}

export interface TotalIncome {
  EUR: number;
  USD: number;
}

export function getTotalIncome(incomes: Income[]) {
  const initialTotal: TotalIncome = { EUR: 0, USD: 0 };
  incomes.forEach(i => initialTotal[i.currency] += i.price);
  return initialTotal;
}

export function createIncome(params: Partial<Income> = {}): Income {
  return {
    id: '',
    termId: '',
    contractId: '',
    price: 0,
    currency: 'EUR',
    status: 'pending',
    date: new Date(),
    ...params,
  };
}