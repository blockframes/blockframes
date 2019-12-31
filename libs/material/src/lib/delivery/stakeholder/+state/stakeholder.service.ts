import { Injectable } from '@angular/core';
import { CollectionService, CollectionConfig } from 'akita-ng-fire';
import { StakeholderStore, StakeholderState } from './stakeholder.store';
import { DeliveryQuery } from '../../+state/delivery.query';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'deliveries/:deliveryId/stakeholders' })
export class StakeholderService extends CollectionService<StakeholderState> {
  constructor(
    private deliveryQuery: DeliveryQuery,
    store: StakeholderStore
  ) {
    super(store)
  }

  get path() {
    return `deliveries/${this.deliveryQuery.getActiveId()}/stakeholders`
  }
}
