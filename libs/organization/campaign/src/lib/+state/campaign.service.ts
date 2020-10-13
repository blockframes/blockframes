import { Injectable } from "@angular/core";
import { OrganizationQuery } from "@blockframes/organization/+state";
import { CollectionService, CollectionConfig } from 'akita-ng-fire';
import { Campaign } from "./campaign.model";
import { CampaignState, CampaignStore } from "./campaign.store";
import { removeUndefined } from '@blockframes/utils/helpers';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'orgs/:orgId/campaigns' })
export class CampaignService extends CollectionService<CampaignState> {

  constructor(protected store: CampaignStore, private orgQuery: OrganizationQuery) {
    super(store);
  }

  // Make sure we remove all undefined values
  formatToFirestore(campaign: Partial<Campaign>) {
    return removeUndefined(campaign);
  }

  create(movieId: string) {
    const orgId = this.orgQuery.getActiveId();
    const id = movieId; // We use the movieId to index the campaign in the org
    return this.add({ id, movieId }, { params: {orgId}});
  }

  async save(id: string, updates: Partial<Campaign>) {
    const orgId = this.orgQuery.getActiveId();
    return this.upsert({ id, ...updates }, { params: { orgId }});
  }
}