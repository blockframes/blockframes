/** Format a date into a string to match angular "| date" in html. */
export function formatDate(date: Date) {
  return (
    date.toLocaleString('default', { month: 'short' }) +
    ' ' +
    date.getDate() +
    ', ' +
    date.getFullYear()
  );
}

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
