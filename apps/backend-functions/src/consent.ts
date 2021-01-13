import { EventContext } from 'firebase-functions';
import * as functions from 'firebase-functions';
import { db, getStorageBucketName } from './internals/firebase';
import { getDocument } from './data/internals';

import { Consents } from '@blockframes/consents/+state/consents.firestore';
import { PublicUser } from './data/types';
import { createAccess, createShare } from '@blockframes/consents/+state/consents.model';

type CallableContext = functions.https.CallableContext;

/**
 * @param data
 * @param context
 */
export const createConsent = async (
  data: { consentType: 'access' | 'share'; ip: string; docId: string; filePath?: string },
  context: CallableContext
): Promise<Consents<Date>> => {
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
  }

  if (consentType === 'share') {

    const share = createShare({
      lastName: userData.lastName,
      firstName: userData.firstName,
      email: userData.email,
      userId: userData.uid,
      date: new Date(),
      docId,
      ip,
    })
  }

  const newConsent = await db.collection('consents').doc(userData.orgId).set(data);
  const saveConsent = db.batch();
  console.log(newConsent);

  return;
};

export async function onDocumentPermissionCreate(
  _: FirebaseFirestore.DocumentSnapshot,
  context: EventContext
) {
  const { docID, orgID } = context.params;

  // if the permission let you write the document, it means that you are the first owner.
  return db.doc(`consents/${docID}`).set({ authorOrgId: orgID }, { merge: true });
}
