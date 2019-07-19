import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Component({
  selector: 'account-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileEditComponent {
  constructor(public controlContainer: ControlContainer) {}
}
