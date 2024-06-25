import { Injectable } from '@angular/core';
import { AuthService } from '@blockframes/auth/service';
import { filter, map, switchMap } from 'rxjs/operators';
import {
  Movie,
  Event,
  isMeeting,
  isScreening,
  Notification,
  createStorageFile,
  appName,
  eventTypes,
  isAppNotification,
  displayName,
  toLabel,
  createMovie,
  createTitle,
  preferredLanguage
} from '@blockframes/model';
import { OrganizationService } from '@blockframes/organization/service';
import { applicationUrl } from '@blockframes/utils/apps';
import { MovieService } from '@blockframes/movie/service';
import { format } from 'date-fns';
import { UserService } from '@blockframes/user/service';
import { EventService } from '@blockframes/event/service';
import { ModuleGuard } from '@blockframes/utils/routes/module.guard';
import { ContractService } from '@blockframes/contract/contract/service';
import { BlockframesCollection } from '@blockframes/utils/abstract-service';
import { NegotiationService } from '@blockframes/contract/negotiation/service';
import { getReviewer } from '@blockframes/contract/negotiation/utils';
import { where } from 'firebase/firestore';
import { SentryService } from '@blockframes/utils/sentry.service';
import { WaterfallDocumentsService } from '@blockframes/waterfall/documents.service';
import '@angular/localize/init'; // TODO #9699 why is this needed here?

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

  /** @dev i18n is only on waterfall app for now #9699 */
  private locale = this.app === 'waterfall' ? preferredLanguage() : undefined;

  constructor(
    private authService: AuthService,
    private orgService: OrganizationService,
    private moduleGuard: ModuleGuard,
    private movieService: MovieService,
    private negotiationService: NegotiationService,
    private contractService: ContractService,
    private documentService: WaterfallDocumentsService,
    private userService: UserService,
    private eventService: EventService,
    private sentryService: SentryService,
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
          _meta: { ...notification._meta, createdAt: notification._meta.createdAt },
          message: $localize`Your organization was accepted by the ${this.appName} team.`,
          imgRef: notification.organization?.logo,
          actionText: $localize`See Organization`,
          placeholderUrl: 'empty_organization.svg',
          url: `${applicationUrl[this.app]}/c/o/organization/${notification.organization.id
            }/view/org`,
        };
      case 'requestFromUserToJoinOrgDeclined':
        // TODO #8026
        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: notification._meta.createdAt },
          message: $localize`${displayUserName}'s request to join your organization was refused.`,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.svg',
          url: `${applicationUrl[this.app]}/c/o/organization/${notification.organization.id
            }/view/members`,
        };
      case 'orgMemberUpdated': {
        const org = await this.orgService.load(notification.organization.id);
        const message = org.userIds.includes(notification.user.uid)
          ? $localize`${displayUserName} is now part of your organization.`
          : $localize`${displayUserName} has been removed from your organization.`;

        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: notification._meta.createdAt },
          message,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.svg',
          actionText: $localize`See Members`,
          url: `${applicationUrl[this.app]}/c/o/organization/${notification.organization.id
            }/view/members`,
        };
      }
      case 'invitationToAttendEventUpdated':
      case 'requestToAttendEventUpdated': {
        const event = await this.eventService.load(notification.docId);
        const subject = await this.notificationSubject(notification, event);
        const message = $localize`${subject} has ${notification.invitation.status} your ${notification.invitation.mode} to attend ${eventTypes[event.type]} "<a href="/event/${event.id}" target="_blank">${event.title}</a>".`;
        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: notification._meta.createdAt },
          message,
          imgRef: notification.user?.avatar || notification.organization?.logo,
          placeholderUrl: 'profil_user.svg',
          url: `${applicationUrl['festival']}${module === 'marketplace'
            ? `/event/${notification.docId}/r/i/`
            : `/c/o/${module}/event/${notification.docId}`
            }`,
        };
      }
      case 'requestToAttendEventSent': {
        const event = await this.eventService.load(notification.docId);
        const message = $localize`Your request to attend "<a href="/event/${event.id}" target="_blank">${event.title}</a>" has been sent.`;
        const url = `${applicationUrl['festival']}${module === 'marketplace'
          ? `/event/${notification.docId}/r/i/`
          : `/c/o/${module}/event/${notification.docId}`
          }`
        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: notification._meta.createdAt },
          message,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.svg',
          url,
        };
      }
      case 'movieSubmitted': {
        const movie = await this.loadMovie(notification.docId);
        const imgRef = this.getPoster(movie);
        const message = $localize`<a href="/c/o/dashboard/title/${movie.id}" target="_blank">${movie.title.international}</a> was successfully submitted to the ${appName[notification._meta.createdFrom]} team.`;

        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: notification._meta.createdAt },
          message,
          imgRef,
          actionText: $localize`See Title`,
          placeholderUrl: 'empty_poster.svg',
          url: `${applicationUrl[notification._meta.createdFrom]}/c/o/dashboard/title/${notification.docId}/main`,
        };
      }
      case 'movieAskingPriceRequestSent': {
        const movie = await this.loadMovie(notification.docId);
        const imgRef = this.getPoster(movie);
        const message = $localize`Your request for ${movie.title.international}'s asking price was successfully sent.`;

        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: notification._meta.createdAt },
          message,
          imgRef,
          actionText: $localize`See Title`,
          placeholderUrl: 'empty_poster.svg',
          url: `/c/o/marketplace/title/${notification.docId}/main`,
        };
      }
      case 'eventIsAboutToStart': {
        const event = await this.eventService.load(notification.docId);
        const titleId = isScreening(event) ? event.meta.titleId : undefined;
        const movie = await this.loadMovie(titleId);
        const imgRef = this.getPoster(movie);
        const org = await this.orgService.load(event.ownerOrgId);
        const message = $localize`REMINDER - ${org.name}'s ${eventTypes[event.type]} "<a href="/event/${event.id}" target="_blank">${event.title}</a>" is about to start.`;

        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: notification._meta.createdAt },
          imgRef,
          message,
          actionText: $localize`Go to ${toLabel(event.type, 'eventTypes')}`,
          placeholderUrl: 'empty_poster.svg',
          url: `${applicationUrl['festival']}/event/${notification.docId}/r/i`,
        };
      }
      case 'oneDayReminder': {
        const event = await this.eventService.load(notification.docId);
        const titleId = isScreening(event) ? event.meta.titleId : undefined;
        const movie = await this.loadMovie(titleId);
        const imgRef = this.getPoster(movie);
        const org = await this.orgService.load(event.ownerOrgId);
        const message = $localize`REMINDER - ${org.name}'s ${eventTypes[event.type]} "<a href="/event/${event.id
          }" target="_blank">${event.title}</a>" will start tomorrow at ${format(
            event.start,
            'h:mm a'
          )}.`;

        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: notification._meta.createdAt },
          imgRef,
          message,
          placeholderUrl: 'empty_poster.svg',
          actionText: $localize`Go to ${toLabel(event.type, 'eventTypes')}`,
          url: `${applicationUrl['festival']}/event/${notification.docId}/r/i`,
        };
      }
      case 'movieAccepted': {
        const movie = await this.loadMovie(notification.docId);
        const imgRef = this.getPoster(movie);
        const message = `<a href="/c/o/dashboard/title/${movie.id}" target="_blank">${movie.title.international}</a> was successfully published on the marketplace.`;

        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: notification._meta.createdAt },
          message,
          imgRef,
          actionText: $localize`See Title`,
          placeholderUrl: 'empty_poster.svg',
          url: `${applicationUrl[notification._meta.createdFrom]}/c/o/dashboard/title/${notification.docId}/main`,
        };
      }
      case 'movieAskingPriceRequested': {
        const movie = await this.loadMovie(notification.docId);
        const isFestival = notification._meta.createdFrom === 'festival';

        const buyerName = isFestival ? displayName(notification.user) : 'Someone';
        const message = $localize`${buyerName} requested an asking price for ${movie.title.international}. Please check your emails for details.`;
        const url = isFestival
          ? `mailto:${notification.user.email}?subject=Interest in ${movie.title.international} via Archipel Market`
          : `${applicationUrl[notification._meta.createdFrom]}/c/o/dashboard/avails/${notification.docId}/map/`;

        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: notification._meta.createdAt },
          message,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.svg',
          url,
          actionText: isFestival ? $localize`Start Discussions` : $localize`See Title`,
        };
      }
      case 'screeningRequested': {
        const movie = await this.loadMovie(notification.docId);
        const message = $localize`<a href="mailto:${notification.user.email}">${displayName(notification.user)}</a> requested a screening for <a href="/c/o/dashboard/title/${movie.id}">${movie.title.international}</a>.`;

        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: notification._meta.createdAt },
          message,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.svg',
          url: `${applicationUrl['festival']}/c/o/dashboard/event/new/edit?titleId=${notification.docId}&requestor=${encodeURIComponent(notification.user.email)}`,
          actionText: $localize`Organize Screening`,
        };
      }
      case 'screeningRequestSent': {
        const movie = await this.loadMovie(notification.docId);
        const message = $localize`Your screening request for ${movie.title.international} was successfully sent.`;

        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: notification._meta.createdAt },
          message,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.svg',
          actionText: $localize`See Title`,
          url: `${applicationUrl['festival']}/c/o/marketplace/title/${notification.docId}`,
        };
      }
      case 'screenerRequested': {
        const movie = await this.loadMovie(notification.docId);
        const org = await this.orgService.load(notification.user.orgId);
        const message = `${toLabel(org.activity, 'orgActivity')} - ${toLabel(org.addresses.main.country, 'territories')} requested a screener for <a href="/c/o/dashboard/title/${movie.id}">${movie.title.international}</a>.`;

        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: notification._meta.createdAt },
          message,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.svg',
          url: `/c/o/dashboard/tunnel/movie/${notification.docId}/media-screener`,
          actionText: $localize`Upload a Screener`,
        };
      }
      case 'screenerRequestSent': {
        const movie = await this.loadMovie(notification.docId);
        const message = $localize`Your screener request for ${movie.title.international} was successfully sent.`;

        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: notification._meta.createdAt },
          message,
          imgRef: notification.user.avatar,
          placeholderUrl: 'profil_user.svg',
          actionText: $localize`See Title`,
          url: `/c/o/marketplace/title/${notification.docId}`,
        };
      }
      case 'offerCreatedConfirmation':
        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: notification._meta.createdAt },
          message: $localize`Your offer ${notification.docId} was successfully sent.`,
          placeholderUrl: 'profil_user.svg',
          actionText: $localize`See Offer`,
          url: `${applicationUrl['catalog']}/c/o/marketplace/offer/${notification.docId}`
        }
      case 'contractCreated': {
        const contract = await this.contractService.load(notification.docId);
        if (!contract) return this.contractFailback(notification);
        const movie = await this.loadMovie(contract.titleId);
        const org = await this.orgService.load(contract.buyerId);
        const message = $localize`${org.name} sent an offer for ${movie.title.international}.`;

        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: notification._meta.createdAt },
          message,
          placeholderUrl: 'list_offer.svg',
          actionText: $localize`See Offer`,
          url: `${applicationUrl['catalog']}/c/o/dashboard/sales/${notification.docId}`
        }
      }
      case 'createdCounterOffer': {
        const marketplaceUrl = `${applicationUrl['catalog']}/c/o/marketplace/offer/${notification.offerId}/${notification.docId}`;
        const dashboardUrl = `${applicationUrl['catalog']}/c/o/dashboard/sales/${notification.docId}/view`;
        const contract = await this.contractService.load(notification.docId);
        if (!contract) return this.contractFailback(notification);
        const negotiation = await this.negotiationService.load(notification.docPath);
        const { name } = await this.orgService.load(getReviewer(negotiation));
        const movie = await this.loadMovie(contract.titleId);
        const message = $localize`Your counter-offer for ${movie.title.international} was successfully sent to ${name}.`;

        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: notification._meta.createdAt },
          message,
          actionText: $localize`See Offer`,
          placeholderUrl: 'list_offer.svg',
          url: module === 'marketplace' ? marketplaceUrl : dashboardUrl,
        };
      }
      case 'receivedCounterOffer': {
        const marketplaceUrl = `${applicationUrl['catalog']}/c/o/marketplace/offer/${notification.offerId}/${notification.docId}`;
        const dashboardUrl = `${applicationUrl['catalog']}/c/o/dashboard/sales/${notification.docId}/view`;
        const contract = await this.contractService.load(notification.docId);
        if (!contract) return this.contractFailback(notification);
        const movie = await this.loadMovie(contract.titleId);
        const negotiation = await this.negotiationService.load(notification.docPath);
        const { name } = await this.orgService.load(negotiation.createdByOrg);
        const message = $localize`${name} sent a counter-offer for ${movie.title.international}.`;

        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: notification._meta.createdAt },
          message,
          actionText: $localize`See Offer`,
          placeholderUrl: 'list_offer.svg',
          url: module === 'marketplace' ? marketplaceUrl : dashboardUrl,
        };
      }
      case 'myContractWasAccepted': {
        const marketplaceUrl = `${applicationUrl['catalog']}/c/o/marketplace/offer/${notification.offerId}/${notification.docId}`;
        const dashboardUrl = `${applicationUrl['catalog']}/c/o/dashboard/sales/${notification.docId}/view`;
        const contract = await this.contractService.load(notification.docId);
        if (!contract) return this.contractFailback(notification);
        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: notification._meta.createdAt },
          message: $localize`Your offer ${contract.offerId} was accepted. The ${this.appName} team will contact you shortly.`,
          placeholderUrl: 'list_offer.svg',
          actionText: $localize`See Offer`,
          url: module === 'marketplace' ? marketplaceUrl : dashboardUrl,
        };
      }
      // #7946 this may be reactivated later
      // case 'underSignature': {
      //   return {
      //     ...notification,
      //     _meta: { ...notification._meta, createdAt: notification._meta.createdAt },
      //     message: `Your offer is now under signature`,
      //     placeholderUrl: 'list_offer.svg',
      //     actionText:'See Offer',
      //     url: `${applicationUrl['catalog']}/c/o/dashboard/sales/${notification.docId}/view`
      //   }
      // }
      // case 'offerAccepted': {
      //   return {
      //     ...notification,
      //     _meta: { ...notification._meta, createdAt: notification._meta.createdAt },
      //     message: `Your offer is now under signature`,
      //     placeholderUrl: 'list_offer.svg',
      //     actionText:'See Offer',
      //     url: `${applicationUrl['catalog']}/c/o/marketplace/offer/${notification.docId}`
      //   }
      // }
      case 'myOrgAcceptedAContract': {
        const marketplaceUrl = `${applicationUrl['catalog']}/c/o/marketplace/offer/${notification.offerId}/${notification.docId}`;
        const dashboardUrl = `${applicationUrl['catalog']}/c/o/dashboard/sales/${notification.docId}/view`;
        const message = $localize`Congrats for accepting the offer ${notification.offerId}. The agreement will now be drafted offline.`;

        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: notification._meta.createdAt },
          message,
          actionText: $localize`See Offer`,
          placeholderUrl: 'list_offer.svg',
          url: module === 'marketplace' ? marketplaceUrl : dashboardUrl,
        };
      }
      case 'myContractWasDeclined': {
        const marketplaceUrl = `${applicationUrl['catalog']}/c/o/marketplace/offer/${notification.offerId}/${notification.docId}`;
        const dashboardUrl = `${applicationUrl['catalog']}/c/o/dashboard/sales/${notification.docId}/view`;
        const contract = await this.contractService.load(notification.docId);
        if (!contract) return this.contractFailback(notification);
        const movie = await this.loadMovie(contract.titleId);

        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: notification._meta.createdAt },
          message: $localize`Your offer for ${movie.title.international} was declined.`,
          placeholderUrl: 'list_offer.svg',
          actionText: $localize`See Offer`,
          url: module === 'marketplace' ? marketplaceUrl : dashboardUrl,
        };
      }
      case 'myOrgDeclinedAContract': {
        const marketplaceUrl = `${applicationUrl['catalog']}/c/o/marketplace/offer/${notification.offerId}/${notification.docId}`;
        const dashboardUrl = `${applicationUrl['catalog']}/c/o/dashboard/sales/${notification.docId}/view`;
        const contract = await this.contractService.load(notification.docId);
        if (!contract) return this.contractFailback(notification);
        const movie = await this.loadMovie(contract.titleId);

        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: notification._meta.createdAt },
          message: $localize`The offer for ${movie.title.international} was successfully declined.`,
          placeholderUrl: 'list_offer.svg',
          actionText: $localize`See Offer`,
          url: module === 'marketplace' ? marketplaceUrl : dashboardUrl,
        };
      }
      case 'orgAppAccessChanged': {
        const message = notification.appAccess
          ? $localize`Your organization now has access to ${appName[notification.appAccess]}.`
          : $localize`Your organization's app access have changed.`;
        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: notification._meta.createdAt },
          message,
          actionText: $localize`Access App`,
          placeholderUrl: `empty_organization.svg`,
          imgRef: notification.organization?.logo,
          url: `${applicationUrl[notification.appAccess]}`,
        };
      }
      case 'invitationToJoinWaterfallUpdated': {
        const movie = await this.loadMovie(notification.docId);
        const subject = await this.notificationSubject(notification);
        const status = toLabel(notification.invitation.status, 'invitationStatus', undefined, undefined, this.locale);
        const message = $localize`${subject} has ${status.toLowerCase()} your ${notification.invitation.mode} to join ${movie.title.international}'s Waterfall.`;
        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: notification._meta.createdAt },
          message,
          imgRef: notification.user?.avatar || notification.organization?.logo,
          placeholderUrl: 'profil_user.svg',
          url: `${applicationUrl[notification._meta.createdFrom]}/c/o/dashboard/title/${notification.docId}`,
        };
      }
      case 'userRequestedDocumentCertification': {
        const movie = await this.loadMovie(notification.docId);
        const imgRef = this.getPoster(movie);
        let message = $localize`Your request to certify a document is being processed.`;
        if (notification.statementId) {
          message = $localize`Your request to certify a <a href="/c/o/dashboard/title/${movie.id}/statement/${notification.statementId}" target="_blank">statement</a> for ${movie.title.international}'s Waterfall is being processed.`;
        }
        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: notification._meta.createdAt },
          message,
          imgRef,
          placeholderUrl: 'empty_poster.svg',
          url: `${applicationUrl[notification._meta.createdFrom]}/c/o/dashboard/title/${notification.docId}/statement/${notification.statementId}`,
        };
      }
      case 'requestForStatementReviewCreated': {
        const movie = await this.loadMovie(notification.docId);
        const imgRef = this.getPoster(movie);
        let message = $localize`Your request to review a statement is being processed by the ${toLabel('producer', 'rightholderRoles', undefined, undefined, this.locale)}.`;
        if (notification.statementId) {
          message = $localize`Your request to review a <a href="/c/o/dashboard/title/${movie.id}/statement/${notification.statementId}" target="_blank">statement</a> for ${movie.title.international}'s Waterfall is being processed.`;
        }
        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: notification._meta.createdAt },
          message,
          imgRef,
          placeholderUrl: 'empty_poster.svg',
          url: `${applicationUrl[notification._meta.createdFrom]}/c/o/dashboard/title/${notification.docId}/statement/${notification.statementId}`,
        };
      }
      case 'requestForStatementReviewApproved': {
        const movie = await this.loadMovie(notification.docId);
        const imgRef = this.getPoster(movie);
        let message = $localize`Your statement has been approved by the ${toLabel('producer', 'rightholderRoles', undefined, undefined, this.locale)}.`;
        if (notification.statementId) {
          message = $localize`Your <a href="/c/o/dashboard/title/${movie.id}/statement/${notification.statementId}" target="_blank">statement</a> for ${movie.title.international}'s Waterfall has been approved.`;
        }
        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: notification._meta.createdAt },
          message,
          imgRef,
          placeholderUrl: 'empty_poster.svg',
          url: `${applicationUrl[notification._meta.createdFrom]}/c/o/dashboard/title/${notification.docId}/statement/${notification.statementId}`,
        };
      }
      case 'requestForStatementReviewDeclined': {
        const movie = await this.loadMovie(notification.docId);
        const imgRef = this.getPoster(movie);
        let message = $localize`Your statement has been declined by the ${toLabel('producer', 'rightholderRoles', undefined, undefined, this.locale)}.`;
        if (notification.statementId) {
          message = $localize`Your <a href="/c/o/dashboard/title/${movie.id}/statement/${notification.statementId}/edit" target="_blank">statement</a> for ${movie.title.international}'s Waterfall has been declined.`;
        }
        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: notification._meta.createdAt },
          message,
          imgRef,
          placeholderUrl: 'empty_poster.svg',
          url: `${applicationUrl[notification._meta.createdFrom]}/c/o/dashboard/title/${notification.docId}/statement/${notification.statementId}/edit`,
        };
      }
      case 'userRequestedStatementReview': {
        const movie = await this.loadMovie(notification.docId);
        const subject = await this.notificationSubject(notification);
        let message = $localize`${subject} has requested a review for a statement.`;
        if (notification.statementId) {
          message = $localize`New request to review a <a href="/c/o/dashboard/title/${movie.id}/statement/${notification.statementId}" target="_blank">statement</a> for ${movie.title.international}'s Waterfall.`;
        }
        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: notification._meta.createdAt },
          message,
          imgRef: notification.user?.avatar || notification.organization?.logo,
          placeholderUrl: 'profil_user.svg',
          url: `${applicationUrl[notification._meta.createdFrom]}/c/o/dashboard/title/${notification.docId}/statement/${notification.statementId}`,
        };
      }
      case 'documentSharedWithOrg': {
        const movie = await this.loadMovie(notification.docId);
        const imgRef = this.getPoster(movie);
        let url = `${applicationUrl[notification._meta.createdFrom]}/c/o/dashboard/title/${notification.docId}/documents`;
        let message = $localize`A new <a href="/c/o/dashboard/title/${movie.id}/documents" target="_blank">document</a> was shared with your organization on ${movie.title.international}'s Waterfall.`;
        if (notification.documentId) {
          const doc = await this.documentService.load(notification.documentId, { waterfallId: notification.docId });
          if (doc?.type === 'contract') {
            message = $localize`A new <a href="/c/o/dashboard/title/${movie.id}/document/${doc.id}" target="_blank">document</a> was shared with your organization on ${movie.title.international}'s Waterfall.`;
            url = `${applicationUrl[notification._meta.createdFrom]}/c/o/dashboard/title/${notification.docId}/document/${doc.id}`;
          }
        }
        return {
          ...notification,
          _meta: { ...notification._meta, createdAt: notification._meta.createdAt },
          message,
          imgRef,
          placeholderUrl: 'empty_poster.svg',
          url,
        };
      }
      default:
        return {
          ...notification,
          message: $localize`Error while displaying notification.`,
        };
    }
  }

  private async notificationSubject(notification: Notification, event?: Event): Promise<string> {
    let subject = 'Unknown subject';

    // Adding user data to the notification of meeting events
    if (event && isMeeting(event) && notification.organization) {
      const user = await this.userService.load(event.meta.organizerUid);
      subject = `${displayName(user)} (${notification.organization.name})`;
    } else if (notification.organization) {
      subject = notification.organization.name;
    } else if (notification.user && notification.user.lastName && notification.user.firstName) {
      if (notification.user.orgId) {
        const org = await this.orgService.load(notification.user.orgId);
        subject = `${displayName(notification.user)} (${org.name})`;
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
        docId: movie?.id,
        field: 'poster',
        storagePath: 'poster',
      })
    );
  }

  /**
   * Prevent load error if provided id does not exists
   * Mainly used to prevent errors during E2E tests with possible remaining data stored in indexedDB (CF #8968)
   * @param id 
   * @returns 
   */
  private loadMovie(id: string) {
    return this.movieService.load(id).catch(_ => {
      this.sentryService.triggerError({ message: $localize`Failed to load movie ${id}`, bugType: 'firebase-error', location: 'notification-service' });
      return createMovie({ id, title: createTitle({ international: $localize`missing title` }) });
    });
  }

  private contractFailback(notification: Notification) {
    this.sentryService.triggerError({ message: $localize`Failed to load contract for ${notification.docId} (${notification.type})`, bugType: 'firebase-error', location: 'notification-service' });
    return {
      ...notification,
      message: $localize`Error while displaying notification.`,
      placeholderUrl: 'list_offer.svg',
    };
  }

}
