/**
 * Templates for transactional emails we send to user and to cascade8 admins.
 */
import { adminEmail, appUrl } from '../environments/environment';
import { EmailRequest } from '../internals/email';

const USER_WELCOME_PATH = '/auth/welcome';
const USER_ORG_INVITATION = '/auth/identity/';
export const ADMIN_ACCEPT_ORG_PATH = '/admin/acceptOrganization';
export const ADMIN_ACCESS_TO_APP_PATH = '/admin/allowAccessToApp';
export const ADMIN_DATA_PATH = '/admin/data'; // backup / restore

const userInviteTemplate = ({ email, password }: { email: string; password: string }) =>
  `
  You've been invited to a project on the Blockframes Platform!

  login: ${email}\n
  password: ${password}\n

  Click on the following link to login to your account and join the project:
  ${appUrl}${USER_WELCOME_PATH}
  `;

const organizationCreatedTemplate = (orgId: string): string =>
  `
  A new organization was created on the blockframes project,

  Visit ${appUrl}${ADMIN_ACCEPT_ORG_PATH}/${orgId} to enable it.
  `;

const organizationRequestAccessToAppTemplate = (orgId: string, appId: string): string =>
  `
  An organization requested access to an app,

  Visit ${appUrl}${ADMIN_ACCESS_TO_APP_PATH}/${orgId}/${appId} to enable it.
  `;

/** Generates a transactional email request for user invited to the application. */
export function userInvite(email: string, password: string): EmailRequest {
  return {
    to: email,
    subject: 'Your Blockframes account is waiting for you',
    text: userInviteTemplate({ email, password })
  };
}

/** Generates a transactional email request for user invited to an organization. */
export function userInviteToOrg(email: string, invitationId: string): EmailRequest {
  return {
    to: email,
    subject: 'You have been invited to an organization',
    text: `Visit: ${appUrl}${USER_ORG_INVITATION}${invitationId}
    to register to the organization`
  };
}

/** Generates a transactional email request to let cascade8 admin know that a new org is waiting for approval. */
export function organizationCreated(orgId: string): EmailRequest {
  return {
    to: adminEmail,
    subject: 'A new organization has been created',
    text: organizationCreatedTemplate(orgId)
  };
}

/** Generates a transactional email request to let organization admins know that their org was approved. */
export function organizationWasAccepted(email: string): EmailRequest {
  return {
    to: email,
    subject: 'Your organization was accepted by admins',
    text: 'TODO'
  };
}

export function organizationCanAccessApp(email: string, appId: string): EmailRequest {
  return {
    to: email,
    subject: 'Your organization has access to a new app',
    text: 'TODO'
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

const userRequestedToJoinYourOrgTemplate = (userMail: string): string =>
  `
  The user ${userMail} requested to join your app,

  Visit your organization teamwork page to accept them.
  `;

/** Generates a transactional email to let an admin now that a user requested to join their org */
export function userRequestedToJoinYourOrg(adminMail: string, userMail: string): EmailRequest {
  return {
    to: adminMail,
    subject: 'A user requested to join your organization',
    text: userRequestedToJoinYourOrgTemplate(userMail)
  };
}

export function userJoinedAnOrganization(userEmail: string): EmailRequest {
  return {
    to: userEmail,
    subject: 'You joined a new organization',
    text: 'TODO'
  };
}

export function userJoinedYourOrganization(orgAdminEmail: string, userEmail: string): EmailRequest {
  return {
    to: orgAdminEmail,
    subject: 'A user joined the organization',
    text: `user: ${userEmail}`
  }
}
