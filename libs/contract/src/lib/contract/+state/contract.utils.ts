import { ContractVersion } from "@blockframes/contract/version/+state";
import { ContractTitleDetail } from "./contract.firestore";
import { Price, createPrice, Terms } from "@blockframes/utils/common-interfaces";

/**
 * This method simply sums the price of each titles of a contractVersion
 * @param version
 */
export function calculatePrice(version: ContractVersion) {
  version.price.amount = 0;
  for (const titleId in version.titles) {
    version.price.amount += version.titles[titleId].price.amount;
  }
  return version;
}


/**
 * Combine prices of all distributionRights to get the total price of the contract.
 *
 * @dev this is temporary solution, if there is different currencies in distributionRights
 * the result will be wrong.
 */
export function getTotalPrice(titles: Record<string, ContractTitleDetail>): Price {
  const result = createPrice();
  const versionTitles = Object.values(titles);
  if (versionTitles.length) {
    result.amount = versionTitles.reduce((sum, title) => sum += title.price.amount, 0);
    result.currency = versionTitles[versionTitles.length - 1].price.currency;
  }
  return result;
}

// @todo(#1951) Merge this with content in dashboard/right/view

export interface VersionView {
  date: Date;
  price: Price;
  status: ContractVersion['status'];
  titleIds: string[];
}

/** Create a flatten object to be easily displayed on the frontend */
export function getVersionView(version: ContractVersion): VersionView {
  return {
    date: version.creationDate,
    titleIds: Object.keys(version.titles),
    price: getTotalPrice(version.titles),
    status: version.status
  }
}


/** Format the Payment schedule to be displayed  */
export function displayPaymentSchedule(version: ContractVersion): { type: string, list: string[] } {
    // Payment Schedule
    if (version.customPaymentSchedule) {
      return {
        type: 'Custom Payment Schedule',
        list: [version.customPaymentSchedule]
      };
    }
    // Verify if payment schedule is incomplete
    if (!version.paymentSchedule.length) {
      return undefined;
    }
    const isIncomplete = version.paymentSchedule.some(({ percentage, date }) => {
      if (!percentage || !date) {
        return true;
      }
      const { start, floatingStart, floatingDuration } = date;
      if (!start || !floatingStart || !floatingDuration) {
        return true
      }
      const { temporality, duration, unit } = floatingDuration;
      return !temporality || !duration || !unit
    })
    if (isIncomplete) {
      return undefined;
    }

    if (version.paymentSchedule[0].date.floatingDuration.temporality === 'every') {
      return {
        type: 'Periodic Payment',
        list: version.paymentSchedule.map(({ percentage, date }) => {
          const { temporality, duration, unit } = date.floatingDuration;
          const { start, floatingStart } = date;
          return `${percentage}% ${temporality} ${duration} ${unit} starting from (${start} | ${floatingStart})`
        })
      }
    }
    return {
      type: 'Payment Upon Event',
      list: version.paymentSchedule.map(({ percentage, date }, i) => `${percentage}% upon ${date.floatingStart}`)
    };
}

/** Format Terms to display it */
export function displayTerms(terms: Terms): string {
  const { start, end, floatingDuration, floatingStart } = terms;
  if (start && end) {
    return `From ${start.toLocaleDateString()} to ${end.toLocaleDateString()}.`
  } else if (floatingDuration && floatingStart) {
    return `For ${floatingDuration.duration} ${floatingDuration.unit} starting from ${floatingStart}.`
  } else {
    return undefined;
  }
}
