import { Injectable } from "@angular/core";
import { RouterQuery } from "@datorama/akita-ng-router-store";
import { algolia } from '@env';
import algoliasearch, { Index } from 'algoliasearch';
import { App, getCurrentApp } from "../apps";
import { algoliaIndex, AlgoliaQueries, AlgoliaQuery } from "./algolia.interfaces";

@Injectable({ providedIn: 'root' })
export class AlgoliaService {

    private movieIndex: Index;
    private orgIndex: Index;
    private userIndex: Index;
    private appName: App;

    constructor(private routerQuery: RouterQuery) {
        this.appName = getCurrentApp(this.routerQuery);
        this.movieIndex = algoliasearch(algolia.appId, algolia.searchKey).initIndex(algoliaIndex.movie[this.appName])
        this.orgIndex = algoliasearch(algolia.appId, algolia.searchKey).initIndex(algoliaIndex.org[this.appName])
        this.userIndex = algoliasearch(algolia.appId, algolia.searchKey).initIndex(algoliaIndex.user[this.appName])
    }

    queryForMovies<T extends keyof AlgoliaQueries>(query: AlgoliaQuery) {
        const facetFilters = Object.keys(query.facets).reduce((prev, cur) => {
            console.log(prev, cur)
            return query.facets[prev]
        })
        return this.movieIndex.search({
            query: query.text,
            hitsPerPage: query.limitResultsTo,
            page: query.activePage,
            facetFilters: [],
            filters: query.filters
        })
    }

    queryForOrgs<T extends keyof AlgoliaQueries>(query: AlgoliaQuery) { }
    queryForUsers<T extends keyof AlgoliaQueries>(query: AlgoliaQuery) { }
}
