import type { Timestamp } from 'firebase/firestore';

export { Timestamp };


/** Checks if the date is a firestore Timestamp. */
export function isTimeStamp(date: Timestamp | Date): date is Timestamp {
  return date && !(date instanceof Date);
}

/** Takes a Date, a string or a Timestamp and returns it as a Date. */

export function toDate(date: Timestamp | Date): Date {
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
