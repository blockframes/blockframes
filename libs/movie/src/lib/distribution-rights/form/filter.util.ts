import { Movie } from '@blockframes/movie/+state/movie.model';
import { DistributionRight, getRightTerritories } from '../+state/distribution-right.model';
import { ExtractSlug } from '@blockframes/utils/static-model/staticModels';
import { NumberRange, DateRange } from '@blockframes/utils/common-interfaces';
import { LanguagesLabel } from '@blockframes/utils/static-model/types';
import { CatalogSearch, AvailsSearch } from './search.form';
import { getFilterMatchingRights, getRightsInDateRange, getExclusiveRights } from '../create/availabilities.util';
import { MovieLanguageSpecification, StoreType } from '@blockframes/movie/+state/movie.firestore';
import { toDate } from '@blockframes/utils/helpers';

function isReleaseYearBetween(movie: Movie, range: DateRange): boolean {
  if (!range || !(range.from && range.to)) {
    return true;
  }
  // prevent from default error that property is undefined
  if (typeof range.from && typeof range.to) {
    return movie.main.releaseYear >= range.from.getFullYear() && movie.main.releaseYear <= range.to.getFullYear();
  }
}

function hasLanguage(movie: Movie, language: Partial<{ [languageLabel in LanguagesLabel]: MovieLanguageSpecification }>) {
    if (Object.entries(language).length === 0) {
      return true;
    }
    const languages = Object.keys(language);
    for (const lang of languages) {
        const movieLanguage = movie.versionInfo.languages[lang];
        const filterLanguage = language[lang];

        // When no checkbox is checked, don't filter.
        if (!filterLanguage.original && !filterLanguage.dubbed && !filterLanguage.subtitle && !filterLanguage.caption) {
          return true;
        }

        if (movie.versionInfo.languages.hasOwnProperty(lang)) {
          if (filterLanguage.original && movieLanguage.original) {
            return true;
          }
          if (filterLanguage.dubbed && movieLanguage.dubbed) {
            return true;
          }
          if (filterLanguage.subtitle && movieLanguage.subtitle) {
            return true;
          }
          if (filterLanguage.caption && movieLanguage.caption) {
            return true;
          }
      }
    }
}

function hasGenres(movie: Movie, movieGenre: string[]): boolean {
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

function hasBudget(movie: Movie, movieBudget: NumberRange[]) {
  if (!movieBudget.length) {
    return true;
  }
  const movieEstimatedBudget = movie.budget.estimatedBudget;
  for (const budget of movieBudget) {
    if (budget.from === movieEstimatedBudget.from && budget.to === movieEstimatedBudget.to) {
      return true;
    }
  }
}

function isProductionStatus(movie: Movie, movieStatus: string[]): boolean {
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

function hasCertifications(movie: Movie, movieCertification: string[]): boolean {
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

function hasCountry(movie: Movie, countries: string[]): boolean {
  if (!countries.length) {
    return true;
  }
  for (const country of countries) {
    if (movie.main.originCountries.includes(country.toLowerCase() as ExtractSlug<'TERRITORIES'>)) {
      return true;
    }
  }
}

/**
 * Returns true if movie storeType is included in the search filter.
 * @param movie
 * @param storeTypes
 */
function hasStoreType(movie: Movie, storeTypes: StoreType[]) {
  if (!storeTypes.length) {
    return true;
  }
  return storeTypes.includes(movie.main.storeConfig.storeType);
}

/**
 * Looks for the right matching the mandate and checks if Archipel can sells
 * rights according to the filter options set by the buyer.
 */
function archipelCanSells(filter: AvailsSearch, mandateRight: DistributionRight): boolean {

  const licensedTerritories = getRightTerritories(mandateRight);
  const hasTerritories = mandateHas(filter.territory, licensedTerritories)
  const hasMedias = mandateHas(filter.licenseType, mandateRight.licenseType)
  const hasTerms =
    toDate(filter.terms.start).getTime() > toDate(mandateRight.terms.start).getTime() &&
    toDate(filter.terms.end).getTime() < toDate(mandateRight.terms.end).getTime()

  return hasTerritories && hasMedias && hasTerms;
}

/** Checks if every items of the list from filters are in the list from the right. */
function mandateHas(listFromFilter: string[], listFromRight: string[]) {
  return listFromFilter.every(item => listFromRight.includes(item));
}

// TODO #1306 - remove when algolia is ready
export function filterMovie(movie: Movie, filter: CatalogSearch): boolean {
  return (
    isReleaseYearBetween(movie, filter.releaseYear) &&
    hasGenres(movie, filter.genres) &&
    hasCertifications(movie, filter.certifications) &&
    isProductionStatus(movie, filter.productionStatus) &&
    hasCountry(movie, filter.originCountries) &&
    hasLanguage(movie, filter.languages) &&
    isProductionStatus(movie, filter.productionStatus) &&
    hasBudget(movie, filter.estimatedBudget) &&
    hasStoreType(movie, filter.storeType)
  );
}

/**
 * Returns a boolean weither a right is matching with our search or not.
 * @param rights All the rights from the movies in the filterForm
 * @param filter The filter options defined by the buyer
 * @param mandateRight The right between Archipel and the seller
 */
export function filterMovieWithAvails(rights: DistributionRight[], filter: AvailsSearch, mandateRights: DistributionRight[]) {
  if (!filter.terms || !(filter.terms.start && filter.terms.end)) {
    return true;
  }

  // If Archipel Content is not allowed to sells rights from this movie on the mandate, don't show the movie
  if (mandateRights.map(mandateRight => archipelCanSells(filter, mandateRight)).every(canSell => canSell === false )) {
    return false;
  }

  const matchingExclusivityRights = getExclusiveRights(rights, filter.exclusive);
  const matchingRangeRights = getRightsInDateRange(filter.terms, matchingExclusivityRights);
  const matchingRights = getFilterMatchingRights(filter, matchingRangeRights);

  return matchingRights.length ? false : true;
}
