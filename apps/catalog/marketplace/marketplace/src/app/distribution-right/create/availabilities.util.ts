import { DateRange } from '@blockframes/utils/date-range';
import { MovieSale, MovieSalesAgentDeal } from '@blockframes/movie/movie/+state';

/**
 * These function should be used in connection. For instance, we look for movie sales in
 * a date range which get specified by the customer. Then we go on to put the array we got back
 * from the function and put that into the next function where we look for territories, for instance.
 * Like that we make sure that we only search in a relevant date range.
 * Because of that flow, all properties which can be specified by the customer are mandatory.
 * That is why we need to implement a good error handeling and show results and solution
 * in the UI.
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
 * @description Fetches you all the exclusive sales of a movie
 * @param sales The movie sales property
 */
export function exclusiveMovieSales(sales: MovieSale[]): MovieSale[] {
  return sales.filter(sale => sale.exclusive === true);
}
/**
 * @description This function checks if there are intersections in the sales
 * from the current movie and the specified date range from the buyer
 * @param formDates The date range which got specified by the buyer
 * @param sales Array of the movie sales property.
 * Note don't put the exclusive sales array in here
 */
export function getSalesInDateRange(formDates: DateRange, sales: MovieSale[]): MovieSale[] {
  const intersectedDateRangeSales: MovieSale[] = [];

  for (const sale of sales) {
    const salesFrom: Date = new Date(sale.rights.from);
    const salesTo: Date = new Date(sale.rights.to);
    /**
     * If the form date 'from' is between a sales from and to, it means that there
     * are already sales made, but it is still possible to buy a distribution right
     * at this point.
     */
    if (
      formDates.from.getTime() >= salesFrom.getTime() &&
      formDates.from.getTime() <= salesTo.getTime()
    ) {
      intersectedDateRangeSales.push(sale);
    }
    /**
     * If 'to' date is older than sales agent 'to' date
     * and 'to' date is younger than sales agent 'from' date, it is in range
     */
    if (
      formDates.to.getTime() <= salesTo.getTime() &&
      formDates.to.getTime() >= salesFrom.getTime()
    ) {
      intersectedDateRangeSales.push(sale);
    }

    /**
     * If 'from' date is older than sales agent 'from' date and
     * 'to' date if younger than sales agent 'to' date , it is in range
     */
    if (
      formDates.from.getTime() <= salesFrom.getTime() &&
      formDates.to.getTime() >= salesTo.getTime()
    ) {
      intersectedDateRangeSales.push(sale);
    }
  }
  return intersectedDateRangeSales;
}

/**
 * @description We want to check if user search and salesAgentMedias have medias and territories in common
 * @param formTerritories The territories which got specified by the buyer
 * @param formMedias The medias which got specified by the buyer
 * @param sales The array of sales from a movie in the previously specified date range
 */
export function getSalesWithMediasAndTerritoriesInCommon(
  formTerritories: string[],
  formMedias: string[],
  sales: MovieSale[]
): MovieSale[] {
  /**
   * We have to look on the already exisitng
   * sales in the movie and check if there is any overlapping medias
   */

  const salesWithMediasAndTerritoriesInCommon: MovieSale[] = [];
  for (const sale of sales) {
    let mediasInCommon = false;
    for (const media of formMedias) {
      for (const saleMedia of sale.medias) {
        if (saleMedia === media) {
          mediasInCommon = true;
        }
      }
    }

    let territoriesInCommon = false;
    for (const territory of formTerritories) {
      for (const saleTerritory of sale.territories) {
        if (saleTerritory === territory) {
          territoriesInCommon = true;
        }
      }
    }

    if (
      mediasInCommon &&
      territoriesInCommon &&
      !salesWithMediasAndTerritoriesInCommon.includes(sale)
    ) {
      salesWithMediasAndTerritoriesInCommon.push(sale);
    }
  }

  return salesWithMediasAndTerritoriesInCommon;
}
