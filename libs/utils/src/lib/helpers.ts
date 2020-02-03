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
export function isTimeStamp(date: firestore.Timestamp | Date): boolean {
  return date && date instanceof firestore.Timestamp
}

/** Takes a Date or a Timestamp and returns it as a Date. */
export function toDate(date: any): Date {
  if (isTimeStamp(date)) {
    return date.toDate();
  }
  return date;
}
