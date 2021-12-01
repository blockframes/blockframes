import { ChangeDetectionStrategy, Component } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthQuery, AuthService } from "@blockframes/auth/+state";
import { PreferencesForm } from "@blockframes/auth/forms/preferences/preferences.form";

@Component({
  selector: 'auth-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreferencesComponent {
  form = new PreferencesForm(this.authQuery.user.preferences);

  constructor(
    private authQuery: AuthQuery,
    private authService: AuthService,
    private snackbar: MatSnackBar
  ) { }

  update() {
    const preferences = this.form.value;
    const uid = this.authQuery.userId;
    this.authService.update({ uid, preferences });
    this.snackbar.open('Preferences updated !', 'close', { duration: 5000 });
  }
}