import { EntityState, EntityStore, StoreConfig, ActiveState } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { Notification } from './notification.model';
import { HostedMedia, createHostedMedia } from '@blockframes/media/+state/media.firestore';
import { toDate } from '@blockframes/utils/helpers';
import { MovieQuery } from '@blockframes/movie/+state';
import { Event } from '@blockframes/event/+state';
import { AngularFirestore } from '@angular/fire/firestore';
import { orgName } from '@blockframes/organization/+state';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { getCurrentModule } from '@blockframes/utils/apps';

export interface NotificationState extends EntityState<Notification>, ActiveState<string> { }

const initialState = {
  active: null
};

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'notifications' })
export class NotificationStore extends EntityStore<NotificationState, Notification> {
  constructor(
    private movieQuery: MovieQuery,
    private firestore: AngularFirestore,
    private routerQuery: RouterQuery
  ) {
    super(initialState);
  }

  public formatNotification(notification: Notification): Partial<Notification> {
    const displayName = notification.user ? `${notification.user.firstName} ${notification.user.lastName}` : 'Someone';
    const module = getCurrentModule(this.routerQuery.getValue().state.url);
    switch (notification.type) {
      case 'organizationAcceptedByArchipelContent':
        return {
          date: toDate(notification.date),
          message: 'Your organization was accepted by the Archipel team.',
          imgRef: notification.organization?.logo,
          placeholderUrl: 'empty_organization.webp',
          url: `/c/o/organization/${notification.organization.id}/view/org`,
        };
      case 'invitationFromUserToJoinOrgDecline':
        return {
          date: toDate(notification.date),
          message: `${displayName}'s request to join your organization was refused.`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.webp',
          url: `/c/o/organization/${notification.organization.id}/view/members`,
        };
      case 'memberAddedToOrg':
        return {
          date: toDate(notification.date),
          message: `${displayName} is now part of your organization.`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.webp',
          url: `/c/o/organization/${notification.organization.id}/view/members`,
        };
      case 'memberRemovedFromOrg':
        return {
          date: toDate(notification.date),
          message: `${displayName} has been removed from your organization.`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.webp',
          url: `/c/o/organization/${notification.organization.id}/view/members`,
        };
      case 'newContract':
        const organizationName = orgName(notification.organization) || 'Organization with no name';
        return {
          date: toDate(notification.date),
          message: `${organizationName} submitted a contract.`,
          placeholderUrl: 'Organization_250.webp', // TODO: ISSUE#2262
          url: `/c/o/dashboard/deals/${notification.docId}`, // TODO check url : see  #2716
        };
      case 'contractInNegotiation':
        return {
          date: toDate(notification.date),
          message: `A new offer has been created.`,
          placeholderUrl: 'WelcomeArchipelContent_500.webp', // TODO: ISSUE#2262
          url: `/c/o/dashboard/deals/${notification.docId}`, // TODO check url : see  #2716
        };
      case 'movieSubmitted':
        return {
          date: toDate(notification.date),
          message: `A new movie has been submitted`,
          imgRef: this.getPoster(notification.docId),
          placeholderUrl: 'empty_poster.webp',
          url: `/c/o/dashboard/title/${notification.docId}`, // TODO check url : see  #2716
        };
      case 'movieAccepted':
        return {
          date: toDate(notification.date),
          message: `Your project was successfully published on the marketplace.`,
          imgRef: this.getPoster(notification.docId),
          placeholderUrl: 'empty_poster.webp',
          url: `/c/o/dashboard/title/${notification.docId}/details`,
        };
      case 'eventIsAboutToStart':

        // we perform async fetch to display more meaningful info to the user later (because we cannot do await in akitaPreAddEntity)
        this.getDocument<Event>(`events/${notification.docId}`).then(event => {
          this.update(notification.id, newNotification => {
            return {
              ...newNotification,
              message: `REMINDER - Your ${event.type} "${event.title}" is about to start.`
            };
          });
        });

        return {
          date: toDate(notification.date),
          message: `REMINDER - Your event "${notification.docId}" is about to start.`,
          url: `/c/o/marketplace/event/${notification.docId}`, // TODO check url : see  #2716
        };
      case 'invitationToAttendEventAccepted':

        // we perform async fetch to display more meaningful info to the user later (because we cannot do await in akitaPreAddEntity)
        this.getDocument<Event>(`events/${notification.docId}`).then(event => {
          this.update(notification.id, newNotification => {
            return {
              ...newNotification,
              message: `${this.notificationSubject(notification)} has accepted your invitation to ${event.type} "${event.title}".`
            };
          });
        });

        return {
          date: toDate(notification.date),
          message: `${this.notificationSubject(notification)} has accepted your invitation to event "${notification.docId}".`,
          imgRef: notification.user?.avatar || notification.organization?.logo,
          placeholderUrl: 'profil_user.webp',
          url: `/c/o/${module}/event/${notification.docId}`
        };
      case 'invitationToAttendEventDeclined':

        // we perform async fetch to display more meaningful info to the user later (because we cannot do await in akitaPreAddEntity)
        this.getDocument<Event>(`events/${notification.docId}`).then(event => {
          this.update(notification.id, newNotification => {
            return {
              ...newNotification,
              message: `${this.notificationSubject(notification)} has declined your invitation to ${event.type} "${event.title}".`
            };
          });
        });

        return {
          date: toDate(notification.date),
          message: `${this.notificationSubject(notification)} has declined your invitation to event "${notification.docId}".`,
          imgRef: notification.user?.avatar || notification.organization?.logo,
          placeholderUrl: 'profil_user.webp',
          url: `/c/o/${module}/event/${notification.docId}`
        };
      case 'requestToAttendEventSent':

        // we perform async fetch to display more meaningful info to the user later (because we cannot do await in akitaPreAddEntity)
        this.getDocument<Event>(`events/${notification.docId}`).then(event => {
          this.update(notification.id, newNotification => {
            return {
              ...newNotification,
              message: `Your request to attend event "${event.title}" has been sent.`
            };
          });
        });

        return {
          date: toDate(notification.date),
          message: `Your request to attend event "${notification.docId}" has been sent.`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.webp',
          url: `/c/o/${module}/event/${notification.docId}`
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

  public getPoster(id: string): HostedMedia {
    const movie = this.movieQuery.getEntity(id);
    return movie?.poster?.media || createHostedMedia();
  }

  private getDocument<T>(path: string): Promise<T> {
    return this.firestore
      .doc(path)
      .get().toPromise()
      .then(doc => doc.data() as T);
  }
}
