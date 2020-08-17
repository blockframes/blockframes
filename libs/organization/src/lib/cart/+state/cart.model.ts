import { Price, createPrice } from '@blockframes/utils/common-interfaces/price';
import { CartStatus } from '@blockframes/utils/static-model/types';

export interface CatalogCart {
  name: string;
  status: CartStatus;
  rights: string[];
  price: Price;
}

/**
 * A factory function that creates Cart
 */
export function createCart(cart: Partial<CatalogCart> = {}): CatalogCart {
  return {
    name: 'default',
    status: 'pending',
    rights: [],
    ...cart,
    price: createPrice(cart.price),
  }
}
