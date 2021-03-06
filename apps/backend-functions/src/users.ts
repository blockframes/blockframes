import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { db, getStorageBucketName } from './internals/firebase';
import { userResetPassword, sendDemoRequestMail, sendContactEmail, accountCreationEmail, userInvite, userVerifyEmail } from './templates/mail';
import { sendMailFromTemplate, sendMail } from './internals/email';
import { RequestDemoInformations, PublicUser, PermissionsDocument, OrganizationDocument, InvitationDocument } from './data/types';
import { upsertWatermark, getCollection, storeSearchableUser, deleteObject, algolia } from '@blockframes/firebase-utils';
import { getDocument } from './data/internals';
import { getSendgridFrom, applicationUrl, App } from '@blockframes/utils/apps';
import { sendFirstConnexionEmail, createUserFromEmail } from './internals/users';
import { cleanUserMedias } from './media';
import { getUserEmailData, OrgEmailData } from '@blockframes/utils/emails/utils';

type UserRecord = admin.auth.UserRecord;
type CallableContext = functions.https.CallableContext;


interface EmailFlowData { email: string, app: App, publicUser: PublicUser }

export const startVerifyEmailFlow = async (data: EmailFlowData) => {
  const { email, app, publicUser } = data;

  if (!email) {
    throw new Error('email is a mandatory parameter for the "sendVerifyEmailAddress()" function');
  }

  const verifyLink = await admin.auth().generateEmailVerificationLink(email);
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
    const verifyLink = await admin.auth().generateEmailVerificationLink(email);
    const template = accountCreationEmail(email, verifyLink, user);
    await sendMailFromTemplate(template, app);
  } catch (e) {
    throw new Error(`There was an error while sending account creation email : ${e.message}`);
  }

};

export const startResetPasswordEmail = async (data: EmailFlowData) => {
  const { email, app } = data;

  if (!email) {
    throw new Error('email is a mandatory parameter for the "sendResetPassword()" function');
  }

  try {
    const resetLink = await admin.auth().generatePasswordResetLink(email);
    const template = userResetPassword(email, resetLink);
    await sendMailFromTemplate(template, app);
  } catch (e) {
    throw new Error(`There was an error while sending reset password email : ${e.message}`);
  }

};

export const onUserCreate = async (user: UserRecord) => {
  const { email, uid } = user;

  if (!email || !uid) {
    throw new Error(`email and uid are mandatory parameter, provided email (${email}), uid (${uid})`);
  }

  const userDocRef = db.collection('users').doc(user.uid);

  // transaction to UPSERT the user doc
  await db.runTransaction(async tx => {
    const userDoc = await tx.get(userDocRef);

    if (userDoc.exists) {
      if (!user.emailVerified) {
        const u = userDoc.data() as PublicUser;
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

  return Promise.all([
    storeSearchableUser(userData),
    upsertWatermark(userData, getStorageBucketName()),
  ]);
};

export async function onUserCreateDocument(snap: FirebaseFirestore.DocumentSnapshot) {
  const after = snap.data() as PublicUser;
  if (after.firstName) { await sendFirstConnexionEmail(after) }
  return true;
}

export async function onUserUpdate(change: functions.Change<FirebaseFirestore.DocumentSnapshot>)  {
  const before = change.before.data() as PublicUser;
  const after = change.after.data() as PublicUser;


  if ((before.firstName === undefined || before.firstName === '') && !!after.firstName) {
    await sendFirstConnexionEmail(after);
  }

  await cleanUserMedias(before, after);

  const promises = [];

  // if name, email, avatar or orgId has changed : update algolia record
  if (
    before.firstName !== after.firstName ||
    before.lastName !== after.lastName ||
    before.email !== after.email ||
    before.avatar?.storagePath !== after.avatar?.storagePath ||
    before.orgId !== after.orgId
  ) {
    promises.push(storeSearchableUser(after));
  }

  // if name or email has changed : update watermark
  if (
    before.firstName !== after.firstName ||
    before.lastName !== after.lastName ||
    before.email !== after.email
  ) {
    promises.push(upsertWatermark(after, getStorageBucketName()));
  }

  return Promise.all(promises);
}

export async function onUserDelete(userSnapshot: FirebaseFirestore.DocumentSnapshot<PublicUser>) {

  const user = userSnapshot.data() as PublicUser;

  // update Algolia index
  deleteObject(algolia.indexNameUsers, userSnapshot.id);

  // delete user
  admin.auth().deleteUser(user.uid);

  await cleanUserMedias(user);

  // remove id from org array
  if (user.orgId) {
    const orgRef = db.doc(`orgs/${user.orgId}`);
    const orgDoc = await orgRef.get();
    const org = orgDoc.data() as OrganizationDocument
    const userIds = org.userIds.filter(userId => userId !== user.uid);
    orgRef.update({ userIds });
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
  const invitations = await getCollection<InvitationDocument>(`invitations`)
  invitations
    .filter(invitation => invitation.fromUser?.uid === user.uid || invitation.toUser?.uid === user.uid)
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
  const from = getSendgridFrom(data.app);
  await sendMail(sendDemoRequestMail(data), from);
  return data;
}

export const sendUserMail = async (data: { subject: string, message: string, app: App }, context: CallableContext) => {
  const { subject, message, app } = data;

  if (!context?.auth) { throw new Error('Permission denied: missing auth context.'); }
  const user = await getDocument<PublicUser>(`users/${context.auth.uid}`);

  if (!subject || !message) {
    throw new Error('Subject and message are mandatory parameters for the "sendUserMail()" function');
  }

  const from = getSendgridFrom(app);

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

  if (!context?.auth) { throw new Error('Permission denied: missing auth context.'); }
  const blockframesAdmin = await db.doc(`blockframesAdmin/${context.auth.uid}`).get();
  if (!blockframesAdmin.exists) { throw new Error('Permission denied: you are not blockframes admin'); }

  if (!email) {
    throw new Error('Email is mandatory for creating user');
  }

  try {
    const newUser = await createUserFromEmail(email, app);
    const toUser = getUserEmailData(newUser.user, newUser.password);
    const urlToUse = applicationUrl[app];

    const template = userInvite(toUser, orgEmailData, urlToUse);
    await sendMailFromTemplate(template, app);

    return newUser.user;
  } catch (e) {
    throw new Error(`There was an error while sending email to newly created user : ${e.message}`);
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
    await admin.auth().updateUser(uid, { emailVerified: true});

    const { _meta } = await getDocument<PublicUser>(`users/${uid}`);
    _meta.emailVerified = true;
    db.doc(`users/${uid}`).update({ _meta });
  } catch (e) {
    throw new Error(`There was an error while verifying email : ${e.message}`);
  }
}
