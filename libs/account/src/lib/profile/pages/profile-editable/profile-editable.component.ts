
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'account-profile-editable',
  templateUrl: './profile-editable.component.html',
  styleUrls: ['./profile-editable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileEditableComponent {
  public opened = false;
  public sidenavContent = "profile";

  public openPasswordEdit() {
    this.sidenavContent = "password";
    this.opened = true;
  }

  public openProfileEdit() {
    this.sidenavContent = "profile";
    this.opened = true;
  }
}
