import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService, Notification } from '../+state';

@Component({
  selector: 'notification-item',
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationItemComponent {
  @Input() notification: Notification;

  private errorMessage = "This url doesn't exist.";

  constructor(private router: Router, private service: NotificationService) {}

  public goToPath() {
    try {
      this.router.navigate([this.notification.path]);
      this.service.readNotification(this.notification.id);
    } catch (error) {
      console.error(error);
      throw new Error(this.errorMessage);
    }
  }

  public goToTeamwork() {
    try {
      this.router.navigate([this.notification.path]);
      this.service.readNotification(this.notification.id);
    } catch (error) {
      console.error(error);
      throw new Error(this.errorMessage);
    }
  }

  public read() {
    this.service.readNotification(this.notification.id);
  }
}
