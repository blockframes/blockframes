import { ContractForm } from '@blockframes/contract/contract/forms/contract.form';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { PartyDetailsForm } from '../contract.form';

@Component({
  selector: '[form] contract-form-party-name',
  templateUrl: './party-name.component.html',
  styleUrls: ['./party-name.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractFormPartyNameComponent {
  @Input() form: ContractForm;

  get partyControls() {
    return this.form.get('parties');
  }

  public displayNameControl(control: PartyDetailsForm) {
    return control.get('party').get('displayName');
  }

  public showName(control: PartyDetailsForm) {
    return control.get('party').get('showName');
  }
}
