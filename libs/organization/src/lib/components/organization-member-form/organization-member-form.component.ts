import { Component, Output, EventEmitter, Input, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Component({
  selector: '[formGroup] roleControl, organization-member-form',
  templateUrl: './organization-member-form.component.html',
  styleUrls: ['./organization-member-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationMemberFormComponent {
  constructor(public controlContainer: ControlContainer) {}

  public get control() {
    return this.controlContainer.control;
  }
}
