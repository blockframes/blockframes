import { EntityState, EntityStore, StoreConfig, ActiveState } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { Notification } from './notification.model';
import { toDate } from '@blockframes/utils/helpers';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { Event, isMeeting, isScreening } from '@blockframes/event/+state/event.model';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { Organization, OrganizationService, orgName, PublicOrganization } from '@blockframes/organization/+state';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { appName, applicationUrl, getCurrentApp, getCurrentModule, getMovieAppAccess } from '@blockframes/utils/apps';
import { PublicUser } from '@blockframes/user/types';
import { displayName } from '@blockframes/utils/utils';
import { AuthService } from '@blockframes/auth/+state';
import { createStorageFile } from '@blockframes/media/+state/media.firestore';
import { format } from "date-fns";
import { EventMeta } from '@blockframes/event/+state/event.firestore';

export interface NotificationState extends EntityState<Notification>, ActiveState<string> { }

const initialState = {
  active: null
};

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'notifications' })
export class NotificationStore extends EntityStore<NotificationState, Notification> {

  private appName;
  private app = getCurrentApp(this.routerQuery);

  constructor(
    private auth: AuthService,
    private movieQuery: MovieQuery,
    private firestore: AngularFirestore,
    private routerQuery: RouterQuery,
    private orgService: OrganizationService
  ) {
    super(initialState);
    this.appName = appName[this.app];
    this.auth.signedOut.subscribe(() => this.remove());
  }

