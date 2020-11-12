import { Firestore } from '@blockframes/firebase-utils';

export async function upgrade(db: Firestore) {
    const orgsCol = await db.collection('orgs').get();
    const batch = db.batch()

    orgsCol.docs.map(orgDoc => {

        const org = orgDoc.data();

        delete org.movieIds;

        batch.set(orgDoc.ref, org);
    })

    await batch.commit()
}