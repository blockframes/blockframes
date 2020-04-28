import { Firestore } from '../admin';

const updateStoreConfig = (oldStoreConfig) => {
  if (oldStoreConfig) {
    if (!oldStoreConfig.appAccess) {
      return {
        ...oldStoreConfig,
        appAccess: {
          catalog: true,
          festival: false
        }
      };
    } else {
      return oldStoreConfig;
    }
  }
};

/**
 * Add appAccess with catalog and festival booleans in storeConfig in movie documents.
 */
export async function upgrade(db: Firestore) {
  const movies = await db.collection('movies').get();

  const newMovieData = movies.docs.map(
    async (movieDocSnapshot: any): Promise<any> => {
      const movieData = movieDocSnapshot.data();

      const storeConfig = updateStoreConfig(movieData.main.storeConfig);

      if (storeConfig) {
        const newData = {
          ...movieData,
          main: {
            ...movieData.main,
            storeConfig
          }
        };
        return movieDocSnapshot.ref.set(newData);
      }
    }
  );
  await Promise.all(newMovieData);
  console.log('Updating movie documents done.');

/**
 * Migrate old ImgRef objects to new one.
 */
export async function upgrade(db: Firestore) {
  const users = await db.collection('users').get();
  const organizations = await db.collection('orgs').get();
  const movies = await db.collection('movies').get();
  const batch = db.batch();

  await updateUsers(users, batch);
  await updateOrganizations(organizations, batch);
  await updateMovies(movies, batch);

  console.log('Updating ImgRef in users, organizations and movies done.');
  return batch.commit();
}

async function updateUsers(
  users: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  batch: FirebaseFirestore.WriteBatch
) {
  users.forEach(async doc => {
    const user = updateAvatar(doc.data())
    return batch.set(doc.ref, user);
  })
}

async function updateOrganizations(
  organizations: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  batch: FirebaseFirestore.WriteBatch
) {
  organizations.forEach(async doc => {
    const organization = updateLogo(doc.data())
    return batch.set(doc.ref, organization);
  })
}

async function updateMovies(
  movies: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  batch: FirebaseFirestore.WriteBatch
) {
  movies.forEach(async doc => {
    const movie = doc.data();

    movie.main.directors = movie.main.directors.map(updateAvatar);
    for (const key in movie.promotionalElements) {
      movie.promotionalElements[key] = updateMedia(movie.promotionalElements[key])
    }
    for (const key in movie.main.salesCast) {
      movie.promotionalElements[key] = updateAvatar(movie.salesCast[key])
    }
    for (const key in movie.main.stakeholders) {
      movie.main.stakeholders[key] = updateLogo(movie.main.stakeholders[key])
    }

    return batch.set(doc.ref, movie);
  });
}

const update = (obj, fieldName) => {
  if (Array.isArray(obj)) {
    return obj.map(x => {
      const field = x[fieldName];
      return {
        ...x,
        [fieldName] : createNewImgRef(field?.ref, field?.url)
      }
    })
  } else {
    const field = obj[fieldName];
    return {
      ...obj,
      [fieldName]: createNewImgRef(field?.ref, field?.url)
    }
  }
}

const updateAvatar = x => update(x, 'avatar')
const updateLogo = x => update(x, 'logo')
const updateMedia = x => update(x, 'media')

/**
 * Create an ImgRef object
 * @param ref
 * @param url
 */
function createNewImgRef(ref, url) {
  return {
    refs: { original: ref || '' },
    urls: { original: url || '' }
  };
}
