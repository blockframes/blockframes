import { Firestore } from '@blockframes/firebase-utils';


export async function upgrade(db: Firestore) {
    const orgsCol = await db.collection('orgs').get();
    const moviesCol = await db.collection('movies').get();
    const batch = db.batch();
    /* Get all the orgs and filter out orgs that are just empty objects */
    const orgs = orgsCol.docs.map(doc => doc.data()).filter(org => org?.id)
    const movieIds = orgs.map(org => org.movieIds).flat().filter(id => id);
    movieIds.map(id => {
        /* For every id find the corresponding movie */
        const movieDoc = moviesCol.docs.find(doc => doc.ref.id === id);
        const movie = movieDoc?.data();
        /* Check if the movie object holds an orgIds array already, if not, add it. */
        if (movie?.['orgIds']) {
            movie['orgIds'].push(id);
        } else {
            Object.assign(movie, { orgIds: [id] })
        }
        batch.set(movieDoc.ref, movie)
    })

    console.log('add orgIds to movie doc');
    await batch.commit();
}
