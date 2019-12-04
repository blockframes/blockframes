import { MovieCurrenciesSlug } from "@blockframes/movie/movie/static-model/types";

export interface Price {
  amount: number;
  currency: MovieCurrenciesSlug;
  vat?: number; // percentage
}

export interface Fee {
  label: string;
  price: Price;
}

/**
 * A factory function that creates Price
 */
export function createPrice(price: Partial<Price> = {}): Price {
  return {
    amount: 0,
    currency: 'euro',
    ...price
  }
}

/**
 * A factory function that creates Fee
 */
export function createFee(fee: Partial<Fee> = {}): Fee {
  return {
    label: '',
    price: createPrice(),
    ...fee
  }
}