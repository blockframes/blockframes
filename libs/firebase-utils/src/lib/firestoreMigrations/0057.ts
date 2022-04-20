import { Firestore } from '@blockframes/firebase-utils';
import { OrganizationDocument } from '@blockframes/model';
import { runChunks } from '../firebase-utils';


export async function upgrade(db: Firestore) {

  const orgs = await db.collection('orgs').get();

  /*
    Media Refactoring for orgs documents:
    - create empty array if it doesn't exists
    - convert wrong notes mapping into array : document.notes: {} -> document.notes: [{}]
  */
  return runChunks(orgs.docs, async (orgDoc) => {
    const org = orgDoc.data() as OrganizationDocument;

    if (!org.documents || !org.documents.notes) {
      org.documents = { notes: [], videos: [] };
    } else if (!Array.isArray(org.documents.notes)) {
      const singleNote = org.documents.notes;
      org.documents.notes = [singleNote];
    }

    await orgDoc.ref.set(org);
  });
}
