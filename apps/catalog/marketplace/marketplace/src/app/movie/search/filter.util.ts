import { CatalogSearch } from './search.form';
import { Movie, MovieSale } from '@blockframes/movie/movie/+state';
import { AFM_DISABLE } from '@env';

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

function searchbar(movie: Movie, text: string, type: string): boolean {
  console.log(!!text);
  /* If searchbar is empty, return all movies */
  if (!text && !type) {
    return true;
  } else if (type === 'director' && !!text) {
    return movie.main.directors.some(val => {
      return (
        val.firstName.indexOf(text.toLowerCase()) >= 0 ||
        val.lastName.indexOf(text.toLowerCase()) >= 0
      );
    });
  } else if (type === 'title' && !!text) {
    return movie.main.title.international.indexOf(text.toLowerCase()) >= 0;
  } else if (type === 'keywords' && !!text) {
    return movie.promotionalDescription.keywords.includes(text);
  } else {
    /* We still want to return every movie when type is not defined */
    return true;
  }
}

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
      searchbar(movie, filter.searchbar.text, filter.searchbar.type)
    );
  }
}
