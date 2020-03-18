import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { Notification } from './notification.model';
import { NotificationStore, NotificationState } from './notification.store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DateGroup } from '@blockframes/utils/helpers';
import { formatDate } from '@angular/common';
import { MovieQuery } from '@blockframes/movie';
import { NotificationType } from './notification.firestore';
import { ImgRef, createImgRef } from '@blockframes/utils';

function getYesterday() {
  const today = new Date();
  const yesterday = today.setDate(today.getDate() - 1);
  return new Date(yesterday);
}

function isSameDay(target: Date, baseDate: Date) {
  return (
    target.getDate() === baseDate.getDate() &&
    target.getMonth() === baseDate.getMonth() &&
    target.getFullYear() === baseDate.getFullYear()
  );
}
const isToday = (target: Date) => isSameDay(target, new Date());
const isYesterday = (target: Date) => isSameDay(target, getYesterday());

@Injectable({ providedIn: 'root' })
export class NotificationQuery extends QueryEntity<NotificationState, Notification> {
  constructor(protected store: NotificationStore, private movieQuery: MovieQuery) {
    super(store);
  }

  /** Group notifications by date in an object. */
  public groupNotificationsByDate(filter?: string | NotificationType[]): Observable<DateGroup<Notification[]>> {
    return this.selectAll({
      filterBy: notification => (filter && typeof filter !== 'string' ? filter.includes(notification.type) : true)
    }).pipe(
      map(notifications => {
        return notifications.reduce((acc, notification) => {
          const date = notification.date.toDate();
          // As Date cannot be used as an index type (key), we format the date into a string.
          const key = isToday(date) ? 'Today'
            : isYesterday(date) ? 'Yesterday'
            : formatDate(notification.date.toDate(), 'MMM dd, yyyy', 'en-US');
          const information = this.createNotificationInformation(notification);
          const notif = {
            ...notification,
            ...information,
            date: notification.date.toDate()
          };
          acc[key] = [...(acc[key] || []), notif];
          return acc;
        }, {});
      })
    );
  }

  public createNotificationInformation(notification: Notification) {

    switch (notification.type) {
      case 'inviteOrganization':
        return {
          message: `${notification.organization.name} has been invited to work on ${notification.movie.title.original}'s delivery.`,
          imgRef: this.getPoster(notification.movie.id),
          placeholderUrl: 'WelcomeDelivery_500.png'
        };
      case 'removeOrganization':
        return {
          message: `${notification.organization.name} has been removed from ${notification.movie.title.original}'s delivery.`,
          imgRef: this.getPoster(notification.movie.id),
          placeholderUrl: 'WelcomeDelivery_500.png'
        };
      case 'newSignature':
        return {
          message: `${notification.organization.name} has signed ${notification.movie.title.original}'s delivery.`,
          imgRef: this.getPoster(notification.movie.id),
          placeholderUrl: 'WelcomeDelivery_500.png'
        };
      case 'finalSignature':
        return {
          message: `Every stakeholders have signed ${notification.movie.title.original}'s delivery.`,
          imgRef: this.getPoster(notification.movie.id),
          placeholderUrl: 'WelcomeDelivery_500.png'
        };
      case 'createDocument':
        return {
          message: `A new delivery has been created for ${notification.movie.title.original}.`,
          imgRef: this.getPoster(notification.movie.id),
          placeholderUrl: 'WelcomeDelivery_500.png'
        };
      case 'deleteDocument':
        return {
          message: `${notification.movie.title.original}'s delivery has been deleted.`,
          imgRef: this.getPoster(notification.movie.id),
          placeholderUrl: 'WelcomeDelivery_500.png'
        };
      case 'pathToDocument':
        return {
          message: 'You accepted the invitation. Now you can work on the document.',
          imgRef: this.getPoster(notification.movie.id),
          placeholderUrl: 'WelcomeDelivery_500.png'
        };
      case 'organizationAcceptedByArchipelContent':
        return {
          message: 'Your organization has been accepted by Archipel Content !',
          placeholderUrl: 'WelcomeArchipelContent_500.png'
        };
      case 'movieTitleUpdated':
        return {
          message: `${notification.user.name} ${notification.user.surname} edited ${notification.movie.title.international}.`,
          imgRef: this.getPoster(notification.movie.id),
          placeholderUrl: 'WelcomeDelivery_500.png'
        };
      case 'movieTitleCreated':
        return {
          message: `${notification.user.name} ${notification.user.surname} created ${notification.movie.title.international}.`,
          imgRef: this.getPoster(notification.movie.id),
          placeholderUrl: 'WelcomeDelivery_500.png'
        };
      case 'movieDeleted':
        return {
          message: `${notification.user.name} ${notification.user.surname} deleted ${notification.movie.title.international}.`,
          imgRef: this.getPoster(notification.movie.id),
          placeholderUrl: 'WelcomeDelivery_500.png'
        };
      case 'invitationFromOrganizationToUserDecline':
        return {
          message: `${notification.user.name} ${notification.user.surname} has declined your organization's invitation.`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.webp'
        };
      case 'invitationFromUserToJoinOrgDecline':
        return {
          message: `Your organization has refused the request from ${notification.user.name} ${notification.user.surname}.`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.webp'
        };
      case 'memberAddedToOrg':
        return {
          message: `${notification.user.name} ${notification.user.surname} has been added to ${notification.organization.name}.`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.webp',
          url: `c/o/organization/${notification.organization.id}/view/members`
        };
      case 'memberRemovedFromOrg':
        return {
          message: `${notification.user.name} ${notification.user.surname} has been removed from ${notification.organization.name}.`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.webp'
        };
      case 'newContract':
        return {
          message: `${notification.organization.name} submitted a contract.`,
          placeholderUrl: 'Organization_250.png',
          url: `c/o/dashboard/deals/${notification.docId}`
        };
      case 'contractInNegotiation':
        return {
          message: `A new offer has been created.`,
          placeholderUrl: 'WelcomeArchipelContent_500.png',
          url: `c/o/dashboard/deals/${notification.docId}`
        };
      case 'movieSubmitted':
        return {
          message: `A new movie has been submitted`,
          placeholderUrl: this.getPoster(notification.docId),
          url: `c/o/dashboard/titles/${notification.docId}`
        };
      case 'movieAccepted':
        return {
          message: `Your movie has been accepted by Archipel Content.`,
          placeholderUrl: this.getPoster(notification.docId),
          url: `c/o/dashboard/titles/${notification.docId}`
        };
    }
  }

  public getPoster(id: string): ImgRef {
    const movie = this.movieQuery.getEntity(id);
    return !!movie && movie.promotionalElements.poster.length ? movie.promotionalElements.poster[0].media : createImgRef();
  }
}
