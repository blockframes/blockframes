import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@blockframes/auth/+state';
import { PreferencesForm } from '@blockframes/auth/forms/preferences/preferences.form';

@Component({
  selector: 'auth-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreferencesComponent {
  form = new PreferencesForm(this.authService.profile.preferences);

  constructor(
    private authService: AuthService,
    private dialogRef: MatDialogRef<PreferencesComponent>,
    private snackbar: MatSnackBar
  ) { }

  update() {
    const preferences = this.form.value;
    this.authService.update({ preferences });
    this.snackbar.open('Buying preferences saved.', 'close', { duration: 5000 });
    this.close();
  }
  
  close() {
    this.dialogRef.close();
  }
}