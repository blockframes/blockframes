import { db } from '../testing-cypress';

/**
 * Do not use this - this deletes the events from DB but they are still cached
 * in the app - use the helper function instead
 * @deprecated
 * @param sellerUid uid of seller user
 * @returns a promise which resolves when docs are deleted
 */
export async function deleteAllSellerEvents(sellerUid: string) {
  const sellerOrgSnap = await db.collection('users').doc(sellerUid).get()
  const sellerOrgUid = sellerOrgSnap.get('orgId') as string;
  const docsToDeleteSnap = await db.collection('events').where('ownerOrgId', '==', sellerOrgUid).get();
  const dbBatch = db.batch();
  docsToDeleteSnap.forEach(snap => dbBatch.delete(snap.ref))
  return dbBatch.commit()
}

export async function getAllSellerEvents(sellerUid: string) {
  const sellerOrgSnap = await db.collection('users').doc(sellerUid).get()
  const sellerOrgUid = sellerOrgSnap.get('orgId') as string;
  console.log(`This seller's OrgId is: ${sellerOrgUid}`)
  const eventsSnap = await db.collection('events').where('ownerOrgId', '==', sellerOrgUid).get();
  console.log(`There were ${eventsSnap.size} events found for this org`)
  return eventsSnap.docs.map(doc => doc.id);
}
