import { DocumentMeta } from './meta';
import type { MovieCurrency, PaymentStatus } from './static/types';

export interface Expense {
  _meta?: DocumentMeta;
  id: string;
  date: Date;
  /** The contract linked to this expense */
  contractId: string;
  rightholderId: string;
  titleId: string; // equals waterfallId
  status: PaymentStatus;
  price: number;
  currency: MovieCurrency;
  type: string;
  category: string;
}

export function createExpense(params: Partial<Expense> = {}): Expense {
  return {
    id: '',
    contractId: '',
    rightholderId: '',
    titleId: '',
    status: 'pending',
    price: 0,
    currency: 'EUR',
    date: new Date(),
    type: '',
    category: '',
    ...params,
  };
}