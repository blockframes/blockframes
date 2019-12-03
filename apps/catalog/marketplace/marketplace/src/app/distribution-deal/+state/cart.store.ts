import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { Price, CartStatus, CatalogCart } from './cart.model';

export interface CartState extends EntityState<CatalogCart> {
  name: string;
  price: Price;
  status: CartStatus;
  deals: string[];
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'basket', idKey: 'id' })
export class CartStore extends EntityStore<CartState, CatalogCart> {
  constructor() {
    super();
  }
}
