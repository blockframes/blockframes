import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { PLACEHOLDER_LOGO } from '../../+state';

@Component({
  selector: '[formGroupName] organization-form, [formGroup] organization-form, organization-form',
  templateUrl: './organization-form.component.html',
  styleUrls: ['./organization-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationFormComponent {
  constructor(public controlContainer: ControlContainer) {}

  public get control() {
    return this.controlContainer.control;
  }

  public get logo() {
    return this.control.get('logo').value;
  }

  public set logo(logoPath: string | undefined){
    console.log(logoPath);
    this.control.get('logo').patchValue(logoPath || PLACEHOLDER_LOGO);
  }
}
