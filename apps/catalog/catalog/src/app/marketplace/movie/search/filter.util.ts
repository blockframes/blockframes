import { Movie } from '@blockframes/movie/movie/+state/movie.model';
import { DistributionDeal } from '@blockframes/movie/distribution-deals/+state/distribution-deal.model';
import { ExtractSlug } from '@blockframes/utils/static-model/staticModels';
import { NumberRange } from '@blockframes/utils/common-interfaces';
import { LanguagesLabel } from '@blockframes/utils/static-model/types';
import { TerritoriesSlug, MediasSlug } from '@blockframes/utils/static-model/types';
import { LanguagesSlug } from '@blockframes/utils/static-model/types';
import { CatalogSearch, AvailsSearch } from '@blockframes/catalog/form/search.form';
import { getFilterMatchingDeals, getDealsInDateRange, getExclusiveDeals } from '@blockframes/movie/distribution-deals/create/availabilities.util';
import { MovieLanguageSpecification } from '@blockframes/movie/movie+state/movie.firestore';
import { toDate } from '@blockframes/utils/helpers';
import { Scope } from '@sentry/browser';

function isProductionYearBetween(movie: Movie, range: { from: number; to: number }): boolean {
  if (!range || !(range.from && range.to)) {
    return true;
  }
  // prevent from default error that property is undefined
  if (typeof range.from && typeof range.to) {
    return movie.main.productionYear >= range.from && movie.main.productionYear <= range.to;
  }
}

function hasLanguage(movie: Movie, language: { [languageLabel in LanguagesLabel]: MovieLanguageSpecification }) {
    if (Object.entries(language).length === 0) {
      return true;
    }
    const languages = Object.keys(language);
    for (const lang of languages) {
      if (movie.versionInfo.languages.hasOwnProperty(lang)) {

        const movieLanguage = movie.versionInfo.languages[lang];
        const filterLanguage = language[lang];

        // When no checkbox is checked, we just verify the key.
        if (!filterLanguage.original && !filterLanguage.dubbed && !filterLanguage.subtitle && !filterLanguage.caption) {
          return true;
        }

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

/**
 * Returns a boolean weither a deal is matching with our search or not.
 * @param deals all the deals from the movies in the filterForm
 * @param filter The filter options defined by the buyer
 */
function hasAvailabilities(deals: DistributionDeal[], filter: AvailsSearch, contractService): boolean {

  if (!filter.terms || !(filter.terms.from && filter.terms.to) || !deals) {
    return true;
  }

  // If Archipel Content is not allowed to sells rights from this movie on the mandate, don't show the movie
  if (archipelCanSells(deals, filter, contractService)) {
    return false;
  }

  const dealsWithoutMandate = getDealsWithoutMandate(deals, contractService);
  const matchingExclusivityDeals = getExclusiveDeals(filter.exclusivity, dealsWithoutMandate);
  const matchingRangeDeals = getDealsInDateRange(filter.terms, matchingExclusivityDeals);
  const matchingDeals = getFilterMatchingDeals(filter, matchingRangeDeals);

  return matchingDeals.length ? false : true;
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

function hasTerritories(movie: Movie, filterTerritories: ExtractSlug<'TERRITORIES'>[]): boolean {
  return filterTerritories.every(territory => movie.salesAgentDeal.territories.includes(territory));
}

/**
 * Looks for the deal matching the mandate and checks if Archipel can sells
 * rights according to the filter options set by the buyer.
 */
function archipelCanSells(filter: AvailsSearch, mandateDeal: DistributionDeal): boolean {

  const mandateHasTerritories = mandateHas(filter.territories, mandateDeal.territory);
  const mandateHasMedias = mandateHas(filter.medias, mandateDeal.licenseType);
  const mandateHasTerms = (
    toDate(filter.terms.from).getTime() > toDate(mandateDeal.terms.start).getTime() &&
    toDate(filter.terms.to).getTime() < toDate(mandateDeal.terms.end).getTime()
  );

  return mandateHasTerritories && mandateHasMedias && mandateHasTerms;
}

/** Checks if every items of the list from filters are in the list from the deal. */
function mandateHas(listFromFilter: string[], listFromDeal: string[]) {
  return listFromFilter.every(item => listFromDeal.includes(item));
}

/**  Returns a list of deals without the mandate deal. */
function getDealsWithoutMandate(deals: DistributionDeal[], contractService): DistributionDeal[] {
  return deals.filter(async deal => {
    const contract = await contractService.getValue(deal.contractId);
    return contract.status !== 'mandate'
  });
}

// TODO #1306 - remove when algolia is ready
export function filterMovie(movie: Movie, filter: CatalogSearch): boolean {
  const hasEveryLanguage = Object.keys(filter.languages)
    .map(name => ({ ...filter.languages[name], name }))
    .every(language => hasLanguage(movie, language));

  return (
    isProductionYearBetween(movie, filter.productionYear) &&
    hasEveryLanguage &&
    hasGenres(movie, filter.genres) &&
    hasCertifications(movie, filter.certifications) &&
    isProductionStatus(movie, filter.status) &&
    hasAvailabilities(deals, filter) &&
    hasTerritories(movie, filter.territories) &&
    hasMedias(movie, filter.medias) &&
    hasCountry(movie, filter.originCountries) &&
    hasLanguage(movie, filter.languages) &&
    isProductionStatus(movie, filter.status)
  );
}

/**
 * Returns a boolean weither a deal is matching with our search or not.
 * @param deals All the deals from the movies in the filterForm
 * @param filter The filter options defined by the buyer
 * @param mandateDeal The deal between Archipel and the seller
 */
export function filterMovieWithAvails(deals: DistributionDeal[], filter: AvailsSearch, mandateDeal: DistributionDeal) {
  if (!filter.terms || !(filter.terms.from && filter.terms.to) || !deals) {
    return true;
  }

  // If Archipel Content is not allowed to sells rights from this movie on the mandate, don't show the movie
  if (archipelCanSells(filter, mandateDeal)) {
    return false;
  }

  const matchingExclusivityDeals = getExclusiveDeals(deals, filter.exclusivity);
  const matchingRangeDeals = getDealsInDateRange(filter.terms, matchingExclusivityDeals);
  const matchingDeals = getFilterMatchingDeals(filter, matchingRangeDeals);

  return matchingDeals.length ? false : true;
}
