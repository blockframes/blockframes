import { Injectable } from '@angular/core';
import { AuthService } from '@blockframes/auth/+state/auth.service';
import { filter, map, switchMap } from 'rxjs/operators';
import {
  orgName,
  Movie,
  Event,
  isMeeting,
  isScreening,
  Notification,
  Contract,
  createStorageFile,
  appName,
  getMovieAppAccess,
  App,
  eventTypes,
  isAppNotification,
} from '@blockframes/model';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { toDate } from '@blockframes/utils/helpers';
import { displayName } from '@blockframes/model';
import { applicationUrl } from '@blockframes/utils/apps';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { format } from 'date-fns';
import { trimString } from '@blockframes/utils/pipes/max-length.pipe';
import { UserService } from '@blockframes/user/+state/user.service';
import { EventService } from '@blockframes/event/+state/event.service';
import { ModuleGuard } from '@blockframes/utils/routes/module.guard';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { where } from 'firebase/firestore';
import { BlockframesCollection } from '@blockframes/utils/abstract-service';

@Injectable({ providedIn: 'root' })
export class NotificationService extends BlockframesCollection<Notification> {
  readonly path = 'notifications';

  private appName = appName[this.app];

  myNotifications$ = this.authService.profile$.pipe(
    filter((user) => !!user?.uid),
    switchMap((user) =>
      this.valueChanges([where('toUserId', '==', user.uid)])
    ),
    switchMap((notifications) => {
      const promises = notifications
        .filter(n => n.app?.isRead !== undefined)
        .filter(n => isAppNotification(n.type, this.app))
        .map(n => this.appendNotificationData(n));
      return Promise.all(promises);
    })
  );

  myNotificationsCount$ = this.myNotifications$.pipe(map((notifs) => notifs.filter(notif => !notif.app?.isRead).length));

  constructor(
    private authService: AuthService,
    private orgService: OrganizationService,
    private moduleGuard: ModuleGuard,
    private movieService: MovieService,
    private contractService: ContractService,
    private userService: UserService,
    private eventService: EventService
  ) {
    super();
  }

  public readNotification(notification: Partial<Notification>) {
    return this.update({
      id: notification.id,
      app: { isRead: true },
    });
  }

