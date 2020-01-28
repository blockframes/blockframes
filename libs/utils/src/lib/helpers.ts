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

export function isTimestamp(date: any): date is firestore.Timestamp {
  return date && date instanceof firestore.Timestamp
}
