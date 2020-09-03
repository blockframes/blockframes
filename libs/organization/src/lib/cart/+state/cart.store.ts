import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { CatalogCart } from './cart.model';
import { Price } from '@blockframes/utils/common-interfaces/price';
import { CartStatus } from '@blockframes/utils/static-model/types';


export interface CartState extends EntityState<CatalogCart> {
  name: string;
  price: Price;
  status: CartStatus;
  rights: string[];
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'cart', idKey: 'id' })
export class CartStore extends EntityStore<CartState, CatalogCart> {
  constructor() {
    super();
  }
}
