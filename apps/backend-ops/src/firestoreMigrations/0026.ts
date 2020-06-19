import { Firestore, Storage } from '../admin';
import { getStorageBucketName } from 'apps/backend-functions/src/internals/firebase';
import { PromotionalElement, Credit } from '@blockframes/movie/+state/movie.model';
import { PublicUser } from '@blockframes/user/types';
import { PublicOrganization } from 'apps/backend-functions/src/data/types';



/**
 * Migrate old ImgRef objects to new one.
 */
export async function upgrade(db: Firestore, storage: Storage) {

  /* await db
       .collection('users')
       .get()
       .then(async users => await updateUsers(users, storage));
 
   await db
       .collection('orgs')
       .get()
       .then(async orgs => await updateOrganizations(orgs, storage));*/

  await db
    .collection('movies')
    .get()
    .then(async movies => await updateMovies(movies, storage));

  console.log('Updating ImgRef in users, organizations and movies done.');
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
            movieData.promotionalElements[key][i] = await updateMovieField(movieData.id, `promotionalElements.${key}[${i}]`, value[i], 'media', storage);
          }
        } else {
          movieData.promotionalElements[key] = await updateMovieField(movieData.id, `promotionalElements.${key}`, value, 'media', storage);
        }
      }
    }

    for (const key in movieData.salesCast) {
      const value: Credit[] = movieData.salesCast[key];
      for (let i = 0; i < value.length; i++) {
        movieData.salesCast[key][i] = await updateMovieField(movieData.id, `salesCast.${key}`, value[i], 'avatar', storage);
      }
    }

    for (const key in movieData.main.stakeholders) {
      const value: Credit[] = movieData.main.stakeholders[key];
      for (let i = 0; i < value.length; i++) {
        movieData.main.stakeholders[key][i] = await updateMovieField(movieData.id, `main.stakeholders.${key}`, value[i], 'logo', storage);
      }
    }

    for (let i = 0; i < movieData.main.directors.length; i++) {
      movieData.main.directors[i] = await updateMovieField(movieData.id, `main.directors[${i}]`, movieData.main.directors[i], 'avatar', storage);
    }
    await movie.ref.set(movieData);
  })

  await Promise.all(updatesMovie);
}

async function updateMovieField(
  movieID: string,
  fieldName: string,
  value: Credit | PromotionalElement,
  imgRefFieldName: 'avatar' | 'logo' | 'media',
  storage: Storage) {
  const mediaDestination = `movies/${movieID}/${fieldName}.${imgRefFieldName}`;
  const newImageRef = await updateImgRef(mediaDestination, value, imgRefFieldName, storage);
  value[imgRefFieldName] = newImageRef;
  return value;
}

async function updateImgRef(
  destinationFolder: string,
  element: PublicUser | PublicOrganization | Credit | PromotionalElement,
  key: 'logo' | 'avatar' | 'media',
  storage: Storage) {
  // get the current ref
  const media = element[key]; // get old ImgRef format

  // get the old file
  const { ref } = media as { ref: string, url: string };
  const fileName = ref.split('/').pop();
  const fileNameParts = fileName.split('.');
  const extension = fileNameParts[fileNameParts.length - 1];

  const newFileName = `${fileName.substr(0, fileName.length - extension.length)}png`;
  console.log(`New filename is : ${newFileName}`)

  // Set the new folder in the bucket
  const newPngFile = `${destinationFolder}/fallback/${newFileName}`;
  const bucket = storage.bucket(getStorageBucketName());

  const output = bucket.file(newPngFile);
  const [exists] = await output.exists();

  // if the file doesn't exists in our storage bucket
  if (exists) {
    // Get the signedUrl to update the field in the database
    const signedUrl = await output.getSignedUrl({ action: 'read', expires: '01-01-3000', version: 'v2' })
    media.fallback = signedUrl;
  } else {
    console.log(`File ${newPngFile} does not exists.`)
  }

  return media;
}
