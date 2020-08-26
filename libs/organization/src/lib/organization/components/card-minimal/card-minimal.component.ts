import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Organization } from '@blockframes/organization/+state';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';

@Component({
  selector: '[org] org-card-minimal',
  templateUrl: './card-minimal.component.html',
  styleUrls: ['./card-minimal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationCardMinimalComponent {

  @Input() org: Organization;
  
}
