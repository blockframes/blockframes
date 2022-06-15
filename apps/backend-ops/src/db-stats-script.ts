import { getCollection } from '@blockframes/firebase-utils';
import { Contract, Movie } from '@blockframes/model';


export async function dbStatsScript() {

  const movies = await getCollection<Movie>('movies');

  const contracts = await getCollection<Contract>('contracts');

  ///////
  // AC
  ///////
  const moviesOnCatalog = movies.filter(m => m.app.catalog.access === true);
  console.log(`--------- Movies on catalog with "app.catalog.access === true" : ${moviesOnCatalog.length}`);

  // No video
  const noVideo = moviesOnCatalog.filter(m => !m.promotional?.videos?.otherVideos || m.promotional.videos.otherVideos.length === 0);
  logData('No video (empty promotional.videos.otherVideos)', noVideo);

  // No poster
  const noPosterAC = moviesOnCatalog.filter(m => !m.poster.storagePath);
  logData('Movies with no poster (empty poster.storagePath)', noPosterAC);

  // No prizes
  const noPrizes = moviesOnCatalog.filter(m => m.customPrizes.length === 0 && m.prizes.length === 0);
  logData('No Prizes > customPrizes.length === 0 && prizes.length === 0', noPrizes);

  // European qualification not set (certfications.length === 0)
  const noEuQualif = moviesOnCatalog.filter(m => m.certifications.length === 0);
  logData('European qualification not set (certfications.length === 0)', noEuQualif);

  // No Keywords keywords.length === 0
  const noKw = moviesOnCatalog.filter(m => m.keywords.length === 0);
  logData('No Keywords keywords.length === 0', noKw);

  // No Release media (originalRelease.length === 0)
  const noReleaseMedia = moviesOnCatalog.filter(m => m.originalRelease.length === 0);
  logData('No Release media (originalRelease.length === 0)', noReleaseMedia);

  // No OV available (isOriginalVersionAvailable === false)
  const noOv = moviesOnCatalog.filter(m => m.isOriginalVersionAvailable === false);
  logData('No OV available (isOriginalVersionAvailable === false)', noOv);

  // No Avails (AC titles referenced in 0 contract.titleId)
  const noAvails = moviesOnCatalog.filter(m => !contracts.some(c => c.titleId === m.id));
  logData('No Avails (AC titles referenced in 0 contract.titleId)', noAvails);

  ///////
  // AM
  ///////

  const moviesOnFestival = movies.filter(m => m.app.festival.access === true);
  console.log(`--------- Movies on festival with "app.festival.access === true" : ${moviesOnFestival.length}`);

  // No poster
  const noPosterAM = moviesOnFestival.filter(m => !m.poster.storagePath);
  logData('Movies with no poster (empty poster.storagePath)', noPosterAM);

  // Release year <= 2020
  const releaseYearUnder2020 = moviesOnFestival.filter(m => m.release.year <= 2020);
  logData('Movies Release year <= 2020 (release.year < 2020)', releaseYearUnder2020);

}


function logData(desc: string, movies: Movie[]) {
  console.log(`-- ${desc}: ${movies.length}`);
  movies.forEach(m => console.log(m.id));
}