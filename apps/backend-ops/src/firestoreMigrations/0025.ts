import { Firestore, Storage } from '../admin';
import { MovieDocument, PromotionalElement } from '@blockframes/movie/+state/movie.firestore';
import { Credit } from '@blockframes/utils/common-interfaces';
import { get } from 'https';
import { sanitizeFileName } from '@blockframes/utils/file-sanitizer';
import { OldImgRef, OldPublicUser, OldPublicOrganization } from './old-types';
import { firebase } from '@env';
export const { storageBucket } = firebase;

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
            for (let i = 0 ; i < value.length ; i++) {
              movie.promotionalElements[key][i] = await updateMovieField(movie.id, `promotionalElements.${key}[${i}]`, value[i], 'media', storage);
            }
          } else {
            movie.promotionalElements[key] = await updateMovieField(movie.id, `promotionalElements.${key}`, value, 'media', storage);
          }
        }
      }

      for (const key in movie.salesCast) {
        const value: Credit[] = movie.salesCast[key];
        for (let i = 0 ; i < value.length ; i++) {
          movie.salesCast[key][i] = await updateMovieField(movie.id, `salesCast.${key}`, value[i], 'avatar', storage);
        }
      }

      for (const key in movie.main.stakeholders) {
        const value: Credit[] = movie.main.stakeholders[key];
        for (let i = 0 ; i < value.length ; i++) {
          movie.main.stakeholders[key][i] = await updateMovieField(movie.id, `main.stakeholders.${key}`, value[i], 'logo', storage);
        }
      }

      for (let i = 0 ; i < movie.main.directors.length ; i ++) {
        movie.main.directors[i] = await updateMovieField(movie.id, `main.directors[${i}]`, movie.main.directors[i], 'avatar', storage);
      }
      await doc.ref.set(movie);
    })
  );
}

const updateMovieField = async <T extends Credit | PromotionalElement>(
  movieID: string,
  fieldName: string,
  value: T,
  imgRefFieldName: 'avatar' | 'logo' | 'media',
  storage: Storage
): Promise<T> => {
  const mediaDestination = `movies/${movieID}/${fieldName}.${imgRefFieldName}`;
  const newImageRef = await updateImgRef(mediaDestination, value, imgRefFieldName, storage);
  value[imgRefFieldName] = newImageRef;
  return value;
}

const updateUserAvatar = async (user: OldPublicUser, storage: Storage) => {
  const destinationFolder = `users/${user.uid}/avatar`;
  const newImageRef = await updateImgRef(destinationFolder, user, 'avatar', storage);
  user.avatar = newImageRef;
  return user;
};

const updateOrgLogo = async (org: OldPublicOrganization, storage: Storage) => {
  const destinationFolder = `orgs/${org.id}/logo`;
  const newImageRef = await updateImgRef(destinationFolder, org, 'logo', storage);
  org.logo = newImageRef;
  return org;
};


const updateImgRef = async (
  destinationFolder: string,
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

  // ## if it exists:

  // ### get the old file
  const { ref, url } = media as { ref: string, url: string };
  const oldFileName = ref.split('/').pop();

  // if fileName is too long we rename it to prevent UNIX ERROR : file name too long in the resize image function
  const newFileName = oldFileName.length > 80 ? sanitizeFileName(oldFileName) : oldFileName;

  // ### copy it to a new location
  const newPath = `${destinationFolder}/original/${newFileName}`;
  const bucket = storage.bucket(storageBucket);

  try {
    const from = bucket.file(ref);
    const to = bucket.file(newPath);

    const [exists] = await from.exists();

    // if the file doesn't exists in our storage bucket
    if (! exists) {

      // we try to download it directly from it's url (prod, staging, vincent's storage, ...)
      if (!!url) {

        console.log(`downloading ${destinationFolder}`);

        await new Promise((resolve, reject) => {
          // create a write stream to save the image in google cloud storage
          const saveImage = to.createWriteStream({contentType: 'image/jpeg'})
            .on('error', (err) => {console.log('save error', err); reject(err)})
            .once('finish', () => resolve());

          // download the image and save it
          get(url, result => {
            result.pipe(saveImage);
          }).on('error', err => {console.log('fail to download because of', err); reject(err)});
        });

        console.log('download OK');

        const [signedUrl] = await to.getSignedUrl({action: 'read', expires: '01-01-3000', version: 'v2'});
        // ### send the current update thingy
        return { ref: newPath, urls: {original: signedUrl }};

      } else {
        return EMPTY_REF;
      }
    } else {
      await from.copy(to);

      const [signedUrl] = await to.getSignedUrl({action: 'read', expires: '01-01-3000', version: 'v2'});
      // ### send the current update thingy
      return { ref: newPath, urls: {original: signedUrl }};
    }
  } catch (e) {
    return EMPTY_REF;
  }
}
