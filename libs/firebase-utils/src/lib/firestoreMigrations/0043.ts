import { Firestore } from '@blockframes/firebase-utils';
import { runChunks } from '../firebase-utils';

export async function upgrade(db: Firestore) {
    const orgsCol = await db.collection('orgs').get();
    const batch = db.batch();

    runChunks(orgsCol.docs, async orgDoc => {
        const org = orgDoc.data();
        delete org?.movieIds
        await orgDoc.ref.update(org)
    })

    console.log('deleted movieIds from orgs collection');
}
