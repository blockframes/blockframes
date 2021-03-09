
import { App, getSendgridFrom, applicationUrl } from '@blockframes/utils/apps';
import { generate as passwordGenerator } from 'generate-password';
import { OrganizationDocument, InvitationType } from '../data/types';
import { createDocumentMeta, createPublicUserDocument, getDocument } from '../data/internals';
import { userInvite, userFirstConnexion } from '../templates/mail';
import { templateIds } from '../templates/ids';
import { auth, db } from './firebase';
import { sendMailFromTemplate, sendMail } from './email';
import { PublicUser } from '@blockframes/user/types';
import { orgName } from '@blockframes/organization/+state/organization.firestore';
import { EventEmailData } from '@blockframes/utils/emails/utils';
import { logger } from 'firebase-functions';

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
export const getOrInviteUserByMail = async (email: string, fromOrgId: string, invitationType: InvitationType, app: App = 'catalog', eventData: EventEmailData): Promise<UserProposal | PublicUser> => {

  try {
    const { uid } = await auth.getUserByEmail(email);
    const user = await getDocument<PublicUser>(`users/${uid}`);
    return user || { uid, email }
  } catch {
    try {
      const newUser = await createUserFromEmail(email, app);

      // User does not exists, send him an email.
      const fromOrg = await getDocument<OrganizationDocument>(`orgs/${fromOrgId}`);
      const urlToUse = applicationUrl[app];

      let templateId = '';

      invitationType === 'joinOrganization'
      ?  templateId = templateIds.user.credentials[invitationType][app]
      : templateId = templateIds.user.credentials[invitationType];

      const template = userInvite(email, newUser.password, orgName(fromOrg), urlToUse, templateId, eventData);
      await sendMailFromTemplate(template, app);
      return newUser.user;
    } catch (e) {
      throw new Error(`There was an error while sending email to newly created user : ${e.message}`);
    }

  }
};


/**
 * Creates an user from email address
 * @param email
 */
export const createUserFromEmail = async (email: string, createdFrom: App = 'festival'): Promise<{ user: PublicUser, password: string }> => {

  const password = generatePassword();

  // User does not exists, we create it with a generated password
  const user = await auth.createUser({
    email,
    password,
    emailVerified: true,
    disabled: false
  }).catch(e => {
    throw new Error(`There was an error while creating user (email: "${email}" | password: "${password}"): ${e.message}`);
  });

  logger.info(`Successfuly created user "${user.uid}" with email : "${email}" and password: "${password}"`);

  // We don't have the time to wait for the trigger onUserCreate,
  // So we create it here first.
  const userDb = { uid: user.uid, email, _meta: createDocumentMeta({ createdFrom }) };
  await db.collection('users').doc(userDb.uid).set(userDb);

  return { user: createPublicUserDocument(userDb), password };
};

/**
 * User setted his firstName for the first time
 * Send an informative email to c8 admin
 * @param user
 */
export const sendFirstConnexionEmail = async (user: PublicUser): Promise<any> => {
  const mailRequest = await userFirstConnexion(user);
  const from = await getSendgridFrom(user._meta.createdFrom);
  return sendMail(mailRequest, from).catch(e => console.warn(e.message));
};
