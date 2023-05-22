import { UntypedFormControl } from '@angular/forms';
import { AlgoliaUser, IAlgoliaKeyDoc, MovieIndexFilters } from '@blockframes/model';
import { FormList } from '../form/forms/list.form';
import { Validator } from '../form/forms/types';
import { algolia } from '@env';

/**
 * Create a FormList that create user with mail if no user exist
 * It's used by algolia-chips-autocomplete components to enter mail that have no user for example
 */
export function createAlgoliaUserForm(validators?: Validator) {
  const createAlgoliaUser = (user: (string | Partial<AlgoliaUser>)) => {
    return typeof user === 'string' ? { email: user } : user;
  }
  const factory = user => new UntypedFormControl(createAlgoliaUser(user));
  return FormList.factory<AlgoliaUser | { email: string }, UntypedFormControl>([], factory, validators);
}

export function parseFilters(filters: MovieIndexFilters, operator: ' AND ' | ' OR ' = ' OR ',
  prefix?: string): string {
  if (!filters) return '';
  const filter: string[] = []
  for (const [key, value] of Object.entries(filters)) {
    const path = [prefix, key].filter(v => !!v).join('.');
    if (value === null || value === undefined) {
      filter.push(undefined);
    } else if (typeof value === 'object') {
      const deepFilter = parseFilters(value, operator, path);
      filter.push(deepFilter);
    } else {
      filter.push(`${path} >= ${value ?? 0}`)
    }
  }
  return filter.filter(v => !!v).join(operator);
}

export function parseFacets(facet: Record<string, any>, prefix?: string): string[] {
  if (!facet) return [];
  const facets = [];
  for (const [key, value] of Object.entries(facet)) {
    const path = [prefix, key].filter(v => !!v).join('.');
    let result: string[];
    if (value === null || value === undefined) {
      result = undefined;
    } else if (Array.isArray(value)) {
      result = value.map(v => `${path}:${v}`);
    } else if (typeof value === 'object') {
      result = parseFacets(value, path).flat();
    } else {
      result = [`${path}:${value}`];
    }
    if (result) facets.push(result);
  }
  return facets;
}

/** A simple map to access the index name */
export const algoliaIndex = {
  user: algolia.indexNameUsers,
  org: {
    financiers: algolia.indexNameOrganizations.financiers,
    festival: algolia.indexNameOrganizations.festival,
    catalog: algolia.indexNameOrganizations.catalog,
    waterfall: algolia.indexNameOrganizations.waterfall
  },
  movie: {
    financiers: algolia.indexNameMovies.financiers,
    catalog: algolia.indexNameMovies.catalog,
    festival: algolia.indexNameMovies.festival,
  },
};

export type AlgoliaIndex = keyof typeof algoliaIndex;

/**
 * Algolia search parameter expects string shorter than 512 bytes,
 * @param query 
 * @returns 
 */
export function maxQueryLength(query: string): string;
export function maxQueryLength(query: string[]): string[];
export function maxQueryLength(query: string | string[]) {
  if (!query) return '';
  if (!Array.isArray(query)) return query.substring(0, 510);

  // Overall array size is < 512 bytes
  if (JSON.stringify(query).length < 512) return query;

  // Try to remove items from array until size < 512 bytes
  const reducedArray = query;
  while (JSON.stringify(reducedArray).length >= 512 && reducedArray.length > 1) {
    reducedArray.shift();
  }

  // If array only have one item left with size > 512
  reducedArray[0] = reducedArray[0].substring(0, 508);
  return reducedArray;
}

const localStorageKey = 'algoliaSearchKey';
export function setSearchKey(doc: IAlgoliaKeyDoc) {
  return localStorage.setItem(localStorageKey, doc.key);
}

export function getSearchKey() {
  return localStorage.getItem(localStorageKey);
}
