import { Component, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { scaleOut } from '@blockframes/utils/animations/fade';
import { Observable } from 'rxjs';
import { Organization } from '@blockframes/organization/+state';
import { map } from 'rxjs/operators';
import { centralOrgID } from '@env';
import { Movie } from '@blockframes/movie/+state';

@Component({
  selector: 'festival-organization-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: [scaleOut],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {
  @HostBinding('@scaleOut') animation = true;
  orgs$: Observable<Organization[]>;
  public movies: Movie[] = [];

  constructor(private service: OrganizationService) {
    this.orgs$ = this.service
      .queryWithMovies(ref => ref
        .where('appAccess.festival.dashboard', '==', true)
        .where('status', '==', 'accepted'))
      .pipe(map(orgs => orgs.filter((org: Organization) => org.id !== centralOrgID && this.getOrgWithMovie(org).length > 0)));
  }

  // Get the number of movies available for an organization
  getOrgWithMovie(org: Organization) {
    this.movies = org.movies
      .filter(movie => movie?.main.storeConfig.status === 'accepted' && movie?.main.storeConfig.appAccess.festival);
    return this.movies;
  }
}
