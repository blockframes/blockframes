import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../+state';

@Component({
  selector: 'blockframes-notification-item',
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationItemComponent {
  @Input() notification: any;

  private errorMessage = "This url doesn't exist."

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
      this.service.joinTeamwork(this.notification.stakeholderId, this.notification.docId, this.notification.app);
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
