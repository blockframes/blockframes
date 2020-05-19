import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { generate as passwordGenerator } from 'generate-password';
import { auth, db } from './internals/firebase';
import { userInvite, userVerifyEmail, welcomeMessage, userResetPassword, sendWishlist, sendWishlistPending, sendDemoRequestMail, sendContactEmail } from './templates/mail';
import { sendMailFromTemplate, sendMail } from './internals/email';
import { RequestDemoInformations, PublicUser, OrganizationDocument } from './data/types';
import { storeSearchableUser, deleteObject } from './internals/algolia';
import { algolia } from './environments/environment';
import { upsertWatermark } from './internals/watermark';
import { getDocument, getOrgAppName, getAppUrl, getFromEmail } from './data/internals';
import { App, getSendgridFrom } from '@blockframes/utils/apps';
import { templateIds } from '@env';

type UserRecord = admin.auth.UserRecord;
type CallableContext = functions.https.CallableContext;

interface UserProposal {
  uid: string;
  email: string;
}

export const startVerifyEmailFlow = async (data: any) => {
  const { email } = data;

  if (!email) {
    throw new Error('email is a mandatory parameter for the "sendVerifyEmail()" function');
  }

  const verifyLink = await admin.auth().generateEmailVerificationLink(email);
  await sendMailFromTemplate(userVerifyEmail(email, verifyLink));
};

export const startResetPasswordEmailFlow = async (data: any) => {
  const { email } = data;

  if (!email) {
    throw new Error('email is a mandatory parameter for the "sendResetPassword()" function');
  }

  const resetLink = await admin.auth().generatePasswordResetLink(email);
  await sendMailFromTemplate(userResetPassword(email, resetLink));
};

export const startWishlistEmailsFlow = async (data: any, context: CallableContext) => {
  const { wishlist } = data;

  if (!context || !context.auth) { throw new Error('Permission denied: missing auth context.'); }
  const user = await getDocument<PublicUser>(`users/${context.auth.uid}`);
  const org = await getDocument<OrganizationDocument>(`orgs/${user.orgId}`);
  const from = await getFromEmail(org);

  await sendMail(sendWishlist(`${user.firstName} ${user.lastName}`, org.denomination.public || org.denomination.full, wishlist), from);
  await sendMailFromTemplate(sendWishlistPending(user.email), from);
}

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
        await startVerifyEmailFlow({ email });
        await sendMailFromTemplate(welcomeMessage(email, u.firstName));
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

export async function onUserUpdate(change: functions.Change<FirebaseFirestore.DocumentSnapshot>): Promise<any> {
  const before = change.before.data() as PublicUser;
  const after = change.after.data() as PublicUser;

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

const generatePassword = () =>
  passwordGenerator({
    length: 12,
    numbers: true
  });

export const getOrCreateUserByMail = async (data: any): Promise<UserProposal> => {
  const { email, orgId } = data;

  try {
    const user = await auth.getUserByEmail(email);
    return { uid: user.uid, email };
  } catch {
    const password = generatePassword();

    // User does not exists, send them an email.
    const user = await auth.createUser({
      email,
      password,
      emailVerified: true,
      disabled: false
    });

    const org = await getDocument<OrganizationDocument>(`orgs/${orgId}`);
    const appName: App = await getOrgAppName(org);
    const urlToUse = await getAppUrl(org);
    const from = await getFromEmail(org);
    const templateToUse = appName === 'festival' ? templateIds.userCredentialsMarket : templateIds.userCredentialsContent;

    await sendMailFromTemplate(userInvite(email, password, org.denomination.full, urlToUse, templateToUse), from);

    return { uid: user.uid, email };
  }
};

export const sendDemoRequest = async (data: RequestDemoInformations): Promise<RequestDemoInformations> => {
  const from = getSendgridFrom(data.app);
  await sendMail(sendDemoRequestMail(data), from);

  return data;
}

export const sendUserMail = async (data: any, context: CallableContext): Promise<any> => {
  const { subject, message } = data;

  if (!context || !context.auth) { throw new Error('Permission denied: missing auth context.'); }
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
