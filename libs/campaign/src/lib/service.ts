import { Injectable } from '@angular/core';
import { OrganizationService } from '@blockframes/organization/+state';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { Movie, Campaign } from '@blockframes/model';
import { combineLatest, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { FireCollection } from 'ngfire';

export interface MovieCampaign extends Movie {
  campaign: Campaign;
}

@Injectable({ providedIn: 'root' })
export class CampaignService extends FireCollection<Campaign> {
  // Collection path
  readonly path = 'campaigns';

  // Memorize all requests that has been done
  memorize = true;

  constructor(private orgService: OrganizationService, private movieService: MovieService) {
    super();
  }

  /** Query movies with their campaign */
  queryMoviesCampaign(ids: string[]) {
    if (ids.length) {
      const query = (id: string) =>
        combineLatest([this.movieService.valueChanges(id), this.valueChanges(id)]).pipe(
          map(([movie, campaign]) => ({ ...movie, campaign }))
        );
      return combineLatest(ids.map(query));
    } else {
      return of([]);
    }
  }

  create(movieId: string) {
    const orgId = this.orgService.org.id;
    const id = movieId; // We use the movieId to index the campaign in the org
    return this.add({ id, orgId });
  }

  async save(id: string, updates: Partial<Campaign>) {
    const orgId = this.orgService.org.id;
    return this.upsert({ id, orgId, ...updates });
  }
}
