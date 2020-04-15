/**
 * Templates for transactional emails we send to user and to cascade8 admins.
 */
import { adminEmail, appUrl } from '../environments/environment';
import { EmailRequest, EmailTemplateRequest } from '../internals/email';
import { templateIds } from '@env';
import { RequestToJoinOrganization, RequestDemoInformations } from '../data/types';

const ORG_HOME = '/c/o/organization/';
const USER_ORG_INVITATION = '/c/organization/home';
export const ADMIN_ACCEPT_ORG_PATH = '/admin/acceptOrganization';
export const ADMIN_ACCESS_TO_APP_PATH = '/admin/allowAccessToApp';
export const ADMIN_DATA_PATH = '/admin/data'; // backup / restore

// ------------------------- //
//   FOR BLOCKFRAMES USERS   //
// ------------------------- //

export function welcomeMessage(email: string): EmailTemplateRequest {
  const data = {};
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

/** Generates a transactional email request for user invited to the application. */
export function userInvite(email: string, password: string, orgName: string): EmailTemplateRequest {
  const data = {
    userEmail: email,
    userPassword: password,
    orgName,
    pageURL: `${appUrl}`
  };
  return { to: email, templateId: templateIds.userCredentials, data };
}

/** Generates a transactional email request for user invited to an organization. */
export function userInviteToOrg(email: string, orgName: string, invitationId: string): EmailTemplateRequest {
  const data = {
    orgName: orgName,
    pageURL: `${appUrl}${USER_ORG_INVITATION}`
  };
  return { to: email, templateId: templateIds.orgInviteUser, data };
}

export function sendWishlistPending(email: string): EmailTemplateRequest {
  const data = {};
  return { to: email, templateId: templateIds.wishlistPending, data };
}

/** Generates a transactional email request to let organization admins know that their org was approved. */
export function organizationWasAccepted(email: string, orgId: string, userFirstName?: string): EmailTemplateRequest {
  const data = {
    userFirstName,
    pageURL: `${appUrl}${ORG_HOME}${orgId}`
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

export function organizationCanAccessApp(email: string, appId: string): EmailRequest {
  return {
    to: email,
    subject: 'Your organization has access to a new app',
    text: 'TODO (organizationCanAccessApp)'
  };
}

/** Send email to a user to inform him that he joined an org */
export function userJoinedAnOrganization(userEmail: string, orgId: string): EmailTemplateRequest {
  const data = {
    pageURL: `${appUrl}${ORG_HOME}${orgId}`
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

/** Generates a transactional email to let an admin now that a user requested to join their org */
export function userRequestedToJoinYourOrg(request: RequestToJoinOrganization): EmailTemplateRequest { // TODO
  const data = {
    adminFirstName: request.adminName,
    userFirstName: request.userFirstname,
    userLastName: request.userLastname,
    orgName: request.organizationName,
    pageURL: `${appUrl}${ORG_HOME}${request.organizationId}/members`
  };
  return { to: request.adminEmail, templateId: templateIds.joinYourOrg, data };
}

// ------------------------- //
//      CASCADE8 ADMIN       //
// ------------------------- //

const organizationCreatedTemplate = (orgId: string) =>
  `
  A new organization was created on the blockframes project,

  Visit ${appUrl}${ADMIN_ACCEPT_ORG_PATH}/${orgId} to enable it.
  `; // @TODO (#2539) => redirect to admin panel

/**
 * @TODO (#2539)
 * This method is currently unused but we keep it to future uses.
 * @param orgId 
 * @param appId 
 */
/*const organizationRequestAccessToAppTemplate = (orgId: string, appId: string) =>
  `
  An organization requested access to an app,

  Visit ${appUrl}${ADMIN_ACCESS_TO_APP_PATH}/${orgId}/${appId} to enable it.
  `; // @TODO (#2539) => redirect to admin panel
*/

const wishlistSent = (userName: string, orgName: string, wishlist: string[]) =>
  `
  ${userName} from ${orgName} just sent a wishlist including ${wishlist.length} :
  - ${wishlist.join('\n- ')}
  `;

/** Generates a transactional email request to let cascade8 admin know that a new org is waiting for approval. */
export function organizationCreated(orgId: string): EmailRequest {
  return {
    to: adminEmail,
    subject: 'A new organization has been created',
    text: organizationCreatedTemplate(orgId)
  };
}

/**
 * Generates a transactional email request to let cascade8 admin know that a new org is waiting for app access.
 * @TODO (#2539)
 * This method is currently unused but we keep it to future uses.
 * It sends and email to admin to accept or reject the request
 */
/*export function organizationRequestedAccessToApp(orgId: string, appId: string): EmailRequest {
  return {
    to: adminEmail,
    subject: 'An organization requested access to an app',
    text: organizationRequestAccessToAppTemplate(orgId, appId)
  };
}*/

export function sendWishlist(userName: string, orgName: string, wishlist: string[]): EmailRequest {
  return {
    to: adminEmail,
    subject: 'A wishlist has been sent',
    text: wishlistSent(userName, orgName, wishlist)
  }
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
