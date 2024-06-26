import * as functions from 'firebase-functions';
import { db } from './internals/firebase';
import { userResetPassword, sendDemoRequestMail, sendContactEmail, accountCreationEmail, userInvite, userVerifyEmail } from './templates/mail';
import { sendMailFromTemplate, sendMail } from './internals/email';
import { RequestDemoInformations } from '@blockframes/utils/request-demo';
import { storeSearchableUser, deleteObject, algolia } from '@blockframes/firebase-utils/algolia';
import { getCollection, getDocument, getDocumentSnap, BlockframesChange, BlockframesSnapshot, getAuth, UserRecord } from '@blockframes/firebase-utils';
import { getMailSender, applicationUrl } from '@blockframes/utils/apps';
import { sendFirstConnexionEmail, createUserFromEmail } from './internals/users';
import { production } from './environments/environment';
import { cleanUserMedias } from './media';
import { groupIds } from '@blockframes/utils/emails/ids';
import {
  User,
  PublicUser,
  PermissionsDocument,
  App,
  ErrorResultResponse,
  Invitation,
  Organization,
  getUserEmailData,
  OrgEmailData,
} from '@blockframes/model';
import { registerToNewsletters, updateMemberTags } from './mailchimp';
import { getPreferenceTag, MailchimpTag } from '@blockframes/utils/mailchimp/mailchimp-model';

type CallableContext = functions.https.CallableContext;

interface EmailFlowData { email: string, app: App, publicUser: PublicUser }

export const startVerifyEmailFlow = async (data: EmailFlowData) => {
  const { email, app, publicUser } = data;

  if (!email) {
    throw new Error('email is a mandatory parameter for the "sendVerifyEmailAddress()" function');
  }

  const verifyLink = await getAuth().generateEmailVerificationLink(email);
  try {
    const user = getUserEmailData(publicUser);
    const template = userVerifyEmail(email, user, verifyLink);
    await sendMailFromTemplate(template, app);
  } catch (e) {
    throw new Error(`There was an error while sending email verification email : ${e.message}`);
  }
};

export const startAccountCreationEmailFlow = async (data: EmailFlowData) => {
  const { email, app, publicUser } = data;
  const user = getUserEmailData(publicUser);

  if (!email) {
    throw new Error('email is a mandatory parameter for the "sendVerifyEmail()" function');
  }

  try {
    const verifyLink = await getAuth().generateEmailVerificationLink(email);
    const template = accountCreationEmail(email, verifyLink, user);
    await sendMailFromTemplate(template, app);
  } catch (e) {
    throw new Error(`There was an error while sending account creation email : ${e.message}`);
  }

};

export const startResetPasswordEmail = async (data: EmailFlowData): Promise<ErrorResultResponse> => {
  const { email, app } = data;

  if (!email) {
    throw new Error('email is a mandatory parameter for the "sendResetPassword()" function');
  }

  try {
    const resetLink = await getAuth().generatePasswordResetLink(email);
    const template = userResetPassword(email, resetLink, app);
    await sendMailFromTemplate(template, app);
    return {
      error: '',
      result: 'OK'
    }
  } catch (e) {
    return {
      error: e?.code || 'ERROR',
      result: e?.message
    }
  }

};

export const onUserCreate = async (user: UserRecord) => {
  const { email, uid } = user;

  if (!email || !uid) {
    functions.logger.warn(`Email and uid are mandatory parameter, provided email (${email}), uid (${uid}). The user may have been created anonymously.`);
    return;
  }

  const userDocRef = db.collection('users').doc(user.uid);

  // transaction to UPSERT the user doc
  await db.runTransaction(async tx => {
    const userDoc = await tx.get(userDocRef);

    if (userDoc.exists) {
      if (!user.emailVerified) {
        const u = userDoc.data() as PublicUser;
        const tags = ['Firebase new user'];
        registerToNewsletters({ email, tags });
        await startAccountCreationEmailFlow({ email, publicUser: u, app: u._meta.createdFrom });
      }
      tx.update(userDocRef, { email, uid });
    } else {
      // This case should not occur because user document is created in createProfile of auth.service or in createUserFromEmail
      tx.set(userDocRef, { email, uid });
    }
  });

  // update Algolia index
  const userSnap = await userDocRef.get();
  const userData = userSnap.data() as PublicUser;

  return storeSearchableUser(userData);
};

export async function onUserCreateDocument(snap: BlockframesSnapshot<PublicUser>) {
  const after = snap.data();
  if (after.firstName) { await initUser(after); }
  return true;
}

export async function onUserUpdate(change: BlockframesChange<User>) {
  const before = change.before.data();
  const after = change.after.data();
  if ((before.firstName === undefined || before.firstName === '') && !!after.firstName) {
    await initUser(after);
  }

  await cleanUserMedias(before, after);

  // Sync preferences with mailchimp
  const tags: MailchimpTag[] = []
  if (after?.preferences) {
    for (const key in after.preferences) {
      const activeTags = getPreferenceTag(key, after.preferences[key], 'active');
      tags.push(...activeTags);
    }
  }

  if (before?.preferences) {
    for (const key in before.preferences) {
      const removed = after.preferences?.[key]
        ? before.preferences[key].filter((value: string) => !after.preferences[key].includes(value))
        : before.preferences[key];

      const removedTags = getPreferenceTag(key, removed, 'inactive');
      tags.push(...removedTags);
    }
  }
  if (tags.length) updateMemberTags(after.email, tags);

  // if name, email, avatar or orgId has changed : update algolia record
  if (
    before.firstName !== after.firstName ||
    before.lastName !== after.lastName ||
    before.email !== after.email ||
    before.avatar?.storagePath !== after.avatar?.storagePath ||
    before.orgId !== after.orgId
  ) {
    return storeSearchableUser(after);
  }
}

