import { ChangeDetectionStrategy, Component } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "@blockframes/auth/+state";
import { PreferencesForm } from "@blockframes/auth/forms/preferences/preferences.form";

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
    private snackbar: MatSnackBar
  ) { }

  update() {
    const preferences = this.form.value;
    this.authService.update({ preferences });
    this.snackbar.open('Buying preferences updated.', 'close', { duration: 5000 });
  }
}