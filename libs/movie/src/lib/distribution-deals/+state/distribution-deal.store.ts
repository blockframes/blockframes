import { EntityState, EntityStore, StoreConfig, ActiveState } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { DistributionDeal } from './distribution-deal.model';

export interface DistributionDealState extends EntityState<DistributionDeal>, ActiveState<string> {}

const initialState = {
  active: null
};

@Injectable({
  providedIn: 'root'
})
@StoreConfig({ name: 'distrbution-deals' })
export class DistributionDealStore extends EntityStore<DistributionDealState, DistributionDeal> {
  constructor() {
    super(initialState);
  }
}
