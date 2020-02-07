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
  @Input() type: 'licensee' | 'licensor' = 'licensee';
  public _hasRole: boolean;
  @Input()
  get hastRole() { return this._hasRole; }
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

  private getRoleValue(index: number) {
    return this.form.at(index).get('party').get('role').value
  }

  public partyIsType(index: number) {
    return this.getRoleValue(index) === this.type ? true : this.getRoleValue(index) === 'undefined' ? true : false;
  }

  public addRole() {
    this.form.add({ party: { role: this.type } });
  }

  public showTooltip(type: 'add' | 'remove') {
    const titlecase = this.type.charAt(0).toUpperCase() + this.type.slice(1)
    return type === 'add' ? `Add ${titlecase}` : `Remove ${titlecase}`
  }
}
