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
import { trimString } from '@blockframes/utils/pipes/max-length.pipe';

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
          message: `Members of your organization have been updated.`,
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
              message: `<a href="/c/o/marketplace/movie/${movie.id}" target="_blank">${movie.title.international}</a> was successfully submitted to the ${appName[movieAppAccess[0]]} Team.`,
              url: `${applicationUrl[movieAppAccess[0]]}/c/o/dashboard/title/${notification.docId}/main`,
            };
          })
        })
        return {
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `A new movie was successfully submitted.`,
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
              message: `<a href="/c/o/marketplace/movie/${movie.id}" target="_blank">${movie.title.international}</a> was successfully published on the marketplace.`,
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
      case 'movieAskingPriceRequested':
        this.getDocument<Movie>(`movies/${notification.docId}`).then(movie => {
          this.update(notification.id, newNotification => {
            return {
              ...newNotification,
              message: `${displayName(notification.user)} requested the asking price for ${movie.title.international} in ${trimString(notification.data.territories, 50, true)}. Please check your emails for more details or contact us.`,
              url: `mailto:${notification.user.email}?subject=Interest in ${movie.title.international} via Archipel Market`
            };
          });
        });
        return {
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `${displayName(notification.user)} requested the asking price for ${notification.docId} in ${trimString(notification.data.territories, 50, true)}. Please check your emails for more details or contact us.`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.svg',
          url: `mailto:${notification.user.email}?subject=Interest in ${notification.docId} via Archipel Market`
        };
      case 'movieAskingPriceRequestSent':
        this.getDocument<Movie>(`movies/${notification.docId}`).then(movie => {
          this.update(notification.id, newNotification => {
            return {
              ...newNotification,
              message: `Your request for ${movie.title.international}'s asking price was successfully sent.`
            };
          });
        });
        return {
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `Your request for ${notification.docId}'s asking price was successfully sent.`,
          imgRef: this.getPoster(notification.docId),
          placeholderUrl: 'empty_poster.svg',
          url: `/c/o/marketplace/title/${notification.docId}/main`
        };
      case 'orgAppAccessChanged': {
        const msg = notification.appAccess
          ? `Your organization now has access to ${appName[notification.appAccess]}`
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
                message: `REMINDER - ${org.denomination.full}'s ${event.type} "<a href="/event/${event.id}" target="_blank">${event.title}</a>" is about to start.`
              };
            });
          })
        });

        return {
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `REMINDER - Your event "<a href="/event/${notification.docId}" target="_blank">${notification.docId}</a>" is about to start.`,
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
                message: `REMINDER - ${org.denomination.full}'s ${event.type} "<a href="/event/${event.id}" target="_blank">${event.title}</a>" will start tomorrow at ${format(toDate(event.start), 'h:mm a')}.`
              };
            });
          })
        });

        return {
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `REMINDER - Your event "<a href="/event/${notification.docId}" target="_blank">${notification.docId}</a>" is tomorrow.`,
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
              message: `${subject} has ${notification.invitation.status} your ${notification.invitation.mode} to attend ${event.type} "<a href="/event/${event.id}" target="_blank">${event.title}</a>".`
            };
          });
        });

        return {
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `Someone has ${notification.invitation.status} your ${notification.invitation.mode} to attend an event.`,
          imgRef: notification.user?.avatar || notification.organization?.logo,
          placeholderUrl: 'profil_user.svg',
          url: `${applicationUrl['festival']}${module === 'marketplace' ? `/event/${notification.docId}/r/i/` : `/c/o/${module}/event/${notification.docId}`}`
        };
      case 'requestToAttendEventSent':

        // we perform async fetch to display more meaningful info to the user later (because we cannot do await in akitaPreAddEntity)
        this.getDocument<Event>(`events/${notification.docId}`).then(event => {
          this.update(notification.id, newNotification => {
            return {
              ...newNotification,
              message: `Your request to attend event ${event.type} "<a href="/event/${event.id}" target="_blank">${event.title}</a>" has been sent.`
            };
          });
        });

        return {
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `Your request to attend event "<a href="/event/${notification.docId}" target="_blank">${notification.docId}</a>" has been sent.`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.svg',
          url: `${applicationUrl['festival']}${module === 'marketplace' ? `/event/${notification.docId}/r/i/` : `/c/o/${module}/event/${notification.docId}`}`
        };
      case 'screeningRequested':
        // we perform async fetch to display more meaningful info to the user later (because we cannot do await in akitaPreAddEntity)
        this.getDocument<Movie>(`movies/${notification.docId}`).then(movie => {
          this.update(notification.id, newNotification => {
            return {
              ...newNotification,
              message: `${displayName(notification.user)} requested a screening for ${movie.title.international}`
            };
          });
        });
        return {
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `${displayName(notification.user)} requested a screening for ${notification.docId}`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.svg',
          url: `${applicationUrl['festival']}/c/o/dashboard/event/new/edit?titleId=${notification.docId}`,
          actionText: 'Answer Request'
        };
      case 'screeningRequestSent':
        this.getDocument<Movie>(`movies/${notification.docId}`).then(movie => {
          this.update(notification.id, newNotification => {
            return {
              ...newNotification,
              message: `Your screening request for ${movie.title.international} was successfully sent.`
            }
          })
        })
        return {
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `Your screening request for ${notification.docId} was successfully sent.`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.svg',
          url: `${applicationUrl['festival']}/c/o/marketplace/title/${notification.docId}`
        }

      case 'offerCreatedConfirmation':
        return {
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `Your offer was successfully sent.`,
          placeholderUrl: 'profil_user.svg',
          url: `${applicationUrl['catalog']}/c/o/marketplace/offer/${notification.docId}`
        }
      case 'contractCreated':
        return {
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `An offer has been made on one of your titles.`,
          placeholderUrl: 'contract_offer.svg',
          url: `${applicationUrl['catalog']}/c/o/dashboard/sales/${notification.docId}`
        }
      case 'createdCounterOffer': {
        const marketplaceUrl = `${applicationUrl['catalog']}/c/o/marketplace/offer/${notification.offerId}/${notification.docId}`;
        const dashboardUrl = `${applicationUrl['catalog']}/c/o/dashboard/sales/${notification.docId}/view`;

        return {
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `Your counter-offer was successfully sent.`,
          placeholderUrl: 'contract_offer.svg',
          url: module === 'marketplace' ? marketplaceUrl : dashboardUrl
        }
      }
      case 'receivedCounterOffer': {
        const marketplaceUrl = `${applicationUrl['catalog']}/c/o/marketplace/offer/${notification.offerId}/${notification.docId}`;
        const dashboardUrl = `${applicationUrl['catalog']}/c/o/dashboard/sales/${notification.docId}/view`;

        return {
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `You've received a counter-offer.`,
          placeholderUrl: 'contract_offer.svg',
          url: module === 'marketplace' ? marketplaceUrl : dashboardUrl
        }
      }
      case 'myContractWasAccepted': {
        const marketplaceUrl = `${applicationUrl['catalog']}/c/o/marketplace/offer/${notification.offerId}/${notification.docId}`;
        const dashboardUrl = `${applicationUrl['catalog']}/c/o/dashboard/sales/${notification.docId}/view`;
        return {
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `Your offer was accepted.`,
          placeholderUrl: 'contract_offer.svg',
          url: module === 'marketplace' ? marketplaceUrl : dashboardUrl
        }
      }
      case 'underSignature': {
        return {
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `Your offer is now under signature`,
          placeholderUrl: 'contract_offer.svg',
          url: `${applicationUrl['catalog']}/c/o/dashboard/sales/${notification.docId}/view`
        }
      }
      case 'myOrgAcceptedAContract': {
        const marketplaceUrl = `${applicationUrl['catalog']}/c/o/marketplace/offer/${notification.offerId}/${notification.docId}`;
        const dashboardUrl = `${applicationUrl['catalog']}/c/o/dashboard/sales/${notification.docId}/view`;
        return {
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `You accepted an offer.`,
          placeholderUrl: 'contract_offer.svg',
          url: module === 'marketplace' ? marketplaceUrl : dashboardUrl
        }
      }
      case 'myContractWasDeclined': {
        const marketplaceUrl = `${applicationUrl['catalog']}/c/o/marketplace/offer/${notification.offerId}/${notification.docId}`;
        const dashboardUrl = `${applicationUrl['catalog']}/c/o/dashboard/sales/${notification.docId}/view`;
        return {
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `Your offer was declined.`,
          placeholderUrl: 'contract_offer.svg',
          url: module === 'marketplace' ? marketplaceUrl : dashboardUrl
        }
      }
      case 'myOrgDeclinedAContract': {
        const marketplaceUrl = `${applicationUrl['catalog']}/c/o/marketplace/offer/${notification.offerId}/${notification.docId}`;
        const dashboardUrl = `${applicationUrl['catalog']}/c/o/dashboard/sales/${notification.docId}/view`;
        return {
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `You declined an offer.`,
          placeholderUrl: 'contract_offer.svg',
          url: module === 'marketplace' ? marketplaceUrl : dashboardUrl
        }
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
