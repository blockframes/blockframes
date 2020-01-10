import { ContractPartyForm } from './display-name.form';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { PartyDetailsForm } from '../contract.form'

@Component({
    selector: '[form] contract-form-display-name',
    templateUrl: './display-name.component.html',
    styleUrls: ['./display-name.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractFormDisplayNameComponent { 
    @Input() form: ContractPartyForm;

    public displayNameControl(control: PartyDetailsForm) {
        return control.get('party').get('displayName');
      }
}