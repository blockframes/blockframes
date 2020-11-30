import { EventContext } from 'firebase-functions';
import { db } from './internals/firebase';
import { removeAllSubcollections } from './utils';

/**
 * When a user creates a permisssion for a document we index its id,
 * this is used in the firestore rules: a user cannot create a document if it already exists
 * in the index.
 *
 * This index might be used for other features, will come later.
 */
export async function onDocumentPermissionCreate(
  _: FirebaseFirestore.DocumentSnapshot,
  context: EventContext
) {
  const { docID, orgID } = context.params;

  // if the permission let you write the document, it means that you are the first owner.
  return db.doc(`docsIndex/${docID}`).set({ authorOrgId: orgID }, { merge: true });
}

export async function onPermissionDelete(snap: FirebaseFirestore.DocumentSnapshot) {
  const batch = db.batch();

  // Delete sub-collections (documentPermissions)
  await removeAllSubcollections(snap, batch);

  return batch.commit();
}