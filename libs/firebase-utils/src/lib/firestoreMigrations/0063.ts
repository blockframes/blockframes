import { OrganizationDocument } from '@blockframes/shared/model';
import { runChunks } from '../firebase-utils';
import { Firestore } from '../types';

/**
 * Add an empty videos array on orgs.documents
 * @param db
 * @returns
 */
export async function upgrade(db: Firestore) {
  const orgs = await db.collection('orgs').get();

  return runChunks(orgs.docs, async doc => {
    const org = doc.data() as OrganizationDocument;
    let update = false;

    if (!Array.isArray(org.documents.videos)) {
      org.documents.videos = [];
      update = true;
    }

    if (update) {
      await doc.ref.set(org);
    }
  });
}
