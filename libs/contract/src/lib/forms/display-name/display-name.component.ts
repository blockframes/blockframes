import { ContractPartyForm } from './display-name.form';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: '[form] contract-form-display-name',
    templateUrl: './display-name.component.html',
    styleUrls: ['./display-name.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractFormDisplayNameComponent { 
    @Input() form: ContractPartyForm;
}