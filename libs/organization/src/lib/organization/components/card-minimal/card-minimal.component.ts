import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Organization } from '@blockframes/organization/+state';
import { AlgoliaOrganization } from '@blockframes/utils/algolia';

function parseOrg(org) {
  /* Only the org from Algolia has the key `objectID` */
  if ((org as AlgoliaOrganization)?.objectID) {
    const { denomination } = org.denomination
    return {
      id: org.objectID,
      logo: org.denomination.logo,
      denomination: denomination
    }
  }
  return org;
}

@Component({
  selector: '[org] org-card-minimal',
  templateUrl: './card-minimal.component.html',
  styleUrls: ['./card-minimal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationCardMinimalComponent {

  private _org;
  get org() { return this._org }
  @Input() set org(org: Organization | AlgoliaOrganization) {
    this._org = parseOrg(org);
  };

}
