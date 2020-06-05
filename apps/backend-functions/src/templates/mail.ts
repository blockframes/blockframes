/**
 * Templates for transactional emails we send to user and to cascade8 admins.
 */
import { adminEmail, appUrlContent } from '../environments/environment';
import { EmailRequest, EmailTemplateRequest } from '../internals/email';
import { templateIds } from '@env';
import { RequestToJoinOrganization, RequestDemoInformations, OrganizationDocument } from '../data/types';
import { PublicUser } from '@blockframes/user/+state/user.firestore';
import { getAppUrl } from '../data/internals';
import { EmailRecipient } from '@blockframes/utils/emails';

const ORG_HOME = '/c/o/organization/';
const USER_CREDENTIAL_INVITATION = '/auth/connexion#login';
export const ADMIN_ACCEPT_ORG_PATH = '/c/o/admin/panel/organization';
export const ADMIN_DATA_PATH = '/admin/data'; // backup / restore

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
export function userInvite(email: string, password: string, orgName: string, pageURL: string = appUrlContent, templateId: string = templateIds.user.credentials.joinOrganization.catalog): EmailTemplateRequest {
  const data = {
    userEmail: email,
    userPassword: password,
    orgName,
    pageURL: `${pageURL}${USER_CREDENTIAL_INVITATION}`
  };
  return { to: email, templateId, data };
}

/** Generates a transactional email request to let organization admins know that their org was approved. */
export function organizationWasAccepted(email: string, userFirstName?: string, appUrl: string = appUrlContent): EmailTemplateRequest {
  const data = {
    userFirstName,
    pageURL: `${appUrl}/c/o`
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

export function organizationAppAccessChanged(admin: PublicUser, appLabel: string, appUrl: string): EmailTemplateRequest {
  const data = {
    adminFirstName: admin.firstName,
    appName: appLabel,
    appUrl
  }
  return { to: admin.email, templateId: templateIds.org.appAccessChanged, data };
}

/** Send email to a user to inform him that he joined an org */
export function userJoinedAnOrganization(userEmail: string, appUrl: string = appUrlContent): EmailTemplateRequest {
  const data = {
    pageURL: `${appUrl}/c/o`
  };
  return { to: userEmail, templateId: templateIds.request.joinOrganization.accepted, data };
}

/** Send email to org admin to inform him that a new user has joined his org */
export function userJoinedYourOrganization(orgAdminEmail: string, userEmail: string): EmailTemplateRequest {
  const data = {
    userEmail
  };
  return { to: orgAdminEmail, templateId: templateIds.org.memberAdded, data };
}

/** Generates a transactional email to let an admin knows that an user requested to join his/her org */
export function userRequestedToJoinYourOrg(request: RequestToJoinOrganization, appUrl: string = appUrlContent): EmailTemplateRequest { // TODO
  const data = {
    adminFirstName: request.adminName,
    userFirstName: request.userFirstname,
    userLastName: request.userLastname,
    orgName: request.organizationName,
    pageURL: `${appUrl}${ORG_HOME}${request.organizationId}/view/members`
  };
  return { to: request.adminEmail, templateId: templateIds.request.joinOrganization.created, data };
}

/** Generates an email for user invited by an organization to an event. */
export function invitationToEventFromOrg(recipient: EmailRecipient, orgDenomination: string, appLabel: string, eventId: string, link: string, appUrl: string = appUrlContent): EmailTemplateRequest {
  const data = {
    userFirstName: recipient.name,
    orgName: orgDenomination,
    appName: appLabel,
    eventName: eventId,
    pageURL: `${appUrl}/${link}`
  };
  return { to: recipient.email, templateId: templateIds.invitation.attendEvent.created, data };
}

/** Generates an email for user requesting to attend an event. */
export function requestToAttendEventFromUser(fromUserFirstname: string, fromUserOrgName: string, appLabel: string, recipient: EmailRecipient, eventTitle: string, link: string, appUrl: string = appUrlContent): EmailTemplateRequest {
  const data = {
    adminFirstName: recipient.name,
    userFirstName: fromUserFirstname,
    orgName: fromUserOrgName,
    appName: appLabel,
    eventName: eventTitle,
    pageURL: `${appUrl}/${link}`
  };
  return { to: recipient.email, templateId: templateIds.request.attendEvent.created, data };
}

// ------------------------- //
//      CASCADE8 ADMIN       //
// ------------------------- //

/**
 * @param orgId
 */
const organizationCreatedTemplate = (orgId: string, appUrl: string = appUrlContent) =>
  `
  A new organization was created on the blockframes project,

  Visit ${appUrl}${ADMIN_ACCEPT_ORG_PATH}/${orgId} or go to ${ADMIN_ACCEPT_ORG_PATH}/${orgId} to view it.
  `;

/**
 * @param orgId
 * @param appUrl
 */
const organizationRequestAccessToAppTemplate = (orgId: string, appUrl: string = appUrlContent) =>
  `
  An organization requested access to an app,

  Visit ${appUrl}${ADMIN_ACCEPT_ORG_PATH}/${orgId} or go to ${ADMIN_ACCEPT_ORG_PATH}/${orgId} to enable it.
  `;


/**
 * @param user
 * @TODO (#2826) add application used when first connecting
 */
const userFirstConnexionTemplate = (user: PublicUser) =>
  `
  User ${user.firstName} ${user.lastName} connected for the first time to the app.

  Email: ${user.email}.
  `;  

/** Generates a transactional email request to let cascade8 admin know that a new org have been created. */
export async function organizationCreated(org: OrganizationDocument): Promise<EmailRequest> {
  const urlToUse = await getAppUrl(org);
  return {
    to: adminEmail,
    subject: 'A new organization has been created',
    text: organizationCreatedTemplate(org.id, urlToUse)
  };
}

/**
 * Generates a transactional email request to let cascade8 admin know that a new org is waiting for app access.
 * It sends an email to admin to accept or reject the request
 */
export async function organizationRequestedAccessToApp(org: OrganizationDocument): Promise<EmailRequest> {
  const urlToUse = await getAppUrl(org);
  return {
    to: adminEmail,
    subject: 'An organization requested access to an app',
    text: organizationRequestAccessToAppTemplate(org.id, urlToUse)
  };
}

export async function userFirstConnexion(user: PublicUser): Promise<EmailRequest> {
  return {
    to: adminEmail,
    subject: 'New user connexion',
    text: userFirstConnexionTemplate(user)
  };
}

export function sendDemoRequestMail(information: RequestDemoInformations) {
  return {
    to: adminEmail,
    subject: 'A demo has been requested',
    text: `A user wants to schedule a demo of Archipel Content.

    User informations

    First name: ${information.firstName}
    Last name: ${information.lastName}
    Email: ${information.email}
    Phone number: ${information.phoneNumber}
    Company name: ${information.companyName}
    Role: ${information.role}`
  }
}

export function sendContactEmail(userName: string, userMail: string, subject: string, message: string): EmailRequest {
  return {
    to: adminEmail,
    subject: 'An user contacts Blockframes Admin',
    text: ` ${userName} (${userMail}) has sent an email.
    Subject of the mail : ${subject}
    Message from user :
    ${message}`
  }
}
