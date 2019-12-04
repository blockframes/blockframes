import { DateRange } from '@blockframes/utils/common-interfaces/date-range';
import { Price, createPrice } from '@blockframes/utils/common-interfaces/price';

export const enum CartStatus {
  pending = 'pending',
  submitted = 'submitted',
  accepted = 'accepted',
  paid = 'paid'
}

export interface CatalogCart {
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
