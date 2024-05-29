import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { PreferencesForm } from '@blockframes/auth/forms/preferences/preferences.form';
import { User } from '@blockframes/model';
import { UserService } from '@blockframes/user/service';

@Component({
  selector: 'buying-preferences-modal',
  templateUrl: './buying-preferences-modal.component.html',
  styleUrls: ['./buying-preferences-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuyingPreferencesModalComponent {
  form = new PreferencesForm(this.data.user.preferences);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { user: User },
    private userService: UserService,
    private dialogRef: MatDialogRef<BuyingPreferencesModalComponent>,
    private snackbar: MatSnackBar
  ) { }

  async update() {
    const preferences = this.form.value;
    await this.userService.update(this.data.user.uid, { preferences });
    this.snackbar.open('Buying preferences saved.', 'close', { duration: 5000 });
    this.close();
  }

  close() {
    this.dialogRef.close();
  }
}
