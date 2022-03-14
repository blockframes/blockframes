/**
 * Templates for transactional emails we send to user and to cascade8 admins.
 * Look at the notion page to know objects relative to emails
 * https://www.notion.so/cascade8/Email-Data-Object-8ed9d64e8cd4490ea7bc0e469c04043e
 */
import { supportEmails, appUrl, e2eMode } from '../environments/environment';
import { EmailRequest, EmailTemplateRequest } from '../internals/email';
import { templateIds } from '@blockframes/utils/emails/ids';
import { RequestDemoInformations } from '../data/types';
import { PublicUser, OrganizationDocument, PublicOrganization, MovieDocument, createMailContract, Bucket } from '@blockframes/model';
import type { ContractDocument } from '@blockframes/model';
import { EventEmailData, OrgEmailData, UserEmailData, getMovieEmailData, getOfferEmailData } from '@blockframes/utils/emails/utils';
import { App, appName, Module } from '@blockframes/utils/apps';
import { format } from "date-fns";
import { testEmail } from "@blockframes/e2e/utils/env";
import { Offer } from '@blockframes/contract/offer/+state';
import { NegotiationDocument } from '@blockframes/contract/negotiation/+state/negotiation.firestore';
import { staticModel } from '@blockframes/utils/static-model';
import { Timestamp } from '../data/internals';
import { createMailTerm } from '@blockframes/contract/term/+state/term.firestore';
import { displayName } from '@blockframes/utils/utils';

const ORG_HOME = '/c/o/organization/';
const USER_CREDENTIAL_INVITATION = '/auth/identity';
const ADMIN_ACCEPT_ORG_PATH = '/c/o/dashboard/crm/organization';
const ADMIN_REVIEW_MOVIE_PATH = '/c/o/dashboard/crm/movie';

/**
 * This method return the "support" email that should be used regarding the originating app
 * @param app
 */
function getSupportEmail(app?: App) {
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
    pageURL: link
  };
  return { to: email, templateId: templateIds.user.verifyEmail, data };
}

export function accountCreationEmail(email: string, link: string, user: UserEmailData): EmailTemplateRequest {
  const data = {
    pageURL: link,
    user
  };
  return { to: email, templateId: templateIds.user.welcomeMessage, data };
}

