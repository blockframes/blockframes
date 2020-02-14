import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { staticModels } from '@blockframes/utils/static-model';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { PartyDetailsForm } from '../contract.form';
import { FormList } from '@blockframes/utils';

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

  public staticRoles = staticModels.LEGAL_ROLES.filter(role => {
    const wantedRoles = ['licensee', 'licensor'];
    return wantedRoles.includes(role.slug);
  })

  public staticSubRoles = staticModels.SUB_LICENSOR_ROLES.filter(role => {
    const wantedSubRoles = ['observator', 'signatory'];
    return wantedSubRoles.includes(role.slug)
  })

  public childRoleForm(index: number) {
    return this.form.at(index).get('childRoles');
  }

  public addRole() {
    this.form.add();
  }

  public showTooltip(type: 'add' | 'remove') {
    return type === 'add' ? `Add role` : `Remove role`
  }
}
