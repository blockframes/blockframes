import { Injectable } from '@angular/core';
import { Notification } from './notification.model';
import { NotificationStore, NotificationState } from './notification.store';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { NotificationType } from './notification.firestore';
import { ImgRef } from '@blockframes/utils/image-uploader';
import { MovieQuery } from '@blockframes/movie/movie+state/movie.query';

@Injectable({
  providedIn: 'root'
})
@CollectionConfig({ path: 'notifications' })
export class NotificationService extends CollectionService<NotificationState> {
  constructor(private movieQuery: MovieQuery, store: NotificationStore) {
    super(store);
  }

  public readNotification(notification: Notification) {
    this.update(notification.id, {...notification, isRead: true });
  }

  public createNotificationInformation(notification: Notification) {
    switch (notification.type) {
      case NotificationType.inviteOrganization:
        return {
          message: `${notification.organization.name} has been invited to work on ${notification.movie.title.original}'s delivery.`,
          imgRef: this.getPoster(notification.movie.id),
          placeholderUrl: 'WelcomeDelivery_500.png'
        };
      case NotificationType.removeOrganization:
        return  {
          message: `${notification.organization.name} has been removed from ${notification.movie.title.original}'s delivery.`,
          imgRef: this.getPoster(notification.movie.id),
          placeholderUrl: 'WelcomeDelivery_500.png'
        };
      case NotificationType.newSignature:
        return {
          message: `${notification.organization.name} has signed ${notification.movie.title.original}'s delivery.`,
          imgRef: this.getPoster(notification.movie.id),
          placeholderUrl: 'WelcomeDelivery_500.png'
        };
      case NotificationType.finalSignature:
        return {
          message: `Every stakeholders have signed ${notification.movie.title.original}'s delivery.`,
          imgRef: this.getPoster(notification.movie.id),
          placeholderUrl: 'WelcomeDelivery_500.png'
        };
      case NotificationType.createDocument:
        return {
          message: `A new delivery has been created for ${notification.movie.title.original}.`,
          imgRef: this.getPoster(notification.movie.id),
          placeholderUrl: 'WelcomeDelivery_500.png'
        };
      case NotificationType.deleteDocument:
        return {
          message: `${notification.movie.title.original}'s delivery has been deleted.`,
          imgRef: this.getPoster(notification.movie.id),
          placeholderUrl: 'WelcomeDelivery_500.png'
        };
      case NotificationType.pathToDocument:
        return {
          message: 'You accepted the invitation. Now you can work on the document.',
          imgRef: this.getPoster(notification.movie.id),
          placeholderUrl: 'WelcomeDelivery_500.png'
        };
      case NotificationType.organizationAcceptedByArchipelContent:
        return {
          message: 'Your organization has been accepted by Archipel Content !',
          placeholderUrl: 'WelcomeArchipelContent_500.png'
        };
      case NotificationType.movieTitleUpdated:
        return {
          message: `${notification.user.name} ${notification.user.surname} edited ${notification.movie.title.international}.`,
          imgRef: this.getPoster(notification.movie.id),
          placeholderUrl: 'WelcomeDelivery_500.png'
        };
      case NotificationType.movieTitleCreated:
        return {
          message: `${notification.user.name} ${notification.user.surname} created ${notification.movie.title.international}.`,
          imgRef: this.getPoster(notification.movie.id),
          placeholderUrl: 'WelcomeDelivery_500.png'
        };
      case NotificationType.movieDeleted:
        return {
          message: `${notification.user.name} ${notification.user.surname} deleted ${notification.movie.title.international}.`,
          imgRef: this.getPoster(notification.movie.id),
          placeholderUrl: 'WelcomeDelivery_500.png'
        };
      case NotificationType.invitationFromOrganizationToUserDecline:
        return {
          message: `${notification.user.name} ${notification.user.surname} has declined your organization's invitation.`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'Avatar_40.png'
        };
      case NotificationType.invitationFromUserToJoinOrgDecline:
        return {
          message: `Your organization has refused the request from ${notification.user.name} ${notification.user.surname}.`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'Avatar_40.png'
        };
      case NotificationType.memberAddedToOrg:
        return {
          message: `${notification.user.name} ${notification.user.surname} has been added to ${notification.organization.name}.`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'Avatar_40.png'
        };
      case NotificationType.memberRemovedFromOrg:
        return {
          message: `${notification.user.name} ${notification.user.surname} has been removed from ${notification.organization.name}.`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'Avatar_40.png'
        };
    }
  }

  public getPoster(id: string): ImgRef {
    const movie = this.movieQuery.getEntity(id)
    return movie.main.poster
  }
}
