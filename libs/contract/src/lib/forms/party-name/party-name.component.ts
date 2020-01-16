import { ContractPartyForm } from './party-name.form';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { PartyDetailsForm } from '../contract.form'

@Component({
    selector: '[form] contract-form-party-name',
    templateUrl: './party-name.component.html',
    styleUrls: ['./party-name.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractFormPartyNameComponent { 
    @Input() form: ContractPartyForm;

    public displayNameControl(control: PartyDetailsForm) {
        return control.get('party').get('displayName');
      }
}