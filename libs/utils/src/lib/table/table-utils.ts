/**
 * @dev Allows to sort nested object
 */
export function sortingDataAccessor(item: any, property: string) {
  if (property.includes('.')) {
    return property.split('.')
      .reduce((object, key) => object[key], item);
  }
  return item[property];
}

/**
 * @dev This method is used as a fallback for tables filter predicates
 * If component does not provide it's own filterPredicate functions,
 * this will be used instead.
 */
export function fallbackFilterPredicate(data: any, filter: string) {
  return JSON.stringify(data).toLowerCase().indexOf(filter) !== -1;
}