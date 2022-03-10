import firebase from 'firebase';
import { staticModel, Scope, GetKeys } from './static-model';
import { Movie, User, Organization } from '@blockframes/model';

/**
 * This method is used before pushing data on db
 * to prevent "Unsupported field value: undefined" errors.
 * Doing JSON.parse(JSON.stringify(data)) clones object and
 * removes undefined fields and empty arrays.
 * This methods also removes readonly settings on objects coming from Akita
 */
export function cleanModel<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export function isObject(item: unknown) {
  return item && typeof item === 'object' && !Array.isArray(item) && item !== null;
}

/**
 * @dev this method is used to deeply merge two object without loosing data
 * Use this instead of { ...this.query.getActive(), ...this.form.value }
 * @param target
 * @param source
 */
export function mergeDeep<T>(target: T, source: Partial<T>): T {
  const output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) Object.assign(output, { [key]: source[key] });
        else if (source[key] instanceof Date) Object.assign(output, { [key]: source[key] });
        else output[key] = mergeDeep(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

/** A custom interface for group of dates. Used in notifications/invitations components. */
export interface DateGroup<T> {
  [date: string]: T[];
}

/** Checks if the date is a firestore Timestamp. */
function isTimeStamp(
  date: firebase.firestore.Timestamp | Date
): date is firebase.firestore.Timestamp {
  return date && date instanceof firebase.firestore.Timestamp;
}

/** Takes a Date, a string or a Timestamp and returns it as a Date. */
export function toDate(date: firebase.firestore.Timestamp | Date): Date {
  if (isTimeStamp(date)) {
    return date.toDate();
  }
  if (typeof date === 'string' || typeof date === 'number') {
    return new Date(date);
  }
  if (!date) {
    // Return null to avoid undefined error with firestore
    return null;
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
    item = item?.[path[i]];
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
  const x = items.map(async (item) => ((await filterFunction(item)) ? item : _null));
  const y = await Promise.all(x);
  return y.filter((w) => w !== _null) as T[];
}

function findCorrespondence(code: string) {
  return ([key, value]: [string, string]) => key.toLowerCase() === code || value.toLowerCase() === code
}

/**
 * This function is used to check if a given value (code) belongs to a type (base).
 * Return the key of the const if found, undefined otherwise
 * @example
 * // Code example (string):
 * 'line_up' | 'Line-Up'
 *
 * // Base example (should exist in staticModel):
 * export const storeType = {
 *   library: 'Library',
 *   line_up: 'Line-Up',
 * } as const;
 *
 * getKeyIfExist('storeType', 'Line-Up'); // 'line-up'
 * getKeyIfExist('storeType', 'Test'); // undefined
 */
export function getKeyIfExists<S extends Scope>(base: S, code: string) {
  // Sanitized input to properly compare with base data
  const sanitizedCode = code.trim().toLowerCase();
  const candidate = Object.entries(staticModel[base])
    .find(findCorrespondence(sanitizedCode)) as [GetKeys<S>, string];
  return candidate ? candidate[0] : undefined;
}

/** Basic function to create a delay in a function when called
 * @param ms milleseconds to wait for
 */
export async function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function downloadCsvFromJson(data: unknown[], fileName = 'my-file') {
  const replacer = (_: unknown, value: unknown) => (value === null ? '' : value);
  const header = Object.keys(data[0]);
  const csv = data.map((row: unknown) =>
    header.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join(',')
  );
  csv.unshift(header.map((h) => `"${h}"`).join(','));
  const csvArray = csv.join('\r\n');

  const a = document.createElement('a');
  const blob = new Blob([csvArray], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);

  a.href = url;
  a.download = `${fileName}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
}

/**
 * This high-order function create debounced functions, that can be continuously called,
 * but only executed once every `wait` period.
 * @note If you can work with observable, it's better to use rxjs `debounceTime` instead
 * @param func the function to debounce
 * @param wait the debounce duration in ms
 */
export function debounceFactory(func: (...params) => unknown, wait: number) {
  let timeout: number;

  return function executedFunction(...args) {
    const later = () => {
      window.clearTimeout(timeout);
      func(...args);
    };

    window.clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);
  };
}

/**
 * Remove all undefined fields
 * @param value anything
 */
export function removeUndefined(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(removeUndefined);
  } else if (value === null) {
    return null;
  } else if (typeof value === 'object') {
    const result = {};
    for (const key in value) {
      if (value[key] !== undefined) {
        result[key] = removeUndefined(value[key]);
      }
    }
    return result;
  } else {
    return value;
  }
}

export function sortMovieBy(a: Movie, b: Movie, sortIdentifier: string) {
  switch (sortIdentifier) {
    case 'Title':
      return a.title.international.localeCompare(b.title.international);
    case 'Director':
      return a.directors[0]?.lastName.localeCompare(b.directors[0]?.lastName);
    case 'Production Year':
      if (b.release.year < a.release.year) {
        return -1;
      }
      if (b.release.year > a.release.year) {
        return 1;
      }
      return 0;
    default:
      return 0;
  }
}

/** Verify if the user exists and has a name and surname. */
export function hasDisplayName(user: User): boolean {
  return !!user && !!user.firstName && !!user.lastName;
}

/** Verify if the org exists and has denomination.full. */
export function hasDenomination(organization: Organization): boolean {
  return !!organization && !!organization.denomination.full;
}
