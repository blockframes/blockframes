import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Component({
  selector: '[formGroupName] organization-form-address, [formGroup] organization-form-address, organization-form-address',
  templateUrl: './organization-form-address.component.html',
  styleUrls: ['./organization-form-address.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationFormAddressComponent {

  constructor(public controlContainer: ControlContainer) {}

  public get control() {
    return this.controlContainer.control;
  }
}
