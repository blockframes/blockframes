import { DateRange } from '@blockframes/utils/date-range';
import { MovieCurrenciesSlug } from '@blockframes/movie/movie/static-model/types';

export const enum CartStatus {
  pending = 'pending',
  submitted = 'submitted',
  accepted = 'accepted',
  paid = 'paid'
}

export interface Price {
  amount: number;
  currency: MovieCurrenciesSlug;
}

export interface CatalogCart {  // @todo #1061 => Cart & add to draw.io => pouvoir avoir n cart sur l'org. Ajouter un "name" au cart. Idem wishlist
  name: string;
  status: CartStatus;
  deals: string[];
  price: Price;
}

export interface MovieData {
  id: string;
  movieName: string;
  duration: DateRange;
  territory: string;
  rights: string;
  languages: string;
  dubbed: string;
  subtitle: string;
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
 * A factory function that creates Cart
 */
export function createCart(cart: Partial<CatalogCart> = {}): CatalogCart {
  return {
    name: 'default',
    status: CartStatus.pending,
    price: createPrice(),
    deals: [],
    ...cart
  }
}
