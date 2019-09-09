import { Observable } from 'rxjs/internal/Observable';
import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { BasketStore, BasketState } from './basket.store';
import { DistributionRight } from './basket.model';

@Injectable({ providedIn: 'root' })
export class BasketQuery extends QueryEntity<BasketState, DistributionRight> {

  constructor(protected store: BasketStore) {
    super(store);
  }

  get distributionRight(): Observable<DistributionRight> | Observable<DistributionRight[]> {
    return this.selectActive()
  }
}
