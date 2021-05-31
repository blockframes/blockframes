/**
 * Templates for transactional emails we send to user and to cascade8 admins.
 * Look at the notion page to know objects relative to emails
 * https://www.notion.so/cascade8/Email-Data-Object-8ed9d64e8cd4490ea7bc0e469c04043e
 */
import { supportEmails, appUrl } from '../environments/environment';
import { EmailRequest, EmailTemplateRequest } from '../internals/email';
import { templateIds } from './ids';
import { RequestToJoinOrganization, RequestDemoInformations, OrganizationDocument, PublicOrganization } from '../data/types';
import { PublicUser, User } from '@blockframes/user/+state/user.firestore';
import { EventEmailData, OrgEmailData, UserEmailData } from '@blockframes/utils/emails/utils';
import { App, appName } from '@blockframes/utils/apps';
import { Bucket } from '@blockframes/contract/bucket/+state/bucket.model';
import { format } from "date-fns";

const ORG_HOME = '/c/o/organization/';
const USER_CREDENTIAL_INVITATION = '/auth/identity';
export const ADMIN_ACCEPT_ORG_PATH = '/c/o/admin/panel/organization';
export const ADMIN_DATA_PATH = '/admin/data'; // backup / restore // TODO: ! Why is this here? Move elsewhere into env

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

export function userVerifyEmail(email: string, userFirstName: string, link: string): EmailTemplateRequest {
  const data = {
    userFirstName,
    pageURL: link
  };
  return { to: email, templateId: templateIds.user.verifyEmail, data };
}

export function accountCreationEmail(email: string, link: string, userFirstName?: string): EmailTemplateRequest {
  const data = {
    pageURL: link,
    userFirstName
  };
  return { to: email, templateId: templateIds.user.welcomeMessage, data };
}

export function userResetPassword(email: string, link: string): EmailTemplateRequest {
  const data = {
    pageURL: link
  };
  return { to: email, templateId: templateIds.user.resetPassword, data };
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
  user: UserEmailData,
  org: OrgEmailData,
  pageURL: string = appUrl.market,
  templateId: string = templateIds.user.credentials.joinOrganization,
  event?: EventEmailData
): EmailTemplateRequest {
  const data = {
    user,
    org,
    pageURL: `${pageURL}${USER_CREDENTIAL_INVITATION}?code=${encodeURIComponent(user.password)}&email=${encodeURIComponent(user.email)}`,
    event: event,
  };
  return { to: user.email, templateId, data };
}

/** Generates a transactional email request to let organization admins know that their org was approved. */
export function organizationWasAccepted(email: string, user?: UserEmailData, url: string = appUrl.market): EmailTemplateRequest {
  const data = {
    user,
    pageURL: `${url}/c/o`
  };
  return { to: email, templateId: templateIds.test, data };
}

/** Generates a transactional email to let user knows its request has been sent */
export function userJoinOrgPendingRequest(user: UserEmailData, org: OrgEmailData): EmailTemplateRequest {
  const data = {
    user,
    org
  };
  return { to: user.email, templateId: templateIds.request.joinOrganization.pending, data };
}

/** Email to let org admin knows that his/her organization has access to a new app */
export function organizationAppAccessChanged(admin: UserEmailData, url: string, app: App): EmailTemplateRequest {
  const data = {
    user: admin,
    url,
    app
  }
  return { to: admin.email, templateId: templateIds.org.appAccessChanged, data };
}

/** Send email to an user to inform him that he joined an org */
export function userJoinedAnOrganization(user: UserEmailData, url: string = appUrl.market, org: OrgEmailData, ): EmailTemplateRequest {
  const data = {
    pageURL: `${url}/c/o`,
    user,
    org
  };
  return { to: user.email, templateId: templateIds.request.joinOrganization.accepted, data };
}

/** Send email to all membersof an org to inform them that a new user has joined their org */
export function userJoinedYourOrganization(
  user: UserEmailData,
  org: OrgEmailData,
  memberAdded: PublicUser):
EmailTemplateRequest {
  const data = {
    user,
    org,
    memberAddedFirstName: memberAdded.firstName,
    memberAddedLastName: memberAdded.lastName,
    memberAddedEmail: memberAdded.email
  };
  return { to: user.email, templateId: templateIds.org.memberAdded, data };
}

/** Send email to org admins to inform them that an user declined their invitation to join his org */
export function invitationToJoinOrgDeclined(admin: UserEmailData, user: PublicUser): EmailTemplateRequest {
  const data = {
    user: admin,
    userFirstName: user.firstName,
    userLastName: user.lastName,
    userEmail: user.email
  };
  return { to: admin.email, templateId: templateIds.invitation.organization.declined, data };
}

/** Send email to users to inform them that organization has declined their request to join it */
export function requestToJoinOrgDeclined(user: UserEmailData, org: OrgEmailData): EmailTemplateRequest {
  const data = {
    user,
    org
  };
  return { to: user.email, templateId: templateIds.request.joinOrganization.declined, data };
}

/** Send email to org admin to inform him that an user has left his org */
export function userLeftYourOrganization (admin: UserEmailData, userRemoved: PublicUser, org: OrgEmailData): EmailTemplateRequest {
  const data = {
    user: admin,
    userFirstName: userRemoved.firstName,
    userLastName: userRemoved.lastName,
    userEmail: userRemoved.email,
    org,
    pageURL: `${ORG_HOME}${org.id}/view/members`
  };
  return { to: admin.email, templateId: templateIds.org.memberRemoved, data };
}

