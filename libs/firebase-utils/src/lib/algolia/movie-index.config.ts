
import { App } from '@blockframes/utils/apps';
import { AlgoliaConfig } from '@blockframes/utils/algolia/algolia.interfaces';

const movieBaseConfig: AlgoliaConfig = {
    searchableAttributes: [
        'title.international',
        'title.original',
        'directors',
        'keywords'
    ],
    attributesForFaceting: [
        // filters
        'filterOnly(budget)',

        // other facets
        'genres',
        'languages.original',
        'languages.dubbed',
        'languages.subtitle',
        'languages.caption',
        'originCountries',
        'status',
        'storeConfig',
        'storeType'
    ]
};

export function movieConfig(appConfig: App) {
    switch (appConfig) {
        case 'financiers': return {
            searchableAttributes: movieBaseConfig.searchableAttributes,
            attributesForFaceting: [
                ...movieBaseConfig.attributesForFaceting,
                'socialGoals',
                'filterOnly(minPledge)'
            ]
        }
        default: return movieBaseConfig;
    }
}