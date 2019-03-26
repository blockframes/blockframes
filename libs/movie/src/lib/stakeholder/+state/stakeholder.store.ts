import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { Stakeholder } from './stakeholder.model';

export interface StakeholderState extends EntityState<Stakeholder> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'stakeholder' })
export class StakeholderStore extends EntityStore<StakeholderState, Stakeholder> {

  constructor() {
    super();
  }

}


