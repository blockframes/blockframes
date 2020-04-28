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
function isTimeStamp(date: firestore.Timestamp | Date): date is firestore.Timestamp {
  return date && date instanceof firestore.Timestamp
}

/** Takes a Date, a string or a Timestamp and returns it as a Date. */
export function toDate(date: firestore.Timestamp | Date): Date {
  if (isTimeStamp(date)) {
    return date.toDate();
  }
  if (typeof date === 'number') {
    return new Date(date * 1000)
  }
  if (typeof date === 'string') {
    return new Date(date);
  }
  return date;
}

/**
 * Get the value of an item based on a path
 * @example item = movie, key = 'budget.totalBudget'
 */
export function getValue(item: any, key: string) {
  const path = key.split('.');
  for (let i = 0; i < path.length; i++) {
    item = item[path[i]];
  }
  return item;
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

/**
 * This function is used to check if a given value (code) belongs to a type (base).
 * Return the key of the const if found, undefined otherwise
 * Code example (string):
 *   'line_up' | 'Line-Up'
 * Base example:
 *   export const storeType = {
 *     library: 'Library',
 *     line_up: 'Line-Up',
 *   } as const;
 * @param base
 * @param code
 */
type Code<T> = keyof T | T[keyof T];
type Key<T, K extends Code<T>> = K extends keyof T ? K : keyof T;
export function getKeyIfExists<T, K extends Code<T>>(base: T, code: K): Key<T, K> {
  // Sanitized input to properly compare with base data
  const sanitizedCode = (code as string).trim().toLowerCase();
  const candidate = Object.entries(base).find(([key, value]) => [key.toLowerCase(), value.toLowerCase()].includes(sanitizedCode));
  return candidate ? candidate.shift() as any : undefined;
}
