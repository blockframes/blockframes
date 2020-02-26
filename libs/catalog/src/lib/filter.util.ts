import { Movie } from '@blockframes/movie/movie/+state/movie.model';
import { DistributionDeal, getDealTerritories } from '@blockframes/movie/distribution-deals/+state/distribution-deal.model';
import { ExtractSlug } from '@blockframes/utils/static-model/staticModels';
import { NumberRange, DateRange } from '@blockframes/utils/common-interfaces';
import { LanguagesLabel } from '@blockframes/utils/static-model/types';
import { CatalogSearch, AvailsSearch } from '@blockframes/catalog/form/search.form';
import { getFilterMatchingDeals, getDealsInDateRange, getExclusiveDeals } from '@blockframes/movie/distribution-deals/create/availabilities.util';
import { MovieLanguageSpecification, StoreType } from '@blockframes/movie/movie/+state/movie.firestore';
import { toDate } from '@blockframes/utils/helpers';

function isProductionYearBetween(movie: Movie, range: DateRange): boolean {
  if (!range || !(range.from && range.to)) {
    return true;
  }
  // prevent from default error that property is undefined
  if (typeof range.from && typeof range.to) {
    return movie.main.productionYear >= range.from.getFullYear() && movie.main.productionYear <= range.to.getFullYear();
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
  const storeTypeValues = storeTypes.map(type => StoreType[type]);
  if (storeTypeValues.includes(movie.main.storeConfig.storeType)) {
    return true;
  }
}

/**
 * Looks for the deal matching the mandate and checks if Archipel can sells
 * rights according to the filter options set by the buyer.
 */
function archipelCanSells(filter: AvailsSearch, mandateDeal: DistributionDeal): boolean {

  const licensedTerritories = getDealTerritories(mandateDeal);
  const hasTerritories = mandateHas(filter.territory, licensedTerritories)
  const hasMedias = mandateHas(filter.licenseType, mandateDeal.licenseType)
  const hasTerms =
    toDate(filter.terms.start).getTime() > toDate(mandateDeal.terms.start).getTime() &&
    toDate(filter.terms.end).getTime() < toDate(mandateDeal.terms.end).getTime()

  return hasTerritories && hasMedias && hasTerms;
}

/** Checks if every items of the list from filters are in the list from the deal. */
function mandateHas(listFromFilter: string[], listFromDeal: string[]) {
  return listFromFilter.every(item => listFromDeal.includes(item));
}

// TODO #1306 - remove when algolia is ready
export function filterMovie(movie: Movie, filter: CatalogSearch): boolean {
  return (
    isProductionYearBetween(movie, filter.productionYear) &&
    hasGenres(movie, filter.genres) &&
    hasCertifications(movie, filter.certifications) &&
    isProductionStatus(movie, filter.status) &&
    hasCountry(movie, filter.originCountries) &&
    hasLanguage(movie, filter.languages) &&
    isProductionStatus(movie, filter.status) &&
    hasBudget(movie, filter.estimatedBudget) &&
    hasStoreType(movie, filter.storeType)
  );
}

/**
 * Returns a boolean weither a deal is matching with our search or not.
 * @param deals All the deals from the movies in the filterForm
 * @param filter The filter options defined by the buyer
 * @param mandateDeal The deal between Archipel and the seller
 */
export function filterMovieWithAvails(deals: DistributionDeal[], filter: AvailsSearch, mandateDeals: DistributionDeal[]) {
  if (!filter.terms || !(filter.terms.start && filter.terms.end)) {
    return true;
  }

  // If Archipel Content is not allowed to sells rights from this movie on the mandate, don't show the movie
  if (mandateDeals.map(mandateDeal => archipelCanSells(filter, mandateDeal)).every(canSell => canSell === false )) {
    return false;
  }

  const matchingExclusivityDeals = getExclusiveDeals(deals, filter.exclusive);
  const matchingRangeDeals = getDealsInDateRange(filter.terms, matchingExclusivityDeals);
  const matchingDeals = getFilterMatchingDeals(filter, matchingRangeDeals);

  return matchingDeals.length ? false : true;
}
