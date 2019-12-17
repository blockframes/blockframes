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

  public get movieName() {
    return this.notification.movie.title.original;
  }

  /** Creates a message based on the notification.type. */
  public get message(): string {

    switch (this.notification.type) {
      case NotificationType.inviteOrganization:
        return `${this.notification.organization.name} has been invited to work on ${this.movieName}'s delivery.`;
      case NotificationType.removeOrganization:
        return `${this.notification.organization.name} has been removed from ${this.movieName}'s delivery.`;
      case NotificationType.newSignature:
        return `${this.notification.organization.name} has signed ${this.movieName}'s delivery.`;
      case NotificationType.finalSignature:
        return `Every stakeholders have signed ${this.movieName}'s delivery.`;
      case NotificationType.createDocument:
        return `A new delivery has been created for ${this.movieName}.`;
      case NotificationType.deleteDocument:
        return `${this.movieName}'s delivery has been deleted.`;
      case NotificationType.pathToDocument:
        return `You accepted the invitation. Now you can work on the document.`;
      case NotificationType.organizationAccepted:
        return 'Your organization has been accepted by Archipel Content !';
      case NotificationType.movieTitleUpdated:
        return `${this.notification.user.name} ${this.notification.user.surname} edited ${this.notification.movie.title.international}.`;
      case NotificationType.movieTitleCreated:
        return `${this.notification.user.name} ${this.notification.user.surname} created ${this.notification.movie.title.international}.`;
      case NotificationType.movieDeleted:
        return `${this.notification.user.name} ${this.notification.user.surname} deleted ${this.notification.movie.title.international}.`
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
