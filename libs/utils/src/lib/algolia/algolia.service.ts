import { Injectable } from "@angular/core";
import { RouterQuery } from "@datorama/akita-ng-router-store";
import { algolia } from '@env';
import algoliasearch from 'algoliasearch';
import { App, getCurrentApp } from "../apps";
import { algoliaIndex, AlgoliaObject, AlgoliaQueries } from "./algolia.interfaces";
import { parseFilters, parseFacets } from './helper.utils';

@Injectable({ providedIn: 'root' })
export class AlgoliaService {

    private indices = {}

    private appName: App;

    constructor(private routerQuery: RouterQuery) {
        this.appName = getCurrentApp(this.routerQuery);
    }

    getIndex(name: 'movie' | 'org' | 'user') {
        if (!this.indices[name]) {
            if (name === 'user') {
                this.indices[name] = algoliasearch(algolia.appId, algolia.searchKey).initIndex(algoliaIndex[name]);
            } else {
                this.indices[name] = algoliasearch(algolia.appId, algolia.searchKey).initIndex(algoliaIndex[name][this.appName]);
            }
        }
        return this.indices[name];

    }

    query<K extends keyof AlgoliaQueries>(name: K, config: AlgoliaQueries[K]): Promise<AlgoliaObject[K]> {
        return this.getIndex(name).search({
            query: config.text ?? '',
            hitsPerPage: config.limitResultsTo,
            page: config.activePage,
            facetFilters: parseFacets(config.facets),
            filters: parseFilters(config.filters)
        })
    }
}
