/**
 * Templates for transactional emails we send to user and to cascade8 admins.
 */
import { adminEmail, appUrl } from '../environments/environment';
import { EmailRequest, EmailTemplateRequest } from '../internals/email';
import { templateIds } from '@env';

// const USER_WELCOME_PATH = '/auth/welcome';
const ORG_HOME = '/layout/o/organization/';
const USER_ORG_INVITATION = '/layout/organization/home';
export const ADMIN_ACCEPT_ORG_PATH = '/admin/acceptOrganization';
export const ADMIN_ACCESS_TO_APP_PATH = '/admin/allowAccessToApp';
export const ADMIN_DATA_PATH = '/admin/data'; // backup / restore

// ------------------------- //
//      MAIL TEMPLATES       //
// ------------------------- //

// ------------------------- //
//   FOR BLOCKFRAMES USERS   //
// ------------------------- //

export function welcomeMessage(email: string): EmailTemplateRequest {
  const data = {
  }
  return { to: email, templateId: templateIds.welcomeMessage, data };
}

export function userVerifyEmail(email: string, link: string): EmailTemplateRequest {
  const data = {
    pageURL: link
  }
  return { to: email, templateId: templateIds.userVerifyEmail, data };
}

export function userResetPassword(email: string, link: string): EmailTemplateRequest {
  const data = {
    pageURL: link
  }
  return { to: email, templateId: templateIds.resetPassword, data };
}

/** Generates a transactional email request for user invited to the application. */
export function userInvite(email: string, password: string): EmailTemplateRequest {
  const data = {
    userEmail: email,
    userPassword: password,
    pageURL: `${appUrl}`
  }
  return { to: email, templateId: templateIds.userCredentials, data };
}

/** Generates a transactional email request for user invited to an organization. */
export function userInviteToOrg(email: string, orgName: string, invitationId: string): EmailTemplateRequest {
  const data = {
    orgName: orgName,
    pageURL: `${appUrl}${USER_ORG_INVITATION}`
  }
  return { to: email, templateId: templateIds.orgInviteUser, data };
}

/** Generates a transactional email request to let organization admins know that their org was approved. */
export function organizationWasAccepted(email: string, orgId: string, userFirstName?: string): EmailTemplateRequest {
  const data = {
    userFirstName,
    pageURL: `${appUrl}${ORG_HOME}${orgId}`
  }
  return { to: email, templateId: templateIds.orgAccepted, data };
}

export function userJoinOrgPendingRequest(email: string, orgName: string, userFirstName: string): EmailTemplateRequest {
  const data = {
    userFirstName,
    orgName
  }
  return { to: email, templateId: templateIds.joinAnOrgPending, data };
}

export function organizationCanAccessApp(email: string, appId: string): EmailRequest {
  return {
    to: email,
    subject: 'Your organization has access to a new app',
    text: 'TODO (organizationCanAccessApp)'
  };
}

export function userJoinedAnOrganization(userEmail: string, orgId: string): EmailTemplateRequest {
  const data = {
    pageURL: `${appUrl}${ORG_HOME}${orgId}`
  }
  return { to: userEmail, templateId: templateIds.userRequestAccepted, data };
}

export function userJoinedYourOrganization(orgAdminEmail: string, userEmail: string): EmailTemplateRequest { // TODO
  const data = {
    userEmail
  };
  return { to: orgAdminEmail, templateId: templateIds.userHasJoined, data };
}
/** Generates a transactional email to let an admin now that a user requested to join their org */
export function userRequestedToJoinYourOrg(orgAdminEmail: string, adminName: string, orgName: string, orgId: string, userFirstName: string, userLastName: string): EmailTemplateRequest { // TODO
  const data = {
    adminFirstName: adminName,
    userFirstName,
    userLastName,
    orgName,
    pageURL: `${appUrl}${ORG_HOME}${orgId}/members`
  }
  return { to: orgAdminEmail, templateId: templateIds.joinYourOrg, data };
}

// ------------------------- //
//      CASCADE8 ADMIN       //
// ------------------------- //

const organizationCreatedTemplate = (orgId: string) =>
  `
  A new organization was created on the blockframes project,

  Visit ${appUrl}${ADMIN_ACCEPT_ORG_PATH}/${orgId} to enable it.
  `;

const organizationRequestAccessToAppTemplate = (orgId: string, appId: string) =>
  `
  An organization requested access to an app,

  Visit ${appUrl}${ADMIN_ACCESS_TO_APP_PATH}/${orgId}/${appId} to enable it.
  `;

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

/** Generates a transactional email request to let cascade8 admin know that a new org is waiting for app access. */
export function organizationRequestedAccessToApp(orgId: string, appId: string): EmailRequest {
  return {
    to: adminEmail,
    subject: 'An organization requested access to an app',
    text: organizationRequestAccessToAppTemplate(orgId, appId)
  };
}

export function sendWishlist(userName: string, orgName: string, wishlist: string[]): EmailRequest {
  return {
    to: adminEmail,
    subject: 'A wishlist has been sent',
    text: wishlistSent(userName, orgName, wishlist)
  }
}