// TODO #5186 this one needs a small refactoring. It will be done mainly with the user email object creation.
/** Generates a transactional email to let an admin knows that an user requested to join his/her org */
export function userRequestedToJoinYourOrg(request: RequestToJoinOrganization, admin: UserEmailData, org: OrgEmailData, url: string = appUrl.market): EmailTemplateRequest {
  const data = {
    user: admin,
    userFirstName: request.userFirstname,
    userLastName: request.userLastname,
    org,
    pageURL: `${url}${ORG_HOME}${request.organizationId}/view/members`
  };
  return { to: admin.email, templateId: templateIds.request.joinOrganization.created, data };
}

/** Generates an email for user invited by an organization to an event. */
export function invitationToEventFromOrg(
  user: UserEmailData,
  org: OrgEmailData,
  event: EventEmailData,
  link: string,
  url: string = appUrl.market,
): EmailTemplateRequest {
  const data = {
    user,
    org,
    event,
    pageURL: `${url}/${link}`,
  };
  return { to: user.email, templateId: templateIds.invitation.attendEvent.created, data };
}

/** Generate an email for org's admin when an user accepted/declined their invitation to attend one of their events */
export function invitationToEventFromOrgUpdated(
  admin: UserEmailData,
  user: User,
  userOrg: OrgEmailData,
  event: EventEmailData,
  orgId: string,
  templateId: string
): EmailTemplateRequest {
  const data = {
    user: admin,
    userFirstName: user.firstName,
    userLastName: user.lastName,
    userOrg,
    event,
    eventUrl: `${appUrl.market}/c/o/dashboard/event/${event.id}`,
    pageUrl: `${appUrl.market}/c/o/marketplace/organization/${orgId}}/title`
  };
  return { to: admin.email, templateId, data };
}

/** Generates an email for user requesting to attend an event. */
export function requestToAttendEventFromUser(
  fromUserFirstname: string,
  userOrg: OrgEmailData,
  admin: UserEmailData,
  event: EventEmailData,
  link: string,
  url: string = appUrl.market
): EmailTemplateRequest {
  const data = {
    user: admin,
    userFirstName: fromUserFirstname,
    org: userOrg,
    event,
    pageURL: `${url}/${link}`
  };
  return { to: admin.email, templateId: templateIds.request.attendEvent.created, data };
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

/** Generate an email when a movie is accepted */
export function movieAcceptedEmail(toUser: UserEmailData, movieTitle: string, movieUrl: string): EmailTemplateRequest {
  const data = { user: toUser, movieTitle, movieUrl };
  return { to: toUser.email, templateId: templateIds.movie.accepted, data };
}

/** ???? */
export function offerCreatedConfirmationEmail(org: OrganizationDocument, bucket: Bucket, user: User): EmailTemplateRequest {
  const date = format(new Date(), 'dd MMMM, yyyy');
  const data = { org, bucket, user, baseUrl: appUrl.content, date };
  return { to: user.email, templateId: templateIds.offer.created, data };
}

// ------------------------- //
//      CASCADE8 ADMIN       //
// ------------------------- //

/**
 * @param orgId
 */
const organizationCreatedTemplate = (orgId: string) =>
  `
  A new organization was created on the blockframes project,

  Visit ${appUrl.crm}${ADMIN_ACCEPT_ORG_PATH}/${orgId} or go to ${ADMIN_ACCEPT_ORG_PATH}/${orgId} to view it.
  `;

/**
 * @param orgId
 */
const organizationRequestAccessToAppTemplate = (org: PublicOrganization, app: App) =>
  `
  Organization '${org.denomination.full}' requested access to ${appName[app]},

  Visit ${appUrl.crm}${ADMIN_ACCEPT_ORG_PATH}/${org.id} or go to ${ADMIN_ACCEPT_ORG_PATH}/${org.id} to enable it.
  `;


/**
 * @param user
 */
const userFirstConnexionTemplate = (user: PublicUser) =>
  `
  User ${user.firstName} ${user.lastName} connected for the first time to the app ${user._meta.createdFrom}.

  Email: ${user.email}.
  `;

/** Generates a transactional email request to let cascade8 admin know that a new org have been created. */
export async function organizationCreated(org: OrganizationDocument): Promise<EmailRequest> {
  return {
    to: getSupportEmail(org._meta.createdFrom),
    subject: 'A new organization has been created',
    text: organizationCreatedTemplate(org.id)
  };
}

/**
 * Generates a transactional email request to let cascade8 admin know that a new org is waiting for app access.
 * It sends an email to admin to accept or reject the request
 */
export async function organizationRequestedAccessToApp(org: OrganizationDocument, app: App): Promise<EmailRequest> {
  return {
    to: getSupportEmail(org._meta.createdFrom),
    subject: 'An organization requested access to an app',
    text: organizationRequestAccessToAppTemplate(org, app)
  };
}

export async function userFirstConnexion(user: PublicUser): Promise<EmailRequest> {
  return {
    to: getSupportEmail(user._meta.createdFrom),
    subject: 'New user connexion',
    text: userFirstConnexionTemplate(user)
  };
}

export function sendDemoRequestMail(information: RequestDemoInformations) {
  return {
    to: getSupportEmail(information.app),
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
