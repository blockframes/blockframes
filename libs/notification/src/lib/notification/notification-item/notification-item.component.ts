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

  public get movieTitleOriginal() {
    return this.notification.movie.title.original;
  }

  public get movieTitleInternational() {
    return this.notification.movie.title.international || this.notification.movie.title.original;
  }

  /** Creates a message based on the notification.type. */
  public get message(): string {

    switch (this.notification.type) {
      case NotificationType.inviteOrganization:
        return `${this.notification.organization.name} has been invited to work on ${this.movieTitleOriginal}'s delivery.`;
      case NotificationType.removeOrganization:
        return `${this.notification.organization.name} has been removed from ${this.movieTitleOriginal}'s delivery.`;
      case NotificationType.newSignature:
        return `${this.notification.organization.name} has signed ${this.movieTitleOriginal}'s delivery.`;
      case NotificationType.finalSignature:
        return `Every stakeholders have signed ${this.movieTitleOriginal}'s delivery.`;
      case NotificationType.createDocument:
        return `A new delivery has been created for ${this.movieTitleOriginal}.`;
      case NotificationType.deleteDocument:
        return `${this.movieTitleOriginal}'s delivery has been deleted.`;
      case NotificationType.pathToDocument:
        return `You accepted the invitation. Now you can work on the document.`;
      case NotificationType.organizationAcceptedByArchipelContent:
        return 'Your organization has been accepted by Archipel Content !';
      case NotificationType.movieTitleUpdated:
        return `${this.notification.user.name} ${this.notification.user.surname} edited ${this.movieTitleInternational}.`;
      case NotificationType.movieTitleCreated:
        return `${this.notification.user.name} ${this.notification.user.surname} created ${this.movieTitleInternational}.`;
      case NotificationType.movieDeleted:
        return `${this.notification.user.name} ${this.notification.user.surname} deleted ${this.movieTitleInternational}.`;
      case NotificationType.invitationFromOrganizationToUserDecline:
        return `${this.notification.user.name} ${this.notification.user.surname} has declined your organization's invitation.`;
      case NotificationType.invitationFromUserToJoinOrgDecline:
        return `Your organization has refused the request from ${this.notification.user.name} ${this.notification.user.surname}.`;
      case NotificationType.memberAddedToOrg:
        return `${this.notification.user.name} ${this.notification.user.surname} has been added to ${this.notification.organization.name}.`;
      case NotificationType.memberRemovedFromOrg:
        return `${this.notification.user.name} ${this.notification.user.surname} has been removed from ${this.notification.organization.name}.`;
    }
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

  public read() {
    this.service.readNotification(this.notification);
  }
}
