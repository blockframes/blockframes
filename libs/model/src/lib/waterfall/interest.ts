import { differenceInDays, getYear, min, max } from 'date-fns';
import { OperationType } from './state';

interface InterestOperation {
  type: OperationType | 'newYear';
  amount: number;
  date: Date;
}

export function getSortedOperations(operations: InterestOperation[]) {
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
