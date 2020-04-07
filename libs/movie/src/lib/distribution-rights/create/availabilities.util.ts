import { MovieSalesAgentDeal } from '../../movie/+state/movie.model';
import { DistributionDeal, getDealTerritories } from '../+state/distribution-deal.model';
import { DateRange } from '@blockframes/utils/common-interfaces/range';
import { AvailsSearch } from '../form/search.form';
import { toDate } from '@blockframes/utils/helpers';
import { MediasSlug } from '@blockframes/utils/static-model';
import { Terms } from '@blockframes/utils/common-interfaces/terms';

/**
 * @description This function checks if there are intersections in the deals
 * from the current movie and the specified date range from the buyer
 * @param formDates The date range which got specified by the buyer
 * @param distributionDeals Array of the movie distribution deals.
 * Note don't put the exclusive deals array in here
 */
export function getDealsInDateRange(formDates: Terms, distributionDeals: DistributionDeal[]): DistributionDeal[] {
  if (!distributionDeals) {
    return [];
  }

  const intersectedDateRangeDeals: DistributionDeal[] = [];

  for (const deal of distributionDeals) {
    const dealFrom: Date = toDate(deal.terms.start);
    const dealTo: Date = toDate(deal.terms.end);

    /**
     * If the form date 'from' is between a deal from and to, it means that there
     * are already deals made, but it is still possible to buy a distribution right
     * at this point.
     */
    if (
      formDates.start.getTime() >= dealFrom.getTime() &&
      formDates.start.getTime() <= dealTo.getTime()
    ) {
      intersectedDateRangeDeals.push(deal);
    }
    /**
     * If 'to' date is older than sales agent 'to' date
     * and 'to' date is younger than sales agent 'from' date, it is in range
     */
    if (
      formDates.end.getTime() <= dealTo.getTime() &&
      formDates.end.getTime() >= dealFrom.getTime()
    ) {
      intersectedDateRangeDeals.push(deal);
    }

    /**
     * If 'from' date is older than sales agent 'from' date and
     * 'to' date if younger than sales agent 'to' date , it is in range
     */
    if (
      formDates.start.getTime() <= dealFrom.getTime() &&
      formDates.end.getTime() >= dealTo.getTime()
    ) {
      intersectedDateRangeDeals.push(deal);
    }
  }
  return intersectedDateRangeDeals;
}

/**
 * @description We want to check if user search and salesAgentMedias have medias and territories in common
 * @param filter The filter options defined by the buyer
 * @param deals The array of deals from a movie in the previously specified date range
 */
export function getFilterMatchingDeals(
  filter: AvailsSearch,
  deals: DistributionDeal[]
): DistributionDeal[] {

  const { territory, licenseType } = filter

  /**
   * We have to look on the already exisitng
   * deals in the movie and check if there is any overlapping medias
   */
  const dealsWithTerritoriesAndMediasInCommon: DistributionDeal[] = [];
  for (const deal of deals) {

    // Filter deal territories
    const dealTerritories = getDealTerritories(deal);

    let mediasInCommon = false;
    mediaLoop : for (const filterMedia of licenseType) {
      for (const dealMedia of deal.licenseType) {
        if (dealMedia === filterMedia) {
          mediasInCommon = true;
          break mediaLoop;
        }
      }
    }

    let territoriesInCommon = false;
    territoryLoop : for (const filterTerritory of territory) {
      for (const dealTerritory of dealTerritories) {
        if (dealTerritory === filterTerritory) {
          territoriesInCommon = true;
          break territoryLoop;
        }
      }
    }

    if (
      mediasInCommon &&
      territoriesInCommon &&
      !dealsWithTerritoriesAndMediasInCommon.includes(deal)
    ) {
      dealsWithTerritoriesAndMediasInCommon.push(deal);
    }
  }
  return dealsWithTerritoriesAndMediasInCommon;
}

/**
 * @description We want to check if user search and deals have medias in common
 * @param medias The medias from the filter defined by the buyer
 * @param deals The array of deals from a movie in the previously specified date range
 */
export function getDealsWithMedias(medias: MediasSlug[], deals: DistributionDeal[]): DistributionDeal[] {
  const dealsWithMediasInCommon: DistributionDeal[] = [];

  for (const deal of deals) {

    let mediasInCommon = false;
    mediaLoop : for (const media of medias) {
      for (const licenseType of deal.licenseType) {
        if (licenseType === media) {
          mediasInCommon = true;
          break mediaLoop;
        }
      }
    }
    if (mediasInCommon) {
      dealsWithMediasInCommon.push(deal);
    }
  }

  return dealsWithMediasInCommon;

  }

/**
 * Returns deals with same exclusivity value as the one passed as an argument.
 * @param exclusive
 * @param deals
 */
export function getExclusiveDeals(deals: DistributionDeal[], exclusive: boolean): DistributionDeal[] {
  if (exclusive === true) {
    return deals
  }
  if (exclusive === false) {
    return deals.filter(deal => deal.exclusive === true);
  }
}
