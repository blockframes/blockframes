import { db } from '../testing-cypress';

export async function deleteAllSellerEvents(sellerUid: string) {
  const sellerOrgSnap = await db.collection('users').doc(sellerUid).get();
  const sellerOrgUid : string = sellerOrgSnap.data().orgId;
  const docsToDeleteSnap = await db.collection('events').where('ownerOrgId', '==', sellerOrgUid).get();
  const dbBatch = db.batch();
  docsToDeleteSnap.forEach(snap => dbBatch.delete(snap.ref));
  await dbBatch.commit();
  return true;
}
