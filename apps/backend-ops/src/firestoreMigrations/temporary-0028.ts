import { Firestore } from '../admin';
import { PublicUser } from '@blockframes/user/types';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { PromotionalImage } from '@blockframes/movie/+state/movie.firestore';
import { createHostedMedia, ExternalMedia } from '@blockframes/media/+state/media.model';
import { getCollection } from 'apps/backend-functions/src/data/internals';
import { OldImgRef } from './old-types';

/**
 * Migrate old watermarks into new ones (HostedMedia).
 */
export async function upgrade(db: Firestore) {
  try {
    const users = await getCollection<PublicUser>('users');
    updateUsers(db, users);
  } catch (error) {
    console.log(`An error happened while updating users: ${error.message}`);
  }

  try {
    const movies = await getCollection<Movie>('movies');
    updateMovies(db, movies);
  } catch (error) {
    console.log(`An error happened while updating movies: ${error.message}`);
  }

  try {
    const orgs = await getCollection<Organization>('orgs');
    updateOrgs(db, orgs);
  } catch (error) {
    console.log(`An error happened while updating organizations: ${error.message}`);
  }
}

async function updateUsers(db: Firestore, users: PublicUser[]) {
  for (const user of users) {
    let updatedUser = updateUserWatermark(user);
    updatedUser = updateImgRef(user, 'avatar') as PublicUser;
    db.doc(`users/${user.uid}`).set(updatedUser);
  }
}

function updateUserWatermark(user: PublicUser) {
  if (user.watermark?.url) return user; // already has new format
  const url = user?.watermark?.['urls']?.['original'] || user.watermark?.url;
  user.watermark = createHostedMedia({
    ref: user.watermark?.ref || '',
    url: url || ''
  });
  return user;
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
      movie.promotionalElements[link].media = createExternalMedia(
        movie.promotionalElements[link].media
      );
      // DELETE
      for (const key of legacyKeysExternalMedia) {
        delete movie.promotionalElements[link].media[key];
      }
    }

    for (const link of hostedMediaLinks) {
      const media = movie.promotionalElements[link].media;
      movie.promotionalElements[link].media = createHostedMedia({
        ref: media.ref ? media.ref : media.originalRef ? media.originalRef : '',
        url: media.url ? media.url : ''
      });
      // DELETE
      legacyKeysHostedMedia.forEach(key => delete movie.promotionalElements[link].media[key]);
    }

    // update and move banner to main
    movie.main.banner = updateImgRef<PromotionalImage>(movie.promotionalElements['banner'], 'media');
    if (movie.promotionalElements['banner']) delete movie.promotionalElements['banner'];

    // update and move poster to main
    movie.promotionalElements?.['poster']?.forEach((poster: PromotionalImage, index: number) => {
      if (index === 0) {
        movie.main.poster = updateImgRef(poster, 'media') as PromotionalImage;
        delete movie.promotionalElements['poster'];
      } else {
        delete movie.promotionalElements['poster']; // other posters shouldn't exist, but if do they are deleted
      }
    });

    // update still photos from an array with old ImgRef to a record with new ImgRef
    const still_photo: Record<string, PromotionalImage> = {};
    (movie.promotionalElements.still_photo as any).forEach((still, index) => {
      if (!!still.media?.ref || !!still.media?.urls?.original) {
        still_photo[`${index}`] = updateImgRef<PromotionalImage>(still, 'media');
      }
    });
    movie.promotionalElements.still_photo = still_photo;

    db.doc(`movies/${movie.id}`).set(movie);
  }
}

function createExternalMedia(media: Partial<ExternalMedia>): ExternalMedia {
  return { url: media?.url || '' };
}

function updateImgRef<T extends (PublicUser | Organization | PromotionalImage)>(
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
