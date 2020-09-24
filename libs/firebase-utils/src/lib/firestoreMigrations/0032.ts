import { Firestore } from '../types';

export async function upgrade(db :Firestore) {
  const batch = db.batch();
  const movies = await db.collection('movies').get();

  movies.docs.forEach(movieDoc => {
    const movieData = movieDoc.data();

    const { stakeholders, workType, productionYear } = movieData.main;

    delete movieData.main.productionYear;
    delete movieData.main.stakeholders;
    delete movieData.main.officialIds;
    delete movieData.main.shortSynopsis;
    delete movieData.main.workType;
    delete movieData.salesInfo.releaseYear;

    const newData = {
      ...movieData,
      main: {
        ...movieData.main,
        directors: movieData.main.directors.map(director => {
          const { shortBiography } = director;
          delete director.shortBiography;
          return {
            ...director,
          filmography: shortBiography || null
          }
        }),
        contentType: workType || null,
        releaseYear: productionYear || null,
      },
      production: {
        stakeholders: stakeholders || null
      }
    };

    return batch.set(movieDoc.ref, newData);
  })

  console.log('Main section of movie reworked.');
  await batch.commit();
}
