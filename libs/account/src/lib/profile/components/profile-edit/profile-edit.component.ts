import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Component({
  selector: 'account-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileEditComponent {

  constructor(
    public controlContainer: ControlContainer
  ) {}

  // public updateProfile() {
  //   if (!this.accountForm.valid) {
  //     this.snackBar.open('form invalid', 'close', { duration: 1000 });
  //     return;
  //   }
  //   try {
  //     this.authService.update(this.authQuery.user.uid, this.accountForm.value);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }
}
