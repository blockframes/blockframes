import { Firestore } from '../admin';

/**
 * RIP the movie model with several sections
 */
export async function upgrade(db: Firestore) {
  const movies = await db.collection('movies').get();
  const batch = db.batch();

  movies.docs.forEach( movieDoc => {
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
      boxOffice: budget.boxOffice || null,
      cast: salesCast.cast || null,
      certifications: salesInfo.certifications || null,
      color: salesInfo.color || null,
      contentType: main.contentType || null,
      crew: salesCast.crew || null,
      customGenres: main.customGenres || null,
      directors: main.directors || null,
      estimatedBudget: budget.estimatedBudget || null,
      format: salesInfo.format || null,
      formatQuality: salesInfo.formatQuality || null,
      genres: main.genres || null,
      internalRef: main.internalRef || null,
      keyAssets: promotionalDescription.keyAssets || null,
      keywords: promotionalDescription.keywords || null,
      languages: versionInfo.languages || null,
      logline: story.logline || null,
      originalLanguages: main.originalLanguages || null,
      originalRelease: salesInfo.originalRelease || null,
      originCountries: main.originCountries || null,
      poster: main.poster || null,
      prizes: festivalPrizes.prizes || null,
      producers: salesCast.producers || null,
      productionStatus: main.status || null,
      rating: salesInfo.rating || null,
      releaseYear: main.releaseYear || null,
      review: movieReview || null,
      scoring: salesInfo.scoring || null,
      soundFormat: salesInfo.soundFormat || null,
      stakeholders: production.stakeholders || null,
      storeConfig: main.storeConfig || null,
      synopsis: story.synopsis || null,
      title: main.title || null,
      totalBudget: budget.totalBudget || null,
      totalRunTime: main.totalRunTime || null
    };

    return batch.set(movieDoc.ref, newData);
  });

  console.log('Movie completely flattened !');
  await batch.commit();
}
