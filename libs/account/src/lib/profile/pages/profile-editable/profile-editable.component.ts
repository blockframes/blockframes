
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'account-profile-editable',
  templateUrl: './profile-editable.component.html',
  styleUrls: ['./profile-editable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileEditableComponent {
  public opened = false;
  public isProfileEdit = true;

  public openPasswordEdit() {
    this.isProfileEdit = false;
    this.opened = true;
  }

  public openProfileEdit() {
    this.isProfileEdit = true;
    this.opened = true;
  }
}
