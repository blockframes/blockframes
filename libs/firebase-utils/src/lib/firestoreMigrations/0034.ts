import { Firestore } from '../types';

export async function upgrade(db: Firestore) {
  const movies = await db.collection('movies').get();
  const batch = db.batch();

  movies.docs.map(movieDoc => {
    const movie = movieDoc.data();

    const newData = {
      ...movie,
      cast: movie.cast.map(cast => {
        const { shortBiography } = cast;
        delete cast.shortBiography;
        return {
          ...cast,
          description: shortBiography || '',
          filmography: []
        }
      }),
      crew: movie.crew.map(crew => {
        const { shortBiography } = crew;
        delete crew.shortBiography;
        return {
          ...crew,
          description: shortBiography || '',
          filmography: []
        }
      }),
      directors: movie.directors.map(director => {
        return {
          ...director,
          description: '',
          filmography: []
        }
      }),
      producers: movie.producers.map(producer => {
        if (producer.role === 'exectuive-producer') {
          return {
            ...producer,
            role: 'executive-producer'
          }
        } else {
          return producer;
        }
      }),
      release: {
        status: '',
        year: movie.releaseYear
      },
      review: movie.review.map(review => {
        delete review.publicationDate;
        return review;
      }),
      runningTime: {
        status: '',
        time: movie.totalRunTime
      },
      stakeholders: updateStakeholders(movie)
    };

    return batch.set(movieDoc.ref, newData);
  })
  await batch.commit();
  console.log('Movies Updated !');
};

function updateStakeholders(movie) {
  const keys = Object.keys(movie.stakeholders);
  for (const key of keys) {
    if (key === 'executiveProducer') {
      movie.stakeholders.productionCompany = movie.stakeholders.executiveProducer;
      delete movie.stakeholders.executiveProducer;
    } else if (key === 'coProducer') {
      movie.stakeholders.coProductionCompany = movie.stakeholders.coProducer;
      delete movie.stakeholders.coProducer;
    }
  }

  return movie.stakeholders;
}
