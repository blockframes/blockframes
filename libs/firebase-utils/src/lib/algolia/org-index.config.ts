
import { AlgoliaConfig } from '@blockframes/utils/algolia/algolia.interfaces';

export const orgBaseConfig: AlgoliaConfig = {
    searchableAttributes: ['name'],
    attributesForFaceting: [
        'appAccess',
        'appModule',
        'name',
        'country',
        'isAccepted',
        'hasAcceptedMovies'
    ],
};