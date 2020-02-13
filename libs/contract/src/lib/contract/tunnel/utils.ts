import { ContractVersion } from "@blockframes/contract/version/+state";
import { TemporalityUnit, Terms } from "@blockframes/utils";
import { DatePipe } from '@angular/common';

/** Format the Payment schedule to be displayed  */
export function displayPaymentSchedule(version: ContractVersion): { type: string, list: string[] } {
    // Payment Schedule
    if (version.customPaymentSchedule) {
      return {
        type: 'Custom Payment Schedule',
        list: [version.customPaymentSchedule]
      };
    }
    if (!version.paymentSchedule.length) {
      return undefined;
    } 
    if (version.paymentSchedule[0].date.floatingDuration.temporality === TemporalityUnit.every) {
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
