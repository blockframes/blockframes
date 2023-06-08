/**
 * Templates for transactional emails we send to user and to cascade8 admins.
 * Look at the notion page to know objects relative to emails
 * https://www.notion.so/cascade8/Email-Data-Object-8ed9d64e8cd4490ea7bc0e469c04043e
 */
import { supportEmails, appUrl, e2eMode } from '../environments/environment';
import { templateIds } from '@blockframes/utils/emails/ids';
import { RequestDemoInformations } from '@blockframes/utils/request-demo';
import {
  PublicUser,
  PublicOrganization,
  Offer,
  Bucket,
  App,
  appName,
  Module,
  Movie,
  Organization,
  Negotiation,
  Contract,
  UserEmailData,
  OrgEmailData,
  MovieEmailData,
  getOfferEmailData,
  EmailRequest,
  getMovieEmailData,
  getNegotiationEmailData,
  getBucketEmailData,
  Event,
  EventMeta,
  EventEmailData,
  EmailTemplateRequest,
  displayName,
  RequestAskingPriceData,
  WaterfallEmailData
} from '@blockframes/model';
import { format } from 'date-fns';
import { e2eSupportEmail } from '@blockframes/utils/constants';

const ORG_HOME = '/c/o/organization/';
const USER_CREDENTIAL_INVITATION = '/auth/identity';
const ADMIN_ACCEPT_ORG_PATH = '/c/o/dashboard/crm/organization';
const ADMIN_REVIEW_MOVIE_PATH = '/c/o/dashboard/crm/movie';
const ADMIN_REVIEW_EVENT_PATH = '/c/o/dashboard/crm/event';

/**
 * This method return the "support" email that should be used regarding the originating app
 * @param app
 */
function getSupportEmail(app?: App) {
  if (e2eMode) return e2eSupportEmail;
  if (app && !!supportEmails[app]) {
    return supportEmails[app]
  }
  return supportEmails.default;
}

// ------------------------- //
//   FOR BLOCKFRAMES USERS   //
// ------------------------- //

export function userVerifyEmail(email: string, user: UserEmailData, link: string): EmailTemplateRequest {
  const data = {
    user,
    pageUrl: link
  };
  return { to: email, templateId: templateIds.user.verifyEmail, data };
}

export function accountCreationEmail(email: string, link: string, user: UserEmailData): EmailTemplateRequest {
  const data = {
    pageUrl: link,
    user
  };
  return { to: email, templateId: templateIds.user.welcomeMessage, data };
}

export function userResetPassword(email: string, link: string, app: App): EmailTemplateRequest {
  const data = {
    pageUrl: link
  };
  const templateId = app === 'crm' ? templateIds.user.resetPasswordFromCRM : templateIds.user.resetPassword;
  return { to: email, templateId, data };
}

/** Send email to an user who is requesting new app access */
export function appAccessEmail(email: string, user: UserEmailData): EmailTemplateRequest {
  return { to: email, templateId: templateIds.user.appAccessRequest, data: { user } };
}

/**
 * Generates a transactional email request for user invited to the application.
 * @param email
 * @param password
 * @param orgName
 * @param pageUrl
 * @param templateId
 */
export function userInvite(
  toUser: UserEmailData,
  org: OrgEmailData,
  pageUrl: string = appUrl.market,
  templateId: string = templateIds.user.credentials.joinOrganization,
  event?: EventEmailData,
  waterfall?: WaterfallEmailData
): EmailTemplateRequest {
  const data = {
    user: toUser,
    org,
    pageUrl: `${pageUrl}${USER_CREDENTIAL_INVITATION}?code=${encodeURIComponent(toUser.password)}&email=${encodeURIComponent(toUser.email)}`,
    event,
    waterfall,
  };
  return { to: toUser.email, templateId, data };
}

/** Generates a transactional email request to let organization admins know that their org was approved. */
export function organizationWasAccepted(toUser: UserEmailData, url: string = appUrl.market): EmailTemplateRequest {
  const data = {
    user: toUser,
    pageUrl: `${url}/c/o`
  };
  return { to: toUser.email, templateId: templateIds.org.accepted, data };
}

