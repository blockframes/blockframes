import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

// Material
import { MatSnackBar } from '@angular/material/snack-bar';

// Blockframes
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { AuthService } from '@blockframes/auth/+state/auth.service';
import { ProfileForm } from '@blockframes/auth/forms/profile-edit.form';
import { FileUploaderService } from '@blockframes/media/+state';
import { EditPasswordForm } from '@blockframes/utils/form/controls/password.control';

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
    private authQuery: AuthQuery,
    private authService: AuthService,
    private uploaderService: FileUploaderService,
    private snackBar: MatSnackBar,
    ) { }

  ngOnInit() {
    this.profileForm = new ProfileForm(this.authQuery.user);
  }

  public async update() {
    try {
      // update profile
      if (this.profileForm.invalid) {
        throw new Error('Your profile information are not valid.')
      } else {
        const uid = this.authQuery.userId;

        this.uploaderService.upload();
        await this.authService.update({ uid, ...this.profileForm.value });

        this.snackBar.open('Profile updated.', 'close', { duration: 2000 });
      }
      // update password
      if (this.passwordForm.dirty) {
        if (this.passwordForm.invalid) throw new Error('Your information to change your password are not valid.');
        const { current, next } = this.passwordForm.value;
        await this.authService.updatePassword(current, next);
        this.snackBar.open('Password changed.', 'close', { duration: 2000 });
      }
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }
}