  private async appendNotificationData(notification: Notification): Promise<Notification> {
    const displayUserName = notification.user ? displayName(notification.user) : 'Someone';
    const module = this.moduleGuard.currentModule;
    switch (notification.type) {
      case 'organizationAcceptedByArchipelContent':
        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `Your organization was accepted by the ${this.appName} team.`,
          imgRef: notification.organization?.logo,
          placeholderUrl: 'empty_organization.svg',
          url: `${applicationUrl[this.app]}/c/o/organization/${
            notification.organization.id
          }/view/org`,
        };
      case 'requestFromUserToJoinOrgDeclined':
        // TODO #8026
        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `${displayUserName}'s request to join your organization was refused.`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.svg',
          url: `${applicationUrl[this.app]}/c/o/organization/${
            notification.organization.id
          }/view/members`,
        };
      case 'invitationToJoinOrgDeclined':
        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `Your invitation to ${displayUserName} to join your organization was refused.`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.svg',
          url: `${applicationUrl[this.app]}/c/o/organization/${
            notification.organization.id
          }/view/members`,
        };
      case 'orgMemberUpdated': {
        const org = await this.orgService.load(notification.organization.id);
        const message = org.userIds.includes(notification.user.uid)
          ? `${displayUserName} is now part of your organization.`
          : `${displayUserName} has been removed from your organization.`;

        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.svg',
          url: `${applicationUrl[this.app]}/c/o/organization/${
            notification.organization.id
          }/view/members`,
        };
      }
      case 'invitationToAttendEventUpdated':
      case 'requestToAttendEventUpdated': {
        const event = await this.eventService.load(notification.docId);
        const subject = await this.notificationSubject(notification, event);
        const message = `${subject} has ${notification.invitation.status} your ${notification.invitation.mode} to attend ${eventTypes[event.type]} "<a href="/event/${event.id}" target="_blank">${event.title}</a>".`;
        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message,
          imgRef: notification.user?.avatar || notification.organization?.logo,
          placeholderUrl: 'profil_user.svg',
          url: `${applicationUrl['festival']}${
            module === 'marketplace'
              ? `/event/${notification.docId}/r/i/`
              : `/c/o/${module}/event/${notification.docId}`
          }`,
        };
      }
      case 'requestToAttendEventSent': {
        const event = await this.eventService.load(notification.docId);
        const message = `Your request to attend event ${eventTypes[event.type]} "<a href="/event/${event.id}" target="_blank">${event.title}</a>" has been sent.`;
        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.svg',
          url: `${applicationUrl['festival']}${
            module === 'marketplace'
              ? `/event/${notification.docId}/r/i/`
              : `/c/o/${module}/event/${notification.docId}`
          }`,
        };
      }
      case 'movieSubmitted': {
        const movie = await this.movieService.load(notification.docId);
        const imgRef = this.getPoster(movie);
        const movieAppAccess = getMovieAppAccess(movie);
        const message = `<a href="/c/o/dashboard/title/${movie.id}" target="_blank">${
          movie.title.international
        }</a> was successfully submitted to the ${appName[movieAppAccess[0]]} Team.`;

        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message,
          imgRef,
          placeholderUrl: 'empty_poster.svg',
          url: `${applicationUrl[movieAppAccess[0]]}/c/o/dashboard/title/${
            notification.docId
          }/main`,
        };
      }
      case 'movieAskingPriceRequestSent': {
        const movie = await this.movieService.load(notification.docId);
        const imgRef = this.getPoster(movie);
        const message = `Your request for ${movie.title.international}'s asking price was successfully sent.`;

        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message,
          imgRef,
          placeholderUrl: 'empty_poster.svg',
          url: `/c/o/marketplace/title/${notification.docId}/main`,
        };
      }
      case 'eventIsAboutToStart': {
        const event = await this.eventService.load(notification.docId);
        const titleId = isScreening(event) ? event.meta.titleId : undefined;
        const movie = await this.movieService.load(titleId);
        const imgRef = this.getPoster(movie);
        const org = await this.orgService.load(event.ownerOrgId);
        const message = `REMINDER - ${org.denomination.full}'s ${eventTypes[event.type]} "<a href="/event/${event.id}" target="_blank">${event.title}</a>" is about to start.`;

        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          imgRef,
          message,
          placeholderUrl: 'empty_poster.svg',
          url: `${applicationUrl['festival']}/event/${notification.docId}/r/i`,
        };
      }
      case 'oneDayReminder': {
        const event = await this.eventService.load(notification.docId);
        const titleId = isScreening(event) ? event.meta.titleId : undefined;
        const movie = await this.movieService.load(titleId);
        const imgRef = this.getPoster(movie);
        const org = await this.orgService.load(event.ownerOrgId);
        const message = `REMINDER - ${org.denomination.full}'s ${eventTypes[event.type]} "<a href="/event/${
          event.id
        }" target="_blank">${event.title}</a>" will start tomorrow at ${format(
          toDate(event.start),
          'h:mm a'
        )}.`;

        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          imgRef,
          message,
          placeholderUrl: 'empty_poster.svg',
          url: `${applicationUrl['festival']}/event/${notification.docId}/r/i`,
        };
      }
      case 'movieAccepted': {
        const movie = await this.movieService.load(notification.docId);
        const movieAppAccess = getMovieAppAccess(movie);
        const imgRef = this.getPoster(movie);
        const message = `<a href="/c/o/dashboard/title/${movie.id}" target="_blank">${movie.title.international}</a> was successfully published on the marketplace.`;

        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message,
          imgRef,
          placeholderUrl: 'empty_poster.svg',
          url: `${applicationUrl[movieAppAccess[0]]}/c/o/dashboard/title/${
            notification.docId
          }/main`,
        };
      }
      case 'movieAskingPriceRequested': {
        const movie = await this.movieService.load(notification.docId);
        const message = `${displayName(notification.user)} requested the asking price for ${
          movie.title.international
        } in ${trimString(
          notification.data.territories,
          50,
          true
        )}. Please check your emails for more details or contact us.`;

        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.svg',
          url: `mailto:${notification.user.email}?subject=Interest in ${movie.title.international} via Archipel Market`,
          actionText: 'Start Discussions',
        };
      }
      case 'screeningRequested': {
        const movie = await this.movieService.load(notification.docId);
        const message = `${displayName(notification.user)} requested a screening for ${
          movie.title.international
        }`;

        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.svg',
          url: `${applicationUrl['festival']}/c/o/dashboard/event/new/edit?titleId=${notification.docId}`,
          actionText: 'Answer Request',
        };
      }
      case 'screeningRequestSent': {
        const movie = await this.movieService.load(notification.docId);
        const message = `Your screening request for ${movie.title.international} was successfully sent.`;

        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.svg',
          url: `${applicationUrl['festival']}/c/o/marketplace/title/${notification.docId}`,
        };
      }
      case 'offerCreatedConfirmation':
        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `Your offer ${notification.docId} was successfully sent.`,
          placeholderUrl: 'profil_user.svg',
          url: `${applicationUrl['catalog']}/c/o/marketplace/offer/${notification.docId}`
        }
      case 'contractCreated': {
        const contract = await this.contractService.load(notification.docId);
        const movie = await this.movieService.load(contract.titleId);
        const user = await this.userService.load(contract.buyerUserId);
        const message = `${displayName(user)} sent an offer for ${movie.title.international}.`;

        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message,
          placeholderUrl: 'list_offer.svg',
          url: `${applicationUrl['catalog']}/c/o/dashboard/sales/${notification.docId}`
        }
      }  
      case 'createdCounterOffer': {
        const marketplaceUrl = `${applicationUrl['catalog']}/c/o/marketplace/offer/${notification.offerId}/${notification.docId}`;
        const dashboardUrl = `${applicationUrl['catalog']}/c/o/dashboard/sales/${notification.docId}/view`;
        const contract = await this.contractService.load(notification.docId);
        const movie = await this.movieService.load(contract.titleId);
        const name = await this.nameToDisplay(notification, contract);
        const message = `Your counter-offer for ${movie.title.international} was successfully sent to ${name}.`;
        
        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message,
          placeholderUrl: 'list_offer.svg',
          url: module === 'marketplace' ? marketplaceUrl : dashboardUrl,
        };
      }
      case 'receivedCounterOffer': {
        const marketplaceUrl = `${applicationUrl['catalog']}/c/o/marketplace/offer/${notification.offerId}/${notification.docId}`;
        const dashboardUrl = `${applicationUrl['catalog']}/c/o/dashboard/sales/${notification.docId}/view`;
        const contract = await this.contractService.load(notification.docId);
        const movie = await this.movieService.load(contract.titleId);
        const name = await this.nameToDisplay(notification, contract);
        const message = `${name} sent a counter-offer for ${movie.title.international}.`;

        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message,
          placeholderUrl: 'list_offer.svg',
          url: module === 'marketplace' ? marketplaceUrl : dashboardUrl,
        };
      }
      case 'myContractWasAccepted': {
        const marketplaceUrl = `${applicationUrl['catalog']}/c/o/marketplace/offer/${notification.offerId}/${notification.docId}`;
        const dashboardUrl = `${applicationUrl['catalog']}/c/o/dashboard/sales/${notification.docId}/view`;
        const contract = await this.contractService.load(notification.docId);
        const movie = await this.movieService.load(contract.titleId);
        
        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `Your offer for ${movie.title.international} was accepted. The agreement will now be drafted offline.`,
          placeholderUrl: 'list_offer.svg',
          url: module === 'marketplace' ? marketplaceUrl : dashboardUrl,
        };
      }
      // #7946 this may be reactivated later
      // case 'underSignature': {
      //   return {
      //     ...notification,
      //     _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
      //     message: `Your offer is now under signature`,
      //     placeholderUrl: 'list_offer.svg',
      //     url: `${applicationUrl['catalog']}/c/o/dashboard/sales/${notification.docId}/view`
      //   }
      // }
      // case 'offerAccepted': {
      //   return {
      //     ...notification,
      //     _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
      //     message: `Your offer is now under signature`,
      //     placeholderUrl: 'list_offer.svg',
      //     url: `${applicationUrl['catalog']}/c/o/marketplace/offer/${notification.docId}`
      //   }
      // }
      case 'myOrgAcceptedAContract': {
        const marketplaceUrl = `${applicationUrl['catalog']}/c/o/marketplace/offer/${notification.offerId}/${notification.docId}`;
        const dashboardUrl = `${applicationUrl['catalog']}/c/o/dashboard/sales/${notification.docId}/view`;
        const contract = await this.contractService.load(notification.docId);
        const movie = await this.movieService.load(contract.titleId);
        const message = `Congrats for accepting the offer ${notification.offerId} for ${movie.title.international}! The agreement will now be drafted offline.`;
        
        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message,
          placeholderUrl: 'list_offer.svg',
          url: module === 'marketplace' ? marketplaceUrl : dashboardUrl,
        };
      }
      case 'myContractWasDeclined': {
        const marketplaceUrl = `${applicationUrl['catalog']}/c/o/marketplace/offer/${notification.offerId}/${notification.docId}`;
        const dashboardUrl = `${applicationUrl['catalog']}/c/o/dashboard/sales/${notification.docId}/view`;
        const contract = await this.contractService.load(notification.docId);
        const movie = await this.movieService.load(contract.titleId);
        
        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `Your offer for ${movie.title.international} was declined.`,
          placeholderUrl: 'list_offer.svg',
          url: module === 'marketplace' ? marketplaceUrl : dashboardUrl,
        };
      }
      case 'myOrgDeclinedAContract': {
        const marketplaceUrl = `${applicationUrl['catalog']}/c/o/marketplace/offer/${notification.offerId}/${notification.docId}`;
        const dashboardUrl = `${applicationUrl['catalog']}/c/o/dashboard/sales/${notification.docId}/view`;
        const contract = await this.contractService.load(notification.docId);
        const movie = await this.movieService.load(contract.titleId);
        
        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message: `The offer for ${movie.title.international} was successfully declined.`,
          placeholderUrl: 'list_offer.svg',
          url: module === 'marketplace' ? marketplaceUrl : dashboardUrl,
        };
      }
      case 'orgAppAccessChanged': {
        const message = notification.appAccess
          ? `Your organization now has access to ${appName[notification.appAccess]}`
          : "Your organization's app access have changed.";
        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: toDate(notification._meta.createdAt) },
          message,
          placeholderUrl: `empty_organization.svg`,
          imgRef: notification.organization?.logo,
          url: `${applicationUrl[notification.appAccess]}`,
        };
      }
      default:
        return {
          ...notification,
          message: 'Error while displaying notification.',
        };
    }
  }

  private async notificationSubject(notification: Notification, event?: Event): Promise<string> {
    let subject = 'Unknown subject';

    // Adding user data to the notification of meeting events
    if (event && isMeeting(event) && notification.organization) {
      const user = await this.userService.load(event.meta.organizerUid);
      const organizationName = orgName(notification.organization);
      subject = `${user.firstName} ${user.lastName} (${organizationName})`;
    } else if (notification.organization) {
      subject = orgName(notification.organization);
    } else if (notification.user && notification.user.lastName && notification.user.firstName) {
      if (notification.user.orgId) {
        const org = await this.orgService.load(notification.user.orgId);
        subject = `${displayName(notification.user)} (${orgName(org)})`;
      } else subject = displayName(notification.user);
    } else if (notification.user && notification.user.email) {
      subject = notification.user.email;
    }
    return subject;
  }

  public getPoster(movie: Movie) {
    return (
      movie?.poster ??
      createStorageFile({
        privacy: 'public',
        collection: 'movies',
        docId: movie.id,
        field: 'poster',
        storagePath: 'poster',
      })
    );
  }

  /**
  * @returns A username or org name depending on who is receiving a counter offer
  */
  public async nameToDisplay(notification: Notification, contract: Contract) {
    if (contract.buyerUserId === notification.toUserId) {
      const org = await this.orgService.load(contract.sellerId);
      return orgName(org);
    } else {
      const user = await this.userService.load(contract.buyerUserId);
      return displayName(user);
    } 
  }
}