/** Generates a transactional email to let user knows its request has been sent */
export function userJoinOrgPendingRequest(toUser: UserEmailData, org: OrgEmailData): EmailTemplateRequest {
  const data = {
    user: toUser,
    org
  };
  return { to: toUser.email, templateId: templateIds.request.joinOrganization.pending, data };
}

/** Email to let org admin knows that his/her organization has access to a new app */
export function organizationAppAccessChanged(toAdmin: UserEmailData, url: string, app: App): EmailTemplateRequest {
  const data = {
    user: toAdmin,
    url,
    app
  }
  return { to: toAdmin.email, templateId: templateIds.org.appAccessChanged, data };
}

/** Send email to an user to inform him that he joined an org */
export function userJoinedAnOrganization(toUser: UserEmailData, url: string = appUrl.market, org: OrgEmailData,): EmailTemplateRequest {
  const data = {
    pageUrl: `${url}/c/o`,
    user: toUser,
    org
  };
  return { to: toUser.email, templateId: templateIds.request.joinOrganization.accepted, data };
}

/** Send email to all membersof an org to inform them that a new user has joined their org */
export function userJoinedYourOrganization(
  toUser: UserEmailData,
  org: OrgEmailData,
  userSubject: UserEmailData):
  EmailTemplateRequest {
  const data = {
    user: toUser,
    org,
    userSubject,
  };
  return { to: toUser.email, templateId: templateIds.org.memberAdded, data };
}

/** #8858 this might be reactivated later
 * Send email to org admin to inform him that an user has left his org
 * */
// export function userLeftYourOrganization(toAdmin: UserEmailData, userSubject: UserEmailData, org: OrgEmailData): EmailTemplateRequest {
//   const data = {
//     user: toAdmin,
//     userSubject,
//     org,
//     pageUrl: `${ORG_HOME}${org.id}/view/members`
//   };
//   return { to: toAdmin.email, templateId: templateIds.org.memberRemoved, data };
// }

/** Generates a transactional email to let an admin knows that an user requested to join his/her org */
export function userRequestedToJoinYourOrg(toAdmin: UserEmailData, userSubject: UserEmailData, org: OrgEmailData, url: string = appUrl.market): EmailTemplateRequest {
  const data = {
    user: toAdmin,
    userSubject,
    org,
    pageUrl: `${url}${ORG_HOME}${org.id}/view/members`
  };
  return { to: toAdmin.email, templateId: templateIds.request.joinOrganization.created, data };
}

/** Generates an email for user invited by an organization to an event. */
export function invitationToEventFromOrg(
  toUser: UserEmailData,
  org: OrgEmailData,
  event: EventEmailData,
  link: string,
  url: string = appUrl.market,
): EmailTemplateRequest {
  const data = {
    user: toUser,
    org,
    event,
    pageUrl: `${url}/${link}`,
  };
  return { to: toUser.email, templateId: templateIds.invitation.attendEvent.created, data };
}

/** Generate an email for org's admin when an user accepted/declined their invitation to attend one of their events */
export function invitationToEventFromOrgUpdated(
  toAdmin: UserEmailData,
  userSubject: UserEmailData,
  userOrg: OrgEmailData,
  event: EventEmailData,
  orgId: string,
  templateId: string
): EmailTemplateRequest {
  const data = {
    user: toAdmin,
    userSubject,
    org: userOrg,
    event,
    pageUrl: `${appUrl.market}/c/o/marketplace/organization/${orgId}/title`
  };
  return { to: toAdmin.email, templateId, data };
}

/** Generates an email for user requesting to attend an event. */
export function requestToAttendEventFromUser(
  toAdmin: UserEmailData,
  userSubject: UserEmailData,
  userOrg: OrgEmailData,
  event: EventEmailData,
  link: string,
  url: string = appUrl.market
): EmailTemplateRequest {
  const data = {
    user: toAdmin,
    userSubject,
    org: userOrg,
    event,
    pageUrl: `${url}/${link}`
  };
  return { to: toAdmin.email, templateId: templateIds.request.attendEvent.created, data };
}

/** Generate an email to inform users their request to attend an event has been sent */
export function requestToAttendEventFromUserSent(
  toUser: UserEmailData,
  event: EventEmailData,
  organizerOrg: OrgEmailData,
): EmailTemplateRequest {
  const data = {
    user: toUser,
    event,
    org: organizerOrg
  };
  return { to: toUser.email, templateId: templateIds.request.attendEvent.sent, data };
}

