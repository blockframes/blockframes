import { DistributionRight, getRightTerritories } from '@blockframes/distribution-rights/+state';
import { TerritoriesSlug, staticModels } from '@blockframes/utils/static-model';
import { AvailsSearch } from '@blockframes/distribution-rights/form/search.form';
import { getExclusiveRights, getRightsInDateRange, getRightsWithMedias } from '@blockframes/distribution-rights/create/availabilities.util';
import { Model } from '@blockframes/utils/static-model/staticModels';
import { inDateRange } from '@blockframes/utils/common-interfaces/terms';

const TERRITORIES = staticModels['TERRITORIES'];

/**
 * Returns an array of unlicensed territories to display on the world map.
 * @param mandateRights Mandate rights from the movie
 * @param territories All the territories
 */
export function getNotLicensedTerritories(filter: AvailsSearch, mandateRights: DistributionRight[]): Model['TERRITORIES'] {

  const licensedTerritorySlugs = getLicensedTerritorySlugs(mandateRights, filter)

  return TERRITORIES.filter(territory => !licensedTerritorySlugs.includes(territory.slug));
}

/**
 * Returns an array of unavailable territories to display on the world map.
 * If the territory is licensed and has at least one right running for the filter
 * terms and medias, then it can be displayed.
 * @param mandateRights Mandate rights from the movie
 * @param territories All the territories
 * @param rights Sales rights from the movie
 */
export function getRightsSoldTerritories(
  filter: AvailsSearch,
  mandateRights: DistributionRight[],
  rights: DistributionRight[]
): Model['TERRITORIES'] {
  // Grab the territorySlugs from all sales rights, filtered with licensed territories.
  const territorySlugsWithRights = getTerritorySlugsWithRights(filter, mandateRights, rights)
  // Filter again to only keep territories with ongoing sales.
  return TERRITORIES.filter(territory => territorySlugsWithRights.includes(territory.slug));
}

/**
 * Returns an array of available territories to display on the world map.
 * If the territory is licensed and has no rights running for the filter
 * terms and medias, then it can be displayed.
 * @param mandateRights Mandate rights from the movie
 * @param territories All the territories
 * @param rights Sales rights from the movie
 */
export function getAvailableTerritories(
  filter: AvailsSearch,
  mandateRights: DistributionRight[],
  rights: DistributionRight[]
): Model['TERRITORIES'] {
  // Grab the territorySlugs from all sales rights, filtered with licensed territories.
  const territorySlugsWithoutRights = getTerritorySlugsWithoutRights(filter, mandateRights, rights)
  // Filter again to only keep territories without any ongoing rights.
  return TERRITORIES.filter(territory => territorySlugsWithoutRights.includes(territory.slug));
}

/**
 * Returns an array of sales rights licensed territories.
 * @param mandateRights Mandate rights from the movie
 * @param territories All the territories
 * @param rights Sales rights from the movie
 */
function getTerritorySlugsWithRights(filter: AvailsSearch, mandateRights: DistributionRight[], salesRights: DistributionRight[]): TerritoriesSlug[] {
  const licensedTerritorySlugs = getLicensedTerritorySlugs(mandateRights, filter);

  const matchingExclusivityRights = getExclusiveRights(salesRights, filter.exclusive);
  const matchingRangeRights = getRightsInDateRange(filter.terms, matchingExclusivityRights);
  const matchingRights = getRightsWithMedias(filter.licenseType, matchingRangeRights);

  const territorySlugsFromRights: TerritoriesSlug[] = [];
  matchingRights.forEach(right => {
    const filteredTerritories = getRightTerritories(right);
    territorySlugsFromRights.push(...filteredTerritories);
  });

  // Keep territorySlug only if it is included in licensedTerritorySlugs.
  return territorySlugsFromRights.filter(territorySlug => licensedTerritorySlugs.includes(territorySlug));
}

/**
 * Returns an array of licensed territories without sales.
 * @param mandateRights Mandate rights from the movie
 * @param territories All the territories
 * @param rights Sales rights from the movie
 */
function getTerritorySlugsWithoutRights(filter: AvailsSearch, mandateRights: DistributionRight[], salesRights: DistributionRight[]): TerritoriesSlug[] {
  const licensedTerritorySlugs = getLicensedTerritorySlugs(mandateRights, filter);

  const matchingExclusivityRights = getExclusiveRights(salesRights, filter.exclusive);
  const matchingRangeRights = getRightsInDateRange(filter.terms, matchingExclusivityRights);
  const matchingRights = getRightsWithMedias(filter.licenseType, matchingRangeRights);

  const territorySlugsFromRights: TerritoriesSlug[] = [];
  matchingRights.forEach(right => {
    const filteredTerritories = getRightTerritories(right);
    territorySlugsFromRights.push(...filteredTerritories);
  });

  // Keep all licensed territory slugs with no rights.
  return licensedTerritorySlugs.filter(territorySlug => !territorySlugsFromRights.includes(territorySlug));
}

/**
 * Returns an array of slugs of eligible territories for a specific movie.
 * @param rights Mandate rights from the movie
 */
function getLicensedTerritorySlugs(mandateRights: DistributionRight[], filter: AvailsSearch): TerritoriesSlug[] {
  const licensedTerritorySlugs: TerritoriesSlug[] = [];

  // Iterate on every mandate rights of the movie
  mandateRights.forEach(right => {
    const hasMedias = filter.licenseType.every(media => right.licenseType.includes(media));
    const hasTermsInRange = inDateRange(filter.terms, right.terms);

    // If mandate contain all filter medias and filter
    // terms are in date range, right territories are licensed.
    if (hasMedias && hasTermsInRange) {
      const filteredTerritories = getRightTerritories(right)
      licensedTerritorySlugs.push(...filteredTerritories);
    }
  })

  return licensedTerritorySlugs;
}
