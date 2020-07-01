import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Organization } from '../../+state';
import { Movie } from '@blockframes/movie/+state';

@Component({
  selector: '[org] org-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationBannerComponent {
  
  _org: Organization;
  _movies: Movie[] = []
  
  @Input()
  set org(org: Organization) {
    this._org = org;
    if (!!org.movies) {
      this._movies = org.movies
        .filter(movie => movie?.main.storeConfig.status === 'accepted' && movie?.main.storeConfig.appAccess.festival);
    }
  }

  constructor() {}

}
