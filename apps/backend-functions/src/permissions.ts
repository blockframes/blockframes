import { EventContext } from 'firebase-functions';
import { db } from './internals/firebase';
import { removeAllSubcollections } from './utils';

/**
 * When a user creates a permisssion for a document we index its id,
 * this is used in the firestore rules: a user cannot create a document if it already exists
 * in the index.
 *
 */
export async function onDocumentPermissionCreate(
  _: FirebaseFirestore.DocumentSnapshot,
  context: EventContext
) {
  const { docID, orgID } = context.params;

  // if the permission let you write the document, it means that you are the first owner.
  // @TODO used only here, update db-cleaning script & tests + rename isBrandNewDoc rule
  // Is this collection still usefull at all ?
  return db.doc(`docsIndex/${docID}`).set({ authorOrgId: orgID }, { merge: true });
}

export async function onPermissionDelete(snap: FirebaseFirestore.DocumentSnapshot) {
  const batch = db.batch();

  // Delete sub-collections (documentPermissions)
  await removeAllSubcollections(snap, batch);

  return batch.commit();
}