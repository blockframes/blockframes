import { EntityState, EntityStore, StoreConfig, ActiveState } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { DistributionDeal } from './distribution-deal.model';

export interface DistributionDealState extends EntityState<DistributionDeal>, ActiveState<string> {}

@Injectable({
  providedIn: 'root'
})
@StoreConfig({ name: 'distribution-deals' })
export class DistributionDealStore extends EntityStore<DistributionDealState, DistributionDeal> {
  constructor() {
    super();
  }
}
