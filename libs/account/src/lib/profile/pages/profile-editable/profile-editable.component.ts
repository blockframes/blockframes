
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'account-profile-editable',
  templateUrl: './profile-editable.component.html',
  styleUrls: ['./profile-editable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileEditableComponent {
  public opened = false;
  public editContent = "profile";

  public openSidenav(name: string) {
    this.editContent = name;
    this.opened = true;
  }
}
