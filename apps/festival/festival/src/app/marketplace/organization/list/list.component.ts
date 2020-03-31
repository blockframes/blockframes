import { Component, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { OrganizationQuery } from '@blockframes/organization/organization/+state/organization.query';
import { scaleOut, scaleOutList } from '@blockframes/utils/animations/fade';

@Component({
  selector: 'festival-marketplace-organization-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: [scaleOut, scaleOutList('a')],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {
  @HostBinding('@scaleOut') animation = true;
  // @HostBinding('@scaleOutList') animList = true;
  organizations$ = this.query.selectAll();

  constructor(private query: OrganizationQuery) { }

}
