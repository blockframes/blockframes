import { CatalogSearch } from './search.form';
import { Movie, MovieSale } from '@blockframes/movie/movie/+state';
import { AFM_DISABLE } from '@env';
import startCase from 'lodash/startCase';

function productionYearBetween(movie: Movie, range: { from: number; to: number }): boolean {
  if (!range || !(range.from && range.to)) {
    return true;
  }
  // prevent from default error that property is undefined
  if (typeof range.from && typeof range.to) {
    return movie.main.productionYear >= range.from && movie.main.productionYear <= range.to;
  }
}
function hasLanguage(
  movie: Movie,
  language: { name: string; original: boolean; dubbed: boolean; subtitle: boolean }
): boolean {
  if (!language) {
    return true;
  }
  let original = true;
  let dubbed = true;
  let subtitle = true;
  if (language.original) {
    original = movie.main.languages.includes(language.name.toLowerCase());
  }
  if (language.dubbed) {
    dubbed = movie.versionInfo.dubbings.includes(language.name.toLowerCase());
  }
  if (language.subtitle) {
    subtitle = movie.versionInfo.subtitles.includes(language.name.toLowerCase());
  }
  return original && dubbed && subtitle;
}

function types(movie: Movie, movieGenre: string[]): boolean {
  if (!movieGenre.length) {
    return true;
  }
  // we have to make it lowercase to make sure we are comparing correctly
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

function productionStatus(movie: Movie, movieStatus: string[]): boolean {
  if (!movieStatus.length) {
    return true;
  }
  // we have to make it lowercase to make sure we are comparing correctly
  const movieStatusToLowerCase = movieStatus.map(status => status.toLowerCase());
  for (let i = 0; i < movieStatusToLowerCase.length; i++) {
    if (movieStatusToLowerCase[i] === movie.main.status) {
      return true;
    }
  }
}

function salesAgent(movie: Movie, salesAgents: string[]): boolean {
  if (!salesAgents.length) {
    return true;
  }
  for (let i = 0; i < salesAgents.length; i++) {
    if (salesAgents[i] === movie.salesAgentDeal.salesAgent.displayName) {
      return true;
    }
  }
}

function certifications(movie: Movie, movieCertification: string[]): boolean {
  if (!movieCertification.length) {
    return true;
  }
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
// TODO #979 - check if availabilities filter is needed
function availabilities(deals: MovieSale[], range: { from: Date; to: Date }): boolean {
  if (!range || !(range.from && range.to)) {
    return true;
  }
  return (
    deals.some(sale => {
      if (sale.rights) {
        const from: Date = (sale.rights.from as any).toDate();
        /**
         * Check if range.from is inside of a sales
         */
        return from.getTime() < range.from.getTime();
      }
    }) &&
    deals.some(sale => {
      if (sale.rights) {
        const to: Date = (sale.rights.to as any).toDate();
        return to.getTime() > range.to.getTime();
      }
    })
  );
}

function territories(movie: Movie, territory: string): boolean {
  if (!territory) {
    return true;
  }
  return movie.salesAgentDeal.territories.includes(territory.toLowerCase());
}
function media(movie: Movie, movieMediaType: string): boolean {
  if (!movieMediaType) {
    return true;
  }
  return movie.salesAgentDeal.medias.includes(movieMediaType.toLowerCase());
}

/**
 * @description filtering function for the searchbar in the header of the movie search page
 * @param movie current movie to filter on,
 * @param text the string that got input in the searchbar
 * @param type determine for what properties we should search
 */
function textSearch(movie: Movie, text: string, type: string): boolean {
  /* If searchbar is empty, return all movies */
  if (!text || !type) {
    return true;
  }
  switch (type) {
    case 'director':
      for (const director of movie.main.directors) {
        if (
          director.firstName.includes(startCase(text)) ||
          director.lastName.includes(startCase(text))
        ) {
          return true;
        } else {
          /**
           * If the user is typing the whole name of the directory
           * we can't be sure if he types the last name first and the first name
           * last, so wee need to concat the names and use some regex to remove
           * the whitespaces which might be there.
           */
          const concatedName = concatingStrings(director.firstName, director.lastName);
          return concatedName.toLowerCase().includes(text.toLowerCase().replace(/\s+/g, ''));
        }
      }
      break;
    case 'title':
      const filterValue = text.toLowerCase();
      return movie.main.title.international.toLowerCase().includes(filterValue);
    case 'keywords':
      for (const word of movie.promotionalDescription.keywords) {
        // TODO #1268 store keywords in lowercase in DB so we dont need starCase form lodash
        if (word.includes(startCase(text))) {
          return true;
        }
      }
      break;
  }
}

function concatingStrings(first: string, last: string): string {
  return first.replace(/\s+/g, '') + last.replace(/\s+/g, '');
}
// TODO #1271 - remove when algolia is ready
export function filterMovie(movie: Movie, filter: CatalogSearch, deals?: MovieSale[]): boolean {
  const hasEveryLanguage = Object.keys(filter.languages)
    .map(name => ({
      ...filter.languages[name],
      name
    }))
    .every(language => hasLanguage(movie, language));
  const hasMedia = filter.medias.every(movieMedia => media(movie, movieMedia));
  const hasTerritory = filter.territories.every(territory => territories(movie, territory));
  if (AFM_DISABLE) {
    //TODO: #1146
    return (
      productionYearBetween(movie, filter.productionYear) &&
      hasEveryLanguage &&
      types(movie, filter.type) &&
      certifications(movie, filter.certifications) &&
      productionStatus(movie, filter.status) &&
      availabilities(deals, filter.availabilities) &&
      hasTerritory &&
      hasMedia
    );
  } else {
    return (
      hasEveryLanguage &&
      types(movie, filter.type) &&
      productionStatus(movie, filter.status) &&
      salesAgent(movie, filter.salesAgent) &&
      textSearch(movie, filter.searchbar.text, filter.searchbar.type)
    );
  }
}