/** Generate an email to inform users that their request to attend an event was accepted */
export function requestToAttendEventFromUserAccepted(
  toUser: UserEmailData,
  organizerOrg: OrgEmailData,
  event: EventEmailData
): EmailTemplateRequest {
  const data = {
    user: toUser,
    org: organizerOrg,
    event,
  };
  return { to: toUser.email, templateId: templateIds.request.attendEvent.accepted, data };
}

/** Generate an email to inform users that their request to attend an event was refused */
export function requestToAttendEventFromUserRefused(
  toUser: UserEmailData,
  organizerOrg: OrgEmailData,
  event: EventEmailData,
  orgId: string
): EmailTemplateRequest {
  const data = {
    user: toUser,
    org: organizerOrg,
    event,
    pageUrl: `${appUrl.market}/c/o/marketplace/organization/${orgId}/title`
  };
  return { to: toUser.email, templateId: templateIds.request.attendEvent.declined, data };
}

/** Generate an email to remind users they have an event starting soon */
export function reminderEventToUser(
  toUser: UserEmailData,
  organizerOrg: OrgEmailData,
  event: EventEmailData,
  template: string
): EmailTemplateRequest {
  const data = {
    user: toUser,
    org: organizerOrg,
    event,
  };
  return { to: toUser.email, templateId: template, data };
}

/** Generate an email to seller mentioning a screening has been requested */
export function screeningRequestedToSeller(
  toUser: UserEmailData,
  buyer: UserEmailData,
  org: OrgEmailData,
  movie: MovieEmailData,
): EmailTemplateRequest {
  const data = {
    user: toUser,
    buyer,
    org,
    movie,
    pageUrl: `${appUrl.market}/c/o/dashboard/event/new/edit?titleId=${movie.id}&requestor=${encodeURIComponent(buyer.email)}`
  };
  return { to: toUser.email, templateId: templateIds.event.screeningRequested, data };
}

/** Generate an email to seller mentioning a screener has been requested */
export function screenerRequestedToSeller(
  toUser: UserEmailData,
  org: OrgEmailData,
  movie: MovieEmailData,
): EmailTemplateRequest {
  const data = {
    user: toUser,
    org,
    movie,
    pageUrl: `${appUrl.content}/c/o/dashboard/tunnel/movie/${movie.id}/media-screener`
  };
  return { to: toUser.email, templateId: templateIds.movie.screenerRequested, data };
}

/** Generate an email to inform users their screener request has been sent */
export function screenerRequestFromUserSent(
  toUser: UserEmailData,
  movie: MovieEmailData,
  orgNames: string,
): EmailTemplateRequest {
  const data = {
    user: toUser,
    movie,
    orgNames,
    pageUrl: `${appUrl.content}/c/o/marketplace/title/${movie.id}`
  };
  return { to: toUser.email, templateId: templateIds.movie.screenerRequestSent, data };
}

/** Generate an email when a movie is accepted */
export function movieAcceptedEmail(toUser: UserEmailData, movieTitle: string, movieUrl: string): EmailTemplateRequest {
  const data = { user: toUser, movieTitle, movieUrl };
  return { to: toUser.email, templateId: templateIds.movie.accepted, data };
}

export function movieAskingPriceRequested(
  toUser: UserEmailData,
  fromBuyer: UserEmailData,
  buyerOrg: OrgEmailData,
  movie: MovieEmailData,
  notificationData: Record<string, string>,
  app: App
): EmailTemplateRequest {
  const pageUrl = app === 'festival' ?
    `mailto:${fromBuyer.email}?subject=Interest in ${movie.title.international} via ${appName[app]}` :
    `mailto:${supportEmails[app]}?subject=Give a Price for ${movie.title.international}. Request by ${buyerOrg.activity} ${buyerOrg.country}`;

  const data = {
    user: toUser,
    buyer: fromBuyer,
    org: buyerOrg,
    movie,
    ...notificationData,
    pageUrl
  };
  const templateId = app === 'festival' ? templateIds.movie.askingPriceRequested : templateIds.movie.askingPriceRequestedEnhanced;
  return { to: toUser.email, templateId, data };
}

