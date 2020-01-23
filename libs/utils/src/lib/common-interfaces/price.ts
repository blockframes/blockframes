import { MovieCurrenciesSlug } from "@blockframes/utils/static-model/types";
import { getCodeIfExists } from "@blockframes/utils/static-model/staticModels";

export enum PaymentType {
  CB = 'Credit Card',
  WireTransfert = 'Wire Transfert',
  Cash = 'Cash',
  BTC = 'Bitcoin',
}

export interface Price {
  amount: number;
  currency: MovieCurrenciesSlug;
  vat?: number; // percentage
  fees?: Fee[];
  commission?: number;
  mg?: Price; // ie: minimun guaranteed
}

export interface Fee {
  label: string;
  price: Price;
}

export interface PaymentRaw<D> {
  id: string;
  date: D;
  type: PaymentType;
  price: Price;
}

export interface Payment extends PaymentRaw<Date> { }

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
    price: createPrice(params.price),
    ...params
  }
}

/**
 * A factory function that creates a payment
 */
export function createPayment(params: Partial<Payment> = {}): Payment {
  return {
    id: '',
    date: null,
    type: null,
    price: createPrice(params ? params.price : undefined),
    ...params
  }
}