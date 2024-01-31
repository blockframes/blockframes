import { differenceInDays, getYear, min, max } from 'date-fns';
import { OperationType, TitleState } from './state';
import { ConditionInterest } from './conditions';

interface InterestOperation {
  type: OperationType | 'newYear';
  amount: number;
  date: Date;
}

export interface InterestDetail {
  event: string;
  invested: number;
  revenues: number;
  date: Date;
  amountOwed: number;
  periodDays: number;
  periodInterests: number;
  interests: number;
  interestOwed: number;
}

function getSortedOperations(operations: InterestOperation[]) {
  const dates = operations.map(ops => ops.date);
  const minYear = getYear(min(dates));
  const maxYear = getYear(max(dates));
  for (let year = minYear; year < maxYear; year++) {
    /**
     * @dev if new year is 31/12/YYYY 23:59 use
     * operations.push({ type: 'newYear', amount: 0, date: new Date(year, 11, 31, 23, 59) });
     */
    operations.unshift({ type: 'newYear', amount: 0, date: new Date(year + 1, 0, 1, 0, 0) });
  }
  return operations.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/** Get the total invested by an org with it's interest */
export function investmentWithInterest(
  rate: number,
  operations: InterestOperation[],
  isComposite = false,
) {
  const sorted = getSortedOperations(operations);
  let invested = 0;
  let totalInterest = 0;
  let base = 0;
  let yearInterest = 0;
  const lastIndex = sorted.length - 1;
  for (let i = 0; i < sorted.length; i++) {
    const { date, amount, type } = sorted[i];
    if (type === 'income') {
      base = Math.max(0, base - amount);
    } else if (type === 'investment') {
      base += amount;
      invested += amount;
    } else {
      if (isComposite) base += yearInterest;
      yearInterest = 0;
    }
    if (i === lastIndex) continue;
    /**
     * @dev if interest is calculated with the real number of days in a year use :
     * differenceInDays(endOfYear(date), startOfYear(date))
     * also handle bissextile years ?
     */
    const totalDays = 365;
    const nextDate = sorted[i + 1].date;
    const distance = differenceInDays(nextDate, date);

    const currentInterest = (base * rate * distance) / totalDays;
    yearInterest += currentInterest;
    totalInterest += currentInterest;
  }
  return invested + totalInterest;
}

export function interestDetail(contractId: string, payload: ConditionInterest, state: TitleState) {
  const orgs = Object.values(state.orgs);
  const orgState = orgs.find(org => org.operations.some(o => o.contractId === contractId));
  if (!orgState?.operations) return [];
  const contractOperations = orgState.operations
    .filter(o => o.type === 'income' || (o.type === 'investment' && o.contractId === contractId))
    .map(o => ({ ...o, date: new Date(o.date) }));

  const operations = getSortedOperations(contractOperations);
  const investments = operations.filter(o => o.type === 'investment');

  const results: InterestDetail[] = [];
  operations.forEach((operation, index) => {
    const previousOperations = operations.slice(0, index + 1);
    const currentInvestment = previousOperations.filter(o => o.type === 'investment').reduce((acc, cur) => acc + cur.amount, 0);

    const total = investmentWithInterest(payload.rate, previousOperations, payload.isComposite);

    const interests = total - currentInvestment;
    const invested = operation.type === 'investment' ? operation.amount : 0;
    const revenues = operation.type === 'income' ? operation.amount : 0;
    const periodInterests = index === 0 ? 0 : interests - results[index - 1].interests;
    const amountOwed = index === 0 ? invested : results[index - 1].amountOwed + invested - revenues;
    const interestOwed = index === 0 ? 0 : periodInterests + results[index - 1].interestOwed + (amountOwed < 0 ? amountOwed : 0);

    let event = '';
    switch (operation.type) {
      case 'income':
        event = 'Payment';
        break;
      case 'newYear':
        event = `End of ${operation.date.getFullYear() - 1}`;
        break;
      case 'investment':
        event = `Investment #${investments.indexOf(operation) + 1}`
        break;
      default:
        break;
    }

    const item = {
      event,
      invested,
      revenues,
      date: operation.date,
      amountOwed,
      periodDays: index === 0 ? 0 : differenceInDays(operation.date, results[index - 1].date),
      periodInterests,
      interests,
      interestOwed: interestOwed > 0 ? interestOwed : 0
    };
    results.push(item);
  });

  return results;
}
