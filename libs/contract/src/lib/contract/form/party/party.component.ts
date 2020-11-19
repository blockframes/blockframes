import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { legalRoles, subLicensorRoles } from '@blockframes/utils/static-model';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { PartyDetailsForm } from '../contract.form';
import { FormList } from '@blockframes/utils/form/forms/list.form';
import { AlgoliaIndex } from '@blockframes/utils/algolia';

@Component({
  selector: '[form] contract-form-party',
  templateUrl: 'party.component.html',
  styleUrls: ['party.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractFormPartyComponent {
  @Input() form: FormList<any, PartyDetailsForm>;
  public _hasRole: boolean;
  @Input()
  get hasRole() { return this._hasRole; }
  set hasRole(value: boolean) {
    this._hasRole = coerceBooleanProperty(value);
  }

  public algoliaOrg: AlgoliaIndex = 'org';

  public staticRoles = Object.keys(legalRoles).filter(role => {
    const wantedRoles = ['licensee', 'licensor'];
    return wantedRoles.includes(role);
  })

  public staticSubRoles = Object.keys(subLicensorRoles).filter(role => {
    const wantedSubRoles = ['observator', 'signatory'];
    return wantedSubRoles.includes(role)
  })


  public displayNameControl(control: PartyDetailsForm) {
    return control.get('party').get('displayName');
  }

  public childRoleForm(index: number) {
    return this.form.at(index).get('childRoles');
  }

  public addRole() {
    this.form.add();
  }

  public patchOrgId(event: any, control: PartyDetailsForm) {
    control.get('party').get('orgId').setValue(event.objectID)
  }
}
