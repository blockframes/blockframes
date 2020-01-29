import { MovieCurrenciesSlug } from "@blockframes/utils/static-model/types";
import { getCodeIfExists } from "@blockframes/utils/static-model/staticModels";
import { firestore } from "firebase";
import { LegalDocument } from "@blockframes/contract/contract/+state/contract.firestore";

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
}

export const enum FeeType {
  market = 'Market fees (price.commission)',
  export = 'Export fees (price.amount)'
}

export const enum FeeSubType {
  technical = 'Technical fees',
  delivery = 'Delivery fees',
  marketing = 'Marketing fees',
  translation = 'Translation fees',
}

export const enum PaymentStatus {
  unknown = 'unknown',
  waitingpaiment = 'waiting for payment',
  due = 'Due',
  paid = 'Paid',
  partialpaid = 'Partially paid',
  notdueyet = 'Not due yet',
}

interface PriceRaw<D> {
  amount: number;
  currency: MovieCurrenciesSlug;
  /**
   * @dev percentage
   */
  vat?: number;
  fees?: FeeRaw<D>[];
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

interface FeeRaw<D> {
  label: string;
  type: FeeType;
  subType: FeeSubType;
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
  paymentIds: PaymentRaw<D>[];
  /**
   * @dev ie: can be the bill of a meeting in a restaurant
   */
  legalDocuments?: LegalDocument[];

}

export interface Fee extends FeeRaw<Date> {
}

export interface FeeDocument extends FeeRaw<Timestamp> {
}

interface PaymentRaw<D> {
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

/**
 * A factory function that creates Fee
 */
export function createFee(params: Partial<Fee> = {}): Fee {
  return {
    label: '',
    type: FeeType.export,
    subType: FeeSubType.delivery,
    status: PaymentStatus.unknown,
    paymentIds: [],
    ...params,
    price: createPrice(params.price),
    collected: createPrice(params.collected),
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