export function userResetPassword(email: string, link: string, app: App): EmailTemplateRequest {
  const data = {
    pageURL: link
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
 * @param pageURL
 * @param templateId
 */
export function userInvite(
  toUser: UserEmailData,
  org: OrgEmailData,
  pageURL: string = appUrl.market,
  templateId: string = templateIds.user.credentials.joinOrganization,
  event?: EventEmailData
): EmailTemplateRequest {
  const data = {
    user: toUser,
    org,
    pageURL: `${pageURL}${USER_CREDENTIAL_INVITATION}?code=${encodeURIComponent(toUser.password)}&email=${encodeURIComponent(toUser.email)}`,
    event,
  };
  return { to: toUser.email, templateId, data };
}

/** Generates a transactional email request to let organization admins know that their org was approved. */
export function organizationWasAccepted(toUser: UserEmailData, url: string = appUrl.market): EmailTemplateRequest {
  const data = {
    user: toUser,
    pageURL: `${url}/c/o`
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
    pageURL: `${url}/c/o`,
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

/** Send email to org admins to inform them that an user declined their invitation to join his org */
export function invitationToJoinOrgDeclined(toAdmin: UserEmailData, userSubject: UserEmailData): EmailTemplateRequest {
  const data = {
    user: toAdmin,
    userSubject,
  };
  return { to: toAdmin.email, templateId: templateIds.invitation.organization.declined, data };
}

/** Send email to users to inform them that organization has declined their request to join it */
export function requestToJoinOrgDeclined(toUser: UserEmailData, org: OrgEmailData): EmailTemplateRequest {
  const data = {
    user: toUser,
    org
  };
  return { to: toUser.email, templateId: templateIds.request.joinOrganization.declined, data };
}

/** Send email to org admin to inform him that an user has left his org */
export function userLeftYourOrganization(toAdmin: UserEmailData, userSubject: UserEmailData, org: OrgEmailData): EmailTemplateRequest {
  const data = {
    user: toAdmin,
    userSubject,
    org,
    pageURL: `${ORG_HOME}${org.id}/view/members`
  };
  return { to: toAdmin.email, templateId: templateIds.org.memberRemoved, data };
}

/** Generates a transactional email to let an admin knows that an user requested to join his/her org */
export function userRequestedToJoinYourOrg(toAdmin: UserEmailData, userSubject: UserEmailData, org: OrgEmailData, url: string = appUrl.market): EmailTemplateRequest {
  const data = {
    user: toAdmin,
    userSubject,
    org,
    pageURL: `${url}${ORG_HOME}${org.id}/view/members`
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
    pageURL: `${url}/${link}`,
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
    eventUrl: `${appUrl.market}/c/o/dashboard/event/${event.id}`,
    pageUrl: `${appUrl.market}/c/o/marketplace/organization/${orgId}}/title`
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
    pageURL: `${url}/${link}`
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
  buyer: PublicUser,
  movie: MovieDocument,
): EmailTemplateRequest {
  const data = {
    user: toUser,
    buyer,
    movie,
    pageURL: `${appUrl.market}/c/o/dashboard/event/new/edit?titleId=${movie.id}`
  };
  return { to: toUser.email, templateId: templateIds.event.screeningRequested, data };
}

/** Generate an email when a movie is accepted */
export function movieAcceptedEmail(toUser: UserEmailData, movieTitle: string, movieUrl: string): EmailTemplateRequest {
  const data = { user: toUser, movieTitle, movieUrl };
  return { to: toUser.email, templateId: templateIds.movie.accepted, data };
}

export function movieAskingPriceRequested(toUser: UserEmailData, fromBuyer: UserEmailData, movieTitle: string, territories: string, message: string): EmailTemplateRequest {
  const data = {
    user: toUser,
    buyer: displayName(fromBuyer),
    movieTitle,
    territories,
    message,
    pageURL: `mailto:${fromBuyer.email}?subject=Interest in ${movieTitle} via Archipel Market`
  };
  return { to: toUser.email, templateId: templateIds.movie.askingPriceRequested, data };
}

export function movieAskingPriceRequestSent(toUser: UserEmailData, movie: MovieDocument, orgNames: string, territories: string, message: string): EmailTemplateRequest {
  const data = {
    user: toUser,
    movieTitle: movie.title.international,
    orgNames,
    territories,
    message,
    pageURL: `${appUrl.market}/c/o/marketplace/title/${movie.id}`
  }

  return { to: toUser.email, templateId: templateIds.movie.askingPriceRequestSent, data };
}

/** Inform user of org whose movie is being bought */
export function contractCreatedEmail(
  toUser: UserEmailData, title: MovieDocument, contract: ContractDocument,
  negotiation: NegotiationDocument, buyerOrg: OrganizationDocument
): EmailTemplateRequest {
  const pageURL = `${appUrl.content}/c/o/dashboard/sales/${contract.id}/view`;
  const data = {
    user: toUser,
    app: { name: appName.catalog },
    movie: getMovieEmailData(title),
    contract,
    negotiation,
    pageURL,
    buyerOrg,
  };
  return { to: toUser.email, templateId: templateIds.contract.created, data };
}

/** Template for admins. It is to inform admins of Archipel Content a new offer has been created with titles, prices, etc in the template */
export function adminOfferCreatedConfirmationEmail(toUser: UserEmailData, org: OrganizationDocument, bucket: Bucket<Timestamp>): EmailTemplateRequest {
  const date = format(new Date(), 'dd MMM, yyyy');
  const contracts = bucket.contracts.map(contract => createMailContract(contract));
  const data = { org, bucket: { ...bucket, contracts }, user: toUser, baseUrl: appUrl.content, date };
  return { to: toUser.email, templateId: templateIds.offer.toAdmin, data };
}

/**To inform buyer that his offer has been successfully created. */
export function buyerOfferCreatedConfirmationEmail(toUser: UserEmailData, org: OrganizationDocument, offer: Offer, bucket: Bucket<Timestamp>): EmailTemplateRequest {
  const contracts = bucket.contracts.map(contract => createMailContract(contract));
  const pageURL = `${appUrl.content}/c/o/marketplace/offer/${offer.id}`;
  const data = {
    app: { name: appName.catalog },
    bucket: { ...bucket, contracts },
    user: toUser,
    pageURL,
    offer: getOfferEmailData(offer),
    org
  };
  return { to: toUser.email, templateId: templateIds.offer.toBuyer, data };
}

export function counterOfferRecipientEmail(
  toUser: UserEmailData, senderOrg: OrganizationDocument, offerId: string,
  title: MovieDocument, contractId: string, options: { isMailRecipientBuyer: boolean }
): EmailTemplateRequest {
  const pageURL = options.isMailRecipientBuyer
    ? `${appUrl.content}/c/o/marketplace/offer/${offerId}/${contractId}`
    : `${appUrl.content}/c/o/dashboard/sales/${contractId}/view`;
  const data = {
    user: toUser,
    org: senderOrg,
    pageURL,
    movie: getMovieEmailData(title),
    app: { name: appName.catalog }
  };
  return { to: toUser.email, templateId: templateIds.negotiation.receivedCounterOffer, data };
}

export function counterOfferSenderEmail(
  toUser: UserEmailData, org: OrganizationDocument, offerId: string,
  negotiation: NegotiationDocument, title: MovieDocument, contractId: string, options: { isMailRecipientBuyer: boolean }
): EmailTemplateRequest {
  const terms = createMailTerm(negotiation.terms);
  const currency = staticModel['movieCurrencies'][negotiation.currency];
  const pageURL = options.isMailRecipientBuyer
    ? `${appUrl.content}/c/o/marketplace/offer/${offerId}/${contractId}`
    : `${appUrl.content}/c/o/dashboard/sales/${contractId}/view`;

  const data = {
    user: toUser,
    pageURL,
    offerId,
    org,
    contractId,
    app: { name: appName.catalog },
    negotiation: { ...negotiation, terms, currency },
    movie: getMovieEmailData(title)
  };
  return { to: toUser.email, templateId: templateIds.negotiation.createdCounterOffer, data };
}

export function toAdminCounterOfferEmail(title: MovieDocument): EmailTemplateRequest {
  const data = {
    movie: getMovieEmailData(title)
  };
  return { to: supportEmails.catalog, templateId: templateIds.negotiation.toAdminCounterOffer, data };
}

// #7946 this may be reactivated later
// Sent when all the contracts of an offer have either been accepted or declined.
// export function offerAcceptedOrDeclined(
//   user: UserEmailData, offer: Offer, contracts: ContractDocument[]
// ): EmailTemplateRequest {
//   const isOfferAccepted = offer.status === 'accepted';
//   const acceptedContracts = contracts.filter(contract => contract.status === 'accepted');
//   const pageURL = `${appUrl.content}/c/o/marketplace/offer/${offer.id}`;
//   const data = {
//     contracts: isOfferAccepted ? acceptedContracts : contracts,
//     offer,
//     user,
//     pageURL,
//     app: { name: appName.catalog }
//   };
//   // const templateId = isOfferAccepted ? templateIds.offer.allContractsAccepted : templateIds.offer.allContractsDeclined;
//   return { to: user.email, templateId, data };
// }

// export function offerUnderSignature(
//   user: UserEmailData, offerId: string, contract: ContractDocument, negotiation: MailContract,
//   title: string
// ): EmailTemplateRequest {
//   const pageURL = `${appUrl.content}/c/o/dashboard/sales/${contract.id}/view`;
//   const data = {
//     contract, offerId, user, negotiation,
//     title, pageURL, app: { name: appName.catalog }
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
  Organization '${org.denomination.full}' requested access to ${module} module of app ${appName[app]},

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
export function organizationCreated(org: OrganizationDocument): EmailRequest {
  const supportEmail = getSupportEmail(org._meta.createdFrom);

  return {
    to: supportEmail,
    subject: `${appName[org._meta.createdFrom]} - ${org.denomination.full} was created and needs a review`,
    text: organizationCreatedTemplate(org.id)
  };
}

/**
 * Generates a transactional email request to let cascade8 admin know that a new org is waiting for app access.
 * It sends an email to admin to accept or reject the request
 */
export function organizationRequestedAccessToApp(org: OrganizationDocument, app: App, module: Module): EmailRequest {
  return {
    to: getSupportEmail(org._meta.createdFrom),
    subject: 'An organization requested access to an app',
    text: organizationRequestAccessToAppTemplate(org, app, module)
  };
}

export function userFirstConnexion(user: PublicUser): EmailRequest {
  const supportEmail = e2eMode ? testEmail : getSupportEmail(user._meta.createdFrom);
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
export function sendMovieSubmittedEmail(app: App, movie: MovieDocument) {
  return {
    to: getSupportEmail(app),
    subject: 'A movie has been submitted.',
    text: `
    The new movie ${movie.title.international} has been submitted.

    Visit ${appUrl.crm}${ADMIN_REVIEW_MOVIE_PATH}/${movie.id} or go to ${ADMIN_REVIEW_MOVIE_PATH}/${movie.id} to review it.

    `
  };
}
