import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { CartStatus, CatalogCart } from './cart.model';
import { Price } from '@blockframes/utils/common-interfaces/price';

export interface CartState extends EntityState<CatalogCart> {
  name: string;
  price: Price;
  status: CartStatus;
  deals: string[];
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'cart', idKey: 'id' })
export class CartStore extends EntityStore<CartState, CatalogCart> {
  constructor() {
    super();
  }
}