export function movieAskingPriceRequestSent(
  toUser: UserEmailData,
  movie: MovieEmailData,
  orgNames: string,
  notificationData: Record<string, string>,
  app: App
): EmailTemplateRequest {
  const data = {
    user: toUser,
    movie,
    orgNames,
    ...notificationData,
    pageUrl: `${appUrl.market}/c/o/marketplace/title/${movie.id}`
  };
  const templateId = app === 'festival' ? templateIds.movie.askingPriceRequestSent : templateIds.movie.askingPriceRequestSentEnhanced;
  return { to: toUser.email, templateId, data };
}

/** Inform user of org whose movie is being bought */
export function contractCreatedEmail(
  toUser: UserEmailData, title: Movie, contract: Contract,
  negotiation: Negotiation, buyerOrg: OrgEmailData
): EmailTemplateRequest {
  const pageUrl = `${appUrl.content}/c/o/dashboard/sales/${contract.id}/view`;
  const data = {
    user: toUser,
    app: { name: appName.catalog },
    movie: getMovieEmailData(title),
    contract,
    negotiation: getNegotiationEmailData(negotiation),
    pageUrl,
    buyerOrg,
  };
  return { to: toUser.email, templateId: templateIds.contract.created, data };
}

/**To inform buyer that his offer has been successfully created. */
export function buyerOfferCreatedConfirmationEmail(toUser: UserEmailData, org: OrgEmailData, offer: Offer, bucket: Bucket): EmailTemplateRequest {
  const mailBucket = getBucketEmailData(bucket);

  const pageUrl = `${appUrl.content}/c/o/marketplace/offer/${offer.id}`;
  const data = {
    app: { name: appName.catalog },
    bucket: mailBucket,
    user: toUser,
    pageUrl,
    baseUrl: appUrl.content,
    offer: getOfferEmailData(offer),
    org
  };
  return { to: toUser.email, templateId: templateIds.offer.toBuyer, data };
}

export function counterOfferRecipientEmail(
  toUser: UserEmailData, senderOrg: OrgEmailData, offerId: string,
  title: Movie, contractId: string, options: { isMailRecipientBuyer: boolean }
): EmailTemplateRequest {
  const pageUrl = options.isMailRecipientBuyer
    ? `${appUrl.content}/c/o/marketplace/offer/${offerId}/${contractId}`
    : `${appUrl.content}/c/o/dashboard/sales/${contractId}/view`;
  const data = {
    user: toUser,
    org: senderOrg,
    pageUrl,
    movie: getMovieEmailData(title),
    app: { name: appName.catalog }
  };
  return { to: toUser.email, templateId: templateIds.negotiation.receivedCounterOffer, data };
}

export function counterOfferSenderEmail(
  toUser: UserEmailData, org: OrgEmailData, offerId: string,
  negotiation: Negotiation, title: Movie, contractId: string, options: { isMailRecipientBuyer: boolean }
): EmailTemplateRequest {
  const pageUrl = options.isMailRecipientBuyer
    ? `${appUrl.content}/c/o/marketplace/offer/${offerId}/${contractId}`
    : `${appUrl.content}/c/o/dashboard/sales/${contractId}/view`;

  const data = {
    user: toUser,
    pageUrl,
    offerId,
    org,
    app: { name: appName.catalog },
    negotiation: getNegotiationEmailData(negotiation),
    movie: getMovieEmailData(title)
  };
  return { to: toUser.email, templateId: templateIds.negotiation.createdCounterOffer, data };
}

// #7946 this may be reactivated later
// Sent when all the contracts of an offer have either been accepted or declined.
// export function offerAcceptedOrDeclined(
//   user: UserEmailData, offer: Offer, contracts: ContractDocument[]
// ): EmailTemplateRequest {
//   const isOfferAccepted = offer.status === 'accepted';
//   const acceptedContracts = contracts.filter(contract => contract.status === 'accepted');
//   const pageUrl = `${appUrl.content}/c/o/marketplace/offer/${offer.id}`;
//   const data = {
//     contracts: isOfferAccepted ? acceptedContracts : contracts,
//     offer,
//     user,
//     pageUrl,
//     app: { name: appName.catalog }
//   };
//   // const templateId = isOfferAccepted ? templateIds.offer.allContractsAccepted : templateIds.offer.allContractsDeclined;
//   return { to: user.email, templateId, data };
// }

