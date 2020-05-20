/**
 * Templates for transactional emails we send to user and to cascade8 admins.
 */
import { adminEmail, appUrlContent } from '../environments/environment';
import { EmailRequest, EmailTemplateRequest } from '../internals/email';
import { templateIds } from '@env';
import { RequestToJoinOrganization, RequestDemoInformations, OrganizationDocument } from '../data/types';
import { PublicUser } from '@blockframes/user/+state/user.firestore';
import { getAppUrl } from '../data/internals';
import { App } from '@blockframes/utils/apps';

const ORG_HOME = '/c/o/organization/';
const USER_ORG_INVITATION = '/c/organization/home';
export const ADMIN_ACCEPT_ORG_PATH = '/c/o/admin/panel/organization';
export const ADMIN_DATA_PATH = '/admin/data'; // backup / restore

// ------------------------- //
//   FOR BLOCKFRAMES USERS   //
// ------------------------- //

export function welcomeMessage(email: string, userFirstName?: string): EmailTemplateRequest {
  const data = {
    userEmail: email,
    userFirstName
  };
  return { to: email, templateId: templateIds.welcomeMessage, data };
}

export function userVerifyEmail(email: string, link: string): EmailTemplateRequest {
  const data = {
    pageURL: link
  };
  return { to: email, templateId: templateIds.userVerifyEmail, data };
}

export function userResetPassword(email: string, link: string): EmailTemplateRequest {
  const data = {
    pageURL: link
  };
  return { to: email, templateId: templateIds.resetPassword, data };
}

/**
 * Generates a transactional email request for user invited to the application.
 * @param email
 * @param password
 * @param orgName
 * @param pageURL
 * @param templateId
 */
export function userInvite(email: string, password: string, orgName: string, pageURL: string = appUrlContent, templateId: string = templateIds.userCredentialsContent): EmailTemplateRequest {
  const data = {
    userEmail: email,
    userPassword: password,
    orgName,
    pageURL: `${pageURL}${USER_ORG_INVITATION}`
  };
  return { to: email, templateId, data };
}

/** Generates a transactional email request to let organization admins know that their org was approved. */
export function organizationWasAccepted(email: string, userFirstName?: string, appUrl: string = appUrlContent): EmailTemplateRequest {
  const data = {
    userFirstName,
    pageURL: `${appUrl}/c/o`
  };
  return { to: email, templateId: templateIds.orgAccepted, data };
}

export function userJoinOrgPendingRequest(email: string, orgName: string, userFirstName: string): EmailTemplateRequest {
  const data = {
    userFirstName,
    orgName
  };
  return { to: email, templateId: templateIds.joinAnOrgPending, data };
}

export function organizationCanAccessApp(admin: PublicUser, appName: App, appUrl: string): EmailTemplateRequest {
  const data = {
    adminFirstName: admin.firstName,
    appName: appName,
    appUrl: appUrl
  }
  return { to: admin.email, templateId: templateIds.newAppAccessForOrg, data };
}

/** Send email to a user to inform him that he joined an org */
export function userJoinedAnOrganization(userEmail: string, orgId: string, appUrl: string = appUrlContent): EmailTemplateRequest {
  const data = {
    pageURL: `${appUrl}/c/o`
  };
  return { to: userEmail, templateId: templateIds.userRequestAccepted, data };
}

/** Send email to org admin to inform him that a new user has joined his org */
export function userJoinedYourOrganization(orgAdminEmail: string, userEmail: string): EmailTemplateRequest {
  const data = {
    userEmail
  };
  return { to: orgAdminEmail, templateId: templateIds.userHasJoined, data };
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
  return { to: request.adminEmail, templateId: templateIds.joinYourOrg, data };
}

/** Generates an email for user invited to an meeting event. */
export function invitationToMeetingFromUser(toUserFirstName: string, fromUser: PublicUser, fromUserOrgName: string, eventName: string, link: string, appUrl: string = appUrlContent): EmailTemplateRequest {
  const data = {
    userFirstName: toUserFirstName,
    fromUserFirstName: fromUser.firstName,
    fromUserLastName: fromUser.lastName,
    orgName: fromUserOrgName,
    eventName: eventName,
    pageURL: `${appUrl}/${link}`
  };
  return { to: fromUser.email, templateId: templateIds.invitationToMeetingFromUser, data };
}

/** Generates an email for user invited by an organization to a screening. */
export function invitationToScreeningFromOrg(toUser: PublicUser, orgDenomination: string, eventId: string, link: string, appUrl: string = appUrlContent): EmailTemplateRequest {
  const data = {
    userFirstName: toUser.firstName,
    orgName: orgDenomination,
    eventName: eventId,
    pageURL: `${appUrl}/${link}`
  };
  return { to: toUser.email, templateId: templateIds.invitationToScreeningFromOrg, data };
}

/** Generates an email for user requesting to attend an event. */
export function requestToAttendEventFromUser(fromUserFirstname: string, fromUserOrgName: string, toUser: PublicUser, eventTitle: string, link: string, appUrl: string = appUrlContent): EmailTemplateRequest {
  const data = {
    adminFirstName: toUser.firstName,
    userFirstName: fromUserFirstname,
    orgName: fromUserOrgName,
    eventName: eventTitle,
    pageURL: `${appUrl}/${link}`
  };
  return { to: toUser.email, templateId: templateIds.requestToAttendEventFromUser, data };
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
 */
const organizationRequestAccessToAppTemplate = (orgId: string, appUrl: string = appUrlContent) =>
  `
  An organization requested access to an app,

  Visit ${appUrl}${ADMIN_ACCEPT_ORG_PATH}/${orgId} or go to ${ADMIN_ACCEPT_ORG_PATH}/${orgId} to enable it.
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
