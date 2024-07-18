
import { getMailSender, applicationUrl } from '@blockframes/utils/apps';
import { generate as passwordGenerator } from 'generate-password';
import { userInvite, userFirstConnexion } from '../templates/mail';
import { groupIds, templateIds } from '@blockframes/utils/emails/ids';
import { auth, db } from './firebase';
import { sendMailFromTemplate, sendMail } from './email';
import {
  PublicOrganization,
  InvitationMode,
  InvitationStatus,
  InvitationType,
  PublicUser,
  App,
  createInternalDocumentMeta,
  Organization,
  createPublicUser,
  getUserEmailData,
  getOrgEmailData,
  EventEmailData,
  WaterfallEmailData,
  User,
  SupportedLanguages,
  getDefaultIsoA2,
} from '@blockframes/model';
import { logger } from 'firebase-functions';
import { hasUserAnOrgOrIsAlreadyInvited } from '../invitation';
import { getDocument } from '@blockframes/firebase-utils';

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
  eventData?: EventEmailData,
  waterfallData?: WaterfallEmailData,
  language?: SupportedLanguages
): Promise<{ user: UserProposal | PublicUser, invitationStatus?: InvitationStatus }> => {
  const fromOrgId = invitation.fromOrg.id;
  let invitationStatus: InvitationStatus;
  try {
    const { uid } = await auth.getUserByEmail(email);
    const user = await getDocument<PublicUser>(`users/${uid}`);

    //if user exists but has no orgId and no invitation to any org, we still want to send him an invitation email
    const hasOrgOrOrgInvitation = await hasUserAnOrgOrIsAlreadyInvited([email]);
    if (!hasOrgOrOrgInvitation) {
      if (invitation.type === 'attendEvent') {
        const invitationTemplateId = templateIds.invitation.attendEvent.created;
        if (invitation.mode === 'invitation' && eventData?.accessibility === 'public') {
          invitationStatus = 'accepted';
        }
        await sendMailFromTemplate({
          to: email,
          templateId: invitationTemplateId,
          data: {
            user: getUserEmailData(user),
            event: eventData,
            org: getOrgEmailData(invitation.fromOrg),
            isInvitationReminder: true
          }
        }, app);
      } else if (invitation.type === 'joinWaterfall') {
        const invitationTemplateId = templateIds.invitation.joinWaterfall.created;
        const urlToUse = applicationUrl[app];
        const link = 'c/o/dashboard/invitations';
        await sendMailFromTemplate({
          to: email,
          templateId: invitationTemplateId,
          data: {
            user: getUserEmailData(user),
            waterfall: waterfallData,
            org: getOrgEmailData(invitation.fromOrg),
            isInvitationReminder: true,
            pageUrl: `${urlToUse}/${link}`,
          }
        }, app);
      }
    }

    return {
      user: user || { uid, email },
      invitationStatus
    };
  } catch {
    try {
      const newUser = await createUserFromEmail(email, app);
      if (language) newUser.user.settings = { preferredLanguage: { language, isoA2: getDefaultIsoA2(language) } };
      const toUser = getUserEmailData(newUser.user, newUser.password);

      // User does not exists, send him an email.
      const fromOrg = await getDocument<Organization>(`orgs/${fromOrgId}`);
      const orgEmailData = getOrgEmailData(fromOrg);
      const urlToUse = applicationUrl[app];

      const credsTemplates = templateIds.user.credentials;

      let templateId = credsTemplates.joinOrganization;
      if (invitation.type === 'attendEvent') {
        templateId = eventData.accessibility !== 'private' ? credsTemplates.attendNonPrivateEvent : credsTemplates.attendEvent;

        if (invitation.mode === 'invitation' && eventData?.accessibility === 'public') {
          invitationStatus = 'accepted';
        }
      } else if (invitation.type === 'joinWaterfall') {
        templateId = credsTemplates.joinWaterfall;
      }

      const template = userInvite(toUser, orgEmailData, urlToUse, templateId, eventData, waterfallData);
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
  const userDb: Partial<User> = { uid: user.uid, email, _meta: createInternalDocumentMeta({ createdFrom, emailVerified: true }) };
  await db.collection('users').doc(userDb.uid).set(userDb);

  return { user: createPublicUser(userDb), password };
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
