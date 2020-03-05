import { Price, createPrice } from '@blockframes/utils/common-interfaces/price';

export const cartStatus = {
  pending : 'Pending',
  submitted: 'Submitted',
  accepted : 'Accepted',
  paid : 'Paid'
} as const;

export type CartStatus = keyof typeof cartStatus;
export type CartStatusValue = typeof cartStatus[CartStatus];

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
    status: 'pending',
    deals: [],
    ...cart,
    price: createPrice(cart.price),
  }
}
