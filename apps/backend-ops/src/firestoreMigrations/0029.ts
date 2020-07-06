import { Firestore } from '../admin';
import { Movie } from '@blockframes/movie/+state/movie.model';


// Create technical section in the movie model
export async function upgrade(db: Firestore) {
  const movies = await db.collection('movies').get();
  const batch = db.batch();

  movies.docs.map(movie => {
    const data = movie.data();

    const newData = createTechnicalSection(data as Partial<Movie>);

    delete data.salesInfo.color;
    delete data.salesInfo.format;
    delete data.salesInfo.formatQuality;
    delete data.salesInfo.soundFormat;

    return batch.set(movie.ref, newData);
  })

  await batch.commit();
  console.log('Create new technical section on movie.');
}


export function createTechnicalSection(movie: Partial<Movie>) {
  const { salesInfo } = movie;

  const newData = {
    ...movie,
    salesInfo: {
      broadcasterCoproducers: salesInfo.broadcasterCoproducers || null,
      certifications: salesInfo.certifications || null,
      originalRelease: salesInfo.originalRelease || null,
      physicalHVRelease: salesInfo.physicalHVRelease || null,
      rating: salesInfo.rating || null,
      releaseYear: salesInfo.releaseYear || null,
      scoring: salesInfo.scoring || null,
    },
    technicalInfo: {
      color: salesInfo.color || null,
      format : salesInfo.format || null,
      formatQuality : salesInfo.formatQuality || null,
      soundFormat : salesInfo.soundFormat || null
    }
  };
  return newData;
}
