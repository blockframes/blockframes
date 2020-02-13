import { firestore } from "firebase/app";

/**
 * @see #483
 * This method is used before pushing data on db
 * to prevent "Unsupported field value: undefined" errors.
 * Doing JSON.parse(JSON.stringify(data)) clones object and
 * removes undefined fields and empty arrays.
 * This methods also removes readonly settings on objects coming from Akita
 */
export function cleanModel<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

/** A custom interface for group of dates. Used in notifications/invitations components. */
export interface DateGroup<T> {
  [date: string]: T[];
}

/** Checks if the date is a firestore Timestamp. */
export function isTimeStamp(date: firestore.Timestamp | Date): date is firestore.Timestamp {
  return date && date instanceof firestore.Timestamp
}

/** Takes a Date or a Timestamp and returns it as a Date. */
export function toDate(date: firestore.Timestamp | Date): Date {
  if (isTimeStamp(date)) {
    return date.toDate();
  }
  return date;
}

/**
 * Takes a list of items and an asynchronous filtering function and
 * returns a promise of the filtered list.
 * @param items A list of item to filter with an asynchronous function
 * @param filterFunction Asynchronous function that filters items
 */
export async function asyncFilter<T>(items: T[], filterFunction: (item: T) => Promise<boolean>) {
  const _null = Symbol();
  const x = items.map(async item => (await filterFunction(item)) ? item : _null);
  const y = await Promise.all(x);
  return y.filter(w => w !== _null) as T[];
}
