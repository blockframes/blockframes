import { MovieLanguageSpecification } from './../../movie/search/search.form';
import { DateRange } from '@blockframes/utils/date-range';
import { DistributionDeal, MovieSalesAgentDeal } from '@blockframes/movie/movie/+state';

/**
 * These function should be used in connection. For instance, we look for movie distribution deals in
 * a date range which get specified by the customer. Then we go on to put the array we got back
 * from the function and put that into the next function where we look for territories, for instance.
 * Like that we make sure that we only search in a relevant date range.
 * Because of that flow, all properties which can be specified by the customer are mandatory.
 * That is why we need to implement a good error handeling and show results and solution
 * in the UI.
 * 
 * @dev workflow is described here : https://www.notion.so/cascade8/Avails-Search-ad38ce0bca424b6fa3036b0ab36164a0## 
 */

/**
 * @description Returns a boolean whether a distribution right can be bought or not
 * in the specified date range from the parameter `formDates`
 * @param dateRange The possible date range from the movie sales agent
 * @param formDates The specified date range from the customer
 */
export function salesAgentHasDateRange(
  dateRange: MovieSalesAgentDeal['rights'],
  formDates: DateRange
): boolean {
  const from = new Date(dateRange.from);
  const to = new Date(dateRange.to);

  if (formDates.from.getTime() >= from.getTime() && formDates.to.getTime() <= to.getTime()) {
    return true;
  } else {
    return false;
  }
}

/**
 * @description Fetches you all the exclusive deals of a movie
 * @param distributionDeals The distribution deal property
 */
export function exclusiveDistributionDeals(distributionDeals: DistributionDeal[]): DistributionDeal[] {
  return distributionDeals.filter(deal => deal.exclusive === true);
}
/**
 * @description This function checks if there are intersections in the deals
 * from the current movie and the specified date range from the buyer
 * @param formDates The date range which got specified by the buyer
 * @param distributionDeals Array of the movie distribution deals.
 * Note don't put the exclusive deals array in here
 */
export function getDistributionDealsInDateRange(formDates: DateRange, distributionDeals: DistributionDeal[]): DistributionDeal[] {
  const intersectedDateRangeDeals: DistributionDeal[] = [];

  for (const deal of distributionDeals) {
    const dealsFrom: Date = new Date(deal.rights.from);
    const dealsTo: Date = new Date(deal.rights.to);
    /**
     * If the form date 'from' is between a deal from and to, it means that there
     * are already deals made, but it is still possible to buy a distribution right
     * at this point.
     */
    if (
      formDates.from.getTime() >= dealsFrom.getTime() &&
      formDates.from.getTime() <= dealsTo.getTime()
    ) {
      intersectedDateRangeDeals.push(deal);
    }
    /**
     * If 'to' date is older than sales agent 'to' date
     * and 'to' date is younger than sales agent 'from' date, it is in range
     */
    if (
      formDates.to.getTime() <= dealsTo.getTime() &&
      formDates.to.getTime() >= dealsFrom.getTime()
    ) {
      intersectedDateRangeDeals.push(deal);
    }

    /**
     * If 'from' date is older than sales agent 'from' date and
     * 'to' date if younger than sales agent 'to' date , it is in range
     */
    if (
      formDates.from.getTime() <= dealsFrom.getTime() &&
      formDates.to.getTime() >= dealsTo.getTime()
    ) {
      intersectedDateRangeDeals.push(deal);
    }
  }
  return intersectedDateRangeDeals;
}

/**
 * @description We want to check if user search and salesAgentMedias have medias and territories in common
 * @param formTerritories The territories which got specified by the buyer
 * @param formMedias The medias which got specified by the buyer
 * @param deals The array of deals from a movie in the previously specified date range
 */
export function getDistributionDealsWithMediasTerritoriesAndLanguagesInCommon(
  formTerritories: string[],
  formMedias: string[],
  formLanguages: MovieLanguageSpecification,
  deals: DistributionDeal[]
): DistributionDeal[] {

  /**
   * We have to look on the already exisitng
   * deals in the movie and check if there is any overlapping medias
   */
  const dealsWithMediasTerritoriesAndLanguagesInCommon: DistributionDeal[] = [];
  for (const deal of deals) {
    let mediasInCommon = false;
    for (const media of formMedias) {
      for (const saleMedia of deal.medias) {
        if (saleMedia === media) {
          mediasInCommon = true;
        }
      }
    }

    let territoriesInCommon = false;
    for (const territory of formTerritories) {
      for (const saleTerritory of deal.territories) {
        if (saleTerritory === territory) {
          territoriesInCommon = true;
        }
      }
    }

    // TODO: Add language when language is moved inside of deals object
    const languagesName: string[] = Object.keys(formLanguages);

    let dubbingInCommon = false;
    for (const language of languagesName) {
      if (deal.dubbings.includes(language)) {
        dubbingInCommon = true;
      }
    }

    let subtitlesInCommon = false;
    for (const language of languagesName) {
      if (deal.subtitles.includes(language)) {
        subtitlesInCommon = true;
      }
    }

    if (
      mediasInCommon &&
      territoriesInCommon &&
      dubbingInCommon &&
      subtitlesInCommon &&
      !dealsWithMediasTerritoriesAndLanguagesInCommon.includes(deal)
    ) {
      dealsWithMediasTerritoriesAndLanguagesInCommon.push(deal);
    }
  }
  return dealsWithMediasTerritoriesAndLanguagesInCommon;
}
