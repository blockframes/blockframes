import { Firestore } from '@blockframes/firebase-utils';
import { OrganizationDocument } from '@blockframes/model';
import { runChunks } from '../firebase-utils';

interface OrganizationDocumentOld extends OrganizationDocument {
  cart: any[]
}

export async function upgrade(db: Firestore) {

  const orgs = await db.collection('orgs').get();

  /*
    Remove cart[] from org documents
  */
  return runChunks(orgs.docs, async (orgDoc) => {
    const org = orgDoc.data() as OrganizationDocumentOld;
    delete org.cart;
    await orgDoc.ref.set(org);
  });
}
