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
export function movieHasExclusiveSales(sales: MovieSale[]): MovieSale[] {
  const exclusiveSales: MovieSale[] = sales.filter(sale => sale.exclusive === true);
  return exclusiveSales;
}

/**
 * @description this function checks if there are overlappings in the sales
 * from the current movie and the specified date range from the buyer
 * @param sales array of the current sales of the movie
 * @param formDates the date range which got specified by the buyer
 * @param salesAgent the sales agent deal from the movie
 */
export function hasSalesRights(
  sales: MovieSale[],
  formDates: DateRange,
  salesAgent: MovieSalesAgentDeal
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
 * @param formTerritories the territories which got specified by the buyer
 * @param salesAgentTerritories the available territories provided by the sales agent
 */
export function hasTerritoriesInCommon(
  formTerritories: string[],
  salesAgentTerritories: string[]
): string[] {
  const availableTerritories: string[] = [];
  formTerritories.forEach(territoriy => {
    if (salesAgentTerritories.includes(territoriy)) {
      availableTerritories.push(territoriy);
    }
  });
  return availableTerritories;
}

/**
 * @description we want to check if formMedias and salesAgentMedias have medias in common
 * @param formMedias the medias which got specified by the buyer
 * @param salesAgentMedias the available medias provided by the sales agent
 */
export function hasMediaInCommon(formMedias: string[], salesAgentMedias: string[]): string[] {
  const checkedMedia: string[] = [];
  formMedias.forEach(media => {
    if (salesAgentMedias.includes(media)) {
      checkedMedia.push(media);
    }
  });
  return checkedMedia;
}
