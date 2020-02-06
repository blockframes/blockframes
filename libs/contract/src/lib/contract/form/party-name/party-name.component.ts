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
  @Input() type?: 'licensee' | 'licensor' = 'licensee';
  public addEntity(){
    this.form.add({ party: { role: this.type}});
  }
}
