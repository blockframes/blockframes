import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService, Notification } from '../+state';
import { NotificationType } from '../+state/notification.firestore';

@Component({
  selector: 'notification-item',
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class NotificationItemComponent {
  @Input() notification: Notification;
  @Input() theme: string;

  constructor(private router: Router, private service: NotificationService) {}

  public get information() {
    return this.service.createNotificationInformation(this.notification);
  }

  public goToPath() {
    try {
      const path =
        this.notification.type === NotificationType.pathToDocument
          ? `c/o/delivery/${this.notification.movie.id}/${this.notification.docId}/list`
          : `c/o/delivery/${this.notification.movie.id}/${this.notification.docId}/stakeholders`;
      this.router.navigateByUrl(path);
      this.service.readNotification(this.notification);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public getPlaceholderUrl(fileName: string) {
    return `assets/images/${this.theme}/${fileName}`
  }
}
