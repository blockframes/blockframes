import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { AuthService } from '@blockframes/auth/+state/auth.service';
import { NotificationsForm } from '@blockframes/auth/forms/notifications-form/notifications.form';

@Component({
  selector: 'user-notifications',
  templateUrl: 'notifications.component.html',
  styleUrls: ['notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class NotificationsComponent {

  public form: NotificationsForm;

  constructor(
    private authQuery: AuthQuery,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {
    this.form = new NotificationsForm(this.authQuery.user.notificationsSettings);
  }

  public async update() {
    const notificationsSettings = this.form.value;
    const uid = this.authQuery.userId;
    await this.authService.update({ uid, notificationsSettings });

    this.snackBar.open('Notifications settings updated.', 'close', { duration: 2000 });
  }
}