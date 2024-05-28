import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@blockframes/auth/service';
import { PreferencesForm } from '@blockframes/auth/forms/preferences/preferences.form';
import { Preferences } from '@blockframes/model';

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
    if(!this.formValid(preferences)) {
      this.snackbar.open('Please choose at least one of your buying preferences.', 'close', { duration: 5000 });
      return ;
    }
    this.authService.update({ preferences });
    this.snackbar.open('Buying preferences saved.', 'close', { duration: 5000 });
    this.close('saved');
  }

  close(action?: 'dismiss' | 'saved') {
    this.dialogRef.close(action);
  }

  private formValid(preferences: Preferences) {
    if(preferences.medias.length) return true;
    if(preferences.territories.length) return true;
    if(preferences.languages.length) return true;
    if(preferences.genres.length) return true;
    return false;
  }
}