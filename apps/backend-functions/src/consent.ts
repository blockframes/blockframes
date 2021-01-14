import * as functions from 'firebase-functions';
import { db } from './internals/firebase';
import { PublicUser } from './data/types';
import {
  createAccess,
  createShare,
  createConsent as _createConsent,
} from '@blockframes/consents/+state/consents.firestore';

type CallableContext = functions.https.CallableContext;

/**
 * @param data
 * @param context
 */
export const createConsent = async (
  data: { consentType: 'access' | 'share'; ip: string; docId: string; filePath?: string },
  context: CallableContext
): Promise<boolean> => {
  const { consentType, ip, docId, filePath } = data;

  if (!context?.auth) {
    throw new Error('Permission denied: missing auth context.');
  }

  const userDocRef = db.doc(`users/${context.auth.uid}`);
  const userSnap = await userDocRef.get();
  const userData = userSnap.data() as PublicUser;

  if (!userData) {
    throw new Error('Invalid user');
  }
  if (!userData.orgId) {
    throw new Error('Invalid organization');
  }

  if (!docId) {
    throw new Error('Undefined docId');
  }
  if (!ip) {
    throw new Error('Undefined ip');
  }

  let consent = _createConsent({
    id: userData.orgId,
  });

  const consentDocRef = db.doc(`consents/${consent.id}`);
  const consentSnap = await consentDocRef.get();
  const consentData = consentSnap.data() as any;

  if (!!consentData) {
    consent = _createConsent(consentData);
  }

  if (consentType === 'access') {
    if (!filePath) {
      throw new Error('Invalid filePath');
    }

    const access = createAccess({
      lastName: userData.lastName,
      firstName: userData.firstName,
      email: userData.email,
      userId: userData.uid,
      date: new Date(),
      filePath,
      docId,
      ip,
    });

    consent.access.push(access);
  } else if (consentType === 'share') {
    const share = createShare({
      lastName: userData.lastName,
      firstName: userData.firstName,
      email: userData.email,
      userId: userData.uid,
      date: new Date(),
      docId,
      ip,
    });

    consent.share.push(share);
  }

  const batch = db.batch();
  batch.set(consentDocRef, consent);
  await batch.commit();

  return true;
};
