import { EntityState, EntityStore, StoreConfig, ActiveState } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { Notification } from './notification.model';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { ImgRef, createImgRef } from '@blockframes/utils/media/media.firestore';
import { toDate } from '@blockframes/utils/helpers';
import { AngularFirestore } from '@angular/fire/firestore';
import { Event } from '@blockframes/event/+state';

export interface NotificationState extends EntityState<Notification>, ActiveState<string> { }

const initialState = {
  active: null
};

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'notifications' })
export class NotificationStore extends EntityStore<NotificationState, Notification> {
  constructor(private movieQuery: MovieQuery, private firestore: AngularFirestore) {
    super(initialState);
  }

  /**
   * @dev On loading notification in store, we add additional data for display
   * @param notification
   */
  akitaPreAddEntity(notification: Notification): Notification {
    return {
      ...notification,
      ...this.formatNotification(notification),
    }
  }

  public formatNotification(notification: Notification) {
    const displayName = notification.user ? `${notification.user.firstName} ${notification.user.lastName}` : 'Someone';
    const orgName = notification.organization?.denomination.full;
    const movieTitle = notification.movie?.title.international;
    switch (notification.type) {
      case 'organizationAcceptedByArchipelContent':
        return {
          date: toDate(notification.date),
          message: 'Your organization has been accepted !',
          imgRef: notification.organization?.logo,
          placeholderUrl: 'WelcomeArchipelContent_500.png' // TODO: ISSUE#2262
        };
      case 'movieTitleUpdated':
        return {
          date: toDate(notification.date),
          message: `${displayName} edited ${movieTitle}.`,
          imgRef: this.getPoster(notification.movie.id),
          placeholderUrl: 'WelcomeDelivery_500.png' // TODO: Icon/Image is wrong here. Use correct illustration for notifications => ISSUE#2262
        };
      case 'movieTitleCreated':
        return {
          date: toDate(notification.date),
          message: `${displayName} created ${movieTitle ? movieTitle : 'a new title'}.`,
          imgRef: notification.user?.avatar,
          placeholderUrl: 'WelcomeDelivery_500.png' // TODO: ISSUE#2262
        };
      case 'movieDeleted':
        return {
          date: toDate(notification.date),
          message: `${displayName} deleted ${movieTitle}.`,
          imgRef: this.getPoster(notification.movie.id),
          placeholderUrl: 'WelcomeDelivery_500.png' // TODO: ISSUE#2262
        };
      case 'invitationFromOrganizationToUserDecline':
        return {
          date: toDate(notification.date),
          message: `${displayName} has declined your organization's invitation.`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.webp'
        };
      case 'invitationFromUserToJoinOrgDecline':
        return {
          date: toDate(notification.date),
          message: `Your organization has refused the request from ${displayName}.`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.webp'
        };
      case 'memberAddedToOrg':
        return {
          date: toDate(notification.date),
          message: `${displayName} has been added to ${orgName}.`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.webp',
          url: `c/o/organization/${notification.organization.id}/view/members`
        };
      case 'memberRemovedFromOrg':
        return {
          date: toDate(notification.date),
          message: `${displayName} has been removed from ${orgName}.`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.webp'
        };
      case 'newContract':
        return {
          date: toDate(notification.date),
          message: `${orgName} submitted a contract.`,
          placeholderUrl: 'Organization_250.png', // TODO: ISSUE#2262
          url: `c/o/dashboard/deals/${notification.docId}`
        };
      case 'contractInNegotiation':
        return {
          date: toDate(notification.date),
          message: `A new offer has been created.`,
          placeholderUrl: 'WelcomeArchipelContent_500.png', // TODO: ISSUE#2262
          url: `c/o/dashboard/deals/${notification.docId}`
        };
      case 'movieSubmitted':
        return {
          date: toDate(notification.date),
          message: `A new movie has been submitted`,
          placeholderUrl: this.getPoster(notification.docId).urls.xs,
          url: `c/o/dashboard/titles/${notification.docId}`
        };
      case 'movieAccepted':
        return {
          date: toDate(notification.date),
          message: `Your movie has been accepted by Archipel Content.`,
          placeholderUrl: this.getPoster(notification.docId).urls.xs,
          url: `c/o/dashboard/titles/${notification.docId}`
        };
      case 'eventIsAboutToStart':

        // we perform async fetch to display more meaningful info to the user later (because we cannot do await in akitaPreAddEntity)
        this.getDocument<Event>(`events/${notification.docId}`).then(event => {
          this.update(notification.id, newNotification => {
            return {
              ...newNotification,
              message: `Your ${event.type} "${event.title}" is about to start !`
            };
          });
        });

        return {
          message: `Your event "${notification.docId}" is about to start !`,
          url: `c/o/marketplace/event/${notification.docId}`
        };
      case 'invitationToAttendEventAccepted':

      // we perform async fetch to display more meaningful info to the user later (because we cannot do await in akitaPreAddEntity)
        this.getDocument<Event>(`events/${notification.docId}`).then(event => {
          this.update(notification.id, newNotification => {
            return {
              ...newNotification,
              message: `${this.notificationSubject(notification)} have accepted your invitation to ${event.type} "${event.title}".`
            };
          });
        });

        return {
          date: toDate(notification.date),
          message: `${this.notificationSubject(notification)} have accepted your invitation to event "${notification.docId}".`,
          url: `c/o/marketplace/event/${notification.docId}`
        };
      case 'invitationToAttendEventDeclined':

        // we perform async fetch to display more meaningful info to the user later (because we cannot do await in akitaPreAddEntity)
        this.getDocument<Event>(`events/${notification.docId}`).then(event => {
          this.update(notification.id, newNotification => {
            return {
              ...newNotification,
              message: `${this.notificationSubject(notification)} have declined your invitation to ${event.type} "${event.title}".`
            };
          });
        });

        return {
          date: toDate(notification.date),
          message: `${this.notificationSubject(notification)} have declined your invitation to event "${notification.docId}".`,
          url: `c/o/marketplace/event/${notification.docId}`
        };
      default:
        return {
          message: 'Error while displaying notification.'
        };
    }
  }

  private notificationSubject(notification: Notification): string {
    let subject = 'Unknown subject';
    if (notification.organization) {
      subject = notification.organization.denomination.public ? notification.organization.denomination.public : notification.organization.denomination.full;
    } else if (notification.user && notification.user.lastName && notification.user.firstName) {
      subject = `${notification.user.lastName} ${notification.user.firstName}`;
    } else if (notification.user && notification.user.email) {
      subject = notification.user.email;
    }
    return subject;
  }

  public getPoster(id: string): ImgRef {
    const movie = this.movieQuery.getEntity(id);
    return movie?.promotionalElements?.poster?.length[0] || createImgRef();
  }

  private getDocument<T>(path: string): Promise<T> {
    return this.firestore
      .doc(path)
      .get().toPromise()
      .then(doc => doc.data() as T);
  }
}
