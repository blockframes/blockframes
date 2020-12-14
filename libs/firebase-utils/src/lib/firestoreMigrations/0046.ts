import { Firestore } from '@blockframes/firebase-utils';
import { MovieDocument } from '@blockframes/movie/+state/movie.firestore';

/**
 * Update the screener with fake ref if missing
*/
export async function upgrade(db: Firestore) {
    const movies = await db.collection('movies').get();
    const batch = db.batch();

    movies.docs.map(movieDoc => {
        let data = movieDoc.data();
        if (data.genres.inlcudes('comingAge')) {
            data.genres = data.genres.map(genre => {
                if (genre === 'comingAge') {
                    return 'youngAdult';
                }
                return genre;
            })
        }
        return batch.set(movieDoc.ref, data);
    })
    await batch.commit();
}