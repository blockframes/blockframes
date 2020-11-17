import { Firestore } from '@blockframes/firebase-utils';
import { createDocumentMeta } from '@blockframes/utils/models-meta';
import { runChunks } from '../firebase-utils';

export async function upgrade(db: Firestore) {
  const orgs = await db.collection('orgs').get();

  return runChunks(orgs.docs, async (doc) => {
    const org = doc.data();

    const meta = createDocumentMeta();

    const newData = {
      ...org,
    };

    if (org.created) {
      meta.createdAt = org.created;
      delete newData.created;
    }

    if (org.updated) {
      meta.updatedAt = org.updated;
      delete newData.updated;
    }

    delete newData?.movieIds;

    newData._meta = meta;
    await doc.ref.set(newData);
  });

}
