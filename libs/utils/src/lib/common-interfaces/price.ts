import { MovieCurrenciesSlug } from "@blockframes/movie/movie/static-model/types";

export interface Price {
  amount: number;
  currency: MovieCurrenciesSlug;
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