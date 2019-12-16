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

  constructor(private router: Router, private service: NotificationService) {}

  /** Creates a message based on the notification.type. */
  public get message(): string {

    const movieName = this.notification.movie.title.original;

    switch (this.notification.type) {
      case NotificationType.inviteOrganization:
        return `${this.notification.organization.denomination.publicName} has been invited to work on ${movieName}'s delivery.`;
      case NotificationType.removeOrganization:
        return `${this.notification.organization.denomination.publicName} has been removed from ${movieName}'s delivery.`;
      case NotificationType.newSignature:
        return `${this.notification.organization.denomination.publicName} has signed ${movieName}'s delivery.`;
      case NotificationType.finalSignature:
        return `Every stakeholders have signed ${movieName}'s delivery.`;
      case NotificationType.createDocument:
        return `A new delivery has been created for ${movieName}.`;
      case NotificationType.deleteDocument:
        return `${movieName}'s delivery has been deleted.`;
      case NotificationType.pathToDocument:
        return `You accepted the invitation. Now you can work on the document.`;
    }
  }

  public goToPath() {
    try {
      const path =
        this.notification.type === NotificationType.pathToDocument
          ? `layout/o/delivery/${this.notification.movie.id}/${this.notification.docId}/list`
          : `layout/o/delivery/${this.notification.movie.id}/${this.notification.docId}/stakeholders`;
      this.router.navigateByUrl(path);
      this.service.readNotification(this.notification);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  public read() {
    this.service.readNotification(this.notification);
  }
}
