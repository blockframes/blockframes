import { MovieCurrency } from "@blockframes/utils/static-model/types";
import type firebase from 'firebase';
import { toDate } from "@blockframes/utils/helpers"

type Timestamp = firebase.firestore.Timestamp;

export const paymentType = {
  CB: 'Credit Card',
  WireTransfert: 'Wire Transfert',
  Cash: 'Cash',
  BTC: 'Bitcoin',
} as const;

export type PaymentType = keyof typeof paymentType;
export type PaymentTypeValue = typeof paymentType[PaymentType];

export const commissionBase = {
  amount: 'Amount',
  amountminusvat: 'Amount - VAT',
  amountplusvat: 'Amount + VAT',
  grossreceipts: 'Gross Receipts',
  netreceipts: 'Net Receipts',
} as const;

export type CommissionBase = keyof typeof commissionBase;
export type CommissionBaseValue = typeof commissionBase[CommissionBase];

export const expenseType = {
  market: 'Market expenses (price.commission)',
  export: 'Export expenses (price.amount)'
} as const;

export type ExpenseType = keyof typeof expenseType;
export type ExpenseTypeValue = typeof expenseType[ExpenseType];

export const expenseSubType = {
  technical: 'Technical expenses',
  delivery: 'Delivery expenses',
  marketing: 'Marketing expenses',
  translation: 'Translation expenses',
} as const;

export type ExpenseSubType = keyof typeof expenseSubType;
export type ExpenseSubTypeValue = typeof expenseSubType[ExpenseSubType];

export const paymentStatus = {
  unknown: 'unknown',
  waitingpayment: 'waiting for payment',
  due: 'Due',
  paid: 'Paid',
  partialpaid: 'Partially paid',
  notdueyet: 'Not due yet',
} as const;

export type PaymentStatus = keyof typeof paymentStatus;
export type PaymentStatusValue = typeof paymentStatus[PaymentStatus];

export interface PriceRaw<D> {
  amount: number;
  currency?: MovieCurrency;
  /**
   * @dev percentage
   */
  vat?: number;
  recoupableExpenses?: ExpenseRaw<D>[];
  /**
   * @dev about commission & commissionBase :
   * commission is a percentage (of amount)
   * commissionBase define if we take the amount minus VAT or plus VAT for example
   */
  commission?: number;
  commissionBase?: CommissionBase,
  /**
   * @dev : minimum guaranteed
   */
  mg?: PriceRaw<D>;
}

export interface Price extends PriceRaw<Date> {
}

export interface PriceDocument extends PriceRaw<Timestamp> {
}

interface ExpenseRaw<D> {
  label: string;
  type: ExpenseType;
  subType: ExpenseSubType;
  /**
   * @dev Expected (actual) price for this fee
   */
  price: PriceRaw<D>;
  /**
   * @dev Since a fee can be payed trhough various payments
   * Collected is the sum of price of paymentIds: Payments.
   * A function should handle this
   */
  collected: PriceRaw<D>;
  /**
   * @dev Status is determined by doing price - collected
   * A function should handle this
   */
  status: PaymentStatus
  /**
   * @dev the various payments associated with this expense
   */
  payments: PaymentRaw<D>[];
  /**
   * @dev Id of the actual Expense in collection
   * contains raw informations about the current expense.
   */
  expenseId?: string;
}

export interface Expense extends ExpenseRaw<Date> {
}

export interface ExpenseDocument extends ExpenseRaw<Timestamp> {
}

export interface PaymentRaw<D> {
  id: string;
  date: D;
  type: PaymentType;
  price: PriceRaw<D>;
}

export interface Payment extends PaymentRaw<Date> { }

export interface PaymentDocument extends PaymentRaw<Timestamp> { }

/**
 * A factory function that creates Price
 */
export function createPrice(price: Partial<Price> = {}): Price {
  const defaultCurrency = 'EUR';
  return {
    amount: 0,
    currency: defaultCurrency,
    ...price
  }
}

export function formatPrice(price: Price): Price {
  const p = {
    ...price
  }

  if (price.recoupableExpenses) {
    p.recoupableExpenses = price.recoupableExpenses.map((r: any) => formatExpense(r))
  }

  if (price.mg) {
    p.mg = formatPrice(price.mg);
  }

  return price;
}

/**
 * A factory function that creates Expense
 */
export function createExpense(params: Partial<Expense> = {}): Expense {
  return {
    label: '',
    type: 'export',
    subType: 'delivery',
    status: 'unknown',
    payments: [],
    ...params,
    price: createPrice(params.price),
    collected: createPrice(params.collected),
  }
}

export function formatExpense(expense: any): Expense {
  return {
    ...expense,
    price: formatPrice(expense.price),
    collected: formatPrice(expense.collected),
    payments: expense.payments.map((p: any) => formatPayment(p)),
  }
}

/**
 * A factory function that creates a payment
 */
export function createPayment(params: Partial<Payment> = {}): Payment {
  return {
    id: '',
    date: new Date(),
    type: 'CB',
    price: createPrice(params ? params.price : undefined),
    ...params
  }
}

export function formatPayment(payment: any): Payment {
  return {
    ...payment,
    date: toDate(payment.date),
    price: formatPrice(payment ? payment.price : undefined),
  }
}
