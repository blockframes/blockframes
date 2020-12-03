import { AlgoliaConfig } from '@blockframes/utils/algolia';

export const userBaseConfig: AlgoliaConfig = {
    searchableAttributes: [
        'email',
        'firstName',
        'lastName',
        'orgName'
    ],
    attributesForFaceting: [
        'email'
    ],
};
