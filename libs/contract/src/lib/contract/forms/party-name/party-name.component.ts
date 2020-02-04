import { staticModels } from '@blockframes/utils/static-model';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { PartyDetailsForm } from '../contract.form';
import { FormList } from '@blockframes/utils';

@Component({
  selector: '[form] contract-form-party-name',
  templateUrl: './party-name.component.html',
  styleUrls: ['./party-name.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractFormPartyNameComponent {
  @Input() form: FormList<any, PartyDetailsForm>;
  public staticRoles = staticModels['LEGAL_ROLES'].filter(role => {
    const wantedRoles = ['licensor', 'licensee'];
    return wantedRoles.includes(role.slug);
  });

  public addEntity() {
    this.form.add({ party: { showName: true, role: 'licensee' } });
  }
}
