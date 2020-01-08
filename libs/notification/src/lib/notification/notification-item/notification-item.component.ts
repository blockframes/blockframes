import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService, Notification } from '../+state';
import { NotificationType } from '../+state/notification.firestore';
import { MovieQuery } from '@blockframes/movie/movie/+state/movie.query';
import { ImgRef } from '@blockframes/utils/image-uploader';

/** Specific interface to load informations depending of the notification type. */
interface Information {
  message: string;
  imgRef?: ImgRef;
  defaultImg?: string;
}

@Component({
  selector: 'notification-item',
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class NotificationItemComponent {
  @Input() notification: Notification;

  constructor(private router: Router, private service: NotificationService, private movieQuery: MovieQuery) {}

  public get movieTitleOriginal() {
    return this.notification.movie.title.original;
  }

  public get movieTitleInternational() {
    return this.notification.movie.title.international || this.notification.movie.title.original;
  }

  /** Creates a message based on the notification.type. */
  public get information(): Information {
    switch (this.notification.type) {
      case NotificationType.inviteOrganization:
        return {
          message: `${this.notification.organization.name} has been invited to work on ${this.notification.movie.title.original}'s delivery.`,
          imgRef: this.getPoster(this.notification.movie.id),
          defaultImg: 'WelcomeDelivery_500.png'
        };
      case NotificationType.removeOrganization:
        return  {
          message: `${this.notification.organization.name} has been removed from ${this.notification.movie.title.original}'s delivery.`,
          imgRef: this.getPoster(this.notification.movie.id),
          defaultImg: 'WelcomeDelivery_500.png'
        };
      case NotificationType.newSignature:
        return {
          message: `${this.notification.organization.name} has signed ${this.notification.movie.title.original}'s delivery.`,
          imgRef: this.getPoster(this.notification.movie.id),
          defaultImg: 'WelcomeDelivery_500.png'
        };
      case NotificationType.finalSignature:
        return {
          message: `Every stakeholders have signed ${this.notification.movie.title.original}'s delivery.`,
          imgRef: this.getPoster(this.notification.movie.id),
          defaultImg: 'WelcomeDelivery_500.png'
        };
      case NotificationType.createDocument:
        return {
          message: `A new delivery has been created for ${this.notification.movie.title.original}.`,
          imgRef: this.getPoster(this.notification.movie.id),
          defaultImg: 'WelcomeDelivery_500.png'
        };
      case NotificationType.deleteDocument:
        return {
          message: `${this.notification.movie.title.original}'s delivery has been deleted.`,
          imgRef: this.getPoster(this.notification.movie.id),
          defaultImg: 'WelcomeDelivery_500.png'
        };
      case NotificationType.pathToDocument:
        return {
          message: 'You accepted the invitation. Now you can work on the document.',
          imgRef: this.getPoster(this.notification.movie.id),
          defaultImg: 'WelcomeDelivery_500.png'
        };
      case NotificationType.organizationAcceptedByArchipelContent:
        return {
          message: 'Your organization has been accepted by Archipel Content !',
          defaultImg: 'WelcomeArchipelContent_500.png'
        };
      case NotificationType.movieTitleUpdated:
        return {
          message: `${this.notification.user.name} ${this.notification.user.surname} edited ${this.movieTitleInternational}.`,
          imgRef: this.getPoster(this.notification.movie.id),
          defaultImg: 'WelcomeDelivery_500.png'
        };
      case NotificationType.movieTitleCreated:
        return {
          message: `${this.notification.user.name} ${this.notification.user.surname} created ${this.movieTitleInternational}.`,
          imgRef: this.getPoster(this.notification.movie.id),
          defaultImg: 'WelcomeDelivery_500.png'
        };
      case NotificationType.movieDeleted:
        return {
          message: `${this.notification.user.name} ${this.notification.user.surname} deleted ${this.movieTitleInternational}.`,
          imgRef: this.getPoster(this.notification.movie.id),
          defaultImg: 'WelcomeDelivery_500.png'
        };
      case NotificationType.invitationFromOrganizationToUserDecline:
        return {
          message: `${this.notification.user.name} ${this.notification.user.surname} has declined your organization's invitation.`,
          imgRef: this.notification.user.avatar,
          defaultImg: 'Avatar_40.png'
        };
      case NotificationType.invitationFromUserToJoinOrgDecline:
        return {
          message: `Your organization has refused the request from ${this.notification.user.name} ${this.notification.user.surname}.`,
          imgRef: this.notification.user.avatar,
          defaultImg: 'Avatar_40.png'
        };
      case NotificationType.memberAddedToOrg:
        return {
          message: `${this.notification.user.name} ${this.notification.user.surname} has been added to ${this.notification.organization.name}.`,
          imgRef: this.notification.user.avatar,
          defaultImg: 'Avatar_40.png'
        };
      case NotificationType.memberRemovedFromOrg:
        return {
          message: `${this.notification.user.name} ${this.notification.user.surname} has been removed from ${this.notification.organization.name}.`,
          imgRef: this.notification.user.avatar,
          defaultImg: 'Avatar_40.png'
        };
    }
  }

  public getPoster(id: string): ImgRef {
    const movie = this.movieQuery.getEntity(id)
    return movie.main.poster
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
}
