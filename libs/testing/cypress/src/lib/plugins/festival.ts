import { db } from '../testing-cypress';

export async function deleteAllSellerEvents(sellerUid: string) {
  const sellerOrgSnap = await db.collection('users').doc(sellerUid).get()
  const sellerOrgUid = sellerOrgSnap.get('orgId') as string;
  const docsToDeleteSnap = await db.collection('events').where('ownerOrgId', '==', sellerOrgUid).get();
  const dbBatch = db.batch();
  docsToDeleteSnap.forEach(snap => dbBatch.delete(snap.ref))
  return dbBatch.commit()
}
