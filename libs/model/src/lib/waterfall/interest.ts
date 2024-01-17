import {
  differenceInDays,
  getYear,
  min,
  max,
  endOfYear,
  startOfYear,
} from 'date-fns';
import { OperationType } from './state';

interface InterestOperation {
  type: OperationType | 'newYear';
  amount: number;
  date: Date;
}

/** 
 * Calculates how much from an income is taken based on the interest
 * @deprecated It's not used anymore as we calculate the threshold in another way
 */
export function coversInterest(
  rate: number,
  operations: InterestOperation[],
  isComposite = false,
) {
  const dates = operations.map(ops => ops.date);
  const minYear = getYear(min(dates));
  const maxYear = getYear(max(dates));
  for (let year = minYear; year < maxYear; year++) {
    operations.push({ type: 'newYear', amount: 0, date: new Date(year, 11, 31, 23, 59) });
  }
  const sorted = operations.sort((a, b) => a.date.getTime() - b.date.getTime());
  let base = 0;
  let yearInterest = 0;
  let totalInterest = 0;
  const lastIndex = sorted.length - 1;
  for (let i = 0; i < sorted.length; i++) {
    const { date, amount, type } = sorted[i];
    if (type === 'income') {
      // If there is still some base, continue
      if (base > amount) {
        base -= amount;
        continue;
      }

      // If composite, totalInterest is already included in the base
      if (isComposite) {
        // If it covers before the last one, return the last income
        if (i < lastIndex) return sorted[lastIndex].amount;
        // Return what's required to covers the interest
        return amount - base;
      }

      // If not composite, check if 
      if (amount > base + totalInterest) {
        if (i < lastIndex) return sorted[lastIndex].amount;
        return amount - (base + totalInterest);
      }

      // If not composite but interest remains, base should be 0
      base = 0;
    } else if (type === 'investment') {
      base += amount;
    } else {
      if (isComposite) base += yearInterest;
      yearInterest = 0;
    }
    if (i === lastIndex) continue;
    const totalDays = differenceInDays(endOfYear(date), startOfYear(date)) + 1;

    const nextDate = sorted[i + 1].date;
    const distance = differenceInDays(nextDate, date);

    const currentInterest = (base * rate * distance) / totalDays;
    yearInterest += currentInterest;
    totalInterest += currentInterest;
  }
  return 0;
}

/** Get the total invested by an org with it's interest */
export function investmentWithInterest(
  rate: number,
  operations: InterestOperation[],
  isComposite = false,
) {
  const dates = operations.map(ops => ops.date);
  const minYear = getYear(min(dates));
  const maxYear = getYear(max(dates));
  for (let year = minYear; year < maxYear; year++) {
    operations.push({ type: 'newYear', amount: 0, date: new Date(year, 11, 31, 23, 59) });
  }
  const sorted = operations.sort((a, b) => a.date.getTime() - b.date.getTime());
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
    const totalDays = differenceInDays(endOfYear(date), startOfYear(date)) + 1;

    const nextDate = sorted[i + 1].date;
    const distance = differenceInDays(nextDate, date);

    const currentInterest = (base * rate * distance) / totalDays;
    yearInterest += currentInterest;
    totalInterest += currentInterest;
  }
  return invested + totalInterest;
}



// Example
// export const isCovered = () => coversInterest(
//   0.04,
//   [
//     { type: 'investment', date: new Date('12/29/2006'), amount: 55000 },
//     { type: 'investment', date: new Date('1/1/2007'), amount: 50000 },
//     { type: 'investment', date: new Date('10/3/2007'), amount: 50000 },
//     { type: 'income', date: new Date('1/31/2008'), amount: 7807.32 },
//     { type: 'income', date: new Date('5/31/2008'), amount: 116123.27 },
//     { type: 'income', date: new Date('12/31/2008'), amount: 2369.58 },
//     { type: 'income', date: new Date('7/13/2009'), amount: 11274.34 },
//     { type: 'income', date: new Date('12/31/2009'), amount: 1901.79 },
//     { type: 'income', date: new Date('6/30/2010'), amount: 5933.57 },
//     { type: 'income', date: new Date('6/30/2010'), amount: 758.5 }, // Careful
//     { type: 'income', date: new Date('12/31/2010'), amount: 4794.88 },
//     { type: 'income', date: new Date('6/30/2011'), amount: 7397.62 },
//     { type: 'income', date: new Date('6/30/2011'), amount: 1542.5 },
//     { type: 'income', date: new Date('12/31/2011'), amount: 2805.44 },
//     { type: 'income', date: new Date('6/1/2013'), amount: 2805.44 },
//   ],
//   false
// );