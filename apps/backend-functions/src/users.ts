import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { db } from './internals/firebase';
import { userResetPassword, sendDemoRequestMail, sendContactEmail, accountCreationEmail } from './templates/mail';
import { sendMailFromTemplate, sendMail } from './internals/email';
import { RequestDemoInformations, PublicUser } from './data/types';
import { storeSearchableUser, deleteObject } from './internals/algolia';
import { algolia } from './environments/environment';
import { upsertWatermark } from './internals/watermark';
import { getDocument, getFromEmail } from './data/internals';
import { getSendgridFrom } from '@blockframes/utils/apps';
import { sendFirstConnexionEmail } from './internals/users';

type UserRecord = admin.auth.UserRecord;
type CallableContext = functions.https.CallableContext;

// @TODO (#2821)
/*
export const startVerifyEmailFlow = async (data: any) => {
  const { email, app } = data;
  const from = getSendgridFrom(app);

  if (!email) {
    throw new Error('email is a mandatory parameter for the "sendVerifyEmail()" function');
  }

  const verifyLink = await admin.auth().generateEmailVerificationLink(email);
  await sendMailFromTemplate(userVerifyEmail(email, verifyLink), from);
};
*/

export const startAccountCreationEmailFlow = async (data: any) => {
  const { email, app, firstName } = data;
  const from = getSendgridFrom(app);

  if (!email) {
    throw new Error('email is a mandatory parameter for the "sendVerifyEmail()" function');
  }

  try {
    const verifyLink = await admin.auth().generateEmailVerificationLink(email);
    const template = accountCreationEmail(email, verifyLink, firstName);
    await sendMailFromTemplate(template, from);
  } catch (e) {
    throw new Error(`There was an error while sending account creation email : ${e.message}`);
  }

};

export const startResetPasswordEmail = async (data: any) => {
  const { email, app } = data;
  const from = getSendgridFrom(app);

  if (!email) {
    throw new Error('email is a mandatory parameter for the "sendResetPassword()" function');
  }

  try {
    const resetLink = await admin.auth().generatePasswordResetLink(email);
    const template = userResetPassword(email, resetLink);
    await sendMailFromTemplate(template, from);
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
        /**
         * @dev TODO (#2826) since there is now way to get the used app when this function is triggered,
         * we cannot set the custom "from" here
        */
        await startAccountCreationEmailFlow({ email, firstName: u.firstName });

      }
      tx.update(userDocRef, { email, uid });
    } else {
      tx.set(userDocRef, { email, uid });
    }
  });

  // update Algolia index
  const userSnap = await userDocRef.get();
  const userData = userSnap.data() as PublicUser;

  return Promise.all([
    storeSearchableUser(userData),
    upsertWatermark(userData),
  ]);
};

export async function onUserCreateDocument(snap: FirebaseFirestore.DocumentSnapshot): Promise<any> {
  const after = snap.data() as PublicUser;
  if (!!after.firstName) { await sendFirstConnexionEmail(after) }
  return true;
}

export async function onUserUpdate(change: functions.Change<FirebaseFirestore.DocumentSnapshot>): Promise<any> {
  const before = change.before.data() as PublicUser;
  const after = change.after.data() as PublicUser;


  if ((before.firstName === undefined || before.firstName === '') && !!after.firstName) {
    await sendFirstConnexionEmail(after);
  }

  const promises: Promise<any>[] = [];

  // if name, email or avatar has changed : update algolia record
  if (
    before.firstName !== after.firstName ||
    before.lastName !== after.lastName ||
    before.email !== after.email ||
    before.avatar?.urls.original !== after.avatar?.urls.original
  ) {
    promises.push(storeSearchableUser(after));
  }

  // if name or email has changed : update watermark
  if (
    before.firstName !== after.firstName ||
    before.lastName !== after.lastName ||
    before.email !== after.email
  ) {
    promises.push(upsertWatermark(after));
  }

  return Promise.all(promises);
}

export async function onUserDelete(
  userSnapshot: FirebaseFirestore.DocumentSnapshot<PublicUser>,
): Promise<any> {

  // update Algolia index
  return deleteObject(algolia.indexNameUsers, userSnapshot.id);
}

export const sendDemoRequest = async (data: RequestDemoInformations): Promise<RequestDemoInformations> => {
  const from = getSendgridFrom(data.app);
  await sendMail(sendDemoRequestMail(data), from);

  return data;
}

export const sendUserMail = async (data: any, context: CallableContext): Promise<any> => {
  const { subject, message } = data;

  if (!context?.auth) { throw new Error('Permission denied: missing auth context.'); }
  const user = await getDocument<PublicUser>(`users/${context.auth.uid}`);

  if (!subject || !message) {
    throw new Error('Subject and message are mandatory parameters for the "sendUserMail()" function');
  }

  let from;
  if (user.orgId) {
    from = await getFromEmail(user.orgId);
  }

  await sendMail(sendContactEmail(`${user.firstName} ${user.lastName}`, user.email, subject, message), from);
}
