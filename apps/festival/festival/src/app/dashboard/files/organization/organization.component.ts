import { ChangeDetectionStrategy, Component } from '@angular/core';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { Organization } from '@blockframes/organization/+state/organization.model';

const columns = { 
  ref: 'Type',
  title: 'Document Name',
  edit: 'Edit',
  delete: 'Delete'
 };

@Component({
  selector: 'festival-dashboard-organization-resources',
  templateUrl: 'organization.component.html',
  styleUrls: ['./organization.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationResourcesComponent {
  public org: Organization = this.query.getActive();

  public columns = columns;
  public initialColumns = Object.keys(columns);

  constructor(
    private query: OrganizationQuery,
  ) { }

}