import { Firestore, Storage } from '../admin';
import { MovieDocument, PromotionalElement } from '@blockframes/movie/+state/movie.firestore';
import { getStorageBucketName } from 'apps/backend-functions/src/internals/firebase';
import { Credit } from '@blockframes/utils/common-interfaces';
import { get } from 'https';
import { sanitizeFileName } from '@blockframes/utils/file-sanitizer';
import { OldImgRef, OldPublicUser, OldPublicOrganization } from './old-types';

const EMPTY_REF: OldImgRef = {
  ref: '',
  urls: { original: '' }
};

/**
 * Migrate old ImgRef objects to new one.
 */
export async function upgrade(db: Firestore, storage: Storage) {

  await db
    .collection('users')
    .get()
    .then(async users => await updateUsers(users, storage));

  await db
    .collection('orgs')
    .get()
    .then(async orgs => await updateOrganizations(orgs, storage));

  await db
    .collection('movies')
    .get()
    .then(async movies => await updateMovies(movies, storage));

  console.log('Updating ImgRef in users, organizations and movies done.');
}

async function updateUsers(
  users: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  storage: Storage
) {
  return Promise.all(
    users.docs.map(async doc => {
      const updatedUser = await updateUserAvatar(doc.data() as OldPublicUser, storage);
      await doc.ref.set(updatedUser);
    })
  );
}

async function updateOrganizations(
  organizations: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  storage: Storage
) {
  return Promise.all(
    organizations.docs.map(async doc => {
      const updatedOrg = await updateOrgLogo(doc.data() as OldPublicOrganization, storage);
      await doc.ref.set(updatedOrg);
    })
  );
}

async function updateMovies(
  movies: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  storage: Storage
) {
  return Promise.all(
    movies.docs.map(async doc => {
      const movie = doc.data() as MovieDocument;

      const keys = ['banner', 'poster', 'still_photo'];

      for (const key of keys) {
        if (!!movie.promotionalElements[key]) {
          const value: PromotionalElement | PromotionalElement[] = movie.promotionalElements[key];
          if (Array.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
              movie.promotionalElements[key][i] = await updateMovieField(value[i], 'media', storage);
            }
          } else {
            movie.promotionalElements[key] = await updateMovieField(value, 'media', storage);
          }
        }
      }

      for (const key in movie.salesCast) {
        const value: Credit[] = movie.salesCast[key];
        for (let i = 0; i < value.length; i++) {
          movie.salesCast[key][i] = await updateMovieField(value[i], 'avatar', storage);
        }
      }

      for (const key in movie.main.stakeholders) {
        const value: Credit[] = movie.main.stakeholders[key];
        for (let i = 0; i < value.length; i++) {
          movie.main.stakeholders[key][i] = await updateMovieField(value[i], 'logo', storage);
        }
      }

      for (let i = 0; i < movie.main.directors.length; i++) {
        movie.main.directors[i] = await updateMovieField(movie.main.directors[i], 'avatar', storage);
      }
      await doc.ref.set(movie);
    })
  );
}

const updateMovieField = async <T extends Credit | PromotionalElement>(
  value: T,
  imgRefFieldName: 'avatar' | 'logo' | 'media',
  storage: Storage
): Promise<T> => {
  const newImageRef = await updateImgRef(value, imgRefFieldName, storage);
  value[imgRefFieldName] = newImageRef;
  return value;
}

const updateUserAvatar = async (user: OldPublicUser, storage: Storage) => {

  const newImageRef = await updateImgRef(user, 'avatar', storage);
  user.avatar = newImageRef;
  return user;
};

const updateOrgLogo = async (org: OldPublicOrganization, storage: Storage) => {
  const newImageRef = await updateImgRef(org, 'logo', storage);
  org.logo = newImageRef;
  return org;
};


const updateImgRef = async (
  element: OldPublicUser | OldPublicOrganization | Credit | PromotionalElement,
  key: 'logo' | 'avatar' | 'media',
  storage: Storage
): Promise<OldImgRef> => {

  // get the current ref
  const media = element[key]; // get old ImgRef format

  // ## if it's empty:
  if (!media || !media.ref || typeof media === 'string') {
    // just put an empty ref
    return EMPTY_REF;
  }

  // ### get the old file
  const { ref, urls } = media as OldImgRef;

  // ### copy it to a new location
  const bucket = storage.bucket(getStorageBucketName());

  try {
    const fileName = ref.split('/').pop();
    const to = bucket.file(ref.replace(fileName, sanitizeFileName(ref)));
    // we try to download it directly from it's original url
    if (!!urls.original) {

      console.log(`downloading ${ref}`);

      await new Promise((resolve, reject) => {
        // create a write stream to save the image in google cloud storage
        const saveImage = to.createWriteStream({ contentType: 'image/jpeg' })
          .on('error', (err) => { console.log('save error', err); reject(err) })
          .once('finish', () => resolve());

        // download the image and save it
        get(urls.original, result => {
          result.pipe(saveImage);
        }).on('error', err => { console.log('fail to download because of', err); reject(err) });
      });

      console.log('download OK');

      const [signedUrl] = await to.getSignedUrl({ action: 'read', expires: '01-01-3000', version: 'v2' });

      // delete previous image
      const from = bucket.file(ref);
      await from.delete();
      console.log('Removed previous');

      media.urls.original = signedUrl;
      return media;
    } else {
      console.log('Empty ref');
      return EMPTY_REF;
    }

  } catch (e) {
    console.log('Empty ref');
    return EMPTY_REF;
  }
}
