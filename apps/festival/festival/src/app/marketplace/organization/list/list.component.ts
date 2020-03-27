import { Component, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationQuery } from '@blockframes/organization/organization/+state/organization.query';

@Component({
  selector: 'festival-marketplace-organization-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {

  organizations$ = this.query.selectAll();

  constructor(private query: OrganizationQuery) { }

}
