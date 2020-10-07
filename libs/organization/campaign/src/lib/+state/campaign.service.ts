import { Injectable } from "@angular/core";
import { CollectionService, CollectionConfig } from 'akita-ng-fire';
import { CampaignState, CampaignStore } from "./campaign.store";

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'orgs/:orgId/campaigns' })
export class CampainService extends CollectionService<CampaignState> {

  constructor(store: CampaignStore) {
    super(store);
  }

}