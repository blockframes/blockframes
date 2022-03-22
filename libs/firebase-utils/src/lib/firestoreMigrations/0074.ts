import { Firestore } from '../types';
import { runChunks } from '../firebase-utils';
import { Organization } from '@blockframes/model';

/**
 * Remove isBlockchainEnabled from org documents
 * @param db
 * @returns
 */
export async function upgrade(db: Firestore) {
  const orgs =  await db.collection('orgs').get()

  return runChunks(orgs.docs, async (doc) => {
    const org = doc.data() as Organization;

    delete (org as any).isBlockchainEnabled;

    await doc.ref.set(org);
    
  }).catch(err => console.error(err));


}
