import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { createDenomination } from '@blockframes/model';
import { AlgoliaOrganization } from '@blockframes/utils/algolia';

function parseOrg(org) {
  /* Only the org from Algolia has the key `objectID` */
  if (org?.objectID) {
    const algoliaOrg = org as AlgoliaOrganization;
    return {
      id: algoliaOrg.objectID,
      logo: algoliaOrg.logo,
      denomination: createDenomination({ full: algoliaOrg.name })
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
  @Input() set org(org) {
    this._org = parseOrg(org);
  };

}
