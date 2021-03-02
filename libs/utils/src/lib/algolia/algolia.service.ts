import { Injectable } from "@angular/core";
import { RouterQuery } from "@datorama/akita-ng-router-store";
import { algolia } from '@env';
import algoliasearch, { SearchIndex, } from 'algoliasearch';
import { App, getCurrentApp } from "../apps";
import { algoliaIndex, AlgoliaObject, AlgoliaQueries, SearchResponse } from "./algolia.interfaces";
import { parseFilters, parseFacets } from './helper.utils';

@Injectable({ providedIn: 'root' })
export class AlgoliaService {

    private indices: Record<string, SearchIndex> = {};

    private appName: App;

    constructor(private routerQuery: RouterQuery) {
        this.appName = getCurrentApp(this.routerQuery);
    }

    getIndex(name: 'movie' | 'org' | 'user'): SearchIndex {
        if (!this.indices[name]) {
            if (name === 'user') {
                this.indices[name] = algoliasearch(algolia.appId, algolia.searchKey).initIndex(algoliaIndex[name]);
            } else {
                this.indices[name] = algoliasearch(algolia.appId, algolia.searchKey).initIndex(algoliaIndex[name][this.appName]);
            }
        }
        return this.indices[name];

    }

    query<K extends keyof AlgoliaQueries>(name: K, config: AlgoliaQueries[K]): Promise<SearchResponse<AlgoliaObject[K]>> {
        return this.getIndex(name).search<AlgoliaObject[K]>(config.text ?? '', {
            hitsPerPage: config.limitResultsTo,
            page: config.activePage,
            facetFilters: parseFacets(config.facets),
            filters: parseFilters(config.filters)
        }).then(e => e);
    }
}
