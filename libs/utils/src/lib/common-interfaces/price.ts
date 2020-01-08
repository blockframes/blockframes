import { MovieCurrenciesSlug } from "@blockframes/movie/movie/static-model/types";
import { getCodeIfExists } from "@blockframes/movie/movie/static-model/staticModels";

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

/**
 * A factory function that creates Price
 */
export function createPrice(price: Partial<Price> = {}): Price {
  const defaultCurrency = getCodeIfExists('MOVIE_CURRENCIES','euro');
  return {
    amount: 0,
    currency: defaultCurrency ? defaultCurrency : '',
    ...price
  }
}

/**
 * A factory function that creates Fee
 */
export function createFee(fee: Partial<Fee> = {}): Fee {
  return {
    label: '',
    price: createPrice(fee.price),
    ...fee
  }
}
