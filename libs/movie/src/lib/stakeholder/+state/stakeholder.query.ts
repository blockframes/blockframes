import { QueryEntity } from '@datorama/akita';
import { StakeholderStore, StakeholderState } from './stakeholder.store';
import { Stakeholder } from './stakeholder.model';

export class StakeholderQuery extends QueryEntity<StakeholderState, Stakeholder> {
  constructor(protected store: StakeholderStore) {
    super(store);
  }
}
