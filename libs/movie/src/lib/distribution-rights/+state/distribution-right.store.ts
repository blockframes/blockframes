import { EntityState, EntityStore, StoreConfig, ActiveState } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { DistributionRight } from './distribution-right.model';

export interface DistributionRightState extends EntityState<DistributionRight>, ActiveState<string> {}

@Injectable({
  providedIn: 'root'
})
@StoreConfig({ name: 'distribution-rights' })
export class DistributionRightStore extends EntityStore<DistributionRightState, DistributionRight> {
  constructor() {
    super();
  }
}
