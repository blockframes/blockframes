import { DistributionRight, getRightTerritories } from '../+state/distribution-right.model';
import { AvailsSearch } from '../form/search.form';
import { toDate } from '@blockframes/utils/helpers';
import { MediasValues } from '@blockframes/utils/static-model';
import { Terms } from '@blockframes/utils/common-interfaces/terms';

/**
 * @description This function checks if there are intersections in the rights
 * from the current movie and the specified date range from the buyer
 * @param formDates The date range which got specified by the buyer
 * @param DistributionRights Array of the movie distribution rights.
 * Note don't put the exclusive rights array in here
 */
export function getRightsInDateRange(formDates: Terms, DistributionRights: DistributionRight[]): DistributionRight[] {
  if (!DistributionRights) {
    return [];
  }

  const intersectedDateRangeRights: DistributionRight[] = [];

  for (const right of DistributionRights) {
    const rightFrom: Date = toDate(right.terms.start);
    const rightTo: Date = toDate(right.terms.end);

    /**
     * If the form date 'from' is between a right from and to, it means that there
     * are already rights made, but it is still possible to buy a distribution right
     * at this point.
     */
    if (
      formDates.start.getTime() >= rightFrom.getTime() &&
      formDates.start.getTime() <= rightTo.getTime()
    ) {
      intersectedDateRangeRights.push(right);
    }
    /**
     * If 'to' date is older than sales agent 'to' date
     * and 'to' date is younger than sales agent 'from' date, it is in range
     */
    if (
      formDates.end.getTime() <= rightTo.getTime() &&
      formDates.end.getTime() >= rightFrom.getTime()
    ) {
      intersectedDateRangeRights.push(right);
    }

    /**
     * If 'from' date is older than sales agent 'from' date and
     * 'to' date if younger than sales agent 'to' date , it is in range
     */
    if (
      formDates.start.getTime() <= rightFrom.getTime() &&
      formDates.end.getTime() >= rightTo.getTime()
    ) {
      intersectedDateRangeRights.push(right);
    }
  }
  return intersectedDateRangeRights;
}

/**
 * @description We want to check if user search and salesAgentMedias have medias and territories in common
 * @param filter The filter options defined by the buyer
 * @param rights The array of rights from a movie in the previously specified date range
 */
export function getFilterMatchingRights(
  filter: AvailsSearch,
  rights: DistributionRight[]
): DistributionRight[] {

  const { territory, licenseType } = filter

  /**
   * We have to look on the already exisitng
   * rights in the movie and check if there is any overlapping medias
   */
  const rightsWithTerritoriesAndMediasInCommon: DistributionRight[] = [];
  for (const right of rights) {

    // Filter right territories
    const rightTerritories = getRightTerritories(right);

    let mediasInCommon = false;
    mediaLoop : for (const filterMedia of licenseType) {
      for (const rightMedia of right.licenseType) {
        if (rightMedia === filterMedia) {
          mediasInCommon = true;
          break mediaLoop;
        }
      }
    }

    let territoriesInCommon = false;
    territoryLoop : for (const filterTerritory of territory) {
      for (const rightTerritory of rightTerritories) {
        if (rightTerritory === filterTerritory) {
          territoriesInCommon = true;
          break territoryLoop;
        }
      }
    }

    if (
      mediasInCommon &&
      territoriesInCommon &&
      !rightsWithTerritoriesAndMediasInCommon.includes(right)
    ) {
      rightsWithTerritoriesAndMediasInCommon.push(right);
    }
  }
  return rightsWithTerritoriesAndMediasInCommon;
}

/**
 * @description We want to check if user search and rights have medias in common
 * @param medias The medias from the filter defined by the buyer
 * @param rights The array of rights from a movie in the previously specified date range
 */
export function getRightsWithMedias(medias: MediasValues[], rights: DistributionRight[]): DistributionRight[] {
  const rightsWithMediasInCommon: DistributionRight[] = [];

  for (const right of rights) {

    let mediasInCommon = false;
    mediaLoop : for (const media of medias) {
      for (const licenseType of right.licenseType) {
        if (licenseType === media) {
          mediasInCommon = true;
          break mediaLoop;
        }
      }
    }
    if (mediasInCommon) {
      rightsWithMediasInCommon.push(right);
    }
  }

  return rightsWithMediasInCommon;

  }

/**
 * Returns rights with same exclusivity value as the one passed as an argument.
 * @param exclusive
 * @param rights
 */
export function getExclusiveRights(rights: DistributionRight[], exclusive: boolean): DistributionRight[] {
  if (exclusive === true) {
    return rights
  }
  if (exclusive === false) {
    return rights.filter(right => right.exclusive === true);
  }
}
