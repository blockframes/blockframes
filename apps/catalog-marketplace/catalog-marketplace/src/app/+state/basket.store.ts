import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { DistributionRight, Price, BasketStatus } from './basket.model';

export interface BasketState extends EntityState<DistributionRight> {
  price: Price;
  status: BasketStatus;
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'basket' })
export class BasketStore extends EntityStore<BasketState, DistributionRight> {

  constructor() {
    super();
  }

}

