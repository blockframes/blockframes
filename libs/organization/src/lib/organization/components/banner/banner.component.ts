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
  
  @Input() org: Organization;
  @Input() movies: Movie[] = [];

}
