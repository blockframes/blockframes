import { DateRange } from '@blockframes/utils';
import { MovieSale, MovieSalesAgentDeal } from '@blockframes/movie/movie/+state';

/**
 * If there is an overlap in an exclusive distribution right, we need to send back some information
 * for the user what he can do to make this deal happen. A boolean value won't be enough.
 * Otherwise, if there is no exclusive deal and everything is overlapping except for
 * one value, the distribution right can be bought.
 * Or the buyer wants to buy an exclusive deal and there are already some distribution rights from other
 * buyers, we should show a message, that he has to buy the rights from the other buyers, so this exclusive
 * deal can happen.
 * But if there is no sales agent deal for this movie or specific values, no distribution right can be made.
 *  BE VERY PRECISE IN THE EXPLANATION AND EXTEND THIS DOC!!!!! TODO(MF)
 */

/**
 * @description Interface which helps us to unterstand what is possible to buy and
 * what's not
 */
export interface FilteredResponse {
  /**
   * Determine with this boolean, if the wanted values from the buyer is possible or
   * it may have to change to make the distribution right happen
   */
  readonly intersected: boolean;

  /**
   * This property holds the values of intersected sales, which means that
   * the distribution right can still happen, but we need to watch out for these values
   */
  readonly intersectedSales?: MovieSale[];

  /**
   * If this property is set, the buyer can't buy a distribution right for his
   * wanted properties. We can show the conent of this array in the UI for
   * explaining the problem.
   */
  readonly intersectedExclusiveSales?: MovieSale[];

  /**
   * If there are no intersections in the sales array of the movie and the
   * sales agent provides these wanted values, the buyer can buy this distribution
   * right for his wanted values.
   */
  readonly availableValues?: string[];
}

export function salesAgentHasDateRange(
  dateRange: MovieSalesAgentDeal['rights'],
  formDates: DateRange
): boolean {
  const from = new Date(dateRange.from);
  const to = new Date(dateRange.to);

  if (formDates.from >= from && formDates.to <= to) {
    return true;
  } else {
    return false;
  }
}

export function exclusiveMovieSales(sales: MovieSale[]): MovieSale[] {
  return sales.filter(sale => sale.exclusive === true);
}

/**
 * @description This function checks if there are exclusive sales on the wanted date range
 * @param formDates The date range which got specified by the buyer
 * @param exclusiveSales Takes in an array of exclusive movie sales
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
 * @param formTerritories The wanted territories from the buyer
 * @param exclusiveSales akes in an array of exclusive movie sales
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
     * There are other exclusive sales in the date range
     * and some of them got the same territory, which means,
     * it is not possible to create a distribution right for the buyer
     */
    return { intersected: true, intersectedExclusiveSales: intersectedExTerritoriesInDateRange };
  } else {
    /**
     * There are other exclusive sales in the date range
     *  but none have the wanted territory from the buyer
     */
    return { intersected: false };
  }
}

/**
 * @description Checks if the wanted medias are available or already sold
 * to an exclusive distribution right
 * @param formMedias The wanted medias from the buyer
 * @param exclusiveSales akes in an array of exclusive movie sales
 */
export function hasExclusiveMediasInCommon(
  formMedias: string[],
  exclusiveSales: MovieSale[]
): FilteredResponse {
  /**
   * Find the intersected sales and return them
   */
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
 * @description This function checks if there are overlappings in the sales
 * from the current movie and the specified date range from the buyer
 * @param formDates The date range which got specified by the buyer
 * @param salesAgent The sales agent deal from the movie
 * @param sales Array of the current sales of the movie
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
 * and what are the overlapping territories from the already existing sales are
 * @param formTerritories The territories which got specified by the buyer
 * @param salesAgentTerritories The available territories provided by the sales agent
 * @param sales The array of sales from a movie in the previously specified date range
 */
export function hasTerritoriesInCommon(
  formTerritories: string[],
  salesAgentTerritories: MovieSalesAgentDeal['territories'],
  sales: MovieSale[]
): FilteredResponse {
  const availableTerritories: string[] = [];

  /**
   * We look for territories which the buyer wants to have and the
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
  if (availableTerritories.length) {
    const overlappingTerritories: MovieSale[] = [];
    for (const sale of sales) {
      for (const territory of availableTerritories) {
        for (const saleTerritory of sale.territories) {
          /**
           * We want to make sure, that only non existing territories get push to the
           * overlappingTerritories array
           */
          if (saleTerritory === territory && !overlappingTerritories.includes(sale)) {
            overlappingTerritories.push(sale);
          }
        }
      }
    }
    if (overlappingTerritories.length) {
      return { intersected: true, intersectedSales: overlappingTerritories };
    }
  }

  /**
   * If the wanted territories are available and there are no overlappings
   * we want to return the availableTerritories array, otherwise we going to
   * return false, because on the sales agent deal where no matching territories found
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
  salesAgentMedias: MovieSalesAgentDeal['medias'],
  sales: MovieSale[]
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
    const overlappingMedias: MovieSale[] = [];
    for (const sale of sales) {
      for (const media of availableMedias) {
        for (const saleMedia of sale.medias) {
          /**
           * We want to make sure, that only non existing territories get push to the
           * overlappingMedias array
           */
          if (saleMedia === media && !overlappingMedias.includes(sale)) {
            overlappingMedias.push(sale);
          }
        }
      }
    }
    if (overlappingMedias.length) {
      return { intersected: true, intersectedSales: overlappingMedias };
    }
  }
  return { intersected: false, availableValues: availableMedias };
}
