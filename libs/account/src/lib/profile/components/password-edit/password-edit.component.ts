
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Component({
  selector: 'account-password-edit',
  templateUrl: './password-edit.component.html',
  styleUrls: ['./password-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PasswordEditComponent {
  constructor(public controlContainer: ControlContainer) {}
}
