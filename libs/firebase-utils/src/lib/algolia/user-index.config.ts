
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