  public formatNotification(notification: Notification): Partial<Notification> {
    const displayUserName = notification.user ? displayName(notification.user) : 'Someone';
    const module = getCurrentModule(this.routerQuery.getValue().state.url);
    switch (notification.type) {
      case 'organizationAcceptedByArchipelContent':
        return {
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `Your organization was accepted by the ${this.appName} team.`,
          imgRef: notification.organization?.logo,
          placeholderUrl: 'empty_organization.svg',
          url: `${applicationUrl[this.app]}/c/o/organization/${notification.organization.id}/view/org`,
        };
      case 'requestFromUserToJoinOrgDeclined':
        return {
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `${displayUserName}'s request to join your organization was refused.`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.svg',
          url: `${applicationUrl[this.app]}/c/o/organization/${notification.organization.id}/view/members`,
        };
      case 'invitationToJoinOrgDeclined':
        return {
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `Your invitation to ${displayUserName} to join your organization was refused.`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.svg',
          url: `${applicationUrl[this.app]}/c/o/organization/${notification.organization.id}/view/members`,
        };
      case 'orgMemberUpdated':
        this.getDocument<Organization>(`orgs/${notification.organization.id}`).then(org => {
          const message = org.userIds.includes(notification.user.uid) ?
            `${displayUserName} is now part of your organization.` :
            `${displayUserName} has been removed from your organization.`;
          this.update(notification.id, newNotification => {
            return {
              ...newNotification,
              imgRef: notification.user.avatar,
              message,
            };
          })
        })
        return {
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `Members of your organization have been updated`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.svg',
          url: `${applicationUrl[this.app]}/c/o/organization/${notification.organization.id}/view/members`,
        };
      case 'movieSubmitted':
        this.getDocument<Movie>(`movies/${notification.docId}`).then(movie => {
          const movieAppAccess = getMovieAppAccess(movie);
          this.update(notification.id, newNotification => {
            return {
              ...newNotification,
              imgRef: createStorageFile(movie?.poster),
              message: `${movie.title.international} was successfully submitted to the ${appName[movieAppAccess[0]]} Team.`,
              url: `${applicationUrl[movieAppAccess[0]]}/c/o/dashboard/title/${notification.docId}/main`,
            };
          })
        })
        return {
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `A new movie was successfully submitted`,
          imgRef: this.getPoster(notification.docId),
          placeholderUrl: 'empty_poster.svg',
          url: `${applicationUrl[this.app]}/c/o/dashboard/title/${notification.docId}`,
        };
      case 'movieAccepted':
        this.getDocument<Movie>(`movies/${notification.docId}`).then(movie => {
          const movieAppAccess = getMovieAppAccess(movie);
          this.update(notification.id, newNotification => {
            return {
              ...newNotification,
              imgRef: createStorageFile(movie?.poster),
              message: `${movie.title.international} was successfully published on the marketplace.`,
              url: `${applicationUrl[movieAppAccess[0]]}/c/o/dashboard/title/${notification.docId}/main`,
            };
          })
        })
        return {
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `Your project was successfully published on the marketplace.`,
          imgRef: this.getPoster(notification.docId),
          placeholderUrl: 'empty_poster.svg',
          url: `/c/o/dashboard/title/${notification.docId}/main`,
        };
      case 'orgAppAccessChanged': {
        const msg = notification.appAccess
          ? `Your organization has now access to ${appName[notification.appAccess]}`
          : 'Your organization\'s app access have changed.';
        return {
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: msg,
          placeholderUrl: `empty_organization.svg`,
          imgRef: notification.organization?.logo,
          url: `${applicationUrl[notification.appAccess]}`
        }
      }
      case 'eventIsAboutToStart':

        // we perform async fetch to display more meaningful info to the user later (because we cannot do await in akitaPreAddEntity)
        this.getDocument<Event>(`events/${notification.docId}`).then((event: Event<EventMeta>) => {
          this.getDocument<PublicOrganization>(`orgs/${event.ownerOrgId}`).then(org => {
            this.update(notification.id, newNotification => {
              const titleId = isScreening(event) ? event.meta.titleId : undefined;
              return {
                ...newNotification,
                imgRef: this.getPoster(titleId),
                message: `REMINDER - ${org.denomination.full}'s ${event.type} "${event.title}" is about to start.`
              };
            });
          })
        });

        return {
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `REMINDER - Your event "${notification.docId}" is about to start.`,
          placeholderUrl: 'empty_poster.svg',
          url: `${applicationUrl['festival']}/event/${notification.docId}/r/i`,
        };
      case 'oneDayReminder':

        // we perform async fetch to display more meaningful info to the user later (because we cannot do await in akitaPreAddEntity)
        this.getDocument<Event>(`events/${notification.docId}`).then((event: Event<EventMeta>) => {
          this.getDocument<PublicOrganization>(`orgs/${event.ownerOrgId}`).then(org => {
            this.update(notification.id, newNotification => {
              const titleId = isScreening(event) ? event.meta.titleId : undefined;
              return {
                ...newNotification,
                imgRef: this.getPoster(titleId),
                message: `REMINDER - ${org.denomination.full}'s ${event.type} "${event.title}" will start tomorrow at ${format(toDate(event.start), 'h:mm a')}.`
              };
            });
          })
        });

        return {
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `REMINDER - Your event "${notification.docId}" is tomorrow.`,
          placeholderUrl: 'empty_poster.svg',
          url: `${applicationUrl['festival']}/event/${notification.docId}/r/i`,
        };
      case 'invitationToAttendEventUpdated':
      case 'requestToAttendEventUpdated':

        // we perform async fetch to display more meaningful info to the user later (because we cannot do await in akitaPreAddEntity)
        this.getDocument<Event>(`events/${notification.docId}`).then(async event => {
          const subject = await this.notificationSubject(notification, event)
          await this.update(notification.id, newNotification => {
            return {
              ...newNotification,
              message: `${subject} has ${notification.invitation.status} your ${notification.invitation.mode} to attend ${event.type} "${event.title}".`
            };
          });
        });

        return {
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `Someone has ${notification.invitation.status} your ${notification.invitation.mode} to attend an event.`,
          imgRef: notification.user?.avatar || notification.organization?.logo,
          placeholderUrl: 'profil_user.svg',
          url: `${applicationUrl['festival']}/c/o/${module}/event/${notification.docId}`
        };
      case 'requestToAttendEventSent':

        // we perform async fetch to display more meaningful info to the user later (because we cannot do await in akitaPreAddEntity)
        this.getDocument<Event>(`events/${notification.docId}`).then(event => {
          this.update(notification.id, newNotification => {
            return {
              ...newNotification,
              message: `Your request to attend event ${event.type} "${event.title}" has been sent.`
            };
          });
        });

        return {
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `Your request to attend event "${notification.docId}" has been sent.`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.svg',
          url: `${applicationUrl['festival']}/c/o/${module}/event/${notification.docId}`
        };
      case 'offerCreatedConfirmation':
        return {
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `Your offer was successfully sent.`,
          placeholderUrl: 'profil_user.svg'
        }
      case 'contractCreated':
        return {
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `An offer is made on one of your titles.`,
          placeholderUrl: 'profil_user.svg',
          url: `${applicationUrl['catalog']}/c/o/${module}/title/${notification.docId}`
        }
      default:
        return {
          message: 'Error while displaying notification.'
        };
    }
  }

  private async notificationSubject(notification: Notification, event?: Event): Promise<string> {
    let subject = 'Unknown subject';

    // Adding user data to the notification of meeting events
    if (event && isMeeting(event) && notification.organization) {
      const user = await this.getDocument<PublicUser>(`users/${event.meta.organizerUid}`);
      const organizationName = orgName(notification.organization);
      subject = `${user.firstName} ${user.lastName} (${organizationName})`;
    } else if (notification.organization) {
      subject = orgName(notification.organization);
    } else if (notification.user && notification.user.lastName && notification.user.firstName) {
      if (notification.user.orgId) {
        const org = await this.orgService.getValue(notification.user.orgId);
        subject = `${displayName(notification.user)} (${orgName(org)})`;
      }
      else subject = displayName(notification.user);
    } else if (notification.user && notification.user.email) {
      subject = notification.user.email;
    }
    return subject;
  }

  public getPoster(id?: string) {
    const movie = this.movieQuery.getEntity(id);
    return movie?.poster ?? createStorageFile({
      privacy: 'public',
      collection: 'movies',
      docId: id,
      field: 'poster',
      storagePath: 'poster',
    });
  }

  private getDocument<T>(path: string): Promise<T> {
    return this.firestore
      .doc(path)
      .get().toPromise()
      .then(doc => doc.data() as T);
  }
}
