import { FormControl } from '@angular/forms';
import algoliasearch, { IndexSettings } from 'algoliasearch';
import { FormList, Validator } from '../form';
import { AlgoliaRecordUser } from './algolia.interfaces';
import { OrganizationDocument } from '@blockframes/organization/+state';
import * as functions from 'firebase-functions';
import { app, modules } from '../apps';
import * as admin from 'firebase-admin';
import { mockConfigIfNeeded } from '@blockframes/firebase-utils';
import { algolia as algoliaClient, dev } from '@env';

export const searchClient = algoliasearch(algoliaClient.appId, algoliaClient.searchKey);

export const algoliaClientObject = {
    ...algoliaClient,
    adminKey: dev ? mockConfigIfNeeded('algolia', 'api_key') : functions.config().algolia?.api_key
};

export const indexBuilder = (indexName: string, adminKey?: string) => {
    const client = algoliasearch(algoliaClientObject.appId, adminKey || algoliaClientObject.adminKey);
    return client.initIndex(indexName);
};

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

export function setIndexConfiguration(indexName: string, config: IndexSettings, adminKey?: string) {
    if (!algoliaClientObject.adminKey && !adminKey) {
        console.warn('No algolia id set, assuming dev config: skipping');
        return Promise.resolve(true);
    }

    return indexBuilder(indexName, adminKey).setSettings(config);
}


export function deleteObject(indexName: string, objectId: string): Promise<any> {
    if (!algoliaClientObject.adminKey) {
        console.warn('No algolia id set, assuming dev config: skipping');
        return Promise.resolve(true);
    }

    return indexBuilder(indexName).deleteObject(objectId);
}

export function clearIndex(indexName: string, adminKey?: string) {
    if (!algoliaClientObject.adminKey && !adminKey) {
        console.warn('No algolia id set, assuming dev config: skipping');
        return Promise.resolve(true);
    }

    return indexBuilder(indexName, adminKey).clearIndex()
}

export async function hasAcceptedMovies(org: OrganizationDocument) {
    const moviesColRef = await admin.firestore().collection('movies')
        .where('orgIds', 'array-contains', org.id)
        .where('storeConfig.status', '==', 'accepted').get();
    const movies = moviesColRef.docs.map(doc => doc.data());
    return movies.some(movie => movie?.storeConfig?.status === 'accepted')
}
