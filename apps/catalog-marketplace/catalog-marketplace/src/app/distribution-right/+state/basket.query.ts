import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { BasketStore, BasketState } from './basket.store';
import { CatalogBasket } from './basket.model';

@Injectable({ providedIn: 'root' })
export class BasketQuery extends QueryEntity<BasketState, CatalogBasket> {
  constructor(protected store: BasketStore) {
    super(store);
  }
}
