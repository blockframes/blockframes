import { FormControl } from '@angular/forms';

export function createAlgoliaSearch<T, S>(search: Partial<T> = {}, factory: (search: Partial<T>) => S) {
  const entity = factory(search);
  const keys = Object.keys(entity);
  const ctrlObj = {};
  keys.forEach(key => Object.assign(ctrlObj, { [key]: new FormControl(entity[key]) }))
  return ctrlObj
}