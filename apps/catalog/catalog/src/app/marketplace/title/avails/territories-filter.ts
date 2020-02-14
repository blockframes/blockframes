import { DistributionDeal, getDealTerritories } from '@blockframes/movie/distribution-deals/+state';
import { EnhancedISO3166Territory } from '@blockframes/utils/static-model/territories-ISO-3166';
import { TerritoriesSlug } from '@blockframes/utils/static-model';
import { AvailsSearch } from '@blockframes/catalog';
import { getExclusiveDeals, getDealsInDateRange, getFilterMatchingDeals, getDealsWithMedias } from '@blockframes/movie/distribution-deals/create/availabilities.util';

/**
 * Returns an array of unlicensed territories to display on the world map.
 * @param mandateDeals Mandate deals from the movie
 * @param territories All the territories
 */
export function getNotLicensedTerritories(
  mandateDeals: DistributionDeal[],
  territories: EnhancedISO3166Territory[]
): EnhancedISO3166Territory[] {
  const licensedTerritorySlugs = getLicensedTerritorySlugs(mandateDeals);

  return territories.filter(territory => !licensedTerritorySlugs.includes(territory.slug));
}

/**
 * Returns an array of unavailable territories to display on the world map.
 * If the territory is licensed and has at least one deal running for the filter
 * terms and medias, then it can be displayed.
 * @param mandateDeals Mandate deals from the movie
 * @param territories All the territories
 * @param deals Sales deals from the movie
 */
export function getRightsSoldTerritories(
  filter: AvailsSearch,
  mandateDeals: DistributionDeal[],
  territories: EnhancedISO3166Territory[],
  deals: DistributionDeal[]
): EnhancedISO3166Territory[] {
  // Grab the territorySlugs from all sales deals, filtered with licensed territories.
  const territorySlugsWithDeals = getTerritorySlugsWithDeals(filter, mandateDeals, deals)
  // Filter again to only keep territories with ongoing sales.
  return territories.filter(territory => territorySlugsWithDeals.includes(territory.slug));
}

/**
 * Returns an array of available territories to display on the world map.
 * If the territory is licensed and has no deals running for the filter
 * terms and medias, then it can be displayed.
 * @param mandateDeals Mandate deals from the movie
 * @param territories All the territories
 * @param deals Sales deals from the movie
 */
export function getAvailableTerritories(
  filter: AvailsSearch,
  mandateDeals: DistributionDeal[],
  territories: EnhancedISO3166Territory[],
  deals: DistributionDeal[]
): EnhancedISO3166Territory[] {
  // Grab the territorySlugs from all sales deals, filtered with licensed territories.
  const territorySlugsWithoutDeals = getTerritorySlugsWithoutDeals(filter, mandateDeals, deals)
  // Filter again to only keep territories without any ongoing deals.
  return territories.filter(territory => territorySlugsWithoutDeals.includes(territory.slug));
}

/**
 * Returns an array of sales deals licensed territories.
 * @param mandateDeals Mandate deals from the movie
 * @param territories All the territories
 * @param deals Sales deals from the movie
 */
function getTerritorySlugsWithDeals(filter: AvailsSearch, mandateDeals: DistributionDeal[], salesDeals: DistributionDeal[]): TerritoriesSlug[] {
  const licensedTerritorySlugs = getLicensedTerritorySlugs(mandateDeals);

  const matchingExclusivityDeals = getExclusiveDeals(salesDeals, filter.exclusivity);
  const matchingRangeDeals = getDealsInDateRange(filter.terms, matchingExclusivityDeals);
  const matchingDeals = getDealsWithMedias(filter.medias, matchingRangeDeals);

  const territorySlugsFromDeals: TerritoriesSlug[] = [];
  matchingDeals.forEach(deal => {
    const filteredTerritories = getDealTerritories(deal);
    territorySlugsFromDeals.push(...filteredTerritories);
  });

  // Keep territorySlug only if it is included in licensedTerritorySlugs.
  return territorySlugsFromDeals.filter(territorySlug => licensedTerritorySlugs.includes(territorySlug));
}

/**
 * Returns an array of licensed territories without sales.
 * @param mandateDeals Mandate deals from the movie
 * @param territories All the territories
 * @param deals Sales deals from the movie
 */
function getTerritorySlugsWithoutDeals(filter: AvailsSearch, mandateDeals: DistributionDeal[], salesDeals: DistributionDeal[]): TerritoriesSlug[] {
  const licensedTerritorySlugs = getLicensedTerritorySlugs(mandateDeals);

  const matchingExclusivityDeals = getExclusiveDeals(salesDeals, filter.exclusivity);
  const matchingRangeDeals = getDealsInDateRange(filter.terms, matchingExclusivityDeals);
  const matchingDeals = getDealsWithMedias(filter.medias, matchingRangeDeals);

  const territorySlugsFromDeals: TerritoriesSlug[] = [];
  matchingDeals.forEach(deal => {
    const filteredTerritories = getDealTerritories(deal);
    territorySlugsFromDeals.push(...filteredTerritories);
  });

  // Keep all licensed territory slugs with no deals.
  return licensedTerritorySlugs.filter(territorySlug => !territorySlugsFromDeals.includes(territorySlug));
}

/**
 * Returns an array of slugs of eligible territories for a specific movie.
 * @param deals Mandate deals from the movie
 */
function getLicensedTerritorySlugs(deals: DistributionDeal[]): TerritoriesSlug[] {
  const territorySlugs: TerritoriesSlug[] = [];

  deals.forEach(deal => {
    const filteredTerritories = getDealTerritories(deal);
    territorySlugs.push(...filteredTerritories);
  });

  return territorySlugs;
}
