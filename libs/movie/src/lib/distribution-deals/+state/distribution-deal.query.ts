import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { DistributionDeal } from './distribution-deal.model';
import { DistributionDealStore, DistributionDealState } from './distribution-deal.store';

@Injectable({
  providedIn: 'root'
})
export class DistributionDealQuery extends QueryEntity<DistributionDealState, DistributionDeal> {
  constructor(protected store: DistributionDealStore) {
    super(store);
  }
}