// export function offerUnderSignature(
//   user: UserEmailData, offerId: string, contract: ContractDocument, negotiation: ContractEmailData,
//   title: string
// ): EmailTemplateRequest {
//   const pageUrl = `${appUrl.content}/c/o/dashboard/sales/${contract.id}/view`;
//   const data = {
//     contract, offerId, user, negotiation,
//     title, pageUrl, app: { name: appName.catalog }
//   };
//   const templateId = templateIds.offer.underSignature;
//   return { to: user.email, templateId, data };
// }


// ------------------------- //
//      CASCADE8 ADMIN       //
// ------------------------- //

/**
 * @param orgId
 */
const organizationCreatedTemplate = (orgId: string) =>
  `
 To review it visit ${appUrl.crm}${ADMIN_ACCEPT_ORG_PATH}/${orgId}
 `;

/**
 * @param orgId
 */
const organizationRequestAccessToAppTemplate = (org: PublicOrganization, app: App, module: Module) =>
  `
  Organization '${org.name}' requested access to ${module} module of app ${appName[app]},

  Visit ${appUrl.crm}${ADMIN_ACCEPT_ORG_PATH}/${org.id} or go to ${ADMIN_ACCEPT_ORG_PATH}/${org.id} to enable it.
  `;


/**
 * @param user
 */
const userFirstConnexionTemplate = (user: PublicUser) =>
  `
  User ${user.firstName} ${user.lastName} connected for the first time to ${appName[user._meta.createdFrom]}.

  Email: ${user.email}.
  `;

/** Generates a transactional email request to let cascade8 admin know that a new org have been created. */
export function organizationCreated(org: Organization): EmailRequest {
  const supportEmail = getSupportEmail(org._meta.createdFrom);

  return {
    to: supportEmail,
    subject: `${appName[org._meta.createdFrom]} - ${org.name} was created and needs a review`,
    text: organizationCreatedTemplate(org.id)
  };
}

/**
 * Generates a transactional email request to let cascade8 admin know that a new org is waiting for app access.
 * It sends an email to admin to accept or reject the request
 */
export function organizationRequestedAccessToApp(org: Organization, app: App, module: Module): EmailRequest {
  return {
    to: getSupportEmail(org._meta.createdFrom),
    subject: 'An organization requested access to an app',
    text: organizationRequestAccessToAppTemplate(org, app, module)
  };
}

export function userFirstConnexion(user: PublicUser) {
  const supportEmail = getSupportEmail(user._meta.createdFrom);
  return {
    to: supportEmail,
    subject: 'New user connexion',
    text: userFirstConnexionTemplate(user)
  };
}

export function sendDemoRequestMail(information: RequestDemoInformations) {
  return {
    to: information.testEmailTo || getSupportEmail(information.app),
    subject: 'A demo has been requested',
    text: `A user wants to schedule a demo.

    User informations

    app: ${information.app}
    First name: ${information.firstName}
    Last name: ${information.lastName}
    Email: ${information.email}
    Phone number: ${information.phoneNumber}
    Company name: ${information.companyName}
    Role: ${information.role}`
  }
}

export function sendContactEmail(userName: string, userMail: string, subject: string, message: string, app: App): EmailRequest {
  return {
    to: getSupportEmail(app),
    subject: 'An user contacts Blockframes Admin',
    text: ` ${userName} (${userMail}) has sent an email.
    Subject of the mail : ${subject}
    Message from user :
    ${message}`
  }
}

/** Send an email to supportEmails.[app](catalog & MF only) when a movie is submitted*/
export function sendMovieSubmittedEmail(app: App, movie: Movie, org: Organization) {
  const orgName = org.name;

  return {
    to: getSupportEmail(app),
    subject: `${movie.title.international} was submitted by ${orgName}`,
    text: `
    The new movie ${movie.title.international} was submitted by ${orgName}.

    Visit ${appUrl.crm}${ADMIN_REVIEW_MOVIE_PATH}/${movie.id} or go to ${ADMIN_REVIEW_MOVIE_PATH}/${movie.id} to review it.

    `
  };
}

