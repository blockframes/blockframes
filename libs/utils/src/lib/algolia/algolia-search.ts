import { AbstractControl, FormControl } from '@angular/forms';
import { FormEntity, FormList } from '../form';

// Utils
import algoliasearch, { Index } from 'algoliasearch';
import { algolia } from '@env';

export function createAlgoliaSearch<T, S>(search: Partial<T> = {}, factory: (search: Partial<T>) => S) {
  const entity = factory(search);
  const keys = Object.keys(entity);
  const ctrlObj: Record<string, AbstractControl> = {};
  keys.forEach(key => {
    if (Array.isArray(entity[key])) {
      Object.assign(ctrlObj, { [key]: FormList.factory(entity[key]) })
    } else {
      Object.assign(ctrlObj, { [key]: new FormControl(entity[key]) })
    }
  })
  return ctrlObj;
}

type AlgoliaSearchControl = ReturnType<typeof createAlgoliaSearch>

type AlgoliaIndices = keyof typeof algolia;

export class AlgoliaSearchBase<T> extends FormEntity<AlgoliaSearchControl> {

  private index: Index;

  constructor(factoryFunction: (searchProps: Partial<T>) => T, indexName: AlgoliaIndices, searchProps?: T) {
    super(createAlgoliaSearch(searchProps, factoryFunction))
    this.index = algoliasearch(algolia.appId, algolia.searchKey).initIndex(algolia[indexName]);
  }


  search() {
    const facetKeys = Object.keys(this.controls).filter(key => !['hitsPerPage', 'query', 'page'].includes(key))
    const facetFiltersArray = [];
    const facetFilters = facetKeys.map(key => {
      if (Array.isArray((this.get(key) as FormList<T>).controls)) {
        facetFiltersArray.push(`${key}:${(this.get(key) as FormList<T>).controls.map(control => {
          control.valu
        })}`)
      } else {
        return `${key}:${this.get(key).value || ''}`
      }
    });
    return this.index.search({
      hitsPerPage: this.get('hitsPerPage').value,
      query: this.get('query').value,
      page: this.get('page').value,
      facetFilters
    });
  }
}