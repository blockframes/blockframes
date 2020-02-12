import { MovieCurrenciesSlug } from "@blockframes/utils/static-model/types";
import { getCodeIfExists } from "@blockframes/utils/static-model/staticModels";
import { firestore } from "firebase";
import { toDate } from "@blockframes/utils";

type Timestamp = firestore.Timestamp;

export enum PaymentType {
  CB = 'Credit Card',
  WireTransfert = 'Wire Transfert',
  Cash = 'Cash',
  BTC = 'Bitcoin',
}

export const enum CommissionBase {
  amount = 'Amount',
  amountminusvat = 'Amount - VAT',
  amountplusvat = 'Amount + VAT',
  grossreceipts = 'Gross Receipts',
  netreceipts = 'Net Receipts',
}

export const enum ExpenseType {
  market = 'Market expenses (price.commission)',
  export = 'Export expenses (price.amount)'
}

export const enum ExpenseSubType {
  technical = 'Technical expenses',
  delivery = 'Delivery expenses',
  marketing = 'Marketing expenses',
  translation = 'Translation expenses',
}

export const enum PaymentStatus {
  unknown = 'unknown',
  waitingpayment = 'waiting for payment',
  due = 'Due',
  paid = 'Paid',
  partialpaid = 'Partially paid',
  notdueyet = 'Not due yet',
}

export interface PriceRaw<D> {
  amount: number;
  currency: MovieCurrenciesSlug;
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
  const defaultCurrency = getCodeIfExists('MOVIE_CURRENCIES', 'euro');
  return {
    amount: 0,
    currency: defaultCurrency,
    ...price
  }
}

export function formatPrice(price: any): Price {
  const p = {
    ...price
  }

  if(price.recoupableExpenses) {
    p.recoupableExpense = price.recoupableExpenses.map(r => formatExpense(r))
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
    type: ExpenseType.export,
    subType: ExpenseSubType.delivery,
    status: PaymentStatus.unknown,
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
    payments: expense.payments.map(p => formatPayment(p)),
  }
}

/**
 * A factory function that creates a payment
 */
export function createPayment(params: Partial<Payment> = {}): Payment {
  return {
    id: '',
    date: new Date(),
    type: PaymentType.CB,
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
