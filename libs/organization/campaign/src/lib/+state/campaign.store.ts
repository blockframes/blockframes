import { Injectable } from '@angular/core';
import { EntityStore, StoreConfig, EntityState, ActiveState } from '@datorama/akita';
import { Campaign } from './campaign.model';

export interface CampaignState extends EntityState<Campaign, string>, ActiveState<string> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'campaigns', idKey: 'id' })
export class CampaignStore extends EntityStore<CampaignState> {}
