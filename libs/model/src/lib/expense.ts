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
  version: Record<string, { hidden?: true, price: number }>;
  currency: MovieCurrency;
  typeId: string;
  nature: string;
  capped: boolean;
}

export function createExpense(params: Partial<Expense> = {}): Expense {
  return {
    id: '',
    contractId: '',
    rightholderId: '',
    titleId: '',
    status: 'pending',
    price: 0,
    version: {},
    currency: 'EUR',
    date: new Date(),
    typeId: '',
    nature: '',
    capped: false,
    ...params,
  };
}

interface ExpenseCap {
  default: number;
  version: Record<string, number>; // TODO #9520 key is versionId 
}

export interface ExpenseType {
  id: string;
  name: string;
  contractId: string;
  currency: MovieCurrency;
  cap: ExpenseCap;
}

export function createExpenseType(params: Partial<ExpenseType> = {}): ExpenseType {
  return {
    id: '',
    name: '',
    contractId: '',
    currency: 'EUR',
    ...params,
    cap: createExpenseCap(params.cap),
  };
}

function createExpenseCap(params: Partial<ExpenseCap> = {}): ExpenseCap {
  return {
    default: params.default ?? 0,
    version: params.version ?? {},
  };
}