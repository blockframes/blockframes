import { staticModels } from '@blockframes/utils/static-model';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { PartyDetailsForm } from '../contract.form';
import { FormList } from '@blockframes/utils';

@Component({
  selector: '[form] contract-form-party-name',
  templateUrl: 'party-name.component.html',
  styleUrls: ['party-name.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractFormPartyNameComponent {
  @Input() form: FormList<any, PartyDetailsForm>;
  @Input() type: 'licensee' | 'licensor' = 'licensee';
  @Input() hasRole?: boolean;
  
  public staticSubRoles = staticModels.SUB_LICENSOR_ROLES.filter(role => {
    const wantedRoles = ['observator', 'signatory'];
    return wantedRoles.includes(role.slug)
  })

  public partyIsType(index: number) {
    console.log(this.form.at(index).get('party').get('role').value);
    return this.form.at(index).get('party').get('role').value === this.type;
  }

  public addRole() {
    this.form.add({ party: { role: this.type } });
  }

  public showTooltip(type: 'add' | 'remove') {
    const titlecase = this.type.charAt(0).toUpperCase() + this.type.slice(1)
    return type === 'add' ? `Add ${titlecase}` : `Remove ${titlecase}`
  }
}
