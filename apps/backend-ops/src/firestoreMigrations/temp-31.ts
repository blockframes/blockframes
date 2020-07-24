import { Firestore } from '../admin';

/**
 * RIP the movie model with several sections
 */
export async function upgrade(db: Firestore) {
  const movies = await db.collection('movies').get();
  const batch = db.batch();

  movies.docs.map( movieDoc => {
    const movie = movieDoc.data();
    const {
      budget,
      festivalPrizes,
      main,
      movieReview,
      production,
      promotionalElements,
      promotionalDescription,
      salesCast,
      salesInfo,
      story,
      versionInfo
    } = movie;

    delete movie.budget;
    delete movie.festivalPrizes;
    delete movie.main;
    delete movie.movieReview;
    delete movie.production;
    delete movie.promotionalDescription;
    delete movie.promotionalElements;
    delete movie.salesCast;
    delete movie.salesInfo;
    delete movie.story;
    delete movie.versionInfo;
    delete movie.salesAgentDeal;
    delete movie.deliveryIds;

    const newData = {
      ...movie,
      // The only section left
      promotional: promotionalElements,

      // All fields are now on the root of the movie
      banner: main.banner || null,
      boxOffice: budget.boxOffice || [],
      cast: salesCast.cast || [],
      certifications: salesInfo.certifications || [],
      color: salesInfo.color || '',
      contentType: main.contentType || '',
      crew: salesCast.crew || [],
      customGenres: main.customGenres || [],
      directors: main.directors || [],
      estimatedBudget: budget.estimatedBudget || {},
      format: salesInfo.format || '',
      formatQuality: salesInfo.formatQuality || '',
      genres: main.genres || [],
      internalRef: main.internalRef || '',
      keyAssets: promotionalDescription.keyAssets || '',
      keywords: promotionalDescription.keywords || [],
      languages: versionInfo.languages || {},
      logline: story.logline || '',
      originalLanguages: main.originalLanguages || [],
      originalRelease: salesInfo.originalRelease || {},
      originCountries: main.originCountries || [],
      poster: main.poster || null,
      prizes: festivalPrizes.prizes || [],
      producers: salesCast.producers || [],
      productionStatus: main.status || '',
      rating: salesInfo.rating || [],
      releaseYear: main.releaseYear || '',
      review: movieReview || [],
      scoring: salesInfo.scoring || '',
      soundFormat: salesInfo.soundFormat || '',
      stakeholders: production.stakeholders || {},
      storeConfig: main.storeConfig || {},
      synopsis: story.synopsis || '',
      title: main.title || {},
      totalBudget: budget.totalBudget || {},
      totalRunTime: main.totalRunTime || ''
    };

    return batch.set(movieDoc.ref, newData);
  });

  console.log('Movie completely flattened !');
  await batch.commit();
}
