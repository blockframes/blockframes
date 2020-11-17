import { Firestore, runChunks } from '@blockframes/firebase-utils';
import { createDocumentMeta } from '@blockframes/utils/models-meta';

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

    newData._meta = meta;
    await doc.ref.set(newData);
  });
}
