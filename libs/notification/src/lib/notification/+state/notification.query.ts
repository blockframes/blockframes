import { Injectable } from '@angular/core';
import { QueryEntity, QueryConfig, Order } from '@datorama/akita';
import { Notification } from './notification.model';
import { NotificationStore, NotificationState } from './notification.store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DateGroup } from '@blockframes/utils/helpers';
import { formatDate } from '@angular/common';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { NotificationType } from './notification.firestore';
import { ImgRef, createImgRef } from '@blockframes/utils/image-uploader';
import { toDate } from 'date-fns';

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
@QueryConfig({ sortBy: 'date', sortByOrder: Order.DESC })
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
          const date = toDate(notification.date);
          // As Date cannot be used as an index type (key), we format the date into a string.
          const key = isToday(date) ? 'Today'
            : isYesterday(date) ? 'Yesterday'
            : formatDate(toDate(notification.date), 'MMM dd, yyyy', 'en-US');
          const information = this.createNotificationInformation(notification);
          const notif = {
            ...notification,
            ...information,
            date: toDate(notification.date)
          };
          acc[key] = [...(acc[key] || []), notif];
          return acc;
        }, {});
      })
    );
  }

  /** @deprecated With akitaPreAddEntity it should already be setup */
  public createNotificationInformation(notification: Notification) {

    switch (notification.type) {
      case 'organizationAcceptedByArchipelContent':
        return {
          message: 'Your organization has been accepted by Archipel Content !',
          placeholderUrl: 'WelcomeArchipelContent_500.png' // TODO: ISSUE#2262
        };
      case 'movieTitleUpdated':
        return {
          message: `${notification.user.firstName} ${notification.user.lastName} edited ${notification.movie.title.international}.`,
          imgRef: this.getPoster(notification.movie.id),
          placeholderUrl: 'WelcomeDelivery_500.png' // TODO: Icon/Image is wrong here. Use correct illustration for notifications => ISSUE#2262
        };
      case 'movieTitleCreated':
        return {
          message: `${notification.user.firstName} ${notification.user.lastName} created ${notification.movie.title.international}.`,
          imgRef: this.getPoster(notification.movie.id),
          placeholderUrl: 'WelcomeDelivery_500.png' // TODO: ISSUE#2262
        };
      case 'movieDeleted':
        return {
          message: `${notification.user.firstName} ${notification.user.lastName} deleted ${notification.movie.title.international}.`,
          imgRef: this.getPoster(notification.movie.id),
          placeholderUrl: 'WelcomeDelivery_500.png' // TODO: ISSUE#2262
        };
      case 'invitationFromOrganizationToUserDecline':
        return {
          message: `${notification.user.firstName} ${notification.user.lastName} has declined your organization's invitation.`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.webp'
        };
      case 'invitationFromUserToJoinOrgDecline':
        return {
          message: `Your organization has refused the request from ${notification.user.firstName} ${notification.user.lastName}.`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.webp'
        };
      case 'memberAddedToOrg':
        return {
          message: `${notification.user.firstName} ${notification.user.lastName} has been added to ${notification.organization.denomination.full}.`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.webp',
          url: `c/o/organization/${notification.organization.id}/view/members`
        };
      case 'memberRemovedFromOrg':
        return {
          message: `${notification.user.firstName} ${notification.user.lastName} has been removed from ${notification.organization.denomination.full}.`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.webp'
        };
      case 'newContract':
        return {
          message: `${notification.organization.denomination.full} submitted a contract.`,
          placeholderUrl: 'Organization_250.png', // TODO: ISSUE#2262
          url: `c/o/dashboard/deals/${notification.docId}`
        };
      case 'contractInNegotiation':
        return {
          message: `A new offer has been created.`,
          placeholderUrl: 'WelcomeArchipelContent_500.png', // TODO: ISSUE#2262
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
