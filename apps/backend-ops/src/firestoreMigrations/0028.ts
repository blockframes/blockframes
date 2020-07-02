import { Firestore } from "../admin";
import { PublicUser } from "@blockframes/user/types";
import { createHostedMedia, ExternalMedia } from "@blockframes/media/+state/media.model";
import { MovieDocument } from 'apps/backend-functions/src/data/types';

/**
 * Migrate old watermarks into new ones (HostedMedia).
 */
export async function upgrade(db: Firestore) {

    try {
        await db
            .collection('users')
            .get()
            .then(async users => updateUsers(users));

    } catch (error) {
        console.log(`An error happened while updating users: ${error.message}`);
    }

    try {
        await db
            .collection('movies')
            .get()
            .then(async movies => await updateMovies(movies));
    } catch (error) {
        console.log(`An error happened while updating movies: ${error.message}`);
    }
}

async function updateUsers(
    users: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
) {
    return Promise.all(
        users.docs.map(async doc => {
            const updatedUser = await updateUserWatermark(doc.data() as PublicUser);
            await doc.ref.set(updatedUser);
        })
    )
}

async function updateUserWatermark(
    user: PublicUser
) {
    user.watermark = createHostedMedia({
        ref: user.watermark['ref'],
        url: user.watermark['urls']['original']
    });
    return user;
}

async function updateMovies(movies: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>) {

    const externalMediaLinks = ['promo_reel_link', 'screener_link', 'teaser_link', 'trailer_link'];
    const hostedMediaLinks = ['presentation_deck', 'scenario'];
    const legacyKeys = ['originalFileName', 'originalRef', 'ref'];

    movies.docs.forEach(doc => {
        const movie = doc.data() as MovieDocument;
        externalMediaLinks.forEach(link => {
            movie.promotionalElements[link].media = createExternalMedia(movie.promotionalElements[link].media);
            // DELETE
            legacyKeys.forEach(key => delete movie.promotionalElements[link].media[key]);
        })

        hostedMediaLinks.forEach(link => {
            const media = movie.promotionalElements[link].media
            movie.promotionalElements[link].media = createHostedMedia({
                ref: media.ref ? media.ref : media.originalRef ? media.originalRef : '',
                url: media.url ? media.url : ''
            });

            // DELETE
            legacyKeys.forEach(key => delete movie.promotionalElements[link].media[key]);
        })
        doc.ref.set(movie)
    });
}

function createExternalMedia(media: Partial<ExternalMedia>): ExternalMedia {
    return { url: media?.url || '' };
}
