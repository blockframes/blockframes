import { DocumentMeta } from './meta';
import type { PaymentStatus } from './static/types';

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
    date: new Date(),
    typeId: '',
    nature: '',
    capped: false,
    ...params,
  };
}

interface ExpenseCap {
  default: number;
  version: Record<string, number>;
}

export interface ExpenseType {
  id: string;
  name: string;
  contractId: string;
  cap: ExpenseCap;
}

export function createExpenseType(params: Partial<ExpenseType> = {}): ExpenseType {
  return {
    id: '',
    name: '',
    contractId: '',
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
