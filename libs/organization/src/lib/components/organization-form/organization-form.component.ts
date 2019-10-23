import { Component, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { PLACEHOLDER_LOGO } from '../../+state';

@Component({
  selector: '[formGroupName] organization-form, [formGroup] organization-form, organization-form',
  templateUrl: './organization-form.component.html',
  styleUrls: ['./organization-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationFormComponent {
  @HostBinding('attr.page-id') pageId = 'organization-form';

  constructor(public controlContainer: ControlContainer) {}

  public get control() {
    return this.controlContainer.control;
  }
}
