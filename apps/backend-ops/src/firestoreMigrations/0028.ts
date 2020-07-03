import { Firestore } from '../admin';
import { PublicUser } from '@blockframes/user/types';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { Organization } from '@blockframes/organization/+state/organization.model';
import { createHostedMedia, ExternalMedia, ImgRef } from '@blockframes/media/+state/media.model';
import { getCollection } from 'apps/backend-functions/src/data/internals';
import { OldImgRef } from './oldInterfacesAndModels/imgRef';
import { PromotionalImage } from '@blockframes/movie/+state/movie.firestore';

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

function updateUsers(db: Firestore, users: PublicUser[]) {
    users.forEach(user => {
        let updatedUser = updateUserWatermark(user);
        updatedUser = updateImgRef(user, 'avatar') as PublicUser;
        db.doc(`users/${user.uid}`).set(updatedUser);
    })
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
  orgs.forEach(org => {
    const updatedOrg = updateImgRef(org, 'logo');
    db.doc(`orgs/${org.id}`).set(updatedOrg);
  })
}

function updateMovies(db: Firestore, movies: Movie[]) {
  const externalMediaLinks = ['promo_reel_link', 'screener_link', 'teaser_link', 'trailer_link'];
  const hostedMediaLinks = ['presentation_deck', 'scenario'];
  const legacyKeysExternalMedia = ['originalFileName', 'originalRef', 'ref'];
  const legacyKeysHostedMedia = ['originalFileName', 'originalRef'];

  movies.forEach(movie => {

    externalMediaLinks.forEach(link => {
      movie.promotionalElements[link].media = createExternalMedia(
        movie.promotionalElements[link].media
      );
      // DELETE
      legacyKeysExternalMedia.forEach(key => delete movie.promotionalElements[link].media[key]);
    });

    hostedMediaLinks.forEach(link => {
      const media = movie.promotionalElements[link].media;
      movie.promotionalElements[link].media = createHostedMedia({
        ref: media.ref ? media.ref : media.originalRef ? media.originalRef : '',
        url: media.url ? media.url : ''
      });
      // DELETE
      legacyKeysHostedMedia.forEach(key => delete movie.promotionalElements[link].media[key]);
    });

    movie.promotionalElements.banner = updateImgRef(movie.promotionalElements.banner, 'media') as PromotionalImage;

    db.doc(`movies/${movie.id}`).set(movie);

  })
}

function createExternalMedia(media: Partial<ExternalMedia>): ExternalMedia {
  return { url: media?.url || '' };
}

function updateImgRef(
  element: PublicUser | Organization | PromotionalImage,
  property: 'avatar' | 'logo' | 'media'
) {
  if (!element[property] || 'original' in element[property]) return element;

  const imgRef: OldImgRef = Object.assign(<OldImgRef>{}, element[property]);
  const sizes = ['original', 'fallback', 'xs', 'md', 'lg'];
  const legacyKeys = ['ref', 'urls'];

  sizes.forEach(size => {
    element[property][size] = createHostedMedia({
      ref: size === 'original' ? imgRef.ref ? imgRef.ref : '' : '',
      url: imgRef.urls?.[size] || ''
    });
  });

  legacyKeys.forEach(key => delete element[property][key]);
  return element;
}