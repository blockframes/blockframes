import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { BasketStore, BasketState } from './basket.store';
import { DistributionRight, CatalogBasket } from './basket.model';

@Injectable({ providedIn: 'root' })
export class BasketQuery extends QueryEntity<BasketState, DistributionRight> {

  constructor(protected store: BasketStore) {
    super(store);
  }

  getBasket(): CatalogBasket {
    const rights = this.getAll();
    const { status, price } = this.getValue();
    return { rights, status, price };
  }
}
