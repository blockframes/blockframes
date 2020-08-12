import { Firestore } from '../admin';
import { PublicUser } from '@blockframes/user/types';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { PromotionalHostedMedia } from '@blockframes/movie/+state/movie.firestore';
import { createHostedMedia, ExternalMedia } from '@blockframes/media/+state/media.firestore';
import { OldImgRef } from './old-types';

/**
 * Migrate old medias & images and some refactoring on the movie.
 * - user
 *   - avatar: old image -> new image
 *   - watermark: old image -> new media
 * - org
 *   - logo: old image -> new image
 * - movie
 *   - poster: `promotionalElements` old image array -> `main` single new image
 *   - banner: `promotionalElements` old image -> `main` new image
 *   - every single `promotionalElements`: old image -> new image or new media
 *   - `promotionalElements` still_photo: array of old images -> record of new image
 *   - `promotionalElements` trailer: deleted
 */
export async function upgrade(db: Firestore) {
  try {
    const users: PublicUser[] = await db.collection('users').get().then(ref => ref.docs.map(d => d.data() as PublicUser));
    updateUsers(db, users);
  } catch (error) {
    console.log(`An error happened while updating users: ${error.message}`);
  }

  try {
    const movies: Movie[] = await db.collection('movies').get().then(ref => ref.docs.map(d => d.data() as Movie));
    updateMovies(db, movies);
  } catch (error) {
    console.log(`An error happened while updating movies: ${error.message}`);
  }

  try {
    const orgs: Organization[] = await db.collection('orgs').get().then(ref => ref.docs.map(d => d.data() as Organization));
    updateOrgs(db, orgs);
  } catch (error) {
    console.log(`An error happened while updating organizations: ${error.message}`);
  }
}

async function updateUsers(db: Firestore, users: PublicUser[]) {
  for (const user of users) {
    const updatedUser = updateImgRef(user, 'avatar') as PublicUser;
    db.doc(`users/${user.uid}`).set(updatedUser);
  }
}

function updateOrgs(db: Firestore, orgs: Organization[]) {
  for (const org of orgs) {
    const updatedOrg = updateImgRef(org, 'logo');
    db.doc(`orgs/${org.id}`).set(updatedOrg);
  }
}

async function updateMovies(db: Firestore, movies: Movie[]) {
  const externalMediaLinks = ['promo_reel_link', 'screener_link', 'teaser_link', 'trailer_link'];
  const hostedMediaLinks = ['presentation_deck', 'scenario'];
  const legacyKeysExternalMedia = ['originalFileName', 'originalRef', 'ref'];
  const legacyKeysHostedMedia = ['originalFileName', 'originalRef'];

  for (const movie of movies) {
    for (const link of externalMediaLinks) {
      const media = movie.promotionalElements[link].media;
      movie.promotionalElements[link].media = createExternalMedia({
        url: media.url ? media.url : media.urls && media.urls.original ? media.urls.original : '',
      });
      // DELETE
      for (const key of legacyKeysExternalMedia) {
        delete movie.promotionalElements[link].media[key];
      }
    }

    for (const link of hostedMediaLinks) {
      const media = movie.promotionalElements[link].media;
      movie.promotionalElements[link].media = createHostedMedia({
        ref: media.ref ? media.ref : media.originalRef ? media.originalRef : '',
        url: media.url ? media.url : media.urls && media.urls.original ? media.urls.original : '',
      });
      // DELETE
      legacyKeysHostedMedia.forEach(key => delete movie.promotionalElements[link].media[key]);
    }

    // update and move banner to main
    if (movie.promotionalElements['banner']) {
      movie.main.banner = updateImgRef<PromotionalHostedMedia>(movie.promotionalElements['banner'], 'media');
      delete movie.promotionalElements['banner'];
    }

    // update and move poster to main
    movie.promotionalElements?.['poster']?.forEach((poster: PromotionalHostedMedia, index: number) => {
      if (index === 0) {
        movie.main.poster = updateImgRef(poster, 'media') as PromotionalHostedMedia;
        delete movie.promotionalElements['poster'];
      } else {
        delete movie.promotionalElements['poster']; // other posters shouldn't exist, but if do they are deleted
      }
    });

    // update still photos from an array with old ImgRef to a record with new ImgRef
    const still_photo: Record<string, PromotionalHostedMedia> = {};
    if (movie.promotionalElements.still_photo && movie.promotionalElements.still_photo.length) {
      (movie.promotionalElements.still_photo as any).forEach((still, index) => {
        if (!!still.media?.ref || !!still.media?.urls?.original) {
          still_photo[`${index}`] = updateImgRef<PromotionalHostedMedia>(still, 'media');
        }
      });
    }
    movie.promotionalElements.still_photo = still_photo;

    // remove trailer
    if (movie.promotionalElements['trailer']) delete movie.promotionalElements['trailer'];

    db.doc(`movies/${movie.id}`).set(movie);
  }
}

function createExternalMedia(media: Partial<ExternalMedia>): ExternalMedia {
  return { url: media?.url || '' };
}

/**
 * @dev This updates the ImgRef structure on DB from {ref, urls} to : {ref, url} 
 * But references points to old structore on storage.
 * @param element 
 * @param property 
 */
function updateImgRef<T extends (PublicUser | Organization | PromotionalHostedMedia)>(
  element: T,
  property: 'avatar' | 'logo' | 'media'
) {
  if (!element[property] || 'original' in element[property]) return element;

  const imgRef: OldImgRef = Object.assign(<OldImgRef>{}, element[property]);
  const sizes = ['original', 'fallback', 'xs', 'md', 'lg'];
  const legacyKeys = ['ref', 'urls'];

  for (const size of sizes) {
    element[property][size] = createHostedMedia({
      ref: size === 'original' ? (imgRef.ref ? imgRef.ref : '') : '',
      url: imgRef.urls?.[size] || ''
    });
  }

  legacyKeys.forEach(key => delete element[property][key]);
  return element;
}
