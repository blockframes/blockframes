import { CatalogSearch } from './marketplace-search.form';
import { Movie } from '@blockframes/movie/movie/+state';

function productionYearBetween(movie: Movie, range: { from: Date; to: Date }): boolean {
  // prevent from default error that property is undefined
  if (range.from instanceof Date && range.to instanceof Date) {
    return (
      movie.main.productionYear >= range.from.getFullYear() &&
      movie.main.productionYear <= range.to.getFullYear()
    );
  }
}
function hasLanguage(
  movie: Movie,
  language: { name: string; original: boolean; dubbed: boolean; subtitle: boolean }
): boolean {
  const hasMovieLanguage = movie.main.languages.includes(language.name);
  return hasMovieLanguage;
}
function types(movie: Movie, movieGenre: string[]): boolean {
  // we have to make it lowercase to make sure we are comapring correctly
  const movieGenreToLowerCase = movieGenre.map(type => type.toLowerCase());
  const movieTypesToLowerCase = movie.main.genres.map(genre => genre.toLowerCase());
  for (let i = 0; i < movieTypesToLowerCase.length; i++) {
    for (let k = 0; k < movieGenreToLowerCase.length; k++) {
      if (movieTypesToLowerCase[i] === movieGenreToLowerCase[k]) {
        return true;
      }
    }
  }
}
function certifications(movie: Movie, movieCertification: string[]): boolean {
  // we have to make it lowercase to make sure we are comapring correctly
  const movieFilterCertificationToLowerCase = movieCertification.map(certification =>
    certification.toLowerCase()
  );
  const movieCertificationToLowerCase = movie.salesInfo.certifications.map(cert =>
    cert.toLowerCase()
  );
  for (let i = 0; i <= movieFilterCertificationToLowerCase.length; i++) {
    for (let k = 0; k <= movieCertificationToLowerCase.length; k++) {
      if (movieCertificationToLowerCase[i] === movieFilterCertificationToLowerCase[k]) {
        return true;
      }
    }
  }
}
// Parameter movie cant't be of type Movie cause mock data is wrong
function availabilities(movie: any, range: { from: Date; to: Date }): boolean {
 return true;
}
function territories(movie: Movie, territory: string): boolean {
  return movie.salesAgentDeal.territories.includes(territory);
}
function media(movie: Movie, moiveMediaType: string): boolean {
  return movie.salesAgentDeal.medias.includes(moiveMediaType);
}

export function filterMovie(movie: Movie, filter: CatalogSearch): boolean {
  const hasEveryLanguage = Object.keys(filter.languages)
    .map(name => ({
      ...filter.languages[name],
      name
    }))
    .some(language => hasLanguage(movie, language));
    const hasMedia = filter.medias.some(movieMedia => media(movie, movieMedia));
    const hasTerritory = filter.territories.some(territory => territories(movie, territory));
  return (
    productionYearBetween(movie, filter.productionYear) &&
    hasEveryLanguage &&
    types(movie, filter.type) &&
    certifications(movie, filter.certifications) &&
    availabilities(movie, filter.availabilities) &&
    hasTerritory &&
    hasMedia
  );
}
