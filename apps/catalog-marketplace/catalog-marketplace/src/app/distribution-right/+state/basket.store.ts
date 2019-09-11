import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { DistributionRight, Price, BasketStatus, CatalogBasket } from './basket.model';

export interface BasketState extends EntityState<CatalogBasket> {
  id: string;
  price: Price;
  status: BasketStatus;
  rights: DistributionRight[];
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'basket', idKey: 'id' })
export class BasketStore extends EntityStore<BasketState, CatalogBasket> {
  constructor() {
    super();
  }
}
