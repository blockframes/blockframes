import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Organization } from '@blockframes/organization/+state';

@Component({
  selector: 'org-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationCardComponent {

  @Input() org: Organization;

}
