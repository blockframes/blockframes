import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig, MultiActiveState } from '@datorama/akita';
import { StakeholderDocument } from './stakeholder.firestore';

export interface StakeholderState extends EntityState<StakeholderDocument>, MultiActiveState {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'stakeholder' })
export class StakeholderStore extends EntityStore<StakeholderState, StakeholderDocument> {

  constructor() {
    super()
  }
}
