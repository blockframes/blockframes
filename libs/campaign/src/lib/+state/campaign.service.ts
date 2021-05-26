import { Injectable } from "@angular/core";
import { OrganizationQuery } from "@blockframes/organization/+state";
import { CollectionService, CollectionConfig } from 'akita-ng-fire';
import { Campaign } from "./campaign.model";
import { CampaignState, CampaignStore } from "./campaign.store";
import { removeUndefined } from '@blockframes/utils/helpers';
import { Movie, MovieService } from "@blockframes/movie/+state";
import { combineLatest, of } from "rxjs";
import { map } from "rxjs/operators";

export interface MovieCampaign extends Movie {
  campaign: Campaign;
}

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'campaigns' })
export class CampaignService extends CollectionService<CampaignState> {

  constructor(
    protected store: CampaignStore,
    private orgQuery: OrganizationQuery,
    private movieService: MovieService
  ) {
    super(store);
  }

  // Make sure we remove all undefined values
  formatToFirestore(campaign: Partial<Campaign>) {
    return removeUndefined(campaign);
  }

  /** Query movies with their campaign */
  queryMoviesCampaign(ids: string[]) {
    if (ids.length) {
      const query = (id: string) => combineLatest([
        this.movieService.valueChanges(id),
        this.valueChanges(id),
      ]).pipe(map(([movie, campaign]) => ({ ...movie, campaign })));
      return combineLatest(ids.map(query))
    } else {
      return of([]);
    }
  }

  create(movieId: string) {
    const orgId = this.orgQuery.getActiveId();
    const id = movieId; // We use the movieId to index the campaign in the org
    return this.add({ id, movieId, orgId });
  }

  async save(id: string, updates: Partial<Campaign>) {
    const orgId = this.orgQuery.getActiveId();
    return this.upsert({ id, orgId, ...updates });
  }
}