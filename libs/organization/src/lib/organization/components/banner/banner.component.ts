import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Organization } from '../../+state';
import { Movie } from '@blockframes/movie/+state/movie.model';

@Component({
  selector: '[org] org-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationBannerComponent {
  
  @Input() org: Organization;

  filterMovie = (movie: Movie) => movie.main.storeConfig.status === 'accepted' && movie.main.storeConfig.appAccess.festival;
}
