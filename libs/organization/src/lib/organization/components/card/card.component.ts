import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Organization } from '@blockframes/organization/+state';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { Movie } from '@blockframes/movie/+state';

@Component({
  selector: 'org-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationCardComponent {

  private _org: Organization;
  public movies: Movie[] = [];

  @Input()
  set org(org: Organization) {
    this._org = org;
    this.movies = org.movies
      .filter(movie => movie?.main.storeConfig.status === 'accepted' && movie?.main.storeConfig.appAccess.festival);
  };

  get org() {
    return this._org;
  }

  constructor(private movieQuery: MovieQuery){}

}
