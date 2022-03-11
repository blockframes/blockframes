
import { App, getMailSender, applicationUrl } from '@blockframes/utils/apps';
import { generate as passwordGenerator } from 'generate-password';
import { createDocumentMeta, createPublicUserDocument, getDocument } from '../data/internals';
import { userInvite, userFirstConnexion } from '../templates/mail';
import { groupIds, templateIds } from '@blockframes/utils/emails/ids';
import { auth, db } from './firebase';
import { sendMailFromTemplate, sendMail } from './email';
import { OrganizationDocument, PublicOrganization, InvitationMode, InvitationStatus, InvitationType, PublicUser } from '@blockframes/model';
import { EventEmailData, getOrgEmailData, getUserEmailData } from '@blockframes/utils/emails/utils';
import { logger } from 'firebase-functions';
import { hasUserAnOrgOrIsAlreadyInvited } from '../invitation';

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
export const getOrInviteUserByMail = async (
  email: string,
  invitation: { id: string, type: InvitationType, mode: InvitationMode, fromOrg: PublicOrganization },
  app: App = 'catalog',
  eventData?: EventEmailData
): Promise<{ user: UserProposal | PublicUser, invitationStatus?: InvitationStatus }> => {
  const fromOrgId = invitation.fromOrg.id;
  let invitationStatus: InvitationStatus;
  try {
    const { uid } = await auth.getUserByEmail(email);
    const user = await getDocument<PublicUser>(`users/${uid}`);

    //if user exists but has no orgId and no invitation to any org, we still want to send him an invitation email
    const hasOrgOrOrgInvitation = await hasUserAnOrgOrIsAlreadyInvited([email]);
    if (invitation.type === 'attendEvent' && !hasOrgOrOrgInvitation) {
      const invitationTemplateId = templateIds.user.credentials.attendEventRemindInvitationPass;
      if (invitation.mode === 'invitation' && eventData?.accessibility === 'public') {
        invitationStatus = 'accepted';
      }
      await sendMailFromTemplate({
        to: email,
        templateId: invitationTemplateId,
        data: {
          event: eventData,
          org: getOrgEmailData(invitation.fromOrg)
        }
      }, app)
    }

    return {
      user: user || { uid, email },
      invitationStatus
    };
  } catch {
    try {
      const newUser = await createUserFromEmail(email, app);
      const toUser = getUserEmailData(newUser.user, newUser.password);

      // User does not exists, send him an email.
      const fromOrg = await getDocument<OrganizationDocument>(`orgs/${fromOrgId}`);
      const orgEmailData = getOrgEmailData(fromOrg);
      const urlToUse = applicationUrl[app];

      const credsTemplates = templateIds.user.credentials;

      let templateId = credsTemplates.joinOrganization;
      if (invitation.type === 'attendEvent') {
        templateId = eventData.accessibility !== 'private' ? credsTemplates.attendNonPrivateEvent : credsTemplates.attendEvent;

        if (invitation.mode === 'invitation' && eventData?.accessibility === 'public') {
          invitationStatus = 'accepted';
        }
      }

      const template = userInvite(toUser, orgEmailData, urlToUse, templateId, eventData);
      await sendMailFromTemplate(template, app);
      return {
        user: newUser.user,
        invitationStatus
      };
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
  const userDb = { uid: user.uid, email, _meta: createDocumentMeta({ createdFrom, emailVerified: true }) };
  await db.collection('users').doc(userDb.uid).set(userDb);

  return { user: createPublicUserDocument(userDb), password };
};

/**
 * User setted his firstName for the first time
 * Send an informative email to c8 admin
 * @param user
 */
export const sendFirstConnexionEmail = (user: PublicUser) => {
  const mailRequest = userFirstConnexion(user);
  const from = getMailSender(user._meta.createdFrom);
  return sendMail(mailRequest, from, groupIds.noUnsubscribeLink).catch(e => console.warn(e.message));
};
