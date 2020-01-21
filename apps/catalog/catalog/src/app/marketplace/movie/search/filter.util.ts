import { CatalogSearch } from './search.form';
import { Movie } from '@blockframes/movie/movie/+state/movie.model';
import { AFM_DISABLE } from '@env';
import { DistributionDeal } from '@blockframes/movie/distribution-deals/+state/distribution-deal.model';
import { ExtractCode, ExtractSlug } from '@blockframes/utils/static-model/staticModels';

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
     // TODO #1562
/*   if (language.original) {
    original = movie.main.languages.includes(language.name.toLowerCase());
  }
  if (language.dubbed) {
    dubbed = movie.versionInfo.dubbings.includes(language.name.toLowerCase());
  }
  if (language.subtitle) {
    subtitle = movie.versionInfo.subtitles.includes(language.name.toLowerCase());
  } */
  return original && dubbed && subtitle;
}

function types(movie: Movie, movieGenre: string[]): boolean {
  if (!movieGenre.length) {
    return true;
  }
  // we have to make it lowercase to make sure we are comparing correctly
  const movieGenreToLowerCase = movieGenre.map(type => type.toLowerCase());
  for (let i = 0; i < movie.main.genres.length; i++) {
    for (let k = 0; k < movieGenreToLowerCase.length; k++) {
      if (movie.main.genres[i] === movieGenreToLowerCase[k]) {
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
function availabilities(deals: DistributionDeal[], range: { from: Date; to: Date }): boolean {
  if (!range || !(range.from && range.to)) {
    return true;
  }
  return (
    deals.some(deal => {
      if (deal.terms) {
        /**
         * Check if terms.start is inside of a deal
         */
        return deal.terms.start.getTime() < range.from.getTime();
      }
    }) &&
    deals.some(deal => {
      if (deal.terms) {
        return deal.terms.end.getTime() > range.to.getTime();
      }
    })
  );
}

function territories(movie: Movie, territory: string): boolean {
  if (!territory) {
    return true;
  }
  return movie.salesAgentDeal.territories.includes(territory.toLowerCase() as ExtractSlug<'TERRITORIES'>);
}
function media(movie: Movie, movieMediaType: string): boolean {
  if (!movieMediaType) {
    return true;
  }
  return movie.salesAgentDeal.medias.includes(movieMediaType.toLowerCase() as any);
}

// TODO #1306 - remove when algolia is ready
export function filterMovie(movie: Movie, filter: CatalogSearch, deals?: DistributionDeal[]): boolean {
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
      salesAgent(movie, filter.salesAgent)
    );
  }
}
