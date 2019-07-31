import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Component({
  selector: '[formGroup] member-form-role',
  templateUrl: './member-form-role.component.html',
  styleUrls: ['./member-form-role.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberFormRoleComponent {
  constructor(public controlContainer: ControlContainer) {}

  public get control() {
    return this.controlContainer.control;
  }
}
