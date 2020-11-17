
import { AlgoliaConfig } from "../algolia.interfaces";

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