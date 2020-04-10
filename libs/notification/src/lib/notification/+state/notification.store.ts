import { EntityState, EntityStore, StoreConfig, ActiveState } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { Notification } from './notification.model';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { ImgRef, createImgRef } from '@blockframes/utils/image-uploader';
import { toDate } from '@blockframes/utils/helpers';

export interface NotificationState extends EntityState<Notification>, ActiveState<string> {}

const initialState = {
  active: null
};

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'notifications' })
export class NotificationStore extends EntityStore<NotificationState, Notification> {
  constructor(private movieQuery: MovieQuery) {
    super(initialState);
  }

  akitaPreAddEntity(notification: Notification): Notification {
    switch (notification.type) {
      case 'organizationAcceptedByArchipelContent':
        return {
          ...notification,
          date: toDate(notification.date),
          message: 'Your organization has been accepted by Archipel Content !',
        };
      case 'movieTitleUpdated':
        return {
          ...notification,
          date: toDate(notification.date),
          message: `${notification.user.firstName} ${notification.user.lastName} edited ${notification.movie.title.international}.`,
          imgRef: this.getPoster(notification.movie.id),
          placeholderUrl: 'WelcomeDelivery_500.png' // TODO: Icon/Image is wrong here. Use correct illustration for notifications => ISSUE#2262
        };
      case 'movieTitleCreated':
        return {
          ...notification,
          date: toDate(notification.date),
          message: `${notification.user.firstName} ${notification.user.lastName} created ${notification.movie.title.international}.`,
          imgRef: this.getPoster(notification.movie.id),
          placeholderUrl: 'WelcomeDelivery_500.png' // TODO: ISSUE#2262
        };
      case 'movieDeleted':
        return {
          ...notification,
          date: toDate(notification.date),
          message: `${notification.user.firstName} ${notification.user.lastName} deleted ${notification.movie.title.international}.`,
          imgRef: this.getPoster(notification.movie.id),
          placeholderUrl: 'WelcomeDelivery_500.png' // TODO: ISSUE#2262
        };
      case 'invitationFromOrganizationToUserDecline':
        return {
          ...notification,
          date: toDate(notification.date),
          message: `${notification.user.firstName} ${notification.user.lastName} has declined your organization's invitation.`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.webp'
        };
      case 'invitationFromUserToJoinOrgDecline':
        return {
          ...notification,
          date: toDate(notification.date),
          message: `Your organization has refused the request from ${notification.user.firstName} ${notification.user.lastName}.`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.webp'
        };
      case 'memberAddedToOrg':
        return {
          ...notification,
          date: toDate(notification.date),
          message: `${notification.user.firstName} ${notification.user.lastName} has been added to ${notification.organization.denomination.full}.`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.webp',
          url: `c/o/organization/${notification.organization.id}/view/members`
        };
      case 'memberRemovedFromOrg':
        return {
          ...notification,
          message: `${notification.user.firstName} ${notification.user.lastName} has been removed from ${notification.organization.denomination.full}.`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.webp'
        };
      case 'newContract':
        return {
          ...notification,
          date: toDate(notification.date),
          message: `${notification.organization.denomination.full} submitted a contract.`,
          placeholderUrl: 'Organization_250.png', // TODO: ISSUE#2262
          url: `c/o/dashboard/deals/${notification.docId}`
        };
      case 'contractInNegotiation':
        return {
          ...notification,
          date: toDate(notification.date),
          message: `A new offer has been created.`,
          placeholderUrl: 'WelcomeArchipelContent_500.png', // TODO: ISSUE#2262
          url: `c/o/dashboard/deals/${notification.docId}`
        };
      case 'movieSubmitted':
        return {
          ...notification,
          date: toDate(notification.date),
          message: `A new movie has been submitted`,
          placeholderUrl: this.getPoster(notification.docId).url,
          url: `c/o/dashboard/titles/${notification.docId}`
        };
      case 'movieAccepted':
        return {
          ...notification,
          date: toDate(notification.date),
          message: `Your movie has been accepted by Archipel Content.`,
          placeholderUrl: this.getPoster(notification.docId).url,
          url: `c/o/dashboard/titles/${notification.docId}`
        };
    }
  }

  public getPoster(id: string): ImgRef {
    const movie = this.movieQuery.getEntity(id);
    return movie?.promotionalElements?.poster?.length[0] || createImgRef();
  }
}
