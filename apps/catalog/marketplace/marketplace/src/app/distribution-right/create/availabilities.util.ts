import { DateRange } from '@blockframes/utils';
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
 * @description Interface for handeling the possible results of our research functions
 */
export interface FilteredResponse {
  /**
   * Determine with this boolean, if the wanted values are overlapping in already existing sales.
   */
  readonly intersected: boolean;

  /**
   * This property holds the values of intersected sales, which means that
   * the distribution right can still happen, but we need to watch out for these values
   */
  readonly intersectedSales?: MovieSale[];

  /**
   * If this property is set, the customer can't buy a distribution right for his
   * wanted properties, because the movie sales are exclusive.
   * We can show the conent of this array in the UI for explaining the problem.
   */
  readonly intersectedExclusiveSales?: MovieSale[];

  /**
   * If there are no intersections in the sales of the movie and the
   * sales agent provides these wanted values, the customer can buy this distribution
   * right for his wanted values.
   */
  readonly availableValues?: string[];
}

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
    return false;
  } else {
    return true;
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
 * @description This function checks if there are exclusive sales on the wanted date range
 * @param formDates The date range which got specified by the customer
 * @param exclusiveSales Takes in an array of exclusive movie sales,
 * which can be found by the function `exclusiveMovieSales`
 */
export function hasExclusiveDateRangeSales(
  formDates: DateRange,
  exclusiveSales: MovieSale[]
): FilteredResponse {
  const intersectedExDateRangeSales: MovieSale[] = [];

  for (const sale of exclusiveSales) {
    const salesFrom: Date = new Date(sale.rights.from);
    const salesTo: Date = new Date(sale.rights.to);

    /**
     * We need to check if there are overlapping values in the exclusive sales array
     */
    if (
      formDates.from.getTime() >= salesFrom.getTime() &&
      formDates.from.getTime() <= salesTo.getTime()
    ) {
      intersectedExDateRangeSales.push(sale);
    }
    /**
     * If 'to' date is older than sales agent 'to' date
     * and 'to' date is younger than sales agent 'from' date, it is in range
     */
    if (
      formDates.to.getTime() <= salesTo.getTime() &&
      formDates.to.getTime() >= salesFrom.getTime()
    ) {
      intersectedExDateRangeSales.push(sale);
    }

    /**
     * If 'from' date is older than sales agent 'from' date and
     * 'to' date if younger than sales agent 'to' date , it is in range
     */
    if (
      formDates.from.getTime() <= salesFrom.getTime() &&
      formDates.to.getTime() >= salesTo.getTime()
    ) {
      intersectedExDateRangeSales.push(sale);
    }
  }
  if (intersectedExDateRangeSales.length) {
    return { intersected: true, intersectedExclusiveSales: intersectedExDateRangeSales };
  } else {
    return { intersected: false };
  }
}

/**
 * @description Checks if the wanted territories are available or already sold
 * to an exclusive distribution right
 * @param formTerritories The wanted territories from the customer
 * @param exclusiveSales Takes in an array of exclusive movie sales -> `exclusiveMovieSales`
 */
export function hasExclusiveTerritoriesInCommon(
  formTerritories: string[],
  exclusiveSales: MovieSale[]
): FilteredResponse {
  const intersectedExTerritoriesInDateRange: MovieSale[] = [];
  for (const sale of exclusiveSales) {
    for (const territory of sale.territories) {
      for (const wantedTerritory of formTerritories) {
        if (territory === wantedTerritory && !intersectedExTerritoriesInDateRange.includes(sale)) {
          intersectedExTerritoriesInDateRange.push(sale);
        }
      }
    }
  }
  if (intersectedExTerritoriesInDateRange.length) {
    /**
     * This if statement checks whether some territories were found that got
     * intersection with other exclusive sales in that predefined date range
     */
    return { intersected: true, intersectedExclusiveSales: intersectedExTerritoriesInDateRange };
  } else {
    /**
     * There maybe some other sales in the pre defined date range, but none have
     * an intersection with the wanted territories from the customer
     */
    return { intersected: false };
  }
}

/**
 * @description Checks if the wanted medias are available or already sold
 * to an exclusive distribution right
 * @param formMedias The wanted medias from the customer
 * @param exclusiveSales Takes in an array of exclusive movie sales -> `exclusiveMovieSales`
 */
export function hasExclusiveMediasInCommon(
  formMedias: string[],
  exclusiveSales: MovieSale[]
): FilteredResponse {
  const intersectedExMedias: MovieSale[] = [];
  for (const sale of exclusiveSales) {
    for (const media of sale.medias) {
      for (const wantedTerritory of formMedias) {
        if (media === wantedTerritory && !intersectedExMedias.includes(sale)) {
          intersectedExMedias.push(sale);
        }
      }
    }
  }
  if (intersectedExMedias.length) {
    return { intersected: true, intersectedExclusiveSales: intersectedExMedias };
  } else {
    return { intersected: false };
  }
}

/**
 * @description This function checks if there are intersections in the sales
 * from the current movie and the specified date range from the buyer
 * @param formDates The date range which got specified by the buyer
 * @param sales Array of the movie sales property. 
 * Note don't put the exclusive sales array in here
 */
export function hasSalesRights(formDates: DateRange, sales: MovieSale[]): FilteredResponse {
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
  if (intersectedDateRangeSales.length) {
    return { intersected: true, intersectedSales: intersectedDateRangeSales };
  } else {
    return { intersected: false };
  }
}

/**
 * @description We want to check if formTerritories and salesAgentTerritories have territories in common
 * and what the overlapping territories from the already existing sales are
 * @param formTerritories The territories which got specified by the buyer
 * @param salesAgentTerritories The available territories provided by the sales agent
 * @param sales The array of sales from a movie in the previously specified date range
 * -> `hasSalesRights`
 */
export function hasTerritoriesInCommon(
  formTerritories: string[],
  salesAgentTerritories: MovieSalesAgentDeal['territories'],
  sales: MovieSale[]
): FilteredResponse {
  const availableTerritories: string[] = [];

  /**
   * We look for territories which the costumer wants to have and the
   * availability on the sales agent deal
   */
  formTerritories.forEach(territoriy => {
    if (salesAgentTerritories.includes(territoriy)) {
      availableTerritories.push(territoriy);
    }
  });
  /**
   * If the territories are available in the sales agend deal which
   * the buyer wants to have, we have to look on the already exisitng
   * sales in the movie and check if there is any overlapping territories
   */
  if (availableTerritories.length && sales.length > 0) {
    const overlappingTerritoriesSales: MovieSale[] = [];
    for (const sale of sales) {
      for (const territory of availableTerritories) {
        for (const saleTerritory of sale.territories) {
          /**
           * We want to make sure, that only sales get push to the
           * overlappingTerritoriesSales array, that are not already inside of it
           */
          if (saleTerritory === territory && !overlappingTerritoriesSales.includes(sale)) {
            overlappingTerritoriesSales.push(sale);
          }
        }
      }
    }
    if (overlappingTerritoriesSales.length) {
      return { intersected: true, intersectedSales: overlappingTerritoriesSales };
    }
  }

  /**
   * If there are no overlappings with other sales, we want to return the 
   * available territories. If there are no available territories, because
   * the sales agent doesn't provide the wanted territories from the customer,
   * we return an empty array
   */
  return { intersected: false, availableValues: availableTerritories };
}

/**
 * @description We want to check if formMedias and salesAgentMedias have medias in common
 * @param formMedias The medias which got specified by the buyer
 * @param salesAgentMedias The available medias provided by the sales agent
 * @param sales The array of sales from a movie in the previously specified date range
 */
export function hasMediaInCommon(
  formMedias: string[],
  salesInTerritories: MovieSale[],
  salesAgentMedias: MovieSalesAgentDeal['medias']
): FilteredResponse {
  const availableMedias: string[] = [];

  /**
   * We look for medias which the buyer wants to have and the
   * availability on the sales agent deal
   */
  formMedias.forEach(media => {
    if (salesAgentMedias.includes(media)) {
      availableMedias.push(media);
    }
  });

  /**
   * If the medias are available in the sales agend deal which
   * the buyer wants to have, we have to look on the already exisitng
   * sales in the movie and check if there is any overlapping medias
   */
  if (availableMedias.length) {
    const overlappingMediasSales: MovieSale[] = [];
    for (const sale of salesInTerritories) {
      for (const media of availableMedias) {
        for (const saleMedia of sale.medias) {
         /**
           * We want to make sure, that only sales get push to the
           * overlappingMediasSalesSales array, that are not already inside of it
           */
          if (saleMedia === media && !overlappingMediasSales.includes(sale)) {
            overlappingMediasSales.push(sale);
          }
        }
      }
    }
    if (overlappingMediasSales.length) {
      return { intersected: true, intersectedSales: overlappingMediasSales };
    }
  }
   /**
   * If there are no overlappings with other sales, we want to return the 
   * available medias. If there are no available medias, because
   * the sales agent doesn't provide the wanted medias from the customer,
   * we return an empty array
   */
  return { intersected: false, availableValues: availableMedias };
}
