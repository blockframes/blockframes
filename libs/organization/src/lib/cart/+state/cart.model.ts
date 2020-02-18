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

/**
 * A factory function that creates Cart
 */
export function createCart(cart: Partial<CatalogCart> = {}): CatalogCart {
  return {
    name: 'default',
    status: CartStatus.pending,
    deals: [],
    ...cart,
    price: createPrice(cart.price),
  }
}
