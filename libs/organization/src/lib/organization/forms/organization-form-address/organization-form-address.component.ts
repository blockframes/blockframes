import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { AddressForm } from '../../forms/organization.form';

@Component({
  selector: '[form] organization-form-address',
  templateUrl: './organization-form-address.component.html',
  styleUrls: ['./organization-form-address.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationFormAddressComponent {
  @Input() form: AddressForm;

}
