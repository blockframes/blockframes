import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { DistributionRight, Price, CartStatus, CatalogCart } from './cart.model';

export interface CartState extends EntityState<CatalogCart> {
  id: string;
  price: Price;
  status: CartStatus;
  rights: DistributionRight[];
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'basket', idKey: 'id' })
export class CartStore extends EntityStore<CartState, CatalogCart> {
  constructor() {
    super();
  }
}