/** Send an email to supportEmails.[app] when a new event is created*/
export function eventCreatedAdminEmail(app: App, event: Event<EventMeta>) {
  return {
    to: getSupportEmail(app),
    subject: 'A new event has been created.',
    text: `
      A new ${event.type} has been created: ${event.title}.

      Visit ${appUrl.crm}${ADMIN_REVIEW_EVENT_PATH}/${event.id} or go to ${ADMIN_REVIEW_EVENT_PATH}/${event.id} to review it.
    `
  };
}

/** Inform Archipel Content admins a new offer has been created*/
export function adminOfferCreatedConfirmationEmail(toUser: UserEmailData, org: OrgEmailData, offerId: string) {
  const pageUrl = `${appUrl.crm}/c/o/dashboard/crm/offer/${offerId}/view`;
  return {
    to: getSupportEmail('catalog'),
    subject: `${org.name} created a new Offer.`,
    text: `
      Date: ${format(new Date(), 'dd MMM, yyyy')}
      Organization name: ${org.name}
      Buyer name: ${displayName(toUser)}
      Buyer email: ${toUser.email}
      To review it: ${pageUrl}
    `
  };
}

export function toAdminCounterOfferEmail(title: Movie, offerId: string) {
  const pageUrl = `${appUrl.crm}/c/o/dashboard/crm/offer/${offerId}/view`;
  return {
    to: getSupportEmail('catalog'),
    subject: 'Counter offer created',
    text: `The counter-offer for ${title.title.international} was successfully sent.
    To review it: ${pageUrl}`
  };
}

export function toAdminContractAccepted(title: Movie, pageUrl: string) {
  return {
    to: getSupportEmail('catalog'),
    subject: 'Contract accepted',
    text: `The contract for ${title.title.international} has been accepted.
    To review it: ${pageUrl}`
  };
}

export function toAdminContractDeclined(title: Movie, pageUrl: string) {
  return {
    to: getSupportEmail('catalog'),
    subject: 'Contract declined',
    text: `The contract for ${title.title.international} has been declined.
    To review it: ${pageUrl}`
  };
}

export function screenerRequested(title: Movie, buyerOrg: Organization, sellerOrgs: Organization[]) {
  const orgNames = sellerOrgs.map(org => `${org.name} (${org.addresses.main.country})`).join(', ');
  return {
    to: getSupportEmail('catalog'),
    subject: 'New screener request',
    text: `Organization(s) ${orgNames} received a screener request from ${buyerOrg.name} (${buyerOrg.activity}-${buyerOrg.addresses.main.country}) to watch the screener for Title ${title.title.international}.`
  };
}

export function askingPriceRequested(title: Movie, buyerOrg: Organization, sellerOrgs: Organization[], data: RequestAskingPriceData) {
  const orgNames = sellerOrgs.map(org => `${org.name} (${org.addresses.main.country})`).join(', ');
  return {
    to: getSupportEmail('catalog'),
    subject: 'New asking price request',
    text: `
      Organization(s) ${orgNames} received an asking price request from ${buyerOrg.name} (${buyerOrg.activity}-${buyerOrg.addresses.main.country}) for Title ${title.title.international}.

      Territories: ${data.territories}
      ${data.medias ? 'Medias: ' + data.medias : ''}
      ${data.exclusive ? 'Exclusive: ' + data.exclusive : ''}
      ${data.message ? 'Message: ' + data.message : ''}
    `
  };
}

export function invitationToJoinWaterfall(
  toUser: UserEmailData,
  org: OrgEmailData,
  waterfall: WaterfallEmailData,
  link: string,
  url: string = appUrl.waterfall,
): EmailTemplateRequest {
  const data = {
    user: toUser,
    org,
    waterfall,
    pageUrl: `${url}/${link}`,
  };
  return { to: toUser.email, templateId: templateIds.invitation.joinWaterfall.created, data };
}

/** Generate an email for org's admin when an user accepted/declined their invitation to join a waterfall */
export function invitationToJoinWaterfallUpdated(
  toAdmin: UserEmailData,
  userSubject: UserEmailData,
  userOrg: OrgEmailData,
  waterfall: WaterfallEmailData,
  orgId: string,
  templateId: string
): EmailTemplateRequest {
  const data = {
    user: toAdmin,
    userSubject,
    org: userOrg,
    waterfall,
    pageUrl: `${appUrl.waterfall}/c/o/dashboard/title/${orgId}`
  };
  return { to: toAdmin.email, templateId, data };
}