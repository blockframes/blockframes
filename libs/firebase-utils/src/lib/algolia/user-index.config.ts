import { AlgoliaConfig } from '@blockframes/utils/algolia/algolia.interfaces';

export const userBaseConfig: AlgoliaConfig = {
    searchableAttributes: [
        'email',
        'firstName',
        'lastName',
    ],
    attributesForFaceting: [
        'email'
    ],
};