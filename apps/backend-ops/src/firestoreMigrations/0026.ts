import { Firestore, Storage } from '../admin';
import { getStorageBucketName } from 'apps/backend-functions/src/internals/firebase';
import { PromotionalElement, Credit } from '@blockframes/movie/+state/movie.model';
import { PublicUser } from '@blockframes/user/types';
import { PublicOrganization } from 'apps/backend-functions/src/data/types';
import { createOldHostedMedia as createHostedMedia } from './old-types';

/**
 * Migrate old ImgRef objects to new one.
 */
export async function upgrade(db: Firestore, storage: Storage) {

  try {
    await db
      .collection('users')
      .get()
      .then(async users => updateUsers(users, storage));
  } catch (error) {
    console.log(`An error happened while updating users: ${error.message}`);
  }

  try {
    await db
      .collection('orgs')
      .get()
      .then(async orgs => updateOrganizations(orgs, storage));
  } catch (error) {
    console.log(`An error happened while updating orgs: ${error.message}`);
  }

  try {
    await db
      .collection('movies')
      .get()
      .then(async movies => updateMovies(movies, storage));

    console.log('Updating ImgRef in users, organizations and movies done.');
  } catch (error) {
    console.log(`An error happened while updating movies: ${error.message}`);
  }
}

async function updateUsers(
  users: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  storage: Storage
) {
  return Promise.all(
    users.docs.map(async doc => {
      const updatedUser = await updateUserAvatar(doc.data() as PublicUser, storage);
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
      const updatedOrg = await updateOrgLogo(doc.data() as PublicOrganization, storage);
      await doc.ref.set(updatedOrg);
    })
  );
}

export async function updateMovies(
  movies: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  storage: Storage) {

  const updatesMovie = movies.docs.map(async movie => {
    const movieData = movie.data();
    const keys = ['banner', 'poster', 'still_photo'];

    for (const key of keys) {
      if (!!movieData.promotionalElements[key]) {
        const value: PromotionalElement | PromotionalElement[] = movieData.promotionalElements[key];
        if (Array.isArray(value)) {
          for (let i = 0; i < value.length; i++) {
            movieData.promotionalElements[key][i] = await updateMovieField(value[i], 'media', storage);
          }
        } else {
          movieData.promotionalElements[key] = await updateMovieField(value, 'media', storage);
        }
      }
    }

    for (const key in movieData.salesCast) {
      const value: Credit[] = movieData.salesCast[key];
      for (let i = 0; i < value.length; i++) {
        movieData.salesCast[key][i] = await updateMovieField(value[i], 'avatar', storage);
      }
    }

    for (const key in movieData.main.stakeholders) {
      const value: Credit[] = movieData.main.stakeholders[key];
      for (let i = 0; i < value.length; i++) {
        movieData.main.stakeholders[key][i] = await updateMovieField(value[i], 'logo', storage);
      }
    }

    for (let i = 0; i < movieData.main.directors.length; i++) {
      movieData.main.directors[i] = await updateMovieField(movieData.main.directors[i], 'avatar', storage);
    }
    await movie.ref.set(movieData);
  })

  await Promise.all(updatesMovie);
}

async function updateMovieField(
  value: Credit | PromotionalElement,
  imgRefFieldName: 'avatar' | 'logo' | 'media',
  storage: Storage) {
  const newImageRef = await updateImgRef(value, imgRefFieldName, storage);
  value[imgRefFieldName] = newImageRef;
  return value;
}

const updateUserAvatar = async (user: PublicUser, storage: Storage) => {
  const newImageRef = await updateImgRef(user, 'avatar', storage);
  user.avatar = newImageRef;
  return user;
};

const updateOrgLogo = async (org: PublicOrganization, storage: Storage) => {
  const newImageRef = await updateImgRef(org, 'logo', storage);
  org.logo = newImageRef;
  return org;
};

async function updateImgRef(
  element: PublicUser | PublicOrganization | Credit | PromotionalElement,
  key: 'logo' | 'avatar' | 'media',
  storage: Storage) {
  // get the current ref
  const media = element[key]; // get old ImgRef format

  if (!!media) {
    // get the old file
    const { ref } = media as { ref: string, url: string };

    if (!!ref) {
      const fileName = ref.split('/').pop();
      const fileNameParts = fileName.split('.');
      const extension = fileNameParts[fileNameParts.length - 1];

      const newFileName = `${fileName.substr(0, fileName.length - extension.length)}png`;
      console.log(`New filename is : ${newFileName}`)

      // Set the new folder in the bucket
      const newPngFile = ref.replace('/original/', '/fallback/').replace(fileName, newFileName);
      const bucket = storage.bucket(getStorageBucketName());

      const output = bucket.file(newPngFile);
      const [exists] = await output.exists();

      // if the file doesn't exists in our storage bucket
      if (exists) {
        // Get the signedUrl to update the field in the database
        const [signedUrl] = await output.getSignedUrl({ action: 'read', expires: '01-01-3000', version: 'v2' })
        media.urls.fallback = signedUrl;
      } else {
        console.log(`File ${newPngFile} does not exists.`)
      }
    }
    return media;
  } else {
    // imgref is undefined, creating blank one
    return createHostedMedia(media);
  }
}
