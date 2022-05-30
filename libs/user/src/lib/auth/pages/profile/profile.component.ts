import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

// Material
import { MatSnackBar } from '@angular/material/snack-bar';

// Blockframes
import { AuthService } from '@blockframes/auth/service';
import { ProfileForm } from '@blockframes/auth/forms/profile-edit.form';
import { FileUploaderService } from '@blockframes/media/file-uploader.service';
import { EditPasswordForm } from '@blockframes/utils/form/controls/password.control';
import { SnackbarErrorComponent } from '@blockframes/ui/snackbar/error/snackbar-error.component';

@Component({
  selector: 'user-profile-edit',
  templateUrl: 'profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ProfileComponent implements OnInit {
  public profileForm: ProfileForm;
  public passwordForm = new EditPasswordForm();

  constructor(
    private authService: AuthService,
    private uploaderService: FileUploaderService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.profileForm = new ProfileForm(this.authService.profile);
  }

  public async update() {
    try {
      // update profile
      if (this.profileForm.dirty) {
        if (this.profileForm.invalid) {
          throw new Error('auth/invalid-form');
        } else {
          const uid = this.authService.uid;

          this.uploaderService.upload();
          await this.authService.update({ uid, ...this.profileForm.value });

          this.snackBar.open('Profile updated.', 'close', { duration: 2000 });
          this.profileForm.markAsPristine();
        }
      }

      // update password
      if (this.passwordForm.dirty) {
        if (this.passwordForm.invalid) throw new Error('auth/invalid-password');
        const { current, next } = this.passwordForm.value;
        await this.authService.updatePassword(current, next);
        this.snackBar.open('Password changed.', 'close', { duration: 2000 });
        this.passwordForm.reset();
        this.passwordForm.markAsPristine();
      }
    } catch (err) {
      if (err.message === 'auth/invalid-form') {
        this.snackBar.open('Your profile information are not valid.', 'close', { duration: 2000 });
      } else if (err.message === 'auth/invalid-password') {
        this.snackBar.open('Your information to change your password are not valid.', 'close', { duration: 2000 });
      } else if (err.message.includes('auth/wrong-password')) {
        this.snackBar.open('Your current password is not valid.', 'close', { duration: 2000 });
      } else if (err.message.includes('auth/too-many-requests')) {
        this.snackBar.open('You have repeatedly failed to change your password. Please, try again in 5 minutes.', 'close', { duration: 5000 });
      } else {
        this.snackBar.openFromComponent(SnackbarErrorComponent, { duration: 5000 });
      }
    }
  }
}
