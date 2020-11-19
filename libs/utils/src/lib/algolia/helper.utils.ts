import { FormControl } from '@angular/forms';
import { AlgoliaUser, MovieIndexFilters } from './algolia.interfaces';
import { FormList } from '../form/forms/list.form';
import { Validator } from '../form/forms/types';

/**
 * Create a FormList that create user with mail if no user exist
 * It's used by algolia-chips-autocomplete components to enter mail that have no user for example
 */
export function createAlgoliaUserForm(validators?: Validator) {
    const createAlogliaUser = (user: (string | Partial<AlgoliaUser>)) => {
        return typeof user === 'string' ? { email: user } : user;
    }
    const factory = user => new FormControl(createAlogliaUser(user));
    return FormList.factory<AlgoliaUser, FormControl>([], factory, validators)
}

export function parseFilters(filters: MovieIndexFilters, operator: ' AND ' | ' OR ' = ' OR ',
    prefix?: string): string {
    if (filters) return '';
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
