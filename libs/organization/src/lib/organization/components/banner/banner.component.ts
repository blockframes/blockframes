import { ChangeDetectionStrategy, Component, OnInit, Input } from '@angular/core';
import { Organization } from '../../+state';
import { Movie } from '@blockframes/movie/+state';

@Component({
  selector: '[org] org-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationBannerComponent implements OnInit {
  
  _org: Organization;
  _movies: Movie[] = []
  
  @Input()
  set org(org: Organization) {
    this._org = org;
    this._movies = org.movies
      .filter(movie => {
        console.log('movie main: ', movie.main);
        return movie?.main.storeConfig.status === 'accepted' && movie?.main.storeConfig.appAccess.festival
      });
    console.log('org: ', this._org);
    console.log('movies: ', this._movies);
  }

  constructor() {}

  ngOnInit() {}
}
