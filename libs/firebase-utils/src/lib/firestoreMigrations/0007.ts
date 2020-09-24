// @ts-nocheck
import { Firestore } from '../types';
import { createPrice } from '@blockframes/utils/common-interfaces/price';
import admin from 'firebase-admin';
import Timestamp = admin.firestore.Timestamp;

export async function upgrade(db: Firestore) {
  const orgs = await db.collection('orgs').get();
  const batch = db.batch();

  orgs.docs.forEach(x => {
    const data = x.data();
    const update = {};

    if (data.created && typeof data.created === typeof 42) {
      update['created'] = Timestamp.fromMillis(data.created);
    }
    if (data.updated && typeof data.updated === typeof 42) {
      update['updated'] = Timestamp.fromMillis(data.updated);
    }

    if (Object.keys(update).length > 0) {
      batch.update(x.ref, update);
    }
  });

  return await batch.commit();
}
