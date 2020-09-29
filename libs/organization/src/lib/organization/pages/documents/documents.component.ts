import { Component, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationQuery } from '../../+state/organization.query';
import { Organization } from '@blockframes/organization/+state';

@Component({
  selector: 'organzation-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentsComponent {
  public org: Organization = this.query.getActive();

  constructor(
    private query: OrganizationQuery,
  ) { }

}
