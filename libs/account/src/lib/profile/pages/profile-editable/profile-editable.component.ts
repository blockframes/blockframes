
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { AuthQuery, AuthService } from '@blockframes/auth';
import { ProfileForm } from '../../forms/profile-edit.form';
import { startWith } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup } from '@angular/forms';
import { PasswordControl } from '@blockframes/utils';

@Component({
  selector: 'account-profile-editable',
  templateUrl: './profile-editable.component.html',
  styleUrls: ['./profile-editable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileEditableComponent implements OnInit {
  public opened = false;
  public editContent = "profile";
  public profileForm: ProfileForm;
  public editPasswordForm = new FormGroup({
    current: new PasswordControl(),
    next: new PasswordControl()
  });

  constructor(
    private authQuery: AuthQuery,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const user = this.authQuery.user;
    this.profileForm = new ProfileForm(user);
  }

  public update() {
    switch (this.editContent) {
      case 'profile':
        this.updateProfile();
        break;
      case 'password':
        this.updatePassword();
        break;
    }
  }

  public updateProfile() {
    if (!this.profileForm.valid) {
      this.snackBar.open('form invalid', 'close', { duration: 1000 });
      return;
    }
    try {
      this.authService.update(this.authQuery.user.uid, this.profileForm.value);
      this.snackBar.open('Profile change succesfull', 'close', { duration: 2000 });
    } catch (err) {
      console.error(err);
    }
  }

  public updatePassword() {
    if (this.editPasswordForm.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: 2000 });
      return;
    }
    try {
      this.authService.updatePassword(this.editPasswordForm.value.current, this.editPasswordForm.value.next);
      this.snackBar.open('Password change succesfull', 'close', { duration: 2000 });
    } catch (err) {
      this.snackBar.open(err.message, 'close', { duration: 5000 });
    }
  }

  public openSidenav(name: string) {
    this.editContent = name;
    this.opened = true;
  }

  public get user$() {
    return this.profileForm.valueChanges.pipe(startWith(this.profileForm.value));
  }
}
