import { Component, ChangeDetectionStrategy, HostBinding, OnInit } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { OrganizationForm } from '../../forms/organization.form';

@Component({
  selector: '[formGroupName] organization-form, [formGroup] organization-form, organization-form',
  templateUrl: './organization-form.component.html',
  styleUrls: ['./organization-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationFormComponent implements OnInit {
  @HostBinding('attr.page-id') pageId = 'organization-form';

  constructor(public controlContainer: ControlContainer) {}

  public get control() {
    return this.controlContainer.control as OrganizationForm;
  }

  public get mainAddress() {
    return this.control.addresses.main;
  }

  ngOnInit() {
    this.control.get('name').disable();
  }
}
