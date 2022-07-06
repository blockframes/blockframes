import { getCollection } from '@blockframes/firebase-utils';
import { Contract, Movie, Term } from '@blockframes/model';


export async function dbStatsScript() {

  await vincent1602022();
}

async function camille28062022Contracts() {
  const contracts = await getCollection<Contract>('contracts');

  let line: string[] = [];

  line.push(`contractId`);
  line.push(`sellerId`);
  line.push(`parentTermId`);
  line.push(`status`);
  line.push(`termIds`);
  line.push(`titleId`);
  line.push(`type`);
  printCSVline(line);
  
  contracts.forEach(c => {
    line = [];
    line.push(c.id);
    line.push(c.sellerId);
    line.push(c.parentTermId);
    line.push(c.status);
    line.push(c.termIds?.join(' '));
    line.push(c.titleId);
    line.push(c.type);
    printCSVline(line);
  });

}

async function camille28062022Terms() {
  const terms = await getCollection<Term>('terms');

  let line: string[] = [];

  line.push(`termId`);
  line.push(`contractId`);
  line.push(`duration from`);
  line.push(`duration to`);
  line.push(`exclusive`);
  line.push(`medias`);
  line.push(`territories`);

  printCSVline(line);
  
  terms.forEach(t => {
    line = [];
    line.push(t.id);
    line.push(t.contractId);
    line.push(t.duration.from.toISOString());
    line.push(t.duration.to.toISOString());
    line.push(t.exclusive ? 'yes': 'no');
    line.push(t.medias.join(' '));
    line.push(t.territories.join(' '));

    printCSVline(line);
  });

}



function printCSVline(str: string[]) {
  console.log(str.join(';'));
}

async function vincent1602022() {
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