async function initUser(user: PublicUser) {
  const promises = [sendFirstConnexionEmail(user)];

  if (user._meta?.createdBy === 'anonymous' && user.email) {
    const authUser = await getAuth().getUser(user.uid);
    if (!authUser.emailVerified) {
      promises.push(startAccountCreationEmailFlow({ email: user.email, publicUser: user, app: user._meta.createdFrom }));
    }
    promises.push(storeSearchableUser(user));
  }
  return Promise.all(promises);
}

export async function onUserDelete(userSnapshot: BlockframesSnapshot<PublicUser>) {

  const user = userSnapshot.data();

  // update Algolia index
  deleteObject(algolia.indexNameUsers, userSnapshot.id);

  // delete user
  getAuth().deleteUser(user.uid);

  await cleanUserMedias(user);

  // remove id from org array
  if (user.orgId) {
    const orgPath = `orgs/${user.orgId}`;
    const { ref } = await getDocumentSnap(orgPath);
    const org = await getDocument<Organization>(orgPath);
    const userIds = org.userIds.filter(userId => userId !== user.uid);
    ref.update({ userIds });
  }

  // remove permissions
  if (user.orgId) {
    const permissionsRef = db.doc(`permissions/${user.orgId}`);
    const permissionsDoc = await permissionsRef.get();
    const permissions = permissionsDoc.data() as PermissionsDocument;
    const roles = permissions.roles;
    delete roles[user.uid];
    permissionsRef.update({ roles });
  }

  // remove all invitations related to user
  const invitations = await getCollection<Invitation>(`invitations`);
  invitations.filter(invitation => invitation.fromUser?.uid === user.uid || invitation.toUser?.uid === user.uid)
    .map(invitation => invitation.id)
    .map(id => db.doc(`invitations/${id}`).delete());

  // remove all notifications related to user
  const notificationsRef = db.collection(`notifications`).where('toUserId', '==', user.uid);
  const notificationsSnap = await notificationsRef.get();
  notificationsSnap.forEach(notification => db.doc(`notifications/${notification.id}`).delete());

  // delete blockframesAdmin doc
  db.doc(`blockframesAdmin/${user.uid}`).delete();
}

export const sendDemoRequest = async (data: RequestDemoInformations): Promise<RequestDemoInformations> => {
  const from = getMailSender(data.app);
  await sendMail(sendDemoRequestMail(data), from, groupIds.noUnsubscribeLink);
  return data;
}

export const sendUserMail = async (data: { subject: string, message: string, app: App }, context: CallableContext) => {
  const { subject, message, app } = data;

  if (!context?.auth) { throw new Error('Permission denied: missing auth context.'); }
  const user = await getDocument<PublicUser>(`users/${context.auth.uid}`);

  if (!subject || !message) {
    throw new Error('Subject and message are mandatory parameters for the "sendUserMail()" function');
  }

  const from = getMailSender(app);

  await sendMail(sendContactEmail(`${user.firstName} ${user.lastName}`, user.email, subject, message, app), from);
}

/**
 * Create an user.
 * Used in admin panel by blockframes admins only
 * @param data
 * @param context
 */
export const createUser = async (data: { email: string, orgEmailData: OrgEmailData, app: App }, context: CallableContext): Promise<PublicUser> => {
  const { email, orgEmailData, app } = data;

  if (!context?.auth) { throw new functions.https.HttpsError('permission-denied', 'Missing auth context!'); }
  const blockframesAdmin = await db.doc(`blockframesAdmin/${context.auth.uid}`).get();
  if (!blockframesAdmin.exists) { throw new functions.https.HttpsError('permission-denied', 'You are not a blockframes admin!'); }

  if (!email) {
    throw new functions.https.HttpsError('invalid-argument', '"email" is mandatory to create a user!');
  }
  if (!orgEmailData) {
    throw new functions.https.HttpsError('invalid-argument', '"orgEmailData" is mandatory to create a user!');
  }
  if (!app) {
    throw new functions.https.HttpsError('invalid-argument', '"app" is mandatory to create a user!');
  }

  try {
    const newUser = await createUserFromEmail(email, app);
    const toUser = getUserEmailData(newUser.user, newUser.password);
    const urlToUse = applicationUrl[app];

    const template = userInvite(toUser, orgEmailData, urlToUse);

    try {
      await sendMailFromTemplate(template, app);
    } catch (err) {
      if (production) throw err;

      functions.logger.warn(`Email hasn't been sent because of error! This will fail in prod, we prevented the function to crash because we are not in prod.`);
      functions.logger.warn(`Please check that your sendgrid key is authorized to send emails.`);
      functions.logger.error(err);
    }


    return newUser.user;
  } catch (e) {
    throw new functions.https.HttpsError('internal', `There was an error while sending email to newly created user : ${e.message}`);
  }

}

export const verifyEmail = async (data: { uid: string }, context: CallableContext) => {
  const { uid } = data;

  if (!context?.auth) { throw new Error('Permission denied: missing auth context.'); }
  const blockframesAdmin = await db.doc(`blockframesAdmin/${context.auth.uid}`).get();
  if (!blockframesAdmin.exists) { throw new Error('Permission denied: you are not blockframes admin'); }

  if (!uid) {
    throw new Error('uid is mandatory for verifying email');
  }

  try {
    await getAuth().updateUser(uid, { emailVerified: true });

    const { _meta } = await getDocument<PublicUser>(`users/${uid}`);
    _meta.emailVerified = true;
    db.doc(`users/${uid}`).update({ _meta });
  } catch (e) {
    throw new Error(`There was an error while verifying email : ${e.message}`);
  }
}
