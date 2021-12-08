import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthQuery, AuthService } from '@blockframes/auth/+state';
import { PreferencesForm } from '@blockframes/auth/forms/preferences/preferences.form';

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
    private dialogRef: MatDialogRef<PreferencesComponent>
  ) { }

  update() {
    const preferences = this.form.value;
    this.authService.update({ preferences });
    this.close();
  }
  
  close() {
    this.dialogRef.close();
  }
}