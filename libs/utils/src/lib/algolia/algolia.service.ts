import { Injectable } from "@angular/core";
import { RouterQuery } from "@datorama/akita-ng-router-store";
import { algolia } from '@env';
import algoliasearch from 'algoliasearch';
import { App, getCurrentApp } from "../apps";
import { algoliaIndex, AlgoliaQueries, AlgoliaObject } from "./algolia.interfaces";
import { parseFilters, parseFacets } from './helper.utils';

@Injectable({ providedIn: 'root' })
export class AlgoliaService {

    private appName: App;

    constructor(private routerQuery: RouterQuery) {
        this.appName = getCurrentApp(this.routerQuery);
    }

    getIndex(name: 'movie' | 'org' | 'user') {
        if (name === 'user') {
            return algoliasearch(algolia.appId, algolia.searchKey).initIndex(algoliaIndex[name]);
        } else {
            return algoliasearch(algolia.appId, algolia.searchKey).initIndex(algoliaIndex[name][this.appName]);
        }
    }

    query<K extends keyof AlgoliaQueries>(name: K, config: AlgoliaQueries[K]) {
        return this.getIndex(name).search({
            query: config.text ?? '',
            hitsPerPage: config.limitResultsTo,
            page: config.activePage,
            facetFilters: parseFacets(config.facets),
            filters: parseFilters(config.filters)
        })
    }
}
