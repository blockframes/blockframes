import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { StakeholderStore, StakeholderState } from './stakeholder.store';
import { Stakeholder } from './stakeholder.model';

@Injectable({
  providedIn: 'root'
})

export class StakeholderQuery extends QueryEntity<StakeholderState, Stakeholder> {
  constructor(protected store: StakeholderStore) {
    super(store);
  }
}
