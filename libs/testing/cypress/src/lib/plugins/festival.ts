import { db } from '../testing-cypress';



export async function getAllSellerEvents(sellerUid: string) {
  const sellerOrgSnap = await db.collection('users').doc(sellerUid).get()
  const sellerOrgUid = sellerOrgSnap.get('orgId') as string;
  console.log(`This seller's OrgId is: ${sellerOrgUid}`)
  const eventsSnap = await db.collection('events').where('ownerOrgId', '==', sellerOrgUid).get();
  console.log(`There were ${eventsSnap.size} events found for this org`)
  return eventsSnap.docs.map(doc => doc.id);
}
