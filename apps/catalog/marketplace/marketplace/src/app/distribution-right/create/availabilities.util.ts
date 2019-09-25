import { DateRange } from '@blockframes/utils';
import { MovieSale, MovieSalesAgentDeal } from '@blockframes/movie/movie/+state';

/**
 * If there is an overlap in an exclusive distribution right, we need to send back some information
 * for the user what he can do to make this deal happen. A boolean value won't be enough.
 * Otherwise, if it there is no exclusive deal and everything is overlapping except for
 * one value, the distribution right can be bought.
 * Or the buyer wants to buy an exclusive deal and there are already some distribution rights from other
 * buyers, we should show a message, that he has to buy the rights from the other buyers, so this exclusive
 * deal can happen.
 * But if there is no sales agent deal for this movie or specific values, no distribution right can be made.
 */

/**
 * @description this function checks if there are exclusive sales on this movie
 * and returns them
 * @param sales takes in the already made sales of a movie
 */
export function movieHasExclusiveSales(sales: MovieSale[]): MovieSale[] | boolean {
  const exclusiveSales: MovieSale[] = sales.filter(sale => sale.exclusive === true);
  return exclusiveSales ? exclusiveSales : false;
}

/**
 * @description this function checks if there are overlappings in the sales
 * from the current movie and the specified date range from the buyer
 * @param sales array of the current sales of the movie
 * @param formDates the date range which got specified by the buyer
 * @param salesAgent the sales agent deal from the movie
 */
export function hasSalesRights(
  formDates: DateRange,
  salesAgent: MovieSalesAgentDeal,
  sales: MovieSale[]
): MovieSale[] | boolean {
  const agentFrom: Date = new Date(salesAgent.rights.from);
  const agentTo: Date = new Date(salesAgent.rights.to);
  const overlappingDateRanges: MovieSale[] = [];
  /**
   * First we need to check if there is a sales agent deal which
   * have the rights so sell the distribution rights for this movie,
   * otherwise the buyer won't be able to create a distribution right.
   */
  if (
    formDates.from.getTime() >= agentFrom.getTime() &&
    formDates.to.getTime() <= agentTo.getTime()
  ) {
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
        overlappingDateRanges.push(sale);
      }
      /**
       * If 'to' date is older than sales agent 'to' date
       * and 'to' date is younger than sales agent 'from' date, it is in range
       */
      if (
        formDates.to.getTime() <= salesTo.getTime() &&
        formDates.to.getTime() >= salesFrom.getTime()
      ) {
        overlappingDateRanges.push(sale);
      }

      /**
       * If 'from' date is older than sales agent 'from' date and
       * 'to' date if younger than sales agent 'to' date , it is in range
       */
      if (
        formDates.from.getTime() <= salesFrom.getTime() &&
        formDates.to.getTime() >= salesTo.getTime()
      ) {
        overlappingDateRanges.push(sale);
      }
    }
    return overlappingDateRanges;
  }

  /**
   * If there is no sales agent available in this date range,
   * it means thath the buyer can't buy a distribution deal.
   */
  return false;
}

/**
 * @description we want to check if formTerritories and salesAgentTerritories have territories in common
 * and what are the overlapping territories from the already existing sales are
 * @param formTerritories the territories which got specified by the buyer
 * @param salesAgentTerritories the available territories provided by the sales agent
 * @param sales the array of sales from a movie in the previously specified date range
 */
export function hasTerritoriesInCommon(
  formTerritories: string[],
  salesAgentTerritories: MovieSalesAgentDeal['territories'],
  sales: MovieSale[]
): string[] | boolean {
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
    const overlappingTerritories: string[] = [];
    for (const sale of sales) {
      for (const territory of availableTerritories) {
        for (const saleTerritory of sale.territories) {
          /**
           * We want to make sure, that only non existing territories get push to the
           * overlappingTerritories array
           */
          if (saleTerritory === territory && !overlappingTerritories.includes(saleTerritory)) {
            overlappingTerritories.push(saleTerritory);
          }
        }
      }
    }
    if (overlappingTerritories.length) {
      return overlappingTerritories;
    }
  }

  /**
   * If the wanted territories are available and there are no overlappings
   * we want to return the availableTerritories array, otherwise we going to
   * return false, because on the sales agent deal where no matching territories found
   */
  return false;
}

/**
 * @description we want to check if formMedias and salesAgentMedias have medias in common
 * @param formMedias the medias which got specified by the buyer
 * @param salesAgentMedias the available medias provided by the sales agent
 * @param sales the array of sales from a movie in the previously specified date range
 */
export function hasMediaInCommon(
  formMedias: string[],
  salesAgentMedias: MovieSalesAgentDeal['medias'],
  sales: MovieSale[]
): string[] | boolean {
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
    const overlappingMedias: string[] = [];
    for (const sale of sales) {
      for (const media of availableMedias) {
        for (const saleMedia of sale.medias) {
          /**
           * We want to make sure, that only non existing territories get push to the
           * overlappingMedias array
           */
          if (saleMedia === media && !overlappingMedias.includes(saleMedia)) {
            overlappingMedias.push(saleMedia);
          }
        }
      }
    }
    return overlappingMedias;
  }
  return availableMedias ? availableMedias : false;
}
