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


export function parseFilters(filters: MovieIndexFilters | string, operator: 'OR ' | 'AND ' = 'OR '): string {
    const filter = []
    for (const [key, value] of Object.entries(filters)) {
        if (typeof filters[key] === 'object') {
            parseFilters(key, operator)
        }
        else {
            filter.push(`${key} >= ${value ?? 0} `)
        }
    }
    return filter.join(operator);
}