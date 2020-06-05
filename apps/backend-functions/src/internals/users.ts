
import { App, getSendgridFrom, sendgridUrl } from '@blockframes/utils/apps';
import { templateIds } from '@env';
import { generate as passwordGenerator } from 'generate-password';
import { OrganizationDocument, InvitationType } from '../data/types';
import { getDocument } from '../data/internals';
import { userInvite, userFirstConnexion } from '../templates/mail';
import { auth } from './firebase';
import { sendMailFromTemplate, sendMail } from './email';
import { PublicUser } from '@blockframes/user/types';

interface UserProposal {
  uid: string;
  email: string;
}

const generatePassword = () =>
  passwordGenerator({
    length: 12,
    numbers: true
  });

/**
 * Get user by email & create one if there is no user for this email
 */
export const getOrInviteUserByMail = async (email: string, orgId: string, invitationType: InvitationType, app: App = 'catalog'): Promise<UserProposal | PublicUser> => {

  try {
    const { uid } = await auth.getUserByEmail(email);
    const user = await getDocument<PublicUser>(`users/${uid}`);
    return user || { uid, email }
  } catch {
    const newUser = await createUserFromEmail(email);

    // User does not exists, send him an email.
    const org = await getDocument<OrganizationDocument>(`orgs/${orgId}`);
    const urlToUse = sendgridUrl[app];
    const from = getSendgridFrom(app);

    const templateId = templateIds.user.credentials[invitationType][app];
    const template = userInvite(email, newUser.password, org.denomination.full, urlToUse, templateId);
    await sendMailFromTemplate(template, from);
    return newUser.user;
  }
};


/**
 * Creates an user from email address
 * @param email 
 */
export const createUserFromEmail = async (email: string): Promise<{ user: PublicUser, password: string }> => {

  const password = generatePassword();

  // User does not exists, send them an email.
  const user = await auth.createUser({
    email,
    password,
    emailVerified: true,
    disabled: false
  });

  return { user: { uid: user.uid, email }, password };
};

/**
 * User setted his firstName for the first time
 * Send an informative email to c8 admin 
 * @param user 
 */
export const sendFirstConnexionEmail = async (user: PublicUser): Promise<any> => {
  const mailRequest = await userFirstConnexion(user);
  const from = await getSendgridFrom();
  return sendMail(mailRequest, from);
};
