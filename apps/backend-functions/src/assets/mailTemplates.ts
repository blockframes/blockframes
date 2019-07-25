/**
 * Templates for transactional emails we send to user and to cascade8 admins.
 */
import { adminEmail, appUrl } from '../environments/environment';
import { EmailRequest } from '../internals/email';

const USER_WELCOME_PATH = '/auth/welcome';

const userInviteTemplate = ({ email, password }: { email: string; password: string }) =>
  `
  You've been invited to a project on the Blockframes Platform!\n
  \n
  login: ${email}\n
  password: ${password}\n
  \n
  Click on the following link to login to your account and join the project:\n
  ${appUrl}${USER_WELCOME_PATH}
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
export function userInviteToOrg(email: string): EmailRequest {
  return {
    to: email,
    subject: 'You have been invited to an organization',
    text: 'TODO'
  };
}

export function organizationCreate(orgId: string): EmailRequest {
  return {
    to: adminEmail,
    subject: 'A new organization has been created',
    text: 'TODO'
  };
}
