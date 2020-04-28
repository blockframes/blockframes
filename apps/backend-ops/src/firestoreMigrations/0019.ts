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
    const user = doc.data();
    if (user.avatar || user.avatar === '') {
      const { ref, url } = user.avatar;
      delete user.avatar;

      const newData = {
        ...user,
        avatar: createNewImgRef(ref, url)
      };
      return batch.set(doc.ref, newData);
    }
  });
}

async function updateOrganizations(
  organizations: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  batch: FirebaseFirestore.WriteBatch
) {
  organizations.forEach(async doc => {
    const organization = doc.data();
    if (organization.logo) {
      const { ref, url } = organization.logo;
      delete organization.logo;

      const newData = {
        ...organization,
        logo: createNewImgRef(ref, url)
      };
      return batch.set(doc.ref, newData);
    }
  });
}

async function updateMovies(
  movies: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  batch: FirebaseFirestore.WriteBatch
) {
  movies.forEach(async doc => {
    const movie = doc.data();

    updatePromotionalElementsMedia(movie.promotionalElements);
    updateSalesCastAvatar(movie.salesCast);
    updateDirectorsAvatar(movie.main.directors);
    updateStakeholdersLogo(movie.main.stakeholders);

    return batch.set(doc.ref, movie);
  });
}

function updatePromotionalElementsMedia(elements) {
  for (const key in elements) {
    if (Array.isArray(elements[key])) {
      elements[key] = elements[key].map(value => {
        if (value.hasOwnProperty('media')) {
          const { ref, url } = value.media;
          delete value.media;
          return {
            ...value,
            media: createNewImgRef(ref, url)
          };
        } else {
          return {
            ...value,
            logo: createNewImgRef()
          };
        }
      });
    } else {
      const { ref, url } = elements[key].media;
      delete elements[key].media;

      elements[key] = {
        ...elements[key],
        media: createNewImgRef(ref, url)
      };
    }
  }
}

function updateSalesCastAvatar(salesCast) {
  for (const key in salesCast) {
    if (Array.isArray(salesCast[key])) {
      salesCast[key] = salesCast[key].map(cast => {
        if (cast.hasOwnProperty('avatar')) {
          const { ref, url } = cast.avatar;
          delete cast.avatar;
          return {
            ...cast,
            avatar: createNewImgRef(ref, url)
          };
        } else {
          return {
            ...cast,
            logo: createNewImgRef()
          };
        }
      });
    } else {
      const { ref, url } = salesCast[key].avatar;
      delete salesCast[key].avatar;

      salesCast[key] = {
        ...salesCast[key],
        avatar: createNewImgRef(ref, url)
      };
    }
  }
}

function updateDirectorsAvatar(directors) {
  for (const key in directors) {
    if (directors[key].hasOwnProperty('avatar')) {
      const { ref, url } = directors[key].avatar;
      delete directors[key].avatar;
      directors[key] = {
        ...directors[key],
        avatar: createNewImgRef(ref, url)
      };
    } else {
      directors[key] = {
        ...directors[key],
        avatar: createNewImgRef()
      };
    }
  }
}

function updateStakeholdersLogo(stakeholders) {
  for (const key in stakeholders) {
    if (Array.isArray(stakeholders[key])) {
      stakeholders[key] = stakeholders[key].map(sh => {
        if (sh.hasOwnProperty('logo')) {
          const { ref, url } = sh.logo;
          delete sh.logo;
          return {
            ...sh,
            logo: createNewImgRef(ref, url)
          };
        } else {
          return {
            ...sh,
            logo: createNewImgRef()
          };
        }
      });
    } else {
      const { ref, url } = stakeholders[key].logo;
      delete stakeholders[key].logo;
      stakeholders[key] = {
        ...stakeholders[key],
        logo: createNewImgRef(ref, url)
      };
    }
  }
}

/**
 * Create an empty ImgRef object
 * @param ref
 * @param url
 */
function createNewImgRef(ref?, url?) {
  return {
    refs: {
      original: ref ? ref : ''
    },
    urls: {
      original: url ? url : ''
    }
  };
}
