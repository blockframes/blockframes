import { FormControl } from '@angular/forms';
import { AlgoliaRecordUser } from './algolia.interfaces';
import { FormList } from '../form/forms/list.form';
import { Validator } from '../form/forms/types';

/**
 * Create a FormList that create user with mail if no user exist
 * It's used by algolia-chips-autocomplete components to enter mail that have no user for example
 */
export function createAlgoliaUserForm(validators?: Validator) {
    const createAlogliaUser = (user: (string | Partial<AlgoliaRecordUser>)) => {
        return typeof user === 'string' ? { email: user } : user;
    }
    const factory = user => new FormControl(createAlogliaUser(user));
    return FormList.factory<AlgoliaRecordUser, FormControl>([], factory, validators)
}