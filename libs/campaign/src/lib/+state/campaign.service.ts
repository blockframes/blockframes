import { Injectable } from '@angular/core';
import { OrganizationService } from '@blockframes/organization/+state';
import { CollectionService, CollectionConfig } from 'akita-ng-fire';
import { Campaign } from "./campaign.model";
import { removeUndefined } from '@blockframes/utils/helpers';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { Movie } from '@blockframes/data-model';
import { combineLatest, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActiveState, EntityState } from '@datorama/akita';

interface CampaignState extends EntityState<Campaign, string>, ActiveState<string> {}

export interface MovieCampaign extends Movie {
  campaign: Campaign;
}

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'campaigns' })
export class CampaignService extends CollectionService<CampaignState> {
  useMemorization = true;

  constructor(
    private orgService: OrganizationService,
    private movieService: MovieService
  ) {
    super();
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
    const orgId = this.orgService.org.id;
    const id = movieId; // We use the movieId to index the campaign in the org
    return this.add({ id, movieId, orgId });
  }

  async save(id: string, updates: Partial<Campaign>) {
    const orgId = this.orgService.org.id;
    return this.upsert({ id, orgId, ...updates });
  }
}
