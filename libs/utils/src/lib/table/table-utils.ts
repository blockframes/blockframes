/**
 * @dev Allows to sort nested object
 */
export function sortingDataAccessor(item: unknown, property: string) { // @TODO #7429 remove
  if (property.includes('.')) {
    return property.split('.')
      .reduce((object, key) => object[key], item);
  }
  return item[property];
}
