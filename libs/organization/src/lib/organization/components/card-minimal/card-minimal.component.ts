import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

function parseOrg(org) {
  /* Only the org from Algolia has the key `objectID` */
  if (org?.objectID) {
    return {
      id: org.objectID,
      logo: org.logo,
      denomination: org.denomination
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
