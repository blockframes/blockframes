import { CatalogSearch } from './marketplace-search.form';
import { Movie } from '@blockframes/movie/movie/+state';

function productionYearBetween(movie: Movie, range: { from: Date; to: Date }): boolean {
  // prevent from default error that property is undefined
  if (range.from instanceof Date && range.to instanceof Date) {
    return (
      movie.main.productionYear >= range.from.getFullYear() &&
      movie.main.productionYear <= range.to.getFullYear()
    );
  } else {
    return false;
  }
}
function hasLanguage(
  movie: Movie,
  language: { original: boolean; dubbed: boolean; subtitle: boolean }
): boolean {
  // We need a way to define, which language is dubbed and which is original,
  // cause right now only the formGroup holds the name of the language. So
  // I'm not sure how to filter in this situation
  // return movie.main.languages.filter(language => language.includes(language))
  return true;
}
function types(movie: Movie, movieGenre: string[]): boolean {
  console.log(movieGenre);
  console.log(
    movie.main.genres.filter(genre => {
      const x = movieGenre.map(y => y.toLowerCase());
      return x.indexOf(genre) >= 0
    })
  );
  return true; /*  movie.main.genres.filter(genre => movieGenre.indexOf(genre) >= 0); */
}
function certifications(movie: Movie, movieCertification: string[]): boolean {
  // In the mock movies Vincent provided there are no of these fields so we have to check if they
  // exists and we can filter those values
  /*   return !!movie.salesInfo.certifications.filter(
    certification => movieCertification.indexOf(certification) >= 0
  ); */
  return true;
}
function availabilities(movie: Movie, range: { from: Date; to: Date }): boolean {
  /*   let availableFrom;
  let availableTo;
  // In the mock movies Vincent provided there are no of these fields so we have to check if they
  // exists and we can filter those values.
  if (!!movie.sales.filter(x => x.rights.from) && !!movie.sales.filter(x => x.rights.from)) {
    availableFrom = movie.sales.filter(movie => movie.rights.from >= range.from);
    availableTo = movie.sales.filter(movie => movie.rights.to <= range.to);
    return !!(availableFrom && availableTo);
  } */
  return true;
}
function territories(movie: Movie, territory: string[]): boolean {
  return !!movie.salesAgentDeal.territories.filter(territories => {
    return territory.indexOf(territories) >= 0;
  });
}
function media(movie: Movie, medias: string[]): boolean {
  return true;
}

export function filterMovie(movie: Movie, filter: CatalogSearch): boolean {
  return (
    productionYearBetween(movie, filter.productionYear) &&
    // Add language function when its working
    types(movie, filter.type) &&
    certifications(movie, filter.certifications) &&
    availabilities(movie, filter.availabilities) &&
    territories(movie, filter.territories) &&
    media(movie, filter.medias)
  );
}
