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
    // 10/09/2020: Update to `this.upsert` when akita-ng-fire is updated
    const orgId = this.orgQuery.getActiveId();
    const exists = await this.getRef(id, { params: { orgId }}).get().then(snap => snap.exists);
    return exists
      ? this.update({ id, ...updates }, { params: { orgId }})
      : this.add({ id, movieId: id, ...updates }, { params: { orgId }});
  }
}