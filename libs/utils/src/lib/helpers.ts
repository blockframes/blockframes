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

export interface DateGroup<T> {
  [date: string]: T[];
}

/** Takes a Date or a Timestamp and returns it as a Date. */
export function toDate(date: firestore.Timestamp | Date) {
  if (date instanceof firestore.Timestamp) {
    return date.toDate();
  }
  return date;
}
