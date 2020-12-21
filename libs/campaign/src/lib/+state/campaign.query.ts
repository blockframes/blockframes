import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { CampaignStore, CampaignState } from './campaign.store';
import { Campaign } from './campaign.model';

@Injectable({ providedIn: 'root' })
export class CampaignQuery extends QueryEntity<CampaignState, Campaign> {
  constructor(protected store: CampaignStore) {
    super(store);
  }
}