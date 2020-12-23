/**
 * Templates for transactional emails we send to user and to cascade8 admins.
 */
import { supportEmails, appUrl } from '../environments/environment';
import { EmailRequest, EmailTemplateRequest } from '../internals/email';
import { templateIds } from './ids';
import { RequestToJoinOrganization, RequestDemoInformations, OrganizationDocument } from '../data/types';
import { PublicUser } from '@blockframes/user/+state/user.firestore';
import { EmailRecipient, EventEmailData } from '@blockframes/utils/emails/utils';
import { App } from '@blockframes/utils/apps';

const ORG_HOME = '/c/o/organization/';
const USER_CREDENTIAL_INVITATION = '/auth/connexion#login';
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

// @TODO (#2821)
/*
export function userVerifyEmail(email: string, link: string): EmailTemplateRequest {
  const data = {
    pageURL: link
  };
  return { to: email, templateId: templateIds.user.verifyEmail, data };
}
*/

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
  email: string,
  password: string,
  orgName: string,
  pageURL: string = appUrl.market,
  templateId: string = templateIds.user.credentials.joinOrganization.festival,
  eventData?: EventEmailData
): EmailTemplateRequest {
  const data = {
    userEmail: email,
    userPassword: password,
    orgName,
    eventName: eventData.title || '',
    eventStartDate: eventData.start || '',
    eventEndDate: eventData.end || '',
    pageURL: `${pageURL}${USER_CREDENTIAL_INVITATION}`,
    sessionURL: eventData.id ? `${pageURL}/c/o/marketplace/event/${eventData.id}` : ''
  };
  return { to: email, templateId, data };
}

/** Generates a transactional email request to let organization admins know that their org was approved. */
export function organizationWasAccepted(email: string, userFirstName?: string, url: string = appUrl.market): EmailTemplateRequest {
  const data = {
    userFirstName,
    pageURL: `${url}/c/o`
  };
  return { to: email, templateId: templateIds.org.accepted, data };
}

export function userJoinOrgPendingRequest(email: string, orgName: string, userFirstName: string): EmailTemplateRequest {
  const data = {
    userFirstName,
    orgName
  };
  return { to: email, templateId: templateIds.request.joinOrganization.pending, data };
}

/** Email to let org admin knows that his/her organization has access to a new app */
export function organizationAppAccessChanged(admin: PublicUser, url: string): EmailTemplateRequest {
  const data = {
    adminFirstName: admin.firstName,
    url
  }
  return { to: admin.email, templateId: templateIds.org.appAccessChanged, data };
}

/** Send email to a user to inform him that he joined an org */
export function userJoinedAnOrganization(userEmail: string, url: string = appUrl.market, orgName: string, userFirstName: string): EmailTemplateRequest {
  const data = {
    pageURL: `${url}/c/o`,
    userFirstName,
    orgName
  };
  return { to: userEmail, templateId: templateIds.request.joinOrganization.accepted, data };
}

/** Send email to org admin to inform him that a new user has joined his org */
export function userJoinedYourOrganization(
  orgAdminEmail: string,
  adminFirstName: string,
  orgDenomination: string,
  userFirstName: string,
  userLastName: string,
  userEmail: string):
EmailTemplateRequest {
  const data = {
    adminFirstName,
    orgDenomination,
    userFirstName,
    userLastName,
    userEmail
  };
  return { to: orgAdminEmail, templateId: templateIds.org.memberAdded, data };
}

/** Generates a transactional email to let an admin knows that an user requested to join his/her org */
export function userRequestedToJoinYourOrg(request: RequestToJoinOrganization, url: string = appUrl.market): EmailTemplateRequest {
  const data = {
    adminFirstName: request.adminName,
    userFirstName: request.userFirstname,
    userLastName: request.userLastname,
    orgName: request.organizationName,
    pageURL: `${url}${ORG_HOME}${request.organizationId}/view/members`
  };
  return { to: request.adminEmail, templateId: templateIds.request.joinOrganization.created, data };
}

/** Generates an email for user invited by an organization to an event. */
export function invitationToEventFromOrg(
  recipient: EmailRecipient,
  orgDenomination: string,
  eventData: EventEmailData,
  link: string,
  url: string = appUrl.market,
): EmailTemplateRequest {
  const data = {
    userFirstName: recipient.name,
    orgName: orgDenomination,
    eventName: eventData.title,
    pageURL: `${url}/${link}`,
    sessionURL: `${url}/c/o/marketplace/event/${eventData.id}`,
    eventStartDate: eventData.start,
    eventEndDate: eventData.end
  };
  return { to: recipient.email, templateId: templateIds.invitation.attendEvent.created, data };
}

/** Generates an email for user requesting to attend an event. */
export function requestToAttendEventFromUser(
  fromUserFirstname: string,
  fromUserOrgName: string,
  recipient: EmailRecipient,
  eventTitle: string,
  link: string,
  url: string = appUrl.market
): EmailTemplateRequest {
  const data = {
    adminFirstName: recipient.name,
    userFirstName: fromUserFirstname,
    orgName: fromUserOrgName,
    eventName: eventTitle,
    pageURL: `${url}/${link}`
  };
  return { to: recipient.email, templateId: templateIds.request.attendEvent.created, data };
}

/** Generate an email to inform users that their request to attend an event was accepted */
export function requestToAttendEventFromUserAccepted(
  toUser: PublicUser,
  organizerOrgName: string,
  eventName: string,
  eventStartDate: string,
  eventEndDate: string
): EmailTemplateRequest {
  const data = {
    userFirstName: toUser.firstName,
    userLastName: toUser.lastName,
    organizerOrgName,
    eventName,
    eventStartDate,
    eventEndDate,
  };
  return { to: toUser.email, templateId: templateIds.request.attendEvent.accepted, data };
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
const organizationRequestAccessToAppTemplate = (orgId: string) =>
  `
  An organization requested access to an app,

  Visit ${appUrl.crm}${ADMIN_ACCEPT_ORG_PATH}/${orgId} or go to ${ADMIN_ACCEPT_ORG_PATH}/${orgId} to enable it.
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
export async function organizationRequestedAccessToApp(org: OrganizationDocument): Promise<EmailRequest> {
  return {
    to: getSupportEmail(org._meta.createdFrom),
    subject: 'An organization requested access to an app',
    text: organizationRequestAccessToAppTemplate(org.id)
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
    text: `A user wants to schedule a demo of Archipel Content.

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
